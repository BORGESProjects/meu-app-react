import { unirQuestoes, podeCorrigir } from './acervo'
import EnunciadoQuestao from './components/EnunciadoQuestao'
import AlternativaComEliminacao from './components/AlternativaComEliminacao'
import FiltroMultiplo from './components/FiltroMultiplo'
import Conta from './components/Conta'
import SessaoEstudo from './components/SessaoEstudo'
import EstadoProgresso from './components/EstadoProgresso'
import {useProgressoUsuario} from './useProgressoUsuario'
import { API_URL } from './api'
import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react'
import { supabase } from './supabaseClient'
import { tentarLeitura, carregarEmEtapas } from './carregarAcervo'
import { opcoesFiltro } from './filtros'
import { indexarFiltros, filtrarIndice, opcoesRelacionadas, atualizarFiltrosRelacionados } from './indiceFiltros'
import { ESPECIFICAS_UEM } from './uem'
import { questoesDaProva, listarProvasCompletas, gerarTreinoCpor } from './simulados'
import { pertenceAoFoco, nomeFoco } from './focoEstudo'
import { useFocoEstudo } from './useFocoEstudo'
import SeletorFoco from './components/SeletorFoco'
import TreinosFoco from './components/TreinosFoco'
import TempoSimulado from './components/TempoSimulado'
import RevisaoSimulado from './components/RevisaoSimulado'

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']
const Redacao = lazy(() => import('./components/Redacao'))
const ImportarPdf = lazy(() => import('./components/ImportarPdf'))
const EditalPlanejador = lazy(() => import('./components/EditalPlanejador'))

function formatarDuracaoPlanejada(minutos) {
  const total = Number(minutos) || 0
  const horas = Math.floor(total / 60)
  const restantes = total % 60
  if (!horas) return `${restantes}min`
  return restantes ? `${horas}h ${restantes}min` : `${horas}h`
}

function questaoDeSomatoria(questao) {
  return questao?.tipo_resposta === 'somatoria'
}

function alternativaSelecionada(respostas, questao, indice) {
  const selecionada = respostas[questao.id]
  return questaoDeSomatoria(questao) ? Array.isArray(selecionada) && selecionada.includes(indice) : selecionada === indice
}

function alternarResposta(setter, questao, indice) {
  setter(prev => {
    if (!questaoDeSomatoria(questao)) return { ...prev, [questao.id]: indice }
    const atuais = Array.isArray(prev[questao.id]) ? prev[questao.id] : []
    const proximas = atuais.includes(indice) ? atuais.filter(item => item !== indice) : [...atuais, indice].sort((a, b) => a - b)
    return { ...prev, [questao.id]: proximas }
  })
}

function avaliarSelecao(questao, selecionada) {
  if (questaoDeSomatoria(questao)) {
    const indices = Array.isArray(selecionada) ? selecionada : []
    const soma = indices.reduce((total, indice) => total + Number(questao.valores_opcoes?.[indice] || 0), 0)
    const correta = Number(questao.resposta_soma ?? questao.resposta_correta)
    return { respondida: indices.length > 0, acertou: soma === correta, escolhida: soma, correta }
  }
  let correta = questao.resposta_correta
  if (typeof correta === 'string') correta = correta.toUpperCase().charCodeAt(0) - 65
  return { respondida: selecionada !== undefined, acertou: selecionada === correta, escolhida: selecionada, correta }
}

