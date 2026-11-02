import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-anp-2022-atividade6-regulacao-novas-atribuicoes-iii-v487'
const documento='e879b43a1c5160b2'
const prova='https://cdn.cebraspe.org.br/concursos/ANP_22_PSS/arquivos/725_ANP_006_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/anp_22_pss/arquivos/GAB_DEFINITIVO_725_ANP_006_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/anp_22_pss/arquivos/ED_1_2022_ANP_PSS_ABERTURA.PDF'
const concurso='ANP — Processo Seletivo Simplificado — Atividade 6 — Regulação de Novas Atribuições III — 2022'
const cargo='Atividade 6 — Regulação de Novas Atribuições III'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url.toLowerCase(),prova.toLowerCase())
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(pendentes.length,25)

const respostas=new Map()
for(const [inicio,linha] of [[51,'E E E E C C C C E C E E E C C C E C C E'],[71,'C E E C C E C C E E E C C E E C E C E C'],[91,'E C E E E C E E E C C C C C E C E E C C'],[111,'E E C C E C E E C E']])linha.split(/\s+/).forEach((x,i)=>respostas.set(inicio+i,x))
assert.equal(respostas.size,70)
const hashGabarito=hashRevisao([...respostas].map(([n,v])=>`${n}:${v}`).join('|'))

