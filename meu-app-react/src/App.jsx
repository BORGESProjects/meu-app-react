import { unirQuestoes, podeCorrigir } from './acervo'
import EnunciadoQuestao from './components/EnunciadoQuestao'
import AlternativaComEliminacao from './components/AlternativaComEliminacao'
import FiltroMultiplo from './components/FiltroMultiplo'
import Conta from './components/Conta'
import SessaoEstudo from './components/SessaoEstudo'
import EstadoProgresso from './components/EstadoProgresso'
import {useProgressoUsuario} from './useProgressoUsuario'
import { API_URL, fetchApi } from './api'
import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react'
import { supabase, sairDaConta } from './supabaseClient'
import { carregarManifestoAcervo } from './acervoExtraidoManifesto'
import { tentarLeitura, carregarEmEtapas } from './carregarAcervo'
import catalogoLivros from './data/livrosComplementares.json'
import { carregarLoteLivro } from './livrosAcervo'
import { criarProcessadorAcervo } from './processarAcervo'
import {aplicativoNativo, carregarAcervoInstalado, lembrarConta, contaOffline} from './plataforma'
import { opcoesFiltro } from './filtros'
import { indexarFiltros, filtrarIndice, opcoesRelacionadas, atualizarFiltrosRelacionados } from './indiceFiltros'
import { ESPECIFICAS_UEM } from './uem'
import { questoesDaProva, listarProvasCompletas, gerarTreinoCpor } from './simulados'
import { pertenceAoFoco, nomeFoco, ultimasTentativas } from './focoEstudo'
import { useFocoEstudo } from './useFocoEstudo'
import SeletorFoco from './components/SeletorFoco'
import TreinosFoco from './components/TreinosFoco'
import TempoSimulado from './components/TempoSimulado'
import RevisaoSimulado from './components/RevisaoSimulado'
import CadernosPessoais from './components/CadernosPessoais'
import { useEstudoPessoal } from './useEstudoPessoal'
import { analisarDesempenho } from './analiseDesempenho'

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']
const Redacao = lazy(() => import('./components/Redacao'))
const CentralRevisao = lazy(() => import('./components/CentralRevisao'))
const ImportarPdf = lazy(() => import('./components/ImportarPdf'))
const AcervoR2Uploader = lazy(() => import('./components/AcervoR2Uploader'))
const EditalPlanejador = lazy(() => import('./components/EditalPlanejador'))
const AcervoProvas = lazy(() => import('./components/AcervoProvas'))
const QuestoesExtraidas = lazy(() => import('./components/QuestoesExtraidas'))

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

function explicacaoQuestao(questao) {
  return [questao?.explicacao, questao?.resolucao, questao?.resposta_comentada, questao?.comentario]
    .find(valor => typeof valor === 'string' && valor.trim()) || ''
}

function questaoTemImagem(questao) {
  return Boolean(questao?.imagem_original || questao?.pagina_imagem || (Array.isArray(questao?.apoio) && questao.apoio.some(item => item?.imagem)) || questao?.texto_apoio_imagem)
}

