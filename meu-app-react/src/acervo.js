import esa2025 from './data/esa2025.json' with { type: 'json' }
import enem2022 from './data/enem2022.json' with { type: 'json' }

export const acervo = [...esa2025, ...enem2022]

// Correções conferidas diretamente nas provas oficiais. Manter este mapa
// pequeno e explícito evita tentar "adivinhar" alternativas danificadas pelo
// extrator de PDF.
const CORRECOES_CONFERIDAS = new Map([
  ['3165', {
    ano: 2018,
    banca: 'UTFPR',
    concurso: 'Exame de Seleção UTFPR 2018/1',
    numero_original: 19,
    fonte: 'https://antigo.utfpr.edu.br/cursos/estudenautfpr/exame-de-selecao/provas-anteriores/prova-2018_1.pdf',
    opcoes: [
      '{−√2/2, √2/2}',
      '{−√3/2, √3/2}',
      '{−√2, √2}',
      '{−√2/3, √2/3}',
      '{−√3, √3}',
    ],
    resposta_correta: 2,
  }],
])

const normalizarAlternativa = valor => String(valor ?? '')
  .normalize('NFKC')
  .replace(/\s+/g, ' ')
  .trim()
  .toLocaleLowerCase('pt-BR')

function indiceResposta(questao) {
  if (Number.isInteger(questao.resposta_correta)) return questao.resposta_correta
  const resposta = String(questao.resposta_correta ?? '').trim().toUpperCase()
  if (/^[A-E]$/.test(resposta)) return resposta.charCodeAt(0) - 65
  if (/^[0-4]$/.test(resposta)) return Number(resposta)
  return -1
}

export function corrigirQuestaoConferida(questao) {
  const correcao = CORRECOES_CONFERIDAS.get(String(questao?.id ?? ''))
  return correcao ? { ...questao, ...correcao } : questao
}

export function questaoPublicavel(questao) {
  if (!questao || String(questao.enunciado ?? '').trim().length < 12) return false
  if (!Array.isArray(questao.opcoes) || questao.opcoes.length < 2 || questao.opcoes.length > 5) return false

  const opcoes = questao.opcoes.map(normalizarAlternativa)
  if (opcoes.some(opcao => !opcao || opcao.length > 500)) return false
  if (new Set(opcoes).size !== opcoes.length) return false

  if (!questao.anulada) {
    const resposta = indiceResposta(questao)
    if (resposta < 0 || resposta >= opcoes.length) return false
  }
  return true
}

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
  cadastradas
    .map(corrigirQuestaoConferida)
    .filter(questaoPublicavel)
    .forEach(q => mapa.set(origem(q), q))
  return [...mapa.values()].filter(questaoPublicavel)
}

export function podeCorrigir(q) {
  return !q.anulada && q.resposta_correta !== null && q.resposta_correta !== undefined
}
