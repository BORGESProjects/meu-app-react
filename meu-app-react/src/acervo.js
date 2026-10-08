import esa2025 from './data/esa2025.json' with { type: 'json' }
import enem2022 from './data/enem2022.json' with { type: 'json' }
import { normalizarBanca, normalizarMateria } from './filtros.js'

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
  ['6438', {
    ano: 2025,
    materia: 'Matemática',
    conteudo: 'Progressões aritméticas',
    numero_original: 70,
    fonte: 'https://www.fuvest.br/wp-content/uploads/fuvest2025_primeira_fase_prova_V1.pdf',
    enunciado: 'Seja (aₙ) uma progressão aritmética cujo primeiro termo é a₁ e a razão r, ambos números reais. É possível construir uma outra sequência (bₙ), em que o primeiro termo é um número real b₁ e com a seguinte lei de formação\n\nbₙ₊₁ = bₙ + aₙ,\n\nsendo n > 0 um número natural. Por exemplo, se b₁ = 0 e (aₙ) = (1, 3, 5, 7, 9, 11, …), tem-se (bₙ) = (0, 1, 4, 9, 16, 25, …). Com base em tais informações, os valores de a₁ e r foram escolhidos de forma que (bₙ) também seja uma progressão aritmética de razão r′. Nessas condições, é correto afirmar:',
    opcoes: ['r′ = a₁', 'r′ = 2a₁', 'r′ = r', 'r′ = 2r', 'r′ = b₁ − a₁'],
    resposta_correta: 0,
  }],
  ['6441', {
    ano: 2025,
    materia: 'Matemática',
    conteudo: 'Geometria espacial',
    numero_original: 76,
    fonte: 'https://www.fuvest.br/wp-content/uploads/fuvest2025_primeira_fase_prova_V1.pdf',
    enunciado: 'Considere um cilindro C de altura h > 0 e cujo raio das circunferências do topo e da base é r > 0; um cilindro C₁ cujo raio é igual ao de C e altura igual a h/2; e um cilindro C₂ com altura h e raio igual a r/2. Sendo V, V₁ e V₂ os volumes e A, A₁ e A₂ as áreas laterais dos cilindros C, C₁ e C₂, respectivamente, é correto afirmar:',
    opcoes: [
      'V = V₁ + V₂ e A = A₁ + A₂',
      'V = V₁ + V₂ e A = A₁ + 2A₂',
      'V = V₁ + 2V₂ e A = A₁ + 2A₂',
      'V = V₁ + 2V₂ e A = A₁ + A₂',
      'V = 2V₁ + 2V₂ e A = 2A₁ + 2A₂',
    ],
    resposta_correta: 3,
  }],
  ['6442', {
    ano: 2025,
    materia: 'Matemática',
    conteudo: 'Geometria analítica',
    numero_original: 77,
    fonte: 'https://www.fuvest.br/wp-content/uploads/fuvest2025_primeira_fase_prova_V1.pdf',
    enunciado: 'Em relação ao plano cartesiano Oxy, é correto afirmar que as equações\n\nx² + y² − 4x = −3\n\ne\n\nx² + y² − 4y = −3\n\nrepresentam',
    opcoes: [
      'duas circunferências com raios de mesma medida e que se interceptam em dois pontos.',
      'duas circunferências com raios de medidas diferentes e que se interceptam em dois pontos.',
      'duas circunferências que se interceptam em um único ponto.',
      'duas circunferências concêntricas e que não se interceptam.',
      'duas circunferências com centros distintos e que não se interceptam.',
    ],
    resposta_correta: 4,
  }],
])

const PADRAO_TEXTO_CORROMPIDO = /[\uE000-\uF8FF\uFFFD\u25A0\u25A1\u0900-\u0DFF\u1200-\u137F]|(?:\?\s*){4,}|\(cid:\d+\)/iu

export function textoCorrompido(valor) {
  const texto = String(valor ?? '')
  return PADRAO_TEXTO_CORROMPIDO.test(texto)
    || [...texto].some(caractere => {
      const codigo = caractere.codePointAt(0)
      return codigo < 32 && ![9, 10, 13].includes(codigo)
    })
}

