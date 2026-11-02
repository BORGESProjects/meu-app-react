import { createClient } from '@supabase/supabase-js'
import { formatarDuracao, resumirProgresso } from './progresso.js'
import './style.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const apiUrl = (import.meta.env.VITE_API_URL?.trim() || 'https://aprovado-api.onrender.com').replace(/\/+$/, '')
const softwareOrigin = (import.meta.env.VITE_SOFTWARE_URL?.trim() || (/^(localhost|127\.)/.test(location.hostname) || location.hostname.endsWith('.vercel.app') ? location.origin : 'https://apaprovado.vercel.app')).replace(/\/+$/, '')
const configOk = Boolean(supabaseUrl && supabaseKey)
const callbackParams = new URLSearchParams(location.hash.slice(1))
const callbackError = callbackParams.get('error_code') || callbackParams.get('error')
const isEmailCallback = callbackParams.has('access_token') && ['signup', 'email'].includes(callbackParams.get('type'))
const supabase = configOk ? createClient(supabaseUrl, supabaseKey) : null
const confirmationRedirect = `${location.origin}/aluno`
const $ = selector => document.querySelector(selector)
const state = { mode: new URLSearchParams(location.search).get('cadastro') === '1' ? 'signup' : 'login', session: null, rankingOrder: 'questoes', isAdmin: false, progressData: {horas_estudo:[],historico_respostas:[],tarefas:[]}, evolutionData:{simulados:[],redacoes:[]}, personalData:{cadernos:[]}, rangeDays: 7, calendarMonth: new Date(new Date().getFullYear(),new Date().getMonth(),1), weekOffset:0, timer: null, reviewId: null, editingCardId: null, selectedMaterialId: null, editingMaterialId: null, materialMode: 'integrado', materialMemoryHidden: false }
let sessionRequests = new AbortController()
let rankingRequest = 0
let profileDirty = false
let resendAvailableAt = 0

function authErrorMessage(error) {
  if (error?.code === 'email_not_confirmed' || /email not confirmed/i.test(error?.message || '')) {
    return 'Seu e-mail ainda não foi confirmado pelo serviço de acesso. Clique em “Reenviar confirmação” e abra o link da mensagem mais recente. Depois, entre com este mesmo e-mail.'
  }
  if (error?.code === 'otp_expired') return 'O link de confirmação venceu ou já foi utilizado. Tente entrar; se o e-mail continuar não confirmado, solicite um novo link abaixo.'
  if (error?.status === 429 || ['over_email_send_rate_limit', 'over_request_rate_limit'].includes(error?.code)) {
    return 'O limite de tentativas foi atingido. Aguarde alguns minutos antes de tentar novamente.'
  }
  if (error?.code === 'invalid_credentials') return 'E-mail ou senha incorretos. Confira os dados e tente novamente.'
  return 'Não foi possível concluir o acesso agora. Tente novamente em instantes.'
}

const currency = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
const date = value => value ? new Date(value).toLocaleDateString('pt-BR') : '—'
const planLabel = value => value === 'premium' ? 'Premium' : value === 'basica' ? 'Básica' : '—'
const cycleLabel = value => ({ monthly: 'Mensal', quarterly: 'Trimestral', annual: 'Anual' })[value] || '—'
const localDateKey = value => {
  const parsed = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(parsed.getTime())) return ''
  return `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-${String(parsed.getDate()).padStart(2,'0')}`
}
const dateLabel = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}) : '—'
const secondsFromStudy = item => Math.max(0,Number(item?.segundos)||Number(item?.horas||0)*3600)
const studyDate = item => /^\d{4}-\d{2}-\d{2}$/.test(String(item?.data||'')) ? item.data : localDateKey(item?.criado_em || item?.created_at)
const formatShortDuration = seconds => {
  const total = Math.max(0,Math.round(Number(seconds)||0)), hours=Math.floor(total/3600), minutes=Math.floor(total%3600/60)
  return hours ? `${hours}h ${minutes}min` : `${minutes} min`
}
const flashcards = () => state.progressData.tarefas.filter(item=>item?.tipo==='flashcard_aprovado'&&!item.suspenso)
const dueFlashcards = (now=Date.now()) => flashcards().filter(card=>!card.proximaRevisao||Date.parse(card.proximaRevisao)<=now).sort((a,b)=>Date.parse(a.proximaRevisao||0)-Date.parse(b.proximaRevisao||0))

function renderRanking(items = []) {
  const list = $('#ranking-list')
  list.replaceChildren()
  $('#ranking-empty').hidden = items.length > 0
  for (const [index, item] of items.entries()) {
    const row = document.createElement('li')
    const position = document.createElement('span')
    position.className = 'ranking-position'
    position.textContent = String(item.posicao || index + 1)
    const details = document.createElement('div')
    details.className = 'ranking-details'
    const name = document.createElement('strong')
    name.textContent = item.apelido || 'Estudante'
    const stats = document.createElement('span')
    stats.textContent = `${Number(item.questoes_respondidas || 0).toLocaleString('pt-BR')} questões · ${formatarDuracao(item.segundos_estudo)}`
    details.append(name, stats)
    row.append(position, details)
    list.append(row)
  }
}

function selecionarOrdenacaoRanking(ordem) {
  state.rankingOrder = ordem
  const porQuestoes = ordem === 'questoes'
  $('#ranking-by-questions').classList.toggle('is-active', porQuestoes)
  $('#ranking-by-questions').setAttribute('aria-pressed', String(porQuestoes))
  $('#ranking-by-time').classList.toggle('is-active', !porQuestoes)
  $('#ranking-by-time').setAttribute('aria-pressed', String(!porQuestoes))
}

function setMessage(selector, message, kind = 'info') {
  const el = $(selector)
  el.textContent = message
  el.dataset.kind = kind
  el.hidden = !message
}

function renderMode() {
  const signup = state.mode === 'signup'
  $('#auth-title').textContent = signup ? 'Crie sua conta' : 'Entre na sua conta'
  $('#auth-hint').textContent = signup
    ? 'Crie sua conta gratuita com um e-mail que você possa confirmar. Não é preciso cadastrar cartão para começar a estudar.'
    : 'Use o e-mail e a senha da sua conta AP Aprovado.'
  $('#password').autocomplete = signup ? 'new-password' : 'current-password'
  $('#password').minLength = signup ? 8 : 1
  $('#auth-submit').textContent = signup ? 'Criar conta' : 'Entrar'
  document.querySelectorAll('.auth-tab').forEach(button => {
    const active = button.dataset.mode === state.mode
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-selected', String(active))
  })
}

async function api(path, options = {}, independentOfSession = false) {
  const headers = new Headers(options.headers || {})
  if (supabaseKey) headers.set('X-Supabase-Key', supabaseKey)
  if (state.session?.access_token) headers.set('Authorization', `Bearer ${state.session.access_token}`)
  const safeToRetry = !options.method || options.method.toUpperCase() === 'GET'
  for (let attempt = 0; ; attempt += 1) {
    try {
      // The Render free instance can take 50 seconds or more to wake; the Java service
      // cold-start observed in production took about 127 seconds.
      const timeout = AbortSignal.timeout(180000)
      const signal = independentOfSession
        ? timeout
        : AbortSignal.any([sessionRequests.signal, timeout])
      const response = await fetch(`${apiUrl}${path}`, { ...options, headers, cache: 'no-store', signal })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.message || body.error || `Não foi possível concluir a solicitação (${response.status}).`)
      return body
    } catch (error) {
      const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError' || /signal timed out/i.test(error?.message || '')
      if (timeout && safeToRetry && attempt === 0 && !sessionRequests.signal.aborted) continue
      if (timeout && !sessionRequests.signal.aborted) {
        throw new Error('O servidor está demorando para responder e pode estar iniciando. Aguarde um pouco e tente carregar novamente.')
      }
      throw error
    }
  }
}

function selecionarAbaAluno(aba, atualizarUrl = true) {
  const aliasesCaderno = ['errors', 'flashcards']
  const permitidas = ['performance', 'evolution', 'notebook', 'downloads', ...(state.isAdmin ? ['receipts'] : [])]
  if (aliasesCaderno.includes(aba)) aba = 'notebook'
  if (aba === 'hours') aba = 'performance'
  const ativa = permitidas.includes(aba) ? aba : 'performance'
  const botoes = document.querySelectorAll('.student-tab')
  for (const button of botoes) {
    const selecionada = button.dataset.panel === ativa
    button.classList.toggle('is-active', selecionada)
    button.setAttribute('aria-selected', String(selecionada))
    button.tabIndex = selecionada ? 0 : -1
  }
  for (const panel of document.querySelectorAll('.student-panel')) {
    const selecionado = panel.id === `panel-${ativa}` || (ativa === 'receipts' && panel.id === 'admin-card')
    panel.hidden = !selecionado
  }
  if (atualizarUrl) {
    const fragmento = { performance: '#desempenho', evolution: '#evolucao', notebook: '#caderno', downloads: '#downloads', receipts: '#recebimentos' }[ativa]
    history.replaceState(null, '', `${location.pathname}${location.search}${fragmento}`)
  }
}

function abaInicialDoEndereco() {
  return ({ '#desempenho': 'performance', '#horas': 'performance', '#evolucao': 'evolution', '#erros': 'notebook', '#flashcards': 'notebook', '#caderno': 'notebook', '#downloads': 'downloads', '#recebimentos': 'receipts' })[location.hash] || 'performance'
}

async function loadLeaderboard(userId = state.session?.user?.id) {
  if (!userId || !supabase) return
  const request = ++rankingRequest
  try {
    const { data, error } = await supabase.rpc('ranking_estudo_publico', {
      p_ordenacao: state.rankingOrder,
      p_limite: 20,
    }).abortSignal(AbortSignal.timeout(20000))
    if (error) throw error
    if (state.session?.user?.id !== userId || request !== rankingRequest) return
    renderRanking(Array.isArray(data) ? data : [])
    $('#ranking-status').textContent = data?.length
      ? 'Ranking atualizado com dados sincronizados dos estudantes participantes.'
      : 'Ainda não há estudantes participantes no ranking.'
  } catch {
    if (state.session?.user?.id !== userId || request !== rankingRequest) return
    renderRanking([])
    $('#ranking-status').textContent = 'O ranking será exibido quando a sincronização da comunidade estiver disponível.'
  }
}

