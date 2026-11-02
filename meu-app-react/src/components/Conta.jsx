import { useEffect, useRef, useState } from 'react'
import { mensagemErroCadastro } from '../errosAutenticacao'
import { supabase, sairDaConta } from '../supabaseClient'
import { API_URL, fetchApi } from '../api'
import { aplicativoNativo } from '../plataforma'
import SeletorFoco from './SeletorFoco'

const field = 'w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30'
const button = 'rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50'
const controleComercialAtivo=import.meta.env.VITE_ACESSO_COMERCIAL_ATIVO==='true'

export default function Conta({ session, isAdmin, checkingAdmin, sincronizacao, totais, preferenciaFoco, onEscolherFoco, focoBloqueado, onVerDesempenho }) {
  const enviando = useRef(false)
  const [email, setEmail] = useState(session?.user?.email || '')
  const [senha, setSenha] = useState('')
  const [modo, setModo] = useState(() => new URLSearchParams(window.location.search).get('cadastro') === '1' ? 'cadastrar' : 'entrar')
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [iniciandoCheckout, setIniciandoCheckout] = useState(false)
  const [erroCheckout, setErroCheckout] = useState('')
  const [precoMensal, setPrecoMensal] = useState(null)
  const [acessoComercial, setAcessoComercial] = useState({estado:'carregando', validoAte:null, cancelamentoAgendado:false})

  useEffect(() => {
    const controlador = new AbortController()
    fetchApi(`${API_URL}/api/acesso/preco`, {signal:controlador.signal})
      .then(resposta => resposta.ok ? resposta.json() : null)
      .then(dados => {
        const valor = Number(dados?.valorMensal)
        if (Number.isFinite(valor) && valor > 0 && !controlador.signal.aborted) setPrecoMensal(valor)
      })
      .catch(() => {})
    return () => controlador.abort()
  }, [])

  useEffect(() => {
    if (!controleComercialAtivo || !session?.user?.id || session.offline) {
      setAcessoComercial({estado:session?.offline ? 'offline' : 'indisponivel', validoAte:null, cancelamentoAgendado:false})
      return
    }
    const controlador = new AbortController()
    supabase.auth.getSession().then(async ({data,error}) => {
      if (error || !data.session?.access_token) throw Error('Sessão indisponível')
      const resposta = await fetchApi(`${API_URL}/api/acesso/status`, {
        headers:{Authorization:`Bearer ${data.session.access_token}`, 'X-Supabase-Key':import.meta.env.VITE_SUPABASE_ANON_KEY},
        signal:controlador.signal,
      })
      if (!resposta.ok) throw Error('Não foi possível consultar o acesso')
      const status = await resposta.json()
      if (!controlador.signal.aborted) setAcessoComercial({estado:status.liberado ? 'ativo' : 'pendente', validoAte:status.validoAte, cancelamentoAgendado:Boolean(status.cancelamentoAgendado)})
    }).catch(() => {
      if (!controlador.signal.aborted) setAcessoComercial({estado:'indisponivel', validoAte:null, cancelamentoAgendado:false})
    })
    return () => controlador.abort()
  }, [session?.user?.id, session?.offline])

  async function enviar(event) {
    event.preventDefault()
    if (enviando.current) return
    enviando.current = true
    setBusy(true); setErro(''); setAviso('')
    try {
      if (senha.length < 8) throw new Error('Use uma senha com pelo menos 8 caracteres.')
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
        if (error) throw new Error('Não foi possível entrar. Confira o e-mail, a senha e a confirmação do cadastro.')
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha })
        if (error) throw new Error(mensagemErroCadastro(error))
        setAviso(data.session ? 'Conta criada e conectada.' : 'Conta criada. Confirme o e-mail recebido e depois entre no site.')
      }
      setSenha('')
    } catch (e) { setErro(e.message) }
    finally { enviando.current = false; setBusy(false) }
  }

  async function iniciarAssinatura() {
    setIniciandoCheckout(true); setErroCheckout('')
    try {
      const resposta = await fetchApi(`${API_URL}/api/acesso/checkout`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:session?.user?.email || email.trim()}),
      })
      const dados = await resposta.json().catch(() => ({}))
      let hostCheckout = ''
      try { hostCheckout = new URL(dados.url).hostname } catch { /* Resposta sem destino de checkout válido. */ }
      if (!resposta.ok || !['www.mercadopago.com.br','mercadopago.com.br','www.mercadopago.com','mercadopago.com'].includes(hostCheckout)) {
        throw new Error(dados.message || 'Não foi possível iniciar a assinatura agora.')
      }
      if (aplicativoNativo && globalThis.__TAURI_INTERNALS__) {
        const {openUrl} = await import('@tauri-apps/plugin-opener')
        await openUrl(dados.url)
      } else window.location.assign(dados.url)
    } catch (erro) {
      setErroCheckout(erro.message || 'Não foi possível iniciar a assinatura agora.')
      setIniciandoCheckout(false)
    }
  }

  if (session) return <section className="mx-auto max-w-xl rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl sm:p-8">
    <h1 className="text-2xl font-extrabold sm:text-3xl">Minha conta</h1>
    <p className="mt-2 text-slate-400">Você está conectado como:</p>
    <p className="mt-4 break-all rounded-2xl bg-slate-950/70 p-4 font-semibold text-slate-100">{session.user.email}</p>
    {controleComercialAtivo && <div role="status" className={`mt-4 rounded-2xl border p-4 text-sm ${acessoComercial.estado === 'ativo' ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-100' : 'border-lime-500/25 bg-lime-950/15 text-slate-200'}`}>
      {acessoComercial.estado === 'ativo' ? <span><strong>Acesso ativo</strong>{acessoComercial.validoAte && <span> até {new Date(acessoComercial.validoAte).toLocaleDateString('pt-BR')}</span>}{acessoComercial.cancelamentoAgendado && <span>. A assinatura termina nesta data.</span>}</span>
        : acessoComercial.estado === 'carregando' ? 'Consultando a confirmação do pagamento…'
        : acessoComercial.estado === 'pendente' ? 'Pagamento ainda não confirmado para este e-mail. Após a confirmação da assinatura, entre novamente para liberar seu acesso.'
        : acessoComercial.estado === 'offline' ? 'O acesso comercial precisa ser validado quando houver conexão com a internet.'
        : 'O status do acesso não pôde ser verificado agora. Tente novamente em instantes.'}
    </div>}
    {controleComercialAtivo && acessoComercial.estado === 'ativo' && <section aria-label="Plano e mensalidade" className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="grid gap-4 min-[420px]:grid-cols-2">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plano atual</p><p className="mt-1 font-bold text-slate-100">Acesso mensal</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mensalidade</p><p className="mt-1 font-bold text-slate-100">{precoMensal == null ? 'Consulte o checkout' : precoMensal.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}<span className="ml-1 text-xs font-medium text-slate-400">/ mês</span></p></div>
      </div>
      {acessoComercial.validoAte && <p className="mt-4 border-t border-slate-800 pt-3 text-sm text-slate-300">{acessoComercial.cancelamentoAgendado ? 'Acesso válido até' : 'Próxima renovação prevista para'} <strong>{new Date(acessoComercial.validoAte).toLocaleDateString('pt-BR')}</strong></p>}
      <a href="/#planos" className="mt-4 inline-flex text-sm font-semibold text-lime-200 hover:text-lime-100">Ver condições da assinatura</a>
    </section>}
    {controleComercialAtivo && acessoComercial.estado !== 'ativo' && <div className="mt-4">
      <button type="button" onClick={iniciarAssinatura} disabled={iniciandoCheckout} className={`${button} w-full`}>
        {iniciandoCheckout ? 'Abrindo Mercado Pago…' : precoMensal == null ? 'Assinar mensalmente' : `Assinar por ${precoMensal.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})} ao mês`}
      </button>
      {erroCheckout && <p role="alert" className="mt-2 text-sm text-amber-200">{erroCheckout}</p>}
    </div>}
    <div className="mt-5 grid grid-cols-1 gap-3 min-[380px]:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center"><p className="text-xl font-bold text-indigo-300">{(totais?.horas || 0).toFixed(1)}h</p><p className="mt-1 text-xs text-slate-500">Estudo</p></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center"><p className="text-xl font-bold text-slate-100">{totais?.questoes || 0}</p><p className="mt-1 text-xs text-slate-500">Questões</p></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center"><p className="text-xl font-bold text-emerald-400">{totais?.acertos || 0}</p><p className="mt-1 text-xs text-slate-500">Acertos</p></div>
    </div>
    {onVerDesempenho && <button type="button" onClick={onVerDesempenho} className="mt-3 w-full rounded-xl border border-indigo-400/25 bg-indigo-400/10 px-4 py-3 text-sm font-semibold text-indigo-100 hover:bg-indigo-400/15">Abrir painel de desempenho</button>}
    <div className="mt-7 border-t border-slate-800 pt-6">
      <h2 className="mb-1 text-lg font-bold text-slate-100">Preferências de estudo</h2>
      <p className="mb-4 text-sm text-slate-400">Escolha quais tipos de questões aparecem no seu espaço de estudo.</p>
      <SeletorFoco preferencia={preferenciaFoco} onEscolher={onEscolherFoco} bloqueado={focoBloqueado} />
    </div>
    <p className={`mt-4 text-xs ${sincronizacao === 'erro' ? 'text-red-300' : 'text-slate-400'}`}>
      {sincronizacao === 'salvo' ? '✓ Progresso sincronizado com sua conta' : sincronizacao === 'erro' ? 'Sincronização pendente. As alterações serão reenviadas automaticamente.' : 'Sincronizando progresso…'}
    </p>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${isAdmin ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-800 text-slate-300'}`}>
        {checkingAdmin ? 'Verificando acesso…' : isAdmin ? 'Administrador' : 'Usuário'}
      </span>
      <button className="text-sm font-semibold text-indigo-300 hover:text-indigo-200" onClick={() => sairDaConta()}>Sair da conta</button>
    </div>
    {session.offline && <form onSubmit={enviar} className="mt-5 space-y-3"><p className="text-sm text-amber-200">Você está estudando com sua conta local. Para renovar o acesso e sincronizar, conecte-se à internet e entre novamente.</p><label className="block">Senha<input type="password" autoComplete="current-password" value={senha} onChange={e=>setSenha(e.target.value)} required minLength={8} className={field}/></label><button disabled={busy} className={button}>Reconectar à conta</button>{erro && <p role="alert">{erro}</p>}</form>}
    {isAdmin && <p className="mt-5 text-sm text-slate-400">As áreas Cadastrar e Importar PDF estão liberadas no menu para esta conta.</p>}
  </section>

  return <section className="mx-auto max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl sm:p-8">
    <h1 className="text-2xl font-extrabold sm:text-3xl">{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</h1>
    <p className="mt-2 text-sm text-slate-400">{controleComercialAtivo ? 'Após confirmar sua assinatura, crie seu login com o e-mail usado no pagamento. Você define a senha; ela nunca é gerada ou enviada pelo sistema.' : 'Acesse sua conta para continuar seus estudos e sincronizar seu progresso.'}</p>
    {erro && <p role="alert" className="mt-5 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">{erro}</p>}
    {aviso && <p role="status" className="mt-5 rounded-xl bg-emerald-950/50 p-3 text-sm text-emerald-200">{aviso}</p>}
    <form onSubmit={enviar} className="mt-6 space-y-4">
      <label className="block text-sm font-semibold text-slate-300">E-mail<input className={`${field} mt-2`} type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="block text-sm font-semibold text-slate-300">Senha<input className={`${field} mt-2`} type="password" required minLength={8} autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} value={senha} onChange={e => setSenha(e.target.value)} /></label>
      <button className={`${button} w-full`} disabled={busy}>{busy ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Cadastrar'}</button>
    </form>
    {controleComercialAtivo && <div className="mt-4">
      <button type="button" onClick={iniciarAssinatura} disabled={iniciandoCheckout || !email.trim()} className="w-full rounded-2xl border border-lime-400/40 bg-lime-400/10 px-5 py-3 text-sm font-semibold text-lime-100 transition hover:bg-lime-400/15 disabled:cursor-not-allowed disabled:opacity-50">
        {iniciandoCheckout ? 'Abrindo Mercado Pago…' : precoMensal == null ? 'Assinar mensalmente pelo Mercado Pago' : `Assinar por ${precoMensal.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})} ao mês`}
      </button>
      {erroCheckout && <p role="alert" className="mt-2 rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-sm text-amber-200">{erroCheckout}</p>}
      <p className="mt-2 text-center text-xs text-slate-500">Use o mesmo e-mail no pagamento e no cadastro.</p>
    </div>}
    <button className="mt-5 w-full text-sm font-semibold text-indigo-300 disabled:opacity-50" disabled={busy} onClick={() => { setModo(modo === 'entrar' ? 'cadastrar' : 'entrar'); setErro(''); setAviso('') }}>
      {modo === 'entrar' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}
    </button>
  </section>
}
