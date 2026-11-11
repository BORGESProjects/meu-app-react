import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from '@napi-rs/canvas'

const root = new URL('../../', import.meta.url)
const projectPath = fileURLToPath(root)
const sourceCandidates = [
  path.resolve(projectPath, 'tmp/zip-final-check-20261109-184233/UNICAMP/2026/f12026Q_X.pdf'),
  path.resolve(projectPath, '../../zip-final-check-20261109-184233/UNICAMP/2026/f12026Q_X.pdf')
]
let sourcePath
for (const candidate of sourceCandidates) {
  try { await access(candidate); sourcePath = candidate; break } catch { /* tenta a extração irmã */ }
}
if (!sourcePath) throw new Error('PDF oficial f12026Q_X.pdf não encontrado na pasta tmp/zip-final-check-20261109-184233/UNICAMP/2026.')

const pdfUrl = 'https://www.comvest.unicamp.br/vest2026/F1/f12026Q_X.pdf'
const keyUrl = 'https://www.comvest.unicamp.br/vest2026/F1/Q_X-gabarito.pdf'
const outputDir = new URL('public/acervo/unicamp-2026-primeira-fase-qx-lote-1/', root)
const imagesDir = new URL('imagens/', outputDir)
await mkdir(imagesDir, { recursive: true })
const pdf = await pdfjs.getDocument({ data: new Uint8Array(await readFile(sourcePath)), useSystemFonts: true }).promise

async function renderCrop(pageNumber, name, box, altText) {
  const page = await pdf.getPage(pageNumber)
  const scale = 2.5
  const viewport = page.getViewport({ scale })
  const sourceCanvas = createCanvas(viewport.width, viewport.height)
  await page.render({ canvasContext: sourceCanvas.getContext('2d'), viewport }).promise
  // As caixas foram medidas no PNG de conferência em escala 1,5×.
  const cropScale = scale / 1.5
  const crop = createCanvas(Math.round(box.width * cropScale), Math.round(box.height * cropScale))
  crop.getContext('2d').drawImage(sourceCanvas,
    Math.round(box.x * cropScale), Math.round(box.y * cropScale), crop.width, crop.height,
    0, 0, crop.width, crop.height)
  const filename = `${name}.png`
  await writeFile(new URL(filename, imagesDir), crop.toBuffer('image/png'))
  return { imagem: `/acervo/unicamp-2026-primeira-fase-qx-lote-1/imagens/${filename}`, texto: altText }
}

// Crop coordinates are measured from the page renders at 1.5× and scaled to 2.5×.
const support = {
  q1: await renderCrop(3, 'unicamp-2026-qx-q1-texto-base', { x: 90, y: 152, width: 297, height: 310 }, 'Recorte do texto jornalístico citado na questão 1, com a manchete sobre Fernanda Torres e o termo “upset”.'),
  q2: await renderCrop(3, 'unicamp-2026-qx-q2-quadros', { x: 520, y: 176, width: 258, height: 394 }, 'Três quadros do filme Ainda Estou Aqui, identificados como A, B e C, que devem ser ordenados conforme a descrição.'),
  q3: await renderCrop(3, 'unicamp-2026-qx-q3-tirinha', { x: 464, y: 840, width: 383, height: 125 }, 'Tirinha sobre Wall Street, dinheiro e doações a pessoas necessitadas.'),
  q5: await renderCrop(4, 'unicamp-2026-qx-q5-obras', { x: 48, y: 724, width: 359, height: 239 }, 'Duas obras de Glenn Ligon que repetem e borram trechos do texto de Zora Neale Hurston.')
}