export default function App() {
  const requisicaoAcervo = useRef(0)
  const campoEdicaoQuestao = useRef(null)
  const [abaAtiva, setAbaAtiva] = useState('questoes')
  const [acervoExtraidoIniciado, setAcervoExtraidoIniciado] = useState(false)
  const [acervoExtraidoAberto, setAcervoExtraidoAberto] = useState(false)
  const [questoesExtraidasTotal, setQuestoesExtraidasTotal] = useState(null)
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(false)

  // Estados das Questões
  const [acervoPreparado, setAcervoPreparado] = useState(() => ({questoes: unirQuestoes(), indice: null}))
  const {questoes} = acervoPreparado
  const totalQuestoesCatalogo = questoes.length + (questoesExtraidasTotal || 0)
  const processamentoAcervo = useRef(null)
  const [carregandoAcervo, setCarregandoAcervo] = useState(true)
  const [falhasAcervo, setFalhasAcervo] = useState([])
  const [avisoAcervoNativo,setAvisoAcervoNativo] = useState('')
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
  const [termoBusca, setTermoBusca] = useState('')
  const [filtroSituacaoQuestao, setFiltroSituacaoQuestao] = useState('todas')
  const [somenteComentadas, setSomenteComentadas] = useState(false)
  const [somenteComImagem, setSomenteComImagem] = useState(false)
  const [excluirQuestaoEmCadernos, setExcluirQuestaoEmCadernos] = useState(false)
  const [cadernoAtivoId, setCadernoAtivoId] = useState(null)
  const [cadernoDestinoId, setCadernoDestinoId] = useState('')
  const [dialogoPessoal, setDialogoPessoal] = useState(null)
  const [nomeRascunhoPessoal, setNomeRascunhoPessoal] = useState('')
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
  const [buscaHistoricoSimulado, setBuscaHistoricoSimulado] = useState('')
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
  const estudoPessoal = useEstudoPessoal(session?.user?.id, !session?.offline)
  const {filtros:filtrosSalvos,cadernos,questoes:marcacoesPessoais,simulados:historicoSimulados,configuracoes:configuracoesSimulado} = estudoPessoal.dados
  const {horas_estudo:horasEstudo, historico_respostas:historicoRespostas, tarefas:tarefasDaConta} = progresso.dados
  const tarefas = useMemo(() => tarefasDaConta.filter(t => t.tipo !== 'material_revisao'), [tarefasDaConta])
  const {setHorasEstudo, setHistoricoRespostas, setTarefas, carregado:progressoCarregado,
    status:sincronizacao, erro:erroProgresso} = progresso

  useEffect(() => {
    const recuperar = current => {
      if (aplicativoNativo && current) {try {lembrarConta(current)} catch { /* Armazenamento cheio não impede o login. */ }}
      setSession(current || (aplicativoNativo ? contaOffline() : null));setAuthReady(true)
    }
    if(aplicativoNativo)recuperar(null)
    supabase.auth.getSession().then(({data})=>recuperar(data.session)).catch(()=>recuperar(null))
    const { data } = supabase.auth.onAuthStateChange((_event, current) => {
      recuperar(current)
      if (!current) setIsAdmin(false)
    })
    const reconectar=()=>{void supabase.auth.getSession().then(({data})=>recuperar(data.session)).catch(()=>{})}
    if(aplicativoNativo)window.addEventListener('online',reconectar)
    return () => {data.subscription.unsubscribe();window.removeEventListener('online',reconectar)}
  }, [])

  useEffect(() => {
    let ativo = true
    carregarManifestoAcervo()
      .then(manifesto => {
        if (ativo) setQuestoesExtraidasTotal(Number(manifesto?.questoes_extraidas_unicas) || 0)
      })
      .catch(() => { if (ativo) setQuestoesExtraidasTotal(null) })
    return () => { ativo = false }
  }, [session?.user?.id])

  useEffect(() => {
    if (!session?.user?.id || !progressoCarregado) return
    buscarQuestoes(false)
    const controle = requisicaoAcervo
    return () => { controle.current++; processamentoAcervo.current?.cancelar() }
  }, [session?.user?.id, progressoCarregado])

  useEffect(() => {
    let cancelled = false
    if (!session || session.offline) { setIsAdmin(false); setCheckingAdmin(false); return }
    setCheckingAdmin(true)
    fetchApi(`${API_URL}/api/importacoes/acesso`, {
      headers: { Authorization: `Bearer ${session.access_token}`, 'X-Supabase-Key': import.meta.env.VITE_SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(30000),
    }).then(response => {
      if (!cancelled) setIsAdmin(response.ok)
    }).catch(() => { if (!cancelled) setIsAdmin(false) })
      .finally(() => { if (!cancelled) setCheckingAdmin(false) })
    return () => { cancelled = true }
  }, [session])

  useEffect(() => {
    if (authReady && !checkingAdmin && !isAdmin && ['cadastrar', 'importar', 'r2-upload'].includes(abaAtiva)) setAbaAtiva('conta')
  }, [authReady, checkingAdmin, isAdmin, abaAtiva])

  async function buscarQuestoes(atualizarNativo = true) {
    const requisicao = ++requisicaoAcervo.current
    setCarregandoAcervo(true)
    setFalhasAcervo([])
    setAvisoAcervoNativo('')
    processamentoAcervo.current ||= criarProcessadorAcervo()
    async function preparar(itens) {
      if (requisicao !== requisicaoAcervo.current) return
      const resultado = await processamentoAcervo.current.preparar(itens)
      if (requisicao === requisicaoAcervo.current) setAcervoPreparado(resultado)
    }
    if (aplicativoNativo) {
      try {
        const {questoes:instaladas} = await carregarAcervoInstalado();await preparar(instaladas)
        if(atualizarNativo) {
          if(!navigator.onLine || session?.offline) {setAvisoAcervoNativo('A cópia instalada está disponível. Reconecte sua conta para buscar novas questões.');return}
          try {
            const [bancoAtual,importadasAtuais]=await Promise.all([
              (async()=>{const itens=[];for(let inicio=0;;inicio+=500){
                const {data,error}=await supabase.from('questoes').select('*').order('id',{ascending:false}).range(inicio,inicio+499).abortSignal(AbortSignal.timeout(30000))
                if(error)throw error
                itens.push(...(data||[]));if(!data || data.length<500)return itens
              }})(),
              (async()=>{const r=await fetchApi(`${API_URL}/api/acervo`,{signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error();const q=await r.json();if(!Array.isArray(q))throw Error();return q})(),
            ])
            await preparar([...instaladas,...bancoAtual,...importadasAtuais])
            if(requisicao===requisicaoAcervo.current)setAvisoAcervoNativo('Atualizações online carregadas. As 25.495 questões da edição instalada continuam disponíveis sem internet; novas adições entram no próximo pacote offline.')
          } catch(e) {if(e.name!=='AbortError' && requisicao===requisicaoAcervo.current)setAvisoAcervoNativo('Não foi possível buscar atualizações online. A cópia instalada foi preservada e continua disponível.')}
        }
      }
      catch(e) {if (e.name !== 'AbortError' && requisicao === requisicaoAcervo.current) setFalhasAcervo([e.message])}
      finally {if (requisicao === requisicaoAcervo.current) setCarregandoAcervo(false)}
      return
    }
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
      const r = await fetchApi(`${API_URL}/api/acervo`, {signal:AbortSignal.timeout(90000)})
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
    const modelosAtomicos = tentarLeitura(async () => {
      const r = await fetch('/acervo/estudo-quimica-modelos/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Material de estudo indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 29) throw new Error('Lote de modelos atômicos incompleto')
      return data
    })
    const geografiaIntroducaoRevisada = tentarLeitura(async () => {
      const r = await fetch('/acervo/estudo-geografia-introducao/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Lote de Geografia indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 14) throw new Error('Lote de Geografia incompleto')
      return data
    })
    const historiaAntigaRevisada = tentarLeitura(async () => {
      const r = await fetch('/acervo/estudo-historia-antiga/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Lote de História indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 19) throw new Error('Lote de História incompleto')
      return data
    })
    const microorganismosBiologia = tentarLeitura(async () => {
      const r = await fetch('/acervo/estudo-biologia-microorganismos/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Lote de Biologia indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 48) throw new Error('Lote de microrganismos incompleto')
      return data
    })
    const taxonomiaBiologia = tentarLeitura(async () => {
      const r = await fetch('/acervo/estudo-biologia-taxonomia/questoes.json', {signal:AbortSignal.timeout(30000)})
      if (!r.ok) throw new Error('Lote de Biologia indisponível')
      const data = await r.json()
      if (!Array.isArray(data) || data.length !== 18) throw new Error('Lote de taxonomia incompleto')
      return data
    })
    const fontes = ['banco de questões', 'questões importadas', 'ENEM 2017 a 2021', 'CFN 2020 a 2025', 'UFRGS 2025', 'UFRGS 2024', 'UFRGS 2023', 'UFRGS 2022', 'EsPCEx 2017 a 2026', 'UFPR 2025', 'UFPR 2024', 'UFPR 2023', 'UFPR 2022', 'UFPR 2021', 'UFPR 2020', 'UFPR 2019', 'UTFPR 2026', 'UTFPR 2025', 'UTFPR 2024/1', 'UTFPR 2024/2', 'UTFPR 2023', 'IFPR 2024', 'IFPR 2023', 'IFPR 2020 completa', 'IFPR 2019 completa', 'UEM Verão 2025 completa', 'UEM Inverno 2025 completa', 'UEM 2019 a 2024 completa', 'PUC-PR 2024/2 Medicina', 'PUC-PR 2025/1 Medicina', 'PUC-PR 2025/2 Medicina', 'PF e PRF revisadas', 'questões revisadas do material de estudo', 'Modelos atômicos revisados', 'Taxonomia revisada', 'Microrganismos revisados', 'História antiga revisada', 'Introdução à Geografia revisada']
    fontes.push(...catalogoLivros.map(lote => 'Material de estudo — ' + lote.materia))
    const leiturasLivros = catalogoLivros.map(lote => tentarLeitura(() => carregarLoteLivro(lote)))
    const resultados = await carregarEmEtapas([banco,importadas,enemHistorico,cfnHistorico,ufrgs2025,ufrgs2024,ufrgs2023,ufrgs2022,espcexHistorico,ufpr2025,ufpr2024,ufpr2023,ufpr2022,ufpr2021,ufpr2020,ufpr2019,utfpr2026,utfpr2025,utfpr2024,utfpr2024Inverno,utfpr2023,ifpr2024,ifpr2023,ifpr2020,ifpr2019,uem2025,uem2025Inverno,uemHistorico,pucpr2024InvernoMedicina,pucpr2025VeraoMedicina,pucpr2025InvernoMedicina,federaisRevisadas,teoremaRevisadas,modelosAtomicos,taxonomiaBiologia,microorganismosBiologia,historiaAntigaRevisada,geografiaIntroducaoRevisada,...leiturasLivros], estaticas => {
      if (requisicao !== requisicaoAcervo.current) return
      const parciais = estaticas.flatMap(r => r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : [])
      void preparar(parciais).catch(() => { /* A etapa final confirma ou informa a falha. */ })
    })
    if (requisicao !== requisicaoAcervo.current) return
    const carregadas = resultados.flatMap(resultado => resultado.status === 'fulfilled' && Array.isArray(resultado.value) ? resultado.value : [])
    try {
      await preparar(carregadas)
      if (requisicao !== requisicaoAcervo.current) return
      setFalhasAcervo(resultados.flatMap((resultado,i) => resultado.status === 'rejected' ? [fontes[i]] : []))
    } catch (erro) {
      if (erro.name !== 'AbortError' && requisicao === requisicaoAcervo.current) setFalhasAcervo(['organização do acervo'])
    } finally {
      if (requisicao === requisicaoAcervo.current) setCarregandoAcervo(false)
    }
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
      const response = await fetchApi(`${API_URL}/api/admin/questoes`, {
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
        banca: questaoAtual.banca || '', concurso: questaoAtual.concurso || '', ano: questaoAtual.ano || '',
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
          banca: q.banca || '', concurso: q.concurso || simuladoAtivo.concurso || '', ano: q.ano || '',
          respostaSelecionada: avaliacao.escolhida, respostaCorreta: avaliacao.correta,
          tipo: 'simulado', foco: simuladoAtivo.foco,
          respondidaEm: new Date().toISOString(),
        })
      } else {
        erros++
        detalhes.push({ ...q, acertou: false, nãoRespondida: true })
      }
    })

    if (novasRespostas.length > 0) setHistoricoRespostas(prev => [...prev, ...novasRespostas])
    const duracaoSegundos = Math.max(0, Math.floor((Date.now() - simuladoAtivo.inicio) / 1000))
    const concluidoEm = new Date().toISOString()
    const resultado = { acertos, erros, total: questoesSimulado.length, detalhes, duracaoSegundos }
    const resumoSalvo = {
      id: crypto.randomUUID(), titulo: simuladoAtivo.prova || 'Simulado', banca: simuladoAtivo.banca || '',
      tipo: simuladoAtivo.tipo || 'prova', foco: simuladoAtivo.foco, acertos, erros,
      respondidas: detalhes.filter(item => !item.nãoRespondida).length,
      total: questoesSimulado.length, duracaoSegundos, concluidoEm,
      itens: detalhes.map(item => ({ id: String(item.id), acertou: item.acertou, escolhida: item.escolhida, correta: item.correta, naoRespondida: Boolean(item.nãoRespondida) })),
    }
    estudoPessoal.atualizar(dados => ({ ...dados, simulados: [resumoSalvo, ...dados.simulados].slice(0, 50) }))
    setResultadoSimuladoFinal(resultado)
  }

  const totalFiltrosAtivos = [filtrosAno, filtrosMateria, filtrosConteudo, filtrosBanca, filtrosDificuldade]
    .filter(valores => valores.length > 0).length
  const quantidadeFiltrosAtivos = totalFiltrosAtivos + (termoBusca.trim() ? 1 : 0) + (filtroSituacaoQuestao !== 'todas' ? 1 : 0) + Number(somenteComentadas) + Number(somenteComImagem) + Number(excluirQuestaoEmCadernos) + (cadernoAtivoId ? 1 : 0)
  const temFiltrosAtivos = quantidadeFiltrosAtivos > 0

  const indiceCompleto = useMemo(() => acervoPreparado.indice || indexarFiltros(questoes), [acervoPreparado.indice, questoes])
  const indiceFiltros = useMemo(
    () => indiceCompleto.filter(item => pertenceAoFoco(item.questao, focoEstudo, true)),
    [indiceCompleto, focoEstudo],
  )
  const indiceBaseFiltro = useMemo(() => cadernoAtivoId ? indiceCompleto : indiceFiltros, [cadernoAtivoId, indiceCompleto, indiceFiltros])
  const filtrosAtuais = useMemo(() => ({ano:filtrosAno,materia:filtrosMateria,conteudo:filtrosConteudo,banca:filtrosBanca,dificuldade:filtrosDificuldade}), [filtrosAno,filtrosMateria,filtrosConteudo,filtrosBanca,filtrosDificuldade])
  const ultimasRespostasPorQuestao = useMemo(() => ultimasTentativas(historicoRespostas), [historicoRespostas])
  const idsPermitidosNasQuestoes = useMemo(() => {
    if (!cadernoAtivoId && filtroSituacaoQuestao === 'todas' && !somenteComentadas && !somenteComImagem && !excluirQuestaoEmCadernos) return null
    const caderno = cadernos.find(item => item.id === cadernoAtivoId)
    const idsCaderno = cadernoAtivoId ? new Set(caderno?.questoes || []) : null
    const idsTodosCadernos = excluirQuestaoEmCadernos ? new Set(cadernos.flatMap(item => item.questoes)) : null
    const permitidos = new Set()
    for (const item of indiceBaseFiltro) {
      const id = String(item.questao.id)
      if (idsCaderno && !idsCaderno.has(id)) continue
      if (idsTodosCadernos?.has(id)) continue
      if (somenteComentadas && !explicacaoQuestao(item.questao)) continue
      if (somenteComImagem && !questaoTemImagem(item.questao)) continue
      const tentativa = ultimasRespostasPorQuestao.get(id)
      const favorita = marcacoesPessoais[id]?.favorita === true
      const corresponde = filtroSituacaoQuestao === 'todas'
        || filtroSituacaoQuestao === 'nao-resolvidas' && !tentativa
        || filtroSituacaoQuestao === 'resolvidas' && Boolean(tentativa)
        || filtroSituacaoQuestao === 'acertadas' && tentativa?.acertou === true
        || filtroSituacaoQuestao === 'erradas' && tentativa?.acertou === false
        || filtroSituacaoQuestao === 'favoritas' && favorita
      if (corresponde) permitidos.add(id)
    }
    return permitidos
  }, [cadernoAtivoId,cadernos,filtroSituacaoQuestao,indiceBaseFiltro,ultimasRespostasPorQuestao,marcacoesPessoais,somenteComentadas,somenteComImagem,excluirQuestaoEmCadernos])
  const indiceParaFiltro = useMemo(() => idsPermitidosNasQuestoes
    ? indiceBaseFiltro.filter(item => idsPermitidosNasQuestoes.has(String(item.questao.id)))
    : indiceBaseFiltro, [indiceBaseFiltro,idsPermitidosNasQuestoes])
  const opcoesAtuais = useMemo(() => opcoesRelacionadas(indiceParaFiltro,filtrosAtuais,acervoPreparado.opcoesBase), [indiceParaFiltro,filtrosAtuais,acervoPreparado.opcoesBase])
  const questoesFiltradas = useMemo(() => filtrarIndice(indiceParaFiltro,filtrosAtuais,termoBusca,idsPermitidosNasQuestoes), [indiceParaFiltro,filtrosAtuais,termoBusca,idsPermitidosNasQuestoes])
  function chaveDoFiltro(campo) {
    return focoEstudo+':'+campo+':'+JSON.stringify(Object.entries(filtrosAtuais).filter(([outro])=>outro!==campo))
  }
  function alterarFiltro(campo,valores) {
    const {filtros,removidos}=atualizarFiltrosRelacionados(indiceParaFiltro,filtrosAtuais,campo,valores)
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
    setFiltrosBanca([]); setFiltrosDificuldade([]); setTermoBusca(''); setFiltroSituacaoQuestao('todas'); setCadernoAtivoId(null); setLimiteVisivel(40); setAvisoFiltros('')
    setSomenteComentadas(false); setSomenteComImagem(false); setExcluirQuestaoEmCadernos(false)
  }

  function inserirSimboloQuestao(simbolo) {
    const campo = campoEdicaoQuestao.current
    if (!campo) {
      setNovaQuestao(atual => ({ ...atual, enunciado: atual.enunciado + simbolo }))
      return
    }
    const elemento = campo.elemento
    const valorAtual = campo.tipo === 'enunciado' ? novaQuestao.enunciado : novaQuestao.opcoes[campo.indice]
    const inicio = Number.isInteger(elemento.selectionStart) ? elemento.selectionStart : valorAtual.length
    const fim = Number.isInteger(elemento.selectionEnd) ? elemento.selectionEnd : inicio
    const valor = valorAtual.slice(0, inicio) + simbolo + valorAtual.slice(fim)
    setNovaQuestao(atual => campo.tipo === 'enunciado'
      ? { ...atual, enunciado: valor }
      : { ...atual, opcoes: atual.opcoes.map((opcao, indice) => indice === campo.indice ? valor : opcao) })
    requestAnimationFrame(() => {
      elemento.focus()
      elemento.setSelectionRange(inicio + simbolo.length, inicio + simbolo.length)
    })
  }

  function abrirDialogoPessoal(tipo, questoesParaSalvar = []) {
    const sufixo = tipo === 'filtro' ? 'Busca salva' : 'Meu caderno'
    setNomeRascunhoPessoal(`${sufixo} ${new Date().toLocaleDateString('pt-BR')}`)
    setDialogoPessoal({ tipo, questoes: [...new Set(questoesParaSalvar.map(String))] })
  }

  function confirmarDialogoPessoal(evento) {
    evento.preventDefault()
    const nome = nomeRascunhoPessoal.trim()
    if (!nome || !dialogoPessoal) return
    if (dialogoPessoal.tipo === 'filtro') {
      const novoFiltro = {
        id: crypto.randomUUID(), nome,
        filtros: Object.fromEntries(Object.entries(filtrosAtuais).map(([campo, valores]) => [campo, [...valores]])),
        termoBusca, situacao: filtroSituacaoQuestao,
        extras: { somenteComentadas, somenteComImagem, excluirQuestaoEmCadernos },
        foco: focoEstudo, criadoEm: new Date().toISOString(),
      }
      estudoPessoal.atualizar(dados => ({ ...dados, filtros: [novoFiltro, ...dados.filtros] }))
    } else {
      const novoCaderno = { id: crypto.randomUUID(), nome, pasta: '', questoes: dialogoPessoal.questoes, criadoEm: new Date().toISOString() }
      estudoPessoal.atualizar(dados => ({ ...dados, cadernos: [novoCaderno, ...dados.cadernos] }))
      setCadernoDestinoId(novoCaderno.id)
    }
    setDialogoPessoal(null)
    setNomeRascunhoPessoal('')
  }

  function aplicarFiltroSalvo(filtro) {
    if (filtro.foco && filtro.foco !== focoEstudo) preferenciaFoco.escolher(filtro.foco)
    const valores = filtro.filtros || {}
    setFiltrosAno(valores.ano || [])
    setFiltrosMateria(valores.materia || [])
    setFiltrosConteudo(valores.conteudo || [])
    setFiltrosBanca(valores.banca || [])
    setFiltrosDificuldade(valores.dificuldade || [])
    setTermoBusca(filtro.termoBusca || '')
    setFiltroSituacaoQuestao(filtro.situacao || 'todas')
    setSomenteComentadas(Boolean(filtro.extras?.somenteComentadas))
    setSomenteComImagem(Boolean(filtro.extras?.somenteComImagem))
    setExcluirQuestaoEmCadernos(Boolean(filtro.extras?.excluirQuestaoEmCadernos))
    setCadernoAtivoId(null)
    setLimiteVisivel(40)
    setAbaAtiva('questoes')
  }

  function adicionarQuestaoAoCaderno(questaoId, cadernoId = cadernoDestinoId) {
    if (!cadernoId) return
    adicionarQuestoesAoCaderno([questaoId], cadernoId)
  }

  function adicionarQuestoesAoCaderno(questoesIds, cadernoId = cadernoDestinoId) {
    if (!cadernoId || !questoesIds.length) return
    const ids = new Set(questoesIds.map(String))
    estudoPessoal.atualizar(dados => ({
      ...dados,
      cadernos: dados.cadernos.map(caderno => caderno.id === cadernoId
        ? { ...caderno, questoes: [...new Set([...caderno.questoes, ...ids])] }
        : caderno),
    }))
  }

  function alternarFavorita(questaoId) {
    const id = String(questaoId)
    estudoPessoal.atualizar(dados => ({
      ...dados,
      questoes: { ...dados.questoes, [id]: { ...dados.questoes[id], favorita: !dados.questoes[id]?.favorita } },
    }))
  }

  function salvarNotaPessoal(questaoId, nota) {
    const id = String(questaoId)
    estudoPessoal.atualizar(dados => ({
      ...dados,
      questoes: { ...dados.questoes, [id]: { ...dados.questoes[id], nota } },
    }))
  }

  function estudarCaderno(cadernoId) {
    setFiltrosAno([]); setFiltrosMateria([]); setFiltrosConteudo([])
    setFiltrosBanca([]); setFiltrosDificuldade([]); setTermoBusca('')
    setFiltroSituacaoQuestao('todas'); setCadernoAtivoId(cadernoId); setLimiteVisivel(40)
    setSomenteComentadas(false); setSomenteComImagem(false); setExcluirQuestaoEmCadernos(false)
    setAbaAtiva('questoes')
  }

  function excluirCaderno(cadernoId) {
    estudoPessoal.atualizar(dados => ({ ...dados, cadernos: dados.cadernos.filter(caderno => caderno.id !== cadernoId) }))
    if (cadernoAtivoId === cadernoId) setCadernoAtivoId(null)
    if (cadernoDestinoId === cadernoId) setCadernoDestinoId('')
  }

  function salvarConfiguracaoSimulado(configuracao) {
    const registro = { ...configuracao, id: crypto.randomUUID(), criadoEm: new Date().toISOString() }
    estudoPessoal.atualizar(dados => ({ ...dados, configuracoes: [registro, ...dados.configuracoes].slice(0, 30) }))
  }

  function retomarSimuladoSalvo(simulado, apenasErros = false) {
    const ids = (simulado.itens || []).filter(item => !apenasErros || !item.acertou).map(item => item.id)
    const itens = ids.map(id => questoes.find(questao => String(questao.id) === String(id))).filter(Boolean)
    if (!itens.length) return
    iniciarSimulado({
      tipo: 'personalizado', id: `retomar-${crypto.randomUUID()}`,
      prova: apenasErros ? `Erros — ${simulado.titulo}` : `Refazer — ${simulado.titulo}`,
      concurso: simulado.titulo, banca: simulado.banca || 'Treino personalizado', itens,
    })
  }

  function praticarDiagnostico(termo) {
    limparFiltros()
    setTermoBusca(termo)
    setAbaAtiva('questoes')
  }

  const totalHorasEstudo = horasEstudo.reduce((acc, curr) => acc + (curr.horas || 0), 0)
  const totalQuestoesResolvidas = historicoRespostas.length
  const totalAcertos = historicoRespostas.filter(h => h.acertou).length
  const taxaAcertoGeral = totalQuestoesResolvidas > 0 ? ((totalAcertos / totalQuestoesResolvidas) * 100).toFixed(1) : 0
  const analiseDesempenho = useMemo(() => analisarDesempenho(historicoRespostas, questoes), [historicoRespostas, questoes])
  const simuladosSalvosFiltrados = useMemo(() => {
    const termo = buscaHistoricoSimulado.trim().toLocaleLowerCase('pt-BR')
    if (!termo) return historicoSimulados
    return historicoSimulados.filter(item => `${item.titulo} ${item.banca || ''} ${item.foco || ''}`.toLocaleLowerCase('pt-BR').includes(termo))
  }, [buscaHistoricoSimulado, historicoSimulados])

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

  if (!progressoCarregado || !estudoPessoal.carregado) return <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4 px-6 text-center">
    <p className="text-sm text-indigo-300">Carregando seus dados de estudo…</p>
    {erroProgresso && <><EstadoProgresso progresso={progresso} /><button className="text-sm text-slate-400" onClick={() => sairDaConta()}>Voltar ao login</button></>}
  </div>

  return (
    <div className="app-shell min-h-screen text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Barra de Navegação Superior Refinada */}
      <nav aria-label="Área de estudo" className="app-nav sticky top-0 z-50 flex flex-col items-stretch gap-3 border-b border-slate-800/80 bg-slate-950/80 px-3 py-3 backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between md:px-6 md:py-3.5">
        <div className="app-brand px-1 text-lg font-bold tracking-tight">
          <span className="app-brand-mark">AP</span>
          <span className="text-slate-100">Aprovado<small>SEU ESPAÇO DE ESTUDO</small></span>
        </div>
        <div aria-label="Navegação principal" className="mobile-nav flex w-full min-w-0 items-center gap-1.5 overflow-x-auto pb-1 xl:w-auto xl:pb-0">
          {[
            { id: 'questoes', label: 'Questões' },
            { id: 'cadernos', label: 'Meus cadernos' },
            { id: 'simulados', label: 'Simulados' },
            { id: 'provas', label: 'Acervo de provas' },
            { id: 'desempenho', label: 'Desempenho' },
            ...(isAdmin ? [{ id: 'cadastrar', label: 'Cadastrar' }, { id: 'importar', label: 'Importar PDF' }, { id: 'r2-upload', label: 'Migrar acervo R2' }] : []),
            { id: 'edital', label: 'Edital' },
            { id: 'redacao', label: 'Redação' },
            { id: 'revisao', label: 'Revisão' },
            { id: 'tarefas', label: 'Tarefas' },
            { id: 'conta', label: 'Minha conta' }
          ].map(tab => (
            <button
              key={tab.id}
              aria-current={abaAtiva === tab.id ? "page" : undefined}
              onClick={() => setAbaAtiva(tab.id)}
              className={`nav-link shrink-0 whitespace-nowrap px-3 py-2 rounded-2xl text-xs md:text-sm font-medium transition-all duration-200 ${abaAtiva === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto min-w-0 max-w-5xl p-3 sm:p-6 md:p-8">
        <EstadoProgresso progresso={progresso} />
        <SeletorFoco preferencia={preferenciaFoco} bloqueado={Boolean(simuladoAtivo)} onEscolher={valor => { if(simuladoAtivo) return; preferenciaFoco.escolher(valor); limparFiltros(); setFiltroAnoSimulado('Todos'); setFiltroProvaSimulado('Todos') }} />
        {estudoPessoal.erro && <p role="status" className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">{estudoPessoal.erro}</p>}
        {abaAtiva === 'conta' && <Conta session={session} isAdmin={isAdmin} checkingAdmin={checkingAdmin} sincronizacao={sincronizacao} totais={{ horas: totalHorasEstudo, questoes: totalQuestoesResolvidas, acertos: totalAcertos }} />}
        {abaAtiva === 'provas' && <Suspense fallback={<p role="status" className="text-sm text-indigo-300">Abrindo o acervo de provas…</p>}><AcervoProvas /></Suspense>}
        {abaAtiva === 'cadernos' && <CadernosPessoais
          cadernos={cadernos} questoes={questoes} anotacoes={marcacoesPessoais}
          sincronizacao={estudoPessoal.sincronizacao} erroSincronizacao={estudoPessoal.erro}
          onSincronizar={estudoPessoal.sincronizarAgora}
          onNovo={() => abrirDialogoPessoal('caderno')}
          onEstudar={estudarCaderno}
          onExcluir={excluirCaderno}
          onRenomear={(cadernoId, nome) => {
            const valor = nome.trim()
            if (valor) estudoPessoal.atualizar(dados => ({ ...dados, cadernos: dados.cadernos.map(item => item.id === cadernoId ? { ...item, nome: valor } : item) }))
          }}
          onMover={(cadernoId, pasta) => estudoPessoal.atualizar(dados => ({ ...dados, cadernos: dados.cadernos.map(item => item.id === cadernoId ? { ...item, pasta: pasta.trim() } : item) }))}
          onRemoverQuestao={(cadernoId, questaoId) => estudoPessoal.atualizar(dados => ({
            ...dados,
            cadernos: dados.cadernos.map(caderno => caderno.id === cadernoId
              ? { ...caderno, questoes: caderno.questoes.filter(id => id !== String(questaoId)) }
              : caderno),
          }))}
        />}
        {abaAtiva === 'importar' && isAdmin && <Suspense fallback={<p role="status" className="text-sm text-indigo-300">Carregando importador…</p>}><ImportarPdf onPublicado={buscarQuestoes} /></Suspense>}
        {abaAtiva === 'r2-upload' && isAdmin && <Suspense fallback={<p role="status" className="text-sm text-indigo-300">Preparando envio do acervo…</p>}><AcervoR2Uploader isAdmin={isAdmin} /></Suspense>}
        {/* ABA: BANCO DE QUESTÕES */}
        {abaAtiva === 'questoes' && (
          <div>
            {cadernoAtivoId && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-400/30 bg-indigo-950/30 px-4 py-3">
              <p className="text-sm text-indigo-100">Estudando caderno <strong>{cadernos.find(item => item.id === cadernoAtivoId)?.nome || 'selecionado'}</strong> · {questoesFiltradas.length} questão(ões)</p>
              <button type="button" onClick={() => setCadernoAtivoId(null)} className="rounded-lg border border-indigo-300/30 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-400/10">Sair do caderno</button>
            </div>}
            <header className="mb-6">
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">Banco de Questões</h1>
              <p role="status" aria-live="polite" className="mt-2 inline-flex flex-wrap items-center gap-x-2 rounded-xl border border-indigo-400/20 bg-indigo-950/30 px-3 py-2 text-sm text-indigo-100">Total de questões disponíveis: <strong className="text-base font-extrabold text-white">{totalQuestoesCatalogo.toLocaleString('pt-BR')}</strong>{questoesExtraidasTotal === null && <span className="text-xs text-slate-400">contagem completa em atualização</span>}</p>
              <p className="text-slate-400 text-sm mt-1">{temFiltrosAtivos
                ? `${questoesFiltradas.length} questão(ões) encontrada(s). ${questoesFiltradas.filter(q => q.anulada).length} anulada(s), disponíveis apenas para consulta.`
                : 'Escolha os filtros abaixo para exibir as questões que deseja estudar.'}</p>
              <details
                className="mt-4 overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-cyan-950/20 shadow-lg shadow-cyan-950/10"
                onToggle={evento => {
                  const aberto = evento.currentTarget.open
                  setAcervoExtraidoAberto(aberto)
                  if (aberto) setAcervoExtraidoIniciado(true)
                }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 transition hover:bg-white/[0.03] sm:px-5">
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-100">Questões por prova</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">Filtre por banca, ano e concurso. As questões de cada edição são carregadas quando necessário.</span>
                  </span>
                  <span aria-hidden="true" className="shrink-0 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100">{acervoExtraidoAberto ? 'Fechar' : 'Abrir'}</span>
                </summary>
                <div className="border-t border-cyan-400/15 p-3 sm:p-4">
                  <Suspense fallback={<p role="status" className="py-3 text-sm text-cyan-200">Preparando questões…</p>}>
                    {acervoExtraidoIniciado && <QuestoesExtraidas aoAbrirAcervo={() => setAbaAtiva('provas')} />}
                  </Suspense>
                </div>
              </details>
              {carregandoAcervo && <p role="status" className="text-indigo-300 text-sm mt-2">Carregando o restante do acervo… A quantidade acima ainda é parcial.</p>}
              {!carregandoAcervo && falhasAcervo.length === 0 && <p role="status" className="text-emerald-300 text-sm mt-2">Acervo carregado: {questoesDoFoco.length.toLocaleString('pt-BR')} questões neste foco.</p>}
              {aplicativoNativo && <div className="mt-3 text-sm"><button className="rounded-xl border border-indigo-500 px-4 py-2 text-indigo-200 disabled:opacity-50" disabled={carregandoAcervo} onClick={()=>buscarQuestoes(true)}>Atualizar questões online</button>{avisoAcervoNativo && <p role="status" className="mt-2 text-slate-300">{avisoAcervoNativo}</p>}</div>}
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
            <div className="filter-panel relative z-20 mb-6 grid grid-cols-1 items-start gap-x-5 gap-y-5 overflow-visible rounded-3xl p-4 shadow-xl backdrop-blur-md sm:mb-8 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div><h2 className="font-bold text-slate-100">Filtrar questões</h2><p className="text-xs text-slate-400 mt-1">Os filtros se ajustam entre si: só aparecem opções com questões disponíveis para sua seleção.</p></div>
                {quantidadeFiltrosAtivos > 0 && <button type="button" onClick={limparFiltros} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-indigo-500 hover:text-indigo-200">Limpar filtros ({quantidadeFiltrosAtivos})</button>}
              </div>
              <label className="sm:col-span-2 lg:col-span-3">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Palavra-chave ou código da questão</span>
                <input
                  type="search"
                  value={termoBusca}
                  onChange={e => { setTermoBusca(e.target.value); setLimiteVisivel(40) }}
                  placeholder="Ex.: concordância verbal ou Q123456"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </label>
              {avisoFiltros && <p role="status" className="sm:col-span-2 lg:col-span-3 text-xs text-indigo-300">{avisoFiltros}</p>}
              <FiltroMultiplo key={chaveDoFiltro('ano')} titulo="Ano" opcoes={anosDisponiveis} selecionados={filtrosAno} aoAlterar={valores => alterarFiltro('ano',valores)} rotuloTodos="Todos os anos" />
              <FiltroMultiplo key={chaveDoFiltro('materia')} titulo={`Matéria (${materiasDisponiveis.length})`} opcoes={materiasDisponiveis} selecionados={filtrosMateria} aoAlterar={valores => alterarFiltro('materia',valores)} rotuloTodos="Todas as matérias" />
              <FiltroMultiplo key={chaveDoFiltro('conteudo')} titulo={`Conteúdo (${conteudosDisponiveis.length} grupos)`} opcoes={conteudosDisponiveis} selecionados={filtrosConteudo} aoAlterar={valores => alterarFiltro('conteudo',valores)} rotuloTodos="Todos os conteúdos" />
              <FiltroMultiplo key={chaveDoFiltro('banca')} titulo={`Banca (${bancasDisponiveis.length})`} opcoes={bancasDisponiveis} selecionados={filtrosBanca} aoAlterar={valores => alterarFiltro('banca',valores)} rotuloTodos="Todas as bancas" />
              <FiltroMultiplo key={chaveDoFiltro('dificuldade')} titulo="Dificuldade" opcoes={dificuldadesDisponiveis} selecionados={filtrosDificuldade} aoAlterar={valores => alterarFiltro('dificuldade',valores)} rotuloTodos="Todas as dificuldades" />
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Minha situação
                <select value={filtroSituacaoQuestao} onChange={evento => { setFiltroSituacaoQuestao(evento.target.value); setLimiteVisivel(40) }} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm font-normal normal-case tracking-normal text-slate-100">
                  <option value="todas">Todas as questões</option>
                  <option value="nao-resolvidas">Não resolvidas</option>
                  <option value="resolvidas">Já resolvidas</option>
                  <option value="acertadas">Acertei</option>
                  <option value="erradas">Errei</option>
                  <option value="favoritas">Favoritas</option>
                </select>
              </label>
              <fieldset className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Recursos disponíveis no acervo</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    [somenteComentadas, setSomenteComentadas, 'Somente com resolução ou comentário'],
                    [somenteComImagem, setSomenteComImagem, 'Somente com imagem, gráfico ou texto visual'],
                    [excluirQuestaoEmCadernos, setExcluirQuestaoEmCadernos, 'Excluir questões já salvas em cadernos'],
                  ].map(([marcado, alterar, rotulo]) => <label key={rotulo} className="flex min-h-11 items-center gap-2 rounded-xl px-2 py-2 text-xs text-slate-300 hover:bg-slate-900">
                    <input type="checkbox" checked={marcado} onChange={evento => { alterar(evento.target.checked); setLimiteVisivel(40) }} className="h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-900 text-indigo-500" />
                    <span>{rotulo}</span>
                  </label>)}
                </div>
              </fieldset>
              <div className="flex flex-col justify-end gap-2">
                <button type="button" onClick={() => abrirDialogoPessoal('filtro')} className="w-full rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3 py-3 text-xs font-bold text-indigo-200 hover:bg-indigo-500/20">Salvar esta busca</button>
                <button type="button" disabled={!questoesFiltradas.length} onClick={() => abrirDialogoPessoal('caderno', questoesFiltradas.map(q => q.id))} className="w-full rounded-xl border border-slate-700 px-3 py-3 text-xs font-semibold text-slate-200 hover:border-indigo-400/50 disabled:opacity-40">Criar caderno com {questoesFiltradas.length} questões</button>
              </div>
              {cadernos.length > 0 && <label className="sm:col-span-2 lg:col-span-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Adicionar questões ao caderno
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <select value={cadernoDestinoId} onChange={evento => setCadernoDestinoId(evento.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-100">
                    <option value="">Selecione um caderno</option>{cadernos.map(caderno => <option key={caderno.id} value={caderno.id}>{caderno.nome}</option>)}
                  </select>
                  <button type="button" disabled={!cadernoDestinoId || !questoesFiltradas.length} onClick={() => { adicionarQuestoesAoCaderno(questoesFiltradas.map(q => q.id)); setAbaAtiva('cadernos') }} className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-indigo-400/50 disabled:opacity-40">Guardar resultados da busca</button>
                </div>
              </label>}
              {filtrosSalvos.length > 0 && <section className="sm:col-span-2 lg:col-span-3 border-t border-slate-800 pt-4" aria-label="Buscas salvas">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Minhas buscas salvas</h3><span className="text-xs text-slate-500">{filtrosSalvos.length}</span></div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {filtrosSalvos.map(filtro => <div key={filtro.id} className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-700 bg-slate-950/60 p-1">
                    <button type="button" onClick={() => aplicarFiltroSalvo(filtro)} className="max-w-56 truncate rounded-lg px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/10">{filtro.nome}</button>
                    <button type="button" aria-label={`Excluir busca ${filtro.nome}`} onClick={() => estudoPessoal.atualizar(dados => ({ ...dados, filtros: dados.filtros.filter(item => item.id !== filtro.id) }))} className="rounded-lg px-2 py-2 text-xs text-slate-500 hover:bg-rose-500/10 hover:text-rose-300">×</button>
                  </div>)}
                </div>
              </section>}
            </div>

            <div className="relative z-0 space-y-6">
              {!temFiltrosAtivos ? (
                <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700/80">
                  <div className="mb-3 text-3xl" aria-hidden="true">⌕</div>
                  <p className="font-semibold text-slate-300">Escolha um filtro ou pesquise uma questão</p>
                  <p className="mt-1 text-sm text-slate-500">Combine ano, matéria, conteúdo, banca e dificuldade, ou busque por palavra-chave/código.</p>
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
                    {feedbacks[q.id] && <details className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-950/20 p-3">
                      <summary className="cursor-pointer text-sm font-semibold text-indigo-200">Ver explicação do gabarito</summary>
                      {explicacaoQuestao(q)
                        ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">{explicacaoQuestao(q)}</p>
                        : <p className="mt-3 text-sm leading-6 text-slate-400">O acervo ainda não tem comentário oficial para esta questão. Registre seu próprio raciocínio em “Minha anotação” para revisar depois.</p>}
                    </details>}
                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
                      <button type="button" aria-pressed={Boolean(marcacoesPessoais[String(q.id)]?.favorita)} onClick={() => alternarFavorita(q.id)} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${marcacoesPessoais[String(q.id)]?.favorita ? 'border-amber-400/40 bg-amber-400/10 text-amber-200' : 'border-slate-700 text-slate-300 hover:border-amber-400/40 hover:text-amber-200'}`}>
                        {marcacoesPessoais[String(q.id)]?.favorita ? '★ Favorita' : '☆ Favoritar'}
                      </button>
                      {cadernos.length > 0 && <button type="button" disabled={!cadernoDestinoId || cadernos.find(item => item.id === cadernoDestinoId)?.questoes.includes(String(q.id))} onClick={() => adicionarQuestaoAoCaderno(q.id)} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-indigo-400/40 hover:text-indigo-200 disabled:opacity-40">{cadernoDestinoId && cadernos.find(item => item.id === cadernoDestinoId)?.questoes.includes(String(q.id)) ? 'Já está no caderno' : '＋ Adicionar ao caderno selecionado'}</button>}
                      <details className="min-w-0 flex-1 basis-full sm:basis-auto">
                        <summary className="w-fit rounded-lg px-2 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200">Minha anotação</summary>
                        <textarea key={`${q.id}:${marcacoesPessoais[String(q.id)]?.nota || ''}`} defaultValue={marcacoesPessoais[String(q.id)]?.nota || ''} onBlur={evento => salvarNotaPessoal(q.id, evento.target.value)} placeholder="Anote uma dúvida, regra ou lembrete para revisar…" rows={3} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-sm leading-6 text-slate-200 placeholder:text-slate-500" />
                      </details>
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

                <TreinosFoco
                  key={focoEstudo} questoes={questoes} foco={focoEstudo} historico={historicoRespostas} onIniciar={iniciarSimulado}
                  configuracoes={configuracoesSimulado}
                  onSalvarConfig={salvarConfiguracaoSimulado}
                  onExcluirConfig={id => estudoPessoal.atualizar(dados => ({ ...dados, configuracoes: dados.configuracoes.filter(item => item.id !== id) }))}
                />
                {historicoSimulados.length > 0 && <section className="my-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5" aria-labelledby="titulo-historico-simulados">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div><h2 id="titulo-historico-simulados" className="text-lg font-bold text-slate-100">Resultados recentes</h2><p className="mt-1 text-xs text-slate-400">Últimos {historicoSimulados.length} simulados · selecione um resultado para repetir a prova ou retomar os erros.</p></div>
                    <button type="button" onClick={() => estudoPessoal.atualizar(dados => ({ ...dados, simulados: [] }))} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-300">Limpar histórico</button>
                  </div>
                  <label className="mb-3 block text-xs font-semibold text-slate-400">Buscar resultado
                    <input type="search" value={buscaHistoricoSimulado} onChange={evento => setBuscaHistoricoSimulado(evento.target.value)} placeholder="Nome do simulado ou banca" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-normal text-slate-100 placeholder:text-slate-500" />
                  </label>
                  <div className="grid gap-2">
                    {simuladosSalvosFiltrados.map(item => <article key={item.id} className="flex min-w-0 flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-3 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-200">{item.titulo}</h3>
                        <p className="mt-1 text-xs text-slate-500">{Number.isFinite(Date.parse(item.concluidoEm || '')) ? new Date(item.concluidoEm).toLocaleDateString('pt-BR') : 'Data indisponível'} · {item.banca || 'Treino personalizado'} · {item.respondidas}/{item.total} respondidas · {Math.floor((item.duracaoSegundos || 0) / 60)} min</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <div className="mr-1 text-right"><p className="text-sm font-extrabold text-emerald-300">{item.acertos}/{item.total}</p><p className="text-[11px] text-slate-500">{item.total ? Math.round(item.acertos / item.total * 100) : 0}%</p></div>
                        {item.itens?.length > 0 && <>
                          <button type="button" onClick={() => retomarSimuladoSalvo(item, true)} disabled={!item.itens.some(pergunta => !pergunta.acertou)} className="rounded-lg border border-amber-400/20 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/10 disabled:opacity-40">Retomar erros</button>
                          <button type="button" onClick={() => retomarSimuladoSalvo(item)} className="rounded-lg border border-indigo-400/20 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/10">Refazer prova</button>
                        </>}
                      </div>
                    </article>)}
                    {!simuladosSalvosFiltrados.length && <p className="rounded-xl border border-dashed border-slate-800 p-5 text-center text-sm text-slate-500">Nenhum resultado corresponde à busca.</p>}
                  </div>
                </section>}
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
                <RevisaoSimulado resultado={resultadoSimuladoFinal} anotacoes={marcacoesPessoais} onRepetirErros={itens => iniciarSimulado({tipo:'personalizado', id:'revisar-'+crypto.randomUUID(), prova:'Retomar questões pendentes', concurso:'Retomar questões pendentes', banca:'Treino personalizado', itens})} />
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

            <section className="grid gap-4 lg:grid-cols-3" aria-labelledby="titulo-diagnostico">
              <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 lg:col-span-1">
                <h2 id="titulo-diagnostico" className="text-lg font-bold">Últimos 7 dias</h2>
                <p className="mt-1 text-xs text-slate-400">Comparação com os 7 dias anteriores</p>
                <p className="mt-5 text-3xl font-extrabold text-indigo-200">{analiseDesempenho.recentes}</p>
                <p className="text-xs text-slate-400">tentativas registradas</p>
                {analiseDesempenho.acertoRecente == null
                  ? <p className="mt-4 rounded-xl bg-slate-950/50 p-3 text-sm text-slate-400">Ainda não há respostas neste período.</p>
                  : <div className="mt-4 rounded-xl bg-slate-950/50 p-3 text-sm">
                    <p>Acerto nesta semana: <strong className="text-emerald-300">{analiseDesempenho.acertoRecente}%</strong></p>
                    <p className="mt-1 text-xs text-slate-400">Semana anterior: {analiseDesempenho.acertoSemanaAnterior == null ? 'sem dados' : `${analiseDesempenho.acertoSemanaAnterior}%`}</p>
                    {analiseDesempenho.variacaoSemanal != null && <p className={`mt-2 text-xs font-semibold ${analiseDesempenho.variacaoSemanal >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>{analiseDesempenho.variacaoSemanal > 0 ? '+' : ''}{analiseDesempenho.variacaoSemanal} pontos percentuais na comparação semanal</p>}
                  </div>}
                <p className="mt-3 text-[11px] leading-5 text-slate-500">São tentativas, incluindo repetições da mesma questão; não representam questões únicas.</p>
              </article>
              <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 lg:col-span-1">
                <h2 className="text-lg font-bold">Por matéria</h2>
                <p className="mt-1 text-xs text-slate-400">Taxa de acerto e volume de prática</p>
                {analiseDesempenho.materias.length ? <div className="mt-4 space-y-3">
                  {analiseDesempenho.materias.slice(0, 5).map(item => <button key={item.nome} type="button" onClick={() => praticarDiagnostico(item.nome)} className="block w-full rounded-xl px-2 py-1 text-left hover:bg-slate-800/70">
                    <span className="flex justify-between gap-3 text-xs"><span className="truncate text-slate-200">{item.nome}</span><span className="shrink-0 text-slate-400">{item.percentual}% · {item.tentativas}</span></span>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-800"><span className={`block h-full rounded-full ${item.percentual < 60 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${item.percentual}%` }} /></span>
                  </button>)}
                </div> : <p className="mt-4 text-sm text-slate-500">Responda questões para gerar este recorte.</p>}
              </article>
              <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 lg:col-span-1">
                <h2 className="text-lg font-bold">Por banca</h2>
                <p className="mt-1 text-xs text-slate-400">Acertos por instituição nas respostas identificadas</p>
                {analiseDesempenho.bancas.length ? <div className="mt-4 space-y-3">
                  {analiseDesempenho.bancas.slice(0, 5).map(item => <button key={item.nome} type="button" onClick={() => praticarDiagnostico(item.nome)} className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-xs hover:bg-slate-800/70">
                    <span className="truncate text-slate-200">{item.nome}</span><span className="shrink-0 text-indigo-200">{item.percentual}% <span className="text-slate-500">({item.tentativas})</span></span>
                  </button>)}
                </div> : <p className="mt-4 text-sm text-slate-500">O histórico antigo pode não ter registrado a banca. As novas tentativas passam a guardar esse dado.</p>}
              </article>
              <article className="rounded-3xl border border-amber-500/20 bg-amber-950/10 p-5 lg:col-span-3">
                <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-lg font-bold text-amber-100">Assuntos que merecem revisão</h2><p className="mt-1 text-xs text-slate-400">Sugestões com pelo menos 3 tentativas e menos de 70% de acerto.</p></div><span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-400">{analiseDesempenho.pontosAtencao.length} assuntos</span></div>
                {analiseDesempenho.pontosAtencao.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {analiseDesempenho.pontosAtencao.map(item => <div key={item.nome} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-200">{item.nome}</p><p className="mt-1 text-xs text-slate-500">{item.erros} erros · {item.tentativas} tentativas · {item.percentual}%</p></div>
                    <button type="button" onClick={() => praticarDiagnostico(item.nome)} className="shrink-0 rounded-lg bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/25">Praticar</button>
                  </div>)}
                </div> : <p className="mt-4 text-sm text-slate-400">Ainda não há assuntos com volume suficiente para uma recomendação confiável.</p>}
              </article>
            </section>

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
                      {feedbacks[q.id] && <details className="mt-3 rounded-xl border border-indigo-400/20 bg-indigo-950/20 p-3">
                        <summary className="cursor-pointer text-xs font-semibold text-indigo-200">Ver explicação do gabarito</summary>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">{explicacaoQuestao(q) || 'Esta questão ainda não tem explicação no acervo.'}</p>
                      </details>}
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
                <label htmlFor="novo-enunciado" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Enunciado da Questão</label>
                <div className="mb-2 flex flex-wrap gap-1.5" role="group" aria-label="Inserir símbolo matemático ou físico">
                  {['½','⅓','¼','¾','⁄','²','³','√','π','∞','±','×','÷','≤','≥','≠','∑','Δ','λ','°','µ','→'].map(simbolo => <button key={simbolo} type="button" title={`Inserir ${simbolo}`} onMouseDown={evento => evento.preventDefault()} onClick={() => inserirSimboloQuestao(simbolo)} className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-200 hover:border-indigo-400/50 hover:bg-indigo-500/10">{simbolo}</button>)}
                </div>
                <textarea id="novo-enunciado" required rows={3} placeholder="Escreva o enunciado..." value={novaQuestao.enunciado} onFocus={evento => { campoEdicaoQuestao.current = { tipo: 'enunciado', elemento: evento.currentTarget } }} onChange={(e) => setNovaQuestao({ ...novaQuestao, enunciado: e.target.value })} className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-base leading-relaxed text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                <p className="mt-2 text-xs text-slate-500">Você pode digitar ou inserir frações, potências e símbolos. Conteúdos importados em MathML, imagens e gráficos mantêm a renderização própria.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Alternativas (A até E)</label>
                <div className="space-y-3">
                  {novaQuestao.opcoes.map((opcao, idx) => (
                    <div key={idx} className="flex min-w-0 items-center gap-2 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800 sm:gap-3">
                      <span className="w-7 text-center text-xs font-bold text-slate-400">{String.fromCharCode(65 + idx)}</span>
                      <input type="text" required placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`} value={opcao} onFocus={evento => { campoEdicaoQuestao.current = { tipo: 'opcao', indice: idx, elemento: evento.currentTarget } }} onChange={(e) => {
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
        {abaAtiva === 'revisao' && <Suspense fallback={<p role="status">Carregando seus mapas e resumos…</p>}><CentralRevisao key={session.user.id} registros={tarefasDaConta} setRegistros={setTarefas} materias={materiasCronograma} indice={indiceFiltros} onPraticar={material => {
          limparFiltros(); setFiltrosMateria([material.materia]); setFiltrosConteudo(material.conteudo ? [material.conteudo] : []); setLimiteVisivel(40); setAbaAtiva('questoes')
        }}/></Suspense>}

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

        {dialogoPessoal && <div className="study-dialog-backdrop" role="presentation" onMouseDown={evento => { if (evento.target === evento.currentTarget) setDialogoPessoal(null) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-dialogo-pessoal" className="study-dialog w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-300">Organização de estudos</p>
                <h2 id="titulo-dialogo-pessoal" className="mt-1 text-xl font-extrabold text-slate-100">{dialogoPessoal.tipo === 'filtro' ? 'Salvar busca' : 'Criar caderno'}</h2>
              </div>
              <button type="button" aria-label="Fechar" onClick={() => setDialogoPessoal(null)} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-800 hover:text-white">×</button>
            </div>
            {dialogoPessoal.tipo === 'caderno' && <p className="mb-4 text-sm leading-6 text-slate-400">{dialogoPessoal.questoes.length ? `${dialogoPessoal.questoes.length.toLocaleString('pt-BR')} questão(ões) da busca serão adicionadas.` : 'O caderno será criado vazio; você poderá adicionar questões enquanto estuda.'}</p>}
            {dialogoPessoal.tipo === 'filtro' && <p className="mb-4 text-sm leading-6 text-slate-400">Salve a combinação de filtros, busca por texto e situação para reaplicá-la depois.</p>}
            <form onSubmit={confirmarDialogoPessoal}>
              <label htmlFor="nome-estudo-pessoal" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nome</label>
              <input autoFocus id="nome-estudo-pessoal" maxLength={80} required value={nomeRascunhoPessoal} onChange={evento => setNomeRascunhoPessoal(evento.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-indigo-500" />
              <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <button type="button" onClick={() => setDialogoPessoal(null)} className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800">Cancelar</button>
                <button type="submit" disabled={!nomeRascunhoPessoal.trim()} className="rounded-xl bg-indigo-500 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-400 disabled:opacity-50">{dialogoPessoal.tipo === 'filtro' ? 'Salvar busca' : 'Criar caderno'}</button>
              </div>
            </form>
          </section>
        </div>}
      </main>
    </div>
  )
}
