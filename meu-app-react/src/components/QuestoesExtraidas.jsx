import {useCallback, useEffect, useMemo, useState} from 'react'
import {carregarManifestoAcervo} from '../acervoExtraidoManifesto'
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

async function obterObjetoR2(caminho, opcoes = {}) {
  const {data: sessao, error: erroSessao} = await supabase.auth.getSession()
  const token = sessao?.session?.access_token
  if (erroSessao || !token || !chavePublicaSupabase) return null

  const resposta = await fetch(`${API_URL}/api/acervo/r2/objeto?key=${encodeURIComponent(caminho)}`, {
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
  const [rascunho, setRascunho] = useState(() => lerRespostaLocal('acervo-extraido-texto:' + q.id))
  const [classificacao, setClassificacao] = useState(() => lerClassificacao(q.id))
  const imagens = useMemo(() => [...new Set(q.imagens_paginas?.length ? q.imagens_paginas : q.pagina_imagem ? [q.pagina_imagem] : [])], [q.imagens_paginas, q.pagina_imagem])
  const [urlsImagens, setUrlsImagens] = useState(null)
  const [carregandoImagens, setCarregandoImagens] = useState(false)
  const [erroImagens, setErroImagens] = useState(false)
  const textoCampos = [q.enunciado, q.texto_apoio, ...(q.opcoes || []), ...(q.transcricoes_ocr || []).map(item => item.texto)].join('\n')
  const precisaApoioVisual = precisaConferir(q) || temCaractereIrrecuperavel(textoCampos)
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
  const salvarRascunho = valor => {
    const estavaRespondida = Boolean(rascunho.trim())
    setRascunho(valor)
    try { localStorage.setItem('acervo-extraido-texto:' + q.id, valor) } catch { /* O campo continua editável nesta sessão. */ }
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
    {(q.tipo_extraido === 'discursiva' || !q.opcoes?.length) && <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-400">Sua resolução
      <textarea value={rascunho} onChange={evento => salvarRascunho(evento.target.value)} rows={6} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case leading-6 text-slate-100 placeholder:text-slate-500" placeholder="Escreva sua resolução. Ela fica salva neste dispositivo." />
    </label>}
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


export default function QuestoesExtraidas({aoAbrirAcervo}) {
  const [manifesto, setManifesto] = useState(null)
  const [banca, setBanca] = useState('')
  const [ano, setAno] = useState('')
  const [concurso, setConcurso] = useState('')
  const [busca, setBusca] = useState('')
  const [tipoQuestao, setTipoQuestao] = useState('')
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
    carregarManifestoAcervo()
      .then(dados => { if (ativo) { setManifesto(dados); setCarregandoIndice(false) } })
      .catch(() => { if (ativo) { setErroIndice('Não foi possível carregar as questões disponíveis.'); setCarregandoIndice(false) } })
    return () => { ativo = false }
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
      if (estadoEstudo === 'respondidas' && !respostasLocais[q.id]) return false
      if (estadoEstudo === 'pendentes' && respostasLocais[q.id]) return false
      if (materiaPessoal && classificacao.materia !== materiaPessoal) return false
      if (assuntoPessoal && classificacao.assunto !== assuntoPessoal) return false
      if (!termo) return true
      return normalizar([q.numero_original, q.concurso, q.enunciado, q.texto_apoio, ...(q.transcricoes_ocr || []).map(item => item.texto), ...(q.opcoes || [])].map(limparTextoQuestao).join(' ')).includes(termo)
    })
  }, [assuntoPessoal, busca, classificacoes, estadoEstudo, materiaPessoal, questoes, respostasLocais, tipoQuestao])
  const porPagina = 30
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina))
  const visiveis = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina)
  const edicaoPronta = Boolean(lote && arquivoCarregado === lote.arquivo)
  const carregandoEdicao = Boolean(lote && !edicaoPronta && arquivoFalhou !== lote.arquivo)
  const erroLote = Boolean(lote && arquivoFalhou === lote.arquivo && !edicaoPronta)

  const atualizarRespostaLocal = (id, respondida) => setRespostasLocais(atual => ({...atual, [id]: respondida}))
  const limparFiltrosEdicao = () => {
    setBusca('')
    setTipoQuestao('')
    setEstadoEstudo('')
    setMateriaPessoal('')
    setAssuntoPessoal('')
    setPagina(1)
  }

  if (carregandoIndice && !manifesto) return <p role="status" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-indigo-200">Carregando questões…</p>

  return <section className="space-y-6" aria-labelledby="titulo-questoes-por-edicao">
    <header className="study-hero gradient-edge rounded-3xl p-5 sm:p-7">
      <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-indigo-300">Filtros por banca, edição e prova</p>
      <h2 id="titulo-questoes-por-edicao" className="text-2xl font-extrabold text-white sm:text-3xl">Questões por edição</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Escolha uma prova para carregar suas questões. Os demais arquivos ficam fora da página até serem necessários.</p>
    </header>

    <aside className="rounded-2xl border border-amber-400/25 bg-amber-950/20 px-4 py-3 text-sm leading-6 text-amber-100">
      Suas respostas ficam salvas neste dispositivo. Questões sem gabarito associado não recebem correção automática.
    </aside>

    {erroIndice && <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">{erroIndice}</p>}
    {erroLote && <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">Não foi possível abrir esta seleção.</p>}

    <section aria-label="Filtrar questões" className="filter-panel gradient-edge grid gap-4 rounded-3xl p-4 shadow-xl md:grid-cols-2 lg:grid-cols-4 sm:p-6">
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
      <p className="text-xs leading-5 text-slate-500 md:col-span-2 lg:col-span-4">Combine banca, ano, prova, palavra-chave, tipo e situação para encontrar questões. Disciplina e assunto são rótulos pessoais que você pode criar.</p>
    </section>

    {!banca && <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-5 py-10 text-center">
      <h2 className="font-semibold text-slate-200">Escolha uma banca para abrir as edições</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">As questões de uma prova são carregadas quando você seleciona a edição.</p>
    </div>}
    {banca && !ano && <p className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">Selecione o ano para listar os concursos e provas disponíveis.</p>}
    {banca && ano && !concurso && <p className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">Selecione um concurso ou caderno para abrir as questões.</p>}
    {carregandoEdicao && ano && <p role="status" className="text-sm text-indigo-200">Carregando {banca} {ano}…</p>}
    {lote && edicaoPronta && !erroLote && <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-slate-300">{numero(filtradas.length)} questão(ões) nesta busca · {banca} {ano}</p>
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