const rows = [
  {
    n: 1, page: 1, answer: 'C', topic: 'Polissemia e sentido contextual',
    stem: 'Leia o texto 1 e as informações do texto 2.\n\nTexto 2 — UPSET\n\n1. noun [C] — an outcome that goes against what was considered to be the most likely result.\n2. adjective — unhappy, worried, angry, or disappointed because something unpleasant has happened.\n\nO texto 1 causou indignação nas redes sociais. Algumas pessoas comentaram: “Se eles estão upset, a gente tá happy!”. O mal-entendido se deve à polissemia, em inglês, da palavra “upset”. É correto afirmar que, no texto 1, “upset” é usada com o sentido da',
    options: ['primeira definição mostrada no texto 2 e, por isso, tem conotação sarcástica ao comparar as atrizes citadas.', 'segunda definição mostrada no texto 2 e, por isso, não assume conotação crítica.', 'primeira definição mostrada no texto 2 e, por isso, não desqualifica a vitória da atriz.', 'segunda definição mostrada no texto 2 e, por isso, estabelece uma hierarquia entre as atrizes citadas.'],
    support: [support.q1], supportText: 'A manchete e a fotografia do texto jornalístico são necessárias para identificar o sentido de “upset”.'
  },
  {
    n: 2, page: 1, answer: 'B', topic: 'Compreensão de texto e sequência narrativa',
    stem: 'Em um vídeo publicado no canal do YouTube do The New York Times, o diretor de “Ainda Estou Aqui” descreve cenas do filme. Apresenta-se, a seguir, a transcrição da fala do diretor.\n\n“30 minutes into the film, before any of these scenes, everything in the movie conveys a sense of normalcy. From this point onward, though, this frame revolves around subtraction: of light, as the drapes are shut, of sounds from the outside, of music. In this other one, we see the last intimacy moment between the couple, framed by the military officers, emphasizing a sense of suffocation in what was once a safe place: the family house. Then, we see the first of the only two close-ups in the entire film. We saved it for Eunice’s last glance at Rubens. From here on, we are with her. “I’m Still Here” becomes her film.”\n\nObserve os três quadros extraídos do filme e assinale a alternativa que apresenta a ordem em que foram descritos no texto.',
    options: ['Quadro A, Quadro C, Quadro B.', 'Quadro B, Quadro C, Quadro A.', 'Quadro C, Quadro B, Quadro A.', 'Quadro B, Quadro A, Quadro C.'],
    support: [support.q2], supportText: 'Os quadros A, B e C do filme são indispensáveis para ordenar as cenas descritas.'
  },
  {
    n: 3, page: 1, answer: 'C', topic: 'Interpretação de tirinha',
    stem: 'Leia a tirinha a seguir.\n\nA tirinha, em seu sentido geral, faz uma crítica à',
    options: ['injustiça de um personagem receber menos moedas do que o outro, na Wall Street.', 'diferença de status financeiro entre as pessoas que transitam pela Wall Street.', 'atitude das pessoas que circulam na Wall Street para as quais lidar com dinheiro é um jogo.', 'postura das pessoas que circulam na Wall Street que ignoram problemas e necessidades sociais.'],
    support: [support.q3], supportText: 'A tirinha é necessária para interpretar a crítica e os elementos visuais do enunciado.'
  },
  {
    n: 4, page: 2, answer: 'B', topic: 'Compreensão de texto jornalístico',
    stem: 'Segundo o texto,',
    supportText: 'U.S. Inflation Mild Ahead of Expected Jump From Tariffs\n\nEconomists and policymakers are bracing for inflation to reaccelerate as companies adapt to the trade war.',
    options: ['o governo dos EUA está se preparando para um salto na inflação diante da guerra comercial de tarifas.', 'a inflação nos EUA se mantém moderada, mas economistas e legisladores estão se preparando diante da expectativa de alta das tarifas.', 'a inflação nos EUA deve se manter moderada, pois as empresas estão se adaptando ao aumento das tarifas.', 'as empresas dos EUA estão se adaptando à aceleração da inflação diante da guerra de tarifas estabelecida pelo governo.'],
    support: []
  },
  {
    n: 5, page: 2, answer: 'D', topic: 'Interpretação de texto e leitura de obra visual',
    stem: 'Apresenta-se, a seguir, uma citação (texto 1) que originou uma obra de arte (texto 2). Há também um parágrafo (texto 3) que descreve e explica essa obra.\n\nTexto 1 — “I do not always feel colored (…). I feel most colored when I am thrown against a sharp white background.”\n\nTexto 3 — The artist Glenn Ligon has stenciled the sentences over and over until the words dissolve into abstract patterns. He built on a text by Zora Neale Hurston, who describes leaving the protective black community of her childhood and suddenly confronting the issue of race. The smearing in the painting’s illegible words embody her confusion about this, something Ligon builds on: “Oil paint wants to spread out and smudge. After trying to make perfect letters, I realized that the smudging and disappearance of the letters was more interesting than trying to make perfect letters.”\n\nDe acordo com o texto 3, é correto afirmar que',
    options: ['a ilegibilidade em parte das imagens é intencional, pois reforça a invisibilização da identidade negra em contextos brancos, como sugere a autora do texto 1.', 'os efeitos da tinta usada por Glenn Ligon aludem à confusão desse artista quanto à sua própria identidade racial, semelhante ao que relata a autora do texto 1.', 'a repetição de frases nas imagens é proposital, pois representa a recusa de algumas pessoas em se verem como negras, como sugere a autora do texto 1.', 'os borrões em parte das imagens são um efeito da técnica usada por Glenn Ligon e aludem às vivências raciais da autora do texto 1.'],
    support: [support.q5], supportText: 'A obra visual do texto 2 é necessária para relacionar o procedimento artístico descrito ao texto de Zora Neale Hurston.'
  }
]

