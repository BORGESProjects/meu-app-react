import catalogo from './data/provasCompletas.json' with { type: 'json' }
import { API_URL, fetchApi } from './api'
import { supabase } from './supabaseClient'

const bucket = 'acervo-extraido'
const base = `${import.meta.env.BASE_URL || '/'}acervo-extraido/`
const chavePublicaSupabase = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const cache = new Map()

function normalizar(valor) {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLocaleUpperCase('pt-BR').replace(/[^A-Z0-9]/gu, '')
}

function lotePodeConterProva(lote, provasComIdsAusentes) {
  const bancaLote = normalizar(lote.banca)
  const concursoLote = normalizar(lote.concurso)
  return provasComIdsAusentes.some(prova => {
    if (String(prova.ano) !== String(lote.ano)) return false
    const banca = normalizar(prova.banca)
    if (banca === 'ENEM') return bancaLote === 'ENEM' || (bancaLote === 'INEP' && concursoLote.includes('ENEM'))
    if (banca === 'FUVEST' || banca === 'USP') return bancaLote === 'FUVEST' || bancaLote === 'USP'
    if (banca === 'ESA' || banca === 'ESSA') return bancaLote === 'ESA' || bancaLote === 'ESSA'
    return bancaLote === banca
  })
}

function caminhoSeguro(valor) {
  const caminho = String(valor || '').replace(/^\/+/, '')
  if (!caminho || caminho.includes('\\') || caminho.split('/').some(parte => !parte || parte === '.' || parte === '..')) throw new Error('Caminho de lote inválido')
  return caminho
}

async function buscarLote(arquivo, manifesto, signal) {
  const caminho = caminhoSeguro(arquivo)
  const cacheKey = `${manifesto.gerado_em || 'atual'}:${caminho}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const promessa = (async () => {
    const { data: sessao } = await supabase.auth.getSession().catch(() => ({ data: null }))
    const token = sessao?.session?.access_token
    let resposta = null

    if (token && chavePublicaSupabase) {
      resposta = await fetchApi(`${API_URL}/api/acervo/r2/objeto?key=${encodeURIComponent(caminho)}&v=${encodeURIComponent(manifesto.gerado_em || 'atual')}`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Supabase-Key': chavePublicaSupabase }, signal,
      }).catch(() => null)
    }
    if (!resposta?.ok) {
      const { data: url } = await supabase.storage.from(bucket).createSignedUrl(caminho, 1800).catch(() => ({ data: null }))
      if (url?.signedUrl) resposta = await fetch(url.signedUrl, { signal }).catch(() => null)
    }
    if (!resposta?.ok) resposta = await fetch(`${base}${caminho}`, { signal })
    if (!resposta.ok) throw new Error(`Lote indisponível: ${caminho}`)

    if (!caminho.endsWith('.gz')) return resposta.json()
    if (typeof DecompressionStream !== 'function') throw new Error('Este navegador não consegue abrir os lotes compactados')
    const corpo = await resposta.arrayBuffer()
    return new Response(new Blob([corpo]).stream().pipeThrough(new DecompressionStream('gzip'))).json()
  })()

  cache.set(cacheKey, promessa)
  try { return await promessa }
  catch (erro) { cache.delete(cacheKey); throw erro }
}

/** Carrega do acervo remoto somente os IDs já auditados no catálogo de simulados. */
export async function carregarQuestoesParaSimulados(manifesto, questoesJaCarregadas = [], signal) {
  if (!manifesto?.lotes?.length) return { questoes: [], falhas: 0 }
  const idsExistentes = new Set(questoesJaCarregadas.map(questao => String(questao.id)))
  const ids = new Set(catalogo.flatMap(prova => prova.itens.map(([id]) => String(id))).filter(id => !idsExistentes.has(id)))
  if (!ids.size) return { questoes: [], falhas: 0 }
  const provasComIdsAusentes = catalogo.filter(prova => prova.itens.some(([id]) => ids.has(String(id))))
  const lotes = manifesto.lotes.filter(lote => lotePodeConterProva(lote, provasComIdsAusentes))
  const resultados = []
  for (let inicio = 0; inicio < lotes.length; inicio += 6) {
    if (signal?.aborted) throw new DOMException('Carregamento cancelado', 'AbortError')
    resultados.push(...await Promise.allSettled(lotes.slice(inicio, inicio + 6).map(async lote => {
      const dados = await buscarLote(lote.arquivo, manifesto, signal)
      if (!Array.isArray(dados) || dados.length !== Number(lote.quantidade)) throw new Error(`Lote incompatível: ${lote.arquivo}`)
      return dados.filter(questao => ids.has(String(questao.id)))
    })))
  }
  const questoes = resultados.filter(item => item.status === 'fulfilled').flatMap(item => item.value)
  return { questoes, falhas: resultados.filter(item => item.status === 'rejected').length }
}
