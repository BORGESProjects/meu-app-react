import {API_URL} from './api'
import {supabase} from './supabaseClient'

const bucket = 'acervo-extraido'
const base = `${import.meta.env.BASE_URL || '/'}acervo-extraido/`
const chavePublicaSupabase = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
let manifestoCache = null
let manifestoPendente = null

async function buscarManifesto() {
  const signal = AbortSignal.timeout(30000)
  let token = ''
  try {
    const {data} = await supabase.auth.getSession()
    token = data?.session?.access_token || ''
  } catch { /* A assinatura do Storage pode funcionar sem a sessão local. */ }

  if (token && chavePublicaSupabase) {
    try {
      const resposta = await fetch(`${API_URL}/api/acervo/r2/objeto?key=manifesto.json`, {
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
      .then(dados => { manifestoCache = dados; return dados })
      .catch(erro => { manifestoPendente = null; throw erro })
  }
  return manifestoPendente
}
