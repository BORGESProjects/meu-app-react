import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-sefin-fortaleza-geografia-2023-v512',doc='b3c1010d6948592b'
const prova='https://cdn.cebraspe.org.br/concursos/sefin_fortaleza_ce_23/arquivos/848_SEFIN_CE_ANALISTA_007_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/sefin_fortaleza_ce_23/arquivos/GAB_DEFINITIVO_848_SEFIN_CE_ANALISTA_007_01.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,73)

const rows=[
 ['C','E','E','E','C','E','C','E','E','C','E','E','C','E','C','E','E','C','E','E'],
 ['C','E','C','C','C','C','E','E','C','E','C','C','E','C','C','C','E','E','E','C'],
 ['C','E','C','C','C','E','C','C','C','E','C','E','C','C','C','E','E','C','C','E'],
 ['C','E','C','C','C','E','C','E','C','E'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51;for(const row of rows)for(const answer of row)answers.set(number++,answer);assert.equal(number,121)
const lastRow=['C','E','E','C','C','C','E','C','C','C','E','E','E','E','E','C','E','C','C','C','E','C','C','E','C','E','C','E','C','E']
assert.equal(lastRow.length,30);number=121;for(const answer of lastRow)answers.set(number++,answer);assert.equal(number,151)

const byNumber=new Map();for(const q of ps){const a=byNumber.get(Number(q.numero))||[];a.push(q);byNumber.set(Number(q.numero),a)}
const canonical=new Map([...byNumber].map(([n,a])=>[n,a[0]]));assert.equal(canonical.size,70)
assert.deepEqual([...byNumber].filter(([,a])=>a.length>1).map(([n,a])=>[n,a.length]),[[54,2],[56,2],[57,2]])
assert.ok(canonical.has(51)&&canonical.has(150));for(const n of canonical.keys())assert.ok(answers.has(n),`gabarito ${n}`)
const duplicates=new Map([...byNumber.values()].filter(a=>a.length>1).flatMap(a=>a.slice(1).map(q=>[q.id,a[0].id])))

const groups=[
 [[51,54],'Cartografia','História e fundamentos das projeções cartográficas','Hiparco, Lambert, erro gráfico e limitações das projeções cartográficas.'],
 [[55,57],'Cartografia','Sistemas de coordenadas, projeção UTM e generalização cartográfica','Coordenadas planas e geodésicas, sistema UTM e adequação de elementos à escala.'],
 [[58,60],'Cartografia','Datum geodésico e classificação de projeções','Contexto visual: diagrama de transformação entre pontos no elipsoide e na projeção plana.'],
 [[61,62],'Cartografia','Convenções de cartas topográficas e relevo sombreado','Sombreamento de relevo, iluminação e símbolos cartográficos.'],
 [[63,65],'Geografia Física','Hidrografia e modelos digitais de elevação','Rede de drenagem, curvas de nível e representação numérica da altitude.'],
 [[66,67],'Cartografia Temática','Variáveis visuais, dimensão espacial e público-alvo','Dimensões X, Y e Z e finalidade de mapas temáticos.'],
 [[68,74],'Geomorfologia','Formas de relevo, processos geomorfológicos e planejamento ambiental','Gênese, evolução, impermeabilização urbana, riscos naturais e canalização fluvial.'],
 [[75,84],'Geografia Econômica','Globalização, modelos de desenvolvimento e organização territorial','Terciarização, liberalismo, mundialização, desigualdades Norte–Sul, keynesianismo, lugares centrais e planejamento territorial.'],
 [[85,91],'Geoprocessamento','SIG, dados espaciais, topologia, redes e modelos de terreno','Sistemas de informação geográfica, dados vetoriais, topologia, TIN, MDT e MDS.'],
 [[92,95],'Geodésia e GNSS','Posicionamento global, segmentos de sistemas e fontes de erro','GPS/GNSS, segmentos de sistema, relógios, código PRN e posicionamento diferencial.'],
 [[96,100],'Geoprocessamento','Análise espacial: densidade, autocorrelação, Voronoi e IDW','Kernel, índice de Moran, autocorrelação espacial e interpolação por distância.'],
 [[101,102],'Geoestatística','Variografia, semivariograma e krigagem ordinária','Média desconhecida, semivariâncias e estimação espacial.'],
 [[103,110],'Sensoriamento Remoto','Resolução espacial e temporal, pixels, radar e processamento de imagens','IFOV, variância intra/interpixel, polarização, radar e monitoramento ambiental por satélite.'],
 [[111,112],'Banco de Dados','SGBD relacional, SQL, DDL e DML','Definição, consulta, inserção, alteração e remoção de dados.'],
 [[113,117],'Geoprocessamento','Infraestrutura de dados espaciais e padrões OGC','INDE, interoperabilidade, geosserviços WCS, WMS e WFS, GML e componentes institucionais.'],
 [[118,120],'Cartografia Digital','Aerolevantamento, paralaxe, imageamento 360º e LiDAR','Aquisição de dados georreferenciados por plataformas aéreas, móveis e perfilamento a laser.'],
 [[121,124],'Geoprocessamento','Infraestrutura Nacional de Dados Espaciais (INDE)','Objetivos, atribuições do IBGE e compartilhamento de dados geoespaciais.'],
 [[139,140],'Cadastro Territorial','Plano Diretor, zoneamento e cadastro territorial multifinalitário','Zona de Ocupação Consolidada e base geométrica de cadastros temáticos municipais.'],
 [[141,143],'Geoprocessamento','QGIS: interface gráfica e ferramentas','Contexto visual: interface do QGIS com componentes numerados 1, 2 e 3, necessários para identificar barra de menu, calculadora raster e barra de status.'],
 [[144,145],'Geoprocessamento','Servidores de mapas: GeoServer, MapServer e WFS-T','Serviços de transação de feições e integração com aplicações.'],
 [[146,147],'Geoprocessamento','QGIS, GDAL/OGR, PostgreSQL e PostGIS','Bibliotecas de dados raster e vetoriais e extensão espacial do banco.'],
 [[148,150],'Banco de Dados Geográficos','SQL espacial: áreas, geometry e geography','Cálculo de áreas e representação de dados espaciais vetoriais e geográficos.'],
]
const grupo=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}

const fonte=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`),'utf8')).map(String)
const cabecalho=/^(?:Acerca|A confecção|No que concerne|No que se refere|No que diz respeito|Com base|Com referência|Considerando|Tendo em vista|Em relação|Em referência|De acordo|Julgue|No PostgreSQL)\b/i
const titulo=/^[A-ZÁÉÍÓÚÃÕÇ0-9\s/–-]{8,}$/
function textoOficial(n,page){
 const t=fonte[page-1]||'',m=new RegExp(`(?:^|\\n)\\s*${n}\\s+`).exec(t);assert.ok(m,`item ${n} não localizado na página ${page}`)
 let s=t.slice(m.index+m[0].length).split(/\n\s*(?=(?:5[1-9]|6\d|7\d|8\d|9\d|1[0-4]\d|150)\s+)/)[0]
 s=s.split(/\n\s*Espaço livre\b/i)[0]
 const linhas=s.split(/\n/),limpa=[]
 for(const linha of linhas){const x=linha.trim();if(!x)continue;if(cabecalho.test(x)||titulo.test(x))break;limpa.push(x)}
 return limpa.join(' ').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()
}
const hard=new Set([53,54,56,58,59,60,63,64,69,70,71,73,74,81,83,87,91,92,93,95,96,98,101,102,104,107,108,110,116,120,122,127,129,132,134,137,138,143,144,146,147,149,150])
const patches=[]
for(const[n,q]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const answer=answers.get(n),[materia,conteudo,contexto]=grupo(n).slice(1),page=Number(q.pagina),imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 let enunciado=textoOficial(n,page);assert.ok(enunciado.length>20,`enunciado ${n}`)
 enunciado=enunciado.replace(/^Um das dificuldades/i,'Uma das dificuldades').replace(/superficie plana/gi,'superfície plana').replace(/satélite têm um ruído/gi,'satélite tem um ruído').replace(/pixels d e composição/gi,'pixels de composição').replace(/K\s*0\b/g,'K₀')
 const contextImage=([58,59,60].includes(n)?{pagina:1,imagem:`paginas/${doc}-0001.webp`,texto:contexto}:[141,142,143].includes(n)?{pagina:5,imagem:`paginas/${doc}-0005.webp`,texto:contexto}:null)
 patches.push({
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2023,
  concurso:'SEFIN Fortaleza 2023 — Analista Fazendário Municipal, Cargo 7: Geografia',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'23/07/2023',cargo:'Analista Fazendário Municipal — Geografia (Cargo 7)',numero_original:n,pagina:page,
  dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial para prova de nível superior; não representa classificação oficial da banca.',
  classificacao_fonte:prova,motivo:'Assunto identificado pelo enunciado e pelo cabeçalho temático do caderno oficial; gabarito comparado com a chave definitiva do Cargo 7.',
  enunciado,texto_apoio:contexto,opcoes:['Certo','Errado'],resposta_correta:answer==='C'?0:1,anulada:false,
  gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_848_SEFIN_CE_ANALISTA_007_01.PDF',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do Cargo 7 — Analista Fazendário Municipal/Geografia, aplicação em 23/07/2023.'},
  visual:{pagina:page,imagem,motivo:contextImage?.texto||`Página ${page} do caderno oficial, vinculada para preservar a origem do item.`},
  ...(contextImage?{imagens_contexto:[contextImage]}:{}),apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']
 })
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Cartografia',conteudo:'Captura duplicada do mesmo item no mesmo caderno',ano:2023,concurso:'SEFIN Fortaleza 2023 — Analista Fazendário Municipal, Cargo 7: Geografia',banca:'CEBRASPE',numero_original:Number(q.numero),pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,73)
const hash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=hash;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_do_gabarito_oficial_51_a_120; nao_e_hash_do_pdf'}
const divergencias=[]
for(const p of patches){const q=ps.find(x=>x.id===p.id);if(p.gabarito_oficial&&q?.resposta!=null&&q.resposta!==p.resposta_correta)divergencias.push({numero:p.numero_original,id:p.id,anterior:q.resposta,oficial:p.gabarito_oficial.resposta})}
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,divergencias,figuras:patches.filter(p=>p.imagens_contexto).map(p=>({n:p.numero_original,pagina:p.imagens_contexto[0].pagina,imagem:p.imagens_contexto[0].imagem})),amostras:patches.filter(p=>p.gabarito_oficial&&[51,54,58,63,68,75,85,92,96,101,103,111,113,118,121,139,141,144,146,148,150].includes(p.numero_original)).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,resposta:p.gabarito_oficial.resposta,enunciado:p.enunciado.slice(0,100)}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
