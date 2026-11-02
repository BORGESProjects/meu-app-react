import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {fileURLToPath} from 'node:url'
import {auditarElegibilidadeQuestaoExtraida, enriquecerQuestaoExtraida} from '../../src/classificacaoQuestaoExtraida.js'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const origem = path.join(raiz, 'public', 'acervo-extraido')
const pastaSaida = process.env.ACERVO_CLASSIFICACAO_SAIDA || 'classificacao-acervo-final'
const destino = path.join(raiz, 'tmp', pastaSaida, 'acervo-extraido')
const manifesto = JSON.parse(await fs.readFile(path.join(origem, 'manifesto.json'), 'utf8'))
const marcadorDiscursiva = /discursiv|dissertativ|peca.pratica|estudo.de.caso/iu
const comandoAberto = /^\s*(?:\d+[.)-]\s*)?(?:explique|justifique|discorra|descreva|apresente|diferencie|defina|redija|elabore|argumente|comente|indique|mencione|demonstre|calcule|resolva|analise|compare|avalie|proponha|escreva|responda)\b/iu
const pontoOuLinhas = /(?:valor\s*:\s*\d+(?:[,.]\d+)?\s*pontos?|maximo\s+de\s+\d+\s+linhas?)/iu
const estaDiscursiva = q => {
  if ([q.tipo_resposta, q.tipo_extraido].some(tipo => String(tipo || '').toLocaleLowerCase('pt-BR') === 'discursiva')) return true
  if (marcadorDiscursiva.test(String(q.documento_origem || ''))) return true
  const corpo = [q.enunciado, ...(q.opcoes || [])].join(' ')
  if (pontoOuLinhas.test(corpo)) return true
  return comandoAberto.test(String(q.enunciado || '')) && (!Array.isArray(q.opcoes) || q.opcoes.length < 2)
}
const totais = {antes: 0, questoes: 0, semAno: 0, objetiva: 0, discursiva: 0, semImagem: 0, semAlternativas: 0, baixaConfianca: 0, elegiveisParaResolucao: 0, elegiveisParaCorrecaoAutomatica: 0, pendenciasElegibilidade: {}, semGabarito: 0, assuntos: {}, conteudos: {}, bancas: {}}
const removidasDiscursivas = []
let bytesJson = 0
let bytesGzip = 0
const originaisLotes = [...(manifesto.lotes || [])]
const listagem = []
const lotesConsolidados = new Set()
const inventarioArquivos = new Set()
const idsVistos = new Set()

for (let indice = 0; indice < originaisLotes.length; indice++) {
  const lote = originaisLotes[indice]
  if (lotesConsolidados.has(lote.arquivo)) continue
  if (await fs.stat(path.join(origem, lote.arquivo)).then(() => true, () => false)) {
    listagem.push(lote)
    continue
  }
  const raizNome = lote.arquivo.replace(/-parte-\d+(?=\.json\.gz$)/u, '').replace(/\.json\.gz$/u, '')
  const grupo = originaisLotes.filter(item => item.arquivo.replace(/-parte-\d+(?=\.json\.gz$)/u, '').replace(/\.json\.gz$/u, '') === raizNome)
  const fonteConsolidada = path.join(raiz, 'tmp', 'classificacao-acervo', 'acervo-extraido', `${raizNome}.json.gz`)
  if (!await fs.stat(fonteConsolidada).then(() => true, () => false)) throw new Error(`Lote ausente sem cópia reconstruída: ${lote.arquivo}`)
  const consolidadas = JSON.parse(zlib.gunzipSync(await fs.readFile(fonteConsolidada)))
  const esperado = grupo.reduce((soma, item) => soma + Number(item.quantidade), 0)
  if (!Array.isArray(consolidadas) || consolidadas.length !== esperado) throw new Error(`Quantidade do lote consolidado não confere: ${raizNome}, manifesto ${esperado}, cópia ${consolidadas.length}`)
  listagem.push({...lote, quantidade: esperado})
  for (const parte of grupo) lotesConsolidados.add(parte.arquivo)
}

