import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-seduc-al-professor-ingles-2021-v515',doc='cc55c166c20e9c50'
const prova='https://cdn.cebraspe.org.br/concursos/seduc_al_21/arquivos/606_SEDUC_AL_012_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/seduc_al_21/arquivos/GAB_DEFINITIVO_606_SEDUC_AL_012_01.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,73)
const rows=[
 ['E','C','E','E','C','C','C','E','C','E','E','C','E','E','C','C','C','C','E','C'],
 ['C','C','E','C','E','C','E','E','E','C','E','E','C','C','E','E','E','E','C','C'],
 ['E','E','C','C','C','E','C','E','C','C','C','C','E','C','E','C','C','E','C','E'],
 ['E','C','C','E','C','E','C','E','C','E'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51;for(const row of rows)for(const answer of row)answers.set(number++,answer);assert.equal(number,121)
const byNumber=new Map();for(const q of ps){const a=byNumber.get(Number(q.numero))||[];a.push(q);byNumber.set(Number(q.numero),a)}
const canonical=new Map([...byNumber].map(([n,a])=>[n,a[0]]));assert.equal(canonical.size,70)
assert.deepEqual([...byNumber].filter(([,a])=>a.length>1).map(([n,a])=>[n,a.length]),[[55,2],[66,2],[70,2]])
for(const n of canonical.keys())assert.ok(answers.has(n),`gabarito ${n}`)
const duplicates=new Map([...byNumber.values()].filter(a=>a.length>1).flatMap(a=>a.slice(1).map(q=>[q.id,a[0].id])))

const groups=[
 [[51,55],'Língua Inglesa','Interpretação de texto, inferência e vocabulário em contexto','Texto-base: relato sobre a professora Ms. Njau, sua formação, a escolha da carreira e o ensino em sua comunidade na Tanzânia.'],
 [[56,61],'Língua Inglesa','English as a lingua franca, leitura e uso contextual da língua','Texto-base: artigo sobre English as a lingua franca (ELF), diversidade linguística e negociação de sentidos entre falantes de diferentes primeiras línguas.'],
 [[62,65],'Língua Inglesa','Interpretação de tirinha, phrasal verbs e vocabulário','Texto-base: tirinha de Sylvia e seu pai sobre backup de arquivos e conselho de pessoas mais velhas; imagem preservada na página original.'],
 [[66,71],'Língua Inglesa','Gramática e leitura: elipse, colocação de advérbios, classes de palavras e escrita digital','Texto-base: artigo sobre mensagens instantâneas como modalidade de comunicação e as convenções próprias da escrita digital.'],
 [[72,75],'Língua Inglesa','Interpretação, vocabulário e regência verbal','Texto-base: entrevista sobre a pausa de Michelle Phan na produção de vídeos de maquiagem após esgotamento emocional.'],
 [[76,80],'Língua Inglesa','Ensino de pronúncia, formação docente e avaliação de materiais','Texto-base: artigo sobre crenças docentes, pesquisa, metas pedagógicas e práticas de pronúncia em língua adicional.'],
 [[81,86],'Língua Inglesa','Ensino e aprendizagem da pronúncia, identidade e diferenças individuais','Texto-base: estudo sobre introversão, prática oral, identidade linguística e aprendizagem de sons em inglês.'],
 [[87,90],'Língua Inglesa','Pronúncia, fluência, inteligibilidade e compreensão oral','Texto-base: discussão sobre espontaneidade na fala, excesso de correção e efeitos da pronúncia artificial na fluência e compreensão.'],
 [[91,96],'Língua Inglesa','Linguística: relação entre fala e escrita e história dos estudos da linguagem','Texto-base: David Crystal sobre o prestígio histórico da escrita e a precedência e aquisição natural da fala.'],
 [[97,100],'Língua Inglesa','Fonética e fonologia: aquisição, inteligibilidade e dificuldades de pronúncia','Texto-base: artigo sobre idade de início, fatores cognitivos e impacto da pronúncia na comunicação em inglês.'],
 [[101,106],'Educação e Currículo','Referencial Curricular de Alagoas: competências de língua inglesa no ensino fundamental','Contexto: competências do ReCAL para valorização cultural, inclusão, diversidade linguística, protagonismo e mídias digitais.'],
 [[107,112],'Educação e Currículo','Referencial Curricular de Alagoas: habilidades e progressão do ensino de inglês','Contexto: habilidades previstas por ano, ludicidade, vocabulário cotidiano, formas verbais, escrita e reconhecimento de estruturas poéticas.'],
 [[113,116],'Educação e Currículo','Avaliação da aprendizagem de língua inglesa e multiletramentos','Contexto: critérios e práticas avaliativas para acompanhar aprendizagem, proficiência, leitura oral e produção digital vinculada às realidades locais.'],
 [[117,120],'Educação e Currículo','BNCC: competências de língua inglesa no ensino médio','Contexto: língua inglesa integrada à área de Linguagens e suas Tecnologias, diversidade de usos e fruição cultural.'],
]
const grupo=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}
const fontes=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`),'utf8')).map(String)
const cabecalho=/^(?:Based on|Based on the|According to|In the|It can be inferred|The expression|The word|The verbal|The quote|The arguments|The analogy|The text|Teachers|Some more|Another aspect|The role|Whatever|This is|General observation|Of course|Many learners|A partir|Quanto|Com relação|As mídias|Reconhecer|Estudantes|Questões|Métodos|Identificar|Pela natureza|Espera-se|A leitura|Para garantir|Considerando-se|As competências|Ao final|Os textos|A BNCC|In Tanzania|Since ELF|Given the|In “|As soon as|At the end|She continued|However|These situations|Therefore|The history|Written language|The everyday|There was|This approach|A teacher|A patient|Julgue|Tendo em vista|Com base|Considerando)/i
const titulo=/^[A-ZÁÉÍÓÚÃÕÇ0-9\s/–-]{12,}$/
function textoOficial(n,page){
 const t=fontes[page-1]||'',m=new RegExp(`(?:^|\\n)\\s*${n}\\s+`).exec(t);assert.ok(m,`item ${n} não localizado na página ${page}`)
 let s=t.slice(m.index+m[0].length).split(/\n\s*(?=(?:5[1-9]|6\d|7\d|8\d|9\d|10\d|11\d|120)\s+)/)[0]
 s=s.split(/\n\s*Espaço livre\b/i)[0]
 const linhas=s.split(/\n/),limpa=[]
 for(const linha of linhas){const x=linha.trim();if(!x)continue;if(cabecalho.test(x)||titulo.test(x))break;limpa.push(x)}
 let texto=limpa.join(' ').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()
 if(n===55)texto='The quote “take the subject that seems simple so you can go far” (second paragraph) is a piece of advice from Ms. Njau’s teacher.'
 if(n===76)texto=texto.replace('phenom ena','phenomena')
 assert.ok(texto.length>12,`enunciado ${n}`);return texto
}
const hard=new Set([54,57,58,60,61,63,64,65,68,71,73,75,77,78,79,80,82,85,86,87,89,90,92,93,94,95,96,98,99,100,103,105,106,108,110,111,112,114,116,118,120])
const patches=[]
for(const[n,q]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const answer=answers.get(n),[materia,conteudo,contexto]=grupo(n).slice(1),page=Number(q.pagina),imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 patches.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2021,
  concurso:'SEDUC-AL 2021 — Professor, Especialidade Inglês (Cargo 12)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'17/10/2021',cargo:'Professor — Especialidade Inglês (Cargo 12)',numero_original:n,pagina:page,
  dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial para prova de nível superior; não é classificação oficial da banca.',
  classificacao_fonte:prova,motivo:'Classificação temática conferida no caderno oficial; respostas conferidas no gabarito definitivo do Cargo 12 — Inglês.',
  enunciado:textoOficial(n,page),texto_apoio:contexto,opcoes:['Certo','Errado'],resposta_correta:answer==='C'?0:1,anulada:false,
  gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_606_SEDUC_AL_012_01.PDF',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do Cargo 12 — Professor de Inglês, aplicação em 17/10/2021.'},
  visual:{pagina:page,imagem,motivo:`Página ${page} do caderno oficial, com texto-base ou tirinha associado ao item.`},apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']})
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Língua Inglesa',conteudo:'Captura duplicada do mesmo item no mesmo caderno',ano:2021,concurso:'SEDUC-AL 2021 — Professor, Especialidade Inglês (Cargo 12)',banca:'CEBRASPE',numero_original:Number(q.numero),pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,73)
const hash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=hash;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_do_gabarito_oficial_51_a_120; nao_e_hash_do_pdf'}
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,anulados:patches.filter(p=>p.anulada).map(p=>p.numero_original),amostras:patches.filter(p=>p.gabarito_oficial&&[51,55,56,62,66,72,76,81,87,91,97,101,107,113,117,120].includes(p.numero_original)).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,resposta:p.gabarito_oficial.resposta,enunciado:p.enunciado.slice(0,110),pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
