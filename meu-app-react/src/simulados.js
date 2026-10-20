import { anoDaQuestao, podeCorrigir, questaoPublicavel } from './acervo.js'
import { incluirNoSimuladoUem } from './uem.js'
import { incluirNoSimuladoIfpr } from './ifpr.js'
import { concursosDaQuestao, incluirIdiomaDaProva, questaoNaProva } from './provasCompartilhadas.js'
import { normalizarMateria, chaveFiltro } from './filtros.js'
import catalogo from './data/provasCompletas.json' with { type: 'json' }

function limparNomeDaProva(questao) {
  const banca = String(questao.banca || 'Prova').trim()
  const ano = anoDaQuestao(questao)
  const materia = String(questao.materia || '').trim()
  let concurso = String(questao.concurso || `${banca} ${ano}`).trim()
  if (materia) {
    const materiaEscapada = materia.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    concurso = concurso.replace(new RegExp(`\\s*[—–-]\\s*${materiaEscapada}\\s*$`, 'i'), '').trim()
  }
  if (banca.toUpperCase() === 'ENEM') concurso = `ENEM ${ano}`
  return concurso
}

export function dadosDaProva(questao) {
  const ano = anoDaQuestao(questao)
  const banca = String(questao.banca || 'Geral').trim()
  const concurso = limparNomeDaProva(questao)
  const dia = Number(questao.dia)
  const modelo = String(questao.banca === 'IFPR' ? '' : questao.modelo || '').trim()
  const detalhes = []
  if (Number.isInteger(dia) && dia > 0 && !concurso.toLowerCase().includes(`${dia}º dia`)) detalhes.push(`${dia}º dia`)
  if (modelo && !/^aplicação regular$/i.test(modelo) && !concurso.toLowerCase().includes(modelo.toLowerCase())) detalhes.push(modelo)
  const prova = [concurso, ...detalhes].join(' · ')
  return { ano, banca, concurso, prova, id: [ano, banca, prova].join('|').toLocaleLowerCase('pt-BR') }
}

export function questoesDaProva(questoes, provaId, idioma = 'Inglês', especificas = ['Biologia', 'Química']) {
  return questoes
    .filter(questao => !questao.prova_incompleta && podeCorrigir(questao) && concursosDaQuestao(questao).some(concurso => dadosDaProva({...questao, concurso}).id === provaId))
    .map(questao => questaoNaProva(questao, concursosDaQuestao(questao).find(concurso => dadosDaProva({...questao, concurso}).id === provaId)))
    .filter(questao => incluirNoSimuladoUem(questao, idioma, especificas))
    .filter(questao => incluirNoSimuladoIfpr(questao, idioma))
    .filter(questao => incluirConfiguracao(questao, idioma, especificas))
    .sort((a, b) => {
      const blocoA = a.bloco_especifico ? especificas.indexOf(a.bloco_especifico) + 1 : 0
      const blocoB = b.bloco_especifico ? especificas.indexOf(b.bloco_especifico) + 1 : 0
      if (blocoA !== blocoB) return blocoA - blocoB
      const numeroA = Number(a.numero_original)
      const numeroB = Number(b.numero_original)
      if (Number.isFinite(numeroA) && Number.isFinite(numeroB)) return numeroA - numeroB
      if (Number.isFinite(numeroA)) return -1
      if (Number.isFinite(numeroB)) return 1
      return String(a.id).localeCompare(String(b.id), 'pt-BR', { numeric: true })
    })
}


export function idiomaDaQuestao(q) {
  return q.idioma || (/^(?:Inglês|Espanhol|Francês)$/i.test(q.modelo || '') ? q.modelo : '')
}
export function incluirConfiguracao(q, idioma = 'Inglês', especificas = ['Biologia', 'Química']) {
  const escolhido = q.banca !== 'UEM' && idioma === 'Francês' ? 'Inglês' : idioma
  return (!idiomaDaQuestao(q) || idiomaDaQuestao(q) === escolhido) && incluirNoSimuladoUem(q, escolhido, especificas) && incluirNoSimuladoIfpr(q, escolhido) && incluirIdiomaDaProva(q, escolhido)
}

