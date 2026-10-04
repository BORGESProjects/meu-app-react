import esa2025 from './data/esa2025.json' with { type: 'json' }
import enem2022 from './data/enem2022.json' with { type: 'json' }

export const acervo = [...esa2025, ...enem2022]

export function anoDaQuestao(questao) {
  if (questao.ano) return String(questao.ano)
  return String(questao.concurso || '').match(/\b(?:19|20)\d{2}\b/)?.[0] || 'Não informado'
}

export function unirQuestoes(cadastradas = []) {
  // Um registro já cadastrado com a mesma origem substitui a cópia do acervo.
  const origem = q => {
    const id = q.id?.toString() || ''
    if (/^(esa-2025-a-|enem-20(?:1[7-9]|2[0-2])-)/.test(id)) return id
    if (q.banca?.toString().toUpperCase() === 'ENEM' && q.numero_original) {
      const ano = anoDaQuestao(q)
      const idioma = q.idioma?.toString().toLowerCase() || ''
      const sufixo = idioma.includes('ingl') ? '-en' : idioma.includes('espan') ? '-es' : ''
      if (/^20(?:1[7-9]|2[0-2])$/.test(ano)) return `enem-${ano}-${String(q.numero_original).padStart(3, '0')}${sufixo}`
    }
    return q.banca === 'ESA' && q.numero_original && anoDaQuestao(q) === '2025' && q.modelo === 'A'
      ? `esa-2025-a-${String(q.numero_original).padStart(2, '0')}` : `banco-${q.id}`
  }
  const mapa = new Map(acervo.map(q => [origem(q), q]))
  cadastradas.forEach(q => mapa.set(origem(q), q))
  return [...mapa.values()]
}

export function podeCorrigir(q) {
  return !q.anulada && q.resposta_correta !== null && q.resposta_correta !== undefined
}
