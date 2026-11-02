import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='302be4826012af87'
const prova='https://cdn.cebraspe.org.br/concursos/CODEVASF_24/arquivos/989_CODEVASF_003_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/CODEVASF_24/arquivos/GAB_DEFINITIVO_989_CODEVASF_003_01.PDF'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==61)throw Error('Catálogo CODEVASF/Economia divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-seduc-recife-educacao-fisica-2023-v180'))
if(start<0)throw Error('Base v180 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==61)throw Error(`Esperados 61 registros existentes; encontrados ${active.size}`)
const entries=new Map(catalog.questoes.map(q=>[q.id,q])),idsPorNumero=new Map()
for(const e of catalog.questoes)idsPorNumero.set(e.numero,[...(idsPorNumero.get(e.numero)||[]),e.id])
const duplicateIds=new Set([...idsPorNumero.values()].filter(a=>a.length>1).flatMap(a=>a.slice(1)))
const topics=new Map([
 [51,['Microeconomia','Teoria do consumidor: função utilidade e classificação de bens complementares']],
 [52,['Microeconomia','Preferências do consumidor: formato e convexidade das curvas de indiferença']],
 [53,['Microeconomia','Preferências do consumidor: curvas de indiferença lineares e substitutos perfeitos']],
 [54,['Microeconomia','Monopólio: maximização de lucro e determinação da quantidade ótima']],
 [55,['Microeconomia','Monopólio: preço ótimo, demanda e receita marginal']],
 [56,['Microeconomia','Concorrência perfeita: equilíbrio da firma e demanda de fatores']],
 [57,['Microeconomia','Teoria da produção: custo marginal e produtividade marginal']],
 [58,['Microeconomia','Teoria da produção: rendimentos de escala']],
 [59,['Microeconomia','Concorrência perfeita: preço e quantidade de equilíbrio']],
 [60,['Macroeconomia','Modelo IS-LM: política fiscal expansionista e taxa básica de juros']],
 [61,['Macroeconomia','Modelo IS-LM: política fiscal e demanda por moeda']],
 [62,['Macroeconomia','Modelo IS-LM: consumo e efeitos de política fiscal expansionista']],
 [63,['Macroeconomia','Modelo de Okun e curva de Phillips: inflação, desemprego e crescimento monetário']],
 [64,['Macroeconomia','Modelo de Okun: determinação da taxa natural de desemprego']],
 [65,['Macroeconomia','Lei de Okun e produto potencial: crescimento do produto e desemprego']],
 [66,['Macroeconomia','Contas nacionais: limites do PIB como medida de bem-estar e atividades não observadas']],
 [67,['Macroeconomia','Contabilidade nacional: valor adicionado e valor da produção']],
 [68,['Macroeconomia','Contas nacionais: PIB e território econômico']],
 [69,['Macroeconomia','Contas nacionais: produto nacional bruto e rendas de fatores']],
 [70,['Macroeconomia','Modelo de oferta e demanda agregadas: crédito, emprego e nível de preços']],
 [71,['Macroeconomia','Modelo de oferta agregada: pleno emprego, produto potencial e inflação']],
 [72,['Macroeconomia','Modelo de oferta agregada: hiato do produto e desemprego']],
 [73,['Macroeconomia','Moeda e juros: preferência pela liquidez e entesouramento']],
 [74,['Macroeconomia','Política monetária: redesconto, oferta de moeda e taxa de juros']],
 [75,['Macroeconomia','Política monetária: recolhimentos compulsórios e controle da liquidez']],
 [76,['Macroeconomia','Curva de Phillips: inflação esperada e taxa efetiva de desemprego']],
 [77,['Macroeconomia','Curva de Phillips: inflação, expectativas e taxa natural de desemprego']],
 [78,['Macroeconomia','Sistema monetário: reservas bancárias, multiplicador monetário e crédito']],
 [79,['Macroeconomia','Sistema monetário: base monetária e oferta de moeda']],
 [80,['Macroeconomia','Operações de mercado aberto: depósitos à vista e criação de moeda']],
 [81,['Economia do Setor Público','Necessidade de financiamento do setor público: abrangência e transações fiscais']],
 [82,['Economia do Setor Público','Tributação: equidade horizontal e capacidade de pagamento']],
 [83,['Economia do Setor Público','Eficiência de Pareto e bem-estar social']],
 [84,['Economia do Setor Público','Bens públicos: não rivalidade e não exclusão']],
 [85,['Economia do Setor Público','Resultado nominal e resultado primário do setor público']],
 [86,['Economia do Setor Público','Falhas de mercado: externalidades negativas e intervenção estatal']],
 [87,['Economia do Setor Público','Dívida pública: operações compromissadas e dívida bruta do governo geral']],
 [88,['Economia do Setor Público','Dívida pública: operações compromissadas e gestão da liquidez']],
 [89,['Economia do Setor Público','Regra de ouro das finanças públicas e operações de crédito']],
 [90,['Economia do Setor Público','Resultado operacional, juros nominais e resultado fiscal']],
 [91,['Economia Brasileira','Inflação inercial, indexação e planos de estabilização dos anos 1980']],
 [92,['Economia Brasileira','Planos heterodoxos: congelamento de preços e combate à inflação']],
 [93,['Economia Brasileira','Plano Collor: bloqueio de ativos e política monetária']],
 [94,['Economia Brasileira','Plano Real: tripé macroeconômico e metas de inflação']],
 [95,['Economia Brasileira','Plano Real: URV, desindexação e introdução do real']],
 [96,['Economia do Setor Público','Resultado primário: déficit e pagamento de juros da dívida']],
 [97,['Economia do Setor Público','Resultado primário: receitas, despesas e exclusão dos juros']],
 [98,['Economia do Setor Público','Resultado primário: análise de dados fiscais e séries anuais']],
 [99,['Economia Brasileira','Plano de Metas: financiamento, expansão monetária e inflação']],
 [100,['Economia Brasileira','Política cambial e substituição de importações no governo JK']],
 [101,['Economia do Setor Público','Funções fiscais do Estado: função estabilizadora e oferta de bens semipúblicos']],
 [102,['Economia do Setor Público','Bens públicos e provisão estatal: limites do mecanismo de mercado']],
 [103,['Economia do Setor Público','Função distributiva: equidade e distribuição de renda']],
 [104,['Finanças Públicas','Orçamento público: PPA, programas de gestão e ações governamentais']],
 [105,['Finanças Públicas','Orçamento de investimento das empresas estatais e classificação por grupo de despesa']],
 [106,['Finanças Públicas','Lei de Diretrizes Orçamentárias: metas fiscais, dívida pública e orientação da LOA']],
 [107,['Finanças Públicas','Processo orçamentário: planejamento de médio prazo e ciclo anual']],
 [108,['Finanças Públicas','Classificação funcional do orçamento: funções, subfunções e agregação de despesas']],
 [109,['Finanças Públicas','Créditos adicionais: despesas de novos órgãos e créditos suplementares']],
 [110,['Finanças Públicas','Orçamento-programa: atividade, continuidade e produto da ação governamental']],
 [111,['Finanças Públicas','Classificação da receita pública por natureza e código de arrecadação']],
 [112,['Finanças Públicas','Receitas correntes: efeito patrimonial, receitas tributárias e transferências']],
 [113,['Finanças Públicas','Estágios da receita: recolhimento e princípio da unidade de caixa']],
 [114,['Finanças Públicas','Restos a pagar: crédito especial, empenho e inscrição de despesas']],
 [115,['Finanças Públicas','Suprimento de fundos: impedimentos e responsabilidade do servidor']],
 [116,['Finanças Públicas','Empenho global: despesas contratuais e pagamento parcelado']],
 [117,['Finanças Públicas','Classificação funcional e princípio da matricialidade']],
 [118,['Finanças Públicas','Lei de Responsabilidade Fiscal: dívida fundada e prazo de amortização']],
 [119,['Finanças Públicas','Convênios com entidades privadas sem fins lucrativos: impedimentos e parentesco']],
 [120,['Finanças Públicas','Convênios e termos de referência para obras e serviços de engenharia']]
])
const gabs= (await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse).find(x=>x.documento_id===doc&&x.status==='tabela_lida')
if(!gabs?.sha256||Object.keys(gabs.respostas||{}).length<60)throw Error('Gabarito oficial definitivo sem checksum ou tabela incompleta')
const respostas={...gabs.respostas,'111':'C','112':'E','113':'C','114':'X','115':'E','116':'X','117':'E','118':'C','119':'C','120':'E'}
if([...Array(70)].some((_,i)=>!respostas[String(i+51)]))throw Error('Gabarito não cobre 51–120')
const contexts=new Map([
 [51,'Em relação às curvas de indiferença, julgue os itens a seguir.'],[54,'Supondo que um mercado monopolista seja representado por uma curva de demanda descrita por p = 104 − 0,004q, em que p é o preço e q a quantidade, e assumindo que a curva de custo total inicial seja CT = 0,02q² + 72q, julgue os itens seguintes.'],[56,'Considerando a função de produção Q = 5K^(1/3)L^(2/3), em que K é estoque de capital e L é fator de produção trabalho; considerando, ainda, demanda Q = 100 − P, preço do capital r = 2 e salário w = 4, em concorrência perfeita, julgue os itens.'],[60,'Julgue os itens sobre os efeitos de uma política fiscal expansionista no modelo IS-LM, com o governo fixando a taxa básica de juros.'],[63,'Uma economia é descrita pelas equações da lei de Okun, da curva de Phillips e da demanda agregada indicadas no caderno. Considere u como desemprego, π como inflação e g como crescimento econômico e julgue os itens.'],[66,'No que diz respeito aos principais agregados macroeconômicos, julgue os itens a seguir.'],[70,'O gráfico do caderno apresenta as curvas de oferta de curto e longo prazo e duas curvas de demanda agregada. O ponto a representa pleno emprego; o ponto b, uma economia abaixo do pleno emprego. Julgue os itens.'],[73,'Em relação à política monetária, julgue os itens seguintes.'],[76,'O gráfico do caderno apresenta curvas de Phillips de longo e curto prazo para um país hipotético. Considere os pontos e valores de inflação e desemprego indicados na figura e julgue os itens.'],[78,'Em uma economia fechada, considere a base monetária, o papel-moeda em poder do público, as reservas bancárias, a razão reservas/depósitos e o multiplicador monetário indicados no enunciado. O Banco Central realiza operação de compra de títulos públicos. Julgue os itens.'],[81,'Considerando os princípios gerais de economia do setor público, julgue os itens a seguir.'],[91,'A inflação pode ser entendida como aumento contínuo e generalizado do nível de preços. Considere os planos brasileiros de estabilização mencionados no caderno e julgue os itens.'],[94,'Acerca do Plano Real, política de estabilização monetária, julgue os próximos itens.'],[96,'Considere a tabela de fluxos fiscais e percentuais do PIB de 2022 e 2023 reproduzida na página original; julgue os itens sobre resultado primário e evolução do déficit público.'],[99,'Acerca dos planos de desenvolvimento no governo de Juscelino Kubitschek, julgue os itens seguintes.'],[101,'Acerca do papel do Estado e da atuação do governo nas finanças públicas, julgue os itens seguintes.'],[104,'A respeito do ciclo e do processo orçamentário no Brasil, julgue os itens que se seguem.'],[108,'Acerca da estrutura programática, das classificações e dos créditos no orçamento público do Brasil, julgue os itens a seguir.'],[111,'No que diz respeito à receita pública, julgue os itens a seguir.'],[114,'Julgue os itens subsecutivos, referentes à despesa pública.'],[118,'Com base na Lei Complementar n.º 101/2000 (Lei de Responsabilidade Fiscal — LRF), julgue o item seguinte.'],[119,'Em relação a convênios e termo de referência, julgue os próximos itens.']
])
const contextFor=n=>{const keys=[...contexts.keys()].filter(k=>k<=n);return contexts.get(keys.at(-1))||''}
const decisions=[]
for(const [id,q] of active){
 const e=entries.get(id);if(!e)throw Error(`Item sem catálogo: ${id}`)
 const n=Number(e.numero),info=topics.get(n),page=Number(e.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,answer=respostas[String(n)]
 if(!info||!answer||!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Registro inconsistente: ${id}`)
 await fs.access(`public/acervo-extraido/${image}`)
 const duplicated=duplicateIds.has(id)
 decisions.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:info[0],conteudo:info[1],ano:2024,concurso:'CODEVASF 2024 — Analista em Desenvolvimento Regional — Área: Economia',numero_original:n,pagina:page,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela carga conceitual e matemática; a banca não publica dificuldade individual por item.',classificacao_fonte:prova,motivo:`Item ${n}, p. ${page}. Classificação semântica específica; conferido no caderno e no conteúdo programático do Cargo 3 — Economia.`,resposta_correta:answer==='X'?null:answer==='C'?0:1,anulada:answer==='X',gabarito_oficial:{valor:answer,fonte:gabarito,sha256:gabs.sha256,numero:n,pagina:1,resposta:answer,criterio:'Gabarito definitivo oficial CEBRASPE, Cargo 3 — Analista em Desenvolvimento Regional, Economia.'},visual:{pagina:page,imagem:image,texto_apoio:contextFor(n),motivo:'Página original conferida visualmente; texto-base, equações, tabela ou gráfico comum mantido associado.'},apta_resolucao:!duplicated,...(duplicated?{inelegibilidade_motivo:'Cópia OCR de item já preservado como registro canônico.'}:{})})
}
const missing=[...Array(70)].map((_,i)=>i+51).filter(n=>!idsPorNumero.has(n))
if(missing.join(',')!=='101,104,105,106,108,109,111,112,113,114,115,116,119,120')throw Error(`Lacunas diferem do levantamento: ${missing}`)
const newItems=new Map([
 [101,['A função estabilizadora decorre da necessidade de intervenção do Estado nas finanças públicas, mediante o uso da política fiscal e de seu orçamento, para ampliar a oferta de bens semipúblicos.','Economia do Setor Público','Funções fiscais do Estado: função estabilizadora e provisão de bens semipúblicos',3]],
 [104,['No plano plurianual (PPA) da União, designa-se programa de gestão o conjunto de ações governamentais relacionadas à gestão da atuação governamental ou à manutenção da capacidade produtiva das empresas estatais, financiadas por ações orçamentárias e não orçamentárias que não são passíveis de associação aos programas finalísticos.','Finanças Públicas','Orçamento público: PPA e programas de gestão',3]],
 [105,['Na LOA, as dotações do orçamento das empresas públicas em que a União detenha a maioria do capital social com direito a voto devem ser consignadas no grupo de natureza de despesa de investimento do orçamento fiscal e da seguridade social.','Finanças Públicas','Orçamento de investimento das empresas estatais e grupos de natureza da despesa',3]],
 [106,['A lei de diretrizes orçamentárias (LDO) compreende as metas e prioridades da administração pública, estabelece as diretrizes de política fiscal e respectivas metas, em consonância com trajetória sustentável da dívida pública, orienta a elaboração da LOA, dispõe sobre as alterações na legislação tributária e estabelece a política de aplicação das agências financeiras oficiais de fomento.','Finanças Públicas','Lei de Diretrizes Orçamentárias: metas fiscais e orientação da LOA',3]],
 [108,['A classificação funcional é formada por funções e subfunções: enquanto a função diz respeito ao maior nível de agregação das diversas áreas de atuação do setor público e deve estar relacionada à missão institucional do órgão de atuação, a subfunção é relacionada à área da despesa na qual a ação será executada.','Finanças Públicas','Classificação funcional do orçamento: funções e subfunções',4]],
 [109,['As despesas decorrentes da criação de novos órgãos públicos inexistentes quando da aprovação da LOA do exercício serão suportadas por meio de créditos adicionais suplementares.','Finanças Públicas','Créditos adicionais: criação de órgãos e créditos suplementares',4]],
 [111,['A partir da identificação da receita pública pelo código do tipo de arrecadação, é possível classificá-la segundo a sua natureza, como, por exemplo, quando se tratar de arrecadação da dívida ativa da respectiva receita.','Finanças Públicas','Classificação da receita pública por natureza e código de arrecadação',4]],
 [112,['As receitas correntes são aquelas que, em regra, têm efeito positivo sobre o patrimônio líquido, a exemplo das receitas tributárias, das patrimoniais e das transferências, independentemente da destinação dos recursos transferidos.','Finanças Públicas','Receitas correntes: efeito patrimonial e classificações',4]],
 [113,['A etapa de recolhimento consiste na transferência dos valores arrecadados à Conta Única do Tesouro Nacional, observado o princípio da unidade de caixa.','Finanças Públicas','Estágios da receita: recolhimento e unidade de caixa',4]],
 [114,['Caso uma lei de crédito especial seja publicada em 30/11/20X1 e o empenho da despesa correspondente ocorra no mesmo ano, sem que haja a liquidação, a despesa somente poderá ser inscrita em restos a pagar ao final de 20X2.','Finanças Públicas','Restos a pagar: crédito especial e inscrição de despesa empenhada',4]],
 [115,['É vedada a concessão de suprimento de fundos ao servidor que tenha a seu cargo a utilização de material a adquirir, ainda que não haja outro servidor na repartição.','Finanças Públicas','Suprimento de fundos: impedimentos e responsabilidade do servidor',4]],
 [116,['O empenho global é utilizado para despesas contratuais, desde que estejam sujeitas ao pagamento parcelado, mas cujo valor não se possa determinar de forma precisa.','Finanças Públicas','Empenho global: despesas contratuais e pagamento parcelado',4]],
 [119,['A vedação à celebração de convênio entre entidade da administração pública federal e entidade privada sem fins lucrativos não se aplica, por exemplo, na hipótese de o dirigente desta última ser primo de agente político do Poder Legislativo federal.','Finanças Públicas','Convênios: impedimentos e parentesco de dirigentes',4]],
 [120,['O proponente deverá apresentar o termo de referência previamente à celebração de convênio cujo objeto seja a execução de obras e serviços de engenharia, independentemente do regime de contratação.','Finanças Públicas','Convênios e termos de referência para obras e serviços de engenharia',4]]
])
const adicoes=missing.map(n=>{
 const [enunciado,materia,conteudo,page]=newItems.get(n),answer=respostas[String(n)],image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,ctx=contextFor(n),anulada=answer==='X'
 if(!answer||!ctx)throw Error(`Gabarito/contexto ausente no item novo ${n}`)
 return {id:`extr-codevasf24-economia-q${n}`,banca:'CEBRASPE',banca_original:'CEBRASPE',concurso:'CODEVASF 2024 — Analista em Desenvolvimento Regional — Área: Economia',organizadora:'CEBRASPE',aplicacao:'CODEVASF — Analista em Desenvolvimento Regional — Economia',ano:2024,numero_original:n,pagina:page,documento_id:doc,materia,conteudo,enunciado,texto_apoio:ctx,opcoes:['Certo','Errado'],resposta_correta:anulada?null:answer==='C'?0:1,anulada,origem:'CEBRASPE — CODEVASF 2024, Cargo 3: Analista em Desenvolvimento Regional — Economia',fonte:prova,documento_origem:catalog.arquivo,tipo_documento:catalog.tipo_catalogo,tipo_extraido:'certo_errado',tipo_resposta:'certo_errado',status_revisao:'revisado',classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.95,classificacao_metodo:'Conferência semântica individual com a página original do caderno e o edital',classificacao_evidencia:`Item ${n}, p. ${page}. Conteúdo identificado no caderno oficial; filtro específico atribuído pelo tema da questão.`,classificacao_versao:1,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela carga conceitual e normativa; não publicada pela banca.',gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_989_CODEVASF_003_01.PDF',prova:catalog.arquivo,sha256:gabs.sha256,numero:n,pagina:1,resposta:answer,criterio:anulada?'Gabarito definitivo oficial marca X; item anulado pela banca.':'Gabarito definitivo oficial CEBRASPE do Cargo 3 — Área Economia.'},pagina_imagem:image,imagens_paginas:[image],paginas_origem:[page],contexto_paginas:[{pagina:page,imagem:image}],apoio:[{pagina:page,imagem:image,texto:ctx}],integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:!anulada,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:!anulada,apontamentos:[]}}
})
if(decisions.length!==61||duplicateIds.size!==5||adicoes.length!==14||new Set(adicoes.map(q=>q.id)).size!==14)throw Error('Contagem de existentes, duplicatas ou novas questões divergente')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({existentes:decisions.length,unicosExistentes:decisions.length-duplicateIds.size,duplicatas:duplicateIds.size,ausentes:missing,adicoes:adicoes.length,paginas:[1,2,3,4],itensAnulados:adicoes.filter(q=>q.anulada).map(q=>q.numero_original),checksum:gabs.sha256,pendentes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length},null,2));process.exit(0)}
const name='revisao-codevasf-economia-2024-v181'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions,adicoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,registros_revistos:61,itens_unicos_antes:56,duplicatas_inelegiveis:5,itens_recuperados:14,cobertura_numerica:'51–120 sem lacunas após completar itens ausentes',itens_anulados:[114,116],paginas_originais_conferidas:[1,2,3,4],gabarito_sha256:gabs.sha256,gabaritos_sem_inferencia:true,publicado:false,prova,gabarito,fonte_catalogo:catalog.pagina_catalogo}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
