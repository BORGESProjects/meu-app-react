import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {fileURLToPath} from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const pastaEntrada = process.env.ACERVO_CLASSIFICACAO_ENTRADA || 'classificacao-acervo-final'
const pastaSaida = process.env.ACERVO_CLASSIFICACAO_DESTINO || 'classificacao-acervo-upload'
const origem = path.join(raiz, 'tmp', pastaEntrada, 'acervo-extraido')
const destino = path.join(raiz, 'tmp', pastaSaida, 'acervo-extraido')
const MAX_BYTES_LOTE = 600_000
const MAX_BYTES_PARTE_JSON = 380_000
const manifesto = JSON.parse(await fs.readFile(path.join(origem, 'manifesto.json'), 'utf8'))
const resumo = {questoes: 0, lotesOriginais: manifesto.lotes.length, lotesFinais: 0, divididos: 0, objetos: 0, bytes: 0, maiorObjeto: 0, ids: new Set(), semMateria: 0, semConteudo: 0, semTipoObjetiva: 0, semImagem: 0, semAlternativas: 0, inelegiveis: 0, semGabarito: 0}

await fs.rm(destino, {recursive: true, force: true})
await fs.mkdir(path.join(destino, 'lotes'), {recursive: true})
await fs.copyFile(path.join(origem, 'visuais.json'), path.join(destino, 'visuais.json'))
const lotesNovos = []

for (const lote of manifesto.lotes) {
  const dados = JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(origem, lote.arquivo))))
  if (!Array.isArray(dados) || dados.length !== Number(lote.quantidade)) throw new Error(`Lote inconsistente: ${lote.arquivo}`)
  const partes = []
  let atual = []
  let bytes = 2
  for (const q of dados) {
    if (!q.materia) resumo.semMateria++
    if (!q.conteudo) resumo.semConteudo++
    if (q.tipo_resposta !== 'objetiva') resumo.semTipoObjetiva++
    if (!Array.isArray(q.opcoes) || q.opcoes.length < 2) resumo.semAlternativas++
    if (!(q.imagens_paginas || []).length && !q.pagina_imagem) resumo.semImagem++
    if (!q.elegibilidade?.elegivel_para_resolucao) resumo.inelegiveis++
    if (!q.elegibilidade?.elegivel_para_correcao_automatica) resumo.semGabarito++
    if (!q.id || resumo.ids.has(q.id)) throw new Error(`ID repetido ou ausente ao empacotar: ${q.id || '(vazio)'}`)
    resumo.ids.add(q.id)
    const qBytes = Buffer.byteLength(JSON.stringify(q)) + 1
    if (atual.length && bytes + qBytes > MAX_BYTES_PARTE_JSON) {
      partes.push(atual)
      atual = []
      bytes = 2
    }
    atual.push(q)
    bytes += qBytes
  }
  if (atual.length) partes.push(atual)
  if (partes.length > 1) resumo.divididos++
  for (let indice = 0; indice < partes.length; indice++) {
    const nome = indice === 0
      ? lote.arquivo
      : lote.arquivo.replace(/\.json\.gz$/u, `-parte-${String(indice + 1).padStart(2, '0')}.json.gz`)
    const comprimido = zlib.gzipSync(Buffer.from(JSON.stringify(partes[indice])), {level: 9})
    if (comprimido.length > MAX_BYTES_LOTE) throw new Error(`Parte ainda ultrapassa limite seguro: ${nome} (${comprimido.length} bytes)`)
    await fs.writeFile(path.join(destino, nome), comprimido)
    lotesNovos.push({...lote, quantidade: partes[indice].length, arquivo: nome})
    resumo.questoes += partes[indice].length
    resumo.objetos++
    resumo.bytes += comprimido.length
    resumo.maiorObjeto = Math.max(resumo.maiorObjeto, comprimido.length)
  }
}

if (resumo.semMateria || resumo.semConteudo || resumo.semTipoObjetiva || resumo.semImagem || resumo.semAlternativas || resumo.inelegiveis) {
  throw new Error(`Validação do pacote falhou: ${JSON.stringify({...resumo, ids: undefined})}`)
}
if (resumo.questoes !== Number(manifesto.questoes_extraidas_unicas)) throw new Error(`Total não confere com manifesto: ${resumo.questoes}`)

manifesto.lotes = lotesNovos
manifesto.bancas = (manifesto.bancas || []).map(banca => {
  const lotes = lotesNovos.filter(item => item.banca === banca.banca)
  const anos = new Map()
  for (const item of lotes) {
    const chave = item.ano ? String(item.ano) : 'sem-ano'
    anos.set(chave, (anos.get(chave) || 0) + item.quantidade)
  }
  return {...banca, questoes: lotes.reduce((soma, item) => soma + item.quantidade, 0), arquivos_com_questoes: lotes.length,
    edicoes: [...anos].sort(([a], [b]) => a === 'sem-ano' ? 1 : b === 'sem-ano' ? -1 : Number(a) - Number(b)).map(([ano, quantidade]) => ({ano, quantidade}))}
})
await fs.writeFile(path.join(destino, 'manifesto.json'), JSON.stringify(manifesto))
const manifestoBytes = (await fs.stat(path.join(destino, 'manifesto.json'))).size
const visuaisBytes = (await fs.stat(path.join(destino, 'visuais.json'))).size
resumo.objetos += 2
resumo.bytes += manifestoBytes + visuaisBytes
resumo.maiorObjeto = Math.max(resumo.maiorObjeto, manifestoBytes, visuaisBytes)
resumo.lotesFinais = lotesNovos.length
delete resumo.ids
await fs.writeFile(path.join(path.dirname(destino), 'resumo-pacote-r2.json'), `${JSON.stringify({...resumo, manifesto: manifesto.questoes_extraidas_unicas, destino}, null, 2)}\n`)
console.log(JSON.stringify({...resumo, manifesto: manifesto.questoes_extraidas_unicas, destino}, null, 2))
