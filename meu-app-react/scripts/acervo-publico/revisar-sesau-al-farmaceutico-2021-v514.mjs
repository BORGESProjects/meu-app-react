import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-sesau-al-farmaceutico-2021-v514',doc='cbc58b0fb21c4d47'
const prova='https://cdn.cebraspe.org.br/concursos/sesau_al_21/arquivos/603_SESAU_006_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/sesau_al_21/arquivos/GAB_DEFINITIVO_603_SESAU_006_01.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,73)
const rows=[
 ['C','E','E','E','E','C','C','E','C','C','C','E','E','E','E','E','C','C','E','C'],
 ['C','C','C','E','C','E','C','E','E','C','C','C','E','C','E','C','C','C','C','C'],
 ['E','E','E','E','E','E','C','E','C','E','E','C','C','E','C','E','C','C','E','C'],
 ['E','C','E','C','E','C','E','E','E','C'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51;for(const row of rows)for(const answer of row)answers.set(number++,answer);assert.equal(number,121)
const byNumber=new Map();for(const q of ps){const a=byNumber.get(Number(q.numero))||[];a.push(q);byNumber.set(Number(q.numero),a)}
const canonical=new Map([...byNumber].map(([n,a])=>[n,a[0]]));assert.equal(canonical.size,70)
assert.deepEqual([...byNumber].filter(([,a])=>a.length>1).map(([n,a])=>[n,a.length]),[[51,2],[53,2],[55,2]])
for(const n of canonical.keys())assert.ok(answers.has(n),`gabarito ${n}`)
const duplicates=new Map([...byNumber.values()].filter(a=>a.length>1).flatMap(a=>a.slice(1).map(q=>[q.id,a[0].id])))

const groups=[
 [[51,55],'Farmacologia','Antimicrobianos macrolídeos, farmacocinética e bioequivalência','Contexto: gráfico de concentração plasmática após administração de dois comprimidos de claritromicina e estrutura molecular do fármaco.'],
 [[56,59],'Tecnologia Farmacêutica','Emulsões: EHL, cremagem, floculação, coalescência e separação de fases','Contexto: figuras I a IV representam fenômenos de instabilidade física em emulsões.'],
 [[60,62],'Farmacologia','Opioides: potência, eficácia e dispensação de morfina','Contexto: gráfico de curvas dose-resposta da morfina e da codeína.'],
 [[63,66],'Farmácia Hospitalar','Indicadores de consumo, DDD e uso racional de antimicrobianos','Contexto: consumo de meropenem e amicacina em UTI, expresso como dose diária definida por 100 leitos-dia.'],
 [[67,72],'Tecnologia Farmacêutica','Formulações dermatológicas, excipientes, emulsões e manipulação','Contexto: tabela percentual de formulação cutânea de sulfadiazina de prata, excipientes, conservantes e água purificada.'],
 [[73,75],'Farmácia Clínica','Interações medicamentosas e segurança farmacoterapêutica','Contexto: paciente em uso de metilfenidato, clomipramina e domperidona, com uso ocasional de antiácidos.'],
 [[76,80],'Tecnologia Farmacêutica','Preparações antissépticas alcoólicas, álcool-gel e cálculos de concentração','Contexto: preparo de antissépticos com álcool etílico 96 °GL, carbômero, glicerina, água e corretores de pH.'],
 [[81,84],'Análises Clínicas','Coleta de sangue, interferentes pré-analíticos, hemograma e dosagem de TSH','Contexto: preparo e coleta de amostras de uma paciente que tomou café da manhã quatro horas antes dos exames.'],
 [[85,88],'Análises Farmacêuticas','Validação analítica, curva de calibração, diluição e doseamento de comprimidos','Contexto: ensaio cromatográfico de comprimidos de 200 mg, curva y = 4.050x + 200 e faixa linear de 1 a 200 µg/mL.'],
 [[89,92],'Tecnologia Farmacêutica','Nanotecnologia farmacêutica e sistemas de liberação de fármacos','Contexto: nanopartículas poliméricas para tratamento tópico da acne, eficiência de encapsulação de 25%, diâmetro de 400 nm e Log P 4,2.'],
 [[93,98],'Tecnologia Farmacêutica','Dissolução, equivalência farmacêutica e classificação biofarmacêutica','Contexto: gráfico de perfis de dissolução comparativos entre medicamento de referência e medicamento teste.'],
 [[99,104],'Hematologia','Hemograma, leucemia linfocítica crônica, imunofenotipagem e prognóstico','Contexto: hemograma e citometria de fluxo de paciente idoso com linfocitose, anemia e linfadenopatia.'],
 [[105,110],'Imunologia Clínica','Resposta imune, infecções bacterianas e virais e HIV','Contexto: mecanismos celulares e humorais de resposta a infecções e evasão imunológica viral.'],
 [[111,116],'Imuno-hematologia','Tipagem ABO/Rh, provas direta e reversa e compatibilidade transfusional','Contexto: ensaio em placa de tipificação de seis amostras, com aglutinação por antissoros e eritrócitos conhecidos.'],
 [[117,120],'Hemoterapia','Hemovigilância, reações transfusionais e conservação de hemocomponentes','Contexto: reações transfusionais, notificação de eventos adversos e armazenamento de plasma fresco congelado.'],
]
const grupo=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}
const pendencias=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`),'utf8')).map(String)
const cabecalho=/^(?:A partir|A respeito|Acerca|Com relação|No que se refere|Considerando|Sabendo|Tendo em vista|Julgue|No que diz respeito|Com base|Em uma avaliação|Paciente|Um farmacêutico|Uma paciente|O gráfico|O ensaio|Para o doseamento|Com o objetivo|Amostras|Com relação)/i
const titulo=/^[A-ZÁÉÍÓÚÃÕÇ0-9\s/–-]{8,}$/
function textoOficial(n,page){
 const t=pendencias[page-1]||'',m=new RegExp(`(?:^|\\n)\\s*${n}\\s+`).exec(t);assert.ok(m,`item ${n} não localizado na página ${page}`)
 let s=t.slice(m.index+m[0].length).split(/\n\s*(?=(?:5[1-9]|6\d|7\d|8\d|9\d|10\d|11\d|120)\s+)/)[0]
 s=s.split(/\n\s*Espaço livre\b/i)[0]
 const linhas=s.split(/\n/),limpa=[]
 for(const linha of linhas){const x=linha.trim();if(!x)continue;if(cabecalho.test(x)||titulo.test(x))break;limpa.push(x)}
 let texto=limpa.join(' ').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()
 texto=texto.replace(/subunidades ribossômicas SOS/gi,'subunidades ribossômicas 50S').replace(/meroptem/gi,'meropenem').replace(/13 h\./g,'13 h.').replace(/\b1h\b/g,'1 h').replace(/\b50S\b/g,'50S')
 assert.ok(texto.length>20,`enunciado ${n}`);return texto
}
const hard=new Set([53,55,58,62,64,69,71,72,73,77,78,82,85,86,87,89,91,92,93,98,100,101,102,104,107,108,110,111,113,114,115,116,117,119,120])
const patches=[]
for(const[n,q]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const answer=answers.get(n),[materia,conteudo,contexto]=grupo(n).slice(1),page=Number(q.pagina),imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const anulada=answer==='X'
 patches.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2021,
  concurso:'SESAU-AL 2021 — Especialista em Saúde, Farmacêutico (Cargo 6)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'12/09/2021',cargo:'Especialista em Saúde — Farmacêutico (Cargo 6)',numero_original:n,pagina:page,
  dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial para prova de nível superior; não é classificação oficial da banca.',
  classificacao_fonte:prova,motivo:'Classificação feita a partir do enunciado, dos blocos temáticos e do caderno oficial; chave conferida no gabarito definitivo do Cargo 6.',
  enunciado:textoOficial(n,page),texto_apoio:contexto,opcoes:['Certo','Errado'],...(anulada?{resposta_correta:null,anulada:true}:{resposta_correta:answer==='C'?0:1,anulada:false}),
  gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_603_SESAU_006_01.PDF',numero:n,pagina:1,resposta:answer,criterio:anulada?'Item anulado no gabarito oficial definitivo; correção automática desativada.':'Gabarito oficial definitivo do Cargo 6 — Farmacêutico, aplicação em 12/09/2021.'},
  visual:{pagina:page,imagem,motivo:`Página ${page} do caderno oficial, vinculada ao item para preservar gráficos, estruturas, tabelas e demais elementos visuais.`},apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']})
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Farmácia',conteudo:'Captura duplicada do mesmo item no mesmo caderno',ano:2021,concurso:'SESAU-AL 2021 — Especialista em Saúde, Farmacêutico (Cargo 6)',banca:'CEBRASPE',numero_original:Number(q.numero),pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,73)
const hash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=hash;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_do_gabarito_oficial_51_a_120; nao_e_hash_do_pdf'}
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,anulados:patches.filter(p=>p.anulada).map(p=>p.numero_original),amostras:patches.filter(p=>p.gabarito_oficial&&[51,53,56,60,63,67,73,76,81,85,89,93,99,105,111,117,120].includes(p.numero_original)).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,resposta:p.gabarito_oficial.resposta,enunciado:p.enunciado.slice(0,120),pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
