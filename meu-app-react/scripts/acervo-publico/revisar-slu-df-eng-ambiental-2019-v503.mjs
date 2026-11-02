import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-slu-df-eng-ambiental-2019-v503', documento='78e105a68cad6b8e'
const prova='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/9_449_SLUDF_009_00_COM_JUST.PDF'
const justificativa='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/SLU_DF_19_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO_V_1_L.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/ED_1_SLU_DF__ABT.PDF'
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
const paginas=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${documento}.json.gz`)))
assert.equal(pendentes.length,74);assert.equal(paginas.length,6)
const pageOf=n=>n<=63?1:n<=76?2:n<=90?3:n<=103?4:n<=114?5:6
const faixas=[
 [[51,53],'Geografia','Geoprocessamento e sistemas de informação geográfica'],
 [[54,58],'Geografia','Sensoriamento remoto e biomas brasileiros'],
 [[59,59],'Ecologia','Fluxo de energia e eficiência ecológica'],
 [[60,62],'Geografia','Sensoriamento remoto: sensores e imagens de satélite'],
 [[63,64],'Engenharia Ambiental','Hidráulica: escoamento em tubulações'],
 [[65,65],'Climatologia','Elementos e fatores climáticos'],
 [[66,68],'Hidrologia','Ciclo hidrológico e balanço hídrico'],
 [[69,76],'Engenharia Sanitária','Abastecimento de água, tratamento e esgotamento sanitário'],
 [[77,80],'Engenharia Ambiental','Resíduos sólidos, aterros sanitários e drenagem urbana'],
 [[81,85],'Urbanismo','Planejamento urbano e Estatuto da Cidade'],
 [[86,90],'Legislação Ambiental','Sistema Nacional de Unidades de Conservação (SNUC)'],
 [[91,94],'Defesa Civil','Gestão de riscos e desastres'],
 [[95,97],'Avaliação de Impacto Ambiental','Impactos, riscos e licenciamento ambiental'],
 [[98,100],'Economia Ambiental','Valoração de danos ambientais e serviços ecossistêmicos'],
 [[101,103],'Saúde Ambiental','Poluição, desmatamento e doenças vetoriais'],
 [[104,106],'Epidemiologia','Indicadores de incidência e mortalidade por leishmaniose'],
 [[107,108],'Segurança do Trabalho','Exposição ocupacional à sílica e resíduos de serviços de saúde'],
 [[109,112],'Direito Ambiental','Crimes ambientais, poluição e responsabilidade'],
 [[113,113],'Legislação Ambiental','Proteção do Cerrado e Código Florestal'],
 [[114,118],'Agrotóxicos','Registro, importação e logística reversa de agrotóxicos'],
 [[119,120],'Educação Ambiental','Política Nacional e diretrizes do CONAMA']
]
const classifica=n=>{const x=faixas.find(([r])=>n>=r[0]&&n<=r[1]);assert.ok(x,`classificação ${n}`);return x.slice(1)}
const dup=new Map([
 ['extr-d77556b06477cba4eb62','extr-6e412f812b9c1fa2915b'],['extr-480ef1c4385f99f95576','extr-6d0679a7d5e327857bec'],
 ['extr-0fbfed5e204648082176','extr-4330cff35fba16011557'],['extr-66bbe0229bd4e9ad045d','extr-efbac0aa7a47359d5d35'],
 ['extr-0ee632819f3be17809d5','extr-9a9eb1a3663848268402'],['extr-0a0435e2e37aeb9419bd','extr-e347c91e18790d47fb2d'],
 ['extr-35dc2b74f81c4462574f','extr-6f77ddf810b15e74930b'],['extr-53cdea8858208bffb165','extr-a22e8665a057cabe114b']
])
const porNum=new Map();for(const q of pendentes){if(dup.has(q.id))continue;const arr=porNum.get(q.numero)||[];arr.push(q);porNum.set(q.numero,arr)}
assert.equal(porNum.size,66)
const lim=x=>String(x||'').replace(/\s+/g,' ').trim()
const normaliza=x=>lim(x).replace(/\s*JUSTIFICATIVA\s*-\s*(?:CERTO|ERRADO)[\s\S]*$/i,'').replace(/\s+/g,' ').trim()
const textoCompleto=paginas.join('\n')
const marcadores=[...textoCompleto.matchAll(/(?:^|\n)\s*(\d{1,3})\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/g)].filter(m=>+m[1]>=51&&+m[1]<=120)
assert.equal(marcadores.length,70)
const itens=new Map();for(let i=0;i<marcadores.length;i++){const n=+marcadores[i][1],start=marcadores[i].index+marcadores[i][0].length, end=i+1<marcadores.length?marcadores[i+1].index:textoCompleto.length;itens.set(n,textoCompleto.slice(start,end))}
const respostas=[];const decisoes=[]
for(const [n,records] of [...porNum].sort((a,b)=>a[0]-b[0])){
 assert.equal(records.length,1,`registro unico item ${n}`);const q=records[0],raw=itens.get(n);assert.ok(raw,`texto oficial item ${n}`)
 const m=raw.match(/JUSTIFICATIVA\s*[-–]\s*(CERTO|ERRADO)\s*\.\s*([\s\S]*?)(?=(?:\n\s*(?:Figura|Texto|Gráfico|Tabela|Julgue|A respeito|Considerando|Com relação|No que|À luz|Acerca|Em relação|De acordo|De|O|A)\b)|$)/i)
 const answer=m?.[1]?.toUpperCase();assert.ok(answer,`gabarito oficial no texto do item ${n}`)
 const anulada=n===58
 let stem=lim(raw.split(/JUSTIFICATIVA\s*[-–]\s*(?:CERTO|ERRADO)/i)[0])
 stem=stem.replace(/CEBRASPE\s*[-–]\s*SLUDF\s*[-–]\s*Aplica(?:ção|cao):\s*2019/gi,' ').replace(/--\s*CONHECIMENTOS ESPECÍFICOS\s*--/gi,' ').replace(/\s+/g,' ').trim()
 if(stem.length<25)stem=normaliza(q.enunciado)
 assert.ok(stem.length>25,`enunciado ${n}`);assert.ok(!/JUSTIFICATIVA|CEBRASPE\s*[-–]\s*SLUDF/i.test(stem),`resíduo no enunciado ${n}`)
 const [materia,conteudo]=classifica(n),pagina=pageOf(n),imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
 const itensFaceis=[51,53,55,56,60,63,65,69,77,81,86,91,101,109,113,119],itensDificeis=[52,58,59,61,62,64,68,70,71,72,73,74,75,76,80,84,85,88,90,94,96,97,98,99,100,104,105,106,107,110,111,112,114,115,116,117,118,120]
 const dificuldade=itensFaceis.includes(n)?'Fácil':itensDificeis.includes(n)?'Difícil':'Média'
 const canonical=answer==='CERTO'?'C':'E';respostas.push(`${n}:${anulada?'X':canonical}`)
 const motivo=`CEBRASPE, SLU/DF 2019, cargo 9 — Engenharia Ambiental, item ${n}; matéria e conteúdo identificados pela leitura do enunciado e do bloco temático do caderno oficial.`
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2019,concurso:'SLU/DF 2019 — Cargo 9: Analista de Gestão de Resíduos Sólidos — Engenharia Ambiental',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'19/05/2019',cargo:'Analista de Gestão de Resíduos Sólidos — Engenharia Ambiental (Cargo 9)',numero_original:n,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual ou de cálculo; não publicada pela banca.',classificacao_fonte:prova,motivo,enunciado:stem,opcoes:['Certo','Errado'],resposta_correta:anulada?null:answer==='CERTO'?0:1,anulada,gabarito_oficial:{fonte:prova,arquivo:'9_449_SLUDF_009_00_COM_JUST.PDF',numero:n,resposta:anulada?'X':canonical,criterio:anulada?'Item 58 anulado no resultado definitivo; justificativa oficial registra insuficiência de dados para determinar produtividade.':'Gabarito cotejado com a justificativa individual CERTO/ERRADO impressa no caderno oficial do cargo 9.',sha256:createHash('sha256').update(respostas.join('|')).digest('hex'),sha256_tipo:'sha256_da_transcricao_canonica_dos_itens_revisados; nao_e_hash_do_pdf'},comentario:lim(m?.[2]||''),texto_apoio:'',visual:{pagina,imagem,motivo:`Imagem da página ${pagina} da prova oficial, conferida para associar o enunciado e os elementos gráficos ao item ${n}.`},imagens_contexto:n===64?[{pagina:1,imagem:`paginas/${documento}-0001.webp`,texto:'Continuação do enunciado iniciado na página anterior.'}]:n>=115&&n<=118?[{pagina:5,imagem:`paginas/${documento}-0005.webp`,texto:'Contexto do caso de importação de agrotóxicos iniciado na página anterior.'}]:[],apta_resolucao:true,anulada:anulada,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','alternativas_invalida','alternativa_vazia','visual_ausente']})
}
// O item 58 foi anulado por insuficiência de dados no gabarito definitivo.
const anulada=decisoes.find(d=>d.numero_original===58);anulada.gabarito_oficial.fonte=justificativa;anulada.gabarito_oficial.criterio='Gabarito definitivo: item anulado por insuficiência de dados para determinar a produtividade; justificativa oficial do CEBRASPE.'
for(const [id,mantida] of dup){const q=pendentes.find(x=>x.id===id);assert.ok(q);decisoes.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Engenharia Ambiental',conteudo:'Registro duplicado consolidado com a questão equivalente da mesma edição',ano:2019,concurso:'SLU/DF 2019 — Cargo 9: Engenharia Ambiental',banca:'CEBRASPE',numero_original:q.numero,pagina:q.pagina,apta_resolucao:false,duplicada_de:mantida,inelegibilidade_motivo:'duplicata_exata_de_item_da_mesma_prova'})}
assert.equal(decisoes.length,74);assert.equal(new Set(decisoes.map(x=>x.id)).size,74)
const hashChave=createHash('sha256').update(respostas.join('|')).digest('hex');for(const d of decisoes)if(d.gabarito_oficial)d.gabarito_oficial.sha256=hashChave
console.log(JSON.stringify({pacote:nome,itensUnicos:porNum.size,duplicatas:dup.size,anulada:58,amostras:decisoes.filter(d=>[51,58,64,80,104,115,120].includes(d.numero_original)).map(d=>({n:d.numero_original,area:d.materia,conteudo:d.conteudo,stem:d.enunciado?.slice(0,100),resp:d.resposta_correta,comentario:d.comentario?.slice(0,100),pagina:d.pagina,duplicata:d.apta_resolucao===false}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
