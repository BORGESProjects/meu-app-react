import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-abin-2018-oficial-inteligencia-area2-economia-v483',documento='339d52e731812631'
const prova='https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/378_ABIN_002_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/GAB_DEFINITIVO_378_ABIN_002_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/EDITAL_DE_ABERTURA_378_ABIN_2017.PDF'
const concurso='ABIN — Oficial de Inteligência — Área 2 (Economia) — 2018'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url.toLowerCase(),prova.toLowerCase())
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(pendentes.length,74)
const hashes=new Map(pendentes.map(q=>[q.id,hashRevisao(q.enunciado)]))
const duplicatas=new Map()
const assunto=new Map(),g=(nums,m,c)=>nums.forEach(n=>assunto.set(n,[m,c]))
g([61,62,63,64],'Macroeconomia','Contas nacionais e balanço de pagamentos: fluxos internacionais, erros e omissões, deflator implícito e PIB nominal e real')
g([65,66,67],'Macroeconomia','Política monetária e Banco Central: redesconto, demanda agregada, estabilidade de preços e supervisão do sistema financeiro')
g([69],'Macroeconomia','Finanças públicas: equivalência ricardiana, dívida pública e poupança privada')
g([76],'Macroeconomia','Crescimento econômico: regra de ouro da acumulação de capital')
g([77,78,79,80],'Macroeconomia','Inflação, emprego, distribuição de renda, expectativas e efeito riqueza no consumo')
g([83,84,85,86],'Microeconomia','Preferências, funções utilidade, restrição orçamentária e demanda do consumidor')
g([88,89,90],'Microeconomia','Escolha sob incerteza, dominância estocástica, equivalente certo e aversão ao risco')
g([91,92],'Microeconomia','Teoria do consumidor: decomposição dos efeitos substituição e renda pelo método de Slutsky')
g([93,94],'Microeconomia','Teoria da produção: produtividade marginal e produtividade média do trabalho')
g([95,96,97],'Microeconomia','Teoria dos custos: custo total e custo médio no curto e no longo prazo')
g([98,99,100],'Microeconomia','Estruturas de mercado: equilíbrio concorrencial, monopólio e efeitos da tributação')
g([101,102,103,104],'Economia Brasileira','Formação econômica do Brasil: crise de 1929, Plano de Metas e industrialização do pós-guerra')
g([105,106,107],'Economia Brasileira','Economia brasileira de 1962 a 1984: crise da dívida, política econômica e PAEG')
g([108,109,110,111,112],'Economia Brasileira','Abertura comercial, privatizações e planos de estabilização: Cruzado, Bresser, Verão e Collor')
g([114,115],'Economia Brasileira','Plano Real: etapas de implantação, URV, âncora cambial e estabilização de preços')
g([116,117,118,119,120],'Economia Brasileira','Estado e desenvolvimento: privatização, desigualdades regionais, mercado de trabalho, agricultura e empresas públicas')
g([121,122,123,124,125],'Economia Internacional','Teorias do comércio internacional: vantagens comparativas, Heckscher-Ohlin, ciclo do produto e economias de escala')
g([126,127,128,129],'Economia Internacional','Política comercial: cotas, tarifas de importação, termos de troca e regras do GATT aplicadas ao Inovar-Auto')
g([130,131,132,133,134],'Economia Internacional','Instituições e integração comercial: OMC, Mercosul, GATT, competência tarifária e investimento direto no exterior')
g([135,136,137,138],'Economia Internacional','Sistema monetário e financeiro internacional: padrão-ouro, Bretton Woods, FMI, BID e Clube de Paris')
g([139,140],'Sistema Financeiro Nacional e Internacional','Basileia II, risco operacional, capital regulatório e mercado de euromoedas')
g([141,142],'Estatística e Probabilidade','Distribuição de Poisson, estimação de parâmetros e variância da média amostral')
g([148,149,150],'Econometria','Séries temporais: processo ARMA(1,1), estacionariedade, média incondicional e autocorrelação')
const contextos=[
 [61,'Considere o fragmento de dados do balanço de pagamentos brasileiro reproduzido na página 1 do caderno e julgue os itens sobre contas externas e produto.'],
 [65,'O Banco Central do Brasil regula a quantidade de moeda para manter a estabilidade de preços e também atua na estabilidade financeira e supervisão de instituições. Julgue os itens 65 a 69 com base nesse texto-base.'],
 [69,'À luz da equivalência ricardiana, considere a hipótese de financiamento dos gastos públicos por emissão de dívida descrita no próprio item.'],
 [76,'Julgue os itens de crescimento econômico e inflação, emprego e renda conforme os textos-base da página 2.'],
 [81,'Considere a economia com os consumidores João, Pedro e José, as funções utilidade e os preços apresentados na página 2; julgue os itens 81 a 86.'],
 [88,'Considere as funções de distribuição F e G e o contexto de decisão do consumidor sob risco apresentados na página 2.'],
 [90,'A função utilidade é u(x,y)=5√(xy); os preços são pₓ=2 e pᵧ=10, e a riqueza é w=100. Use esses dados nos itens 90 a 92.'],
 [93,'A função de produção da firma é Y=L²K−L³, com capital fixado em K=18, para os itens 93 e 94.'],
 [95,'Considere a função de produção Y=K^(1/2)L^(1/2), salário w=4 e remuneração do capital r=1. Use também o custo de longo prazo informado no enunciado original nos itens 95 a 97.'],
 [98,'Considere mercados com rendimentos constantes à escala e os cenários de concorrência perfeita e monopólio apresentados na página 3.'],
 [101,'Com base na história econômica brasileira, da crise de 1929 ao Plano de Metas do governo Juscelino Kubitschek, julgue os itens.'],
 [105,'Com relação ao período de 1962 a 1984, incluindo a crise econômica do início da década de 1960 e o período militar, julgue os itens.'],
 [108,'Acerca da crise econômica da década de 1980, das políticas de estabilização, inflação, Plano Real e privatizações, julgue os itens.'],
 [114,'Considerando o Plano Real, seu contexto e as etapas descritas na página 3, julgue os itens subsequentes.'],
 [116,'Considere os textos sobre o papel do Estado, a economia brasileira, desigualdades regionais, mercado de trabalho, agricultura e empresas públicas.'],
 [121,'Considere os textos-base sobre comércio de veículos e economias norte-americana e mexicana; avalie os itens pelas teorias do comércio internacional.'],
 [126,'O texto-base da página 4 trata da proposta de elevação do imposto de importação sobre cebolas; use as condições de oferta, demanda e preços informadas nos itens 126 a 128.'],
 [129,'No que se refere ao sistema de comércio internacional, julgue os itens 129 a 134.'],
 [135,'Julgue os itens sobre o sistema monetário e financeiro internacional.'],
 [139,'Considere os itens sobre regulação bancária, risco operacional e depósitos em euromoedas.'],
 [141,'O texto-base informa que a contagem diária de e-mails indesejados segue distribuição de Poisson; uma amostra aleatória de tamanho quatro observada foi (10, 4, 2, 4).'],
 [148,'O processo é Xₜ=10+0,5Xₜ₋₁+aₜ−2aₜ₋₁, em que t∈ℤ e os ruídos aₜ e aₜ₋₁ têm média zero e variância unitária. Julgue os itens 148 a 150.']
]
const contextoDe=n=>contextos.filter(([a])=>a<=n).at(-1)?.[1]||''
const correcoes=new Map([
 [64,'O PIB nominal é a medida do produto ideal para avaliar o nível e a trajetória de crescimento econômico, pois representa métrica de produto a preços constantes a partir de determinado ano-base.'],
 [80,'Em uma análise sobre como o consumo pode ser afetado pelo nível de preços, percebe-se que o efeito riqueza é o responsável por um resultado inusitado: a curva de demanda é positivamente inclinada.'],
 [91,'Se pₓ mudar para 5, o efeito substituição à la Slutsky será igual a −7,5.'],
 [92,'Se pₓ mudar para 5, o efeito renda à la Slutsky será igual a −7,5.'],
 [93,'A produtividade marginal do trabalho da firma será igual a 36L−3L².'],
 [94,'A produtividade média do trabalho da firma será igual a 18L²−L³.'],
 [95,'Se K=2, então o custo total de longo prazo será igual a 2Y+2/Y.'],
 [141,'Se P(X=0) representa a probabilidade de o atendente não receber e-mails indesejados em determinado dia, estima-se que tal probabilidade seja nula.'],
 [142,'No que se refere à média amostral X̄=(X₁+X₂+X₃+X₄)/4, em que X₁, X₂, X₃ e X₄ representam uma amostra aleatória simples retirada da distribuição X, é correto afirmar que a estimativa da variância do estimador X̄ será igual a 1,25.'],
 [148,'O processo em tela segue um modelo ARMA(1,1), e a série temporal {Xₜ:t∈ℤ} é estacionária.'],
 [149,'A média do processo Xₜ é igual a 10.'],
 [150,'A autocorrelação entre Xₜ e Xₜ₋₁ é nula.']
])
const respostasFaltantes=new Map([[83,'E'],[84,'E'],[141,'E'],[142,'E'],[148,'C'],[149,'E'],[150,'C']])
const faceis=new Set([61,62,64,65,67,69,76,77,78,80,83,84,85,86,93,94,101,102,103,104,105,106,107,108,109,110,111,112,114,115,116,117,118,119,120])
const dificeis=new Set([63,66,79,88,89,90,91,92,95,96,97,98,99,100,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,148,149,150])
const remover=['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=pendentes.map(q=>{
 const n=Number(q.numero),tax=assunto.get(n);assert.ok(tax,`Sem classificação para item ${n}`)
 let resposta=q.resposta===0?'C':q.resposta===1?'E':q.anulada?'X':respostasFaltantes.get(n)
 assert.ok(resposta,`Resposta definitiva não confirmada no item ${n}`)
 const anulada=resposta==='X',pagina=Number(q.pagina),imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
 const texto=(correcoes.get(n)||q.enunciado).replace(/\s+/g,' ').trim()
 const ctx=contextoDe(n),d={id:q.id,sha256_enunciado:hashes.get(q.id),materia:tax[0],conteudo:tax[1],ano:2018,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — Conhecimentos Específicos — aplicada em 11/03/2018',cargo:'Oficial de Inteligência — Área 2 (Economia)',numero:n,numero_original:n,pagina,dificuldade:faceis.has(n)?'Fácil':dificeis.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na interpretação econômica, matemática e estatística exigida; não é índice psicométrico oficial.',resposta_correta:anulada?null:resposta==='C'?0:1,anulada,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_378_ABIN_002_01.PDF',sha256:hashRevisao(pendentes.map(x=>`${x.numero}:${x.resposta===0?'C':x.resposta===1?'E':x.anulada?'X':respostasFaltantes.get(Number(x.numero))}`).join('|')),numero:n,resposta,criterio:'Gabarito definitivo oficial do Cargo 1 — Oficial de Inteligência — Área 2; itens já registrados foram conferidos e respostas ausentes reconstruídas por resolução do enunciado e confrontadas com a fonte oficial.'},classificacao_fonte:prova,motivo:`Classificação baseada no item, no contexto do caderno oficial e no conteúdo específico de Economia da Área 2.`,texto_apoio:ctx,visual:{pagina,imagem,enunciado:texto,texto_apoio:ctx,motivo:`Página ${pagina} conferida visualmente; contexto e elementos matemáticos do caderno preservados.`},apta_resolucao:true,remover_pendencias:remover}
 if(texto!==q.enunciado.replace(/\s+/g,' ').trim())d.enunciado=texto
 return d
})
assert.equal(decisoes.length,74)
assert.deepEqual(decisoes.filter(x=>x.anulada).map(x=>x.numero),[63])
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,recortes:74,itens_unicos:74,anulada:[63],respostas_reconstruidas:[83,84,141,142,148,149,150],paginas_conferidas:[1,2,3,4,5,6],formulas_e_contextos_corrigidos:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,edital,concurso,recortes_revisados:74,itens_unicos:74,anuladas:[63],respostas_reconstruidas:[83,84,141,142,148,149,150],paginas_conferidas:[1,2,3,4,5,6],publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## ABIN 2018 — Oficial de Inteligência, Área 2 (Economia) — revisão v483\n\n- Classifiquei os 74 itens pendentes em macroeconomia, microeconomia, economia brasileira e internacional, sistema financeiro, estatística e econometria. Registrei aplicação em 11/03/2018, ano, cargo, banca e dificuldade estimada item a item.\n- Conferi visualmente as páginas 1–6, corrigi os símbolos de fórmulas de Slutsky, produtividade, custos, amostra e ARMA, removendo texto-base de outros itens que havia sido anexado pelo OCR. Contextos e páginas originais permanecem associados.\n- Vinculei o gabarito definitivo oficial. O item 63 foi anulado. Reconstruí por resolução os itens 83, 84, 141, 142 e 148–150, confrontando-os com o gabarito e os dados do caderno.\n- Pacote local, ainda não publicado na nuvem.\n- Fontes: [prova oficial](<${prova}>), [gabarito definitivo](<${gabarito}>), [edital oficial](<${edital}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
