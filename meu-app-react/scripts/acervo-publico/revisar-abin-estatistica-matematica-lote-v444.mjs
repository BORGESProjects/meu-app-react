import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-abin-matematica-estatistica-2018-lote-v444'
const doc='864f030d414370c4'
const prova='https://cdn.cebraspe.org.br/concursos/abin_17/arquivos/378_ABIN_011_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/abin_17/arquivos/GAB_DEFINITIVO_378_ABIN_011_01.PDF'
const concurso='ABIN — Concurso público 2017/2018'
const cargo='Cargo 2: Oficial Técnico de Inteligência — Área 7'
const aplicacao='Prova objetiva aplicada em 11 de março de 2018'

const respostas=[
 'C C E C C C E C E E',
 'C E E C C C E E C C',
 'E E C C C E C E C E',
 'E C E C E E C E C C',
 'E C C E C E E C C C',
 'E C E E C E C C C E',
 'C E C E E C E E E C',
 'E E E C E E C E E E',
 'C C E E C E E C C C'
].flatMap(x=>x.split(' '))
if(respostas.length!==90)throw Error(`Gabarito oficial deve conter 90 itens de 61 a 150; contém ${respostas.length}`)
const gabaritoPorNumero=new Map(respostas.map((valor,i)=>[61+i,valor]))
const hashGabarito=hashRevisao(respostas.map((x,i)=>`${61+i}:${x}`).join('\n'))

const areas=new Map()
const add=(nums,materia,conteudo,dificuldade='Média')=>{for(const n of nums)areas.set(n,{materia,conteudo,dificuldade})}
add([61,62,63],'Cálculo','Funções polinomiais: concavidade, extremos locais e extremos absolutos')
add([64,65,66,67],'Álgebra Linear','Transformações lineares: imagem, núcleo, composição, bijetividade e matrizes')
add([68,69,70],'Números Complexos','Transformações complexas, circunferências, raízes e representação geométrica')
add([71,72,73],'Equações Diferenciais','Equação logística, equação diferencial ordinária e modelagem de vacinação','Difícil')
add([74],'Cálculo Numérico','Integração numérica: regra de Simpson composta por uma parábola')
add([76,77,78],'Álgebra Abstrata','Anéis, corpos, inteiros módulo n e divisores de zero')
add([79,80,81,82,83],'Pesquisa Operacional','Programação linear, restrições de recursos e otimização de resultados','Difícil')
add([84,85,86],'Geometria Analítica','Triângulos: ângulos, baricentro e distância entre pontos')
add([87,88,90,91],'Cálculo Vetorial','Curvas parametrizadas no espaço: distância, planaridade, regularidade e comprimento de arco','Difícil')
add([92,93,94,95,96],'Matemática Discreta','Relações binárias, simetria, transitividade, conjuntos e contagem','Difícil')
add([97,98,99,100,101],'Probabilidade','Variáveis aleatórias discretas, distribuição geométrica, esperança e variância','Difícil')
add([102,103,104,105],'Estatística','Estimação, máxima verossimilhança, distribuição amostral e variância','Difícil')
add([106,107,108,109],'Estatística','Amostragem por conglomerados, estimador de razão, variância e estimação de totais','Difícil')
add([110,111,112],'Probabilidade','Simulação de Monte Carlo e geração de distribuições t, normal e qui-quadrado','Difícil')
add([113,114],'Estatística','Testes não paramétricos: Birnbaum-Hall e postos sinalizados de Wilcoxon','Difícil')
add([115,116,117],'Estatística','Regressão linear simples: mínimos quadrados, coeficiente de determinação e predição','Difícil')
add([118,119],'Estatística','Análise multivariada: componentes principais e combinação de variáveis normais')
add([120,121,122],'Estatística','Controle de qualidade: distribuição normal, média, desvio padrão e valores fora de especificação','Difícil')
add([123,124,125],'Estatística','Associação entre variáveis categóricas: contingência, independência e tabelas cruzadas')
add([126,127],'Séries Temporais','Modelos autorregressivos, tendência e passeio aleatório')
add([128,129,130],'Estatística','Análise de sobrevivência: função de sobrevivência e risco acumulado','Difícil')
add([131,132],'Teoria da Informação','Entropia de Shannon e divergência de Kullback-Leibler')
add([134,135,137,139,143,144,145,146,147,148,149,150],'Criptografia e Segurança da Informação','Criptografia simétrica e assimétrica, AES, RSA, Diffie-Hellman, 3DES, CBC e fontes de entropia')
add([140,141,142],'Segurança da Informação','Funções hash, SHA-512, integridade de dados e assinatura digital')

