import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc='fadb0e08acc3d2de',nome='revisao-petrobras-2021-enfase-2-pendencias-v275'
const prova='https://cdn.cebraspe.org.br/concursos/petrobras_21_ns/arquivos/658_PETROBRAS_002_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/petrobras_21_ns/arquivos/GAB_DEFINITIVO_658_PETROBRAS_002_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/PETROBRAS_21_NS/arquivos/ED_1_PETROBRAS_PSP1_2021_ABERTURA.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(raw.length!==79)throw Error(`Esperava 79 registros pendentes; encontrei ${raw.length}`)

const answers=`C C C E E C C C E E C E C C E E E C C E
C E C C X E E C C C E C E E X E C E E C
E C C E E E C E C X C E C E E E C C E C
C E E C E E C C E E`.trim().split(/\s+/)
if(answers.length!==70)throw Error(`Gabarito definitivo: ${answers.length}/70`)
const keyFor=n=>answers[n-51],keyHash=createHash('sha256').update(answers.join('|')).digest('hex')
const exam='PETROBRAS PSP RH 2021 — Ênfase 2: Análise de Comercialização e Logística — Comércio e Suprimento (aplicação em 20/2/2022)'

const contexts={
51:'Modelo econômico de Leontief: (I − C)x = dₑ, em que C = [[a,b],[c,d]] é a matriz de consumo, dₑ = [e,f]ᵀ é a demanda externa e x é o vetor de produção.',
52:'Modelo econômico de Leontief: (I − C)x = dₑ, C = [[a,b],[c,d]] e dₑ = [e,f]ᵀ; a matriz de consumo e o vetor de demanda externa têm entradas positivas.',
53:'Modelo econômico de Leontief: matriz de consumo C = [[a,b],[c,d]], vetor de demanda externa dₑ e matriz identidade I.',
54:'Em cada item, julgue a assertiva sobre probabilidade e estatística. Há 10 contêineres e serão escolhidos 3 sem reposição; os contêineres 2, 5 e 7 têm cargas irregulares.',
55:'Em cada item, julgue a assertiva sobre probabilidade e estatística. A fábrica A produz 75% do total e inspeciona 5%; a fábrica B produz 25% e inspeciona 10%.',
56:'Tabela de preços observados: nº de lojas por preço = 2, 3, 1, 2 e 2; preços correspondentes = R$ 195, R$ 210, R$ 220, R$ 235 e R$ 240.',
57:'Um conjunto tem 20 medições (x₁, x₂, …, x₂₀). Acrescenta-se x₂₁ sem alterar a média μ. σ² é a variância do conjunto inicial e σ²ₙ a do novo conjunto.',
58:'A função de produção é p = 3ℓ^(1/3)k^(2/3), em que ℓ e k são custos de pessoal e de equipamento. Para uma meta p₀, minimiza-se o custo total ℓ + k.',
59:'Preço p e demanda d satisfazem d² + 4dp + 25p² = 14.025. Avalia-se a variação de d quando p = R$ 20 e dp/dt = R$ 1 por mês.',
61:'A curva de Lorenz é f(x) = x^(3/2). O índice de Gini é G = 2∫₀¹[x − f(x)]dx.',
62:'Empréstimo de valor E pago em duas prestações mensais iguais P, com a primeira vencendo um mês após a liberação; 2P > E.',
66:'Considere as proposições p, q e r e os conectivos lógicos usuais.',
68:'A sentença condicional é: “Se o preço está elevado, então a compra não será realizada.”',
69:'Dois consumidores têm utilidades U_J(x,y)=5x+2y e U_P(x,y)=3x+2y. Os bens x e y custam, respectivamente, 200 e 50 unidades monetárias; cada consumidor tem renda 1.000.',
70:'Dois consumidores têm utilidades U_J(x,y)=5x+2y e U_P(x,y)=3x+2y. Os bens x e y custam, respectivamente, 200 e 50 unidades monetárias; cada consumidor tem renda 1.000.',
71:'Dois consumidores têm utilidades U_J(x,y)=5x+2y e U_P(x,y)=3x+2y. Os bens x e y custam, respectivamente, 200 e 50 unidades monetárias; cada consumidor tem renda 1.000.',
72:'Dois consumidores têm utilidades U_J(x,y)=5x+2y e U_P(x,y)=3x+2y. Os bens x e y custam, respectivamente, 200 e 50 unidades monetárias; cada consumidor tem renda 1.000.',
73:'Dois consumidores têm utilidades U_J(x,y)=5x+2y e U_P(x,y)=3x+2y. Os bens x e y custam, respectivamente, 200 e 50 unidades monetárias; cada consumidor tem renda 1.000.',
74:'Considere a teoria microeconômica clássica do consumidor e as propriedades dos bens de Giffen.',
75:'Considere a teoria microeconômica clássica do consumidor e as propriedades dos bens de Giffen.',
76:'Considere a teoria microeconômica clássica do consumidor e as propriedades dos bens de Giffen.',
77:'Oferta e demanda: Q = 2.100 − 100p (1) e Q = 1.800 + 200p (2), em que Q é quantidade e p é preço.',
78:'Oferta e demanda: Q = 2.100 − 100p (1) e Q = 1.800 + 200p (2), em que Q é quantidade e p é preço.',
86:'Considere a sequência lógica dos conceitos centrais de marketing no processo social e gerencial voltado à satisfação de indivíduos e grupos.',
87:'Considere o planejamento estratégico de marketing, a orientação ao cliente e a integração das áreas da organização.',
88:'Considere os critérios de segmentação de clientes e as variáveis demográficas e socioeconômicas.',
89:'Considere a evolução do marketing de relacionamento e a extensão do composto de marketing tradicional.',
90:'Considere os benefícios percebidos pelo cliente em relação aos custos de aquisição em uma transação.',
91:'Considere os estágios do processo de compra e venda entre empresas (B2B).',
92:'Sistema de informações de marketing (SIM): pessoas, equipamentos e procedimentos para coletar, classificar, analisar, avaliar e distribuir informações de mercado aos responsáveis por decisões.',
93:'Considere acordos internacionais e instrumentos de proteção de marcas e propriedade industrial.',
94:'Considere a lex mercatoria, seus usos e costumes no comércio internacional e a relação com os direitos nacionais.',
95:'Considere a incorporação de tratados de comércio internacional ao ordenamento brasileiro.',
96:'Considere as práticas internacionais de comércio, dumping, subsídios e medidas de defesa comercial.',
97:'Considere a identidade entre saldo em transações correntes, poupança externa e financiamento da economia.',
98:'Considere subsídios, práticas anticoncorrenciais e medidas de defesa comercial internacional.',
99:'Considere dumping e medidas antidumping para proteção da indústria doméstica.',
100:'Figura da estrutura molecular da hidroxicloroquina na página 3. Massas atômicas: H = 1,0 u; C = 12,0 u; N = 14,0 u; O = 16,0 u; Cl = 35,5 u.',
101:'Figura da estrutura molecular da hidroxicloroquina na página 3. Massas atômicas: H = 1,0 u; C = 12,0 u; N = 14,0 u; O = 16,0 u; Cl = 35,5 u.',
102:'Figura da estrutura molecular da hidroxicloroquina na página 3. Massas atômicas: H = 1,0 u; C = 12,0 u; N = 14,0 u; O = 16,0 u; Cl = 35,5 u.',
103:'Figura da estrutura molecular da hidroxicloroquina na página 3. Massas atômicas: H = 1,0 u; C = 12,0 u; N = 14,0 u; O = 16,0 u; Cl = 35,5 u.',
104:'Considere a nomenclatura de óxidos moleculares de cloro e os estados de oxidação do cloro.',
105:'Considere a nomenclatura tradicional de compostos inorgânicos e a correspondência entre terminações e número de oxidação.',
106:'Considere a classificação da matéria em substâncias puras e misturas e seus desdobramentos.',
107:'Considere as leis ponderais das reações químicas e suas formulações históricas.',
108:'Considere estequiometria de reação, reagente limitante e rendimento teórico.',
109:'Considere as leis ponderais: proporções definidas, proporções múltiplas e proporções recíprocas/equivalentes.',
110:'Figura da chaleira e da frigideira sobre a fonte de calor, com setas A, B e C indicando os processos de transferência térmica; ver imagem da página 3.',
111:'Considere os mecanismos de transferência de calor: condução, convecção e radiação.',
112:'Considere unidades do Sistema Internacional para calor e energia e a conversão entre joule e quilograma-força metro.',
113:'Considere a Segunda Lei da Termodinâmica e a variação da entropia em processos macroscópicos e microscópicos.',
114:'Para gás ideal monoatômico: s(N,V,E)=s₀+kB[3 ln(u)/2 + ln(v) + ln(N)], em que s=S/N, u=U/N e v=V/N. Avalia-se a propriedade extensiva da entropia.',
115:'Considere a equivalência entre trabalho e variação da energia mecânica e sua aplicação à termodinâmica.',
116:'Considere a Primeira Lei da Termodinâmica e a convenção de sinais para calor, trabalho e variação da energia interna.',
117:'Considere a matriz energética brasileira, o uso de gás natural e a produção nacional de hidrocarbonetos.',
118:'Considere a história do petróleo brasileiro, a Bacia de Campos e os choques de preço do petróleo da década de 1970.',
119:'Considere a composição da matriz energética brasileira e a participação de fontes renováveis e da energia hidráulica.',
120:'Considere os contratos de partilha e concessão, o pré-sal e a função de operador nas atividades de exploração e produção.'
}
const topics={
51:['Matemática','Álgebra Linear — autovalores, discriminante e matriz de Leontief','Difícil'],52:['Matemática','Álgebra Linear — inversão de matriz e modelo de insumo-produto de Leontief','Difícil'],53:['Matemática','Álgebra Linear — invertibilidade e soma de colunas de uma matriz','Média'],54:['Matemática','Probabilidade — análise combinatória e amostragem sem reposição','Média'],55:['Matemática','Probabilidade condicional — teorema de Bayes e controle de qualidade','Média'],56:['Estatística','Estatística descritiva — média aritmética ponderada em tabela de frequências','Média'],57:['Estatística','Estatística descritiva — variância após inclusão de nova observação','Difícil'],58:['Matemática','Cálculo diferencial — otimização de função de produção Cobb-Douglas','Difícil'],59:['Matemática','Cálculo diferencial — derivação implícita de função de demanda','Difícil'],60:['Matemática Financeira','Capitalização contínua — derivada do montante e juros compostos','Média'],61:['Estatística','Desigualdade de renda — curva de Lorenz, integral e índice de Gini','Difícil'],62:['Matemática Financeira','Taxa Interna de Retorno — fluxos de caixa e equação quadrática','Difícil'],63:['Matemática Financeira','Avaliação de investimentos — Valor Presente Líquido (VPL)','Média'],64:['Matemática Financeira','Juros compostos — determinação do prazo por logaritmos','Média'],65:['Economia','Inflação — relação entre taxas nominal, real e inflação','Média'],66:['Raciocínio Lógico','Lógica proposicional — equivalência da implicação e distributividade','Difícil'],67:['Raciocínio Lógico','Proposições — sentenças declarativas e imperativas','Fácil'],68:['Raciocínio Lógico','Lógica proposicional — negação de condicional','Média'],69:['Economia','Microeconomia — preferências, utilidade linear e substitutos perfeitos','Média'],70:['Economia','Microeconomia — curvas de indiferença e preferências do consumidor','Média'],71:['Economia','Microeconomia — escolha ótima do consumidor e restrição orçamentária','Média'],72:['Economia','Microeconomia — taxa marginal de substituição','Média'],73:['Economia','Microeconomia — maximização de utilidade e cesta ótima','Média'],74:['Economia','Microeconomia — elasticidade-preço e bens de Giffen','Média'],75:['Economia','Microeconomia — efeito renda, efeito substituição e bens de Giffen','Média'],76:['Economia','Microeconomia — bens inferiores e bens de Giffen','Média'],77:['Economia','Microeconomia — oferta, demanda e equilíbrio de mercado','Fácil'],78:['Economia','Microeconomia — equilíbrio entre oferta e demanda','Média'],79:['Logística','Logística empresarial — logística de manufatura e distribuição de biocombustíveis','Média'],80:['Logística','Logística reversa — retorno de óleo lubrificante usado','Fácil'],81:['Logística','Gestão de estoques — lote econômico de fabricação e lote econômico de compra','Média'],82:['Logística','Logística empresarial — processamento de pedidos e atividades primárias','Fácil'],83:['Logística','Transportes — modal dutoviário, investimento e flexibilidade operacional','Média'],84:['Administração da Produção','Produção enxuta — Poka Yoke, Just in Time e sistema Kanban','Média'],85:['Logística','Gestão de estoques — custo de posse, armazenagem e custo de capital','Fácil'],86:['Marketing','Marketing — necessidades, desejos, demanda e mercado','Média'],87:['Marketing','Marketing estratégico — orientação ao cliente e integração organizacional','Média'],88:['Marketing','Pesquisa de mercado — segmentação demográfica e socioeconômica','Fácil'],89:['Marketing','Marketing de relacionamento — composto de marketing ampliado','Média'],90:['Marketing','Marketing — valor percebido e pacote de valor para o cliente','Média'],91:['Marketing','Marketing B2B — processo de compra organizacional e processamento de pedidos','Média'],92:['Marketing','Sistema de Informação de Marketing — coleta, análise e distribuição de dados','Média'],93:['Comércio Exterior','Propriedade Intelectual — proteção internacional de marcas','Média'],94:['Comércio Exterior','Direito do Comércio Internacional — lex mercatoria','Média'],95:['Comércio Exterior','Direito do Comércio Internacional — internalização de tratados','Média'],96:['Economia','Comércio Exterior — dumping e defesa comercial','Média'],97:['Economia','Macroeconomia — balanço de pagamentos e poupança externa','Média'],98:['Comércio Exterior','Comércio Internacional — subsídios e medidas compensatórias','Média'],99:['Comércio Exterior','Comércio Internacional — antidumping e proteção da indústria doméstica','Média'],100:['Química','Química Orgânica — massa molar e composição molecular','Média'],101:['Química','Química Orgânica — funções orgânicas e grupos funcionais','Média'],102:['Química','Química Orgânica — nomenclatura IUPAC de aminas e derivados heterocíclicos','Difícil'],103:['Química','Química Orgânica — massa molecular e fórmula estrutural','Média'],104:['Química','Química Inorgânica — nomenclatura e estados de oxidação dos óxidos','Média'],105:['Química','Química Inorgânica — nomenclatura tradicional e número de oxidação','Fácil'],106:['Química','Química Geral — substâncias puras, misturas e classificação da matéria','Fácil'],107:['Química','Química Geral — leis ponderais e lei das proporções definidas','Média'],108:['Química','Estequiometria — reagente limitante e rendimento teórico','Média'],109:['Química','Estequiometria — leis das proporções nas reações químicas','Média'],110:['Física','Termologia — condução, convecção e radiação (figura preservada)','Média'],111:['Física','Termologia — radiação térmica e propagação no vácuo','Fácil'],112:['Física','Termologia — calor, energia e unidades do SI','Média'],113:['Física','Termodinâmica — Segunda Lei e entropia','Média'],114:['Física','Termodinâmica estatística — entropia específica e propriedade extensiva','Difícil'],115:['Física','Termodinâmica — trabalho e conservação da energia','Média'],116:['Física','Termodinâmica — Primeira Lei e convenção de sinais','Média'],117:['Conhecimentos do Setor Petróleo e Gás','Matriz energética e produção de gás natural no Brasil','Média'],118:['Conhecimentos do Setor Petróleo e Gás','História do petróleo brasileiro — Bacia de Campos e crises do petróleo','Média'],119:['Conhecimentos do Setor Petróleo e Gás','Matriz energética brasileira — fontes renováveis e hidroeletricidade','Fácil'],120:['Conhecimentos do Setor Petróleo e Gás','Exploração e produção — pré-sal e regime de operadores','Média']
}
const stems={
51:'Os autovalores da matriz I − C serão reais e distintos se (a + d)² > 4(ad − bc).',
52:'A quantidade x a ser produzida para atender à demanda externa dₑ é x = 1/D · [(1 − d)e + bf; ce + (1 − a)f]ᵀ, em que D = (1 − a)(1 − d) − bc ≠ 0.',
53:'Se a soma das entradas de cada uma das colunas de C for menor que 1, então a matriz I − C será inversível.',
54:'De 10 contêineres, numerados de 1 a 10, deseja-se inspecionar ao acaso três deles. Sabendo que existem cargas irregulares nos contêineres 2, 5 e 7 e que a probabilidade de escolher qualquer trio de contêineres é a mesma, a probabilidade de a equipe escolher os contêineres problemáticos é superior a 1%.',
55:'Uma empresa produz um único produto em duas fábricas A e B, responsáveis por 75% e 25% da produção total. Na fábrica A, 5% da produção passa pelo controle de qualidade; na fábrica B, 10%. Escolhendo ao acaso um produto dentre os aprovados pelo controle, a probabilidade de ele ter sido produzido na fábrica B é inferior a 30%.',
56:'Os preços de um produto em 10 lojas são os da tabela de frequências apresentada no conteúdo complementar. A média aritmética dos preços encontrados foi de R$ 219,00.',
57:'Ao adicionar a medição x₂₁ ao conjunto inicial (x₁, x₂, …, x₂₀), a média μ do novo conjunto não se altera. Nesse caso, a variância σ²ₙ do novo conjunto relaciona-se à variância σ² inicial por σ²ₙ = (20/21)σ².',
58:'A produção mensal de uma fábrica é p = 3ℓ^(1/3)k^(2/3), em que ℓ e k são os custos de pessoal e equipamento. Para produzir p₀ por mês, os valores de ℓ e k que minimizam o custo total ℓ + k são ℓ = (p₀/3)^(1/3) e k = p₀^(2/3).',
59:'O preço p e a demanda d de um produto relacionam-se por d² + 4dp + 25p² = 14.025. Se o preço aumenta R$ 1,00 por mês quando vale R$ 20,00, a taxa de variação mensal da demanda é positiva.',
60:'Um investimento de R$ 1.000,00 rende juros a uma taxa anualizada de 10%, com capitalização contínua. Quando o saldo for de R$ 3.500,00, sua taxa de variação instantânea será de R$ 175,00 por ano.',
61:'A curva de Lorenz é f(x) = x^(3/2), e o índice de Gini é G = 2∫₀¹[x − f(x)]dx. Para esse modelo, G = 0,2.',
62:'A taxa interna de retorno i de um empréstimo E liquidado em duas prestações mensais iguais P, com a primeira vencendo um mês após a liberação e 2P > E, é i = 100·[(P + √(P² + 4EP))/(2E) − 1]% ao mês.',
63:'O método do valor presente líquido pode verificar se um investimento será rentável; o investimento será rentável se o VPL for positivo.',
64:'Um capital inicial Q aplicado à taxa composta mensal i triplicará seu montante em log_(1+i)(3) meses.',
65:'Se a taxa real r a.a. de um investimento for metade da taxa nominal n a.a., então a inflação i a.a. será i = n/(2 + n).',
66:'Dadas as proposições p, q e r, (p ∨ q) → r é equivalente a (p → r) ∨ (q → r).',
67:'A frase “Saia daqui!” é uma proposição simples.',
68:'A negação de “Se o preço está elevado, então a compra não será realizada” é “O preço está elevado e a compra será realizada”.',
69:'João e Pedro possuem funções utilidade U_J(x,y)=5x+2y e U_P(x,y)=3x+2y. Os preços de x e y são 200 e 50, respectivamente, e a renda de cada consumidor é 1.000. João e Pedro possuem funções utilidade em que os bens x e y são substitutos perfeitos.',
70:'João e Pedro possuem as mesmas preferências.',
71:'João gastará toda a renda no consumo do bem y e, portanto, não consumirá o bem x.',
72:'A taxa marginal de substituição dos bens x e y de Pedro é igual a 1.',
73:'O nível de satisfação máximo de João será de 40 unidades.',
74:'A elasticidade-preço do bem de Giffen é sempre positiva.',
75:'Se a queda do preço acarreta redução da quantidade demandada do bem, esse precisa ser um bem de Giffen.',
76:'Todo bem inferior é um bem de Giffen.',
77:'A equação (1), Q = 2.100 − 100p, descreve a curva de oferta.',
78:'No equilíbrio entre Q = 2.100 − 100p e Q = 1.800 + 200p, o preço será 1 e a quantidade será 2.000.',
79:'Após a finalização da produção de um biocombustível, seguem-se atividades de logística de manufatura que abrangem o deslocamento do produto até os locais de deposição final, onde permanecerá até o envio aos clientes.',
80:'O retorno do óleo lubrificante usado aos centros produtivos para tratamento e neutralização do impacto ambiental caracteriza logística reversa ou logística verde.',
81:'O lote econômico de fabricação difere do lote econômico de compra porque o primeiro incorpora variáveis como o custo do pedido, ao passo que o segundo não.',
82:'O processamento de pedidos integra as atividades primárias da logística empresarial.',
83:'Apesar da baixa flexibilidade operacional, o modal dutoviário é vantajoso porque suas instalações não requerem altos investimentos.',
84:'Poka Yoke é uma ferramenta da filosofia Just in Time que consiste no controle das atividades de produção, estoques e transportes por meio de cartões.',
85:'O custo de posse do estoque é formado pelo custo de armazenagem e pelo custo de capital.',
86:'Na sequência lógica dos conceitos centrais de marketing para concretizar o processo social e gerencial de satisfação de indivíduos e grupos, a penúltima etapa corresponde a “necessidades, desejos e demandas”, e a última, a “mercados”.',
87:'O planejamento estratégico de marketing, orientado pelo conceito “o cliente é o rei”, favorece o sucesso empresarial quando esse conceito é aceito pelos colaboradores do departamento de marketing e dos demais departamentos.',
88:'Na segmentação de clientes, o estado civil constitui característica classificada como socioeconômica.',
89:'O marketing de relacionamento consolidou-se com a expansão dos 4 Ps originais — preço, praça, produto e promoção — para mais quatro Ps: proteção, pessoas, pós-vendas e posicionamento.',
90:'Os benefícios que excedem o custo dos produtos adquiridos em uma transação são considerados pacotes de valor para o cliente.',
91:'O fechamento de um negócio B2B coincide com o estágio de processamento do pedido.',
92:'Um sistema de informações de marketing estruturado usa pessoas, equipamentos e procedimentos para coletar, classificar, analisar, avaliar e distribuir informações de mercado de maneira precisa e oportuna aos tomadores de decisão.',
93:'Inseridos em acordos e tratados internacionais dos quais o Brasil é signatário, instrumentos internacionais de proteção a marcas ajudam as empresas a proteger investimentos e fidelizar consumidores.',
94:'Lex mercatoria são normas internacionais criadas por práticas e costumes, desvinculadas do direito dos Estados, mas reconhecidas pelos atores do comércio internacional.',
95:'Tratados de comércio são internalizados nas regras brasileiras por despachos do Ministério das Relações Exteriores.',
96:'Dumping ocorre quando a exportação de um produto acontece a preço inferior ao praticado em seu mercado doméstico.',
97:'Sempre que um país possui déficit em transações correntes, sua poupança externa é negativa.',
98:'Mesmo identificados subsídio e prática anticoncorrencial, não há obrigatoriedade de eliminá-los.',
99:'Sempre que constatado dumping, a indústria nacional possui direito de compensação a ser exercido no exercício fiscal da constatação.',
100:'A massa molar da hidroxicloroquina vale 335,5 g/mol.',
101:'As funções orgânicas presentes na hidroxicloroquina são álcool, amina e haleto de arila.',
102:'O nome oficial (IUPAC) da hidroxicloroquina é 2-[4-[(7-cloroquinolin-4-il)amino]pentil-etilamino]etanol.',
103:'A massa molecular da hidroxicloroquina vale 362,5 u.',
104:'Os nomes correspondem corretamente às fórmulas: Cl₂O₇ = óxido perclórico; Cl₂O₅ = óxido clórico; Cl₂O₃ = óxido cloroso; Cl₂O = óxido hipocloroso.',
105:'Na nomenclatura inorgânica, a terminação “ico” indica número de oxidação menor, e a terminação “oso” designa número de oxidação maior.',
106:'A matéria divide-se em substâncias puras, que podem ser homogêneas ou heterogêneas, e misturas, que se subdividem em elementos ou compostos.',
107:'O químico francês Joseph Proust elaborou a lei da conservação das massas.',
108:'Em uma reação química, o reagente limitante serve de base para o cálculo do rendimento teórico.',
109:'As bases fundamentais da estequiometria são as leis das proporções definidas, múltiplas e equivalentes.',
110:'Na figura, as letras A, B e C indicam, respectivamente, condução, convecção e radiação.',
111:'Entre os mecanismos de transmissão de calor, o único que pode ocorrer no espaço vazio é a radiação, constituída por ondas eletromagnéticas que se propagam à velocidade da luz.',
112:'No SI, a unidade de calor é o joule (J), sendo 1 J equivalente a 1 kgf·m.',
113:'Conforme a Segunda Lei da Termodinâmica, em fenômenos macroscópicos ou microscópicos, a entropia sempre aumenta ou permanece igual.',
114:'Para gás ideal monoatômico, s(N,V,E)=s₀+kB[3 ln(u)/2 + ln(v) + ln(N)], em que s=S/N, u=U/N e v=V/N. Essa expressão seria inadequada porque a entropia assim escrita não obedece à propriedade de ser extensiva.',
115:'O teorema da equivalência do trabalho com a energia mecânica é importante em mecânica, mas não tem relevância na termodinâmica.',
116:'Segundo a Primeira Lei da Termodinâmica, referente à conservação da energia, Δu = t, em que Δu é a variação da energia e t é o trabalho realizado.',
117:'O gás natural é fonte energética mais limpa que derivados do petróleo e tem como maior produtor nacional o estado do Rio de Janeiro.',
118:'A demanda por petróleo aumentou na década de 1970, mas a descoberta de petróleo na Bacia de Campos/RJ ocorreu somente após o primeiro choque do petróleo.',
119:'A matriz energética brasileira, cuja força motriz de destaque é a energia hidráulica, pauta-se em fontes mais renováveis.',
120:'Embora alguns campos do pré-sal tenham sido leiloados, a Petrobras ainda é a operadora única responsável pela condução e execução das atividades de exploração.'
}
const duplicates={
 'extr-49b00888f8511794a80e':'extr-b846e24ee353e20496f3','extr-aa981b1bb4a7324f0a7f':'extr-7a70de4269d49bf942ce','extr-40252c92c00227179f1e':'extr-ec95ae2bd3b7280dd19d','extr-d2a1b455c725163e93ae':'extr-814662b79d3ad4998ad7','extr-844bb651a6aec731358a':'extr-c63588d4b1b889dfcc3a','extr-4e5aab9b745a5114840c':'extr-509c0c80aad88c2d6012','extr-a31884973bd7713b6f21':'extr-82a72bad9a904e160906','extr-47994c2b9249818574f1':'extr-ab5f35740efca8171c80','extr-0d1e4bb34ad0305c1e1d':'extr-802dd595180a37ad7848'
}
const decisions=raw.map(q=>{
 const n=Number(q.numero),meta=topics[n],stem=stems[n],key=keyFor(n),page=Number(q.pagina),duplicate=duplicates[q.id]
 if(!meta||!stem)throw Error(`Classificação/texto ausente no item ${n}`)
 if(!['C','E','X'].includes(key))throw Error(`Gabarito ausente no item ${n}`)
 const anulada=key==='X',pageImage=q.contexto?.find(x=>Number(x.pagina)===page)?.imagem||q.imagem
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:meta[0],conteudo:meta[1],ano:2022,concurso:exam,cargo:'Ênfase 2 — Análise de Comercialização e Logística — Comércio e Suprimento',numero_original:n,pagina:page,dificuldade:meta[2],dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pela complexidade matemática/científica, quantidade de conceitos e etapas de raciocínio; não publicada pela banca.',
  classificacao_fonte:edital,motivo:`Matéria e tópico identificados pelo caderno oficial e pelos cabeçalhos de bloco/seção do item ${n}; edital confirma o programa da Ênfase 2.`,
  enunciado:stem,texto_apoio:contexts[n]||q.apoio||null,opcoes:['Certo','Errado'],resposta_correta:anulada||duplicate?null:key==='C'?0:1,anulada:anulada||Boolean(duplicate),
  ...(duplicate?{apta_resolucao:false,inelegibilidade_motivo:'Duplicata da mesma questão decorrente de duas passagens de OCR do mesmo PDF; preservada para rastreabilidade, excluída da resolução.',duplicada_de:duplicate}:{apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']}),
  ...(!duplicate?{gabarito_oficial:{fonte:gabarito,sha256:keyHash,sha256_tipo:'sha256_da_transcricao_dos_70_itens_do_gabarito_definitivo; nao_e_hash_do_pdf',arquivo:'GAB_DEFINITIVO_658_PETROBRAS_002_01.PDF',numero:n,pagina:1,resposta:key,criterio:anulada?'Item anulado no gabarito definitivo oficial.':'Resposta cotejada com o gabarito oficial definitivo da Ênfase 2.'}}:{}),
  visual:{pagina:page,imagem:pageImage||`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,motivo:`Página ${page} do caderno oficial, com tabela/fórmula/figura original preservada quando existente.`}}
})
if(decisions.length!==79||new Set(decisions.map(x=>x.id)).size!==79)throw Error('Contagem ou unicidade inconsistentes')
if(Object.keys(duplicates).length!==9||decisions.filter(x=>x.anulada&&!x.duplicada_de).map(x=>x.numero_original).sort((a,b)=>a-b).join(',')!=='75,85,100')throw Error('Duplicatas ou itens anulados divergentes')
const base='tmp/revisao-profissional/revisao-stj-2018-analista-administrativo-pendencias-v274/acervo-extraido'
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## PETROBRAS 2021 — Ênfase 2, Comércio e Suprimento — v275\n\n- Revisei os 79 registros ainda pendentes dos itens 51–120, classificando-os em matemática, estatística, matemática financeira, economia, lógica, logística, administração da produção, marketing, comércio exterior, química, física e setor de petróleo e gás.\n- Recompus enunciados e fórmulas a partir do caderno oficial; recoloquei em texto complementar as matrizes, a tabela de frequências, funções, figuras e contextos comuns necessários à resolução. Preservei as imagens originais das páginas.\n- Vinculei o gabarito definitivo. Os itens 75, 85 e 100 estão anulados. Identifiquei 9 registros duplicados de OCR e retirei essas cópias da fila de resolução, mantendo os registros para auditoria.\n- Dificuldades são estimativas editoriais. Alteração local, ainda não publicada na nuvem.\n- Fontes oficiais: [caderno da Ênfase 2](<${prova}>), [gabarito definitivo](<${gabarito}>), [edital e conteúdo programático](<${edital}>).\n`)
console.log(JSON.stringify({...report,documento:doc,revisadas:79,duplicatas:9,anuladas:3,publicacao:'local'},null,2))