await fs.rm(destino, {recursive: true, force: true})
await fs.mkdir(path.join(destino, 'lotes'), {recursive: true})
await fs.copyFile(path.join(origem, 'visuais.json'), path.join(destino, 'visuais.json'))

for (let indice = 0; indice < listagem.length; indice++) {
  const lote = listagem[indice]
  const destinoLote = path.join(destino, lote.arquivo)
  let bytesOrigem
  try {
    bytesOrigem = await fs.readFile(path.join(origem, lote.arquivo))
  } catch (erro) {
    if (erro.code !== 'ENOENT') throw erro
    bytesOrigem = await fs.readFile(path.join(raiz, 'tmp', 'classificacao-acervo', 'acervo-extraido', lote.arquivo))
  }
  const dados = JSON.parse(zlib.gunzipSync(bytesOrigem))
  if (!Array.isArray(dados) || dados.length !== Number(lote.quantidade)) throw new Error(`Lote divergente do manifesto: ${lote.arquivo}`)
  totais.antes += dados.length
  const classificadas = []
  for (const original of dados) {
    if (estaDiscursiva(original)) { totais.discursiva++; removidasDiscursivas.push(original); continue }
    const q = enriquecerQuestaoExtraida({...original, ano: original.ano || lote.ano || original.ano})
    if (!q.ano && lote.ano) q.ano = Number(lote.ano)
    if (!q.conteudo) q.conteudo = `Conhecimentos gerais de ${q.materia}`
    const elegibilidade = auditarElegibilidadeQuestaoExtraida(q)
    q.elegibilidade = elegibilidade
    if (elegibilidade.elegivel_para_resolucao) totais.elegiveisParaResolucao++
    if (elegibilidade.elegivel_para_correcao_automatica) totais.elegiveisParaCorrecaoAutomatica++
    if (q.resposta_correta == null && q.resposta_soma == null) totais.semGabarito++
    for (const apontamento of elegibilidade.apontamentos) totais.pendenciasElegibilidade[apontamento] = (totais.pendenciasElegibilidade[apontamento] || 0) + 1
    classificadas.push(q)
  }
  const json = Buffer.from(JSON.stringify(classificadas))
  const comprimido = zlib.gzipSync(json, {level: 9})
  bytesJson += json.length
  bytesGzip += comprimido.length
  await fs.writeFile(destinoLote, comprimido)
  for (const q of classificadas) {
    if (!q.id || idsVistos.has(q.id)) throw new Error(`ID ausente ou duplicado no acervo: ${q.id || '(vazio)'}`)
    idsVistos.add(q.id)
    if (q.tipo_resposta !== 'objetiva') throw new Error(`Tipo de resposta inesperado em ${q.id}`)
    if (!Array.isArray(q.opcoes) || q.opcoes.length < 2) totais.semAlternativas++
    if (!(q.imagens_paginas || []).length && !q.pagina_imagem) totais.semImagem++
    if (!q.ano) totais.semAno++
    if (q.classificacao_confianca < 0.6) totais.baixaConfianca++
    totais.assuntos[q.materia] = (totais.assuntos[q.materia] || 0) + 1
    totais.conteudos[q.conteudo] = (totais.conteudos[q.conteudo] || 0) + 1
    const banco = totais.bancas[q.banca] ||= {questoes: 0, assuntos: {}}
    banco.questoes++
    banco.assuntos[q.materia] = (banco.assuntos[q.materia] || 0) + 1
  }
  lote.quantidade = classificadas.length
  inventarioArquivos.add(lote.arquivo)
  totais.questoes += classificadas.length
  if ((indice + 1) % 50 === 0 || indice === listagem.length - 1) console.log(`Lotes classificados: ${indice + 1}/${listagem.length}`)
}

