import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-mpce-arquitetura-urbanismo-2025-v509',doc='6c344700ff33ab07'
const prova='https://cdn.cebraspe.org.br/concursos/mp_ce_25_servidor/arquivos/055_MPCE_002_01.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/mp_ce_25_servidor/arquivos/Gab_Definitivo_055_MPCE_002_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/mp_ce_25_servidor/arquivos/MP_CE_25_SERVIDOR_Justificativas_de_altera%C3%A7%C3%B5es_de_gabarito.pdf'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,73)

const rows=[
 ['C','X','E','C','E','C','C','E','C','E','C','E','E','C','E','E','C','E','E','E'],
 ['C','E','C','E','C','E','E','C','C','C','C','E','X','C','C','C','C','C','E','C'],
 ['C','C','X','C','C','C','C','E','C','C','E','X','C','C','E','C','C','E','C','E'],
 ['E','C','C','C','E','C','C','C','E','C'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51;for(const row of rows)for(const answer of row)answers.set(number++,answer);assert.equal(number,121)

const duplicates=new Map([
 ['extr-b121236fb023429562e4','extr-84ee9eb674ad10537190'],
 ['extr-cdd91a9c3541f665a117','extr-39ed7fa649e799cc505c'],
 ['extr-7e39b799ed99845dbfa8','extr-ac73d8b7a0bc67c1fc14'],
 ['extr-dce91ff1bc4a3f48e889','extr-fc3b18f61ad20d7ee064'],
])
const groups=[
 [[51,55],'Arquitetura e Urbanismo','História da arquitetura e do urbanismo','Itens sobre espaço público, habitação na Antiguidade, urbanismo clássico, arquitetura barroca e elementos da paisagem romana.'],
 [[56,57],'Arquitetura e Urbanismo','Representação gráfica: cortes e geometria descritiva','Itens sobre representação de cortes e fundamentos de geometria descritiva e projeções.'],
 [[58,58],'Arquitetura e Urbanismo','Arquitetura paisagística: NBR 16636-1:2017','Conceitos normativos de projeto de arquitetura paisagística, ajardinamento, especificação vegetal, irrigação e adubagem.'],
 [[59,63],'Arquitetura e Urbanismo','Representação arquitetônica: perspectiva, projeção, escala e normas','Itens sobre perspectiva, projeções, escala de desenho e normas de representação arquitetônica.'],
 [[64,68],'Arquitetura e Urbanismo','Desenho arquitetônico e ferramentas CAD/BIM','Itens sobre croqui conceitual, planta de implantação, comandos do AutoCAD, escalas e parâmetros geométricos do Revit.'],
 [[69,73],'Direito Ambiental','Licenciamento ambiental e estudo de impacto ambiental','Itens sobre acesso público ao EIA, licenciamento de parcelamento do solo, participação social, mitigação e monitoramento de impactos.'],
 [[74,79],'Engenharia Ambiental','Infraestrutura urbana, saneamento e recursos hídricos','Itens sobre tratamento de águas, universalização do saneamento, sistemas urbanos, mananciais e sustentabilidade hídrica.'],
 [[80,85],'Engenharia Ambiental','Abastecimento público de água e tratamento','Itens sobre casa de química, inspeção de mananciais, operação de sistemas de abastecimento e estruturas de captação mostradas em figura.'],
 [[86,88],'Arquitetura e Urbanismo','Arquitetura paisagística, jardins e acessibilidade em parques','Itens sobre jardins sobre lajes, compatibilização de paisagismo e infraestrutura e acessibilidade em áreas naturais protegidas.'],
 [[89,90],'Arquitetura e Urbanismo','Coordenação modular e racionalização da construção','Itens sobre módulo dimensional e padronização de componentes construtivos.'],
 [[91,95],'Conforto Ambiental','Conforto térmico e ventilação natural','Itens sobre materiais de isolamento térmico, zoneamento bioclimático, carta solar e controle da ventilação natural.'],
 [[96,99],'Conforto Ambiental','Conforto acústico e iluminação natural/artificial','Itens sobre propagação e absorção sonora, daylight factor, controle de luz artificial e eficiência energética.'],
 [[100,101],'Arquitetura e Urbanismo','Segurança contra incêndio: saídas de emergência','Itens sobre desobstrução, pé-direito e dimensionamento de saídas, escadas e rampas conforme a NBR 9077:2001.'],
 [[102,102],'Engenharia Elétrica','Sistemas de proteção contra descargas atmosféricas','Elementos de um sistema externo de proteção: captação, descidas, aterramento e dispersão.'],
 [[103,105],'Direito Urbanístico','Parcelamento do solo e Estatuto da Cidade','Itens sobre direito de preempção, crime relativo a parcelamento irregular e definição de áreas de proteção especial.'],
 [[106,107],'Arquitetura e Urbanismo','Coberturas e impermeabilização','Itens sobre seleção de impermeabilizantes e desempenho de coberturas em laje, madeira ou estrutura metálica.'],
 [[108,110],'Arquitetura e Urbanismo','Desenho técnico: representação e cotagem de portas','Figuras de folhas de porta, esquadrias e dimensões em desenho arquitetônico.'],
 [[111,112],'Arquitetura e Urbanismo','Escadas, corrimãos e dimensionamento de degraus','Itens sobre alturas de corrimãos em escolas e dimensionamento de piso e espelho de escada, com figura.'],
 [[113,114],'Arquitetura e Urbanismo','Acessibilidade em edificações: rampas e módulo de referência','Itens sobre inclinação e projeção horizontal de rampas e módulo de referência para cadeira de rodas, conforme NBR 9050:2020.'],
 [[115,115],'Engenharia Civil','Perícias e documentos técnicos de engenharia','Diferenças entre parecer técnico e laudo pericial à luz da norma de perícias na construção civil.'],
 [[116,116],'Direito Urbanístico','Área non aedificandi e restrições do loteamento','Condições legais ou contratuais e averbação de restrições de uso do solo.'],
 [[118,120],'Arquitetura e Urbanismo','Legislação profissional, CAU e responsabilidade técnica','Itens sobre autoria e alteração de projeto, atribuições profissionais, RRT e registro profissional no CAU.'],
]
const grupo=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}
const canonical=new Map();for(const q of ps){if(duplicates.has(q.id))continue;const arr=canonical.get(Number(q.numero))||[];arr.push(q);canonical.set(Number(q.numero),arr)}
assert.equal(canonical.size,69)
for(const [n,arr]of canonical){assert.equal(arr.length,1,`item ${n}`);assert.ok(answers.has(n));assert.ok(arr[0].pagina>=1&&arr[0].pagina<=4)}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id);assert.ok(q&&ps.some(x=>x.id===keeper&&x.numero===q.numero))}