function renderEvolutionLine(targetId, points, { color = '#36d982', empty = 'Sem dados neste período.' } = {}) {
  const host = $(`#${targetId}`)
  if (!host) return
  host.replaceChildren()
  if (!points.length) {
    const message = document.createElement('p'); message.className = 'empty-state'; message.textContent = empty; host.append(message); return
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 640 230'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true')
  const plot = { left: 42, right: 620, top: 20, bottom: 184 }
  for (const value of [0, 50, 100]) {
    const y = plot.bottom - (value / 100) * (plot.bottom - plot.top)
    const line = document.createElementNS(svg.namespaceURI, 'line'); line.setAttribute('x1', plot.left); line.setAttribute('x2', plot.right); line.setAttribute('y1', y); line.setAttribute('y2', y); line.setAttribute('class', 'evolution-gridline'); svg.append(line)
    const label = document.createElementNS(svg.namespaceURI, 'text'); label.setAttribute('x', 4); label.setAttribute('y', y + 4); label.setAttribute('class', 'evolution-axis-label'); label.textContent = `${value}%`; svg.append(label)
  }
  const visiblePoints = points.length > 14 ? Array.from({length:14},(_,index)=>points[Math.round(index*(points.length-1)/13)]) : points
  const coords = visiblePoints.map((point, index) => ({ x: visiblePoints.length === 1 ? (plot.left + plot.right) / 2 : plot.left + index * (plot.right - plot.left) / (visiblePoints.length - 1), y: plot.bottom - Math.max(0, Math.min(100, point.value)) / 100 * (plot.bottom - plot.top), ...point }))
  const area = document.createElementNS(svg.namespaceURI, 'polygon'); area.setAttribute('points', `${plot.left},${plot.bottom} ${coords.map(point => `${point.x},${point.y}`).join(' ')} ${plot.right},${plot.bottom}`); area.setAttribute('fill', color); area.setAttribute('fill-opacity', '.10'); svg.append(area)
  const line = document.createElementNS(svg.namespaceURI, 'polyline'); line.setAttribute('points', coords.map(point => `${point.x},${point.y}`).join(' ')); line.setAttribute('fill', 'none'); line.setAttribute('stroke', color); line.setAttribute('stroke-width', '4'); line.setAttribute('stroke-linecap', 'round'); line.setAttribute('stroke-linejoin', 'round'); svg.append(line)
  for (const [index,point] of coords.entries()) {
    const dot = document.createElementNS(svg.namespaceURI, 'circle'); dot.setAttribute('cx', point.x); dot.setAttribute('cy', point.y); dot.setAttribute('r', '5'); dot.setAttribute('fill', color); dot.setAttribute('class', 'evolution-dot'); svg.append(dot)
    const tooltip = document.createElementNS(svg.namespaceURI, 'title'); tooltip.textContent = `${point.label}: ${Math.round(point.value)}%`; dot.append(tooltip)
    const label = document.createElementNS(svg.namespaceURI, 'text'); label.setAttribute('x', point.x); label.setAttribute('y', 212); label.setAttribute('text-anchor', 'middle'); label.setAttribute('class', 'evolution-date-label'); label.textContent = point.label; svg.append(label)
    if(coords.length<=10||index===0||index===coords.length-1||index%2===0){const value=document.createElementNS(svg.namespaceURI,'text');value.setAttribute('x',point.x);value.setAttribute('y',Math.max(12,point.y-10));value.setAttribute('text-anchor','middle');value.setAttribute('class','evolution-value-label');value.textContent=`${Math.round(point.value)}%`;svg.append(value)}
  }
  host.append(svg)
}

function renderTrendIndicator(targetId, points, emptyLabel) {
  const badge=$(`#${targetId}`)
  if(!badge)return
  if(points.length<2){badge.textContent=emptyLabel;badge.className='trend-indicator';return}
  const change=Math.round(points.at(-1).value-points[0].value)
  badge.textContent=Math.abs(change)<1?'→ Estável':`${change>0?'↗ Subindo':'↘ Caindo'} ${change>0?'+':''}${change} p.p.`
  badge.className=`trend-indicator ${change>0?'is-up':change<0?'is-down':'is-flat'}`
}

