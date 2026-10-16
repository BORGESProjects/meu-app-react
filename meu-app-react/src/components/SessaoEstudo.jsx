import {useEffect, useRef, useState} from 'react'
import {formatarTempoEstudo, lerSessao, pausarSessao, segundosDaSessao} from '../sessaoEstudo'

export default function SessaoEstudo({userId, onConcluir}) {
  const chave = `ap-aprovado:sessao-estudo:${userId}`
  const [sessao, setSessao] = useState(() => lerSessao(window.sessionStorage, chave))
  const atual = useRef(sessao)
  const [materia, setMateria] = useState(sessao?.materia || '')
  const [conteudo, setConteudo] = useState(sessao?.conteudo || '')
  const [segundos, setSegundos] = useState(() => segundosDaSessao(sessao))
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  function guardar(proxima) {
    atual.current = proxima
    setSessao(proxima)
    setSegundos(segundosDaSessao(proxima))
    try {
      if (proxima) window.sessionStorage.setItem(chave, JSON.stringify(proxima))
      else window.sessionStorage.removeItem(chave)
      setAviso('')
    } catch { setAviso('O navegador bloqueou a recuperação da sessão. Mantenha esta página aberta até registrar.') }
  }
  useEffect(() => {
    if (!sessao || sessao.inicio === null) return
    const atualizar = () => setSegundos(segundosDaSessao(atual.current))
    atualizar()
    const intervalo = setInterval(() => { if (!document.hidden) atualizar() }, 1000)
    document.addEventListener('visibilitychange', atualizar)
    window.addEventListener('focus', atualizar)
    window.addEventListener('pageshow', atualizar)
    return () => {
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', atualizar)
      window.removeEventListener('focus', atualizar)
      window.removeEventListener('pageshow', atualizar)
    }
  }, [sessao])
  function iniciar() {
    if (!materia.trim()) { setErro('Informe a matéria para iniciar a sessão.'); return }
    setErro('')
    guardar({id:crypto.randomUUID(),materia:materia.trim(),conteudo:conteudo.trim(),acumulado:0,inicio:Date.now()})
  }
  function concluir() {
    const s = atual.current
    if (!s) return
    // Calcula novamente no clique: a última atualização visual pode estar atrasada.
    const duracao = segundosDaSessao(s)
    if (duracao < 10) { setErro('Estude pelo menos 10 segundos antes de registrar a sessão.'); return }
    onConcluir({...s, segundos:duracao})
    guardar(null)
    setErro('')
  }
  const botao = 'rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50'
  return <section aria-label="Sessão de estudo" className="rounded-3xl border border-indigo-500/30 bg-slate-900/60 p-4 shadow-xl sm:p-7">
    <h3 className="mb-2 text-lg font-bold text-slate-100">⏱️ Sessão de estudo</h3>
    <p className="mb-5 text-sm text-slate-400">O tempo continua ao trocar de aba ou minimizar o navegador. Pause quando fizer uma pausa e registre ao terminar.</p>
    <div className="mb-5 grid gap-4 sm:grid-cols-2">
      <label className="min-w-0 text-sm text-slate-300">Matéria<input value={materia} onChange={e=>setMateria(e.target.value)} disabled={!!sessao} placeholder="Ex: Matemática" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" /></label>
      <label className="min-w-0 text-sm text-slate-300">Conteúdo / tópico (opcional)<input value={conteudo} onChange={e=>setConteudo(e.target.value)} disabled={!!sessao} placeholder="Ex: Geometria plana" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" /></label>
    </div>
    {sessao && <div className="mb-4 rounded-2xl border border-indigo-500/20 bg-slate-950/60 p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">{sessao.inicio === null ? 'Sessão pausada' : 'A estudar agora'}</p>
      <p role="timer" aria-label="Tempo de estudo" className="my-2 text-4xl font-extrabold tabular-nums text-slate-100">{formatarTempoEstudo(segundos)}</p>
      <p className="break-words text-sm text-slate-400">{sessao.materia}{sessao.conteudo ? ` · ${sessao.conteudo}` : ''}</p>
    </div>}
    <div className="flex flex-wrap gap-3">
      {!sessao ? <button onClick={iniciar} className={`${botao} bg-emerald-600 text-white hover:bg-emerald-500`}>▶ Iniciar sessão</button> : <>
        <button onClick={()=>guardar(atual.current.inicio === null ? {...atual.current,inicio:Date.now()} : pausarSessao(atual.current))} className={`${botao} bg-slate-700 text-white hover:bg-slate-600`}>{sessao.inicio === null ? '▶ Retomar' : '⏸ Pausar'}</button>
        <button onClick={concluir} className={`${botao} bg-indigo-600 text-white hover:bg-indigo-500`}>⏹ Encerrar e registrar</button>
      </>}
    </div>
    {erro && <p role="alert" className="mt-3 text-sm text-red-300">{erro}</p>}
    {aviso && <p role="status" className="mt-3 text-sm text-amber-300">{aviso}</p>}
    <p className="mt-4 text-xs text-slate-400">A sessão é recuperada ao voltar ou recarregar esta aba. Encerre e registre antes de fechar a aba. As horas registradas são sincronizadas com sua conta.</p>
  </section>
}
