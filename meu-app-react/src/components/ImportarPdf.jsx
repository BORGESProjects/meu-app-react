import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { API_URL } from '../api'

const field = 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100'
const button = 'rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed'
const labels = { PROCESSANDO: 'Extraindo questões', REVISAO: 'Pronto para revisar', ERRO: 'Precisa de atenção', PUBLICADO: 'Publicado' }

function baixar(nome, conteudo, tipo) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }))
  const link = document.createElement('a'); link.href = url; link.download = nome; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const sqlTexto = value => value == null ? 'null' : `'${String(value).replaceAll("'", "''")}'`
function gerarSql(job) {
  const header = `-- Gerado pelo AP Aprovado. Revise antes de executar no Supabase.\nbegin;\n\ncreate unique index if not exists questoes_identidade_unica\non public.questoes (banca, concurso, ano, modelo, numero_original);\n\n`
  const rows = job.questoes.map(q => `(${[
    sqlTexto(job.banca), sqlTexto(job.concurso), job.ano, sqlTexto(job.modelo), q.numero_original,
    sqlTexto(q.materia), sqlTexto(q.conteudo), sqlTexto(q.dificuldade), sqlTexto(q.enunciado),
    sqlTexto(q.texto_apoio), `${sqlTexto(JSON.stringify(q.opcoes))}::jsonb`, q.resposta_correta ?? 'null', Boolean(q.anulada)
  ].join(', ')})`).join(',\n')
  return `${header}insert into public.questoes (banca, concurso, ano, modelo, numero_original, materia, conteudo, dificuldade, enunciado, texto_apoio, opcoes, resposta_correta, anulada)\nvalues\n${rows}\non conflict (banca, concurso, ano, modelo, numero_original) do update set\nmateria=excluded.materia, conteudo=excluded.conteudo, dificuldade=excluded.dificuldade, enunciado=excluded.enunciado, texto_apoio=excluded.texto_apoio, opcoes=excluded.opcoes, resposta_correta=excluded.resposta_correta, anulada=excluded.anulada;\n\ncommit;\n`
}

