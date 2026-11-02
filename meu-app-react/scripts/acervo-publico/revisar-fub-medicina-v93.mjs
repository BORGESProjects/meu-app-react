import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const base='tmp/revisao-profissional/revisao-fub-civil-v92/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-fub-medicina.json','utf8'))
const topicos=new Map(),definir=(ns,m,c)=>ns.forEach(n=>topicos.set(n,{materia:m,conteudo:c}))
definir([51],'Oncologia','Prevenção e fatores de risco do melanoma')
definir([53,54],'Hepatologia','Investigação diagnóstica e avaliação de lesão hepática')
definir([55,56],'Nutrologia','Vitamina D: absorção, deficiência e fontes alimentares')
definir([57],'Cardiologia','Dislipidemia e mecanismos farmacológicos na aterosclerose')
definir([59,60,61,62],'Pneumologia e Terapia Intensiva','Insuficiência respiratória aguda, pneumonia e suporte ventilatório')
definir([63,64],'Gastroenterologia','Doença do refluxo gastroesofágico e investigação diagnóstica')
definir([65,66],'Cardiologia','Fibrilação atrial: predisposição genética, fatores de risco e prevenção de recorrência')
definir([67,68],'Cardiologia','Hipertensão arterial, estratificação de risco cardiovascular e monitorização ambulatorial')
definir([74,75,76],'Medicina de Emergência','Ressuscitação cardiopulmonar e suporte básico e avançado de vida')
definir([77,78,79,80],'Cardiologia','Insuficiência cardíaca aguda na gestação: avaliação e tratamento')
definir([81,82],'Alergia e Imunologia','Anafilaxia: manifestações clínicas e investigação laboratorial')
definir([83,84,85],'Neurologia','Acidente vascular cerebral isquêmico: avaliação, pressão arterial e trombólise')
definir([86,87,88],'Neurologia','Enxaqueca: diagnóstico e manejo da crise aguda')
definir([89,90],'Dermatologia','Urticária e angioedema: formas clínicas e diagnóstico diferencial')
definir([91,92,93],'Infectologia','Dengue: prova do laço, sinais de alarme e manejo clínico')
definir([94,95,96,97,98],'Infectologia','Sífilis: manifestações cardiovasculares, diagnóstico, tratamento e reação de Jarisch-Herxheimer')
definir([99,100,101,102],'Nefrologia e Urologia','Nefrolitíase: imagem, diagnóstico e composição de cálculos urinários')
definir([103,104,105,106,107],'Endocrinologia','Obesidade: risco cardiometabólico, avaliação e indicação de cirurgia bariátrica')
definir([108,109,110,111,112],'Endocrinologia','Doenças da tireoide: coma mixedematoso, tireotoxicose, oftalmopatia, nódulos e efeitos da amiodarona')
definir([113,114,115,116],'Reumatologia','Artrite gotosa aguda: diagnóstico e tratamento da crise')
definir([117,118],'Reumatologia','Lúpus eritematoso sistêmico: complicações cardíacas e nefrite lúpica')
definir([119,120],'Nefrologia','Insuficiência renal aguda: causas pré-renais e indicações de diálise emergencial')
const decisoes=pendentes.map(q=>{
 const n=q.numero_original,t=topicos.get(n);if(!t)throw Error(`Sem classificação para o item ${n}`)
 const pagina=q.pagina
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t.materia,conteudo:t.conteudo,ano:2016,numero_original:n,pagina,
  dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo nível de integração clínica e aplicação de conhecimentos médicos exigidos; não é dado oficial da banca.',
  motivo:'Caderno oficial CEBRASPE/FUB 2016, cargo 3 — Médico/área Clínica; área clínica identificada pelo tema e pelo caso apresentado.',
  visual:{pagina,imagem:`paginas/${q.documento_id}-${String(pagina).padStart(4,'0')}.webp`,motivo:'Página original conferida visualmente; preserva casos clínicos, eletrocardiograma e comandos compartilhados.'}}
})
const report=await aplicarRevisoesIndividuais({nome:'revisao-fub-medicina-v93',base,decisoes})
await fs.writeFile('docs/acervo/revisao-profissional/revisao-fub-medicina-v93-notas.json',JSON.stringify({prova:'FUB 2016 — cargo 3, Médico/área Clínica',fonte:'https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_003_01.pdf',paginasConferidas:[1,2,3,4,5,6],itensRevisados:decisoes.length,itens:[...topicos.keys()].sort((a,b)=>a-b),relatorio:report},null,2))
