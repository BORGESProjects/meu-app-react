import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const nome='revisao-anp-2022-atividade3-infraestrutura-movimentacao-v539',doc='8c0040b1b61cf47d'
const base='tmp/revisao-profissional/revisao-ansa-2026-enfase25-mecanica-v538/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/anp_22_pss/arquivos/725_ANP_003_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/anp_22_pss/arquivos/GAB_DEFINITIVO_725_ANP_003_01.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(raw.length,71)
const answerText='51:C|52:E|53:C|54:E|55:E|56:E|57:C|58:C|59:E|60:C|61:C|62:E|63:C|64:E|65:E|66:C|67:E|68:E|69:C|70:C|71:E|72:C|73:C|74:E|75:E|76:C|77:E|78:C|79:C|80:E|81:E|82:C|83:E|84:E|85:E|86:C|87:E|88:E|89:E|90:C|91:C|92:E|93:C|94:C|95:E|96:E|97:C|98:E|99:E|100:C|101:C|102:E|103:C|104:E|105:C|106:E|107:E|108:C|109:C|110:E|111:E|112:E|113:C|114:C|115:E|116:C|117:X|118:C|119:E|120:E'
const key=new Map(answerText.split('|').map(s=>{const[n,a]=s.split(':');return[+n,a]}))
const classification=[
 [[51,53],'Logística','Logística e suprimento de derivados: escolha do modal, nível de serviço e custos de setup'],
 [[54,58],'Petróleo e Gás Natural','Transporte dutoviário e estrutura regulatória da indústria de gás natural'],
 [[59,62],'Petróleo e Gás Natural','Upstream, poços estratigráficos, plataformas autoeleváveis e completação de poços'],
 [[63,70],'Petróleo e Gás Natural','Gasodutos, transferência e armazenamento; medição fiscal e transporte de GNL'],
 [[71,81],'Combustíveis e Biocombustíveis','Propriedades físicas, qualidade e parâmetros de combustíveis líquidos e biodiesel'],
 [[82,86],'Química do Petróleo','Formação do petróleo, craqueamento, álcool hidratado, gás natural e contaminantes'],
 [[87,90],'Química Orgânica','Funções orgânicas, álcoois, hidrocarbonetos e alcanos'],
 [[91,95],'Legislação do Petróleo e Gás','Lei do Petróleo, política energética, recursos petrolíferos e autorização de atividades'],
 [[96,100],'Legislação do Gás Natural','Transporte, acondicionamento, comercialização e áreas de mercado de capacidade'],
 [[101,110],'Regulação e Segurança Operacional','Autorizações de instalações, gestão de segurança, terminais e transporte aquaviário'],
 [[111,115],'Língua Inglesa','Compreensão e inferência textual: sanções econômicas, exportação e preços do petróleo'],
 [[116,120],'Língua Inglesa','Compreensão textual: impactos ambientais da produção de petróleo e gás']
]
const russia=`Russia is making heaps of money from oil, but there is a way to stop that\n\nThe United States and its allies are leaning heavily on economic sanctions to punish Russia for its invasion of Ukraine. But a key element in that strategy, restrictions on Russian oil exports, mostly appears to be causing pain for ordinary people in other countries. European nations, in particular, are causing considerable damage to their own economies without reducing Russia’s oil revenue.\n\nNations seeking to help Ukraine have focused on reducing Russia’s energy exports instead of reducing Russia’s earnings from energy exports. Russia is exporting less oil but, in a perverse twist, it is earning more money. The sanctions have raised prices, more than offsetting the decline in exports. In May 2022, Russia earned 883 million euros per day from oil exports, up from 633 million euros per day in May 2021.\n\nNew sanctions that the European Union and Britain have agreed to impose on Russia by year’s end are likely to drive oil prices even higher. Some analysts warn that the price for a barrel could exceed $200, well above the spike in the early weeks of the war, when oil prices topped out around $124.`
const environment=`Environmental and economic impacts of crude oil and natural gas production in developing countries\n\nEnvironmental impacts that occur during the production of crude oil would mostly occur from long-term habitat change within the oil and gas field, production activities (including facility component maintenance or replacement), waste management (e.g. produced water), noise (e.g. from well operations, compressor or pump stations, flare stack, vehicle and equipment), the presence of workers and potential spills.\n\nThe adverse environmental impacts which could happen during production of crude oil and natural gas include: disturbance of wildlife due to noise and human activity; exposure of biota to contaminants; and mortality of biota resulting from collisions against aboveground facilities or with vehicles. The presence of production wells, ancillary facilities and access road reduces habitat quality, disturbs the biota and thus affects ecological resources. Discharge of produced water inappropriately onto soil or into surface water bodies can result in salinity levels becoming too high to sustain plant growth.\n\nWildlife is always prone to have contact with petroleum-based products and other contaminants in reserve pits and water management facilities. Animals could become entrapped in the oil and drown, or they could ingest toxic quantities of oil, or succumb to cold stress if the oil damages the insulation provided by their feathers or fur.`
const contexts=[
 [[51,53],'A respeito da logística e do suprimento de derivados de petróleo, julgue os itens.'],
 [[54,58],'Considerando a estrutura da indústria de petróleo e gás natural e os termos regulatórios aplicáveis, julgue os itens.'],
 [[59,62],'Sobre a cadeia produtiva do petróleo, a exploração, a perfuração de poços e os sistemas de produção, julgue os itens.'],
 [[63,70],'Acerca das instalações de transferência e transporte de gás natural, das medições de petróleo e do transvasamento de GNL, julgue os itens.'],
 [[71,81],'Julgue os itens sobre características gerais de combustíveis líquidos, propriedades físicas, qualidade e parâmetros de biocombustíveis.'],
 [[82,86],'Considerando noções de química orgânica, formação e produção de petróleo, julgue os itens.'],
 [[87,90],'No que se refere às famílias de compostos orgânicos, julgue os itens.'],
 [[91,95],'Considerando as disposições da Lei do Petróleo, julgue os itens.'],
 [[96,100],'A respeito das atividades econômicas de transporte, escoamento, tratamento, processamento, armazenamento, liquefação, regaseificação e comercialização do gás natural, julgue os itens.'],
 [[101,110],'Considerando a regulamentação da ANP para construção e operação de instalações de movimentação, dutos, terminais e transporte aquaviário, julgue os itens.'],
 [[111,115],russia],[[116,120],environment]
]
const get=(a,n)=>a.find(([[lo,hi]])=>n>=lo&&n<=hi)?.[1]
const duplicate='extr-14c811bc4ba76d16adbe',canonical='extr-2c26ddb728796dfe20b2'
const decisions=[]
for(const q of raw){
 const n=+q.numero,answer=key.get(n),[materia,conteudo]=get(classification,n)||[],texto=get(contexts,n),isDuplicate=q.id===duplicate,annulled=answer==='X'
 assert.ok(answer&&materia&&conteudo&&texto,`Classificação/gabarito ausente: ${n}`)
 let enunciado=q.enunciado
 const cuts=[/\s*Com relação à estrutura da indústria de petróleo e do gás natural[\s\S]*$/,/\s*Sobre as características da cadeia produtiva do petróleo[\s\S]*$/,/\s*Acerca das instalações de transferência e transporte de gás natural[\s\S]*$/,/\s*Julgue os itens que se seguem, quanto às características gerais dos combustíveis líquidos[\s\S]*$/,/\s*Com relação a noções gerais de química orgânica[\s\S]*$/,/\s*No que se refere às famílias de compostos orgânicos[\s\S]*$/,/\s*Considerando as disposições da Lei do Petróleo[\s\S]*$/,/\s*Julgue os itens seguintes, a respeito da exploração das atividades econômicas[\s\S]*$/,/\s*No que se refere à regulamentação para a construção[\s\S]*$/,/\s*725003_01N\w+[\s\S]*$/,/\s*CEBRASPE\s*[–-]\s*ANP\s*[–-]\s*Edital:\s*2022[\s\S]*$/,/\s*Espaço livre[\s\S]*$/]
 for(const re of cuts)enunciado=enunciado.replace(re,'')
 enunciado=enunciado.replace(/\s+/g,' ').trim()
 if(isDuplicate)enunciado=raw.find(x=>x.id===canonical).enunciado.replace(/\s+/g,' ').trim()
 assert.ok(enunciado.length>20,`Enunciado insuficiente: ${n}/${q.id}`)
 const page=+q.pagina,img=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const dificuldade=n>=59&&n<=70||n>=91&&n<=110?'Difícil':n>=82&&n<=90?'Média':n>=111?'Média':'Média'
 const motivo=isDuplicate?`Registro OCR duplicado do item 76; a ocorrência íntegra ${canonical} foi mantida e esta duplicata foi excluída da resolução.`:`Item ${n} confrontado com o caderno e o gabarito definitivo oficiais da ANP — Atividade 3, aplicação em 09/10/2022. Classificação específica pelo conteúdo cobrado.`
 const meta={materia,conteudo,ano:2022,banca:'CEBRASPE',organizadora:'CEBRASPE',concurso:'Agência Nacional do Petróleo, Gás Natural e Biocombustíveis (ANP) — Processo Seletivo Simplificado 2022',cargo:'Atividade 3 — Fiscalização de Infraestrutura e Movimentação',aplicacao:'09/10/2022',numero_original:n,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade regulatória, técnica ou linguística; a banca não divulgou nível individual.',classificacao_fonte:prova,motivo,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:annulled||isDuplicate?null:answer==='C'?0:1,anulada:annulled,texto_apoio:texto,gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito oficial definitivo — Atividade 3: Fiscalização de Infraestrutura e Movimentação, aplicação em 09/10/2022',item:n,resposta:annulled?'Anulada':answer,fonte:'CEBRASPE'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']}
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),...meta,enunciado,pagina:page,visual:{pagina:page,imagem:img,motivo:n>=111?'Página original com o texto-base em inglês preservada e transcrita integralmente para leitura contínua.':'Página correspondente do caderno oficial preservada para conferir contexto e formatação.'},apta_resolucao:!annulled&&!isDuplicate,correcao_automatica:!annulled&&!isDuplicate,...(isDuplicate?{inelegibilidade_motivo:'duplicata_ocr_item_76',duplicada_de:canonical}:{})})
}
assert.equal(decisions.length,71)
assert.deepEqual(decisions.filter(x=>x.anulada).map(x=>x.numero_original),[117])
assert.deepEqual(decisions.filter(x=>x.id===duplicate).map(x=>x.duplicada_de),[canonical])
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,concurso:'ANP — PSS 2022 — Atividade 3: Fiscalização de Infraestrutura e Movimentação',aplicacao:'09/10/2022',nota:'71 registros processados. Itens 51–120 classificados e conferidos no gabarito oficial definitivo; item 117 anulado. Uma duplicata OCR do item 76 foi marcada inelegível, mantendo-se a ocorrência canônica. Textos-base integrais em inglês dos itens 111–115 e 116–120 foram associados às respectivas questões.'},null,2))
console.log(JSON.stringify({...result,documento:doc,registros_revisados:71,itens_unicos:70,anuladas:[117],duplicatas_excluidas:1,prova_oficial:prova,gabarito_oficial:gabarito}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)