export default function App() {
  const requisicaoAcervo = useRef(0)
  const [abaAtiva, setAbaAtiva] = useState('questoes')
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(false)

  // Estados das Questões
  const [questoes, setQuestoes] = useState(() => unirQuestoes())
  const [carregandoAcervo, setCarregandoAcervo] = useState(true)
  const [falhasAcervo, setFalhasAcervo] = useState([])
  const [limiteVisivel, setLimiteVisivel] = useState(40)
  const [respostasSelecionadas, setRespostasSelecionadas] = useState({})
  const [feedbacks, setFeedbacks] = useState({})
  const [alternativasEliminadas, setAlternativasEliminadas] = useState({})

  // Filtros de Questões
  const [filtrosAno, setFiltrosAno] = useState([])
  const [filtrosMateria, setFiltrosMateria] = useState([])
  const [filtrosConteudo, setFiltrosConteudo] = useState([])
  const [filtrosBanca, setFiltrosBanca] = useState([])
  const [filtrosDificuldade, setFiltrosDificuldade] = useState([])
  const [avisoFiltros, setAvisoFiltros] = useState('')

  // Estado do Formulário de Cadastro de Questão
  const [novaQuestao, setNovaQuestao] = useState({
    materia: '',
    conteudo: '',
    banca: '',
    concurso: '',
    ano: new Date().getFullYear(),
    dificuldade: 'Fácil',
    enunciado: '',
    opcoes: ['', '', '', '', ''],
    resposta_correta: 0
  })

  // Estados das Tarefas
  const [novaTarefa, setNovaTarefa] = useState({
    dia: 'Segunda-feira', materia: '', atividade: '', horario: '08:00', minutos: 60
  })

  // Estados de Simulados organizados por edição completa da prova
  const [filtroAnoSimulado, setFiltroAnoSimulado] = useState('Todos')
  const [filtroProvaSimulado, setFiltroProvaSimulado] = useState('Todos')
  const [simuladoAtivo, setSimuladoAtivo] = useState(null) // Guarda o objeto do simulado selecionado
  const [idiomaSimulado, setIdiomaSimulado] = useState('Inglês')
  const [especificasUem, setEspecificasUem] = useState(['Biologia', 'Química'])
  const [respostasSimulado, setRespostasSimulado] = useState({})
  const simuladoFinalizado = useRef(false)
  const [resultadoSimuladoFinal, setResultadoSimuladoFinal] = useState(null)

  // Estados de Desempenho e Horas de Estudo
  const [novaHora, setNovaHora] = useState({ materia: '', horas: '', data: '' })

  // --- NOVOS ESTADOS PARA O CRONÓMETRO E SUGESTÃO DE QUESTÕES ---
  const [materiaEstudo, setMateriaEstudo] = useState('')
  const [questoesSugeridas, setQuestoesSugeridas] = useState([])

  const preferenciaFoco = useFocoEstudo(session)
  const focoEstudo = preferenciaFoco.foco
  const questoesDoFoco = useMemo(() => questoes.filter(q => pertenceAoFoco(q, focoEstudo, true)), [questoes, focoEstudo])
  const progresso = useProgressoUsuario(session?.user?.id)
  const {horas_estudo:horasEstudo, historico_respostas:historicoRespostas, tarefas} = progresso.dados
  const {setHorasEstudo, setHistoricoRespostas, setTarefas, carregado:progressoCarregado,
    status:sincronizacao, erro:erroProgresso} = progresso

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_event, current) => {
      setSession(current); setAuthReady(true)
      if (!current) setIsAdmin(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user?.id || !progressoCarregado) return
    buscarQuestoes()
    const controle = requisicaoAcervo
    return () => { controle.current++ }
  }, [session?.user?.id, progressoCarregado])

  useEffect(() => {
    let cancelled = false
    if (!session) { setIsAdmin(false); setCheckingAdmin(false); return }
    setCheckingAdmin(true)
    fetch(`${API_URL}/api/importacoes/acesso`, {
      headers: { Authorization: `Bearer ${session.access_token}`, 'X-Supabase-Key': import.meta.env.VITE_SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(30000),
    }).then(response => {
      if (!cancelled) setIsAdmin(response.ok)
    }).catch(() => { if (!cancelled) setIsAdmin(false) })
      .finally(() => { if (!cancelled) setCheckingAdmin(false) })
    return () => { cancelled = true }
  }, [session])

  useEffect(() => {
    if (authReady && !checkingAdmin && !isAdmin && ['cadastrar', 'importar'].includes(abaAtiva)) setAbaAtiva('conta')
  }, [authReady, checkingAdmin, isAdmin, abaAtiva])

  async function buscarQuestoes() {
    const requisicao = ++requisicaoAcervo.current
    setCarregandoAcervo(true)
    setFalhasAcervo([])
    const banco = tentarLeitura(async () => {
      const todas = []
      for (let inicio = 0; ; inicio += 500) {
        const {data,error} = await supabase.from('questoes').select('*')
          .order('id', { ascending: false }).range(inicio, inicio + 499)
          .abortSignal(AbortSignal.timeout(30000))
        if (error) throw error
        todas.push(...(data || []))
        if (!data || data.length < 500) return todas
      }
    })
    const importadas = tentarLeitura(async () => {
      const r = await fetch(`${API_URL}/api/acervo`, {signal:AbortSignal.timeout(90000)})
      if (!r.ok) throw new Error('Acervo indisponível')
      const data = await r.json()
      if (!Array.isArray(data)) throw new Error('Resposta inválida do acervo')
      return data
    })
    const enemHistorico = tentarLeitura(async () => {
      const r = await fetch('/acervo/enem-2017-2021/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Edições históricas do ENEM indisponíveis')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 925) throw new Error('Lote histórico do ENEM inválido')
      return data
    })
    const cfnHistorico = tentarLeitura(async () => {
      const r = await fetch('/acervo/cfn-2020-2025/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Edições históricas do CFN indisponíveis')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 300) throw new Error('Lote histórico do CFN inválido')
      return data
    })
    const ufrgs2025 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ufrgs-2025/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UFRGS 2025 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 135) throw new Error('Lote UFRGS 2025 inválido')
      return data
    })
    const ufrgs2024 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ufrgs-2024/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UFRGS 2024 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 135) throw new Error('Lote UFRGS 2024 inválido')
      return data
    })
    const ufrgs2023 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ufrgs-2023/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UFRGS 2023 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 135) throw new Error('Lote UFRGS 2023 inválido')
      return data
    })
    const ufrgs2022 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ufrgs-2022/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UFRGS 2022 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 135) throw new Error('Lote UFRGS 2022 inválido')
      return data
    })
    const espcexHistorico = tentarLeitura(async () => {
      const r = await fetch('/acervo/espcex-2017-2026/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Edições históricas da EsPCEx indisponíveis')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 1000) throw new Error('Lote histórico da EsPCEx inválido')
      return data
    })
    const ufpr2025 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ufpr-2025/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UFPR 2025 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 90) throw new Error('Lote UFPR 2025 inválido')
      return data
    })
    const ufpr2024 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ufpr-2024/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UFPR 2024 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 90) throw new Error('Lote UFPR 2024 inválido')
      return data
    })
    const ufpr2023 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ufpr-2023/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UFPR 2023 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 90) throw new Error('Lote UFPR 2023 inválido')
      return data
    })
    const ufpr2022 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ufpr-2022/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UFPR 2022 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 60) throw new Error('Lote UFPR 2022 inválido')
      return data
    })
    const ufpr2021 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ufpr-2021/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UFPR 2021 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 60) throw new Error('Lote UFPR 2021 inválido')
      return data
    })
    const ufpr2020 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ufpr-2020/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UFPR 2020 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 90) throw new Error('Lote UFPR 2020 inválido')
      return data
    })
    const ufpr2019 = tentarLeitura(async () => {
      const r = await fetch("/acervo/ufpr-2019/questoes.json", {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error("Vestibular UFPR 2019 indisponível")
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 90) throw new Error("Lote UFPR 2019 inválido")
      return data
    })
    const utfpr2026 = tentarLeitura(async () => {
      const r = await fetch('/acervo/utfpr-2026/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UTFPR 2026 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 44) throw new Error('Lote UTFPR 2026 inválido')
      return data
    })
    const utfpr2025 = tentarLeitura(async () => {
      const r = await fetch('/acervo/utfpr-2025/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UTFPR 2025 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 60) throw new Error('Lote UTFPR 2025 inválido')
      return data
    })
    const utfpr2024 = tentarLeitura(async () => {
      const r = await fetch('/acervo/utfpr-2024/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UTFPR 2024 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 60) throw new Error('Lote UTFPR 2024 inválido')
      return data
    })
    const utfpr2024Inverno = tentarLeitura(async () => {
      const r = await fetch('/acervo/utfpr-2024-2/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UTFPR 2024/2 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 60) throw new Error('Lote UTFPR 2024/2 inválido')
      return data
    })
    const utfpr2023 = tentarLeitura(async () => {
      const r = await fetch('/acervo/utfpr-2023/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular UTFPR 2023 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 60) throw new Error('Lote UTFPR 2023 inválido')
      return data
    })
    const ifpr2024 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ifpr-2024/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Processo Seletivo IFPR 2024 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 55) throw new Error('Lote IFPR 2024 inválido')
      return data
    })
    const ifpr2023 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ifpr-2023/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Processo Seletivo IFPR 2023 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 55) throw new Error('Lote IFPR 2023 inválido')
      return data
    })
    const ifpr2020 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ifpr-2020/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Lote IFPR 2020 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 55) throw new Error('Lote IFPR 2020 inválido')
      return data
    })
    const ifpr2019 = tentarLeitura(async () => {
      const r = await fetch('/acervo/ifpr-2019/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Processo Seletivo IFPR 2019 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 55) throw new Error('Lote IFPR 2019 inválido')
      return data
    })
    const uem2025 = tentarLeitura(async () => {
      const r = await fetch('/acervo/uem-2025/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular de Verão UEM 2025 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 58) throw new Error('Lote UEM 2025 inválido')
      return data
    })
    const uem2025Inverno = tentarLeitura(async () => {
      const r = await fetch('/acervo/uem-2025-inverno/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular de Inverno UEM 2025 indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 58) throw new Error('Lote UEM Inverno 2025 inválido')
      return data
    })
    const uemHistorico = tentarLeitura(async () => {
      const cadernos = [['uem-2019-ve',220], ['uem-2019-in',220], ['uem-2020-anual',220], ['uem-2021-anual',140], ['uem-2022-anual',140], ['uem-2023-ve',58], ['uem-2023-in',58], ['uem-2024-ve',58], ['uem-2024-in',58]]
      const lotes = await Promise.all(cadernos.map(async ([nome, quantidade]) => {
        const r = await fetch(`/acervo/${nome}/questoes.json`, {signal:AbortSignal.timeout(30000)})
        if (!r.ok) throw new Error(`Lote ${nome} indisponível`)
        const data = await r.json()
        if (!Array.isArray(data) || data.length !== quantidade) throw new Error(`Lote ${nome} inválido`)
        return data
      }))
      return lotes.flat()
    })
    const pucpr2024InvernoMedicina = tentarLeitura(async () => {
      const r = await fetch('/acervo/pucpr-2024-2-medicina/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular de Inverno PUCPR 2024/2 Medicina indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 60) throw new Error('Lote PUCPR 2024/2 Medicina inválido')
      return data
    })
    const pucpr2025VeraoMedicina = tentarLeitura(async () => {
      const r = await fetch('/acervo/pucpr-2025-1-medicina/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular de Verão PUCPR 2025/1 Medicina indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 60) throw new Error('Lote PUCPR 2025/1 Medicina inválido')
      return data
    })
    const pucpr2025InvernoMedicina = tentarLeitura(async () => {
      const r = await fetch('/acervo/pucpr-2025-2-medicina/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Vestibular de Inverno PUCPR 2025/2 Medicina indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 60) throw new Error('Lote PUCPR 2025/2 Medicina inválido')
      return data
    })
    const teoremaRevisadas = tentarLeitura(async () => {
      const r = await fetch('/acervo/teorema-180/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Questões revisadas indisponíveis')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 2155) throw new Error('Lote de questões revisadas incompleto')
      return data
    })
    const federaisRevisadas = tentarLeitura(async () => {
      const lotes = await Promise.all([['prf-2019',120],['pf-2021-delegado',120],['prf-2021',128],['pf-2021-operacionais',153],['pf-2025-delegado',120],['pf-2025-operacionais',168],['pf-2025-peritos',952]].map(async ([nome,quantidade]) => {
        const r = await fetch(`/acervo/${nome}/questoes.json`, {signal:AbortSignal.timeout(30000)})
        if (!r.ok) throw new Error('Caderno federal indisponível')
        const data = await r.json()
        if (!Array.isArray(data) || data.length !== quantidade) throw new Error('Caderno federal incompleto')
        return data
      }))
      return lotes.flat()
    })
    const fontes = ['banco de questões', 'questões importadas', 'ENEM 2017 a 2021', 'CFN 2020 a 2025', 'UFRGS 2025', 'UFRGS 2024', 'UFRGS 2023', 'UFRGS 2022', 'EsPCEx 2017 a 2026', 'UFPR 2025', 'UFPR 2024', 'UFPR 2023', 'UFPR 2022', 'UFPR 2021', 'UFPR 2020', 'UFPR 2019', 'UTFPR 2026', 'UTFPR 2025', 'UTFPR 2024/1', 'UTFPR 2024/2', 'UTFPR 2023', 'IFPR 2024', 'IFPR 2023', 'IFPR 2020 completa', 'IFPR 2019 completa', 'UEM Verão 2025 completa', 'UEM Inverno 2025 completa', 'UEM 2019 a 2024 completa', 'PUC-PR 2024/2 Medicina', 'PUC-PR 2025/1 Medicina', 'PUC-PR 2025/2 Medicina', 'PF e PRF revisadas', 'questões revisadas do material de estudo']
    const resultados = await carregarEmEtapas([banco,importadas,enemHistorico,cfnHistorico,ufrgs2025,ufrgs2024,ufrgs2023,ufrgs2022,espcexHistorico,ufpr2025,ufpr2024,ufpr2023,ufpr2022,ufpr2021,ufpr2020,ufpr2019,utfpr2026,utfpr2025,utfpr2024,utfpr2024Inverno,utfpr2023,ifpr2024,ifpr2023,ifpr2020,ifpr2019,uem2025,uem2025Inverno,uemHistorico,pucpr2024InvernoMedicina,pucpr2025VeraoMedicina,pucpr2025InvernoMedicina,federaisRevisadas,teoremaRevisadas], estaticas => {
      if (requisicao !== requisicaoAcervo.current) return
      const parciais = estaticas.flatMap(r => r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : [])
      setQuestoes(unirQuestoes(parciais))
    })
    if (requisicao !== requisicaoAcervo.current) return
    const carregadas = resultados.flatMap(resultado => resultado.status === 'fulfilled' && Array.isArray(resultado.value) ? resultado.value : [])
    setQuestoes(unirQuestoes(carregadas))
    setFalhasAcervo(resultados.flatMap((resultado,i) => resultado.status === 'rejected' ? [fontes[i]] : []))
    setCarregandoAcervo(false)
  }

  function registarHoras(e) {
    e.preventDefault()
    if (!novaHora.materia || !novaHora.horas) return

    const registo = {
      id: crypto.randomUUID(),
      materia: novaHora.materia,
      horas: parseFloat(novaHora.horas),
      data: novaHora.data || new Date().toISOString().split('T')[0],
      criado_em: new Date().toISOString(),
    }
    setHorasEstudo(prev => [registo, ...prev])
    setNovaHora({ materia: '', horas: '', data: '' })

  }

  // --- FUNÇÕES DO CRONÓMETRO E RECOMENDAÇÃO ---
  function concluirSessaoEstudo({id, materia, conteudo, segundos}) {
    const horasEstudadas = segundos / 3600
    setMateriaEstudo(materia)
    const dataHoje = new Date().toISOString().split('T')[0]

    // 1. Guardar automaticamente no progresso desta conta
    setHorasEstudo(prev => [{
      id,
      materia,
      horas: horasEstudadas,
      segundos,
      data: dataHoje,
      criado_em: new Date().toISOString(),
    }, ...prev])

    // 2. Sugerir questões com base na matéria e conteúdo estudados
    let filtradas = questoes.filter(q => podeCorrigir(q) && String(q.materia || '').toLowerCase() === materia.toLowerCase())
    if (conteudo.trim()) {
      const exatas = filtradas.filter(q => q.conteudo && q.conteudo.toLowerCase().includes(conteudo.toLowerCase()))
      if (exatas.length > 0) filtradas = exatas
    }

    // Embaralhar e pegar até 3 questões para sugestão imediata
    const recomendadas = filtradas.sort(() => 0.5 - Math.random()).slice(0, 3)
    setQuestoesSugeridas(recomendadas)

  }

  function alternativaFoiEliminada(contexto, questaoId, indice) {
    return alternativasEliminadas[`${contexto}:${questaoId}`]?.includes(indice) || false
  }

  function alternarEliminacao(contexto, questaoId, indice) {
    const chave = `${contexto}:${questaoId}`
    setAlternativasEliminadas(prev => {
      const atuais = prev[chave] || []
      const proximas = atuais.includes(indice) ? atuais.filter(item => item !== indice) : [...atuais, indice]
      return { ...prev, [chave]: proximas }
    })

    const limparResposta = setter => setter(prev => {
      if (Array.isArray(prev[questaoId])) {
        return { ...prev, [questaoId]: prev[questaoId].filter(item => item !== indice) }
      }
      if (prev[questaoId] !== indice) return prev
      const proximo = { ...prev }
      delete proximo[questaoId]
      return proximo
    })
    limparResposta(contexto === 'simulado' ? setRespostasSimulado : setRespostasSelecionadas)
  }

  function limparEliminacoesDoSimulado() {
    setAlternativasEliminadas(prev => Object.fromEntries(Object.entries(prev).filter(([chave]) => !chave.startsWith('simulado:'))))
  }

  async function salvarQuestao(e) {
    e.preventDefault()
    if (!session || !isAdmin) { setAbaAtiva('conta'); return }
    const questaoParaEnviar = { ...novaQuestao, opcoes: [...novaQuestao.opcoes] }
    try {
      const response = await fetch(`${API_URL}/api/admin/questoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, 'X-Supabase-Key': import.meta.env.VITE_SUPABASE_ANON_KEY },
        body: JSON.stringify(questaoParaEnviar),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Não foi possível salvar a questão.')
      alert('Questão cadastrada com sucesso!')
      setNovaQuestao({
        materia: '', conteudo: '', banca: '', concurso: '', ano: new Date().getFullYear(),
        dificuldade: 'Fácil', enunciado: '', opcoes: ['', '', '', '', ''], resposta_correta: 0
      })
      await buscarQuestoes()
      setAbaAtiva('questoes')
    } catch (error) { alert('Erro ao salvar questão: ' + error.message) }
  }

  function adicionarTarefa(e) {
    e.preventDefault()
    if (!novaTarefa.materia.trim()) return
    setTarefas(prev => [...prev, {
      id: crypto.randomUUID(),
      dia: novaTarefa.dia,
      materia: novaTarefa.materia.trim(),
      atividade: novaTarefa.atividade.trim(),
      horario: novaTarefa.horario,
      minutos: Math.max(15, Number(novaTarefa.minutos) || 60),
      concluida: false,
      criada_em: new Date().toISOString(),
    }])
    setNovaTarefa(atual => ({ ...atual, materia: '', atividade: '' }))
  }

  function deletarTarefa(id) {
    setTarefas(prev => prev.filter(tarefa => tarefa.id !== id))
  }

  function alternarTarefa(id) {
    setTarefas(prev => prev.map(tarefa => tarefa.id === id
      ? { ...tarefa, concluida: !tarefa.concluida }
      : tarefa))
  }

  function validarResposta(questaoId, _respostaCorretaDoBanco, isSimulado = false) {
    const questaoAtual = questoes.find(q => q.id === questaoId)
    if (!podeCorrigir(questaoAtual || {})) return
    const selecionada = isSimulado ? respostasSimulado[questaoId] : respostasSelecionadas[questaoId]
    const avaliacao = avaliarSelecao(questaoAtual, selecionada)
    if (!avaliacao.respondida) return

    if (!isSimulado) {
      setHistoricoRespostas(prev => [...prev, {
        id: crypto.randomUUID(), questaoId, acertou: avaliacao.acertou,
        materia: questaoAtual.materia, conteudo: questaoAtual.conteudo,
        respostaSelecionada: avaliacao.escolhida, respostaCorreta: avaliacao.correta,
        tipo: 'questao', respondidaEm: new Date().toISOString(),
      }])
      if (avaliacao.acertou) {
        setFeedbacks({ ...feedbacks, [questaoId]: { status: 'correto', msg: '✨ Resposta Correta!' } })
      } else {
        const resposta = questaoDeSomatoria(questaoAtual)
          ? `a soma ${String(avaliacao.correta).padStart(2, '0')}`
          : `a letra ${String.fromCharCode(65 + avaliacao.correta)}`
        setFeedbacks({ ...feedbacks, [questaoId]: { status: 'incorreto', msg: `❌ Incorreto. A resposta oficial era ${resposta}.` } })
      }
    }
    return avaliacao.acertou
  }

  function finalizarSimulado() {
    if (!simuladoAtivo || simuladoFinalizado.current) return
    simuladoFinalizado.current = true
    const questoesSimulado = questoesSimuladoAtivo
    let acertos = 0
    let erros = 0
    const detalhes = []
    const novasRespostas = []

    questoesSimulado.forEach(q => {
      const selecionada = respostasSimulado[q.id]
      const avaliacao = avaliarSelecao(q, selecionada)
      if (avaliacao.respondida) {
        if (avaliacao.acertou) acertos++
        else erros++

        detalhes.push({ ...q, acertou: avaliacao.acertou, escolhida: avaliacao.escolhida, correta: avaliacao.correta })
        novasRespostas.push({
          id: crypto.randomUUID(), questaoId: q.id, acertou: avaliacao.acertou,
          materia: q.materia, conteudo: q.conteudo,
          respostaSelecionada: avaliacao.escolhida, respostaCorreta: avaliacao.correta,
          tipo: 'simulado', concurso: simuladoAtivo.concurso, foco: simuladoAtivo.foco,
          respondidaEm: new Date().toISOString(),
        })
      } else {
        erros++
        detalhes.push({ ...q, acertou: false, nãoRespondida: true })
      }
    })

    if (novasRespostas.length > 0) setHistoricoRespostas(prev => [...prev, ...novasRespostas])
    setResultadoSimuladoFinal({ acertos, erros, total: questoesSimulado.length, detalhes, duracaoSegundos: Math.max(0, Math.floor((Date.now() - simuladoAtivo.inicio) / 1000)) })
  }

  const totalFiltrosAtivos = [filtrosAno, filtrosMateria, filtrosConteudo, filtrosBanca, filtrosDificuldade]
    .filter(valores => valores.length > 0).length
  const temFiltrosAtivos = totalFiltrosAtivos > 0

  const indiceFiltros = useMemo(() => indexarFiltros(questoesDoFoco), [questoesDoFoco])
  const filtrosAtuais = useMemo(() => ({ano:filtrosAno,materia:filtrosMateria,conteudo:filtrosConteudo,banca:filtrosBanca,dificuldade:filtrosDificuldade}), [filtrosAno,filtrosMateria,filtrosConteudo,filtrosBanca,filtrosDificuldade])
  const opcoesAtuais = useMemo(() => opcoesRelacionadas(indiceFiltros,filtrosAtuais), [indiceFiltros,filtrosAtuais])
  const questoesFiltradas = useMemo(() => filtrarIndice(indiceFiltros,filtrosAtuais), [indiceFiltros,filtrosAtuais])
  function chaveDoFiltro(campo) {
    return focoEstudo+':'+campo+':'+JSON.stringify(Object.entries(filtrosAtuais).filter(([outro])=>outro!==campo))
  }
  function alterarFiltro(campo,valores) {
    const {filtros,removidos}=atualizarFiltrosRelacionados(indiceFiltros,filtrosAtuais,campo,valores)
    setFiltrosAno(filtros.ano); setFiltrosMateria(filtros.materia); setFiltrosConteudo(filtros.conteudo)
    setFiltrosBanca(filtros.banca); setFiltrosDificuldade(filtros.dificuldade); setLimiteVisivel(40)
    setAvisoFiltros(removidos.length ? 'Seleções sem questões compatíveis foram removidas para acompanhar sua última escolha.' : '')
  }
  const questoesVisiveis = useMemo(() => questoesFiltradas.slice(0, limiteVisivel), [questoesFiltradas, limiteVisivel])

  const simuladosDisponiveis = useMemo(() => abaAtiva === 'simulados' ? listarProvasCompletas(questoes, idiomaSimulado, especificasUem).filter(p => pertenceAoFoco(p, focoEstudo)) : [], [abaAtiva, questoes, idiomaSimulado, especificasUem, focoEstudo])
  function iniciarSimulado(simulado) {
    // O acervo que chega depois não altera uma prova já iniciada.
    const itens = simulado.tipo === 'personalizado' ? simulado.itens : simulado.tipo === 'treino' ? gerarTreinoCpor(questoes) : questoesDaProva(questoes, simulado.id, idiomaSimulado, especificasUem)
    if (!itens.length) return
    simuladoFinalizado.current = false
    setSimuladoAtivo({ ...simulado, questoes: [...itens], inicio: Date.now(), foco: focoEstudo })
    setRespostasSimulado({}); setResultadoSimuladoFinal(null); limparEliminacoesDoSimulado()
  }

  const simuladosFiltrados = simuladosDisponiveis.filter(sim => {
    const bateAno = filtroAnoSimulado === 'Todos' || sim.ano === filtroAnoSimulado
    const bateProva = filtroProvaSimulado === 'Todos' || sim.id === filtroProvaSimulado
    return bateAno && bateProva
  })
  const anosSimuladoDisponiveis = [...new Set(simuladosDisponiveis.map(sim => sim.ano))].sort((a, b) => b.localeCompare(a, 'pt-BR', { numeric: true }))
  const provasSimuladoDisponiveis = simuladosDisponiveis.filter(sim => filtroAnoSimulado === 'Todos' || sim.ano === filtroAnoSimulado)

  const {materia:materiasDisponiveis,banca:bancasDisponiveis,ano:anosDisponiveis,dificuldade:dificuldadesDisponiveis,conteudo:conteudosDisponiveis}=opcoesAtuais
  const materiasCronograma = useMemo(() => opcoesFiltro(questoesDoFoco,'materia'), [questoesDoFoco])
  const questoesSimuladoAtivo = useMemo(() => simuladoAtivo
    ? simuladoAtivo.questoes : [],
    [simuladoAtivo])
  function limparFiltros() {
    setFiltrosAno([]); setFiltrosMateria([]); setFiltrosConteudo([])
    setFiltrosBanca([]); setFiltrosDificuldade([]); setLimiteVisivel(40); setAvisoFiltros('')
  }

  const totalHorasEstudo = horasEstudo.reduce((acc, curr) => acc + (curr.horas || 0), 0)
  const totalQuestoesResolvidas = historicoRespostas.length
  const totalAcertos = historicoRespostas.filter(h => h.acertou).length
  const taxaAcertoGeral = totalQuestoesResolvidas > 0 ? ((totalAcertos / totalQuestoesResolvidas) * 100).toFixed(1) : 0

  const tarefasDoCronograma = tarefas.filter(tarefa => DIAS_SEMANA.includes(tarefa.dia))
  const tarefasSemDia = tarefas.filter(tarefa => !DIAS_SEMANA.includes(tarefa.dia))
  const minutosPlanejados = tarefasDoCronograma.reduce((total, tarefa) => total + (Number(tarefa.minutos) || 0), 0)
  const minutosConcluidos = tarefasDoCronograma.filter(tarefa => tarefa.concluida).reduce((total, tarefa) => total + (Number(tarefa.minutos) || 0), 0)
  const nomesDiaAtual = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  const diaAtual = nomesDiaAtual[new Date().getDay()]

  const errosPorConteudo = {}
  historicoRespostas.forEach(h => {
    if (!h.acertou && h.conteudo) {
      errosPorConteudo[h.conteudo] = (errosPorConteudo[h.conteudo] || 0) + 1
    }
  })
  const pontosAMelhorar = Object.entries(errosPorConteudo).sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (!authReady) return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center"><p className="text-sm text-indigo-300">Verificando sua sessão…</p></div>

  if (!session) return <div className="min-h-screen bg-slate-950 text-slate-100 px-3 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto mb-8 flex max-w-md items-center justify-center gap-3 text-2xl font-extrabold">
      <span className="rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 px-3 py-1.5 text-base shadow-lg shadow-indigo-500/20">AP</span>
      <span>AP Aprovado</span>
    </div>
    <Conta session={null} isAdmin={false} checkingAdmin={false} />
  </div>

  if (!progressoCarregado) return <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4 px-6 text-center">
    <p className="text-sm text-indigo-300">Carregando seu progresso…</p>
    {erroProgresso && <><EstadoProgresso progresso={progresso} /><button className="text-sm text-slate-400" onClick={() => supabase.auth.signOut()}>Voltar ao login</button></>}
  </div>

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Barra de Navegação Superior Refinada */}
      <nav className="sticky top-0 z-50 flex flex-col items-stretch gap-3 border-b border-slate-800/80 bg-slate-950/80 px-3 py-3 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-6 md:py-3.5">
        <div className="flex items-center gap-2.5 px-1 text-lg font-extrabold tracking-tight sm:text-xl">
          <span className="bg-gradient-to-tr from-indigo-500 to-violet-500 text-white px-2.5 py-1 rounded-xl shadow-lg shadow-indigo-500/20 text-sm">AP</span>
          <span className="text-slate-100">Aprovado</span>
        </div>
        <div aria-label="Navegação principal" className="mobile-nav flex w-full items-center gap-1.5 overflow-x-auto pb-1 md:w-auto md:pb-0">
          {[
            { id: 'questoes', label: '📚 Questões' },
            { id: 'simulados', label: '📝 Simulados' },
            { id: 'desempenho', label: '📈 Desempenho' },
            ...(isAdmin ? [{ id: 'cadastrar', label: '➕ Cadastrar' }, { id: 'importar', label: '📄 Importar PDF' }] : []),
            { id: 'edital', label: '📋 Edital' },
            { id: 'redacao', label: '✍️ Redação' },
            { id: 'tarefas', label: '⚡ Tarefas' },
            { id: 'conta', label: '👤 Minha conta' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id)}
              className={`shrink-0 whitespace-nowrap px-3 py-2 rounded-2xl text-xs md:text-sm font-medium transition-all duration-200 ${abaAtiva === tab.id ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto min-w-0 max-w-5xl p-3 sm:p-6 md:p-8">
        <EstadoProgresso progresso={progresso} />
        <SeletorFoco preferencia={preferenciaFoco} bloqueado={Boolean(simuladoAtivo)} onEscolher={valor => { if(simuladoAtivo) return; preferenciaFoco.escolher(valor); limparFiltros(); setFiltroAnoSimulado('Todos'); setFiltroProvaSimulado('Todos') }} />
        {abaAtiva === 'conta' && <Conta session={session} isAdmin={isAdmin} checkingAdmin={checkingAdmin} sincronizacao={sincronizacao} totais={{ horas: totalHorasEstudo, questoes: totalQuestoesResolvidas, acertos: totalAcertos }} />}
        {abaAtiva === 'importar' && isAdmin && <Suspense fallback={<p role="status" className="text-sm text-indigo-300">Carregando importador…</p>}><ImportarPdf onPublicado={buscarQuestoes} /></Suspense>}
        {/* ABA: BANCO DE QUESTÕES */}
        {abaAtiva === 'questoes' && (
          <div>
            <header className="mb-6">
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">Banco de Questões</h1>
              <p className="text-slate-400 text-sm mt-1">{temFiltrosAtivos
                ? `${questoesFiltradas.length} questão(ões) encontrada(s). ${questoesFiltradas.filter(q => q.anulada).length} anulada(s), disponíveis apenas para consulta.`
                : 'Escolha os filtros abaixo para exibir as questões que deseja estudar.'}</p>
              {carregandoAcervo && <p role="status" className="text-indigo-300 text-sm mt-2">Carregando o restante do acervo… A quantidade acima ainda é parcial.</p>}
              {!carregandoAcervo && falhasAcervo.length === 0 && <p role="status" className="text-emerald-300 text-sm mt-2">Acervo carregado: {questoesDoFoco.length.toLocaleString('pt-BR')} questões neste foco.</p>}
              {falhasAcervo.length > 0 && <div role="alert" className="text-amber-300 text-sm mt-2">Não foi possível carregar: {falhasAcervo.join(' e ')}. A lista pode estar incompleta. <button className="underline font-semibold" onClick={buscarQuestoes} disabled={carregandoAcervo}>Tentar carregar novamente</button></div>}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-indigo-300">
                <a href="/acervo/esa-2025/prova-original.pdf" target="_blank" rel="noreferrer">ESA 2025: prova completa e proposta de redação ↗</a>
                <a href="/acervo/esa-2025/gabarito-definitivo.pdf" target="_blank" rel="noreferrer">Gabarito definitivo ↗</a>
              </div>
              <details className="mt-3 text-sm text-indigo-300">
                <summary className="cursor-pointer">ENEM 2022 · cadernos e gabaritos oficiais</summary>
                <p className="text-slate-400 mt-2">185 questões com inglês e espanhol separados. A questão 157 está anulada. Filtre por ano 2022 e banca ENEM.</p>
                <div className="flex flex-wrap gap-4 mt-2">
                  {[1, 2].map(dia => <span key={dia} className="flex gap-3">
                    <a href={`/acervo/enem-2022/prova-dia${dia}.pdf`} target="_blank" rel="noreferrer">Prova do {dia}º dia ↗</a>
                    <a href={`/acervo/enem-2022/gabarito-dia${dia}.pdf`} target="_blank" rel="noreferrer">Gabarito do {dia}º dia ↗</a>
                  </span>)}
                </div>
              </details>
            </header>

            {/* Filtros */}
            <div className="relative z-20 mb-6 grid grid-cols-1 items-start gap-x-5 gap-y-5 overflow-visible rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl backdrop-blur-md sm:mb-8 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div><h2 className="font-bold text-slate-100">Filtrar questões</h2><p className="text-xs text-slate-400 mt-1">Os filtros se ajustam entre si: só aparecem opções com questões disponíveis para sua seleção.</p></div>
                {totalFiltrosAtivos > 0 && <button type="button" onClick={limparFiltros} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-indigo-500 hover:text-indigo-200">Limpar {totalFiltrosAtivos} filtro(s)</button>}
              </div>
              {avisoFiltros && <p role="status" className="sm:col-span-2 lg:col-span-3 text-xs text-indigo-300">{avisoFiltros}</p>}
              <FiltroMultiplo key={chaveDoFiltro('ano')} titulo="Ano" opcoes={anosDisponiveis} selecionados={filtrosAno} aoAlterar={valores => alterarFiltro('ano',valores)} rotuloTodos="Todos os anos" />
              <FiltroMultiplo key={chaveDoFiltro('materia')} titulo={`Matéria (${materiasDisponiveis.length})`} opcoes={materiasDisponiveis} selecionados={filtrosMateria} aoAlterar={valores => alterarFiltro('materia',valores)} rotuloTodos="Todas as matérias" />
              <FiltroMultiplo key={chaveDoFiltro('conteudo')} titulo={`Conteúdo (${conteudosDisponiveis.length} grupos)`} opcoes={conteudosDisponiveis} selecionados={filtrosConteudo} aoAlterar={valores => alterarFiltro('conteudo',valores)} rotuloTodos="Todos os conteúdos" />
              <FiltroMultiplo key={chaveDoFiltro('banca')} titulo={`Banca (${bancasDisponiveis.length})`} opcoes={bancasDisponiveis} selecionados={filtrosBanca} aoAlterar={valores => alterarFiltro('banca',valores)} rotuloTodos="Todas as bancas" />
              <FiltroMultiplo key={chaveDoFiltro('dificuldade')} titulo="Dificuldade" opcoes={dificuldadesDisponiveis} selecionados={filtrosDificuldade} aoAlterar={valores => alterarFiltro('dificuldade',valores)} rotuloTodos="Todas as dificuldades" />
            </div>

            <div className="relative z-0 space-y-6">
              {!temFiltrosAtivos ? (
                <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700/80">
                  <div className="mb-3 text-3xl" aria-hidden="true">⌕</div>
                  <p className="font-semibold text-slate-300">Selecione pelo menos um filtro</p>
                  <p className="mt-1 text-sm text-slate-500">Você pode combinar anos, matérias, conteúdos, bancas e dificuldades.</p>
                </div>
              ) : questoesFiltradas.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/80">
                  <p className="text-slate-400">Nenhuma questão encontrada com os filtros selecionados.</p>
                </div>
              ) : (
                questoesVisiveis.map((q) => (
                  <div key={q.id} className="questao-renderizavel bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-7 shadow-xl backdrop-blur-md transition-all hover:border-slate-700">
                    <div className="flex flex-wrap gap-2.5 mb-5">
                      {q.materia && <span className="bg-slate-800 text-slate-300 px-3.5 py-1 rounded-full text-xs font-medium">{q.materia}</span>}
                      {q.conteudo && <span className="bg-slate-800 text-slate-300 px-3.5 py-1 rounded-full text-xs font-medium">{q.conteudo}</span>}
                      {q.dificuldade && <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-medium">{q.dificuldade}</span>}
                      {q.banca && <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3.5 py-1 rounded-full text-xs font-medium">{q.banca}</span>}
                      {q.concurso && <span className="bg-slate-800 text-slate-300 px-3.5 py-1 rounded-full text-xs font-medium">{q.concurso}</span>}
                    </div>
                    <EnunciadoQuestao questao={q} />
                    {questaoDeSomatoria(q) && <p className="mb-3 text-xs font-medium text-indigo-300">Marque todas as afirmações corretas. A resposta é a soma dos valores selecionados.</p>}
                    <div className="space-y-3 mb-6">
                      {Array.isArray(q.opcoes) && q.opcoes.map((opcao, idx) => <AlternativaComEliminacao
                        key={idx} questao={q} indice={idx} texto={opcao}
                        selecionada={alternativaSelecionada(respostasSelecionadas, q, idx)}
                        eliminada={alternativaFoiEliminada('normal', q.id, idx)}
                        onSelecionar={() => alternarResposta(setRespostasSelecionadas, q, idx)}
                        onEliminar={() => alternarEliminacao('normal', q.id, idx)}
                      />)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <button disabled={!podeCorrigir(q)} onClick={() => validarResposta(q.id, q.resposta_correta)} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium px-6 py-2.5 rounded-2xl text-sm transition-all shadow-md shadow-indigo-600/20">Responder</button>
                      {!podeCorrigir(q) && <span className="text-xs font-medium text-amber-300">{q.anulada ? 'Questão anulada: disponível apenas para consulta.' : 'Gabarito ainda não disponível para correção.'}</span>}
                      {feedbacks[q.id] && <span className={`text-sm font-semibold ${feedbacks[q.id].status === 'correto' ? 'text-emerald-400' : 'text-red-400'}`}>{feedbacks[q.id].msg}</span>}
                    </div>
                  </div>
                ))
              )}
              {limiteVisivel < questoesFiltradas.length && <button className="mx-auto block rounded-2xl border border-indigo-500/40 bg-indigo-500/10 px-6 py-3 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/20" onClick={() => setLimiteVisivel(value => value + 40)}>Mostrar mais 40 questões</button>}
            </div>
          </div>
        )}

        {/* ABA: SIMULADOS */}
        {abaAtiva === 'simulados' && (
          <div>
            {!simuladoAtivo ? (
              <div>
                <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">📝 Provas e Simulados</h1>
                    <p className="text-slate-400 text-sm mt-1">{focoEstudo === 'vestibulares' ? 'Provas de vestibulares e treinos por áreas do conhecimento.' : focoEstudo === 'concursos' ? 'Provas de concursos públicos e simulados com as matérias do seu objetivo.' : focoEstudo === 'militares' ? 'Provas militares e treinos personalizados, incluindo CPOR/NPOR.' : 'Provas de concursos e vestibulares, com liberdade para montar seu treino.'}</p>
                  </div>
                </header>

                <TreinosFoco key={focoEstudo} questoes={questoes} foco={focoEstudo} historico={historicoRespostas} onIniciar={iniciarSimulado} />
                <h2 className="mb-2 text-xl font-bold text-slate-100">Edições completas</h2>
                <p className="mb-5 text-sm text-slate-400">Somente cadernos conferidos e integralmente carregados. Anuladas são descontadas da correção; conjuntos parciais continuam disponíveis no banco de questões.</p>
                <div className="mb-5 grid gap-4 rounded-2xl border border-slate-800 p-4 sm:grid-cols-3">
                  <label className="text-sm text-slate-300">Idioma das provas
                    <select value={idiomaSimulado} onChange={e => setIdiomaSimulado(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-900 p-3">
                      {['Inglês','Espanhol','Francês'].map(idioma => <option key={idioma}>{idioma}</option>)}
                    </select>
                    <span className="mt-1 block text-xs text-slate-400">Francês nas provas UEM; nas demais, mantém Inglês quando aplicável.</span>
                  </label>
                  {['vestibulares','sem-preferencia'].includes(focoEstudo) && [0,1].map(indice => <label key={indice} className="text-sm text-slate-300">Específica UEM {indice + 1}
                    <select value={especificasUem[indice]} onChange={e => setEspecificasUem(atuais => atuais.map((materia,i) => i === indice ? e.target.value : materia))} className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-900 p-3">
                      {ESPECIFICAS_UEM.filter(materia => materia !== especificasUem[1-indice]).map(materia => <option key={materia}>{materia}</option>)}
                    </select>
                  </label>)}
                </div>
                <div className="mb-6 grid grid-cols-1 gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl backdrop-blur-md sm:mb-8 sm:p-6 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Ano</label>
                    <select
                      value={filtroAnoSimulado}
                      onChange={(e) => { setFiltroAnoSimulado(e.target.value); setFiltroProvaSimulado('Todos') }}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                      <option value="Todos">Todos os anos</option>
                      {anosSimuladoDisponiveis.map(ano => <option key={ano} value={ano}>{ano}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Prova</label>
                    <select
                      value={filtroProvaSimulado}
                      onChange={(e) => setFiltroProvaSimulado(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                      <option value="Todos">Todas as provas</option>
                      {provasSimuladoDisponiveis.map(sim => <option key={sim.id} value={sim.id}>{sim.prova}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {simuladosFiltrados.map(simulado => (
                    <div key={simulado.id} className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-indigo-500/40 transition-all group">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-medium">
                            {simulado.ano}
                          </span>
                          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                            {simulado.banca}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-100 mt-3 group-hover:text-indigo-300 transition-colors">
                          {simulado.prova}
                        </h3>
                        <p className="text-slate-400 text-sm mt-2">{simulado.questoesCount} questões para responder · {simulado.totalOriginal} posições no caderno{simulado.anuladas > 0 ? ` · ${simulado.anuladas} anulada(s)` : ''}.</p>
                      </div>
                      <button
                        onClick={() => iniciarSimulado(simulado)}
                        className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/25"
                      >
                        Iniciar Simulado
                      </button>
                    </div>
                  ))}

                  {simuladosFiltrados.length === 0 && (
                    <div className="md:col-span-3 text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/80">
                      <p className="text-slate-400">Nenhum simulado encontrado com os filtros selecionados.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : !resultadoSimuladoFinal ? (
              <div className="space-y-6">
                <div className="flex flex-col items-stretch gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-slate-100">{simuladoAtivo.prova} · {simuladoAtivo.banca}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Responda todas as questões e finalize para auditar o seu resultado.</p>
                  </div>
                  <button onClick={() => setSimuladoAtivo(null)} className="w-full shrink-0 text-slate-400 hover:text-slate-100 text-xs font-medium bg-slate-800 px-4 py-2 rounded-2xl transition-all sm:w-auto">Sair da Prova</button>
                </div>

                <TempoSimulado inicio={simuladoAtivo.inicio} total={questoesSimuladoAtivo.length} respondidas={questoesSimuladoAtivo.filter(q => avaliarSelecao(q, respostasSimulado[q.id]).respondida).length} />
                {simuladoAtivo.tipo === 'personalizado' && <p className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4 text-sm text-indigo-200">{questoesSimuladoAtivo.length} questões · {nomeFoco(simuladoAtivo.foco)}. Sua seleção permanece fixa até concluir ou sair.</p>}

                {questoesSimuladoAtivo.map((q, index) => (
                  <div key={q.id} className="questao-renderizavel bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-7 shadow-xl backdrop-blur-md">
                    <div className="flex flex-wrap gap-2.5 mb-5">
                      <span className="bg-indigo-600 text-white px-3.5 py-1 rounded-full text-xs font-bold shadow-md shadow-indigo-600/20">Questão {index + 1}</span>
                      {q.materia && <span className="bg-slate-800 text-slate-300 px-3.5 py-1 rounded-full text-xs font-medium">{q.materia}</span>}
                    </div>
                    <EnunciadoQuestao questao={q} />
                    {questaoDeSomatoria(q) && <p className="mb-3 text-xs font-medium text-indigo-300">Marque todas as afirmações corretas. A resposta é a soma dos valores selecionados.</p>}
                    <div className="space-y-3">
                      {Array.isArray(q.opcoes) && q.opcoes.map((opcao, idx) => <AlternativaComEliminacao
                        key={idx} questao={q} indice={idx} texto={opcao}
                        selecionada={alternativaSelecionada(respostasSimulado, q, idx)}
                        eliminada={alternativaFoiEliminada('simulado', q.id, idx)}
                        onSelecionar={() => alternarResposta(setRespostasSimulado, q, idx)}
                        onEliminar={() => alternarEliminacao('simulado', q.id, idx)}
                      />)}
                    </div>
                  </div>
                ))}

                <button onClick={finalizarSimulado} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-3xl text-base shadow-xl shadow-emerald-600/20 transition-all">Finalizar e Entregar Prova</button>
              </div>
            ) : (
              <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 text-center max-w-xl mx-auto">
                <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">🏆 Resultado do Simulado</h2>
                <div className="grid grid-cols-1 gap-3 my-6 min-[380px]:grid-cols-3 sm:gap-4">
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Total</p>
                    <p className="text-2xl font-bold text-slate-100 mt-1">{resultadoSimuladoFinal.total}</p>
                  </div>
                  <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/30">
                    <p className="text-xs text-emerald-400 uppercase font-semibold">Acertos</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">{resultadoSimuladoFinal.acertos}</p>
                  </div>
                  <div className="bg-red-950/30 p-4 rounded-2xl border border-red-500/30">
                    <p className="text-xs text-red-400 uppercase font-semibold">Erros</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">{resultadoSimuladoFinal.erros}</p>
                  </div>
                </div>
                <button onClick={() => { setSimuladoAtivo(null); setResultadoSimuladoFinal(null); }} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-3.5 rounded-2xl font-medium text-sm transition-all shadow-lg shadow-indigo-600/25">Voltar aos Simulados</button>
              </div>
                <RevisaoSimulado resultado={resultadoSimuladoFinal} onRepetirErros={itens => iniciarSimulado({tipo:'personalizado', id:'revisar-'+crypto.randomUUID(), prova:'Retomar questões pendentes', concurso:'Retomar questões pendentes', banca:'Treino personalizado', itens})} />
              </div>
            )}
          </div>
        )}

        {/* ABA: DESEMPENHO (COM CRONÓMETRO E SUGESTÃO DE QUESTÕES) */}
        {abaAtiva === 'desempenho' && (
          <div className="space-y-8">
            <header>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">📈 Painel de Desempenho</h1>
              <p className="text-slate-400 text-sm mt-1">Acompanhe métricas cruciais, use o cronómetro de estudos e pratique com base no que estudou.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Horas Estudadas', val: `${totalHorasEstudo.toFixed(1)}h`, color: 'text-indigo-400' },
                { label: 'Questões Resolvidas', val: totalQuestoesResolvidas, color: 'text-slate-100' },
                { label: 'Total de Acertos', val: totalAcertos, color: 'text-emerald-400' },
                { label: 'Taxa de Acerto', val: `${taxaAcertoGeral}%`, color: 'text-amber-400' }
              ].map((card, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <p className={`text-3xl font-extrabold mt-2 ${card.color}`}>{card.val}</p>
                </div>
              ))}
            </div>

            <SessaoEstudo key={session.user.id} userId={session.user.id} onConcluir={concluirSessaoEstudo} />

            {/* QUESTÕES SUGERIDAS APÓS O ESTUDO */}
            {questoesSugeridas.length > 0 && (
              <div className="bg-slate-900/60 border border-emerald-500/30 rounded-3xl p-4 sm:p-7 shadow-xl backdrop-blur-md">
                <div className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-100">🎯 Questões Sugeridas para Praticar</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Selecionadas com base na tua última sessão de estudo de <strong>{materiaEstudo}</strong>.</p>
                  </div>
                  <button onClick={() => setQuestoesSugeridas([])} className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-3 py-1.5 rounded-xl">Ocultar</button>
                </div>

                <div className="space-y-6">
                  {questoesSugeridas.map((q) => (
                    <div key={q.id} className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 shadow-md">
                      <div className="flex flex-wrap gap-2.5 mb-4">
                        <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-0.5 rounded-full text-xs font-medium">Sugerida</span>
                        {q.materia && <span className="bg-slate-800 text-slate-300 px-3 py-0.5 rounded-full text-xs font-medium">{q.materia}</span>}
                        {q.conteudo && <span className="bg-slate-800 text-slate-300 px-3 py-0.5 rounded-full text-xs font-medium">{q.conteudo}</span>}
                      </div>
                      <EnunciadoQuestao questao={q} />
                      <div className="space-y-2.5 mb-4">
                        {Array.isArray(q.opcoes) && q.opcoes.map((opcao, idx) => <AlternativaComEliminacao
                          key={idx} questao={q} indice={idx} texto={opcao} compacta
                          selecionada={alternativaSelecionada(respostasSelecionadas, q, idx)}
                          eliminada={alternativaFoiEliminada('normal', q.id, idx)}
                          onSelecionar={() => alternarResposta(setRespostasSelecionadas, q, idx)}
                          onEliminar={() => alternarEliminacao('normal', q.id, idx)}
                        />)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <button disabled={!podeCorrigir(q)} onClick={() => validarResposta(q.id, q.resposta_correta)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-xl text-xs transition-all shadow-md">Responder</button>
                        {feedbacks[q.id] && <span className={`text-xs font-semibold ${feedbacks[q.id].status === 'correto' ? 'text-emerald-400' : 'text-red-400'}`}>{feedbacks[q.id].msg}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="questao-renderizavel bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-7 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-bold text-slate-100 mb-5">⏱️ Registar Bloco Manual</h3>
                <form onSubmit={registarHoras} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Matéria</label>
                    <input type="text" required placeholder="Ex: Matemática" value={novaHora.materia} onChange={e => setNovaHora({ ...novaHora, materia: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Horas (ex: 1.5)</label>
                      <input type="number" step="0.1" required placeholder="1.5" value={novaHora.horas} onChange={e => setNovaHora({ ...novaHora, horas: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Data</label>
                      <input type="date" value={novaHora.data} onChange={e => setNovaHora({ ...novaHora, data: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/25 mt-2">Guardar Registo</button>
                </form>
              </div>

              <div className="questao-renderizavel bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-7 shadow-xl backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-5">⚠️ Principais Pontos a Melhorar</h3>
                  {pontosAMelhorar.length === 0 ? (
                    <p className="text-slate-400 text-sm py-12 text-center">Ainda sem erros registados. Continua a praticar para gerar diagnósticos!</p>
                  ) : (
                    <div className="space-y-3">
                      {pontosAMelhorar.map(([conteudo, qtdErros], idx) => (
                        <div key={idx} className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-sm">
                          <span className="min-w-0 break-words text-slate-200 font-medium">{conteudo}</span>
                          <span className="bg-red-500/15 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold">{qtdErros} erro(s)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-6">* Dados calculados automaticamente com base nas respostas dadas.</p>
              </div>
            </div>
          </div>
        )}

        {/* ABA: CADASTRAR QUESTÃO */}
        {abaAtiva === 'cadastrar' && isAdmin && (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-8 shadow-xl backdrop-blur-md">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-6 tracking-tight">➕ Cadastrar Nova Questão</h2>
            <form onSubmit={salvarQuestao} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Matéria</label>
                  <input type="text" required placeholder="Ex: Português" value={novaQuestao.materia} onChange={(e) => setNovaQuestao({ ...novaQuestao, materia: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Conteúdo</label>
                  <input type="text" required placeholder="Ex: Concordância" value={novaQuestao.conteudo} onChange={(e) => setNovaQuestao({ ...novaQuestao, conteudo: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Banca</label>
                  <input type="text" required placeholder="Ex: FGV ou Professor" value={novaQuestao.banca} onChange={(e) => setNovaQuestao({ ...novaQuestao, banca: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Concurso / Curso</label>
                  <input type="text" required placeholder="Ex: EsPCEx" value={novaQuestao.concurso} onChange={(e) => setNovaQuestao({ ...novaQuestao, concurso: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dificuldade</label>
                  <select value={novaQuestao.dificuldade} onChange={(e) => setNovaQuestao({ ...novaQuestao, dificuldade: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner">
                    <option value="Fácil">Fácil</option>
                    <option value="Média">Média</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ano</label>
                <input type="number" min="1900" max="2100" required value={novaQuestao.ano} onChange={(e) => setNovaQuestao({ ...novaQuestao, ano: Number(e.target.value) })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Enunciado da Questão</label>
                <textarea required rows={3} placeholder="Escreva o enunciado..." value={novaQuestao.enunciado} onChange={(e) => setNovaQuestao({ ...novaQuestao, enunciado: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Alternativas (A até E)</label>
                <div className="space-y-3">
                  {novaQuestao.opcoes.map((opcao, idx) => (
                    <div key={idx} className="flex min-w-0 items-center gap-2 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800 sm:gap-3">
                      <span className="w-7 text-center text-xs font-bold text-slate-400">{String.fromCharCode(65 + idx)}</span>
                      <input type="text" required placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`} value={opcao} onChange={(e) => {
                        const novasOpcoes = [...novaQuestao.opcoes]
                        novasOpcoes[idx] = e.target.value
                        setNovaQuestao({ ...novaQuestao, opcoes: novasOpcoes })
                      }} className="flex-1 bg-transparent border-none px-2 py-1 text-sm text-slate-100 focus:outline-none" />
                      <input type="radio" name="resposta_correta" checked={novaQuestao.resposta_correta === idx} onChange={() => setNovaQuestao({ ...novaQuestao, resposta_correta: idx })} className="w-4 h-4 text-indigo-600 rounded cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/25 mt-4">Salvar Questão</button>
            </form>
          </div>
        )}

        {/* ABA: EDITAL VERTICALIZADO */}
        {abaAtiva === 'edital' && (
          <Suspense fallback={<p role="status">Carregando seu planejador de editais…</p>}>
            <EditalPlanejador key={session.user.id} userId={session.user.id} />
          </Suspense>
        )}

        {abaAtiva === 'redacao' && <Suspense fallback={<p role="status">Carregando a oficina de redação…</p>}><Redacao key={session.user.id} session={session} foco={focoEstudo}/></Suspense>}

        {/* ABA: TAREFAS */}
        {abaAtiva === 'tarefas' && (
          <div className="space-y-6">
            <header>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">📅 Cronograma semanal</h1>
              <p className="mt-1 text-sm text-slate-400">Distribua matérias e horas ao longo da semana e marque cada sessão concluída.</p>
            </header>

            <section className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Planejado</p>
                <p className="mt-1 text-2xl font-extrabold text-indigo-300">{formatarDuracaoPlanejada(minutosPlanejados)}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Concluído</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-400">{formatarDuracaoPlanejada(minutosConcluidos)}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Sessões</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-100">{tarefasDoCronograma.filter(tarefa => tarefa.concluida).length}/{tarefasDoCronograma.length}</p>
              </div>
            </section>

            <form onSubmit={adicionarTarefa} className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl sm:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-100">Adicionar sessão de estudo</h2>
                <p className="mt-1 text-xs text-slate-400">A duração representa o tempo que você pretende dedicar à matéria.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dia
                  <select value={novaTarefa.dia} onChange={e => setNovaTarefa({ ...novaTarefa, dia: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100">
                    {DIAS_SEMANA.map(dia => <option key={dia}>{dia}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Matéria
                  <input required list="materias-cronograma" placeholder="Ex.: Matemática" value={novaTarefa.materia} onChange={e => setNovaTarefa({ ...novaTarefa, materia: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100" />
                  <datalist id="materias-cronograma">{materiasCronograma.map(opcao => <option key={opcao.value} value={opcao.label} />)}</datalist>
                </label>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Atividade
                  <input placeholder="Ex.: Funções" value={novaTarefa.atividade} onChange={e => setNovaTarefa({ ...novaTarefa, atividade: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100" />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Horário
                  <input type="time" required value={novaTarefa.horario} onChange={e => setNovaTarefa({ ...novaTarefa, horario: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100" />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Duração
                  <select value={novaTarefa.minutos} onChange={e => setNovaTarefa({ ...novaTarefa, minutos: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100">
                    {[30, 45, 60, 90, 120, 180].map(minutos => <option key={minutos} value={minutos}>{formatarDuracaoPlanejada(minutos)}</option>)}
                  </select>
                </label>
              </div>
              <button type="submit" className="mt-5 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 sm:w-auto">Adicionar ao cronograma</button>
            </form>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DIAS_SEMANA.map(dia => {
                const sessoes = tarefasDoCronograma
                  .filter(tarefa => tarefa.dia === dia)
                  .sort((a, b) => String(a.horario || '').localeCompare(String(b.horario || '')))
                const minutosDia = sessoes.reduce((total, tarefa) => total + (Number(tarefa.minutos) || 0), 0)
                return <article key={dia} className={`rounded-3xl border p-4 shadow-lg ${dia === diaAtual ? 'border-indigo-500/60 bg-indigo-950/20' : 'border-slate-800 bg-slate-900/60'}`}>
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="font-bold text-slate-100">{dia}</h2>
                      {dia === diaAtual && <span className="text-xs font-semibold text-indigo-300">Hoje</span>}
                    </div>
                    <span className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-300">{formatarDuracaoPlanejada(minutosDia)}</span>
                  </div>
                  {sessoes.length === 0 ? <p className="py-5 text-center text-sm text-slate-500">Dia livre</p> : <div className="space-y-3">
                    {sessoes.map(tarefa => <div key={tarefa.id} className={`rounded-2xl border p-3 ${tarefa.concluida ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-slate-800 bg-slate-950/50'}`}>
                      <div className="flex items-start gap-3">
                        <input aria-label={`Marcar ${tarefa.materia} como concluída`} type="checkbox" checked={Boolean(tarefa.concluida)} onChange={() => alternarTarefa(tarefa.id)} className="mt-1 h-5 w-5 shrink-0 cursor-pointer" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className={`break-words text-sm ${tarefa.concluida ? 'text-emerald-300 line-through' : 'text-slate-100'}`}>{tarefa.materia}</strong>
                            <span className="text-xs text-slate-500">{tarefa.horario}</span>
                          </div>
                          {tarefa.atividade && <p className="mt-1 break-words text-xs text-slate-400">{tarefa.atividade}</p>}
                          <p className="mt-2 text-xs font-semibold text-indigo-300">{formatarDuracaoPlanejada(tarefa.minutos)}</p>
                        </div>
                        <button aria-label={`Excluir sessão de ${tarefa.materia}`} onClick={() => deletarTarefa(tarefa.id)} className="shrink-0 rounded-lg p-1 text-slate-500 hover:text-red-400">✕</button>
                      </div>
                    </div>)}
                  </div>}
                </article>
              })}
            </section>

            {tarefasSemDia.length > 0 && <section className="rounded-3xl border border-amber-500/25 bg-amber-950/10 p-4 sm:p-6">
              <h2 className="font-bold text-amber-200">Tarefas antigas sem horário</h2>
              <p className="mt-1 text-xs text-slate-400">Estas tarefas foram criadas antes do cronograma semanal.</p>
              <div className="mt-4 space-y-2">{tarefasSemDia.map(tarefa => <div key={tarefa.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm"><span className="min-w-0 break-words text-slate-200">{tarefa.texto || tarefa.atividade || 'Tarefa sem descrição'}</span><button onClick={() => deletarTarefa(tarefa.id)} className="shrink-0 text-slate-500 hover:text-red-400">✕</button></div>)}</div>
            </section>}
          </div>
        )}
      </main>
    </div>
  )
}
