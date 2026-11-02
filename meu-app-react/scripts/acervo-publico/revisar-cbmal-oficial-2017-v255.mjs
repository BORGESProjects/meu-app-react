import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = '4caad0dfcd788048'
const prova = 'https://cdn.cebraspe.org.br/concursos/CBM_AL_17_COMBATENTE/arquivos/340_CBMAL_CB1_01.pdf'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/CBM_AL_17_COMBATENTE/arquivos/Gab_Definitivo_340_CBMAL_CB1_01.PDF'
const hashGabarito = '1d1bad56bca9d06f37a2cc765a53c5b3df9172637a7650419b4c7c8135e91e87'
const concurso = 'CBM/AL 2017 — Oficial Combatente — Conhecimentos Básicos'
const base = raizesAtuais[0]
const bases = raizesAtuais
const manifesto = JSON.parse(await lerArquivoAtual('manifesto.json', bases))
const catalogo = JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json', 'utf8')).find(d => d.id === doc)
if (!catalogo || catalogo.url !== prova || catalogo.questoes.length !== 64) throw Error('Catálogo oficial inesperado para CBM/AL 2017, CB1')

const ativos = new Map()
for (const index of [274, 275, 276]) {
  const lote = manifesto.lotes[index]
  if (!lote || lote.concurso !== 'CBM/AL COMBATENTE 2017') throw Error(`Lote CBM/AL esperado não encontrado: ${index}`)
  const questoes = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo, bases)))
  for (const q of questoes) if (q.documento_id === doc) ativos.set(q.id, q)
}
const pendentes = [...ativos.values()].filter(q => q.classificacao_pendente && !q.classificacao_revisada && q.integridade_profissional?.apta_resolucao !== false)
if (pendentes.length !== 51) throw Error(`Esperava 51 pendências ativas; encontrei ${pendentes.length}`)

