import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import amostra from '../data/cporSimuladoTreineiro.json'
import { anoDaQuestao, podeCorrigir, questaoPublicavel } from '../acervo'
import { chaveCampoFiltro, chaveConteudoFiltro, chaveFiltro, grupoConteudo, limparValorFiltro, normalizarMateria } from '../filtros'
import { correspondeAoObjetivo, dataProximaRevisao, FOCOS_ESTUDO, nomeFoco, ultimasTentativas } from '../focoEstudo'
import { concursosDaQuestao, questaoNaProva } from '../provasCompartilhadas'
import { imagemDaOpcao } from '../textoQuestao'
import EnunciadoQuestao from './EnunciadoQuestao'
import AlternativaQuestao from './AlternativaQuestao'
import FiltroMultiplo from './FiltroMultiplo'
import { recomendarTreino } from '../treinoAdaptativo'

const painel = 'rounded-3xl border border-slate-700 bg-slate-900/60 p-5 sm:p-7'
const acao = 'inline-flex rounded-xl border border-indigo-500/60 px-4 py-3 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/10 disabled:opacity-50'
const alternativas = q => (Array.isArray(q.opcoes) ? q.opcoes : []).map((texto, i) => [String.fromCharCode(65 + i), texto])
const indiceResposta = valor => /^[A-E]$/i.test(String(valor).trim()) ? String(valor).trim().toUpperCase().charCodeAt(0) - 65 : Number(valor)
const gabarito = q => (Array.isArray(q.respostas_aceitas) && q.respostas_aceitas.length ? q.respostas_aceitas : [q.resposta_correta]).map(indiceResposta)
const apta = q => questaoPublicavel(q) && podeCorrigir(q) && q.tipo_resposta !== 'somatoria' && alternativas(q).length >= 2 && alternativas(q).every(([, texto]) => typeof texto === 'string' && texto.trim()) && gabarito(q).every(indice => Number.isInteger(indice) && indice >= 0 && indice < q.opcoes.length)
const chaveTopico = (materia, conteudo) => `${chaveCampoFiltro('materia', materia)}:${chaveConteudoFiltro(conteudo, materia)}`
const demonstracao = amostra.filter(apta).slice(0, 10)
const semQuestoes = []
const campo = 'mt-2 block w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm'
const filtrosIniciais = { materia: [], conteudo: [], ano: [], dificuldade: [], formato: [], situacao: '', comentadas: false, visuais: false, excluirCadernos: false, termo: '' }
const marcacoesVazias = {}
const modosTreino = [
  ['', 'Variado'], ['novas', 'Ainda não respondidas'], ['erros', 'Erros da última tentativa'],
  ['revisao', 'Revisão para hoje'], ['acertos', 'Acertos da última tentativa'], ['favoritas', 'Minhas favoritas'],
]
const camposDetalhe = [
  ['materia', 'Matéria', 'Todas as matérias'], ['conteudo', 'Conteúdo', 'Todos os conteúdos'],
  ['ano', 'Ano da prova', 'Todos os anos'], ['dificuldade', 'Dificuldade', 'Todas as dificuldades'],
  ['formato', 'Tipo de questão', 'Todos os formatos'],
]
const metadados = new WeakMap()
const textoBusca = new WeakMap()
const explicacao = q => [q.explicacao, q.resolucao, q.resposta_comentada, q.comentario].find(valor => typeof valor === 'string' && valor.trim())

function atributos(q) {
  if (metadados.has(q)) return metadados.get(q)
  const materia = normalizarMateria(q.materia, q.conteudo)
  const conteudo = grupoConteudo(q.conteudo, q.materia)
  const dificuldade = chaveCampoFiltro('dificuldade', q.dificuldade)
  const ano = anoDaQuestao(q)
  const valor = {
    materia: { value: chaveCampoFiltro('materia', materia), label: materia },
    conteudo,
    ano: /^\d{4}$/.test(ano) ? { value: ano, label: ano } : { value: 'sem-ano', label: 'Ano não informado' },
    dificuldade: { value: dificuldade || 'sem-dificuldade', label: ({ facil: 'Fácil', media: 'Média', dificil: 'Difícil' })[dificuldade] || q.dificuldade || 'Não informada' },
    formato: q.tipo_resposta === 'certo_errado' ? { value: 'ce', label: 'Certo ou errado' } : { value: 'me', label: 'Múltipla escolha' },
  }
  metadados.set(q, valor)
  return valor
}

