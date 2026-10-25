import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {pertenceAoFoco} from '../focoEstudo'
import {carregarManifestoAcervo} from '../acervoExtraidoManifesto'
import {API_URL, fetchApi} from '../api'
import {chaveCampoFiltro} from '../filtros'
import {supabase} from '../supabaseClient'

const base = `${import.meta.env.BASE_URL || '/'}acervo-extraido/`
const bucketExtraido = 'acervo-extraido'
const urlsAssinadasCache = new Map()
const chavePublicaSupabase = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const numero = valor => Number(valor || 0).toLocaleString('pt-BR')
const normalizar = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLocaleLowerCase('pt-BR')
const motivosConferencia = new Set(['possivel_corrupcao_de_caracteres', 'marcadores_de_questoes_vizinhas_na_transcricao', 'alternativas_incompletas_ou_atipicas'])
const precisaConferir = q => q.motivos_revisao?.some(motivo => motivosConferencia.has(motivo)) || false
const chaveClassificacao = id => `acervo-extraido-classificacao:${id}`

const comandoDiscursivo = /^\s*(?:\d+[.)-]\s*)?(?:explique|justifique|discorra|descreva|apresente|diferencie|defina|redija|elabore|argumente|comente|indique|mencione|demonstre|calcule|resolva|analise|compare|avalie|proponha|escreva|responda)\b/iu
const valorPontuado = /\[\s*valor\s*:\s*\d+(?:[,.]\d+)?\s*pontos?\s*\]/iu
const ehDiscursiva = q => [q.tipo_resposta, q.tipo_extraido].some(tipo => String(tipo || '').toLocaleLowerCase('pt-BR') === 'discursiva')
  || (comandoDiscursivo.test(String(q.enunciado || '')) && ((!Array.isArray(q.opcoes) || !q.opcoes.length) || valorPontuado.test(String(q.enunciado || ''))))


function lerClassificacao(chave) {
  try {
    const dados = JSON.parse(localStorage.getItem(chaveClassificacao(chave)) || '{}')
    return {materia: String(dados.materia || ''), assunto: String(dados.assunto || '')}
  } catch { return {materia: '', assunto: ''} }
}

function possuiRespostaLocal(q) {
  try {
    if (localStorage.getItem(`acervo-extraido:${q.id}`) !== null) return true
    return Boolean(localStorage.getItem(`acervo-extraido-texto:${q.id}`)?.trim())
  } catch { return false }
}

function emitirEvento(nome, detalhe) {
  window.dispatchEvent(new CustomEvent(nome, {detail: detalhe}))
}

