import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-funpresp-auditoria-investimentos-v82'
const base='tmp/revisao-profissional/revisao-pires-rio-servico-social-v81/acervo-extraido'
const doc='2402763d4cdb1320'
const prova='https://cdn.cebraspe.org.br/concursos/FUNPRESP_16_JUD/arquivos/274FUNPRESP_JUD_003_01.pdf'
const qs=JSON.parse(await fs.readFile('tmp/pendentes-funpresp-contabilidade-2016.json','utf8')).filter(q=>q.materia==='Contabilidade')
const temas={
51:['Auditoria','Objetivos gerais da auditoria independente e avaliação de controles internos'],
52:['Auditoria','Auditoria independente: opinião sobre demonstrações contábeis'],
53:['Auditoria','Auditoria de conformidade (compliance)'],
54:['Auditoria','Planejamento de auditoria e avaliação de controles internos'],
55:['Auditoria','Controle interno: segregação de funções e conluio'],
56:['Auditoria','Avaliação de controles internos e comunicação de deficiências'],
57:['Auditoria','Testes substantivos e evidências de auditoria'],
58:['Auditoria','Procedimentos analíticos de auditoria'],
59:['Auditoria','Testes de subavaliação e superavaliação de saldos'],
60:['Auditoria','Confirmação externa de saldos: circularização positiva'],
61:['Auditoria','Procedimentos de auditoria: inspeção documental'],
62:['Auditoria','Fraude e erro: confidencialidade e comunicação a autoridades'],
63:['Auditoria','Fraude e erro: ceticismo profissional'],
64:['Auditoria','Amostragem: estratificação da população'],
65:['Auditoria','Amostragem estatística e seleção de itens'],
66:['Auditoria','Documentação de auditoria: retenção e guarda de papéis de trabalho'],
67:['Auditoria','Papéis de trabalho: evidência de conformidade com normas'],
68:['Auditoria','Relatório do auditor: abstenção de opinião e opinião modificada'],
69:['Auditoria','Relatório do auditor: distorções relevantes e abrangência dos efeitos'],
70:['Auditoria','Planejamento de auditoria: fases e procedimentos preliminares'],
71:['Auditoria','Planejamento de auditoria: avaliação de riscos de distorção relevante'],
72:['Auditoria','Programas de auditoria: contas de resultado e contas correlatas'],
73:['Auditoria','Auditoria de caixa: contagem e procedimentos de verificação'],
74:['Auditoria','Confirmação externa: circularização de fornecedores'],
75:['Direito Constitucional','Organização do Estado: separação de poderes e sistema de freios e contrapesos'],
76:['Mercado Financeiro','Brazilian Depositary Receipts (BDR): programa patrocinado nível III'],
77:['Mercado Financeiro','Brazilian Depositary Receipts: registro e dispensa de registro na CVM'],
78:['Mercado Financeiro','Brazilian Depositary Receipts: negociação em mercado de bolsa e balcão'],
79:['Mercado Financeiro','Brazilian Depositary Receipts: investidores autorizados no programa nível I'],
80:['Mercado Financeiro','Derivativos: contratos futuros, margem e ajustes diários'],
81:['Mercado Financeiro','Derivativos: contratos a termo e liquidação'],
82:['Mercado Financeiro','Derivativos: contratos de swap'],
83:['Mercado Financeiro','Derivativos: opções europeias e exercício'],
84:['Mercado Financeiro','Títulos públicos: Letras do Tesouro Nacional e Letras Financeiras do Tesouro'],
85:['Mercado Financeiro','Títulos públicos: NTN-B, cupons e tributação'],
86:['Mercado Financeiro','Tesouro Direto: finalidade, participantes e distribuição de títulos'],
87:['Mercado Financeiro','Títulos públicos: NTN-F e rentabilidade prefixada'],
88:['Mercado Financeiro','Títulos públicos: NTN-B Principal e indexação à inflação'],
89:['Previdência Complementar','PREVIC: competências sobre entidades fechadas de previdência complementar'],
90:['Mercado Financeiro','CVM: demonstrações financeiras e auditoria independente'],
92:['Sistema Financeiro Nacional','Banco Central: autorização para reorganização de instituições financeiras'],
93:['Sistema Financeiro Nacional','Conselho Monetário Nacional: regulação do mercado de valores mobiliários'],
94:['Mercado Financeiro','Cédula de Crédito Bancário emitida por instituição domiciliada no exterior'],
95:['Mercado Financeiro','Cédula de Crédito Imobiliário: garantia e forma de emissão'],
96:['Mercado Financeiro','Certificado de Recebíveis do Agronegócio: lastro e captação'],
97:['Mercado Financeiro','Investidor profissional e investidor qualificado'],
98:['Mercado Financeiro','Investidor não residente: definição e investimento no Brasil'],
99:['Mercado Financeiro','Debêntures: emissores autorizados'],
100:['Tributação','Imposto de Renda sobre rendimentos de Cédula de Crédito Imobiliário'],
101:['Previdência Complementar','EFPC: divergência não planejada e providências regulatórias'],
102:['Previdência Complementar','EFPC: competências do conselho fiscal e plano de aplicação'],
103:['Previdência Complementar','EFPC: atribuições do administrador estatutário tecnicamente qualificado'],
104:['Previdência Complementar','EFPC: limites de investimentos e recursos garantidores'],
105:['Previdência Complementar','EFPC: avaliação e princípios de risco'],
106:['Previdência Complementar','EFPC: equacionamento de déficit e redução de benefícios'],
107:['Previdência Complementar','EFPC: empréstimos ao patrocinador e segmentos de investimento'],
109:['Previdência Complementar','EFPC: derivativos e registro de operações'],
110:['Previdência Complementar','EFPC: gestão e controle dos recursos garantidores pelo AETQ'],
111:['Governança Corporativa','Controles internos e confiabilidade das informações contábeis'],
112:['Auditoria Interna','Monitoramento de controles internos e correção de deficiências'],
113:['Governança Corporativa','Conselho de administração, comitê de auditoria e membros externos'],
114:['Gestão de Riscos','Governança corporativa: definição e implementação do gerenciamento de riscos'],
115:['Gestão de Riscos','Riscos organizacionais internos e externos e resposta da entidade'],
116:['Previdência Complementar','Gestão de riscos: risco de subscrição em entidade aberta'],
117:['Previdência Complementar','Gestão de riscos: riscos operacional e financeiro'],
118:['Compliance','Prevenção à lavagem de dinheiro: investidores não residentes e operações atípicas'],
119:['Compliance','Prevenção à lavagem de dinheiro em fundos de investimento'],
120:['Governança Corporativa','Governança, interesse público e responsabilidade organizacional'],
}
const blocos=[
[51,52,'Bloco: objetivos e opinião da auditoria independente sobre demonstrações contábeis e controles internos.'],
[53,53,'Bloco: auditoria de conformidade (compliance).'],
[54,57,'Bloco: avaliação do sistema de controle interno e seus efeitos sobre os procedimentos de auditoria.'],
[58,61,'Bloco: técnicas e procedimentos de auditoria para obtenção de evidências.'],
[62,63,'Bloco: fraude e erro em auditoria independente.'],
[64,65,'Bloco: amostragem em auditoria.'],
[66,67,'Bloco: papéis de trabalho e documentação do auditor independente.'],
[68,69,'Bloco: relatórios e opiniões do auditor independente.'],
[70,71,'Bloco: planejamento e avaliação de riscos em auditoria.'],
[72,74,'Bloco: programas e procedimentos de auditoria em contas patrimoniais e de resultado.'],
[75,75,'Bloco: controle na administração pública.'],
[76,79,'Bloco: programas patrocinados de BDR (Brazilian Depositary Receipts).'],
[80,83,'Bloco: características formais dos contratos derivativos.'],
[84,88,'Bloco: títulos públicos federais e Tesouro Direto.'],
[89,93,'Bloco: competências e atribuições de PREVIC, CVM, SUSEP, Banco Central e Conselho Monetário Nacional.'],
[94,100,'Bloco: investidores qualificados e não residentes, títulos corporativos e valores mobiliários.'],
[101,106,'Bloco: normas aplicáveis às entidades fechadas de previdência complementar (EFPC).'],
[107,109,'Referência do bloco: Resolução CMN nº 3.792/2009, sobre aplicações dos recursos dos planos de benefícios das EFPC.'],
[110,110,'Bloco: atribuições do administrador estatutário tecnicamente qualificado (AETQ) em entidade fechada de previdência complementar.'],
[111,115,'Bloco: controles internos, monitoramento, governança corporativa e perfil de riscos.'],
[116,117,'Bloco: tipos de riscos associados às entidades de previdência complementar.'],
[118,119,'Bloco: controles internos para prevenção à lavagem de dinheiro e ao financiamento do terrorismo.'],
[120,120,'Bloco: governança corporativa e interesse público, conforme referência à IFAC.'],
]
const limpos={
51:'Comentar sobre as demonstrações contábeis nos relatórios de auditoria e fornecer opinião sobre a eficácia do controle interno são atribuições que integram os objetivos gerais do auditor.',
52:'A credibilidade das demonstrações contábeis é reforçada pelo auditor independente quando este manifesta opinião de que tais demonstrações foram elaboradas, em todos os aspectos relevantes, em conformidade com uma estrutura de relatório financeiro aplicável.',
61:'O exame de registros e documentos com vista à obtenção de evidência de autorização é um exemplo de aplicação do procedimento de auditoria denominado inspeção.',
65:'Na execução de procedimentos de auditoria, o uso da amostragem restringe-se à amostragem estatística, que consiste essencialmente na seleção aleatória dos itens que comporão a amostra.',
75:'Na administração pública, uma forma de controle é o sistema de freios e contrapesos, cuja principal característica é a divisão e a independência dos poderes da União.',
79:'A aquisição de BDR patrocinado nível I é exclusiva para investidores qualificados e empregados da empresa patrocinadora ou de outra empresa integrante do mesmo grupo econômico.',
88:'A rentabilidade da NTN-B Principal é composta por uma taxa anual pactuada no momento da compra mais a variação do Índice Nacional de Preços ao Consumidor (INPC).',
93:'Ao Conselho Monetário Nacional compete definir a política a ser observada na organização e no funcionamento do mercado de valores mobiliários.',
106:'O equacionamento de déficit em plano de benefícios das EFPC poderá ser realizado mediante redução do valor dos benefícios, porém apenas daqueles a conceder.',
110:'Entre as funções do administrador estatutário tecnicamente qualificado (AETQ) encontram-se a gestão, a alocação, a supervisão, o controle de risco e o acompanhamento dos recursos garantidores dos planos de benefícios das EFPC.',
120:'De acordo com a IFAC, a função da governança é garantir que as ações das organizações estejam alinhadas com o interesse público, devendo-se evitar qualquer tipo de intervenção do poder central, a fim de assegurar a plena autonomia das entidades que compõem a administração descentralizada, bem como certificar de que não haverá interferência da área política nas suas decisões.',
}
const difícil=new Set([52,54,56,57,59,60,62,64,65,68,69,71,72,74,76,77,78,79,80,81,82,83,84,85,87,88,89,90,91,92,93,94,95,96,98,100,101,102,103,104,105,106,107,109,110,112,113,114,115,116,117,118,119,120])
const vistos=new Map(),decisoes=[]
if(qs.length!==59)throw Error(`Esperados 59 registros contábeis; encontrados ${qs.length}`)
for(const q of qs){
 const n=Number(q.numero_original),[materia,conteudo]=temas[n]||[]
 if(!materia)throw Error(`Sem classificação para item ${n}`)
 const pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
 const texto=blocos.find(([a,b])=>n>=a&&n<=b)?.[2]
 const visual={pagina,imagem,texto_apoio:texto||'',motivo:'Página original conferida visualmente; classificação por assunto específico e contexto do bloco, preservando elementos gráficos da prova.'}
 if(limpos[n])visual.enunciado=limpos[n]
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2016,pagina,dificuldade:difícil.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade técnica, normativa e de análise financeira; não representa taxa oficial de acerto.',classificacao_fonte:prova,motivo:`FUNPRESP-JUD 2016 — Analista, área de investimento, CEBRASPE; item ${n}. Classificação conferida com o título da seção e o enunciado da página original.`,visual}
 const principal=vistos.get(n)
 if(principal){d.apta_resolucao=false;d.duplicada_de=principal;d.inelegibilidade_motivo=`Cópia extraída do item ${n} no mesmo caderno oficial; a ocorrência principal foi mantida disponível.`}
 else vistos.set(n,q.id)
 decisoes.push(d)
}
const duplicatas=decisoes.filter(d=>d.apta_resolucao===false)
if(duplicatas.length!==2)throw Error(`Esperadas duas extrações duplicadas (itens 51 e 61), encontradas ${duplicatas.length}`)
for(const d of decisoes)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(d.pagina).padStart(4,'0')}.webp`)
const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes})
const relatorio={...resultado,prova:'FUNPRESP-JUD 2016 — Analista, área de investimento',documento_id:doc,registros_revisados:59,questoes_unicas_classificadas:57,duplicatas_desativadas:duplicatas.map(d=>({id:d.id,duplicada_de:d.duplicada_de})),materias_específicas:'Auditoria, Direito Constitucional, Mercado Financeiro, Previdência Complementar, Sistema Financeiro Nacional, Tributação, Governança Corporativa, Auditoria Interna, Gestão de Riscos e Compliance',paginas_origem_conferidas:4,gabarito_hash_pendente:true,observacao:'Os 59 registros estavam agrupados como Contabilidade, embora a prova abranja Auditoria, mercado de capitais, previdência complementar, regulação financeira, controles, riscos e compliance. Classifiquei os temas individualmente, desativei duas cópias e corrigi enunciados contaminados por blocos seguintes. Gabarito não validado em arquivo local com hash; correção automática não habilitada.',fontes:[prova]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