function buscarNoTexto(q, termo) {
  if (!termo) return true
  if (!textoBusca.has(q)) textoBusca.set(q, chaveFiltro([q.id, q.codigo, q.enunciado, q.texto_apoio, q.conteudo, q.materia].filter(Boolean).join(' ')))
  return textoBusca.get(q).includes(termo)
}

function filtrarTreino(questoes, filtros, ultimas, detalhar, agora, marcacoes, idsCadernos) {
  const termo = chaveFiltro(filtros.termo)
  const ativos = camposDetalhe.filter(([id]) => filtros[id].length).map(([id]) => [id, new Set(filtros[id])])
  const opcoes = Object.fromEntries(camposDetalhe.map(([id]) => [id, new Map()]))
  const itens = []
  for (const q of questoes) {
    const id = String(q.id)
    const anterior = ultimas.get(id)
    if (filtros.situacao === 'novas' && anterior) continue
    if (filtros.situacao === 'erros' && anterior?.acertou !== false) continue
    if (filtros.situacao === 'acertos' && anterior?.acertou !== true) continue
    if (filtros.situacao === 'revisao' && (!anterior || dataProximaRevisao(anterior) > agora)) continue
    if (filtros.situacao === 'favoritas' && !marcacoes[id]?.favorita) continue
    if (filtros.excluirCadernos && idsCadernos.has(id)) continue
    if (filtros.comentadas && !explicacao(q)) continue
    if (filtros.visuais && !(q.imagem_original || q.pagina_imagem || q.texto_apoio_imagem || q.apoio?.some(a => a.imagem) || q.imagens?.length || q.opcoes.some((_, i) => imagemDaOpcao(q, i)))) continue
    if (!buscarNoTexto(q, termo)) continue
    const dados = (detalhar || ativos.length) ? atributos(q) : null
    const falhas = ativos.filter(([id, valores]) => !valores.has(dados[id]?.value))
    if (!falhas.length) itens.push(q)
    if (!detalhar || falhas.length > 1) continue
    for (const [id] of camposDetalhe) {
      if (falhas.length && falhas[0][0] !== id) continue
      const opcao = dados[id]
      if (!opcao?.value) continue
      const registrada = opcoes[id].get(opcao.value)
      if (registrada) registrada.quantidade++
      else opcoes[id].set(opcao.value, { ...opcao, quantidade: 1 })
    }
  }
  return { itens, opcoes }
}
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

function catalogarObjetivos(questoes) {
  const grupos = new Map()
  const aptas = []
  const adicionar = (tipo, valor, questao) => {
    const nome = limparValorFiltro(valor)
    if (!nome) return
    const id = `${tipo}:${chaveFiltro(nome)}`
    if (!grupos.has(id)) grupos.set(id, { id, tipo, nome, itens: new Map() })
    grupos.get(id).itens.set(String(questao.id), questao)
  }
  const vistos = new Set()
  for (const q of questoes) {
    if (!q.id || vistos.has(String(q.id)) || !apta(q)) continue
    vistos.add(String(q.id))
    aptas.push(q)
    adicionar('instituicao', q.banca, q)
    for (const concurso of concursosDaQuestao(q)) adicionar('prova', concurso, q)
    for (const origem of [q, ...(Array.isArray(q.origens_provas) ? q.origens_provas : [])]) {
      adicionar('prova', origem.concurso, q)
      adicionar('prova', origem.prova, q)
      adicionar('prova', origem.cargo, q)
    }
  }
  const ordem = new Intl.Collator('pt-BR', { numeric: true })
  return { grupos, aptas, opcoes: [...grupos.values()].sort((a, b) => ordem.compare(a.nome, b.nome)) }
}

