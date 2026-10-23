import fs from 'node:fs/promises'
import path from 'node:path'
import {gunzipSync} from 'node:zlib'
import {fileURLToPath} from 'node:url'

const raiz = fileURLToPath(new URL('../../', import.meta.url))
const publico = path.join(raiz, 'public/acervo-extraido')
const lotes = path.join(publico, 'lotes')
const paginas = path.join(publico, 'paginas')
const usadas = new Set()

for (const arquivo of await fs.readdir(lotes)) {
  if (!arquivo.endsWith('.json.gz')) continue
  const questoes = JSON.parse(gunzipSync(await fs.readFile(path.join(lotes, arquivo))).toString('utf8'))
  for (const questao of questoes) {
    for (const imagem of questao.imagens_paginas || []) {
      if (/^paginas\/[a-f0-9]{16}-\d{4,6}\.webp$/u.test(imagem)) usadas.add(path.basename(imagem))
    }
  }
}

let removidas = 0, temporarias = 0, disponiveis = 0, bytes = 0
for (const arquivo of await fs.readdir(paginas).catch(erro => erro.code === 'ENOENT' ? [] : Promise.reject(erro))) {
  if (/^[a-f0-9]{16}-\d{4,6}\.webp\.tmp$/u.test(arquivo)) {
    await fs.rm(path.join(paginas, arquivo), {force: true})
    temporarias++
    continue
  }
  if (!/^[a-f0-9]{16}-\d{4,6}\.webp$/u.test(arquivo)) continue
  const destino = path.join(paginas, arquivo)
  if (!usadas.has(arquivo)) {
    await fs.rm(destino, {force: true})
    removidas++
    continue
  }
  const stat = await fs.stat(destino)
  disponiveis++
  bytes += stat.size
}

let visuais = {}
try { visuais = JSON.parse(await fs.readFile(path.join(publico, 'visuais.json'), 'utf8')) }
catch (erro) { if (erro.code !== 'ENOENT') throw erro }
visuais.paginas_visuais_orfas_removidas = removidas
visuais.arquivos_temporarios_removidos = temporarias
visuais.paginas_visuais_disponiveis = disponiveis
visuais.paginas_visuais_sem_arquivo = Math.max(0, usadas.size - disponiveis)
visuais.bytes_visuais_disponiveis = bytes
await fs.writeFile(path.join(publico, 'visuais.json'), JSON.stringify(visuais, null, 2))
console.log(JSON.stringify({paginas_referenciadas: usadas.size, paginas_visuais_disponiveis: disponiveis, paginas_visuais_sem_arquivo: visuais.paginas_visuais_sem_arquivo, paginas_orfas_removidas: removidas, arquivos_temporarios_removidos: temporarias, bytes_visuais_disponiveis: bytes}, null, 2))
