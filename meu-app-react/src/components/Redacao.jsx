import {useEffect,useRef,useState} from 'react'
import {API_URL,fetchApi} from '../api'
import {supabase} from '../supabaseClient'
import {temasRedacao,bancasRedacao} from '../data/temasRedacao'
import {PERFIS_REDACAO,assinaturaRedacao,estatisticasRedacao,validarRedacao,solicitarCorrecao,verificarServicoRedacao,lerRascunho,salvarRascunho,textoRelatorio} from '../redacao'
const campo='mt-2 w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-60'
const botao='rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
export default function Redacao({session,foco}) {
 const userId=session.user.id
 const [inicial]=useState(()=>lerRascunho(window.localStorage,userId))
 const [rascunho,setRascunho]=useState(()=>inicial?.rascunho||{tema:'',texto:'',banca:['militares','concursos'].includes(foco)?'GERAL':'ENEM',ano:null,criterios:'',temaId:''})
 const [historico,setHistorico]=useState(()=>inicial?.historico||[])
 const [resultado,setResultado]=useState(null),[filtroBanca,setFiltroBanca]=useState('Todas'),[erro,setErro]=useState(''),[salvo,setSalvo]=useState(inicial?'Rascunho recuperado deste navegador.':''),[ocupado,setOcupado]=useState(false),[reutilizada,setReutilizada]=useState(false)
 const requisicao=useRef(null),versao=useRef(0)
 useEffect(()=>()=>{versao.current++;requisicao.current?.abort()},[])
 const estatisticas=estatisticasRedacao(rascunho.texto),perfil=PERFIS_REDACAO[rascunho.banca]
 const temaEscolhido=temasRedacao.find(t=>t.id===rascunho.temaId)
 const temas=filtroBanca==='Todas'?temasRedacao:temasRedacao.filter(t=>t.banca===filtroBanca)
 function persistir(dados,relatorios=historico) {
  try{salvarRascunho(window.localStorage,userId,dados,relatorios);setSalvo('Rascunho salvo neste navegador, separado por conta.')}catch{setSalvo('Não foi possível salvar neste navegador. Use Baixar rascunho para guardar uma cópia.')}
 }
 function editar(alteracoes) {const novo={...rascunho,...alteracoes};setRascunho(novo);setErro('');persistir(novo)}
 function escolherTema(id) {
  const tema=temasRedacao.find(t=>t.id===id)
  if(!tema){editar({temaId:'',ano:null});return}
  editar({tema:tema.tema,temaId:id,ano:tema.ano,banca:tema.banca==='ENEM'?'ENEM':'FUVEST',criterios:''})
 }
 function baixar(nome,conteudo) {
  const url=URL.createObjectURL(new Blob([conteudo],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=nome;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 async function corrigir(e) {
  e.preventDefault();if(requisicao.current)return
  const validacao=validarRedacao(rascunho);if(validacao){setErro(validacao);return}
  const copia={...rascunho},chave=assinaturaRedacao(copia),anterior=historico.find(h=>assinaturaRedacao(h.redacao)===chave)
  if(anterior){setResultado(anterior);setReutilizada(true);setErro('');return}
  const controle=new AbortController();requisicao.current=controle;const token=++versao.current
  setOcupado(true);setErro('');setReutilizada(false)
  try {
   const {data,error}=await supabase.auth.getSession()
   if(error||data.session?.user?.id!==userId)throw new Error('Entre novamente para corrigir. Seu rascunho foi mantido.')
   await verificarServicoRedacao({url:API_URL+'/api/ia/redacao/status',fetcher:fetchApi,signal:controle.signal})
   const resposta=await solicitarCorrecao({fetcher:fetchApi,url:API_URL+'/api/ia/corrigir-redacao',redacao:copia,token:data.session.access_token,chave:import.meta.env.VITE_SUPABASE_ANON_KEY,signal:controle.signal})
   if(token!==versao.current)return
   const item={id:crypto.randomUUID(),criadaEm:new Date().toISOString(),redacao:copia,resultado:resposta}
   const atualizados=[item,...historico.filter(h=>assinaturaRedacao(h.redacao)!==chave)].slice(0,5)
   setResultado(item);setHistorico(atualizados);setReutilizada(resposta.reutilizada);persistir(copia,atualizados)
  }catch(e){if(token===versao.current)setErro(e.name==='AbortError'?'Espera cancelada. Seu texto está preservado. A análise já iniciada no servidor pode continuar.':e.message)}
  finally{if(token===versao.current){requisicao.current=null;setOcupado(false)}}
 }
 function cancelar(){versao.current++;requisicao.current?.abort();requisicao.current=null;setOcupado(false);setErro('Espera cancelada. Seu texto está preservado. Uma análise já enviada pode continuar no servidor.')}
 const relatorio=resultado?.resultado.relatorio,desatualizado=resultado&&assinaturaRedacao(resultado.redacao)!==assinaturaRedacao(rascunho)
 return <div className="redacao-oficina mx-auto max-w-4xl space-y-6">
  <header className="redacao-hero"><div className="redacao-emblema" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m16 3 5 5-12 12H4v-5L16 3ZM13 6l5 5M4 21h16"/></svg></div><div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-300">Escrita e evolução</p><h1 className="text-2xl font-bold sm:text-3xl">Oficina de redação</h1><p className="mt-2 text-sm leading-relaxed text-slate-300">Transforme seu texto em um plano de melhoria, com análise por critério e orientações práticas.</p><div className="redacao-etapas"><span><b>1</b> Escolha o tema</span><span><b>2</b> Escreva seu texto</span><span><b>3</b> Revise com a IA</span></div></div></header>
  <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
   <div className="grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-semibold">Correção para<select className={campo} disabled={ocupado} value={rascunho.banca} onChange={e=>editar({banca:e.target.value,temaId:'',ano:null})}>{Object.entries(PERFIS_REDACAO).map(([id,p])=><option key={id} value={id}>{p.nome}</option>)}</select></label>
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 text-xs leading-relaxed text-indigo-200">{rascunho.banca==='ENEM'?'Cinco competências, de 0 a 200 cada. Estimativa total de 0 a 1.000.':'Avaliação pedagógica de 0 a 100, com os critérios exibidos abaixo. Não representa a escala oficial de um concurso.'}<p className="mt-2">A avaliação é um apoio por IA, não uma nota oficial ou garantia de aprovação.</p></div>
   </div>
   <details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-indigo-300">Escolher um tema de edição anterior</summary>
    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr]"><label className="text-sm">Filtrar temas por banca<select disabled={ocupado} className={campo} value={filtroBanca} onChange={e=>{setFiltroBanca(e.target.value);if(temaEscolhido&&e.target.value!=='Todas'&&temaEscolhido.banca!==e.target.value)editar({temaId:'',ano:null})}}><option>Todas</option>{bancasRedacao.map(b=><option key={b}>{b}</option>)}</select></label><label className="text-sm">Proposta de redação<select disabled={ocupado} className={campo} value={rascunho.temaId||''} onChange={e=>escolherTema(e.target.value)}><option value="">Tema livre</option>{temas.map(t=><option key={t.id} value={t.id}>{t.banca} {t.ano} — {t.tema}</option>)}</select></label></div>
    {temaEscolhido&&<div className="mt-3 rounded-xl bg-slate-950/60 p-4 text-sm"><p className="font-semibold">{temaEscolhido.banca} {temaEscolhido.ano} · {temaEscolhido.tipo}</p><p className="mt-2 text-slate-400">{temaEscolhido.instrucoes}</p><a className="mt-3 inline-block text-indigo-300 underline" href={temaEscolhido.fonte} target="_blank" rel="noreferrer">Consultar proposta e coletânea na fonte oficial</a></div>}
   </details>
   <details className="mt-4 text-sm"><summary className="cursor-pointer text-slate-300">Critérios desta avaliação</summary><ul className="mt-3 space-y-1 text-slate-400">{perfil.criterios.map(([id,nome,max])=><li key={id}>{nome} · até {max} pontos</li>)}</ul></details>
  </section>
  <form onSubmit={corrigir} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
   <label className="block text-sm font-semibold">Tema<input className={campo} required minLength={3} maxLength={500} disabled={ocupado} value={rascunho.tema} placeholder="Escolha uma proposta ou escreva o tema" onChange={e=>editar({tema:e.target.value,temaId:'',ano:null})}/></label>
   <label className="block text-sm font-semibold">Seu texto<textarea className={`${campo} min-h-80 leading-7`} rows={14} required maxLength={20000} readOnly={ocupado} value={rascunho.texto} placeholder="Cole ou escreva sua redação. Separe os parágrafos com uma linha em branco." onChange={e=>editar({texto:e.target.value})}/></label>
   <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-400"><span>{estatisticas.palavras} palavras · {estatisticas.paragrafos} parágrafos</span><span>{estatisticas.caracteres.toLocaleString('pt-BR')} / 20.000 caracteres</span></div>
   <details><summary className="cursor-pointer text-sm text-indigo-300">Acrescentar instruções ou exigências do edital</summary><label className="mt-3 block text-xs text-slate-400">Tipo de texto, critérios particulares ou orientações. Para coletâneas extensas, consulte a fonte oficial.<textarea className={campo} maxLength={3000} rows={3} disabled={ocupado} value={rascunho.criterios} onChange={e=>editar({criterios:e.target.value})}/></label></details>
   <p role="status" className="text-xs text-slate-400">{salvo||'O rascunho será salvo neste navegador ao escrever. Rascunhos e os cinco últimos relatórios ficam neste dispositivo.'}</p>
   <p className="text-xs text-slate-400">Ao corrigir, o tema, o texto e as instruções são enviados ao Google Gemini para análise. Evite inserir dados pessoais desnecessários.</p>
   <div className="flex flex-wrap gap-3"><button className={botao} disabled={ocupado} type="submit">{ocupado?'Aguardando a análise…':'Corrigir redação'}</button><button type="button" className="rounded-xl border border-slate-700 px-4 py-3 text-sm" onClick={()=>baixar('meu-rascunho.txt',rascunho.tema+'\n\n'+rascunho.texto)}>Baixar rascunho</button>{ocupado&&<button type="button" className="rounded-xl border border-slate-700 px-4 py-3 text-sm" onClick={cancelar}>Cancelar espera</button>}</div>
   {ocupado&&<p role="status" className="text-sm text-indigo-300">Consultando a IA e preparando o relatório. A análise pode levar até dois minutos e meio; não é necessário reenviar.</p>}
   {erro&&<p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 text-sm text-amber-200">{erro}</p>}
  </form>
  {resultado&&<section className="space-y-5 rounded-3xl border border-indigo-500/30 bg-slate-900/60 p-4 sm:p-6" aria-labelledby="relatorio-redacao">
   <div className="flex flex-wrap justify-between gap-3"><div><h2 id="relatorio-redacao" className="text-xl font-bold">Seu plano de revisão</h2><p className="mt-1 text-xs text-slate-400">{new Date(resultado.criadaEm).toLocaleString('pt-BR')} · {resultado.redacao.tema}</p></div><button className="text-sm text-indigo-300 underline" onClick={()=>baixar('correcao-redacao.txt',textoRelatorio(resultado))}>Baixar relatório e texto</button></div>
   {desatualizado&&<p className="rounded-xl bg-amber-950/40 p-3 text-sm text-amber-200">Este relatório se refere à versão anterior. Corrija o texto atual para receber uma nova análise.</p>}
   {reutilizada&&<p className="text-xs text-emerald-300">Esta versão já foi analisada. Relatório recuperado sem uma nova chamada à IA.</p>}
   {relatorio?<>
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5"><p className="text-xs text-indigo-300">NOTA ESTIMADA</p><p className="mt-1 text-3xl font-bold">{relatorio.nota}<span className="text-lg text-slate-400"> / {relatorio.maximo}</span></p><p className="mt-2 text-xs text-slate-400">{relatorio.escala}</p><p className="mt-3 text-sm leading-relaxed">{relatorio.resumo}</p></div>
    <div className="grid gap-3 sm:grid-cols-2">{relatorio.criterios.map(c=><article key={c.id} className="rounded-2xl border border-slate-700 p-4"><h3 className="font-semibold">{c.nome} · {c.nota}/{c.maximo}</h3><progress aria-label={`Nota em ${c.nome}`} className="my-3 h-2 w-full" max={c.maximo} value={c.nota}/><p className="text-sm text-slate-300">{c.justificativa}</p><p className="mt-3 text-sm text-indigo-300">Próximo passo: {c.sugestao}</p></article>)}</div>
    <div className="rounded-2xl border border-emerald-500/25 p-4"><h3 className="font-semibold">Prioridades para a próxima versão</h3><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">{relatorio.prioridades.map((p,i)=><li key={i}>{p}</li>)}</ol></div>
    {relatorio.pontos_fortes.length>0&&<div><h3 className="font-semibold">O que manter</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-300">{relatorio.pontos_fortes.map((p,i)=><li key={i}>{p}</li>)}</ul></div>}
    {relatorio.revisoes.length>0&&<div><h3 className="mb-3 font-semibold">Trechos para trabalhar</h3><div className="space-y-3">{relatorio.revisoes.map((v,i)=><article key={i} className="rounded-xl border border-slate-700 p-4"><blockquote className="border-l-2 border-indigo-500 pl-3 text-sm italic">{v.trecho}</blockquote><p className="mt-3 text-sm text-slate-300">{v.problema}</p><p className="mt-2 text-sm text-indigo-300">Sugestão: {v.sugestao}</p></article>)}</div></div>}
    {relatorio.alertas.length>0&&<div className="rounded-xl border border-amber-500/30 p-4 text-sm text-amber-200">{relatorio.alertas.map((a,i)=><p key={i} className="mt-1">{a}</p>)}</div>}
   </>:<p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{resultado.resultado.legado}</p>}
  </section>}
  {historico.length>0&&<section className="rounded-3xl border border-slate-800 p-4 sm:p-6"><h2 className="font-bold">Últimas correções neste navegador</h2><p className="mt-2 text-xs text-slate-400">Até cinco relatórios desta conta. Baixe as versões que quiser manter fora deste dispositivo.</p><div className="mt-4 space-y-2">{historico.map(h=><button key={h.id} className="w-full rounded-xl border border-slate-700 p-3 text-left text-sm hover:bg-slate-800" onClick={()=>{setResultado(h);setReutilizada(true)}}>{h.redacao.tema}<span className="mt-1 block text-xs text-slate-400">{new Date(h.criadaEm).toLocaleString('pt-BR')} · {h.resultado.relatorio?`${h.resultado.relatorio.nota}/${h.resultado.relatorio.maximo}`:'Relatório em texto'}</span></button>)}</div></section>}
 </div>
}