const correcoes={
61:'Considere f(x) = x³ − 3x² + 10, com domínio −2 ≤ x ≤ 3. A função f muda a concavidade de negativa (para baixo) para positiva (para cima) em x = 1.',
62:'Para f(x) = x³ − 3x² + 10, com domínio −2 ≤ x ≤ 3, x = 0 é um ponto de máximo local que também é de máximo absoluto.',
63:'Para f(x) = x³ − 3x² + 10, com domínio −2 ≤ x ≤ 3, x = 2 é um ponto de mínimo local que também é de mínimo global.',
64:'Considere P: R³ → R², P(x,y,z) = (x,y), e T: R² → R³, T(x,y) = (x,y,x+y). A imagem da transformação T é um subespaço vetorial de R³ com dimensão 2.',
65:'Considere P: R³ → R², P(x,y,z) = (x,y), e T: R² → R³, T(x,y) = (x,y,x+y). O núcleo da transformação composta T ∘ P é gerado pelo vetor e₃ = (0,0,1); isto é, v=(x,y,z) pertence ao núcleo de T ∘ P se, e somente se, x=y=0.',
66:'Considere P: R³ → R², P(x,y,z) = (x,y), e T: R² → R³, T(x,y) = (x,y,x+y). A transformação composta P ∘ T é uma bijeção de R² em R².',
67:'Considere P: R³ → R², P(x,y,z) = (x,y), e T: R² → R³, T(x,y) = (x,y,x+y). As matrizes P·T e T·P são, ambas, quadradas e inversíveis.',
68:'A função complexa φ(z)=1/z, para z ≠ 0, transforma os pontos da circunferência |z − i| = 1 (z ≠ 0) em pontos de uma reta perpendicular ao eixo imaginário.',
69:'Para algum número real α não nulo, na representação geométrica das soluções complexas z₁, z₂ e z₃ da equação z³=α, z₁, z₂ e z₃ podem ser vértices de um triângulo retângulo.',
70:'No plano complexo, os números z que satisfazem |z| = |z+1| estão sobre uma circunferência de centro na origem e raio 1/2.',
71:'Um modelo de vacinação é descrito pela equação diferencial P′(t)=0,24e^(−t)P(t)², com P(0)=4, em que P(t) representa a porcentagem vacinada. De acordo com o modelo, não será possível vacinar toda a população.',
72:'A equação diferencial P′(t)=0,24e^(−t)P(t)², usada no modelo de vacinação, é ordinária, linear e de primeira ordem.',
73:'No modelo P′(t)=0,24e^(−t)P(t)², com P(0)=4, para que 20% da população seja vacinada serão necessários mais de 3 dias.',
74:'A integral de f(x)=sen(2x) no intervalo [0, π/2], aproximada pela regra de Simpson usando-se um único arco de parábola pelos pontos x=0, x=π/4 e x=π/2, é igual a π/3.',
76:'No anel Z₇, o inverso multiplicativo de 5 é 3.',
77:'O anel M₂ das matrizes quadradas 2 × 2, com as operações usuais, é um domínio de integridade.',
78:'O anel Zₙ, em que n=p² e p é primo, é um corpo.',
79:'Uma agência tem 30 oficiais, 70 agentes e 40 analistas. Cada relatório usa 3 oficiais, 8 agentes e 1 analista e gera R$ 5.000; cada acompanhamento usa 2 oficiais, 2 agentes e 4 analistas e gera R$ 3.000. O maior resultado financeiro ocorre com 8 relatórios e 3 acompanhamentos.',
80:'Com os recursos disponíveis para a agência descrita, para obter o maior resultado financeiro possível não será necessário empregar toda a força de trabalho.',
81:'Na situação da agência, se x e y representam, respectivamente, relatórios e acompanhamentos, a função objetivo (em milhares de reais) é f(x,y)=3x+5y.',
82:'Na situação da agência, a solução ótima está no interior da região viável determinada pelas restrições de recursos.',
83:'Na situação da agência, o maior resultado financeiro possível é inferior a R$ 50.000.',
84:'Considere A=(2,3), B=(7,2) e C=(5,6). Usando √52 ≈ 7,2, o ângulo correspondente ao vértice A do triângulo ABC é menor que 60°.',
85:'Se P minimiza a soma dos quadrados das distâncias aos pontos A=(2,3), B=(7,2) e C=(5,6), então P é o baricentro do triângulo ABC.',
86:'O ponto P que minimiza a soma dos quadrados das distâncias a A=(2,3), B=(7,2) e C=(5,6) é equidistante de A, B e C.',
87:'Para a curva c(t) definida no caderno oficial, o microdrone permanece sempre a um metro da origem do sistema cartesiano.',
88:'O traço da curva parametrizada c(t), definida no caderno oficial, está contido em um plano de R³.',
90:'A curva c(t), definida no caderno oficial, está parametrizada pelo comprimento de arco.',
91:'Na trajetória c(t), definida no caderno oficial, a velocidade escalar do microdrone é constante.',
92:'Dez suspeitos formam o conjunto S. Se R relaciona os pares de suspeitos que praticaram delito em mútuo acordo, existem pelo menos dois suspeitos com igual número de parceiros em S.',
93:'Entre dez suspeitos, a quantidade de acareações possíveis é inferior a 1.000.',
94:'Se (x,y) pertence à relação R de suspeitos que praticaram delito em mútuo acordo, então (y,x) também pertence a R; logo, R é simétrica.',
95:'Se (x,y) e (y,z) pertencem à relação R de suspeitos que praticaram delito em mútuo acordo, então (x,z) pertence a R; logo, R é transitiva.',
96:'Para cada i entre 0 e 9, o conjunto Tᵢ dos suspeitos que praticaram delito em mútuo acordo com exatamente i outros suspeitos é não vazio.',
97:'Para todo q ∈ {0,1,2,…}, vale P(Y>q)=P(Y=q), para a distribuição geométrica de Y definida no caderno oficial.',
98:'Na distribuição condicional X|Y=y definida no caderno oficial, a esperança E(X|Y=y) cresce à medida que y aumenta.',
99:'Para as variáveis X e Y de notificações de incidentes, definidas no caderno oficial, P(X=0)>0,6.',
100:'Para as variáveis X e Y de notificações de incidentes, definidas no caderno oficial, P(X=0,Y=1)<0,5.',
101:'Se T=X+Y representa o total diário de notificações nas duas redes, então Var(T) ≥ Var(X)+Var(Y).',
102:'Para a variável W de contagem diária definida no caderno oficial, a expressão estimadora apresentada para σ² é não viesada.',
103:'A média amostral W̄ é o estimador de máxima verossimilhança da média populacional μ.',
104:'Para W com distribuição de probabilidade definida no caderno oficial, a soma nW̄ tem a distribuição indicada no item para valores s=0,1,2,… e 0<θ<1.',
105:'A variável padronizada definida no caderno oficial, construída a partir de W̄, tem média zero e variância unitária.',
106:'Selecionar ao acaso 5 dos 50 grupos e entrevistar todas as pessoas desses grupos caracteriza amostragem estratificada, em que os grupos são estratos.',
107:'Com os dados dos cinco grupos e o estimador de razão indicado no caderno, a estimativa do gasto médio mensal per capita em segurança da informação é R$ 220.',
108:'Com os dados amostrais dos cinco grupos, a estimativa do desvio padrão de ȳ é inferior a R$ 100.',
109:'Com os dados dos cinco grupos, estima-se que o gasto total mensal da população com segurança da informação seja R$ 200 mil.',
110:'Na simulação de Monte Carlo descrita no caderno, a transformação de variáveis uniformes U e V permite gerar uma variável com distribuição t de Student com n graus de liberdade.',
111:'As transformações de Box–Muller X=√(−2 ln V)cos(2πU) e Y=√(−2 ln V)sen(2πU), para U e V uniformes independentes em (0,1), produzem X e Y dependentes.',
112:'Uma variável qui-quadrado com dois graus de liberdade pode ser obtida a partir da transformação −2 ln U, com U uniforme em (0,1).',
113:'Para comparar as distribuições dos tempos de duração de três marcas de baterias, o teste de Birnbaum–Hall indicado no item é apropriado.',
114:'O teste de postos sinalizados de Wilcoxon é apropriado para comparar as três marcas de baterias, pois todas as amostras têm tamanho 12.',
115:'Na regressão linear descrita no caderno, se a soma dos quadrados dos resíduos for 960, o coeficiente de determinação será R²=0,8.',
117:'Na regressão linear descrita no caderno, para X=10 a estimativa de Y é 12.',
118:'Na análise de componentes principais, o primeiro componente principal corresponde ao autovetor associado ao maior autovalor da matriz de variâncias e covariâncias.',
119:'Se X e Y forem independentes e normalmente distribuídas, então X+Y terá média μX+μY e variância σX²+σY².',
120:'Se o maior parafuso observado mede 3,75 cm, a probabilidade de um parafuso escolhido ao acaso ter comprimento superior a 3,75 cm é maior que 1%.',
121:'Com base nos dados do controle de qualidade, pode-se rejeitar, ao nível de significância de 5%, a afirmação do chefe de que o comprimento médio dos parafusos é 3 cm.',
122:'A probabilidade de um parafuso escolhido ao acaso ter comprimento fora das especificações de 2,4 cm a 3,6 cm é inferior a 2,5%.',
123:'A associação entre as variáveis data e tipo de sítio, medida pelo coeficiente de contingência de Pearson, é inferior a 0,20.',
124:'Menos de 50% das fraudes em sítios de jogos on-line ocorrem em fins de semana e feriados.',
125:'Se data e tipo de sítio fossem independentes, a quantidade esperada de fraudes em sítios de móveis e eletrodomésticos nos dias úteis seria inferior a 14.',
126:'A série yₜ=0,6yₜ₋₁+1,2t+eₜ é uma série autorregressiva AR(1) com tendência.',
127:'A série xₜ=xₜ₋₁+eₜ, em que eₜ tem média zero e variância constante, é denominada ruído branco.',
128:'Na tabela de sobrevivência, se um animal vivo no início do dia 4 for escolhido ao acaso, a probabilidade de ele chegar vivo ao início do dia 7 é superior a 60%.',
129:'Na tabela de sobrevivência, se um animal vivo no início do dia 3 for escolhido ao acaso, a probabilidade de ele morrer até o dia 6 é superior a 50%.',
130:'Na tabela de sobrevivência, para um animal vivo no início do dia 4, a probabilidade de morrer nesse dia é igual a 15%.',
131:'A divergência de Kullback–Leibler é uma medida de distância entre duas distribuições de dados, uma correta e outra assumida incorretamente, e é sempre positiva.',
132:'A entropia de um dado honesto é igual a 3,6 bits.',
134:'Criptografia utiliza algoritmos matemáticos para transformar dados em formato ininteligível, de modo que não sejam imediatamente lidos por terceiros não autorizados.',
135:'Se dados trafegados em uma rede sem fio empresarial forem criptografados, será obrigatório utilizar conjuntamente algoritmos de compressão e de criptografia.',
137:'Com o algoritmo RSA, é computacionalmente inviável determinar a chave privada conhecendo apenas o algoritmo e a chave pública de criptografia.',
139:'O AES é um algoritmo de criptografia simétrica e aceita chaves de 24 bits.',
140:'No SHA-512, uma das etapas de processamento inicializa o buffer de hash com valores armazenados em formato little-endian.',
141:'Funções hash podem ser utilizadas para verificar a integridade de dados transmitidos.',
143:'A movimentação aleatória do mouse por um usuário é incapaz de gerar entropia em um computador.',
144:'As múltiplas chaves do 3DES são vulneráveis a força bruta, e o uso do DES é alternativa para evitar essa vulnerabilidade.',
145:'A cifra CBC (cipher block chaining) pode ser aplicada em mecanismos de autenticação.',
146:'No modo ECB, blocos de texto claro são cifrados independentemente, podendo utilizar a mesma chave secreta.',
147:'Cifras de bloco como AES e DES processam blocos de tamanho fixo: 64 bits para DES e 128 bits para AES.',
148:'Uma entrada de vídeo de câmera conectada a um computador pode ser usada como fonte de entropia.',
150:'A capacidade de cifrar, decifrar e trocar chaves é característica do algoritmo RSA.'
}
const contextos=[
 {ini:61,fim:63,texto:'Contexto da prova: f(x)=x³−3x²+10, definida no intervalo −2≤x≤3.'},
 {ini:64,fim:67,texto:'Contexto da prova: P:R³→R², P(x,y,z)=(x,y); T:R²→R³, T(x,y)=(x,y,x+y). As matrizes P e T são escritas nas bases canônicas.'},
 {ini:71,fim:73,texto:'Contexto da prova: P′(t)=0,24e^(−t)P(t)², P(0)=4; P(t) é a porcentagem da população vacinada até t dias. Para os itens, use ln 6≈1,79.'},
 {ini:79,fim:83,texto:'Contexto da prova: há 30 oficiais, 70 agentes e 40 analistas. Um relatório usa (3,8,1) profissionais e gera R$ 5.000; um acompanhamento usa (2,2,4) e gera R$ 3.000. Seja x o número de relatórios e y o de acompanhamentos.'},
 {ini:84,fim:86,texto:'Contexto da prova: A=(2,3), B=(7,2), C=(5,6). O ponto P minimiza a soma dos quadrados das distâncias de P a A, B e C.'},
 {ini:87,fim:91,texto:'Contexto da prova: a trajetória do microdrone é c(t)=(sen(t/6)cos(t/6), sen(t/6)sen(t/6), cos(t/6)), t∈R; as coordenadas estão em metros e t em segundos.'},
 {ini:92,fim:96,texto:'Contexto da prova: S contém 10 suspeitos. R={(x,y)∈S²: x praticou delito em mútuo acordo com y}. Tᵢ contém os suspeitos que praticaram delito em mútuo acordo com exatamente i suspeitos; T₀ contém quem não praticou delito ou praticou sozinho.'},
 {ini:97,fim:101,texto:'Contexto da prova: Y tem distribuição p(y)=0,5^(y+1), y∈{0,1,2,…}; X|Y=y tem distribuição p(x|y)=[1−p(y)]p(y)^x, x∈{0,1,2,…}. Considere T=X+Y.'},
 {ini:102,fim:105,texto:'Contexto da prova: W tem distribuição P(W=k)=((k+4)/k)θ^k(1−θ)^5, k∈{0,1,2,…}, 0<θ<1. Foi retirada amostra aleatória simples W₁,…,Wₙ; W̄=(W₁+…+Wₙ)/n.'},
 {ini:106,fim:109,texto:'Contexto da prova: foram sorteados 5 dos 50 grupos naturais. Para cada grupo i, os dados (nᵢ,yᵢ) são (10,5), (20,2), (30,1), (20,4), (20,8), totalizando 100 pessoas e soma dos valores yᵢ igual a 20; valores de yᵢ estão em milhares de reais.'},
 {ini:110,fim:112,texto:'Contexto da prova: U e V são variáveis aleatórias independentes e uniformes em (0,1); considere as transformações de Monte Carlo mostradas no enunciado de cada item.'},
 {ini:113,fim:114,texto:'Contexto da prova: experimento de durabilidade de três marcas de baterias; foram observados aleatoriamente 12 tempos por marca, totalizando 36 observações. H₀: mesmas distribuições; H₁: ao menos duas distribuições diferentes.'},
 {ini:115,fim:117,texto:'Contexto da prova: regressão Ŷ=a+bX em 20 observações; ΣX=300, ΣY=400, ΣX²=6.000, ΣY²=12.800 e Σ(XY)=8.400.'},
 {ini:120,fim:122,texto:'Contexto da prova: comprimentos de parafusos têm distribuição normal, média histórica 3 cm e desvio padrão 0,3 cm; especificação de 2,4 a 3,6 cm; foram avaliados 10.000 parafusos e 1.000 estavam fora da especificação. Use Φ(1)=0,841, Φ(1,65)=0,95, Φ(2)=0,975, Φ(2,5)=0,994 e √(0,0384/10.000)≈0,002.'},
 {ini:123,fim:125,texto:'Contexto da prova: tabela de fraudes por data e tipo de sítio. Dias úteis: jogos on-line 22, móveis/eletrodomésticos 18; fins de semana/feriados: jogos on-line 28, móveis/eletrodomésticos 12.'},
 {ini:126,fim:127,texto:'Contexto da prova: análise de séries temporais para yₜ=0,6yₜ₋₁+1,2t+eₜ e xₜ=xₜ₋₁+eₜ; eₜ tem média zero e variância constante.'},
 {ini:128,fim:130,texto:'Contexto da prova: tabela de sobrevivência, com dias t=0,…,9; número vivo no início do dia vₜ e número de mortes no dia dₜ: (0,10000,500), (1,9500,700), (2,8800,800), (3,8000,800), (4,7200,1080), (5,6120,720), (6,5400,1350), (7,4050,1350), (8,2700,1200), (9,1500,1500).'},
 {ini:131,fim:132,texto:'Contexto da prova: considere log₂3≈1,6 nos itens sobre entropia na teoria da informação.'},
 {ini:134,fim:150,texto:'Contexto da prova: itens de criptografia simétrica e assimétrica, algoritmos RSA, AES, Diffie–Hellman, 3DES, modos de operação, entropia e funções hash.'}
]
const exportado=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(exportado.length!==77||new Set(exportado.map(q=>q.numero)).size!==77)throw Error(`Exportação inesperada: ${exportado.length} registros / ${new Set(exportado.map(q=>q.numero)).size} números únicos`)
const decisions=exportado.map(q=>{
 const n=q.numero,meta=areas.get(n),ans=gabaritoPorNumero.get(n)
 if(!meta||!ans)throw Error(`Questão sem classificação ou gabarito oficial: ${q.id} / ${n}`)
 const apoio=contextos.find(c=>n>=c.ini&&n<=c.fim)?.texto||''
 const raw=correcoes[n]||q.enunciado
 const stem=raw.replace(/\s*(?:Espaço livre|\|\|378_ABIN_011_01N365368\|\||CESPE\s*[|–-]\s*CEBRASPE\s*[–-]\s*ABIN\s*[–-]\s*Aplicação:\s*2018)[\s\S]*$/i,'').replace(/\s+/g,' ').trim()
 const anulada=ans==='X'
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,materia:meta.materia,conteudo:meta.conteudo,ano:2018,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao,numero_original:n,numero:n,pagina:q.pagina,dificuldade:meta.dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa pedagógica pela complexidade conceitual, algébrica, estatística ou criptográfica; não é índice psicométrico publicado pela banca.',classificacao_fonte:prova,motivo:`Classificação individual conforme o enunciado e o bloco temático da prova oficial da ABIN, Cargo 2, Área 7, item ${n}.`,texto_apoio:apoio,apoio:[],imagem_pagina:`paginas/${doc}-${String(q.pagina).padStart(4,'0')}.webp`,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente'],resposta_correta:anulada?null:ans==='C'?0:1,anulada,gabarito_oficial:{valor:ans,fonte:gabarito,fontes:[gabarito],arquivo:'Gabarito oficial definitivo CEBRASPE — ABIN — Cargo 2, Área 7',prova:'Caderno oficial 378_ABIN_011_01, aplicação em 11/03/2018',sha256:hashGabarito,sha256_tipo:'transcricao_canonica_dos_itens_61_a_150; nao_e_hash_do_pdf',metodo:'Transcrição do gabarito oficial definitivo do CEBRASPE; itens conferidos por número na tabela de respostas do Cargo 2, Área 7.',numero:n,resposta:anulada?'Anulado':ans,criterio:anulada?'Item anulado no gabarito definitivo; sem correção automática.':'Gabarito definitivo oficial CEBRASPE.'}}
})
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
await fs.mkdir('docs/acervo/revisao-profissional',{recursive:true})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify({nome,documento_id:doc,prova,gabarito,questoes_revisadas:decisions.length,questoes_anuladas:decisions.filter(x=>x.anulada).map(x=>x.numero),resultado},null,2))
console.log(JSON.stringify({nome,questoes:decisions.length,anuladas:decisions.filter(x=>x.anulada).map(x=>x.numero),materias:[...new Set(decisions.map(x=>x.materia))],resultado},null,2))
