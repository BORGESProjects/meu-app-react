import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-sesau-al-radiologia-2021-v500'
const documento='c07dc46121667c79'
const prova='https://cdn.cebraspe.org.br/concursos/sesau_al_21/arquivos/603_SESAU_054_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/sesau_al_21/arquivos/GAB_DEFINITIVO_603_SESAU_054_01.PDF'
const edital='https://www.cebraspe.org.br/concursos/sesau_al_21'
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(pendentes.length,74)

const paginas=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${documento}.json.gz`)))
assert.equal(paginas.length,3)
const numRe='(?:5[1-9]|[6-9]\\d|1[01]\\d|120)'
const textoPorNumero=new Map()
for(const pagina of paginas){
  const re=new RegExp(`(?:^|\\n)\\s*(${numRe})\\s+([\\s\\S]*?)(?=\\n\\s*${numRe}\\s+|$)`,'g')
  for(const m of pagina.matchAll(re))if(!textoPorNumero.has(Number(m[1])))textoPorNumero.set(Number(m[1]),m[2].replace(/\s+/g,' ').trim())
}
if(textoPorNumero.size!==70)throw Error(`Texto-fonte incompleto: ${textoPorNumero.size}/70; faltam ${Array.from({length:70},(_,i)=>i+51).filter(n=>!textoPorNumero.has(n)).join(',')}`)

const respostas=[
 'C','C','E','C','C','E','C','E','E','C','C','C','E','C','E','E','C','C','C','C',
 'E','C','C','C','C','C','C','E','C','C','C','C','E','C','E','E','C','C','C','X',
 'E','E','C','E','E','C','C','E','E','X','C','C','E','C','C','E','C','C','E','C',
 'C','C','C','C','C','E','E','E','E','C'
]
assert.equal(respostas.length,70)
const shaGabarito=createHash('sha256').update(Array.from({length:70},(_,i)=>`${i+51}:${respostas[i]}`).join('|')).digest('hex')
const grupos=[
 [51,55,'Radioproteção','CNEN NN 3.01: limites de dose, exposição de gestantes, justificação e práticas com radiação ionizante','Julgue os próximos itens com base na Norma Nuclear CNEN NN 3.01/2014, sobre requisitos básicos de proteção radiológica contra exposição à radiação ionizante.'],
 [56,58,'Radioproteção','Monitoração individual, limites de exposição ocupacional e detectores de radiação','Julgue os itens sobre efeitos biológicos e monitoração de área e individual, à luz da legislação de proteção radiológica.'],
 [59,61,'Radiobiologia','Efeitos determinísticos e reações teciduais causados por radiações ionizantes','Julgue os itens sobre efeitos biológicos em indivíduos expostos a raios X ou raios gama.'],
 [62,65,'Radiologia','Meios de contraste radiológico: sulfato de bário, administração e reações adversas','Julgue os itens sobre meios de contraste usados em diagnóstico por imagem.'],
 [66,69,'Radiologia','Posicionamento radiográfico: decúbito, ortostase, incidência e orientação do raio central','Julgue os itens sobre posicionamento do paciente para demonstração radiográfica de partes do corpo.'],
 [70,74,'Radiologia','Critérios de avaliação radiográfica: anatomia, exposição, colimação, marcadores e movimento','Julgue os itens sobre critérios de avaliação da imagem e técnica radiográfica.'],
 [75,80,'Tomografia Computadorizada','Aquisição em TC: fases do abdome, matriz, FOV, helicoidal e contraste oral','Julgue os itens sobre tomografia computadorizada como modalidade de diagnóstico por imagem.'],
 [81,86,'Ressonância Magnética','Formação de imagem, prótons, saturação de gordura e ponderações T1 e T2','Julgue os itens sobre aspectos físicos e tecnológicos da ressonância magnética.'],
 [87,92,'Medicina Nuclear','PET, gama-câmara, cintilografia da tireoide e perfusão miocárdica','Julgue os itens sobre aspectos físicos e tecnológicos de medicina nuclear; PET refere-se à tomografia por emissão de pósitrons.'],
 [93,96,'Radioproteção','CNEN NN 3.05: recebimento de fontes, internação terapêutica, radiação de fundo e monitoração de contaminação','Julgue os itens com base nos requisitos de segurança e proteção radiológica para serviços de medicina nuclear (CNEN NN 3.05).'],
 [97,102,'Radiologia Digital','Resolução espacial, voxel, radiografia computadorizada, PACS e padrão DICOM','Julgue os itens sobre radiologia digital e evolução dos sistemas de aquisição e arquivamento de imagens.'],
 [103,105,'Anatomia Humana','Posição anatômica de referência, termos medial/lateral e plano axial','Julgue os itens sobre nomenclatura e terminologia anatômica adotadas em radiologia.'],
 [106,108,'Anatomia Humana','Coluna vertebral: número de vértebras, escoliose e cifose','Julgue os itens sobre aspectos anatômicos da coluna vertebral.'],
 [109,111,'Anatomia Humana','Sistemas cardiovascular e respiratório: circulação sanguínea e trocas gasosas','Julgue os itens relativos aos sistemas cardiovascular e respiratório.'],
 [112,113,'Anatomia Humana','Sistema gastrintestinal: eliminação e órgãos acessórios','Julgue os itens relativos ao sistema gastrintestinal e suas funções.'],
 [114,115,'Anatomia Humana','Sistema urinário: urografia excretora, nefrograma e função renal','Julgue os itens sobre anatomia do sistema urinário e exames radiológicos correspondentes.'],
 [116,118,'Legislação Sanitária','RDC ANVISA nº 330/2019: responsabilidades e classificação de áreas em serviços de radiologia','Julgue os itens conforme a RDC ANVISA nº 330/2019, sobre serviços de radiologia diagnóstica ou intervencionista e controle de exposições.'],
 [119,120,'Anatomia Humana','Sistema esquelético: ossos sesamoides e esqueleto axial','Julgue os itens sobre o sistema esquelético e a divisão do esqueleto humano.']
]
const faixa=n=>grupos.find(([a,b])=>n>=a&&n<=b)
const secoes=[
 'Os efeitos biológicos das radiações ionizantes podem surgir',
 'Indivíduos expostos a radiações ionizantes, sejam raios X ou raios gama',
 'Os meios de contrastes são substâncias químicas utilizadas',
 'O posicionamento radiográfico refere-se ao estudo',
 'Acerca dos critérios de avaliação radiográfica',
 'A respeito da tomografia computadorizada',
 'A respeito de aspectos físicos e tecnológicos pertinentes ao processo de obtenção de imagem por ressonância magnética',
 'Com referência a aspectos físicos e tecnológicos pertinentes à medicina nuclear',
 'A principal norma de radioproteção específica para medicina nuclear',
 'Tendo em vista que, nas últimas décadas, houve um grande avanço tecnológico',
 'Considerando aspectos pertinentes a nomenclatura e terminologia anatômica',
 'Eixo central do corpo humano, a coluna vertebral',
 'Julgue os itens subsequentes, relativos aos sistemas cardiovascular e respiratório',
 'Tendo em vista que o sistema gastrintestinal',
 'Tendo em vista que os exames radiológicos do sistema urinário',
 'Conforme a Resolução RDC n.º 330/2019',
 'Tendo em vista que o sistema esquelético',
 'Espaço livre'
]
const duplicatas={
 'extr-4c0d94ab686c2e06c5e5':'extr-380de743c87117d1968e',
 'extr-762bbb4fd12accaf75cb':'extr-59c4f81e73cc6f8882bf',
 'extr-73630f34705dd94c73c3':'extr-a746e34aa946d8b4fc70',
 'extr-ee2886b1aaf213c8608f':'extr-4b777adc6fb026b483c6'
}
const faceis=new Set([51,53,54,55,57,59,61,63,67,69,70,72,73,74,76,77,81,84,86,88,90,91,94,96,98,101,102,104,107,110,111,112,113,115,117,119,120])
const dificeis=new Set([52,56,58,62,64,65,66,68,75,78,79,80,82,83,87,89,92,93,95,97,99,100,103,105,106,108,109,114,116,118])
const decisoes=[]
for(const q of pendentes){
  const n=Number(q.numero),g=respostas[n-51],grupo=faixa(n)
  assert.ok(grupo,`Classificação ausente no item ${n}`)
  const original=textoPorNumero.get(n);assert.ok(original,`Texto oficial ausente no item ${n}`)
  let enunciado=original.replace(/\s+/g,' ').trim()
  const cortes=secoes.map(x=>enunciado.indexOf(x)).filter(i=>i>0)
  if(cortes.length)enunciado=enunciado.slice(0,Math.min(...cortes)).trim()
  for(const prefixo of ['603054_01N485263 CEBRASPE | SESAU/AL – Edital: 2021','-- CONHECIMENTOS ESPECÍFICOS --'])enunciado=enunciado.replace(prefixo,'').trim()
  const page=Number(q.pagina),imagem=`paginas/${documento}-${String(page).padStart(4,'0')}.webp`
  await fs.access(`public/acervo-extraido/${imagem}`)
  const anulada=g==='X'
  decisoes.push({
   id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:grupo[2],conteudo:grupo[3],ano:2021,
   concurso:'Concurso SESAU/AL 2021 — Cargo 54: Técnico de Radiologia',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 12/09/2021',cargo:'Técnico de Radiologia',
   numero_original:n,numero:n,pagina:page,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',resposta_correta:anulada?null:(g==='C'?0:1),anulada,
   dificuldade:faceis.has(n)?'Fácil':dificeis.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade técnico-científica e normativa; o CEBRASPE não publica dificuldade individual.',
   classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 54: Técnico de Radiologia. Matéria e conteúdo definidos pelo enunciado e pelo comando temático original; aplicação e resposta cotejadas com documentos oficiais.`,
   enunciado,texto_apoio:grupo[4],visual:{pagina:page,imagem,enunciado,texto_apoio:grupo[4],motivo:`Página ${page} do caderno oficial conferida visualmente. O item foi associado ao contexto de seção e à página original integral.`},
   apta_resolucao:!duplicatas[q.id],...(duplicatas[q.id]?{inelegibilidade_motivo:'Cópia duplicada do mesmo item do caderno oficial; mantida para auditoria, fora da fila de resolução.',duplicada_de:duplicatas[q.id]}:{}),
   gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_603_SESAU_054_01.PDF — Cargo 54: Técnico de Radiologia',prova:'603_SESAU_054_01.PDF',sha256:shaGabarito,sha256_tipo:'sha256_da_transcricao_canonica_dos_70_itens; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:g,criterio:anulada?'Gabarito oficial definitivo marca X; questão anulada, sem correção automática.':'Gabarito oficial definitivo do CEBRASPE, Cargo 54: Técnico de Radiologia.'},
   ...(anulada?{anulacao_fonte:chave}:{}),remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']
  })
}
assert.equal(decisoes.length,74)
assert.equal(new Set(decisoes.map(x=>x.id)).size,74)
assert.equal(new Set(decisoes.map(x=>x.numero_original)).size,70)
assert.deepEqual([...new Set(decisoes.filter(x=>x.anulada).map(x=>x.numero_original))],[90,100])

if(process.argv.includes('--dry-run')){console.log(JSON.stringify({nome,registros:decisoes.length,itensUnicos:70,duplicatasExcluidas:Object.keys(duplicatas).length,anuladas:[90,100],textosFonteCompletos:textoPorNumero.size,prova,gabarito:chave,publicado:false},null,2));process.exit(0)}
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,registros_revisados:74,itens_unicos:70,duplicatas_excluidas:Object.keys(duplicatas).length,anuladas:[90,100],prova,gabarito:chave,edital,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SESAU/AL 2021 — Cargo 54: Técnico de Radiologia — revisão v500\n\n- Revisados 74 registros de 70 itens oficiais (51–120); quatro cópias duplicadas foram mantidas para auditoria e retiradas da fila de resolução.\n- Corrigidos texto OCR, numeração, matérias e conteúdos; cada item foi associado ao comando de seção e à página original.\n- Gabarito definitivo vinculado; itens 90 e 100 anulados, sem correção automática.\n- Fontes: [caderno oficial](${prova}), [gabarito definitivo oficial](${chave}), [página oficial do concurso](${edital}). Revisão local, ainda sem publicação na nuvem.\n`)
console.log(JSON.stringify({...relatorio,publicado:false},null,2))
