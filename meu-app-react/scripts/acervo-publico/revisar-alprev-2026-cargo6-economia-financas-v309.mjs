import fs from 'node:fs/promises'
import path from 'node:path'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='25d956d16c016853'
const prova='https://cdn.cebraspe.org.br/concursos/ALPREV_26/arquivos/6D786E8CC8B7C25036FA4AC96190F08BC1BB55CD31EF1C4ADD25D6CD78D675B1.pdf'
const paginaOficial='https://www.cebraspe.org.br/concursos/ALPREV_26'
const concurso='ALPREV 2026 — Cargo 6 — Conhecimentos Específicos'
const cargo='Cargo 6 — Conhecimentos Específicos'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.url!==prova||catalog.questoes.length!==77)throw Error('Caderno ALPREV divergente do catálogo documental')
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const pendentes=records.filter(q=>q.classificacao_pendente&&!q.classificacao_revisada&&q.integridade_profissional?.apta_resolucao!==false)
if(records.length!==77||pendentes.length!==76)throw Error(`Esperados 77 registros, 76 pendências; encontrados ${records.length}/${pendentes.length}`)

const subjects={
51:'Economia',52:'Economia',53:'Economia',54:'Economia',55:'Economia',56:'Economia',57:'Economia',58:'Economia',59:'Economia',60:'Economia',61:'Economia',62:'Economia',63:'Economia',64:'Economia',65:'Economia',66:'Economia',67:'Economia',68:'Economia',69:'Economia',70:'Economia',71:'Economia',72:'Economia',73:'Economia',74:'Economia',75:'Economia',76:'Economia',77:'Economia',78:'Economia',79:'Economia',80:'Economia',81:'Economia',82:'Economia',83:'Economia',84:'Economia',85:'Economia',86:'Economia',87:'Economia',88:'Economia',89:'Economia',90:'Economia',91:'Economia',92:'Economia',93:'Previdência Social',94:'Economia',95:'Economia',96:'Mercado Financeiro',97:'Mercado Financeiro',98:'Mercado Financeiro',99:'Mercado Financeiro',100:'Mercado Financeiro',101:'Mercado Financeiro',102:'Mercado Financeiro',103:'Mercado Financeiro',104:'Mercado Financeiro',105:'Mercado Financeiro',106:'Mercado Financeiro',107:'Mercado Financeiro',108:'Mercado Financeiro',109:'Mercado Financeiro',110:'Mercado Financeiro',111:'Mercado Financeiro',112:'Mercado Financeiro',113:'Mercado Financeiro',114:'Mercado Financeiro',115:'Mercado Financeiro',116:'Mercado Financeiro',117:'Mercado Financeiro',118:'Mercado Financeiro',119:'Mercado Financeiro',120:'Mercado Financeiro'}
const contents={
51:'Elasticidade-preço da demanda e incidência de tributos sobre medicamento essencial',52:'Fatores de produção: capital em prestação de serviços de reparo',53:'Teoria do consumidor: preferências e bens substitutos perfeitos',54:'Teoria do consumidor: preferências e bens complementares perfeitos',55:'Elasticidade-renda da demanda',56:'Elasticidade-preço e dispêndio total do consumidor',57:'Concorrência perfeita: curva de oferta da firma',58:'Função de produção e curvas de custo da firma',59:'Monopólio: cálculo do lucro de equilíbrio',60:'Monopólio: condição de maximização do lucro',61:'Oligopólio: modelo de Bertrand e equilíbrio de preços',62:'Oligopólio: modelo de Cournot e quantidades de equilíbrio',63:'Concorrência monopolística: diferenciação de produto',64:'Teoria dos jogos: equilíbrio de Nash e ótimo de Pareto',65:'Teoria dos jogos: decisão sequencial e estratégia dominante',66:'Teoria dos jogos: jogos sequenciais e simultâneos',67:'Equilíbrio geral: caixa de Edgeworth e melhoria de Pareto',68:'Eficiência de Pareto e alocação de recursos',69:'Sistema de Contas Nacionais: óticas de mensuração do PIB',70:'Contas Nacionais: PIB real e nominal, renda nacional e depreciação',71:'Contas Nacionais: deflator implícito e crescimento real do PIB',72:'Balanço de pagamentos: identidade entre contas corrente e financeira',73:'Balanço de pagamentos: importações e saldo em transações correntes',74:'Balanço de pagamentos: serviços e transações correntes',75:'Moeda e agregados monetários: base monetária e operações do Banco Central',76:'Agregados monetários brasileiros: classificação de depósitos de poupança',77:'Base monetária: moeda em circulação e reservas bancárias',78:'Modelo IS-LM-BP: mobilidade de capitais e equilíbrio externo',79:'Modelo keynesiano: demanda agregada, produto e nível de preços',80:'Inflação e juros: taxa nominal, taxa real e política monetária',81:'Dominância fiscal, expansão monetária e estabilidade de preços',82:'Curva de Phillips aumentada pelas expectativas e taxa natural de desemprego',83:'Política fiscal contracionista, emprego e arrecadação previdenciária',84:'Externalidades negativas e custos sociais e previdenciários',85:'Finanças públicas: função distributiva e transferências previdenciárias',86:'Finanças públicas: resultado primário e despesas com juros',87:'Tributação patrimonial e financiamento dos regimes próprios de previdência',88:'Tributação regressiva, desigualdade e demanda por benefícios assistenciais',89:'Política fiscal, resultado primário e sustentabilidade previdenciária',90:'Desigualdade regional e demanda por benefícios assistenciais',91:'Abertura comercial, emprego formal e financiamento previdenciário no Brasil',92:'Finanças públicas: composição do gasto primário federal',93:'Sustentabilidade atuarial e variáveis demográficas e salariais',94:'Finanças públicas brasileiras: gasto previdenciário e resultado primário desde 1980',95:'Tributação sobre consumo, distribuição de renda e proteção social',96:'Ações ordinárias e preferenciais: direitos societários e precificação',97:'Derivativos: contratos futuros e contratos a termo',98:'Renda fixa: risco e rentabilidade de debêntures e títulos públicos',99:'Fundos de investimento: classificação e fundo exclusivo',100:'Mercado interbancário: depósitos e gestão de liquidez',101:'Hipótese de eficiência de mercado na forma forte',102:'Hipótese de eficiência semiforte e análise fundamentalista',103:'Eficiência de mercado e oportunidades de arbitragem',104:'Teoria de carteiras: fronteira eficiente e dominância',105:'Diversificação e risco não sistemático',106:'Linha de mercado de capitais (CML) e carteira de mercado',107:'Risco e retorno esperado de investimentos',108:'CAPM: risco sistemático e risco específico',109:'CAPM: cálculo do retorno esperado pelo beta',110:'APT e modelos multifatoriais de risco e retorno',111:'Estrutura a termo da taxa de juros e teoria das expectativas',112:'Taxas à vista e cálculo de taxa a termo',113:'Curva de juros: spread e inclinação',114:'Renda fixa: duration, convexidade e sensibilidade a juros',115:'Títulos prefixados: taxa de cupom, retorno exigido e ágio',116:'Renda fixa: relação inversa entre taxa de mercado e preço do título',117:'Duration: comparação entre títulos com e sem cupons',118:'Gestão de riscos: testes de estresse de carteiras',119:'Gestão de riscos: Value at Risk (VaR) e Conditional VaR (CVaR)',120:'Gestão de riscos: VaR paramétrico e distribuições com caudas pesadas'}

