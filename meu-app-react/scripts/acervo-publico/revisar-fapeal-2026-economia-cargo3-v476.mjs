import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-fapeal-2026-economia-cargo3-v476', documento='e15d70d6afc58345'
const prova='https://cdn.cebraspe.org.br/concursos/FAPEAL_26/arquivos/81891879392B2149CA581B15DF376F4213027AE12BDC8B8CF158E1F384423A3B.pdf'
const gabaritoUrl='https://cdn.cebraspe.org.br/concursos/FAPEAL_26/arquivos/F4375D830E09E3BB4F4B985C5ED28C032EFA567241288E62A4A3E8C9A58C37E6.pdf'
const editalUrl='https://cdn.cebraspe.org.br/concursos/FAPEAL_26/arquivos/9AC75E9562AD8C2581C5DFE99B53142F84193B66D3E9FAC6CD514AA0FB157662.pdf'
const concurso='FAPEAL — Concurso Público — 2026'
const cargo='Gestor Especializado em Ciência e Tecnologia — Área: Economia (Cargo 3)'
const caderno=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(caderno?.url,prova)
const ledger=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(String.fromCharCode(10)).filter(Boolean).map(JSON.parse)
const key=ledger.find(x=>x.documento_id===documento)
assert.equal(key?.gabarito_url,gabaritoUrl);assert.equal(key?.status,'transcrito_pdf_oficial');assert.equal(Object.keys(key.respostas).length,70)
const atual=JSON.parse(await fs.readFile('tmp/fapeal-cargo3-v476-pendentes.json','utf8'))
assert.equal(atual.length,34)
const hashes=new Map(atual.map(q=>[q.id,q.hash])),ids=new Set(hashes.keys())
const fontes=caderno.questoes.filter(q=>ids.has(q.id));assert.equal(fontes.length,34)