export default function TreinoDiario({ conta, questoes = semQuestoes, questoesDoFoco = questoes, historico = semQuestoes, cadernos = semQuestoes, marcacoes = marcacoesVazias, edital, foco = 'sem-preferencia', demo = false, catalogoCarregando = false, onSalvar, onPraticar, onEdital, onEntrar, onAgendar }) {
  const hoje = new Date().toLocaleDateString('sv-SE')
  const storage = demo ? 'ap:treino:demo:v1' : `ap:treino:${conta}:${hoje}:${foco}`
  const [sessao, setSessao] = useState(() => ler(storage) || (!demo && foco === 'sem-preferencia' ? ler(`ap:treino:${conta}:${hoje}`) : null))
  const [perfilDemo, setPerfilDemo] = useState(() => sessao?.perfilDemo || (sessao && demo ? 'militares' : demos[foco] ? foco : ''))
  const [dadosDemo, setDadosDemo] = useState(null)
  const [tentativaDemo, setTentativaDemo] = useState(0)
  const [objetivo, setObjetivo] = useState(edital ? 'edital' : '')
  const [buscaObjetivo, setBuscaObjetivo] = useState('')
  const [tipoObjetivo, setTipoObjetivo] = useState('')
  const [filtros, setFiltros] = useState(filtrosIniciais)
  const [detalhar, setDetalhar] = useState(false)
  const [quantidade, setQuantidade] = useState(10)
  const filtrosAdiados = useDeferredValue(filtros)
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
  const catalogo = useMemo(() => catalogarObjetivos(demo ? semQuestoes : questoesDoFoco), [demo, questoesDoFoco])
  const alvo = catalogo.grupos.get(objetivo)
  const termosBusca = chaveFiltro(buscaObjetivo).split(' ').filter(Boolean)
  const opcoesFiltradas = catalogo.opcoes.filter(item => (!tipoObjetivo || item.tipo === tipoObjetivo) && termosBusca.every(termo => chaveFiltro(item.nome).includes(termo)))
  const opcoesVisiveis = alvo && !opcoesFiltradas.includes(alvo) ? [alvo, ...opcoesFiltradas] : opcoesFiltradas
  const sugestoes = useMemo(() => ['instituicao', 'prova'].flatMap(tipo => catalogo.opcoes
    .filter(item => item.tipo === tipo && item.itens.size >= 10 && (foco === 'militares' || !/\b(?:cpor|npor)\b/.test(chaveFiltro(item.nome))))
    .sort((a, b) => b.itens.size - a.itens.size)
    .slice(0, 3)), [catalogo, foco])
  const topicos = useMemo(() => new Map((edital?.materias || []).flatMap(m =>
    (m.topicos || []).map(t => [chaveTopico(m.nome, t.titulo), { materia: m.nome, conteudo: t.titulo }])
  ).filter(([id]) => !id.endsWith(':outros-conteudos'))), [edital])
  const usaEdital = Boolean(edital && objetivo === 'edital')
  const baseObjetivo = useMemo(() => {
    if (demo || sessao) return semQuestoes
    if (usaEdital) return catalogo.aptas.filter(q => topicos.has(chaveTopico(q.materia, q.conteudo)) ||
      [q.banca, q.concurso, q.prova].some(valor => chaveFiltro(valor) === chaveFiltro(edital.titulo)))
    return alvo ? [...alvo.itens.values()] : objetivo ? semQuestoes : catalogo.aptas
  }, [demo, sessao, usaEdital, catalogo, topicos, edital, alvo, objetivo])
  const ultimas = useMemo(() => ultimasTentativas(historico), [historico])
  const idsCadernos = useMemo(() => new Set(cadernos.flatMap(item => (item.questoes || []).map(String))), [cadernos])
  const diaTreino = new Date(`${hoje}T23:59:59`).getTime()
  const recorte = useMemo(() => filtrarTreino(baseObjetivo, filtrosAdiados, ultimas, detalhar, diaTreino, marcacoes, idsCadernos), [baseObjetivo, filtrosAdiados, ultimas, detalhar, diaTreino, marcacoes, idsCadernos])
  const totalPlanejado = demo ? 10 : quantidade
  const editalRecomendado = (!objetivo || usaEdital) ? edital : null
  const recomendacao = useMemo(() => recomendarTreino({
    questoes: demo || sessao ? semQuestoes : recorte.itens,
    edital: editalRecomendado, ultimas, agora: diaTreino, quantidade,
  }), [demo, sessao, recorte.itens, editalRecomendado, ultimas, diaTreino, quantidade])
  const filtrosAtivos = camposDetalhe.reduce((soma, [id]) => soma + filtros[id].length, 0) + [filtros.termo, filtros.situacao, filtros.comentadas, filtros.visuais, filtros.excluirCadernos].filter(Boolean).length
  const itens = useMemo(() => {
    if (!sessao) return []
    const ids = new Set(sessao.ids)
    const porId = new Map(base.filter(q => ids.has(String(q.id))).map(q => [String(q.id), q]))
    return sessao.ids.map(id => porId.get(id)).filter(Boolean).map(q => {
      if (!sessao.provaId) return q
      const origem = q.origens_provas?.find(item => [item.concurso, item.prova, item.cargo].some(valor => chaveFiltro(valor) === sessao.provaId))
      const concurso = origem?.concurso || concursosDaQuestao(q).find(nome => chaveFiltro(nome) === sessao.provaId)
      return (concurso && questaoNaProva(q, concurso)) || q
    })
  }, [base, sessao])

  function guardar(valor) {
    setSessao(valor)
    try { localStorage.setItem(storage, JSON.stringify(valor)) } catch {
      setAviso('O navegador não conseguiu guardar esta sessão para depois.')
    }
  }

  function iniciar() {
    const nome = demo ? demoAtiva?.nome : usaEdital ? edital.titulo : alvo?.nome
    const candidatos = demo ? base : recorte.itens
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
    const limiteErros = Math.floor(totalPlanejado / 2)
    const selecionadas = [...revisao.slice(0, limiteErros), ...deslocar(novas), ...revisao.slice(limiteErros), ...deslocar(acertos)].slice(0, totalPlanejado)
    if (selecionadas.length < totalPlanejado) {
      setAviso('A seleção tem menos questões do que a meta. Ajuste os filtros ou reduza a quantidade.')
      return
    }
    setAviso('')
    const vinculos = usaEdital ? Object.fromEntries(selecionadas.map(q => [String(q.id), topicos.get(chaveTopico(q.materia, q.conteudo))]).filter(([, topico]) => topico)) : {}
    guardar({ id: crypto.randomUUID(), objetivo: nome, ids: selecionadas.map(q => String(q.id)), respostas: {}, vinculos, ...(alvo?.tipo === 'prova' ? { provaId: chaveFiltro(alvo.nome) } : {}), ...(demo ? { perfilDemo } : {}) })
  }

  function iniciarRecomendado() {
    const itens = recomendacao.selecionadas
    if (!itens.length || filtros !== filtrosAdiados) return
    setAviso('')
    guardar({
      id: crypto.randomUUID(), objetivo: editalRecomendado?.titulo || alvo?.nome || nomeFoco(foco),
      ids: itens.map(item => String(item.questao.id)), respostas: {}, adaptativo: true,
      ...(alvo?.tipo === 'prova' ? { provaId: chaveFiltro(alvo.nome) } : {}),
      vinculos: Object.fromEntries(itens.filter(item => item.topico).map(item => [String(item.questao.id), item.topico])),
      motivos: Object.fromEntries(itens.map(item => [String(item.questao.id), item.motivo])),
    })
  }

  const atual = itens.find(q => !sessao.respostas[String(q.id)])
  const total = sessao ? Object.keys(sessao.respostas).length : 0
  const tamanhoSessao = sessao?.ids.length || 0
  const completo = Boolean(tamanhoSessao && itens.length === tamanhoSessao && total === tamanhoSessao)
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
      <p className="mt-2 text-sm text-slate-400">{demo ? 'Faça o treino antes de criar conta. Veja sua pontuação e as resoluções disponíveis ao terminar.' : `${nomeFoco(foco)} · escolha o que praticar e acompanhe o diagnóstico ao terminar.`}</p>
    </header>
    {!demo && !sessao && <section className="space-y-3 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-4 sm:p-5" aria-labelledby="titulo-treino-adaptativo">
      <div>
        <h2 id="titulo-treino-adaptativo" className="text-lg font-bold">Seu próximo treino</h2>
        <p className="mt-1 text-sm text-slate-300">{editalRecomendado ? `Baseado no edital ${editalRecomendado.titulo} e nas suas respostas.` : 'Baseado no foco atual, nos filtros e nas suas respostas.'}</p>
      </div>
      {recomendacao.selecionadas.length ? <>
        <ul className="flex flex-wrap gap-2 text-xs">{recomendacao.motivos.map(([motivo, total]) => <li key={motivo} className="rounded-full border border-indigo-400/30 px-3 py-1.5">{motivo} · {total}</li>)}</ul>
        <p className="text-xs text-slate-400">{recomendacao.selecionadas.length} questões, distribuídas entre os tópicos disponíveis.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={acao} disabled={filtros !== filtrosAdiados} onClick={iniciarRecomendado}>Começar treino recomendado</button>
          {onAgendar && recomendacao.selecionadas[0].questao.materia && <button type="button" className={acao} onClick={() => {
            const primeira = recomendacao.selecionadas[0]
            onAgendar(primeira.topico || primeira.questao)
          }}>Planejar no cronograma</button>}
        </div>
      </> : <p role="status" className="text-sm text-slate-400">{catalogoCarregando ? 'Carregando questões para montar a sugestão…' : 'Ainda não há questões suficientes para esta seleção. Ajuste os filtros ou escolha outro edital.'}</p>}
      {onEdital && <button type="button" className="text-sm text-indigo-300 underline" onClick={onEdital}>{editalRecomendado ? 'Ver edital' : 'Vincular um edital'}</button>}
    </section>}
    {!sessao && <div className="flex flex-wrap items-end gap-3">
      {demo && <label className="min-w-0 flex-1 text-sm">Qual é seu foco?
        <select className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3" value={perfilDemo} onChange={e => { setPerfilDemo(e.target.value); setDadosDemo(null); setAviso('') }}>
          <option value="">Escolha para ver a amostra</option>
          {FOCOS_ESTUDO.filter(item => demos[item.id]).map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
      </label>}
      {!demo && <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2">
        <label className="min-w-0 text-sm">Buscar no acervo
          <input type="search" className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3" value={buscaObjetivo} onChange={e => setBuscaObjetivo(e.target.value)} placeholder="Nome da prova, cargo ou instituição" />
        </label>
        <label className="min-w-0 text-sm">Prova, cargo ou instituição
          <select className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3" value={objetivo} onChange={e => { setObjetivo(e.target.value); setAviso('') }}>
            <option value="">Qualquer prova deste foco</option>
            {edital && <option value="edital">Meu edital · {edital.titulo}</option>}
            {[['instituicao', 'Bancas e instituições'], ['prova', 'Provas e cargos']].map(([tipo, rotulo]) => {
              const opcoes = opcoesVisiveis.filter(item => item.tipo === tipo)
              return opcoes.length > 0 && <optgroup key={tipo} label={rotulo}>{opcoes.map(item => <option key={item.id} value={item.id}>{item.nome} ({item.itens.size})</option>)}</optgroup>
            })}
          </select>
        </label>
        <div className="space-y-2 sm:col-span-2" aria-label="Sugestões de filtros">
          <p className="text-xs font-semibold text-slate-400">Filtros rápidos</p>
          <div className="flex flex-wrap gap-2">
            {[['', 'Todas'], ['instituicao', 'Bancas e instituições'], ['prova', 'Provas e cargos']].map(([tipo, nome]) => <button key={tipo} type="button" aria-pressed={tipoObjetivo === tipo} onClick={() => setTipoObjetivo(tipo)} className={`rounded-full border px-3 py-1.5 text-xs ${tipoObjetivo === tipo ? 'border-indigo-500 text-indigo-300' : 'border-slate-700 text-slate-300'}`}>{nome}</button>)}
          </div>
          {sugestoes.some(item => !tipoObjetivo || item.tipo === tipoObjetivo) && <div className="flex flex-wrap gap-2">
            {sugestoes.filter(item => !tipoObjetivo || item.tipo === tipoObjetivo).map(item => <button key={item.id} type="button" aria-pressed={objetivo === item.id} onClick={() => { setObjetivo(item.id); setBuscaObjetivo(''); setAviso('') }} className="rounded-full border border-slate-700 px-3 py-1.5 text-left text-xs text-slate-200 hover:border-indigo-500 aria-pressed:border-indigo-500 aria-pressed:text-indigo-300">{item.nome}</button>)}
          </div>}
        </div>
        {!opcoesFiltradas.length && (termosBusca.length > 0 || tipoObjetivo) && !catalogoCarregando && <p role="status" className="text-sm text-slate-400 sm:col-span-2">Nenhuma prova ou instituição encontrada com esses filtros.</p>}
        {catalogoCarregando && <p role="status" className="text-sm text-slate-400 sm:col-span-2">Carregando mais provas do acervo…</p>}
        <fieldset className="rounded-2xl border border-slate-700 p-3 sm:col-span-2">
          <legend className="px-2 text-sm font-semibold">O que você quer praticar?</legend>
          <div className="flex flex-wrap gap-2">
            {modosTreino.map(([id, nome]) => <button key={id} type="button" aria-pressed={filtros.situacao === id} onClick={() => setFiltros(atual => ({ ...atual, situacao: id }))} className="rounded-full border border-slate-700 px-3 py-2 text-xs aria-pressed:border-indigo-500 aria-pressed:text-indigo-300">{nome}</button>)}
          </div>
        </fieldset>
        <details onToggle={e => setDetalhar(e.currentTarget.open)} className="rounded-2xl border border-slate-700 p-4 sm:col-span-2">
          <summary className="cursor-pointer text-sm font-semibold">Mais filtros {filtrosAtivos > 0 && `· ${filtrosAtivos} ativos`}</summary>
          {detalhar && <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {camposDetalhe.map(([id, titulo, rotuloTodos]) => {
              const disponiveis = recorte.opcoes[id]
              const opcoes = [...disponiveis.values()].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { numeric: true }))
              for (const value of filtros[id]) {
                if (!disponiveis.has(value)) opcoes.push({ value, label: value, quantidade: 0 })
              }
              return <FiltroMultiplo key={id} titulo={titulo} rotuloTodos={rotuloTodos} opcoes={opcoes} selecionados={filtros[id]} aoAlterar={valores => setFiltros(atual => ({ ...atual, [id]: valores, ...(id === 'materia' ? { conteudo: [] } : {}) }))} />
            })}
            <fieldset className="space-y-2 rounded-xl border border-slate-700 p-3 sm:col-span-2">
              <legend className="px-1 text-sm font-semibold">Recursos e exclusões</legend>
              {[['comentadas', 'Com resolução ou comentário'], ['visuais', 'Com imagem, gráfico ou texto visual'], ['excluirCadernos', 'Excluir questões dos meus cadernos']].map(([id, nome]) => <label key={id} className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-0.5" checked={filtros[id]} onChange={e => setFiltros(atual => ({ ...atual, [id]: e.target.checked }))} />{nome}
              </label>)}
            </fieldset>
            <label className="text-sm sm:col-span-2">Palavra-chave ou código da questão
              <input type="search" className={campo} value={filtros.termo} onChange={e => setFiltros(atual => ({ ...atual, termo: e.target.value }))} placeholder="Ex.: concordância verbal" />
            </label>
          </div>}
        </details>
        <label className="text-sm">Quantidade de questões
          <select className={campo} value={quantidade} onChange={e => setQuantidade(Number(e.target.value))}>
            {[5, 10, 15, 20, 30, 40].map(n => <option key={n} value={n}>{n}{n === 10 ? ' · padrão diário' : ''}</option>)}
          </select>
        </label>
        <div className="self-end rounded-xl border border-slate-700 p-3 text-sm">
          <p role="status">{filtros !== filtrosAdiados ? 'Atualizando seleção…' : <><strong>{recorte.itens.length.toLocaleString('pt-BR')}</strong> questões corrigíveis nesta seleção</>}</p>
          {recorte.itens.length < quantidade && !catalogoCarregando && <p className="mt-1 text-xs text-slate-400">Reduza a quantidade ou retire algum filtro.</p>}
        </div>
        <button type="button" className="w-fit text-sm text-indigo-300 underline sm:col-span-2" onClick={() => { setFiltros(filtrosIniciais); setObjetivo(''); setTipoObjetivo(''); setBuscaObjetivo(''); setQuantidade(10); setAviso('') }}>Limpar filtros</button>
      </div>}
      <button type="button" className={acao} disabled={demo ? base.length < 10 : recorte.itens.length < quantidade || filtros !== filtrosAdiados} onClick={iniciar}>Começar {totalPlanejado} questões</button>
    </div>}
    {demoAtiva && !sessao && <p className="text-sm">{demoAtiva.nome}</p>}
    {demoAtiva?.url && base.length < 10 && (dadosDemo?.erro && dadosDemo.url === demoAtiva.url
      ? <button type="button" className={acao} onClick={() => { setDadosDemo(null); setTentativaDemo(n => n + 1) }}>Tentar carregar amostra novamente</button>
      : <p role="status">Carregando amostra…</p>)}
    {sessao && <>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><strong>{sessao.objetivo || 'Acervo geral'}</strong><span aria-live="polite">{total}/{tamanhoSessao} respondidas</span></div>
      <progress className="w-full accent-indigo-500" max={tamanhoSessao || 1} value={total} aria-label="Progresso do treino" />
      {itens.length !== tamanhoSessao && <p role="status">Aguardando as questões da sessão salva. Se o acervo mudou, inicie outro treino.</p>}
      {itens.length === tamanhoSessao && atual && <form key={atual.id} className="space-y-4" onSubmit={e => {
        e.preventDefault()
        if (!alternativas(atual).some(([letra]) => letra === selecionada)) return
        guardar({ ...sessao, respostas: { ...sessao.respostas, [String(atual.id)]: { letra: selecionada, data: new Date().toISOString() } } })
        setSelecionada('')
      }}>
        {sessao.motivos?.[String(atual.id)] && <p className="text-xs font-semibold text-indigo-300">{sessao.motivos[String(atual.id)]}</p>}
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
        <h2 className="text-xl font-bold">{tamanhoSessao - erros.length} de {tamanhoSessao} acertos</h2>
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
            <p className="whitespace-pre-wrap break-words">{explicacao(q) || 'Ainda não há resolução comentada para esta questão.'}</p>
          </div>
        </details>)}
      </>}
      {!demo && <button type="button" className={acao} onClick={() => {
        if (!completo && total > 0 && !window.confirm('Descartar as respostas deste treino?')) return
        guardar(null)
        setSelecionada('')
      }}>Escolher outro treino</button>}
    </>}
    {aviso && <p role="status" className="text-sm text-amber-300">{aviso}</p>}
  </section>
}
