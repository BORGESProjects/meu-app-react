import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-see-pe-fonoaudiologia-2022-v508',doc='4649fa1325e5afdf'
const prova='https://cdn.cebraspe.org.br/concursos/see_pe_22/arquivos/736_SEEPEANALISTAASSISTENTE_005_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/see_pe_22/arquivos/GAB_DEFINITIVO_736_SEEPEANALISTAASSISTENTE_005_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/see_pe_22/arquivos/SEE_PE_22__JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,73)

// Tabelas do gabarito definitivo oficial (Cargo 5, Fonoaudiologia), itens 51–120.
const rows=[
 ['C','C','E','E','C','E','C','C','E','C','C','C','E','C','E','E','E','C','E','C'],
 ['C','E','E','E','C','E','C','C','E','C','E','C','E','C','E','C','E','C','E','C'],
 ['C','E','E','C','E','E','E','C','C','E','E','E','C','E','E','C','C','C','E','C'],
 ['C','E','E','C','E','E','C','C','C','E'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51
for(const row of rows)for(const answer of row)answers.set(number++,answer)
assert.equal(number,121)
// As justificativas oficiais deferiram anulação posterior para estes quatro itens.
answers.set(79,'C')
for(const n of [81,88,106,115])answers.set(n,'X')

const duplicates=new Map([
 ['extr-0747bbf1cd4f430033fd','extr-7da3845dce0a865d4323'],
 ['extr-18c32350cc6f5e694a7e','extr-b75149e2ec654a5d6bdd'],
 ['extr-d8a3df38a6ad8c7a31bb','extr-83dec49ffb7f6f8c78b9'],
])
const groups=[
 [[51,55],'Fonoaudiologia','Disfagia infantil: avaliação clínica e reabilitação','Na internação de crianças com disfagia associada a problemas respiratórios, a avaliação fonoaudiológica subsidia o diagnóstico diferencial, a segurança da deglutição e a conduta alimentar.'],
 [[56,61],'Fonoaudiologia','Linguagem, fala e comunicação na paralisia cerebral','Consideram-se morfofisiopatologia da fonação, avaliação da linguagem e da fala na paralisia cerebral e sistemas de comunicação alternativa ou aumentativa.'],
 [[62,65],'Fonoaudiologia','Fluência: disfluência e gagueira infantil','Itens sobre fatores de risco, manifestações, avaliação e efeitos emocionais e comunicativos da gagueira infantil.'],
 [[66,71],'Fonoaudiologia','Traqueostomia e deglutição: aspiração e proteção de vias aéreas','Itens sobre indicações e efeitos da traqueostomia, cânula com balão, sensibilidade laríngea, aspiração, lesão traqueal, elevação laríngea e tosse.'],
 [[72,74],'Fonoaudiologia','Videofluoroscopia da deglutição','Itens sobre segurança e escopo da avaliação videofluoroscópica, fases observadas e prescrição do exame.'],
 [[75,79],'Saúde Pública','SUS: Constituição, Leis 8.080/1990 e 8.142/1990 e NOAS-SUS 01/2002','Itens sobre diretrizes constitucionais do SUS, princípios e organização dos serviços, participação social, transferências financeiras e regionalização.'],
 [[80,85],'Saúde Pública','Política Nacional de Atenção à Saúde Auditiva: Portaria 587/2004','Itens sobre organização da atenção auditiva no SUS, níveis de complexidade, regulação, responsabilidades e reabilitação.'],
 [[86,89],'Fonoaudiologia','Audiologia ocupacional e Programa de Prevenção de Perdas Auditivas','Itens sobre participação do fonoaudiólogo na saúde do trabalhador, medidas de prevenção, audiometria e proteção auditiva.'],
 [[90,93],'Fonoaudiologia','Desenvolvimento auditivo infantil e avaliação audiológica pediátrica','Itens sobre marcos de comportamento auditivo em lactentes, idade corrigida, audiometria com reforço visual e audiometria lúdica.'],
 [[94,97],'Fonoaudiologia','Audiologia básica: limiares, vias aérea e óssea e imitanciometria','Itens sobre limiar auditivo, critérios de audiometria por via óssea, tipos de perda e reflexo acústico.'],
 [[98,102],'Fonoaudiologia','Implante coclear: avaliação e critérios de candidatura','Itens sobre apresentação de material de fala, avaliação de candidatos, terapia, diagnóstico da perda e questionários de desenvolvimento auditivo e linguístico.'],
 [[103,106],'Fonoaudiologia','Diagnóstico precoce e triagem auditiva neonatal','Itens sobre emissões otoacústicas, limites diagnósticos, estimativa de limiar e triagem auditiva em neonatos.'],
 [[107,108],'Fonoaudiologia','Potencial evocado auditivo de tronco encefálico','Itens sobre indicação do PEATE, integração com avaliação audiológica convencional e triagem de recém-nascidos de alto risco.'],
 [[109,112],'Fonoaudiologia','Implante coclear: indicações, contraindicações e ativação','Itens sobre critérios clínicos, contraindicações, resultados esperados e ativação do dispositivo após cirurgia.'],
 [[113,117],'Fonoaudiologia','Avaliação vestibular: nistagmo, perseguição ocular e prova calórica','Itens sobre pesquisa de nistagmo espontâneo e optocinético, rastreio pendular e estimulação calórica.'],
 [[118,120],'Fonoaudiologia','Processamento auditivo central: critérios de avaliação','Itens sobre indicações e condições audiológicas para os testes de processamento auditivo central.'],
]
const grupo=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`grupo ${n}`);return g}
const canonical=new Map()
for(const q of ps){if(duplicates.has(q.id))continue;const arr=canonical.get(Number(q.numero))||[];arr.push(q);canonical.set(Number(q.numero),arr)}
assert.equal(canonical.size,70)
for(const [n,arr]of canonical){assert.equal(arr.length,1,`número ${n}`);assert.ok(answers.has(n));assert.ok(arr[0].pagina>=1&&arr[0].pagina<=3)}
for(const [id,keeper]of duplicates){const q=ps.find(x=>x.id===id);assert.ok(q&&ps.some(x=>x.id===keeper&&x.numero===q.numero))}