const temas={
  60:['Economia','Avaliação econômica de programas: eficiência, eficácia, efetividade e impacto causal','Média'],
  83:['Economia','Microeconomia: demanda do consumidor e curva de Engel','Fácil'],
  84:['Economia','Microeconomia: função de produção Cobb–Douglas e custos de curto prazo','Média'],
  85:['Economia','Microeconomia: minimização de custos no longo prazo e escolha de insumos','Difícil'],
  86:['Economia','Estruturas de mercado: concorrência imperfeita e diferenciação de produto','Fácil'],
  87:['Economia','Concorrência perfeita: preço, custo marginal e equilíbrio','Média'],
  88:['Economia','Economia do bem-estar: teorema de Coase e externalidades','Média'],
  89:['Economia','Bens públicos: exclusividade e rivalidade no consumo','Média'],
  90:['Economia','Bens públicos: exclusividade, rivalidade e capacidade de consumo','Média'],
  91:['Economia','Macroeconomia: identidade do produto e gastos do governo','Média'],
  92:['Economia','Balanço de pagamentos: conta corrente e conta financeira','Difícil'],
  93:['Economia','Finanças públicas: resultado fiscal, investimento e necessidade de financiamento','Média'],
  94:['Economia','Teoria monetária: instituições de pagamento e meios de pagamento','Média'],
  95:['Economia','Teoria monetária: agregados monetários e transformação de depósitos','Média'],
  96:['Economia','Modelo IS–LM: eficácia da política monetária','Difícil'],
  97:['Economia','Modelo IS–LM: efeito deslocamento e política fiscal','Difícil'],
  98:['Economia','Comércio internacional: tarifas e modelo de fatores específicos','Difícil'],
  99:['Economia','Integração econômica: união aduaneira e mercado comum','Média'],
  100:['Economia','Finanças públicas: operações monetárias e resultado primário','Difícil'],
  101:['Economia','Matemática financeira: câmbio, tarifas de transferência e conversão de moeda','Média'],
  102:['Economia','Matemática financeira: juros compostos, taxa nominal e tributação','Média'],
  103:['Economia','Matemática financeira: equivalência de taxas em juros compostos','Difícil'],
  104:['Economia','Matemática financeira: proporcionalidade de rendimentos e valor futuro','Média'],
  105:['Economia','Amortização: sistema francês e evolução das parcelas','Difícil'],
  106:['Economia','Amortização: comparação entre sistemas francês, SAC e misto','Difícil'],
  107:['Economia','Amortização: sistema de amortização constante e fórmula das prestações','Média'],
  108:['Economia','Avaliação de projetos: payback descontado e taxa mínima de atratividade','Média'],
  109:['Economia','Avaliação de projetos: índice de lucratividade e valor do investimento','Média'],
  110:['Economia','Avaliação de projetos: valor presente líquido e taxa de desconto','Média'],
  114:['Economia','Econometria: teste F de significância conjunta em regressão múltipla','Difícil'],
  115:['Economia','Econometria: previsão condicional em modelo de regressão linear','Média'],
  116:['Economia','Econometria: equivalência entre estimadores de máxima verossimilhança e MQO','Difícil'],
  118:['Economia','Econometria de séries temporais: estacionariedade e cointegração','Difícil'],
  119:['Economia','Econometria de séries temporais: sazonalidade e estrutura ARMA','Difícil']
}
const respostas={60:'C',83:'E',84:'C',85:'C',86:'E',87:'C',88:'E',89:'C',90:'E',91:'C',92:'E',93:'C',94:'X',95:'E',96:'C',97:'E',98:'C',99:'E',100:'E',101:'C',102:'C',103:'E',104:'E',105:'C',106:'E',107:'C',108:'C',109:'E',110:'E',114:'E',115:'E',116:'C',118:'E',119:'X'}
const limpar={
  60:'O programa B apresentou maior eficácia e efetividade, o que não corresponde necessariamente a maior impacto causal, pois os programas foram executados em contextos regionais distintos.',
  83:'Fixando-se as variáveis devidas, a curva de Engel de certo bem X é a relação entre a renda do consumidor e o preço do bem X.',
  84:'Se o capital for fixado em 2.500 unidades, a firma incorrerá em um custo de 900 unidades monetárias para produzir 10.000 unidades do produto.',
  85:'Para qualquer nível de produção no longo prazo, o custo ótimo é atingido quando K = 500L.',
  90:'Uma palestra gratuita aberta ao público realizada em um auditório fechado pertencente à prefeitura de certo município é um produto não exclusivo e não rival.',
  93:'Suponha que, em determinada economia, as receitas correntes do setor público tenham totalizado 700 unidades monetárias, as despesas correntes do setor público, excluídos os investimentos públicos, tenham totalizado 650 unidades monetárias e a necessidade de financiamento do setor público tenha sido de 150 unidades monetárias. Nesse caso hipotético, o investimento público foi de 200 unidades monetárias.',
  94:'As instituições de pagamento podem oferecer contas de pagamento destinadas à realização de pagamentos, transferências e outras movimentações de recursos por seus usuários. Os recursos correspondentes aos saldos dessas contas constituem patrimônio segregado, distinto do patrimônio da instituição de pagamento, e devem permanecer integralmente em conta específica no Banco Central do Brasil ou aplicados em títulos públicos federais. Dessa forma, a popularização dessas contas em substituição às tradicionais contas de depósitos à vista tende a reduzir o multiplicador bancário da economia.',
  95:'Considere que uma pessoa física tenha utilizado recursos mantidos em depósitos à vista no banco A para adquirir um certificado de depósito bancário (CDB) emitido pelo banco B. Nessa situação, a quantidade de moeda na economia (M1) permaneceu constante.',
  107:'Um empréstimo de R$ 120.000 será pago em 60 parcelas mensais pelo sistema de amortização constante, com taxa de juros de 1% ao mês. Nesse caso, o valor das prestações mensais satisfaz a fórmula Pₙ = 3.200 − 20(n − 1), em que n é um número natural referente ao índice do mês correspondente.',
  110:'Assim como o método da taxa interna de retorno, o método do valor presente líquido não exige a definição prévia de uma taxa de desconto a ser empregada na atualização dos fluxos de caixa.',
  114:'Para se testar a hipótese nula H₀: β₁ = β₂ = β₃ = 0, aplica-se usualmente o teste t de Student com n − 3 graus de liberdade, em que n representa o tamanho da amostra.',
  115:'Se x₁ = 1, x₂ = 0 e x₃ = 1, então a média de y será igual a β₁ + β₃.',
  116:'Considerando-se que os erros aleatórios sejam independentes e que β̂₀ e β̃₀ denotem, respectivamente, os estimadores de máxima verossimilhança e de mínimos quadrados ordinários do coeficiente β₀, é correto afirmar que β̂₀ = β̃₀.',
  118:'As séries temporais {Xₜ} e {aₜ} são cointegradas.',
  119:'A série temporal {Xₜ} tem uma componente sazonal.'
}
const bases={
  60:'Dois programas de difusão tecnológica para a agricultura familiar foram implementados: o Programa A no Nordeste e o Programa B no Sul. Ambos visavam aumentar a produção agrícola, e os resultados foram medidos após quatro anos. Dados da tabela do caderno: custo total (R$ milhões), A=200 e B=100; produtores atendidos (mil), A=125 e B=62,5; meta de aumento da produção, 10% em ambos; aumento médio observado da produção, A=8% e B=12%; aumento médio da renda, A=12% e B=8%. Julgue a afirmação com base nesses dados.',
  83:'A função de demanda de um consumidor mostra como a quantidade demandada de cada bem depende dos preços dos bens e da renda. Mantidas as demais variáveis constantes, julgue a afirmação referente à curva de Engel.',
  84:'A firma produz segundo a função y = 40L⁰·⁵K⁰·⁵, em que L é o trabalho e K é o capital. O custo unitário do trabalho é 30 unidades monetárias e o custo unitário do capital é 0,06 unidade monetária. O mercado de fatores é de concorrência perfeita, portanto a firma é tomadora de preços.',
  85:'A firma produz segundo a função y = 40L⁰·⁵K⁰·⁵, em que L é o trabalho e K é o capital. O custo unitário do trabalho é 30 unidades monetárias e o custo unitário do capital é 0,06 unidade monetária. O mercado de fatores é de concorrência perfeita, portanto a firma é tomadora de preços.',
  90:'Acerca das externalidades e dos bens públicos, julgue os itens subsequentes.',
  91:'Acerca das identidades macroeconômicas, do sistema de contas nacionais e do balanço de pagamentos, julgue os itens a seguir.',92:'Acerca das identidades macroeconômicas, do sistema de contas nacionais e do balanço de pagamentos, julgue os itens a seguir.',93:'Acerca das identidades macroeconômicas, do sistema de contas nacionais e do balanço de pagamentos, julgue os itens a seguir.',
  94:'À luz da teoria monetária, julgue os itens seguintes.',95:'À luz da teoria monetária, julgue os itens seguintes.',
  96:'Com base no modelo IS–LM para uma economia fechada, julgue os itens a seguir.',97:'Com base no modelo IS–LM para uma economia fechada, julgue os itens a seguir.',
  98:'Julgue os itens seguintes, relativos à economia internacional, ao comércio exterior e a blocos econômicos.',99:'Julgue os itens seguintes, relativos à economia internacional, ao comércio exterior e a blocos econômicos.',
  100:'No que se refere ao resultado fiscal, julgue o item a seguir.',
  101:'Cada item contém uma situação hipotética seguida de uma assertiva sobre proporcionalidade, porcentagens e juros.',102:'Cada item contém uma situação hipotética seguida de uma assertiva sobre proporcionalidade, porcentagens e juros.',103:'Cada item contém uma situação hipotética seguida de uma assertiva sobre proporcionalidade, porcentagens e juros.',104:'Cada item contém uma situação hipotética seguida de uma assertiva sobre proporcionalidade, porcentagens e juros.',
  105:'Cada item contém uma situação hipotética seguida de uma assertiva sobre os sistemas de amortização.',106:'Cada item contém uma situação hipotética seguida de uma assertiva sobre os sistemas de amortização.',107:'Cada item contém uma situação hipotética seguida de uma assertiva sobre os sistemas de amortização.',
  108:'A respeito dos métodos de avaliação de projetos, julgue os itens subsequentes.',109:'A respeito dos métodos de avaliação de projetos, julgue os itens subsequentes.',110:'A respeito dos métodos de avaliação de projetos, julgue os itens subsequentes.',
  114:'Considere o modelo de regressão linear y = β₀ + β₁x₁ + β₂x₂ + β₃x₃ + ε, em que x₁, x₂ e x₃ são variáveis indicadoras, y é a variável resposta e ε é o erro aleatório com distribuição normal, média zero e desvio padrão σ. Julgue os itens.',115:'Considere o modelo de regressão linear y = β₀ + β₁x₁ + β₂x₂ + β₃x₃ + ε, em que x₁, x₂ e x₃ são variáveis indicadoras, y é a variável resposta e ε é o erro aleatório com distribuição normal, média zero e desvio padrão σ. Julgue os itens.',116:'Considere o modelo de regressão linear y = β₀ + β₁x₁ + β₂x₂ + β₃x₃ + ε, em que x₁, x₂ e x₃ são variáveis indicadoras, y é a variável resposta e ε é o erro aleatório com distribuição normal, média zero e desvio padrão σ. Julgue os itens.',
  118:'Considere o modelo de séries temporais Xₜ = 0,5Xₜ₋₁ − 0,2Xₜ₋₁₂ + aₜ − 0,5aₜ₋₁ − 0,2aₜ₋₁₂, em que {aₜ} é uma série temporal de ruído branco com média zero e variância 4. Julgue os itens.',119:'Considere o modelo de séries temporais Xₜ = 0,5Xₜ₋₁ − 0,2Xₜ₋₁₂ + aₜ − 0,5aₜ₋₁ − 0,2aₜ₋₁₂, em que {aₜ} é uma série temporal de ruído branco com média zero e variância 4. Julgue os itens.'
}
const anuladas=new Set([94,119])
const decisoes=fontes.map(q=>{
  const n=Number(q.numero),[materia,conteudo,dificuldade]=temas[n],resposta=respostas[n]
  assert.ok(materia&&conteudo&&resposta,`Sem classificação ou gabarito no item ${n}`)
  const pagina=Number(q.pagina),imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`,anulada=anuladas.has(n)
  const texto=(limpar[n]||q.trecho).replace(/\s+/g,' ').trim()
  return {id:q.id,sha256_enunciado:hashes.get(q.id),materia,conteudo,ano:2026,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — Conhecimentos Específicos — Cargo 3 — caderno FAPEAL Cargo 3 Economia',numero:n,numero_original:n,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo os conceitos e os cálculos envolvidos; não corresponde a nível oficial divulgado pela banca.',classificacao_fonte:prova,motivo:`Item ${n} classificado a partir do cabeçalho temático oficial e dos conceitos econômicos avaliados.`,enunciado:texto,opcoes:['Certo','Errado'],resposta_correta:anulada?null:resposta==='C'?0:1,anulada,apta_resolucao:true,gabarito_oficial:{fonte:gabaritoUrl,arquivo:'F4375D830E09E3BB4F4B985C5ED28C032EFA567241288E62A4A3E8C9A58C37E6.pdf',prova:caderno.arquivo,sha256:key.sha256,numero:n,resposta,criterio:'Gabarito oficial definitivo do Cargo 3 e aplicação de 16/08/2026, identificado pelo mesmo concurso e recorte.'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado'],visual:{pagina,imagem,enunciado:texto,texto_apoio:bases[n]||'',motivo:`Página ${pagina} do caderno oficial conferida visualmente; contexto, fórmulas e tabelas compartilhados associados ao item ${n}.`}}
})
assert.equal(decisoes.length,34);assert.equal(decisoes.filter(d=>d.anulada).length,2);assert.equal(decisoes.filter(d=>d.gabarito_oficial.resposta!=='X').length,32)
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:34,itens_unicos:34,aptos_resolucao:34,correcao_automatica:32,anuladas:[94,119],paginas:[1,2,3,4],imagens:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,concurso,cargo,registros_revisados:34,itens_unicos:34,aptos_para_resolucao:34,elegiveis_correcao_automatica:32,anuladas:[94,119],paginas_originais_conferidas:[1,2,3,4],prova,gabarito:gabaritoUrl,edital:editalUrl,publicado:false,hash_do_gabarito:null}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## FAPEAL — Gestor Especializado em Ciência e Tecnologia, Economia, Cargo 3 — revisão v476\n\n- Revisei 34 itens pendentes em avaliação de programas e CT&I, microeconomia, macroeconomia, moeda, comércio internacional, matemática financeira, amortização, avaliação de projetos, econometria e séries temporais.\n- Corrigi OCR/concatenação nos itens 60, 83–85, 90, 93–95, 107, 110 e 114–119; restabeleci as funções de produção, fórmulas financeiras, regressão e série temporal e transcrevi os dados da tabela de avaliação do item 60.\n- Conferi visualmente as páginas 1 a 4 e vinculei cada contexto, equação e tabela à questão correta. Os itens 94 e 119 constam anulados no gabarito definitivo.\n- O gabarito foi transcrito do PDF oficial do Cebraspe; hash local não disponível. Dificuldade é estimativa editorial. Pacote local, sem publicação na nuvem.\n- Fontes: [prova oficial](<${prova}>), [gabarito definitivo](<${gabaritoUrl}>), [edital oficial](<${editalUrl}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
