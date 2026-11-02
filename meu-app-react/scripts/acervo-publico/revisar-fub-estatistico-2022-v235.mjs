import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-fub-estatistico-2022-v235',doc='c020f8957d11f9cf'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_22/arquivos/678_FUB_007_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/fub_22/arquivos/ED_1_FUB_2021_ABT.PDF'
const concurso='FUB 2022 — Cargo 7: Estatístico'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='678_FUB_007_01.PDF'||catalog.questoes.length!==79)throw Error('Inventário incompatível: esperados 79 registros OCR')
const grupos=new Map();for(const e of catalog.questoes){const a=grupos.get(e.numero)||[];a.push(e);grupos.set(e.numero,a)}
if(grupos.size!==70||[...grupos.keys()].some(n=>n<51||n>120))throw Error('Esperados 70 itens únicos, números 51–120')
const prev=raizesAtuais.findIndex(x=>x.includes('revisao-telebras-financas-2021-v234'))
if(prev<0)throw Error('Base anterior v234 ausente')
const bases=raizesAtuais.slice(prev),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),want=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
for(const lote of manifest.lotes.filter(x=>x.arquivo&&x.ano===2022&&/fub/i.test(x.concurso||''))){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,bases)))
 for(const q of qs)if(want.has(q.id)){byId.set(q.id,q);want.delete(q.id)}
 if(!want.size)break
}
if(want.size)throw Error(`Registros ausentes no acervo: ${want.size}`)

