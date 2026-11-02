import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-dataprev-medico-trabalho-2023-v516',doc='d2788f0e4e1e837b'
const prova='https://cdn.cebraspe.org.br/concursos/dataprev_23/arquivos/893_DATAPREV_023_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/dataprev_23/arquivos/GAB_DEFINITIVO_893_DATAPREV_023_01.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,73)
const rows=[
 ['C','E','E','C','C','E','E','C','E','C','C','E','C','E','C','C','C','C','C','E'],
 ['C','C','E','E','E','C','C','E','E','C','C','C','C','C','E','E','E','C','C','C'],
 ['E','C','C','E','E','E','E','C','E','E','E','C','E','E','C','C','E','C','E','E'],
 ['C','E','E','C','E','C','C','C','E','C'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51;for(const row of rows)for(const answer of row)answers.set(number++,answer);assert.equal(number,121)
const byNumber=new Map();for(const q of ps){const list=byNumber.get(Number(q.numero))||[];list.push(q);byNumber.set(Number(q.numero),list)}
const canonical=new Map([...byNumber].map(([n,list])=>[n,list[0]]));assert.equal(canonical.size,68)
assert.deepEqual([...byNumber].filter(([,list])=>list.length>1).map(([n,list])=>[n,list.length]),[[54,2],[55,2],[56,2],[58,2],[59,2]])
assert.deepEqual([60,106].filter(n=>byNumber.has(n)),[])
for(const n of canonical.keys())assert.ok(answers.has(n),`gabarito ${n}`)
const duplicates=new Map([...byNumber.values()].filter(list=>list.length>1).flatMap(list=>list.slice(1).map(q=>[q.id,list[0].id])))

const groups=[
 [[51,55],'Medicina do Trabalho','Epidemiologia ocupacional: estudos, indicadores, sensibilidade e especificidade, acidentes de trabalho','Contexto: monitoramento de estatística e epidemiologia em medicina do trabalho.'],
 [[56,59],'Medicina do Trabalho','Promoção da saúde, qualidade de vida, CIPA, SESMT e inclusão de trabalhadores','Texto-base: situação hipotética de instituição de vários setores que planeja programa de qualidade de vida e promoção da saúde com participação da CIPA e do SESMT.'],
 [[61,61],'Medicina do Trabalho','Saúde do trabalhador: trabalho, bem-estar, adoecimento e determinantes sociais','Contexto: aspectos relacionados à saúde do trabalhador.'],
 [[62,67],'Medicina do Trabalho','LER/DORT, dor crônica, diagnóstico diferencial e nexo causal','Contexto: lesões por esforços repetitivos, distúrbios osteomusculares relacionados ao trabalho e avaliação da dor crônica.'],
 [[68,73],'Medicina do Trabalho','Psicopatologia do trabalho, estresse, álcool, psicodinâmica e cronobiologia','Contexto: sofrimento psíquico e psicopatologias do trabalho, incluindo estresse relacionado ao trabalho e consumo de álcool.'],
 [[74,85],'Medicina do Trabalho','Higiene ocupacional: agentes químicos e biológicos, toxicologia, imunização, calor, ruído e radiações','Contexto: identificação e avaliação de riscos ocupacionais de natureza química, biológica e física.'],
 [[86,89],'Medicina do Trabalho','Ergonomia: tarefa prescrita, variabilidade humana, análise ergonômica e carga de trabalho','Contexto: conceitos e princípios da ergonomia.'],
 [[90,96],'Medicina do Trabalho','Organização do trabalho, cronobiologia, trabalho noturno e ergonomia de postos com computador','Contexto: organização do trabalho e trabalhos sob condições especiais, incluindo ergonomia de equipamentos e postos.'],
 [[97,102],'Medicina do Trabalho','Doenças relacionadas ao trabalho, nexo causal, concausa, acidente de trabalho e benefícios previdenciários','Texto-base: trabalhador de 50 anos, gerente de banco, sofreu infarto do miocárdio por doença coronariana; avaliação da organização do trabalho identificou exposição a importante estresse ocupacional. As proposições examinam doença profissional, doença do trabalho, nexo epidemiológico, concausa e comunicação de acidente.'],
 [[103,108],'Legislação Previdenciária e Saúde do Trabalhador','Lei nº 8.213/1991: PPP, agentes nocivos, aposentadoria especial e nexo epidemiológico','Contexto: perfil profissiográfico previdenciário, riscos ocupacionais e acidente do trabalho à luz da Lei nº 8.213/1991.'],
 [[109,114],'Segurança e Saúde no Trabalho','SESMT: composição, atribuições, dimensionamento e modalidades de atendimento','Contexto: composição e funcionamento do Serviço Especializado em Engenharia de Segurança e em Medicina do Trabalho.'],
 [[115,118],'Segurança e Saúde no Trabalho','Gerenciamento de riscos ocupacionais: identificação de perigos, avaliação e controle de riscos','Contexto: programa de gerenciamento de riscos ocupacionais em uma empresa.'],
 [[119,120],'Segurança e Saúde no Trabalho','Ergonomia: Análise Ergonômica do Trabalho (AET) e sua aplicação','Contexto: etapas e hipóteses de dispensa da Análise Ergonômica do Trabalho.'],
]
const group=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}
const hard=new Set([51,53,55,58,62,63,65,66,67,70,72,75,78,82,85,88,92,93,97,98,99,101,102,103,104,108,110,111,112,114,115,116,117,118,119,120])
function clean(n,text){
 let s=String(text||'').replace(/[\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim()
 s=s.replace(/\s+([,.;:!?])/g,'$1').replace(/\s+—\s+/g,', ')
 if(n===91)s='Cronobiologia é a ciência que incorpora a dimensão do trabalho ao estudo da matéria viva.'
 return s
}
const patches=[]
for(const[n,q]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const [materia,conteudo,contexto]=group(n).slice(1),answer=answers.get(n),page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 let text=clean(n,q.enunciado)
 if(n>=97&&n<=102)text=`Nessa situação hipotética, conforme a legislação previdenciária, poderá ser considerada a existência de ${text}`
 assert.ok(text.length>20,`enunciado ${n}`)
 patches.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2023,
  concurso:'DATAPREV 2023 — Médico do Trabalho (Cargo 23)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'01/10/2023',cargo:'Médico do Trabalho (Cargo 23)',numero_original:n,pagina:page,
  dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na especialização e na integração de conceitos; não é classificação oficial da banca.',
  classificacao_fonte:prova,motivo:'Classificação conferida no caderno oficial do Cargo 23; gabarito comparado ao definitivo publicado pelo CEBRASPE.',
  enunciado:text,texto_apoio:contexto,opcoes:['Certo','Errado'],resposta_correta:answer==='C'?0:1,anulada:false,
  gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_893_DATAPREV_023_01.PDF',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do Cargo 23 — Médico do Trabalho, prova aplicada em 01/10/2023.'},
  visual:{pagina:page,imagem:image,motivo:`Página ${page} do caderno oficial; preserva o contexto gráfico/original da questão.`},apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']})
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id),n=Number(q.numero),[materia,conteudo]=group(n);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo:`Captura duplicada do item ${n} no mesmo caderno`,ano:2023,concurso:'DATAPREV 2023 — Médico do Trabalho (Cargo 23)',banca:'CEBRASPE',numero_original:n,pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,73)
const answerHash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=answerHash;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_do_gabarito_oficial_51_a_120; nao_e_hash_do_pdf'}
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,itens_fora_do_intervalo:[...canonical.keys()].filter(n=>n<51||n>120),amostras:patches.filter(p=>p.gabarito_oficial&&[51,56,61,62,68,74,86,90,97,103,109,115,119,120].includes(p.numero_original)).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,resposta:p.gabarito_oficial.resposta,enunciado:p.enunciado.slice(0,100),pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
