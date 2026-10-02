import AlternativaQuestao from './AlternativaQuestao'

export default function AlternativaComEliminacao({ questao, indice, texto, selecionada, eliminada, compacta = false, onSelecionar, onEliminar }) {
  const letra = String.fromCharCode(65 + indice)
  const espacamento = compacta ? 'p-3 rounded-xl gap-3' : 'p-4 rounded-2xl gap-4'
  const tamanhoLetra = compacta ? 'w-6 h-6 rounded-lg' : 'w-8 h-8 rounded-xl'

  return <div className="flex items-stretch gap-2">
    <button
      type="button"
      disabled={eliminada}
      onClick={onSelecionar}
      className={`min-w-0 flex-1 text-left border transition-all duration-200 flex items-center ${espacamento} disabled:cursor-not-allowed ${
        selecionada
          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 shadow-lg shadow-indigo-500/10'
          : eliminada
            ? 'bg-slate-950/20 border-slate-800/60 text-slate-600 opacity-55 line-through'
            : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-950/80 hover:border-slate-700'
      }`}
    >
      <span className={`${tamanhoLetra} shrink-0 border flex items-center justify-center text-xs font-bold transition-all ${selecionada ? 'border-indigo-400 bg-indigo-600 text-white shadow-md' : 'border-slate-700 text-slate-400 bg-slate-900'}`}>{letra}</span>
      <span className={`${compacta ? 'text-xs' : 'text-sm'} min-w-0`}><AlternativaQuestao questao={questao} indice={indice} texto={texto} /></span>
    </button>
    <button
      type="button"
      aria-label={eliminada ? `Restaurar alternativa ${letra}` : `Eliminar alternativa ${letra}`}
      aria-pressed={eliminada}
      title={eliminada ? 'Restaurar alternativa' : 'Eliminar alternativa'}
      onClick={onEliminar}
      className={`w-12 shrink-0 rounded-2xl border text-lg transition-all ${eliminada ? 'border-amber-500/60 bg-amber-500/15 text-amber-300' : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-amber-500/50 hover:text-amber-300'}`}
    >
      ✂️
    </button>
  </div>
}
