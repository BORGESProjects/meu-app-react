import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = 'a55cf7d44f34f65d'
const prova = 'https://cdn.cebraspe.org.br/concursos/TELEBRAS_25/arquivos/1DC5A5C6E33295AFF0ED4742C9843FE1CEB82C1CC8F82AB35835920D00786CF5.pdf'
const raw = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`, 'utf8'))

const topics = new Map([
  [51, 'Planejamento, programação e controle de projetos e obras'],
  [52, 'Segurança e higiene do trabalho em obras — identificação e controle de riscos'],
  [53, 'Controle técnico, físico-financeiro e econômico de obras'],
  [54, 'Contenção de taludes e estabilidade global em escavações'],
  [55, 'Terraplenagem e adequação do terreno ao projeto'],
  [56, 'Canteiro de obras — segurança, produtividade e bem-estar'],
  [57, 'Fundações de edificações — escolha do tipo e investigação do subleito'],
  [58, 'Concreto armado — cobrimento de armaduras e execução de vigas'],
  [59, 'Alvenaria estrutural — paredes portantes e dimensionamento'],
  [60, 'Estruturas metálicas — parafusos e controle de pré-tensão'],
  [61, 'Estruturas metálicas — carregamentos, resistência e estabilidade'],
  [62, 'Instalações hidráulicas prediais — dimensionamento de água fria'],
  [63, 'Instalações elétricas prediais — condutores e proteção'],
  [64, 'Segurança contra incêndio em edificações — prevenção e proteção'],
  [65, 'Pisos de edificações — cargas e dimensionamento'],
  [66, 'Revestimentos cerâmicos de fachadas — argamassa e juntas'],
  [67, 'Impermeabilização de lajes de cobertura'],
  [68, 'Rodovias — drenagem superficial e controle de erosão'],
  [69, 'Pavimentação rodoviária — camadas estruturais'],
  [70, 'Projeto geométrico de rodovias — superelevação'],
  [71, 'Terraplenagem rodoviária — escavação, transporte e compactação'],
  [72, 'Custos rodoviários — movimento de terra e balanço de massas'],
  [73, 'Hidrologia aplicada — estimativa de vazões para bueiros rodoviários'],
  [74, 'Saneamento — redes de distribuição de água potável'],
  [75, 'Saneamento — etapas de tratamento de esgoto'],
  [76, 'Materiais de pavimentação — comportamento reológico de ligantes betuminosos'],
  [77, 'Mecânica dos solos — limite de plasticidade e limites de consistência'],
  [78, 'Mecânica dos solos — teor de umidade'],
  [79, 'Mecânica dos solos — ensaio de compactação e controle tecnológico'],
  [80, 'Fundações superficiais — sapatas, vigas de fundação e radier'],
  [81, 'Mecânica dos solos — resistência ao cisalhamento e critério de Mohr-Coulomb'],
  [82, 'Mecânica dos solos — empuxo ativo e muros de arrimo'],
  [83, 'Geotecnia — estabilidade de taludes e poropressões'],
  [84, 'Prospecção geotécnica — solos compressíveis, adensamento e recalques'],
  [85, 'Infraestrutura ferroviária — subleito e lastro'],
  [86, 'Barragens — erosão interna e piping'],
  [87, 'Barragens — vertedouros e segurança hidráulica'],
  [88, 'Barragens de terra — filtros e sistemas internos de drenagem'],
  [89, 'Barragens de gravidade — estabilidade e fundações'],
  [90, 'Análise estrutural de vigas — flexão, cisalhamento e tensões'],
  [91, 'Análise estrutural de vigas — reações, esforço cortante e momento fletor'],
  [92, 'Análise estrutural de vigas — diagramas de esforço cortante'],
  [93, 'Análise estrutural de vigas — vínculos, engaste e momento fletor'],
  [94, 'Resistência dos materiais — distribuição de tensão de cisalhamento'],
  [95, 'Concreto armado — armadura negativa em lajes contínuas'],
  [96, 'Concreto armado — taxa mínima de armadura longitudinal em pilares'],
  [101, 'Estruturas pré-moldadas — içamento e montagem de vigas'],
  [102, 'Estruturas pré-moldadas — apoios provisórios e definitivos'],
  [103, 'Concreto protendido — teor de cloretos e corrosão sob tensão'],
  [104, 'Concreto armado — cloretos e corrosão de armaduras'],
  [105, 'Materiais cimentícios — resistência a sulfatos e cimento de alto-forno'],
  [106, 'Materiais cimentícios — reação álcali-agregado e cimento pozolânico'],
  [107, 'Durabilidade do concreto — águas puras, ácidas e carbônicas'],
  [108, 'Orçamento de obras públicas — análise paramétrica de custos'],
  [109, 'Orçamento de obras públicas — análise paramétrica no Novo PAC'],
  [110, 'Orçamento de obras — composição do BDI'],
  [111, 'Orçamento de obras — composição dos benefícios e despesas indiretas'],
  [112, 'Orçamento de obras — composição de custos unitários'],
  [113, 'Contratos de obras públicas — empreitada por preço global e medição'],
  [114, 'Contratos de obras públicas — licenciamento ambiental'],
  [115, 'Contratos de obras públicas — reajustamento de preços'],
  [116, 'Engenharia portuária — proteção catódica de estruturas de concreto'],
  [117, 'Engenharia portuária — ensecadeiras e obras temporárias'],
  [118, 'Engenharia portuária — fundações submersas e estacas'],
  [119, 'Engenharia portuária — dragagem e materiais dragados'],
  [120, 'Engenharia portuária — proteção anticorrosiva em ambiente marinho']
])

const contexts = [
  [51, 53, 'Com relação ao planejamento de projetos e obras de engenharia, julgue os itens a seguir.'],
  [54, 57, 'Acerca de projetos e execução de serviços de obras de edificações, julgue os itens seguintes.'],
  [58, 61, 'A respeito de projeto e execução de edificações, julgue os itens.'],
  [62, 64, 'No que concerne a instalações prediais em edificações, julgue os itens a seguir.'],
  [65, 67, 'Em relação aos serviços de revestimentos, pisos e impermeabilização em obras de edificação, julgue os itens subsecutivos.'],
  [68, 72, 'No que tange a projeto e execução de rodovias, pavimentação e drenagem, julgue os itens a seguir.'],
  [73, 75, 'Acerca de hidráulica, saneamento e redes de água e esgoto, julgue os itens que se seguem.'],
  [76, 79, 'Julgue os itens subsequentes, relativos a materiais de construção civil e características dos solos.'],
  [80, 83, 'A respeito de aspectos da mecânica de solos que envolvem resistência, empuxos, taludes e fundações, julgue os próximos itens.'],
  [84, 85, 'No que se refere a ferrovias e prospecção geotécnica, julgue os seguintes itens.'],
  [86, 89, 'Acerca do projeto e da execução de barragens, julgue os itens subsequentes.'],
  [90, 94, 'A figura da página original mostra uma viga biapoiada, de seção retangular (b = 20 cm; h = 50 cm), submetida ao carregamento indicado. Considere o regime elástico linear e despreze o peso próprio. A imagem original da prova, com o esquema de carregamento, está preservada junto à questão.'],
  [95, 100, 'A respeito das características mecânicas e reológicas do concreto e do dimensionamento de estruturas de concreto conforme a prática normativa e de projeto, julgue os itens.'],
  [101, 102, 'Acerca do projeto e da execução de estruturas de concreto pré-moldado, julgue os próximos itens.'],
  [103, 107, 'Julgue os itens relativos à durabilidade do concreto e à seleção de materiais cimentícios para diferentes condições de exposição.'],
  [108, 115, 'Julgue os itens relativos ao orçamento de referência, aos custos e à contratação de obras e serviços de engenharia.'],
  [116, 120, 'Julgue os itens relativos a obras portuárias, estruturas marítimas e proteção contra corrosão em ambiente marinho.']
]

const cleanup = s => (s || '')
  .replace(/\u000c/g, ' ')
  .replace(/\s*-\s+/g, '-')
  .replace(/\bca\s+bendo\b/gi, 'cabendo')
  .replace(/\bestrut\s+urais\b/gi, 'estruturais')
  .replace(/\bvaz\s+ão\b/gi, 'vazão')
  .replace(/\binc\s+êndio\b/gi, 'incêndio')
  .replace(/\bbetumino\s+sos\b/gi, 'betuminosos')
  .replace(/\bplást\s+ico\b/gi, 'plástico')
  .replace(/\bde\s+ve\b/gi, 'deve')
  .replace(/\bs\s+ubleito\b/gi, 'subleito')
  .replace(/\besquemati\s+camente\b/gi, 'esquematicamente')
  .replace(/\bsimulta\s+neamente\b/gi, 'simultaneamente')
  .replace(/\bproteg\s+idas\b/gi, 'protegidas')
  .replace(/\bor\s+çamento\b/gi, 'orçamento')
  .replace(/\bexecuç\s+ão\b/gi, 'execução')
  .replace(/\s+/g, ' ')
  .replace(/\s+([.,;:!?])/g, '$1')
  .replace(/\s+(?:CEBRASPE\s*[–-]\s*TELEBRAS\b|A respeito de projeto e execução de edificações\b|No que tange a projeto e execução de rodovias\b|Acerca de hidráulica, saneamento e redes\b|A respeito d\s*e aspectos da mecânica de solos\b|A respeito de características mecânicas e reológicas\b|A figura precedente representa\b)[\s\S]*$/iu, '')
  .trim()

const start = raizesAtuais.findIndex(r => r.includes('revisao-cti-oral-respostas-2023-v147'))
if (start < 0) throw new Error('Base v147 não encontrada')
const base = raizesAtuais[start]
const bases = raizesAtuais.slice(start)
const manifest = JSON.parse(await lerArquivoAtual('manifesto.json', bases))
const active = new Map()
for (const lot of manifest.lotes) {
  if (!lot.arquivo) continue
  const questions = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo, bases)))
  for (const q of questions) if (q.documento_id === doc) active.set(q.id, q)
}
if (raw.length !== 66 || raw.some(x => !topics.has(Number(x.numero)) || !active.has(x.id))) throw new Error(`Lote inesperado: ${raw.length} registros exportados`)

const decisions = raw.map(x => {
  const n = Number(x.numero)
  const q = active.get(x.id)
  const context = contexts.find(([first, last]) => n >= first && n <= last)?.[2]
  if (!context || !x.imagem || !x.imagem.startsWith(`paginas/${doc}-`)) throw new Error(`Contexto ou imagem original ausente no item ${n}`)
  const stem = cleanup(x.enunciado)
  if (stem.length < 30) throw new Error(`Enunciado incompleto no item ${n}`)
  return {
    id: x.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia: 'Engenharia Civil',
    conteudo: topics.get(n),
    ano: 2025,
    concurso: 'Telebras 2025 — CEBRASPE',
    numero_original: n,
    pagina: Number(x.pagina),
    dificuldade: [81, 82, 83, 84, 86, 88, 90, 91, 93, 96, 108, 109, 113, 114, 115].includes(n) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial baseada na complexidade conceitual, normativa e de cálculo do tema; a banca não atribui nível de dificuldade oficial.',
    classificacao_fonte: prova,
    motivo: `Item ${n} conferido no caderno oficial do CEBRASPE. A matéria e o conteúdo foram definidos pelo tema específico do enunciado e pelo bloco temático impresso na prova. Ano e concurso confirmados no cabeçalho oficial.`,
    enunciado: stem,
    texto_apoio: context,
    imagem_pagina: x.imagem,
    apta_resolucao: true,
    remover_pendencias: ['classificacao_especifica_pendente', 'ano_sem_evidencia', 'enunciado_incompleto', 'alternativas_invalida', 'alternativa_vazia', 'texto_corrompido', 'texto_de_outro_bloco', 'visual_ausente']
  }
})

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ total: decisions.length, assuntos: Object.fromEntries([...new Set(decisions.map(d => d.conteudo))].map(t => [t, decisions.filter(d => d.conteudo === t).length])), stemMinimo: Math.min(...decisions.map(d => d.enunciado.length)), imagens: new Set(decisions.map(d => d.imagem_pagina)).size, respostasOficiaisAssociadas: 0, observacao: 'Não alterei nem inventei gabaritos; questões mantêm correção automática desabilitada quando não há resposta oficial vinculada.' }, null, 2))
  process.exit(0)
}

const report = await aplicarRevisoesIndividuais({ nome: 'revisao-telebras-engenharia-civil-2025-v148', base, decisoes: decisions })
raizesAtuais.unshift('tmp/revisao-profissional/revisao-telebras-engenharia-civil-2025-v148/acervo-extraido')
const output = { ...report, fonte_prova: prova, registros_revistos: decisions.length, páginas_originais_preservadas: new Set(decisions.map(d => d.imagem_pagina)).size, auto_correcao_sem_gabarito: 'Desabilitada', publicada: false }
await fs.writeFile('docs/acervo/revisao-profissional/revisao-telebras-engenharia-civil-2025-v148.json', JSON.stringify(output, null, 2))
console.log(JSON.stringify(output, null, 2))
