import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = '098a5f12cb0669a5'
const nome = 'revisao-ebserh-seguranca-trabalho-2018-v260'
const prova = 'https://cdn.cebraspe.org.br/concursos/EBSERH_18_ADMINISTRATIVO/arquivos/393_EBSERHADMINISTRATIVA019__PAG_3.PDF'
const chave = 'https://cdn.cebraspe.org.br/concursos/EBSERH_18_ADMINISTRATIVO/arquivos/GAB_DEFINITIVO_393_EBSERHADMINISTRATIVA019.PDF'
const raw = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`, 'utf8'))
if (raw.length !== 61) throw Error(`Esperava 61 pendências atuais, encontrei ${raw.length}`)

const answersText = '41:C|42:E|43:E|44:C|45:C|46:E|47:E|48:C|49:C|50:E|51:C|52:C|53:C|54:C|55:E|56:C|57:E|58:E|59:E|60:C|61:E|62:E|63:C|64:C|65:C|66:C|67:C|68:E|69:C|70:E|71:E|72:E|73:C|74:E|75:E|76:C|77:E|78:E|79:E|80:C|81:C|82:C|83:C|84:C|85:E|86:E|87:E|88:C|89:C|90:E|91:C|92:E|93:C|94:C|95:C|96:E|97:E|98:E|99:C|100:E'
const answers = new Map(answersText.split('|').map(v => { const [n,a]=v.split(':'); return [Number(n),a] }))
const keyHash = createHash('sha256').update(answersText).digest('hex')
const exam = 'EBSERH 2018 — Cargo 19, Técnico em Segurança do Trabalho (aplicação em 06/05/2018)'

const topic = {
  41:['Engenharia Ambiental','Resíduos de serviços de saúde: coletores para materiais perfurocortantes.','Média'],
  42:['Engenharia Ambiental','Resíduos de serviços de saúde: rejeitos radioativos e formas de tratamento.','Média'],
  43:['Engenharia Ambiental','Resíduos de serviços de saúde: classificação e segregação de resíduos comuns de copa e cozinha.','Média'],
  44:['Engenharia Ambiental','Resíduos de serviços de saúde: licenciamento ambiental da disposição final.','Média'],
  45:['Engenharia Ambiental','Resíduos de serviços de saúde: destinação de peças anatômicas humanas.','Difícil'],
  46:['Engenharia Ambiental','Resíduos de serviços de saúde: tratamento e reciclagem de resíduos químicos.','Média'],
  47:['Engenharia Ambiental','Resíduos de serviços de saúde: consórcios intermunicipais para tratamento e destinação final.','Média'],
  48:['Engenharia Ambiental','Resíduos sólidos: resíduos secundários e destinação de cinzas da incineração.','Média'],
  49:['Engenharia Ambiental','Resíduos de serviços de saúde: responsabilidade do gerador pelo ciclo de gerenciamento.','Fácil'],
  50:['Segurança do Trabalho','Resíduos de serviços de saúde: responsabilidade técnica pela elaboração do PGRSS.','Média'],
  51:['Engenharia Ambiental','Resíduos de serviços de saúde: tratamento e destinação de filtros de ar e gases contaminados.','Difícil'],
  52:['Engenharia Ambiental','Resíduos de serviços de saúde: segregação na origem e redução do volume tratado.','Fácil'],
  53:['Segurança do Trabalho','Resíduos de serviços de saúde: habilitação do responsável técnico pelo PGRSS.','Média'],
  55:['Engenharia Ambiental','Saneamento ambiental: lançamento de efluentes de serviços de saúde em corpos hídricos.','Difícil'],
  56:['Segurança do Trabalho','Prevenção e combate a incêndios: classificação do fogo em materiais têxteis (classe A).','Fácil'],
  57:['Segurança do Trabalho','Prevenção e combate a incêndios: método de abafamento em fogo de materiais sólidos.','Média'],
  58:['Segurança do Trabalho','Prevenção e combate a incêndios: rescaldo e prevenção de reignição.','Fácil'],
  59:['Segurança do Trabalho','Prevenção e combate a incêndios: agente extintor adequado para fogo em equipamento elétrico energizado.','Média'],
  60:['Segurança do Trabalho','Prevenção e combate a incêndios: comburente e elementos necessários à combustão.','Fácil'],
  61:['Segurança do Trabalho','Riscos ocupacionais: classificação do acidente com perfurocortante contaminado por sangue.','Média'],
  62:['Segurança do Trabalho','EPI e responsabilidade do empregador: fornecimento, exigência e fiscalização do uso.','Média'],
  63:['Segurança do Trabalho','Riscos ocupacionais: classificação de agentes biológicos transmissíveis pelo sangue.','Fácil'],
  64:['Segurança do Trabalho','NR-32: capacitação dos trabalhadores em segregação, acondicionamento e transporte de resíduos.','Média'],
  65:['Segurança do Trabalho','Inspeção de segurança: classificação e abrangência das inspeções.','Média'],
  66:['Primeiros Socorros','Suporte básico de vida: reconhecimento da parada cardiorrespiratória.','Fácil'],
  67:['Primeiros Socorros','Atendimento inicial: sinais e sintomas de choque elétrico.','Fácil'],
  68:['Primeiros Socorros','Traumatologia: distinção entre escoriação e contusão.','Média'],
  69:['Primeiros Socorros','Traumatologia: identificação de entorse e lesões ligamentares.','Média'],
  70:['Ergonomia','Conforto térmico ocupacional: índice de temperatura efetiva.','Média'],
  71:['Ergonomia','Conforto ambiental: umidade relativa do ar em ambientes de trabalho.','Fácil'],
  72:['Ergonomia','Conforto acústico: medição do nível de ruído em ambientes de trabalho.','Média'],
  73:['Segurança do Trabalho','NR-32 e biossegurança: requisitos de higiene para manutenção de equipamentos hospitalares.','Média'],
  74:['Segurança do Trabalho','Estatística de acidentes: incapacidade temporária total e dias perdidos.','Difícil'],
  75:['Segurança do Trabalho','Estatística de acidentes: cálculo da taxa de frequência.','Difícil'],
  76:['Segurança do Trabalho','Estatística de acidentes: cálculo da taxa de gravidade.','Difícil'],
  77:['Segurança do Trabalho','Estatística de acidentes: relação entre indicadores e grau de risco da atividade.','Média'],
  78:['Segurança do Trabalho','Ventilação industrial: ventilação geral diluidora e controle de contaminantes.','Média'],
  79:['Segurança do Trabalho','Ventilação industrial: sistemas de insuflação e exaustão.','Média'],
  80:['Segurança do Trabalho','Ventilação industrial: sistemas naturais e mecânicos.','Fácil'],
  81:['Engenharia Ambiental','Saneamento básico: componentes dos serviços públicos e saúde coletiva.','Fácil'],
  82:['Engenharia Ambiental','Saneamento básico: sustentabilidade econômico-financeira e remuneração dos serviços.','Média'],
  83:['Segurança do Trabalho','EPI: proteção térmica de crânio e pescoço por balaclava.','Fácil'],
  84:['Segurança do Trabalho','EPI para soldagem: proteção ocular e facial contra radiação infravermelha.','Fácil'],
  85:['Segurança do Trabalho','EPI: creme protetor para mãos e braços contra agentes químicos.','Média'],
  86:['Segurança do Trabalho','Higiene ocupacional: proteção da integridade física e mental do trabalhador.','Média'],
  87:['Segurança do Trabalho','Higiene ocupacional: agentes de riscos ambientais físicos, químicos e biológicos.','Média'],
  88:['Segurança do Trabalho','Higiene e segurança do trabalho: objetivos e proteção integral à saúde.','Fácil'],
  89:['Segurança do Trabalho','NR-7: PCMSO e articulação com as demais normas regulamentadoras.','Média'],
  90:['Segurança do Trabalho','NR-9: obrigatoriedade de prevenção e controle dos riscos ambientais.','Média'],
  91:['Legislação Previdenciária','Acidente do trabalho: conceito legal e efeitos sobre capacidade laborativa.','Média'],
  92:['Legislação Previdenciária','Comunicação de Acidente de Trabalho (CAT): dever e prazo de comunicação pelo empregador.','Média'],
  93:['Psicologia do Trabalho','Psicologia organizacional: comportamento de grupos e interação indivíduo-grupo.','Média'],
  94:['Ergonomia','LER/DORT: fatores de risco biomecânicos e ambientais no trabalho.','Média'],
  95:['Segurança do Trabalho','Segurança do trabalho: prevenção de acidentes e doenças ocupacionais.','Fácil'],
  96:['Segurança do Trabalho','NR-2: inspeção prévia de estabelecimentos e alterações de instalações.','Média'],
  97:['Segurança do Trabalho','Organização da inspeção do trabalho: atribuições e âmbito do órgão nacional de SST.','Média'],
  98:['Segurança do Trabalho','CIPA: finalidade, composição e representação dos trabalhadores e empregadores.','Difícil'],
  99:['Segurança do Trabalho','EPI: obrigação de fornecimento gratuito, adequado e em condições de uso.','Fácil'],
  100:['Segurança do Trabalho','Ventilação hospitalar: temperatura, umidade e taxa mínima de renovação do ar.','Difícil'],
}

const contextByItem = n => {
  if (n >= 41 && n <= 46) return 'Julgue os itens relacionados ao gerenciamento de resíduos sólidos produzidos no ambiente hospitalar.'
  if (n >= 47 && n <= 51) return 'Tendo em vista que o tratamento e a disposição final de resíduos sólidos de serviços de saúde devem seguir critérios técnicos e operacionais adequados para minimizar riscos ao meio ambiente e à saúde pública, julgue o item.'
  if (n >= 52 && n <= 55) return 'A respeito do saneamento ambiental em serviços de saúde, julgue o item.'
  if (n >= 56 && n <= 60) return 'Situação: incêndio em uma fábrica têxtil destruiu malhas armazenadas em um galpão e produtos químicos em outro depósito. Foram utilizados 80 mil litros de água e três caminhões para conter as chamas e fazer o rescaldo. Julgue o item sobre a situação e o combate a incêndios.'
  if (n >= 61 && n <= 65) return 'Situação: durante uma inspeção de segurança e higiene ocupacional na coleta e distribuição de resíduos hospitalares, um empregado que manuseava sacos de lixo sem as luvas recomendadas sofreu perfuração na mão por agulha suja de sangue. O técnico também encontrou seringas e agulhas contaminadas mal acondicionadas. Julgue o item correlacionado.'
  if (n >= 66 && n <= 69) return 'Julgue o item a respeito de primeiros socorros.'
  if (n >= 70 && n <= 73) return 'Situação: uma empresa pretende construir um escritório de engenharia, projetos e manutenção de equipamentos hospitalares conforme a legislação de segurança e higiene do trabalho e os princípios de ergonomia. Julgue o item.'
  if (n >= 74 && n <= 77) return 'Situação: uma prestadora de serviços registrou em fevereiro de 2018, com 24.000 horas-homem trabalhadas, 2 acidentes com afastamento e 12 sem afastamento. Nos acidentes com afastamento foram computados 12 dias perdidos e os empregados retornaram ao trabalho no mês seguinte. Julgue a assertiva.'
  if (n >= 78 && n <= 80) return 'Julgue o item sobre ventilação industrial.'
  if (n >= 81 && n <= 82) return 'Os serviços públicos de saneamento básico devem observar, entre outros, os princípios fundamentais da universalização do acesso. Julgue o item.'
  if (n >= 83 && n <= 85) return 'Julgue o item a respeito de equipamento de proteção individual (EPI).'
  if (n >= 86 && n <= 90) return 'Julgue o item a respeito de saneamento ambiental em serviços de saúde.'
  if (n >= 91 && n <= 94) return 'Julgue o item sobre conceitos, causas e consequências dos acidentes de trabalho e doenças ocupacionais, ou sobre psicologia do trabalho.'
  if (n >= 95 && n <= 98) return 'Julgue o item acerca de saúde e segurança do trabalho no Brasil.'
  return 'Considere a legislação brasileira de segurança do trabalho e as noções de ventilação hospitalar. Julgue o item.'
}

const cleanups = new Map([
  [46,'A legislação pertinente proíbe o encaminhamento de resíduos químicos para reciclagem, pois eles apresentam alto risco de contaminação.'],
  [51,'Com relação aos filtros de ar e aos gases aspirados de áreas contaminadas de serviços de saúde, admite-se a sua disposição final, sem tratamento anterior, em locais licenciados para receber resíduos de serviços de saúde.'],
  [55,'Apenas em caráter absolutamente excepcional e nos termos taxativamente expressos em lei será autorizado o lançamento in natura dos efluentes líquidos provenientes de um estabelecimento de saúde em determinado rio, desde que esse curso d’água seja perene e pertença a uma única bacia hidrográfica.'],
  [60,'Um elemento essencial para que o fogo exista é o comburente, que deve atender a proporções adequadas.'],
  [62,'Se o trabalhador acidentado tiver recebido o equipamento de proteção individual (EPI) adequado à atividade e deliberadamente tiver se recusado a usá-lo, a empresa não será responsabilizada, já que, legalmente, não é obrigada a exigir o uso do equipamento.'],
  [70,'O índice de temperatura efetiva do escritório deverá estar entre 23 °C e 25 °C.'],
  [73,'Se o setor de manutenção de equipamentos pretender dar assistência técnica a equipamentos médico-hospitalares que possam estar infectados com contaminantes biológicos, o local de funcionamento desse setor deverá contar, entre outros itens essenciais, com lavatório exclusivo para a higiene das mãos, água corrente e toalhas descartáveis.'],
  [80,'Uma instalação de ventilação pode ser classificada como natural ou forçada.'],
  [82,'Os serviços públicos de saneamento básico terão a sustentabilidade econômico-financeira assegurada, sempre que possível, mediante remuneração pela prestação desses serviços.'],
  [85,'O creme protetor de segurança, destinado à proteção dos membros superiores contra agentes químicos, não é considerado equipamento de proteção individual.'],
  [90,'Embora seja composto por um conjunto de ações que visa preservar a saúde e a integridade dos trabalhadores, bem como o meio ambiente e os recursos naturais, o Programa de Prevenção de Riscos Ambientais (PPRA) é de implantação facultativa pelas empresas nacionais.'],
  [98,'De acordo com o dimensionamento previsto na norma regulamentadora pertinente, a Comissão Interna de Prevenção de Acidentes (CIPA), que tem como objetivo prevenir acidentes e doenças decorrentes do trabalho, deverá ser composta por representantes do empregador, dos empregados e dos sindicatos de ambas as categorias.'],
  [100,'Em conformidade com as normas da ANVISA, em qualquer ambiente hospitalar climatizado, a temperatura deverá variar de 20 °C a 28 °C no verão e de 20 °C a 25 °C no inverno, com umidade entre 40% e 65% e taxa mínima de renovação de 27 m³/h por pessoa.'],
])
const duplicateTo = new Map([
  ['extr-70b2a0f188fc8e4bca2c','extr-331758cc287d8ae455c6'],
  ['extr-2d39ef8442b3a1b0fb08','extr-bbfc7e16541b634084f2'],
])
const qById = new Map(raw.map(q => [q.id,q]))
const numbers = new Set(raw.map(q => Number(q.numero)))
if (numbers.size !== 59 || raw.filter(q => Number(q.numero) === 55).length !== 2 || raw.filter(q => Number(q.numero) === 60).length !== 2) throw Error('Duplicatas ou cobertura numérica inesperadas')

const decisions = raw.map(q => {
  const n = Number(q.numero)
  const [materia,conteudo,dificuldade] = topic[n] || []
  const letter = answers.get(n)
  if (!materia || !conteudo || !letter) throw Error(`Classificação/gabarito ausente para o item ${n}`)
  const page = Number(q.pagina)
  const image = `paginas/${doc}-${String(page).padStart(4,'0')}.webp`
  const duplicate = duplicateTo.has(q.id)
  const enunciado = cleanups.get(n) || String(q.enunciado || '').replace(/CESPE\s*\|\s*CEBRASPE[\s\S]*$/,'').replace(/\n(?:A respeito|Acerca|Considerando|Os serviços públicos)[\s\S]*$/,'').replace(/\s+/g,' ').trim()
  const d = {
    id:q.id,
    sha256_enunciado:hashRevisao(q.enunciado),
    materia,
    conteudo,
    ano:2018,
    concurso:exam,
    numero_original:n,
    pagina:page,
    dificuldade,
    dificuldade_estimada:true,
    dificuldade_evidencia:'Estimativa editorial baseada no domínio técnico, na extensão do raciocínio normativo e no cálculo exigido; a banca não publicou faixa de dificuldade por item.',
    classificacao_fonte:prova,
    motivo:`CEBRASPE — EBSERH 2018, Cargo 19 — Técnico em Segurança do Trabalho; item ${n}, página ${page}. Matéria e tópico conferidos no comando e no conteúdo da prova oficial; resposta cotejada com o gabarito definitivo.`,
    enunciado,
    texto_apoio:contextByItem(n),
    opcoes:['Certo','Errado'],
    resposta_correta:letter==='C'?0:1,
    anulada:false,
    gabarito_oficial:{
      fonte:chave,
      arquivo:'GAB_DEFINITIVO_393_EBSERHADMINISTRATIVA019.PDF',
      sha256:keyHash,
      sha256_tipo:'sha256_da_transcricao_canonica_dos_gabaritos_dos_itens_41_a_100; nao_e_hash_do_pdf',
      numero:n,
      pagina:1,
      resposta:letter,
      criterio:'Gabarito oficial definitivo do Cargo 19 — Técnico em Segurança do Trabalho, aplicado em 06/05/2018.'
    },
    ...(duplicate?{
      apta_resolucao:false,
      inelegibilidade_motivo:`Duplicata do item ${n}; mantida a versão canônica ${duplicateTo.get(q.id)}.`,
      duplicada_de:duplicateTo.get(q.id),
    }:{
      apta_resolucao:true,
      remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente'],
      visual:{pagina:page,imagem:image,motivo:'Página do caderno oficial conferida; referências visuais/contextuais preservam os cenários, tabelas e dados exigidos pelo item.'}
    })
  }
  if (!duplicate) {
    const extra=(q.contexto||[]).filter(x=>Number(x.pagina)!==page).map(x=>({pagina:Number(x.pagina),imagem:x.imagem,texto:'Página contígua da prova oficial, vinculada quando necessária para completar o contexto do item.'}))
    if(extra.length)d.imagens_contexto=extra
  }
  return d
})

if(decisions.length!==61||decisions.filter(d=>d.apta_resolucao===true).length!==59||decisions.filter(d=>d.apta_resolucao===false).length!==2)throw Error('Contagens do pacote inconsistentes')
for(const d of decisions.filter(x=>x.visual))await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## EBSERH 2018 — Cargo 19, Técnico em Segurança do Trabalho — v260\n\n- Reclassifiquei 59 itens únicos por matéria e tópico, distribuídos entre Engenharia Ambiental, Segurança do Trabalho, Primeiros Socorros, Ergonomia, Legislação Previdenciária e Psicologia do Trabalho; associei concurso, cargo, ano e dificuldade estimada.\n- Restaurei enunciados contaminados com instruções e questões vizinhas (46, 51, 55, 60, 73, 80, 82, 85, 90 e 98), corrigi unidades e grafia e vinculei os contextos compartilhados de incêndio, acidente com perfurocortante, escritório e estatística de acidentes.\n- Identifiquei e sinalizei duas duplicatas (itens 55 e 60), preservando um registro canônico de cada. Vinculei o gabarito definitivo aos 59 itens únicos e associei as páginas originais com imagens.\n- Alteração local; não publicada na nuvem.\n- Fontes oficiais: [caderno do Cargo 19](<${prova}>), [gabarito definitivo](<${chave}>), [página oficial do concurso](https://cdn.cebraspe.org.br/concursos/EBSERH_18_ADMINISTRATIVA/).\n`)
console.log(JSON.stringify({...report,reviewed:61,canonical:59,duplicates:2,officialAnswers:59},null,2))
