import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from '@napi-rs/canvas'

const root = new URL('../../', import.meta.url)
const projectPath = fileURLToPath(root)
const sourceCandidates = [
  path.resolve(projectPath, 'tmp/zip-provas-20261110-130605/UNICAMP/2026/f12026Q_X.pdf'),
  path.resolve(projectPath, '../../zip-provas-20261110-130605/UNICAMP/2026/f12026Q_X.pdf')
]
let sourcePath
for (const candidate of sourceCandidates) {
  try { await access(candidate); sourcePath = candidate; break } catch { /* tenta a extração irmã */ }
}
if (!sourcePath) throw new Error('PDF oficial f12026Q_X.pdf não encontrado no pacote local de provas.')

const pdfUrl = 'https://www.comvest.unicamp.br/vest2026/F1/f12026Q_X.pdf'
const keyUrl = 'https://www.comvest.unicamp.br/vest2026/F1/Q_X-gabarito.pdf'
const outputDir = new URL('public/acervo/unicamp-2026-primeira-fase-qx-lote-3/', root)
const imagesDir = new URL('imagens/', outputDir)
await mkdir(imagesDir, { recursive: true })
const pdf = await pdfjs.getDocument({ data: new Uint8Array(await readFile(sourcePath)), useSystemFonts: true }).promise

async function renderCrop(pageNumber, name, box) {
  const page = await pdf.getPage(pageNumber)
  const scale = 2.5
  const viewport = page.getViewport({ scale })
  const sourceCanvas = createCanvas(viewport.width, viewport.height)
  await page.render({ canvasContext: sourceCanvas.getContext('2d'), viewport }).promise
  const cropScale = scale / 1.5 // caixas medidas no PNG de conferência em escala 1,5×
  const crop = createCanvas(Math.round(box.width * cropScale), Math.round(box.height * cropScale))
  crop.getContext('2d').drawImage(sourceCanvas,
    Math.round(box.x * cropScale), Math.round(box.y * cropScale), crop.width, crop.height,
    0, 0, crop.width, crop.height)
  const filename = `${name}.png`
  await writeFile(new URL(filename, imagesDir), crop.toBuffer('image/png'))
  return `/acervo/unicamp-2026-primeira-fase-qx-lote-3/imagens/${filename}`
}

const graphImages = [
  await renderCrop(6, 'unicamp-2026-qx-q13-grafico-a', { x: 43, y: 740, width: 327, height: 230 }),
  await renderCrop(6, 'unicamp-2026-qx-q13-grafico-b', { x: 43, y: 968, width: 327, height: 253 }),
  await renderCrop(6, 'unicamp-2026-qx-q13-grafico-c', { x: 485, y: 72, width: 332, height: 211 }),
  await renderCrop(6, 'unicamp-2026-qx-q13-grafico-d', { x: 485, y: 298, width: 332, height: 247 })
]

const textoBaterias = 'Texto para as questões 9, 10 e 11.\n\nAs baterias são fundamentais no mundo moderno, sendo a fonte de energia portátil que alimenta dispositivos como celulares e laptops, veículos elétricos e sistemas de armazenamento de energia renovável. Duas grandezas que caracterizam uma bateria é a sua capacidade de carga elétrica, expressa em miliampère-hora (mAh) e a energia que ela armazena, usualmente dada em watts-hora (Wh).'
const textoMovimento = 'Texto para as questões 13 e 14.\n\nRecentemente, grandes cidades iniciaram a implantação de faixas exclusivas para motocicletas como, por exemplo, a faixa azul na cidade de São Paulo. Um motociclista adentra, em t = 0, um percurso retilíneo de uma faixa azul com velocidade constante v₀ = 36 km/h e mantém essa velocidade até o tempo t = 30 s (trecho I). Em seguida, continua o percurso com desaceleração constante (a < 0) até parar completamente diante de um semáforo em t = 50 s (trecho II). Após mais 30 s, ele retoma o movimento e mantém uma aceleração constante e positiva a = 0,8 m/s² desde t = 80 s até t = 95 s (trecho III). Posteriormente, o motociclista segue com velocidade constante até t = 120 s (trecho IV).'

