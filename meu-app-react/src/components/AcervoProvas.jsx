import { useEffect, useMemo, useRef, useState } from 'react'

const base = `${import.meta.env.BASE_URL || '/'}acervo-provas/`
const formatoNumero = valor => Number(valor || 0).toLocaleString('pt-BR')

function normalizar(valor) {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

function rotuloTexto(status) {
  if (/extraído parcialmente/i.test(status)) return 'Texto parcial'
  if (/sem texto/i.test(status)) return 'Digitalização sem texto pesquisável'
  if (/falha/i.test(status)) return 'Falha na extração'
  if (/extraído/i.test(status)) return 'Texto pesquisável disponível no pacote local'
  return 'Sem extração de texto'
}

function abrirOrigem(item) {
  return item.url || item.pagina || ''
}

export default function AcervoProvas() {
  const [resumo, setResumo] = useState(null)
  const [bancaAtiva, setBancaAtiva] = useState('')
  const [busca, setBusca] = useState('')
  const [anoAtivo, setAnoAtivo] = useState('')
  const [textoAtivo, setTextoAtivo] = useState('')
  const [registros, setRegistros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [pagina, setPagina] = useState(1)
  const cache = useRef(new Map())
  const requisicao = useRef(0)

  useEffect(() => {
    let ativo = true
    fetch(`${base}resumo.json`, { signal: AbortSignal.timeout(30000) })
      .then(resposta => {
        if (!resposta.ok) throw new Error('O resumo do catálogo não está disponível.')
        return resposta.json()
      })
      .then(dados => { if (ativo) { setResumo(dados); setCarregando(false) } })
      .catch(() => { if (ativo) { setErro('Não foi possível abrir o catálogo. Tente recarregar a página.'); setCarregando(false) } })
    return () => { ativo = false }
  }, [])

  useEffect(() => {
    const id = ++requisicao.current
    const termo = busca.trim()
    if (!resumo) return undefined
    if (!bancaAtiva && termo.length < 2) {
      setRegistros([])
      setCarregando(false)
      setErro('')
      return undefined
    }

    const bancos = bancaAtiva
      ? resumo.bancas.filter(item => item.slug === bancaAtiva && item.pdfs > 0)
      : resumo.bancas.filter(item => item.pdfs > 0)
    if (!bancos.length) {
      setRegistros([])
      setCarregando(false)
      return undefined
    }

    let ativo = true
    setCarregando(true)
    setErro('')
    const carregar = banco => {
      if (!cache.current.has(banco.slug)) {
        const promessa = fetch(`${base}${banco.slug}.json`, { signal: AbortSignal.timeout(60000) })
          .then(resposta => {
            if (!resposta.ok) throw new Error(`Não foi possível carregar o lote ${banco.banca}.`)
            return resposta.json()
          })
          .catch(falha => { cache.current.delete(banco.slug); throw falha })
        cache.current.set(banco.slug, promessa)
      }
      return cache.current.get(banco.slug)
    }

    Promise.allSettled(bancos.map(carregar)).then(resultados => {
      if (!ativo || id !== requisicao.current) return
      const lotes = resultados.filter(item => item.status === 'fulfilled').flatMap(item => item.value)
      setRegistros(lotes)
      const falhas = resultados.filter(item => item.status === 'rejected').length
      setErro(falhas ? `Não foi possível carregar ${falhas} lote(s); os demais continuam disponíveis.` : '')
      setCarregando(false)
    })

    return () => { ativo = false }
  }, [bancaAtiva, busca, resumo])

  const anos = useMemo(() => [...new Set(registros.map(item => item.ano).filter(Boolean))]
    .sort((a, b) => Number(b) - Number(a)), [registros])

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim())
    return registros.filter(item => {
      if (anoAtivo && item.ano !== anoAtivo) return false
      if (textoAtivo && !normalizar(item.textoStatus).includes(normalizar(textoAtivo))) return false
      if (!termo) return true
      return normalizar(`${item.banca} ${item.concurso} ${item.ano} ${item.tipo} ${item.arquivo}`).includes(termo)
    })
  }, [anoAtivo, busca, registros, textoAtivo])

  const porPagina = 40
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina))
  const visiveis = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina)

  useEffect(() => { setPagina(1) }, [anoAtivo, bancaAtiva, busca, textoAtivo])

  if (carregando && !resumo) return <p role="status" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-indigo-200">Carregando o catálogo de provas…</p>
  if (erro && !resumo) return <p role="alert" className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 text-sm text-amber-200">{erro}</p>

  return <section className="space-y-6" aria-labelledby="titulo-acervo-provas">
    <header className="study-hero rounded-3xl border border-indigo-400/20 p-5 sm:p-7">
      <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-indigo-300">Arquivo de avaliações · {resumo?.periodoConsultado}</p>
      <h1 id="titulo-acervo-provas" className="text-2xl font-extrabold text-white sm:text-3xl">Acervo de provas</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Pesquise cadernos, gabaritos e documentos de concursos e vestibulares por banca, ano e tipo. Os links abrem a página ou o PDF na fonte de origem.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['PDFs catalogados', resumo?.pdfs],
          ['Instituições com arquivos', resumo?.bancasComArquivos],
          ['Textos extraídos', resumo?.texto?.comTexto],
          ['Digitalizações sem camada de texto', resumo?.texto?.semTextoPesquisavel],
        ].map(([rotulo, valor]) => <div key={rotulo} className="rounded-2xl border border-slate-700/80 bg-slate-950/40 p-4">
          <p className="text-xs font-semibold text-slate-400">{rotulo}</p>
          <p className="mt-1 text-xl font-extrabold text-white">{formatoNumero(valor)}</p>
        </div>)}
      </div>
    </header>

    <aside className="rounded-2xl border border-sky-400/20 bg-sky-950/20 px-4 py-3 text-sm leading-6 text-sky-100">
      Este catálogo guarda referências e metadados. Os PDFs e textos completos permanecem no pacote local de 17,2 GiB; eles não são enviados com o site. Os documentos brutos ainda não são questões corrigíveis: para isso, é preciso revisar cada enunciado, as alternativas e o gabarito.
    </aside>

    <section aria-label="Pesquisar provas" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Banca ou instituição
          <select value={bancaAtiva} onChange={evento => setBancaAtiva(evento.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100">
            <option value="">Todas (digite uma busca)</option>
            {resumo?.bancas.map(item => <option key={item.slug} value={item.slug}>{item.banca} · {formatoNumero(item.pdfs)} PDFs</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Buscar prova, concurso ou arquivo
          <input type="search" value={busca} onChange={evento => setBusca(evento.target.value)} placeholder="Ex.: ENEM 2018, Polícia Federal, gabarito…" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100 placeholder:text-slate-500" />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ano
          <select value={anoAtivo} onChange={evento => setAnoAtivo(evento.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100">
            <option value="">Todos os anos</option>
            {anos.map(ano => <option key={ano} value={ano}>{ano}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Texto extraído
          <select value={textoAtivo} onChange={evento => setTextoAtivo(evento.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100">
            <option value="">Todos os estados</option>
            <option value="extraído">Com texto pesquisável</option>
            <option value="sem texto">Sem camada textual</option>
            <option value="falha">Falha na extração</option>
          </select>
        </label>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">A busca geral carrega os metadados de todas as instituições. Os arquivos de texto extraído estão no pacote local, não dentro desta página.</p>
    </section>

    <details className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <summary className="font-semibold text-slate-200">Cobertura e limites da coleta por instituição</summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {resumo?.bancas.map(item => <article key={item.slug} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold text-slate-100">{item.banca}</h2>
            <span className="text-xs text-indigo-200">{formatoNumero(item.pdfs)} PDFs · {formatoNumero(item.concursosListados)} concursos listados</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">{item.observacao || 'Sem limitação registrada no manifesto.'}</p>
        </article>)}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">A contagem é de arquivos catalogados e pode incluir duplicatas entre concursos e pacotes. Disponibilidade pública não significa licença geral de republicação.</p>
    </details>

    {erro && <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">{erro}</p>}
    {carregando && <p role="status" className="text-sm text-indigo-200">Carregando os metadados das provas…</p>}
    {!bancaAtiva && busca.trim().length < 2 && <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-5 py-10 text-center">
      <h2 className="font-semibold text-slate-200">Escolha uma instituição ou comece uma busca</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">O catálogo traz documentos do Cebraspe, IBFC, INEP, FGV, UFRJ, Fuvest, Exército/IME e FUNATEC. Também registra as fontes em que a coleta não encontrou arquivos acessíveis.</p>
    </div>}
    {!carregando && (bancaAtiva || busca.trim().length >= 2) && <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-slate-300">{formatoNumero(filtrados.length)} prova(s) ou documento(s) encontrado(s)</p>
        {filtrados.length > porPagina && <div className="flex items-center gap-2 text-sm">
          <button type="button" disabled={pagina <= 1} onClick={() => setPagina(atual => Math.max(1, atual - 1))} className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 disabled:opacity-40">Anterior</button>
          <span className="text-slate-400">{pagina} / {totalPaginas}</span>
          <button type="button" disabled={pagina >= totalPaginas} onClick={() => setPagina(atual => Math.min(totalPaginas, atual + 1))} className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 disabled:opacity-40">Próxima</button>
        </div>}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {visiveis.map(item => {
          const origem = abrirOrigem(item)
          const linkDireto = Boolean(item.url)
          return <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">{item.banca}{item.ano ? ` · ${item.ano}` : ''}</p>
                <h2 className="mt-1 break-words font-bold text-slate-100">{item.concurso || item.arquivo || 'Documento sem título'}</h2>
              </div>
              <span className="rounded-full border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300">{formatoNumero(item.bytes)} bytes</span>
            </div>
            <p className="mt-2 break-words text-sm text-slate-300">{item.tipo || 'Documento de prova'}{item.arquivo ? ` · ${item.arquivo}` : ''}</p>
            <p className="mt-2 text-xs text-slate-500">{rotuloTexto(item.textoStatus)}{item.paginas ? ` · ${formatoNumero(item.paginas)} páginas` : ''}</p>
            {origem
              ? <a className="mt-4 inline-flex rounded-xl border border-indigo-400/40 px-3 py-2 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/10" href={origem} target="_blank" rel="noreferrer">{linkDireto ? 'Abrir arquivo na fonte ↗' : 'Abrir página de origem ↗'}</a>
              : <p className="mt-4 text-xs text-amber-200">A origem direta não foi preservada neste registro.</p>}
          </article>
        })}
      </div>
      {!filtrados.length && <div className="rounded-3xl border border-dashed border-slate-700 px-5 py-10 text-center text-sm text-slate-400">Nenhum documento corresponde aos filtros. Tente outro ano, banca ou termo de busca.</div>}
    </>}
  </section>
}