function renderEvolution() {
  const range = $('#evolution-range')?.value || '30', days = range === 'all' ? Infinity : Number(range), cutoff = Number.isFinite(days) ? Date.now() - days * 86400000 : -Infinity
  const inRange = value => { const time = Date.parse(value || ''); return Number.isFinite(time) && time >= cutoff }
  const history = state.progressData.historico_respostas.filter(item => typeof item?.acertou === 'boolean' && inRange(item.respondidaEm))
  const simulations = state.evolutionData.simulados.filter(item => inRange(item.concluidoEm)).sort((a,b)=>(Date.parse(a.concluidoEm)||0)-(Date.parse(b.concluidoEm)||0))
  const essays = state.evolutionData.redacoes.filter(item => Number.isFinite(Number(item?.nota)) && Number(item?.maximo)>0 && inRange(item.criadaEm)).sort((a,b)=>(Date.parse(a.criadaEm)||0)-(Date.parse(b.criadaEm)||0))
  const accuracy = history.length ? Math.round(history.filter(item=>item.acertou).length/history.length*100) : null
  $('#evolution-accuracy').textContent = accuracy == null ? '—' : `${accuracy}%`
  const previousCutoff = Number.isFinite(days) ? Date.now() - days * 2 * 86400000 : -Infinity
  const previous = Number.isFinite(days) ? state.progressData.historico_respostas.filter(item=>typeof item?.acertou==='boolean'&&Date.parse(item.respondidaEm)<cutoff&&Date.parse(item.respondidaEm)>=previousCutoff) : []
  const previousAccuracy = previous.length ? Math.round(previous.filter(item=>item.acertou).length/previous.length*100) : null
  const delta = accuracy == null || previousAccuracy == null ? 'Compare com outro período quando houver histórico suficiente.' : `${accuracy-previousAccuracy>0?'+':''}${accuracy-previousAccuracy} p.p. em relação ao período anterior`
  $('#evolution-accuracy-delta').textContent = delta
  $('#evolution-accuracy-delta').className = `evolution-delta ${accuracy == null || previousAccuracy == null ? '' : accuracy>=previousAccuracy?'is-up':'is-down'}`
  $('#evolution-sim-count').textContent = String(simulations.length)
  const simRates=simulations.map(item=>Number(item.total)>0?Number(item.acertos||0)/Number(item.total)*100:null).filter(value=>value!=null)
  $('#evolution-sim-trend').textContent = simRates.length>1?`${simRates[0].toFixed(0)}% → ${simRates.at(-1).toFixed(0)}% de acerto`:'Resultados por simulado'
  $('#evolution-essay-count').textContent = String(essays.length)
  const latestEssay=essays.at(-1),previousEssay=essays.at(-2)
  $('#evolution-essay-latest').textContent = latestEssay?`${latestEssay.nota}/${latestEssay.maximo}`:'—'
  $('#evolution-essay-latest-date').textContent = latestEssay?`${latestEssay.banca||'Redação'} · ${dateLabel(localDateKey(latestEssay.criadaEm))}`:'Sem correção registrada'
  const essayDelta=latestEssay&&previousEssay?Number(latestEssay.nota)-Number(previousEssay.nota):null
  $('#evolution-essay-trend').textContent=essayDelta==null?'Histórico de notas sincronizado':`${essayDelta>0?'+':''}${essayDelta} ponto(s) desde a redação anterior`
  $('#evolution-essay-trend').className=`evolution-delta ${essayDelta==null?'':essayDelta>=0?'is-up':'is-down'}`

  const grouped=new Map(),monthMode=days>90
  for(const item of history){const date=new Date(item.respondidaEm);if(!Number.isFinite(date.getTime()))continue;const start=new Date(date);if(monthMode)start.setDate(1);else{const offset=(start.getDay()+6)%7;start.setDate(start.getDate()-offset)}start.setHours(0,0,0,0);const key=start.toISOString().slice(0,10),bucket=grouped.get(key)||{total:0,correct:0};bucket.total++;if(item.acertou)bucket.correct++;grouped.set(key,bucket)}
  const accuracyPoints=[...grouped.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([key,bucket])=>({label:monthMode?new Date(`${key}T12:00:00`).toLocaleDateString('pt-BR',{month:'short'}):new Date(`${key}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}),value:bucket.correct/bucket.total*100}))
  renderEvolutionLine('evolution-accuracy-chart',accuracyPoints,{color:'#36d982',empty:'Resolva questões para formar seu gráfico de acertos.'})
  renderTrendIndicator('accuracy-trend',accuracyPoints,'Aguardando dados de acertos')
  const essayPoints=essays.map(item=>({label:new Date(item.criadaEm).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}),value:Number(item.nota)/Number(item.maximo)*100}))
  renderEvolutionLine('evolution-essay-chart',essayPoints,{color:'#c2d86a',empty:'As notas das próximas correções formarão esta linha do tempo.'})
  renderTrendIndicator('essay-trend',essayPoints,'Aguardando notas de redação')

  const simHost=$('#evolution-sim-list'),essayHost=$('#evolution-essay-list');simHost.replaceChildren();essayHost.replaceChildren()
  for(const item of [...simulations].reverse().slice(0,12)){const row=document.createElement('article');row.className='evolution-row';const details=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('span'),score=document.createElement('b');title.textContent=item.titulo||'Simulado';meta.textContent=`${item.banca||'Treino'} · ${dateLabel(localDateKey(item.concluidoEm))} · ${item.acertos||0} acertos de ${item.total||0}`;score.textContent=`${Number(item.total)?Math.round(Number(item.acertos||0)/Number(item.total)*100):0}%`;details.append(title,meta);row.append(details,score);simHost.append(row)}
  for(const item of [...essays].reverse().slice(0,30)){const row=document.createElement('article');row.className='evolution-row essay-evolution-row';const details=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('span'),score=document.createElement('b');title.textContent=item.tema||'Tema livre';meta.textContent=`${item.banca||'Redação'} · ${dateLabel(localDateKey(item.criadaEm))}${Array.isArray(item.criterios)&&item.criterios.length?` · ${item.criterios.map(c=>`${c.nome} ${c.nota}/${c.maximo}`).join(' · ')}`:''}`;score.textContent=`${item.nota}/${item.maximo}`;details.append(title,meta);row.append(details,score);essayHost.append(row)}
  $('#evolution-sim-empty').hidden=simulations.length>0;$('#evolution-essay-empty').hidden=essays.length>0
}

async function loadStudentProgress({ quiet = false } = {}) {
  const userId = state.session?.user?.id
  if (!userId || !supabase) return
  if (!quiet) {
    $('#progress-updated').textContent = 'Buscando seu progresso…'
    $('#progress-message').textContent = ''
  }
  let progresso = null
  try {
    const { data, error } = await supabase.from('progresso_usuario')
      .select('horas_estudo,historico_respostas,tarefas,updated_at')
      .eq('user_id', userId)
      .abortSignal(AbortSignal.timeout(20000))
      .maybeSingle()
    if (error) throw error
    if (state.session?.user?.id !== userId) return
    progresso = data
    state.progressData = {horas_estudo:Array.isArray(data?.horas_estudo)?data.horas_estudo:[],historico_respostas:Array.isArray(data?.historico_respostas)?data.historico_respostas:[],tarefas:Array.isArray(data?.tarefas)?data.tarefas:[],updated_at:data?.updated_at||null}
    const resumo = resumirProgresso(data || {})
    $('#progress-questions').textContent = resumo.questoesRespondidas.toLocaleString('pt-BR')
    $('#progress-correct').textContent = resumo.acertos.toLocaleString('pt-BR')
    $('#progress-wrong').textContent = resumo.erros.toLocaleString('pt-BR')
    $('#progress-hours').textContent = formatarDuracao(resumo.segundosEstudo)
    $('#progress-accuracy').textContent = `Aproveitamento: ${resumo.percentualAcerto}%`
    $('#progress-updated').textContent = data?.updated_at
      ? `Sincronizado em ${new Date(data.updated_at).toLocaleString('pt-BR')}`
      : 'Ainda sem registros sincronizados'
    $('#progress-message').textContent = data
      ? 'Resultados das suas respostas e sessões de estudo sincronizadas no AP Aprovado.'
      : 'Quando você responder questões ou registrar uma sessão no software com esta conta, os totais aparecerão aqui.'
    renderLearningInsights()
    renderStudyCalendar()
    renderErrorNotebook()
    renderFlashcardHub()
    renderReviewMaterials()
    try {
      const {data:estudos,error:erroEstudos}=await supabase.from('estudo_pessoal_usuario').select('dados').eq('user_id',userId).abortSignal(AbortSignal.timeout(20000)).maybeSingle()
      if(erroEstudos)throw erroEstudos
      if(state.session?.user?.id!==userId)return
      state.personalData={cadernos:Array.isArray(estudos?.dados?.cadernos)?estudos.dados.cadernos:[],removidos:estudos?.dados?.removidos||{}}
      state.evolutionData={simulados:Array.isArray(estudos?.dados?.simulados)?estudos.dados.simulados:[],redacoes:Array.isArray(estudos?.dados?.redacoes)?estudos.dados.redacoes:[]}
    } catch { state.evolutionData={simulados:[],redacoes:[]};state.personalData={cadernos:[]} }
    renderSavedNotebooks()
    renderReviewMaterials()
    renderStudyPlan()
    renderEvolution()
  } catch {
    if (state.session?.user?.id !== userId) return
    $('#progress-message').textContent = 'Não foi possível ler o progresso sincronizado agora. Tente atualizar novamente.'
    $('#progress-updated').textContent = 'Sincronização indisponível'
  }

  try {
    const { data: perfil, error: erroPerfil } = await supabase.from('perfil_ranking_usuario')
      .select('apelido,publico')
      .eq('user_id', userId)
      .abortSignal(AbortSignal.timeout(20000))
      .maybeSingle()
    if (state.session?.user?.id !== userId) return
    if (erroPerfil) throw erroPerfil
    if (!profileDirty) {
      $('#ranking-nickname').value = perfil?.apelido || ''
      $('#ranking-public').checked = Boolean(perfil?.publico)
    }
    await loadLeaderboard(userId)
  } catch {
    if (state.session?.user?.id !== userId) return
    renderRanking([])
    $('#ranking-status').textContent = progresso
      ? 'O ranking estará disponível quando a sincronização da comunidade for ativada.'
      : 'O ranking ainda não está disponível nesta versão.'
  }
}

function renderLearningInsights() {
  const history=state.progressData.historico_respostas.filter(item=>typeof item?.acertou==='boolean')
  const now=new Date(), start=new Date(now); start.setHours(0,0,0,0); start.setDate(start.getDate()-state.rangeDays+1)
  const filtered=history.filter(item=>{const d=new Date(item.respondidaEm);return Number.isFinite(d.getTime())&&d>=start&&d<=now})
  const buckets=Array.from({length:state.rangeDays},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return{date:localDateKey(d),questions:0,correct:0}})
  const byDate=new Map(buckets.map(item=>[item.date,item]))
  for(const item of filtered){const bucket=byDate.get(localDateKey(item.respondidaEm));if(bucket){bucket.questions++;if(item.acertou)bucket.correct++}}
  $('#range-questions').textContent=filtered.length.toLocaleString('pt-BR')
  const max=Math.max(1,...buckets.map(item=>item.questions))
  const chart=$('#questions-chart'); chart.replaceChildren()
  for(const bucket of buckets){const bar=document.createElement('div');bar.className='bar-column';const fill=document.createElement('span');fill.className='bar-fill';fill.style.height=`${bucket.questions?Math.max(5,bucket.questions/max*100):2}%`;fill.title=`${dateLabel(bucket.date)}: ${bucket.questions} questões`;fill.setAttribute('aria-label',fill.title);bar.append(fill);chart.append(bar)}
  const axis=$('#chart-axis');axis.replaceChildren()
  const ticks=state.rangeDays===7?buckets:buckets.filter((_,i)=>i===0||i===buckets.length-1||i%(state.rangeDays===30?5:15)===0)
  for(const item of ticks){const label=document.createElement('span');label.textContent=dateLabel(item.date);axis.append(label)}
  const correct=filtered.filter(item=>item.acertou).length, accuracy=filtered.length?Math.round(correct/filtered.length*100):0
  $('#range-accuracy').textContent=filtered.length?`${accuracy}%`:'—'
  const ring=$('#accuracy-chart');ring.style.setProperty('--accuracy',`${accuracy}%`);ring.replaceChildren()
  const inner=document.createElement('div');inner.className='accuracy-inner';const ringValue=document.createElement('strong');ringValue.textContent=filtered.length?`${accuracy}%`:'—';const ringLabel=document.createElement('span');ringLabel.textContent=filtered.length?`${correct} acertos`:'sem questões';inner.append(ringValue,ringLabel);ring.append(inner)
  $('#accuracy-guidance').textContent=!filtered.length?'Registre respostas no software para acompanhar sua precisão neste período.':accuracy>=85?'Ótima consistência. Mantenha a revisão espaçada para consolidar os pontos fortes.':accuracy>=65?'Base em evolução. Priorize os conteúdos com mais erros antes de aumentar o volume.':'Use os erros como guia: revise a teoria do assunto e refaça questões semelhantes.'
  const subjects=new Map()
  for(const item of filtered){const name=String(item.materia||'Matéria não identificada');const row=subjects.get(name)||{questions:0,correct:0};row.questions++;if(item.acertou)row.correct++;subjects.set(name,row)}
  const list=$('#subject-insights');list.replaceChildren()
  const sorted=[...subjects].map(([name,row])=>({name,...row,rate:Math.round(row.correct/row.questions*100)})).sort((a,b)=>a.rate-b.rate||b.questions-a.questions).slice(0,6)
  if(!sorted.length){const empty=document.createElement('p');empty.className='empty-state';empty.textContent='As matérias aparecerão depois que seu histórico de respostas sincronizar.';list.append(empty)}
  for(const item of sorted){const row=document.createElement('div');row.className='subject-row';const heading=document.createElement('div');heading.className='subject-row-head';const name=document.createElement('strong');name.textContent=item.name;const stat=document.createElement('span');stat.textContent=`${item.rate}% · ${item.correct}/${item.questions}`;heading.append(name,stat);const track=document.createElement('div');track.className='subject-track';const fill=document.createElement('span');fill.style.width=`${item.rate}%`;fill.dataset.level=item.rate>=80?'strong':item.rate>=60?'steady':'focus';track.append(fill);row.append(heading,track);list.append(row)}
  const priority=sorted.find(item=>item.questions>=2&&item.rate<75)
  $('#study-guidance').textContent=priority?`Sugestão: reserve sua próxima sessão para ${priority.name}. Seu aproveitamento está em ${priority.rate}% após ${priority.questions} questões no período.`:filtered.length?`Você respondeu ${filtered.length} questão(ões) no período. Alterne revisão de pontos fortes e novos assuntos para manter o avanço.`:'As orientações ficam mais precisas à medida que suas respostas e sessões chegam do software.'
}

function renderStudyCalendar() {
  const sessions=state.progressData.horas_estudo, questions=state.progressData.historico_respostas
  const month=state.calendarMonth; $('#calendar-month').textContent=month.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
  const first=new Date(month.getFullYear(),month.getMonth(),1), offset=(first.getDay()+6)%7, days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate()
  const daily=new Map()
  for(const item of sessions){const date=studyDate(item);if(!date)continue;const value=daily.get(date)||{seconds:0,questions:0};value.seconds+=secondsFromStudy(item);daily.set(date,value)}
  for(const item of questions){const date=localDateKey(item.respondidaEm);if(!date)continue;const value=daily.get(date)||{seconds:0,questions:0};value.questions++;value.seconds+=Math.max(0,Number(item.tempoRespostaSegundos)||0);daily.set(date,value)}
  const calendar=$('#study-calendar');calendar.replaceChildren()
  for(let i=0;i<offset;i++){const spacer=document.createElement('span');spacer.className='calendar-day is-outside';spacer.setAttribute('aria-hidden','true');calendar.append(spacer)}
  for(let day=1;day<=days;day++){const date=`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,value=daily.get(date)||{seconds:0,questions:0};const cell=document.createElement('div');cell.className='calendar-day';cell.setAttribute('role','gridcell');cell.dataset.level=value.seconds>5400?3:value.seconds>=1800?2:value.seconds>0?1:0;cell.title=`${dateLabel(date)} · ${formatShortDuration(value.seconds)}${value.questions?` · ${value.questions} questões`:''}`;const number=document.createElement('span');number.textContent=String(day);cell.append(number);if(value.seconds>0){const time=document.createElement('small');time.textContent=formatShortDuration(value.seconds);cell.append(time)}if(value.questions>0){const questionsLabel=document.createElement('small');questionsLabel.textContent=`${value.questions} questões`;cell.append(questionsLabel)}calendar.append(cell)}
  const monthPrefix=`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}`
  const monthSessions=sessions.filter(item=>studyDate(item).startsWith(monthPrefix)), monthQuestions=questions.filter(item=>localDateKey(item.respondidaEm).startsWith(monthPrefix))
  const activeDays=new Set([...monthSessions.map(studyDate),...monthQuestions.map(item=>localDateKey(item.respondidaEm))].filter(Boolean))
  const totalSeconds=monthSessions.reduce((total,item)=>total+secondsFromStudy(item),0)+monthQuestions.reduce((total,item)=>total+Math.max(0,Number(item.tempoRespostaSegundos)||0),0)
  $('#days-studied').textContent=String(activeDays.size);$('#hours-studied').textContent=formatShortDuration(totalSeconds)
  const questionSeconds=monthQuestions.reduce((total,item)=>total+Math.max(0,Number(item.tempoRespostaSegundos)||0),0), measured=monthQuestions.filter(item=>Number(item.tempoRespostaSegundos)>0).length
  $('#question-time').textContent=measured?formatShortDuration(questionSeconds):'Sem registro'
  $('#daily-average').textContent=formatShortDuration(activeDays.size?totalSeconds/activeDays.size:0)
  $('#study-sessions').replaceChildren()
  const recent=[...sessions].sort((a,b)=>Date.parse(b.criado_em||b.created_at||b.data||0)-Date.parse(a.criado_em||a.created_at||a.data||0)).slice(0,8)
  if(!recent.length){const empty=document.createElement('p');empty.className='empty-state';empty.textContent='As sessões registradas no aplicativo ou pelo cronômetro aparecerão aqui.';$('#study-sessions').append(empty)}
  for(const item of recent){const row=document.createElement('div');row.className='session-row';const detail=document.createElement('div');const title=document.createElement('strong');title.textContent=item.materia||'Estudo';const subtitle=document.createElement('span');subtitle.textContent=`${item.conteudo||'Sessão de estudo'} · ${dateLabel(studyDate(item))}`;detail.append(title,subtitle);const time=document.createElement('b');time.textContent=formatShortDuration(secondsFromStudy(item));row.append(detail,time);$('#study-sessions').append(row)}
  const subjects=[...new Set([...sessions.map(item=>item.materia),...questions.map(item=>item.materia)].filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));const options=$('#subject-options');options.replaceChildren();for(const subject of subjects){const option=document.createElement('option');option.value=subject;options.append(option)}
}

function renderErrorNotebook() {
  const history=state.progressData.historico_respostas.filter(item=>typeof item?.acertou==='boolean'), notes=new Map(state.progressData.tarefas.filter(item=>item?.tipo==='nota_erro_aprovado').map(item=>[String(item.questaoId),item]))
  const latest=new Map()
  for(const item of history){const id=String(item.questaoId??item.id??'');if(!id)continue;const previous=latest.get(id)||{id,errors:0,first:item,latest:item};if(!item.acertou)previous.errors++;previous.latest=item;if(Date.parse(item.respondidaEm||0)>=Date.parse(previous.first.respondidaEm||0))previous.first=item;latest.set(id,previous)}
  const mistakes=[...latest.values()].filter(item=>item.errors).map(item=>({...item,note:notes.get(item.id)||null})).sort((a,b)=>Date.parse(b.latest.respondidaEm||0)-Date.parse(a.latest.respondidaEm||0))
  const subjectFilter=$('#error-subject-filter'),current=subjectFilter.value,subjects=[...new Set(mistakes.map(item=>item.latest.materia||item.first.materia).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'))
  const selectOptions=[['','Todas as matérias'],...subjects.map(item=>[item,item])];if(selectOptions.map(item=>item[0]).join('|')!==[...subjectFilter.options].map(item=>item.value).join('|')){subjectFilter.replaceChildren(...selectOptions.map(([value,label])=>new Option(label,value)));subjectFilter.value=subjects.includes(current)?current:''}
  const selected=subjectFilter.value, filtered=mistakes.filter(item=>!selected||(item.latest.materia||item.first.materia)===selected), totalErrors=filtered.reduce((sum,item)=>sum+item.errors,0)
  $('#error-summary').replaceChildren();for(const [value,label] of [[String(filtered.length),'Questões para revisar'],[String(totalErrors),'Erros registrados'],[String(filtered.filter(item=>item.note?.dominado).length),'Marcadas como revisadas']]){const card=document.createElement('article');const strong=document.createElement('strong');strong.textContent=value;const span=document.createElement('span');span.textContent=label;card.append(strong,span);$('#error-summary').append(card)}
  const container=$('#error-list');container.replaceChildren();$('#errors-empty').hidden=filtered.length>0
  for(const item of filtered){const data=item.latest,card=document.createElement('article');card.className='error-card';card.dataset.questionId=item.id;const top=document.createElement('div');top.className='error-card-top';const subject=document.createElement('span');subject.className='subject-chip';subject.textContent=[data.materia||item.first.materia||'Matéria não identificada',data.conteudo||item.first.conteudo].filter(Boolean).join(' · ');const status=document.createElement('span');status.className=item.note?.dominado?'resolved-chip':'error-chip';status.textContent=item.note?.dominado?'Revisado':data.acertou?'Acertou depois':'Revisar';top.append(subject,status);const meta=document.createElement('p');meta.className='error-meta';meta.textContent=`${data.concurso||data.banca||'Questão do acervo'}${data.ano?` · ${data.ano}`:''} · ${item.errors} erro(s) · última tentativa ${dateLabel(localDateKey(data.respondidaEm))}`;const answer=document.createElement('p');answer.className='error-answer';answer.textContent=data.respostaSelecionada!=null?`Sua resposta: ${data.respostaSelecionada} · Gabarito: ${data.respostaCorreta??'não informado'}`:'Questão registrada como incorreta no seu histórico.';const textarea=document.createElement('textarea');textarea.className='field error-note-input';textarea.rows=2;textarea.maxLength=1400;textarea.placeholder='O que te confundiu? Registre a regra ou o raciocínio que vai lembrar na próxima.';textarea.value=item.note?.nota||'';const actions=document.createElement('div');actions.className='error-actions';const save=document.createElement('button');save.type='button';save.className='button button-quiet';save.dataset.action='save-note';save.textContent='Salvar aprendizado';const resolve=document.createElement('button');resolve.type='button';resolve.className='button button-quiet';resolve.dataset.action='toggle-mastered';resolve.textContent=item.note?.dominado?'Reabrir revisão':'Marcar como revisado';actions.append(save,resolve);const link=document.createElement('a');link.className='software-link';link.href=`${softwareOrigin}/estudar.html?questao=${encodeURIComponent(item.id)}`;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Abrir software para praticar';card.append(top,meta,answer,textarea,actions,link);container.append(card)}
}

function renderFlashcardHub() {
  const cards=flashcards(),due=dueFlashcards();$('#cards-due').textContent=String(due.length)
  const selected=due.find(card=>card.id===state.reviewId)||due[0]||null;state.reviewId=selected?.id||null
  $('#review-deck').textContent=selected?[selected.materia,selected.conteudo].filter(Boolean).join(' · ')||'Sua próxima revisão':'Sua próxima revisão'
  $('#review-position').textContent=selected?`1 / ${due.length}`:'0 / 0'
  $('#review-question').textContent=selected?.frente||'Crie seus primeiros flashcards para começar a revisar.'
  $('#review-answer').textContent=selected?.verso||'';$('#review-back').hidden=true;$('#reveal-card').hidden=!selected;$('#review-ratings').hidden=true
  const filter=$('#card-subject-filter'),current=filter.value,subjects=[...new Set(cards.map(card=>card.materia).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'))
  const options=[['','Todas as matérias'],...subjects.map(subject=>[subject,subject])];if(options.map(item=>item[0]).join('|')!==[...filter.options].map(item=>item.value).join('|')){filter.replaceChildren(...options.map(([value,label])=>new Option(label,value)));filter.value=subjects.includes(current)?current:''}
  const list=$('#flashcard-list');list.replaceChildren();const filtered=cards.filter(card=>!filter.value||card.materia===filter.value);$('#cards-empty').hidden=filtered.length>0
  for(const card of filtered.sort((a,b)=>String(a.materia).localeCompare(String(b.materia),'pt-BR')||String(a.frente).localeCompare(String(b.frente),'pt-BR'))){const row=document.createElement('article');row.className='flashcard-row';const info=document.createElement('div');const question=document.createElement('strong');question.textContent=card.frente;const topic=document.createElement('span');topic.textContent=[card.materia,card.conteudo].filter(Boolean).join(' · ');info.append(question,topic);const dueLabel=document.createElement('small');dueLabel.textContent=Date.parse(card.proximaRevisao||0)<=Date.now()?'Pronto para revisar':`Próxima revisão ${dateLabel(localDateKey(card.proximaRevisao))}`;const actions=document.createElement('div');actions.className='flashcard-row-actions';const edit=document.createElement('button');edit.type='button';edit.className='sort-button';edit.dataset.action='edit';edit.dataset.cardId=card.id;edit.textContent='Editar';const archive=document.createElement('button');archive.type='button';archive.className='sort-button';archive.dataset.action='archive';archive.dataset.cardId=card.id;archive.textContent='Arquivar';actions.append(edit,archive);row.append(info,dueLabel,actions);list.append(row)}
}

function renderSavedNotebooks() {
  const host=$('#saved-notebooks-list'),items=state.personalData?.cadernos||[]
  host.replaceChildren();$('#saved-notebooks-empty').hidden=items.length>0
  for(const notebook of [...items].sort((a,b)=>String(a.nome).localeCompare(String(b.nome),'pt-BR'))){
    const row=document.createElement('article');row.className='saved-notebook-row';const details=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('span')
    title.textContent=notebook.nome;meta.textContent=`${(notebook.questoes||[]).length.toLocaleString('pt-BR')} questões${notebook.pasta?` · ${notebook.pasta}`:''}`;details.append(title,meta)
    const actions=document.createElement('div');actions.className='saved-notebook-actions';const open=document.createElement('a');open.href=`${softwareOrigin}/estudar.html?aba=questoes&caderno=${encodeURIComponent(notebook.id)}`;open.textContent='Estudar';const rename=document.createElement('button');rename.type='button';rename.dataset.action='rename';rename.dataset.notebookId=notebook.id;rename.textContent='Renomear';const remove=document.createElement('button');remove.type='button';remove.dataset.action='delete';remove.dataset.notebookId=notebook.id;remove.textContent='Excluir';actions.append(open,rename,remove);row.append(details,actions);host.append(row)
  }
}

const reviewMaterialType = 'material_revisao'
const reviewMaterials = () => state.progressData.tarefas.filter(item => item?.tipo === reviewMaterialType)
const isMaterialDue = material => !material.proximaRevisao || !Number.isFinite(Date.parse(material.proximaRevisao)) || Date.parse(material.proximaRevisao) <= Date.now()

function parseMaterialOutline(text='') {
  const roots=[],stack=[],lines=String(text).split('\n').filter(line=>line.trim())
  if(lines.length>100)throw new Error('O mapa pode ter até 100 tópicos.')
  for(const [index,line] of lines.entries()){
    const spaces=line.match(/^\s*/)[0].replace(/\t/g,'  ').length,level=Math.floor(spaces/2)
    if(level>4)throw new Error('O mapa pode ter até cinco níveis de tópicos.')
    const node={id:String(index),title:line.trim().replace(/^(?:[-*•]|\d+[.)])\s+/,''),children:[]}
    while(stack.length&&stack.at(-1).level>=level)stack.pop()
    if(stack.length)stack.at(-1).node.children.push(node);else roots.push(node)
    stack.push({level,node})
  }
  return roots
}

function drawMaterialMap(host,material) {
  host.replaceChildren()
  let roots
  try{roots=parseMaterialOutline(material.roteiro||'')}catch(error){const warning=document.createElement('p');warning.className='fine-print';warning.textContent=error.message;host.append(warning);return}
  if(!roots.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='Ainda não há tópicos no mapa deste material.';host.append(empty);return}
  const center=document.createElement('div');center.className='material-map-center';center.textContent=material.titulo||'Tema central'
  const list=document.createElement('ul');list.className='material-map-roots'
  const appendNode=(parent,node,level=0)=>{const item=document.createElement('li'),label=document.createElement('div');label.className=`material-map-node${level===0?' is-root':''}`;label.textContent=node.title;item.append(label);if(node.children.length){const children=document.createElement('ul');children.className='material-map-children';for(const child of node.children)appendNode(children,child,level+1);item.append(children)}parent.append(item)}
  for(const root of roots)appendNode(list,root)
  host.append(center,list)
}

function renderMaterialDetail() {
  const section=$('#material-detail'),material=reviewMaterials().find(item=>String(item.id)===String(state.selectedMaterialId))
  section.hidden=!material
  if(!material)return
  $('#material-detail-title').textContent=material.titulo||'Material de revisão'
  $('#material-detail-meta').textContent=[material.materiaNome||material.materia,material.conteudoNome||material.conteudo,isMaterialDue(material)?'Revisão pendente':`Rever em ${dateLabel(localDateKey(material.proximaRevisao))}`].filter(Boolean).join(' · ')
  const practice=new URL('/estudar.html',softwareOrigin);practice.searchParams.set('aba','questoes');if(material.materia)practice.searchParams.set('materia',material.materia);if(material.conteudo)practice.searchParams.set('conteudo',material.conteudo);$('#material-practice').href=practice.href
  const content=$('#material-study-content');content.replaceChildren()
  if(state.materialMemoryHidden){const recall=document.createElement('div');recall.className='material-recall';const title=document.createElement('strong');title.textContent='Sem consultar, tente explicar:';const questions=document.createElement('ul');for(const text of ['Quais são as ideias centrais deste conteúdo?','Como elas se relacionam?','Que exemplo ou erro de prova você consegue lembrar?']){const item=document.createElement('li');item.textContent=text;questions.append(item)}recall.append(title,questions);content.append(recall)}
  else{
    if(state.materialMode!=='mapa'){const summary=document.createElement('article');summary.className='material-summary';const title=document.createElement('h5');title.textContent='Resumo';const text=document.createElement('p');text.textContent=material.resumo||'Este material contém apenas mapa mental.';summary.append(title,text);content.append(summary)}
    if(state.materialMode!=='resumo'){const map=document.createElement('article');map.className='material-map';const title=document.createElement('h5');title.textContent='Mapa mental';const body=document.createElement('div');drawMaterialMap(body,material);map.append(title,body);content.append(map)}
  }
  $('#material-memory').textContent=state.materialMemoryHidden?'Revelar material':'Testar minha memória';$('#material-memory').setAttribute('aria-pressed',String(state.materialMemoryHidden))
  for(const button of document.querySelectorAll('[data-material-mode]')){const active=button.dataset.materialMode===state.materialMode;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active))}
}

function renderReviewMaterials() {
  const materials=reviewMaterials(),due=materials.filter(isMaterialDue),query=$('#material-search').value.trim().toLocaleLowerCase('pt-BR'),onlyDue=$('#material-due-only').checked
  $('#material-count').textContent=materials.length.toLocaleString('pt-BR');$('#material-due-count').textContent=due.length.toLocaleString('pt-BR')
  const visible=materials.filter(item=>(!onlyDue||isMaterialDue(item))&&`${item.titulo||''} ${item.materiaNome||item.materia||''} ${item.conteudoNome||item.conteudo||''} ${item.resumo||''}`.toLocaleLowerCase('pt-BR').includes(query)).sort((a,b)=>(isMaterialDue(a)?0:1)-(isMaterialDue(b)?0:1)||String(b.atualizadoEm||b.updated_at||'').localeCompare(String(a.atualizadoEm||a.updated_at||'')))
  const host=$('#material-list');host.replaceChildren();$('#materials-empty').hidden=visible.length>0
  for(const material of visible){const card=document.createElement('article');card.className=`material-row${String(material.id)===String(state.selectedMaterialId)?' is-selected':''}`;const choose=document.createElement('button');choose.type='button';choose.className='material-row-select';choose.dataset.action='select-material';choose.dataset.materialId=material.id;const title=document.createElement('strong');title.textContent=material.titulo||'Material de revisão';const meta=document.createElement('span');meta.textContent=[material.materiaNome||material.materia,material.conteudoNome||material.conteudo].filter(Boolean).join(' · ')||'Matéria não informada';const dueLabel=document.createElement('small');dueLabel.textContent=isMaterialDue(material)?'Pronto para revisar':`Rever em ${dateLabel(localDateKey(material.proximaRevisao))}`;choose.append(title,meta,dueLabel);const actions=document.createElement('div');actions.className='material-row-actions';for(const [action,label] of [['edit-material','Editar'],['delete-material','Excluir']]){const button=document.createElement('button');button.type='button';button.className='sort-button';button.dataset.action=action;button.dataset.materialId=material.id;button.textContent=label;actions.append(button)}card.append(choose,actions);host.append(card)}
  renderMaterialDetail()
}

function startMaterialEditor(material=null) {
  state.editingMaterialId=material?.id||null
  $('#material-editor-title').textContent=material?'Editar material':'Novo resumo e mapa mental'
  $('#material-title').value=material?.titulo||'';$('#material-subject').value=material?.materiaNome||material?.materia||'';$('#material-topic').value=material?.conteudoNome||material?.conteudo||'';$('#material-summary').value=material?.resumo||'';$('#material-outline').value=material?.roteiro||'';$('#material-form-status').textContent=''
  drawMaterialMap($('#material-map-preview'),{titulo:material?.titulo||'',roteiro:material?.roteiro||''})
  $('#material-detail').hidden=true;$('#material-editor').hidden=false;$('#material-editor').scrollIntoView({behavior:'smooth',block:'start'});$('#material-title').focus()
}

function outlineFromSummary(summary) {
  return String(summary).split(/\n\s*\n/).map(part=>part.trim()).filter(Boolean).map(part=>{const lines=part.split('\n').map(line=>line.trim()).filter(Boolean);if(lines.length>1)return [lines[0],...lines.slice(1).map(line=>'  '+line)].join('\n');const sentences=part.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý])/u);return [sentences[0],...sentences.slice(1).map(sentence=>'  '+sentence)].join('\n')}).join('\n')
}

function exportReviewMaterial(material) {
  const text=`${material.titulo}\n${material.materiaNome||material.materia}${material.conteudoNome?` · ${material.conteudoNome}`:''}\n\nRESUMO\n${material.resumo||''}\n\nMAPA · tópicos e subtópicos\n${material.roteiro||''}\n`
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='revisao.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}

function mondayOfWeek(offset=0) {
  const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()-((date.getDay()+6)%7)+offset*7);return date
}
function renderStudyPlan() {
  const start=mondayOfWeek(state.weekOffset),end=new Date(start);end.setDate(start.getDate()+6)
  $('#plan-week-label').textContent=`${start.toLocaleDateString('pt-BR',{day:'numeric',month:'short'})} – ${end.toLocaleDateString('pt-BR',{day:'numeric',month:'short'})}`
  const tasks=state.progressData.tarefas.filter(item=>item&&item.id!=='config-cronograma-semanal-v1'&&item.tipo!=='flashcard_aprovado'&&item.tipo!=='nota_erro_aprovado'&&item.tipo!=='material_revisao')
    .map(item=>{let date=String(item.data||item.dataAgendada||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){const weekday=['segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado','domingo'].indexOf(String(item.dia||'').toLocaleLowerCase('pt-BR'));if(weekday>=0){const fallback=new Date(start);fallback.setDate(start.getDate()+weekday);date=localDateKey(fallback)}}return {...item,_date:/^\d{4}-\d{2}-\d{2}$/.test(date)?date:''}})
    .filter(item=>item._date>=localDateKey(start)&&item._date<=localDateKey(end))
    .sort((a,b)=>a._date.localeCompare(b._date)||String(a.horario||'').localeCompare(String(b.horario||'')))
  const host=$('#plan-task-list');host.replaceChildren();$('#plan-task-empty').hidden=tasks.length>0
  let lastDate=''
  for(const task of tasks){
    if(task._date!==lastDate){lastDate=task._date;const heading=document.createElement('h4');heading.className='plan-task-date-title';const day=new Date(`${lastDate}T12:00:00`);heading.textContent=day.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});host.append(heading)}
    const row=document.createElement('article');row.className=`plan-task-row${task.concluida?' is-done':''}`;const check=document.createElement('input');check.type='checkbox';check.checked=Boolean(task.concluida);check.setAttribute('aria-label',`Marcar ${task.materia||'sessão'} como concluída`);check.dataset.action='toggle';check.dataset.taskId=task.id
    const details=document.createElement('div');details.className='plan-task-detail';const title=document.createElement('strong');title.textContent=task.materia||'Estudo';const meta=document.createElement('span');meta.textContent=`${task.horario||'Horário livre'} · ${task.atividade||task.conteudo||'Estudo dirigido'} · ${formatShortDuration((Number(task.minutos)||0)*60)}`;details.append(title,meta)
    const actions=document.createElement('div');actions.className='plan-task-actions';const startButton=document.createElement('button');startButton.type='button';startButton.dataset.action='timer';startButton.dataset.taskId=task.id;startButton.textContent='Iniciar estudo';const remove=document.createElement('button');remove.type='button';remove.dataset.action='delete';remove.dataset.taskId=task.id;remove.textContent='Excluir';actions.append(startButton,remove);row.append(check,details,actions);host.append(row)
  }
}

