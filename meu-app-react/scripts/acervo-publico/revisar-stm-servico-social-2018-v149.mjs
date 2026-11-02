import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = '2501f1950ff79a99'
const prova = 'https://cdn.cebraspe.org.br/concursos/stm_17_analista_tecnico/arquivos/375_STM_007_01.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/STM_17_ANALISTA_TECNICO/arquivos/GAB_DEFINITIVO_375_STM_007_01.PDF'
const raw = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`, 'utf8'))

const key = new Map(Object.entries({
  51:'E',52:'C',53:'C',54:'E',55:'C',56:'E',57:'E',58:'E',59:'C',60:'C',
  61:'E',62:'E',63:'C',64:'E',65:'C',66:'E',67:'E',68:'C',69:'C',70:'C',
  71:'E',72:'E',73:'E',74:'C',75:'E',76:'C',77:'C',78:'C',79:'C',80:'E',
  81:'C',82:'E',83:'E',84:'C',85:'E',86:'E',87:'E',88:'C',89:'C',90:'C',
  91:'C',92:'E',93:'E',94:'E',95:'C',96:'C',97:'E',98:'E',99:'X',100:'C',
  101:'E',102:'E',103:'X',104:'C',105:'C',106:'E',107:'E',108:'X',109:'E',110:'E',
  111:'E',112:'C',113:'E',114:'C',115:'C',116:'E',117:'C',118:'C',119:'E',120:'E'
}).map(([n,v]) => [Number(n),v]))
const keyHash = hashRevisao([...key.entries()].sort((a,b)=>a[0]-b[0]).map(([n,v])=>`${n}:${v}`).join('|'))

const topics = new Map([
  [51,['Serviço Social','Projeto ético-político, igualdade e princípios profissionais']],
  [52,['Serviço Social','Código de Ética profissional e valores sociais']],
  [53,['Serviço Social','Competências e atribuições profissionais']],
  [54,['Serviço Social','Projeto ético-político e materialização de princípios']],
  [55,['Serviço Social','Projeto ético-político e contradições sociais']],
  [56,['Serviço Social','Transformações sociais, descentralização e competências profissionais']],
  [57,['Serviço Social','Trabalho profissional e viabilização de direitos e programas']],
  [58,['Serviço Social','Demandas contemporâneas e formação profissional crítica']],
  [59,['Serviço Social','Demandas sociais e respostas profissionais qualificadas']],
  [60,['Serviço Social','Gestão social pública e espaços de atuação profissional']],
  [61,['Serviço Social','Entrevista social e escuta profissional']],
  [62,['Serviço Social','Visita domiciliar — finalidade e instrumentos de intervenção']],
  [63,['Serviço Social','Trabalho interdisciplinar e opinião técnica profissional']],
  [64,['Serviço Social','Ações socioeducativas e orientação social']],
  [65,['Serviço Social','Estudo social, documentação e laudo social']],
  [66,['Serviço Social','Projeto de intervenção e controle social do trabalho profissional']],
  [67,['Serviço Social','Teoria dialético-crítica e questão social']],
  [68,['Serviço Social','Projeto de intervenção e análise da realidade social']],
  [69,['Serviço Social','Pesquisa social — questionários e generalização']],
  [70,['Serviço Social','Pesquisa social e conhecimento dos modos de vida e trabalho']],
  [71,['Serviço Social','Pesquisa social — indicadores e limites de mensuração']],
  [72,['Serviço Social','Métodos quantitativos e qualitativos de pesquisa']],
  [73,['Serviço Social','Opinião técnica, relatório e visita domiciliar']],
  [74,['Serviço Social','Relatórios de acompanhamento e comunicação institucional']],
  [76,['Serviço Social','Planejamento, avaliação e referenciais teóricos']],
  [77,['Serviço Social','Avaliação de planos, programas e projetos']],
  [78,['Serviço Social','Monitoramento, avaliação e gestão de programas']],
  [79,['Serviço Social','Avaliação de impacto de projetos sociais']],
  [80,['Serviço Social','Planejamento estratégico e participação social']],
  [81,['Políticas Sociais','Cidadania, direitos e decisões políticas']],
  [82,['Políticas Sociais','Questão social e acesso a direitos sociais']],
  [83,['Políticas Sociais','Injustiça social, direitos e desenvolvimento']],
  [84,['Serviço Social','Projeto profissional, direitos humanos e pluralismo']],
  [85,['Políticas Sociais','Questão social, riqueza e desigualdades']],
  [86,['Políticas Sociais','Assistência social e convivência familiar']],
  [87,['Políticas Sociais','Proteção social básica e serviços do SUAS']],
  [88,['Serviço Social','Violência, análise social e promoção de direitos']],
  [89,['Direitos Humanos','Sistema de garantia de direitos de crianças e adolescentes']],
  [90,['Políticas Sociais','SUAS e proteção de crianças e adolescentes']],
  [91,['Direitos Humanos','Estatuto da Pessoa Idosa e prioridade de atendimento']],
  [92,['Legislação e normas','Violência contra a pessoa idosa e notificação']],
  [93,['Políticas Sociais','Notificação compulsória de violência contra pessoas idosas']],
  [94,['Serviço Social','Intervenção interdisciplinar e estudo social em saúde']],
  [95,['Legislação e normas','Notificação compulsória de violência em serviços de saúde']],
  [96,['Políticas Sociais','Reforma Sanitária, projeto privatista e Serviço Social']],
  [97,['Políticas Sociais','Sistema Único de Assistência Social — organização e princípios']],
  [98,['Políticas Sociais','Serviço Social e projeto de Reforma Sanitária']],
  [99,['Políticas Sociais','Participação popular e controle social no SUS']],
  [100,['Políticas Sociais','SUS — Norma Operacional Básica de 1996']],
  [101,['Legislação e normas','Lei nº 8.212/1991 — seguridade social e proteção social']],
  [102,['Legislação e normas','Financiamento da seguridade social e responsabilidades federativas']],
  [103,['Legislação e normas','Conceito constitucional de seguridade social']],
  [104,['Legislação e normas','Seguridade social — gestão democrática e descentralizada']],
  [105,['Legislação e normas','Seguridade social — participação da iniciativa privada na saúde']],
  [106,['Legislação e normas','ECA — medidas socioeducativas e medidas protetivas']],
  [107,['Legislação e normas','ECA — aprendizagem, profissionalização e proteção ao trabalho']],
  [108,['Legislação e normas','ECA — proteção à gestante e alta hospitalar responsável']],
  [109,['Legislação e normas','ECA — entrega voluntária para adoção e encaminhamento']],
  [110,['Direitos Humanos','Lei Maria da Penha — formas de violência doméstica']],
  [111,['Legislação e normas','Estatuto da Pessoa Idosa — dever de proteção']],
  [112,['Legislação e normas','Política Nacional para Integração da Pessoa com Deficiência — CONADE']],
  [113,['Legislação e normas','Decreto nº 3.298/1999 — atendimento e direitos da pessoa com deficiência']],
  [114,['Legislação e normas','Decreto nº 3.298/1999 — conceito de deficiência']],
  [115,['Legislação e normas','Lei nº 11.343/2006 — Sistema Nacional de Políticas sobre Drogas']],
  [116,['Legislação e normas','SISNAD — cultivo de espécies destinadas à produção de drogas']],
  [117,['Políticas Sociais','SISNAD — prevenção, atenção e reinserção social']],
  [118,['Políticas Sociais','SISNAD — atenção, família e projeto terapêutico']],
  [119,['Legislação e normas','SISNAD — conceito legal de drogas']],
  [120,['Legislação e normas','Lei nº 11.343/2006 — porte de drogas para consumo pessoal']]
])

const case61 = 'Em estudo social sobre violação de direitos humanos, assistente social e psicólogo realizaram atendimentos e entrevistas. Uma mulher de 45 anos, denunciada por não prover condições de sobrevivência aos filhos, permaneceu em silêncio em vários momentos; os profissionais respeitaram o silêncio. Ao final, o assistente social realizou orientações socioeducativas e refletiu com ela sobre sua realidade.'
const case66 = 'Após a apresentação de um projeto de intervenção profissional, outro profissional identificou filiação à teoria dialético-crítica, destacou o questionário aplicado aos usuários e apontou que faltavam mecanismos de controle social do trabalho do assistente social.'
const case86 = 'Marlene procurou o serviço social da empresa onde trabalhava, desesperada com as agressões frequentes sofridas pelos filhos. Relatou que o marido era agressivo, pouco afetuoso e humilhava os filhos; o comportamento piorava quando ele chegava alcoolizado. Ele não elogiava os filhos quando agiam corretamente nem os estimulava para os desafios da vida.'
const case91 = 'Em uma unidade de saúde, o assistente social atendeu Odete, de 80 anos, com hipertensão, diabetes e depressão leve. Percebeu sinais de violência doméstica, confirmada por ela. Odete relatou maus-tratos praticados pelo único filho, de 50 anos, com quem residia.'
const case106 = 'Maria Nilda, 59 anos, natural de São Paulo e residente há três anos no Distrito Federal, procurou uma unidade pública de saúde com quatro filhos. Helena, 24 anos e grávida de quatro meses, não sabia se permaneceria com o bebê; seu companheiro havia sido morto. Ricardo, 15 anos, tinha deficiência física; Miguel, 13, estudava no ensino fundamental; Pedro Gustavo, 11, estava fora da escola. Maria relatou relação abusiva com o marido, José Ferreira, 63 anos, que a insultava e ofendia havia mais de 30 anos e questionava a paternidade dos filhos. Ele chegava alcoolizado e os xingamentos haviam piorado. Miguel e Pedro Gustavo haviam cometido atos infracionais análogos a roubo; era a terceira ocorrência de Miguel e a segunda de Pedro Gustavo.'

const contextByNumber = n => {
  if (n <= 55) return 'Com base no projeto ético-político do Serviço Social, na Lei nº 8.662/1993 e no Código de Ética do(a) Assistente Social de 1993, julgue os itens.'
  if (n <= 60) return 'A respeito das transformações sociais e de suas implicações para o Serviço Social, julgue os itens.'
  if (n <= 65) return case61
  if (n <= 68) return case66
  if (n === 69) return 'Item do bloco de pesquisa social sobre a escolha de instrumentos de coleta de dados.'
  if (n <= 72) return 'Em relação à pesquisa social, julgue os itens subsequentes.'
  if (n <= 75) return 'A respeito da emissão de opinião técnica do assistente social, julgue os itens.'
  if (n <= 80) return 'No que se refere a planejamento e avaliação de planos, programas e projetos, julgue os itens.'
  if (n <= 85) return 'Julgue os itens referentes aos direitos de cidadania, à questão social e às formas de enfrentamento.'
  if (n <= 90) return `${case86} Com relação a essa situação e aos aspectos relacionados, julgue os itens.`
  if (n <= 95) return `${case91} Acerca dessa situação e dos aspectos relacionados, julgue os itens.`
  if (n <= 100) return 'No que tange ao arcabouço legal das políticas de saúde e de assistência social, julgue os itens.'
  if (n <= 105) return 'Acerca da Lei nº 8.212/1991, que dispõe sobre a organização da seguridade social e institui o plano de custeio, julgue os itens.'
  if (n <= 110) return `${case106} A situação deve ser analisada à luz da Lei Maria da Penha, do Estatuto da Criança e do Adolescente e do Estatuto da Pessoa Idosa.`
  if (n <= 114) return 'À luz do Decreto nº 3.298/1999, que regulamenta a Política Nacional para Integração da Pessoa Portadora de Deficiência, julgue os itens.'
  return 'Considerando o Sistema Nacional de Políticas Públicas sobre Drogas (SISNAD), instituído pela Lei nº 11.343/2006, julgue os itens.'
}

const suffixes = [
  /\s+Em um estudo social sobre violação de direitos humanos[\s\S]*$/iu,
  /\s+Ap[oó]s apresentação de projeto de intervenção profissional[\s\S]*$/iu,
  /\s+Marlene compareceu ao serviço social[\s\S]*$/iu,
  /\s+O assistente social de uma unidade de saúde atendeu à paciente Odete[\s\S]*$/iu,
  /\s+No que tange ao arcabouço legal da política de saúde e de assistência social[\s\S]*$/iu,
  /\s+Acerca da Lei n[.º°]*\s*8\.212\/1991[\s\S]*$/iu,
  /\s+Maria Nilda, 59 anos de idade[\s\S]*$/iu,
  /\s+À luz do Decreto n[.º°]*\s*3\.298\/1999[\s\S]*$/iu,
  /\s+Considerando o Sistema Nacional de Políticas P[úu]blicas sobre Drogas[\s\S]*$/iu,
  /\s*\|\|375_STM_007_01N221138\|\|[\s\S]*$/u,
  /\s+Espaço livre\s*$/iu
]
const clean = value => {
  let s = (value || '').replace(/\u000c/g, ' ')
  for (const re of suffixes) s = s.replace(re, '')
  return s.replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim()
}

const start = raizesAtuais.findIndex(r => r.includes('revisao-telebras-engenharia-civil-2025-v148'))
if (start < 0) throw new Error('Base v148 não encontrada')
const base = raizesAtuais[start]
const bases = raizesAtuais.slice(start)
const manifest = JSON.parse(await lerArquivoAtual('manifesto.json', bases))
const active = new Map()
for (const lot of manifest.lotes) {
  if (!lot.arquivo) continue
  const questions = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo, bases)))
  for (const q of questions) if (q.documento_id === doc) active.set(q.id, q)
}
if (raw.length !== 68 || raw.some(x => !topics.has(Number(x.numero)) || !active.has(x.id))) throw new Error(`Lote inesperado: ${raw.length} registros exportados`)

const decisions = raw.map(x => {
  const n = Number(x.numero), q = active.get(x.id), answer = key.get(n)
  if (!answer || !x.imagem?.startsWith(`paginas/${doc}-`)) throw new Error(`Gabarito ou imagem ausente no item ${n}`)
  const stem = clean(x.enunciado)
  if (stem.length < 25) throw new Error(`Enunciado incompleto após limpeza no item ${n}`)
  const [materia, conteudo] = topics.get(n)
  const anulada = answer === 'X'
  return {
    id: x.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia, conteudo,
    ano: 2018,
    concurso: 'STM 2017 — aplicação em 04/03/2018 — Cargo 7: Analista Judiciário, Serviço Social',
    numero_original: n,
    pagina: Number(x.pagina),
    dificuldade: [58,63,64,66,67,71,72,76,80,83,87,90,92,96,97,99,101,102,104,106,109,110,112,114,116,118,120].includes(n) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial baseada na densidade conceitual e normativa; a banca não publica nível oficial de dificuldade.',
    resposta_correta: anulada ? null : answer === 'C' ? 0 : 1,
    anulada,
    gabarito_oficial: { valor: answer, fonte: gabarito, sha256: keyHash, sha256_tipo: 'hash_da_transcricao_canonica_dos_itens_51_a_120_do_gabarito_oficial_definitivo', numero: n, resposta: answer, metodo: 'Gabarito oficial definitivo do Cargo 7 — Serviço Social; aplicação em 04/03/2018. O hash identifica a transcrição canônica dos itens, não o arquivo PDF.' },
    classificacao_fonte: prova,
    motivo: `Item ${n} conferido no caderno oficial e no gabarito definitivo do CEBRASPE. Matéria e conteúdo identificados pelo enunciado e cabeçalho temático do bloco. Ano corresponde à aplicação da prova.`,
    enunciado: stem,
    texto_apoio: contextByNumber(n),
    imagem_pagina: x.imagem,
    imagens_contexto: [{ pagina: Number(x.pagina), imagem: x.imagem, texto: contextByNumber(n) }],
    reemplazarContexto: true,
    apta_resolucao: true,
    remover_pendencias: ['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']
  }
})

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ registros: decisions.length, gabaritos: decisions.filter(d => d.gabarito_oficial).length, anuladas: decisions.filter(d => d.anulada).map(d => d.numero_original), classificacoes: Object.fromEntries([...new Set(decisions.map(d => `${d.materia} — ${d.conteudo}`))].map(k => [k, decisions.filter(d => `${d.materia} — ${d.conteudo}` === k).length])), imagens: new Set(decisions.map(d => d.imagem_pagina)).size, stemMinimo: Math.min(...decisions.map(d => d.enunciado.length)) }, null, 2))
  process.exit(0)
}

const report = await aplicarRevisoesIndividuais({ nome: 'revisao-stm-servico-social-2018-v149', base, decisoes: decisions })
raizesAtuais.unshift('tmp/revisao-profissional/revisao-stm-servico-social-2018-v149/acervo-extraido')
const output = { ...report, fonte_prova: prova, fonte_gabarito: gabarito, registros_revistos: decisions.length, gabaritos_oficiais_vinculados: decisions.length, anuladas: decisions.filter(d=>d.anulada).map(d=>d.numero_original), contextos_e_imagens_associados: true, publicada: false }
await fs.writeFile('docs/acervo/revisao-profissional/revisao-stm-servico-social-2018-v149.json', JSON.stringify(output, null, 2))
console.log(JSON.stringify(output, null, 2))