const fonte=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`),'utf8')).map(String)
function textoOficial(n,page){
 const t=fonte[page-1]||'';const m=new RegExp(`(?:^|\\n)${n}\\s+`).exec(t)
 assert.ok(m,`item ${n} não encontrado na página ${page}`)
 let s=t.slice(m.index+m[0].length)
 s=s.split(/\n\s*\n/)[0].split(/\n(?=(?:5[1-9]|[6-9]\d|1[01]\d|120)\s+)/)[0]
 s=s.replace(/\s*736005_01N493934[\s\S]*$/i,'').replace(/\s*CEBRASPE\s*[–-]\s*SEE\/PE\s*[–-]\s*Edital:\s*2022[\s\S]*$/i,'').replace(/\babrange ampla gama\b/i,'abrangem ampla gama').replace(/\btroco encefálico\b/i,'tronco encefálico').replace(/\s+/g,' ').trim()
 return s
}
const hard=new Set([53,65,76,79,81,88,96,99,101,102,109,110,114,115])
const patches=[]
for(const[n,[q]]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const [materia,conteudo]=grupo(n).slice(1,3),page=Number(q.pagina),answer=answers.get(n),annulled=answer==='X'
 const enunciado=textoOficial(n,page);assert.ok(enunciado.length>25,`enunciado ${n}`)
 patches.push({
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2022,
  concurso:'SEE-PE 2022 — Analista de Gestão Educacional, Cargo 5: Fonoaudiologia',
  banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'09/10/2022',cargo:'Analista de Gestão Educacional — Fonoaudiologia (Cargo 5)',numero_original:n,pagina:page,
  dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial para prova de nível superior; o CEBRASPE não publica escala oficial de dificuldade por item.',
  classificacao_fonte:prova,motivo:`Caderno oficial confirma o item, cargo e aplicação; assunto classificado pelo enunciado e pelo bloco temático da prova.`,
  enunciado,texto_apoio:grupo(n)[3],opcoes:['Certo','Errado'],
  ...(annulled?{resposta_correta:null,anulada:true}:{resposta_correta:answer==='C'?0:1,anulada:false}),
  gabarito_oficial:{fonte:chave,justificativa:justificativas,arquivo:'GAB_DEFINITIVO_736_SEEPEANALISTAASSISTENTE_005_01.PDF',numero:n,pagina:1,resposta:answer,criterio:annulled?'Item anulado segundo as justificativas oficiais de alteração do gabarito.':n===79?'Gabarito definitivo após alteração oficial do item.':'Gabarito oficial definitivo do Cargo 5 — Fonoaudiologia, aplicação em 09/10/2022.'},
  visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,motivo:`Página ${page} do caderno oficial, conferida para preservar o item e o bloco de contexto correspondente.`},
  apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']
 })
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Fonoaudiologia',conteudo:'Captura duplicada do mesmo item e da mesma prova',ano:2022,concurso:'SEE-PE 2022 — Analista de Gestão Educacional, Cargo 5: Fonoaudiologia',banca:'CEBRASPE',numero_original:Number(q.numero),pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'duplicata_do_mesmo_item_no_mesmo_caderno'})}
assert.equal(patches.length,73)
const hash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=hash;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_do_gabarito_51_a_120_com_ajustes_das_justificativas; nao_e_hash_dos_pdfs'}
const divergencias=[]
for(const p of patches){const q=ps.find(x=>x.id===p.id);if(p.gabarito_oficial&&q?.resposta!=null&&p.resposta_correta!=null&&q.resposta!==p.resposta_correta)divergencias.push({numero:p.numero_original,id:p.id,anterior:q.resposta,oficial:p.gabarito_oficial.resposta})}
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,anulados:patches.filter(p=>p.anulada).map(p=>p.numero_original),divergencias,amostras:patches.filter(p=>p.gabarito_oficial&&[51,53,55,56,62,66,72,75,79,81,88,90,94,98,103,107,109,113,118,120].includes(p.numero_original)).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,gabarito:p.gabarito_oficial.resposta,anulada:p.anulada,enunciado:p.enunciado.slice(0,100),pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
