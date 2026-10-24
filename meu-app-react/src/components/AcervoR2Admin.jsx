import {useCallback, useEffect, useRef, useState} from 'react'
import {API_URL} from '../api'
import {supabase} from '../supabaseClient'

const MAX_BATCH_BYTES = 3800000
const MAX_BATCH_FILES = 100
const KEY_ALLOWED = /^(?:manifesto|visuais)\.json$|^lotes\/[A-Za-z0-9._-]+\.json\.gz$|^paginas\/[A-Za-z0-9._-]+\.webp$/

const numero = valor => Number(valor || 0).toLocaleString('pt-BR')
const gigabytes = bytes => `${(Number(bytes || 0) / 1_000_000_000).toLocaleString('pt-BR', {maximumFractionDigits: 2})} GB`

function chaveDoArquivo(file) {
  const partes = String(file.webkitRelativePath || file.name).split('/').filter(Boolean)
  const raiz = partes.findIndex(parte => parte.toLowerCase() === 'acervo-extraido')
  if (raiz < 0) return ''
  return partes.slice(raiz + 1).join('/')
}

function nomeSeguroDaParte(chave) {
  return btoa(chave).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function mensagemErro(payload, resposta) {
  return payload?.detail || payload?.message || `O servidor recusou o envio (HTTP ${resposta.status}).`
}

export default function AcervoR2Admin({isAdmin = false}) {
  const [status, setStatus] = useState(null)
  const [selecionados, setSelecionados] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [progresso, setProgresso] = useState({arquivos: 0, bytes: 0, totalArquivos: 0, totalBytes: 0, lote: 0, lotes: 0})
  const pararDepoisDoLote = useRef(false)

  const obterSessao = useCallback(async () => {
    const {data, error: authError} = await supabase.auth.getSession()
    const session = data?.session
    if (authError || !session?.access_token) throw new Error('Entre na conta administradora do app para consultar o armazenamento.')
    return session
  }, [])

  const buscarStatus = useCallback(async () => {
    try {
      const session = await obterSessao()
      const response = await fetch(`${API_URL}/api/acervo/r2/status`, {
        headers: {Authorization: `Bearer ${session.access_token}`, 'X-Supabase-Key': import.meta.env.VITE_SUPABASE_ANON_KEY || ''},
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(mensagemErro(payload, response))
      setStatus(payload)
      setErro('')
    } catch (error) {
      setErro(error.message || 'Não foi possível consultar o uso do bucket.')
    }
  }, [obterSessao])

  const atualizarStatus = useCallback(async () => {
    setCarregando(true)
    await buscarStatus()
    setCarregando(false)
  }, [buscarStatus])

  useEffect(() => { if (isAdmin) void buscarStatus() }, [buscarStatus, isAdmin])

  const selecionarPasta = evento => {
    setErro('')
    setMensagem('')
    const arquivos = Array.from(evento.target.files || [])
    const vistos = new Set()
    const itens = []
    let repetidos = false
    let foraDoFormato = false
    for (const file of arquivos) {
      const key = chaveDoArquivo(file)
      if (!key) continue
      if (!KEY_ALLOWED.test(key)) { foraDoFormato = true; continue }
      if (vistos.has(key)) { repetidos = true; continue }
      vistos.add(key)
      itens.push({key, file})
    }
    const bytes = itens.reduce((soma, item) => soma + item.file.size, 0)
    if (repetidos) {
      setSelecionados([])
      setErro('A pasta contém caminhos repetidos. Escolha a pasta acervo-extraido original.')
    } else if (foraDoFormato) {
      setSelecionados([])
      setErro('A pasta contém arquivos fora do formato permitido. O envio aceita apenas manifesto, referências visuais, lotes de questões e imagens WebP.')
    } else if (!vistos.has('manifesto.json') || !vistos.has('visuais.json') || !itens.some(item => item.key.startsWith('lotes/') && item.key.endsWith('.json.gz'))) {
      setSelecionados([])
      setErro('A pasta está incompleta: selecione acervo-extraido com manifesto, referências visuais e pelo menos um lote de questões.')
    } else {
      setSelecionados(itens)
      setMensagem(`Pasta conferida: ${numero(itens.length)} arquivos válidos, ${gigabytes(bytes)}. O servidor ainda verificará o limite de 10 GB antes do envio.`)
    }
    evento.target.value = ''
  }

  const preflightDoPacote = async () => {
    const session = await obterSessao()
    const response = await fetch(`${API_URL}/api/acervo/r2/preflight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        'X-Supabase-Key': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify(selecionados.map(({key, file}) => ({key, bytes: file.size}))),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(mensagemErro(payload, response))
    setStatus(payload.current)
    return payload
  }

  const enviarAcervo = async () => {
    if (!selecionados.length || enviando) return
    setErro('')
    setMensagem('Conferindo o espaço necessário no bucket antes do primeiro envio…')
    setEnviando(true)
    pararDepoisDoLote.current = false
    try {
      const totalBytes = selecionados.reduce((soma, item) => soma + item.file.size, 0)
      const conferencia = await preflightDoPacote()
      if (conferencia.projectedBytes > conferencia.current.limitBytes) throw new Error('O pacote completo excederia o limite de 10 GB. Nenhum arquivo foi enviado.')

      setMensagem('Espaço confirmado. Enviando o acervo em lotes…')

      const ordenados = [...selecionados].sort((a, b) => {
        const ordem = key => key === 'manifesto.json' ? 2 : key === 'visuais.json' ? 1 : 0
        return ordem(a.key) - ordem(b.key) || a.key.localeCompare(b.key)
      })
      const manifesto = ordenados.find(item => item.key === 'manifesto.json')
      const lotes = []
      let lote = []
      let bytesLote = 0
      for (const item of ordenados.filter(item => item.key !== 'manifesto.json')) {
        if (item.file.size > MAX_BATCH_BYTES) throw new Error(`O arquivo ${item.key} ultrapassa o tamanho seguro por lote.`)
        if (lote.length && (lote.length >= MAX_BATCH_FILES || bytesLote + item.file.size > MAX_BATCH_BYTES)) {
          lotes.push(lote)
          lote = []
          bytesLote = 0
        }
        lote.push(item)
        bytesLote += item.file.size
      }
      if (lote.length) lotes.push(lote)
      if (manifesto) lotes.push([manifesto])

      setProgresso({arquivos: 0, bytes: 0, totalArquivos: ordenados.length, totalBytes, lote: 0, lotes: lotes.length})
      for (let indice = 0; indice < lotes.length; indice++) {
        if (pararDepoisDoLote.current) break
        const itens = lotes[indice]
        const form = new FormData()
        for (const item of itens) form.append('files', item.file, nomeSeguroDaParte(item.key))
        const session = await obterSessao()
        const response = await fetch(`${API_URL}/api/acervo/r2/objetos`, {
          method: 'POST',
          headers: {Authorization: `Bearer ${session.access_token}`, 'X-Supabase-Key': import.meta.env.VITE_SUPABASE_ANON_KEY || ''},
          body: form,
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(mensagemErro(payload, response))
        const enviadosBytes = itens.reduce((soma, item) => soma + item.file.size, 0)
        setStatus(payload.armazenamento || null)
        setProgresso(atualProgresso => ({
          ...atualProgresso,
          arquivos: atualProgresso.arquivos + itens.length,
          bytes: atualProgresso.bytes + enviadosBytes,
          lote: indice + 1,
        }))
      }
      if (pararDepoisDoLote.current) setMensagem('Envio pausado ao final do lote atual. Os arquivos concluídos ficam salvos e podem ser reenviados com segurança.')
      else setMensagem('Acervo enviado e conferido. O manifesto foi publicado por último, depois dos lotes e das páginas.')
      setSelecionados([])
      await atualizarStatus()
    } catch (error) {
      const detalhe = error.message || 'O envio foi interrompido. Os lotes concluídos continuam salvos; escolha a mesma pasta para retomar.'
      await atualizarStatus()
      setErro(detalhe)
    } finally {
      setEnviando(false)
    }
  }

  if (!isAdmin) return null

  const porcentagem = status?.limitBytes ? Math.min(100, (status.usedBytes / status.limitBytes) * 100) : 0
  const progressoPorcentagem = progresso.totalBytes ? Math.min(100, (progresso.bytes / progresso.totalBytes) * 100) : 0
  const bytesSelecionados = selecionados.reduce((soma, item) => soma + item.file.size, 0)

  return <section aria-label="Armazenamento do acervo no Cloudflare" className="gradient-edge rounded-3xl border border-slate-700/70 bg-slate-950/80 p-5 shadow-xl sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-white">Armazenamento do acervo · Cloudflare</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">O app bloqueia qualquer lote que ultrapasse 10 GB no bucket, somando arquivos já existentes. O acervo auditado será enviado em lotes pequenos, com o manifesto publicado por último.</p>
      </div>
      <button type="button" onClick={() => void atualizarStatus()} disabled={carregando || enviando} className="rounded-xl border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50">{carregando ? 'Conferindo…' : 'Atualizar uso'}</button>
    </div>

    {status && <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      <div className="flex flex-wrap justify-between gap-2 text-sm"><span className="text-slate-300">Usado: <strong className="text-white">{gigabytes(status.usedBytes)}</strong> de {gigabytes(status.limitBytes)}</span><span className="text-slate-400">Livre: {gigabytes(status.remainingBytes)} · {numero(status.objects)} objetos</span></div>
      <div role="progressbar" aria-label="Uso do limite de armazenamento" aria-valuenow={Math.round(porcentagem)} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-lime-300 transition-all" style={{width: `${porcentagem}%`}} /></div>
    </div>}

    <div className="mt-5 flex flex-wrap items-center gap-3">
      <label className="cursor-pointer rounded-xl border border-sky-300/35 bg-sky-950/35 px-4 py-3 text-sm font-semibold text-sky-100 hover:bg-sky-900/50">
        Selecionar a pasta acervo-extraido
        <input type="file" multiple ref={elemento => { if (elemento) elemento.setAttribute('webkitdirectory', '') }} onChange={selecionarPasta} className="sr-only" aria-label="Selecionar a pasta acervo-extraido" />
      </label>
      {selecionados.length > 0 && <button type="button" onClick={() => void enviarAcervo()} disabled={enviando || carregando || !status} className="rounded-xl border border-lime-300/40 bg-lime-950/35 px-4 py-3 text-sm font-semibold text-lime-100 hover:bg-lime-900/45 disabled:opacity-50">Enviar {numero(selecionados.length)} arquivos · {gigabytes(bytesSelecionados)}</button>}
      {enviando && progresso.lotes > 0 && <button type="button" onClick={() => { pararDepoisDoLote.current = true }} className="rounded-xl border border-amber-300/35 px-4 py-3 text-sm font-semibold text-amber-100 hover:bg-amber-950/35">Parar após o lote atual</button>}
    </div>

    {selecionados.length > 0 && <p className="mt-3 text-xs leading-5 text-slate-400">Pasta conferida: {numero(selecionados.length)} arquivos válidos, {gigabytes(bytesSelecionados)}. Antes do primeiro envio, o app verifica no servidor o espaço disponível e bloqueia qualquer envio que passe de 10 GB.</p>}
    {enviando && <div className="mt-4" role="status" aria-live="polite"><div className="flex justify-between gap-2 text-xs text-slate-300"><span>Lote {numero(progresso.lote)} de {numero(progresso.lotes)}</span><span>{numero(progresso.arquivos)} / {numero(progresso.totalArquivos)} arquivos · {gigabytes(progresso.bytes)} / {gigabytes(progresso.totalBytes)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-lime-300 transition-all" style={{width: `${progressoPorcentagem}%`}} /></div></div>}
    {mensagem && <p role="status" className="mt-4 rounded-xl border border-lime-300/25 bg-lime-950/20 px-3 py-2 text-sm text-lime-100">{mensagem}</p>}
    {erro && <p role="alert" className="mt-4 rounded-xl border border-amber-300/30 bg-amber-950/25 px-3 py-2 text-sm leading-6 text-amber-100">{erro}</p>}
  </section>
}

