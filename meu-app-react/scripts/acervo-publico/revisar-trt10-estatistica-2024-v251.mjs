import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='51b4d839bff934a7'
const prova='https://cdn.cebraspe.org.br/concursos/trt10_24/arquivos/050_TRT10_007_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/trt10_24/arquivos/Gab_Definitivo_050_TRT10_007_01.pdf'
const concurso='TRT 10ª Região 2024 — Cargo 7: Analista Judiciário, Apoio Especializado, Estatística'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==75||catalog.url.toLowerCase()!==prova.toLowerCase())throw Error('Caderno oficial TRT 10, Cargo 7, diverge do catálogo')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-insa-popularizacao-conhecimento-2024-v250'))
if(start<0)throw Error('Base v250 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),records=new Map()
for(const l of manifest.lotes.filter(x=>x.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(l.arquivo,bases))))if(q.documento_id===doc)records.set(q.id,q)
if(records.size!==75)throw Error(`Esperados 75 recortes OCR do Cargo 7; encontrados ${records.size}`)

const topics=new Map([
 [51,['Estatística','Tipos de variáveis e escalas de mensuração: estatísticas descritivas na escala de razão']],
 [52,['Estatística','Variáveis qualitativas e dicotômicas: atribuição de códigos numéricos']],
 [53,['Estatística','Escalas de mensuração: classificação de faixas salariais e variáveis métricas']],
 [54,['Estatística','Codificação de variáveis qualitativas por variáveis indicadoras (dummies)']],
 [55,['Estatística','Medidas de tendência central: requisitos de uso da média aritmética']],
 [56,['Estatística','Amostragem sem reposição: princípio multiplicativo, arranjos e combinações']],
 [57,['Estatística','Análise combinatória: distinção entre arranjos e combinações']],
 [58,['Estatística','Análise combinatória: combinação simples sem reposição']],
 [59,['Estatística','Distribuição hipergeométrica: probabilidade de dois itens defeituosos na amostra']],
 [60,['Estatística','Distribuição hipergeométrica: probabilidade de itens não defeituosos na amostra']],
 [61,['Estatística','Distribuição hipergeométrica: probabilidade de amostra sem defeitos']],
 [62,['Estatística','Distribuição geométrica: esperança e desvio padrão do número de ensaios até o primeiro defeito']],
 [63,['Estatística','Distribuições discretas: identificação da distribuição geométrica']],
 [64,['Estatística','Distribuição geométrica: valor esperado do tempo até o primeiro sucesso']],
 [65,['Estatística','Distribuição geométrica: probabilidade de primeiro defeito no terceiro ensaio']],
 [66,['Estatística','Amostragem estratificada: homogeneidade intragrupo e variância']],
 [67,['Estatística','Amostragem por conglomerados em dois estágios']],
 [68,['Estatística','Amostragem aleatória simples com reposição: tamanho do espaço amostral']],
 [69,['Estatística','Estatística descritiva: distinção entre estatística amostral e parâmetro populacional']],
 [70,['Estatística','Teorema central do limite e distribuição amostral da média']],
 [71,['Estatística','Amostragem sistemática: necessidade de listagem da população']],
 [72,['Estatística','Testes de hipóteses bilaterais: região crítica e nível de significância']],
 [73,['Estatística','Testes de normalidade: Shapiro–Francia e Shapiro–Wilk']],
 [74,['Estatística','Testes de normalidade univariada: Kolmogorov–Smirnov e Shapiro–Wilk']],
 [75,['Estatística','Testes de homogeneidade de variâncias: Cochran e Hartley']],
 [76,['Estatística','ANOVA de regressão: teste F global e significância dos coeficientes']],
 [77,['Estatística','ANOVA de regressão: cálculo da razão F']],
 [78,['Estatística','Regressão linear: coeficiente de determinação e variância explicada']],
 [79,['Estatística','Regressão linear: variância residual e quadrado médio do erro']],
 [80,['Estatística','Regressão linear: parâmetros e coeficientes do modelo']],
 [81,['Estatística','ANOVA de regressão: variância da resposta e decomposição da soma de quadrados']],
 [82,['Estatística','Regressão linear simples: estimativa do intercepto sem variável explicativa']],
 [83,['Estatística','Regressão linear: coeficiente de determinação e teste do coeficiente angular']],
 [84,['Estatística','Regressão linear simples: comparação de variâncias de variáveis']],
 [85,['Estatística','Regressão linear: distribuição t da estimativa do coeficiente angular e graus de liberdade']],
 [86,['Estatística','Regressão linear: comparação de R² em modelos aninhados']],
 [87,['Estatística','Regressão linear simples: média amostral da variável explicativa']],
 [88,['Estatística','Distribuição normal bivariada: padronização, esperança e matriz de covariâncias']],
 [89,['Estatística','Distribuição normal bivariada: esperança condicional e regressão linear']],
 [90,['Estatística','Distribuição normal marginal: média e desvio padrão']],
 [91,['Estatística','Distribuição normal bivariada: variância de combinação linear']],
 [92,['Estatística','Distribuição normal bivariada: coeficiente de correlação de Pearson']],
 [93,['Estatística','Regressão de Poisson: dispersão e relação entre variância e média']],
 [94,['Estatística','Regressão de Poisson: função de ligação logarítmica e preditores']],
 [95,['Estatística','Regressão de Poisson: deviance, comparação de modelos e distribuição qui-quadrado']],
 [96,['Estatística','Análise de componentes principais: autovalores e desvios padrão']],
 [97,['Estatística','Análise de componentes principais: matriz de covariâncias ou correlações']],
 [98,['Estatística','Análise de componentes principais: proporção da variância total explicada']],
 [99,['Estatística','Análise de componentes principais: autovalores e cargas fatoriais']],
 [100,['Estatística','Análise de componentes principais: variância total e soma dos autovalores']],
 [101,['Informática','Linguagem R: alocação e preenchimento eficiente de vetores em simulações']],
 [102,['Informática','Python: arquivos bytecode .pyc e integração com código C']],
 [103,['Informática','Python: avaliação em curto-circuito dos operadores booleanos and e or']],
 [104,['Informática','Estruturas de repetição: diferença de execução mínima entre while e do-while']],
 [105,['Informática','Estruturas de dados: referências em listas duplamente encadeadas']],
 [106,['Informática','R e magrittr: operadores pipe %>% e pipe com atribuição %<>%']],
 [107,['Informática','Python e Pandas: remoção de colunas de um DataFrame']],
 [108,['Informática','Python: recursão, condição de parada e chamada recursiva']],
 [109,['Informática','Estruturas de dados: representação de matrizes esparsas por dicionários']],
 [110,['Estatística','Séries temporais: métricas de erro para tendências exponenciais e MAPE']],
 [111,['Estatística','Séries temporais: função de autocorrelação e processos autorregressivos']],
 [112,['Estatística','Séries temporais: integração de ordem um em modelos ARIMA']],
 [113,['Estatística','Análise espectral: periodograma e identificação de periodicidade']],
 [114,['Estatística','Séries temporais: modelos SARIMA com tendência e sazonalidade']],
 [115,['Estatística','Séries temporais: suavização exponencial simples e equivalência ARIMA']],
 [116,['Estatística','Testes não paramétricos: teste de sequências de Wald–Wolfowitz']],
 [117,['Estatística','Testes não paramétricos: qui-quadrado de independência e graus de liberdade']],
 [118,['Estatística','Testes não paramétricos: teste da mediana e distribuição da estatística']],
 [119,['Estatística','Testes não paramétricos: teste de McNemar para dados binários pareados']],
 [120,['Estatística','Testes não paramétricos: teste de Cox–Stuart e distribuição da estatística']],
])
if(topics.size!==70)throw Error(`Mapeamento incompleto: ${topics.size}/70`)
const answers=['E','C','E','E','C','C','E','C','C','C','C','E','E','C','C','C','C','C','C','E','C','E','E','C','C','E','C','C','E','C','E','C','C','E','E','E','C','E','C','C','E','E','E','E','C','C','E','C','E','C','C','E','C','C','E','E','E','E','C','E','C','C','E','C','E','E','C','X','C','E']
if(answers.length!==70)throw Error('Gabarito definitivo deve cobrir 51–120')
const answerMap=new Map(answers.map((x,i)=>[i+51,x])),keyDigest=hashRevisao(answers.join(''))
const byNumber=new Map()
for(const e of catalog.questoes){const a=byNumber.get(Number(e.numero))||[];a.push(e);byNumber.set(Number(e.numero),a)}
if(byNumber.size!==70||[...byNumber.keys()].some(n=>n<51||n>120)||[...byNumber].some(([n,a])=>a.length!==([51,54,55,61,62].includes(n)?2:1)))throw Error('Perfil de numeração/duplicação OCR divergente')
const canonical=new Map([[51,'extr-422e38bdca1b84493aab'],[54,'extr-fca4fa97e06cf51cc558'],[55,'extr-c4ee71a6841d7bd343d5'],[61,'extr-2b9b1a9b181cdc582e35'],[62,'extr-aaedabae21b6b47baef0']])
const duplicateToCanonical=new Map()
for(const [n,es] of byNumber)for(const e of es){const id=canonical.get(n)||es[0].id;if(e.id!==id)duplicateToCanonical.set(e.id,id)}
if(duplicateToCanonical.size!==5)throw Error('Esperava cinco duplicatas OCR')

