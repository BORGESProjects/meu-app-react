import {unirQuestoes} from './acervo.js'
import {indexarFiltros} from './indiceFiltros.js'

export function prepararAcervo(itens) {
  if (!Array.isArray(itens)) throw new Error('Acervo inválido')
  const questoes = unirQuestoes(itens)
  return {questoes, indice: indexarFiltros(questoes)}
}
