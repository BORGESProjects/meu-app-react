import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-pf-perito-civil-2018-v507',doc='bc781b3b470dd90b'
const prova='https://cdn.cebraspe.org.br/concursos/pf_18/arquivos/MATRIZ_408_DGPPF008__PAG_4.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/PF_18/arquivos/GAB_DEFINITIVO_408_DGPPF008__PAG_4.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(ps.length,73)

// Transcrição do gabarito definitivo oficial, itens 51–120. X = anulado.
const rows=[
 ['C','C','E','E','E','X','C','E','E','E','C','C','E','E','E','E','C','C','E','C'],
 ['C','C','C','E','C','E','E','E','C','E','C','C','E','C','E','C','C','E','C','E'],
 ['X','C','E','C','C','E','E','C','C','C','E','C','E','X','C','X','C','E','E','E'],
 ['C','C','E','C','E','C','E','E','E','X'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51
for(const row of rows)for(const answer of row)answers.set(number++,answer)
assert.equal(number,121)

// Capturas repetidas do mesmo número; mantém-se a cópia mais legível e completa.
const duplicates=new Map([
 ['extr-a90ba3e707dcce4d1967','extr-bf1dcfe047af27606c99'],
 ['extr-4bb41e74cfc8505fda39','extr-8fe9ecc107fd5fac4bb7'],
 ['extr-fb27da01d3fff98ee410','extr-fd8c5b58f991b36f9d4c'],
 ['extr-45e7ebcc3dcb82217fcc','extr-31552bf7c06dab8c33d3'],
 ['extr-6545de0f1280e2b081a8','extr-d81de476cf238472fea8'],
 ['extr-e9e34b0238570189c260','extr-749ccc2498685a1c3ef7'],
])

const groups=[
 [[51,53],'Engenharia Civil','Engenharia ferroviária: superestrutura e dormentes','Ao analisar um projeto ferroviário, avaliam-se espaçamento e emprego de dormentes de concreto em função da velocidade, do tipo de via e da plataforma.'],
 [[54,55],'Engenharia Civil','Orçamento e custos de obras: administração local e BDI','Em obra pública sem acréscimo de serviços, discute-se pedido de prorrogação de prazo com aumento do custo de administração local.'],
 [[56,58],'Engenharia Civil','Orçamento de obras: medição, produtividade e SINAPI','Em contrato de pintura por empreitada a preço unitário, discutem-se medição de vãos e produtividade de mão de obra com base no SINAPI.'],
 [[59,61],'Engenharia Civil','Terraplenagem: execução e proteção de aterros','Em aterro rodoviário executado em camadas compactadas, há previsão de chuva e adoção de selamento da camada recém-executada.'],
 [[62,63],'Engenharia Civil','Pavimentação: pavimentos rígidos e flexíveis','Comparam-se a distribuição de cargas nas camadas inferiores de pavimentos rígidos de concreto e flexíveis com CBUQ.'],
 [[64,65],'Engenharia Civil','Fundações superficiais e comportamento de solos','Durante a execução de sapatas, identifica-se um bolsão de argila mole sob uma das fundações.'],
 [[66,68],'Engenharia Civil','Custos de obras rodoviárias: SICRO 2','Classificam-se administração local, mobilização e desmobilização no orçamento de uma obra rodoviária segundo o SICRO 2.'],
 [[69,71],'Engenharia Civil','Orçamento de obras públicas: Curva ABC e sobrepreço','Em orçamento de prédio público, usa-se o princípio de Pareto para selecionar serviços e conferir preços de insumos.'],
 [[72,74],'Engenharia Civil','Tecnologia do concreto e execução de estruturas','Em edifício de concreto armado, observam-se problemas de consistência do concreto, classe do cimento e diâmetro das armaduras.'],
 [[75,79],'Engenharia Civil','Pontes de concreto: ações, sistemas estruturais e estados limites','Itens sobre análise e dimensionamento de pontes de concreto armado, cargas móveis e estados limites.'],
 [[80,85],'Engenharia Civil','Barragens: vertedouros, estabilidade e instrumentação','Itens sobre vertedouros, estabilidade de barragens de terra e instrumentos para monitorar pressões e deslocamentos.'],
 [[86,89],'Engenharia Civil','Avaliação de imóveis urbanos: métodos e tratamento de dados','Aplicação de métodos de avaliação imobiliária e tratamento de dados conforme a NBR 14653-2:2011.'],
 [[90,92],'Engenharia Civil','Engenharia portuária: quebra-mares, dársenas e proteção costeira','Itens sobre estruturas de proteção e áreas de manobra e acostagem em obras portuárias.'],
 [[94,98],'Direito Administrativo','Licitações e contratos de obras públicas','Itens sobre pregão, Regime Diferenciado de Contratações e leis de licitação aplicáveis a obras e serviços de engenharia.'],
 [[99,103],'Engenharia Civil','Geotecnia: aterros, estabilidade e classificação de materiais','Figura de aterro sobre maciço homogêneo com expressão da altura crítica; itens sobre fator de segurança, bermas, solos compressíveis e classificação de materiais.'],
 [[104,104],'Engenharia Civil','Hidrologia aplicada a obras hidráulicas','Projeto de barragem, drenagem, galeria pluvial ou bueiro requer dados de precipitação obtidos por pluviômetros ou pluviógrafos.'],
 [[105,105],'Engenharia Ambiental','Poluição hídrica e saneamento ambiental','Consideram-se estiagens prolongadas e lançamento de esgoto em corpos hídricos superficiais.'],
 [[106,106],'Engenharia Civil','Hidrologia: precipitação média','Métodos para estimar a precipitação média em uma área.'],
 [[107,107],'Engenharia Ambiental','Bacias hidrográficas e conservação de matas ciliares','Avalia-se a influência da mata ciliar no escoamento superficial e nas vazões de pico.'],
 [[108,111],'Engenharia Ambiental','Saneamento: tratamento anaeróbio e esgoto','Itens sobre tanque séptico, digestão anaeróbia, parâmetros de tratamento e dimensionamento de unidades de esgoto.'],
 [[112,112],'Engenharia Ambiental','Resíduos sólidos: localização e operação de aterros','Planejamento de aterro sanitário e controlado, incluindo localização, proteção hídrica, acesso e drenagem.'],
 [[113,120],'Engenharia Civil','Engenharia rodoviária: materiais, transporte, pavimentação e drenagem','Diagrama de ocorrências de materiais para rodovia federal de 80 km, com empréstimos, areais, pedreira, jazida de cascalho, usina e canteiro; o projeto também prevê drenos profundos.'],
]
const classify=n=>{const x=groups.find(([[lo,hi]])=>n>=lo&&n<=hi);assert.ok(x,`classificação ${n}`);return x.slice(1,3)}
const support=n=>{const x=groups.find(([[lo,hi]])=>n>=lo&&n<=hi);return x?.[3]||''}

// Usa o texto extraído do caderno oficial local para separar cada item do contexto seguinte.
const fonte=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`),'utf8'))
const paginas=fonte.map(s=>String(s||''))
function textoOficial(n,pagina){
 const t=paginas[pagina-1]||''
 const rx=new RegExp(`(?:^|\\n)${n}\\s+`)
 const m=rx.exec(t);assert.ok(m,`item ${n} ausente no texto-fonte da página ${pagina}`)
 let s=t.slice(m.index+m[0].length)
 s=s.split(/\n\s*\n/)[0].split(/\n(?=\d{2,3}\s+)/)[0]
 s=s.replace(/\s*Matriz_408_DGPPF008_[\s\S]*$/i,'').replace(/\s*Espaço livre\s*$/i,'').replace(/\s+/g,' ').trim()
 return s
}
const canonical=new Map()
for(const q of ps){if(duplicates.has(q.id))continue;const arr=canonical.get(Number(q.numero))||[];arr.push(q);canonical.set(Number(q.numero),arr)}
for(const q of ps)for(const [dup,keeper] of duplicates)if(q.id===dup)assert.ok(ps.some(x=>x.id===keeper&&x.numero===q.numero),`duplicata ${dup}`)
assert.equal(canonical.size,67)
for(const [n,arr] of canonical){assert.equal(arr.length,1,`número ${n}`);assert.ok(answers.has(n));assert.ok(arr[0].pagina>=1&&arr[0].pagina<=4)}

const hard=new Set([72,74,78,81,83,86,88,89,99,101,104,106,113,114,117,119])
const patches=[]
for(const [n,[q]] of [...canonical].sort((a,b)=>a[0]-b[0])){
 const answer=answers.get(n),[materia,conteudo]=classify(n),page=Number(q.pagina)
 const enunciado=textoOficial(n,page)
 assert.ok(enunciado.length>20,`enunciado ${n}`)
 const annulled=answer==='X'
 const imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const extraImage=n>=113&&n<=120?{pagina:4,imagem:`paginas/${doc}-0004.webp`,texto:'Diagrama de ocorrências de materiais descrito no texto-base.'}:n===99?{pagina:3,imagem:`paginas/${doc}-0003.webp`,texto:'Figura e expressão da altura crítica do aterro, necessárias à interpretação do item.'}:null
 patches.push({
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2018,
  concurso:'Polícia Federal — Perito Criminal Federal/Área 7 (Engenharia Civil), 2018',
  banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'16/09/2018',cargo:'Perito Criminal Federal — Área 7 (Engenharia Civil)',
  numero_original:n,pagina:page,dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial para engenharia de nível superior; a banca não publicou escala de dificuldade por item.',
  classificacao_fonte:prova,motivo:`Aplicação, cargo e item conferidos no caderno oficial da PF 2018; classificação por assunto do enunciado e contexto da prova.`,
  enunciado,texto_apoio:support(n),opcoes:['Certo','Errado'],
  ...(annulled?{resposta_correta:null,anulada:true}:{resposta_correta:answer==='C'?0:1,anulada:false}),
  gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_408_DGPPF008__PAG_4.PDF',numero:n,pagina:1,resposta:answer,criterio:annulled?'Item anulado no gabarito oficial definitivo.':'Gabarito oficial definitivo do Cargo 8 — Perito Criminal Federal/Área 7, aplicação em 16/09/2018.'},
  visual:{pagina:page,imagem,motivo:extraImage?.texto||`Página ${page} do caderno oficial, conferida para manter o item e seu contexto.`},
  ...(extraImage?{imagens_contexto:[extraImage]}:{}),
  apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']
 })
}
for(const [id,keeper] of duplicates){
 const q=ps.find(x=>x.id===id);assert.ok(q)
 patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Engenharia Civil',conteudo:'Captura duplicada do mesmo item no mesmo caderno',ano:2018,concurso:'Polícia Federal — Perito Criminal Federal/Área 7 (Engenharia Civil), 2018',banca:'CEBRASPE',numero_original:Number(q.numero),pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'duplicata_do_mesmo_item_no_mesmo_caderno'})
}
assert.equal(patches.length,73)
const hashGabarito=createHash('sha256').update(rows.flat().join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=hashGabarito;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_dos_itens_51_a_120; nao_e_hash_do_pdf'}
const amostras=patches.filter(p=>p.gabarito_oficial&&[51,54,55,56,58,62,64,69,72,75,80,86,90,94,99,104,106,112,113,120].includes(p.numero_original)).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,gabarito:p.gabarito_oficial.resposta,anulada:p.anulada,enunciado:p.enunciado.slice(0,110),pagina:p.pagina,apoio:p.texto_apoio?.slice(0,70)}))
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,anulados:patches.filter(p=>p.anulada).map(p=>p.numero_original),amostras},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