const fonte=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`),'utf8')).map(String)
function textoOficial(n,page){
 const t=fonte[page-1]||'',m=new RegExp(`(?:^|\\n)${n}\\s+`).exec(t);assert.ok(m,`item ${n} não localizado na página ${page}`)
 let s=t.slice(m.index+m[0].length)
 s=s.split(/\n\s*\n/)[0].split(/\n(?=(?:5[1-9]|[6-9]\d|1[01]\d|120)\s+)/)[0]
 return s.replace(/\s*CEBRASPE\s*[–-]\s*MPCE\s*[–-]\s*Edital:\s*2025[\s\S]*$/i,'').replace(/\s*Espaço livre\s*$/i,'').replace(/\s+/g,' ').trim()
}
const hard=new Set([53,54,57,60,62,67,69,70,74,77,80,81,83,93,96,98,100,101,102,104,105,108,110,111,113,115,117,119])
const patches=[]
for(const[n,[q]]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const answer=answers.get(n),[materia,conteudo]=grupo(n).slice(1,3),page=Number(q.pagina),annulled=answer==='X'
 const enunciado=textoOficial(n,page);assert.ok(enunciado.length>25,`enunciado ${n}`)
 const imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const figura=([84,85].includes(n)?'Diagrama do subsistema de abastecimento de água, com captação, adutoras, tratamento, reservatório e cidade.':[108,109,110].includes(n)?'Pranchas com representação de folhas de porta e esquadria, necessárias para julgar o item.':n===112?'Figura de escada com medidas de piso e espelho.':'')
 const imagens_contexto=figura?[{pagina:page,imagem,texto:figura}]:undefined
 const comentario=n===83?'Item anulado. A justificativa oficial do CEBRASPE aponta o emprego de “portabilidade” em lugar de “potabilidade” como falha que prejudicou o julgamento objetivo.':annulled?'Item anulado conforme gabarito oficial definitivo e justificativas de alteração do CEBRASPE.':undefined
 patches.push({
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,
  concurso:'MPCE 2025 — Analista Ministerial, Cargo 2: Arquitetura e Urbanismo',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'13/04/2025',cargo:'Analista Ministerial — Arquitetura e Urbanismo (Cargo 2)',numero_original:n,pagina:page,
  dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial para prova de nível superior; a banca não publica dificuldade individual por item.',
  classificacao_fonte:prova,motivo:`Caderno oficial confirma cargo, aplicação e redação do item; assunto classificado pelo enunciado, comando e contexto da prova.`,
  enunciado,texto_apoio:grupo(n)[3],opcoes:['Certo','Errado'],
  ...(annulled?{resposta_correta:null,anulada:true}:{resposta_correta:answer==='C'?0:1,anulada:false}),
  gabarito_oficial:{fonte:chave,justificativa:justificativas,arquivo:'Gab_Definitivo_055_MPCE_002_01.PDF',numero:n,pagina:1,resposta:answer,criterio:annulled?'Item anulado no gabarito oficial definitivo.':'Gabarito oficial definitivo do Cargo 2 — Arquitetura e Urbanismo, aplicação em 13/04/2025.'},
  visual:{pagina:page,imagem,motivo:figura||`Página ${page} do caderno oficial, conferida para preservar o item e o bloco temático.`},
  ...(imagens_contexto?{imagens_contexto}:{}),...(comentario?{comentario}:{}),
  apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']
 })
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Arquitetura e Urbanismo',conteudo:'Captura duplicada do mesmo item no mesmo caderno',ano:2025,concurso:'MPCE 2025 — Analista Ministerial, Cargo 2: Arquitetura e Urbanismo',banca:'CEBRASPE',numero_original:Number(q.numero),pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,73)
const hash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=hash;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_do_gabarito_oficial_51_a_120; nao_e_hash_do_pdf'}
const divergencias=[]
for(const p of patches){const q=ps.find(x=>x.id===p.id);if(p.gabarito_oficial&&q?.resposta!=null&&p.resposta_correta!=null&&q.resposta!==p.resposta_correta)divergencias.push({numero:p.numero_original,id:p.id,anterior:q.resposta,oficial:p.gabarito_oficial.resposta})}
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,anulados:patches.filter(p=>p.anulada).map(p=>p.numero_original),divergencias,figuras:patches.filter(p=>p.imagens_contexto).map(p=>({n:p.numero_original,imagem:p.imagens_contexto[0].imagem})),amostras:patches.filter(p=>p.gabarito_oficial&&[51,52,55,56,58,62,67,69,74,80,83,84,86,89,91,96,100,102,103,108,111,112,113,115,118,120].includes(p.numero_original)).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,resposta:p.gabarito_oficial.resposta,anulada:p.anulada,enunciado:p.enunciado.slice(0,100),pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
