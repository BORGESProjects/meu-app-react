import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from '@napi-rs/canvas'

const root = new URL('../../', import.meta.url)
const source = path.resolve(fileURLToPath(root), '../../zip-provas-20261110-130605/UNICAMP/2026/f12026Q_X.pdf')
const outputDir = new URL('public/acervo/unicamp-2026-primeira-fase-qx-lote-4/', root)
const imageDir = new URL('imagens/', outputDir)
await mkdir(imageDir, { recursive: true })
const pdf = await pdfjs.getDocument({ data: new Uint8Array(await readFile(source)), useSystemFonts: true }).promise
const page = await pdf.getPage(7)
const scale = 1.5
const viewport = page.getViewport({ scale })
const canvas = createCanvas(viewport.width, viewport.height)
await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise

async function crop(name, box) {
  const image = createCanvas(box.width, box.height)
  image.getContext('2d').drawImage(canvas, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height)
  await writeFile(new URL(name, imageDir), image.toBuffer('image/png'))
  return `/acervo/unicamp-2026-primeira-fase-qx-lote-4/imagens/${name}`
}
const map16 = await crop('unicamp-2026-qx-q16-mapa.png', { x: 46, y: 600, width: 385, height: 277 })
const map17 = await crop('unicamp-2026-qx-q17-mapa-e-legenda.png', { x: 463, y: 232, width: 383, height: 643 })

const rows = [
  {
    n: 16, answer: 'C', subject: 'Geografia', topic: 'Norte e Sul Global e localização hemisférica', image: map16,
    imageDescription: 'Mapa oficial da localização dos países do Norte e Sul Global, com legenda e hemisférios.',
    stem: 'Atualmente, é comum denominar a divisão político-regional do mundo entre Norte e Sul Global. Essa delimitação não segue exatamente os pontos cardeais. Há países do Norte que estão no Sul e vice-versa, conforme indicado no mapa. Essa forma de divisão está baseada no tabuleiro geopolítico e econômico mundial e afastada da localização geográfica dos países.\n\nEm relação à localização dos países do Norte e Sul Global nos diferentes hemisférios, assinale, com base no mapa, a alternativa correta.',
    options: [
      'Austrália e Nova Zelândia são os únicos países do Norte Global situados no hemisfério meridional e hemisfério ocidental.',
      'Argentina, Brasil, Chile, Colômbia, Equador e Venezuela estão no Sul Global e têm seus territórios no hemisfério meridional e no hemisfério oriental.',
      'Estados Unidos e Canadá são países do continente americano no Norte Global que têm seus territórios localizados no hemisfério setentrional e hemisfério ocidental.',
      'China, Rússia, Índia e Japão, integrantes do Norte Global, estão situados no hemisfério setentrional e no hemisfério oriental.'
    ]
  },
  {
    n: 17, answer: 'D', subject: 'Geografia', topic: 'Climas e zonobiomas da África', image: map17,
    imageDescription: 'Mapa oficial das zonas climáticas e zonobiomas africanos, incluindo legenda das zonas de transição.',
    stem: 'O mapa da África apresentando seus respectivos climas e zonobiomas (classificação internacional feita em função do clima e da fitofisionomia) é um bom exemplo para mostrar a distribuição das zonas climáticas em faixas latitudinais. Em outros continentes, cordilheiras, correntes marinhas e diversos fatores distorcem, interrompem e/ou expandem essas faixas, tornando-as menos evidentes.\n\nA partir da leitura do mapa e de seus conhecimentos sobre os componentes naturais do continente africano, assinale a alternativa correta em relação às zonas de transição.',
    options: [
      'A zona de transição I–II apresenta fitofisionomias típicas de savanas perenifólias nas proximidades da zona I e um processo gradativo do desenvolvimento de florestas ombrófilas no limite com a zona II.',
      'A zona de transição II–III apresenta formações vegetais contínuas e densas, com árvores latifoliadas e higrófilas, típicas da zona II e em detrimento das savanas típicas da zona III.',
      'A zona de transição II–V apresenta uma vegetação densa e permanente, com gramíneas e arbustos, pois a influência da zona V predomina por influência dos processos costeiros.',
      'A zona de transição III–II apresenta vegetação de pequeno porte e espécies xerófitas no contato com a zona III, e um processo gradativo de savanização em direção à zona II.'
    ]
  }
]

const template = JSON.parse(await readFile(new URL('src/data/unicamp-2026-primeira-fase-qx-lote-3.json', root), 'utf8'))[0]
const keyUrl = 'https://www.comvest.unicamp.br/vest2026/F1/Q_X-gabarito.pdf'
const answers = ['A', 'B', 'C', 'D']
const questions = rows.map(row => {
  const q = structuredClone(template)
  const index = answers.indexOf(row.answer)
  const official = { verificada: true, url: keyUrl, pdf_url: q.fonte_pdf, numero: row.n, resposta: row.answer, anulada: false }
  Object.assign(q, {
    id: `unicamp-2026-fase-1-qx-q${row.n}`, numero: row.n, numero_original: row.n,
    materia: row.subject, conteudo: row.topic, enunciado: row.stem, texto_apoio: '',
    opcoes: row.options, opcoes_imagens: [], resposta_correta: index, pagina: 5, paginas_origem: [5],
    apoio: [{ imagem: row.image, texto: row.imageDescription }], gabarito_oficial: official,
    origens_provas: [{ ...q.origens_provas[0], numero_original: row.n, pagina: 5, paginas_origem: [5], resposta_correta: index, gabarito_oficial: official }],
    classificacao_evidencia: `Caderno oficial COMVEST, Vestibular Unicamp 2026, 1ª fase, prova Q e X, página 5; gabarito oficial Q e X`
  })
  return q
})
if (questions.length !== 2 || questions.some((q, i) => q.numero_original !== i + 16 || q.opcoes.length !== 4 || answers[q.resposta_correta] !== rows[i].answer || q.apoio.length !== 1)) throw new Error('Lote 4 inválido')
const serialized = `${JSON.stringify(questions, null, 2)}\n`
await writeFile(new URL('src/data/unicamp-2026-primeira-fase-qx-lote-4.json', root), serialized)
await writeFile(new URL('questoes.json', outputDir), serialized)
console.log('Generated Unicamp 2026 Q/X questions 16–17 with separate original maps and four options each.')