async function updatePersonalData(transform) {
  const userId=state.session?.user?.id;if(!userId||!supabase)throw new Error('Entre novamente para sincronizar seus cadernos.')
  for(let attempt=0;attempt<6;attempt++){
    const {data:current,error}=await supabase.from('estudo_pessoal_usuario').select('dados,updated_at').eq('user_id',userId).abortSignal(AbortSignal.timeout(20000)).maybeSingle();if(error)throw error
    const before=current?.dados&&typeof current.dados==='object'?current.dados:{},next=transform({...before}),updated_at=new Date(Math.max(Date.now(),(Date.parse(current?.updated_at||'')||0)+1)).toISOString();let result
    if(current){result=await supabase.from('estudo_pessoal_usuario').update({dados:next,updated_at}).eq('user_id',userId).eq('updated_at',current.updated_at).select('updated_at').maybeSingle();if(result.error)throw result.error;if(!result.data)continue}
    else{result=await supabase.from('estudo_pessoal_usuario').insert({user_id:userId,dados:next,updated_at}).select('updated_at').maybeSingle();if(result.error?.code==='23505')continue;if(result.error)throw result.error}
    state.personalData=next;renderSavedNotebooks();return next
  }
  throw new Error('Os cadernos mudaram em outro dispositivo. Tente novamente.')
}

