import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const acervo = path.resolve('public/acervo-extraido')
const manifestoPath = path.join(acervo, 'manifesto.json')
const manifesto = JSON.parse(fs.readFileSync(manifestoPath, 'utf8'))
const comandoAberto = /^\s*(?:\d+[.)-]\s*)?(?:explique|justifique|discorra|descreva|apresente|diferencie|defina|redija|elabore|argumente|comente|indique|mencione|demonstre|calcule|resolva|analise|compare|avalie|proponha|escreva|responda)\b/iu
const valorExplicito = /\[\s*valor\s*:\s*\d+(?:[,.]\d+)?\s*pontos?\s*\]/iu
const foiMarcadaDiscursiva = questao => {
  const declarada = [questao.tipo_resposta, questao.tipo_extraido].some(tipo => String(tipo || '').toLocaleLowerCase('pt-BR') === 'discursiva')
  const comando = String(questao.enunciado || '')
  const semAlternativas = !Array.isArray(questao.opcoes) || questao.opcoes.length === 0
  return declarada || (comandoAberto.test(comando) && (semAlternativas || valorExplicito.test(comando)))
}

const alteracoes = []
const removidas = []
let totalAntes = 0
let totalDepois = 0
let bytesJson = 0
let bytesGzip = 0
for (const lote of manifesto.lotes) {
  const arquivo = path.join(acervo, lote.arquivo)
  const originais = JSON.parse(zlib.gunzipSync(fs.readFileSync(arquivo)))
  totalAntes += originais.length
  const restantes = []
  originais.forEach((questao, indice) => {
    if (foiMarcadaDiscursiva(questao)) removidas.push({arquivo: lote.arquivo, indice, questao})
    else restantes.push(questao)
  })
  lote.quantidade = restantes.length
  totalDepois += restantes.length
  const json = Buffer.from(JSON.stringify(restantes))
  bytesJson += json.length
  const comprimido = zlib.gzipSync(json, {level: 9})
  bytesGzip += comprimido.length
  if (restantes.length !== originais.length) alteracoes.push({arquivo, relativo: lote.arquivo, comprimido})
}

if (!removidas.length || totalAntes !== manifesto.questoes_extraidas_unicas) {
  throw new Error(`Conferência preventiva falhou: total indexado ${manifesto.questoes_extraidas_unicas}, total lido ${totalAntes}, itens a remover ${removidas.length}.`)
}

const diretorioBackup = path.resolve('tmp/backup-questoes-discursivas')
const nomeBackup = `questoes-discursivas-removidas-${new Date().toISOString().replaceAll(':', '-')}.json.gz`
fs.mkdirSync(diretorioBackup, {recursive: true})
const backupPath = path.join(diretorioBackup, nomeBackup)
fs.writeFileSync(backupPath, zlib.gzipSync(Buffer.from(JSON.stringify({total: removidas.length, itens: removidas})), {level: 9}))

for (const alteracao of alteracoes) fs.writeFileSync(alteracao.arquivo, alteracao.comprimido)
manifesto.gerado_em = new Date().toISOString()
manifesto.questoes_extraidas_unicas = totalDepois
manifesto.bytes_json_sem_compressao = bytesJson
manifesto.bytes_json_gzip = bytesGzip
manifesto.reducao_compressao_percentual = Number((100 * (1 - bytesGzip / bytesJson)).toFixed(1))
manifesto.status_do_acervo = 'Questões objetivas transcritas e vinculadas às páginas visuais de origem; gabaritos não são inferidos.'
const agregados = new Map()
for (const lote of manifesto.lotes) {
  if (!lote.quantidade) continue
  const item = agregados.get(lote.banca) || {banca: lote.banca, questoes: 0, anos: new Map(), arquivos_com_questoes: 0}
  item.questoes += lote.quantidade
  item.arquivos_com_questoes += 1
  const ano = lote.ano ? String(lote.ano) : 'sem-ano'
  item.anos.set(ano, (item.anos.get(ano) || 0) + lote.quantidade)
  agregados.set(lote.banca, item)
}
manifesto.bancas = [...agregados.values()].sort((a, b) => a.banca.localeCompare(b.banca, 'pt-BR')).map(item => ({
  banca: item.banca,
  questoes: item.questoes,
  edicoes: [...item.anos].sort(([a], [b]) => a === 'sem-ano' ? 1 : b === 'sem-ano' ? -1 : Number(a) - Number(b)).map(([ano, quantidade]) => ({ano, quantidade})),
  arquivos_com_questoes: item.arquivos_com_questoes,
}))
fs.writeFileSync(manifestoPath, `${JSON.stringify(manifesto, null, 2)}\n`)

const pacote = path.resolve('tmp/pacote-r2-objetivas/acervo-extraido')
fs.rmSync(path.dirname(pacote), {recursive: true, force: true})
fs.mkdirSync(path.join(pacote, 'lotes'), {recursive: true})
for (const alteracao of alteracoes) fs.copyFileSync(alteracao.arquivo, path.join(pacote, alteracao.relativo))
fs.copyFileSync(manifestoPath, path.join(pacote, 'manifesto.json'))
fs.copyFileSync(path.join(acervo, 'visuais.json'), path.join(pacote, 'visuais.json'))

const verifica = {total: 0, discursivas: 0}
for (const lote of manifesto.lotes) {
  const questoes = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(acervo, lote.arquivo))))
  if (questoes.length !== lote.quantidade) throw new Error(`Lote não confere com o manifesto: ${lote.arquivo}`)
  verifica.total += questoes.length
  verifica.discursivas += questoes.filter(foiMarcadaDiscursiva).length
}
if (verifica.total !== totalDepois || verifica.discursivas) throw new Error(`Verificação final falhou: ${JSON.stringify(verifica)}`)
console.log(JSON.stringify({
  totalAntes,
  removidas: removidas.length,
  totalDepois,
  lotesAtualizados: alteracoes.length,
  bytesPacote: fs.readdirSync(path.join(pacote, 'lotes')).reduce((soma, item) => soma + fs.statSync(path.join(pacote, 'lotes', item)).size, fs.statSync(path.join(pacote, 'manifesto.json')).size + fs.statSync(path.join(pacote, 'visuais.json')).size),
  backup: backupPath,
  pacote,
}))
