import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const documento='35d6fa3412a3a930'
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
const origem='tmp/revisao-profissional/revisao-fnde-formacao-2024-v120/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/antt_23/arquivos/951_ANTT_003_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/antt_23/arquivos/GAB_DEFINITIVO_951_ANTT_003_01.PDF'

// Transcrição do gabarito definitivo oficial por sequência de itens; X = anulado.
const chaves=[
 ...'E E C C E C E C E C E E E C E E C E C C'.split(' '),
 ...'E E E C E C E C E E C C E C C E C E X E'.split(' '),
 ...'C E C E E C E C X C E C E C C E C E E E'.split(' '),
 ...'C C C E C X E E E C C E E E E E C C E C'.split(' '),
 ...'E C E E C C E C C C C E E E C E C E E E'.split(' '),
 ...'C C C E E E C C E C E E C C C E C E C E'.split(' '),
]
// A sequência acima é conferida por linha do PDF. Ajuste explícito das decisões
// pós-recursos conforme a tabela oficial de justificativas do CEBRASPE.
if(chaves.length!==120)throw Error(`Gabarito com ${chaves.length} itens`)
chaves[38]='X';chaves[48]='X';chaves[65]='X';chaves[71]='E';chaves[74]='E'

const faixas=(lista,n)=>lista.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const materias=[
 [[1,46],'Economia'],[[47,49],'Matemática Financeira'],[[50,62],'Economia'],
 [[63,77],'Estatística'],[[78,84],'Econometria'],[[85,92],'Economia'],
 [[93,101],'Matemática Financeira'],[[102,102],'Economia'],[[103,120],'Estatística'],
]
const conteudos=[
 [[1,6],'Macroeconomia — modelo IS-LM, juros, demanda agregada e política fiscal'],
 [[7,12],'Macroeconomia aberta — câmbio, oferta agregada, desemprego e modelo Mundell-Fleming'],
 [[13,14],'Moeda, agregados monetários e base monetária'],
 [[15,16],'Sistema financeiro internacional, acordos de Basileia e comércio internacional'],
 [[17,19],'Microeconomia — preferências, utilidade, restrição orçamentária e escolha do consumidor'],
 [[20,21],'Microeconomia — função de produção, produtividade e rendimentos de escala'],
 [[22,24],'Microeconomia — custos, receita e oferta da firma competitiva'],
 [[25,27],'Microeconomia — equilíbrio geral, caixa de Edgeworth e teoremas do bem-estar'],
 [[28,32],'Microeconomia — estruturas de mercado, externalidades e bens públicos'],
 [[33,34],'Contas nacionais — PIB real, PIB nominal, deflator e produto'],
 [[35,36],'Balanço de pagamentos, transações externas e reservas internacionais'],
 [[37,38],'Economia monetária — multiplicador monetário e operações de mercado aberto'],
 [[39,43],'Macroeconomia — Mundell-Fleming, senhoriagem, multiplicador keynesiano e IS-LM'],
 [[44,46],'Economia do setor público e regulação — externalidades, monopólio natural e grupos de interesse'],
 [[47,49],'Matemática financeira — SAC, séries uniformes e taxas efetivas'],
 [[50,52],'Regulação econômica — regulação responsiva e sandbox regulatório da ANTT'],
 [[53,61],'Economia brasileira — desenvolvimento, industrialização, política cafeeira e planos econômicos'],
 [[62,62],'Economia brasileira — Plano de Metas e desenvolvimentismo'],
 [[63,70],'Probabilidade — variáveis aleatórias, distribuições, esperança e distribuição conjunta'],
 [[71,72],'Estatística inferencial — distribuição amostral, teorema central do limite e lei dos grandes números'],
 [[73,77],'Estatística inferencial — estimação, intervalos de confiança e testes de hipóteses'],
 [[78,82],'Econometria — cointegração, regressão linear, séries temporais e autocorrelação'],
 [[83,84],'Economia matemática — matriz insumo-produto e modelo de Leontief'],
 [[85,86],'Microeconomia — função utilidade, elasticidade-renda e substituição entre bens'],
 [[87,88],'Microeconomia — monopólio, demanda, receita e maximização de lucro'],
 [[89,92],'Microeconomia — concorrência perfeita, custos e funções de produção'],
 [[93,94],'Matemática financeira — juros simples e taxas equivalentes'],
 [[95,96],'Matemática financeira — capitalização composta e taxas efetivas'],
 [[97,98],'Matemática financeira — sistemas de amortização SAC e Price'],
 [[99,99],'Matemática financeira — títulos, cupons e valor de resgate'],
 [[100,101],'Matemática financeira — fluxo de caixa, valor presente e taxa interna de retorno'],
 [[102,102],'Finanças — CAPM, risco e variância de carteira'],
 [[103,108],'Estatística descritiva — média, quartis, moda, desvio padrão e gráficos'],
 [[109,113],'Amostragem — estratificação, alocação e probabilidades de seleção'],
 [[114,120],'Probabilidade — eventos, independência, união, interseção e experimentos aleatórios'],
]
const contexto=[
 [[1,6],'Comando: considere o modelo IS-LM com o Banco Central fixando a quantidade de moeda e julgue os itens sobre juros, política fiscal e demanda agregada.'],
 [[7,12],'Comando: julgue os itens de macroeconomia aberta, considerando câmbio, mobilidade de capitais, oferta agregada e desemprego.'],
 [[13,14],'Comando: julgue os itens sobre contas do sistema monetário e agregados monetários.'],
 [[15,16],'Comando: julgue os itens sobre acordos e organismos internacionais.'],
 [[17,19],'Situação: consumidor distribui renda R entre x unidades do bem X e y do bem Y, com preços pₓ e pᵧ, maximizando u(x,y) sob pₓx + pᵧy ≤ R; preferências racionais, monotônicas e contínuas.'],
 [[20,21],'Situação: firma usa K unidades de capital e L de trabalho, com função de produção q(K,L)=√(KL); compare curto e longo prazos e os rendimentos de escala.'],
 [[22,24],'Situação: firma competitiva produz q unidades com custo total C=1.200+30q+3q².'],
 [[25,27],'Situação e figura: caixa de Edgeworth com dois agentes, A e B, e bens X e Y; dotação inicial de A: 7 unidades de X e 8 de Y; de B: 5 de X e 3 de Y. A figura original da página 2 acompanha os itens.'],
 [[28,32],'Comando: julgue os itens sobre concorrência imperfeita, monopólio de rodovia, externalidade de ruído e classificação de bens públicos.'],
 [[33,34],'Base: tabela de bens finais x, y e z produzidos em 2020, 2021 e 2022, com quantidades e preços indicados na imagem original da página 3.'],
 [[35,36],'Base: tabela de transações externas (importações, exportações, doações, empréstimos, investimento direto, juros e fretes) reproduzida na imagem original da página 3.'],
 [[37,38],'Comando: julgue os itens de economia monetária sobre multiplicador e venda de títulos públicos pelo Banco Central.'],
 [[39,43],'Comando: julgue os itens de teoria macroeconômica sobre Mundell-Fleming, senhoriagem, modelo keynesiano e IS-LM.'],
 [[44,46],'Comando: julgue os itens sobre teorema de Coase, regulação de monopólio natural e captura regulatória.'],
 [[47,49],'Comando: julgue os itens de matemática financeira. Item 47: principal R$ 100.000, SAC em 120 meses, taxa efetiva anual 5%; a expressão proposta está preservada na imagem original da página 4. Item 48: empréstimo R$ 10.000, taxa efetiva mensal 3%, 10 prestações iguais; fórmula original visível na mesma página. Item 49: taxa nominal anual 24%, capitalização mensal.'],
 [[50,52],'Comando: julgue os itens sobre teoria da regulação responsiva e sandbox regulatório da Agência Nacional de Transportes Terrestres.'],
 [[53,61],'Comando: julgue os itens sobre economia brasileira, crescimento, industrialização, crise de 1929, política cafeeira e planos de estabilização; os textos-base completos constam nas páginas originais 4 e 5.'],
 [[62,62],'Comando: julgue o item sobre as áreas de investimento do Plano de Metas do governo Juscelino Kubitschek.'],
 [[63,63],'Se X tem distribuição exponencial de parâmetro unitário e U=1−e^(−X), julgue a distribuição de U.'],
 [[64,64],'Experimento: lançar quatro vezes uma moeda balanceada; julgue o tamanho do espaço amostral de sequências.'],
 [[65,65],'Densidade apresentada no caderno: f(x)= (5/2)x⁴ para −1≤x≤1, e f(x)=0 fora desse intervalo. Julgue a probabilidade P(−1/2≤X<1/4)=33/2048.'],
 [[66,66],'X tem densidade fₓ(x)=(3/2)e^(−3|x|), x∈ℝ, e Y=X². A expressão da densidade transformada é mostrada na página original 5; o item foi anulado oficialmente.'],
 [[67,67],'Experimento: dado balanceado lançado quatro vezes; o item propõe uma probabilidade para ocorrências de resultado não maior que 2 em duas tentativas. A fração originalmente proposta está na imagem da página 5.'],
 [[69,70],'Base: função massa de probabilidade conjunta de X e Y na tabela da página original 5. As células são: X=0: 1/16, 1/6, 1/8; X=1: 1/16, 1/16, 1/8; X=2: 1/6, 1/6, 1/16, para Y=2,3,4.'],
 [[71,72],'Comando: julgue os itens com base no teorema central do limite e na lei dos grandes números; valores críticos e expressões constam na página original 5.'],
 [[73,77],'Comando: julgue os itens sobre inferência estatística, estimadores, erros de teste, verossimilhança, variância amostral e intervalos de confiança; dados completos nas páginas 5 e 6.'],
 [[78,82],'Comando: julgue os itens sobre regressão linear e séries temporais. No item 80, o modelo AR(2) é Xₜ=((3√2−4)/6)Xₜ₋₁+(√2/3)Xₜ₋₂+εₜ, εₜ~N(0,1).'],
 [[83,84],'Modelo insumo-produto: x=Mx+d; M tem linhas (0,5; 0,5; 0,1), (0,1; 0,35; 0,4), (0,1; 0,1; 0,35), e demanda final d=(1,1,2)ᵀ. A página 6 contém a matriz original.'],
 [[85,86],'Situação: consumidor distribui renda entre X e Y segundo u(x,y)=x+√y, com preços pₓ e pᵧ; julgue elasticidade-renda e substituição entre bens.'],
 [[87,88],'Situação: companhia aérea monopolista enfrenta demanda inversa p=1.600−2,5q, custo C=100+5q e capacidade máxima de 160 passageiros por voo.'],
 [[89,89],'Situação: firma competitiva tem C=3x²+17x+768; sua curva de oferta coincide com o custo marginal a partir do mínimo do custo médio.'],
 [[90,92],'Situação: função de produção x=√(KL), custos unitários r=0,16 e w=100. No curto prazo K₀=2.025; compare custos e elasticidade de substituição.'],
 [[93,94],'Situação: empréstimo sob juros simples à taxa de 6% ao mês; julgue o tempo para dobrar o capital e a taxa bimestral equivalente.'],
 [[95,96],'Situação: depósito de R$ 10.000 rende 10,8% ao ano com capitalização mensal. A expressão com logaritmos do item 95 aparece na imagem original da página 7; no item 96, compare a taxa anual com (1,009)¹².'],
 [[97,98],'Situação: financiamento imobiliário de R$ 600.000, em 20 anos, com prestações mensais, taxa de 0,75% ao mês e amortização SAC ou Price.'],
 [[99,99],'Situação: título de R$ 12.000 paga cupons semestrais de 6%; primeiro cupom em seis meses e prazo de cinco anos.'],
 [[100,101],'Situação: concessão prevê recebimentos de R$ 60 milhões anuais nos anos 1 a 20 e desembolsos de R$ 100 milhões nos anos 0, 5, 10 e 15. Valores reais, sem inflação; expressões completas nas páginas originais.'],
 [[102,102],'Situação: carteira CAPM investida 60% no ativo A e 40% no B. Variâncias σ²_A e σ²_B e correlação ρ_AB; a figura original traz a expressão da variância da carteira.'],
 [[103,108],'Base: conjunto {0,1,1,1,1,2,3,3,3,7}; julgue média, box-plot, gráfico de pontos, moda, quartil e desvio padrão. As duas representações gráficas originais estão na página 8.'],
 [[109,113],'Base: população de 20 elementos dividida nos estratos A={1,...,6}, B={7,...,16}, C={17,...,20}; desvios padrão 5, 3 e 10; amostragem sem reposição. Tabela original na página 8.'],
 [[114,116],'Experimento: caixa com 10 esferas indistinguíveis, 6 de aço inoxidável e 4 de aço comum; julgue probabilidades sob os procedimentos descritos.'],
 [[117,120],'Comando: E₁ e E₂ são mutuamente excludentes; E₁ e E₃ são independentes; 0<P(Eₖ)<1 para k∈{1,2,3,4}. Julgue as propriedades de eventos.'],
]
const correcoesTexto={
 16:'Existe a prática de dumping quando a oferta de um produto no mercado internacional ocorre a um preço inferior ao praticado no país exportador.',
 20:'No curto prazo, fixado o valor do capital, apesar de o produto q crescer sempre que L cresce, vale a lei dos rendimentos decrescentes.',
 21:'No longo prazo, a empresa apresenta rendimentos decrescentes de escala, pois, ao se multiplicarem por m as quantidades de todos os recursos investidos na produção, o produto será multiplicado por √m.',
 47:'Considere um financiamento de R$ 100.000 amortizado pelo sistema de amortização constante (SAC). Se o prazo for de 120 meses e a taxa efetiva anual for de 5%, o valor da última prestação será dado por (100.000/120)×(1,05)^(1/12).',
 48:'Para um empréstimo de R$ 10.000, com taxa efetiva de juros de 3% ao mês e amortização em 10 prestações iguais e sucessivas, o valor da prestação é dado por [0,03×(1,03)^10]/[(1,03)^10−1]×10.000.',
 49:'A taxa efetiva anual de juros obtida a partir de uma taxa nominal de 24% ao ano, capitalizada mensalmente, é igual a (1,02)^12.',
 63:'Se X é uma variável aleatória exponencial de parâmetro unitário e U=1−e^(−X), então U é uma variável aleatória uniforme no intervalo [0,1].',
 65:'Considere que X seja uma variável aleatória contínua com densidade f(x)=(5/2)x⁴ para x∈[−1,1] e f(x)=0 para x∉[−1,1]. Nessa situação, P(−1/2≤X<1/4)=33/2048.',
 66:'Suponha que X seja uma variável aleatória contínua com densidade fₓ(x)=(3/2)e^(−3|x|), para todo x∈ℝ. Se Y=X², então a função densidade de probabilidade de Y proposta no item é g(y)=[3/(4√y)]e^(−3√y), para todo y>0. Item anulado no gabarito definitivo.',
 67:'Em um dado balanceado lançado quatro vezes, a probabilidade de que o resultado não seja maior que 2 em exatamente duas tentativas é 2⁴/3⁴.',
 69:'As distribuições de X e Y são independentes.',
 70:'P(X=2)=19/48.',
 71:'Considere X₁,...,Xₙ independentes e identicamente distribuídas segundo uma distribuição exponencial de parâmetro λ=1/2, e X̄=(X₁+...+Xₙ)/n. Para que P(1,5≤X̄≤2,5)≥0,95, é necessário que n≥62.',
 80:'O processo autorregressivo Xₜ=((3√2−4)/6)Xₜ₋₁+(√2/3)Xₜ₋₂+εₜ, com εₜ~N(0,1), é estacionário.',
 83:'Para atender à demanda final d, a produção total do produto com demanda d₁ deve ser o dobro da produção total do produto com demanda d₃.',
 84:'O vetor de produção pode ser calculado por x=M⁻¹d.',
 87:'O lucro máximo é obtido com menos de 50% da lotação máxima do voo.',
 88:'O custo total de um voo lotado é de 144.000 unidades monetárias.',
 89:'A curva de oferta da referida empresa se inicia em x=16.',
 91:'Em uma análise de longo prazo, o custo C é função linear da produção x.',
 92:'A função de produção é equivalente a uma função CES com elasticidade de substituição tendendo ao infinito.',
 93:'O montante será o dobro do capital em menos de um ano.',
 94:'A taxa de juros bimestral equivalente à taxa contratada é de 12,36%.',
 95:'A aplicação financeira levará, pelo menos, (⌊log(1,8)/log(1,009)⌋+1) meses para atingir R$ 18.000, considerando ⌊x⌋ como o menor inteiro mais próximo de x.',
 96:'A taxa de juros anual efetiva que Pedro receberá pode ser calculada corretamente por (1,009)^12.',
 100:'A taxa interna de retorno é a taxa x que iguala desembolsos e recebimentos a valor presente: Σₜ₌₁²⁰ 60/(1+x)^t = Σₜ₌₀³ 100/(1+x)^(5t).',
 101:'Se a taxa de desconto da concessionária for r, o valor presente dos desembolsos será Σₜ₌₀³ 100/(1+r)^(5t), em milhões de reais.',
 102:'A variância da carteira é 0,36σ²_A+0,48ρ_ABσ_Aσ_B+0,16σ²_B, em que ρ_AB é a correlação entre os retornos dos ativos A e B.',
 118:'E₁⊂E₂.',
}
const ids=new Set()
for(const q of pendentes){const n=Number(q.numero_original??q.numero);if(ids.has(q.id))throw Error(`ID duplicado: ${q.id}`);ids.add(q.id);if(!faixas(materias,n)||!faixas(conteudos,n)||!faixas(contexto,n))throw Error(`Item ${n} sem filtro/contexto`);if(n<1||n>120)throw Error(`Número fora da prova: ${n}`)}
if(pendentes.length!==94)throw Error(`A lista viva mudou: esperado 94, encontrado ${pendentes.length}`)
const decisoes=pendentes.map(q=>{
 const n=Number(q.numero_original??q.numero),valor=chaves[n-1],anulada=valor==='X',mat=faixas(materias,n),cont=faixas(conteudos,n),ctx=faixas(contexto,n)
 const p={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:mat,conteudo:cont,ano:2024,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial para item da prova objetiva CEBRASPE; não é classificação psicométrica publicada pela banca.',resposta_correta:anulada?null:valor==='C'?0:1,anulada,gabarito_oficial:{valor,fonte:gabarito,metodo:'Gabarito definitivo CEBRASPE por caderno 951_ANTT_003_01; correções pós-recursos conferidas nas justificativas oficiais.'},classificacao_fonte:prova,visual:{pagina:q.pagina,imagem:`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:ctx,motivo:`Página ${q.pagina} do caderno oficial ANTT, Cargo 3 — Economia, conferida visualmente; a imagem mantém gráficos, tabelas e fórmulas originais do item ${n}.`},motivo:`ANTT 2024, prova objetiva do Cargo 3 — Especialista em Regulação de Serviços de Transportes Terrestres, especialidade Economia. Classificação individual pelo enunciado e pelo comando do bloco; aplicação em 14/04/2024.`}
 if(correcoesTexto[n])p.enunciado=correcoesTexto[n]
 return p
})
const nome='revisao-antt-cargo3-economia-2024-v121'
const rel=await aplicarRevisoesIndividuais({nome,base:origem,decisoes})
const raiz=`tmp/revisao-profissional/${nome}/acervo-extraido`;raizesAtuais.unshift(raiz)
const arquivo='scripts/acervo-publico/acervo-atual.mjs';let atual=await fs.readFile(arquivo,'utf8');if(!atual.includes(`raizesAtuais.unshift('${raiz}')`))atual=atual.replace('export async function lerArquivoAtual',`raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`);await fs.writeFile(arquivo,atual)
const reportPath='docs/acervo/revisao-profissional/RELATORIO.md';let report=await fs.readFile(reportPath,'utf8')
report+=`\n\n## Revisão do caderno v121 — ANTT, Cargo 3 (Economia), aplicação de 2024\n\n- Revisei ${rel.classificadas} itens pendentes do caderno. Corrigi a matéria indevidamente marcada como Informática em questões de macroeconomia, mapeei os conteúdos por bloco e passei o ano de edital 2023 para ano de aplicação 2024.\n- Vinculei o gabarito definitivo; itens 39, 49 e 66 anulados permanecem sem resposta automática; alterações oficiais dos itens 72 e 75 foram aplicadas como Errado. Incluí nível médio como estimativa editorial.\n- Conferi visualmente as oito páginas originais e associei a página correta a cada item, preservando a caixa de Edgeworth, tabelas, gráficos, matrizes, funções e fórmulas. Reconstruí expressões que o OCR havia corrompido, incluindo a função de produção, probabilidades, AR(2), juros, fluxo de caixa/TIR, CAPM e operações de amostragem.\n- Validação local: ${rel.classificadas} itens classificados; total ${rel.total}, disponíveis ${rel.disponiveis}, pendências elegíveis ${rel.pendentes}; ${rel.lotes_alterados} lotes atualizados e facetas recalculadas.\n- Fontes: [caderno oficial CEBRASPE/ANTT Cargo 3](https://cdn.cebraspe.org.br/concursos/antt_23/arquivos/951_ANTT_003_01.PDF), [gabarito definitivo oficial](https://cdn.cebraspe.org.br/concursos/antt_23/arquivos/GAB_DEFINITIVO_951_ANTT_003_01.PDF) e [justificativas oficiais de alteração e anulação](https://cdn.cebraspe.org.br/concursos/antt_23/arquivos/ANTT_23_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO.PDF).\n- Estado: v121 integrado localmente; não publicado no Cloudflare. A revisão integral do corpus continua.\n`
await fs.writeFile(reportPath,report)
console.log(JSON.stringify({...rel,validas:decisoes.filter(d=>!d.anulada).length,anuladas:decisoes.filter(d=>d.anulada).length,doc:documento}))