async function updateProgressArray(field,transform) {
  const userId=state.session?.user?.id;if(!userId||!supabase)throw new Error('Entre novamente para sincronizar seu estudo.')
  for(let attempt=0;attempt<6;attempt++){
    const {data:current,error}=await supabase.from('progresso_usuario').select('horas_estudo,historico_respostas,tarefas,updated_at').eq('user_id',userId).abortSignal(AbortSignal.timeout(20000)).maybeSingle();if(error)throw error
    const before=Array.isArray(current?.[field])?current[field]:[],next=transform([...before]);if(!Array.isArray(next))throw new Error('A alteração não pôde ser preparada.')
    const updated_at=new Date(Math.max(Date.now(),(Date.parse(current?.updated_at||'')||0)+1)).toISOString()
    let result
    if(current){result=await supabase.from('progresso_usuario').update({[field]:next,updated_at}).eq('user_id',userId).eq('updated_at',current.updated_at).select('updated_at').maybeSingle();if(result.error)throw result.error;if(!result.data)continue}
    else {result=await supabase.from('progresso_usuario').insert({user_id:userId,horas_estudo:field==='horas_estudo'?next:[],historico_respostas:[],tarefas:field==='tarefas'?next:[],updated_at}).select('updated_at').maybeSingle();if(result.error?.code==='23505')continue;if(result.error)throw result.error}
    state.progressData[field]=next;state.progressData.updated_at=result.data?.updated_at||updated_at;renderLearningInsights();renderStudyCalendar();renderErrorNotebook();renderFlashcardHub();renderReviewMaterials();renderStudyPlan();return
  }
  throw new Error('Seu progresso mudou em outro dispositivo. Atualize e tente novamente.')
}

async function loadStudent() {
  const userId = state.session.user.id
  $('#auth-card').hidden = true
  $('#student-card').hidden = false
  $('#account-email').textContent = state.session.user.email || ''
  $('#retry-account-load').hidden = true
  setMessage('#account-message', '')
  restoreTimer()
  void loadStudentProgress()
  void loadAdminPanel()
  if (state.session?.user?.id !== userId) return
}

async function loadAdminPanel() {
  const userId = state.session?.user?.id
  $('#admin-card').hidden = true
  try {
    await refreshReceipts()
    if (!userId || state.session?.user?.id !== userId) return
    state.isAdmin = true
    $('#tab-receipts').hidden = false
    selecionarAbaAluno(abaInicialDoEndereco(), false)
    await refreshMerchantStatus()
  } catch {
    // The API returns no receipt data unless it validates the administrator on the server.
  }
}

async function refreshMerchantStatus() {
  const userId = state.session?.user?.id
  const status = await api('/api/acesso/admin/mercado-pago/status')
  if (!userId || state.session?.user?.id !== userId) return
  $('#merchant-status').textContent = status.conectado
    ? `Mercado Pago conectado · vendedor ${status.vendedorId}`
    : 'Conecte sua conta do Mercado Pago para receber as mensalidades.'
  $('#connect-merchant').textContent = status.conectado ? 'Reconectar conta' : 'Conectar Mercado Pago'
}

