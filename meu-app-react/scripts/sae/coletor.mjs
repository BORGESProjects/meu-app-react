import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { capturarCapituloDom } from './capturar-dom.mjs'
import { extrairCapitulo } from './extrair-capitulo.mjs'
import { capturarLayout } from './capturar-layout.mjs'

export function tituloCorresponde(esperado,titulos){
  const norm=t=>String(t).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').split(/\s+/u).filter(t=>t&&!['a','o','as','os','da','do','das','dos','de','e'].includes(t)).join(' ')
  // O índice usa “Movimento e fenômenos ondulatórios”; o título do mesmo
  // capítulo usa “Movimentos”. A equivalência é restrita a esse título.
  const canonico=t=>norm(t).replace(/^movimentos fenomenos ondulatorios$/u,'movimento fenomenos ondulatorios').replace(/^multiplos divisores$/u,'multiplo divisores').replace(/^meiose mutacao$/u,'meiose').replace(/^brasil colonia sociedade acucareira$/u,'brasil colonial sociedade acucareira')
  const a=canonico(esperado)
  return titulos.some(t=>{const b=canonico(t);return Boolean(a&&b&&(a===b||Math.min(a.length,b.length)>=8&&(` ${a} `.includes(` ${b} `)||` ${b} `.includes(` ${a} `))))})
}

function imagensDoObjeto(obj, urls = new Set()) {
  if (!obj || typeof obj !== 'object') return urls
  if (obj.tag === 'img' && obj.attrs?.src) urls.add(obj.attrs.src)
  for (const valor of Object.values(obj)) imagensDoObjeto(valor, urls)
  return urls
}

