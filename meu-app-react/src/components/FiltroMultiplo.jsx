export default function FiltroMultiplo({ titulo, opcoes, selecionados, aoAlterar, rotuloTodos }) {
  function alternar(valor) {
    aoAlterar(selecionados.includes(valor)
      ? selecionados.filter(item => item !== valor)
      : [...selecionados, valor])
  }

  const resumo = selecionados.length === 0
    ? rotuloTodos
    : selecionados.length === 1
      ? opcoes.find(opcao => opcao.value === selecionados[0])?.label || selecionados[0]
      : `${selecionados.length} selecionados`

  return <div>
    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-indigo-400">{titulo}</span>
    <details name="filtros-questoes" className="group relative">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 shadow-inner transition-all hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 [&::-webkit-details-marker]:hidden">
        <span className="truncate">{resumo}</span>
        <span className="text-xs text-slate-500 transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="absolute left-0 z-40 mt-2 max-h-72 w-full min-w-60 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-2xl md:w-72">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-2 pb-2">
          <span className="text-xs text-slate-500">Marque uma ou mais opções</span>
          {selecionados.length > 0 && <button type="button" onClick={() => aoAlterar([])} className="rounded-lg px-2 py-1 text-xs font-semibold text-indigo-300 hover:bg-slate-800">Limpar</button>}
        </div>
        <div className="mt-1 space-y-1">
          {opcoes.map(opcao => <label key={opcao.value} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-900">
            <input type="checkbox" checked={selecionados.includes(opcao.value)} onChange={() => alternar(opcao.value)} className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-indigo-500" />
            <span>{opcao.label}</span>
          </label>)}
        </div>
      </div>
    </details>
  </div>
}