async function lerLote(resposta, arquivo) {
  if (!resposta.ok) throw new Error('Não foi possível abrir esta edição.')
  if (!arquivo.endsWith('.gz')) return resposta.json()
  if (typeof DecompressionStream !== 'function') throw new Error('Este navegador não consegue abrir lotes compactados.')
  const compactado = await resposta.arrayBuffer()
  const stream = new Blob([compactado]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Response(stream).json()
}

function caminhoAcervoSeguro(valor) {
  const caminho = String(valor || '').replace(/^\/+/, '')
  if (!caminho || caminho.includes('\\') || caminho.split('/').some(parte => !parte || parte === '.' || parte === '..')) {
    throw new Error('O caminho do arquivo do acervo é inválido.')
  }
  return caminho
}

async function obterUrlAssinada(caminho) {
  const seguro = caminhoAcervoSeguro(caminho)
  const salvo = urlsAssinadasCache.get(seguro)
  if (salvo && salvo.expira > Date.now()) return salvo.url

  const urlsR2 = await obterUrlsR2([seguro]).catch(() => ({}))
  if (urlsR2[seguro]) {
    urlsAssinadasCache.set(seguro, {url: urlsR2[seguro], expira: Date.now() + 25 * 60 * 1000})
    return urlsR2[seguro]
  }

  return obterUrlSupabase(seguro)
}

async function obterUrlSupabase(seguro) {
  const {data, error} = await supabase.storage.from(bucketExtraido).createSignedUrl(seguro, 1800)
  if (error || !data?.signedUrl) throw new Error('Não foi possível autenticar o arquivo do acervo na nuvem.')
  urlsAssinadasCache.set(seguro, {url: data.signedUrl, expira: Date.now() + 25 * 60 * 1000})
  return data.signedUrl
}

async function obterUrlsR2(caminhos) {
  const {data: sessao, error: erroSessao} = await supabase.auth.getSession()
  const token = sessao?.session?.access_token
  if (erroSessao || !token || !chavePublicaSupabase || !caminhos.length) return {}

  const resposta = await fetchApi(`${API_URL}/api/acervo/r2/assinaturas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Supabase-Key': chavePublicaSupabase,
    },
    body: JSON.stringify({keys: caminhos}),
  })
  if (!resposta.ok) return {}
  const payload = await resposta.json()
  return payload?.urls && typeof payload.urls === 'object' ? payload.urls : {}
}

async function obterObjetoR2(caminho, opcoes = {}) {
  const {data: sessao, error: erroSessao} = await supabase.auth.getSession()
  const token = sessao?.session?.access_token
  if (erroSessao || !token || !chavePublicaSupabase) return null

  const resposta = await fetchApi(`${API_URL}/api/acervo/r2/objeto?key=${encodeURIComponent(caminho)}`, {
    ...opcoes,
    headers: {
      ...opcoes.headers,
      Authorization: `Bearer ${token}`,
      'X-Supabase-Key': chavePublicaSupabase,
    },
  })
  return resposta.ok ? resposta : null
}

async function buscarArquivoAcervo(caminho, opcoes = {}) {
  const seguro = caminhoAcervoSeguro(caminho)
  try {
    const respostaBackend = await obterObjetoR2(seguro, opcoes).catch(() => null)
    if (respostaBackend) return respostaBackend

    const url = await obterUrlAssinada(seguro)
    const resposta = await fetch(url, opcoes)
    if (resposta.ok) return resposta
    if (url.includes('.r2.cloudflarestorage.com')) {
      urlsAssinadasCache.delete(seguro)
      const respostaSupabase = await fetch(await obterUrlSupabase(seguro), opcoes)
      if (respostaSupabase.ok) return respostaSupabase
    }
  } catch (erro) {
    if (opcoes.signal?.aborted) throw erro
  }
  if (opcoes.signal?.aborted) throw new DOMException('Carregamento cancelado', 'AbortError')
  const local = await fetch(`${base}${seguro}`, opcoes)
  if (local.ok) return local
  throw new Error('O arquivo não está disponível no armazenamento em nuvem nem no pacote local.')
}

async function obterUrlsImagensAssinadas(caminhos) {
  const seguros = [...new Set(caminhos.map(caminhoAcervoSeguro))]
  const faltantes = seguros.filter(caminho => {
    const salvo = urlsAssinadasCache.get(caminho)
    return !salvo || salvo.expira <= Date.now()
  })
  if (faltantes.length) {
    const urlsProxy = await Promise.all(faltantes.map(async caminho => {
      try {
        const resposta = await obterObjetoR2(caminho)
        if (!resposta) return null
        return URL.createObjectURL(await resposta.blob())
      } catch { return null }
    }))
    faltantes.forEach((caminho, indice) => {
      if (urlsProxy[indice]) {
        const anterior = urlsAssinadasCache.get(caminho)?.url
        if (anterior?.startsWith('blob:')) URL.revokeObjectURL(anterior)
        urlsAssinadasCache.set(caminho, {url: urlsProxy[indice], expira: Date.now() + 25 * 60 * 1000})
      }
    })
    const aindaFaltantes = faltantes.filter(caminho => !urlsAssinadasCache.has(caminho))
    const urlsR2 = aindaFaltantes.length ? await obterUrlsR2(aindaFaltantes).catch(() => ({})) : {}
    Object.entries(urlsR2).forEach(([caminho, url]) => {
      if (url) urlsAssinadasCache.set(caminho, {url, expira: Date.now() + 25 * 60 * 1000})
    })
    const pendentesSupabase = faltantes.filter(caminho => !urlsAssinadasCache.has(caminho))
    if (pendentesSupabase.length) {
      const {data} = await supabase.storage.from(bucketExtraido).createSignedUrls(pendentesSupabase, 1800)
      if (Array.isArray(data)) data.forEach((item, indice) => {
        if (item?.signedUrl) urlsAssinadasCache.set(pendentesSupabase[indice], {url: item.signedUrl, expira: Date.now() + 25 * 60 * 1000})
      })
    }
  }
  return caminhos.map(caminho => urlsAssinadasCache.get(caminhoAcervoSeguro(caminho))?.url || null)
}

function lerRespostaLocal(chave) {
  try { return localStorage.getItem(chave) || '' } catch { return '' }
}

function limparTextoQuestao(valor) {
  let texto = String(valor ?? '').normalize('NFC').replace(/\r\n?/gu, '\n')
  const negacoesLogicas = []
  texto = texto.replace(/(^|[\s([{=,:;∧∨→↔])¬(?=[ \t]*[A-Za-z](?:_\d+)?\b|[ \t]*\()/gu, (trecho, prefixo) => {
    const indice = negacoesLogicas.push('¬') - 1
    return prefixo + '\u0001' + indice + '\u0001'
  })
  return texto
    .replace(/¬/gu, ' ')
    .replace(/\u0001(\d+)\u0001/gu, (_trecho, indice) => negacoesLogicas[Number(indice)] || '')
    .replace(/(?:^|\s)#{3,}(?=\s|$)/gu, ' ')
    .replace(/[ \t]{2,}/gu, ' ')
    .replace(/[ \t]+(?=\n)/gu, '')
    .replace(/\n[ \t]+/gu, '\n')
    .replace(/\n{3,}/gu, '\n\n')
    .trim()
}

function temCaractereIrrecuperavel(valor) {
  return /[\uFFFD\uE000-\uF8FF]/u.test(String(valor ?? ''))
}

function textoSeguroParaExibicao(valor) {
  const texto = limparTextoQuestao(valor)
  return temCaractereIrrecuperavel(texto) ? '' : texto
}

function CartaoQuestaoExtraida({questao: q, onEstadoResposta}) {
  const [resposta, setResposta] = useState(() => lerRespostaLocal('acervo-extraido:' + q.id))
  const [classificacao, setClassificacao] = useState(() => lerClassificacao(q.id))
  const imagens = useMemo(() => [...new Set(q.imagens_paginas?.length ? q.imagens_paginas : q.pagina_imagem ? [q.pagina_imagem] : [])], [q.imagens_paginas, q.pagina_imagem])
  const [urlsImagens, setUrlsImagens] = useState(null)
  const [carregandoImagens, setCarregandoImagens] = useState(false)
  const [erroImagens, setErroImagens] = useState(false)
  const textoCampos = [q.enunciado, q.texto_apoio, ...(q.opcoes || []), ...(q.transcricoes_ocr || []).map(item => item.texto)].join('\n')
  const precisaApoioVisual = precisaConferir(q) || q.motivos_revisao?.includes('verificar_imagem_ou_diagrama_no_pdf') || temCaractereIrrecuperavel(textoCampos)
  const enunciado = textoSeguroParaExibicao(q.enunciado)
  const textoApoio = textoSeguroParaExibicao(q.texto_apoio)
  const carregarImagens = useCallback(async () => {
    if (!imagens.length || urlsImagens || carregandoImagens) return
    setCarregandoImagens(true)
    try {
      const urls = await obterUrlsImagensAssinadas(imagens)
      if (urls.some(url => !url)) setErroImagens(true)
      setUrlsImagens(urls.map((url, indice) => url || base + imagens[indice]))
    } catch {
      setErroImagens(true)
      setUrlsImagens(imagens.map(imagem => base + imagem))
    } finally { setCarregandoImagens(false) }
  }, [carregandoImagens, imagens, urlsImagens])
  useEffect(() => {
    if (precisaApoioVisual) void carregarImagens()
  }, [carregarImagens, precisaApoioVisual])

  const marcarResposta = valor => {
    setResposta(valor)
    try { localStorage.setItem('acervo-extraido:' + q.id, valor) } catch { /* A resposta continua selecionada até sair da página. */ }
    onEstadoResposta?.(q.id, true)
  }
  const salvarClassificacao = evento => {
    evento.preventDefault()
    const dados = {materia: classificacao.materia.trim(), assunto: classificacao.assunto.trim()}
    setClassificacao(dados)
    try {
      if (dados.materia || dados.assunto) localStorage.setItem(chaveClassificacao(q.id), JSON.stringify(dados))
      else localStorage.removeItem(chaveClassificacao(q.id))
    } catch { /* A classificação permanece editável nesta sessão. */ }
    emitirEvento('acervo-extraido-classificacao', {id: q.id, classificacao: dados})
  }

  return <article className="question-card rounded-2xl p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">{q.banca} · {q.ano || 'ano não identificado'} · questão {q.numero_original}</p>
    </div>
    {precisaApoioVisual && <p role="note" className="mt-3 rounded-xl border border-cyan-400/25 bg-cyan-950/20 px-4 py-3 text-sm leading-6 text-cyan-100">A imagem desta questão está aberta para completar a leitura de símbolos, fórmulas e trechos com baixa legibilidade.</p>}
    {q.texto_apoio && <section aria-label="Texto de apoio" className="mt-4 rounded-xl border border-lime-300/20 bg-lime-950/15 p-4">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-sky-200">Texto de apoio</h3>
      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{textoApoio || 'Consulte o conteúdo visual desta questão.'}</p>
    </section>}
    {enunciado
      ? <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-100">{enunciado}</p>
      : <p role="note" className="mt-4 rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-sm leading-6 text-slate-300">Leia o enunciado no conteúdo visual desta questão.</p>}
    {q.opcoes?.length > 0 && <fieldset className="mt-4 space-y-2">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Marque sua resposta</legend>
      {q.opcoes.map((opcao, indice) => {
        const texto = textoSeguroParaExibicao(opcao)
        const rotulo = q.tipo_extraido === 'certo_errado' ? ['C', 'E'][indice] : String.fromCharCode(65 + indice)
        return <label key={q.id + '-' + indice} className={'question-choice flex cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-sm leading-6 transition ' + (resposta === String(indice) ? 'is-selected text-white' : 'text-slate-200')}>
          <input type="radio" name={'resposta-' + q.id} checked={resposta === String(indice)} onChange={() => marcarResposta(String(indice))} className="mt-1 accent-indigo-400" />
          <span className="shrink-0 font-bold text-indigo-300">{rotulo}.</span>
          <span className="whitespace-pre-wrap">{texto || 'Leia a alternativa ' + rotulo + ' no conteúdo visual da questão.'}</span>
        </label>
      })}
    </fieldset>}
    {q.opcoes?.length > 0 && <p className="mt-2 text-xs text-slate-400">Sua resposta fica salva neste dispositivo. Questões sem gabarito associado não recebem correção automática.</p>}
    {q.transcricoes_ocr?.length > 0 && <details className="mt-4 rounded-xl border border-slate-700 bg-slate-950/40 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-slate-300">Conteúdo complementar</summary>
      <div className="mt-3 space-y-4">{q.transcricoes_ocr.map(item => {
        const texto = textoSeguroParaExibicao(item.texto)
        return <section key={q.id + '-complemento-' + item.pagina}>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{texto || 'Consulte a imagem da questão para ler este trecho.'}</p>
        </section>
      })}</div>
    </details>}
    {imagens.length > 0 && <details open={precisaApoioVisual} onToggle={evento => { if (evento.currentTarget.open) void carregarImagens() }} className="mt-4 rounded-xl border border-indigo-400/25 bg-indigo-950/10 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-indigo-200">Ver imagem e elementos gráficos ({imagens.length})</summary>
      {carregandoImagens && <p role="status" className="mt-3 text-xs text-indigo-200">Carregando imagem…</p>}
      {erroImagens && <p role="note" className="mt-3 text-xs leading-5 text-amber-200">A imagem não carregou. O texto e as alternativas continuam disponíveis.</p>}
      <div className="mt-3 space-y-4">{imagens.map((imagem, indice) => <figure key={q.id + '-' + imagem}>
        <a href={urlsImagens?.[indice] || undefined} target="_blank" rel="noreferrer" className="block" aria-label="Ampliar imagem e elementos gráficos da questão">
          {urlsImagens?.[indice] && <img src={urlsImagens[indice]} alt="Imagem e elementos gráficos da questão" loading="lazy" onError={evento => { evento.currentTarget.hidden = true; evento.currentTarget.closest('figure')?.querySelector('[data-fallback]')?.classList.remove('hidden') }} className="mx-auto h-auto max-w-full rounded-lg bg-white" />}
        </a>
        <p data-fallback className="hidden mt-2 text-center text-xs text-amber-200">Imagem indisponível nesta edição.</p>
        <figcaption className="mt-1 text-center text-[11px] text-slate-500">Clique para ampliar</figcaption>
      </figure>)}</div>
    </details>}
    <details className="mt-4 rounded-xl border border-slate-700/80 bg-slate-950/30 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-slate-300">Classificação pessoal para meus filtros</summary>
      <form onSubmit={salvarClassificacao} className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-400">Disciplina
          <input value={classificacao.materia} onChange={evento => setClassificacao(atual => ({...atual, materia:evento.target.value}))} maxLength={80} placeholder="Ex.: Matemática" className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-normal text-slate-100 placeholder:text-slate-500" />
        </label>
        <label className="text-xs font-semibold text-slate-400">Assunto
          <input value={classificacao.assunto} onChange={evento => setClassificacao(atual => ({...atual, assunto:evento.target.value}))} maxLength={100} placeholder="Ex.: Funções" className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-normal text-slate-100 placeholder:text-slate-500" />
        </label>
        <p className="text-xs leading-5 text-slate-500 sm:col-span-2">Use rótulos pessoais para organizar suas buscas por disciplina e assunto.</p>
        <button type="submit" className="justify-self-start rounded-lg border border-lime-300/35 bg-lime-950/25 px-3 py-2 text-xs font-semibold text-lime-100 hover:bg-lime-900/40">Salvar classificação</button>
      </form>
    </details>
    <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
      <p className="text-xs text-slate-500">{q.concurso}</p>
      {q.fonte && <a className="shrink-0 rounded-xl border border-indigo-400/40 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/10" href={q.fonte} target="_blank" rel="noreferrer">Ver prova completa ↗</a>}
    </footer>
  </article>
}


export default function QuestoesExtraidas({
  manifesto,
  filtros = {},
  busca = '',
  situacao = 'todas',
  somenteComImagem = false,
  somenteComentadas = false,
  excluirIds = [],
  foco = 'todos',
  onEstado,
  onRegistrarMais,
}) {
  const [questoes, setQuestoes] = useState([])
  const [chaveQuestaoCarregada, setChaveQuestaoCarregada] = useState('')
  const [classificacoes, setClassificacoes] = useState(new Map())
  const [respostasLocais, setRespostasLocais] = useState({})
  const [limitePorLotes, setLimitePorLotes] = useState({chave: '', valor: 2})
  const [limiteQuestoes, setLimiteQuestoes] = useState({chave: '', valor: 30})
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(false)
  const cacheLotes = useRef(new Map())
  const requisicao = useRef(0)

  const bancasSelecionadas = filtros.banca || []
  const anosSelecionados = filtros.ano || []
  const materiasSelecionadas = filtros.materia || []
  const conteudosSelecionados = filtros.conteudo || []
  const dificuldadesSelecionadas = filtros.dificuldade || []
  const termo = busca.trim()
  const filtroExplicito = bancasSelecionadas.length > 0 || anosSelecionados.length > 0
  const chaveLotes = JSON.stringify([
    [...bancasSelecionadas].sort(),
    [...anosSelecionados].sort(),
    filtroExplicito ? '' : normalizar(termo),
    foco,
  ])
  const limite = limitePorLotes.chave === chaveLotes ? limitePorLotes.valor : 2

  const lotesCorrespondentes = useMemo(() => {
    if (!manifesto?.lotes) return []
    const termoMetadado = normalizar(termo)
    if (!filtroExplicito && termoMetadado.length < 2) return []
    return manifesto.lotes
      .filter(lote => {
        const anoLote = lote.ano ? String(lote.ano) : 'sem-ano'
        if (bancasSelecionadas.length && !bancasSelecionadas.includes(chaveCampoFiltro('banca', lote.banca))) return false
        if (anosSelecionados.length && !anosSelecionados.includes(anoLote)) return false
        if (!filtroExplicito && !normalizar(`${lote.banca} ${lote.concurso} ${anoLote}`).includes(termoMetadado)) return false
        return true
      })
      .sort((a, b) => Number(b.ano || 0) - Number(a.ano || 0)
        || String(a.banca || '').localeCompare(String(b.banca || ''), 'pt-BR')
        || String(a.concurso || '').localeCompare(String(b.concurso || ''), 'pt-BR'))
  }, [manifesto, bancasSelecionadas, anosSelecionados, filtroExplicito, termo])

  const lotesAlvo = useMemo(() => lotesCorrespondentes.slice(0, limite), [lotesCorrespondentes, limite])
  const questoesCarregadas = chaveQuestaoCarregada === chaveLotes ? questoes : []

  const carregarLote = useCallback(lote => {
    const chave = caminhoAcervoSeguro(lote.arquivo)
    if (!cacheLotes.current.has(chave)) {
      const promessa = buscarArquivoAcervo(chave, {signal: AbortSignal.timeout(90000)})
        .then(resposta => lerLote(resposta, chave))
        .then(dados => {
          if (!Array.isArray(dados) || dados.length !== lote.quantidade) throw new Error('O lote não corresponde ao índice do acervo.')
          return dados
        })
        .catch(falha => {
          cacheLotes.current.delete(chave)
          throw falha
        })
      cacheLotes.current.set(chave, promessa)
    }
    return cacheLotes.current.get(chave)
  }, [])

  useEffect(() => {
    const id = ++requisicao.current
    if (!manifesto) {
      setQuestoes([])
      setCarregando(true)
      setErro(false)
      return () => { requisicao.current++ }
    }
    if (!lotesAlvo.length) {
      setQuestoes([])
      setChaveQuestaoCarregada(chaveLotes)
      setCarregando(false)
      setErro(false)
      return () => { requisicao.current++ }
    }

    setCarregando(true)
    setErro(false)
    Promise.allSettled(lotesAlvo.map(carregarLote)).then(resultados => {
      if (id !== requisicao.current) return
      const carregadas = resultados.filter(item => item.status === 'fulfilled').flatMap(item => item.value)
      setQuestoes(carregadas)
      setChaveQuestaoCarregada(chaveLotes)
      setRespostasLocais(Object.fromEntries(carregadas.map(q => [q.id, possuiRespostaLocal(q)])))
      setClassificacoes(new Map(carregadas.map(q => [q.id, lerClassificacao(q.id)])))
      setErro(resultados.some(item => item.status === 'rejected'))
      setCarregando(false)
    })
    return () => { if (requisicao.current === id) requisicao.current++ }
  }, [manifesto, lotesAlvo, carregarLote])

  useEffect(() => {
    const aoClassificar = evento => {
      const {id, classificacao} = evento.detail || {}
      if (!id || !classificacao) return
      setClassificacoes(atual => new Map(atual).set(id, classificacao))
    }
    window.addEventListener('acervo-extraido-classificacao', aoClassificar)
    return () => window.removeEventListener('acervo-extraido-classificacao', aoClassificar)
  }, [])

  const filtradas = useMemo(() => {
    const buscaNormalizada = normalizar(termo)
    const excluidas = new Set(excluirIds.map(String))
    return questoesCarregadas.filter(q => {
      if (ehDiscursiva(q)) return false
      const classificacao = classificacoes.get(q.id) || lerClassificacao(q.id)
      const banca = chaveCampoFiltro('banca', q.banca || '')
      const ano = q.ano ? String(q.ano) : 'sem-ano'
      if (excluidas.has(String(q.id))) return false
      if (bancasSelecionadas.length && !bancasSelecionadas.includes(banca)) return false
      if (anosSelecionados.length && !anosSelecionados.includes(ano)) return false
      const materia = chaveCampoFiltro('materia', classificacao.materia || q.materia || '')
      const conteudo = normalizar(classificacao.assunto || q.conteudo || '')
      const dificuldade = chaveCampoFiltro('dificuldade', q.dificuldade || '')
      if (materiasSelecionadas.length && !materiasSelecionadas.includes(materia)) return false
      if (conteudosSelecionados.length && !conteudosSelecionados.some(valor => normalizar(valor) === conteudo)) return false
      if (dificuldadesSelecionadas.length && !dificuldadesSelecionadas.includes(dificuldade)) return false
      if (foco && foco !== 'todos' && !pertenceAoFoco(q, foco, true)) return false
      if (somenteComImagem && !(q.imagens_paginas?.length || q.pagina_imagem)) return false
      if (somenteComentadas && ![q.explicacao, q.resolucao, q.resposta_comentada, q.comentario].some(valor => typeof valor === 'string' && valor.trim())) return false
      const respondida = Boolean(respostasLocais[q.id])
      if (situacao === 'resolvidas' && !respondida) return false
      if (situacao === 'nao-resolvidas' && respondida) return false
      if (['acertadas', 'erradas', 'favoritas'].includes(situacao)) return false
      if (!buscaNormalizada) return true
      return normalizar([
        q.id, q.numero_original, q.banca, q.ano, q.concurso, q.materia, q.conteudo,
        q.enunciado, q.texto_apoio, ...(q.transcricoes_ocr || []).map(item => item.texto), ...(q.opcoes || []),
      ].map(limparTextoQuestao).join(' ')).includes(buscaNormalizada)
    })
  }, [
    busca, bancasSelecionadas, anosSelecionados, materiasSelecionadas, conteudosSelecionados,
    dificuldadesSelecionadas, questoesCarregadas, classificacoes, respostasLocais, situacao,
    somenteComImagem, somenteComentadas, excluirIds, foco,
  ])

  const limiteAtualQuestoes = limiteQuestoes.chave === chaveLotes ? limiteQuestoes.valor : 30
  const questoesVisiveis = filtradas.slice(0, limiteAtualQuestoes)
  const maisLotes = lotesCorrespondentes.length > lotesAlvo.length
  const mais = limiteAtualQuestoes < filtradas.length || maisLotes

  useEffect(() => {
    onEstado?.({total: filtradas.length, carregando, mais})
  }, [onEstado, filtradas.length, carregando, mais])

  useEffect(() => {
    if (!onRegistrarMais) return undefined
    onRegistrarMais(() => {
      setLimiteQuestoes(atual => ({
        chave: chaveLotes,
        valor: (atual.chave === chaveLotes ? atual.valor : 30) + 30,
      }))
      setLimitePorLotes(atual => {
        const limiteAtual = atual.chave === chaveLotes ? atual.valor : 2
        return maisLotes ? {chave: chaveLotes, valor: limiteAtual + 2} : atual
      })
    })
    return () => onRegistrarMais(null)
  }, [onRegistrarMais, chaveLotes, maisLotes])

  const atualizarRespostaLocal = (id, respondida) => {
    setRespostasLocais(atual => ({...atual, [id]: respondida}))
  }

  return <>
    {carregando && <p role="status" className="rounded-xl px-1 py-2 text-sm text-slate-400">Carregando mais questões para esta busca…</p>}
    {erro && <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">Algumas questões não foram carregadas. Tente novamente ajustando os filtros.</p>}
    {questoesVisiveis.map(q => <CartaoQuestaoExtraida key={q.id} questao={q} onEstadoResposta={atualizarRespostaLocal} />)}
  </>
}

