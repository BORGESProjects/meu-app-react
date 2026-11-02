import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'
const base='tmp/revisao-profissional/revisao-hub-farmacia-2018-v107/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-5d6688043602ddfb.json','utf8'))
const grupos=[];const definir=(a,b,conteudo,contexto)=>grupos.push({a,b,conteudo,contexto})
definir(1,5,'Atenção Primária à Saúde: fundamentos, diretrizes, vínculo, longitudinalidade e integralidade','Julgue os itens sobre fundamentos e diretrizes da atenção básica em saúde, organização territorial, acesso, vínculo e coordenação do cuidado.')
definir(6,11,'Saúde pública: competências interfederativas, financiamento e gestão da atenção básica','Julgue os itens sobre responsabilidades de municípios, estados, Distrito Federal e Ministério da Saúde na gestão, monitoramento, informação e formação em atenção básica.')
definir(12,14,'Atenção Primária à Saúde: composição e funcionamento da Estratégia Saúde da Família','Julgue os itens sobre composição das equipes, carga horária e cobertura populacional da Estratégia Saúde da Família e de agentes comunitários.')
definir(15,22,'Saúde coletiva: NASF, apoio matricial, projeto terapêutico singular e consulta compartilhada','Julgue os itens sobre Núcleos de Apoio à Saúde da Família, apoio matricial, genograma, projeto terapêutico singular, trabalho interdisciplinar e dimensões assistencial e pedagógica.')
definir(23,25,'Políticas de atenção básica para populações específicas: ribeirinhos e pessoas em situação de rua','Julgue os itens sobre equipes ribeirinhas, Consultório na Rua e responsabilidade da rede básica pelo cuidado integral das pessoas em situação de rua.')
definir(26,30,'Políticas de alimentação, nutrição e saúde bucal na atenção básica','Julgue os itens sobre Política Nacional de Saúde Bucal, equipes odontológicas e Política Nacional de Alimentação e Nutrição, incluindo prevenção de obesidade e carências nutricionais.')
definir(31,35,'Sistema Único de Saúde: princípios, legislação, regionalização e planejamento','Julgue os itens sobre equidade, NOB 01/96, redes de atenção, planejamento descentralizado e comissões intergestores do SUS.')
definir(36,40,'Política Nacional de Atenção Básica: conceitos, organização e equipes itinerantes','Julgue os itens sobre PMAQ, atenção básica e primária, NASF e organização dos Consultórios na Rua.')
definir(41,44,'Legislação do SUS: Decreto nº 7.508/2011 e organização das regiões de saúde','Julgue os itens sobre acesso à assistência farmacêutica, definição de região de saúde, pactuação de limites e mapa regional de serviços públicos e privados.')
definir(45,48,'Vigilância epidemiológica: febre amarela, notificação, diagnóstico e epizootias','Julgue os itens sobre notificação de casos suspeitos, diagnóstico post mortem e vigilância de epizootias de primatas como alerta de circulação viral.')
definir(49,53,'Vigilância em saúde: identificação, notificação e encaminhamento de violência contra criança','Caso de visita domiciliar da ESF: criança de 7 anos retraída, com hematomas e queimaduras, e relatos contraditórios dos responsáveis. Julgue os itens sobre abordagem profissional, notificação e proteção.')
definir(54,56,'Saúde pública: prevenção e tratamento do tabagismo e dependência de nicotina','Julgue os itens sobre organização de grupos para cessação, farmacoterapia e aplicação do teste de Fagerström.')
definir(57,60,'Vigilância em saúde: leptospirose após enchentes, saneamento e prevenção','Caso: bairro vulnerável alagado após chuvas, com lama, lixo, entulho, roedores mortos e preocupação com leptospirose. Julgue as recomendações à população e as ações da unidade de saúde.')
definir(61,71,'Saúde coletiva: epidemiologia, fatores de risco, classificação e rastreamento do diabetes mellitus','Julgue os itens sobre prevalência, determinantes e fatores de risco do diabetes, autocuidado, diabetes gestacional e diferenças clínicas entre DM1 e DM2.')
definir(72,75,'Atenção Primária à Saúde: alimentação infantil, saúde bucal, NASF e promoção de atividade física','Julgue os itens sobre a estratégia Amamenta e Alimenta Brasil, integração da saúde bucal, apoio multiprofissional e Programa Academia da Saúde.')
definir(76,79,'Práticas Integrativas e Complementares no SUS: crenoterapia, acupuntura, homeopatia e fitoterapia','Julgue os itens sobre práticas integrativas e complementares e sua concepção de cuidado e uso terapêutico.')
definir(80,84,'Saúde pública: tabagismo, dependência, exposição passiva e danos à saúde','Julgue os itens sobre dependência de nicotina, classificação diagnóstica, fertilidade, exposição passiva e impacto do tabaco na saúde pública.')
definir(85,90,'Imunização: calendário vacinal, BCG, HPV, febre amarela e vacinação em diferentes ciclos de vida','Julgue os itens sobre indicações, esquemas e benefícios da vacinação de crianças, adolescentes, adultos, idosos e gestantes.')
definir(91,96,'Política Nacional de Atenção Básica: responsabilidades, equipes e cobertura da ESF','Julgue os itens sobre análise de dados, infraestrutura das unidades, escopo da atenção básica, composição das equipes e população adscrita.')
definir(97,102,'Sistema Único de Saúde: Reforma Sanitária, participação social, controle e princípios legais','Julgue os itens sobre determinantes sociais da saúde, VIII Conferência Nacional de Saúde, Lei nº 8.142/1990, conselhos e objetivos/princípios do SUS.')
definir(103,107,'Gestão do SUS: Pactos pela Saúde e prioridades de saúde pública','Julgue os itens sobre dimensões do Pacto pela Saúde, prioridades do Pacto pela Vida, metas de prevenção e compromisso entre gestores.')
definir(108,112,'Promoção da Saúde: Política Nacional de Promoção da Saúde e prevenção de doenças crônicas','Julgue os itens sobre atenção básica, atividade física, lazer, tabagismo, resolubilidade e prevenção de doenças crônicas não transmissíveis.')
definir(113,116,'Saúde coletiva: atribuições, composição e posição do NASF na rede de atenção','Julgue os itens sobre atribuições profissionais, comunicação, porta de entrada e definição da composição dos Núcleos de Apoio à Saúde da Família.')
definir(117,120,'Atenção Primária à Saúde: atribuições comuns, consultas e cadastro territorial','Julgue os itens sobre cuidado à população cadastrada, consultas e procedimentos, atualização de cadastros e cobertura de agentes comunitários.')
const remover=new Map([
 [14,'Conforme previsão legal, a equipe de agentes comunitários de saúde deve ser suficiente para cobrir até metade da população cadastrada.'],
 [22,'O apoio matricial implica a orientação das equipes de Saúde da Família, aumentando sua capacidade para resolução dos problemas por meio da transferência tecnológica.'],
 [30,'A PNAN deve instituir o controle nutricional das famílias beneficiárias dos programas de transferência de renda e promover a nutrição adequada e saudável em ambientes institucionais.'],
 [40,'As equipes dos consultórios na rua devem cumprir carga horária de trinta horas semanais, adequando o horário de funcionamento desses consultórios à demanda.'],
 [44,'Ações e serviços de saúde prestados pela iniciativa privada compõem o mapa da saúde regional, estadual e nacional, mesmo que não sejam complementares ao SUS.'],
 [48,'Havendo morte de macacos concomitante à ocorrência de casos de febre amarela em humanos, faz-se necessário realizar vigilância de epizootias como evento de alerta para a circulação do vírus.'],
 [56,'O questionário de tolerância de Fagerström avalia o grau de dependência física à nicotina mediante valores que variam de zero a dez pontos.'],
 [60,'A equipe deve orientar a população sobre a distribuição da doença, suas formas de transmissão, manifestações clínicas e medidas de prevenção.'],
 [65,'O sedentarismo, a obesidade e os hábitos alimentares não saudáveis constituem importantes fatores de risco para o desenvolvimento de DM.'],
 [71,'O DM tipo 2 é uma doença crônica, de evolução lenta, que pode ser assintomática por muitos anos.'],
 [75,'O programa Academia da Saúde faz parte da estratégia de promoção à saúde e desenvolve ações que promovem a atividade física regular e a alimentação saudável.'],
 [84,'O tabagismo é considerado um problema de saúde pública mundial, podendo causar dependência física, psicológica e comportamental, em decorrência da presença de nicotina nos produtos à base de tabaco.'],
 [90,'Gestantes devem ser vacinadas contra o tétano a cada gestação, sempre no primeiro trimestre, não havendo benefícios da vacinação nos demais períodos da gestação.'],
 [96,'Na estratégia Saúde da Família, cada equipe é responsável por, no máximo, seis mil pessoas, sendo a média recomendada de cinco mil pessoas, respeitados os critérios de equidade.'],
 [102,'Conforme a Lei nº 8.080/1990, nos serviços de saúde deve-se obedecer aos princípios da integralidade, da universalidade e da equidade.'],
 [107,'O Pacto pela Vida é um compromisso entre os gestores do SUS em torno de prioridades que apresentem impacto sobre a situação de saúde da população.'],
 [112,'Reduzir a prevalência de obesidade, estimular a realização de atividade física, aumentar o consumo de frutas e hortaliças e reduzir o consumo médio de sal, como meio de prevenção e controle das doenças crônicas não transmissíveis (DCNT).'],
 [116,'A composição do NASF é definida pela equipe da estratégia Saúde da Família do município a partir das necessidades da população.']
])
const decisoes=[]
for(const q of pendentes){const n=Number(q.numero_original),g=grupos.find(x=>n>=x.a&&n<=x.b);if(!g)throw Error(`Sem tema para item ${n}`);let enunciado=remover.get(n)||q.enunciado;enunciado=enunciado.replace(/\s*\|\|.*$/s,'').replace(/\s+Espaço livre\s*$/i,'').replace(/\s+/g,' ').trim();decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Saúde Coletiva',conteudo:g.conteudo,ano:2018,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade normativa, epidemiológica e aplicada; não é nível oficial.',motivo:`Classificação por assunto de saúde coletiva efetivamente cobrado no item ${n}, conferido no caderno oficial.`,...(enunciado!==q.enunciado?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/5d6688043602ddfb-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:g.contexto,motivo:'Caderno oficial conferido; caso de violência, cenário de enchente/leptospirose e comandos compartilhados associados aos itens correspondentes.'}})}
if(decisoes.length!==101)throw Error(`Esperadas 101 classificações, encontradas ${decisoes.length}`)
await aplicarRevisoesIndividuais({nome:'revisao-hub-saude-coletiva-2018-v108',base,decisoes})
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-saude-coletiva-2018-v108/acervo-extraido')
