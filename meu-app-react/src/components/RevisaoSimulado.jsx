import EnunciadoQuestao from './EnunciadoQuestao'
import AlternativaQuestao from './AlternativaQuestao'
function indiceCorreto(q) {return typeof q.resposta_correta==='string'?q.resposta_correta.toUpperCase().charCodeAt(0)-65:q.resposta_correta}
export default function RevisaoSimulado({resultado,onRepetirErros}) {
  const erros=resultado.detalhes.filter(q=>!q.acertou)
  return <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 text-left" aria-labelledby="correcao-titulo">
    <h2 id="correcao-titulo" className="text-xl font-bold">Correção para aprender</h2>
    <p className="mt-2 text-sm text-slate-400">Compare sua escolha com o gabarito e tente explicar a solução com suas palavras antes de seguir.</p>
    {erros.length>0&&<button className="mt-4 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold" onClick={()=>onRepetirErros(erros)}>Tentar novamente as {erros.length} questões pendentes</button>}
    <div className="mt-5 space-y-3">{resultado.detalhes.map((q,i)=>{
      const soma=q.tipo_resposta==='somatoria', correta=soma?Number(q.resposta_soma??q.resposta_correta):indiceCorreto(q)
      return <details key={q.id} className="rounded-2xl border border-slate-700 p-4"><summary className="cursor-pointer text-sm font-semibold">Questão {i+1} · {q.materia} · {q.acertou?'Acertou':q.nãoRespondida?'Não respondida':'Revisar'}</summary>
        <div className="mt-4 space-y-4"><EnunciadoQuestao questao={q}/><p className="text-sm text-emerald-300">Gabarito: {soma?`soma ${correta}`:q.rotulos_opcoes?.[correta]||String.fromCharCode(65+correta)}{q.nãoRespondida?' · você não respondeu':` · sua resposta: ${soma?q.escolhida:q.rotulos_opcoes?.[q.escolhida]||String.fromCharCode(65+q.escolhida)}`}</p>
        {q.opcoes.map((opcao,idx)=>{
          const certa=soma?Boolean(correta & Number(q.valores_opcoes?.[idx])):idx===correta
          return <div key={idx} className={`rounded-xl border p-3 text-sm ${certa?'border-emerald-500/50 bg-emerald-950/30':'border-slate-700'}`}><p className="mb-2 text-xs font-bold">{q.rotulos_opcoes?.[idx]||String.fromCharCode(65+idx)}{certa?' · correta':''}</p><AlternativaQuestao questao={q} indice={idx} texto={opcao}/></div>
        })}
        {typeof q.explicacao==='string'&&q.explicacao.trim()?<p className="whitespace-pre-wrap text-sm">{q.explicacao}</p>:<p className="text-xs text-slate-400">Este item tem gabarito, mas não possui resolução comentada no acervo. Consulte seu material para entender o raciocínio.</p>}
        </div>
      </details>
    })}</div>
  </section>
}
