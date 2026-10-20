import { anoDaQuestao } from './acervo.js'
import { chaveCampoFiltro, grupoConteudo, normalizarMateria, normalizarBanca, opcoesFiltro } from './filtros.js'

// Classificação textual custa caro: calcular uma vez por versão do acervo.
export function indexarFiltros(questoes) {
  return questoes.map(questao => {
    const grupo = grupoConteudo(questao.conteudo, questao.materia, `${questao.enunciado || ''} ${(questao.opcoes || []).join(' ')}`)
    return { questao, ano: anoDaQuestao(questao),
      materia: chaveCampoFiltro('materia', normalizarMateria(questao.materia, questao.conteudo)),
      banca: chaveCampoFiltro('banca', normalizarBanca(questao.banca, questao.concurso)),
      dificuldade: chaveCampoFiltro('dificuldade', questao.dificuldade),
      conteudo: grupo.value, grupo }
  })
}

export function filtrarIndice(indice, filtros) {
  const ativos = Object.entries(filtros).filter(([, valores]) => valores.length).map(([campo, valores]) => [campo, new Set(valores)])
  if (!ativos.length) return []
  return indice.filter(item => ativos.every(([campo, valores]) => valores.has(item[campo]))).map(item => item.questao)
}

export function conteudosDoIndice(indice, materias) {
  const selecionadas = new Set(materias)
  const grupos = new Map()
  for (const item of indice) {
    if (selecionadas.size && !selecionadas.has(item.materia)) continue
    if (!item.grupo.value) continue
    if (!grupos.has(item.grupo.value)) grupos.set(item.grupo.value, { ...item.grupo, quantidade: 0 })
    grupos.get(item.grupo.value).quantidade++
  }
  return [...grupos.values()].map(grupo => ({ value: grupo.value, label: `${grupo.label} (${grupo.quantidade})` }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base', numeric: true }))
}

export const CAMPOS_FILTRO = ['banca','ano','materia','conteudo','dificuldade']
const basesPorIndice = new WeakMap()
function basesDoIndice(indice) {
  if (basesPorIndice.has(indice)) return basesPorIndice.get(indice)
  const questoes=indice.map(i=>i.questao), grupos=new Map()
  for(const item of indice) if(item.grupo.value && !grupos.has(item.grupo.value)) grupos.set(item.grupo.value,{value:item.grupo.value,label:item.grupo.label})
  const bases={
    ano:[...new Set(indice.map(i=>i.ano))].sort((a,b)=>b.localeCompare(a,'pt-BR',{numeric:true})).map(value=>({value,label:value})),
    materia:opcoesFiltro(questoes,'materia'), banca:opcoesFiltro(questoes,'banca'), dificuldade:opcoesFiltro(questoes,'dificuldade'),
    conteudo:[...grupos.values()].sort((a,b)=>a.label.localeCompare(b.label,'pt-BR',{sensitivity:'base',numeric:true})),
  }
  basesPorIndice.set(indice,bases); return bases
}
// Cada lista considera os OUTROS campos. Dentro de um campo, seleções são uma união (OU).
// Uma passada no índice evita reclassificar os textos a cada clique.
export function contarOpcoesRelacionadas(indice, filtros={}) {
  const ativos=CAMPOS_FILTRO.filter(c=>filtros[c]?.length).map(c=>[c,new Set(filtros[c])])
  const contagens=Object.fromEntries(CAMPOS_FILTRO.map(c=>[c,new Map()]))
  for(const item of indice) {
    let falha=null, quantidadeFalhas=0
    for(const [campo,valores] of ativos) if(!valores.has(item[campo])) {falha=campo;if(++quantidadeFalhas>1) break}
    if(quantidadeFalhas>1) continue
    for(const campo of CAMPOS_FILTRO) {
      if(quantidadeFalhas===1 && campo!==falha) continue
      const valor=item[campo]; if(!valor) continue
      contagens[campo].set(valor,(contagens[campo].get(valor)||0)+1)
    }
  }
  return contagens
}
export function opcoesRelacionadas(indice, filtros={}) {
  const contagens=contarOpcoesRelacionadas(indice,filtros), bases=basesDoIndice(indice)
  return Object.fromEntries(CAMPOS_FILTRO.map(c=>[c,bases[c].filter(o=>contagens[c].has(o.value)).map(o=>c==='conteudo'?{...o,label:o.label+' ('+contagens[c].get(o.value)+')'}:o)]))
}
export function atualizarFiltrosRelacionados(indice, filtros, campoAlterado, valores) {
  if(!CAMPOS_FILTRO.includes(campoAlterado)) throw new Error('Campo de filtro inválido')
  const bases=basesDoIndice(indice), permitidos=new Set(bases[campoAlterado].map(o=>o.value))
  const proximos=Object.fromEntries(CAMPOS_FILTRO.map(c=>[c,[]]))
  proximos[campoAlterado]=[...new Set(valores)].filter(v=>permitidos.has(v))
  // A mudança mais recente tem prioridade; preserve as outras escolhas quando houver correspondência.
  for(const campo of CAMPOS_FILTRO) {
    if(campo===campoAlterado) continue
    const contagens=contarOpcoesRelacionadas(indice,proximos)[campo]
    proximos[campo]=(filtros[campo]||[]).filter(v=>contagens.has(v))
  }
  // Não deixar escolhas ocultas, que não contribuem para nenhuma questão da combinação.
  const finais=contarOpcoesRelacionadas(indice,proximos)
  for(const campo of CAMPOS_FILTRO) proximos[campo]=proximos[campo].filter(v=>finais[campo].has(v))
  const removidos=CAMPOS_FILTRO.filter(c=>c!==campoAlterado).flatMap(c=>(filtros[c]||[]).filter(v=>!proximos[c].includes(v)).map(valor=>({campo:c,valor})))
  return {filtros:proximos,removidos}
}
