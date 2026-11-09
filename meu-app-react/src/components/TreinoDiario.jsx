import { useEffect, useMemo, useState } from 'react'
import amostra from '../data/cporSimuladoTreineiro.json'
import { podeCorrigir, questaoPublicavel } from '../acervo'
import { chaveCampoFiltro, chaveConteudoFiltro } from '../filtros'
import { correspondeAoObjetivo, FOCOS_ESTUDO, OBJETIVOS_FOCO, ultimasTentativas } from '../focoEstudo'
import EnunciadoQuestao from './EnunciadoQuestao'
import AlternativaQuestao from './AlternativaQuestao'

const painel = 'rounded-3xl border border-slate-700 bg-slate-900/60 p-5 sm:p-7'
const acao = 'inline-flex rounded-xl border border-indigo-500/60 px-4 py-3 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/10 disabled:opacity-50'
const chave = texto => String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const alternativas = q => (Array.isArray(q.opcoes) ? q.opcoes : []).map((texto, i) => [String.fromCharCode(65 + i), texto])
const indiceResposta = valor => /^[A-E]$/i.test(String(valor).trim()) ? String(valor).trim().toUpperCase().charCodeAt(0) - 65 : Number(valor)
const gabarito = q => (Array.isArray(q.respostas_aceitas) && q.respostas_aceitas.length ? q.respostas_aceitas : [q.resposta_correta]).map(indiceResposta)
const apta = q => questaoPublicavel(q) && podeCorrigir(q) && q.tipo_resposta !== 'somatoria' && alternativas(q).length >= 2 && alternativas(q).every(([, texto]) => typeof texto === 'string' && texto.trim()) && gabarito(q).every(indice => Number.isInteger(indice) && indice >= 0 && indice < q.opcoes.length)
const chaveTopico = (materia, conteudo) => `${chaveCampoFiltro('materia', materia)}:${chaveConteudoFiltro(conteudo, materia)}`
const demonstracao = amostra.filter(apta).slice(0, 10)
const semQuestoes = []
const demos = {
  vestibulares: { nome: 'UTFPR 2025', objetivo: 'utfpr', url: '/acervo/utfpr-2025/questoes.json' },
  concursos: { nome: 'PF 2021 · Agente de Polícia Federal', objetivo: 'agente-pf', url: '/acervo/pf-2021-operacionais/questoes.json' },
  militares: { nome: 'CPOR / NPOR · amostra preparatória' },
}

function ler(id) {
  try {
    const valor = JSON.parse(localStorage.getItem(id))
    return valor && Array.isArray(valor.ids) && valor.respostas ? valor : null
  } catch { return null }
}

