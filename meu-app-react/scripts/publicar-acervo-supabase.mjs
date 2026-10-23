import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {fileURLToPath} from 'node:url'
import {createClient} from '@supabase/supabase-js'
import {loadEnv} from 'vite'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pastaAcervo = path.join(raiz, 'public', 'acervo-extraido')
const nomeBucket = 'acervo-extraido'
const limiteArquivoBytes = 50 * 1024 * 1024
const envPublico = loadEnv('production', raiz, 'VITE_')
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || envPublico.VITE_SUPABASE_URL
const chaveAdmin = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

function falhar(mensagem) {
  console.error(mensagem)
  process.exitCode = 1
}

function caminhoSeguro(valor) {
  const caminho = String(valor || '').replace(/^\/+/, '')
  if (!caminho || caminho.includes('\\') || caminho.split('/').some(parte => !parte || parte === '.' || parte === '..')) {
    throw new Error(`Caminho inválido no índice do acervo: ${caminho || '(vazio)'}`)
  }
  return caminho
}

function validarChaveAdmin(chave) {
  if (!chave) throw new Error('Defina SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY apenas no ambiente local antes de publicar.')
  if (chave.split('.').length === 3) {
    let payload
    try { payload = JSON.parse(Buffer.from(chave.split('.')[1], 'base64url')) }
    catch { throw new Error('A chave Supabase configurada não é válida.') }
    if (payload.role !== 'service_role') throw new Error('A chave configurada não tem permissão administrativa para enviar arquivos.')
  } else if (!chave.startsWith('sb_secret_')) {
    throw new Error('Use uma chave secreta do Supabase ou a chave administrativa service_role; a chave anon não pode publicar arquivos.')
  }
}

async function lerJson(nome) {
  return JSON.parse(await fs.readFile(path.join(pastaAcervo, nome), 'utf8'))
}

