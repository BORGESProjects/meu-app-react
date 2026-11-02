import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisar-bnb-2018-analista-bancario-pendencias-v437'
const doc='80c5650049644280'
const prova='https://cdn.cebraspe.org.br/concursos/BANCO_DO_NORDESTE_18/arquivos/MATRIZ_424_BNB002__PAG_6.PDF'
const gabarito='https://www.bnb.gov.br/documents/45807/73822/Gabarito%2BAnalista%2BBanc%C3%A1rio%2B1%2B2018.pdf/e7b0486b-d482-3af9-f36f-6695b0d4534a?t=1642167566229&version=1.0'
const concurso='Banco do Nordeste 2018 — Analista Bancário 1'
const aplicacao='02/12/2018'
const entries=[
 [2,'Português','Interpretação e compreensão textual: aprendizagem de máquina e detecção de fraudes','Média'],
 [3,'Português','Tipologia textual: reconhecimento do tipo narrativo','Fácil'],
 [5,'Português','Semântica: substituição verbal e preservação de sentido','Média'],
 [7,'Português','Pontuação e interpretação: valor explicativo dos travessões','Média'],
 [12,'Português','Reescrita de texto: correção gramatical e preservação de sentido','Média'],
 [13,'Português','Reescrita de texto: regência e emprego da crase','Média'],
 [14,'Português','Reescrita de texto: colocação de oração adverbial e pontuação','Média'],
 [15,'Português','Reescrita de texto: pontuação, coesão e manutenção do sentido','Média'],
 [17,'Português','Interpretação textual: inferência de informação não expressa','Média'],
 [21,'Português','Pontuação: isolamento de oração intercalada','Média'],
 [24,'Português','Semântica e classes de palavras: sentido contextual de “regular”','Média'],
 [25,'Português','Semântica textual: valor adversativo de conjunção','Fácil'],
 [26,'Conhecimentos Gerais','Relações internacionais: Coreias e cúpula intercoreana de 2018','Média'],
 [27,'Conhecimentos Gerais','Relações internacionais: inserção diplomática da Coreia do Norte','Média'],
 [28,'Conhecimentos Gerais','Relações internacionais: Coreia do Norte e Estados Unidos','Média'],
 [29,'Conhecimentos Gerais','História contemporânea: formação política da Coreia do Norte','Média'],
 [30,'Conhecimentos Gerais','Geopolítica: regimes políticos e proliferação nuclear','Média'],
 [31,'Conhecimentos Gerais','Economia internacional: industrialização e crescimento da Coreia do Sul','Média'],
 [32,'Conhecimentos Gerais','Nordeste brasileiro: clima, literatura regional e questões socioambientais','Média'],
 [33,'Conhecimentos Gerais','Nordeste brasileiro: indústria da seca e políticas regionais','Média'],
 [34,'Conhecimentos Gerais','Geografia econômica: MATOPIBA e fronteira agrícola','Média'],
 [35,'Conhecimentos Gerais','Geografia econômica: agricultura e produção de uva e trigo na Bahia','Média'],
 [36,'Conhecimentos Gerais','Geografia urbana e econômica: regiões metropolitanas do Nordeste','Fácil'],
 [37,'Conhecimentos Gerais','Migrações internas e ciclos econômicos do Nordeste','Média'],
 [38,'Conhecimentos Gerais','Banco do Nordeste: FNE, balanço institucional e Acordo de Basileia','Difícil'],
 [39,'Conhecimentos Gerais','Banco do Nordeste: finalidade e destinação dos recursos do FNE','Fácil'],
 [41,'Conhecimentos Gerais','Desenvolvimento regional: finalidade e aplicação do FDNE','Fácil'],
 [42,'Conhecimentos Gerais','FDNE e responsabilidade fiscal: financiamento de programas subnacionais','Média'],
 [43,'Conhecimentos Gerais','Banco do Nordeste: destinação setorial dos recursos do FNE','Média'],
 [44,'Conhecimentos Gerais','Banco do Nordeste: operações de crédito e índice de Basileia','Média'],
 [45,'Conhecimentos Gerais','Agricultura familiar: financiamento no semiárido','Média'],
 [46,'Conhecimentos Gerais','Programas de ciência, tecnologia e inovação do BNB','Média'],
 [63,'Conhecimentos Bancários','FNE: área de atuação da SUDENE e beneficiários elegíveis','Média'],
 [64,'Conhecimentos Bancários','FNE: fontes de recursos e incidência de IOF','Difícil'],
 [65,'Conhecimentos Bancários','Operações de crédito: crédito direto ao consumidor (CDC)','Fácil'],
 [66,'Conhecimentos Bancários','Operações de crédito: desconto comercial simples de duplicatas','Média'],
 [67,'Conhecimentos Bancários','Crédito rural: finalidade de investimento e custeio','Média'],
 [68,'Conhecimentos Bancários','Análise de crédito: C de colateral e garantias','Fácil'],
 [69,'Conhecimentos Bancários','Análise de crédito: C de capital e capacidade financeira','Média'],
 [70,'Conhecimentos Bancários','Sistema Financeiro Nacional: competências do Banco Central','Difícil'],
 [71,'Conhecimentos Bancários','Instituições financeiras públicas: operações de crédito com controladas','Média'],
 [72,'Conhecimentos Bancários','Sistema Financeiro Nacional: sociedade de crédito a microempreendedor','Difícil'],
 [73,'Conhecimentos Bancários','Microcrédito: finalidade e público atendido','Fácil'],
 [74,'Conhecimentos Bancários','Microcrédito: garantias fidejussórias e risco','Média'],
 [75,'Conhecimentos Bancários','Conta-corrente: abertura e identificação do depositante','Média'],
 [76,'Conhecimentos Bancários','Conta-corrente: cancelamento de débito automático','Média'],
 [77,'Conhecimentos Bancários','Conta-corrente: encerramento e obrigações contratuais','Média'],
 [78,'Conhecimentos Bancários','CCF: procedimento para exclusão de registro','Média'],
 [79,'Conhecimentos Bancários','CCF: prazo para comando de exclusão pelo banco','Média'],
 [80,'Conhecimentos Bancários','Depósitos à vista: remuneração e vantagens oferecidas','Média'],
 [81,'Conhecimentos Bancários','Depósitos a prazo: diferenças entre RDB e CDB','Média'],
 [82,'Conhecimentos Bancários','Caderneta de poupança: remuneração e aniversário do depósito','Média'],
 [83,'Conhecimentos Bancários','Títulos de capitalização e caderneta de poupança','Média'],
 [85,'Conhecimentos Bancários','Previdência privada: escolha entre PGBL e VGBL e regime tributário','Média'],
 [86,'Conhecimentos Bancários','Previdência privada e seguro de vida: cobertura e dedução fiscal','Difícil'],
 [87,'Conhecimentos Bancários','Compensação bancária: COMPE e compensação interbancária','Média'],
 [88,'Conhecimentos Bancários','Depósito de cheque: bloqueio e prazo de compensação','Média'],
 [89,'Conhecimentos Bancários','Sistema de Pagamentos Brasileiro: liquidação de títulos públicos no SELIC','Média'],
 [90,'Conhecimentos Bancários','Sistema de Pagamentos Brasileiro: Sistema de Transferência de Reservas','Difícil'],
 [91,'Conhecimentos Bancários','Garantias fidejussórias: aval, fiança e benefício de ordem','Média'],
 [92,'Conhecimentos Bancários','Garantias fidejussórias: outorga conjugal','Difícil'],
 [93,'Conhecimentos Bancários','Títulos de crédito: cheque pré-datado e apresentação antecipada','Média'],
 [94,'Conhecimentos Bancários','Títulos de crédito: prazo de apresentação do cheque','Fácil'],
 [95,'Conhecimentos Bancários','Títulos de crédito: nota promissória e indicação do credor','Média'],
 [96,'Conhecimentos Bancários','Títulos de crédito: emissão de triplicata','Fácil'],
 [105,'Matemática','Funções logarítmicas: equação e determinação das soluções','Média'],
 [106,'Matemática','Função quadrática: concavidade e existência de valor mínimo','Fácil'],
 [107,'Matemática','Divisibilidade e mínimo múltiplo comum: resto em divisões sucessivas','Média'],
 [109,'Matemática','Análise combinatória: permutação com elementos adjacentes','Média'],
 [110,'Matemática','Análise combinatória: permutação com alternância de grupos','Média'],
 [111,'Matemática','Probabilidade binomial: número mínimo de acertos em 16 tentativas','Difícil'],
 [112,'Matemática','Análise combinatória: número de arestas de um grafo completo','Fácil'],
 [113,'Matemática','Média ponderada: composição de pesos percentuais sucessivos','Média'],
 [114,'Matemática','Proporcionalidade composta: produtividade de caixas e atendimento','Média'],
 [116,'Matemática','Proporcionalidade inversa: velocidade de digitação e tempo','Fácil'],
 [117,'Matemática Financeira','Custo efetivo total (CET): comparação entre financiamentos','Média'],
 [118,'Matemática Financeira','Taxas de juros real e aparente: relação com a inflação','Média'],
 [119,'Matemática Financeira','Juros compostos: prazo de capitalização e uso de logaritmos','Média'],
 [120,'Matemática Financeira','Sistema de Amortização Constante (SAC): cálculo de prestação','Média']
]
const keys={2:'C',3:'C',5:'X',7:'E',12:'X',13:'E',14:'C',15:'E',17:'E',21:'E',24:'E',25:'E',26:'E',27:'E',28:'E',29:'E',30:'E',31:'C',32:'E',33:'E',34:'C',35:'C',36:'C',37:'E',38:'E',39:'C',41:'E',42:'E',43:'C',44:'E',45:'C',46:'C',63:'C',64:'E',65:'C',66:'C',67:'E',68:'C',69:'E',70:'C',71:'X',72:'E',73:'C',74:'X',75:'C',76:'E',77:'E',78:'E',79:'C',80:'E',81:'C',82:'E',83:'C',85:'E',86:'E',87:'C',88:'E',89:'C',90:'C',91:'C',92:'C',93:'E',94:'E',95:'C',96:'C',105:'C',106:'E',107:'C',109:'E',110:'C',111:'E',112:'E',113:'E',114:'E',116:'E',117:'E',118:'C',119:'E',120:'C'}
const proofText1='Texto 2A1-I — A aprendizagem de máquina para detecção de fraude em compras online é treinada com exemplos de transações legítimas e ilegítimas; depois, avalia transações reais e combina características como valores médios, horários, uso de celular, pontos e estabelecimentos para estimar a probabilidade de fraude. O texto também explica o risco de falsos positivos e a necessidade de equilibrar os exemplos usados no treinamento. Fonte indicada no caderno: Correio Braziliense, 1.º/10/2018 (com adaptações).'
const proofText2='Texto 2A1-II — O texto descreve a presença de analistas humanos em sistemas de aprendizagem de máquina e apresenta um exemplo hipotético que associa consumo de café e adoçante ao índice de massa corporal, destacando que uma correlação pode levar a uma inferência causal incorreta. Também afirma que o sistema pode reduzir falsos positivos e custos, sem eliminar a necessidade de avaliação humana. Fonte indicada no caderno: Correio Braziliense, 1.º/10/2018 (com adaptações).'
const articleKoreas='Texto-base: notícia sobre a visita do presidente sul-coreano Moon Jae-in ao Monte Paektu com Kim Jong-un, durante a cúpula intercoreana em Pyongyang, em setembro de 2018. Fonte indicada no caderno: O Estado de S. Paulo, 20/9/2018 (com adaptações).'
const contexts={
 2:proofText1,3:proofText1,5:proofText1,7:proofText1,12:proofText1,13:proofText1,14:proofText1,15:proofText1,
 17:proofText2,21:proofText2,24:proofText2,25:proofText2,
 26:articleKoreas,27:articleKoreas,28:articleKoreas,29:articleKoreas,30:articleKoreas,
 32:'Comando do caderno: considerando as diversas temáticas que envolvem a região Nordeste do Brasil, julgue o item.',
 33:'Comando do caderno: considerando as diversas temáticas que envolvem a região Nordeste do Brasil, julgue o item.',
 34:'Comando do caderno: considerando as diversas temáticas que envolvem a região Nordeste do Brasil, julgue o item.',
 35:'Comando do caderno: considerando as diversas temáticas que envolvem a região Nordeste do Brasil, julgue o item.',
 36:'Comando do caderno: considerando as diversas temáticas que envolvem a região Nordeste do Brasil, julgue o item.',
 37:'Comando do caderno: considerando as diversas temáticas que envolvem a região Nordeste do Brasil, julgue o item.',
 38:'Comando do caderno: a respeito do Banco do Nordeste, de seus programas de desenvolvimento regional e dos fundos FNE e FDNE, julgue os itens.',
 39:'Comando do caderno: a respeito do Banco do Nordeste, de seus programas de desenvolvimento regional e dos fundos FNE e FDNE, julgue os itens.',
 41:'Comando do caderno: a respeito do Banco do Nordeste, de seus programas de desenvolvimento regional e dos fundos FNE e FDNE, julgue os itens.',
 42:'Comando do caderno: a respeito do Banco do Nordeste, de seus programas de desenvolvimento regional e dos fundos FNE e FDNE, julgue os itens.',
 43:'Comando do caderno: no que se refere aos programas financiados pelo Banco do Nordeste, julgue o item.',
 44:'Comando do caderno: no que se refere aos programas financiados pelo Banco do Nordeste, julgue o item.',
 45:'Comando do caderno: no que se refere aos programas financiados pelo Banco do Nordeste, julgue o item.',
 46:'Comando do caderno: no que se refere aos programas financiados pelo Banco do Nordeste, julgue o item.',
 63:'Comando do caderno: com relação ao FNE, julgue os itens. A área de atuação da SUDENE e os municípios abrangidos são relevantes para identificar os beneficiários.',
 64:'Comando do caderno: com relação ao FNE, julgue os itens.',
 65:'Comando do caderno: com relação às operações de crédito realizadas pelas instituições financeiras, julgue os itens.',
 66:'Comando do caderno: com relação às operações de crédito realizadas pelas instituições financeiras, julgue os itens.',
 67:'Comando do caderno: com relação às operações de crédito realizadas pelas instituições financeiras, julgue os itens.',
 68:'Comando do caderno: acerca dos elementos e requisitos dos Cs de crédito — caráter, capacidade, capital, colateral e condições —, julgue os itens.',
 69:'Comando do caderno: acerca dos elementos e requisitos dos Cs de crédito — caráter, capacidade, capital, colateral e condições —, julgue os itens.',
 70:'Comando do caderno: a respeito do Banco Central do Brasil e das instituições públicas federais, julgue os itens.',
 71:'Comando do caderno: a respeito do Banco Central do Brasil e das instituições públicas federais, julgue os itens.',
 72:'Comando do caderno: no que se refere a instituições do Sistema Financeiro Nacional, julgue o item.',
 73:'Comando do caderno: com relação a microcrédito e a operações de microcrédito, julgue os itens.',
 74:'Comando do caderno: com relação a microcrédito e a operações de microcrédito, julgue os itens.',
 75:'Comando do caderno: no que se refere a procedimentos para abertura, movimentação e encerramento de conta-corrente, julgue os itens.',
 76:'Comando do caderno: no que se refere a procedimentos para abertura, movimentação e encerramento de conta-corrente, julgue os itens.',
 77:'Comando do caderno: no que se refere a procedimentos para abertura, movimentação e encerramento de conta-corrente, julgue os itens.',
 78:'Situação-base do caderno: um cliente foi incluído no CCF após a segunda apresentação de cheque sem fundos; depois, pagou a obrigação e ficou com o cheque. Considerando essa situação, julgue os itens.',
 79:'Situação-base do caderno: um cliente foi incluído no CCF após a segunda apresentação de cheque sem fundos; depois, pagou a obrigação e ficou com o cheque. Considerando essa situação, julgue os itens.',
 80:'Comando do caderno: acerca de depósitos bancários, julgue os itens subsequentes.',
 81:'Comando do caderno: acerca de depósitos bancários, julgue os itens subsequentes.',
 82:'Comando do caderno: com relação a fundos de investimento, depósitos de poupança e títulos de capitalização, julgue os itens.',
 83:'Comando do caderno: com relação a fundos de investimento, depósitos de poupança e títulos de capitalização, julgue os itens.',
 85:'Situação-base do caderno: Carlos pretende complementar os benefícios do regime geral de previdência, investir por mais de dez anos e deduzir do imposto de renda os recursos aplicados no plano privado. Julgue os itens.',
 86:'Situação-base do caderno: Carlos pretende complementar os benefícios do regime geral de previdência, investir por mais de dez anos e deduzir do imposto de renda os recursos aplicados no plano privado. Julgue os itens.',
 87:'Comando do caderno: acerca dos serviços de compensação de cheques e outros títulos, julgue os itens.',
 88:'Comando do caderno: acerca dos serviços de compensação de cheques e outros títulos, julgue os itens.',
 89:'Comando do caderno: a respeito do Sistema de Pagamentos Brasileiro (SPB), julgue os itens.',
 90:'Comando do caderno: a respeito do Sistema de Pagamentos Brasileiro (SPB), julgue os itens.',
 91:'Comando do caderno: a respeito de garantias fidejussórias, considerando sua formalização e a responsabilidade do avalista e do fiador, julgue os itens.',
 92:'Comando do caderno: a respeito de garantias fidejussórias, considerando sua formalização e a responsabilidade do avalista e do fiador, julgue os itens.',
 93:'Comando do caderno: acerca de títulos de crédito, julgue os itens.',94:'Comando do caderno: acerca de títulos de crédito, julgue os itens.',
 95:'Comando do caderno: acerca de títulos de crédito, julgue os itens.',96:'Comando do caderno: acerca de títulos de crédito, julgue os itens.',
 105:'Comando do caderno: a respeito de números reais e de funções de variáveis reais, julgue os itens.',
 106:'Comando do caderno: a respeito de números reais e de funções de variáveis reais, julgue os itens.',
 107:'Comando do caderno: a respeito de números reais e de funções de variáveis reais, julgue os itens.',
 109:'Comando do caderno: julgue os itens relativos à análise combinatória e à probabilidade.',
 110:'Comando do caderno: julgue os itens relativos à análise combinatória e à probabilidade.',
 111:'Comando do caderno: julgue os itens relativos à análise combinatória e à probabilidade.',
 112:'Comando do caderno: julgue os itens relativos à análise combinatória e à probabilidade.',
 113:'Comando do caderno: julgue a situação hipotética e a assertiva sobre proporcionalidade, divisão proporcional, média e porcentagem.',
 114:'Comando do caderno: julgue a situação hipotética e a assertiva sobre proporcionalidade, divisão proporcional, média e porcentagem.',
 116:'Comando do caderno: julgue a situação hipotética e a assertiva sobre proporcionalidade, divisão proporcional, média e porcentagem.',
 117:'Comando do caderno: no que se refere à matemática financeira, julgue os itens.',
 118:'Comando do caderno: no que se refere à matemática financeira, julgue os itens.',
 119:'Comando do caderno: no que se refere à matemática financeira, julgue os itens.',
 120:'Comando do caderno: no que se refere à matemática financeira, julgue os itens.'
}
const repaired={
 15:'“Sendo assim, (...) do que o outro”, detalha”: É preciso aumentar ao máximo o balanço de situações apresentadas para que um lado não pese mais que o outro, detalha o arquiteto de software.',
 17:'Considerando-se que, segundo o último parágrafo, o uso do sistema de aprendizagem de máquina deve “contribuir para cortes de gastos” (R. 11 e 12), é correto inferir do texto que esses gastos são ocasionados pelos analistas na operação humana.',
 25:'Na linha 12, o termo “Contudo” foi empregado com o mesmo sentido de “Porquanto”.',
 31:'Desde a segunda metade do século XX, o crescimento econômico da Coreia do Sul vem sendo impulsionado pela exportação de bens de consumo duráveis e pela formação educacional de trabalhadores qualificados.',
 42:'De acordo com a Lei de Responsabilidade Fiscal, os recursos do FDNE não podem ser utilizados para financiamento de programas de estados e de municípios.',
 71:'É vedada às instituições públicas federais a realização de operações de crédito com empresas controladas pela União.',
 96:'A triplicata é extraída em caso de extravio ou perda da duplicata.',
 105:'As únicas soluções da equação $(\\log_3 x)^2 = \\log_3 x + 6$ são $x=1/9$ e $x=27$.',
 106:'O menor valor de $f(x)=-3x^2+9x-6$ ocorre em $x=3/2$.',
 111:'Situação hipotética: para cada um dos 16 itens de uma prova objetiva de informática, o candidato marca certo ou errado. Para não ser desclassificado, deve acertar pelo menos 10 itens. Assertiva: se marcar aleatoriamente todos os itens, a probabilidade de não ser desclassificado é igual a $\\frac{7\\times11\\times13}{2^{13}}$.',
 112:'Se 9 cidades forem interligadas por rodovias, de forma que entre quaisquer duas cidades haja apenas uma rodovia direta, sem passar por outra cidade, então essa malha viária será composta por 72 rodovias.',
 113:'Em uma faculdade, a nota final é a média ponderada das notas das provas A, B e C. O peso da prova A é 1; o peso da prova B é 10% maior que o da prova A; e o peso da prova C é 20% maior que o da prova B. Se $P_A$, $P_B$ e $P_C$ forem as notas, respectivamente, a nota final é expressa por $\\frac{P_A+1{,}2P_B+1{,}32P_C}{3{,}52}$.',
 119:'No regime de juros compostos, com capitalização mensal à taxa de 1% ao mês, o prazo necessário para que R$ 100.000 produzam R$ 120.000 é expresso por $\\frac{\\log_{10}(2{,}1)}{\\log_{10}(1{,}01)}$.'
}
const canonical=entries.map(([n])=>`${n}:${keys[n]}`).join('\n')
const digest=createHash('sha256').update(`BNB|2018|CARGO2-ANALISTA-BANCARIO-1|GABARITO_OFICIAL_DEFINITIVO|ITENS_SELECIONADOS\n${canonical}`).digest('hex')
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==79||new Set(records.map(q=>q.id)).size!==79||entries.length!==79)throw Error('Fila alterada: esperados 79 itens únicos e mapeados.')
const byNumber=new Map(records.map(q=>[Number(q.numero),q]))
const decisions=entries.map(([number,materia,conteudo,dificuldade])=>{
 const q=byNumber.get(number),key=keys[number];if(!q||!key)throw Error(`Item ${number} ausente ou sem gabarito oficial.`)
 const annulled=key==='X',answer=annulled?null:key==='C'?0:1
 if(q.resposta!==null&&q.resposta!==undefined&&q.resposta!==answer)throw Error(`Resposta existente do item ${number} diverge do gabarito oficial.`)
 const evidence=`Questão ${number} conferida individualmente no caderno oficial do CEBRASPE; matéria e conteúdo definidos pelo objeto efetivamente cobrado e confrontados com o programa do edital do Cargo 2. Ano, concurso e cargo confirmados no cabeçalho do caderno; gabarito definitivo vinculado ao documento oficial do BNB.`
 const difficultyEvidence=`Estimativa editorial com base na quantidade de etapas e no grau de distinção conceitual exigido pelo item; não representa estatística oficial de acerto da banca.`
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2018,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',cargo:'Analista Bancário 1',aplicacao,numero_original:number,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:difficultyEvidence,classificacao_fonte:prova,motivo:evidence,resposta_correta:answer,anulada:annulled,tipo_resposta:'certo_errado',enunciado:repaired[number]||String(q.enunciado).replace(/\s+/g,' ').trim(),texto_apoio:contexts[number]||'',gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'Gabarito Analista Bancário 1 2018 — definitivo',prova:'MATRIZ_424_BNB002__PAG_6.PDF',numero:number,criterio:'Gabarito oficial definitivo do Cargo 2 — Analista Bancário 1, publicado pelo Banco do Nordeste.',sha256:digest,sha256_tipo:'transcricao_canonica_dos_itens_selecionados',metodo:'SHA-256 da transcrição canônica das respostas definitivas selecionadas; não representa hash dos bytes do PDF.'},apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','classificacao_pendente','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado']}
})
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,classificadas:decisions.length,gabaritos_oficiais_vinculados:decisions.length,textos_reparados:Object.keys(repaired).length,contextos:decisions.filter(d=>d.texto_apoio).length,anuladas:decisions.filter(d=>d.anulada).length,ano:2018,prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const rootLine=`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`,rootFile='scripts/acervo-publico/acervo-atual.mjs',rootText=await fs.readFile(rootFile,'utf8')
if(!rootText.includes(rootLine))await fs.appendFile(rootFile,`\n${rootLine}\n`)
const report={...result,documento:doc,concurso,ano:2018,cargo:'Analista Bancário 1',questoes_revisadas:79,gabaritos_oficiais_vinculados:79,anuladas:[5,12,71,74],textos_reparados:Object.keys(repaired).map(Number),contextos_com_texto_base:Object.keys(contexts).map(Number),fonte_prova:prova,fonte_gabarito:gabarito,sha256_transcricao_oficial:digest,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