const conteudos={
51:'Estatística descritiva: tabela de frequências, total de observações e soma ponderada',
52:'Estatística descritiva: média aritmética ponderada em distribuição de frequências',
53:'Estatística descritiva: assimetria e forma da distribuição',
54:'Distribuições de probabilidade: variável discreta e distribuição normal contínua',
55:'Estatística descritiva: proporção e frequência acumulada',
56:'Estatística descritiva: escalas de mensuração e escolha de gráfico',
57:'Estatística descritiva: variância, desvio padrão e coeficiente de variação',
58:'Distribuição normal: distribuição amostral da média e probabilidades',
59:'Distribuição normal contínua: probabilidade pontual em variável contínua',
60:'Distribuição normal: quantis, percentis e valores críticos',
61:'Distribuição normal: quantil e classificação por percentil',
62:'Amostragem sem reposição: correção para população finita e variância da média',
63:'Amostragem: distribuição amostral e número de amostras possíveis',
64:'Distribuição normal: padronização e cálculo de probabilidades',
65:'Distribuição normal: probabilidade acumulada e proporção de aprovados',
66:'Variáveis aleatórias discretas: mediana em distribuição de probabilidades',
67:'Variáveis aleatórias discretas: esperança e média de distribuição',
68:'Variáveis aleatórias discretas: simetria e probabilidades em torno da mediana',
69:'Variáveis aleatórias: segundo momento, variância e desvio padrão',
70:'Variáveis aleatórias discretas: função de probabilidade e probabilidade acumulada',
71:'Aproximação normal: comparação entre distribuições discreta e contínua',
72:'Estatística descritiva: gráfico de setores para variável discreta',
73:'Variáveis aleatórias discretas: soma de probabilidades e suporte da distribuição',
74:'Inferência estatística: viés e propriedade de não tendenciosidade',
75:'Inferência estatística: estimativa pontual e intervalo de confiança',
76:'Inferência estatística: intervalo de confiança para média com desvio conhecido',
77:'Estimadores: média amostral, eficiência e não tendenciosidade',
78:'Inferência estatística: erro padrão, margem de erro e nível de confiança',
79:'Testes de hipóteses: hipótese nula e alternativa em teste de proporção',
80:'Testes de hipóteses: poder do teste e erro tipo II',
81:'Testes de hipóteses: erro tipo I e decisão estatística',
82:'Testes de hipóteses: escore z, região crítica e significância bilateral',
83:'Correlação: coeficiente de Pearson e associação linear',
84:'Correlação de Pearson: sinal do coeficiente e inclinação da regressão',
85:'Regressão linear simples: mínimos quadrados ordinários e intercepto',
86:'Correlação estatística: interpretação e correlação espúria',
87:'Regressão linear: resíduos, valores ajustados e observações amostrais',
88:'Teste qui-quadrado: discrepância entre frequências observadas e esperadas',
89:'Teste qui-quadrado: cálculo da estatística de aderência',
90:'Teste qui-quadrado de aderência: adequação da distribuição teórica',
91:'Análise de variância: teste F e comparações múltiplas de Tukey',
92:'Análise de variância: fator, variável de resposta e grupos',
93:'Análise de variância: pressupostos da razão F e amostragem aleatória',
94:'Regressão linear: coeficiente de determinação e variância explicada',
95:'Correlação: associação linear e coeficiente de Pearson',
96:'Regressão linear: coeficiente de determinação e sinal da inclinação',
97:'Linguagem R: tidyverse, data frame e filtragem com dplyr',
98:'Linguagem R: exportação de data frame em arquivo CSV',
99:'Linguagem R: tratamento de valores ausentes com tidyr',
100:'Linguagem R: transformação e criação de variáveis com mutate',
101:'Linguagem R: ordenação de data frames com dplyr',
102:'Linguagem R: comandos while e atualização iterativa de variável',
103:'Linguagem R: laço for, vetores e indexação',
104:'Linguagem R: estrutura repeat, condição de parada e break',
105:'Linguagem R e ggplot2: construção de gráfico de linhas e pontos',
106:'Linguagem R e ggplot2: regressão suavizada e agrupamento por fator',
107:'Linguagem R e ggplot2: gráfico de barras, fatores e escala manual',
108:'Linguagem R e ggplot2: gráfico de setores e escala de preenchimento',
109:'Dados abertos: acesso, reutilização, modificação e licenciamento',
110:'Dados abertos: formatos abertos e padrões não proprietários',
111:'Dados abertos: princípios de publicação e forma estruturada',
112:'Amostragem: amostragem aleatória simples e estimativa de proporção',
113:'Amostragem: unidade amostral e unidade de observação',
114:'Inferência estatística: erro padrão de estimativa de proporção',
115:'Amostragem estratificada: estimativa ponderada da proporção populacional',
116:'Amostragem multinomial: covariância negativa entre contagens',
117:'Distribuição amostral: esperança da média amostral ponderada',
118:'Distribuição amostral: variância da proporção ou média em amostragem sem reposição',
119:'Estimadores de variância: esperança e correção para amostras finitas',
120:'Distribuição multinomial: variância das frequências amostrais'
}
const contextos=[
 [51,'Tabela de frequências com o número de disciplinas cursadas por estudantes em um semestre; as categorias são 2, 3, 4, 5, 6, 7 e 8 disciplinas, com frequências 10, 15, 40, 35, 28, 10 e 4. Considere a tabela da página 1 e julgue os itens.'],
 [58,'Considere notas com distribuição normal, média 4,5 e variância 9. O enunciado da prova fornece probabilidades de cauda da normal padrão para os valores críticos 0; 0,84; 1,28; 1,645; 1,96; 2,33 e 2,575. Julgue os itens.'],
 [66,'Distribuição dos tempos de defesa de dissertação em meses: 12 (0,01), 15 (0,02), 18 (0,04), 20 (0,10), 22 (0,22), 24 (0,31), 25 (0,18), 26 (0,04), 28 (0,03) e 30 (0,05). Julgue os itens.'],
 [74,'No que diz respeito à inferência estatística, julgue os itens a seguir.'],
 [79,'Tendo como referência os testes de hipóteses, ferramentas auxiliares à tomada de decisão sobre populações com base em amostras, julgue os itens seguintes.'],
 [83,'Considere oito pares de valores das variáveis X e Y, com ΣX = 24, ΣY = 49, ΣXY = 181, ΣX² = 100 e ΣY² = 343. Julgue os itens.'],
 [88,'Para uma amostra de tamanho n, considere as frequências observadas o₁, …, oₙ e as frequências esperadas e₁, …, eₙ. Julgue os itens relativos à estatística qui-quadrado.'],
 [91,'Considere a análise de variância, utilizada para comparar médias de uma variável numérica em mais de duas populações. Julgue os itens.'],
 [94,'Em uma regressão linear de Y sobre X, considere que o coeficiente de correlação de Pearson entre as variáveis seja 0,9200. Julgue os itens.'],
 [97,'Considere o código R exibido na imagem da página 3, que cria um data frame com idade, altura e dados usando tidyverse. Os itens 97–101 referem-se às operações e saídas mostradas no caderno.'],
 [102,'Considere os comandos de repetição da linguagem R mostrados nas imagens da página 3. Julgue os itens sobre os valores finais das variáveis.'],
 [105,'Considere o data frame graf e os gráficos gerados pelo código R e ggplot2 reproduzidos nas páginas 4 e 5. Julgue os itens sobre geometrias, agrupamentos, escalas e resultados visuais.'],
 [109,'Com respeito a dados abertos, julgue os itens seguintes.'],
 [112,'Uma pesquisa estima a proporção de alunos otimistas em três cursos. A tabela das páginas 4–5 informa 12.000 alunos na população e, por curso, tamanho de amostra, estimativa da proporção e erro padrão. Julgue os itens.'],
 [116,'Considere população finita de tamanho N, observações y₁,…,yN, média e variância populacionais indicadas na página 5 e amostragem aleatória simples sem reposição. A média amostral é expressa por ponderações multinomiais πᵢ. Julgue os itens.']
]
function contexto(n){return contextos.filter(([inicio])=>inicio<=n).at(-1)[1]}
const canon=new Map([[51,'extr-fb800e5769cec4bc1bc3'],[52,'extr-39e4cb04674c5abd4d23'],[53,'extr-6e901455163ac1305654'],[54,'extr-a0d657b6ea9f1878609e'],[55,'extr-5c79f2f34908945cc557'],[57,'extr-63af617567e2b05b1087'],[58,'extr-3afb7bea5c8f8e512b00'],[62,'extr-dcbccc3797fcce9b47d9'],[65,'extr-c7038911b25f7cad1242']])
const facil=new Set([51,52,55,56,59,60,64,65,66,70,72,73,74,75,79,83,88,90,92,95,97,98,99,100,101,102,103,104,105,107,108,109,110,111,112,113,117,120])
const dificil=new Set([54,57,58,62,63,68,69,71,76,78,80,82,84,85,86,87,89,91,93,94,96,106,114,115,116,118,119])
const decisoes=[]
for(const [n,entries] of grupos){const conteudo=conteudos[n],canonical=canon.get(n)||entries[0].id
 if(!conteudo)throw Error(`Questão ${n} sem conteúdo específico`)
 for(const e of entries){const q=byId.get(e.id),img=`paginas/${doc}-${String(e.pagina).padStart(4,'0')}.webp`,duplicada=e.id!==canonical
  if(!q||q.pagina!==e.pagina)throw Error(`Registro/página divergente: questão ${n}`)
  await fs.access(`public/acervo-extraido/${img}`)
  const d={id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Estatística',conteudo,ano:2022,concurso,
   numero_original:n,pagina:e.pagina,dificuldade:facil.has(n)?'Fácil':dificil.has(n)?'Difícil':'Média',dificuldade_estimada:true,
   dificuldade_evidencia:'Estimativa editorial segundo a operação estatística, a quantidade de etapas e a interpretação exigidas; não representa índice psicométrico oficial.',
   classificacao_fonte:{documento:catalog.arquivo,prova,edital,metodo:'Classificação individual pelo enunciado, tabelas, imagens e tópico do edital do Cargo 7: Estatístico.'},
   visual:{pagina:e.pagina,imagem:img,motivo:`Página ${e.pagina} do caderno oficial conferida; tabela, gráfico, saída de R ou fórmula necessária permanece vinculada à questão.`},
   remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],
   motivo:duplicada?`Duplicata OCR do item ${n}; versão canônica legível mantida.`:`Classificação individual conforme conteúdo do item e edital de Estatística. Gabarito preexistente preservado.`}
  if(!duplicada){d.apta_resolucao=true;d.texto_apoio=contexto(n)}
  else{d.apta_resolucao=false;d.inelegibilidade_motivo=`Cópia OCR do item ${n}; questão canônica ${canonical} mantida.`;d.duplicada_de=canonical}
  decisoes.push(d)
 }
}
if(decisoes.length!==79)throw Error(`Esperados 79 registros OCR, obtidos ${decisoes.length}`)
const out=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[prev],decisoes})
console.log(JSON.stringify({...out,documento:catalog.arquivo,registros_revisados:79,itens_unicos:70,duplicatas_inelegiveis:9,paginas_conferidas:[1,2,3,4,5],publicado:false},null,2))
