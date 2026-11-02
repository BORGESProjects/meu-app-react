import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-tbg-2023-gasoduto-construcao-montagem-v518',doc='11f6d285f9a5e64a'
const prova='https://cdn.cebraspe.org.br/concursos/tbg_23/arquivos/888_TBG_019_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/tbg_23/arquivos/GAB_DEFINITIVO_888_TBG_019_01.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,72)
const rows=[
 ['C','C','C','C','C','C','E','E','E','C','E','E','C','E','E','C','E','E','C','E'],
 ['E','C','E','C','C','C','C','E','E','C','E','C','E','C','E','C','C','C','E','E'],
 ['E','C','E','C','C','C','E','C','C','E','C','E','C','C','E','C','E','E','E','C'],
 ['E','C','E','C','C','C','E','C','C','E'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=31;for(const row of rows)for(const answer of row)answers.set(number++,answer);assert.equal(number,101)
const byNumber=new Map();for(const q of ps){const list=byNumber.get(Number(q.numero))||[];list.push(q);byNumber.set(Number(q.numero),list)}
assert.equal(byNumber.size,69)
assert.deepEqual([...byNumber].filter(([,list])=>list.length>1).map(([n,list])=>[n,list.length]),[[50,2],[53,2],[56,2]])
const canonical=new Map([...byNumber].map(([n,list])=>[n,list.at(-1)]))
for(const n of canonical.keys())assert.ok(answers.has(n),`gabarito ${n}`)
const duplicates=new Map([...byNumber.values()].filter(list=>list.length>1).flatMap(list=>list.slice(0,-1).map(q=>[q.id,list.at(-1).id])))

const groups=[
 [[31,35],'Metrologia','Medição, indicação, incerteza e resultados metrológicos','Contexto: conceitos de metrologia e medição.'],
 [[36,37],'Gestão da Qualidade','Controle estatístico de processos e tolerâncias','Contexto: gestão da qualidade.'],
 [[38,45],'Física','Sistema Internacional de Unidades, grandezas físicas, pressão, temperatura, vazão, massa e densidade','Contexto: definições e unidades de parâmetros físicos no SI.'],
 [[46,50],'Segurança do Trabalho','Arranjo físico industrial, prevenção de incêndios, saídas de emergência e proteção do trabalhador','Contexto: segurança do trabalho em instalações industriais e proteção contra incêndios em edificações.'],
 [[51,53],'Gestão de Projetos','Dependências entre atividades, diagrama de Gantt e revisão de projetos','Contexto: gerenciamento de projetos.'],
 [[54,56],'Engenharia de Tubulações','Tubos de aço-carbono, dispositivos de alívio de pressão, curvas em gomos e representação técnica','Contexto: tubulações de aço; o item 56 é acompanhado pela figura original da curva em gomos.'],
 [[57,59],'Termodinâmica','Entropia, compressão isotérmica, gases e máquinas térmicas','Contexto: conceitos e princípios da termodinâmica.'],
 [[60,63],'Desenho Técnico','Leitura de representação isométrica de tubulação e identificação de componentes','Texto-base: figura isométrica de parte de uma tubulação de processamento, com itens numerados de 1 a 5; imagem original preservada na página 2.'],
 [[64,66],'Planejamento e Orçamento de Obras','Composição de equipes, homens-hora, máquinas-hora, medição e pagamento por serviço','Texto-base: montagem de trecho de gasoduto de 10 km prevista para 30 dias úteis, com jornada de 8 h/dia; equipes direta, indireta e de apoio, equipamentos, custo contratual de R$ 1.200.000/km, BDI de 35% e medições a cada 10 dias úteis.'],
 [[67,69],'Engenharia de Gás Natural','Processamento em UPGN, efeito Joule–Thomson, compressão e desidratação do gás','Texto-base: etapas do processamento de GN e GNL nas unidades de processamento de gás natural (UPGN), incluindo separação de impurezas e produtos antes da distribuição por gasoduto.'],
 [[70,70],'Engenharia de Tubulações','Válvulas de esfera: orifício de alívio de pressão e drenagem','Contexto: funcionamento de válvulas de esfera; corte esquemático original preservado na página 3.'],
 [[71,74],'Hidráulica e Hidrologia','Bacias hidrográficas, vazão, regimes de escoamento e perda de carga','Contexto: conceitos básicos de hidráulica e hidrologia.'],
 [[75,78],'Topografia','Fuso UTM, nivelamento, memorial descritivo e posicionamento RTK/GNSS','Contexto: conceitos básicos de topografia e georreferenciamento.'],
 [[79,82],'Gás Natural','Poder calorífico, riqueza, liquefação, dessulfuração e especificação do gás','Contexto: características do gás natural.'],
 [[83,85],'Legislação de Uso do Solo','Faixa não edificável, faixa de domínio, servidão de passagem e passagem forçada','Contexto: legislação sobre ocupação do solo, servidão de passagem, áreas não edificantes e faixa de domínio.'],
 [[86,90],'Geodésia','Sistema Geodésico Brasileiro, SIRGAS2000, projeções cartográficas e coordenadas UTM','Contexto: Sistema Geodésico Brasileiro e georreferenciamento de polígonos.'],
 [[91,95],'Topografia','Triângulos, distância, ângulos, azimute e rumo','Contexto: parâmetros básicos de topografia; figuras originais dos triângulos e da orientação dos pontos P₁/P₂ preservadas na página 4.'],
 [[96,100],'Corrosão e Proteção Catódica','Potenciais de redução, ânodos galvânicos e proteção catódica de estruturas de aço','Texto-base: potenciais de redução apresentados no caderno — Mg²⁺: −2,36 V; Zn²⁺: −0,76 V; Fe²⁺: −0,44 V; Sn²⁺: −0,14 V — para avaliar proteção catódica de uma estrutura de aço.'],
]
const group=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}
const hard=new Set([32,35,37,38,41,45,47,48,51,53,55,56,58,59,60,61,62,63,64,65,66,67,68,69,70,71,73,74,77,78,79,82,83,85,87,88,91,92,93,94,95,96,98,99,100])
const clean=(n,s)=>{
 let t=String(s||'').replace(/[\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim().replace(/\s+([,.;:!?])/g,'$1')
 const cuts={
  59:'A figura acima ilustra',63:'No planejamento da montagem',66:'Da produção ao consumo',69:'Válvulas são dispositivos',
  82:'À luz da legislação',85:'BLOCO III',88:'Considerando os pontos P',90:'Julgue os itens a seguir',
  92:'Considerando a figura precedente',95:'Uma maneira simples de prevenir',100:'Espaço livre'
 }
 if(cuts[n]){const i=t.indexOf(cuts[n]);if(i>=0)t=t.slice(0,i).trim()}
 if(n===58)t='Caso uma amostra de gás seja comprimida isotermicamente do volume V para o volume V/2, a pressão final desse gás dependerá do valor inicial da temperatura T do gás.'
 if(n===71)t='Se, para uma bacia, o coeficiente de compacidade, ou índice de Gravelius (Kc), é dado por Kc = 0,282 × P/√A, em que P é o perímetro e A é a área da bacia, então, quanto maior o valor de Kc, menor será a propensão da bacia a inundações.'
 if(n===96)t='Entre os metais da lista apresentada, o Mg²⁺ é o mais eficiente para efetuar proteção catódica de estruturas de aço.'
 return t
}
const patches=[]
for(const[n,q]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const [materia,conteudo,textoPadrao]=group(n).slice(1),answer=answers.get(n),page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,enunciado=clean(n,q.enunciado)
 const texto_apoio=[89,90].includes(n)?'Considerando os pontos P₁ = 170.000 mE, 9.060.000 mN e P₂ = 170.000 mE, 9.080.000 mN, nas coordenadas UTM.':textoPadrao
 assert.ok(enunciado.length>15,`enunciado ${n}`)
 patches.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2023,
  concurso:'TBG 2023 — Técnico Júnior, Ênfase Gasoduto, Construção e Montagem (Cargo 19)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'15/10/2023',cargo:'Técnico Júnior — Gasoduto, Construção e Montagem (Cargo 19)',numero_original:n,pagina:page,
  dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade do raciocínio e dos cálculos; não é classificação oficial da banca.',
  classificacao_fonte:prova,motivo:'Classificação conferida no caderno oficial do Cargo 19; respostas conferidas no gabarito definitivo do mesmo cargo.',
  enunciado,texto_apoio,opcoes:['Certo','Errado'],resposta_correta:answer==='C'?0:1,anulada:false,
  gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_888_TBG_019_01.PDF',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do Cargo 19 — Técnico Júnior, Ênfase Gasoduto, Construção e Montagem; prova aplicada em 15/10/2023.'},
  visual:{pagina:page,imagem:image,motivo:`Página ${page} do caderno oficial, vinculada para preservar figuras, fórmulas e contexto visual do item.`},apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']})
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id),n=Number(q.numero),[materia,conteudo]=group(n);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo:`Captura duplicada do item ${n}; mantida a versão com enunciado isolado`,ano:2023,concurso:'TBG 2023 — Técnico Júnior, Ênfase Gasoduto, Construção e Montagem (Cargo 19)',banca:'CEBRASPE',numero_original:n,pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,72)
const answerHash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=answerHash;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_do_gabarito_oficial_31_a_100; nao_e_hash_do_pdf'}
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,itens_ja_classificados_na_faixa:[...Array(70)].map((_,i)=>31+i).filter(n=>!byNumber.has(n)),formulas_corrigidas:[58,71],contextos_compostos:[59,63,66,69,82,85,88,90,92,95,100],amostras:patches.filter(p=>p.gabarito_oficial&&[31,38,46,50,51,54,56,58,60,64,67,70,71,75,79,83,86,91,93,96,100].includes(p.numero_original)).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,resposta:p.gabarito_oficial.resposta,enunciado:p.enunciado.slice(0,100),pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
