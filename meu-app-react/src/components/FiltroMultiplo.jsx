import { useMemo, useState } from 'react'

function normalizarBusca(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

const limiteAcervoPequeno = 10

function quantidadeDaOpcao(opcao) {
  if (opcao.quantidade !== undefined && opcao.quantidade !== null && opcao.quantidade !== '') {
    const quantidade = Number(opcao.quantidade)
    return Number.isFinite(quantidade) ? quantidade : null
  }
  const contagem = String(opcao.label ?? '').match(/\\(([\\d.,]+)\\)\\s*$/)
  return contagem ? Number(contagem[1].replace(/\\D/g, '')) : null
}

export default function FiltroMultiplo({ titulo, opcoes, selecionados, aoAlterar, rotuloTodos, compactarAcervoPequeno = false }) {
  const [busca, setBusca] = useState('')
  const [mostrarAcervoPequeno, setMostrarAcervoPequeno] = useState(false)

  function alternar(valor) {
    aoAlterar(selecionados.includes(valor)
      ? selecionados.filter(item => item !== valor)
      : [...selecionados, valor])
  }

  const opcoesFiltradas = useMemo(() => {
    const termo = normalizarBusca(busca.trim())
    const comQuantidade = opcoes.map(opcao => ({...opcao, quantidadeFiltro: quantidadeDaOpcao(opcao)}))
    const filtradas = termo ? comQuantidade.filter(opcao => normalizarBusca(opcao.label).includes(termo)) : comQuantidade
    if (!compactarAcervoPequeno) return {principais: filtradas, pequenas: []}
    const principais = filtradas.filter(opcao => opcao.quantidadeFiltro === null || opcao.quantidadeFiltro >= limiteAcervoPequeno)
    const pequenas = filtradas.filter(opcao => opcao.quantidadeFiltro !== null && opcao.quantidadeFiltro < limiteAcervoPequeno)
    const ordenarPorQuantidade = (a, b) => (b.quantidadeFiltro ?? -1) - (a.quantidadeFiltro ?? -1) || a.label.localeCompare(b.label, 'pt-BR', {numeric: true})
    return {principais: principais.sort(ordenarPorQuantidade), pequenas: pequenas.sort(ordenarPorQuantidade)}
  }, [busca, compactarAcervoPequeno, opcoes])

  const valoresAcervoPequeno = useMemo(() => new Set(opcoes
    .filter(opcao => {
      const quantidade = quantidadeDaOpcao(opcao)
      return quantidade !== null && quantidade < limiteAcervoPequeno
    }).map(opcao => opcao.value)), [opcoes])
  const acervoPequenoSelecionado = selecionados.some(valor => valoresAcervoPequeno.has(valor))
  const abrirAcervoPequeno = mostrarAcervoPequeno || acervoPequenoSelecionado || Boolean(busca.trim() && opcoesFiltradas.pequenas.length)

  const resumo = selecionados.length === 0
    ? rotuloTodos
    : selecionados.length === 1
      ? opcoes.find(opcao => opcao.value === selecionados[0])?.label || selecionados[0]
      : `${selecionados.length} selecionados`

  return <div className="min-w-0 self-start">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-indigo-400">{titulo}</span>
    <details name="filtros-questoes" className="group min-w-0">
      <summary className="flex min-h-12 min-w-0 cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 shadow-inner transition-all hover:border-indigo-500/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 group-open:border-indigo-500/60 group-open:rounded-b-none [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 truncate" title={resumo}>{resumo}</span>
        {selecionados.length > 0 && <span className="shrink-0 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] font-bold text-indigo-200">{selecionados.length}</span>}
        <span aria-hidden="true" className="shrink-0 text-xs text-slate-500 transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="overflow-hidden rounded-b-xl border border-t-0 border-slate-700 bg-[#0a0d09] shadow-xl">
        <div className="border-b border-slate-800 bg-[#0a0d09] p-3">
          <div className="flex min-h-8 items-center justify-between gap-3">
            <span className="text-xs leading-4 text-slate-400">Selecione uma ou mais opções</span>
            {selecionados.length > 0 && <button type="button" onClick={() => aoAlterar([])} className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-slate-800">Limpar</button>}
          </div>
          {opcoes.length > 10 && <label className="mt-2 block">
            <span className="sr-only">Buscar em {titulo}</span>
            <input
              type="search"
              value={busca}
              onChange={evento => setBusca(evento.target.value)}
              placeholder={`Buscar em ${titulo.toLocaleLowerCase('pt-BR')}...`}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </label>}
        </div>
        <div className="filter-options-scroll max-h-80 space-y-1 overflow-y-auto overscroll-contain p-2 pr-3">
          {opcoesFiltradas.principais.map(opcao => {
            const selecionada = selecionados.includes(opcao.value)
            return <button
              key={opcao.value}
              type="button"
              role="checkbox"
              aria-checked={selecionada}
              onClick={() => alternar(opcao.value)}
              className={`flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm leading-5 transition-colors ${selecionada ? 'bg-indigo-500/15 text-indigo-100' : 'text-slate-300 hover:bg-slate-900'}`}
            >
              <span aria-hidden="true" className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${selecionada ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-600 bg-slate-900 text-transparent'}`}>✓</span>
              <span className="min-w-0 flex-1 break-words">{opcao.label}</span>
            </button>
          })}
          {compactarAcervoPequeno && opcoesFiltradas.pequenas.length > 0 && <details
            name="bancas-com-poucas-questoes"
            open={abrirAcervoPequeno}
            onToggle={evento => setMostrarAcervoPequeno(evento.currentTarget.open)}
            className="mt-2 rounded-xl border border-lime-300/20 bg-lime-950/10 p-2"
          >
            <summary className="cursor-pointer rounded-lg px-2 py-2 text-xs font-semibold text-lime-100 hover:bg-lime-950/25">
              Outras bancas · {opcoesFiltradas.pequenas.length} com menos de {limiteAcervoPequeno} questões
            </summary>
            <div className="mt-1 space-y-1">
              {opcoesFiltradas.pequenas.map(opcao => {
                const selecionada = selecionados.includes(opcao.value)
                return <button
                  key={opcao.value}
                  type="button"
                  role="checkbox"
                  aria-checked={selecionada}
                  onClick={() => alternar(opcao.value)}
                  className={`flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm leading-5 transition-colors ${selecionada ? 'bg-lime-500/15 text-lime-100' : 'text-slate-300 hover:bg-slate-900'}`}
                >
                  <span aria-hidden="true" className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${selecionada ? 'border-lime-500 bg-lime-600 text-white' : 'border-slate-600 bg-slate-900 text-transparent'}`}>✓</span>
                  <span className="min-w-0 flex-1 break-words">{opcao.label}</span>
                </button>
              })}
            </div>
          </details>}
          {opcoesFiltradas.principais.length + opcoesFiltradas.pequenas.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-500">Nenhuma opção encontrada.</p>}
        </div>
      </div>
    </details>
  </div>
}