if (totais.questoes + totais.discursiva !== totais.antes || totais.semImagem || totais.semAlternativas) {
  throw new Error(`Integridade requer revisão: ${JSON.stringify({discursivas: totais.discursiva, semImagem: totais.semImagem, semAlternativas: totais.semAlternativas})}`)
}

manifesto.gerado_em = new Date().toISOString()
manifesto.questoes_extraidas_unicas = totais.questoes
manifesto.bytes_json_sem_compressao = bytesJson
manifesto.bytes_json_gzip = bytesGzip
manifesto.reducao_compressao_percentual = Number((100 * (1 - bytesGzip / bytesJson)).toFixed(1))
manifesto.status_do_acervo = 'Questões objetivas com alternativas, classificadas por matéria, conteúdo e ano quando há evidência no documento, com referências visuais preservadas.'
manifesto.lotes = listagem.filter(lote => lote.quantidade > 0)
manifesto.classificacao = {
  atualizada_em: manifesto.gerado_em,
  criterio: 'classificação textual por enunciado e alternativas, metadados da edição, contexto OCR quando necessário e regras de prova documentadas; rótulos com confiança baixa devem receber revisão humana',
  questoes_classificadas: totais.questoes,
  objetiva: totais.questoes,
  discursiva: totais.discursiva,
  sem_ano: totais.semAno,
  baixa_confianca: totais.baixaConfianca,
  elegiveis_para_resolucao: totais.elegiveisParaResolucao,
  elegiveis_para_correcao_automatica: totais.elegiveisParaCorrecaoAutomatica,
  sem_gabarito: totais.semGabarito,
  pendencias_elegibilidade: totais.pendenciasElegibilidade,
  assuntos: totais.assuntos,
  conteudos: totais.conteudos,
  distribuicao_por_banca: totais.bancas,
}
manifesto.bancas = (manifesto.bancas || []).map(banca => {
  const lotes = listagem.filter(lote => lote.banca === banca.banca)
  const anos = new Map()
  for (const lote of lotes) {
    const chave = lote.ano ? String(lote.ano) : 'sem-ano'
    anos.set(chave, (anos.get(chave) || 0) + lote.quantidade)
  }
  return {...banca, questoes: lotes.reduce((soma, lote) => soma + lote.quantidade, 0), arquivos_com_questoes: lotes.length,
    edicoes: [...anos].sort(([a], [b]) => a === 'sem-ano' ? 1 : b === 'sem-ano' ? -1 : Number(a) - Number(b)).map(([ano, quantidade]) => ({ano, quantidade}))}
})
await fs.writeFile(path.join(destino, 'manifesto.json'), `${JSON.stringify(manifesto, null, 2)}\n`)
if (removidasDiscursivas.length) {
  const pastaBackup = path.join(raiz, 'tmp', 'backup-questoes-discursivas')
  await fs.mkdir(pastaBackup, {recursive: true})
  const nome = `questoes-discursivas-removidas-classificacao-${new Date().toISOString().replaceAll(':', '-')}.json.gz`
  await fs.writeFile(path.join(pastaBackup, nome), zlib.gzipSync(Buffer.from(JSON.stringify({total: removidasDiscursivas.length, itens: removidasDiscursivas})), {level: 9}))
}
await fs.writeFile(path.join(path.dirname(destino), 'resumo-classificacao.json'), `${JSON.stringify({totais, lotes: listagem.length, arquivos: inventarioArquivos.size}, null, 2)}\n`)
console.log(JSON.stringify({destino, antes: totais.antes, questoes: totais.questoes, discursivas_removidas: totais.discursiva, lotes: manifesto.lotes.length, semAno: totais.semAno, baixaConfianca: totais.baixaConfianca, materias: Object.keys(totais.assuntos).length, conteudos: Object.keys(totais.conteudos).length}, null, 2))
