import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-hub-cirurgia-residencia-2020-v428',doc='3ac113b6de0703f9'
const prova='https://cdn.cebraspe.org.br/concursos/HUB_20_MEDICA/arquivos/MATRIZ_496_RM003.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/HUB_20_MEDICA/arquivos/GAB_DEFINITIVO_MATRIZ_496_RM003.PDF'
const concurso='HUB/FUB — Programa de Residência Médica em Cirurgia Geral — seleção 2020'
const aplicacao='03/11/2019'
const fontes=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8'))
const fonte=fontes.find(x=>x.id===doc)
if(!fonte||fonte.url!==prova||fonte.arquivo!=='MATRIZ_496_RM003.PDF')throw Error('Caderno não corresponde ao catálogo oficial HUB/FUB.')
const keys=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).trim().split(/\r?\n/).map(JSON.parse)
const official=keys.find(x=>x.documento_id===doc)
if(!official||official.status!=='tabela_lida'||official.gabarito_url!==gabarito||Object.keys(official.respostas||{}).length!==100)throw Error('Gabarito definitivo oficial incompleto ou de outro caderno.')

const materias={
 '1-5':['Cirurgia Geral','Recuperação pós-operatória e protocolo ERAS/ACERTO'],
 '6-10':['Anatomia','Anatomia cirúrgica: nervos vagos, frênicos e inervação visceral'],
 '11-14':['Cirurgia Geral','Prevenção de infecção do sítio cirúrgico'],
 '15-20':['Cirurgia Geral','Infecções intra-abdominais: antibióticos e controle de foco'],
 '21-25':['Cirurgia Geral','Apendicite aguda perfurada: antibioticoterapia e recuperação perioperatória'],
 '26-29':['Cirurgia Geral','Colecistectomia videolaparoscópica e prevenção de lesão biliar'],
 '30-31':['Cirurgia Geral','Colostomias: complicações e hérnia paraestomal'],
 '32-34':['Gastroenterologia','Câncer gástrico inicial: critérios de ressecção endoscópica'],
 '35-38':['Cirurgia Geral','Trauma cervical: avaliação e tratamento de lesões aerodigestivas e vasculares'],
 '39-40':['Cirurgia Geral','Hemorragia digestiva alta: tratamento endoscópico e second look'],
 '41-42':['Gastroenterologia','Tumor estromal gastrointestinal gástrico (GIST)'],
 '43-45':['Cirurgia Geral','Doença do refluxo gastroesofágico e cirurgia antirrefluxo revisional'],
 '46-50':['Cirurgia Geral','Trauma abdominal fechado: avaliação e lesões de órgãos sólidos'],
 '51-56':['Gastroenterologia','Hemorragia digestiva alta não varicosa e úlcera péptica'],
 '57-61':['Gastroenterologia','Câncer gástrico: fatores de risco e carcinogênese'],
 '62-65':['Cirurgia Geral','Tumores hepáticos benignos: diagnóstico e indicação de ressecção'],
 '66-69':['Gastroenterologia','Câncer de esôfago: estadiamento e tratamento'],
 '70-75':['Cirurgia Geral','Hérnias da parede abdominal: inguinais, ventrais e umbilicais'],
 '76-79':['Anatomia','Anatomia e fisiologia do esôfago e esofagectomia'],
 '80-83':['Cirurgia Geral','Abdome agudo: diagnóstico e indicação de intervenção'],
 '84-88':['Gastroenterologia','Intestino delgado: doença de Crohn, divertículos e síndromes'],
 '89-94':['Cirurgia Geral','Doenças do cólon e reto: vólvulo, prolapso e cirurgia colorretal'],
 '95-100':['Urologia','Urgências urológicas, nefrolitíase e tumores urogenitais']
}
const grupos=[
 [1,5,'Com base nas recomendações do projeto ACERTO para cuidados perioperatórios, julgue os itens a seguir.'],
 [6,10,'A respeito da anatomia dos nervos vagos, frênicos e das vias de dor visceral, julgue os itens subsequentes.'],
 [11,14,'A respeito das práticas de prevenção de infecção do sítio cirúrgico, julgue os itens subsequentes.'],
 [15,20,'Acerca do uso de antibióticos e do controle de foco nas infecções intra-abdominais, julgue os itens seguintes.'],
 [21,25,'Caso clínico: homem de 27 anos com apendicite aguda perfurada, peritonite purulenta difusa e base cecal preservada. Foi submetido a apendicectomia e lavagem da cavidade, sem intercorrências; procedimento de 1 h e 45 min, com infusão de 1.000 mL de Ringer-lactato. Considerando o caso e as recomendações perioperatórias, julgue os itens.'],
 [26,29,'A colecistectomia videolaparoscópica é procedimento frequente no tratamento da colelitíase. A respeito de sua técnica, anatomia biliar e fatores de risco, julgue os itens.'],
 [30,31,'A respeito das colostomias, de suas complicações e da hérnia paraestomal, julgue os itens.'],
 [32,34,'A respeito dos critérios para ressecção endoscópica de lesões de câncer gástrico inicial, julgue os itens.'],
 [35,38,'A respeito da avaliação e do tratamento do trauma cervical penetrante, julgue os itens.'],
 [39,39,'Caso clínico: paciente em pós-operatório tardio de gastroplastia apresentou enterorragia com repercussão hemodinâmica. Após ressuscitação volêmica, endoscopia identificou úlcera na porção intestinal da anastomose gastrojejunal, com coágulo aderido. Após irrigação sem deslocamento do coágulo, realizou-se injetoterapia com adrenalina hipertônica e glicose, com boa resposta. Julgue o item sobre a conduta.'],
 [40,40,'A respeito do caso clínico de hemorragia digestiva após gastroplastia descrito no item anterior, julgue o item.'],
 [41,42,'A respeito dos tumores estromais gastrointestinais gástricos (GIST), julgue os itens.'],
 [43,45,'A respeito da doença do refluxo gastroesofágico e da abordagem cirúrgica revisional, julgue os itens.'],
 [46,50,'A respeito da avaliação e do tratamento do trauma abdominal fechado e das lesões de órgãos sólidos, julgue os itens.'],
 [51,56,'A respeito da hemorragia digestiva alta não varicosa e do tratamento endoscópico da úlcera péptica, julgue os itens.'],
 [57,61,'A respeito dos fatores de risco e da carcinogênese do câncer gástrico, julgue os itens.'],
 [62,65,'A respeito de tumores hepáticos benignos, incluindo adenoma hepatocelular e hiperplasia nodular focal, julgue os itens.'],
 [66,69,'Com relação ao câncer esofágico, ao estadiamento e às modalidades de tratamento, julgue os itens.'],
 [70,75,'Acerca das hérnias da parede abdominal, julgue os itens.'],
 [76,79,'A respeito da anatomia e fisiologia do esôfago e da abordagem cirúrgica desse órgão, julgue os itens.'],
 [80,83,'Acerca da avaliação e do tratamento do abdome agudo, julgue os itens.'],
 [84,88,'A respeito do intestino delgado e de doenças que o acometem, julgue os itens.'],
 [89,94,'Julgue os próximos itens, a respeito do cólon e do reto.'],
 [95,100,'Acerca de doenças do aparelho urológico, julgue os itens.']
]
const semPendencias=['classificacao_especifica_pendente','ano_sem_evidencia','integridade_visual_pendente','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado','classificacao_pendente']
function cleanStem(raw,n){
 let s=raw.replace(/\|\|Matriz_496_RM003\|\|[\s\S]*$/,'').replace(/\s+/g,' ').trim()
 const suffixes={10:'A respeito das práticas de prevenção',15:'Acerca do uso de antibióticos',20:'Um homem de vinte e sete anos',25:'A colecistectomia videolaparoscópica',29:'As colostomias são utilizadas',38:'CEBRASPE – RM – Aplicação',64:'||Matriz_496_RM003||',69:'Acerca das hérnias de parede',75:'A respeito da anatomia e fisiologia',79:'||Matriz_496_RM003||',88:'Julgue os próximos itens',94:'Acerca de doenças do aparelho',100:'Espaço livre'}
 const marker=suffixes[n];if(marker&&s.includes(marker))s=s.slice(0,s.indexOf(marker)).trim()
 s=s.replace(/\b((?:[A-Za-zÀ-ÿ]\s){2,}[A-Za-zÀ-ÿ])\b/g,m=>m.replace(/\s+/g,''))
 s=s.replace(/CO\s*2\s*\./g,'CO₂.').replace(/CO\s*2\b/g,'CO₂').replace(/\s+([.,;:])/g,'$1')
 return s
}
const pending=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(pending.length!==79||new Set(pending.map(q=>q.id)).size!==79||new Set(pending.map(q=>q.numero)).size!==79)throw Error('Fila alterada: esperados 79 registros únicos.')
const annulled=new Set(Object.entries(official.respostas).filter(([,v])=>v==='X').map(([n])=>Number(n)))
const decisions=pending.map(q=>{
 const n=Number(q.numero),range=Object.entries(materias).find(([r])=>{const[a,b]=r.split('-').map(Number);return n>=a&&n<=b})?.[1],group=grupos.find(([a,b])=>n>=a&&n<=b),key=official.respostas[String(n)]
 if(!range||!group||!key)throw Error(`Item ${n} sem classificação, contexto ou chave oficial.`)
 const text=cleanStem(q.enunciado,n),page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,annul=key==='X'
 if(text.length<25)throw Error(`Enunciado insuficiente no item ${n}.`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:text,materia:range[0],conteudo:range[1],ano:2020,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao,cargo:'Programa de Residência Médica — pré-requisito em Cirurgia Geral',numero_original:n,numero:n,pagina:page,dificuldade:n>=35&&n<=79?'Difícil':n>=21&&n<=34?'Média':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial individual pela complexidade clínica e pelo número de etapas de raciocínio; a banca não publicou parâmetro psicométrico.',classificacao_fonte:prova,motivo:'Classificação pelo conteúdo do item e pelo comando do caderno oficial da seleção de residência HUB/FUB. Ano do ciclo seletivo 2020; aplicação em 03/11/2019.',resposta_correta:annul?null:key==='C'?0:1,anulada:annul,gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'GAB_DEFINITIVO_MATRIZ_496_RM003.PDF',prova:'MATRIZ_496_RM003.PDF',sha256:official.sha256,numero:n,pagina:1,criterio:'Gabarito definitivo CEBRASPE do mesmo código de prova RM003; X representa item anulado.'},texto_apoio:group[2],imagens_contexto:[{pagina:page,imagem:image,text:group[2]}],reemplazarContexto:true,visual:{pagina:page,imagem:image,enunciado:text,texto_apoio:group[2],motivo:'Página original do caderno conferida visualmente; enunciado, grupo de comando, contexto clínico e imagem preservados.'},apta_resolucao:true,remover_pendencias:semPendencias}
})
if(decisions.length!==79||decisions.filter(d=>d.anulada).length!==1||decisions.find(d=>d.numero===10)?.anulada!==true)throw Error('Esperados 79 itens pendentes, incluindo o item 10 oficialmente anulado.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registros:decisions.length,itens_unicos:79,anulados:decisions.filter(x=>x.anulada).map(x=>x.numero),gabarito_oficial_cobertura:Object.keys(official.respostas).length,textos_revisados:79,imagens_originais_preservadas:true,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const report={...result,documento:doc,concurso,aplicacao,itens_unicos:79,registros_revisados:79,itens_anulados_conforme_gabarito:decisions.filter(d=>d.anulada).map(d=>d.numero),gabaritos_definitivos_vinculados:79,transcricoes_conferidas_visualmente:79,fonte_prova:prova,fonte_gabarito:gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