// Recebe somente um capítulo aberto por navegação normal, na conta autorizada.
export async function coletarCapitulo({ tab, meta, readerUrl, outDir, contentUrl: informado, baixarRecursos = true, modoVisual = 'pagina', funcoes = {}, cacheRecursos, recuperarImagensVisiveis=false }) {
  const atual = await tab.url()
  const contentUrl = informado || (atual?.includes('/@mount/') ? atual : new URL(await tab.playwright.locator('iframe[title="Conteúdo do capítulo"]').getAttribute('src', { timeoutMs: 20000 }), readerUrl).href)
  if (await tab.url() !== contentUrl) await tab.goto(contentUrl)
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded', timeoutMs: 15000 })
  // O botão aparece antes de o script de correção do livro terminar de carregar.
  // Aguardar os recursos evita um clique prematuro que deixaria todas as chaves vazias.
  try { await tab.playwright.waitForLoadState({ state: 'networkidle', timeoutMs: 12000 }) } catch { /* pendências são registradas abaixo */ }
  await tab.playwright.domSnapshot()
  const titulos=await tab.playwright.locator('h1').allTextContents({timeoutMs:10000})
  if(!tituloCorresponde(meta.capitulo,titulos))throw Error('O título do leitor não corresponde ao capítulo solicitado: '+meta.capitulo+' / títulos: '+JSON.stringify(titulos))
  const botao = tab.playwright.getByRole('button', { name: 'Clique para ativar o Gabarito', exact: true })
  const gabaritoDisponivel = await botao.count() === 1
  let capturaVisual = null
  if (modoVisual === 'pagina') {
    const ativo = await tab.playwright.locator('main').evaluate(n => [...n.querySelectorAll('.gabarito:not(button),.respostaCerta')].some(e => e.getClientRects().length > 0 && !e.closest('[hidden]')))
    if (ativo && gabaritoDisponivel) { await botao.click(); await tab.playwright.domSnapshot() }
    try { await tab.playwright.waitForLoadState({ state: 'networkidle', timeoutMs: 12000 }) } catch { /* a lista de imagens registra pendências */ }
    const layout = await tab.playwright.locator('main').evaluate(funcoes.capturarLayout || capturarLayout)
    const arquivo = path.join('paginas', `${meta.id_capitulo}-base.png`)
    await fs.mkdir(path.join(outDir, 'paginas'), { recursive: true })
    await fs.writeFile(path.join(outDir, arquivo), await tab.screenshot({ fullPage: true }))
    capturaVisual = { arquivo, layout, sem_gabarito: true }
  }
  const chavesJaVisiveis = await tab.playwright.locator('main').evaluate(n => [...n.querySelectorAll('.respostaCerta')].some(e => e.getClientRects().length > 0 && !e.closest('[hidden]')))
  if (gabaritoDisponivel && !chavesJaVisiveis) {
    await botao.click({ timeoutMs: 15000 })
    await tab.playwright.domSnapshot()
  }
  const transporte = await tab.playwright.locator('main').evaluate(funcoes.capturarDom || capturarCapituloDom)
  const json = transporte.partes.join('')
  if (json.length !== transporte.caracteres || json.includes('[MaxDepth]')) throw Error('Capítulo truncado')
  const dados = JSON.parse(json)
  const capitulo = { ...meta, url: readerUrl.split('?')[0], url_conteudo: contentUrl, ...dados,
    gabarito_exibido: gabaritoDisponivel, publicado: false }
  const questoes = (funcoes.extrair || extrairCapitulo)(capitulo)
  if (questoes.length !== capitulo.quantidade_inicios) throw Error(`Contagem divergente: ${questoes.length}/${capitulo.quantidade_inicios}`)
  const necessarias = imagensDoObjeto(questoes)
  const dirCapitulos = path.resolve(outDir, 'capitulos')
  await fs.mkdir(dirCapitulos, { recursive: true })
  const caminhoCapitulo = path.join(dirCapitulos, `${meta.id_capitulo}.json`)
  if (capturaVisual) {
    if (capturaVisual.layout.exercicios.length !== questoes.length) throw Error('Contagem visual divergente')
    for (let i = 0; i < questoes.length; i++) {
      if (capturaVisual.layout.exercicios[i].numero !== questoes[i].numero_livro) throw Error('Numeração visual divergente')
      questoes[i].recorte = capturaVisual.layout.exercicios[i]
    }
    await fs.writeFile(caminhoCapitulo, JSON.stringify({ ...capitulo, questoes, captura_visual: capturaVisual,
      arquivos: [{ tipo: 'pagina_renderizada', arquivo: capturaVisual.arquivo }],
      imagens_pendentes: capturaVisual.layout.imagens_nao_carregadas, falhas_recursos: [] }))
    return { ...meta, url: capitulo.url, questoes: questoes.length,
      objetivas: questoes.filter(q => q.tipo_resposta === 'multipla_escolha').length,
      com_gabarito: questoes.filter(q => q.resposta_correta !== null).length,
      imagens_necessarias: necessarias.size, imagens_pendentes: capturaVisual.layout.imagens_nao_carregadas.length,
      captura_integral: capturaVisual.arquivo }
  }
  // Guarda a extração antes da transferência dos recursos, para permitir retomada.
  await fs.writeFile(caminhoCapitulo, JSON.stringify({ ...capitulo, questoes,
    arquivos: [], imagens_pendentes: [...necessarias], falhas_recursos: [] }))
  const recurso = baixarRecursos ? await tab.capabilities.get('pageAssets') : null
  const inventario = recurso ? await recurso.list() : { assets: [] }
  const cache = cacheRecursos || new Map()
  if (baixarRecursos && !cacheRecursos) for (const nome of await fs.readdir(dirCapitulos)) {
    if (!nome.endsWith('.json')) continue
    let anterior
    try { anterior = JSON.parse(await fs.readFile(path.join(dirCapitulos, nome), 'utf8')) } catch { continue /* outra captura ainda gravando seu arquivo */ }
    for (const a of anterior.arquivos ?? []) {
      try { await fs.access(path.resolve(outDir, a.arquivo)); cache.set(a.url, a) } catch { /* refazer recurso ausente */ }
    }
  }
  const relevantes = inventario.assets.filter(a =>
    (a.kind === 'image' && necessarias.has(a.url)) || ['font', 'stylesheet'].includes(a.kind))
  const ids = relevantes.filter(a => !cache.has(a.url)).map(a => a.id)
  const destino = path.resolve(outDir, 'assets', meta.id_capitulo)
  await fs.mkdir(destino, { recursive: true })
  const arquivos = relevantes.filter(a => cache.has(a.url)).map(a => cache.get(a.url))
  const grupos = []
  for (let i = 0; i < ids.length; i += 5) grupos.push(ids.slice(i, i + 5))
  const pacotes = await Promise.allSettled(grupos.map(assetIds => recurso.bundle({ inventoryId: inventario.id, assetIds })))
  const falhas = []
  for (const resposta of pacotes) {
    if (resposta.status !== 'fulfilled') { falhas.push({ motivo: String(resposta.reason) }); continue }
    const pacote = resposta.value
    falhas.push(...pacote.failures)
    for (const a of pacote.assets) {
      const relativo = path.relative(pacote.directoryPath, a.path)
      if (relativo.startsWith('..') || path.isAbsolute(relativo)) throw Error('Recurso fora do pacote')
      const arquivo = path.join(destino, relativo)
      await fs.mkdir(path.dirname(arquivo), { recursive: true })
      await fs.copyFile(a.path, arquivo)
      const registro={ url: a.url, tipo: a.kind, arquivo: path.relative(outDir, arquivo) }
      arquivos.push(registro)
      cache.set(a.url,registro)
    }
  }
  const salvas = new Set(arquivos.map(a => a.url))
  const faltantes=[...necessarias].filter(url=>!salvas.has(url)&&!url.startsWith('data:'))
  await fs.writeFile(caminhoCapitulo,JSON.stringify({...capitulo,questoes,arquivos,imagens_pendentes:faltantes,falhas_recursos:falhas}))
  if(baixarRecursos&&recuperarImagensVisiveis&&faltantes.length){
    const visiveis=await tab.playwright.locator('img').evaluateAll(es=>es.map((e,i)=>({i,src:e.src,carregada:e.complete&&e.naturalWidth>0})))
    for(const url of faltantes.slice(0,2)){
      const imagem=visiveis.find(i=>i.src===url&&i.carregada)
      if(!imagem)continue
      try{
        const baixada=await tab.playwright.locator('img').nth(imagem.i).downloadMedia({timeoutMs:3000})
        const bytes=await fs.readFile(baixada)
        const ext=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'.png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'.jpg':bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'?'.webp':null
        if(!ext)throw Error('Recurso não é uma imagem raster reconhecida')
        const arquivo=path.join(destino,createHash('sha256').update(url).digest('hex').slice(0,16)+ext)
        await fs.copyFile(baixada,arquivo)
        const registro={url,tipo:'image',arquivo:path.relative(outDir,arquivo)}
        arquivos.push(registro);cache.set(url,registro);salvas.add(url)
      }catch(e){falhas.push({url,motivo:'Recurso visível não recuperado: '+String(e)})}
    }
  }
  const imagensPendentes = [...necessarias].filter(url => !url.startsWith('data:') && !salvas.has(url))
  const resultado = { ...capitulo, questoes, arquivos,
    imagens_pendentes: imagensPendentes,
    falhas_recursos: falhas }
  await fs.writeFile(caminhoCapitulo, JSON.stringify(resultado))
  return { ...meta, url: capitulo.url, questoes: questoes.length,
    objetivas: questoes.filter(q => q.tipo_resposta === 'multipla_escolha').length,
    com_gabarito: questoes.filter(q => q.resposta_correta !== null).length,
    imagens_necessarias: necessarias.size, imagens_pendentes: imagensPendentes.length,
    arquivos_salvos: arquivos.length }
}
