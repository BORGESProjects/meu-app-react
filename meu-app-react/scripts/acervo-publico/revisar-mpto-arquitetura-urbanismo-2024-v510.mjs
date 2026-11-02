import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-mpto-arquitetura-urbanismo-2024-v510',doc='9af0eeff0d326229'
const prova='https://cdn.cebraspe.org.br/concursos/mp_to_24_servidor/arquivos/952_MP_TO_005_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/mp_to_24_servidor/arquivos/GAB_DEFINITIVO_952_MP_TO_005_01.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,73)

const rows=[
 ['E','E','E','C','C','C','E','E','E','E','C','C','E','E','C','E','C','E','C','C'],
 ['E','E','C','C','E','C','C','C','E','C','E','E','C','C','E','E','C','C','E','C'],
 ['E','C','E','C','E','C','E','C','C','E','E','C','C','E','C','E','E','C','C','C'],
 ['E','E','C','C','C','E','E','C','E','E'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51;for(const row of rows)for(const answer of row)answers.set(number++,answer);assert.equal(number,121)

const byNumber=new Map();for(const q of ps){const a=byNumber.get(Number(q.numero))||[];a.push(q);byNumber.set(Number(q.numero),a)}
const canonical=new Map([...byNumber].map(([n,a])=>[n,a[0]]))
assert.equal(canonical.size,70);assert.deepEqual([...byNumber].filter(([,a])=>a.length>1).map(([n,a])=>[n,a.length]),[[72,2],[73,2],[76,2]])
const duplicates=new Map([...byNumber.values()].filter(a=>a.length>1).flatMap(a=>a.slice(1).map(q=>[q.id,a[0].id])))

const groups=[
 [[51,52],'Arquitetura e Urbanismo','Desenho técnico digital: comandos de seleção e blocos CAD','Comandos BLOCK e WINDOW do AutoCAD.'],
 [[53,54],'Arquitetura e Urbanismo','Desenho técnico: projeções ortogonais e cortes','Leitura de vistas no primeiro diedro e representação por cortes.'],
 [[55,56],'Direito Urbanístico','Estatuto da Cidade: diretrizes e plano diretor','Diretrizes da política urbana e revisão decenal do plano diretor.'],
 [[57,58],'Arquitetura e Urbanismo','Teoria da arquitetura: forma, escala e proporção','Conceitos de linguagem e composição arquitetônica.'],
 [[59,60],'Arquitetura e Urbanismo','História da arquitetura: Grécia e Roma antigas','Espaço, técnicas construtivas, templos e arquitetura clássica.'],
 [[61,62],'Urbanismo','Teorias urbanas: Le Corbusier e Jane Jacobs','Densidade, desenho urbano, usos mistos e crítica ao urbanismo moderno.'],
 [[63,71],'Direito Urbanístico','Planejamento urbano, parcelamento do solo e Estatuto da Cidade','Gestão municipal, planejamento, ocupação do solo, equipamentos urbanos e função social da propriedade.'],
 [[72,74],'Legislação Profissional','Regulação profissional da Arquitetura e Urbanismo','Resolução CAU n.º 21/2012, Lei n.º 12.378/2010 e docência profissional.'],
 [[75,78],'Engenharia Urbana','Infraestrutura urbana: saneamento, sistema viário e drenagem','Esgotamento sanitário, hierarquia viária, projeção populacional e drenagem pluvial.'],
 [[79,81],'Topografia','Cartografia, georreferenciamento, terraplenagem e curvas de nível','Aplicações topográficas em projetos e estabilidade do terreno.'],
 [[82,85],'Urbanismo Sustentável','Sustentabilidade urbana e agendas ambientais','Energia solar, Agenda Habitat, cisternas e Agenda 21.'],
 [[86,90],'Arquitetura e Urbanismo','Paisagismo: história, composição e projeto de espaços livres','Jardins, composição vegetal, paisagem e tratamento de espaços exteriores e interiores.'],
 [[91,92],'Arquitetura e Urbanismo','Processo de projeto: programa de necessidades e programa arquitetônico','Requisitos sociais, funcionais, simbólicos e formais do ambiente construído.'],
 [[93,96],'Segurança contra Incêndio','Sinalização de emergência, comunicação visual e rotas de fuga','Sinalização básica e complementar, orientação e normas técnicas.'],
 [[97,97],'Conforto Ambiental','Conforto luminoso: visão, iluminância e luminância','Fisiologia visual e parâmetros de iluminação.'],
 [[98,102],'Instalações Elétricas','Instalações elétricas de baixa tensão: proteção, potência, aterramento e dimensionamento','DR, potência e fator de potência, esquema TN-S, seção de condutores e alimentação elétrica.'],
 [[103,108],'Segurança contra Incêndio','Saídas de emergência: rampas, escadas e dimensionamento','Declividade, fórmula de Blondel, população, unidades de passagem, pé-direito e resistência ao fogo.'],
 [[109,112],'Arquitetura e Urbanismo','Gestão de obras: responsabilidade, orçamento, fiscalização e canteiro','ART, orçamento analítico, fiscalização ambiental e instalações provisórias.'],
 [[113,117],'Arquitetura e Urbanismo','Sistemas construtivos e detalhamento: esquadrias, iluminação e impermeabilização','Esquadrias basculantes, planta luminotécnica, impermeabilização, cotagem e paredes de concreto.'],
 [[118,120],'Legislação Profissional','Responsabilidade técnica, acompanhamento e avaliação de imóveis','Fiscalização e acompanhamento de obras, avaliação de imóveis e atribuições para emissão de ART.'],
]
const grupo=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}
for(const n of canonical.keys())assert.ok(answers.has(n),`gabarito ${n}`)

const fonte=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`),'utf8')).map(String)
const cabecalho=/^(?:Em relação|Com base|Acerca|No que se refere|No que se relaciona|No que tange|No que diz respeito|No que concerne|A respeito|Com relação|Julgue|A partir|Considerando|No tocante|No âmbito|No contexto|Sobre|Relativamente|Tendo em vista|No que respeita)\b/i
function textoOficial(n,page){
 const t=fonte[page-1]||'',m=new RegExp(`(?:^|\\n)\\s*${n}\\s+`).exec(t);assert.ok(m,`item ${n} não localizado na página ${page}`)
 let s=t.slice(m.index+m[0].length).split(/\n\s*(?=(?:5[1-9]|6\d|7\d|8\d|9\d|1[01]\d|120)\s+)/)[0]
 s=s.split(/\n\s*Espaço livre\b/i)[0]
 const linhas=s.split(/\n/),limpa=[]
 for(const linha of linhas){const x=linha.trim();if(!x)continue;if(cabecalho.test(x))break;limpa.push(x)}
 return limpa.join(' ').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()
}
const hard=new Set([53,57,59,61,63,64,67,69,71,73,75,78,81,83,91,93,95,96,98,99,100,101,102,104,105,106,108,109,111,115,117,118,119,120])
const patches=[]
for(const[n,q]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const answer=answers.get(n),[materia,conteudo,resumo]=grupo(n).slice(1),page=Number(q.pagina),imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 let enunciado=textoOficial(n,page);assert.ok(enunciado.length>25,`enunciado ${n}`)
 // Corrige apenas ruído de OCR/ortografia evidente; preserva a proposição julgada.
 enunciado=enunciado.replace(/Lei n\.º 1237822010/g,'Lei n.º 12.378/2010').replace(/abóbodas/g,'abóbadas').replace(/obras primas/g,'obras-primas')
 const figura=n===100?'Esquema elétrico TN-S apresentado no caderno; a figura é necessária para conferir a distinção entre neutro e condutor de proteção.':''
 const anulada=answer==='X'
 patches.push({
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,
  concurso:'MPTO 2024 — Analista Ministerial Especializado, Cargo 5: Arquitetura e Urbanismo',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'03/03/2024',cargo:'Analista Ministerial Especializado — Arquitetura e Urbanismo (Cargo 5)',numero_original:n,pagina:page,
  dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo conteúdo e nível da prova; a banca não divulga dificuldade individual por item.',
  classificacao_fonte:prova,motivo:'Classificação por leitura individual do enunciado, do comando e do bloco temático do caderno oficial.',
  enunciado,texto_apoio:resumo,opcoes:['Certo','Errado'],
  ...(anulada?{resposta_correta:null,anulada:true}:{resposta_correta:answer==='C'?0:1,anulada:false}),
  gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_952_MP_TO_005_01.PDF',numero:n,pagina:1,resposta:answer,criterio:anulada?'Item anulado conforme gabarito oficial definitivo.':'Gabarito oficial definitivo do Cargo 5 — Arquitetura e Urbanismo, aplicação em 03/03/2024.'},
  visual:{pagina:page,imagem,motivo:figura||`Página ${page} do caderno oficial, vinculada para manter o contexto visual original.`},
  ...(figura?{imagens_contexto:[{pagina:page,imagem,texto:figura}]}:{}),apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']
 })
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Arquitetura e Urbanismo',conteudo:'Captura duplicada do mesmo item no mesmo caderno',ano:2024,concurso:'MPTO 2024 — Analista Ministerial Especializado, Cargo 5: Arquitetura e Urbanismo',banca:'CEBRASPE',numero_original:Number(q.numero),pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,73)
const hash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=hash;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_do_gabarito_oficial_51_a_120; nao_e_hash_do_pdf'}
const divergencias=[]
for(const p of patches){const q=ps.find(x=>x.id===p.id);if(p.gabarito_oficial&&q?.resposta!=null&&p.resposta_correta!=null&&q.resposta!==p.resposta_correta)divergencias.push({numero:p.numero_original,id:p.id,anterior:q.resposta,oficial:p.gabarito_oficial.resposta})}
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,anulados:patches.filter(p=>p.anulada).map(p=>p.numero_original),divergencias,figuras:patches.filter(p=>p.imagens_contexto).map(p=>({n:p.numero_original,imagem:p.imagens_contexto[0].imagem})),classificacoes:patches.filter(p=>p.gabarito_oficial).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,resposta:p.gabarito_oficial.resposta,pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