// O catálogo nasce dos lotes oficiais conferidos. Não inferir completude só pela quantidade.
export function listarProvasCompletas(questoes, idioma = 'Inglês', especificas = ['Biologia', 'Química'], registro = catalogo) {
  const carregadas = new Map(questoes.map(q => [String(q.id), q]))
  return registro.flatMap(prova => {
    const previstos = prova.itens.filter(([_id, lingua, bloco]) => incluirConfiguracao({ banca: prova.banca, idioma: lingua, bloco_especifico: bloco }, idioma, especificas))
    if (previstos.length !== prova.totalOriginal || previstos.length < 30) return []
    const itens = previstos.map(([id]) => carregadas.get(id))
    if (itens.some(q => !q || q.prova_incompleta || !questaoPublicavel(q))) return []
    // Alterações em associações de cargos não podem criar uma prova aparentemente completa.
    const selecionadas = questoesDaProva(itens, prova.id, idioma, especificas)
    const corrigiveis = itens.filter(podeCorrigir).length
    if (!corrigiveis || selecionadas.length !== corrigiveis) return []
    const { itens: _ignorados, ...dados } = prova
    return [{ ...dados, questoesCount: corrigiveis, anuladas: itens.length - corrigiveis }]
  }).sort((a,b) => b.ano.localeCompare(a.ano, 'pt-BR', {numeric:true}) || a.prova.localeCompare(b.prova,'pt-BR'))
}

export const MATERIAS_TREINO_CPOR = ['Português', 'Geografia', 'História', 'Matemática']
function materiaTreino(q) {
  const materia = normalizarMateria(q.materia, q.conteudo)
  return materia === 'Língua Portuguesa' ? 'Português' : materia
}
function poolsTreino(questoes) {
  const pools = Object.fromEntries(MATERIAS_TREINO_CPOR.map(m => [m, []]))
  const vistos = new Set()
  for (const q of questoes) {
    const materia = materiaTreino(q)
    if (!pools[materia] || vistos.has(String(q.id)) || !q.id || !podeCorrigir(q) || !questaoPublicavel(q) || q.prova_incompleta || ['somatoria','certo_errado'].includes(q.tipo_resposta) || ![4,5].includes(q.opcoes?.length)) continue
    vistos.add(String(q.id)); pools[materia].push(q)
  }
  return pools
}
export function disponibilidadeTreinoCpor(questoes) {
  const pools = poolsTreino(questoes)
  const faltantes = MATERIAS_TREINO_CPOR.filter(m => pools[m].length < 10)
  return { pronto: !faltantes.length, faltantes }
}
function embaralhar(itens, random) {
  const copia = [...itens]
  for (let i = copia.length - 1; i > 0; i--) { const j = Math.floor(random() * (i+1)); [copia[i], copia[j]] = [copia[j], copia[i]] }
  return copia
}
export function gerarTreinoCpor(questoes, random = Math.random) {
  const pools = poolsTreino(questoes)
  if (MATERIAS_TREINO_CPOR.some(m => pools[m].length < 10)) return []
  const prioridade = q => /^(?:CPOR|NPOR)(?:\b|\/)/i.test(q.banca) ? 0 : /^(?:ESA|EsPCEx|EAM|EEAR|CFN|EPCAR)$/i.test(q.banca) ? 1 : 2
  return MATERIAS_TREINO_CPOR.flatMap(materia => {
    const candidatos = embaralhar(pools[materia], random).sort((a,b) => prioridade(a)-prioridade(b))
    const escolhidas = [], usados = new Set(), conteudos = new Set()
    // Primeiro diversifica conteúdos dentro das bancas prioritárias; depois completa as dez.
    for (const nivel of [0,1,2]) {
      const grupo = candidatos.filter(q => prioridade(q) === nivel)
      for (const q of grupo) {
        const conteudo = chaveFiltro(q.conteudo)
        if (escolhidas.length >= 10) break
        if (conteudos.has(conteudo)) continue
        escolhidas.push(q); usados.add(q.id); conteudos.add(conteudo)
      }
      for (const q of grupo) {
        if (escolhidas.length >= 10) break
        if (!usados.has(q.id)) { escolhidas.push(q); usados.add(q.id) }
      }
    }
    return escolhidas
  })
}
