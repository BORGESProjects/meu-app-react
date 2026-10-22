import fs from 'node:fs/promises'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {unirQuestoes} from '../src/acervo.js'

export const raiz = fileURLToPath(new URL('../', import.meta.url))
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
// Apenas recursos usados na resolução. Links de fontes externas continuam online.
export function recursosQuestoes(questoes) {
  const recursos = new Set()
  function visitar(obj) {
    if (!obj || typeof obj !== 'object') return
    for (const [chave, valor] of Object.entries(obj)) {
      if (['imagem_original','pagina_imagem','imagem','src'].includes(chave) && typeof valor === 'string' && valor) recursos.add(valor)
      if (chave === 'opcoes_imagens' && Array.isArray(valor)) valor.filter(Boolean).forEach(v => recursos.add(v))
      if (valor && typeof valor === 'object') visitar(valor)
    }
  }
  questoes.forEach(visitar)
  return [...recursos].sort()
}
export function caminhoPublico(url) {
  const caminho = decodeURIComponent(url.split(/[?#]/u)[0])
  if (!caminho.startsWith('/acervo/') || caminho.includes('\\') || caminho.split('/').includes('..')) throw Error('Caminho de imagem não permitido: ' + url)
  const arquivo = path.resolve(raiz, 'public', '.' + caminho)
  if (!arquivo.startsWith(path.join(raiz,'public') + path.sep)) throw Error('Imagem fora do acervo')
  return arquivo
}

async function gerar() {
  const args = process.argv.slice(2)
  const destino = path.join(raiz,'native/acervo')
  let questoes
  if (args.length) {
    const fontes = []
    for (const arquivo of args) {
      const itens = JSON.parse(await fs.readFile(arquivo,'utf8'))
      if (!Array.isArray(itens)) throw Error('Fonte de questões inválida')
      fontes.push(...itens)
    }
    for (const d of await fs.readdir(path.join(raiz,'public/acervo'),{withFileTypes:true})) {
      if (!d.isDirectory()) continue
      const arquivo = path.join(raiz,'public/acervo',d.name,'questoes.json')
      try { fontes.push(...JSON.parse(await fs.readFile(arquivo,'utf8'))) }
      catch (e) { if (e.code !== 'ENOENT') throw e }
    }
    questoes = unirQuestoes(fontes)
    if (questoes.length !== 25495) throw Error(`Esperadas 25.495 questões, obtidas ${questoes.length}. Confira as fontes antes de substituir o pacote.`)
  } else {
    questoes = JSON.parse(await fs.readFile(path.join(destino,'questoes.json'),'utf8'))
    if (questoes.length !== 25495 || unirQuestoes(questoes).length !== 25495) throw Error('Pacote de questões incompleto')
  }
  const recursos = []
  const mapa = {}
  const falhas = []
  const fila = recursosQuestoes(questoes)
  let proximo = 0
  async function trabalhar() { while (proximo < fila.length) {
    const url = fila[proximo++]
    try {
      if (url.startsWith('/acervo/')) {
        const bytes = await fs.readFile(caminhoPublico(url))
        recursos.push({url,bytes:bytes.length,sha256:sha256(bytes)})
      } else if (url.startsWith('/api/') || /^https:\/\/(?:aprovado-api\.onrender\.com|enem\.dev|d2q576s0wzfxtl\.cloudfront\.net|s3\.static\.brasilescola\.uol\.com\.br)\//u.test(url)) {
        const remoto = url.startsWith('/') ? 'https://aprovado-api.onrender.com'+url : url
        const extensao = new URL(remoto).pathname.match(/\.(png|webp|jpe?g|gif)$/iu)?.[0] || (remoto.endsWith('.latex') ? '.gif' : '.png')
        const local = '/native-media/'+sha256(remoto)+extensao
        const arquivo = path.join(raiz,'native/media',path.basename(local))
        let bytes
        try { bytes = await fs.readFile(arquivo) } catch(e) {
          if (e.code !== 'ENOENT') throw e
          const r = await fetch(remoto,{signal:AbortSignal.timeout(60000)})
          if (!r.ok) throw Error('Imagem remota indisponível')
          bytes = Buffer.from(await r.arrayBuffer())
          const imagem = bytes.subarray(0,3).equals(Buffer.from([255,216,255])) || bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || bytes.toString('ascii',0,6).startsWith('GIF8') || (bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP')
          if(!imagem) throw Error('Resposta remota não é uma imagem válida')
          await fs.mkdir(path.dirname(arquivo),{recursive:true}); await fs.writeFile(arquivo,bytes)
        }
        mapa[url] = local
        mapa[remoto] = local
        recursos.push({url:local,bytes:bytes.length,sha256:sha256(bytes)})
      } else throw Error('Origem visual não suportada')
    } catch(e) { falhas.push({url,erro:e.message}) }
  } }
  await Promise.all(Array.from({length:6},trabalhar))
  recursos.sort((a,b)=>a.url.localeCompare(b.url))
  if (falhas.length) {
    await fs.mkdir(path.join(raiz,'tmp'),{recursive:true})
    await fs.writeFile(path.join(raiz,'tmp/recursos-nativos-pendentes.json'),JSON.stringify(falhas,null,2))
    throw Error(`${falhas.length} recursos ausentes. O pacote não será declarado completo. Veja tmp/recursos-nativos-pendentes.json.`)
  }
  const bytes = Buffer.from(JSON.stringify(questoes))
  const manifesto = {versao:1,questoes:questoes.length,sha256:sha256(bytes),bytes:bytes.length,bytesImagens:recursos.reduce((n,r)=>n+r.bytes,0),recursos,mapa}
  await fs.mkdir(destino,{recursive:true})
  await fs.writeFile(path.join(destino,'questoes.json'),bytes)
  await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
  console.log(JSON.stringify({questoes:questoes.length,imagens:recursos.length,mbTexto:Math.round(bytes.length/1048576),mbImagens:Math.round(manifesto.bytesImagens/1048576)}))
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await gerar()
