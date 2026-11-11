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
const outputDir = new URL('public/acervo/unicamp-2026-primeira-fase-qx-lote-2/', root)
const imagesDir = new URL('imagens/', outputDir)
await mkdir(imagesDir, { recursive: true })
const pdf = await pdfjs.getDocument({ data: new Uint8Array(await readFile(sourcePath)), useSystemFonts: true }).promise

async function renderCrop(pageNumber, name, box, altText) {
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
  return { imagem: `/acervo/unicamp-2026-primeira-fase-qx-lote-2/imagens/${filename}`, texto: altText }
}

const q10Image = await renderCrop(5, 'unicamp-2026-qx-q10-circuito-bateria', { x: 512, y: 560, width: 277, height: 211 }, 'Esquema de circuito com uma bateria de força eletromotriz 3,6 V e resistência interna de 1,2 Ω, ligada a um resistor de 6,0 Ω e a um voltímetro.')

const rows = [
  {
    n: 6, pages: [2], answer: 'C', subject: 'Inglês', topic: 'Compreensão de resumo científico',
    stem: 'Leia o resumo de um artigo científico.\n\nDe acordo com o resumo, é correto afirmar que',
    supportText: 'Incels: Masculinity in the Transition to Adulthood\n\nIncels are men who are members of an online community that experiences an unmet desire for sex and blame women for their struggle. Since 2019 there have been several mass murder attacks committed by Incels motivated by Incel ideology creating a threat of future violence. While the vast majority of Incels do not commit such attacks, researchers have begun to study Incels to prevent violence and uncover the true nature of this community. The study of Incels is incipient; therefore, more knowledge about interventions to address the struggles of involuntary celibacy is needed. This paper emphasizes the masculinity strain experienced by Incels who attempt to perform hegemonic masculinity as part of the transition to adulthood but fall short because of their lack of sexual activity. This work proposes the creation and implementation of Incel-specific, online therapeutic interventions and continued research directly with the Incel community to uncover the complexities of Incel experiences.',
    options: [
      '“Incel” é uma comunidade majoritariamente constituída por homens que culpam mulheres por questionarem sua masculinidade.',
      'as pesquisas sobre a comunidade “Incel” ainda são escassas, por isso há a necessidade de mais estudos que definam teoricamente a abstinência sexual.',
      'homens “Incel”, muitas vezes, tentam exercer uma masculinidade dominante que resulta em expectativas frustradas devido à inatividade sexual.',
      'a pesquisa propõe práticas terapêuticas que integrem homens “Incel” a outros grupos sociais para melhor compreender as complexidades da masculinidade.'
    ], support: []
  },
  {
    n: 7, pages: [2, 3], answer: 'D', subject: 'Inglês', topic: 'Compreensão de carta aberta',
    stem: 'Leia a carta a seguir.\n\nAssinale a alternativa correta em relação ao posicionamento do presidente de Harvard em sua carta.',
    supportText: 'Dear Members of the Harvard Community,\n\nFor years, the federal government’s grants to Harvard have helped lead to groundbreaking innovations. Recently, the federal government has threatened its partnerships over accusations of antisemitism on our campuses. A list of demands was issued, warning that Harvard must comply if we intend to “maintain our financial relationship with the government.” Most of these demands are unprecedented and represent direct governmental regulation of the “intellectual conditions” at Harvard.\n\nThey include requirements to audit the viewpoints of our students and faculty, and to “reduce their power” for their ideological views. We will not accept that. The University will not surrender its independence or relinquish its constitutional rights. No government should dictate what universities can teach and which areas of inquiry they can pursue.\n\nWe do not take our moral duties lightly and we have taken many steps to address and fight antisemitism on campus. However, this will not be achieved by assertions of power, unmoored from the law, to dictate how we operate.\n\nSincerely,\nAlan M. Garber\n(President of Harvard University)',
    options: [
      'As acusações de antissemitismo feitas à universidade são inconstitucionais, por isso Garber se recusa a aceitar as demandas propostas pelo governo.',
      'As comparações entre as ideologias de professores e de alunos são sem precedentes, por isso Garber se nega a abrir mão da liberdade de expressão da comunidade.',
      'As justificativas do governo para interromper o financiamento são falhas, por isso Garber se nega a tomar medidas para resolver os problemas apontados.',
      'As demandas do governo são uma tentativa de controle da autonomia das universidades, por isso Garber se recusa a acatar as exigências impostas.'
    ], support: []
  },
  {
    n: 8, pages: [3], answer: 'D', subject: 'Física', topic: 'Transferência de calor',
    stem: 'A uniformidade da temperatura em um ambiente refrigerado depende, além do bom funcionamento do aparelho de ar condicionado, de uma instalação adequada, visando a uma transferência de calor eficiente. Isso pode ser verificado pelo instalador utilizando um termômetro de infravermelho para inspecionar diferentes áreas do recinto. Analise as afirmativas 1, 2, 3 e 4 sobre os mecanismos de transferência de calor: condução, convecção e radiação.\n\n1) A transferência de calor por condução térmica pode ocorrer tanto no vácuo quanto em um meio material.\n\n2) A taxa de condução de calor em uma barra não depende da diferença entre as temperaturas de suas extremidades.\n\n3) A convecção consiste no transporte de energia térmica de uma região para outra por meio do deslocamento de uma massa de fluido.\n\n4) A transferência de calor por radiação térmica pode ocorrer tanto no vácuo quanto em um meio material.\n\nAs afirmativas corretas são:',
    supportText: '',
    options: ['1 e 2.', '1 e 4.', '2 e 3.', '3 e 4.'], support: []
  },
  {
    n: 9, pages: [3], answer: 'C', subject: 'Física', topic: 'Corrente elétrica e carga',
    stem: 'Uma bateria inicialmente carregada fornece uma corrente constante de i = 4 000 mA durante o tempo Δt = 1 hora, ficando descarregada no final desse processo. A carga elétrica Q, que circula por essa bateria nesse intervalo de tempo é',
    supportText: 'Texto para as questões 9, 10 e 11.\n\nAs baterias são fundamentais no mundo moderno, sendo a fonte de energia portátil que alimenta dispositivos como celulares e laptops, veículos elétricos e sistemas de armazenamento de energia renovável. Duas grandezas que caracterizam uma bateria é a sua capacidade de carga elétrica, expressa em miliampère-hora (mAh) e a energia que ela armazena, usualmente dada em watts-hora (Wh).',
    options: ['4 C.', '4 000 C.', '14 400 C.', '14 400 000 C.'], support: []
  },
  {
    n: 10, pages: [3], answer: 'B', subject: 'Física', topic: 'Circuitos elétricos e força eletromotriz',
    stem: 'De forma simplificada, o comportamento de uma bateria pode ser modelado com uma fonte ideal de diferença de potencial elétrico U_b em série com um resistor de resistência R_b. Dessa maneira, o dispositivo que é alimentado pela bateria pode, muitas vezes, ser representado por um resistor de resistência R. Na situação exemplificada na figura, a diferença de potencial registrada pelo voltímetro é',
    supportText: 'Texto para as questões 9, 10 e 11.\n\nAs baterias são fundamentais no mundo moderno, sendo a fonte de energia portátil que alimenta dispositivos como celulares e laptops, veículos elétricos e sistemas de armazenamento de energia renovável. Duas grandezas que caracterizam uma bateria é a sua capacidade de carga elétrica, expressa em miliampère-hora (mAh) e a energia que ela armazena, usualmente dada em watts-hora (Wh).',
    options: ['0,6 V.', '3,0 V.', '3,6 V.', '4,3 V.'], support: [q10Image]
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
    opcoes: row.options, rotulos_opcoes: labels, resposta_correta: answerIndex, anulada: false,
    tipo_resposta: 'alternativa', tipo: 'objetiva', provas: ['Vestibular Unicamp 2026 — 1ª fase — prova Q e X'],
    documento_id: 'unicamp-2026-fase-1-qx', documento_origem: 'f12026Q_X.pdf', arquivo_origem: 'f12026Q_X.pdf',
    pagina: row.pages[0], paginas_origem: row.pages, fonte_pdf: pdfUrl, fonte_gabarito: keyUrl,
    apoio: row.support, gabarito_oficial: official,
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

if (questions.length !== 5 || questions.some((q, i) => q.numero_original !== i + 6 || q.opcoes.length !== 4 || q.rotulos_opcoes.length !== 4 || !q.gabarito_oficial.verificada || labels[q.resposta_correta] !== rows[i].answer || !q.enunciado.trim() || q.opcoes.some(option => !option.trim())) || !questions[4].apoio.some(a => a.imagem)) {
  throw new Error('Validação estrutural, imagem ou gabarito Unicamp 2026 Q/X q6–10 falhou')
}

await writeFile(new URL('src/data/unicamp-2026-primeira-fase-qx-lote-2.json', root), `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
await writeFile(new URL('questoes.json', outputDir), `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
console.log('Generated Unicamp 2026 Q/X questions 6–10 with four alternatives and verified text/visual support.')