export function limparMarcadoresExtracao(valor) {
  return String(valor ?? '')
    .replace(/(?:^|\s)#{3,}(?=\s|$)/gu, ' ')
    .replace(/[ \t]+\n/gu, '\n')
    .replace(/\n[ \t]+/gu, '\n')
    .replace(/[ \t]{2,}/gu, ' ')
    .trim()
}

const normalizarAlternativa = valor => String(valor ?? '')
  .normalize('NFKC')
  .replace(/\s+/g, ' ')
  .trim()
  .toLocaleLowerCase('pt-BR')

const normalizarConteudo = valor => String(valor ?? '')
  .normalize('NFKC')
  .replace(/[“”"'`´]/gu, '')
  .replace(/\s+/gu, ' ')
  .trim()
  .toLocaleLowerCase('pt-BR')

const marcadoresDeAlternativas = /(?:^|\s)a\)\s.+?\s+b\)\s.+?\s+c\)\s.+?\s+d\)\s/isu
const trechoDeOutraQuestao = /texto para (?:as )?(?:próximas|questões)|(?:\n| {2,})\*?\d{1,3}\s*(?:\*\d{1,3}\s*)?-\s+.{12,}|PUC\s*-\s*DEMAIS CURSOS/iu
const cabecalhoVazado = /(?:^|\n)\s*(?:BIOLOGIA|FILOSOFIA|FÍSICA|GEOGRAFIA|HISTÓRIA|LÍNGUA (?:PORTUGUESA|INGLESA|ESPANHOLA)|LITERATURA|MATEMÁTICA|QUÍMICA|SOCIOLOGIA)\s*(?:\n|$)/iu

function alternativaContaminada(valor) {
  const texto = String(valor ?? '')
  return trechoDeOutraQuestao.test(texto) || marcadoresDeAlternativas.test(texto) || cabecalhoVazado.test(texto)
}

function semTextoDeApoio(questao) {
  const enunciado = String(questao.enunciado ?? '')
  const referenciaOutroTexto = /(?:according to|de acordo com|conforme|segundo) (?:the |o |a )?(?:text|texto|trecho|poema|tirinha|charge|cartum)/iu.test(enunciado)
  const referenciaVisualAusente = /(?:figura|imagem|gráfico|mapa|infográfico|diagrama|esquema|charge|tirinha|cartum|fotografia|quadro|tabela)\s+(?:a seguir|abaixo|acima|ao lado)|(?:observe|analise|considere|com base n[oa])\s+(?:a |o )?(?:figura|imagem|gráfico|mapa|infográfico|diagrama|esquema|charge|tirinha|cartum|fotografia|quadro|tabela)/iu.test(enunciado)
  const temApoio = Boolean(String(questao.texto_apoio ?? '').trim())
    || Boolean(questao.imagem_original || questao.pagina_imagem)
    || (Array.isArray(questao.apoio) && questao.apoio.length > 0)
  return (referenciaOutroTexto || referenciaVisualAusente) && !temApoio
}

function identidadeConteudo(questao) {
  return `${normalizarConteudo(questao.enunciado)}::${(questao.opcoes || []).map(normalizarConteudo).join('|')}`
}

function pontuarQualidade(questao) {
  const banca = normalizarConteudo(questao.banca).normalize('NFD').replace(/[\u0300-\u036f]/gu, '')
  const bancaGenerica = /^(questoes ineditas|questoes de estudo|professor)$/.test(banca)
  return (banca && !bancaGenerica ? 20 : 0)
    + (anoDaQuestao(questao) !== 'Não informado' ? 12 : 0)
    + (questao.numero_original ? 5 : 0)
    + (questao.fonte || questao.fonte_pdf ? 4 : 0)
    + (questao.materia ? 2 : 0) + (questao.conteudo ? 2 : 0) + (questao.dificuldade ? 2 : 0)
    + (questao.texto_apoio || questao.imagem_original || questao.pagina_imagem || questao.apoio?.length ? 3 : 0)
}

function indiceResposta(questao) {
  if (Number.isInteger(questao.resposta_correta)) return questao.resposta_correta
  const resposta = String(questao.resposta_correta ?? '').trim().toUpperCase()
  if (/^[A-E]$/.test(resposta)) return resposta.charCodeAt(0) - 65
  if (/^[0-4]$/.test(resposta)) return Number(resposta)
  return -1
}

export function corrigirQuestaoConferida(questao) {
  const correcao = CORRECOES_CONFERIDAS.get(String(questao?.id ?? ''))
  const corrigida = correcao ? { ...questao, ...correcao } : { ...questao }
  if (Object.hasOwn(corrigida, 'banca')) corrigida.banca = normalizarBanca(corrigida.banca, corrigida.concurso)
  if (Object.hasOwn(corrigida, 'materia')) corrigida.materia = normalizarMateria(corrigida.materia, corrigida.conteudo)
  corrigida.enunciado = limparMarcadoresExtracao(corrigida.enunciado)
  if (Object.hasOwn(corrigida, 'texto_apoio')) corrigida.texto_apoio = limparMarcadoresExtracao(corrigida.texto_apoio)
  if (Array.isArray(corrigida.opcoes)) corrigida.opcoes = corrigida.opcoes.map(limparMarcadoresExtracao)

  const temImagem = Boolean(corrigida.imagem_original || corrigida.pagina_imagem)
  if (temImagem && textoCorrompido(corrigida.enunciado)) corrigida.texto_extraido_corrompido = true
  const opcoesTextoCorrompido = Array.isArray(corrigida.opcoes)
    ? corrigida.opcoes.map((opcao, indice) => Boolean(corrigida.opcoes_imagens?.[indice]) && textoCorrompido(opcao))
    : []
  if (opcoesTextoCorrompido.some(Boolean)) corrigida.opcoes_texto_corrompido = opcoesTextoCorrompido
  if (temImagem && textoCorrompido(corrigida.texto_apoio)) corrigida.texto_apoio = ''
  return corrigida
}