function sessionTimerSeconds(timer=state.timer) {
  if(!timer)return 0
  return Math.max(0,Number(timer.elapsedSeconds)||0)+(timer.startedAt?Math.max(0,Math.floor((Date.now()-timer.startedAt)/1000)):0)
}
function saveTimerState() {
  try {const key=`ap-aprovado:portal-timer:${state.session?.user?.id}`;if(state.timer)localStorage.setItem(key,JSON.stringify(state.timer));else localStorage.removeItem(key)} catch { /* O cronômetro continua ativo nesta aba. */ }
}
function updateTimerDisplay() {
  const total=sessionTimerSeconds(),hours=Math.floor(total/3600),minutes=Math.floor(total%3600/60),seconds=total%60
  $('#study-timer').textContent=`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`
  const active=Boolean(state.timer);$('#timer-start').hidden=active;$('#timer-pause').hidden=!active;$('#timer-finish').hidden=!active
  $('#timer-pause').textContent=state.timer?.startedAt?'Pausar':'Retomar'
  $('#timer-subject').disabled=active;$('#timer-topic').disabled=active
  if(active){$('#timer-subject').value=state.timer.subject||'';$('#timer-topic').value=state.timer.topic||''}
}
function restoreTimer() {
  try {const saved=JSON.parse(localStorage.getItem(`ap-aprovado:portal-timer:${state.session?.user?.id}`));state.timer=saved&&typeof saved.subject==='string'?saved:null} catch {state.timer=null}
  updateTimerDisplay()
}
async function saveFlashcard(card, removeId=null) {
  await updateProgressArray('tarefas',items=>{const byId=new Map(items.map(item=>[String(item.id),item]));if(removeId)byId.delete(removeId);if(card)byId.set(String(card.id),card);return [...byId.values()]})
}
function resetFlashcardForm() {
  state.editingCardId=null;$('#flashcard-form').reset();$('#card-form-status').textContent='';$('#flashcard-form button[type="submit"]').textContent='Salvar flashcard'
}
function nextReviewDate(rating,card) {
  const now=new Date(),last=Math.max(0,Number(card.intervaloDias)||0),ease=Math.max(1.3,Number(card.fatorFacilidade)||2.5),reps=Math.max(0,Number(card.repeticoes)||0)
  let days=0
  if(rating==='again')now.setMinutes(now.getMinutes()+10)
  else if(rating==='hard'){days=Math.max(1,Math.round(last?last*1.2:1));now.setDate(now.getDate()+days)}
  else if(rating==='good'){days=last?Math.max(3,Math.round(last*ease)):reps===0?3:3;now.setDate(now.getDate()+days)}
  else {days=last?Math.max(7,Math.round(last*(ease+0.5))):7;now.setDate(now.getDate()+days)}
  return {date:now.toISOString(),days}
}

async function refreshReceipts() {
  const userId = state.session?.user?.id
  const data = await api('/api/acesso/admin/recebimentos')
  if (!userId || state.session?.user?.id !== userId) return
  $('#month-total').textContent = currency(data.saldoMesAntesTaxas)
  $('#month-count').textContent = Number(data.pagamentosAprovadosMes || 0).toLocaleString('pt-BR')
  const rows = $('#receipt-rows')
  rows.replaceChildren()
  for (const receipt of data.recebimentos || []) {
    const row = document.createElement('tr')
    const cells = [date(receipt.recebidoEm), receipt.email, `${planLabel(receipt.plano)} · ${cycleLabel(receipt.ciclo)}`, currency(receipt.valor), receipt.status === 'approved' ? 'Aprovado' : receipt.status === 'refunded' ? 'Estornado' : 'Contestado', receipt.referencia]
    for (const value of cells) {
      const cell = document.createElement('td')
      cell.textContent = value || '—'
      row.append(cell)
    }
    rows.append(row)
  }
  if (!rows.children.length) {
    const row = document.createElement('tr')
    const cell = document.createElement('td')
    cell.colSpan = 6
    cell.className = 'empty-row'
    cell.textContent = 'Nenhum pagamento confirmado chegou pelo webhook.'
    row.append(cell)
    rows.append(row)
  }
}

async function changeSession(session) {
  const previousUserId = state.session?.user?.id
  state.session = session
  if (session && previousUserId === session.user.id) return
  sessionRequests.abort()
  sessionRequests = new AbortController()
  profileDirty = false
  state.isAdmin = false
  state.progressData = {horas_estudo:[],historico_respostas:[],tarefas:[],updated_at:null}
  state.evolutionData = {simulados:[],redacoes:[]}
  state.personalData = {cadernos:[]}
  state.timer = null
  updateTimerDisplay()
  $('#tab-receipts').hidden = true
  $('#ranking-nickname').value = ''
  $('#ranking-public').checked = false
  renderRanking([])
  for (const selector of ['#progress-questions', '#progress-correct', '#progress-wrong', '#progress-hours']) $(selector).textContent = '—'
  $('#progress-accuracy').textContent = 'Aproveitamento: —'
  $('#receipt-rows').replaceChildren()
  $('#month-total').textContent = '—'
  $('#month-count').textContent = '—'
  $('#saved-notebooks-list').replaceChildren()
  $('#plan-task-list').replaceChildren()
  if (!session) {
    $('#auth-card').hidden = false
    $('#student-card').hidden = true
    $('#admin-card').hidden = true
    renderMode()
    return
  }
  await loadStudent()
  selecionarAbaAluno(abaInicialDoEndereco(), false)
}

document.querySelectorAll('.student-tab').forEach(button => {
  button.addEventListener('click', () => selecionarAbaAluno(button.dataset.panel))
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const available = [...document.querySelectorAll('.student-tab')].filter(tab => !tab.hidden)
    const current = available.indexOf(button)
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? available.length - 1
        : (current + (event.key === 'ArrowRight' ? 1 : -1) + available.length) % available.length
    available[next]?.focus()
    if (available[next]) selecionarAbaAluno(available[next].dataset.panel)
  })
})

$('#retry-account-load').addEventListener('click', async () => {
  const button = $('#retry-account-load')
  button.disabled = true
  button.textContent = 'Carregando…'
  try { await loadStudent() } finally {
    button.disabled = false
    button.textContent = 'Tentar carregar novamente'
  }
})

document.querySelectorAll('.auth-tab').forEach(button => button.addEventListener('click', () => {
  state.mode = button.dataset.mode
  setMessage('#auth-message', '')
  renderMode()
}))

$('#auth-form').addEventListener('submit', async event => {
  event.preventDefault()
  if (!supabase) return setMessage('#auth-message', 'O cadastro está aguardando a configuração do serviço de autenticação.', 'error')
  const email = $('#email').value.trim()
  const password = $('#password').value
  const submit = $('#auth-submit')
  submit.disabled = true
  setMessage('#auth-message', '')
  try {
    if (state.mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: confirmationRedirect } })
      if (error) throw error
      if (data.session) await changeSession(data.session)
      else setMessage('#auth-message', 'Se o cadastro estiver pendente, você receberá a confirmação por e-mail. Clique no link da mensagem mais recente. Se já confirmou, use a aba Entrar.')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      await changeSession(data.session)
    }
  } catch (error) {
    setMessage('#auth-message', authErrorMessage(error), 'error')
  } finally {
    submit.disabled = false
    $('#password').value = ''
  }
})

$('#resend-confirmation').addEventListener('click', async () => {
  if (!supabase || Date.now() < resendAvailableAt) return
  const emailField = $('#email')
  emailField.value = emailField.value.trim()
  if (!emailField.reportValidity()) { emailField.focus(); return }
  const button = $('#resend-confirmation')
  button.disabled = true
  setMessage('#resend-message', 'Solicitando um novo link…')
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup', email: emailField.value,
      options: { emailRedirectTo: confirmationRedirect },
    })
    if (error) throw error
    setMessage('#resend-message', 'Se houver um cadastro pendente para este e-mail, um novo link será enviado. Confira também o spam e use apenas a mensagem mais recente. Se sua conta já estiver confirmada, entre com sua senha.')
    resendAvailableAt = Date.now() + 60000
  } catch (error) {
    setMessage('#resend-message', authErrorMessage(error), 'error')
    if (error.status === 429) resendAvailableAt = Date.now() + 60000
  } finally {
    const wait = Math.max(0, resendAvailableAt - Date.now())
    if (wait) {
      button.textContent = 'Aguarde 1 minuto para reenviar'
      setTimeout(() => {
        button.disabled = false
        button.textContent = 'Reenviar confirmação'
      }, wait)
    } else button.disabled = false
  }
})

$('#connect-merchant').addEventListener('click', async () => {
  const button = $('#connect-merchant')
  button.disabled = true
  try {
    const result = await api('/api/acesso/admin/mercado-pago/conectar', { method: 'POST' })
    const url = new URL(result.url)
    if (url.hostname !== 'auth.mercadopago.com') throw new Error('O destino de autorização não foi validado.')
    location.assign(url.href)
  } catch (error) {
    setMessage('#admin-message', error.message, 'error')
    button.disabled = false
  }
})

$('#refresh-admin').addEventListener('click', async () => {
  try {
    await refreshReceipts()
    await refreshMerchantStatus()
    setMessage('#admin-message', 'Recebimentos atualizados.')
  } catch (error) { setMessage('#admin-message', error.message, 'error') }
})

