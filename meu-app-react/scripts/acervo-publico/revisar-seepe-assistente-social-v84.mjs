import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-seepe-assistente-social-v84'
const base = 'tmp/revisao-profissional/revisao-abin-eletronica-2018-v83/acervo-extraido'
const doc = 'f5205abcd0090598'
const prova = 'https://cdn.cebraspe.org.br/concursos/see_pe_22/arquivos/736_SEEPEANALISTAASSISTENTE_009_01.PDF'
const qs = JSON.parse(await fs.readFile('tmp/pendentes-see-pe-servico-social.json', 'utf8'))
const temas = {
  60: ['Ética Profissional', 'Código de Ética do/a Assistente Social: autonomia técnica e manifestação profissional'],
  61: ['Ética Profissional', 'Código de Ética do/a Assistente Social: atuação em calamidades e composição de equipes'],
  62: ['Ética Profissional', 'Código de Ética do/a Assistente Social: defesa da democracia e participação política'],
  63: ['Ética Profissional', 'Ética em pesquisa: autoria, integridade científica e conflito de interesses'],
  64: ['Serviço Social', 'Formação profissional: atividades complementares e diretrizes curriculares'],
  65: ['Serviço Social', 'Formação profissional: estágio supervisionado e trabalho de conclusão de curso'],
  67: ['Serviço Social', 'Instrumentos técnico-operativos: estudo social, relatório, laudo e parecer'],
  68: ['Serviço Social', 'Trabalho profissional e tecnologias digitais na política social'],
  69: ['Serviço Social', 'Instrumentos técnico-operativos: relação entre teoria, prática e projeto ético-político'],
  70: ['Serviço Social', 'Instrumentos de trabalho: entrevistas, grupos, relatórios, reuniões e registros'],
  71: ['Serviço Social', 'Dimensões teórico-metodológica, ético-política e técnico-operativa'],
  72: ['Serviço Social', 'Trabalho interdisciplinar: diálogo entre perspectivas e princípios profissionais'],
  73: ['Assistência Social', 'SUAS: intervenção interdisciplinar, território e convivência sociofamiliar'],
  74: ['Serviço Social', 'Interdisciplinaridade: cooperação e diálogo no trabalho profissional'],
  75: ['Saúde Mental', 'Reforma psiquiátrica brasileira: indústria da loucura e modelo manicomial'],
  76: ['Saúde Mental', 'Reforma psiquiátrica e movimento antimanicomial no Brasil'],
  77: ['Saúde Mental', 'Lei nº 10.216/2001: direitos das pessoas com transtornos mentais e modelo assistencial'],
  78: ['Saúde Pública', 'Reforma Sanitária e Reforma Psiquiátrica: contexto histórico e institucional'],
  79: ['Direitos da Pessoa Idosa', 'Estatuto da Pessoa Idosa: direitos e proteção integral'],
  80: ['Direitos da Pessoa Idosa', 'Estatuto da Pessoa Idosa: direitos, cultura e políticas públicas'],
  81: ['Direitos da Pessoa Idosa', 'Estatuto da Pessoa Idosa: definição legal de pessoa idosa'],
  82: ['Direitos da Pessoa Idosa', 'Estatuto da Pessoa Idosa: proteção à vida, saúde e dignidade'],
  83: ['Direitos da Criança e do Adolescente', 'ECA: proteção integral na primeira infância e prevenção de riscos'],
  84: ['Saúde Pública', 'Imunização de crianças e adolescentes: vacinação e proteção à saúde'],
  85: ['Saúde Pública', 'Direitos reprodutivos: acolhimento e oferta de grupos a gestantes'],
  86: ['Saúde Pública', 'Saúde da população em situação de rua: vulnerabilidade e doenças transmissíveis'],
  87: ['Direitos Humanos', 'Saúde e diversidade: estigma, discriminação e população LGBTQIA+'],
  88: ['Direitos da Pessoa com Deficiência', 'Políticas de inclusão de crianças e adolescentes com TEA'],
  89: ['Assistência Social', 'PNAS e SUAS: unidades públicas, serviços e proteção social especial'],
  90: ['Previdência Social', 'Benefício por incapacidade temporária: segurado e incapacidade laboral'],
  91: ['Assistência Social', 'Transferência de renda: benefício emergencial aos transportadores autônomos de cargas'],
  92: ['Serviço Social', 'Questão social: desigualdade, subalternização e políticas de proteção social'],
  93: ['Serviço Social', 'Violência de gênero: produção científica e perfil de autores de violência'],
  94: ['Direitos da Criança e do Adolescente', 'Trabalho infantil: conceito, idade mínima e aprendizagem profissional'],
  95: ['Direitos da Criança e do Adolescente', 'Trabalho infantil doméstico: distinção entre tarefas e atividade laboral'],
  96: ['Direitos da Criança e do Adolescente', 'Trabalho infantil doméstico: socialização e exploração do trabalho'],
  97: ['Direito Educacional', 'LDB: dever do Estado e frequência escolar de crianças e adolescentes'],
  98: ['Assistência Social', 'PNAS: descentralização político-administrativa e gestão do SUAS'],
  99: ['Assistência Social', 'PNAS: primazia da responsabilidade estatal na condução da política'],
  100: ['Assistência Social', 'PNAS: centralidade na família e organização dos benefícios e serviços'],
  101: ['Assistência Social', 'PNAS: participação e controle social na formulação e fiscalização da política'],
  102: ['Assistência Social', 'PNAS: matricialidade sociofamiliar e vulnerabilidade social'],
  103: ['Legislação Profissional', 'Lei nº 8.662/1993: identificação profissional e registro no CRESS'],
  105: ['Legislação Profissional', 'Lei nº 8.662/1993: atribuições privativas do/a Assistente Social'],
  106: ['Legislação Profissional', 'Lei nº 8.662/1993: direitos, deveres e exercício profissional'],
  107: ['Legislação Profissional', 'Sistema CFESS/CRESS: financiamento e receitas dos conselhos profissionais'],
  108: ['Legislação Profissional', 'Lei nº 8.662/1993: estágio em Serviço Social e supervisão direta'],
  109: ['Ética Profissional', 'Código de Ética: prescrição de infrações e processo ético-disciplinar'],
  110: ['Ética Profissional', 'Código de Ética: condições dignas de trabalho e qualidade do exercício profissional'],
  111: ['Ética Profissional', 'Código de Ética: comunicação de irregularidades e defesa dos princípios profissionais'],
  112: ['Ética Profissional', 'Código de Ética: vedação ao uso de recursos institucionais para fins político-partidários'],
  113: ['Legislação Profissional', 'Lei nº 8.662/1993: exercício de atribuições profissionais e registro no CRESS'],
  114: ['Legislação Profissional', 'Sistema CFESS/CRESS: anuidade e hipóteses de isenção'],
  115: ['Ética Profissional', 'Sigilo profissional: depoimento como testemunha e limites éticos'],
  116: ['Ética Profissional', 'Código de Ética: enfrentamento ao preconceito e discriminação'],
  117: ['Legislação Profissional', 'Condições éticas e técnicas do local de atendimento profissional'],
  118: ['Legislação Profissional', 'Atribuições profissionais: limites da atuação terapêutica do/a Assistente Social'],
  119: ['Mediação de Conflitos', 'Lei nº 13.140/2015: impedimento e suspeição do mediador judicial'],
  120: ['Mediação de Conflitos', 'Lei nº 13.140/2015: escolha e designação do mediador judicial'],
}
const blocos = [
  [60, 63, 'Base normativa: Código de Ética Profissional do/a Assistente Social.'],
  [64, 65, 'Base normativa: Diretrizes Curriculares para os cursos de Serviço Social.'],
  [67, 68, 'Contexto: estudo social, perícia, relatório, laudo, parecer e condições do trabalho profissional.'],
  [69, 71, 'Contexto: concepções, debates e instrumentos técnico-operativos do Serviço Social.'],
  [72, 74, 'Contexto: atuação interdisciplinar do/a assistente social em equipes e no SUAS.'],
  [75, 78, 'Contexto: saúde mental, reforma psiquiátrica brasileira, movimento antimanicomial e reforma sanitária.'],
  [79, 82, 'Base normativa: Estatuto da Pessoa Idosa.'],
  [83, 83, 'Base normativa: Estatuto da Criança e do Adolescente (ECA).'],
  [84, 88, 'Contexto: políticas públicas de saúde, direitos e proteção de crianças, adolescentes e grupos vulnerabilizados.'],
  [89, 91, 'Contexto: políticas de assistência social, previdência e benefícios de transferência de renda.'],
  [92, 93, 'Contexto: questão social, desigualdade, violência de gênero e produção científica brasileira.'],
  [94, 97, 'Contexto: trabalho infantil, proteção integral e direito à educação.'],
  [98, 102, 'Base normativa: Política Nacional de Assistência Social (PNAS) e Sistema Único de Assistência Social (SUAS).'],
  [103, 108, 'Base normativa: Lei nº 8.662/1993, que regulamenta a profissão de Assistente Social.'],
  [109, 118, 'Base normativa: Código de Ética Profissional do/a Assistente Social e legislação profissional correlata.'],
  [119, 120, 'Base normativa: Lei nº 13.140/2015, sobre mediação judicial e extrajudicial.'],
]
const ids = new Set(), decisoes = []
if (qs.length !== 59) throw new Error(`Esperados 59 itens Filosofia pendentes; encontrados ${qs.length}`)
for (const q of qs) {
  const n = Number(q.numero_original), dados = temas[n]
  if (!dados) throw new Error(`Item ${n} sem classificação específica`)
  if (ids.has(q.id)) throw new Error(`ID repetido ${q.id}`)
  ids.add(q.id)
  const [materia, conteudo] = dados, pagina = Number(q.pagina)
  const imagem = `paginas/${doc}-${String(pagina).padStart(4, '0')}.webp`
  const texto_apoio = blocos.find(([a, b]) => n >= a && n <= b)?.[2] || ''
  decisoes.push({
    id: q.id, sha256_enunciado: hashRevisao(q.enunciado), materia, conteudo, ano: 2022,
    dificuldade: ['67','68','69','70','71','72','73','77','86','92','98','99','100','101','102','105','108','111','115','118'].includes(String(n)) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pela especificidade normativa e conceitual do item; não representa taxa oficial de acerto.',
    classificacao_fonte: prova,
    motivo: `SEE/PE 2022 — Analista em Gestão Educacional, especialidade Assistente Social — CEBRASPE; item ${n}. Tema conferido no enunciado e no cabeçalho/contexto da página oficial.`,
    visual: { pagina, imagem, texto_apoio, motivo: 'Página original do caderno oficial conferida visualmente; enunciado, comandos e referências do bloco foram preservados.' },
  })
}
const relatorio = await aplicarRevisoesIndividuais({ nome, base, decisoes })
const detalhe = {
  ...relatorio, banca: 'CEBRASPE', concurso: 'SEE/PE 2022 — Analista em Gestão Educacional, especialidade Assistente Social', ano: 2022,
  documento: '736_SEEPEANALISTAASSISTENTE_009_01.PDF', fonte: prova, paginas_origem_conferidas: [1, 2, 3],
  observacao: 'Reclassifiquei por assunto os 59 itens que estavam todos como Filosofia. Os cabeçalhos de seção e as bases normativas foram preservados por bloco e cada item segue ligado à página original. Gabaritos associados não foram alterados; dificuldade é estimativa editorial.',
}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`, JSON.stringify(detalhe, null, 2))
console.log(JSON.stringify(detalhe))
