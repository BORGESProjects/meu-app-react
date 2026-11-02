import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-cnj-arquitetura-2024-v499'
const documento='ed50e1c4029e0a27'
const prova='https://cdn.cebraspe.org.br/concursos/cnj_24/arquivos/979_CNJ_003_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/cnj_24/arquivos/GAB_DEFINITIVO_979_CNJ_003_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/cnj_24/arquivos/CNJ_24_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO.PDF'
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(pendentes.length,74)
assert.equal(new Set(pendentes.map(q=>q.id)).size,74)

// O arquivo local contém a extração de texto por página do caderno oficial.
// A conferência visual foi feita nas quatro páginas preservadas; o texto do PDF oficial
// confirma o conteúdo, a numeração e a ordem das questões.
const textoPaginas=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${documento}.json.gz`)))
assert.equal(textoPaginas.length,4)
const numRe='(?:5[1-9]|[6-9]\\d|1[01]\\d|120)'
const textoPorNumero=new Map()
for(const pagina of textoPaginas){
  const re=new RegExp(`(?:^|\\n)\\s*(${numRe})\\s+([\\s\\S]*?)(?=\\n\\s*${numRe}\\s+|$)`,'g')
  for(const m of pagina.matchAll(re)){
    const n=Number(m[1]);if(!textoPorNumero.has(n))textoPorNumero.set(n,m[2].replace(/\s+/g,' ').trim())
  }
}
// Debug: do not edit data until all 70 unique source items have been parsed.
assert.equal(textoPorNumero.size,70,`Extração canônica incompleta: ${textoPorNumero.size}/70`)

const chaveTexto='C C C C C E E E C C E E C C E C E E C E C E E C C C C C C C C C E E C X C E E E C C C C E C E C C E E C C C X E C E E C E C E C E C C E E C'.split(' ')
assert.equal(chaveTexto.length,70)
const shaChave=createHash('sha256').update(Array.from({length:70},(_,i)=>`${i+51}:${chaveTexto[i]}`).join('|')).digest('hex')

const classificacao=n=>{
  if(n<=55)return ['Arquitetura','Desenho técnico e geometria descritiva: representação, projeções, perspectivas e normas gráficas']
  if(n<=60)return ['Arquitetura','Projeto arquitetônico: documentação, programa de necessidades e etapas de elaboração']
  if(n===61)return ['Arquitetura','Desenho técnico: representação de coberturas e indicação de caimentos']
  if(n<=65)return ['Arquitetura','Desenho técnico e geometria descritiva: projeções ortográficas e sistemas de representação']
  if(n<=68)return ['Direito Urbanístico','Parcelamento do solo urbano: Lei nº 6.766/1979, loteamento, desmembramento e destinação de áreas']
  if(n<=70)return ['Arquitetura','Topografia e terraplenagem: curvas de nível, declividade, corte e aterro']
  if(n<=72)return ['Arquitetura','Paisagismo: projeto da paisagem, jardinagem e espaços verdes urbanos']
  if(n<=74)return ['Arquitetura','Sistemas de energia solar: energia heliotérmica, painéis fotovoltaicos e coletores térmicos']
  if(n<=80)return ['Arquitetura','Conforto ambiental: acústica, orientação solar, ventilação passiva, proteção solar e carta bioclimática']
  if(n<=86)return ['Arquitetura','Projetos complementares prediais: telecomunicações, elétrica, drenagem, cabeamento e climatização']
  if(n<=90)return ['Engenharia Civil','Sistemas estruturais e tecnologia da construção: fundações, estruturas metálicas, projetos estruturais e radiers']
  if(n<=95)return ['Arquitetura','Projetos complementares prediais: climatização, elevadores, segurança contra incêndio e rotas de fuga']
  if(n<=100)return ['Acessibilidade','ABNT NBR 9050: acessibilidade em sanitários, circulação, mobiliário e sinalização']
  if(n<=103)return ['Legislação Profissional','Lei nº 12.378/2010: exercício da Arquitetura e Urbanismo, registro e autoria de projetos']
  if(n<=107)return ['Acessibilidade','Dimensionamento de escadas e corrimãos: ABNT NBR 9050 e NBR 9077']
  if(n<=110)return ['Engenharia Civil','Revestimentos cerâmicos: contrapiso, argamassa de assentamento e sequência de execução']
  if(n<=115)return ['Administração Pública','Resolução CNJ nº 114/2010: planejamento, avaliação e execução de obras no Poder Judiciário']
  return ['Acessibilidade','Resolução CNJ nº 401/2021: acessibilidade, inclusão e comunicação no Poder Judiciário']
}
const cabecalhos=[
  'No que diz respeito à representação, aos métodos e às técnicas de desenho associados ao projeto arquitetônico e urbanístico, julgue os itens que se seguem.',
  'Julgue os próximos itens, no que diz respeito à elaboração dos serviços técnicos especializados de projetos arquitetônicos.',
  'Julgue os itens subsequentes, relativos à geometria descritiva e a desenho técnico.',
  'Julgue os itens subsequentes, de acordo com a Lei n.º 6.766/1979, que trata do parcelamento do solo urbano.',
  'No que diz respeito a poligonais, curvas de nível e movimento de terra, julgue os itens que se seguem.',
  'Julgue os próximos itens, relativos a paisagismo.',
  'Julgue os itens seguintes, considerando que o Brasil apresenta uma grande incidência de luz solar durante todo o ano, o que viabiliza a geração de energia limpa.',
  'Em relação ao conforto ambiental, julgue os itens que se seguem.',
  'Julgue os itens subsecutivos, a respeito de projetos de arquitetura e suas instalações complementares.',
  'Acerca de projeto estrutural na arquitetura, julgue os itens que se seguem.',
  'Julgue os itens a seguir, em relação a projetos complementares para melhor acessibilidade, qualidade e segurança nos edifícios.',
  'Julgue os itens a seguir, a respeito de acessibilidade, de acordo com a NBR 9050:2020.',
  'Julgue os itens subsequentes, com base no que dispõe a Lei n.º 12.378/2010, que regulamenta o exercício da arquitetura e urbanismo.',
  'Julgue os próximos itens, a respeito do dimensionamento de escadas e corrimãos, com base nas normas NBR 9050:2020 e NBR 9077:2001.',
  'Julgue os itens a seguir, em relação ao revestimento de piso interno ou externo com placa cerâmica.',
  'À luz do disposto na Resolução n.º 114/2010 do Conselho Nacional de Justiça (CNJ), julgue os itens a seguir.',
  'Julgue os itens seguintes, relativos ao que estabelece a Resolução n.º 401/2021 do CNJ.',
  'Espaço livre'
]
const contextos=[
  [51,55,'No que diz respeito à representação, aos métodos e às técnicas de desenho associados ao projeto arquitetônico e urbanístico, julgue os itens que se seguem.'],
  [56,60,'Julgue os próximos itens, no que diz respeito à elaboração dos serviços técnicos especializados de projetos arquitetônicos.'],
  [61,65,'Julgue os itens subsequentes, relativos à geometria descritiva e a desenho técnico.'],
  [66,68,'Julgue os itens subsequentes, de acordo com a Lei n.º 6.766/1979, que trata do parcelamento do solo urbano.'],
  [69,70,'No que diz respeito a poligonais, curvas de nível e movimento de terra, julgue os itens que se seguem.'],
  [71,72,'Julgue os próximos itens, relativos a paisagismo.'],
  [73,74,'Julgue os itens seguintes, considerando que o Brasil apresenta grande incidência de luz solar durante todo o ano, o que viabiliza a geração de energia limpa.'],
  [75,80,'Em relação ao conforto ambiental, julgue os itens que se seguem.'],
  [81,86,'Julgue os itens subsecutivos, a respeito de projetos de arquitetura e suas instalações complementares.'],
  [87,90,'Acerca de projeto estrutural na arquitetura, julgue os itens que se seguem.'],
  [91,95,'Julgue os itens a seguir, em relação a projetos complementares para melhor acessibilidade, qualidade e segurança nos edifícios.'],
  [96,100,'Julgue os itens a seguir, a respeito de acessibilidade, de acordo com a ABNT NBR 9050:2020.'],
  [101,103,'Julgue os itens subsequentes, com base na Lei n.º 12.378/2010, que regulamenta o exercício da Arquitetura e Urbanismo.'],
  [104,107,'Julgue os próximos itens sobre dimensionamento de escadas e corrimãos, com base nas ABNT NBR 9050:2020 e NBR 9077:2001.'],
  [108,110,'Julgue os itens a seguir sobre revestimento de piso interno ou externo com placa cerâmica.'],
  [111,115,'À luz da Resolução CNJ n.º 114/2010, julgue os itens sobre obras no Poder Judiciário.'],
  [116,120,'Julgue os itens seguintes relativos à Resolução CNJ n.º 401/2021.']
]
const contexto=n=>contextos.find(([a,b])=>n>=a&&n<=b)?.[2]||''
const faceis=new Set([51,52,53,54,56,57,59,60,71,74,81,82,83,84,85,86,92,93,94,96,97,99,100,103,104,108,109,112,113,114,115,116,118,120])
const dificeis=new Set([61,64,65,69,70,73,76,78,80,87,88,90,95,98,101,102,105,106,107,110,111,117,119])
const difficulty=n=>faceis.has(n)?'Fácil':dificeis.has(n)?'Difícil':'Média'
const decisions=[]
const duplicatas={
  'extr-0619d876f9dd8bf80bbe':'extr-fa4c1af3be816a7a13b7',
  'extr-9d48af6863f6071bedf8':'extr-7cc49170a6fd1ad2ef3c',
  'extr-86b974686681054773ed':'extr-4d75bdf9b28bdcffab10',
  'extr-3c39e20998cd1d7a1f70':'extr-4652d172ac0a4605615a'
}
for(const q of pendentes){
  const n=Number(q.numero),g=chaveTexto[n-51]
  assert.ok(n>=51&&n<=120,`Número fora da prova: ${n}`)
  const [materia,conteudo]=classificacao(n)
  const original=textoPorNumero.get(n)
  assert.ok(original,`Texto oficial ausente para item ${n}`)
  let enunciado=original.replace(/\s+/g,' ').trim()
  for(const h of cabecalhos)enunciado=enunciado.replace(h.replace(/\s+/g,' '),'').trim()
  const marcadoresDeSecao=['Julgue os itens subsequentes, relativos à geometria descritiva','Julgue os itens subsequentes, de acordo com a Lei','No que diz respeito a poligonais','Julgue os próximos itens, relativos a paisagismo','Julgue os itens seguintes, considerando','Em relação ao conforto ambiental','Julgue os itens subsecutivos, a respeito de projetos','Acerca de projeto estrutural','Julgue os itens a seguir, em relação a projetos complementares','Julgue os itens a seguir, a respeito de acessibilidade','Julgue os itens subsequentes, com base no que dispõe a Lei','Julgue os próximos itens, a respeito do dimensionamento','Julgue os itens a seguir, em relação ao revestimento','À luz do disposto na Resolução','Julgue os itens seguintes, relativos ao que estabelece','Espaço livre']
  const ocorrencias=marcadoresDeSecao.map(x=>enunciado.indexOf(x)).filter(i=>i>0)
  if(ocorrencias.length)enunciado=enunciado.slice(0,Math.min(...ocorrencias)).trim()
  enunciado=enunciado.replace(/^CEBRASPE\s*[–-]\s*CNJ\s*[–-]\s*Edital:\s*2024\s*/,'').trim()
  const page=Number(q.pagina),image=`paginas/${documento}-${String(page).padStart(4,'0')}.webp`
  await fs.access(`public/acervo-extraido/${image}`)
  const anulada=g==='X'
  decisions.push({
    id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,
    concurso:'Concurso do Conselho Nacional de Justiça (CNJ) 2024 — Cargo 3: Analista Judiciário, Área de Apoio Especializado, Especialidade Arquitetura',
    banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 30/06/2024',cargo:'Analista Judiciário — Apoio Especializado — Arquitetura',
    numero_original:n,numero:n,pagina:page,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',
    resposta_correta:anulada?null:(g==='C'?0:1),anulada,
    dificuldade:difficulty(n),dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por extensão, integração de conceitos e carga normativa do item; o CEBRASPE não publica dificuldade individual.',
    classificacao_fonte:prova,motivo:`Questão ${n}; banca, cargo e aplicação conferidos no caderno e no gabarito definitivo oficiais. Matéria e conteúdo definidos pelo enunciado e pelo cabeçalho temático da prova.`,
    enunciado,texto_apoio:contexto(n),visual:{pagina:page,imagem:image,enunciado,texto_apoio:contexto(n),motivo:`Página ${page} do caderno oficial conferida visualmente. Texto de comando associado ao item; gráficos necessários estão na imagem integral da página.`},
    apta_resolucao:!duplicatas[q.id],
    ...(duplicatas[q.id]?{inelegibilidade_motivo:'Cópia duplicada do mesmo item oficial; preservada para auditoria, mas excluída da fila de resolução.',duplicada_de:duplicatas[q.id]}:{}),
    gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_979_CNJ_003_01.PDF — Cargo 3: Arquitetura',prova:'979_CNJ_003_01.PDF',sha256:shaChave,sha256_tipo:'sha256_da_transcricao_canonica_do_gabarito_de_70_itens; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:g,criterio:anulada?'Gabarito oficial definitivo marca X; item anulado, sem correção automática.':'Gabarito oficial definitivo CEBRASPE para o Cargo 3: Arquitetura.'},
    ...(anulada?{anulacao_fonte:justificativas}:{}),
    remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']
  })
}
assert.equal(decisions.length,74)
assert.equal(new Set(decisions.map(d=>d.id)).size,74)
assert.equal(new Set(decisions.map(d=>d.numero_original)).size,70)
const duplicates=[...new Set(decisions.map(d=>d.numero_original))].filter(n=>decisions.filter(d=>d.numero_original===n).length>1)
assert.deepEqual(duplicates,[51,53,54,55])

if(process.argv.includes('--dry-run')){
  console.log(JSON.stringify({nome,registros:decisions.length,itensUnicos:70,duplicatasExcluidas:Object.keys(duplicatas).length,duplicados:duplicates,anulados:decisions.filter(d=>d.anulada).map(d=>d.numero_original),itensSemTexto:70-textoPorNumero.size,amostras:decisions.filter(d=>[51,55,60,61,68,69,70,80,81,86,91,95,96,100,101,105,108,110,111,115,116,120].includes(d.numero_original)).map(d=>({numero:d.numero_original,texto:d.enunciado.slice(0,220)})),fonteOficial:prova,gabaritoOficial:chave,publicado:false},null,2));process.exit(0)
}
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decisions,null,2))
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,questoes_revisadas:74,itens_unicos:70,duplicatas_no_acervo:duplicates,anuladas:[...new Set(decisions.filter(d=>d.anulada).map(d=>d.numero_original))],prova,gabarito:chave,justificativas_oficiais:justificativas,questoes_prontas:74,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisions),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CNJ 2024 — Cargo 3: Arquitetura — revisão v499\n\n- Revisados 74 registros correspondentes a 70 itens oficiais (51–120), incluindo quatro pares de IDs duplicados (51, 53, 54 e 55), preservados para auditoria.\n- Corrigidas as matérias e os conteúdos, reconectados os enunciados ao item correto e associadas as imagens das páginas 1–4.\n- Gabarito definitivo oficial vinculado; itens 86 e 105 anulados e sem correção automática.\n- Fontes: [caderno oficial](${prova}), [gabarito definitivo oficial](${chave}), [justificativas oficiais de alterações](${justificativas}). Revisão local, ainda não publicada na nuvem.\n`)
console.log(JSON.stringify(relatorio,null,2))
