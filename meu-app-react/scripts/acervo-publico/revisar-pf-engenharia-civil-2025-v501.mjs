import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-pf-engenharia-civil-2025-v501'
const documento='ddf3b90a92bb2c19'
const prova='https://cdn.cebraspe.org.br/concursos/pf_25/arquivos/106_PF_006_01.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/pf_25/arquivos/69579E7D6152E8A1DDCEFA1B6C4A6DCBDAAB69B934E5C17D04FC88BA150BED2B.pdf'
const edital='https://cdn.cebraspe.org.br/concursos/PF_25/arquivos/Ed_1_PF_25_Abertura.html'
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
if(textoPorNumero.size!==70)throw Error(`Texto-fonte incompleto: ${textoPorNumero.size}/70`)

const respostas=[
 'X','C','E','E','C','C','E','X','E','E','C','E','C','E','C','C','C','E','C','C',
 'E','C','C','E','C','E','C','C','C','E','E','E','E','E','E','C','C','E','C','E',
 'E','E','E','C','E','C','C','E','X','E','C','E','E','C','C','C','E','E','C','C',
 'E','E','E','C','C','E','E','E','C','C'
]
assert.equal(respostas.length,70)
const shaGabarito=createHash('sha256').update(Array.from({length:70},(_,i)=>`${i+51}:${respostas[i]}`).join('|')).digest('hex')

