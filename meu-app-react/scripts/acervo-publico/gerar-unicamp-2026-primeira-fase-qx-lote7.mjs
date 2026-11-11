import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = new URL('../../', import.meta.url)
const source = path.resolve(fileURLToPath(root), '../../zip-provas-20261110-130605/UNICAMP/2026/f12026Q_X.pdf')
await access(source)
const outputDir = new URL('public/acervo/unicamp-2026-primeira-fase-qx-lote-7/', root)
await mkdir(outputDir, { recursive: true })

const rows = [
  {
    n: 24, pages: [8, 9], answer: 'C', subject: 'Sociologia', topic: 'Socialização, gênero e adolescência',
    stem: 'Leia os textos 1 e 2.\n\nA partir da leitura dos textos é correto afirmar que',
    support: 'Texto 1 — A adolescência é uma questão de corporificação do social. Mudanças físicas, como hormônios em ebulição, são importantes, mas elas não determinam como se experimenta a adolescência. Essa é uma questão de como as práticas sociais se relacionam com as mudanças físicas, dando significados sociais a eventos biológicos. A adolescência é um processo de se tornar participante do mundo adulto. Ela é um período em que corpos em desenvolvimento enfrentam desafios, e às vezes são danificados. Instituições, incluindo a escola, e os poderes do mundo adulto são confrontados e negociados. Isso forma uma arena de prazer, humor, curiosidade, mas também de ansiedade e violência.\n\nTexto 2 — Ordens de gênero são centrais para a vida dos adolescentes. Quando insistem na diferença absoluta entre masculinidade e feminilidade criam um dilema e fazem com que os meninos exagerem na performance da masculinidade, procurando se aproximarem da posição social dos homens adultos. Práticas corporais, como a sexualidade e o esporte, se tornam importantes meios de diferenciação e espaços de produção das masculinidades hegemônicas e subordinadas. Aquelas que produzem maior status e prestígio masculino são as com os efeitos mais tóxicos sobre os corpos dos adolescentes, como por exemplo o hábito de fumar e praticar a violência física, etc.',
    options: [
      'a adolescência, como processo de participar do mundo adulto, desafia padrões previamente estabelecidos, promovendo riscos e violência que poderiam ser evitados caso tais padrões fossem mantidos.',
      'masculinidades hegemônicas e subordinadas são produzidas biológica e socialmente, por meio de práticas corporais como a sexualidade e o esporte e em confronto com instituições, como a escola.',
      'eventos biológicos associados às mudanças corporais da adolescência são significados socialmente, o que torna a ordem de gênero em que tais mudanças ocorrem importante para compreendermos masculinidades e feminilidades.',
      'a precocidade na busca de status de adultos e do prestígio masculino por meninos adolescentes os torna ansiosos, fazendo das masculinidades juvenis contemporâneas um todo homogêneo e violento.'
    ]
  },
  {
    n: 25, pages: [9], answer: 'C', subject: 'Sociologia', topic: 'Gênero, reconhecimento e democracia',
    stem: 'Considerando o texto, assinale a alternativa correta.',
    support: 'A OMS, e não uma associação trans-gay-lésbica-anarcofeminista, afirma hoje que “o gênero tipicamente descrito como masculino e feminino é uma construção social que varia segundo as culturas e épocas”. A partir desse princípio, a OMS reconhece a dimensão arbitrária e inatural da taxonomia binária com a qual as instituições sociais e políticas trabalham no Ocidente e abre a porta para uma revisão mais profunda do paradigma da diferença sexual. Nos próximos anos, deveremos elaborar coletivamente uma epistemologia capaz de dar conta da multiplicidade radical dos seres vivos, que não reduza o corpo à sua força reprodutiva heterossexual, que não legitime a violência heteropatriarcal e colonial. Quando falo de uma nova epistemologia me refiro também a um processo de ampliação radical do horizonte democrático para reconhecer como sujeito político todo corpo vivo sem que a designação sexual ou de gênero seja a condição desse reconhecimento social e político (84).',
    options: [
      'A diferença sexual entre homem e mulher é informada pela biologia e indiferente a variações culturais, a despeito do que dizem a OMS e as associações feministas, gays, lésbicas e trans.',
      'Embora seja inevitável admitir que haja pessoas que não se enquadram na taxonomia binária, é necessário elaborar coletivamente caminhos para ajudá-las a uma reconciliação com a própria natureza.',
      'As instituições sociais e políticas operam normalmente com uma taxonomia binária violenta e excludente da multiplicidade de seres humanos, que precisa ser revista em nome da ampliação do nosso horizonte democrático.',
      'Gênero e sexualidade são categorias identitárias inadequadas ao processo de ampliação do horizonte democrático com vistas ao reconhecimento social e político de todos os indivíduos em função do seu próprio mérito.'
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
    apoio: [], gabarito_oficial: official,
    origens_provas: [{ ...q.origens_provas[0], numero_original: row.n, pagina: row.pages[0], paginas_origem: row.pages, resposta_correta: index, gabarito_oficial: official }],
    classificacao_evidencia: `Caderno oficial COMVEST, Vestibular Unicamp 2026, 1ª fase, prova Q e X, página ${row.pages.join('-')}; gabarito oficial Q e X`
  })
  return q
})
if (questions.length !== 2 || questions.some((q, i) => q.numero_original !== i + 24 || q.opcoes.length !== 4 || answers[q.resposta_correta] !== rows[i].answer || !q.texto_apoio.trim())) throw new Error('Lote 7 inválido')
const serialized = `${JSON.stringify(questions, null, 2)}\n`
await writeFile(new URL('src/data/unicamp-2026-primeira-fase-qx-lote-7.json', root), serialized)
await writeFile(new URL('questoes.json', outputDir), serialized)
console.log('Generated Unicamp 2026 Q/X questions 24–25 with complete support texts and four options each.')
