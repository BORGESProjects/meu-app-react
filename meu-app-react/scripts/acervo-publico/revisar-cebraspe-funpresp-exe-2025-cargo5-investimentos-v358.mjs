import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'
const doc='b0ab7071a3545c05'
const prova='https://cdn.cebraspe.org.br/concursos/FUNPRESP_24_EXE/arquivos/040_FUNPRESPEXE_005_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/funpresp_24_exe/arquivos/Gab_Definitivo_040_FUNPRESPEXE_005_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/FUNPRESP_24_EXE/arquivos/ED_1_2024_FUNPRESP_EXE_ABERTURA.PDF'
const concurso='FUNPRESP-EXE 2025 — Analista de Previdência Complementar — Área 5: Gestão de Investimentos e Riscos de Investimentos — Cargo 5'
const records=JSON.parse(await fs.readFile('tmp/pendentes-documento-'+doc+'.json','utf8'))
const key={56:'C',57:'C',58:'E',59:'C',60:'C',61:'E',62:'C',63:'C',64:'E',65:'E',66:'C',67:'C',68:'E',69:'C',70:'E',71:'C',72:'E',73:'C',74:'E',75:'E',76:'E',77:'C',78:'C',79:'E',80:'C',81:'C',82:'E',83:'C',84:'C',85:'E',86:'E',87:'E',88:'C',89:'E',90:'C',91:'C',92:'E',93:'C',94:'E',95:'C',96:'X',97:'E',98:'C',99:'E',100:'C',101:'C',102:'C',103:'C',104:'E',105:'C',106:'E',107:'E',108:'E',109:'E',110:'E',111:'E',112:'C',113:'C',114:'E',115:'C',116:'C',117:'C',118:'E',119:'C',120:'E'}
const keyHash='208ba729eb07a1ffcaf9c10d0590bf6c766d04a633157fd6c7f9b94df0f50ae6'
const topics={
56:'Externalidades negativas e imposto pigouviano',
57:'Utilidade marginal decrescente',
58:'Equilíbrio de mercado, elasticidades e excedente do consumidor',
60:'Concorrência perfeita e lucro econômico de longo prazo',
62:'Modelo clássico: determinação do produto e oferta agregada',
63:'Modelo novo-keynesiano: rigidez de preços e salários',
64:'Escolha intertemporal do consumo e renda corrente',
65:'Modelo de crescimento de Solow e fatores de produção',
66:'Estatística descritiva: variância amostral',
67:'Estatística descritiva: erro padrão da média',
68:'Estatística descritiva: mediana',
69:'Estatística descritiva: quartis e média',
70:'Estatística descritiva: intervalo interquartil',
71:'Regressão linear: desvio padrão dos resíduos',
72:'Regressão linear: coeficiente de determinação ajustado',
73:'Regressão linear: variância da variável dependente',
74:'Regressão linear: significância individual dos coeficientes',
75:'Regressão linear: coeficiente de determinação e seleção de variáveis',
76:'Matemática financeira: juros compostos e valor futuro',
77:'Matemática financeira: capital inicial e valor futuro',
78:'Sistema de amortização constante (SAC): juros e prestações',
79:'Sistema de amortização constante: valor da primeira prestação',
80:'Sistema de amortização constante: valor de prestação intermediária',
81:'Séries uniformes postecipadas: fatores de valor presente',
82:'Sistema Price: saldo devedor após pagamento de prestação',
83:'Sistema Price: cálculo da prestação uniforme',
84:'Sistema Price: saldo devedor após a décima prestação',
85:'Sistemas SAC e misto: comparação das amortizações',
86:'Mercado de capitais: mercado primário e secundário',
87:'Renda fixa: risco de mercado, crédito e liquidez',
88:'Securitização: agrupamento de ativos e emissão de títulos',
89:'Teoria de carteiras: covariância e risco',
90:'Gestão de riscos: valor em risco (VaR)',
91:'Teoria de carteiras: fronteira eficiente e retorno esperado',
92:'Risco de carteira: ponderação e diversificação',
93:'Modelo de fatores: risco sistemático e fatores macroeconômicos',
94:'CAPM: risco sistemático e retorno esperado',
95:'Avaliação fundamentalista: custo médio ponderado de capital',
96:'Gestão de riscos: hedge com derivativos',
97:'Teoria de carteiras: diversificação e risco total',
98:'Renda fixa: curva de rendimento e volatilidade',
99:'Economia comportamental: normas sociais e escolhas econômicas',
100:'Economia comportamental: viés do presente e pobreza',
101:'Teoria do prospecto: aversão à perda',
102:'Economia comportamental: efeito de ancoragem',
103:'Economia comportamental: heurísticas em contextos incertos',
104:'Economia comportamental: sistemas 1 e 2 de pensamento',
105:'Economia do desenvolvimento: microcrédito e redução da pobreza',
106:'Teoria do prospecto: preferências em situações de risco',
107:'Planejamento tributário: evasão fiscal e paraísos fiscais',
108:'Planejamento tributário: escolha do regime de tributação',
109:'Planejamento sucessório: holdings familiares e ITCMD',
110:'Direito sucessório: testamento e inventário',
111:'Previdência complementar fechada: gestão de riscos de investimento',
112:'Previdência complementar fechada: atribuições do administrador estatutário',
113:'Previdência complementar: segregação de recursos de planos de saúde',
114:'EFPC: operações entre planos e carteira administrada',
115:'EFPC: responsabilidades na aplicação de recursos garantidores',
116:'Governança de investimentos: mandatos, metas e contrato de gestão',
117:'Previdência complementar fechada: derivativos e hedge',
118:'Governança de investimentos: avaliação de prestadores e conflitos de interesse',
119:'Gestão de investimentos: seleção e monitoramento de prestadores',
120:'Decisões de investimento: rentabilidade passada e Guia PREVIC'
}
const matter=n=>n>=56&&n<=60?'Microeconomia':n>=61&&n<=65?'Macroeconomia':n>=66&&n<=70?'Estatística':n>=71&&n<=75?'Econometria':n>=76&&n<=85?'Matemática Financeira':n>=86&&n<=88?'Mercado de Capitais':n>=89&&n<=98?'Finanças e Investimentos':n>=99&&n<=106?'Economia Comportamental':n>=107&&n<=110?'Planejamento Tributário e Sucessório':'Previdência Complementar'
const contexts=[
[56,60,'Considerando os conceitos de microeconomia, julgue os itens.'],
[61,65,'No que se refere à macroeconomia, julgue os itens.'],
[66,70,'Texto-base: os valores 105, 115, 98, 102 e 110 são uma amostra aleatória de preços diários, em reais, de determinado título financeiro. Julgue os itens com base nessa amostra.'],
[71,75,'Texto-base: regressão linear estimada por mínimos quadrados ordinários, com intercepto e quatro regressoras (X₁, X₂, X₃ e X₄), para explicar Y. Coeficientes estimados e erros-padrão: intercepto 10,0 (3,00); X₁ 5,0 (0,05); X₂ −3,0 (0,03); X₃ 0,2 (0,20); X₄ 0,01 (0,001). Tamanho da amostra: 106; R²: 60%; erro quadrático médio: 36.'],
[76,77,'Texto-base: Pedro mantém uma aplicação que rende 18% ao ano, capitalizados mensalmente. A aplicação foi realizada há exatamente 30 meses, e o saldo atual é de R$ 10.000. Ignore os efeitos da inflação.'],
[78,80,'Texto-base: João tomou empréstimo de P reais, a ser pago em 40 prestações mensais, vencendo a primeira um mês após a contratação. A taxa mensal é de 1% e as prestações seguem o Sistema de Amortização Constante (SAC). Ignore a inflação.'],
[81,84,'Texto-base: dívida de D reais paga em 24 prestações mensais iguais, à taxa de 2% ao mês, vencendo a primeira prestação em um mês. Considere a_(n|i) como o valor presente de n pagamentos postecipados de R$ 1,00 à taxa i. Ignore a inflação.'],
[85,85,'Acerca das diferenças entre os sistemas de amortização constante (SAC) e misto (SAM), julgue o item.'],
[86,88,'Julgue os itens subsequentes sobre características de operações e instrumentos do mercado financeiro e de capitais.'],
[89,98,'Considerando a teoria das carteiras e os conceitos de risco em finanças, julgue os itens.'],
[99,102,'Considerando os conceitos relacionados à economia comportamental, julgue os itens.'],
[103,106,'Ainda no que se refere à economia comportamental, julgue os itens.'],
[107,108,'A respeito do planejamento tributário, julgue os itens.'],
[109,110,'A respeito do planejamento sucessório, julgue os itens.'],
[111,115,'Texto-base: diretrizes para aplicação dos recursos garantidores de planos administrados por entidade fechada de previdência complementar (EFPC), conforme a Resolução CMN nº 4.994/2022.'],
[116,120,'Texto-base: Guia PREVIC de melhores práticas em investimentos na previdência complementar fechada.']
]
const context=n=>contexts.find(([a,b])=>n>=a&&n<=b)?.[2]||''
const stems={
65:'No modelo de Solow, o crescimento econômico de longo prazo é explicado apenas pelo aumento dos fatores de produção, como capital e trabalho.',
70:'O intervalo interquartil é igual a 18.',
75:'O coeficiente de determinação deverá aumentar se a variável X₂ for retirada do modelo.',
76:'Daqui a 12 meses, o saldo da aplicação financeira de Pedro será de R$ 11.800.',
77:'Se, há 30 meses, Pedro tivesse aplicado o dobro do valor inicial, o saldo da aplicação hoje seria de R$ 20.000.',
78:'Os juros pagos por João decrescem em progressão aritmética a cada mês.',
79:'A primeira parcela a ser paga por João terá o valor de 0,025P reais.',
80:'A décima primeira parcela a ser paga por João terá o valor de 0,0325P reais.',
81:'a_(24|3%) < a_(24|2%) < a_(25|2%).',
82:'No momento do pagamento da décima prestação, o saldo devedor será amortizado em 0,98 × a_(15|2%) / a_(24|2%) reais.',
83:'O valor de cada prestação a ser paga é de D / a_(24|2%) reais.',
84:'O saldo devedor logo após o pagamento da décima prestação será de D × a_(14|2%) / a_(24|2%) reais.',
96:'Uma operação de hedge consiste na utilização de derivativos para a construção de uma operação estruturada com retorno garantido.',
110:'Testamentos são instrumentos que substituem completamente a necessidade de um processo judicial de inventário.'
}
const imageItems=new Set([71,72,73,74,75])
const remove=['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','materia_nao_identificada','conteudo_nao_identificado','classificacao_generica']
if(records.length!==57)throw Error('Esperados 57 registros; encontrados '+records.length)
const decisions=[]
for(const q of records){
 const n=Number(q.numero),ans=key[n],mat=matter(n),topic=topics[n]
 if(!ans||!mat||!topic)throw Error('Sem chave ou classificação: '+n+'/'+q.id)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:mat,conteudo:topic,ano:2025,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — 09/02/2025 — conhecimentos específicos — Cargo 5',cargo:'Analista de Previdência Complementar — Área 5: Gestão de Investimentos e Riscos de Investimentos — Cargo 5',numero_original:n,numero:n,pagina:Number(q.pagina),dificuldade:(n===56||n===58||n===61||n===64||n===65||n===74||n===75||n===82||n===84||n===88||n===90||n===92||n===94||n===95||n===96||n===98||n===100||n===101||n===104||n===105||n===108||n===109||n===110||n===114||n===118||n===120)?'Difícil':(n===57||n===60||n===62||n===66||n===68||n===69||n===71||n===77||n===79||n===83||n===86||n===87||n===89||n===91||n===93||n===97||n===99||n===103||n===106||n===111||n===112||n===113||n===116||n===117||n===119)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial de complexidade; a banca não publica nível de dificuldade por item.',classificacao_fonte:prova,motivo:'Conferência visual das páginas do caderno, identificação do Cargo 5 no edital oficial e cotejo com o gabarito definitivo correspondente ao código da prova.',enunciado:stems[n]||q.enunciado.trim(),texto_apoio:context(n),apta_resolucao:true,remover_pendencias:remove}
 if(imageItems.has(n))d.imagens_contexto=[{pagina:1,imagem:'paginas/'+doc+'-0001.webp',texto:'Tabela oficial de estimativas e erros-padrão da regressão, tamanho da amostra, R² e erro quadrático médio; dados necessários aos itens 71–75.'}]
 d.resposta_correta=ans==='C'?0:ans==='E'?1:null;d.anulada=ans==='X';d.gabarito_oficial={fonte:gabarito,arquivo:'Gab_Definitivo_040_FUNPRESPEXE_005_01.PDF',prova:'040_FUNPRESPEXE_005_01.PDF',sha256:keyHash,numero:n,pagina:1,resposta:ans,criterio:ans==='X'?'Item anulado conforme o gabarito definitivo do Cargo 5.':'Gabarito oficial definitivo CEBRASPE do Cargo 5, conferido para o código completo do caderno.'}
 decisions.push(d)
}
const preview={documento:doc,registros:records.length,questoesClassificadas:decisions.length,anuladas:decisions.filter(x=>x.anulada).map(x=>x.numero_original),imagensDeApoio:decisions.reduce((n,x)=>n+(x.imagens_contexto?.length||0),0),materias:[...new Set(decisions.map(x=>x.materia))],publicado:false}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify(preview,null,2));process.exit(0)}
const nome='revisao-cebraspe-funpresp-exe-2025-cargo5-investimentos-v358'
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift('tmp/revisao-profissional/'+nome+'/acervo-extraido')
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',"\nraizesAtuais.unshift('tmp/revisao-profissional/"+nome+"/acervo-extraido')\n")
const report={...result,...preview,edicao:concurso,dataAplicacao:'2025-02-09',figurasNecessarias:1,publicado:false,prova,gabarito,edital,nota:'57 registros pendentes foram conferidos nas páginas do caderno oficial. Restaurados os grupos de dados e contextos de microeconomia, estatística descritiva, regressão, matemática financeira, mercado de capitais, teoria de carteiras, economia comportamental, planejamento tributário e regras de previdência complementar. A tabela oficial de regressão foi anexada aos itens 71–75. O item 96 foi anulado no gabarito definitivo e permanece sem pontuação automática. Referências visuais da tabela original mantidas.'}
await fs.writeFile('docs/acervo/revisao-profissional/'+nome+'.json',JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',"\n\n## CEBRASPE/FUNPRESP-EXE 2025 — Analista de Previdência Complementar, Área 5 — revisão v358\n\n- Revisei "+records.length+" registros pendentes, atribuindo matéria e assunto específicos, ano da aplicação, concurso, cargo e dificuldade estimada.\n- Separei os conjuntos de dados da amostra de preços, da regressão e os contextos das séries de pagamentos, empréstimos, Resolução CMN nº 4.994/2022 e Guia PREVIC.\n- Anexei a tabela original de regressão aos itens 71–75 e mantive o registro de anulação do item 96 sem pontuação automática.\n- Conferi respostas no gabarito oficial definitivo do Cargo 5. Validação local: "+result.total+" questões, "+result.disponiveis+" elegíveis e "+result.pendentes+" pendências. Não publicado na nuvem.\n- Fontes: [caderno oficial]("+prova+"), [gabarito definitivo]("+gabarito+") e [edital oficial]("+edital+").\n")
console.log(JSON.stringify(report,null,2))

