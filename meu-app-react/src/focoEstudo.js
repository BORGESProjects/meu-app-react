import { chaveFiltro, normalizarMateria } from './filtros.js'
import { podeCorrigir, questaoPublicavel } from './acervo.js'

export const FOCOS_ESTUDO = [
  { id: 'concursos', nome: 'Concursos públicos', descricao: 'Bancas, cargos e matérias do seu concurso.' },
  { id: 'militares', nome: 'Concursos militares', descricao: 'ESA, EsPCEx, CPOR/NPOR e outras seleções militares.' },
  { id: 'vestibulares', nome: 'Vestibulares', descricao: 'ENEM, universidades e treino por áreas do conhecimento.' },
  { id: 'sem-preferencia', nome: 'Sem preferência de estudo', descricao: 'Explore concursos e vestibulares no mesmo espaço.' },
]
export const validarFoco = valor => FOCOS_ESTUDO.some(f => f.id === valor) ? valor : 'sem-preferencia'
export const nomeFoco = valor => FOCOS_ESTUDO.find(f => f.id === validarFoco(valor)).nome
export function categoriaQuestao(q) {
  const banca = chaveFiltro(q.banca), concurso = chaveFiltro(q.concurso || q.prova)
  if (/^(?:cpor|npor|esa|espcex|eear|eam|cfn|epcar|afa|efomm|ime|ita|colegio naval|escola naval|smv|pmpr|pmsp|pmerj)(?:\b|\/)/.test(banca) || /\b(?:cpor|npor|exercito|aeronautica|marinha|policia militar|bombeiro militar)\b/.test(concurso)) return 'militares'
  if (/^(?:enem|utfpr|fuvest|unicamp|unesp|unicentro|unioeste|univali|unifesp|acafe|udesc|upf|upe|usp|puc)/.test(banca) || /^(?:uf[a-z]{1,6}|ue[a-z]{1,5}|if[a-z]{1,5})$/.test(banca) || /vestibular|processo seletivo.*(?:graduacao|ufpr|ifpr)|\benem\b/.test(concurso)) return 'vestibulares'
  if (/^(?:pf|prf|cebraspe|cespe|fcc|fgv|vunesp|ibfc|aocp)$/.test(banca) || q.tipo_resposta === 'certo_errado' || /\b(?:concurso publico|prefeitura|tribunal|policia federal|policial rodoviario|servidor|tecnico judiciario)\b/.test(concurso)) return 'concursos'
  return null
}
export function pertenceAoFoco(q, foco, incluirAssimilacao = false) {
  if (validarFoco(foco) === 'sem-preferencia') return true
  const categoria = categoriaQuestao(q)
  return categoria === foco || (incluirAssimilacao && chaveFiltro(q.banca) === 'questoes de assimilacao')
}
export function questoesParaTreino(questoes, foco, banca = '') {
  const vistos = new Set()
  return questoes.filter(q => {
    if (!q.id || !materiaCanonica(q) || vistos.has(String(q.id)) || !pertenceAoFoco(q,foco,true) || (banca && q.banca !== banca) || q.prova_incompleta || !podeCorrigir(q) || !questaoPublicavel(q)) return false
    vistos.add(String(q.id)); return true
  })
}
export function ultimasTentativas(historico, agora = Date.now()) {
  const porQuestao = new Map()
  // Datas válidas, ordenadas, impedem que o merge de outra aba torne um erro antigo o mais recente.
  const tentativas = historico.filter(h => h.questaoId != null && typeof h.acertou === 'boolean' && Number.isFinite(Date.parse(h.respondidaEm)) && Date.parse(h.respondidaEm) <= agora)
    .sort((a,b) => Date.parse(a.respondidaEm)-Date.parse(b.respondidaEm))
  const vistos = new Set()
  for (const h of tentativas) {
    if (h.id && vistos.has(h.id)) continue
    if (h.id) vistos.add(h.id)
    const chave=String(h.questaoId), anterior=porQuestao.get(chave)
    porQuestao.set(chave,{...h, sequencia: h.acertou ? (anterior?.sequencia || 0)+1 : 0})
  }
  return porQuestao
}
const DIA = 86400000
// Regra prática ajustável; os intervalos exatos não são uma prescrição científica universal.
export function dataProximaRevisao(tentativa) {
  const dias = tentativa.acertou ? [1,3,7,14,30][Math.min(Math.max(tentativa.sequencia-1,0),4)] : 1
  return Date.parse(tentativa.respondidaEm) + dias*DIA
}
export function planoRevisao(questoes, historico, agora = Date.now()) {
  const ultimas=ultimasTentativas(historico,agora), erros=[], vencidas=[], futuras=[]
  for (const q of questoes) {
    const h=ultimas.get(String(q.id)); if (!h) continue
    const item={questao:q, proxima:dataProximaRevisao(h), tentativa:h}
    if (!h.acertou) erros.push(q)
    if (item.proxima<=agora) vencidas.push(item); else futuras.push(item)
  }
  vencidas.sort((a,b)=>a.proxima-b.proxima); futuras.sort((a,b)=>a.proxima-b.proxima)
  return { ultimas, erros, vencidas: vencidas.map(i=>i.questao), proxima: futuras[0]?.proxima || null }
}
function misturar(itens, random) {
  const a=[...itens]; for(let i=a.length-1;i>0;i--) {const j=Math.floor(random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]} return a
}
export function materiaCanonica(q) { return normalizarMateria(q.materia,q.conteudo) }
export function gerarSimuladoPersonalizado(questoes, {foco='sem-preferencia',banca='',materias=[],quantidade=40,modo='equilibrado',historico=[],agora=Date.now()}={}, random=Math.random) {
  if (!Number.isInteger(quantidade) || quantidade<1 || quantidade>120) return {itens:[],erro:'Escolha entre 1 e 120 questões.'}
  let pool=questoesParaTreino(questoes,foco,banca)
  const plano=planoRevisao(pool,historico,agora)
  if(modo==='erros') pool=plano.erros
  else if(modo==='revisao') pool=plano.vencidas
  else if(modo==='ineditas') pool=pool.filter(q=>!plano.ultimas.has(String(q.id)))
  const selecionadas=[...new Set(materias)]
  if(selecionadas.length) pool=pool.filter(q=>selecionadas.includes(materiaCanonica(q)))
  if(pool.length<quantidade) return {itens:[],erro:`Há ${pool.length} questões disponíveis nesta seleção; reduza a quantidade ou amplie os filtros.`}
  if(['erros','revisao'].includes(modo)) return {itens: (modo==='revisao'?pool:misturar(pool,random)).slice(0,quantidade),erro:''}
  const grupos=selecionadas.length?selecionadas:[...new Set(pool.map(materiaCanonica))].sort((a,b)=>a.localeCompare(b,'pt-BR'))
  if(grupos.length>quantidade) return {itens:[],erro:'Selecione menos matérias ou aumente a quantidade para incluir todas.'}
  const itens=[]
  for(let i=0;i<grupos.length;i++) {
    const meta=Math.floor(quantidade/grupos.length)+(i<quantidade%grupos.length?1:0)
    const candidatos=pool.filter(q=>materiaCanonica(q)===grupos[i])
    if(candidatos.length<meta) return {itens:[],erro:`${grupos[i]} tem ${candidatos.length} questões nesta seleção; são necessárias ${meta}. Ajuste as matérias ou a quantidade.`}
    itens.push(...misturar(candidatos,random).slice(0,meta))
  }
  // Intercalar matérias mantém a variedade; não altera alternativas nem gabaritos.
  return {itens:misturar(itens,random),erro:''}
}
export const AREAS_VESTIBULAR = {
  Linguagens:['Português','Literatura','Inglês','Espanhol','Arte'],
  Humanas:['História','Geografia','Filosofia','Sociologia'],
  Natureza:['Física','Química','Biologia'],
  Matemática:['Matemática'],
}
export function gerarTreinoVestibular(questoes, random=Math.random) {
  const pool=questoesParaTreino(questoes,'vestibulares'), itens=[]
  for(const materias of Object.values(AREAS_VESTIBULAR)) {
    const candidatos=pool.filter(q=>materias.includes(materiaCanonica(q)) && !q.idioma?.includes('Espanhol'))
    if(candidatos.length<10) return []
    itens.push(...misturar(candidatos,random).slice(0,10))
  }
  return itens
}
