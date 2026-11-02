import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-sesaual-cirurgia-toracica-2021-v231',doc='927a2fe1730a15c0'
const prova='https://cdn.cebraspe.org.br/concursos/SESAU_AL_21/arquivos/603_SESAU_017_01.PDF'
const concurso='SESAU/AL 2021 — Cargo 17: Cirurgia Torácica'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='603_SESAU_017_01.PDF'||catalog.questoes.length!==73)throw Error('Inventário divergente; eram esperados 73 registros OCR desta prova')
const byNumber=new Map()
for(const e of catalog.questoes){const arr=byNumber.get(e.numero)||[];arr.push(e);byNumber.set(e.numero,arr)}
if(byNumber.size!==70||[...byNumber.keys()].some((n)=>n<51||n>120))throw Error('A numeração esperada é 51–120, com 70 itens únicos')
const prev=raizesAtuais.findIndex(x=>x.includes('revisao-pgdf-comunicacao-2019-v230'))
if(prev<0)throw Error('Base anterior v230 não encontrada')
const bases=raizesAtuais.slice(prev),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),want=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(want.has(q.id)){byId.set(q.id,q);want.delete(q.id)}
 if(!want.size)break
}
if(want.size)throw Error(`Questões ausentes: ${want.size}`)

const temas={
51:'Cirurgia Torácica: cessação do tabagismo e risco perioperatório',52:'Cirurgia Torácica: apneia obstrutiva do sono e complicações pulmonares pós-operatórias',53:'Cirurgia Torácica: tabagismo e risco de complicações pulmonares',54:'Pleura: derrame pleural associado a tromboembolismo pulmonar',55:'Pleura: toracocentese no diagnóstico de empiema',
56:'Oncologia Torácica: arsênico, amianto e câncer de pulmão',57:'Oncologia Torácica: tipos histológicos de neoplasia pulmonar',58:'Oncologia Torácica: princípios de ressecção tumoral',59:'Oncologia Torácica: exposição ocupacional ao amianto e mesotelioma',60:'Oncologia Torácica: avaliação de disfonia e laringoscopia',
61:'Diagnóstico em Cirurgia Torácica: estadiamento de neoplasia pulmonar por imagem',62:'Diagnóstico em Cirurgia Torácica: broncoscopia no abscesso pulmonar',63:'Diagnóstico em Cirurgia Torácica: radiografia e mediastinite',64:'Diagnóstico em Cirurgia Torácica: tomografia na bronquiectasia',65:'Diagnóstico em Cirurgia Torácica: broncoscopia terapêutica e corpo estranho',
66:'Doenças Pulmonares: tuberculose e indicação de ressecção',67:'Pleura: pneumotórax iatrogênico sob ventilação com pressão positiva',68:'Pleura: transudatos, exsudatos e etiologias',69:'Doenças Pulmonares: microbiologia e evolução do abscesso',70:'Doenças Pulmonares: tratamento do abscesso pulmonar',71:'Emergências Torácicas: proteção da via aérea na hemoptise maciça',72:'Emergências Torácicas: origem do sangramento na hemoptise',73:'Oncologia Torácica: asbestose, silicose e neoplasia pulmonar',74:'Oncologia Torácica: origem celular do adenocarcinoma pulmonar',75:'Doenças Pulmonares: fibrose cística e insuficiência respiratória',
76:'Cirurgia Torácica: empiema pericárdico e tamponamento cardíaco',77:'Mediastino: tireoide ectópica e risco de malignização',78:'Doenças Pulmonares: microbiologia do abscesso pulmonar',79:'Oncologia Torácica: metástases pleurais de câncer de pulmão e mama',80:'Pleura: derrame neoplásico e indicação de pleurodese',
81:'Cirurgia Torácica: morbimortalidade de lobectomia e pneumonectomia',82:'Trauma Torácico: alargamento mediastinal e lesão de aorta',83:'Fisiologia Respiratória: mecânica pulmonar durante a inspiração',84:'Emergências Torácicas: pneumotórax hipertensivo e desvio mediastinal',85:'Oncologia Torácica: biópsia pré-escalênica e estadiamento pulmonar',
86:'Oncologia Torácica: classificação T do câncer pulmonar não pequenas células',87:'Oncologia Torácica: invasão do nervo frênico e classificação TNM',88:'Oncologia Torácica: estadiamento pré-tratamento e seleção terapêutica',89:'Oncologia Torácica: prefixo y na classificação TNM',90:'Oncologia Torácica: categoria M1c e metástases à distância',
91:'Mediastino: timoma, miastenia gravis e indicação cirúrgica',92:'Mediastino: timectomia e avaliação de miastenia gravis',93:'Mediastino: anticorpos antirreceptor de acetilcolina e eletroneuromiografia',94:'Mediastino: invasão de gordura mediastinal e estadiamento do timoma',95:'Anatomia Cirúrgica: veia tímica, veia cava e nervo frênico',
96:'Oncologia Torácica: seleção multidisciplinar para metastasectomia pulmonar',97:'Oncologia Torácica: número de metástases e benefício da metastasectomia',98:'Oncologia Torácica: indicação de pneumonectomia em metástases',99:'Oncologia Torácica: critérios para metastasectomia pulmonar',100:'Oncologia Torácica: câncer colorretal, metástases pulmonares e terapia sistêmica',
101:'Pleura: ultrassonografia antes da toracocentese',102:'Pleura: definição de pneumotórax grande e indicação de drenagem',103:'Pleura: derrame septado e tratamento por toracoscopia',104:'Pleura: avaliação da expansibilidade após toracocentese',105:'Pleura: quilotórax e dosagem de triglicerídeos',
106:'Doenças Pulmonares: hemoptise maciça na bronquiectasia',107:'Pleura: disseminação de foco infeccioso abdominal e empiema',108:'Pleura: distribuição radiográfica do derrame pleural',109:'Mediastino: tumores e comprometimento do nervo frênico',110:'Via Aérea: pressão do balonete do tubo endotraqueal e estenose traqueal',
111:'Diagnóstico em Cirurgia Torácica: cavitação tuberculosa e nível hidroaéreo',112:'Diagnóstico em Cirurgia Torácica: biópsia percutânea de nódulo pulmonar',113:'Radiologia Torácica: volume de derrame e velamento do seio costofrênico',114:'Pleura: perfil epidemiológico do pneumotórax espontâneo',115:'Diagnóstico em Cirurgia Torácica: sensibilidade da broncoscopia',
116:'Pleura: pleurodese com talco e técnicas de aplicação',117:'Pleura: empiema e indicação de pleurostomia de Eloesser',118:'Oncologia Torácica: tratamento do câncer pulmonar não pequenas células nos estágios I e II',119:'Pleura: pleurodese bilateral simultânea e risco de lesão pulmonar',120:'Reconstrução da Parede Torácica: tela de Marlex e prevenção de movimento paradoxal'
}
const facil=new Set([51,54,55,57,60,63,64,66,68,70,73,75,76,77,78,79,80,82,83,85,88,89,91,92,95,96,99,101,104,105,107,108,109,111,112,113,114,115,116,117,118,119,120])
const dificil=new Set([52,53,56,58,59,61,62,65,67,69,71,72,74,81,84,86,87,90,93,94,97,98,100,102,103,106,110])
const comandos={
 51:'O pré e o pós-operatório em cirurgia torácica são importantes em razão da relação das patologias da região com as funções respiratórias e cardiovasculares. Julgue os itens a seguir.',
 56:'Acerca dos princípios oncológicos gerais relacionados à cirurgia torácica, julgue os itens subsequentes.',
 61:'A respeito dos métodos diagnósticos para doenças torácicas cirúrgicas, julgue os próximos itens.',
 66:'Julgue os itens a seguir, com relação às diversas patologias pulmonares e pleurais e às medidas empregadas em seu tratamento.',
 76:'Julgue os itens a seguir, considerando que patologias torácicas e procedimentos cirúrgicos podem evoluir com complicações.',
 81:'Com relação aos cuidados pré e pós-operatórios e à avaliação de risco em cirurgia torácica, julgue os itens subsequentes.',
 86:'Com relação ao estadiamento do carcinoma de pulmão não pequenas células, julgue os itens a seguir.',
 91:'Uma paciente de 26 anos foi encaminhada à cirurgia torácica para avaliação de lesão mediastinal de cerca de 4 cm, em topografia do timo, com diagnóstico radiológico de timoma. Acerca do caso, julgue os itens seguintes.',
 96:'A ressecção de metástases pulmonares é praticada há muitos anos. Como faltam estudos prospectivos randomizados, recomendações de especialistas são adotadas na prática. Julgue os itens relativos ao assunto.',
 101:'Julgue os itens subsequentes, relativos à avaliação das doenças pleurais.',
 106:'Com relação às patologias dos órgãos e da parede da cavidade torácica, julgue os itens a seguir.',
 111:'A propedêutica cirúrgica do tórax envolve exames complementares e concorre para um diagnóstico mais fidedigno e seguro. Julgue os itens a seguir.',
 116:'Com relação ao tratamento cirúrgico de patologias torácicas, julgue os itens seguintes.'
}
function contexto(n){const blocos=[51,56,61,66,76,81,86,91,96,101,106,111,116];let b=blocos.filter(x=>x<=n).at(-1);return comandos[b]}
const canon=new Map([[54,'extr-2f6d328a0859ff983693'],[55,'extr-2c7ea00bd8fb4258ddce'],[85,'extr-56069440f7768a266e75']])
const textoLimpo=new Map([[54,'O derrame pleural que acompanha o tromboembolismo pulmonar costuma ser citrínico.'],[55,'A toracocentese é um procedimento bastante utilizado no diagnóstico do empiema torácico.'],[85,'A biópsia pré-escalênica tem grande valor no estadiamento do câncer pulmonar.']])
const decisions=[]
for(const [n,entries] of byNumber){
 const canonical=canon.get(n)||entries[0].id
 for(const e of entries){const q=byId.get(e.id),img=`paginas/${doc}-${String(e.pagina).padStart(4,'0')}.webp`,duplicate=e.id!==canonical
  if(!q||!temas[n])throw Error(`Item ${n} sem registro ou assunto específico`)
  if(q.pagina!==e.pagina)throw Error(`Página divergente no item ${n}`)
  await fs.access(`public/acervo-extraido/${img}`)
  const dec={id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Medicina',conteudo:temas[n],ano:2021,concurso,numero_original:n,pagina:e.pagina,
   dificuldade:facil.has(n)?'Fácil':dificil.has(n)?'Difícil':'Média',dificuldade_estimada:true,
   dificuldade_evidencia:'Estimativa editorial pela complexidade clínica e pelo número de relações anatômicas, fisiopatológicas e terapêuticas exigidas; não é estatística psicométrica da banca.',
   classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Enunciado e agrupamento temático conferidos na página original; nenhuma chave foi inferida ou alterada.'},
   visual:{pagina:e.pagina,imagem:img,texto_apoio:duplicate?'':contexto(n),motivo:`Página original ${e.pagina} conferida; caderno textual, sem figura indispensável neste item.`},
   remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],
   motivo:duplicate?`OCR duplicado do item ${n}; mantida versão canônica legível ${canonical}.`:`Classificação individual em Medicina: ${temas[n]}. Chave existente preservada.`}
  if(!duplicate){dec.texto_apoio=contexto(n);if(textoLimpo.has(n))dec.enunciado=textoLimpo.get(n);dec.apta_resolucao=true}
  else {dec.apta_resolucao=false;dec.inelegibilidade_motivo=`Duplicata de OCR do item ${n}; registro canônico ${canonical} preserva a versão legível.`;dec.duplicada_de=canonical}
  decisions.push(dec)
 }
}
if(decisions.length!==73)throw Error(`Esperados 73 registros, encontrados ${decisions.length}`)
const out=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[prev],decisoes:decisions})
console.log(JSON.stringify({...out,documento:catalog.arquivo,registros_revisados:73,itens_unicos:70,duplicatas_inelegiveis:3,contextos_e_paginas:70,paginas_origem:[1,2],publicado:false},null,2))
