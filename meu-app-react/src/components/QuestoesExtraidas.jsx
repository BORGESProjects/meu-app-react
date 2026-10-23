import {useCallback, useEffect, useMemo, useState} from 'react'
import {API_URL} from '../api'
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

  const resposta = await fetch(`${API_URL}/api/acervo/r2/assinaturas`, {
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

async function buscarArquivoAcervo(caminho, opcoes = {}) {
  const seguro = caminhoAcervoSeguro(caminho)
  try {
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
    const urlsR2 = await obterUrlsR2(faltantes).catch(() => ({}))
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

function CartaoQuestaoExtraida({questao: q, onEstadoResposta}) {
  const [resposta, setResposta] = useState(() => lerRespostaLocal(`acervo-extraido:${q.id}`))
  const [rascunho, setRascunho] = useState(() => lerRespostaLocal(`acervo-extraido-texto:${q.id}`))
  const [classificacao, setClassificacao] = useState(() => lerClassificacao(q.id))
  const imagens = useMemo(() => [...new Set(q.imagens_paginas?.length ? q.imagens_paginas : q.pagina_imagem ? [q.pagina_imagem] : [])], [q.imagens_paginas, q.pagina_imagem])
  const [urlsImagens, setUrlsImagens] = useState(null)
  const [carregandoImagens, setCarregandoImagens] = useState(false)
  const [erroImagens, setErroImagens] = useState(false)
  const precisaConferirOriginal = precisaConferir(q)
  const carregarImagens = useCallback(async () => {
    if (!imagens.length || urlsImagens || carregandoImagens) return
    setCarregandoImagens(true)
    try {
      const urls = await obterUrlsImagensAssinadas(imagens)
      if (urls.some(url => !url)) setErroImagens(true)
      setUrlsImagens(urls.map((url, indice) => url || `${base}${imagens[indice]}`))
    } catch {
      setErroImagens(true)
      setUrlsImagens(imagens.map(imagem => `${base}${imagem}`))
    } finally { setCarregandoImagens(false) }
  }, [carregandoImagens, imagens, urlsImagens])
  useEffect(() => {
    if (precisaConferirOriginal) void carregarImagens()
  }, [carregarImagens, precisaConferirOriginal])
  const marcarResposta = valor => {
    setResposta(valor)
    try { localStorage.setItem(`acervo-extraido:${q.id}`, valor) } catch { /* A resposta continua selecionada até sair da página. */ }
    onEstadoResposta?.(q.id, true)
  }
  const salvarRascunho = valor => {
    const estavaRespondida = Boolean(rascunho.trim())
    setRascunho(valor)
    try { localStorage.setItem(`acervo-extraido-texto:${q.id}`, valor) } catch { /* O campo continua editável nesta sessão. */ }
    if (estavaRespondida !== Boolean(valor.trim())) onEstadoResposta?.(q.id, Boolean(valor.trim()))
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
      <div className="flex flex-wrap gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] ${precisaConferirOriginal ? 'border-amber-400/40 bg-amber-950/30 text-amber-100' : 'border-lime-300/25 bg-lime-950/20 text-lime-100'}`}>{precisaConferirOriginal ? 'Conferir transcrição' : 'Estrutura sem alerta'}</span>
        <span className="rounded-full border border-slate-600/70 px-2.5 py-1 text-[11px] text-slate-300">Gabarito não conferido</span>
      </div>
    </div>
    {precisaConferirOriginal && <p role="note" className="mt-4 rounded-xl border border-amber-400/35 bg-amber-950/25 px-4 py-3 text-sm leading-6 text-amber-100">Esta transcrição tem um alerta de extração. A página original está aberta abaixo; use-a para ler enunciado, alternativas, textos-base e elementos visuais antes de responder.</p>}
    {precisaConferirOriginal && imagens.length > 0 && <details open onToggle={evento => { if (evento.currentTarget.open) void carregarImagens() }} className="mt-4 rounded-xl border border-amber-300/30 bg-amber-950/10 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-amber-100">Página original para conferência · textos, gráficos e imagens ({imagens.length})</summary>
      {carregandoImagens && <p role="status" className="mt-3 text-xs text-amber-200">Buscando as páginas originais no armazenamento…</p>}
      {erroImagens && <p role="note" className="mt-3 text-xs leading-5 text-amber-200">Esta página não está armazenada como imagem individual. Se houver um PDF ou pacote de origem, use o link no fim da questão.</p>}
      <div className="mt-3 space-y-4">{imagens.map((imagem, indice) => <figure key={`${q.id}-${imagem}`}>
        <a href={urlsImagens?.[indice] || undefined} target="_blank" rel="noreferrer" className="block" aria-label={`Ampliar a página ${q.paginas_origem?.[indice] || q.pagina} da prova`}>
          {urlsImagens?.[indice] && <img src={urlsImagens[indice]} alt={`Página ${q.paginas_origem?.[indice] || q.pagina} do caderno original, incluindo textos-base, diagramas e imagens`} loading="lazy" onError={evento => { evento.currentTarget.hidden = true; evento.currentTarget.closest('figure')?.querySelector('[data-fallback]')?.classList.remove('hidden') }} className="mx-auto h-auto max-w-full rounded-lg bg-white" />}
        </a>
        <p data-fallback className="hidden mt-2 text-center text-xs text-amber-200">A imagem local desta página não está disponível. Use o PDF original no link abaixo.</p>
        <figcaption className="mt-1 text-center text-[11px] text-slate-500">Página {q.paginas_origem?.[indice] || q.pagina} · clique para ampliar</figcaption>
      </figure>)}</div>
    </details>}
    {!precisaConferirOriginal && q.texto_apoio && <section aria-label="Texto-base ou contexto da página" className="mt-4 rounded-xl border border-lime-300/20 bg-lime-950/15 p-4">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-sky-200">Texto-base ou contexto antes da questão</h3>
      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{q.texto_apoio}</p>
    </section>}
    {!precisaConferirOriginal && <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-100">{q.enunciado}</p>}
    {precisaConferirOriginal && <details className="mt-4 rounded-xl border border-slate-700 bg-slate-950/40 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-slate-300">Ver transcrição automática sem revisão</summary>
      {q.texto_apoio && <section className="mt-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3"><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Possível texto-base</h3><p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{q.texto_apoio}</p></section>}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{q.enunciado}</p>
      {q.transcricoes_ocr?.length > 0 && <div className="mt-3 space-y-3">{q.transcricoes_ocr.map(item => <section key={`${q.id}-ocr-review-${item.pagina}`} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3"><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">OCR complementar · página {item.pagina}</h3><p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{item.texto}</p></section>)}</div>}
    </details>}
    {q.opcoes?.length > 0 && !precisaConferirOriginal && <fieldset className="mt-4 space-y-2">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Marque sua resposta</legend>
      {q.opcoes.map((opcao, indice) => <label key={`${q.id}-${indice}`} className={`question-choice flex cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-sm leading-6 transition ${resposta === String(indice) ? 'is-selected text-white' : 'text-slate-200'}`}>
        <input type="radio" name={`resposta-${q.id}`} checked={resposta === String(indice)} onChange={() => marcarResposta(String(indice))} className="mt-1 accent-indigo-400" />
        <span className="shrink-0 font-bold text-indigo-300">{q.tipo_extraido === 'certo_errado' ? ['C', 'E'][indice] : String.fromCharCode(65 + indice)}.</span>
        <span className="whitespace-pre-wrap">{opcao}</span>
      </label>)}
    </fieldset>}
    {(q.tipo_extraido === 'discursiva' || precisaConferirOriginal) && <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-400">Sua resposta
      <textarea value={rascunho} onChange={evento => salvarRascunho(evento.target.value)} rows={6} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case leading-6 text-slate-100 placeholder:text-slate-500" placeholder={precisaConferirOriginal ? 'Consulte a página original e registre sua resposta. Ela fica salva neste dispositivo.' : 'Escreva sua resolução. Ela fica salva neste dispositivo.'} />
    </label>}
    {q.opcoes?.length > 0 && <p className="mt-2 text-xs text-slate-400">Sua marcação fica salva neste dispositivo. Ela não recebe nota porque o gabarito ainda não foi conferido.</p>}
    {!precisaConferirOriginal && q.transcricoes_ocr?.length > 0 && <details className="mt-4 rounded-xl border border-slate-700 bg-slate-950/40 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-slate-300">Transcrição OCR complementar da página</summary>
      <div className="mt-3 space-y-4">{q.transcricoes_ocr.map(item => <section key={`${q.id}-ocr-${item.pagina}`}>
        <h3 className="mb-1 text-xs text-slate-400">Página {item.pagina} · reconhecimento automático</h3>
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{item.texto}</p>
      </section>)}</div>
    </details>}
    {!precisaConferirOriginal && imagens.length > 0 && <details onToggle={evento => { if (evento.currentTarget.open) void carregarImagens() }} className="mt-4 rounded-xl border border-indigo-400/25 bg-indigo-950/10 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-indigo-200">Ver página original com textos, gráficos e imagens ({imagens.length})</summary>
      {carregandoImagens && <p role="status" className="mt-3 text-xs text-indigo-200">Buscando as páginas originais no armazenamento…</p>}
      {erroImagens && <p role="note" className="mt-3 text-xs leading-5 text-amber-200">Esta página não está armazenada como imagem individual. Se houver um PDF ou pacote de origem, use o link no fim da questão.</p>}
      <div className="mt-3 space-y-4">{imagens.map((imagem, indice) => <figure key={`${q.id}-${imagem}`}>
        <a href={urlsImagens?.[indice] || undefined} target="_blank" rel="noreferrer" className="block" aria-label={`Ampliar a página ${q.paginas_origem?.[indice] || q.pagina} da prova`}>
          {urlsImagens?.[indice] && <img src={urlsImagens[indice]} alt={`Página ${q.paginas_origem?.[indice] || q.pagina} do caderno original, incluindo textos-base, diagramas e imagens`} loading="lazy" onError={evento => { evento.currentTarget.hidden = true; evento.currentTarget.closest('figure')?.querySelector('[data-fallback]')?.classList.remove('hidden') }} className="mx-auto h-auto max-w-full rounded-lg bg-white" />}
        </a>
        <p data-fallback className="hidden mt-2 text-center text-xs text-amber-200">A imagem local desta página não está disponível. Use o PDF original no link abaixo.</p>
        <figcaption className="mt-1 text-center text-[11px] text-slate-500">Página {q.paginas_origem?.[indice] || q.pagina} · clique para ampliar</figcaption>
      </figure>)}</div>
    </details>}
    {q.tipo_extraido === 'discursiva' && <p className="mt-3 text-xs text-slate-400">Questão discursiva · use o campo de resposta e consulte a página original para fórmulas, figuras e critérios.</p>}
    <details className="mt-4 rounded-xl border border-slate-700/80 bg-slate-950/30 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-slate-300">Classificação pessoal para meus filtros</summary>
      <form onSubmit={salvarClassificacao} className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-400">Disciplina
          <input value={classificacao.materia} onChange={evento => setClassificacao(atual => ({...atual, materia:evento.target.value}))} maxLength={80} placeholder="Ex.: Matemática" className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-normal text-slate-100 placeholder:text-slate-500" />
        </label>
        <label className="text-xs font-semibold text-slate-400">Assunto
          <input value={classificacao.assunto} onChange={evento => setClassificacao(atual => ({...atual, assunto:evento.target.value}))} maxLength={100} placeholder="Ex.: Funções" className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-normal text-slate-100 placeholder:text-slate-500" />
        </label>
        <p className="text-xs leading-5 text-slate-500 sm:col-span-2">Esses rótulos ficam neste dispositivo e alimentam os filtros de disciplina e assunto. O PDF não traz classificação temática estruturada.</p>
        <button type="submit" className="justify-self-start rounded-lg border border-lime-300/35 bg-lime-950/25 px-3 py-2 text-xs font-semibold text-lime-100 hover:bg-lime-900/40">Salvar classificação</button>
      </form>
    </details>
    <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
      <p className="text-xs text-slate-500">{q.concurso}{q.documento_origem ? ` · ${q.documento_origem}` : ''}{q.pagina ? ` · página ${q.pagina}` : ''}</p>
      {q.fonte ? <a className="shrink-0 rounded-xl border border-indigo-400/40 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/10" href={`${q.fonte}#page=${q.pagina || 1}`} target="_blank" rel="noreferrer">{/\.zip(?:[?#]|$)/iu.test(q.fonte) ? 'Abrir pacote de origem ↗' : 'Abrir no PDF original ↗'}</a> : <span className="text-xs text-slate-500">Link externo não identificado · página renderizada acima</span>}
    </footer>
  </article>
}

export default function QuestoesExtraidas({aoAbrirAcervo, questoesBanco = 0}) {
  const [manifesto, setManifesto] = useState(null)
  const [visuais, setVisuais] = useState(null)
  const [banca, setBanca] = useState('')
  const [ano, setAno] = useState('')
  const [concurso, setConcurso] = useState('')
  const [busca, setBusca] = useState('')
  const [tipoQuestao, setTipoQuestao] = useState('')
  const [estadoTranscricao, setEstadoTranscricao] = useState('')
  const [estadoEstudo, setEstadoEstudo] = useState('')
  const [materiaPessoal, setMateriaPessoal] = useState('')
  const [assuntoPessoal, setAssuntoPessoal] = useState('')
  const [questoes, setQuestoes] = useState([])
  const [classificacoes, setClassificacoes] = useState(new Map())
  const [respostasLocais, setRespostasLocais] = useState({})
  const [arquivoCarregado, setArquivoCarregado] = useState('')
  const [arquivoFalhou, setArquivoFalhou] = useState('')
  const [carregandoIndice, setCarregandoIndice] = useState(true)
  const [erroIndice, setErroIndice] = useState('')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    let ativo = true
    buscarArquivoAcervo('manifesto.json', {signal: AbortSignal.timeout(30000)})
      .then(resposta => { if (!resposta.ok) throw new Error('O índice das questões extraídas não está disponível.'); return resposta.json() })
      .then(dados => { if (ativo) { setManifesto(dados); setCarregandoIndice(false) } })
      .catch(() => { if (ativo) { setErroIndice('Não foi possível carregar o índice do acervo extraído.'); setCarregandoIndice(false) } })
    return () => { ativo = false }
  }, [])

  useEffect(() => {
    buscarArquivoAcervo('visuais.json', {signal: AbortSignal.timeout(30000)})
      .then(resposta => resposta.ok ? resposta.json() : null)
      .then(dados => { if (dados) setVisuais(dados) })
      .catch(() => {})
  }, [])

  const bancas = useMemo(() => [...new Set((manifesto?.lotes || []).map(lote => lote.banca))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [manifesto])
  const lotesDaBanca = useMemo(() => (manifesto?.lotes || []).filter(lote => !banca || lote.banca === banca), [banca, manifesto])
  const anos = useMemo(() => [...new Set(lotesDaBanca.map(lote => lote.ano ? String(lote.ano) : 'sem-ano'))]
    .sort((a, b) => a === 'sem-ano' ? 1 : b === 'sem-ano' ? -1 : Number(b) - Number(a)), [lotesDaBanca])
  const concursos = useMemo(() => lotesDaBanca.filter(lote => ano && (lote.ano ? String(lote.ano) : 'sem-ano') === ano)
    .map(lote => lote.concurso).sort((a, b) => a.localeCompare(b, 'pt-BR')), [ano, lotesDaBanca])
  const lote = useMemo(() => lotesDaBanca.find(item => ano && concurso && (item.ano ? String(item.ano) : 'sem-ano') === ano && item.concurso === concurso), [ano, concurso, lotesDaBanca])

  useEffect(() => {
    const aoClassificar = evento => {
      const {id, classificacao} = evento.detail || {}
      if (!id || !classificacao) return
      setClassificacoes(atual => new Map(atual).set(id, classificacao))
    }
    window.addEventListener('acervo-extraido-classificacao', aoClassificar)
    return () => window.removeEventListener('acervo-extraido-classificacao', aoClassificar)
  }, [])

  const materiasPessoais = useMemo(() => [...new Set([...classificacoes.values()].map(item => item.materia.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [classificacoes])
  const assuntosPessoais = useMemo(() => [...new Set([...classificacoes.values()].map(item => item.assunto.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [classificacoes])
  const tiposQuestao = useMemo(() => [...new Set(questoes.map(q => q.tipo_extraido).filter(Boolean))].sort(), [questoes])

  useEffect(() => {
    let ativo = true
    if (!lote) return () => { ativo = false }
    buscarArquivoAcervo(lote.arquivo, {signal: AbortSignal.timeout(90000)})
      .then(resposta => lerLote(resposta, lote.arquivo))
      .then(dados => {
        if (!Array.isArray(dados) || dados.length !== lote.quantidade) throw new Error('O lote não corresponde ao índice do acervo.')
        if (ativo) {
          setQuestoes(dados)
          setRespostasLocais(Object.fromEntries(dados.map(q => [q.id, possuiRespostaLocal(q)])))
          setClassificacoes(new Map(dados.map(q => [q.id, lerClassificacao(q.id)])))
          setArquivoCarregado(lote.arquivo)
        }
      })
      .catch(() => { if (ativo) setArquivoFalhou(lote.arquivo) })
    return () => { ativo = false }
  }, [lote])

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim())
    return questoes.filter(q => {
      const classificacao = classificacoes.get(q.id) || {materia:'', assunto:''}
      if (tipoQuestao && q.tipo_extraido !== tipoQuestao) return false
      if (estadoTranscricao === 'revisar' && !precisaConferir(q)) return false
      if (estadoTranscricao === 'sem-alerta' && precisaConferir(q)) return false
      if (estadoEstudo === 'respondidas' && !respostasLocais[q.id]) return false
      if (estadoEstudo === 'pendentes' && respostasLocais[q.id]) return false
      if (materiaPessoal && classificacao.materia !== materiaPessoal) return false
      if (assuntoPessoal && classificacao.assunto !== assuntoPessoal) return false
      if (!termo) return true
      return normalizar([q.numero_original, q.concurso, q.enunciado, q.texto_apoio, ...(q.transcricoes_ocr || []).map(item => item.texto), ...(q.opcoes || [])].join(' ')).includes(termo)
    })
  }, [assuntoPessoal, busca, classificacoes, estadoEstudo, estadoTranscricao, materiaPessoal, questoes, respostasLocais, tipoQuestao])
  const porPagina = 30
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina))
  const visiveis = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina)
  const alertaContagem = useMemo(() => questoes.filter(precisaConferir).length, [questoes])
  const totalBruto = Number(questoesBanco || 0) + Number(manifesto?.questoes_extraidas_unicas || 0)
  const edicaoPronta = Boolean(lote && arquivoCarregado === lote.arquivo)
  const carregandoEdicao = Boolean(lote && !edicaoPronta && arquivoFalhou !== lote.arquivo)
  const erroLote = Boolean(lote && arquivoFalhou === lote.arquivo && !edicaoPronta)

  const atualizarRespostaLocal = (id, respondida) => setRespostasLocais(atual => ({...atual, [id]: respondida}))
  const limparFiltrosEdicao = () => {
    setBusca('')
    setTipoQuestao('')
    setEstadoTranscricao('')
    setEstadoEstudo('')
    setMateriaPessoal('')
    setAssuntoPessoal('')
    setPagina(1)
  }

  if (carregandoIndice && !manifesto) return <p role="status" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-indigo-200">Carregando o índice das questões extraídas…</p>

  return <section className="space-y-6" aria-labelledby="titulo-questoes-extraidas">
    <header className="study-hero gradient-edge rounded-3xl p-5 sm:p-7">
      <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-indigo-300">Acervo na nuvem · questões e páginas originais sob demanda</p>
      <h1 id="titulo-questoes-extraidas" className="text-2xl font-extrabold text-white sm:text-3xl">Questões extraídas</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">O banco principal mantém {numero(questoesBanco)} questões. Este acervo reúne {numero(manifesto?.questoes_extraidas_unicas)} registros em lotes compactados, carregados conforme a edição escolhida; as páginas originais são buscadas somente quando necessário. O total bruto dos conjuntos é {numero(totalBruto)}, antes de cruzar possíveis duplicatas.</p>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Use os filtros por banca, edição, prova, tipo e situação. Páginas sem imagem individual no armazenamento continuam disponíveis no PDF ou pacote de origem quando o documento está identificado.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {[
          ['Questões extraídas', manifesto?.questoes_extraidas_unicas],
          ['Documentos com texto', manifesto?.documentos_com_texto],
          ['Bancas com questões', manifesto?.bancas?.length],
          ['Provas e edições com questões', manifesto?.lotes?.length],
          ['Páginas preservadas como imagem no armazenamento', visuais?.paginas_visuais_disponiveis],
          ['Páginas com OCR útil', visuais?.paginas_ocr_com_transcricao_util],
        ].map(([rotulo, valor]) => <div key={rotulo} className="study-stat-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400">{rotulo}</p>
          <p className="mt-1 text-xl font-extrabold text-white">{numero(valor)}</p>
        </div>)}
      </div>
    </header>

    <aside className="rounded-2xl border border-amber-400/25 bg-amber-950/20 px-4 py-3 text-sm leading-6 text-amber-100">
      Marque alternativas ou redija respostas; tudo fica salvo neste dispositivo. Como os gabaritos oficiais não foram vinculados, o app não atribui nota. Itens com alerta de extração abrem a página de origem e deixam a transcrição automática recolhida para conferência.
    </aside>

    {manifesto?.documentos_sem_questoes_reconstruiveis > 0 && <aside className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-400/25 bg-sky-950/20 px-4 py-3 text-sm leading-6 text-sky-100">
      <span>{numero(manifesto.documentos_sem_questoes_reconstruiveis)} documento(s) do pacote não geraram questões estruturadas nesta extração. Consulte os arquivos e as fontes originais no catálogo para encontrar edições que precisem de leitura ou revisão manual.</span>
      {aoAbrirAcervo && <button type="button" onClick={aoAbrirAcervo} className="shrink-0 rounded-xl border border-sky-300/40 px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-500/10">Abrir catálogo de provas</button>}
    </aside>}

    {visuais?.paginas_visuais_sem_arquivo > 0 && <aside role="status" className="rounded-2xl border border-amber-400/25 bg-amber-950/20 px-4 py-3 text-sm leading-6 text-amber-100">{numero(visuais.paginas_visuais_sem_arquivo)} página(s) não estão guardadas como imagem individual na nuvem. Quando disponível, abra o PDF ou pacote de origem pelo link da questão.</aside>}

    {erroIndice && <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">{erroIndice}</p>}
    {erroLote && <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">O lote desta edição está indisponível ou incompleto.</p>}

    <section aria-label="Filtrar questões extraídas" className="filter-panel gradient-edge grid gap-4 rounded-3xl p-4 shadow-xl md:grid-cols-2 lg:grid-cols-4 sm:p-6">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Banca ou instituição
        <select value={banca} onChange={evento => { setBanca(evento.target.value); setAno(''); setConcurso(''); limparFiltrosEdicao() }} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100">
          <option value="">Escolha uma banca</option>
          {bancas.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Edição
        <select value={ano} onChange={evento => { setAno(evento.target.value); setConcurso(''); limparFiltrosEdicao() }} disabled={!banca} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100 disabled:opacity-50">
          <option value="">Escolha o ano</option>
          {anos.map(item => <option key={item} value={item}>{item === 'sem-ano' ? 'Ano não identificado' : item}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Concurso ou prova
        <select value={concurso} onChange={evento => { setConcurso(evento.target.value); limparFiltrosEdicao() }} disabled={!ano} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100 disabled:opacity-50">
          <option value="">Escolha o concurso</option>
          {concursos.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Buscar nesta edição
        <input type="search" value={busca} onChange={evento => { setBusca(evento.target.value); setPagina(1) }} placeholder="Enunciado, alternativa ou número…" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100 placeholder:text-slate-500" />
      </label>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tipo de questão
        <select value={tipoQuestao} onChange={evento => { setTipoQuestao(evento.target.value); setPagina(1) }} disabled={!edicaoPronta} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100 disabled:opacity-50">
          <option value="">Todos os tipos</option>
          {tiposQuestao.map(item => <option key={item} value={item}>{item === 'certo_errado' ? 'Certo ou errado' : item === 'discursiva' ? 'Discursiva' : 'Múltipla escolha'}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Conferência da transcrição
        <select value={estadoTranscricao} onChange={evento => { setEstadoTranscricao(evento.target.value); setPagina(1) }} disabled={!edicaoPronta} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100 disabled:opacity-50">
          <option value="">Todas</option>
          <option value="revisar">Conferir página original</option>
          <option value="sem-alerta">Sem alerta estrutural</option>
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Minha situação
        <select value={estadoEstudo} onChange={evento => { setEstadoEstudo(evento.target.value); setPagina(1) }} disabled={!edicaoPronta} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100 disabled:opacity-50">
          <option value="">Todas</option>
          <option value="pendentes">Não respondidas</option>
          <option value="respondidas">Respondidas neste dispositivo</option>
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Disciplina pessoal
        <select value={materiaPessoal} onChange={evento => { setMateriaPessoal(evento.target.value); setPagina(1) }} disabled={!edicaoPronta || !materiasPessoais.length} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100 disabled:opacity-50">
          <option value="">Todas as disciplinas</option>
          {!materiasPessoais.length && <option value="" disabled>Classifique uma questão para criar opções</option>}
          {materiasPessoais.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assunto pessoal
        <select value={assuntoPessoal} onChange={evento => { setAssuntoPessoal(evento.target.value); setPagina(1) }} disabled={!edicaoPronta || !assuntosPessoais.length} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100 disabled:opacity-50">
          <option value="">Todos os assuntos</option>
          {!assuntosPessoais.length && <option value="" disabled>Classifique uma questão para criar opções</option>}
          {assuntosPessoais.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <div className="flex items-end">
        <button type="button" onClick={limparFiltrosEdicao} disabled={!edicaoPronta} className="w-full rounded-xl border border-lime-300/30 bg-lime-950/20 px-3 py-3 text-sm font-semibold text-lime-100 hover:bg-lime-900/35 disabled:opacity-50">Limpar filtros da edição</button>
      </div>
      <p className="text-xs leading-5 text-slate-500 md:col-span-2 lg:col-span-4">Banca, ano, prova, palavra-chave, tipo e situação são filtros objetivos. Disciplina e assunto são rótulos pessoais: o PDF de origem não contém uma classificação temática estruturada.</p>
    </section>

    {!banca && <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-5 py-10 text-center">
      <h2 className="font-semibold text-slate-200">Escolha uma banca para abrir as edições</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">Os lotes são carregados sob demanda para que o acervo completo não pese no início do app.</p>
    </div>}
    {banca && !ano && <p className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">Selecione o ano para listar os concursos e provas com questões extraídas.</p>}
    {banca && ano && !concurso && <p className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">Selecione um concurso ou caderno para abrir as questões.</p>}
    {carregandoEdicao && ano && <p role="status" className="text-sm text-indigo-200">Carregando {banca} {ano}…</p>}
    {lote && edicaoPronta && !erroLote && <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-slate-300">{numero(filtradas.length)} questão(ões) nesta busca · {banca} {ano} · {numero(alertaContagem)} nesta prova com alerta de extração</p>
        {filtradas.length > porPagina && <div className="flex items-center gap-2 text-sm">
          <button type="button" disabled={pagina <= 1} onClick={() => setPagina(atual => Math.max(1, atual - 1))} className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 disabled:opacity-40">Anterior</button>
          <span className="text-slate-400">{pagina} / {totalPaginas}</span>
          <button type="button" disabled={pagina >= totalPaginas} onClick={() => setPagina(atual => Math.min(totalPaginas, atual + 1))} className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 disabled:opacity-40">Próxima</button>
        </div>}
      </div>
      <div className="space-y-4">
        {visiveis.map(q => <CartaoQuestaoExtraida key={q.id} questao={q} onEstadoResposta={atualizarRespostaLocal} />)}
      </div>
      {!filtradas.length && <p className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-400">Nenhuma questão corresponde à busca nesta edição.</p>}
    </>}
  </section>
}
