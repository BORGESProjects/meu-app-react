export default function EstadoProgresso({progresso}) {
  const {status,erro,diagnostico,avisoLocal,tentarNovamente} = progresso
  if (status !== 'erro' && !avisoLocal) return null
  return <div role="status" aria-live="polite" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-800/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
    <span>{avisoLocal || `${erro} Mantenha os dados deste navegador para recuperação.`}</span>
    {status === 'erro' && <button onClick={tentarNovamente} className="shrink-0 rounded-lg border border-amber-700 px-3 py-2 font-semibold">Tentar sincronizar agora</button>}
    {status === 'erro' && diagnostico && <details className="w-full break-words text-xs"><summary className="cursor-pointer">Detalhes da sincronização</summary><p className="mt-2">{diagnostico}</p></details>}
  </div>
}
