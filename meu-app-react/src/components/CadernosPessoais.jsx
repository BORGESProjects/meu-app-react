import { useMemo, useState } from 'react'

function dataCurta(valor) {
  const data = Date.parse(valor || '')
  return Number.isFinite(data) ? new Date(data).toLocaleDateString('pt-BR') : ''
}

function textoQuestao(questao) {
  return [questao?.enunciado, questao?.texto, questao?.texto_base, questao?.materia, questao?.conteudo]
    .filter(Boolean).join(' ').toLocaleLowerCase('pt-BR')
}

export default function CadernosPessoais({ cadernos, questoes, anotacoes = {}, sincronizacao = 'local', erroSincronizacao = '', onSincronizar, onNovo, onEstudar, onExcluir, onRenomear, onMover, onRemoverQuestao }) {
  const [busca, setBusca] = useState('')
  const [pastaAtiva, setPastaAtiva] = useState('__todas__')
  const porId = useMemo(() => new Map(questoes.map(questao => [String(questao.id), questao])), [questoes])
  const pastas = useMemo(() => [...new Set(cadernos.map(caderno => caderno.pasta?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [cadernos])
  const cadernosVisiveis = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return cadernos.filter(caderno => {
      if (pastaAtiva !== '__todas__' && (caderno.pasta || '') !== pastaAtiva) return false
      if (!termo) return true
      if (`${caderno.nome} ${caderno.pasta || ''}`.toLocaleLowerCase('pt-BR').includes(termo)) return true
      return caderno.questoes.some(id => {
        const questao = porId.get(String(id))
        return textoQuestao(questao).includes(termo) || String(anotacoes[String(id)]?.nota || '').toLocaleLowerCase('pt-BR').includes(termo)
      })
    })
  }, [anotacoes, busca, cadernos, pastaAtiva, porId])
  const statusSync = sincronizacao === 'salvo' ? 'Sincronizado com sua conta'
    : sincronizacao === 'sincronizando' ? 'Sincronizando seus dados…'
    : sincronizacao === 'carregando' ? 'Buscando seus dados salvos…'
    : sincronizacao === 'erro' ? 'Alterações preservadas neste dispositivo'
    : 'Salvo apenas neste dispositivo'

  return <section className="space-y-6" aria-labelledby="titulo-cadernos">
    <header className="study-hero rounded-3xl border border-indigo-400/20 p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-indigo-300">Organização pessoal</p>
          <h1 id="titulo-cadernos" className="text-2xl font-extrabold text-white sm:text-3xl">Meus cadernos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Pesquise por caderno, pasta, assunto ou anotação. Organize por pastas e volte às questões quando quiser.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full border px-3 py-1 ${sincronizacao === 'erro' ? 'border-amber-400/30 bg-amber-500/10 text-amber-200' : 'border-slate-600 bg-slate-950/40 text-slate-300'}`}>{statusSync}</span>
            {onSincronizar && <button type="button" onClick={onSincronizar} disabled={sincronizacao === 'sincronizando' || sincronizacao === 'carregando'} className="rounded-full px-2 py-1 font-semibold text-indigo-200 hover:bg-indigo-500/15 disabled:opacity-50">Sincronizar agora</button>}
          </div>
          {erroSincronizacao && <p role="status" className="mt-2 max-w-2xl text-xs leading-5 text-amber-200">{erroSincronizacao}</p>}
        </div>
        <button type="button" onClick={onNovo} className="rounded-xl bg-indigo-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 hover:bg-indigo-400">＋ Criar caderno</button>
      </div>
    </header>

    <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Buscar nos cadernos
        <input type="search" value={busca} onChange={evento => setBusca(evento.target.value)} placeholder="Nome, matéria, assunto ou anotação…" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100 placeholder:text-slate-500" />
      </label>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pasta
        <select value={pastaAtiva} onChange={evento => setPastaAtiva(evento.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-normal normal-case tracking-normal text-slate-100">
          <option value="__todas__">Todas as pastas</option>
          <option value="">Sem pasta</option>
          {pastas.map(pasta => <option key={pasta} value={pasta}>{pasta}</option>)}
        </select>
      </label>
      <p className="text-xs text-slate-500 sm:col-span-2">{cadernosVisiveis.length} de {cadernos.length} cadernos · {cadernosVisiveis.reduce((total, item) => total + item.questoes.length, 0).toLocaleString('pt-BR')} questões</p>
    </div>

    {!cadernos.length ? <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-5 py-12 text-center">
      <div aria-hidden="true" className="mb-3 text-3xl">▤</div>
      <h2 className="font-semibold text-slate-200">Seu primeiro caderno começa aqui</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">Crie um caderno vazio ou salve nele as questões da sua próxima busca.</p>
    </div> : !cadernosVisiveis.length ? <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-5 py-10 text-center text-sm text-slate-400">Nenhum caderno corresponde à pesquisa. Ajuste o texto ou escolha outra pasta.</div>
      : <div className="grid gap-4 xl:grid-cols-2">
        {cadernosVisiveis.map(caderno => {
          const itens = caderno.questoes.map(id => porId.get(String(id))).filter(Boolean)
          const ausentes = caderno.questoes.length - itens.length
          return <article key={caderno.id} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/10">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 p-5">
              <div className="min-w-0">
                <h2 className="break-words text-lg font-bold text-slate-100">{caderno.nome}</h2>
                <p className="mt-1 text-sm text-slate-400">{caderno.questoes.length.toLocaleString('pt-BR')} questões{caderno.pasta ? ` · ${caderno.pasta}` : ' · sem pasta'}{caderno.criadoEm ? ` · criado em ${dataCurta(caderno.criadoEm)}` : ''}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => onEstudar(caderno.id)} disabled={!caderno.questoes.length} className="rounded-xl bg-indigo-500/15 px-3 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-500/25 disabled:opacity-40">Estudar</button>
                <button type="button" onClick={() => onExcluir(caderno.id)} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 hover:border-rose-500/50 hover:text-rose-300">Excluir</button>
              </div>
            </div>
            <details className="group border-b border-slate-800">
              <summary className="cursor-pointer list-none px-5 py-3 text-xs font-semibold text-slate-400 hover:text-slate-200 [&::-webkit-details-marker]:hidden">Editar nome e pasta <span className="ml-1 text-slate-500">· organização pessoal</span></summary>
              <div className="grid gap-3 border-t border-slate-800 p-4 sm:grid-cols-2">
                <label className="text-xs text-slate-400">Nome
                  <input key={`${caderno.id}:nome:${caderno.nome}`} defaultValue={caderno.nome} maxLength={80} onBlur={evento => onRenomear(caderno.id, evento.target.value)} onKeyDown={evento => { if (evento.key === 'Enter') evento.currentTarget.blur() }} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
                </label>
                <label className="text-xs text-slate-400">Pasta (crie digitando um nome)
                  <input key={`${caderno.id}:pasta:${caderno.pasta || ''}`} defaultValue={caderno.pasta || ''} maxLength={50} placeholder="Ex.: Matemática" onBlur={evento => onMover(caderno.id, evento.target.value)} onKeyDown={evento => { if (evento.key === 'Enter') evento.currentTarget.blur() }} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600" />
                </label>
              </div>
            </details>
            <details className="group">
              <summary className="cursor-pointer list-none px-5 py-3 text-xs font-semibold text-slate-400 hover:text-slate-200 [&::-webkit-details-marker]:hidden">Ver questões <span className="ml-1 text-slate-500">{caderno.questoes.length}</span></summary>
              <div className="max-h-80 space-y-2 overflow-y-auto border-t border-slate-800 p-4">
                {!itens.length && !ausentes && <p className="text-sm text-slate-400">Este caderno ainda está vazio.</p>}
                {itens.map((questao, indice) => <div key={questao.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-indigo-300">{questao.banca || 'Questão'}{questao.ano ? ` · ${questao.ano}` : ''} · {questao.materia || 'Geral'}{questao.conteudo ? ` · ${questao.conteudo}` : ''}</p>
                    <p className="mt-1 line-clamp-2 break-words text-sm text-slate-300">{String(questao.enunciado || questao.texto || `Questão ${indice + 1}`).slice(0, 220)}</p>
                    {anotacoes[String(questao.id)]?.nota && <p className="mt-2 line-clamp-2 text-xs text-amber-200">Anotação: {anotacoes[String(questao.id)].nota}</p>}
                  </div>
                  <button type="button" aria-label={`Remover questão ${questao.numero_original || indice + 1} de ${caderno.nome}`} onClick={() => onRemoverQuestao(caderno.id, questao.id)} className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-rose-500/10 hover:text-rose-300">Remover</button>
                </div>)}
                {ausentes > 0 && <p className="text-xs text-slate-500">{ausentes} questão(ões) não estão no acervo carregado agora.</p>}
              </div>
            </details>
          </article>
        })}
      </div>}
  </section>
}