const rows = [
  {
    n: 11, pages: [3], answer: 'C', subject: 'Física', topic: 'Energia potencial gravitacional e conversões energéticas',
    stem: 'Outra bateria totalmente carregada armazena uma energia E_b = 15 Wh. Devemos elevar uma massa m = 45 kg até a altura y, em relação ao solo, para que a variação da energia potencial gravitacional E_p desse sistema mecânico seja igual à energia armazenada nessa bateria. A altura y deve ser.\n\nDado: g = 10 m/s².',
    supportText: textoBaterias,
    options: ['0,03 m.', '3 m.', '120 m.', '1 200 m.'], opcoesImagens: []
  },
  {
    n: 12, pages: [4], answer: 'A', subject: 'Física', topic: 'Lentes delgadas e formação de imagens',
    stem: 'O Centro de Tecnologia da Informação (CTI) Renato Archer, em Campinas (SP), possui equipamentos avançados de manufatura 3D, incluindo uma impressora capaz de produzir uma miniatura do Cristo Redentor, com pouco mais de 100 μm. Menor que um grão de areia, a peça só é visível com microscópio óptico, baseado no arranjo de um conjunto de lentes. Se uma lente delgada, de distância focal f, é usada para investigar um objeto de altura o, de forma que a imagem seja direita com altura i maior que a do objeto (i > o), é correto afirmar que',
    supportText: '',
    options: [
      'a lente é convergente e a distância entre objeto e lente é menor que a distância focal.',
      'a lente é divergente e a distância entre objeto e lente é menor que a distância focal.',
      'a lente é convergente e a distância entre objeto e lente é maior que a distância focal.',
      'a lente é divergente e a distância entre objeto e lente é maior que a distância focal.'
    ], opcoesImagens: []
  },
  {
    n: 13, pages: [4], answer: 'A', subject: 'Física', topic: 'Movimento uniformemente variado e gráficos posição-tempo',
    stem: 'Qual é o gráfico que representa a posição s(t) do motociclista em função do tempo t?',
    supportText: textoMovimento,
    options: ['Gráfico da alternativa A.', 'Gráfico da alternativa B.', 'Gráfico da alternativa C.', 'Gráfico da alternativa D.'],
    opcoesImagens: graphImages
  },
  {
    n: 14, pages: [4], answer: 'B', subject: 'Física', topic: 'Dinâmica e segunda lei de Newton',
    stem: 'A massa do conjunto motociclista + motocicleta é dada por m = 180 kg. Para o trecho entre os tempos t = 30 s e t = 50 s, em que o movimento tem desaceleração constante, é correto afirmar que o módulo da força resultante que age nesse conjunto é igual a',
    supportText: textoMovimento,
    options: ['36 N.', '90 N.', '324 N.', '1 800 N.'], opcoesImagens: []
  },
  {
    n: 15, pages: [4, 5], answer: 'A', subject: 'Geografia', topic: 'Globalização e sistemas alimentares',
    stem: 'A partir do texto, é correto afirmar que a produção e o consumo de alimentos no mundo contemporâneo possuem',
    supportText: '“O ato de comer é construído culturalmente, e mediado por práticas, crenças, comportamentos, tabus, que formam os hábitos alimentares, que, por sua vez, relacionam-se a aspectos culturais, socioeconômicos e psicológicos que envolvem o ambiente alimentar de cada indivíduo. Os hábitos alimentares são dinâmicos e sensíveis às mudanças que ocorrem nas sociedades, fundamentalmente, nos sistemas alimentares. Com o sistema alimentar que predomina hoje, a humanidade vem substituindo a comida que carrega significados culturais e tradições ancestrais por produtos alimentares ultraprocessados globalizados, que viajam quilômetros até chegar ao prato, causando a homogeneização dos hábitos alimentares de forma global. O problema é que os ultraprocessados têm acarretado sérios problemas à saúde da população [...]”.',
    options: [
      'menor vínculo com o lugar, visto que a indústria de processamento de alimentos e a produção agropecuária estão cada vez mais especializadas. Assim, produtos circulam com maior velocidade e eficiência entre a área de produção e o mercado consumidor, reduzindo o acesso da população a alimentos in natura e à diversidade produtiva regional.',
      'maior interdependência com o lugar, visto que a indústria de processamento precisa manter a proximidade com as áreas da produção agropecuária, aproveitando a modernização do sistema de circulação para atingir o mercado consumidor mais distante. Isso fortalece o acesso da população a produtos da agricultura familiar e à diversidade produtiva regional.',
      'maior conexão com o lugar, visto que a indústria de processamento de alimentos pode estar distante da área de produção agropecuária. O sistema de circulação permite interligar, com menor custo, a área de produção ao mercado consumidor, restringindo o acesso da população à produção da pequena indústria local e à diversidade alimentar regional.',
      'menor correlação com o lugar, visto que a indústria de processamento e a produção agropecuária possuem pouca vinculação entre si, tornando-se independentes, mas com estreitamento promovido pelo sistema de circulação entre a área de produção e o mercado consumidor. Isso favorece o acesso da população aos alimentos da culinária local e à diversidade alimentar regional.'
    ], opcoesImagens: []
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
    aplicacao: '2025 — 1ª fase', materia: row.subject, conteudo: row.topic, dificuldade: 'Média', dificuldade_estimada: true,
    dificuldade_metodo: 'estimativa editorial pela complexidade de leitura e interpretação',
    enunciado: row.stem, texto_apoio: row.supportText, enunciado_antes_apoio: '',
    opcoes: row.options, opcoes_imagens: row.opcoesImagens, rotulos_opcoes: labels, resposta_correta: answerIndex, anulada: false,
    tipo_resposta: 'alternativa', tipo: 'objetiva', provas: ['Vestibular Unicamp 2026 — 1ª fase — prova Q e X'],
    documento_id: 'unicamp-2026-fase-1-qx', documento_origem: 'f12026Q_X.pdf', arquivo_origem: 'f12026Q_X.pdf',
    pagina: row.pages[0], paginas_origem: row.pages, fonte_pdf: pdfUrl, fonte_gabarito: keyUrl,
    apoio: [], gabarito_oficial: official,
    origens_provas: [{ concurso: 'Vestibular Unicamp 2026 — 1ª fase', aplicacao: '2025', modelo: 'Q e X', numero_original: row.n, pagina: row.pages[0], paginas_origem: row.pages, arquivo_origem: 'f12026Q_X.pdf', fonte_pdf: pdfUrl, fonte_gabarito: keyUrl, resposta_correta: answerIndex, anulada: false, gabarito_oficial: official }],
    classificacao_revisada: true, classificacao_pendente: false, classificacao_confianca: 1,
    classificacao_metodo: 'classificação editorial pela habilidade diretamente cobrada no caderno oficial',
    classificacao_evidencia: `Caderno oficial COMVEST, Vestibular Unicamp 2026, 1ª fase, prova Q e X, página ${row.pages.join('-')}; gabarito oficial Q e X`,
    integridade_profissional: { verificada_individualmente: true, apta_resolucao: true, pendencias: [], fontes_verificadas: true, questao_completa: true },
    elegibilidade: { elegivel_para_resolucao: true, elegivel_para_correcao_automatica: true, apontamentos: [] },
    origem: 'Caderno e gabarito oficiais — Vestibular Unicamp 2026 — 1ª fase — prova Q e X'
  })
  return question
})

if (questions.length !== 5 || questions.some((q, i) => q.numero_original !== i + 11 || q.opcoes.length !== 4 || q.rotulos_opcoes.length !== 4 || !q.gabarito_oficial.verificada || labels[q.resposta_correta] !== rows[i].answer || !q.enunciado.trim() || q.opcoes.some(option => !option.trim())) || questions[2].opcoes_imagens.length !== 4) {
  throw new Error('Validação estrutural, imagens ou gabarito Unicamp 2026 Q/X q11–15 falhou')
}

await writeFile(new URL('src/data/unicamp-2026-primeira-fase-qx-lote-3.json', root), `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
await writeFile(new URL('questoes.json', outputDir), `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
console.log('Generated Unicamp 2026 Q/X questions 11–15 with four alternatives and separate graph choices.')