$('#refresh-progress').addEventListener('click', () => loadStudentProgress())
document.querySelectorAll('.period-switch [data-range]').forEach(button=>button.addEventListener('click',()=>{state.rangeDays=Number(button.dataset.range);document.querySelectorAll('.period-switch [data-range]').forEach(item=>{const selected=item===button;item.classList.toggle('is-active',selected);item.setAttribute('aria-pressed',String(selected))});renderLearningInsights()}))
$('#evolution-range').addEventListener('change',renderEvolution)
$('#calendar-prev').addEventListener('click',()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()-1,1);renderStudyCalendar()})
$('#calendar-next').addEventListener('click',()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()+1,1);renderStudyCalendar()})
$('#timer-start').addEventListener('click',()=>{
  const subject=$('#timer-subject').value.trim();if(!subject){$('#timer-status').textContent='Informe a matéria antes de iniciar.';$('#timer-subject').focus();return}
  state.timer=state.timer?{...state.timer,subject,topic:$('#timer-topic').value.trim(),startedAt:Date.now()}:{id:crypto.randomUUID(),subject,topic:$('#timer-topic').value.trim(),elapsedSeconds:0,startedAt:Date.now()};saveTimerState();updateTimerDisplay();$('#timer-status').textContent='Sessão iniciada. Pause nos intervalos para registrar apenas o estudo ativo.'
})
$('#timer-pause').addEventListener('click',()=>{
  if(!state.timer)return
  state.timer=state.timer.startedAt?{...state.timer,elapsedSeconds:sessionTimerSeconds(),startedAt:null}:{...state.timer,startedAt:Date.now()};saveTimerState();updateTimerDisplay();$('#timer-status').textContent=state.timer.startedAt?'Sessão retomada.':'Sessão pausada; o tempo acumulado está guardado neste dispositivo.'
})
$('#timer-finish').addEventListener('click',async()=>{
  if(!state.timer)return
  const button=$('#timer-finish'),timer={...state.timer},seconds=sessionTimerSeconds(timer);if(seconds<10){$('#timer-status').textContent='Registre pelo menos 10 segundos de estudo focado.';return}
  button.disabled=true;button.textContent='Sincronizando…';$('#timer-status').textContent='Salvando a sessão na sua conta…'
  try{const now=new Date().toISOString();await updateProgressArray('horas_estudo',items=>[{id:timer.id,materia:timer.subject,conteudo:timer.topic,segundos:seconds,horas:seconds/3600,data:localDateKey(now),criado_em:now,origem:'portal_timer'},...items]);if(state.timer?.id===timer.id){state.timer=null;saveTimerState();updateTimerDisplay()}$('#timer-status').textContent=`${formatShortDuration(seconds)} em ${timer.subject} sincronizados com seu progresso.`}
  catch(error){$('#timer-status').textContent=`A sessão continua salva neste navegador. ${error.message}`}
  finally{button.disabled=false;button.textContent='Encerrar e sincronizar'}
})
$('#manual-date').value=localDateKey(new Date())
$('#plan-task-date').value=localDateKey(new Date())
$('#saved-notebook-form').addEventListener('submit',async event=>{
  event.preventDefault();const name=$('#saved-notebook-name').value.trim();if(!name)return
  const button=event.currentTarget.querySelector('button[type="submit"]');button.disabled=true;$('#saved-notebooks-status').textContent='Salvando caderno…'
  try{const id=crypto.randomUUID(),now=new Date().toISOString();await updatePersonalData(data=>({...data,cadernos:[...(Array.isArray(data.cadernos)?data.cadernos:[]),{id,nome:name,pasta:'',questoes:[],criadoEm:now,modificadoEm:now}],removidos:{...(data.removidos||{}),cadernos:(data.removidos?.cadernos||[]).filter(value=>value!==id)}}));event.currentTarget.reset();$('#saved-notebooks-status').textContent='Caderno criado e sincronizado com sua conta.'}
  catch(error){$('#saved-notebooks-status').textContent=`Não foi possível salvar o caderno. ${error.message}`}
  finally{button.disabled=false}
})
$('#saved-notebooks-list').addEventListener('click',async event=>{
  const button=event.target.closest('button[data-action]');if(!button)return
  const id=button.dataset.notebookId,notebook=state.personalData.cadernos.find(item=>String(item.id)===String(id));if(!notebook)return
  if(button.dataset.action==='rename'){
    const name=window.prompt('Novo nome para o caderno:',notebook.nome)?.trim();if(!name||name===notebook.nome)return
    button.disabled=true;try{await updatePersonalData(data=>({...data,cadernos:data.cadernos.map(item=>String(item.id)===String(id)?{...item,nome,modificadoEm:new Date().toISOString()}:item)}));$('#saved-notebooks-status').textContent='Nome atualizado.'}catch(error){$('#saved-notebooks-status').textContent=`Não foi possível atualizar. ${error.message}`}finally{button.disabled=false}
  }else if(button.dataset.action==='delete'&&window.confirm(`Excluir o caderno “${notebook.nome}”? As questões não serão apagadas do acervo.`)){
    button.disabled=true;try{await updatePersonalData(data=>({...data,cadernos:data.cadernos.filter(item=>String(item.id)!==String(id)),removidos:{...(data.removidos||{}),cadernos:[...new Set([...(data.removidos?.cadernos||[]),String(id)])]}}));$('#saved-notebooks-status').textContent='Caderno excluído. As questões do acervo foram preservadas.'}catch(error){$('#saved-notebooks-status').textContent=`Não foi possível excluir. ${error.message}`}finally{button.disabled=false}
  }
})
$('#new-material').addEventListener('click',()=>startMaterialEditor())
$('#material-cancel').addEventListener('click',()=>{$('#material-editor').hidden=true;state.editingMaterialId=null;$('#material-form-status').textContent='';renderReviewMaterials()})
$('#material-outline').addEventListener('input',()=>drawMaterialMap($('#material-map-preview'),{titulo:$('#material-title').value,roteiro:$('#material-outline').value}))
$('#material-title').addEventListener('input',()=>drawMaterialMap($('#material-map-preview'),{titulo:$('#material-title').value,roteiro:$('#material-outline').value}))
$('#material-generate-map').addEventListener('click',()=>{
  const outline=outlineFromSummary($('#material-summary').value)
  if(!outline){$('#material-form-status').textContent='Escreva um resumo antes de organizar o mapa.';return}
  try{parseMaterialOutline(outline);$('#material-outline').value=outline;drawMaterialMap($('#material-map-preview'),{titulo:$('#material-title').value,roteiro:outline});$('#material-form-status').textContent='Mapa organizado a partir do seu texto. Confira os tópicos antes de salvar.'}
  catch(error){$('#material-form-status').textContent=error.message}
})
$('#material-editor').addEventListener('submit',async event=>{
  event.preventDefault()
  const title=$('#material-title').value.trim(),subject=$('#material-subject').value.trim(),topic=$('#material-topic').value.trim(),summary=$('#material-summary').value.trim(),outline=$('#material-outline').value.trim()
  if(!title||title.length>160||!subject||(!summary&&!outline)){ $('#material-form-status').textContent='Informe título, matéria e um resumo ou mapa.';return }
  if(summary.length>12000||outline.length>16000){$('#material-form-status').textContent='O resumo aceita até 12.000 caracteres e o mapa até 16.000.';return}
  try{parseMaterialOutline(outline)}catch(error){$('#material-form-status').textContent=error.message;return}
  const previous=reviewMaterials().find(item=>String(item.id)===String(state.editingMaterialId)),now=new Date().toISOString(),previousSubject=previous?.materiaNome||previous?.materia,previousTopic=previous?.conteudoNome||previous?.conteudo,subjectValue=previous&&subject===previousSubject?previous.materia:subject,topicValue=previous&&topic===previousTopic?previous.conteudo:topic,material={...previous,id:previous?.id||`revisao:${crypto.randomUUID()}`,tipo:reviewMaterialType,titulo:title,materia:subjectValue,materiaNome:subject,conteudo:topicValue,conteudoNome:topic,resumo:summary,roteiro:outline,criado_em:previous?.criado_em||now,atualizadoEm:now,updated_at:now,proximaRevisao:previous?.proximaRevisao||now,revisoesFeitas:Number(previous?.revisoesFeitas)||0,revisoes:Array.isArray(previous?.revisoes)?previous.revisoes:[]}
  const button=event.currentTarget.querySelector('button[type="submit"]');button.disabled=true;$('#material-form-status').textContent='Salvando material na sua conta…'
  try{await updateProgressArray('tarefas',items=>[...items.filter(item=>String(item.id)!==String(material.id)),material]);state.selectedMaterialId=material.id;state.materialMemoryHidden=false;$('#material-editor').hidden=true;state.editingMaterialId=null;$('#material-status').textContent='Resumo e mapa sincronizados com sua conta.';renderReviewMaterials()}
  catch(error){$('#material-form-status').textContent=`Não foi possível sincronizar o material. ${error.message}`}
  finally{button.disabled=false}
})
$('#material-list').addEventListener('click',async event=>{
  const button=event.target.closest('button[data-action]');if(!button)return
  const material=reviewMaterials().find(item=>String(item.id)===String(button.dataset.materialId));if(!material)return
  if(button.dataset.action==='select-material'){state.selectedMaterialId=material.id;state.materialMemoryHidden=false;$('#material-detail-status').textContent='';renderReviewMaterials();return}
  if(button.dataset.action==='edit-material'){startMaterialEditor(material);return}
  if(button.dataset.action==='delete-material'&&window.confirm(`Excluir o material “${material.titulo}” da sua conta?`)){
    button.disabled=true;try{await updateProgressArray('tarefas',items=>items.filter(item=>String(item.id)!==String(material.id)));if(String(state.selectedMaterialId)===String(material.id))state.selectedMaterialId=null;$('#material-status').textContent='Material removido da sua conta.';renderReviewMaterials()}
    catch(error){button.disabled=false;$('#material-status').textContent=`Não foi possível excluir o material. ${error.message}`}
  }
})
$('#material-search').addEventListener('input',renderReviewMaterials)
$('#material-due-only').addEventListener('change',renderReviewMaterials)
$('#material-edit').addEventListener('click',()=>{const material=reviewMaterials().find(item=>String(item.id)===String(state.selectedMaterialId));if(material)startMaterialEditor(material)})
$('#material-export').addEventListener('click',()=>{const material=reviewMaterials().find(item=>String(item.id)===String(state.selectedMaterialId));if(material)exportReviewMaterial(material)})
$('#material-memory').addEventListener('click',()=>{state.materialMemoryHidden=!state.materialMemoryHidden;renderMaterialDetail()})
$('#material-detail').addEventListener('click',async event=>{
  const mode=event.target.closest('button[data-material-mode]');if(mode){state.materialMode=mode.dataset.materialMode;state.materialMemoryHidden=false;renderMaterialDetail();return}
  const button=event.target.closest('button[data-material-days]');if(!button)return
  const material=reviewMaterials().find(item=>String(item.id)===String(state.selectedMaterialId));if(!material)return
  const days=Number(button.dataset.materialDays),now=new Date(),next=new Date(now);next.setDate(next.getDate()+days)
  const updated={...material,revisoesFeitas:(Number(material.revisoesFeitas)||0)+1,ultimaRevisao:now.toISOString(),proximaRevisao:next.toISOString(),revisoes:[...(Array.isArray(material.revisoes)?material.revisoes:[]),{data:now.toISOString(),dias:days}].slice(-20),atualizadoEm:now.toISOString(),updated_at:now.toISOString()}
  button.disabled=true;$('#material-detail-status').textContent='Salvando revisão…'
  try{await updateProgressArray('tarefas',items=>[...items.filter(item=>String(item.id)!==String(updated.id)),updated]);state.materialMemoryHidden=false;$('#material-detail-status').textContent=`Revisão registrada. Próxima revisão em ${days} dia(s).`;renderReviewMaterials()}
  catch(error){$('#material-detail-status').textContent=`Não foi possível registrar a revisão. ${error.message}`}
  finally{button.disabled=false}
})
$('#plan-week-prev').addEventListener('click',()=>{state.weekOffset--;renderStudyPlan()})
$('#plan-week-next').addEventListener('click',()=>{state.weekOffset++;renderStudyPlan()})
$('#plan-task-form').addEventListener('submit',async event=>{
  event.preventDefault();const subject=$('#plan-task-subject').value.trim(),topic=$('#plan-task-topic').value.trim(),date=$('#plan-task-date').value,time=$('#plan-task-time').value,minutes=Number($('#plan-task-minutes').value)||60
  if(!subject||!date||!time)return
  const button=event.currentTarget.querySelector('button[type="submit"]');button.disabled=true;$('#plan-task-status').textContent='Sincronizando sua sessão planejada…'
  try{const target=new Date(`${date}T12:00:00`),day=target.toLocaleDateString('pt-BR',{weekday:'long'}),item={id:crypto.randomUUID(),tipo:'cronograma_estudo',dia:day,data:date,dataAgendada:date,materia:subject,atividade:topic,horario:time,minutos,concluida:false,criada_em:new Date().toISOString()};await updateProgressArray('tarefas',items=>[...items,item]);event.currentTarget.reset();$('#plan-task-date').value=localDateKey(new Date());$('#plan-task-time').value='19:00';$('#plan-task-minutes').value='60';$('#plan-task-status').textContent='Sessão adicionada ao seu cronograma semanal.'}
  catch(error){$('#plan-task-status').textContent=`Não foi possível salvar a sessão. ${error.message}`}
  finally{button.disabled=false}
})
$('#plan-task-list').addEventListener('change',async event=>{
  const checkbox=event.target.closest('input[data-action="toggle"]');if(!checkbox)return
  checkbox.disabled=true;try{await updateProgressArray('tarefas',items=>items.map(item=>String(item.id)===String(checkbox.dataset.taskId)?{...item,concluida:checkbox.checked,atualizado_em:new Date().toISOString()}:item));$('#plan-task-status').textContent=checkbox.checked?'Sessão marcada como concluída.':'Sessão reaberta.'}
  catch(error){checkbox.checked=!checkbox.checked;$('#plan-task-status').textContent=`Não foi possível atualizar. ${error.message}`}finally{checkbox.disabled=false}
})
$('#plan-task-list').addEventListener('click',async event=>{
  const button=event.target.closest('button[data-action]');if(!button)return
  const task=state.progressData.tarefas.find(item=>String(item.id)===String(button.dataset.taskId));if(!task)return
  if(button.dataset.action==='timer'){
    selecionarAbaAluno('performance');$('#timer-subject').value=task.materia||'';$('#timer-topic').value=task.atividade||task.conteudo||'';$('#timer-start').click();return
  }
  if(button.dataset.action==='delete'&&window.confirm(`Excluir a sessão de ${task.materia||'estudo'} do cronograma?`)){
    button.disabled=true;try{await updateProgressArray('tarefas',items=>items.filter(item=>String(item.id)!==String(task.id)));$('#plan-task-status').textContent='Sessão removida do cronograma.'}catch(error){$('#plan-task-status').textContent=`Não foi possível excluir. ${error.message}`}finally{button.disabled=false}
  }
})
$('#manual-study-form').addEventListener('submit',async event=>{
  event.preventDefault();const subject=$('#manual-subject').value.trim(),hours=Number($('#manual-hours').value)||0,minutes=Number($('#manual-minutes').value)||0,date=$('#manual-date').value,seconds=(hours*60+minutes)*60
  if(!subject||!date||seconds<=0||seconds>24*3600){$('#manual-status').textContent='Informe matéria, data e uma duração entre 1 minuto e 24 horas.';return}
  const button=event.currentTarget.querySelector('button[type="submit"]');button.disabled=true;$('#manual-status').textContent='Sincronizando registro…'
  try{const now=new Date().toISOString();await updateProgressArray('horas_estudo',items=>[{id:crypto.randomUUID(),materia:subject,conteudo:'Registro manual',segundos,horas:seconds/3600,data:date,criado_em:now,origem:'portal_manual'},...items]);event.currentTarget.reset();$('#manual-date').value=localDateKey(new Date());$('#manual-hours').value='0';$('#manual-minutes').value='30';$('#manual-status').textContent=`${formatShortDuration(seconds)} registrados e sincronizados.`}
  catch(error){$('#manual-status').textContent=`Não foi possível sincronizar. ${error.message}`}
  finally{button.disabled=false}
})
$('#error-subject-filter').addEventListener('change',renderErrorNotebook)
$('#error-list').addEventListener('click',async event=>{
  const button=event.target.closest('button[data-action]');if(!button)return
  const card=button.closest('.error-card'),id=card?.dataset.questionId;if(!id)return
  const current=state.progressData.tarefas.find(item=>item?.tipo==='nota_erro_aprovado'&&String(item.questaoId)===id)||{id:`nota-erro:${id}`,tipo:'nota_erro_aprovado',questaoId:id,materia:card.querySelector('.subject-chip')?.textContent||'',criado_em:new Date().toISOString()}
  const next={...current,nota:card.querySelector('.error-note-input').value.trim(),dominado:button.dataset.action==='toggle-mastered'?!current.dominado:current.dominado,updated_at:new Date().toISOString()}
  button.disabled=true;button.textContent='Salvando…'
  try{await updateProgressArray('tarefas',items=>[...items.filter(item=>String(item.id)!==String(next.id)),next]);$('#account-message').textContent='Aprendizado salvo no caderno de erros sincronizado.';$('#account-message').hidden=false}
  catch(error){button.disabled=false;button.textContent='Tentar salvar';$('#account-message').textContent=`Não foi possível sincronizar esta anotação. ${error.message}`;$('#account-message').hidden=false}
})
$('#flashcard-form').addEventListener('submit',async event=>{
  event.preventDefault();const id=state.editingCardId||`flashcard:${crypto.randomUUID()}`,previous=state.progressData.tarefas.find(item=>String(item.id)===id),card={...previous,id,tipo:'flashcard_aprovado',materia:$('#card-subject').value.trim(),conteudo:$('#card-topic').value.trim(),frente:$('#card-front').value.trim(),verso:$('#card-back').value.trim(),criado_em:previous?.criado_em||new Date().toISOString(),proximaRevisao:previous?.proximaRevisao||new Date().toISOString(),intervaloDias:Number(previous?.intervaloDias)||0,fatorFacilidade:Number(previous?.fatorFacilidade)||2.5,repeticoes:Number(previous?.repeticoes)||0,suspenso:false,updated_at:new Date().toISOString()}
  const button=event.currentTarget.querySelector('button[type="submit"]');button.disabled=true;$('#card-form-status').textContent='Salvando flashcard na sua conta…'
  try{await saveFlashcard(card);resetFlashcardForm();$('#card-form-status').textContent='Flashcard salvo e sincronizado.'}
  catch(error){$('#card-form-status').textContent=`Não foi possível sincronizar o cartão. ${error.message}`}
  finally{button.disabled=false}
})
$('#flashcard-list').addEventListener('click',async event=>{
  const button=event.target.closest('button[data-action]');if(!button)return
  const card=state.progressData.tarefas.find(item=>String(item.id)===button.dataset.cardId);if(!card)return
  if(button.dataset.action==='edit'){state.editingCardId=String(card.id);$('#card-subject').value=card.materia||'';$('#card-topic').value=card.conteudo||'';$('#card-front').value=card.frente||'';$('#card-back').value=card.verso||'';$('#flashcard-form button[type="submit"]').textContent='Salvar alterações';$('#card-form-status').textContent='Editando cartão sincronizado.';$('#card-subject').focus();return}
  button.disabled=true;try{await saveFlashcard({...card,suspenso:true,updated_at:new Date().toISOString()});$('#card-form-status').textContent='Flashcard arquivado.'}catch(error){button.disabled=false;$('#card-form-status').textContent=`Não foi possível arquivar. ${error.message}`}
})
$('#card-subject-filter').addEventListener('change',renderFlashcardHub)
$('#reveal-card').addEventListener('click',()=>{$('#review-back').hidden=false;$('#review-ratings').hidden=false;$('#reveal-card').hidden=true})
$('#review-ratings').addEventListener('click',async event=>{
  const button=event.target.closest('button[data-rating]');if(!button)return
  const card=state.progressData.tarefas.find(item=>String(item.id)===String(state.reviewId));if(!card)return
  const rating=button.dataset.rating,{date,days}=nextReviewDate(rating,card),ease=Math.max(1.3,Number(card.fatorFacilidade)||2.5)+(rating==='easy'?.15:rating==='again'?-.2:rating==='hard'?-.1:0),updated={...card,intervaloDias:days,fatorFacilidade:Math.max(1.3,ease),repeticoes:rating==='again'?0:(Number(card.repeticoes)||0)+1,proximaRevisao:date,ultimaRevisao:new Date().toISOString(),ultimaAvaliacao:rating,updated_at:new Date().toISOString()}
  button.disabled=true;$('#review-status').textContent='Atualizando agenda de revisões…'
  try{await saveFlashcard(updated);state.reviewId=null;$('#review-status').textContent=`Próxima revisão ${rating==='again'?'em cerca de 10 minutos':`em ${days} dia(s)`}.`;renderFlashcardHub()}
  catch(error){$('#review-status').textContent=`Não foi possível sincronizar a revisão. ${error.message}`}
  finally{button.disabled=false}
})
$('#ranking-by-questions').addEventListener('click', () => {
  selecionarOrdenacaoRanking('questoes')
  void loadLeaderboard()
})
$('#ranking-by-time').addEventListener('click', () => {
  selecionarOrdenacaoRanking('tempo')
  void loadLeaderboard()
})
$('#ranking-form').addEventListener('submit', async event => {
  event.preventDefault()
  const userId = state.session?.user?.id
  if (!userId || !supabase) return
  const apelido = $('#ranking-nickname').value.trim().replace(/\s+/g, ' ')
  const publico = $('#ranking-public').checked
  if (publico && !/^[\p{L}\p{N} _-]{3,24}$/u.test(apelido)) {
    $('#ranking-status').textContent = 'Use um apelido de 3 a 24 caracteres, com letras, números, espaços, hífen ou sublinhado.'
    return
  }
  const button = $('#save-ranking-profile')
  button.disabled = true
  $('#ranking-status').textContent = 'Salvando sua preferência…'
  try {
    const { error } = await supabase.from('perfil_ranking_usuario').upsert({
      user_id: userId,
      apelido: apelido || 'Estudante',
      publico,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    if (error) throw error
    if (state.session?.user?.id !== userId) return
    profileDirty = false
    $('#ranking-status').textContent = publico
      ? 'Preferência salva. Seu apelido e totais de estudo podem aparecer no ranking.'
      : 'Preferência salva. Seu perfil foi retirado do ranking público.'
    await loadLeaderboard(userId)
  } catch {
    if (state.session?.user?.id === userId) {
      $('#ranking-status').textContent = 'Não foi possível salvar agora. A configuração do ranking pode ainda estar sendo publicada.'
    }
  } finally {
    button.disabled = false
  }
})
$('#ranking-form').addEventListener('input', () => { profileDirty = true })

$('#signout').addEventListener('click', () => supabase?.auth.signOut())

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.session) void loadStudentProgress({ quiet: true })
})
window.addEventListener('focus', () => {
  if (state.session) void loadStudentProgress({ quiet: true })
})
window.setInterval(() => {
  if (!document.hidden && state.session) void loadStudentProgress({ quiet: true })
}, 60000)

