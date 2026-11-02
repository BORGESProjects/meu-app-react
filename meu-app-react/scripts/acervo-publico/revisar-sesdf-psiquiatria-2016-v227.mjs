import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-sesdf-psiquiatria-2016-v227',doc='2d9438dd73eeed64'
const prova='https://cdn.cebraspe.org.br/concursos/SES_DF_16_RESIDENCIA_2/arquivos/240RMU2PROC_004_01.pdf'
const gabaritoPreliminar='https://cdn.cebraspe.org.br/concursos/SES_DF_16_RESIDENCIA_2/arquivos/Gab_Preliminar_240RMU2PROC_004_01.pdf'
const concurso='SES/DF Residência Médica Unificada 2016 — Psiquiatria da Infância e Adolescência (pré-requisito: Psiquiatria)'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='240RMU2PROC_004_01.pdf'||catalog.questoes.length!==120)throw Error('Inventário oficial da prova divergiu: esperado o caderno com 120 itens')
const prev=raizesAtuais.findIndex(x=>x.includes('revisao-abin-agente-2018-v226'))
if(prev<0)throw Error('Base anterior v226 não encontrada')
const bases=raizesAtuais.slice(prev),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),want=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(want.has(q.id)){byId.set(q.id,q);want.delete(q.id)}
 if(!want.size)break
}
if(want.size)throw Error(`Registros da prova ausentes: ${want.size}`)

