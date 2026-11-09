import { chaveCampoFiltro, chaveConteudoFiltro, normalizarMateria } from './filtros.js'
import { dataProximaRevisao } from './focoEstudo.js'

const areas = {
  'ciencias da natureza': ['Biologia', 'Física', 'Química'],
  'ciencias humanas': ['História', 'Geografia', 'Filosofia', 'Sociologia'],
  linguagens: ['Português', 'Literatura', 'Inglês', 'Espanhol', 'Artes'],
}
const gruposPorQuestao = new WeakMap()

function grupo(materia, conteudo) {
  const chave = chaveConteudoFiltro(conteudo, materia)
  return chave && chave !== 'outros-conteudos' ? chave : ''
}

function chaveQuestao(questao) {
  if (!gruposPorQuestao.has(questao)) {
    const materia = normalizarMateria(questao.materia, questao.conteudo)
    gruposPorQuestao.set(questao, `${chaveCampoFiltro('materia', materia)}:${grupo(materia, questao.conteudo)}`)
  }
  return gruposPorQuestao.get(questao)
}

function indiceEdital(edital) {
  const indice = new Map()
  for (const materia of edital?.materias || []) {
    const nome = materia.nome
    const chaveMateria = chaveCampoFiltro('materia', nome)
    const area = Object.keys(areas).find(item => chaveMateria.startsWith(item))
    for (const topico of materia.topicos || []) {
      for (const disciplina of area ? areas[area] : [nome]) {
        const chave = grupo(disciplina, topico.titulo)
        if (!chave) continue
        const id = `${chaveCampoFiltro('materia', normalizarMateria(disciplina))}:${chave}`
        const peso = (topico.prioridade === 'alta' ? 2 : 0) + (topico.status === 'revisar' ? 4 : topico.status !== 'concluido' ? 1 : 0)
        const anterior = indice.get(id)
        if (!anterior || peso > anterior.peso) indice.set(id, { materia: disciplina, conteudo: topico.titulo, status: topico.status, prioridade: topico.prioridade, peso })
      }
    }
  }
  return indice
}

export function recomendarTreino({ questoes, edital, ultimas, agora, quantidade = 10 }) {
  const indice = indiceEdital(edital)
  const grupos = new Map()
  const vistos = new Set()
  const motivos = new Map()
  for (const questao of questoes) {
    const id = String(questao.id)
    if (vistos.has(id)) continue
    vistos.add(id)
    const chave = chaveQuestao(questao)
    const topico = indice.get(chave)
    if (edital && !topico) continue
    const tentativa = ultimas.get(id)
    const vencida = tentativa && dataProximaRevisao(tentativa) <= agora
    const motivo = vencida ? 'Revisão prevista para hoje' : tentativa?.acertou === false ? 'Erro na última tentativa'
      : topico?.status === 'revisar' ? 'Marcado para revisar no edital' : topico?.prioridade === 'alta' ? 'Prioridade alta no edital'
      : !tentativa && topico && topico.status !== 'concluido' ? 'Tópico pendente no edital'
      : !tentativa ? 'Questão ainda não respondida' : 'Reforço de conteúdo'
    const peso = (vencida ? 20 : 0) + (tentativa?.acertou === false ? 12 : !tentativa ? 4 : 0) + (topico?.peso || 0)
    const item = { questao, peso, motivo, topico, data: Date.parse(tentativa?.respondidaEm || '') || 0 }
    if (!grupos.has(chave)) grupos.set(chave, [])
    grupos.get(chave).push(item)
  }
  const filas = [...grupos.values()].map(itens => itens.sort((a, b) => b.peso - a.peso || a.data - b.data))
  const selecionadas = []
  for (let rodada = 0; selecionadas.length < quantidade; rodada++) {
    const disponiveis = filas.map(fila => fila[rodada]).filter(Boolean)
    if (!disponiveis.length) break
    disponiveis.sort((a, b) => b.peso - a.peso || a.data - b.data)
    for (const item of disponiveis.slice(0, quantidade - selecionadas.length)) {
      selecionadas.push(item)
      motivos.set(item.motivo, (motivos.get(item.motivo) || 0) + 1)
    }
  }
  return { selecionadas, motivos: [...motivos], total: filas.reduce((soma, fila) => soma + fila.length, 0) }
}