const fixes=new Map([
 [51,{enunciado:'Para dados de uma variável expressa em escala de razão, podem ser aplicadas somente algumas estatísticas descritivas.'}],
 [54,{enunciado:'Uma variável qualitativa expressa por três categorias pode ser representada por uma variável dummy.'}],
 [55,{enunciado:'Para o cálculo da média, a variável deve ser necessariamente do tipo métrica.'}],
 [56,{texto_apoio:'Em um lote de 30 itens de um produto, 5 apresentam defeitos. Desse lote, 3 itens serão retirados ao acaso, sendo irrelevante a ordem deles. A partir dessa situação hipotética, julgue os itens seguintes.'}],
 [60,{enunciado:'A probabilidade de exatamente 2 itens retirados do lote não serem defeituosos é inferior a 0,4.'}],
 [61,{enunciado:'A probabilidade de todos os três itens retirados do lote não serem defeituosos é superior a 0,5.'}],
 [62,{enunciado:'O desvio padrão de X é superior a 50.',texto_apoio:'Em uma fábrica de teclados, cada teclado produzido tem 2% de chance de estar com defeito. O teste analisa teclados até encontrar o primeiro defeituoso. A variável aleatória X representa o número de teclados testados até encontrar esse primeiro defeito; se o primeiro teclado for defeituoso, X = 1.'}],
 [64,{enunciado:'O valor esperado de X é igual a 50.'}],
 [65,{enunciado:'A probabilidade de o terceiro teclado testado ser o primeiro com defeito é inferior a 0,05.'}],
 [76,{texto_apoio:'Tabela ANOVA do modelo de regressão linear: regressão — graus de liberdade 2, quadrado médio 14, p-valor da razão F 0,002; erro — graus de liberdade 8, quadrado médio 1. O modelo tem intercepto e coeficientes estimados por mínimos quadrados ordinários.'}],
 [81,{enunciado:'A variância amostral da variável resposta (dependente) do modelo é igual a 14.'}],
 [82,{texto_apoio:'Regressão linear simples em amostra aleatória de tamanho n = 10; parâmetros estimados por máxima verossimilhança sob erros normais com média zero e variância V. A média amostral da resposta é 8. Tabela: intercepto — estimativa 2,5, razão t 3, p-valor 0,008; coeficiente angular — estimativa 0,8, razão t 1, p-valor 0,170.'}],
 [85,{enunciado:'A distribuição amostral da razão t segue uma distribuição t de Student com 10 graus de liberdade.'}],
 [86,{enunciado:'Se o coeficiente angular for removido do modelo de regressão, então o R² do modelo resultante (sem coeficiente angular) deverá produzir um valor superior ao R² do modelo original (com coeficiente angular).'}],
 [87,{enunciado:'A média amostral da variável regressora (explicativa) é inferior a 7,5.'}],
 [88,{enunciado:'Se Z₁ = (X₁ − 2)/3 e Z₂ = (X₂ − 1)/2, então Z = (Z₁, Z₂)ᵀ distribui-se conforme uma normal bivariada com E[Z] = (0, 0)ᵀ e Cov(Z) = [[1, 0], [0, 1]].',texto_apoio:'Considere X = (X₁, X₂)ᵀ com distribuição normal bivariada, E[X] = (2, 1)ᵀ e Cov(X) = [[9, 2], [2, 4]].'}],
 [89,{enunciado:'A respeito da média condicional, é correto afirmar que E[X₁ | X₂ = x] = 1,5 + 0,5x.'}],
 [90,{enunciado:'X₂ segue uma distribuição normal com média 1 e desvio padrão 2.'}],
 [91,{enunciado:'Var(X₁ − X₂) ≥ 10.'}],
 [92,{enunciado:'A correlação linear entre X₁ e X₂ é igual a 0,5.'}],
 [93,{texto_apoio:'Considere que o número diário de petições iniciais com algum tipo de erro processual (Y) seja descrito por uma regressão de Poisson em função de duas variáveis explicativas, X₁ e X₂.'}],
 [97,{enunciado:'A extração dos fatores componentes foi efetuada a partir de uma matriz de correlações.'}],
 [100,{enunciado:'A soma das variâncias das cinco variáveis métricas envolvidas no estudo foi igual ou inferior a 30.'}],
 [103,{enunciado:'Caso f₁(), f₂() e f₃() sejam três funções booleanas, então, na condição f₁() and f₂() or f₃(), a função f₃() não será executada se f₁() = False.'}],
 [104,{enunciado:'A quantidade mínima de execuções é zero na construção while (cond) { ... } e uma na construção do { ... } while (cond).'}],
 [105,{enunciado:'Os elementos de uma lista duplamente encadeada possuem uma referência para o próximo elemento e para o primeiro elemento da sequência.'}],
 [106,{enunciado:'Na biblioteca magrittr da linguagem R, os operadores %>% e %<>% realizam exatamente a mesma operação.'}],
 [107,{enunciado:'Na biblioteca Pandas da linguagem Python, se df é um DataFrame, o comando df.drop(\'telefone\', axis=1) irá remover a coluna telefone de df.'}],
 [108,{enunciado:'O código em Python a seguir está correto quanto à aplicação da técnica de recursão.',texto_apoio:'Código original do caderno:\n```python\ndef f(x):\n    f(x - 1)\n```'}],
 [110,{enunciado:'Em uma série temporal que tem tendência de crescimento exponencial e na qual os valores iniciais são próximos de zero, a métrica mais adequada para avaliar o ajuste do modelo é a MAPE (mean absolute percentage error).'}],
 [112,{enunciado:'O modelo ARIMA com parâmetro d = 1 apresenta um componente de tendência linear.'}],
 [113,{enunciado:'Um periodograma é um gráfico utilizado para identificar tendências em uma série temporal.'}],
 [115,{enunciado:'A suavização exponencial simples é equivalente a um modelo AR(p).'}],
 [117,{enunciado:'No teste qui-quadrado para independência, o número de graus de liberdade da estatística de teste é (a − 1) × (b − 1), em que a é o número de categorias da primeira variável e b é o número de categorias da segunda variável.'}],
 [118,{enunciado:'A estatística do teste da mediana segue uma distribuição qui-quadrado.'}],
 [119,{enunciado:'O teste de McNemar é usado para testar a concordância entre dois fatores dicotômicos.'}],
 [120,{enunciado:'A estatística do teste de Cox–Stuart segue uma distribuição t de Student.'}],
])
const contexts=new Map([
 [51,'Em relação a tipos de variáveis e seus níveis de mensuração, julgue os itens a seguir.'],
 [56,'Em um lote de 30 itens de um produto, 5 apresentam defeitos. Serão retirados ao acaso 3 itens, sem reposição, sendo irrelevante a ordem.'],
 [62,'Em uma fábrica de teclados, cada teclado produzido tem 2% de chance de estar defeituoso. Os teclados são testados até encontrar o primeiro defeito. X é o número de testes até esse defeito, com X = 1 quando o primeiro teclado analisado for defeituoso.'],
 [66,'A respeito de amostragem, julgue os itens que se seguem.'],
 [72,'Julgue os próximos itens referentes à inferência estatística.'],
 [76,'Tabela ANOVA parcial de regressão linear: regressão (gl = 2, QM = 14, p-valor F = 0,002); erro (gl = 8, QM = 1). O modelo tem intercepto e foi estimado por mínimos quadrados ordinários.'],
 [82,'Amostra aleatória simples de tamanho n = 10; regressão linear simples ajustada por máxima verossimilhança sob erros normais de média zero e variância V; média amostral da resposta igual a 8. Resultados: intercepto (estimativa 2,5; t = 3; p = 0,008) e coeficiente angular (estimativa 0,8; t = 1; p = 0,170).'],
 [88,'Considere X = (X₁, X₂)ᵀ normal bivariada, com E[X] = (2, 1)ᵀ e Cov(X) = [[9, 2], [2, 4]].'],
 [93,'Considere que o número diário de petições iniciais com erro processual (Y) seja descrito por regressão de Poisson em função de duas variáveis explicativas, X₁ e X₂.'],
 [96,'Uma análise de componentes principais envolvendo cinco variáveis métricas produziu autovalores: componente 1 = 11; componente 2 = 7; componente 3 = 4; componente 4 = 2; componente 5 = 1.'],
 [101,'Com relação à informática aplicada à estatística, julgue os itens a seguir.'],
 [110,'Julgue os itens seguintes a respeito de séries temporais.'],
 [116,'Acerca dos testes não paramétricos, julgue os itens que se seguem.'],
])
const decisions=[...records.values()].map(q=>{
 const e=catalog.questoes.find(x=>x.id===q.id),n=Number(q.numero_original),page=e?.pagina
 if(!e||!page||!topics.has(n))throw Error(`Item sem referência/página/classificação: ${q.id}`)
 const k=answerMap.get(n),anulada=k==='X',duplicate=duplicateToCanonical.has(q.id),fix=fixes.get(n),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topics.get(n)[0],conteudo:topics.get(n)[1],ano:2025,concurso,numero_original:n,pagina:page,dificuldade:[59,60,62,68,70,73,75,76,78,82,85,88,89,91,92,93,95,97,98,99,100,103,104,108,110,116,117,119].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade matemática, interpretação de modelos e integração de conceitos; a banca não publica dificuldade individual.',resposta_correta:anulada?null:k==='C'?0:1,anulada,gabarito_oficial:{fonte:gabarito,numero:n,pagina:1,resposta:k,sha256:keyDigest,hash_metodo:'SHA-256 da sequência oficial definitiva dos itens 51–120; X identifica item anulado.'},classificacao_fonte:prova,motivo:`Cebraspe/TRT 10ª Região, Cargo 7 (Estatística), prova aplicada em 16/03/2025. Item ${n}, página ${page}; conteúdo classificado conforme o enunciado e seu bloco temático oficial.`,...(duplicate?{apta_resolucao:false,duplicada_de:duplicateToCanonical.get(q.id),inelegibilidade_motivo:'Recorte OCR duplicado do mesmo item e caderno; mantida a versão canônica identificada no relatório.'}:{apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente']}),visual:{pagina:page,imagem:image,...(fix?.enunciado?{enunciado:fix.enunciado}:{}),texto_apoio:fix?.texto_apoio??contexts.get(n)??q.texto_apoio??'',motivo:fix?'Transcrição e apresentação conferidas com a página oficial; correção de OCR, fórmulas ou fragmentos de contexto.':'Página do caderno oficial vinculada para preservar tabelas, fórmulas, código e elementos visuais.'}}
})
if(decisions.length!==75)throw Error('Esperava 75 recortes OCR')
for(const page of new Set(decisions.map(x=>x.visual.pagina)))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({recortesOCR:75,itensOficiais:70,pendentesRevisados:decisions.filter(x=>records.get(x.id).classificacao_pendente&&!duplicateToCanonical.has(x.id)).length,duplicatasOCR:duplicateToCanonical.size,correcoesEnunciadoOuContexto:fixes.size,itensAnulados:decisions.filter(x=>x.anulada&&!duplicateToCanonical.has(x.id)).map(x=>x.numero_original),gabaritos:decisions.filter(x=>!duplicateToCanonical.has(x.id)).length,fonte:prova,gabarito},null,2));process.exit(0)}
const name='revisao-trt10-estatistica-2024-v251'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,recortesOCR:75,itensOficiais:70,duplicatasOCR:duplicateToCanonical.size,correcoesEnunciadoOuContexto:fixes.size,itensAnulados:[118],pendenciasRevisadas:decisions.filter(x=>records.get(x.id).classificacao_pendente&&!duplicateToCanonical.has(x.id)).length,publicado:false,fonte:prova,gabarito}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## TRT 10ª Região 2024 — Cargo 7: Estatística — v251\n\n- Revisei os 75 recortes do caderno, cobrindo os 70 itens oficiais 51–120. Classifiquei matéria e tópico por item em Estatística ou Informática; registrei a data de aplicação de 16/03/2025, dificuldade estimada, gabarito definitivo e referência à página original.\n- Corrigi enunciados/contextos contaminados e transcrições de fórmulas ou código nos itens 51, 54–56, 60–62, 64–65, 76, 81–82, 85–93, 97, 100, 103–108, 110, 112–113 e 115, 117–120, mantendo as tabelas e o código da questão 108 legíveis e associados às imagens originais.\n- Sinalizei cinco recortes duplicados (51, 54, 55, 61 e 62) como inelegíveis e preservei um canônico por item. O item 118 foi anulado no gabarito definitivo; mantive-o resolvível, sem correção automática.\n- Validação local: ${result.classificadas} registros revistos, ${result.novas_classificacoes} novas classificações, cinco duplicatas sinalizadas, ${result.contextos_visuais} referências visuais, ${result.total} registros, ${result.disponiveis} elegíveis e ${result.pendentes} pendências. Alteração local, ainda não publicada na nuvem.\n- Fontes oficiais: [caderno Cargo 7](https://cdn.cebraspe.org.br/concursos/trt10_24/arquivos/050_TRT10_007_01.pdf), [gabarito definitivo](https://cdn.cebraspe.org.br/concursos/trt10_24/arquivos/Gab_Definitivo_050_TRT10_007_01.pdf), [edital de abertura](https://cdn.cebraspe.org.br/concursos/trt10_24/arquivos/ED_1_2024_TRT_10_ABERTURA_ATUALIZADO.PDF), [página oficial do Cebraspe](https://www.cebraspe.org.br/concursos/TRT10_24).\n`)
console.log(JSON.stringify(out,null,2))