const topics={
1:['Psiquiatria','Esquizofrenia: adesão terapêutica e antipsicóticos de ação prolongada','Média'],4:['Psiquiatria','Esquizofrenia: sintomas positivos, negativos e curso clínico','Média'],5:['Psiquiatria','Psicopatologia: alterações da linguagem e repetição de palavras','Média'],
6:['Psiquiatria','Depressão resistente: estratégias de combinação farmacológica','Média'],7:['Psiquiatria','Transtorno bipolar: resistência ao tratamento','Média'],8:['Psiquiatria','TEPT: persistência dos sintomas e resposta terapêutica','Média'],9:['Psiquiatria','TOC e depressão: efeitos da cetamina','Difícil'],10:['Psiquiatria','Depressão unipolar: potencialização com lítio','Média'],
11:['Psiquiatria','Transtorno obsessivo-compulsivo: egodistonia e compulsões','Fácil'],12:['Psiquiatria','Transtorno de pânico: estimulação magnética transcraniana','Média'],13:['Psiquiatria','Transtorno de pânico: farmacoterapia com antidepressivos tricíclicos','Média'],14:['Psiquiatria','Neurobiologia do medo: locus coeruleus','Difícil'],
16:['Psicologia','Psicanálise: modelos topográfico e estrutural do aparelho psíquico','Média'],17:['Psicologia','Psicanálise: fases do desenvolvimento psicossexual','Fácil'],18:['Psicologia','Winnicott: objeto transicional','Fácil'],19:['Psicologia','Behaviorismo: condicionamento e influência ambiental','Média'],20:['Psicologia','Psicanálise: conceitos de Lacan e Jung','Média'],
21:['Psiquiatria','Psicofarmacologia perinatal: antidepressivos durante a amamentação','Média'],22:['Psiquiatria','Psicose puerperal: risco e período pós-parto','Fácil'],23:['Psiquiatria','Lítio: farmacocinética, ligação plasmática e toxicidade','Média'],24:['Psiquiatria','Antidepressivos tricíclicos: farmacocinética da nortriptilina','Média'],25:['Psiquiatria','Depressão: indicações da eletroconvulsoterapia','Média'],26:['Psiquiatria','Depressão: alterações da arquitetura do sono REM','Média'],27:['Psiquiatria','Transtorno bipolar tipo I: idade de início','Média'],28:['Psiquiatria','Depressão: evidência da terapia cognitivo-comportamental','Média'],29:['Psiquiatria','Depressão resistente: potencialização farmacológica e evidências','Difícil'],30:['Psiquiatria','Transtornos por uso de substâncias: formulação psicodinâmica','Média'],
31:['Psiquiatria','Esquizofrenia: associação de antipsicóticos e anticonvulsivantes','Difícil'],32:['Psiquiatria','Esquizofrenia: prevalência e diferenças relacionadas ao sexo','Média'],33:['Psiquiatria','História da psiquiatria: Eugen Bleuler e o conceito de esquizofrenia','Fácil'],34:['Psiquiatria Forense','Imputabilidade penal: nexo entre transtorno mental e delito','Difícil'],35:['Psiquiatria','Esquizofrenia: clozapina e risco dose-dependente de convulsão','Média'],
36:['Psiquiatria','Transtorno de ansiedade generalizada: critérios clínicos','Fácil'],37:['Psiquiatria','Ansiedade: conceito clínico e resposta emocional','Fácil'],38:['Psiquiatria','Transtorno de pânico: diagnóstico diferencial dos ataques','Média'],39:['Psiquiatria','Transtorno de pânico: terapia cognitivo-comportamental','Média'],40:['Psiquiatria','Fobias: formulação psicodinâmica e mecanismos de defesa','Difícil'],
41:['Psiquiatria','Depressão bipolar aguda: riscos da monoterapia antidepressiva','Média'],42:['Psiquiatria','Transtorno bipolar tipo II: curso longitudinal e polaridade','Média'],43:['Psiquiatria','Transtorno por uso de álcool: teorias psicodinâmicas','Média'],44:['Psiquiatria','Abstinência alcoólica: delirium tremens e cronologia','Média'],45:['Psiquiatria','Cannabis: síndrome de abstinência','Média'],46:['Psiquiatria','Transtorno por uso de álcool: encefalopatia de Wernicke após glicose','Difícil'],47:['Medicina do Sono','Sono REM: atonia muscular e conteúdo onírico','Fácil'],48:['Medicina do Sono','Depressão: achados polissonográficos e arquitetura do sono','Difícil'],49:['Psiquiatria','TOC: comorbidade com sintomas depressivos','Média'],
50:['Psiquiatria da Infância e Adolescência','Transtorno do espectro autista: sinais iniciais e linguagem','Média'],51:['Psiquiatria da Infância e Adolescência','TDAH: início dos sintomas e prejuízo em mais de um contexto','Média'],52:['Psiquiatria da Infância e Adolescência','Deficiência intelectual: níveis de gravidade no DSM-5','Média'],
78:['Psicologia','Personalidade: fixação psicossexual e caráter oral','Média'],79:['Psiquiatria','Transtorno de personalidade esquizotípica: características clínicas','Difícil'],80:['Psiquiatria','Delirium tremens: abordagem farmacológica','Média'],81:['Psiquiatria Forense','Avaliação do risco de violência iminente','Difícil'],83:['Psiquiatria','Psicopatologia da memória: ecmnésia','Média'],
103:['Psiquiatria','Clozapina: risco dose-dependente de convulsão','Fácil'],104:['Psiquiatria','Clozapina: dose de início e titulação segura','Média'],105:['Psiquiatria','Clozapina: monitorização de agranulocitose','Média'],117:['Psiquiatria da Infância e Adolescência','Transtorno do espectro autista: regressão e desenvolvimento','Média'],118:['Psiquiatria da Infância e Adolescência','Transtorno do espectro autista: perfil cognitivo','Média'],119:['Psiquiatria da Infância e Adolescência','Transtorno do espectro autista: idade de reconhecimento','Fácil'],120:['Psiquiatria da Infância e Adolescência','Transtorno do espectro autista: linguagem funcional e prognóstico','Média']
}
const selected=catalog.questoes.filter(e=>byId.get(e.id)?.classificacao_pendente===true&&byId.get(e.id).integridade_profissional?.apta_resolucao!==false)
if(selected.length!==61)throw Error(`Esperadas 61 pendências elegíveis deste caderno, encontradas ${selected.length}`)
const decisions=selected.map(e=>{
 const q=byId.get(e.id),[materia,conteudo,dificuldade]=topics[e.numero]||[]
 if(!materia||!conteudo)throw Error(`Sem classificação semântica para item ${e.numero}`)
 return {id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2016,concurso,numero_original:e.numero,pagina:e.pagina,dificuldade,dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial baseada na operação cognitiva exigida (reconhecimento, aplicação clínica ou integração de conceitos); não representa índice psicométrico da banca.',
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura do enunciado e do comando precedente no caderno oficial; disciplina e conteúdo granular definidos individualmente.'},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],
  motivo:`Revisão v227: item ${e.numero} classificado por conteúdo clínico/teórico e conferido com o caderno oficial CEBRASPE. Só foi localizado gabarito preliminar; correção automática permanece desativada.`}
})
if(decisions.length!==61)throw Error('A cobertura de decisões divergiu do lote')
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[prev],decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,concurso,fonteProva:prova,fonteGabaritoPreliminar:gabaritoPreliminar,registros_revisados:decisions.length,gabarito_definitivo:'não localizado; mantida correção automática desativada',publicado:false},null,2))