const duplicateOf=new Map([
 ['extr-1737806d0c7c638bcb1c','extr-1d1d24ecb454db523732'],
 ['extr-1b364734b9470e053def','extr-f2755a6b803617b073ca'],
 ['extr-57f7b3e4e2f4d05a39fe','extr-8feb737178eb29aaf8a8'],
 ['extr-6b9f635995c063b677e1','extr-45fd9ccab5bbd656a775'],
 ['extr-77adfd112417f26b60c2','extr-906b269a070b20f60a5c'],
 ['extr-3d65bcfe3ff86cc6c838','extr-c28bfa32f2be2b8ab4ca'],
 ['extr-8a2beec6dcf5780f952d','extr-7242c88fe3fa7898d1b3']
])
const page=n=>n<=62?1:n<=71?2:n<=82?3:4
const contexts=[
 [[51,52],'Itens sobre fatores de produção e elasticidade-preço da demanda.'],
 [[53,54],'Um consumidor divide a renda entre os bens X e Y; suas preferências são racionais, monotônicas e contínuas, e a despesa total com esses bens é igual à renda.'],
 [[55,56],'Considere consumidor com renda R e demanda do bem A dada por x_A = (R·p_B)/(p_A²), em que p_A é o preço do bem A e p_B é o preço do outro bem B. Analise o efeito da variação de preço sobre a receita total e a elasticidade-renda da demanda.'],
 [[57,58],'Uma firma atua em concorrência perfeita nos mercados de fatores e de produto. No longo prazo, escolhe produção e aquisição de capital e trabalho com base nos preços dos fatores, no preço do produto e na tecnologia.'],
 [[59,60],'Para um monopolista, o custo total é C(q) = 400 + 40q² e a demanda de mercado é p(q) = 300 − 10q, com preço em unidades monetárias por unidade do produto.'],
 [[61,62],'Duas firmas produzem o mesmo produto, concorrem no mesmo mercado e têm custos marginais iguais; considere os modelos de duopólio de Cournot e Bertrand.'],
 [[63,63],'Item sobre concorrência imperfeita e monopolística.'],
 [[64,66],'Jogo sequencial: A escolhe a₁ ou a₂ e, depois, B escolhe b₁, b₂ ou b₃. Payoffs (A,B): após a₁, b₁=(2,5), b₂=(4,1), b₃=(0,0); após a₂, b₁=(6,5), b₂=(3,2), b₃=(1,9). A árvore completa está na imagem original da página 2.'],
 [[67,68],'Caixa de Edgeworth com dois bens, X e Y, e dois agentes, A e B, com preferências racionais, monotônicas, convexas e contínuas; considere as dotações iniciais de cada agente e as melhorias de Pareto.'],
 [[69,69],'Item sobre Contas Nacionais e as óticas de mensuração do produto interno bruto.'],
 [[70,70],'Economia com PIB nominal de R$ 1,2 trilhão, deflator 120 (ano-base 100), renda primária líquida do exterior de −R$ 30 bilhões e consumo de capital fixo de R$ 80 bilhões.'],
 [[71,71],'Compare crescimento do PIB nominal de 10% com aumento de 6% do deflator implícito.'],
 [[72,74],'Balanço de pagamentos (UM): bens — exportações 400, importações 300; serviços — receitas 80, despesas 120; rendimentos — receitas 30, despesas 70; transferências correntes — recebidas 25, enviadas 15; conta de capital — créditos 14, débitos 4; conta financeira — aquisição líquida de ativos 170 e incorrência líquida de passivos 13. Os itens fazem referência ao BPM6 e a dados numéricos apresentados no caderno.'],
 [[75,77],'Itens sobre agregados monetários, operações do Banco Central, moeda em circulação e reservas bancárias.'],
 [[78,82],'Itens sobre modelo IS-LM-BP, produto e preços, inflação, mercado de trabalho, dominância fiscal e curva de Phillips.'],
 [[83,89],'Itens sobre política fiscal, tributação, contabilidade fiscal, benefícios sociais e sustentabilidade previdenciária.'],
 [[90,95],'Itens sobre economia brasileira desde os anos 1980, emprego, desigualdade, gasto previdenciário e distribuição de renda.'],
 [[96,100],'Itens sobre mercado financeiro e de capitais, derivativos, renda fixa, fundos de investimento e liquidez interbancária.'],
 [[101,103],'Itens sobre hipóteses de eficiência de mercado e arbitragem.'],
 [[104,107],'Itens sobre teoria de carteiras, diversificação, risco e retorno.'],
 [[108,110],'Itens sobre CAPM e APT para determinação de retorno esperado e remuneração do risco.'],
 [[111,113],'Itens sobre estrutura a termo de juros, taxas à vista, taxas a termo e inclinação da curva.'],
 [[114,117],'Itens sobre títulos de renda fixa, duration, convexidade, cupons e preços.'],
 [[118,120],'Itens sobre mensuração e gestão de risco de carteiras, testes de estresse, VaR e CVaR.']
]
const contextFor=n=>contexts.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const easy=new Set([52,53,54,55,57,62,68,69,71,74,76,83,84,85,86,93,95,96,97,99,100,101,103,105,107,108,110,113,115,116,118,119,120])
const hard=new Set([51,59,60,64,65,66,67,70,72,73,74,78,80,81,82,87,89,92,94,98,102,104,106,109,111,112,114,117])
const fixes={
 'extr-1d1d24ecb454db523732':'Considere um sapateiro que não fabrica sapatos novos e presta serviços de conserto na garagem de sua casa. Nessa situação, para o serviço prestado, não existe o fator de produção denominado capital, uma vez que ele somente conserta sapatos usados, sem produzir sapatos novos.',
 'extr-f2755a6b803617b073ca':'Se os bens X e Y forem substitutos perfeitos, sempre será possível encontrar uma cesta ótima em que todo o consumo se dirija a um dos bens.',
 'extr-8feb737178eb29aaf8a8':'Se os bens X e Y forem complementares perfeitos, o conjunto das cestas ótimas de consumo estará sobre uma linha reta que passa pela origem do plano cartesiano.',
 'extr-45fd9ccab5bbd656a775':'A elasticidade-renda do bem A é um número positivo entre 0 e 1.',
 'extr-906b269a070b20f60a5c':'Mantidas inalteradas todas as demais variáveis, um aumento no preço do bem A não mudará o total gasto pelo consumidor com o bem A.',
 'extr-c28bfa32f2be2b8ab4ca':'A curva de custo total da firma mostra as combinações de capital e mão de obra que permitem produzir cada quantidade fixada q do produto.',
 'extr-7242c88fe3fa7898d1b3':'No modelo de Cournot, as duas firmas em equilíbrio dividirão o mercado igualmente, de modo que ambas venderão a mesma quantidade do produto.'
}
const decisions=[]
for(const q of pendentes){
 const n=Number(q.numero),p=page(n),image=`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,src=catalog.questoes.find(x=>x.id===q.id)
 if(!subjects[n]||!contents[n]||!contextFor(n))throw Error(`Classificação ou contexto ausente no item ${n}`)
 if(!src||Number(src.pagina)!==p||!src.paginas?.includes(p))throw Error(`Página original divergente no item ${n}`)
 await fs.access(path.join('public/acervo-extraido',image))
 const duplicate=duplicateOf.has(q.id),d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:subjects[n],conteudo:contents[n],ano:2026,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'ALPREV 2026 — caderno de conhecimentos específicos do Cargo 6',cargo,numero_original:n,pagina:p,dificuldade:hard.has(n)?'Difícil':easy.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela abstração, quantidade de etapas e integração de conceitos; não é classificação publicada pela banca.',classificacao_fonte:prova,motivo:duplicate?`Registro OCR duplicado do item ${n}; versão canônica ${duplicateOf.get(q.id)} preservada.`:`Item ${n} conferido na página original e classificado pelo tópico técnico específico.`,apta_resolucao:!duplicate,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_de_outro_bloco'],imagem_pagina:image,imagens_contexto:[{pagina:p,imagem:image,texto:contextFor(n)}],visual:{pagina:p,imagem:image,motivo:'Imagem da página original conferida; enunciado e contexto do item correspondem ao caderno.'},texto_apoio:contextFor(n),reemplazarContexto:true}
 if(fixes[q.id]&&!duplicate)d.enunciado=fixes[q.id]
 if(duplicate){d.inelegibilidade_motivo=`Duplicata OCR do item ${n}.`;d.duplicada_de=duplicateOf.get(q.id)}
 decisions.push(d)
}
if(decisions.length!==76||duplicateOf.size!==7||new Set(decisions.map(d=>d.id)).size!==76)throw Error('Contagem de pendências ou duplicatas inesperada')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registros:records.length,pendentes:pendentes.length,decisoes:decisions.length,duplicatas:duplicateOf.size,unicosRevisados:decisions.length-duplicateOf.size,ano:2026,paginas:[1,2,3,4],gabaritoDefinitivoDisponivel:false,publicado:false},null,2));process.exit(0)}

const name='revisao-alprev-2026-cargo6-economia-financas-v309'
const result=await aplicarRevisoesIndividuais({nome:name,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${name}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:concurso,registrosOCR:records.length,itensUnicos:70,itensPendentesRevisados:decisions.length-duplicateOf.size,duplicatasExcluidas:duplicateOf.size,duplicatas:Object.fromEntries(duplicateOf),itensComChaveDefinitiva:0,paginasConferidas:[1,2,3,4],prova:prova,paginaDoConcurso:paginaOficial,publicado:false,observacao:'A página oficial consultada apresenta gabarito preliminar; respostas não foram gravadas como definitivas nem habilitadas para correção automática.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## ALPREV 2026 — Cargo 6, Economia e Finanças — v309\n\n- Revisei os 76 registros ainda pendentes para 69 itens únicos, cobrindo Economia, Contabilidade Social, Finanças Públicas, Previdência Social e Mercado Financeiro, com matéria e conteúdo específicos.\n- Marquei sete registros OCR duplicados como inelegíveis e preservei a transcrição canônica de cada item. Mantive as questões já revisadas fora deste lote.\n- Conferi as quatro páginas originais e associei os contextos compartilhados, incluindo a árvore de jogo, a tabela do balanço de pagamentos e os dados de custo e demanda. Corrigi sete enunciados afetados por falhas evidentes de OCR.\n- A página oficial consultada apresenta gabarito preliminar. Não associei respostas provisórias como definitivas; a correção automática permanece desativada até existir gabarito final conferido.\n- Validação local: ${result.total} questões, ${result.disponiveis} elegíveis, ${result.pendentes} pendências globais; publicação na nuvem não realizada.\n- Fontes: [caderno oficial](<${prova}>), [página oficial do concurso](<${paginaOficial}>).\n`)
console.log(JSON.stringify(report,null,2))
