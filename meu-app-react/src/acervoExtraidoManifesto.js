import {API_URL, fetchApi} from './api'
import {supabase} from './supabaseClient'

const bucket = 'acervo-extraido'
const base = `${import.meta.env.BASE_URL || '/'}acervo-extraido/`
const chavePublicaSupabase = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
let manifestoCache = null
let manifestoPendente = null
let classificacaoPrincipalPendente = null

async function buscarManifesto() {
  const signal = AbortSignal.timeout(30000)
  let token = ''
  try {
    const {data} = await supabase.auth.getSession()
    token = data?.session?.access_token || ''
  } catch { /* A assinatura do Storage pode funcionar sem a sessão local. */ }

  if (token && chavePublicaSupabase) {
    try {
      const resposta = await fetchApi(`${API_URL}/api/acervo/r2/objeto?key=manifesto.json&v=${Date.now()}`, {
        headers: {Authorization: `Bearer ${token}`, 'X-Supabase-Key': chavePublicaSupabase},
        signal,
      })
      if (resposta.ok) return resposta.json()
    } catch { /* Tenta o Storage do Supabase e o pacote local em seguida. */ }
  }

  try {
    const {data, error} = await supabase.storage.from(bucket).createSignedUrl('manifesto.json', 1800)
    if (!error && data?.signedUrl) {
      const resposta = await fetch(data.signedUrl, {signal})
      if (resposta.ok) return resposta.json()
    }
  } catch { /* Tenta o pacote local em seguida. */ }

  const respostaLocal = await fetch(`${base}manifesto.json`, {signal})
  if (respostaLocal.ok) return respostaLocal.json()
  throw new Error('Não foi possível carregar a contagem completa de questões.')
}

export function carregarManifestoAcervo() {
  if (manifestoCache) return Promise.resolve(manifestoCache)
  if (!manifestoPendente) {
    manifestoPendente = buscarManifesto()
      .then(async dados => {
        if(dados.indice_facetas){
          const facetas=await lerIndiceCompactado(dados.indice_facetas)
          if(facetas?.versao!==1||!Array.isArray(facetas.linhas)||!Array.isArray(facetas.dicionarios))throw Error('Índice de filtros inválido')
          dados={...dados,facetas}
        }
        manifestoCache = dados; return dados
      })
      .catch(erro => { manifestoPendente = null; throw erro })
  }
  return manifestoPendente
}

async function lerIndiceCompactado(indice){
  const caminho=String(indice.arquivo||'')
  if(!/^lotes\/[a-zA-Z0-9_-]+\.json\.gz$/u.test(caminho))throw Error('Índice de classificação inválido')
  const {data}=await supabase.auth.getSession(),token=data.session?.access_token
  let resposta
  if(token)resposta=await fetchApi(`${API_URL}/api/acervo/r2/objeto?key=${encodeURIComponent(caminho)}`,{headers:{Authorization:`Bearer ${token}`,'X-Supabase-Key':chavePublicaSupabase},signal:AbortSignal.timeout(30000)}).catch(()=>null)
  if(!resposta?.ok){
    const {data:url}=await supabase.storage.from(bucket).createSignedUrl(caminho,1800)
    if(url?.signedUrl)resposta=await fetch(url.signedUrl,{signal:AbortSignal.timeout(30000)}).catch(()=>null)
  }
  if(!resposta?.ok)resposta=await fetch(`${base}${caminho}`,{signal:AbortSignal.timeout(30000)})
  if(!resposta.ok)throw Error('Classificação complementar indisponível')
  const bytes=await resposta.arrayBuffer()
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('')
  if(hash!==indice.sha256)throw Error('A classificação não passou pela verificação de integridade')
  return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json()
}

export function carregarClassificacaoPrincipal() {
  if(!classificacaoPrincipalPendente)classificacaoPrincipalPendente=(async()=>{
    const manifesto=await carregarManifestoAcervo(),indice=manifesto.classificacao_principal
    if(!indice)return new Map()
    const dados=await lerIndiceCompactado(indice)
    if(!Array.isArray(dados)||dados.length!==indice.quantidade)throw Error('Classificação incompleta')
    const campos=['banca','banca_original','concurso','concurso_original','aplicacao','organizadora','ano','materia','conteudo','integridade_profissional']
    return new Map(dados.map(q=>[String(q.id),Object.fromEntries(campos.filter(c=>Object.hasOwn(q,c)).map(c=>[c,q[c]]))]))
  })().catch(erro=>{classificacaoPrincipalPendente=null;throw erro})
  return classificacaoPrincipalPendente
}
