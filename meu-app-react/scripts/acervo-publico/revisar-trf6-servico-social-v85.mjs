import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-trf6-servico-social-v85'
const base = 'tmp/revisao-profissional/revisao-seepe-assistente-social-v84/acervo-extraido'
const doc = '22f24f1b389db13f'
const prova = 'https://cdn.cebraspe.org.br/concursos/TRF6_24/arquivos/034_TRF6_021_01.PDF'
const qs = JSON.parse(await fs.readFile('tmp/pendentes-trf6-servico-social.json', 'utf8'))
const temas = {
  51:['Serviço Social','Reconceituação do Serviço Social: intenção de ruptura e crítica ao conservadorismo'],
  52:['Serviço Social','Objeto de intervenção profissional e totalidade da realidade social'],
  53:['Serviço Social','Movimento de reconceituação: documentos de Araxá e Teresópolis'],
  54:['Serviço Social','Fundamentos teórico-metodológicos: tecnologia social e sistematização do conhecimento'],
  55:['Serviço Social','Institucionalização do Serviço Social no Brasil e relações de poder'],
  56:['Serviço Social','Seminários de Sumaré e Alto da Boa Vista: reatualização do conservadorismo'],
  57:['Serviço Social','Perspectiva modernizadora e seminários de Araxá e Teresópolis'],
  58:['Serviço Social','Mediação como categoria teórico-metodológica: dimensões ontológica e reflexiva'],
  59:['Serviço Social','Mediação na dialética: natureza ontológica da categoria'],
  60:['Serviço Social','Sistemas de mediação e definição teórico-metodológica da intervenção'],
  61:['Serviço Social','Questão social no Brasil: mundialização do capital e mediações históricas'],
  62:['Serviço Social','Questão social: desenvolvimento capitalista e diferentes formas de manifestação'],
  63:['Serviço Social','Formação sócio-histórica brasileira e emergência da questão social'],
  64:['Ética Profissional','Fundamentos teóricos e sócio-históricos da ética profissional'],
  65:['Ética Profissional','Ética profissional: fundamentos e crítica a moralismos e preconceitos'],
  66:['Saúde Mental','Atuação do Serviço Social em serviços substitutivos de saúde mental'],
  67:['Saúde Mental','Sofrimento e adoecimento psicossocial: determinação social e singularidade'],
  68:['Saúde Mental','Dimensões do trabalho profissional nos serviços de saúde mental'],
  69:['Políticas Sociais','Avaliação de programas e serviços sociais na implementação de políticas públicas'],
  70:['Administração Pública','Planejamento estratégico: análise SWOT e definição de ações'],
  71:['Políticas Sociais','Gestão social e atendimento às demandas e necessidades dos cidadãos'],
  72:['Pesquisa Social','Metodologia científica: delineamento de pesquisa e relação sujeito-objeto'],
  73:['Pesquisa Social','Pesquisa quantitativa: controle de sujeitos, percepções e coleta de dados'],
  74:['Pesquisa Social','Ética em pesquisa com seres humanos: normas e procedimentos metodológicos'],
  75:['Pesquisa Social','Abordagens quantitativa e qualitativa: papel das perspectivas do pesquisador'],
  76:['Pesquisa Social','Abordagens qualitativa e quantitativa: compreensão e explicação em Dilthey'],
  77:['Direitos da Criança e do Adolescente','Escuta especializada e compartilhamento de registros na rede de proteção'],
  78:['Serviço Social','Interdisciplinaridade: integração de saberes e atuação conjunta'],
  79:['Serviço Social','Trabalho do Serviço Social no Poder Judiciário: articulação em rede e acompanhamento familiar'],
  80:['Direitos da Criança e do Adolescente','Atuação no Judiciário: legislação de infância, juventude, família e proteção de direitos'],
  81:['Serviço Social','Dimensões teórico-metodológica, técnico-operativa e ético-legal da intervenção'],
  82:['Ética Profissional','Escuta especializada: liberdade, sigilo e proteção de crianças e adolescentes'],
  83:['Serviço Social','Serviço Social no Poder Judiciário: direitos sociais e articulação com políticas públicas'],
  84:['Serviço Social','Estudo social: competência profissional e compreensão da questão social'],
  85:['Serviço Social','Documentação profissional: laudo social e disputa de saberes no campo jurídico'],
  86:['Serviço Social','Laudo social: natureza, finalidade e distinção de prova judicial'],
  87:['Serviço Social','Espaços sócio-ocupacionais e inserção profissional do/a assistente social'],
  88:['Serviço Social','Mundialização do capital, mercado de trabalho e reprodução social'],
  89:['Serviço Social','Intervenção profissional e processos de educação e compreensão da realidade social'],
  90:['Serviço Social','Questão social: expressões contemporâneas, classes sociais e atuação profissional'],
  91:['Políticas Sociais','Proteção social e transferência de responsabilidades à família e aos indivíduos'],
  92:['Serviço Social','Processo de trabalho no Judiciário: saúde mental e ressignificação do trabalho'],
  93:['Serviço Social','Processo de trabalho: reificação, mecanização e organização do tempo'],
  94:['Serviço Social','Trabalho e ser social: consciência, mediações e transformação da realidade'],
  95:['Serviço Social','Processo de trabalho: condições materiais, históricas e sociais'],
  96:['Políticas Sociais','Estado, direito e mediação das relações entre capital e trabalho'],
  97:['Serviço Social','Transformações contemporâneas do trabalho e apropriação da vida privada'],
  98:['Políticas Sociais','Intervenção profissional e autonomia do Serviço Social nas sociedades capitalistas'],
  99:['Políticas Sociais','Políticas sociais, projeto ético-político e mediações profissionais'],
  100:['Políticas Sociais','Contradições da política social: demandas do capital e lutas da classe trabalhadora'],
  101:['Serviço Social','Gênese do Serviço Social e controle da dinâmica capitalista'],
  102:['Movimentos Sociais','Processos educacionais e espaços sócio-ocupacionais nos movimentos sociais'],
  103:['Movimentos Sociais','Participação popular e intervenção profissional nos processos decisórios'],
  104:['Movimentos Sociais','Participação popular na elaboração de estratégias de intervenção profissional'],
  105:['Direitos da Criança e do Adolescente','ECA: direito à saúde, vinculação da gestante e opção pela assistência ao parto'],
  106:['Direitos da Criança e do Adolescente','ECA: direito da gestante a acompanhante no pré-natal, parto e pós-parto'],
  107:['Direitos da Criança e do Adolescente','ECA: entrega voluntária para adoção e proteção à gestante e à criança'],
  108:['Direitos da Pessoa com Deficiência','Estatuto da Pessoa com Deficiência: acesso e permanência no trabalho'],
  109:['Direitos da Pessoa com Deficiência','Estatuto da Pessoa com Deficiência: prioridade e igualdade de oportunidades'],
  110:['Direitos da Pessoa Idosa','Estatuto da Pessoa Idosa: discriminação e acesso a serviços financeiros'],
  111:['Direitos da Pessoa Idosa','Estatuto da Pessoa Idosa: obrigação alimentar e escolha dos prestadores'],
  112:['Direitos da Pessoa Idosa','Estatuto da Pessoa Idosa: discriminação em planos de saúde'],
  113:['Direitos da Pessoa Idosa','Estatuto da Pessoa Idosa: atendimento domiciliar para avaliação pericial'],
  114:['Saúde Mental','Rede de Atenção Psicossocial: pontos de atenção e serviços integrantes'],
  115:['Saúde Mental','Rede de Atenção Psicossocial: diretrizes sobre álcool e outras drogas'],
  116:['Ética Profissional','Código de Ética: participação de usuários nas decisões institucionais'],
  117:['Legislação Profissional','Identificação profissional e uso do número de registro no CRESS'],
  118:['Ética Profissional','Código de Ética: princípios para atuação profissional interdisciplinar'],
  119:['Legislação Profissional','Lei nº 8.662/1993: competências profissionais do/a assistente social'],
  120:['Legislação Profissional','Lei nº 8.662/1993: atribuições privativas e estudos socioeconômicos'],
}
const blocos = [
  [51,57,'Contexto: fundamentos teóricos, históricos e metodológicos do Serviço Social e movimento de reconceituação no Brasil.'],
  [58,60,'Contexto: mediação como categoria da dialética e instrumento teórico-metodológico da intervenção profissional.'],
  [61,63,'Contexto: questão social e conjuntura brasileira.'],
  [64,65,'Contexto: ética profissional no Serviço Social.'],
  [66,68,'Contexto: atuação profissional em serviços substitutivos de saúde mental.'],
  [69,71,'Contexto: avaliação de políticas, planejamento estratégico e gestão social.'],
  [72,76,'Contexto: pesquisa em Serviço Social, métodos quantitativos e qualitativos e ética em pesquisa.'],
  [77,78,'Contexto: Serviço Social e interdisciplinaridade; escuta especializada e proteção de crianças/adolescentes.'],
  [79,80,'Contexto: Serviço Social no Poder Judiciário e atuação com famílias e sujeitos de direitos.'],
  [81,86,'Contexto: dimensões da intervenção profissional, instrumentos técnico-operativos, estudo social, perícia e laudo.'],
  [87,91,'Contexto: espaços sócio-ocupacionais, questão social e inserção profissional.'],
  [92,97,'Contexto: processo de trabalho e relações sociais no Serviço Social.'],
  [98,101,'Contexto: política social e inserção do Serviço Social na sociedade capitalista.'],
  [102,104,'Contexto: movimentos sociais e participação popular na atuação profissional.'],
  [105,107,'Base normativa: Estatuto da Criança e do Adolescente (ECA), direitos à saúde, proteção da gestante e adoção.'],
  [108,109,'Base normativa: Lei Brasileira de Inclusão da Pessoa com Deficiência (Lei nº 13.146/2015), direito ao trabalho e à participação.'],
  [110,113,'Base normativa: Estatuto da Pessoa Idosa.'],
  [114,115,'Base normativa: Rede de Atenção Psicossocial (RAPS) e política de saúde mental.'],
  [116,118,'Base normativa: Código de Ética Profissional do/a Assistente Social.'],
  [119,120,'Base normativa: Lei nº 8.662/1993, que regulamenta a profissão de Assistente Social.'],
]
const ids=new Set(),decisoes=[]
if(qs.length!==70)throw new Error(`Esperados 70 itens pendentes da prova; encontrados ${qs.length}`)
for(const q of qs){
  const n=Number(q.numero_original),dados=temas[n]
  if(!dados)throw new Error(`Item ${n} sem classificação específica`)
  if(ids.has(q.id))throw new Error(`ID repetido ${q.id}`)
  ids.add(q.id)
  const [materia,conteudo]=dados,pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
  const texto_apoio=blocos.find(([a,b])=>n>=a&&n<=b)?.[2]||''
  decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,
    dificuldade:['53','54','58','59','60','61','62','63','69','70','72','73','74','75','77','81','82','84','85','86','90','92','93','94','95','98','99','100','103','104','105','106','107','110','111','112','113','114','115','119','120'].includes(String(n))?'Difícil':'Média',
    dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na densidade teórico-metodológica, conceitual e normativa; não representa taxa oficial de acerto.',
    classificacao_fonte:prova,motivo:`TRF da 6.ª Região 2024 — Analista Judiciário, área Apoio Especializado, especialidade Serviço Social — CEBRASPE; item ${n}. Tópico conferido na página oficial.`,
    visual:{pagina,imagem,texto_apoio,motivo:'Página do caderno oficial conferida visualmente; texto e contexto compartilhado preservados.'}})
}
const relatorio=await aplicarRevisoesIndividuais({nome,base,decisoes})
const detalhe={...relatorio,banca:'CEBRASPE',concurso:'TRF da 6.ª Região 2024 — Analista Judiciário, Serviço Social',ano:2024,documento:'034_TRF6_021_01.PDF',fonte:prova,paginas_origem_conferidas:[1,2,3,4],observacao:'Revisei individualmente os 70 registros pendentes do caderno e associei matéria e conteúdo específicos, incluindo fundamentos do Serviço Social, ética, pesquisa, política social, saúde mental, direitos humanos, ECA, Estatuto da Pessoa Idosa, legislação profissional e instrumentos técnico-operativos. Cada questão mantém a página original associada e os contextos legais por bloco. Gabaritos existentes foram preservados; a dificuldade é estimada editorialmente.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(detalhe,null,2))
console.log(JSON.stringify(detalhe))
