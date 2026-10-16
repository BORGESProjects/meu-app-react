import { anoDaQuestao } from './acervo.js'
import { chaveCampoFiltro, grupoConteudo } from './filtros.js'

// Classificação textual custa caro: calcular uma vez por versão do acervo.
export function indexarFiltros(questoes) {
  return questoes.map(questao => {
    const grupo = grupoConteudo(questao.conteudo, questao.materia, `${questao.enunciado || ''} ${(questao.opcoes || []).join(' ')}`)
    return { questao, ano: anoDaQuestao(questao),
      materia: chaveCampoFiltro('materia', questao.materia),
      banca: chaveCampoFiltro('banca', questao.banca),
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
