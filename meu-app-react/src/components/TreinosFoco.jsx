import { useMemo, useState } from 'react'
import { gerarTreinoCpor } from '../simulados'
import { gerarSimuladoPersonalizado, gerarTreinoVestibular, materiaCanonica, nomeFoco, planoRevisao, questoesParaTreino } from '../focoEstudo'
const campo='mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100'
const botao='rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
export default function TreinosFoco({questoes,foco,historico,onIniciar,configuracoes=[],onSalvarConfig,onExcluirConfig}) {
  const [materias,setMaterias]=useState([]),[banca,setBanca]=useState(''),[quantidade,setQuantidade]=useState(40),[modo,setModo]=useState('equilibrado'),[aviso,setAviso]=useState('')
  const pool=useMemo(()=>questoesParaTreino(questoes,foco),[questoes,foco])
  const plano=useMemo(()=>planoRevisao(pool,historico),[pool,historico])
  const bancas=useMemo(()=>[...new Set(pool.map(q=>q.banca))].sort((a,b)=>a.localeCompare(b,'pt-BR')),[pool])
  const configuracoesAtivas=configuracoes.filter(item=>item.foco===foco)
  const opcoesMaterias=useMemo(()=>[...new Set(pool.filter(q=>!banca||q.banca===banca).map(materiaCanonica))].sort((a,b)=>a.localeCompare(b,'pt-BR')),[pool,banca])
  const config={foco,banca,materias,quantidade,modo,historico}
  const perfil=foco==='vestibulares'?'Vestibulares':foco==='militares'?'Concursos militares':foco==='concursos'?'Concursos públicos':'Seu objetivo'
  function iniciar(itens,titulo) {
    if(!itens.length) {setAviso('O acervo ainda não tem questões suficientes para esta seleção. Amplie os filtros ou aguarde o carregamento.');return}
    setAviso('');onIniciar({tipo:'personalizado',id:'treino-'+crypto.randomUUID(),prova:titulo,concurso:titulo,banca:'Treino personalizado',itens})
  }
  function personalizado(e) {
    e.preventDefault();const resultado=gerarSimuladoPersonalizado(questoes,config)
    if(resultado.erro) {setAviso(resultado.erro);return}
    iniciar(resultado.itens,`${perfil} — ${quantidade} questões`)
  }
  function revisar(tipo) {
    const total=Math.min(20,tipo==='erros'?plano.erros.length:plano.vencidas.length)
    const resultado=gerarSimuladoPersonalizado(questoes,{foco,quantidade:total,modo:tipo,historico})
    if(resultado.erro) {setAviso(resultado.erro);return}
    iniciar(resultado.itens,tipo==='erros'?'Caderno de erros — nova tentativa':'Revisão espaçada — recuperar da memória')
  }
  function salvarConfiguracao() {
    const nomeMateria = materias.length ? materias.slice(0, 2).join(', ') + (materias.length > 2 ? '…' : '') : 'todas as matérias'
    onSalvarConfig?.({ foco, banca, materias: [...materias], quantidade, modo, nome: `${perfil} · ${nomeMateria} · ${quantidade} questões` })
  }
  function aplicarConfiguracao(item) {
    setBanca(item.banca || '')
    setMaterias(Array.isArray(item.materias) ? item.materias : [])
    setQuantidade(Math.min(120, Math.max(1, Number(item.quantidade) || 40)))
    setModo(item.modo || 'equilibrado')
    setAviso(`Configuração “${item.nome}” carregada. Revise os filtros e gere o treino.`)
  }
  return <div className="mb-8 space-y-5">
    <section aria-labelledby="criador-titulo" className="rounded-3xl border border-indigo-500/40 bg-indigo-950/30 p-5 sm:p-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">{nomeFoco(foco)}</span>
      <h2 id="criador-titulo" className="mt-2 text-xl font-bold">Criar seu simulado</h2>
      <p className="mt-2 text-sm text-slate-400">Escolha matérias, banca e quantidade. A seleção permanece fixa até você terminar; o gabarito aparece na correção.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {['militares','sem-preferencia'].includes(foco)&&<button className={botao} onClick={()=>iniciar(gerarTreinoCpor(questoes),'Treino CPOR / NPOR — 40 questões')}>CPOR / NPOR · 40 questões</button>}
        {['vestibulares','sem-preferencia'].includes(foco)&&<button className={botao} onClick={()=>iniciar(gerarTreinoVestibular(questoes),'Treino vestibular por áreas — 40 questões')}>Vestibulares · 40 questões por áreas</button>}
      </div>
      {foco==='militares'&&<p className="mt-3 text-xs text-slate-400">Treino CPOR/NPOR: 10 de Português, 10 de Geografia, 10 de História e 10 de Matemática.</p>}
      {foco==='vestibulares'&&<p className="mt-3 text-xs text-slate-400">Treino por áreas: 10 de Linguagens, 10 de Humanas, 10 de Natureza e 10 de Matemática. Não reproduz a matriz ou a nota TRI do ENEM.</p>}
      <p className="mt-3 text-xs text-slate-400">Os treinos personalizados são seleções para estudo. As provas originais completas ficam na seção abaixo.</p>
      <details className="mt-5" open={foco==='concursos'}><summary className="cursor-pointer text-sm font-semibold text-indigo-300">Personalizar matérias, banca e quantidade</summary>
        <form onSubmit={personalizado} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm">Quantidade<input className={campo} type="number" min="1" max="120" required value={quantidade} onChange={e=>setQuantidade(Number(e.target.value))}/></label>
            <label className="text-sm">Banca ou instituição<select className={campo} value={banca} onChange={e=>{setBanca(e.target.value);setMaterias([])}}><option value="">Todas deste foco</option>{bancas.map(b=><option key={b}>{b}</option>)}</select></label>
            <label className="text-sm">Como praticar<select className={campo} value={modo} onChange={e=>setModo(e.target.value)}><option value="equilibrado">Matérias equilibradas</option><option value="ineditas">Ainda não respondidas</option><option value="erros">Erros da última tentativa</option><option value="revisao">Revisões sugeridas para hoje</option></select></label>
          </div>
          <fieldset><legend className="text-sm font-semibold">Matérias <span className="font-normal text-slate-400">· nenhuma marcada = todas disponíveis</span></legend>
            <div className="mt-3 grid max-h-60 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-700 p-3 sm:grid-cols-2 lg:grid-cols-3">{opcoesMaterias.map(m=><label key={m} className="flex min-w-0 items-start gap-2 rounded-lg p-2 text-sm hover:bg-slate-800"><input type="checkbox" className="mt-1 shrink-0" checked={materias.includes(m)} onChange={()=>setMaterias(atuais=>atuais.includes(m)?atuais.filter(v=>v!==m):[...atuais,m])}/><span className="min-w-0 break-words">{m}</span></label>)}</div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button className={botao} type="submit" disabled={!pool.length}>Gerar simulado personalizado</button>
            <button className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-indigo-400/50 disabled:opacity-50" type="button" onClick={salvarConfiguracao}>Salvar esta configuração</button>
          </div>
        </form>
      </details>
      {configuracoesAtivas.length > 0 && <div className="mt-5 border-t border-indigo-400/15 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Configurações salvas</h3>
        <div className="mt-2 flex flex-wrap gap-2">{configuracoesAtivas.map(item => <div key={item.id} className="flex max-w-full items-center gap-1 rounded-xl border border-slate-700 bg-slate-950/50 p-1">
          <button type="button" onClick={() => aplicarConfiguracao(item)} title={item.nome} className="max-w-64 truncate rounded-lg px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/10">{item.nome}</button>
          <button type="button" aria-label={`Excluir configuração ${item.nome}`} onClick={() => onExcluirConfig?.(item.id)} className="rounded-lg px-2 py-2 text-xs text-slate-500 hover:bg-rose-500/10 hover:text-rose-300">×</button>
        </div>)}</div>
      </div>}
      {aviso&&<p role="alert" className="mt-4 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-sm text-amber-200">{aviso}</p>}
    </section>
    <section aria-labelledby="revisoes-titulo" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
      <h2 id="revisoes-titulo" className="text-lg font-bold">Próximo passo nos estudos</h2>
      <p className="mt-2 text-sm text-slate-400">Resolva antes de consultar. Depois da correção, volte aos conteúdos em outros dias.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 p-4"><h3 className="font-semibold">Revisões sugeridas: {plano.vencidas.length}</h3><p className="my-2 text-xs text-slate-400">Retome até 20 questões já praticadas, começando pelas mais atrasadas.</p><button className={botao} disabled={!plano.vencidas.length} onClick={()=>revisar('revisao')}>Começar revisão</button></div>
        <div className="rounded-2xl border border-slate-700 p-4"><h3 className="font-semibold">Caderno de erros: {plano.erros.length}</h3><p className="my-2 text-xs text-slate-400">Questões cuja tentativa mais recente foi incorreta. Um novo acerto atualiza esta lista.</p><button className={botao} disabled={!plano.erros.length} onClick={()=>revisar('erros')}>Praticar meus erros</button></div>
      </div>
      {plano.proxima&&<p className="mt-3 text-xs text-indigo-300">Próxima revisão sugerida: {new Date(plano.proxima).toLocaleDateString('pt-BR')}.</p>}
      {!plano.ultimas.size&&<p className="mt-3 text-sm text-slate-400">Conclua questões ou um simulado para formar suas revisões com o histórico desta conta.</p>}
      <details className="mt-4 text-xs text-slate-400"><summary className="cursor-pointer">Como são sugeridas as revisões?</summary><p className="mt-2 leading-relaxed">Depois de um erro, a questão volta no dia seguinte. Acertos consecutivos sugerem intervalos de 1, 3, 7, 14 e 30 dias. É uma regra prática de organização, não um intervalo ideal comprovado para todas as pessoas. Você também pode praticar os erros a qualquer momento.</p><a className="mt-2 inline-block text-indigo-300 underline" href="https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html" target="_blank" rel="noreferrer">Referência: prática de recuperação e estudo distribuído</a></details>
    </section>
  </div>
}
