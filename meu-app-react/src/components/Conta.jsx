import { useState } from 'react'
import { supabase } from '../supabaseClient'

const field = 'w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30'
const button = 'rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50'

export default function Conta({ session, isAdmin, checkingAdmin, sincronizacao, totais }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [modo, setModo] = useState('entrar')
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  async function enviar(event) {
    event.preventDefault()
    setBusy(true); setErro(''); setAviso('')
    try {
      if (senha.length < 8) throw new Error('Use uma senha com pelo menos 8 caracteres.')
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
        if (error) throw new Error('Não foi possível entrar. Confira o e-mail, a senha e a confirmação do cadastro.')
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha })
        if (error) throw new Error(error.message)
        setAviso(data.session ? 'Conta criada e conectada.' : 'Conta criada. Confirme o e-mail recebido e depois entre no site.')
      }
      setSenha('')
    } catch (e) { setErro(e.message) }
    finally { setBusy(false) }
  }

  if (session) return <section className="mx-auto max-w-xl rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl sm:p-8">
    <h1 className="text-2xl font-extrabold sm:text-3xl">Minha conta</h1>
    <p className="mt-2 text-slate-400">Você está conectado como:</p>
    <p className="mt-4 break-all rounded-2xl bg-slate-950/70 p-4 font-semibold text-slate-100">{session.user.email}</p>
    <div className="mt-5 grid grid-cols-1 gap-3 min-[380px]:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center"><p className="text-xl font-bold text-indigo-300">{(totais?.horas || 0).toFixed(1)}h</p><p className="mt-1 text-xs text-slate-500">Estudo</p></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center"><p className="text-xl font-bold text-slate-100">{totais?.questoes || 0}</p><p className="mt-1 text-xs text-slate-500">Questões</p></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center"><p className="text-xl font-bold text-emerald-400">{totais?.acertos || 0}</p><p className="mt-1 text-xs text-slate-500">Acertos</p></div>
    </div>
    <p className={`mt-4 text-xs ${sincronizacao === 'erro' ? 'text-red-300' : 'text-slate-400'}`}>
      {sincronizacao === 'salvando' ? 'Salvando progresso…' : sincronizacao === 'erro' ? 'Falha ao salvar o progresso.' : '✓ Progresso sincronizado com sua conta'}
    </p>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${isAdmin ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-800 text-slate-300'}`}>
        {checkingAdmin ? 'Verificando acesso…' : isAdmin ? 'Administrador' : 'Usuário'}
      </span>
      <button className="text-sm font-semibold text-indigo-300 hover:text-indigo-200" onClick={() => supabase.auth.signOut()}>Sair da conta</button>
    </div>
    {isAdmin && <p className="mt-5 text-sm text-slate-400">As áreas Cadastrar e Importar PDF estão liberadas no menu para esta conta.</p>}
  </section>

  return <section className="mx-auto max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl sm:p-8">
    <h1 className="text-2xl font-extrabold sm:text-3xl">{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</h1>
    <p className="mt-2 text-sm text-slate-400">Acesse sua conta para usar o AP Aprovado.</p>
    {erro && <p role="alert" className="mt-5 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">{erro}</p>}
    {aviso && <p role="status" className="mt-5 rounded-xl bg-emerald-950/50 p-3 text-sm text-emerald-200">{aviso}</p>}
    <form onSubmit={enviar} className="mt-6 space-y-4">
      <label className="block text-sm font-semibold text-slate-300">E-mail<input className={`${field} mt-2`} type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="block text-sm font-semibold text-slate-300">Senha<input className={`${field} mt-2`} type="password" required minLength={8} autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} value={senha} onChange={e => setSenha(e.target.value)} /></label>
      <button className={`${button} w-full`} disabled={busy}>{busy ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Cadastrar'}</button>
    </form>
    <button className="mt-5 w-full text-sm font-semibold text-indigo-300" onClick={() => { setModo(modo === 'entrar' ? 'cadastrar' : 'entrar'); setErro(''); setAviso('') }}>
      {modo === 'entrar' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}
    </button>
  </section>
}