const topics = {
  1: ['Língua Inglesa', 'Compreensão textual: inferência sobre exercício físico e controle de peso.'],
  2: ['Língua Inglesa', 'Compreensão textual: interpretação de informação explícita sobre alimentação após exercício.'],
  3: ['Língua Inglesa', 'Vocabulário e coesão: valor semântico do conector “yet” no contexto.'],
  4: ['Língua Inglesa', 'Compreensão textual: tese e inferência sobre exercício e perda de peso.'],
  5: ['Língua Inglesa', 'Coesão referencial: referente do pronome “you” no texto.'],
  6: ['História', 'Guerras Mundiais: identificação dos conflitos de 1914–1918 e 1939–1945.'],
  9: ['História', 'Guerra Fria e dissuasão nuclear: doutrina da destruição mútua assegurada.'],
  10: ['História', 'História contemporânea: efeitos visuais da explosão de arma nuclear.'],
  11: ['História', 'Guerra nuclear: consequências e destruição mútua.'],
  16: ['Língua Portuguesa', 'Semântica e relações lógico-discursivas: substituição de conjunção subordinativa.'],
  19: ['Língua Portuguesa', 'Sintaxe e pontuação: emprego da vírgula e relação entre orações.'],
  20: ['Ética e Cidadania', 'Cidadania: exercício de direitos e cumprimento de deveres.'],
  21: ['Ética e Cidadania', 'Ética e moral: distinções conceituais e valores que orientam a convivência.'],
  22: ['Ética e Cidadania', 'Ética profissional militar: conduta dentro e fora do serviço.'],
  23: ['Direitos Humanos', 'Teoria geral: dimensões ou gerações dos direitos humanos.'],
  24: ['Direitos Humanos', 'Declaração Universal dos Direitos Humanos: universalidade e igualdade de gênero.'],
  25: ['Direitos Humanos', 'Universalidade dos direitos humanos e proteção de nacionais e estrangeiros.'],
  27: ['Direitos Humanos', 'Universalidade e indivisibilidade: dimensões políticas, sociais e econômicas.'],
  28: ['Atualidades', 'Terrorismo internacional e mudanças táticas de grupos extremistas na Europa.'],
  29: ['Atualidades', 'Geopolítica: relações entre Estados Unidos e Rússia e interferência eleitoral.'],
  30: ['Atualidades', 'Migrações e deslocamentos forçados: crise de refugiados na Europa.'],
  31: ['Atualidades', 'Política ambiental internacional: Acordo de Paris e posicionamento dos Estados Unidos.'],
  32: ['Biologia', 'Saúde pública e epidemiologia: vírus Zika e microcefalia.'],
  33: ['Saúde Pública', 'Imunização coletiva: cobertura vacinal e metas de vacinação no Brasil.'],
  34: ['Geografia', 'Meio ambiente e gestão de recursos hídricos: disponibilidade e escassez de água.'],
  35: ['Geografia', 'Matriz energética brasileira: distribuição regional da energia eólica.'],
  36: ['Informática', 'Segurança da informação: backdoor, malware e acesso não autorizado.'],
  37: ['Informática', 'Sistemas operacionais: inicialização e reinicialização versus formatação.'],
  40: ['Informática', 'Editor de texto: recurso de legendas de figuras no Microsoft Word.'],
  41: ['Matemática', 'Geometria plana: perímetro de polígono composto e relações métricas em retângulo.'],
  42: ['Matemática', 'Geometria plana: área de polígono por decomposição de figuras.'],
  43: ['Matemática', 'Geometria analítica: coordenadas cartesianas e coeficiente angular de reta.'],
  44: ['Matemática', 'Geometria plana: ângulos, perpendicularidade e inclinação de segmentos.'],
  45: ['Matemática', 'Geometria espacial: volume de paralelepípedo e conversão entre medidas.'],
  46: ['Estatística', 'Leitura e interpretação de gráfico de barras e frequências absolutas.'],
  47: ['Matemática', 'Proporcionalidade e mistura: concentração de gasolina após substituições sucessivas.'],
  48: ['Raciocínio Lógico', 'Lógica proposicional: equivalência de proposições compostas e leis de De Morgan.'],
  49: ['Raciocínio Lógico', 'Lógica proposicional: sentenças declarativas, imperativas e valor lógico.'],
  50: ['Raciocínio Lógico', 'Lógica proposicional: conectivos, tautologia e análise de tabela-verdade.'],
}
const answers = {
  1: 'E', 2: 'E', 3: 'C', 4: 'E', 5: 'C',
  6: 'C', 7: 'E', 8: 'E', 9: 'C', 10: 'C', 11: 'E', 12: 'C', 13: 'C', 14: 'E', 15: 'E',
  16: 'E', 17: 'C', 18: 'E', 19: 'C', 20: 'C', 21: 'E', 22: 'C', 23: 'C', 24: 'E', 25: 'E',
  26: 'C', 27: 'E', 28: 'X', 29: 'C', 30: 'E', 31: 'E', 32: 'C', 33: 'C', 34: 'E', 35: 'E',
  36: 'X', 37: 'E', 38: 'E', 39: 'C', 40: 'C', 41: 'X', 42: 'X', 43: 'X', 44: 'X', 45: 'E',
  46: 'C', 47: 'C', 48: 'C', 49: 'E', 50: 'C',
}
const spanishAnswers = { 1: 'C', 2: 'E', 3: 'C', 4: 'E', 5: 'E' }
const spanishIds = new Set(['extr-d171da904904a456feea', 'extr-b4dee978694b5d749ef4', 'extr-75989368f501281ba60c', 'extr-943fc903b2ce5c2b3ffc', 'extr-358f01c11ff90133f90f', 'extr-74d9acd5d86e64f643ec', 'extr-216b64a259c04f145c61'])
const spanishTopics = new Map([
  ['extr-d171da904904a456feea', ['Língua Espanhola', 'Vocabulário e semântica: substituição de “sin duda” por advérbio equivalente.']],
  ['extr-b4dee978694b5d749ef4', ['Língua Espanhola', 'Compreensão textual: interpretação das declarações de Bill Gates sobre Ctrl+Alt+Supr.']],
  ['extr-75989368f501281ba60c', ['Língua Espanhola', 'Vocabulário contextual: equivalência lexical de “extraña”.']],
  ['extr-943fc903b2ce5c2b3ffc', ['Língua Espanhola', 'Reescrita e sintaxe: manutenção de sentido, regência e coesão em trecho do texto.']],
  ['extr-358f01c11ff90133f90f', ['Língua Espanhola', 'Vocabulário contextual: equivalência lexical de “extraña”.']],
  ['extr-74d9acd5d86e64f643ec', ['Língua Espanhola', 'Gramática: usos do pronome “se” e construção de orações passivas.']],
  ['extr-216b64a259c04f145c61', ['Língua Espanhola', 'Gramática: usos do pronome “se” e construção de orações passivas.']],
])
const cleanStems = new Map([
  ['extr-d171da904904a456feea', 'La expresión “sin duda” (R.3) es reemplazable por “indudablemente” sin alteración gramatical en el texto.'],
  ['extr-75989368f501281ba60c', 'Sin perjuicio del sentido del texto, el término “extraña” (R.10) podría ser sustituido por “rara” o por “extravagante”.'],
  ['extr-358f01c11ff90133f90f', 'Sin perjuicio del sentido del texto, el término “extraña” (R.10) podría ser sustituido por “rara” o por “extravagante”.'],
  ['extr-943fc903b2ce5c2b3ffc', 'El fragmento “La duda ha sobrevolado de forma inesperada en un debate del mundo de los negocios en que se encontraba el fundador de Microsoft, Bill Gates” (R.11 a 13) estaría correcto desde el punto de vista semántico y gramatical si se reescribiera así: “La duda ha pasado de forma repentina en el debate del mundo de los negocios en el que se encontraba el fundador de Microsoft, Bill Gates”.'],
  ['extr-74d9acd5d86e64f643ec', 'El pronombre “se” en sus tres ocurrencias en el segundo párrafo (R.12, 13 y 18) forma oraciones pasivas.'],
  ['extr-216b64a259c04f145c61', 'El pronombre “se” en sus tres ocurrencias en el segundo párrafo (R.12, 13 y 18) forma oraciones pasivas.'],
  ['extr-966fbedf31d2665d8858', 'It can be concluded from the text that if one wants to be thin, one should not exercise too much.'],
  ['extr-0c210e6bc4f6f1186961', 'It can be concluded from the second paragraph that people who exercise should not eat light meals.'],
  ['extr-d36ff830ca29fdef3be7', 'In the context, the word “Yet” (R.5) conveys the same idea as the expression “up until now”.'],
  ['extr-739bb9737d192bbcfe76', 'The pronoun “You” (R.4) refers specifically to the individuals who are reading the text.'],
  ['extr-9d0a419148fa23503cd4', 'The text suggests that, frequently, working out is not enough to lose weight.'],
  ['extr-abfde76e194ddf1c1678', 'The text suggests that, frequently, working out is not enough to lose weight.'],
  ['extr-5e522a385be92ec2cffb', 'The pronoun “You” (R.4) refers specifically to the individuals who are reading the text.'],
  ['extr-28519277a81f56b055bf', 'A vírgula empregada na linha 13 separa orações cujos sujeitos são distintos.'],
  ['extr-472ba606e550a5849d04', 'Os direitos humanos são voltados para questões estritamente políticas e sociais, eximindo-se de tratar de temas que se relacionem com a esfera econômica.'],
  ['extr-920eb939bc6cde26254f', 'Alagoas destaca-se pela concentração de parques eólicos, sendo o principal responsável pelo desempenho positivo da região Nordeste na produção de energia eólica em relação ao resto do Brasil.'],
  ['extr-c65e1e0096f0c5340750', 'No Microsoft Word, o recurso Inserir Legenda possibilita ao usuário inserir abaixo de uma figura uma breve descrição do objeto apresentado.'],
  ['extr-640cc759fa6838813f69', 'O segmento de reta EF é perpendicular ao segmento de reta FG.'],
  ['extr-90f235e8bf30fef62011', 'O gráfico de barras verticais a seguir apresenta as frequências absolutas de resmas consumidas pelas cinco seções.'],
])
const duplicates = new Map([
  ['extr-d171da904904a456feea', 'extr-541e2064ba4224c906c2'],
  ['extr-75989368f501281ba60c', 'extr-358f01c11ff90133f90f'],
  ['extr-943fc903b2ce5c2b3ffc', 'extr-62f8ae4bc8fc3dc01931'],
  ['extr-74d9acd5d86e64f643ec', 'extr-216b64a259c04f145c61'],
  ['extr-966fbedf31d2665d8858', 'extr-5c1b59d189c2659c2fde'],
  ['extr-0c210e6bc4f6f1186961', 'extr-7ab4da2082da756dc2d1'],
  ['extr-d36ff830ca29fdef3be7', 'extr-4382cff77fc035842655'],
  ['extr-9d0a419148fa23503cd4', 'extr-abfde76e194ddf1c1678'],
  ['extr-739bb9737d192bbcfe76', 'extr-5e522a385be92ec2cffb'],
])
const decisions = pendentes.map(q => {
  const n = Number(q.numero_original)
  const [materia, conteudo] = spanishTopics.get(q.id) || topics[n] || []
  if (!materia || !answers[n]) throw Error(`Classificação ou chave oficial ausente para ${q.id} (#${n})`)
  const page = Number(q.pagina)
  const image = `paginas/${doc}-${String(page).padStart(4, '0')}.webp`
  const entry = catalogo.questoes.find(e => e.id === q.id)
  if (!entry) throw Error(`Questão ausente do catálogo: ${q.id}`)
  const contextPages = (entry.paginas || []).filter(p => Number(p) !== page).map(p => ({ pagina: Number(p), imagem: `paginas/${doc}-${String(p).padStart(4, '0')}.webp`, texto: 'Página de contexto do mesmo caderno oficial, associada ao enunciado.' }))
  const key = spanishIds.has(q.id) ? spanishAnswers[n] : answers[n]
  const anulada = key === 'X'
  const duplicate = duplicates.has(q.id)
  const decision = {
    id: q.id, sha256_enunciado: hashRevisao(q.enunciado), materia, conteudo,
    ano: 2017, concurso, numero_original: n, pagina: page,
    dificuldade: [3, 9, 16, 21, 24, 27, 29, 31, 41, 42, 43, 44, 45, 48, 50].includes(n) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial baseada na leitura, nos conceitos e nas operações exigidas; não publicada pela banca.',
    classificacao_fonte: prova,
    motivo: `Caderno oficial CBM/AL 2017, Oficial Combatente, Conhecimentos Básicos, item ${n}, página ${page}; matéria e tópico derivados do comando e do conteúdo original.`,
    visual: { pagina: page, imagem: image, motivo: 'Conferida com a página renderizada do caderno oficial; preserva o contexto, a figura ou o gráfico do item.' },
    ...(contextPages.length ? { imagens_contexto: contextPages } : {}),
    resposta_correta: anulada ? null : key === 'C' ? 0 : 1,
    anulada,
    gabarito_oficial: { fonte: gabarito, arquivo: 'Gab_Definitivo_340_CBMAL_CB1_01.PDF', sha256: hashGabarito, numero: n, pagina: 1, resposta: key, criterio: anulada ? 'Gabarito definitivo oficial marca X; item anulado.' : 'Gabarito definitivo oficial específico do caderno CB1, cargo 1, chave conferida no documento oficial.' },
    apta_resolucao: !duplicate,
    ...(duplicate ? { duplicada_de: duplicates.get(q.id), inelegibilidade_motivo: 'OCR repetido do item 4 da versão inglesa; o registro canônico permanece resolvível.' } : { remover_pendencias: ['classificacao_especifica_pendente', 'ano_sem_evidencia', 'visual_ausente'] }),
    ...(cleanStems.has(q.id) ? { enunciado: cleanStems.get(q.id) } : {}),
    texto_apoio: '',
  }
  return decision
})
if (decisions.length !== 51 || decisions.filter(d => d.apta_resolucao === false).length !== 9) throw Error('Contagem de decisões inesperada')
for (const d of decisions) await fs.access(`public/acervo-extraido/${d.visual.imagem}`)

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ registros: decisions.length, duplicatas: [...duplicates], anuladas: decisions.filter(d => d.anulada).map(d => d.numero_original), porMateria: Object.fromEntries([...new Set(decisions.map(d => d.materia))].map(m => [m, decisions.filter(d => d.materia === m).length])) }, null, 2))
  process.exit(0)
}
const nome = 'revisao-cbmal-oficial-2017-v255'
const result = await aplicarRevisoesIndividuais({ nome, base, decisoes: decisions })
const rootLine = `raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`
const current = await fs.readFile('scripts/acervo-publico/acervo-atual.mjs', 'utf8')
if (!current.includes(rootLine.trim())) await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs', `\n${rootLine}`)
const report = { ...result, source: prova, answer_key: gabarito, answer_key_sha256: hashGabarito, corrected_ocr: cleanStems.size, duplicate_disabled: duplicates.size, annulled_questions: decisions.filter(d => d.anulada).map(d => d.numero_original), published: false }
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`, JSON.stringify(report, null, 2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md', `\n\n## CBM/AL 2017 — Oficial Combatente, Conhecimentos Básicos — v255\n\n- Classifiquei individualmente as 51 pendências ativas do caderno: Espanhol e Inglês, História, Língua Portuguesa, Ética e Cidadania, Direitos Humanos, Atualidades, Biologia, Saúde Pública, Geografia, Informática, Matemática, Estatística e Raciocínio Lógico. Registrei ano, aplicação, tópico e dificuldade editorial estimada.\n- Limpei 19 enunciados contaminados por OCR ou por texto de itens/blocos adjacentes, preservei as páginas originais com os textos-base, a figura geométrica, a tabela e o gráfico, e sinalizei nove cópias OCR como duplicatas, mantendo uma versão resolvível de cada item/idioma.\n- Vinculei a chave definitiva do cargo 1 e respeitei as anulações oficiais dos itens ${report.annulled_questions.join(', ')}. Validação local: ${result.classificadas} registros revistos, ${result.novas_classificacoes} novas classificações; ${result.total} questões no banco, ${result.disponiveis} elegíveis e ${result.pendentes} pendências. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno CB1](<${prova}>), [gabarito definitivo](<${gabarito}>), [página do concurso CEBRASPE](https://cdn.cebraspe.org.br/concursos/CBM_AL_17_COMBATENTE/).\n`)
console.log(JSON.stringify(report, null, 2))
