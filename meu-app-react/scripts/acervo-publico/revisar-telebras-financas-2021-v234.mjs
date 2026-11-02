import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-telebras-financas-2021-v234',doc='9a32d70b8f28e262'
const prova='https://cdn.cebraspe.org.br/concursos/telebras_21/arquivos/657_TELEBRAS_007_01.PDF'
const concurso='TELEBRAS 2021 — Especialista em Gestão de Telecomunicações, Cargo 7: Analista Superior, Subatividade Finanças'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='657_TELEBRAS_007_01.PDF'||catalog.questoes.length!==77)throw Error('Inventário incompatível: esperados 77 registros OCR')
const grupos=new Map();for(const e of catalog.questoes){const a=grupos.get(e.numero)||[];a.push(e);grupos.set(e.numero,a)}
if(grupos.size!==70||[...grupos.keys()].some(n=>n<51||n>120))throw Error('Esperados 70 itens únicos, números 51–120')
const prev=raizesAtuais.findIndex(x=>x.includes('revisao-prf-curso-formacao-2021-v233'))
if(prev<0)throw Error('Base anterior v233 ausente')
const bases=raizesAtuais.slice(prev),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),want=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
for(const lote of manifest.lotes.filter(x=>x.arquivo&&x.ano===2021&&/telebras/i.test(x.concurso||''))){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,bases)))
 for(const q of qs)if(want.has(q.id)){byId.set(q.id,q);want.delete(q.id)}
 if(!want.size)break
}
if(want.size)throw Error(`Registros ausentes no acervo: ${want.size}`)

