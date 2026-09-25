import esa2025 from './data/esa2025.json' with { type: 'json' }
import enem2022 from './data/enem2022.json' with { type: 'json' }

export const acervo = [...esa2025, ...enem2022]

export function anoDaQuestao(questao) {
  if (questao.ano) return String(questao.ano)
  return String(questao.concurso || '').match(/\b(?:19|20)\d{2}\b/)?.[0] || 'Não informado'
}

export function unirQuestoes(cadastradas = []) {
  // Um registro já cadastrado com a mesma origem substitui a cópia do acervo.
  const origem = q => /^(esa-2025-a-|enem-2022-)/.test(q.id?.toString() || '')
    ? q.id : q.banca === 'ESA' && q.numero_original && anoDaQuestao(q) === '2025' && q.modelo === 'A'
      ? `esa-2025-a-${String(q.numero_original).padStart(2, '0')}` : `banco-${q.id}`
  const mapa = new Map(acervo.map(q => [origem(q), q]))
  cadastradas.forEach(q => mapa.set(origem(q), q))
  return [...mapa.values()]
}

export function podeCorrigir(q) {
  return !q.anulada && q.resposta_correta !== null && q.resposta_correta !== undefined
}