export default function TreinoDiario({ conta, questoes = [], questoesDoFoco = questoes, historico = [], edital, foco = 'sem-preferencia', demo = false, onSalvar, onPraticar, onEdital, onEntrar, onAgendar }) {
  const hoje = new Date().toLocaleDateString('sv-SE')
  const storage = demo ? 'ap:treino:demo:v1' : `ap:treino:${conta}:${hoje}:${foco}`
  const [sessao, setSessao] = useState(() => ler(storage) || (!demo && foco === 'sem-preferencia' ? ler(`ap:treino:${conta}:${hoje}`) : null))
  const [perfilDemo, setPerfilDemo] = useState(() => sessao?.perfilDemo || (sessao && demo ? 'militares' : demos[foco] ? foco : ''))
  const [dadosDemo, setDadosDemo] = useState(null)
  const [tentativaDemo, setTentativaDemo] = useState(0)
  const [objetivo, setObjetivo] = useState(edital?.titulo || '')
  const [aviso, setAviso] = useState('')
  const [selecionada, setSelecionada] = useState('')
  const demoAtiva = demo ? demos[perfilDemo] : null
  useEffect(() => {
    if (!demoAtiva?.url) return
    const controle = new AbortController()
    fetch(demoAtiva.url, { signal: controle.signal }).then(resposta => {
      if (!resposta.ok) throw new Error('Amostra indisponível')
      return resposta.json()
    }).then(dados => {
      const itens = dados.filter(q => apta(q) && correspondeAoObjetivo(q, demoAtiva.objetivo))
      if (itens.length < 10) throw new Error('Amostra incompleta')
      if (!controle.signal.aborted) setDadosDemo({ url: demoAtiva.url, itens })
    }).catch(() => {
      if (!controle.signal.aborted) setDadosDemo({ url: demoAtiva.url, erro: true })
    })
    return () => controle.abort()
  }, [demoAtiva, tentativaDemo])
  const base = demo ? perfilDemo === 'militares' ? demonstracao : (dadosDemo?.url === demoAtiva?.url ? dadosDemo?.itens || semQuestoes : semQuestoes) : questoes
  const topicos = useMemo(() => new Map((edital?.materias || []).flatMap(m =>
    (m.topicos || []).map(t => [chaveTopico(m.nome, t.titulo), { materia: m.nome, conteudo: t.titulo }])
  ).filter(([id]) => !id.endsWith(':outros-conteudos'))), [edital])
  const itens = useMemo(() => {
    if (!sessao) return []
    const ids = new Set(sessao.ids)
    const porId = new Map(base.filter(q => ids.has(String(q.id))).map(q => [String(q.id), q]))
    return sessao.ids.map(id => porId.get(id)).filter(Boolean)
  }, [base, sessao])

  function guardar(valor) {
    setSessao(valor)
    try { localStorage.setItem(storage, JSON.stringify(valor)) } catch {
      setAviso('O navegador não conseguiu guardar esta sessão para depois.')
    }
  }

  function iniciar() {
    const nome = demo ? demoAtiva?.nome : objetivo
    const ultimas = ultimasTentativas(historico)
    const termos = chave(objetivo).split(/\W+/).filter(termo => termo.length >= 2 && !/^\d+$/.test(termo) && !['de','do','da','concurso','vestibular','edital'].includes(termo))
    const usaEdital = Boolean(edital && objetivo === edital.titulo)
    const atalho = OBJETIVOS_FOCO[foco]?.find(item => chave(item.nome) === chave(objetivo))
    const vistos = new Set()
    const candidatos = demo ? base : (objetivo && foco === 'sem-preferencia' ? base : questoesDoFoco).filter(q => {
      const origem = chave([q.banca, q.concurso, q.prova, q.aplicacao].join(' ')).split(/\W+/)
      if (vistos.has(String(q.id)) || !apta(q)) return false
      const mesmaProva = atalho ? correspondeAoObjetivo(q, atalho.id) : termos.length && termos.every(termo => origem.includes(termo))
      if (objetivo && !mesmaProva && !(usaEdital && topicos.has(chaveTopico(q.materia, q.conteudo)))) return false
      vistos.add(String(q.id))
      return true
    })
    const erros = [], novas = [], acertos = []
    for (const q of candidatos) {
      const anterior = ultimas.get(String(q.id))
      if (!anterior) novas.push(q)
      else if (anterior.acertou) acertos.push(q)
      else erros.push(q)
    }
    const deslocar = lista => {
      if (demo || !lista.length) return lista
      const inicio = Number(hoje.replaceAll('-', '')) % lista.length
      return [...lista.slice(inicio), ...lista.slice(0, inicio)]
    }
    const revisao = deslocar(erros)
    const selecionadas = [...revisao.slice(0, 5), ...deslocar(novas), ...revisao.slice(5), ...deslocar(acertos)].slice(0, 10)
    if (selecionadas.length < 10) {
      setAviso('Ainda não há 10 questões corrigíveis para esse objetivo no acervo carregado. Aguarde o carregamento ou escolha outro objetivo.')
      return
    }
    setAviso('')
    const vinculos = usaEdital ? Object.fromEntries(selecionadas.map(q => [String(q.id), topicos.get(chaveTopico(q.materia, q.conteudo))]).filter(([, topico]) => topico)) : {}
    guardar({ id: crypto.randomUUID(), objetivo: nome, ids: selecionadas.map(q => String(q.id)), respostas: {}, vinculos, ...(demo ? { perfilDemo } : {}) })
  }

  const atual = itens.find(q => !sessao.respostas[String(q.id)])
  const total = sessao ? Object.keys(sessao.respostas).length : 0
  const completo = Boolean(sessao && itens.length === 10 && total === 10)
  const respostas = completo ? itens.map(q => ({
    id: `${sessao.id}:${q.id}`, questaoId: q.id, materia: q.materia, conteudo: q.conteudo,
    banca: q.banca, concurso: q.concurso, ano: q.ano, tipo: 'questao',
    respostaSelecionada: indiceResposta(sessao.respostas[String(q.id)].letra),
    respostaCorreta: gabarito(q).length === 1 ? gabarito(q)[0] : gabarito(q),
    acertou: gabarito(q).includes(indiceResposta(sessao.respostas[String(q.id)].letra)),
    respondidaEm: sessao.respostas[String(q.id)].data,
  })) : []
  const erros = respostas.filter(r => !r.acertou)
  const prioridade = erros.find(r => r.conteudo)
  const prioridadeEdital = erros.map(r => sessao?.vinculos?.[String(r.questaoId)]).find(Boolean)
  const salvo = completo && sessao.contaSalva === conta && Boolean(conta)

  return <section className={`${painel} mx-auto max-w-3xl space-y-5`} aria-labelledby="treino-titulo">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">{demo ? 'Amostra gratuita' : 'Prática orientada'}</p>
      <h1 id="treino-titulo" className="mt-2 text-2xl font-extrabold">{demo ? 'Experimente 10 questões' : 'Treino de hoje'}</h1>
      <p className="mt-2 text-sm text-slate-400">{demo ? 'Faça o treino antes de criar conta. Veja sua pontuação e as resoluções disponíveis ao terminar.' : 'Faça 10 questões, incluindo erros recentes quando houver, e descubra por onde continuar.'}</p>
    </header>
    {!sessao && <div className="flex flex-wrap items-end gap-3">
      {demo && <label className="min-w-0 flex-1 text-sm">Qual é seu foco?
        <select className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3" value={perfilDemo} onChange={e => { setPerfilDemo(e.target.value); setDadosDemo(null); setAviso('') }}>
          <option value="">Escolha para ver a amostra</option>
          {FOCOS_ESTUDO.filter(item => demos[item.id]).map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
      </label>}
      {!demo && <label className="min-w-0 flex-1 text-sm">Prova ou instituição
        <input list="objetivos-treino-diario" className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3" value={objetivo} onChange={e => setObjetivo(e.target.value)} placeholder={OBJETIVOS_FOCO[foco]?.[0]?.nome || 'Digite uma prova ou instituição'} />
        <datalist id="objetivos-treino-diario">{(OBJETIVOS_FOCO[foco] || []).map(item => <option key={item.id} value={item.nome} />)}</datalist>
      </label>}
      {!demo && edital && <button type="button" className={acao} onClick={() => setObjetivo(edital.titulo)}>Usar meu edital</button>}
      <button type="button" className={acao} disabled={demo && base.length < 10} onClick={iniciar}>Começar 10 questões</button>
    </div>}
    {demoAtiva && !sessao && <p className="text-sm">{demoAtiva.nome}</p>}
    {demoAtiva?.url && base.length < 10 && (dadosDemo?.erro && dadosDemo.url === demoAtiva.url
      ? <button type="button" className={acao} onClick={() => { setDadosDemo(null); setTentativaDemo(n => n + 1) }}>Tentar carregar amostra novamente</button>
      : <p role="status">Carregando amostra…</p>)}
    {sessao && <>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><strong>{sessao.objetivo || 'Acervo geral'}</strong><span aria-live="polite">{total}/10 respondidas</span></div>
      <progress className="w-full accent-indigo-500" max={10} value={total} aria-label="Progresso do treino" />
      {itens.length !== 10 && <p role="status">Aguardando as questões da sessão salva. Se o acervo mudou, inicie outro treino.</p>}
      {itens.length === 10 && atual && <form key={atual.id} className="space-y-4" onSubmit={e => {
        e.preventDefault()
        if (!alternativas(atual).some(([letra]) => letra === selecionada)) return
        guardar({ ...sessao, respostas: { ...sessao.respostas, [String(atual.id)]: { letra: selecionada, data: new Date().toISOString() } } })
        setSelecionada('')
      }}>
        <EnunciadoQuestao questao={atual} />
        <fieldset className="space-y-2"><legend className="mb-2 font-semibold">Selecione uma resposta</legend>
          {alternativas(atual).map(([letra, texto], indice) => <label key={letra} className="flex gap-3 rounded-xl border border-slate-700 p-3 has-checked:border-indigo-500">
            <input type="radio" name="resposta-treino" value={letra} checked={selecionada === letra} onChange={() => setSelecionada(letra)} />
            <span className="min-w-0 break-words"><strong>{letra}. </strong><AlternativaQuestao questao={atual} indice={indice} texto={texto} /></span>
          </label>)}
        </fieldset>
        <button type="submit" className={acao} disabled={!selecionada}>Confirmar resposta</button>
      </form>}
      {completo && <>
        <h2 className="text-xl font-bold">{10 - erros.length} de 10 acertos</h2>
        <ol className="space-y-2 text-sm text-slate-300">
          <li>1. Pratique {prioridade ? prioridade.conteudo : 'um assunto novo do seu edital'}.{prioridade && onPraticar && <> <button className="underline" onClick={() => onPraticar(prioridade.materia, prioridade.conteudo)}>Abrir questões</button></>}</li>
          <li>2. {erros.length ? `Revise as ${erros.length} questões que você errou nos comentários abaixo.` : 'Retome este conteúdo em outro dia para conferir se ainda lembra.'}</li>
          <li>3. {prioridadeEdital ? `Priorize ${prioridadeEdital.conteudo} no edital.` : 'Confira os tópicos pendentes na matriz do seu edital.'} {onEdital && <button className="underline" onClick={onEdital}>Abrir edital</button>}</li>
        </ol>
        {salvo ? <p role="status">Diagnóstico incluído no histórico da conta.</p> : onSalvar ? <button className={acao} onClick={() => {
          onSalvar(respostas)
          guardar({ ...sessao, contaSalva: conta })
        }}>Salvar diagnóstico na conta</button> : <button className={acao} onClick={onEntrar}>Entrar ou criar conta para salvar</button>}
        {(prioridadeEdital || prioridade) && onAgendar && <button type="button" className={acao} onClick={() => onAgendar(prioridadeEdital || prioridade)}>Planejar revisão no cronograma</button>}
        {itens.map((q, i) => <details key={q.id} className="rounded-xl border border-slate-700 p-3 text-sm">
          <summary className="cursor-pointer font-semibold">{i + 1}. {q.conteudo || q.materia} · {respostas[i].acertou ? 'Acerto' : 'Erro'}</summary>
          <div className="mt-3 space-y-2"><EnunciadoQuestao questao={q} />
            <p>Sua resposta: {sessao.respostas[String(q.id)].letra} · Gabarito: {gabarito(q).map(indice => alternativas(q)[indice]?.[0]).join(' ou ')}</p>
            <p className="whitespace-pre-wrap break-words">{[q.explicacao, q.resolucao, q.resposta_comentada, q.comentario].find(valor => typeof valor === 'string' && valor.trim()) || 'Ainda não há resolução comentada para esta questão.'}</p>
          </div>
        </details>)}
      </>}
      {!demo && <button type="button" className={acao} onClick={() => {
        if (!completo && itens.length === 10 && !window.confirm('Descartar as respostas deste treino?')) return
        guardar(null)
        setSelecionada('')
      }}>Escolher outro treino</button>}
    </>}
    {aviso && <p role="status" className="text-sm text-amber-300">{aviso}</p>}
  </section>
}