const assuntos={
51:['Economia','Mercado financeiro: duration modificada de títulos com e sem cupom'],
52:['Economia','Mercado financeiro: cálculo da duration de Macaulay por valor presente dos fluxos'],
53:['Economia','Mercado financeiro: relação entre taxa de cupom e duration'],
54:['Economia','Mercado financeiro: duration modificada de título zero cupom'],
55:['Administração Financeira','CAPM: prêmio de risco sistemático e retorno dos ativos'],
56:['Matemática Financeira','Taxas de juros: conversão de taxa nominal em taxa efetiva anual'],
57:['Administração Financeira','Carteiras de investimento: fronteira eficiente e relação risco-retorno'],
58:['Administração Financeira','Gestão de risco: VaR, normalidade e subaditividade'],
59:['Administração Financeira','Gestão de risco: VaR histórico e nível de confiança'],
60:['Administração Financeira','Gestão de risco: VaR não paramétrico e volatilidade'],
61:['Administração Financeira','Avaliação de investimentos: valor presente líquido e custo de oportunidade'],
62:['Administração Financeira','Avaliação de investimentos: payback e taxa interna de retorno'],
63:['Administração Financeira','CAPM: pressuposto de aversão ao risco dos investidores'],
64:['Administração Financeira','Avaliação de investimentos: VPL de fluxo único e decisão de investimento'],
65:['Administração Financeira','Decisões sob risco: retorno esperado e dominância estocástica'],
66:['Economia','Macroeconomia: taxa de juros nominal, inflação e paridade de Fisher'],
67:['Economia','Macroeconomia: taxa de juros real e inflação esperada'],
68:['Administração Financeira','Avaliação de ações: crescimento de dividendos e retorno esperado'],
69:['Administração Financeira','Avaliação de ações: modelo de crescimento de dividendos'],
70:['Conhecimentos Bancários','Sistema financeiro: autorização de administradoras de cartão pelo Banco Central'],
71:['Economia','Meios de pagamento: débito em conta e meios de pagamento da economia'],
72:['Administração Financeira','CAPM: composição de carteira e desvio-padrão do portfólio'],
73:['Administração Financeira','CAPM: alocação ótima entre ativo livre de risco e ativo arriscado'],
74:['Administração Financeira e Orçamentária','Orçamento público: regime contábil e execução da despesa'],
75:['Administração Financeira e Orçamentária','Orçamento público: reconhecimento orçamentário da receita'],
76:['Administração Financeira e Orçamentária','Orçamento público: estimativa de despesas irrelevantes'],
77:['Administração Financeira e Orçamentária','Despesa pública: despesas correntes e aquisição de bens de capital'],
78:['Administração Financeira e Orçamentária','Despesa pública: estimativa de impacto orçamentário e financeiro'],
79:['Administração Financeira e Orçamentária','Orçamento público: emissão de papel-moeda e LOA'],
80:['Administração Financeira e Orçamentária','Planejamento governamental: vigência do Plano Plurianual'],
81:['Administração Financeira e Orçamentária','Planejamento governamental: revisão de programas do PPA'],
82:['Administração Financeira e Orçamentária','Planejamento governamental: despesas de duração continuada e PPA'],
83:['Administração Financeira e Orçamentária','Planejamento governamental: investimentos plurianuais no PPA'],
84:['Administração Financeira e Orçamentária','Planejamento governamental: diretrizes, objetivos e metas do PPA'],
85:['Contabilidade Pública','Execução da despesa pública: restos a pagar e legalidade'],
86:['Contabilidade Pública','Execução da despesa pública: cancelamento de restos a pagar'],
87:['Contabilidade Pública','Execução da despesa pública: restos a pagar processados e não processados'],
88:['Contabilidade Pública','Execução da despesa pública: empenho e inscrição em restos a pagar'],
89:['Administração Financeira e Orçamentária','Receita pública: taxas, tarifas e compulsoriedade'],
90:['Administração Financeira e Orçamentária','Receita pública: dívida ativa tributária e classificação econômica'],
91:['Administração Financeira e Orçamentária','Receita pública: operações de crédito e receitas de capital'],
92:['Administração Financeira e Orçamentária','Receita pública: royalties e classificação econômica'],
93:['Administração Financeira e Orçamentária','Receita pública: classificação de receitas primárias'],
94:['Direito Tributário','Sistema tributário: fato gerador e natureza dos impostos'],
95:['Contabilidade Pública','Conta Única do Tesouro Nacional: etapas da receita orçamentária'],
96:['Contabilidade Pública','Empresas estatais dependentes: registro e controle de receitas'],
97:['Contabilidade Geral','Análise das demonstrações contábeis: liquidez imediata'],
98:['Contabilidade Geral','Análise das demonstrações contábeis: liquidez corrente'],
99:['Contabilidade Geral','Análise das demonstrações contábeis: liquidez geral'],
100:['Contabilidade Geral','Análise das demonstrações contábeis: liquidez seca e liquidez corrente'],
101:['Contabilidade Geral','Análise das demonstrações contábeis: margem operacional líquida'],
102:['Contabilidade Geral','Análise das demonstrações contábeis: retorno sobre investimento e patrimônio líquido'],
103:['Contabilidade Geral','Análise das demonstrações contábeis: giro do investimento total'],
104:['Contabilidade Geral','Análise das demonstrações contábeis: retorno operacional sobre capital próprio'],
105:['Contabilidade Geral','Análise das demonstrações contábeis: análise vertical'],
106:['Contabilidade Geral','Análise das demonstrações contábeis: análise horizontal e número-índice'],
107:['Contabilidade Geral','Análise das demonstrações contábeis: interpretação de saldos negativos'],
108:['Contabilidade Geral','Análise das demonstrações contábeis: análise vertical e horizontal combinadas'],
109:['Contabilidade de Custos','Sistemas de custos: custeio e sistema de informação gerencial'],
110:['Contabilidade de Custos','Custeio padrão: implantação e controle de custos'],
111:['Contabilidade de Custos','Métodos de custeio: absorção, ABC, padrão e RKW'],
112:['Contabilidade de Custos','Custos variáveis e fixos: comportamento por unidade de produto'],
113:['Contabilidade de Custos','Relação custo-volume-lucro: comportamento dos custos fixos e variáveis'],
114:['Contabilidade de Custos','Relação custo-volume-lucro: margem de contribuição negativa e ponto de equilíbrio'],
115:['Contabilidade de Custos','Ponto de equilíbrio contábil: variação do estoque e estrutura de custos'],
116:['Contabilidade de Custos','Ponto de equilíbrio contábil: volume de vendas necessário'],
117:['Contabilidade Geral','Demonstração dos fluxos de caixa: remuneração do capital próprio'],
118:['Contabilidade Geral','Balanço patrimonial: classificação de saldo bancário credor'],
119:['Contabilidade Geral','Demonstração das mutações do patrimônio líquido: informações complementares'],
120:['Contabilidade Geral','Demonstração das mutações do patrimônio líquido: receitas, despesas e resultado abrangente']
}
const contextos=[
 [51,'Considerando que um título padrão de mercado tem pagamento anual de cupom e taxa de juros de 10% ao ano, julgue os itens a seguir.'],
 [54,'Em relação à precificação de títulos e ativos, julgue os itens seguintes.'],
 [58,'Considerando os modelos e as hipóteses relacionadas ao cálculo do valor em risco (VaR — value at risk), julgue os itens seguintes.'],
 [61,'Acerca dos principais métodos de avaliação de investimentos, julgue os itens subsequentes.'],
 [66,'Supondo que a taxa global, livre de risco, é de 3% ao ano, que a inflação no país A é de 2% ao ano e que a inflação no país B é de 5% ao ano, sem incerteza sobre o comportamento futuro da inflação, julgue os itens a seguir.'],
 [68,'Uma empresa paga US$ 2,00 de dividendos por ação e aumenta os dividendos à taxa constante de 5% ao ano. Considerando a manutenção desse comportamento e a valorização estimada do mercado acionário em 13,4% ao ano, julgue os itens seguintes.'],
 [70,'Com relação aos principais produtos bancários e às operações realizadas por administradoras de cartões de crédito e débito, julgue os itens seguintes.'],
 [72,'No modelo CAPM, considere taxa livre de risco de 6% ao ano, retorno esperado do ativo arriscado de 15% ao ano e retorno esperado pelo investidor de 10% ao ano. Julgue os itens a seguir.'],
 [74,'Considerando os princípios orçamentários relativos às receitas e às despesas públicas, julgue os itens a seguir.'],
 [80,'Acerca dos ciclos orçamentários e dos requisitos legais impostos pelo Plano Plurianual (PPA), julgue os itens seguintes.'],
 [85,'Em relação à denominação dos restos a pagar, julgue os próximos itens.'],
 [89,'Tendo em vista a classificação e a origem econômica da receita orçamentária, julgue os itens a seguir.'],
 [95,'Considerando os lançamentos na Conta Única do Tesouro Nacional, julgue os itens subsequentes.'],
 [97,'A tabela patrimonial da página 2 apresenta os saldos dos grupos de ativo, passivo e patrimônio líquido nos exercícios X0 e X1. X0 é o exercício mais antigo. Com base nesses dados, julgue os itens seguintes.'],
 [101,'Considere a tabela da página 2 com receita operacional líquida (ROL), lucro operacional líquido (LOL), ativo total médio (ATM) e patrimônio líquido (PL) nos exercícios X0 e X1. Julgue os itens seguintes.'],
 [105,'Relativamente às metodologias de análise vertical e horizontal, julgue os itens seguintes.'],
 [109,'Relativamente às metodologias de custeio para fins de avaliação de estoques e para a tomada de decisões, julgue os itens seguintes.'],
 [113,'Com relação ao estudo da relação custo versus volume versus lucro, julgue os itens seguintes.'],
 [117,'Relativamente à elaboração das principais demonstrações contábeis utilizadas, julgue os itens seguintes.']
]
function contexto(n){return contextos.filter(([inicio])=>inicio<=n).at(-1)[1]}
const canon=new Map([[52,'extr-329e7c8eb1bc125d4a1c'],[56,'extr-cf429c44ab0a6865bbcd'],[57,'extr-d4c9cf2113900f9fdd3f'],[62,'extr-9dfd8ae30dcee599ac13'],[64,'extr-09a1e1ba388d2583e332'],[65,'extr-38d3a520590b281d57f4'],[84,'extr-aec8847074acc2dd6edb']])
const enunciados=new Map([
 [52,'Se a taxa anual de cupom for de 8%, a duration do título será \(\\frac{\\frac{80}{1{,}10}+\\frac{2\\cdot80}{(1{,}10)^2}+\\frac{3\\cdot1080}{(1{,}10)^3}}{\\text{preço do título}}\).'],
 [56,'A taxa efetiva anual de um título que paga uma taxa nominal de 12% capitalizada mensalmente será de \(\\left(1+\\frac{0{,}12}{12}\\right)^{12}-1\).'],
 [57,'A fronteira eficiente é o lugar geométrico em que as carteiras dominantes estão situadas e, portanto, alcança-se a maximização do retorno dado o risco.'],
 [62,'A regra do menor prazo de retorno (payback) é preferível à regra da maior taxa interna de retorno.'],
 [64,'Usando a regra do VPL, um gestor não deve investir em um projeto que promete pagar um fluxo ao final do ano de US$ 1.000, considerando-se que o custo do projeto é de US$ 950 e que a taxa que mensura o custo de oportunidade é de 10% ao ano.'],
 [65,'Nas decisões de investimento com risco, o ordenamento das médias de retorno implica dominância estocástica de uma possibilidade de investimento sobre a outra.'],
 [84,'A lei do plano plurianual deve estabelecer, de forma centralizada, as diretrizes, os objetivos e as metas da administração pública federal.']
])
const facil=new Set([51,53,55,56,57,61,63,66,67,70,71,74,75,77,80,82,83,85,87,89,90,91,92,93,95,96,105,109,111,112,113,117,118,119,120])
const dificil=new Set([52,54,58,59,60,64,65,68,69,72,73,76,78,79,81,86,88,94,97,98,99,100,101,102,103,104,106,107,108,110,114,115,116])
const decisoes=[]
for(const [n,entries] of grupos){const assunto=assuntos[n],canonical=canon.get(n)||entries[0].id
 if(!assunto)throw Error(`Questão ${n} sem matéria/assunto`)
 for(const e of entries){const q=byId.get(e.id),img=`paginas/${doc}-${String(e.pagina).padStart(4,'0')}.webp`,duplicada=e.id!==canonical
  if(!q||q.pagina!==e.pagina)throw Error(`Registro/página divergente: questão ${n}`)
  await fs.access(`public/acervo-extraido/${img}`)
  const [materia,conteudo]=assunto
  const d={id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2021,concurso,
   numero_original:n,pagina:e.pagina,dificuldade:facil.has(n)?'Fácil':dificil.has(n)?'Difícil':'Média',dificuldade_estimada:true,
   dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e quantidade de operações/regras mobilizadas; não representa índice psicométrico oficial.',
   classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura individual do item, comando, quadro/tabela e contexto na prova oficial; confronto com a identificação do caderno e cargo no edital.'},
   visual:{pagina:e.pagina,imagem:img,motivo:`Página ${e.pagina} do caderno oficial conferida; tabelas, fórmulas e contexto visual da questão permanecem acessíveis na imagem de origem.`},
   remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],
   motivo:duplicada?`Duplicata OCR do item ${n}; versão canônica legível mantida.`:`Classificação individual baseada no tema do item e no bloco do caderno. Gabarito preexistente preservado.`}
  if(!duplicada){d.apta_resolucao=true;d.texto_apoio=contexto(n);if(enunciados.has(n))d.enunciado=enunciados.get(n)}
  else{d.apta_resolucao=false;d.inelegibilidade_motivo=`Cópia OCR do item ${n}; questão canônica ${canonical} mantida.`;d.duplicada_de=canonical}
  decisoes.push(d)
 }
}
if(decisoes.length!==77)throw Error(`Esperados 77 registros OCR, obtidos ${decisoes.length}`)
const out=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[prev],decisoes})
console.log(JSON.stringify({...out,documento:catalog.arquivo,registros_revisados:77,itens_unicos:70,duplicatas_inelegiveis:7,paginas_conferidas:[1,2,3],publicado:false},null,2))
