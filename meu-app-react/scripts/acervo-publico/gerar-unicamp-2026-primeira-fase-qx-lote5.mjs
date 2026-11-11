import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from '@napi-rs/canvas'

const root = new URL('../../', import.meta.url)
const source = path.resolve(fileURLToPath(root), '../../zip-provas-20261110-130605/UNICAMP/2026/f12026Q_X.pdf')
const outputDir = new URL('public/acervo/unicamp-2026-primeira-fase-qx-lote-5/', root)
const imageDir = new URL('imagens/', outputDir)
await mkdir(imageDir, { recursive: true })
const pdf = await pdfjs.getDocument({ data: new Uint8Array(await readFile(source)), useSystemFonts: true }).promise

async function crop(pageNumber, name, box) {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale: 1.5 })
  const canvas = createCanvas(viewport.width, viewport.height)
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  const image = createCanvas(box.width, box.height)
  image.getContext('2d').drawImage(canvas, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height)
  await writeFile(new URL(name, imageDir), image.toBuffer('image/png'))
  return `/acervo/unicamp-2026-primeira-fase-qx-lote-5/imagens/${name}`
}
const map18 = await crop(8, 'unicamp-2026-qx-q18-bacia-indo.png', { x: 45, y: 359, width: 386, height: 552 })
const map19 = await crop(8, 'unicamp-2026-qx-q19-influencia-ira.png', { x: 463, y: 377, width: 383, height: 504 })
const map20 = await crop(9, 'unicamp-2026-qx-q20-agronegocio-bahia.png', { x: 45, y: 211, width: 386, height: 493 })

