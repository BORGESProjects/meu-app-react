import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from '@napi-rs/canvas'

const root = new URL('../../', import.meta.url)
const source = path.resolve(fileURLToPath(root), '../../zip-provas-20261110-130605/UNICAMP/2026/f12026Q_X.pdf')
const outputDir = new URL('public/acervo/unicamp-2026-primeira-fase-qx-lote-6/', root)
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
  return `/acervo/unicamp-2026-primeira-fase-qx-lote-6/imagens/${name}`
}
const chart21 = await crop(9, 'unicamp-2026-qx-q21-assalariados-externos.png', { x: 462, y: 194, width: 385, height: 670 })
const photo22 = await crop(10, 'unicamp-2026-qx-q22-feijoada.png', { x: 125, y: 151, width: 250, height: 354 })

const rows = [
  {
    n: 21, pages: [7], answer: 'B', subject: 'Geografia', topic: 'Rede urbana e centralidade territorial', image: chart21,
    imageDescription: 'Gráfico original do número de assalariados externos ao município da sede da empresa, comparando 2012 e 2021.',
    stem: 'A segunda edição do estudo Gestão do Território, elaborado pelo Instituto Brasileiro de Geografia e Estatística (IBGE) em 2024, mostra, no universo dos 5.570 municípios do país, quais são os Centros de Gestão, isto é, os núcleos responsáveis pelo papel de comando na rede urbana brasileira. Em 2024, apenas 39,1% dos municípios do Brasil se qualificavam como Centros de Gestão do Território (2.176 municípios).\n\nUm indicador de centralidade na gestão do território é o número de assalariados externos ao Município da sede da empresa.\n\nCom base no gráfico e em seus conhecimentos sobre a rede urbana brasileira, é correto afirmar que',
    support: '',
    options: [
      'Rio de Janeiro, capital, amplia sua centralidade como centro de gestão empresarial do território nacional, conservando sua histórica função industrial e de administração pública.',
      'Barueri apresenta tendência de crescimento do assalariado externo, contribuindo para manter a Região Metropolitana de São Paulo no topo da hierarquia urbana.',
      'Brasília apresenta tendência de queda de seus assalariados externos, demonstrando a dificuldade da capital do país para permanecer como centro de gestão pública do território na atualidade.',
      'Itajaí apresenta destaque por sua função industrial, perdendo força na centralidade da gestão empresarial do território por ser uma cidade de médio porte na Região Metropolitana da Foz do Rio Itajaí.'
    ]
  },
  {
    n: 22, pages: [8], answer: 'D', subject: 'Sociologia', topic: 'Classes sociais, gosto e distinção', image: photo22,
    imageDescription: 'Fotografia da postagem do ator Chay Suede com uma feijoada servida em restaurante de luxo, reproduzida no texto 1 do caderno.',
    stem: 'Leia os textos 1 e 2.\n\nA partir dos textos, é correto afirmar que a polêmica associada à postagem',
    support: 'Texto 1 — A imagem reproduz uma postagem feita pelo ator Chay Suede sobre uma feijoada que havia consumido em um restaurante de luxo. As reações na rede social do ator incluíram comentários como “se isso é feijoada de rico eu prefiro morrer pobre”.\n\nTexto 2 — A forma como as pessoas vivenciam as diferentes classes deve gerar as probabilidades dessas pessoas terem certos gostos, certos estilos de vida. No caso das classes altas, essa lógica é a do desinteresse ou da não-necessidade. Uma vez afastada de toda a urgência da vida pela sobrevivência e pela reprodução, os sujeitos das classes altas possuem uma relação de distanciamento com o mundo. Esse distanciamento transforma o senso de distinção em senso estético nessa classe. O senso estético é a noção de que o belo se dá pela forma, e não pela função.',
    options: [
      'demonstra que a formação do gosto está mais relacionado a juízos pessoais, pois as práticas alimentares são guiadas por necessidades de sobrevivência e não produzem distinção social.',
      'representa uma aproximação social das classes altas em relação às populares, pois reduz a distância simbólica entre o universo do luxo e o popular, limitando o alcance da distinção social.',
      'demonstra que o gosto está mais relacionado a experiências de classe e menos a juízos pessoais, pois simboliza o gosto das classes altas pelo belo e um senso estético formado pela necessidade.',
      'representa uma prática de distinção social das classes altas em relação às populares, pois simboliza um senso estético que valoriza a forma e aquilo que não é necessário, em vez da função.'
    ]
  },
  {
    n: 23, pages: [8], answer: 'D', subject: 'Sociologia', topic: 'Sociedade, natureza e crise ambiental', image: '', imageDescription: '',
    stem: 'Leia os textos 1 e 2.\n\nA partir da leitura dos textos é correto afirmar que natureza e sociedade',
    support: 'Texto 1 — Muitos povos, de diferentes matrizes culturais, têm a compreensão de que nós e a Terra somos uma mesma entidade. Até o começo do século XX, o mundo do trabalho e da produção se dava com ferramentas e meios que não tinham a potência de exaurir os recursos da Terra como hoje. Desse tempo para cá, sobraram poucas humanidades espalhadas pelo planeta.\n\nTexto 2 — A Terra é um denso conjunto de relações que articula seres vivos, oceanos, atmosfera, clima e solos. Ela é dotada de uma história e de um regime de atividades próprio, resultado da articulação de múltiplos processos. Hoje, já não estamos lidando com uma natureza selvagem e ameaçadora, nem com uma natureza frágil, que deve ser protegida, nem com uma natureza que pode ser explorada à vontade. A hipótese é nova. A Terra não está ameaçada, diferentemente das inúmeras espécies vivas que serão varridas pelas mudanças de seu meio, com uma rapidez sem precedente.',
    options: [
      'passaram a se influenciar por meio do desenvolvimento das forças produtivas e do trabalho ao longo da história, o que coloca a natureza em risco.',
      'estão articuladas por múltiplos processos que envolvem agentes humanos e não humanos (oceanos, atmosfera, clima, solo, etc.), o que coloca a natureza em risco.',
      'possuem uma história comum e articulada, fato percebido por povos de diferentes matrizes culturais, o que coloca a sociedade em risco.',
      'possuem um regime de atividades próprio, que envolve agentes humanos e não humanos (oceanos, atmosfera, clima, solo, etc.), o que coloca tais agentes em risco.'
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
    materia: row.subject, conteudo: row.topic, enunciado: row.stem, texto_apoio: row.support,
    opcoes: row.options, opcoes_imagens: [], resposta_correta: index, pagina: row.pages[0], paginas_origem: row.pages,
    apoio: row.image ? [{ imagem: row.image, texto: row.imageDescription }] : [], gabarito_oficial: official,
    origens_provas: [{ ...q.origens_provas[0], numero_original: row.n, pagina: row.pages[0], paginas_origem: row.pages, resposta_correta: index, gabarito_oficial: official }],
    classificacao_evidencia: `Caderno oficial COMVEST, Vestibular Unicamp 2026, 1ª fase, prova Q e X, página ${row.pages.join('-')}; gabarito oficial Q e X`
  })
  return q
})
if (questions.length !== 3 || questions.some((q, i) => q.numero_original !== i + 21 || q.opcoes.length !== 4 || answers[q.resposta_correta] !== rows[i].answer || !q.enunciado.trim()) || !questions[0].apoio.length || !questions[1].apoio.length || !questions[2].texto_apoio) throw new Error('Lote 6 inválido')
const serialized = `${JSON.stringify(questions, null, 2)}\n`
await writeFile(new URL('src/data/unicamp-2026-primeira-fase-qx-lote-6.json', root), serialized)
await writeFile(new URL('questoes.json', outputDir), serialized)
console.log('Generated Unicamp 2026 Q/X questions 21–23 with visual support and four options each.')
