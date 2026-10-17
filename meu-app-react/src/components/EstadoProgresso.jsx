export default function EstadoProgresso({progresso}) {
  const {status,erro,avisoLocal,tentarNovamente} = progresso
  const confirmado = status === 'salvo'
  return <div role="status" aria-live="polite" className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${confirmado && !avisoLocal ? 'border-emerald-900/60 bg-emerald-950/20 text-emerald-300' : 'border-amber-800/60 bg-amber-950/20 text-amber-200'}`}>
    <span>{avisoLocal || (confirmado ? '✓ Progresso salvo na conta' : status === 'erro' ? `${erro} Mantenha os dados deste navegador para recuperação.` : 'Alterações protegidas neste navegador. Sincronizando com sua conta…')}</span>
    {status === 'erro' && <button onClick={tentarNovamente} className="shrink-0 rounded-lg border border-amber-700 px-3 py-2 font-semibold">Tentar sincronizar agora</button>}
  </div>
}
