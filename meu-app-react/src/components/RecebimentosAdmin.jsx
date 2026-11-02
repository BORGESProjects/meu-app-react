import { useCallback, useEffect, useState } from 'react'
import { API_URL, fetchApi } from '../api'
import { supabase } from '../supabaseClient'

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})
}

function dataHora(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR', {dateStyle:'short', timeStyle:'short'}) : '—'
}

export default function RecebimentosAdmin({ session }) {
  const [relatorio, setRelatorio] = useState(null)
  const [conta, setConta] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [conectando, setConectando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const {data} = await supabase.auth.getSession()
      const accessToken = data.session?.access_token || session?.access_token
      if (!accessToken) throw new Error('Entre novamente com a conta administradora.')
      const headers = {Authorization:`Bearer ${accessToken}`, 'X-Supabase-Key':import.meta.env.VITE_SUPABASE_ANON_KEY}
      const [respostaRecebimentos, respostaConta] = await Promise.all([
        fetchApi(`${API_URL}/api/acesso/admin/recebimentos`, {headers}),
        fetchApi(`${API_URL}/api/acesso/admin/mercado-pago/status`, {headers}),
      ])
      const [dados, statusConta] = await Promise.all([
        respostaRecebimentos.json().catch(() => ({})),
        respostaConta.json().catch(() => ({})),
      ])
      if (!respostaRecebimentos.ok || !respostaConta.ok) {
        throw new Error(dados.message || statusConta.message || 'Não foi possível carregar o painel financeiro.')
      }
      setRelatorio(dados)
      setConta(statusConta)
    } catch (falha) {
      setErro(falha.message || 'Não foi possível carregar os recebimentos.')
    } finally {
      setCarregando(false)
    }
  }, [session?.access_token])

  useEffect(() => { carregar() }, [carregar])

  async function conectarConta() {
    setConectando(true)
    setErro('')
    try {
      const {data} = await supabase.auth.getSession()
      const accessToken = data.session?.access_token || session?.access_token
      if (!accessToken) throw new Error('Entre novamente com a conta administradora.')
      const resposta = await fetchApi(`${API_URL}/api/acesso/admin/mercado-pago/conectar`, {
        method:'POST',
        headers:{Authorization:`Bearer ${accessToken}`, 'X-Supabase-Key':import.meta.env.VITE_SUPABASE_ANON_KEY, 'Content-Type':'application/json'},
        body:'{}',
      })
      const dados = await resposta.json().catch(() => ({}))
      let destino
      try { destino = new URL(dados.url) } catch { throw new Error(dados.message || 'O servidor não retornou a autorização do Mercado Pago.') }
      if (!resposta.ok || destino.hostname !== 'auth.mercadopago.com' || destino.protocol !== 'https:') {
        throw new Error(dados.message || 'O servidor não retornou uma autorização válida do Mercado Pago.')
      }
      window.location.assign(destino.href)
    } catch (falha) {
      setErro(falha.message || 'Não foi possível iniciar a conexão.')
      setConectando(false)
    }
  }

  return <section className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-lime-300">Área administrativa</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-100 sm:text-3xl">Recebimentos</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">Este painel e os endpoints financeiros exigem a conta administradora configurada no servidor.</p>
      </div>
      <button type="button" onClick={carregar} disabled={carregando} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50">{carregando ? 'Atualizando…' : 'Atualizar'}</button>
    </header>

    {erro && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/25 p-4 text-sm text-rose-200">{erro}</p>}

    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5" aria-labelledby="titulo-conta-recebedora">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="titulo-conta-recebedora" className="font-bold text-slate-100">Conta recebedora</h2>
          <p className="mt-1 text-sm text-slate-400">{conta?.conectado ? `Mercado Pago conectado · vendedor ${conta.vendedorId}` : 'Conecte a sua conta do Mercado Pago para receber as mensalidades.'}</p>
          {conta?.conectado && <p className="mt-1 text-xs text-slate-500">Token renovado automaticamente · válido até {dataHora(conta.tokenValidoAte)}</p>}
        </div>
        <button type="button" onClick={conectarConta} disabled={conectando || carregando} className="rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-lime-300 disabled:opacity-50">{conectando ? 'Abrindo Mercado Pago…' : conta?.conectado ? 'Reconectar conta' : 'Conectar Mercado Pago'}</button>
      </div>
    </section>

    <div className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo deste mês antes das taxas</p>
        <p className="mt-2 text-3xl font-extrabold text-emerald-300">{carregando ? '—' : moeda(relatorio?.saldoMesAntesTaxas)}</p>
        <p className="mt-1 text-xs text-slate-500">Mensalidades aprovadas menos estornos e contestações; as tarifas do Mercado Pago não estão descontadas.</p>
      </article>
      <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mensalidades aprovadas neste mês</p>
        <p className="mt-2 text-3xl font-extrabold text-slate-100">{carregando ? '—' : (relatorio?.pagamentosAprovadosMes || 0).toLocaleString('pt-BR')}</p>
        <p className="mt-1 text-xs text-slate-500">Atualizado pelos avisos confirmados pelo Mercado Pago.</p>
      </article>
    </div>

    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70" aria-labelledby="titulo-historico-recebimentos">
      <div className="border-b border-slate-800 px-4 py-4 sm:px-5">
        <h2 id="titulo-historico-recebimentos" className="font-bold text-slate-100">Histórico de pagamentos</h2>
        <p className="mt-1 text-xs text-slate-400">Exibindo até os 200 recebimentos mais recentes.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-3 font-semibold">Data</th><th className="px-4 py-3 font-semibold">Assinante</th><th className="px-4 py-3 font-semibold">Pagamento</th><th className="px-4 py-3 font-semibold">Valor</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Acesso até</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {relatorio?.recebimentos?.map(item => <tr key={`${item.referencia}-${item.recebidoEm}`} className="text-slate-300">
              <td className="whitespace-nowrap px-4 py-3">{dataHora(item.recebidoEm)}</td><td className="px-4 py-3">{item.email}</td><td className="px-4 py-3 font-mono text-xs">{item.referencia}</td><td className="whitespace-nowrap px-4 py-3 font-semibold">{moeda(item.valor)}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'approved' ? 'bg-emerald-400/10 text-emerald-200' : 'bg-amber-400/10 text-amber-200'}`}>{item.status === 'approved' ? 'Aprovado' : item.status === 'refunded' ? 'Estornado' : 'Contestado'}</span></td><td className="whitespace-nowrap px-4 py-3">{dataHora(item.acessoValidoAte)}</td>
            </tr>)}
            {!carregando && !relatorio?.recebimentos?.length && <tr><td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-500">Nenhum pagamento confirmado chegou pelo webhook ainda.</td></tr>}
            {carregando && <tr><td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-400">Carregando o histórico…</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </section>
}