renderMode()
if (callbackError) {
  setMessage('#confirmation-message', callbackError === 'otp_expired'
    ? authErrorMessage({code:'otp_expired'})
    : 'Não foi possível validar o link de confirmação. Tente entrar ou solicite um novo link abaixo.', 'error')
}
if (!configOk) setMessage('#auth-message', 'Cadastro aguardando configuração do projeto de autenticação.', 'error')
if (supabase) {
  supabase.auth.getSession().then(async ({ data, error }) => {
    if (error && !callbackError) setMessage('#confirmation-message', authErrorMessage(error), 'error')
    await changeSession(data.session)
    if (isEmailCallback && data.session) {
      const { data: verified, error: verificationError } = await supabase.auth.getUser()
      if (!verificationError && verified.user?.id === state.session?.user?.id && verified.user?.email_confirmed_at) {
        setMessage('#confirmation-message', 'E-mail confirmado. Sua conta está pronta para acessar o AP Aprovado.')
      }
    }
    if (callbackError) history.replaceState(null, '', location.pathname + location.search)
  }).catch(() => {
    setMessage('#auth-message', 'Não foi possível recuperar sua sessão. Entre novamente.', 'error')
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    // Supabase callbacks must finish before making new authenticated requests.
    setTimeout(() => { void changeSession(session) }, 0)
  })
}