export function questaoPublicavel(questao) {
  if (!questao || String(questao.enunciado ?? '').trim().length < 12) return false
  if (!Array.isArray(questao.opcoes) || questao.opcoes.length < 2 || questao.opcoes.length > 5) return false

  const temImagemEnunciado = Boolean(questao.imagem_original || questao.pagina_imagem)
  if (textoCorrompido(questao.enunciado) && !temImagemEnunciado) return false
  if (textoCorrompido(questao.texto_apoio)) return false
  if (questao.opcoes.some((opcao, indice) => textoCorrompido(opcao) && !questao.opcoes_imagens?.[indice])) return false

  const opcoes = questao.opcoes.map(normalizarAlternativa)
  if (opcoes.some(opcao => !opcao || opcao.length > 500)) return false
  if (new Set(opcoes).size !== opcoes.length && !questao.duplicata_oficial) return false
  if (opcoes.every(opcao => /^[a-e]$/u.test(opcao))) return false
  if (questao.opcoes.some(alternativaContaminada)) return false
  if (semTextoDeApoio(questao)) return false

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
    const numero = q.numero_original || q.numero
    if (/^(esa-2025-a-|enem-20(?:1[7-9]|2[0-2])-|ufpr-202[1-5]-|utfpr-2025-)/.test(id)) return id
    if (normalizarBanca(q.banca, q.concurso) === 'UFPR' && /^(?:2021|2022|2023|2024|2025)$/.test(anoDaQuestao(q)) && numero) {
      const ano = anoDaQuestao(q)
      return `ufpr-${ano}-${String(numero).padStart(2, '0')}`
    }
    if (normalizarBanca(q.banca, q.concurso) === 'UTFPR' && anoDaQuestao(q) === '2025' && numero) {
      return `utfpr-2025-${String(numero).padStart(2, '0')}`
    }
    if (q.banca?.toString().toUpperCase() === 'ENEM' && q.numero_original) {
      const ano = anoDaQuestao(q)
      const idioma = q.idioma?.toString().toLowerCase() || ''
      const sufixo = idioma.includes('ingl') ? '-en' : idioma.includes('espan') ? '-es' : ''
      if (/^20(?:1[7-9]|2[0-2])$/.test(ano)) return `enem-${ano}-${String(q.numero_original).padStart(3, '0')}${sufixo}`
    }
    return q.banca === 'ESA' && q.numero_original && anoDaQuestao(q) === '2025' && q.modelo === 'A'
      ? `esa-2025-a-${String(q.numero_original).padStart(2, '0')}` : `banco-${q.id}`
  }
  const mapa = new Map(acervo.map(corrigirQuestaoConferida).filter(questaoPublicavel).map(q => [origem(q), q]))
  cadastradas
    .map(corrigirQuestaoConferida)
    .filter(questaoPublicavel)
    .forEach(q => mapa.set(origem(q), q))
  const porConteudo = new Map()
  for (const questao of [...mapa.values()].filter(questaoPublicavel)) {
    const chave = identidadeConteudo(questao)
    if (!porConteudo.has(chave)) porConteudo.set(chave, [])
    porConteudo.get(chave).push(questao)
  }

  const resultado = []
  for (const grupo of porConteudo.values()) {
    const respostas = new Set(grupo.map(questao => questao.anulada ? 'anulada' : indiceResposta(questao)))
    // Conteúdo idêntico com gabaritos diferentes não é seguro para estudo.
    // O grupo fica em quarentena até que uma fonte oficial resolva o conflito.
    if (respostas.size > 1) continue
    resultado.push(grupo.reduce((melhor, atual) => pontuarQualidade(atual) > pontuarQualidade(melhor) ? atual : melhor))
  }
  return resultado
}

export function podeCorrigir(q) {
  return !q.anulada && q.resposta_correta !== null && q.resposta_correta !== undefined
}