async function api(path, options = {}) {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error('Entre com sua conta de administrador.')
  const response = await fetch(`${API_URL}/api/importacoes${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${data.session.access_token}`, 'X-Supabase-Key': import.meta.env.VITE_SUPABASE_ANON_KEY, ...options.headers },
    signal: AbortSignal.timeout(90000),
  }).catch(error => {
    if (error.name === 'TimeoutError') throw new Error('O servidor demorou para responder. Ele pode estar iniciando; aguarde um pouco e tente novamente. Seu rascunho continua salvo.')
    throw error
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Não foi possível concluir (${response.status}). Tente novamente.`)
  }
  return options.blob ? response.blob() : response.json()
}

export default function ImportarPdf({ onPublicado }) {
  const modoLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  const [session, setSession] = useState(null)
  const [adminId, setAdminId] = useState(null)
  const [accessAttempt, setAccessAttempt] = useState(0)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const userId = session?.user?.id
  const autorizado = Boolean(userId && adminId === userId)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [busy, setBusy] = useState(false)
  const [lista, setLista] = useState([])
  const [job, setJob] = useState(null)
  const [indice, setIndice] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [pdfs, setPdfs] = useState({})
  const urls = useRef([])
  const [meta, setMeta] = useState({ ano: new Date().getFullYear(), banca: '', concurso: '', modelo: 'A', esperadas: 50 })
  const [prova, setProva] = useState(null)
  const [gabarito, setGabarito] = useState(null)
  const [classificacao, setClassificacao] = useState({ feitos: 0, total: 0 })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, current) => {
      setSession(current)
      if (!current) { setJob(null); setLista([]); setAdminId(null) }
    })
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    let cancelled = false
    if (userId) {
      setCheckingAccess(true)
      setErro('')
      api('/acesso').then(() => api('')).then(items => {
        if (!cancelled) { setAdminId(userId); setLista(items); setErro('') }
      }).catch(e => { if (!cancelled) setErro(e.message) })
        .finally(() => { if (!cancelled) setCheckingAccess(false) })
    }
    return () => { cancelled = true }
  }, [userId, accessAttempt])
  useEffect(() => {
    if (job?.status !== 'PROCESSANDO') return
    let stopped = false
    let timer
    const poll = async () => {
      try {
        const next = await api(`/${job.id}`)
        if (!stopped) { setJob(next); setErro('') }
      } catch (e) { if (!stopped) setErro(`${e.message} A leitura continua no servidor; você pode voltar depois.`) }
      if (!stopped) timer = setTimeout(poll, 7000)
    }
    timer = setTimeout(poll, 7000)
    return () => { stopped = true; clearTimeout(timer) }
  }, [job?.id, job?.status])
  useEffect(() => {
    const warn = event => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  useEffect(() => () => urls.current.forEach(url => URL.revokeObjectURL(url)), [])

  async function run(fn) {
    setBusy(true); setErro(''); setAviso('')
    try { await fn() } catch (e) { setErro(e.name === 'TimeoutError' ? 'O servidor demorou para responder. Atualize a lista antes de tentar novamente.' : e.message) }
    finally { setBusy(false) }
  }
  async function login(event) {
    event.preventDefault()
    await run(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
      if (error) throw new Error('Não foi possível entrar. Confira e-mail, senha e confirmação do e-mail.')
      setSenha('')
    })
  }
  async function criarAcesso() {
    await run(async () => {
      if (!email.trim() || senha.length < 8) throw new Error('Informe o e-mail autorizado e uma senha com pelo menos 8 caracteres.')
      const { error } = await supabase.auth.signUp({ email: email.trim(), password: senha })
      if (error) throw new Error(error.message)
      setSenha(''); setAviso('Confira o e-mail de confirmação. Depois de confirmar, volte a esta aba e entre com sua senha. Se já tem conta, use Entrar.')
    })
  }
  function replaceJob(next) { setJob(next); setIndice(0); setDirty(false); setPdfs({}); urls.current.forEach(URL.revokeObjectURL); urls.current=[] }
  async function upload(event) {
    event.preventDefault()
    await run(async () => {
      if (!prova || !gabarito) throw new Error('Selecione a prova e o gabarito.')
      if ([prova,gabarito].some(f => f.size > 6 * 1024 * 1024 || !f.name.toLowerCase().endsWith('.pdf'))) throw new Error('Envie dois PDFs de até 6 MB cada.')
      const form = new FormData()
      form.append('prova', prova); form.append('gabarito', gabarito)
      Object.entries(meta).forEach(([k,v]) => form.append(k,v))
      replaceJob(await api('', { method: 'POST', body: form }))
      setLista(await api(''))
    })
  }
  function edit(name, value) {
    setJob(current => ({ ...current, questoes: current.questoes.map((q,i) => i === indice ? { ...q, [name]: value, revisada: name === 'revisada' ? value : false } : q) }))
    setDirty(true)
  }
  async function save(publish) {
    await run(async () => {
      const next = await api(`/${job.id}${publish ? '/publicar' : ''}`, { method: publish ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({version:job.version,questoes:job.questoes,ano:job.ano,banca:job.banca,concurso:job.concurso,esperadas:job.esperadas}) })
      setJob(next); setDirty(false); setLista(await api(''))
      setAviso(publish ? 'Questões publicadas! Já estão disponíveis no banco de questões e nos simulados.' : 'Rascunho salvo. Você pode continuar depois.')
      if (publish) onPublicado()
    })
  }
  async function verPdf(tipo) {
    await run(async () => {
      const blob = await api(`/${job.id}/arquivo/${tipo}`, { blob:true })
      const url = URL.createObjectURL(blob); urls.current.push(url)
      setPdfs(current => ({...current,[tipo]:url}))
    })
  }
  async function sugerirClassificacao() {
    await run(async () => {
      const sugestao = await api(`/${job.id}/classificar`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({questao:q})})
      setJob(current => ({...current, questoes:current.questoes.map((item,i)=>i===indice ? {...item, materia:sugestao.materia, conteudo:sugestao.conteudo, dificuldade:sugestao.dificuldade, revisada:false} : item)}))
      setDirty(true)
      setAviso('Sugestão aplicada. Confira a classificação e salve o rascunho.')
    })
  }
  async function classificarPendentes() {
    setBusy(true); setErro(''); setAviso('')
    let current = structuredClone(job)
    const pendentes = current.questoes.filter(item => !item.conteudo?.trim())
    setClassificacao({ feitos: 0, total: pendentes.length })
    try {
      for (let start=0; start<pendentes.length; start+=10) {
        const lote = pendentes.slice(start,start+10).map(item => ({ numero_original:item.numero_original }))
        const sugestoes = await api(`/${job.id}/classificar-lote`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({questoes:lote})})
        const porNumero = new Map(sugestoes.map(item => [item.numero_original,item]))
        current.questoes = current.questoes.map(item => {
          const sugestao=porNumero.get(item.numero_original)
          return sugestao ? {...item,materia:sugestao.materia,conteudo:sugestao.conteudo,dificuldade:sugestao.dificuldade,confianca_classificacao:sugestao.confianca,revisada:false} : item
        })
        setJob(structuredClone(current)); setDirty(true)
        setClassificacao({ feitos: Math.min(start+lote.length,pendentes.length), total:pendentes.length })
      }
      setAviso(`${pendentes.length} questões classificadas. Confira as sugestões e salve o rascunho.`)
    } catch (e) {
      setErro(`${e.message} As classificações já concluídas continuam nesta tela; salve o rascunho antes de tentar novamente.`)
    } finally { setBusy(false) }
  }
  function exportarJson() {
    baixar(`${job.banca}-${job.ano}-${job.modelo}.json`, JSON.stringify({formato:'ap-aprovado/v1',exportado_em:new Date().toISOString(),...job},null,2), 'application/json')
  }
  function exportarSql() {
    baixar(`${job.banca}-${job.ano}-${job.modelo}.sql`, gerarSql(job), 'text/sql;charset=utf-8')
  }
  async function aprovarCompletas() {
    const completa = item => item.materia?.trim() && item.conteudo?.trim() && item.enunciado?.trim() && item.opcoes?.length && item.opcoes.every(op=>op.trim()) && (item.anulada || item.resposta_correta != null)
    const aprovadas = job.questoes.filter(item=>completa(item)&&!item.revisada).length
    if (!aprovadas) {
      setErro('Nenhuma questão está completa para aprovação. Confira os contadores de classificação, alternativas e gabarito pendentes.')
      return
    }
    const questoes = job.questoes.map(item => {
      if (!completa(item) || item.revisada) return item
      return {...item,revisada:true}
    })
    await run(async () => {
      const next = await api(`/${job.id}`, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:job.version,questoes,ano:job.ano,banca:job.banca,concurso:job.concurso,esperadas:job.esperadas})})
      setJob(next); setDirty(false); setLista(await api(''))
      setAviso(`${aprovadas} questões completas foram aprovadas e o rascunho foi salvo. Revise somente os itens sinalizados antes de publicar.`)
    })
  }
  const q = job?.questoes[indice]
  const editavel = job && ['REVISAO','ERRO'].includes(job.status)
  const revisadas = job?.questoes.filter(item => item.revisada).length || 0
  const pendencias = job ? {
    classificacao: job.questoes.filter(item=>!item.materia?.trim()||!item.conteudo?.trim()).length,
    alternativas: job.questoes.filter(item=>!item.opcoes?.length||item.opcoes.some(op=>!op.trim())).length,
    gabarito: job.questoes.filter(item=>!item.anulada&&item.resposta_correta==null).length,
    revisao: job.questoes.filter(item=>!item.revisada).length,
    baixaConfianca: job.questoes.filter(item=>item.confianca_classificacao!=null&&item.confianca_classificacao<0.7).length,
  } : null
  const elegiveisLote = job?.questoes.filter(item=>!item.revisada&&item.materia?.trim()&&item.conteudo?.trim()&&item.enunciado?.trim()&&item.opcoes?.length&&item.opcoes.every(op=>op.trim())&&(item.anulada||item.resposta_correta!=null)).length || 0
  const bloqueiosPublicacao = job ? [
    dirty && 'Há alterações não salvas. Clique em Salvar rascunho.',
    job.questoes.length!==job.esperadas && `Quantidade: foram extraídas ${job.questoes.length}, mas o lote está configurado para ${job.esperadas}.`,
    pendencias.classificacao>0 && `${pendencias.classificacao} questão(ões) sem matéria ou conteúdo.`,
    pendencias.alternativas>0 && `${pendencias.alternativas} questão(ões) com alternativas incompletas.`,
    pendencias.gabarito>0 && `${pendencias.gabarito} questão(ões) sem resposta do gabarito.`,
    pendencias.revisao>0 && `${pendencias.revisao} questão(ões) ainda não aprovadas.`,
    job.questoes.some(item=>!item.pagina||item.pagina>job.paginas) && 'Há questões sem uma página válida no PDF.',
  ].filter(Boolean) : []

  return <section className="space-y-6">
    <header><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-extrabold">Importar provas em PDF</h1>{modoLocal&&<span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-bold text-emerald-200">IA LOCAL ATIVA</span>}</div><p className="text-slate-400 mt-2">Envie a prova e o gabarito, confira as questões e publique no acervo.</p></header>
    {erro && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-red-200">{erro}</p>}
    {aviso && <p role="status" className="rounded-xl bg-emerald-950/50 p-4 text-emerald-200">{aviso}</p>}
    {!session ? <form onSubmit={login} className="max-w-md space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-6">
      <h2 className="font-bold text-xl">Acesso do administrador</h2>
      <p className="text-sm text-slate-400">Use o e-mail autorizado para gerenciar as importações. Os visitantes continuam acessando as questões normalmente.</p>
      <label className="block">E-mail<input className={field} type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <label className="block">Senha<input className={field} type="password" required autoComplete="current-password" value={senha} onChange={e=>setSenha(e.target.value)} /></label>
      <button className={button} disabled={busy}>{busy?'Aguarde…':'Entrar'}</button>
      <button type="button" className="block text-sm text-indigo-300" disabled={busy} onClick={criarAcesso}>Primeiro acesso: criar minha conta</button>
    </form> : <div className="flex flex-wrap items-center gap-4 text-sm"><span>{session.user.email}</span><button onClick={()=>run(()=>supabase.auth.signOut())} disabled={busy} className="text-indigo-300">Sair da conta</button>{!autorizado && (checkingAccess ? <span className="text-slate-400">Validando acesso de administrador…</span> : <button className={button} onClick={()=>setAccessAttempt(value=>value+1)}>Tentar conectar novamente</button>)}</div>}
    {autorizado && <>
      {!job && <form onSubmit={upload} className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-6">
        <h2 className="text-xl font-bold">1. Enviar documentos</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label>Prova completa (PDF)<input className={field} type="file" accept="application/pdf,.pdf" required onChange={e=>setProva(e.target.files[0])} /></label>
          <label>Gabarito definitivo (PDF)<input className={field} type="file" accept="application/pdf,.pdf" required onChange={e=>setGabarito(e.target.files[0])} /></label>
          {[['ano','Ano da aplicação'],['banca','Banca / instituição'],['concurso','Nome da prova / concurso'],['modelo','Modelo do caderno'],['esperadas','Quantidade de questões objetivas']].map(([key,label])=><label key={key}>{label}<input className={field} required maxLength={160} type={['ano','esperadas'].includes(key)?'number':'text'} min={key==='ano'?1900:1} max={key==='ano'?2100:150} value={meta[key]} onChange={e=>setMeta({...meta,[key]:e.target.value})} /></label>)}
        </div>
        <p className="text-sm text-slate-400">Até 6 MB e 100 páginas por PDF; até 150 questões numeradas a partir de 1. No modo local, o PDF e a classificação permanecem no seu computador. Confira fórmulas, figuras e gabarito antes de publicar.</p>
        <button className={button} disabled={busy}>{busy?'Enviando…':'Extrair questões'}</button>
      </form>}
      {job && <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-wrap gap-4 items-center justify-between"><h2 className="text-xl font-bold">{job.concurso} · {job.ano} · Modelo {job.modelo}</h2><button disabled={busy||dirty} className="text-sm text-indigo-300 disabled:opacity-40" onClick={()=>replaceJob(null)}>Voltar às importações</button></div>
        <p role="status">{labels[job.status]} — {job.progresso}/{job.esperadas} questões processadas</p>
        {job.status==='REVISAO' && job.questoes.length<job.esperadas && <p className="text-amber-200">A leitura identificou {job.questoes.length} de {job.esperadas} questões. Confira a numeração e adicione as ausentes antes de publicar.</p>}
        {job.status==='PROCESSANDO' && <><progress className="w-full" value={job.progresso} max={job.esperadas} /><p className="text-sm text-slate-400">A leitura pode levar alguns minutos. Você pode sair desta aba e voltar depois.</p></>}
        {job.erro && <p className="text-amber-200">{job.erro}</p>}
        {(job.status==='ERRO' || (job.status==='REVISAO' && job.questoes.length<job.esperadas)) && <button disabled={busy||dirty} className={button} onClick={()=>run(async()=>setJob(await api(`/${job.id}/continuar`,{method:'POST'})))}>Continuar extração</button>}
        {job.status==='PUBLICADO' && <p className="text-emerald-300">Esta prova está publicada no acervo.</p>}
        {editavel && <>
          <h3 className="font-bold text-lg">2. Conferir e corrigir</h3>
          <details><summary className="text-indigo-300 cursor-pointer">Corrigir dados da prova</summary><div className="grid md:grid-cols-2 gap-3 mt-3">{[['ano','Ano'],['banca','Banca'],['concurso','Concurso'],['esperadas','Quantidade de questões']].map(([key,label])=><label key={key}>{label}<input className={field} type={['ano','esperadas'].includes(key)?'number':'text'} value={job[key]} onChange={e=>{setJob({...job,[key]:['ano','esperadas'].includes(key)?Number(e.target.value):e.target.value});setDirty(true)}} /></label>)}</div></details>
          <p className="text-sm text-slate-400">Confira o enunciado, os textos de apoio e o gabarito de cada questão. Marque “Conferi esta questão” ao terminar. Alterações ficam pendentes até salvar.</p>
          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4 space-y-3">
            <h4 className="font-semibold">Automação em lote</h4>
            <div className="flex flex-wrap gap-3 text-sm"><span>Classificação pendente: {pendencias.classificacao}</span><span>Baixa confiança: {pendencias.baixaConfianca}</span><span>Alternativas incompletas: {pendencias.alternativas}</span><span>Gabarito pendente: {pendencias.gabarito}</span><span>Revisão pendente: {pendencias.revisao}</span></div>
            {classificacao.total>0 && <progress className="w-full" value={classificacao.feitos} max={classificacao.total} />}
            <div className="flex flex-wrap gap-3"><button className={button} disabled={!modoLocal||busy||dirty||pendencias.classificacao===0} onClick={classificarPendentes}>{busy&&classificacao.total?'Classificando…':`Classificar ${pendencias.classificacao} pendentes com IA local`}</button><button className={button} disabled={busy||elegiveisLote===0} onClick={aprovarCompletas}>Aprovar e salvar {elegiveisLote} completas</button><button className={button} disabled={busy} onClick={exportarJson}>Exportar JSON</button><button className={button} disabled={busy} onClick={exportarSql}>Exportar SQL</button></div>
            {elegiveisLote===0&&pendencias.revisao>0&&<p className="text-amber-200 text-sm">Ainda não há questões completas para aprovação automática. Resolva as pendências indicadas acima.</p>}
            {!modoLocal&&<p className="text-amber-200 text-sm">Para usar a IA sem enviar as questões à nuvem, abra o Importador Local no seu computador.</p>}
            {dirty&&pendencias.classificacao>0&&<p className="text-amber-200 text-sm">Salve o rascunho antes de iniciar outro lote de classificação.</p>}
            <p className="text-xs text-slate-400">Após extrair o PDF, a IA local preenche automaticamente matéria, conteúdo e dificuldade em lotes de dez. Revise apenas baixa confiança, alternativas ou gabaritos pendentes. Nenhum texto é enviado a provedores de IA.</p>
          </div>
          <div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={()=>verPdf('prova')}>Abrir prova para conferir</button><button className={button} disabled={busy} onClick={()=>verPdf('gabarito')}>Abrir gabarito para conferir</button></div>
          {Object.entries(pdfs).map(([tipo,url])=><details key={tipo} open><summary className="text-indigo-300">{tipo==='prova'?'Prova original':'Gabarito original'}</summary><a href={url} target="_blank" rel="noreferrer" className="text-sm underline">Abrir PDF em outra aba</a><iframe title={`${tipo} para conferência`} src={`${url}#page=${tipo==='prova'?(q?.pagina||1):1}`} className="w-full h-96 bg-white rounded-lg" /></details>)}
          <div className="flex flex-wrap gap-2">{job.questoes.map((item,i)=><button key={i} aria-label={`Revisar questão ${item.numero_original}`} className={`px-3 py-2 rounded-lg border ${i===indice?'border-indigo-400 bg-indigo-700':'border-slate-700'} ${item.revisada?'text-emerald-300':''}`} onClick={()=>setIndice(i)}>{item.numero_original}{item.revisada?' ✓':''}</button>)}</div>
          {q && <div className="space-y-4 border border-slate-700 rounded-xl p-4">
            <h4 className="font-bold">Questão {q.numero_original}</h4>
            <p className="text-sm text-slate-400">Você pode preencher a classificação manualmente ou usar o modelo instalado no seu computador.</p>
            <button className={button} disabled={!modoLocal||busy} onClick={sugerirClassificacao}>{busy?'Aguarde…':'Sugerir matéria, conteúdo e dificuldade com IA local'}</button>
            {q.observacao && <p className="text-amber-200 text-sm">Conferência sugerida: {q.observacao}</p>}
            <div className="grid md:grid-cols-3 gap-3">{[['numero_original','Número original'],['pagina','Página no PDF'],['materia','Matéria'],['conteudo','Conteúdo']].map(([key,label])=><label key={key}>{label}<input className={field} type={['numero_original','pagina'].includes(key)?'number':'text'} value={q[key]} onChange={e=>edit(key,['numero_original','pagina'].includes(key)?Number(e.target.value):e.target.value)} /></label>)}
              <label>Dificuldade estimada<select className={field} value={q.dificuldade} onChange={e=>edit('dificuldade',e.target.value)}>{['Fácil','Média','Difícil'].map(v=><option key={v}>{v}</option>)}</select></label>
            </div>
            <label className="block">Texto de apoio<textarea className={field} rows={5} value={q.texto_apoio} onChange={e=>edit('texto_apoio',e.target.value)} /></label>
            <label className="block">Enunciado<textarea className={field} rows={5} value={q.enunciado} onChange={e=>edit('enunciado',e.target.value)} /></label>
            {q.opcoes.map((op,i)=><label className="block" key={i}>Alternativa {'ABCDE'[i]}<textarea className={field} rows={2} value={op} onChange={e=>edit('opcoes',q.opcoes.map((o,n)=>i===n?e.target.value:o))} /></label>)}
            <div className="flex gap-4 flex-wrap"><label>Alternativas<select className={field} value={q.opcoes.length} onChange={e=>edit('opcoes',Array.from({length:Number(e.target.value)},(_,i)=>q.opcoes[i]||''))}>{[2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label><label>Resposta correta<select className={field} disabled={q.anulada} value={q.resposta_correta??''} onChange={e=>edit('resposta_correta',e.target.value===''?null:Number(e.target.value))}><option value="">Conferir gabarito</option>{q.opcoes.map((_,i)=><option key={i} value={i}>{'ABCDE'[i]}</option>)}</select></label></div>
            <label className="block"><input type="checkbox" checked={q.anulada} onChange={e=>edit('anulada',e.target.checked)} /> Anulada no gabarito oficial</label>
            <label className="block"><input type="checkbox" checked={q.tem_imagem} onChange={e=>edit('tem_imagem',e.target.checked)} /> Exibir página original com figura, gráfico ou tirinha</label>
            <label className="block text-emerald-300"><input type="checkbox" checked={q.revisada} onChange={e=>edit('revisada',e.target.checked)} /> Conferi esta questão e o gabarito no PDF</label>
            <button className="text-red-300 text-sm" onClick={()=>{setJob({...job,questoes:job.questoes.filter((_,i)=>i!==indice)});setIndice(0);setDirty(true)}}>Remover esta questão do rascunho</button>
          </div>}
          {job.questoes.length < job.esperadas && <button className={button} onClick={()=>{const n=Array.from({length:job.esperadas},(_,i)=>i+1).find(n=>!job.questoes.some(q=>q.numero_original===n));setJob({...job,questoes:[...job.questoes,{numero_original:n,pagina:1,materia:'',conteudo:'',dificuldade:'Média',texto_apoio:'',enunciado:'',opcoes:['','','','',''],resposta_correta:null,anulada:false,tem_imagem:false,revisada:false}]});setIndice(job.questoes.length);setDirty(true)}}>Adicionar questão ausente</button>}
          <div className="sticky bottom-2 bg-slate-950 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3"><span className="text-sm">{revisadas}/{job.esperadas} aprovadas{dirty?' · alterações não salvas':''}</span><button className={button} disabled={busy} onClick={()=>save(false)}>Salvar rascunho</button><button className={button+' bg-emerald-700'} disabled={busy||dirty||bloqueiosPublicacao.length>0} onClick={()=>save(true)}>Publicar {job.questoes.length} questões</button></div>
            {bloqueiosPublicacao.length>0&&<div className="rounded-lg bg-amber-950/50 p-3 text-sm text-amber-100"><strong>Antes de publicar:</strong><ul className="mt-1 list-disc pl-5">{bloqueiosPublicacao.map(item=><li key={item}>{item}</li>)}</ul>{job.questoes.length>0&&job.questoes.length!==job.esperadas&&<button className="mt-2 underline" onClick={()=>{setJob({...job,esperadas:job.questoes.length});setDirty(true)}}>Usar as {job.questoes.length} questões extraídas como tamanho deste lote</button>}</div>}
          </div>
        </>}
      </div>}
      {!job && <section className="space-y-3"><div className="flex gap-4 items-center"><h2 className="font-bold text-xl">Minhas importações</h2><button disabled={busy} className="text-indigo-300 text-sm" onClick={()=>run(async()=>setLista(await api('')))}>Atualizar lista</button></div>{!lista.length&&<p className="text-slate-400">Suas provas aparecerão aqui após o envio.</p>}{lista.map(item=><button key={item.id} disabled={busy} className="block w-full rounded-xl border border-slate-700 p-4 text-left hover:bg-slate-900" onClick={()=>run(async()=>replaceJob(await api(`/${item.id}`)))}><strong>{item.concurso} · {item.ano} · {item.modelo}</strong><span className="block text-sm text-slate-400">{labels[item.status]} · {item.progresso}/{item.esperadas}</span></button>)}</section>}
    </>}
  </section>
}
