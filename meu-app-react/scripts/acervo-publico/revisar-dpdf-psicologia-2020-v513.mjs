import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-dpdf-psicologia-2020-v513',doc='c258741dddd0b609'
const prova='https://cdn.cebraspe.org.br/concursos/dpdf_20_analista/arquivos/548_DPDF_012_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/dpdf_20_analista/arquivos/GAB_DEFINITIVO_548_DPDF_012_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/dpdf_20_analista/arquivos/DPDF_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO_12_4.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,73)

const rows=[
 ['E','C','C','C','C','E','C','E','C','E','E','C','C','E','E','C','C','C','E','E'],
 ['E','E','E','C','E','C','E','C','C','C','E','C','E','C','C','E','E','E','X','C'],
 ['C','C','C','C','E','E','E','E','E','C','X','E','C','C','E','C','E','C','E','C'],
 ['E','C','C','C','E','C','C','E','E','C'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51;for(const row of rows)for(const answer of row)answers.set(number++,answer);assert.equal(number,121)

const byNumber=new Map();for(const q of ps){const a=byNumber.get(Number(q.numero))||[];a.push(q);byNumber.set(Number(q.numero),a)}
const canonical=new Map([...byNumber].map(([n,a])=>[n,a[0]]));assert.equal(canonical.size,66)
assert.deepEqual([...byNumber].filter(([,a])=>a.length>1).map(([n,a])=>[n,a.length]),[[53,2],[55,2],[57,2],[59,2],[60,2],[62,2],[63,2]])
for(const n of canonical.keys())assert.ok(answers.has(n),`gabarito ${n}`)
const duplicates=new Map([...byNumber.values()].filter(a=>a.length>1).flatMap(a=>a.slice(1).map(q=>[q.id,a[0].id])))

const groups=[
 [[51,55],'Psicologia Clínica','Avaliação psicológica e transtorno do pânico','Contexto: adulto com episódios recorrentes de falta de ar, taquicardia e náuseas, sem causa física identificada; avaliação diferencial de medo, ansiedade e sintomas de pânico.'],
 [[56,61],'Psicologia Clínica','Trauma, luto, estresse pós-traumático e dissociação','Contexto: testemunha da morte dos pais em acidente há mais de quatro meses, com insônia, fadiga, medo e revivescência fisiológica do evento.'],
 [[62,65],'Psicopatologia','Fobias, sintomas paranoides e transtornos relacionados a substâncias','Reconhecimento de manifestações clínicas e critérios diferenciais.'],
 [[66,75],'Saúde Pública','SUS, atenção primária e atuação do psicólogo','Atenção básica, diretrizes, prevenção, reabilitação, redução de danos, trabalho em equipe e atividades do psicólogo na Saúde da Família.'],
 [[76,80],'Psicologia Organizacional e do Trabalho','Estresse, adaptação e respostas individuais','Teorias do estresse, síndrome de adaptação geral, plasticidade fenotípica e variáveis que afetam respostas a estressores.'],
 [[81,84],'Gestão de Pessoas','Planejamento de pessoal e objetivos organizacionais','Contexto: a gestão de pessoas articula princípios e práticas para atrair, manter, motivar, treinar e desenvolver pessoas.'],
 [[85,88],'Gestão de Pessoas','Negociação organizacional e estratégias de influência','Contexto: negociação sobre um novo sistema de avaliação entre a direção e o sindicato de professores termina em impasse, seguido de imposição unilateral.'],
 [[89,92],'Gestão de Pessoas','Comprometimento, liderança e comportamento organizacional','Cultura, clima, grupos, normas compartilhadas e padrões de comportamento alinhados à estratégia organizacional.'],
 [[93,96],'Psicologia Organizacional e do Trabalho','Aprendizagem organizacional e desenvolvimento de competências','Rotinas organizacionais, aprendizagem prática, desempenho e desenvolvimento de competências.'],
 [[97,100],'Psicologia Organizacional e do Trabalho','Saúde do trabalhador, ergonomia e estratégias de enfrentamento','Demandas cognitivas, desgaste laboral, sofrimento relacionado ao trabalho e uso de álcool como estratégia de mediação.'],
 [[101,105],'Gestão Pública','Gestão de pessoas no setor público','Regime jurídico, provimento, recompensas, engajamento e gestão por competências na administração pública.'],
 [[106,108],'Gestão do Conhecimento','Conhecimento tácito e explícito, competências e turnover','Conversão do conhecimento, espiral do conhecimento e efeitos da gestão por competências.'],
 [[109,111],'Gestão de Pessoas','Processos de gestão de pessoas e gestão social','Administração de pessoal, processos de agregar, recompensar, aplicar, manter, desenvolver e monitorar pessoas.'],
 [[112,115],'Gestão de Pessoas','Recrutamento e seleção','Recrutamento interno e externo, planejamento, técnicas de seleção e amostra comportamental.'],
 [[116,118],'Gestão de Pessoas','Plano de carreira, promoção e avaliação de cargos','Carreira, motivação, ascensão profissional e métodos de avaliação não quantitativa.'],
 [[119,120],'Ética Profissional','Código de Ética Profissional do Psicólogo em organizações','Sigilo, compartilhamento de informações e compatibilidade de políticas organizacionais com a ética profissional.'],
]
const grupo=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}
const pendencias=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`),'utf8')).map(String)
const cabecalho=/^(?:A partir|A respeito|Acerca|Com relação|No que se refere|Considerando|Sabendo|Tendo em vista|Julgue|No que diz respeito|Com base)\b/i
const titulo=/^[A-ZÁÉÍÓÚÃÕÇ0-9\s/–-]{8,}$/
function textoOficial(n,page){
 const t=pendencias[page-1]||'',m=new RegExp(`(?:^|\\n)\\s*${n}\\s+`).exec(t);assert.ok(m,`item ${n} não localizado na página ${page}`)
 let s=t.slice(m.index+m[0].length).split(/\n\s*(?=(?:5[1-9]|6\d|7\d|8\d|9\d|1[01]\d|120)\s+)/)[0]
 s=s.split(/\n\s*Espaço livre\b/i)[0]
 const linhas=s.split(/\n/),limpa=[]
 for(const linha of linhas){const x=linha.trim();if(!x)continue;if(cabecalho.test(x)||titulo.test(x))break;limpa.push(x)}
 let texto=limpa.join(' ').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()
 const cortes={55:'Uma pessoa de 34 anos de idade testemunhou',80:'Pode-se conceber gestão de pessoas',84:'Determinada organização ganharia',92:'A dinâmica organizacional oferece'}
 if(cortes[n])texto=texto.split(cortes[n])[0].trim()
 return texto
}
const hard=new Set([51,53,55,56,58,61,63,65,69,72,73,75,76,78,81,83,85,87,89,91,93,95,97,98,101,102,105,106,107,108,111,112,115,117,118,119])
const patches=[]
for(const[n,q]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const answer=answers.get(n),[materia,conteudo,contexto]=grupo(n).slice(1),page=Number(q.pagina),imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 let enunciado=textoOficial(n,page);assert.ok(enunciado.length>20,`enunciado ${n}`)
 enunciado=enunciado.replace(/possiblidade/g,'possibilidade').replace(/delirium n e m alucinação/gi,'delirium nem alucinação').replace(/respostas psicofisiológicas/gi,'respostas fisiológicas')
 const anulada=answer==='X'
 patches.push({
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2020,
  concurso:'DPDF 2020 — Analista de Apoio à Assistência Judiciária, Cargo 12: Psicologia',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'13/02/2022',cargo:'Analista de Apoio à Assistência Judiciária — Psicologia (Cargo 12)',numero_original:n,pagina:page,
  dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial para prova de nível superior; não é classificação oficial da banca.',
  classificacao_fonte:prova,motivo:'Classificação feita a partir do enunciado e da seção temática do caderno oficial; gabarito conferido na chave definitiva e nas justificativas de recurso.',
  enunciado,texto_apoio:contexto,opcoes:['Certo','Errado'],
  ...(anulada?{resposta_correta:null,anulada:true}:{resposta_correta:answer==='C'?0:1,anulada:false}),
  gabarito_oficial:{fonte:chave,justificativa:justificativas,arquivo:'GAB_DEFINITIVO_548_DPDF_012_01.PDF',numero:n,pagina:1,resposta:answer,criterio:anulada?'Item anulado no gabarito oficial definitivo; correção automática desativada.':'Gabarito oficial definitivo do Cargo 12 — Psicologia, aplicação em 13/02/2022.'},
  visual:{pagina:page,imagem,motivo:`Página ${page} do caderno oficial, vinculada para preservar o contexto integral do item.`},
  ...(anulada?{comentario:n===89?'Item anulado conforme justificativa oficial: controvérsia conceitual impediu julgamento objetivo.':'Item anulado conforme justificativa oficial: divergência na literatura prejudicou o julgamento objetivo.'}:{}),apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']
 })
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Psicologia',conteudo:'Captura duplicada do mesmo item no mesmo caderno',ano:2020,concurso:'DPDF 2020 — Analista de Apoio à Assistência Judiciária, Cargo 12: Psicologia',banca:'CEBRASPE',numero_original:Number(q.numero),pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,73)
const hash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=hash;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_do_gabarito_oficial_51_a_120; nao_e_hash_do_pdf'}
const divergencias=[]
for(const p of patches){const q=ps.find(x=>x.id===p.id);if(p.gabarito_oficial&&q?.resposta!=null&&p.resposta_correta!=null&&q.resposta!==p.resposta_correta)divergencias.push({numero:p.numero_original,id:p.id,anterior:q.resposta,oficial:p.gabarito_oficial.resposta})}
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,anulados:patches.filter(p=>p.anulada).map(p=>p.numero_original),divergencias,amostras:patches.filter(p=>p.gabarito_oficial&&[51,53,54,55,56,58,62,63,65,66,75,76,81,89,93,97,101,106,109,112,116,119,120].includes(p.numero_original)).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,resposta:p.gabarito_oficial.resposta,anulada:p.anulada,enunciado:p.enunciado.slice(0,100),pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
