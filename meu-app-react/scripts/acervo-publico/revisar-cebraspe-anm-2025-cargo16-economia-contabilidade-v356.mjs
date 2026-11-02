import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'
const doc='9bd9dbacb182d457'
const prova='https://cdn.cebraspe.org.br/concursos/anm_24/arquivos/038_ANM_016_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/anm_24/arquivos/Gab_Definitivo_038_ANM_016_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/anm_24/arquivos/ED_1_ANM_24_CONCURSO_ABERTURA_ATUALIZADO_RET_4.PDF'
const concurso='ANM 2025 — Especialista em Recursos Minerais — Economia ou Contabilidade — Cargo 16'
const records=JSON.parse(await fs.readFile('tmp/pendentes-documento-'+doc+'.json','utf8'))
const key={51:'E',52:'E',53:'C',54:'C',55:'E',56:'E',57:'C',58:'E',59:'C',60:'C',61:'E',62:'C',63:'E',64:'C',65:'E',66:'C',67:'E',68:'C',69:'C',70:'C',71:'E',72:'E',73:'E',74:'C',75:'E',76:'E',77:'C',78:'C',79:'C',80:'E',81:'C',82:'E',83:'C',84:'C',85:'E',86:'E',87:'C',88:'E',89:'E',90:'C',91:'E',92:'C',93:'C',94:'C',95:'E',96:'E',97:'E',98:'E',99:'C',100:'E',101:'C',102:'C',103:'C',104:'E',105:'E',106:'E',107:'E',108:'C',109:'C',110:'C',111:'E',112:'C',113:'E',114:'C',115:'C',116:'E',117:'E',118:'E',119:'C',120:'C'}
const keyHash='5131b89573019748db24a3ffa1ff1d5de10fd39052b789fd20a36558fe1f2621'
const content={
51:'Balanço de pagamentos: saldo externo líquido e transações correntes',
52:'Balanço de pagamentos: reservas internacionais e transações externas',
53:'Política monetária: esterilização de intervenções cambiais',
54:'Base monetária, depósitos compulsórios e meios de pagamento M1',
55:'Finanças públicas: necessidade de financiamento do setor público',
56:'Modelo IS-LM: sensibilidade da demanda por moeda e política fiscal',
57:'Dívida pública: estabilização da razão dívida/PIB e superávit primário',
58:'Modelo keynesiano simples: tributação, renda e propensão marginal a consumir',
59:'Regulação econômica: tarifação pelo custo do serviço e incentivos à eficiência',
63:'Matemática financeira: taxa nominal e taxa efetiva anual',
64:'Matemática financeira: custo efetivo de financiamento e valor presente de prestações',
65:'Probabilidade: função densidade conjunta e esperança matemática',
66:'Probabilidade contínua: cálculo em região definida por densidade conjunta',
67:'Probabilidade: independência de variáveis aleatórias',
68:'Distribuição hipergeométrica: amostragem sem reposição',
69:'Distribuição hipergeométrica: número de zonas de risco fiscalizadas',
70:'Distribuição exponencial: decaimento radioativo e função de sobrevivência',
72:'Testes de hipóteses: poder do teste e erro tipo II',
73:'Testes de hipóteses: interpretação do nível de significância',
74:'Séries temporais: autocorrelação, PACF e modelo autorregressivo AR(2)',
75:'Econometria: método de controle sintético e trajetória pré-tratamento',
76:'Econometria: construção do controle sintético e ponderação de unidades',
77:'Econometria: método de controle sintético e grupo de comparação',
78:'Econometria: método de diferenças em diferenças e pressupostos',
80:'Contabilidade: demonstração do valor adicionado e produto interno bruto',
81:'Contabilidade: disponibilidades e equivalentes de caixa',
82:'Contabilidade: ativo e reconhecimento de recursos econômicos',
84:'Contabilidade: propriedade para investimento e mensuração subsequente',
85:'Contabilidade: disponibilidades e equivalentes de caixa',
86:'Contabilidade: ajuste a valor presente e juros em compras a prazo',
87:'Contabilidade: estoques e classificação no ativo',
88:'Contabilidade de custos: ponto de equilíbrio contábil com mix de vendas',
91:'Análise das demonstrações contábeis: liquidez geral e capital de giro',
92:'Análise das demonstrações contábeis: composição do endividamento',
93:'Escrituração contábil: livro-caixa e partidas simples',
94:'Escrituração contábil: livro diário e periodicidade de lançamentos',
96:'Escrituração contábil: retificação de lançamentos e erros',
106:'Contabilidade de recursos naturais: exaustão e valor residual',
107:'Matemática financeira: sistema misto de amortização e prestação inicial',
108:'Matemática financeira: sistema de amortização constante com carência',
109:'Matemática financeira: sistema de prestação constante e amortização',
110:'Matemática financeira: juros compostos, logaritmos e tempo de capitalização',
111:'Matemática financeira: conversão de taxa efetiva por período plurianual',
112:'Matemática financeira: taxa nominal e frequência de capitalização',
113:'Matemática financeira: taxa real, inflação e taxa aparente',
114:'Matemática financeira: fluxo de caixa diferido e valor presente',
115:'Matemática financeira: série uniforme antecipada e valor acumulado',
116:'Matemática financeira: equivalência de fluxos de caixa',
117:'Matemática financeira: valor presente de pagamentos periódicos',
118:'Análise de investimentos: retorno sobre investimento (ROI)',
119:'Análise de investimentos: taxa interna de retorno (TIR)',
120:'Análise de investimentos: valor presente líquido (VPL)'
}
const matter=n=>n>=51&&n<=61?'Economia':n>=62&&n<=64?'Matemática Financeira':n>=65&&n<=73?'Estatística':n>=74&&n<=78?'Econometria':n>=79&&n<=106?'Contabilidade':n>=107&&n<=117?'Matemática Financeira':n>=118&&n<=120?'Análise de Investimentos':null
const contexts=[
[51,52,'Texto-base: determinado país realizou transações com o exterior, em bilhões de dólares: importações de mercadorias financiadas pelo exterior, FOB, 100; exportações de mercadorias pagas à vista, FOB, 50; juros da dívida externa, 15; fretes internacionais, 5; empréstimos recebidos do exterior, 20; doações recebidas em mercadorias, 10; investimento direto externo em máquinas e equipamentos, sem cobertura cambial, 30; remessa de lucros de multinacionais sediadas no país para o exterior, 20. Com base nesses dados, julgue os itens.'],
[53,53,'No mercado de câmbio à vista, o Banco Central vende dólares das reservas internacionais e, simultaneamente, compra títulos da dívida pública em poder do público por meio de operação de mercado aberto, no mesmo valor.'],
[54,54,'Texto-base: economia com base monetária de $ 2.000; 80% dos meios de pagamento em depósitos à vista nos bancos comerciais; reservas obrigatórias e voluntárias equivalentes a 25% desses depósitos.'],
[55,58,'A respeito das finanças públicas e dos modelos macroeconômicos, julgue os itens.'],
[59,61,'Julgue os itens referentes a estruturas e falhas de mercado e regimes de tarifação.'],
[62,64,'Com base nos elementos da matemática financeira, julgue os itens.'],
[65,67,'Texto-base: as variáveis aleatórias X e Y têm densidade conjunta f(x,y)=1−x/2−y/3 para 0≤x≤2, 0≤y≤3 e x/2+y/3≤1; fora dessa região, f(x,y)=0. Julgue os itens com base nessa distribuição.'],
[68,69,'Texto-base: uma agência fiscaliza 10 regiões, 4 das quais são zonas de risco. São sorteadas aleatoriamente 5 fiscalizações anuais. X é a quantidade de regiões de risco entre as sorteadas.'],
[70,71,'Texto-base: átomos de um mineral radioativo sofrem decaimento aleatório. Para t≥0, o instante de decaimento tem densidade f(t)=λe^(−λt), e f(t)=0 para t<0. O tempo é medido em anos; 60% dos átomos da amostra decaem após 1 ano.'],
[72,73,'Texto-base: um laboratório testa duas amostras de rochas para verificar se têm a mesma composição mineral. A hipótese nula afirma que as composições são iguais; a hipótese alternativa afirma diferença em algum componente. O nível de significância é α=5%.'],
[74,74,'Material visual: série temporal simulada e gráficos das funções de autocorrelação (ACF) e autocorrelação parcial (PACF). A série não apresenta cointegração e é estacionária no formato observado.'],
[75,77,'Texto-base: um analista avalia o método de controle sintético para estimar o efeito de uma política de segurança aplicada em uma região, comparando-a com outras regiões que não receberam a política.'],
[78,78,'A respeito do método de diferenças em diferenças, julgue o item.'],
[79,87,'Julgue os itens relativos à elaboração de demonstrações contábeis e aos itens patrimoniais, conforme os pronunciamentos contábeis aplicáveis.'],
[88,88,'Texto-base: indústria que fabrica produtos A e B. Estrutura de custos por unidade: mão de obra direta — A R$ 4, B R$ 6; matérias-primas — A R$ 14, B R$ 12; preço de venda — A R$ 40, B R$ 30. O produto B tem maior penetração e são vendidas duas unidades de B para cada unidade de A. Custos fixos de produção: R$ 400 mil; despesas fixas de administração e vendas: R$ 80 mil; despesas variáveis: R$ 2 por unidade vendida.'],
[89,90,'A respeito dos métodos de custeio de produtos e da avaliação gerencial de custos, julgue os itens.'],
[91,92,'Julgue os itens a respeito da análise econômico-financeira de empresas.'],
[93,97,'Acerca da escrituração do livro diário, do livro-razão e dos livros auxiliares de uma sociedade empresária, julgue os itens.'],
[98,102,'Considerando aspectos contábeis relativos às ações em tesouraria, julgue os itens.'],
[103,106,'Com relação à exaustão contábil, julgue os itens.'],
[107,109,'Texto-base: empréstimo de R$ 615.000, pago em 10 prestações semestrais, com taxa de juros de 21% ao ano. Para os cálculos, considere fator de valor presente de 6,15.'],
[110,113,'A respeito de taxas de juros e equivalência financeira, julgue os itens.'],
[114,117,'Julgue os itens relacionados a fluxos de caixa.'],
[118,120,'No que se refere à análise de investimentos, julgue os itens.']
]
const context=n=>contexts.find(([a,b])=>n>=a&&n<=b)?.[2]||''
const stems={
51:'O passivo externo líquido do país em questão é de US$ 80 bilhões.',
52:'As reservas internacionais do referido país decresceram US$ 30 bilhões no período.',
53:'Considere que o Banco Central atue no mercado de câmbio à vista por meio da venda de dólares das reservas internacionais e, simultaneamente, faça uma operação de mercado aberto, no mesmo valor, comprando títulos da dívida pública em poder do público. Nessa hipótese, não haverá alteração da base monetária.',
54:'Em uma economia com base monetária de $ 2.000, na qual 80% dos meios de pagamento são mantidos sob a forma de depósitos à vista em bancos comerciais, se os bancos mantiverem 25% desses depósitos sob a forma de reservas, consideradas tanto as obrigatórias quanto as voluntárias, a quantidade de moeda (M1) em circulação equivalerá a $ 5.000.',
57:'Para se estabilizar a razão dívida-PIB de um país com taxa de juros real de 10% e taxa de crescimento real do PIB de 2%, desconsiderados quaisquer outros ajustes, é necessário um superávit primário superior a 6% do PIB caso a dívida represente 80% do PIB.',
63:'Para uma taxa nominal (linear) de 12% ao ano capitalizada semestralmente, a taxa efetiva anual é [(1,12)^2 − 1] × 100.',
64:'A equação 30.000 = 12.000 × [1 − (1 + c)^(−3)]/c permite determinar o custo efetivo (c) de um financiamento de R$ 30 mil, cujo pagamento é feito por meio de 3 parcelas iguais e consecutivas de R$ 12 mil.',
65:'E[X] > E[Y].',
66:'A probabilidade de um ponto escolhido aleatoriamente do conjunto [0, 2] × [0, 3] estar localizado no quadrado unitário [0, 1]^2 é maior que 50%.',
67:'X e Y são independentes.',
68:'A probabilidade de pelo menos duas das regiões fiscalizadas este ano serem zonas de risco é menor que 75%.',
69:'A variável aleatória X tem distribuição hipergeométrica.',
70:'Após 2 anos, 84% dos átomos da amostra terão decaído.',
71:'O instante em que um átomo sofre decaimento é uma variável aleatória com distribuição de Poisson.',
74:'A série pode ser modelada como um processo autorregressivo AR(2).',
88:'Nessas condições, preservadas as proporções de vendas dos produtos A e B, a venda de 24 mil unidades do produto B constitui o necessário para o alcance do ponto de equilíbrio contábil da indústria.',
90:'Considere que uma empresa tenha custos fixos de produção de R$ 300 mil e despesas fixas de administração e venda de R$ 100 mil, além de custos de produção variáveis de R$ 10 por unidade e despesas variáveis de administração e venda de R$ 2 por unidade. Em um período sem estoques iniciais, a empresa produz 10 mil unidades de seu único produto, vendidas por R$ 70 cada. Pelo método do custeio variável, cada unidade vendida gera margem de contribuição de R$ 60.',
110:'Um capital aplicado a uma taxa de juros compostos i ao mês levará exatamente o tempo n = 1/log₃(1+i) para triplicar.',
115:'Caso um investidor realize doze depósitos mensais sucessivos de valor x no início de cada mês, de modo que no início do 13.º mês o valor acumulado seja y, e a taxa mensal seja i, cada depósito será x = (y·i)/((1+i)^13 − (1+i)).'
}
const images={
51:[{pagina:1,imagem:'paginas/'+doc+'-0001.webp',texto:'Tabela de transações externas em bilhões de dólares, necessária para resolver os itens 51 e 52.'}],
52:[{pagina:1,imagem:'paginas/'+doc+'-0001.webp',texto:'Tabela de transações externas em bilhões de dólares, necessária para resolver os itens 51 e 52.'}],
74:[{pagina:2,imagem:'paginas/'+doc+'-0002.webp',texto:'Série temporal simulada, gráficos ACF e PACF usados no item 74.'}],
88:[{pagina:3,imagem:'paginas/'+doc+'-0003.webp',texto:'Tabela de custos unitários e preços dos produtos A e B.'}]
}
const duplicates={
'extr-7e9c52317834a9b64268':'extr-5c4161e0a0c3709413d7',
'extr-2d3656c7529263b75d57':'extr-6d2987085e05810ce7a8',
'extr-a2d55753dd692d6d0e79':'extr-b5f0520cc845d79fab58',
'extr-949561d5f3fc75b82ecd':'extr-11c2f83c002e31667f46',
'extr-8afb2d3970d78d88c823':'extr-569453d261a3957208ab'
}
const remove=['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','materia_nao_identificada','conteudo_nao_identificado','classificacao_generica']
if(records.length!==57)throw Error('Esperados 57 registros; encontrados '+records.length)
const decisions=[]
for(const q of records){
 const n=Number(q.numero),ans=key[n],mat=matter(n),topic=content[n],dup=duplicates[q.id]
 if(!ans||!mat||!topic)throw Error('Sem gabarito ou classificação: '+n+'/'+q.id)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:mat,conteudo:topic,ano:2025,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — 16/02/2025 — conhecimentos específicos — Cargo 16',cargo:'Especialista em Recursos Minerais — Especialidade: Economia ou Contabilidade — Cargo 16',numero_original:n,numero:n,pagina:Number(q.pagina),dificuldade:(n===51||n===57||n===61||n===64||n===65||n===72||n===73||n===75||n===76||n===78||n===86||n===87||n===88||n===90||n===92||n===96||n===106||n===108||n===110||n===115||n===119||n===120)?'Difícil':(n===52||n===54||n===59||n===60||n===62||n===68||n===69||n===71||n===74||n===77||n===80||n===81||n===82||n===84||n===85||n===93||n===94||n===98||n===99||n===103||n===104||n===107||n===111||n===112||n===116||n===118)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo a complexidade matemática, contábil ou econômica e a interpretação requerida; a banca não publica dificuldade individual.',classificacao_fonte:prova,motivo:'Conferência das páginas oficiais do caderno, cotejo com o gabarito definitivo do Cargo 16 e classificação pelo conteúdo programático de Economia ou Contabilidade do edital.',enunciado:stems[n]||q.enunciado.trim(),texto_apoio:context(n),apta_resolucao:!dup,remover_pendencias:remove}
 if(images[n])d.imagens_contexto=images[n]
 if(dup){d.inelegibilidade_motivo='Duplicata de OCR do item '+n+'; a versão canônica com símbolos e transcrição íntegros foi preservada. Cópia desativada para evitar dupla contagem.';d.duplicada_de=dup}
 else{d.resposta_correta=ans==='C'?0:1;d.anulada=false;d.gabarito_oficial={fonte:gabarito,arquivo:'Gab_Definitivo_038_ANM_016_01.PDF',prova:'038_ANM_016_01.PDF',sha256:keyHash,numero:n,pagina:1,resposta:ans,criterio:'Gabarito definitivo oficial CEBRASPE para o código 038_ANM_016_01; os itens 111–120 foram conferidos na tabela final do próprio documento.'}}
 decisions.push(d)
}
const preview={documento:doc,registros:records.length,questoesUnicas:decisions.filter(x=>x.apta_resolucao).length,duplicatasDesativadas:decisions.filter(x=>x.duplicada_de).length,gabaritosDefinitivos:decisions.filter(x=>x.gabarito_oficial).length,imagensDeApoio:decisions.reduce((n,x)=>n+(x.imagens_contexto?.length||0),0),materias:[...new Set(decisions.filter(x=>x.apta_resolucao).map(x=>x.materia))],publicado:false}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify(preview,null,2));process.exit(0)}
const nome='revisao-cebraspe-anm-2025-cargo16-economia-contabilidade-v356'
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift('tmp/revisao-profissional/'+nome+'/acervo-extraido')
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',"\nraizesAtuais.unshift('tmp/revisao-profissional/"+nome+"/acervo-extraido')\n")
const report={...result,...preview,edicao:concurso,dataAplicacao:'2025-02-16',figurasNecessarias:4,publicado:false,prova,gabarito,edital,nota:'57 registros foram revisados das páginas 1–4. Cinco duplicatas OCR foram desativadas. Corrigidos sinais de moeda, acentos, símbolos matemáticos, fórmulas, enunciados e classificações. Restauradas a tabela de transações externas (51–52), a série/ACF/PACF (74) e a tabela de custos por produto (88). Contextos e fórmulas estatísticas, contábeis e financeiras foram recompostos. Chaves 111–120 conferidas na tabela final do gabarito definitivo oficial. Nenhuma questão deste pacote está anulada. Referências visuais às páginas originais permanecem para auditoria.'}
await fs.writeFile('docs/acervo/revisao-profissional/'+nome+'.json',JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',"\n\n## CEBRASPE/ANM 2025 — Especialista em Recursos Minerais, Economia ou Contabilidade — revisão v356\n\n- Revisei "+records.length+" registros pendentes, corrigindo enunciados contaminados, acentos, moeda, fórmulas e filtros. Classifiquei por Economia, Matemática Financeira, Estatística, Econometria, Contabilidade e Análise de Investimentos.\n- Desativei cinco duplicatas OCR dos itens 51–54 e 57, mantendo uma versão canônica correta em cada caso.\n- Reconstruí texto-base e mantive imagens das tabelas dos itens 51–52 e 88, além dos gráficos de série temporal, ACF e PACF do item 74. Corrigi fórmulas da densidade conjunta, custos, juros compostos e fluxos de caixa.\n- Conferi os 52 gabaritos no documento definitivo oficial, inclusive itens 111–120 na tabela final. Validação local: "+result.total+" questões, "+result.disponiveis+" elegíveis e "+result.pendentes+" pendências. Não publicado na nuvem.\n- Fontes oficiais: [caderno da prova]("+prova+"), [gabarito definitivo]("+gabarito+") e [edital retificado]("+edital+").\n")
console.log(JSON.stringify(report,null,2))