const grupos=[
 [51,56,'Engenharia Civil','NBR 12.721: áreas reais e equivalentes, projeto-padrão, orçamento e custo unitário de edificações','Considerando o que a ABNT NBR 12.721:2006 (versão corrigida 2021) dispõe sobre definição de áreas, orçamento e avaliação de custos unitários de construção para incorporação imobiliária, julgue os itens.'],
 [57,67,'Engenharia Civil','Execução de edificações: escavações, chapisco, telhados, canteiro, instalações sanitárias, vãos, esquadrias e impermeabilização','No que se refere à elaboração de projetos e à execução de edificações, julgue os itens.'],
 [68,70,'Engenharia Civil','Agregados reciclados na construção civil: subclasses, uso estrutural e limites de substituição','Julgue os itens sobre utilização de agregados reciclados na construção civil.'],
 [71,73,'Engenharia Civil','Barragens de terra: proteção contra erosões, ondas, enrocamento, solo-cimento e bordo livre','Julgue os itens a respeito de dispositivos de proteção contra erosões em barragens.'],
 [74,77,'Engenharia Civil','Mecânica dos solos e terraplenagem: empréstimo de solo, umidade, peso específico seco e balanço de água','Texto-base: área de empréstimo com 10.000 m³ de material, peso específico natural de 17,40 kN/m³ e umidade de 16%; o aterro será compactado a 18% de umidade e peso específico seco de 16,50 kN/m³.'],
 [78,82,'Engenharia Sanitária','Tratamento de água: filtros ascendentes, decantação, floculação, gradiente de velocidade e características da água','No que se refere aos processos envolvidos no tratamento de água para consumo humano, julgue os itens.'],
 [83,84,'Engenharia Sanitária','Perdas em redes de distribuição de água: perdas reais, aparentes e vazões mínimas noturnas','Julgue os itens sobre identificação, controle e redução de perdas em redes de distribuição de água.'],
 [85,89,'Engenharia Civil','Resistência dos materiais: flexão simples e composta, tensões, deformações e módulo de Poisson','No que concerne a deformações e tensões em estruturas e aos conceitos de flexão simples e composta no dimensionamento estrutural, julgue os itens.'],
 [90,94,'Engenharia Civil','Análise estrutural: métodos das forças e dos deslocamentos, estruturas isostáticas, hiperestáticas e vigas Gerber','Julgue os itens sobre diagramas de esforços solicitantes e análise de sistemas isostáticos e hiperestáticos.'],
 [95,99,'Engenharia Civil','Materiais estruturais: emendas de armaduras, concreto, aço CA-50, retração e laminação a frio','Julgue os itens sobre propriedades mecânicas e reológicas do concreto e classificação e aplicação dos aços em estruturas de concreto armado.'],
 [100,102,'Engenharia Civil','Concreto protendido e pré-moldado: etapas de protensão, fissuração e ações transitórias','Julgue os itens sobre dimensionamento e emprego do concreto protendido e pré-moldado.'],
 [103,104,'Perícias de Engenharia','NBR 13752 e NBR 14653-2: laudo pericial, vistoria de entrega e depreciação de imóveis urbanos','Julgue os itens sobre perícias de engenharia na construção civil e avaliação de imóveis urbanos, conforme as ABNT NBR 13752:2024 e NBR 14653-2:2011.'],
 [105,106,'Perícias de Engenharia','Patologia das construções: vistoria, anomalias, desequilíbrio econômico-financeiro e impactos contratuais','Acerca das patologias de obras de engenharia civil e da análise pericial de contratos, julgue os itens.'],
 [107,110,'Gestão de Obras Públicas','Contratação semi-integrada, fiscalização, medição, pagamento e responsabilidade técnica (ART)','Texto-base: a Polícia Federal contratou, por contratação semi-integrada, empresa de engenharia para reformar sua sede; a fiscalização cabe a engenheiro civil servidor da PF. Com base nessa situação, julgue os itens sobre fiscalização de contratos públicos.'],
 [111,112,'Orçamento de Obras','SICRO: produção de equipes mecânicas, fatores de conversão e controle tecnológico no BDI','Julgue os itens sobre o Sistema de Custos Referenciais de Obras (SICRO).'],
 [113,116,'Engenharia Portuária','Terminais portuários: reach stacker, dolfins, moegas ecológicas e molhes de proteção','Julgue os itens referentes a obras portuárias.'],
 [117,120,'Engenharia Civil','Patologias e geotecnia: esborcinamento de juntas, exsudação, poropressão em barragens e recalques diferenciais','Acerca das patologias de obras de engenharia civil, julgue os itens.']
]
const faixa=n=>grupos.find(([a,b])=>n>=a&&n<=b)
const secoes=[
 'Acerca dos dispositivos de proteção contra erosões',
 'No que se refere à elaboração de projetos e à execução de edificações',
 'Julgue os itens a seguir, a respeito da utilização de agregados reciclados',
 'No processo de construção de um aterro, foi identificada uma área de empréstimo',
 'No que se refere aos processos envolvidos no tratamento de água',
 'Julgue os itens seguintes, no que diz respeito à identificação, ao controle e à redução de perdas',
 'No que concerne a deformações e tensões em estruturas',
 'No que se refere à análise estrutural por meio de diagramas de esforços solicitantes',
 'A respeito das propriedades mecânicas e reológicas do concreto',
 'Julgue os itens seguintes, em relação ao dimensionamento e ao emprego do concreto protendido',
 'Julgue os itens a seguir, relativos a perícias de engenharia na construção civil',
 'Acerca das patologias de obras de engenharia civil',
 'A Polícia Federal contratou, por meio de contratação semi-integrada',
 'Acerca do Sistema de Custos Referenciais de Obras (SICRO)',
 'Julgue os itens subsequentes, referentes a obras portuárias',
 'Espaço livre'
]
const duplicatas={
 'extr-490a8590b4c1dcdd5869':'extr-135d0a15e0f8d5d0d7a1',
 'extr-14862c444e166c6df18b':'extr-78795723ee0975e09476',
 'extr-02515429f0de76b672dc':'extr-d8295644432e3b9970ed',
 'extr-24d55e57876d13a40d17':'extr-dba05b6ecb480ddb3ef8'
}
const faceis=new Set([51,52,54,56,58,59,62,63,65,66,67,69,70,71,72,73,78,79,81,83,87,90,91,94,96,97,100,101,103,104,105,107,108,110,112,113,114,115,116,117,118,120])
const dificeis=new Set([53,55,57,61,64,68,74,75,76,77,80,82,84,85,86,88,89,92,93,95,98,102,106,109,111,119])
const decisoes=[]
for(const q of pendentes){
  const n=Number(q.numero),g=respostas[n-51],grupo=faixa(n)
  assert.ok(grupo,`Classificação ausente no item ${n}`)
  const original=textoPorNumero.get(n);assert.ok(original,`Texto oficial ausente no item ${n}`)
  let enunciado=original.replace(/\s+/g,' ').trim()
  const cortes=secoes.map(x=>enunciado.indexOf(x)).filter(i=>i>0)
  if(cortes.length)enunciado=enunciado.slice(0,Math.min(...cortes)).trim()
  for(const prefixo of ['CEBRASPE – PF – Edital: 2025','-- CONHECIMENTOS ESPECÍFICOS –'])enunciado=enunciado.replace(prefixo,'').trim()
  const page=Number(q.pagina),imagem=`paginas/${documento}-${String(page).padStart(4,'0')}.webp`
  await fs.access(`public/acervo-extraido/${imagem}`)
  const anulada=g==='X'
  decisoes.push({
   id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:grupo[2],conteudo:grupo[3],ano:2025,
   concurso:'Concurso Polícia Federal 2025 — Cargo 6: Perito Criminal Federal — Área 7: Engenharia Civil',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 27/07/2025',cargo:'Perito Criminal Federal — Área 7: Engenharia Civil',
   numero_original:n,numero:n,pagina:page,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',resposta_correta:anulada?null:(g==='C'?0:1),anulada,
   dificuldade:faceis.has(n)?'Fácil':dificeis.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo integração de conceitos técnicos, cálculo e carga normativa; a banca não publica dificuldade individual.',
   classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 6 (Perito Criminal Federal, Área 7: Engenharia Civil). Matéria, conteúdo e contexto definidos pelo enunciado e pelo cabeçalho temático original; aplicação e gabarito cotejados com as publicações oficiais.`,
   enunciado,texto_apoio:grupo[4],visual:{pagina:page,imagem,enunciado,texto_apoio:grupo[4],motivo:`Página ${page} do caderno oficial conferida visualmente. O contexto comum foi associado ao item e a imagem integral da página permanece vinculada.`},
   apta_resolucao:!duplicatas[q.id],...(duplicatas[q.id]?{inelegibilidade_motivo:'Cópia duplicada do mesmo item do caderno oficial; mantida para auditoria e retirada da fila de resolução.',duplicada_de:duplicatas[q.id]}:{}),
   gabarito_oficial:{fonte:chave,arquivo:'69579E7D6152E8A1DDCEFA1B6C4A6DCBDAAB69B934E5C17D04FC88BA150BED2B.pdf — Cargo 6: Engenharia Civil',prova:'106_PF_006_01.pdf',sha256:shaGabarito,sha256_tipo:'sha256_da_transcricao_canonica_dos_70_itens; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:g,criterio:anulada?'Gabarito oficial definitivo marca X; item anulado, sem correção automática.':'Gabarito oficial definitivo CEBRASPE, Cargo 6 — Perito Criminal Federal, Área 7: Engenharia Civil.'},
   ...(anulada?{anulacao_fonte:chave}:{}),remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']
  })
}
assert.equal(decisoes.length,74)
assert.equal(new Set(decisoes.map(x=>x.id)).size,74)
assert.equal(new Set(decisoes.map(x=>x.numero_original)).size,70)
assert.deepEqual([...new Set(decisoes.filter(x=>x.anulada).map(x=>x.numero_original))],[51,58,99])

if(process.argv.includes('--dry-run')){console.log(JSON.stringify({nome,registros:decisoes.length,itensUnicos:70,duplicatasExcluidas:Object.keys(duplicatas).length,anuladas:[51,58,99],textosFonteCompletos:textoPorNumero.size,prova,gabarito:chave,contextosComCalculo:decisoes.filter(x=>x.numero_original>=74&&x.numero_original<=77).map(x=>({numero:x.numero_original,texto:x.texto_apoio})),publicado:false},null,2));process.exit(0)}
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,registros_revisados:74,itens_unicos:70,duplicatas_excluidas:Object.keys(duplicatas).length,anuladas:[51,58,99],prova,gabarito:chave,edital,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## PF 2025 — Cargo 6: Perito Criminal Federal, Área 7 — Engenharia Civil — revisão v501\n\n- Revisei 74 registros de 70 itens oficiais (51–120); quatro cópias duplicadas foram preservadas para auditoria e retiradas da fila de resolução.\n- Corrigi transcrição OCR e classificações por tema; mantive associados os contextos numéricos necessários aos itens 74–77 e o texto-base da fiscalização contratual 107–110. As imagens de todas as páginas originais permanecem vinculadas.\n- Gabarito definitivo vinculado; itens 51, 58 e 99 anulados e sem correção automática.\n- Fontes: [caderno oficial](${prova}), [gabarito definitivo oficial](${chave}), [edital oficial](${edital}). Revisão local, ainda sem publicação na nuvem.\n`)
console.log(JSON.stringify({...relatorio,publicado:false},null,2))