const dados={
61:['Economia','Microeconomia: preferências, bens complementares e curva de Engel','Considere-se um consumidor com função utilidade U(x,y) = min{2x, y}, em que x e y são as quantidades de dois bens. A renda é R, e os preços são Pₓ e Pᵧ. A curva de Engel do bem y é uma reta com coeficiente angular igual a 2/(Pₓ + 2Pᵧ).','Média',1],
62:['Economia','Organização industrial: oligopólio, liderança de preços e cartel','No modelo de oligopólio de liderança de preço, em que os produtos são homogêneos e as empresas seguidoras fixam preço igual ao da empresa líder, o lucro total das empresas é inferior ao lucro que seria obtido em um cartel.','Média',1],
64:['Economia','Regulação econômica: monopólio natural e preço de equilíbrio competitivo','Em um monopólio natural, se o órgão regulador determinar que o monopolista cobre preço equivalente ao que vigoraria no equilíbrio competitivo, o monopolista será incapaz de cobrir seus custos de produção.','Média',0],
66:['Economia','Teoria dos jogos: equilíbrio de Nash em estratégias mistas','Dois jogadores escolhem simultaneamente entre A1/A2 e B1/B2. Os ganhos (A, B) são: A1/B1 = (−50, −50); A1/B2 = (25, −25); A2/B1 = (−25, 25); A2/B2 = (0, 0). Nesse jogo, no equilíbrio de Nash em estratégias mistas, o jogador B tem 50% de chance de escolher B1 e 50% de escolher B2.','Média',0],
67:['Economia','Microeconomia: função custo e economias de escala','Considere uma empresa cuja função de custo de longo prazo seja C(q) = q³ − 10q² + 100q, em que q é a quantidade produzida. Nessa situação, a empresa incorre em economias de escala para qualquer nível de produção superior a 4,5 unidades.','Difícil',1],
70:['Estatística','Séries temporais: modelo autorregressivo e variância','Considere o modelo Xₜ = 2 + 0,2Xₜ₋₁ + aₜ, em que aₜ é ruído branco de média zero e variância 4, e suponha que E[Xₜ] = E[Xₜ₋₁] e Var(Xₜ) = Var(Xₜ₋₁). O desvio padrão da série temporal {Xₜ} é menor que 2.','Média',1],
73:['Estatística','Regressão e distribuição normal bivariada: previsão condicional','Se X₁₀ = 5, o valor projetado para a observação X₁₂, segundo o modelo em tela, será menor que 2.','Difícil',1],
74:['Estatística','Distribuição normal bivariada: variância da soma','Var(X + Y) < 5.','Difícil',0],
75:['Estatística','Regressão e distribuição normal bivariada: esperança matemática','A média de Y é igual a 1.','Média',0],
80:['Economia do petróleo','Indústria do petróleo: cadeia upstream e logística','As atividades de upstream são realizadas em áreas próximas dos centros de consumo dos derivados, devido à economia de escala.','Fácil',1],
85:['Economia','Falhas de mercado: bens públicos e eficiência de Pareto','Os bens públicos são produtos e serviços que permitem que uma economia opere com uma alocação Pareto-eficiente dos fatores de produção.','Média',1],
88:['Economia do petróleo','Indústria de gás natural: infraestrutura e monopólio natural','A extração de petróleo e o fornecimento de gás natural envolvem investimentos significativos e elevados riscos, que caracterizam o que se denomina monopólio natural.','Média',0],
89:['Economia','Regulação econômica: origem e função das agências reguladoras','As agências reguladoras surgiram no Brasil em um contexto de estatização de serviços públicos, como forma de regular a atuação direta do Estado na economia.','Média',1],
91:['Direito Administrativo','Agências reguladoras: regime jurídico e autonomia','O regime especial das agências reguladoras é conferido pela Constituição Federal, que define o rol de características básicas que essas autarquias devem possuir.','Média',1],
92:['Economia','Regulação de monopólio natural: custos, demanda e elasticidade','A regulação eficiente de preços em uma indústria que opera sob monopólio natural exige que o regulador conheça as funções de custo e de demanda e a elasticidade-preço da demanda da empresa regulada.','Difícil',0],
94:['Economia','Teoria da regulação: captura regulatória e interesse público','De acordo com a teoria da captura, as agências reguladoras devem observar os interesses da sociedade acima dos interesses das empresas reguladas.','Média',1],
97:['Direito Econômico','Defesa da concorrência: assimetria de informação','A assimetria de informação é irrelevante para o escopo da defesa da concorrência.','Média',1],
99:['Economia','Estruturas de mercado: concorrência monopolística e elasticidade','No mercado de concorrência monopolística, quanto maior a elasticidade-preço da demanda, maior o poder de mercado.','Média',1],
100:['Economia','Estruturas de mercado: concorrência perfeita e custos','Se o mercado operar em concorrência perfeita, o custo marginal será igual à receita média no ponto ótimo.','Média',0],
102:['Economia','Organização industrial: integração e concentração vertical e horizontal','A integração horizontal é uma estratégia de crescimento baseada na aquisição de duas ou mais sociedades que atuam no mesmo nível da cadeia produtiva.','Fácil',0],
106:['Informática','Microsoft Excel: função SOMASE e critérios','A fórmula =SOMASE(A1:A10;">10") soma, no intervalo A1:A10, os valores maiores que 10.','Fácil',0],
107:['Informática','Microsoft Excel: funções de procura PROCH e PROCV','A função PROCH permite buscar um valor em uma linha especificada de um intervalo organizado em colunas.','Fácil',1],
108:['Informática','Microsoft Excel: sintaxe e argumentos da função PROCV','O primeiro argumento da função PROCV é núm_índice_coluna, que representa a localização do intervalo do valor a ser procurado.','Média',1],
109:['Informática','Microsoft Excel: PROCV e correspondência aproximada','Na busca por correspondência aproximada com a função PROCV, os valores da primeira coluna da matriz devem estar classificados em ordem crescente.','Média',0],
110:['Informática','Microsoft Excel: PROCV e tipos de correspondência','A busca feita pela função PROCV pode usar correspondência aproximada ou correspondência exata.','Fácil',0]
}
const assertPage=async n=>{const q=pendentes.find(x=>x.numero===n);assert.ok(q);const img=`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`;await fs.access(`public/acervo-extraido/${img}`);return {q,img}}
const revisoes=[]
const remover=['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
for(const [numero,[materia,conteudo,enunciado,dificuldade,resposta]] of Object.entries(dados)){
 const n=Number(numero),{q,img}=await assertPage(n),key=respostas.get(n)
 assert.ok(key&&((key==='C'?0:1)===resposta),`Gabarito incompatível no item ${n}`)
 let contextos=[]
 if(n===70||n===73||n===74||n===75)contextos=[{pagina:1,imagem:`paginas/${documento}-0001.webp`,texto:'Modelo de série temporal Xₜ = 2 + 0,2Xₜ₋₁ + aₜ, com ruído branco de média zero e variância 4; o caderno também informa igualdade entre as esperanças e variâncias sucessivas.'},{pagina:2,imagem:`paginas/${documento}-0002.webp`,texto:'Para os itens 73 a 76, regressão condicional E[Y|X=x] = 1 − x; (X,Y) tem distribuição normal bivariada, E[X]=0, Var(Y)=4 e Var(X)=1.'}]
 if(n===107||n===108||n===109)contextos=[{pagina:2,imagem:`paginas/${documento}-0002.webp`,texto:'Bloco de itens sobre funções de busca do Microsoft Excel: PROCH e PROCV.'},{pagina:3,imagem:`paginas/${documento}-0003.webp`,texto:'Continuação do bloco de itens sobre a função PROCV no Microsoft Excel.'}]
 const apoioTexto=n===70?'Modelo definido no caderno: Xₜ = 2 + 0,2Xₜ₋₁ + aₜ; aₜ é ruído branco com média zero e variância 4.':(n>=73&&n<=75?'Texto-base: E[Y|X=x] = 1 − x; (X,Y) é normal bivariada; E[X]=0; Var(Y)=4; Var(X)=1.':(n===66?'Matriz de ganhos (A,B): A1/B1 (−50,−50); A1/B2 (25,−25); A2/B1 (−25,25); A2/B2 (0,0).':(n>=107&&n<=109?'Bloco comum: itens sobre funções PROCH e PROCV do Microsoft Excel.':'')))
 revisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2022,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 09/10/2022',cargo,numero:n,numero_original:n,pagina:q.pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial considerando as operações conceituais, cálculos e interpretação requeridos; não é índice psicométrico oficial.',resposta_correta:resposta,anulada:false,gabarito_oficial:{fonte:gabarito,arquivo:'Gabarito oficial definitivo CEBRASPE — ANP 2022 — Atividade 6',sha256:hashGabarito,numero:n,resposta:key,criterio:'Transcrição do gabarito definitivo publicado pelo CEBRASPE.'},classificacao_fonte:prova,motivo:'Classificação individual conferida com o enunciado, a página original, o edital e o escopo da Atividade 6; respostas cotejadas com o gabarito definitivo oficial.',enunciado,texto_apoio:apoioTexto,imagem_pagina:img,imagens_contexto:contextos,reemplazarContexto:true,visual:{pagina:q.pagina,imagem:img,enunciado,texto_apoio:apoioTexto,motivo:`Página ${q.pagina} do caderno oficial conferida visualmente; transcrição revisada e fórmulas/sinais reconstruídos quando presentes.`},apta_resolucao:true,remover_pendencias:remover})
}
assert.equal(revisoes.length,25)
assert.equal(new Set(revisoes.map(x=>x.id)).size,25)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:25,classificacoes:25,formulas_reconstruidas:[61,67,70,73,74,75],matriz_transcrita:66,contextos_compartilhados:7,gabarito_oficial_vinculado:true,paginas_conferidas:[1,2,3],publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:revisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,edital,concurso,registros_revisados:25,questoes_unicas_elegiveis:25,formulas_reconstruidas:[61,67,70,73,74,75],matriz_transcrita:66,paginas_conferidas:[1,2,3],gabarito_definitivo_vinculado:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(revisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## ANP 2022 — Atividade 6 — revisão v487\n\n- Revisei 25 itens pendentes de Economia, Economia do Petróleo, Estatística, Direito Administrativo, Direito Econômico e Informática, corrigindo conteúdo e filtros conforme o assunto de cada item.\n- Reconstruí em caracteres legíveis as fórmulas dos itens 61, 67, 70 e 73–75; transcrevi a matriz de ganhos do item 66 e associei as páginas visuais correspondentes.\n- Corrigi associações erradas de disciplina e removi contaminação de cabeçalho, itens vizinhos e texto-base estrangeiro dos enunciados atingidos.\n- Vinculei respostas do gabarito definitivo oficial; dificuldade registrada como estimativa editorial.\n- Pacote local; ainda não publicado na nuvem.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo](<${gabarito}>), [edital oficial](<${edital}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
