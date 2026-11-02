import fs from 'node:fs/promises'
import path from 'node:path'
import { lerArquivoAtual } from './acervo-atual.mjs'

const destino = path.resolve('tmp/r2-publicacao-revisao-v61/acervo-extraido')
if (!destino.startsWith(path.resolve('tmp') + path.sep)) throw Error('Destino fora da pasta temporária')
await fs.rm(path.dirname(destino), { recursive: true, force: true })
await fs.mkdir(path.join(destino, 'lotes'), { recursive: true })
const manifesto = JSON.parse(await lerArquivoAtual('manifesto.json'))
let bytes = 0
for (const [i, lote] of manifesto.lotes.entries()) {
  const dado = await lerArquivoAtual(lote.arquivo)
  await fs.writeFile(path.join(destino, lote.arquivo), dado)
  bytes += dado.length
  if ((i + 1) % 500 === 0) console.log(`Lotes preparados: ${i + 1}/${manifesto.lotes.length}`)
}
for (const nome of ['visuais.json', manifesto.indice_facetas.arquivo, manifesto.classificacao_principal.arquivo]) {
  const dado = await lerArquivoAtual(nome)
  const alvo = path.join(destino, nome)
  await fs.mkdir(path.dirname(alvo), { recursive: true })
  await fs.writeFile(alvo, dado)
  bytes += dado.length
}
const manifestoBytes = Buffer.from(JSON.stringify(manifesto))
await fs.writeFile(path.join(destino, 'manifesto.json'), manifestoBytes)
bytes += manifestoBytes.length
console.log(JSON.stringify({ diretorio: destino, lotes: manifesto.lotes.length, questoes: manifesto.questoes_extraidas_unicas, bytes: bytes, megabytes: Number((bytes / 1024 / 1024).toFixed(2)), manifesto: 'incluído por último pelo publicador do painel' }, null, 2))
