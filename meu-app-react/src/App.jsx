import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('questoes') // 'questoes' | 'cadastrar' | 'edital' | 'redacao' | 'tarefas' | 'simulados' | 'desempenho'

  // Estados das Questões
  const [questoes, setQuestoes] = useState([])
  const [respostasSelecionadas, setRespostasSelecionadas] = useState({})
  const [feedbacks, setFeedbacks] = useState({})

  // Filtros de Questões
  const [filtroMateria, setFiltroMateria] = useState('Todas')
  const [filtroConteudo, setFiltroConteudo] = useState('Todos')
  const [filtroBanca, setFiltroBanca] = useState('Todas')
  const [filtroDificuldade, setFiltroDificuldade] = useState('Todas')

  // Estado do Formulário de Cadastro de Questão
  const [novaQuestao, setNovaQuestao] = useState({
    materia: '',
    conteudo: '',
    banca: '',
    concurso: '',
    dificuldade: 'Fácil',
    enunciado: '',
    opcoes: ['', '', '', '', ''],
    resposta_correta: 0
  })

  // Estados das Tarefas
  const [tarefas, setTarefas] = useState([])
  const [novaTarefa, setNovaTarefa] = useState('')

  // Estados do Módulo de Redação (IA)
  const [temaRedacao, setTemaRedacao] = useState('')
  const [textoRedacao, setTextoRedacao] = useState('')
  const [loadingRedacao, setLoadingRedacao] = useState(false)
  const [resultadoRedacao, setResultadoRedacao] = useState(null)
  const [erroRedacao, setErroRedacao] = useState(null)

  // Estados do Edital Verticalizado (Spring Boot)
  const [editais, setEditais] = useState([])
  const [novoItemEdital, setNovoItemEdital] = useState({ 
    concurso: '', 
    materia: '', 
    conteudo: '', 
    incidencia: 'Média', 
    concluido: false 
  })

  // Estados de Simulados (Otimizados com Curso, Ano e Tipo)
  const [filtroCursoSimulado, setFiltroCursoSimulado] = useState('Todos')
  const [filtroTipoSimulado, setFiltroTipoSimulado] = useState('Todos') // 'Oficial' | 'Inédito/Professor'
  const [simuladoAtivo, setSimuladoAtivo] = useState(null) // Guarda o objeto do simulado selecionado
  const [respostasSimulado, setRespostasSimulado] = useState({})
  const [resultadoSimuladoFinal, setResultadoSimuladoFinal] = useState(null)

  // Estados de Desempenho e Horas de Estudo
  const [horasEstudo, setHorasEstudo] = useState([])
  const [novaHora, setNovaHora] = useState({ materia: '', horas: '', data: '' })
  const [historicoRespostas, setHistoricoRespostas] = useState([])

  // --- NOVOS ESTADOS PARA O CRONÓMETRO E SUGESTÃO DE QUESTÕES ---
  const [cronometroAtivo, setCronometroAtivo] = useState(false)
  const [segundosDecorridos, setSegundosDecorridos] = useState(0)
  const [materiaEstudo, setMateriaEstudo] = useState('')
  const [conteudoEstudo, setConteudoEstudo] = useState('')
  const [questoesSugeridas, setQuestoesSugeridas] = useState([])

  useEffect(() => {
    buscarQuestoes()
    buscarTarefas()
    buscarEditais()
    buscarHorasEstudo()
  }, [])

  // Efeito do Cronómetro
  useEffect(() => {
    let intervalo = null
    if (cronometroAtivo) {
      intervalo = setInterval(() => {
        setSegundosDecorridos(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(intervalo)
    }
    return () => clearInterval(intervalo)
  }, [cronometroAtivo])

  async function buscarQuestoes() {
    const { data, error } = await supabase.from('questoes').select('*').order('id', { ascending: false })
    if (!error) setQuestoes(data || [])
  }

  async function buscarTarefas() {
    const { data, error } = await supabase.from('tarefas').select('*').order('created_at', { ascending: false })
    if (!error) setTarefas(data || [])
  }

  async function buscarEditais() {
    try {
      const response = await fetch('http://localhost:8080/api/editais')
      if (response.ok) {
        const data = await response.json()
        setEditais(data)
      }
    } catch (err) {
      console.log('Erro ao comunicar com o Spring Boot:', err)
    }
  }

  async function buscarHorasEstudo() {
    const { data, error } = await supabase.from('horas_estudo').select('*').order('created_at', { ascending: false })
    if (!error) setHorasEstudo(data || [])
  }

  async function registarHoras(e) {
    e.preventDefault()
    if (!novaHora.materia || !novaHora.horas) return

    const { error } = await supabase.from('horas_estudo').insert([{
      materia: novaHora.materia,
      horas: parseFloat(novaHora.horas),
      data: novaHora.data || new Date().toISOString().split('T')[0]
    }])

    if (!error) {
      setNovaHora({ materia: '', horas: '', data: '' })
      buscarHorasEstudo()
      alert('Horas de estudo registadas com sucesso!')
    }
  }

  // --- FUNÇÕES DO CRONÓMETRO E RECOMENDAÇÃO ---
  function iniciarCronometro() {
    if (!materiaEstudo) {
      alert('Por favor, selecione ou escreva a matéria antes de iniciar o cronómetro.')
      return
    }
    setCronometroAtivo(true)
  }

  async function pausarOuFinalizarCronometro() {
    setCronometroAtivo(false)
    if (segundosDecorridos < 10) {
      alert('Sessão muito curta para registar.')
      return
    }

    const horasEstudadas = parseFloat((segundosDecorridos / 3600).toFixed(2))
    const dataHoje = new Date().toISOString().split('T')[0]

    // 1. Gravar automaticamente no Supabase as horas estudadas
    const { error } = await supabase.from('horas_estudo').insert([{
      materia: materiaEstudo,
      horas: horasEstudadas > 0 ? horasEstudadas : 0.1,
      data: dataHoje
    }])

    if (!error) {
      buscarHorasEstudo()
    }

    // 2. Sugerir questões com base na matéria e conteúdo estudados
    let filtradas = questoes.filter(q => q.materia.toLowerCase() === materiaEstudo.toLowerCase())
    if (conteudoEstudo.trim()) {
      const exatas = filtradas.filter(q => q.conteudo && q.conteudo.toLowerCase().includes(conteudoEstudo.toLowerCase()))
      if (exatas.length > 0) filtradas = exatas
    }

    // Embaralhar e pegar até 3 questões para sugestão imediata
    const recomendadas = filtradas.sort(() => 0.5 - Math.random()).slice(0, 3)
    setQuestoesSugeridas(recomendadas)
    setSegundosDecorridos(0)
    alert('Sessão guardada com sucesso! Veja as questões sugeridas abaixo.')
  }

  function formatarTempo(segundos) {
    const mins = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`
  }

  async function salvarQuestao(e) {
    e.preventDefault()
    const questaoParaEnviar = { ...novaQuestao, opcoes: [...novaQuestao.opcoes] }
    const { error } = await supabase.from('questoes').insert([questaoParaEnviar])

    if (error) {
      alert('Erro ao salvar questão: ' + error.message)
    } else {
      alert('Questão cadastrada com sucesso!')
      setNovaQuestao({
        materia: '', conteudo: '', banca: '', concurso: '',
        dificuldade: 'Fácil', enunciado: '', opcoes: ['', '', '', '', ''], resposta_correta: 0
      })
      await buscarQuestoes()
      setAbaAtiva('questoes')
    }
  }

  async function adicionarTarefa(e) {
    e.preventDefault()
    if (!novaTarefa.trim()) return
    const { error } = await supabase.from('tarefas').insert([{ texto: novaTarefa }])
    if (!error) {
      setNovaTarefa('')
      buscarTarefas()
    }
  }

  async function deletarTarefa(id) {
    await supabase.from('tarefas').delete().eq('id', id)
    buscarTarefas()
  }

  async function adicionarEditalItem(e) {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8080/api/editais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoItemEdital)
      })
      if (response.ok) {
        setNovoItemEdital({ concurso: '', materia: '', conteudo: '', incidencia: 'Média', concluido: false })
        buscarEditais()
        alert('Item do edital adicionado com sucesso!')
      }
    } catch (err) {
      alert('Erro ao guardar item do edital no backend.')
    }
  }

  async function alternarStatusEditalItem(item) {
    const novoEstado = !item.concluido
    setEditais(editais.map(e => e.id === item.id ? { ...e, concluido: novoEstado } : e))

    try {
      await fetch(`http://localhost:8080/api/editais/${item.id}/toggle`, { method: 'PATCH' })
    } catch (err) {
      setEditais(editais.map(e => e.id === item.id ? { ...e, concluido: item.concluido } : e))
    }
  }

  async function deletarEditalItem(id) {
    try {
      await fetch(`http://localhost:8080/api/editais/${id}`, { method: 'DELETE' })
      buscarEditais()
    } catch (err) {
      console.log('Erro ao apagar item:', err)
    }
  }

  async function enviarRedacao(e) {
    e.preventDefault()
    setLoadingRedacao(true)
    setResultadoRedacao(null)
    setErroRedacao(null)

    try {
      const response = await fetch('http://localhost:8080/api/ia/corrigir-redacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: temaRedacao, texto: textoRedacao }),
      })

      if (!response.ok) throw new Error('Erro ao comunicar com o servidor backend.')

      const data = await response.json()
      const textoResposta = data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data, null, 2)
      setResultadoRedacao(textoResposta)
    } catch (err) {
      setErroRedacao(err.message)
    } finally {
      setLoadingRedacao(false)
    }
  }

  function validarResposta(questaoId, respostaCorretaDoBanco, isSimulado = false) {
    const indiceSelecionado = isSimulado ? respostasSimulado[questaoId] : respostasSelecionadas[questaoId]
    if (indiceSelecionado === undefined) return

    let indiceCorreto = respostaCorretaDoBanco
    if (typeof respostaCorretaDoBanco === 'string') {
      indiceCorreto = respostaCorretaDoBanco.toUpperCase().charCodeAt(0) - 65
    }

    const acertou = indiceSelecionado === indiceCorreto
    const questaoAtual = questoes.find(q => q.id === questaoId)

    if (questaoAtual && !isSimulado) {
      setHistoricoRespostas(prev => [...prev, { questaoId, acertou, materia: questaoAtual.materia, conteudo: questaoAtual.conteudo }])
    }

    if (!isSimulado) {
      if (acertou) {
        setFeedbacks({ ...feedbacks, [questaoId]: { status: 'correto', msg: '✨ Resposta Correta!' } })
      } else {
        const letraCorreta = String.fromCharCode(65 + indiceCorreto)
        setFeedbacks({ ...feedbacks, [questaoId]: { status: 'incorreto', msg: `❌ Incorreto. A alternativa certa era a letra ${letraCorreta}.` } })
      }
    }
    return acertou
  }

  function finalizarSimulado() {
    if (!simuladoAtivo) return
    const questoesSimulado = questoes.filter(q => q.concurso === simuladoAtivo.concurso && q.banca === simuladoAtivo.banca)
    let acertos = 0
    let erros = 0
    const detalhes = []

    questoesSimulado.forEach(q => {
      const selecionada = respostasSimulado[q.id]
      if (selecionada !== undefined) {
        let indiceCorreto = q.resposta_correta
        if (typeof q.resposta_correta === 'string') {
          indiceCorreto = q.resposta_correta.toUpperCase().charCodeAt(0) - 65
        }
        const acertou = selecionada === indiceCorreto
        if (acertou) acertos++
        else erros++

        detalhes.push({ ...q, acertou, escolhida: selecionada, correta: indiceCorreto })
        setHistoricoRespostas(prev => [...prev, { questaoId: q.id, acertou, materia: q.materia, conteudo: q.conteudo }])
      } else {
        erros++
        detalhes.push({ ...q, acertou: false, nãoRespondida: true })
      }
    })

    setResultadoSimuladoFinal({ acertos, erros, total: questoesSimulado.length, detalhes })
  }

  const questoesFiltradas = questoes.filter(q => {
    const bateMateria = filtroMateria === 'Todas' || q.materia === filtroMateria
    const bateConteudo = filtroConteudo === 'Todos' || q.conteudo === filtroConteudo
    const bateBanca = filtroBanca === 'Todas' || q.banca === filtroBanca
    const bateDificuldade = filtroDificuldade === 'Todas' || q.dificuldade === filtroDificuldade
    return bateMateria && bateConteudo && bateBanca && bateDificuldade
  })

  const simuladosDisponiveis = []
  const mapaSimulados = {}
  
  questoes.forEach(q => {
    if (!q.concurso) return
    const chave = `${q.concurso}-${q.banca || 'Geral'}`
    if (!mapaSimulados[chave]) {
      mapaSimulados[chave] = {
        id: chave,
        concurso: q.concurso,
        banca: q.banca || 'Inédito / Professor',
        tipo: q.banca && q.banca.toLowerCase().includes('professor') ? 'Inédito/Professor' : 'Oficial',
        questoesCount: 0
      }
      simuladosDisponiveis.push(mapaSimulados[chave])
    }
    mapaSimulados[chave].questoesCount++
  })

  const simuladosFiltrados = simuladosDisponiveis.filter(sim => {
    const bateCurso = filtroCursoSimulado === 'Todos' || sim.concurso.toLowerCase().includes(filtroCursoSimulado.toLowerCase())
    const bateTipo = filtroTipoSimulado === 'Todos' || sim.tipo === filtroTipoSimulado
    return bateCurso && bateTipo
  })

  const conteudosDisponiveis = filtroMateria === 'Todas' 
    ? [...new Set(questoes.map(q => q.conteudo))] 
    : [...new Set(questoes.filter(q => q.materia === filtroMateria).map(q => q.conteudo))]

  const totalHorasEstudo = horasEstudo.reduce((acc, curr) => acc + (curr.horas || 0), 0)
  const totalQuestoesResolvidas = historicoRespostas.length
  const totalAcertos = historicoRespostas.filter(h => h.acertou).length
  const taxaAcertoGeral = totalQuestoesResolvidas > 0 ? ((totalAcertos / totalQuestoesResolvidas) * 100).toFixed(1) : 0

  const errosPorConteudo = {}
  historicoRespostas.forEach(h => {
    if (!h.acertou && h.conteudo) {
      errosPorConteudo[h.conteudo] = (errosPorConteudo[h.conteudo] || 0) + 1
    }
  })
  const pontosAMelhorar = Object.entries(errosPorConteudo).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Barra de Navegação Superior Refinada */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight">
          <span className="bg-gradient-to-tr from-indigo-500 to-violet-500 text-white px-2.5 py-1 rounded-xl shadow-lg shadow-indigo-500/20 text-sm">AP</span>
          <span className="text-slate-100">Aprovado</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'questoes', label: '📚 Questões' },
            { id: 'simulados', label: '📝 Simulados' },
            { id: 'desempenho', label: '📈 Desempenho' },
            { id: 'cadastrar', label: '➕ Cadastrar' },
            { id: 'edital', label: '📋 Edital' },
            { id: 'redacao', label: '✍️ Redação' },
            { id: 'tarefas', label: '⚡ Tarefas' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id)} 
              className={`px-3.5 py-2 rounded-2xl text-xs md:text-sm font-medium transition-all duration-200 ${abaAtiva === tab.id ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-8">
        {/* ABA: BANCO DE QUESTÕES */}
        {abaAtiva === 'questoes' && (
          <div>
            <header className="mb-6">
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Banco de Questões</h1>
              <p className="text-slate-400 text-sm mt-1">{questoesFiltradas.length} questão(ões) disponível(is) para praticar.</p>
            </header>

            {/* Filtros */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 backdrop-blur-md shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Matéria</label>
                <select value={filtroMateria} onChange={(e) => { setFiltroMateria(e.target.value); setFiltroConteudo('Todos'); }} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner">
                  <option value="Todas">Todas</option>
                  {[...new Set(questoes.map(q => q.materia))].filter(Boolean).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Conteúdo</label>
                <select value={filtroConteudo} onChange={(e) => setFiltroConteudo(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner">
                  <option value="Todos">Todos</option>
                  {conteudosDisponiveis.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Banca</label>
                <select value={filtroBanca} onChange={(e) => setFiltroBanca(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner">
                  <option value="Todas">Todas</option>
                  {[...new Set(questoes.map(q => q.banca))].filter(Boolean).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Dificuldade</label>
                <select value={filtroDificuldade} onChange={(e) => setFiltroDificuldade(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner">
                  <option value="Todas">Todas</option>
                  <option value="Fácil">Fácil</option>
                  <option value="Média">Média</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {questoesFiltradas.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/80">
                  <p className="text-slate-400">Nenhuma questão encontrada com os filtros selecionados.</p>
                </div>
              ) : (
                questoesFiltradas.map((q) => (
                  <div key={q.id} className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-7 shadow-xl backdrop-blur-md transition-all hover:border-slate-700">
                    <div className="flex flex-wrap gap-2.5 mb-5">
                      {q.materia && <span className="bg-slate-800 text-slate-300 px-3.5 py-1 rounded-full text-xs font-medium">{q.materia}</span>}
                      {q.conteudo && <span className="bg-slate-800 text-slate-300 px-3.5 py-1 rounded-full text-xs font-medium">{q.conteudo}</span>}
                      {q.dificuldade && <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-medium">{q.dificuldade}</span>}
                      {q.banca && <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3.5 py-1 rounded-full text-xs font-medium">{q.banca}</span>}
                      {q.concurso && <span className="bg-slate-800 text-slate-300 px-3.5 py-1 rounded-full text-xs font-medium">{q.concurso}</span>}
                    </div>
                    <p className="text-slate-100 text-base font-medium mb-6 leading-relaxed">{q.enunciado}</p>
                    <div className="space-y-3 mb-6">
                      {Array.isArray(q.opcoes) && q.opcoes.map((opcao, idx) => {
                        const letra = String.fromCharCode(65 + idx)
                        const selecionada = respostasSelecionadas[q.id] === idx
                        return (
                          <button key={idx} onClick={() => setRespostasSelecionadas({ ...respostasSelecionadas, [q.id]: idx })} className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${selecionada ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 shadow-lg shadow-indigo-500/10' : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-950/80 hover:border-slate-700'}`}>
                            <span className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold transition-all ${selecionada ? 'border-indigo-400 bg-indigo-600 text-white shadow-md' : 'border-slate-700 text-slate-400 bg-slate-900'}`}>{letra}</span>
                            <span className="text-sm">{opcao}</span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => validarResposta(q.id, q.resposta_correta)} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium px-6 py-2.5 rounded-2xl text-sm transition-all shadow-md shadow-indigo-600/20">Responder</button>
                      {feedbacks[q.id] && <span className={`text-sm font-semibold ${feedbacks[q.id].status === 'correto' ? 'text-emerald-400' : 'text-red-400'}`}>{feedbacks[q.id].msg}</span>}
                    </div>
                  </div>
                ))
              )}
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
                    <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">📝 Provas e Simulados</h1>
                    <p className="text-slate-400 text-sm mt-1">Filtre por curso e origem das questões para iniciar sua simulação.</p>
                  </div>
                </header>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 backdrop-blur-md shadow-xl">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Filtrar por Curso</label>
                    <select 
                      value={filtroCursoSimulado} 
                      onChange={(e) => setFiltroCursoSimulado(e.target.value)} 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                      <option value="Todos">Todos os Cursos</option>
                      <option value="EsPCEx">EsPCEx</option>
                      <option value="ESA">ESA</option>
                      <option value="ENEM">ENEM</option>
                      <option value="EEAR">EEAR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Tipo de Questões</label>
                    <select 
                      value={filtroTipoSimulado} 
                      onChange={(e) => setFiltroTipoSimulado(e.target.value)} 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                      <option value="Todos">Todos (Oficiais & Professores)</option>
                      <option value="Oficial">Provas Oficiais</option>
                      <option value="Inédito/Professor">Questões Inéditas / Criadas por Professores</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {simuladosFiltrados.map(simulado => (
                    <div key={simulado.id} className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-7 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-indigo-500/40 transition-all group">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-medium">
                            {simulado.concurso}
                          </span>
                          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                            {simulado.banca}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-100 mt-3 group-hover:text-indigo-300 transition-colors">
                          Simulado {simulado.concurso} ({simulado.banca})
                        </h3>
                        <p className="text-slate-400 text-sm mt-2">{simulado.questoesCount} questão(ões) nesta seleção.</p>
                      </div>
                      <button 
                        onClick={() => { setSimuladoAtivo(simulado); setRespostasSimulado({}); setResultadoSimuladoFinal(null); }} 
                        className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/25"
                      >
                        Iniciar Simulado
                      </button>
                    </div>
                  ))}

                  {simuladosFiltrados.length === 0 && (
                    <div className="col-span-3 text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/80">
                      <p className="text-slate-400">Nenhum simulado encontrado com os filtros selecionados.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : !resultadoSimuladoFinal ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-xl">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">Simulado: {simuladoAtivo.concurso} - {simuladoAtivo.banca}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Responda todas as questões e finalize para auditar o seu resultado.</p>
                  </div>
                  <button onClick={() => setSimuladoAtivo(null)} className="text-slate-400 hover:text-slate-100 text-xs font-medium bg-slate-800 px-4 py-2 rounded-2xl transition-all">Sair da Prova</button>
                </div>

                {questoes.filter(q => q.concurso === simuladoAtivo.concurso && q.banca === simuladoAtivo.banca).map((q, index) => (
                  <div key={q.id} className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-7 shadow-xl backdrop-blur-md">
                    <div className="flex gap-2.5 mb-5">
                      <span className="bg-indigo-600 text-white px-3.5 py-1 rounded-full text-xs font-bold shadow-md shadow-indigo-600/20">Questão {index + 1}</span>
                      {q.materia && <span className="bg-slate-800 text-slate-300 px-3.5 py-1 rounded-full text-xs font-medium">{q.materia}</span>}
                    </div>
                    <p className="text-slate-100 text-base font-medium mb-6 leading-relaxed">{q.enunciado}</p>
                    <div className="space-y-3">
                      {Array.isArray(q.opcoes) && q.opcoes.map((opcao, idx) => {
                        const letra = String.fromCharCode(65 + idx)
                        const selecionada = respostasSimulado[q.id] === idx
                        return (
                          <button key={idx} onClick={() => setRespostasSimulado({ ...respostasSimulado, [q.id]: idx })} className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${selecionada ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 shadow-lg shadow-indigo-500/10' : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-950/80 hover:border-slate-700'}`}>
                            <span className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold transition-all ${selecionada ? 'border-indigo-400 bg-indigo-600 text-white shadow-md' : 'border-slate-700 text-slate-400 bg-slate-900'}`}>{letra}</span>
                            <span className="text-sm">{opcao}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                <button onClick={finalizarSimulado} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-3xl text-base shadow-xl shadow-emerald-600/20 transition-all">Finalizar e Entregar Prova</button>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6 text-center max-w-xl mx-auto">
                <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">🏆 Resultado do Simulado</h2>
                <div className="grid grid-cols-3 gap-4 my-6">
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
            )}
          </div>
        )}

        {/* ABA: DESEMPENHO (COM CRONÓMETRO E SUGESTÃO DE QUESTÕES) */}
        {abaAtiva === 'desempenho' && (
          <div className="space-y-8">
            <header>
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">📈 Painel de Desempenho</h1>
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

            {/* SEÇÃO DO CRONÓMETRO DE ESTUDO */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/60 border border-indigo-500/30 rounded-3xl p-7 shadow-xl backdrop-blur-md">
              <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                ⏱️ Cronómetro de Estudos & Sugestão Inteligente
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Matéria</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Matemática" 
                    value={materiaEstudo} 
                    onChange={e => setMateriaEstudo(e.target.value)} 
                    disabled={cronometroAtivo}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Conteúdo / Tópico (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Geometria Plana" 
                    value={conteudoEstudo} 
                    onChange={e => setConteudoEstudo(e.target.value)} 
                    disabled={cronometroAtivo}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" 
                  />
                </div>
                <div className="flex flex-col justify-end">
                  {!cronometroAtivo ? (
                    <button 
                      onClick={iniciarCronometro} 
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium py-3 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/25"
                    >
                      ▶ Iniciar Sessão
                    </button>
                  ) : (
                    <button 
                      onClick={pausarOuFinalizarCronometro} 
                      className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium py-3 rounded-2xl text-sm transition-all shadow-lg shadow-red-600/25 animate-pulse"
                    >
                      ⏹ Parar e Registar ({formatarTempo(segundosDecorridos)})
                    </button>
                  )}
                </div>
              </div>

              {cronometroAtivo && (
                <div className="text-center py-6 bg-slate-950/60 rounded-2xl border border-indigo-500/20">
                  <p className="text-xs text-indigo-400 uppercase font-semibold tracking-wider">A estudar agora</p>
                  <p className="text-4xl font-extrabold text-slate-100 mt-2">{formatarTempo(segundosDecorridos)}</p>
                  <p className="text-xs text-slate-400 mt-1">{materiaEstudo} {conteudoEstudo ? `> ${conteudoEstudo}` : ''}</p>
                </div>
              )}
            </div>

            {/* QUESTÕES SUGERIDAS APÓS O ESTUDO */}
            {questoesSugeridas.length > 0 && (
              <div className="bg-slate-900/60 border border-emerald-500/30 rounded-3xl p-7 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
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
                      <p className="text-slate-100 text-sm font-medium mb-4 leading-relaxed">{q.enunciado}</p>
                      <div className="space-y-2.5 mb-4">
                        {Array.isArray(q.opcoes) && q.opcoes.map((opcao, idx) => {
                          const letra = String.fromCharCode(65 + idx)
                          const selecionada = respostasSelecionadas[q.id] === idx
                          return (
                            <button key={idx} onClick={() => setRespostasSelecionadas({ ...respostasSelecionadas, [q.id]: idx })} className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${selecionada ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100' : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900'}`}>
                              <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold ${selecionada ? 'border-indigo-400 bg-indigo-600 text-white' : 'border-slate-700 text-slate-400 bg-slate-950'}`}>{letra}</span>
                              <span className="text-xs">{opcao}</span>
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex items-center gap-4">
                        <button onClick={() => validarResposta(q.id, q.resposta_correta)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-xl text-xs transition-all shadow-md">Responder</button>
                        {feedbacks[q.id] && <span className={`text-xs font-semibold ${feedbacks[q.id].status === 'correto' ? 'text-emerald-400' : 'text-red-400'}`}>{feedbacks[q.id].msg}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-7 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-bold text-slate-100 mb-5">⏱️ Registar Bloco Manual</h3>
                <form onSubmit={registarHoras} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Matéria</label>
                    <input type="text" required placeholder="Ex: Matemática" value={novaHora.materia} onChange={e => setNovaHora({ ...novaHora, materia: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-7 shadow-xl backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-5">⚠️ Principais Pontos a Melhorar</h3>
                  {pontosAMelhorar.length === 0 ? (
                    <p className="text-slate-400 text-sm py-12 text-center">Ainda sem erros registados. Continua a praticar para gerar diagnósticos!</p>
                  ) : (
                    <div className="space-y-3">
                      {pontosAMelhorar.map(([conteudo, qtdErros], idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-sm">
                          <span className="text-slate-200 font-medium">{conteudo}</span>
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
        {abaAtiva === 'cadastrar' && (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 shadow-xl backdrop-blur-md">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-6 tracking-tight">➕ Cadastrar Nova Questão</h2>
            <form onSubmit={salvarQuestao} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Matéria</label>
                  <input type="text" required placeholder="Ex: Português" value={novaQuestao.materia} onChange={(e) => setNovaQuestao({ ...novaQuestao, materia: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Conteúdo</label>
                  <input type="text" required placeholder="Ex: Concordância" value={novaQuestao.conteudo} onChange={(e) => setNovaQuestao({ ...novaQuestao, conteudo: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Enunciado da Questão</label>
                <textarea required rows={3} placeholder="Escreva o enunciado..." value={novaQuestao.enunciado} onChange={(e) => setNovaQuestao({ ...novaQuestao, enunciado: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Alternativas (A até E)</label>
                <div className="space-y-3">
                  {novaQuestao.opcoes.map((opcao, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800">
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
          <div className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 shadow-xl backdrop-blur-md">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-2 tracking-tight">📋 Edital Verticalizado</h2>
            <p className="text-slate-400 text-sm mb-6">Acompanhe os tópicos sincronizados com o Spring Boot.</p>
            <form onSubmit={adicionarEditalItem} className="grid grid-cols-1 md:grid-cols-5 gap-3.5 mb-8 bg-slate-950/50 p-4 rounded-3xl border border-slate-800/80">
              <input type="text" placeholder="Concurso" required value={novoItemEdital.concurso} onChange={(e) => setNovoItemEdital({ ...novoItemEdital, concurso: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              <input type="text" placeholder="Matéria" required value={novoItemEdital.materia} onChange={(e) => setNovoItemEdital({ ...novoItemEdital, materia: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              <input type="text" placeholder="Conteúdo" required value={novoItemEdital.conteudo} onChange={(e) => setNovoItemEdital({ ...novoItemEdital, conteudo: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              <select value={novoItemEdital.incidencia} onChange={(e) => setNovoItemEdital({ ...novoItemEdital, incidencia: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
              <button type="submit" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3 rounded-2xl text-sm transition-all shadow-md shadow-indigo-600/20">Adicionar</button>
            </form>
            <div className="space-y-3">
              {editais.map((item) => (
                <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl text-sm border transition-all ${item.concluido ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}>
                  <div className="flex items-center gap-3.5 flex-wrap">
                    <input type="checkbox" checked={item.concluido} onChange={() => alternarStatusEditalItem(item)} className="w-5 h-5 text-indigo-600 rounded-xl bg-slate-900 border-slate-700 cursor-pointer focus:ring-indigo-500" />
                    <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs">{item.concurso}</span>
                    <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs">{item.materia}</span>
                    <span className={item.concluido ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}>{item.conteudo}</span>
                  </div>
                  <button onClick={() => deletarEditalItem(item.id)} className="text-slate-500 hover:text-red-400 p-2 rounded-xl transition-colors">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: REDAÇÃO IA */}
        {abaAtiva === 'redacao' && (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 shadow-xl backdrop-blur-md">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-2 tracking-tight">✍️ Auditoria de Redação por IA</h2>
            <p className="text-slate-400 text-sm mb-6">Envie o tema e seu texto para avaliação integrada.</p>
            <form onSubmit={enviarRedacao} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tema</label>
                <input type="text" required placeholder="Tema da redação..." value={temaRedacao} onChange={(e) => setTemaRedacao(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Texto</label>
                <textarea required rows={8} placeholder="Escreva seu texto aqui..." value={textoRedacao} onChange={(e) => setTextoRedacao(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner" />
              </div>
              <button type="submit" disabled={loadingRedacao} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/25">{loadingRedacao ? 'A processar...' : 'Submeter Redação'}</button>
            </form>
            {resultadoRedacao && (
              <div className="mt-8 bg-slate-950/90 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-slate-100">Relatório de Avaliação Tática</h3>
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold">Concluído</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-slate-200 text-sm whitespace-pre-wrap">{resultadoRedacao}</div>
              </div>
            )}
          </div>
        )}

        {/* ABA: TAREFAS */}
        {abaAtiva === 'tarefas' && (
          <div className="max-w-xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 shadow-xl backdrop-blur-md">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-6 tracking-tight">⚡ Tarefas de Estudo</h2>
            <form onSubmit={adicionarTarefa} className="flex gap-3 mb-6">
              <input type="text" placeholder="Nova tarefa..." value={novaTarefa} onChange={e => setNovaTarefa(e.target.value)} className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-inner" />
              <button type="submit" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-3 rounded-2xl text-sm font-medium shadow-md shadow-indigo-600/20">Adicionar</button>
            </form>
            <div className="space-y-3">
              {tarefas.map(t => (
                <div key={t.id} className="flex items-center justify-between bg-slate-950/40 p-4 rounded-2xl border border-slate-800 text-sm">
                  <span className="text-slate-200 font-medium">{t.texto}</span>
                  <button onClick={() => deletarTarefa(t.id)} className="text-slate-500 hover:text-red-400 p-1.5 rounded-xl transition-colors">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}