const rows = [
  {
    n: 18, page: 6, answer: 'D', subject: 'Geografia', topic: 'Bacias hidrográficas e geopolítica da água', image: map18,
    imageDescription: 'Mapa oficial da rede hidrográfica do rio Indo, países drenados, áreas de litígio e legenda.',
    stem: "Os conflitos entre Índia e Paquistão se acirraram em 2025, entre outros fatores, pela disputa de recursos hídricos na bacia hidrográfica do rio Indo. Em setembro de 1960, os dois países firmaram o Tratado das Águas do Indo, que regula o uso compartilhado das águas desse sistema fluvial. Ao longo dos anos, a Índia manifestou, em diferentes ocasiões, a intenção de se desvincular do acordo. Em resposta, o governo paquistanês declarou que qualquer tentativa de bloqueio hídrico seria considerada um ‘ato de guerra’.\n\nPara entender o conflito, é fundamental analisar o sentido do fluxo de drenagem na bacia hidrográfica do rio Indo, conforme mostrado pelo mapa.\n\nA partir da leitura do mapa e do texto, é correto afirmar que os afluentes",
    options: [
      'são rios drenados para o interior do continente (endorreicos) e escoam em direção à jusante, onde se localizam áreas agrícolas do Paquistão. Por isso, eventuais represamentos pela Índia comprometeriam a economia paquistanesa.',
      'são rios drenados para o oceano (exorreicos) situados na montante do território indiano. Isso permitiria ao Paquistão represar sua vazão e reduzir o abastecimento indiano destinado às atividades agropecuárias e industriais.',
      'são rios drenados para o interior do continente (endorreicos) e correm em direção à jusante, comprometendo as atividades econômicas das áreas urbanizadas do Paquistão que dependem da vazão originada nos afluentes situados na Índia.',
      'são rios drenados para o oceano (exorreicos) situados na montante do Paquistão. Isso permitiria à Índia controlar seu fluxo, afetando as atividades agrícolas paquistanesas e comprometendo a economia do Paquistão.'
    ]
  },
  {
    n: 19, page: 6, answer: 'A', subject: 'Geografia', topic: 'Oriente Médio e geopolítica contemporânea', image: map19,
    imageDescription: 'Mapa oficial dos países e grupos sob influência do Irã, com legenda.',
    stem: 'Historicamente, a região do Oriente Médio vive uma série de conflitos envolvendo alianças e disputas por interesses econômicos, geopolíticos e religiosos. Por exemplo, o chamado eixo da resistência é formado por um conjunto de países e grupos rebeldes sob influência do Irã. Esse eixo se define por confrontar forças militares ocidentais, como no caso dos Estados Unidos e de Israel. O mapa mostra a localização dos países e grupos sob influência do Irã.\n\nA partir dessas informações, assinale a alternativa que apresenta corretamente as disputas e as alianças do Irã com grupos étnicos, militares e religiosos dentro dos países indicados no mapa.',
    options: [
      'Disputas: com a minoria sunita do islamismo (Iraque); com o Estado Islâmico (Síria). Alianças: com os Houthis (Iêmen); com o Hezbollah (Líbano).',
      'Disputas: com os Houthis (Iêmen); com o Estado Islâmico (Síria). Alianças: com a minoria sunita do islamismo (Iraque); com o Hezbollah (Líbano).',
      'Disputas: com a minoria sunita do islamismo (Iraque); com o Hezbollah (Líbano). Alianças: com os Houthis (Iêmen); com o Estado Islâmico (Síria).',
      'Disputas: com os Houthis (Iêmen); com o Hezbollah (Líbano). Alianças: com a minoria sunita do islamismo (Iraque); com o Estado Islâmico (Síria).'
    ]
  },
  {
    n: 20, page: 7, answer: 'A', subject: 'Geografia', topic: 'Agronegócio e especialização produtiva regional', image: map20,
    imageDescription: 'Mapa oficial dos circuitos produtivos do agronegócio no estado da Bahia, com áreas identificadas e legenda.',
    stem: 'O mapa apresenta frações do território brasileiro transformadas a partir da década de 1970 pela implementação de políticas de desenvolvimento. Três áreas limítrofes do Estado da Bahia, que até então não eram modernizadas, foram incorporadas a diferentes circuitos espaciais produtivos globalizados.\n\nConsiderando o texto e o mapa dos circuitos produtivos do agronegócio no Estado da Bahia, assinale a alternativa correta.',
    options: [
      'A especialização produtiva regional favoreceu o uso intensivo de inovações técnico-científicas, promovendo seletividade espacial da modernização, o que gerou impactos nos mosaicos produtivos tradicionais.',
      'Os enclaves de modernização regional promoveram a difusão de uma produção diversificada setorialmente, o que garantiu o espraiamento das inovações técnico-científicas para as demais localidades da região.',
      'A especialização produtiva regional permitiu a cooperação das inovações técnico-científicas com os mosaicos produtivos tradicionais, o que restringiu maior conectividade espacial entre os estados limítrofes.',
      'Os enclaves de modernização regional viabilizaram a dilatação das inovações técnico-científicas para setores produtivos não especializados, o que acarretou a eliminação da seletividade espacial produzida pela especialização.'
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
    opcoes: row.options, opcoes_imagens: [], resposta_correta: index, pagina: row.page, paginas_origem: [row.page],
    apoio: [{ imagem: row.image, texto: row.imageDescription }], gabarito_oficial: official,
    origens_provas: [{ ...q.origens_provas[0], numero_original: row.n, pagina: row.page, paginas_origem: [row.page], resposta_correta: index, gabarito_oficial: official }],
    classificacao_evidencia: `Caderno oficial COMVEST, Vestibular Unicamp 2026, 1ª fase, prova Q e X, página ${row.page}; gabarito oficial Q e X`
  })
  return q
})
if (questions.length !== 3 || questions.some((q, i) => q.numero_original !== i + 18 || q.opcoes.length !== 4 || answers[q.resposta_correta] !== rows[i].answer || q.apoio.length !== 1)) throw new Error('Lote 5 inválido')
const serialized = `${JSON.stringify(questions, null, 2)}\n`
await writeFile(new URL('src/data/unicamp-2026-primeira-fase-qx-lote-5.json', root), serialized)
await writeFile(new URL('questoes.json', outputDir), serialized)
console.log('Generated Unicamp 2026 Q/X questions 18–20 with separate original maps and four options each.')
