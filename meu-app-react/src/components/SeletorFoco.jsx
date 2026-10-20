import { FOCOS_ESTUDO } from '../focoEstudo'
export default function SeletorFoco({preferencia,onEscolher,bloqueado}) {
  return <section aria-labelledby="titulo-foco" className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 id="titulo-foco" className="font-bold text-slate-100">Seu foco de estudo</h2><span className="text-xs text-slate-400">Você pode mudar quando quiser; seu progresso é mantido.</span></div>
    <div className="grid grid-cols-1 gap-2 min-[440px]:grid-cols-2 lg:grid-cols-4" role="group" aria-label="Foco de estudo">
      {FOCOS_ESTUDO.map(f=><button type="button" key={f.id} aria-pressed={preferencia.foco===f.id} disabled={preferencia.salvando || bloqueado} onClick={()=>onEscolher(f.id)} className={`min-w-0 rounded-2xl border p-3 text-left transition-colors disabled:opacity-60 ${preferencia.foco===f.id?'border-indigo-400 bg-indigo-500/15':'border-slate-700 bg-slate-950/40 hover:border-indigo-500/60'}`}><span className="block text-sm font-semibold">{f.nome}</span><span className="mt-1 block text-xs leading-relaxed text-slate-400">{f.descricao}</span></button>)}
    </div>
    {bloqueado && <p className="mt-3 text-xs text-slate-400">Conclua ou saia do simulado para mudar o foco.</p>}
    {preferencia.salvando && <p role="status" className="mt-3 text-xs text-indigo-300">Salvando foco na sua conta…</p>}
    {preferencia.salvo && <p role="status" className="mt-3 text-xs text-emerald-300">Preferência salva na sua conta.</p>}
    {preferencia.erro && <p role="alert" className="mt-3 text-sm text-amber-300">{preferencia.erro} A seleção está aplicada nesta página. <button className="underline" onClick={()=>onEscolher(preferencia.foco)}>Tentar salvar novamente</button></p>}
  </section>
}