async function prepararPacote() {
  const manifesto = await lerJson('manifesto.json')
  const visuaisOriginais = await lerJson('visuais.json')
  const paginasNecessarias = new Set()
  const arquivosLotes = []
  let totalQuestoes = 0

  for (const lote of manifesto.lotes || []) {
    const caminho = caminhoSeguro(lote.arquivo)
    const arquivo = path.join(pastaAcervo, caminho)
    const bytes = await fs.readFile(arquivo)
    if (bytes.length > limiteArquivoBytes) throw new Error(`O lote ${caminho} ultrapassa o limite de arquivo do Supabase Free.`)
    const questoes = JSON.parse(zlib.gunzipSync(bytes))
    if (!Array.isArray(questoes) || questoes.length !== lote.quantidade) throw new Error(`O lote ${caminho} não corresponde ao índice.`)
    totalQuestoes += questoes.length
    for (const questao of questoes) {
      const fonteEhPacote = /\.zip(?:[?#]|$)/iu.test(String(questao.fonte || ''))
      if (questao.fonte && !fonteEhPacote) continue
      for (const imagem of [...(questao.imagens_paginas || []), ...(questao.pagina_imagem ? [questao.pagina_imagem] : [])]) {
        paginasNecessarias.add(caminhoSeguro(imagem))
      }
    }
    arquivosLotes.push(caminho)
  }

  if (totalQuestoes !== Number(manifesto.questoes_extraidas_unicas)) {
    throw new Error(`O total dos lotes (${totalQuestoes}) diverge do índice (${manifesto.questoes_extraidas_unicas}).`)
  }

  let bytesImagens = 0
  for (const pagina of paginasNecessarias) {
    const stat = await fs.stat(path.join(pastaAcervo, pagina))
    if (!stat.isFile()) throw new Error(`A imagem indicada não é um arquivo: ${pagina}`)
    bytesImagens += stat.size
  }

  const visuaisStorage = {
    ...visuaisOriginais,
    paginas_visuais_acervo_total: Number(visuaisOriginais.paginas_visuais_disponiveis || 0),
    paginas_visuais_disponiveis: paginasNecessarias.size,
    paginas_visuais_sem_arquivo: Math.max(0, Number(visuaisOriginais.paginas_visuais_disponiveis || 0) - paginasNecessarias.size),
  }
  return {
    manifesto,
    visuaisStorage,
    arquivosLotes,
    paginasNecessarias: [...paginasNecessarias],
    totalQuestoes,
    bytesImagens,
  }
}

async function garantirBucket(admin) {
  const {data: buckets, error: erroLista} = await admin.storage.listBuckets()
  if (erroLista) throw new Error(`Não foi possível consultar os buckets: ${erroLista.message}`)
  const existente = buckets.find(item => item.id === nomeBucket || item.name === nomeBucket)
  if (existente?.public) throw new Error(`O bucket ${nomeBucket} está público. Torne-o privado antes de publicar o acervo.`)
  if (existente) return

  const {error} = await admin.storage.createBucket(nomeBucket, {
    public: false,
    fileSizeLimit: limiteArquivoBytes,
    allowedMimeTypes: ['application/json', 'application/gzip', 'image/webp'],
  })
  if (error) throw new Error(`Não foi possível criar o bucket privado: ${error.message}`)
}

function tipoMime(caminho) {
  if (caminho.endsWith('.json')) return 'application/json'
  if (caminho.endsWith('.gz')) return 'application/gzip'
  if (caminho.endsWith('.webp')) return 'image/webp'
  throw new Error(`Tipo de arquivo não permitido para publicação: ${caminho}`)
}

async function enviar(admin, caminho) {
  const seguro = caminhoSeguro(caminho)
  const bytes = await fs.readFile(path.join(pastaAcervo, seguro))
  if (bytes.length > limiteArquivoBytes) throw new Error(`O arquivo ${seguro} ultrapassa o limite de arquivo do Supabase Free.`)
  const {error} = await admin.storage.from(nomeBucket).upload(seguro, bytes, {
    contentType: tipoMime(seguro),
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw new Error(`${seguro}: ${error.message}`)
}

async function enviarEmLotes(admin, arquivos) {
  let proximo = 0
  let concluidos = 0
  const falhas = []
  const trabalhadores = Array.from({length: 4}, async () => {
    while (proximo < arquivos.length && falhas.length === 0) {
      const caminho = arquivos[proximo++]
      try {
        await enviar(admin, caminho)
        concluidos++
        if (concluidos % 100 === 0 || concluidos === arquivos.length) {
          console.log(`Arquivos publicados: ${concluidos}/${arquivos.length}`)
        }
      } catch (erro) {
        falhas.push(erro.message)
      }
    }
  })
  await Promise.all(trabalhadores)
  if (falhas.length) throw new Error(`Envio interrompido: ${falhas[0]}. Execute novamente após corrigir; os arquivos já enviados são atualizados com segurança.`)
}

try {
  if (!url) throw new Error('Configure VITE_SUPABASE_URL no .env.local ou SUPABASE_URL no ambiente.')
  validarChaveAdmin(chaveAdmin)
  const pacote = await prepararPacote()
  const quantidadeArquivos = pacote.arquivosLotes.length + pacote.paginasNecessarias.length + 2
  const bytesLotes = (await Promise.all(pacote.arquivosLotes.map(caminho => fs.stat(path.join(pastaAcervo, caminho))))).reduce((soma, arquivo) => soma + arquivo.size, 0)
  const bytesIndice = (await fs.stat(path.join(pastaAcervo, 'manifesto.json'))).size + Buffer.byteLength(JSON.stringify(pacote.visuaisStorage))
  console.log(`Preparado: ${pacote.totalQuestoes.toLocaleString('pt-BR')} questões em ${pacote.arquivosLotes.length} lotes, ${pacote.paginasNecessarias.length.toLocaleString('pt-BR')} páginas renderizadas e aproximadamente ${((bytesLotes + pacote.bytesImagens + bytesIndice) / 1048576).toFixed(1)} MiB.`)

  const admin = createClient(url, chaveAdmin, {auth: {autoRefreshToken: false, persistSession: false}})
  await garantirBucket(admin)
  const arquivos = [...pacote.arquivosLotes, ...pacote.paginasNecessarias]
  await enviarEmLotes(admin, arquivos)
  const {error: erroVisuais} = await admin.storage.from(nomeBucket).upload('visuais.json', Buffer.from(JSON.stringify(pacote.visuaisStorage)), {
    contentType: 'application/json',
    cacheControl: '3600',
    upsert: true,
  })
  if (erroVisuais) throw new Error(`visuais.json: ${erroVisuais.message}`)

  const manifestoPublicado = {
    ...pacote.manifesto,
    paginas_visuais_armazem: pacote.paginasNecessarias.length,
    modo_imagens: 'páginas sem PDF direto e de fontes ZIP são armazenadas; as demais usam o documento de origem',
  }
  const {error: erroManifesto} = await admin.storage.from(nomeBucket).upload('manifesto.json', Buffer.from(JSON.stringify(manifestoPublicado)), {
    contentType: 'application/json',
    cacheControl: '3600',
    upsert: true,
  })
  if (erroManifesto) throw new Error(`manifesto.json: ${erroManifesto.message}`)

  console.log(`Publicação concluída no bucket privado ${nomeBucket}. A política de leitura precisa estar aplicada pelo SQL Editor para contas autenticadas.`)
  console.log(`Total bruto exibido no app: ${(25495 + pacote.totalQuestoes).toLocaleString('pt-BR')} questões antes de deduplicação.`)
} catch (erro) {
  falhar(erro.message || 'Falha desconhecida ao publicar o acervo.')
}