const template = JSON.parse(await readFile(new URL('src/data/cpnu-2024-bloco-7-manha-gerais.json', root), 'utf8'))[0]
const labels = ['A', 'B', 'C', 'D']
const questions = rows.map(row => {
  const question = structuredClone(template)
  const answerIndex = labels.indexOf(row.answer)
  const official = { verificada: true, url: keyUrl, pdf_url: pdfUrl, numero: row.n, resposta: row.answer, anulada: false }
  Object.assign(question, {
    id: `unicamp-2026-fase-1-qx-q${row.n}`, ano: 2026, ano_concurso: 2026, ano_aplicacao: 2025,
    numero: row.n, numero_original: row.n, modelo: 'Q e X', banca: 'UNICAMP', organizadora: 'COMVEST',
    concurso: 'Vestibular Unicamp 2026 — 1ª fase — prova Q e X', cargo: 'Vestibular — Conhecimentos Gerais',
    aplicacao: '2025 — 1ª fase', materia: 'Inglês', conteudo: row.topic, dificuldade: 'Média', dificuldade_estimada: true,
    dificuldade_metodo: 'estimativa editorial pela complexidade de leitura e interpretação',
    enunciado: row.stem, texto_apoio: row.supportText, enunciado_antes_apoio: '',
    opcoes: row.options, rotulos_opcoes: labels, resposta_correta: answerIndex, anulada: false,
    tipo_resposta: 'alternativa', tipo: 'objetiva', provas: ['Vestibular Unicamp 2026 — 1ª fase — prova Q e X'],
    documento_id: 'unicamp-2026-fase-1-qx', documento_origem: 'f12026Q_X.pdf', arquivo_origem: 'f12026Q_X.pdf',
    pagina: row.page, paginas_origem: [row.page], fonte_pdf: pdfUrl, fonte_gabarito: keyUrl,
    apoio: row.support, gabarito_oficial: official,
    origens_provas: [{ concurso: 'Vestibular Unicamp 2026 — 1ª fase', aplicacao: '2025', modelo: 'Q e X', numero_original: row.n, pagina: row.page, arquivo_origem: 'f12026Q_X.pdf', fonte_pdf: pdfUrl, fonte_gabarito: keyUrl, resposta_correta: answerIndex, anulada: false, gabarito_oficial: official }],
    classificacao_revisada: true, classificacao_pendente: false, classificacao_confianca: 1,
    classificacao_metodo: 'classificação editorial pela habilidade diretamente cobrada no caderno oficial',
    classificacao_evidencia: `Caderno oficial COMVEST, Vestibular Unicamp 2026, 1ª fase, prova Q e X, página ${row.page}; gabarito oficial Q e X`,
    integridade_profissional: { verificada_individualmente: true, apta_resolucao: true, pendencias: [], fontes_verificadas: true, questao_completa: true },
    elegibilidade: { elegivel_para_resolucao: true, elegivel_para_correcao_automatica: true, apontamentos: [] },
    origem: 'Caderno e gabarito oficiais — Vestibular Unicamp 2026 — 1ª fase — prova Q e X'
  })
  return question
})

if (questions.length !== 5 || questions.some((q, i) => q.numero_original !== i + 1 || q.opcoes.length !== 4 || q.rotulos_opcoes.length !== 4 || !q.gabarito_oficial.verificada || labels[q.resposta_correta] !== rows[i].answer || !q.enunciado.trim() || q.opcoes.some(option => !option.trim())) || questions[0].apoio.length !== 1 || questions[1].apoio.length !== 1 || questions[2].apoio.length !== 1 || questions[4].apoio.length !== 1) {
  throw new Error('Validação estrutural, imagens ou gabarito Unicamp 2026 Q/X q1–5 falhou')
}

const dataPath = new URL('src/data/unicamp-2026-primeira-fase-qx-lote-1.json', root)
await writeFile(dataPath, `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
await writeFile(new URL('questoes.json', outputDir), `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
console.log('Generated Unicamp 2026 Q/X questions 1–5 with four alternatives and required visual support crops.')
