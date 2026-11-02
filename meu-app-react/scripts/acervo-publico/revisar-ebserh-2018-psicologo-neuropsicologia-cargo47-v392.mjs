import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-ebserh-2018-psicologo-neuropsicologia-cargo47-v392'
const doc='195116ae1cd1fecf'
const prova='https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/394_EBSERHASSISTENCIAL047__PAG_3.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/GAB_DEFINITIVO_394_EBSERHASSISTENCIAL047.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const pages=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`)).toString('utf8'))
const source=new Map()
for(const page of pages){
  let current=null,parts=[]
  const save=()=>{if(current!==null)source.set(current,parts.join(' ').replace(/\s+/g,' ').trim())}
  for(const raw of page.split(/\r?\n/)){
    const line=raw.trim(),m=line.match(/^\s*(4[1-9]|[5-9]\d|100)\s+(.+)$/)
    if(m){save();current=Number(m[1]);parts=[m[2]];continue}
    if(current!==null&&/^(?:A respeito|A avaliação|Aos vinte e cinco|Tendo o texto|Acerca|As demências|As funções|No que|Julgue|Joana,|Tendo como|Espaço livre|CESPE\s*[|–—-])/i.test(line)){save();current=null;parts=[];continue}
    if(current!==null&&line)parts.push(line)
  }
  save()
}
const keyRows=[
  [41,'C C E C E C C E E C E C E C C E C E C E'],
  [61,'C C E C C E C C E E E E C E C C E C C C'],
  [81,'E E C E C C C E E C E C E C E E E C E C']
]
const answers=new Map()
for(const [start,line] of keyRows){
  const values=line.split(/\s+/)
  if(values.length!==20||values.some(v=>!['C','E','X'].includes(v)))throw Error(`Gabarito definitivo inconsistente no bloco ${start}`)
  values.forEach((v,i)=>answers.set(start+i,v))
}
const topics={
41:['Neuropsicologia — fundamentos','Objeto de estudo: relações entre lesões cerebrais, cognição, emoção e personalidade'],
42:['Neuropsicologia — fundamentos','Neuropsicologia e neurologia comportamental'],
43:['Neuropsicologia — fundamentos','Semiologia, formulação sindrômica e limites da localização lesional'],
44:['Neuropsicologia — fundamentos','Objetivos diagnósticos, terapêuticos e cognitivos'],
45:['Neuropsicologia — fundamentos','Funções mentais superiores e comportamento'],
46:['Neuropsicologia — história e casos clássicos','Caso Phineas Gage: lesão cerebral e funções cognitivas'],
47:['Neuropsicologia — história e casos clássicos','Lobo frontal, controle dos impulsos e mudança comportamental'],
48:['Neuropsicologia — história e casos clássicos','Lobos frontais, expressão emocional e comportamento social'],
49:['Avaliação neuropsicológica','Avaliação integrada e influência de fatores socioafetivos'],
50:['Avaliação neuropsicológica','Testes psicométricos, padronização e amostras normativas'],
51:['Avaliação neuropsicológica','Instrumentos de avaliação da atenção'],
52:['Neuroanatomia funcional','Dominância hemisférica e desconexão inter-hemisférica'],
53:['Neuroanatomia funcional','Especialização hemisférica e lateralização de funções'],
54:['Neuroanatomia funcional','Neurônio: unidade funcional do sistema nervoso central'],
55:['Neuroanatomia funcional','Neurônio motor superior e inferior: sinais clínicos'],
56:['Neuropsicologia — funções cognitivas','Apraxia e agnosia: distinção entre déficits motores e receptivos'],
57:['Neuropsicologia — funções cognitivas','Agnosias auditivas: processamento aperceptivo e associativo'],
58:['Neuropsicologia — avaliação clínica','Traumatismo cranioencefálico e avaliação funcional abrangente'],
59:['Neuropsicologia — personalidade e emoção','Lobo frontal, sistema límbico e regulação emocional'],
60:['Neuropsicologia — personalidade e emoção','Síndromes pré-frontais e localização de manifestações comportamentais'],
61:['Neuropsicologia — demências','Demência frontotemporal: sinais comportamentais'],
62:['Neuropsicologia — demências','Demência frontotemporal: alterações progressivas da linguagem'],
63:['Neuropsicologia — demências','Demência frontotemporal: sintomas afetivos e diagnóstico diferencial'],
64:['Neuropsicologia — demências','Manejo e cuidado em demências frontais e frontotemporais'],
65:['Neuropsicologia — funções executivas','Regulação de atenção, memória e habilidades motoras'],
66:['Neuropsicologia — funções executivas','Funções executivas e córtex pré-frontal'],
67:['Neuropsicologia — funções executivas','Memória de trabalho, inibição, planejamento e flexibilidade cognitiva'],
68:['Neuropsicologia — funções executivas','Planejamento, autorregulação e atenção executiva'],
69:['Avaliação neuropsicológica','Instrumentos e limites de testes projetivos na avaliação executiva'],
70:['Avaliação neuropsicológica','Fluência verbal e avaliação das funções executivas'],
71:['Neuropsicologia — fundamentos','Relações entre funções psicológicas e cognição'],
72:['Neuropsicologia — funções cognitivas','Afasia e agnosia: investigação neuropsicológica'],
73:['Neuropsicologia — história e modelos teóricos','Alexander Luria: sistemas funcionais e crítica ao localizacionismo simplista'],
74:['Neuropsicologia — história e modelos teóricos','Luria: organização dinâmica dos sistemas funcionais'],
81:['Neuropsicologia — história e modelos teóricos','Luria: sistemas funcionais de recepção e controle da atividade'],
82:['Neuroplasticidade','Plasticidade neuronal e alterações dendríticas'],
83:['Neuroplasticidade','Adaptação e reorganização do tecido neural'],
84:['Neuroplasticidade','Experiência, trauma e plasticidade ao longo do desenvolvimento'],
85:['Neuroplasticidade','Experiência e neurogênese'],
86:['Neuroplasticidade','Plasticidade mal-adaptativa e vulnerabilidade psicopatológica'],
87:['Neuropsicologia — linguagem','Linguagem em quadros psicorgânicos e psicóticos'],
88:['Neuropsicologia — linguagem','Alterações da linguagem e funções psíquicas'],
89:['Neuroanatomia funcional','Sistema reticular ativador ascendente e consciência'],
90:['Neuropsicologia — estados confusionais','Delirium: consciência, psicomotricidade e apresentação clínica'],
91:['Neuropsicologia — memória','Amnésia: avaliação clínica e diagnóstico diferencial'],
92:['Neuropsicologia — memória','Criptomnésia e alterações qualitativas da memória'],
93:['Neuropsicologia — memória','Memória semântica e memória de experiências recentes'],
94:['Neuropsicologia — memória','Causas neurológicas de alterações de memória'],
95:['Neuropsicologia — memória','Memória episódica e conhecimentos gerais'],
96:['Avaliação neuropsicológica','Observação clínica e avaliação funcional'],
97:['Avaliação neuropsicológica','Objetivos funcionais e correlação cérebro-comportamento'],
98:['Avaliação neuropsicológica','Entrevista clínica e formulação de hipóteses'],
99:['Avaliação neuropsicológica','Escalas de autorrelato e instrumentos multimétodo'],
100:['Avaliação neuropsicológica','Seleção de instrumentos conforme o nível global do paciente']
}
const contexts={
base:'Acerca da neuropsicologia, julgue os itens a seguir.',
gage:'Aos vinte e cinco anos, Phineas P. Gage sofreu acidente de trabalho com explosivos e uma barra de ferro atravessou a região frontal de seu crânio. Após sobreviver, apresentou mudanças marcantes de comportamento. Os itens tratam da relação entre lesão cerebral, personalidade e emoção.',
assessment:'A avaliação neuropsicológica utiliza entrevistas, observações, provas de rastreio e testes psicométricos para investigar o rendimento cognitivo funcional e possíveis comprometimentos. Seus objetivos incluem descrever alterações, auxiliar diagnósticos e acompanhar condições neurológicas. Os itens abordam avaliação neuropsicológica e testes psicológicos.',
dementia:'As demências frontais ou frontotemporais podem manifestar-se por alterações comportamentais e de linguagem. Os itens avaliam critérios clínicos, manifestações afetivas e procedimentos de cuidado.',
executive:'As funções executivas regulam o comportamento e capacidades cognitivas mais básicas. Os itens abordam seus componentes e instrumentos de avaliação.',
luria:'Os itens tratam de neuropsicologia, da abordagem de Alexander Luria e da organização dinâmica das funções cerebrais.',
anatomy:'Julgue os itens a respeito da neuroanatomia e do desempenho de suas funções.',
plasticity:'Os itens abordam neuroplasticidade, adaptação neural e efeitos da experiência.',
memoryCase:'Joana relata que seu marido José, idoso, tem esquecido fatos recentes, repetido relatos como se fossem novos e não recorda informações gerais. Considerando o caso, julgue os itens sobre funções neuropsicológicas e memória.',
exam:'Os itens tratam do exame neuropsicológico, seus objetivos, etapas e seleção de instrumentos.'
}
const contextFor=n=>n<=45?contexts.base:n<=48?contexts.gage:n<=51?contexts.assessment:n<=60?contexts.anatomy:n<=64?contexts.dementia:n<=70?contexts.executive:n<=74?contexts.luria:n<=80?contexts.anatomy:n===81?contexts.luria:n<=90?contexts.plasticity:n<=95?contexts.memoryCase:contexts.exam
const keyPageMap=new Map([[41,1],[42,1],[43,1],[44,1],[45,1],[46,1],[47,1],[48,1],[49,1],[50,1],[51,1],[52,1],[53,1],[54,1],[55,1],[56,1],...Array.from({length:19},(_,i)=>[57+i,2]),...Array.from({length:20},(_,i)=>[81+i,3])])
if(records.length!==54)throw Error(`Esperados 54 pendentes, recebidos ${records.length}`)
if(records.some(q=>q.resposta!=null))throw Error('Há respostas existentes; revisar divergências antes de aplicar o gabarito oficial.')
const decisions=records.map(q=>{
  const n=Number(q.numero),topic=topics[n],answer=answers.get(n),stem=source.get(n)
  if(!topic||!answer||!stem)throw Error(`Item ${n}: faltou classificação, gabarito ou enunciado da fonte local.`)
  if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato incompatível no item ${n}`)
  const anulada=answer==='X'
  return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,texto_apoio:contextFor(n),materia:'Psicologia',conteudo:topic[1],ano:2018,concurso:'EBSERH Assistencial 2018 — Psicólogo — Área Neuropsicologia — Cargo 47',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 06/05/2018',cargo:'Psicólogo — Área Neuropsicologia — Cargo 47',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[43,45,49,51,53,60,63,73,74,86,89,91,92,93,94,95,97].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela integração entre conceitos de neuropsicologia, neuroanatomia, avaliação clínica e análise de assertivas; não é faixa publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 47; classificação temática específica definida pelo conceito central testado.`,resposta_correta:anulada?null:(answer==='C'?0:1),anulada,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_394_EBSERHASSISTENCIAL047.PDF',prova:'394_EBSERHASSISTENCIAL047',numero:n,pagina:1,resposta:answer,criterio:anulada?'Gabarito definitivo oficial assinala X; item anulado.':'Gabarito definitivo oficial específico do Cargo 47 — Psicólogo, Área Neuropsicologia.'}}
})
if(decisions.some(d=>!keyPageMap.has(d.numero)))throw Error('Há item sem página fonte associada.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,anulados:decisions.filter(d=>d.anulada).map(d=>d.numero),semTextoBase:decisions.filter(d=>!d.texto_apoio).map(d=>d.numero),semEnunciado:decisions.filter(d=>!d.enunciado).map(d=>d.numero),prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — EBSERH Assistencial 2018 — Psicólogo — Área Neuropsicologia — Cargo 47',itens:decisions.map(d=>({numero:d.numero,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,anulada:d.anulada,pagina:d.pagina,textoBase:Boolean(d.texto_apoio)})),prova,gabarito,publicado:false,nota:'54 registros revisados com classificação temática específica, ano, banca, concurso, cargo e dificuldade editorial estimada. Textos-base compartilhados foram reassociados por bloco; imagens originais de página permanecem vinculadas. O gabarito definitivo foi vinculado item a item.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — EBSERH Assistencial 2018 — Psicólogo, Neuropsicologia, Cargo 47 — revisão v392\n\n- 54 registros reclassificados em Psicologia com conteúdo específico de neuropsicologia, avaliação, memória, neuroanatomia, neuroplasticidade e funções executivas.\n- Ano, aplicação em 06/05/2018, concurso e cargo foram registrados; dificuldade é estimativa editorial.\n- Textos-base compartilhados foram reassociados por bloco; imagens originais de página preservadas.\n- Gabarito definitivo oficial vinculado item a item; anulados conforme marcação oficial.\n- Fontes: [caderno oficial](${prova}) e [gabarito definitivo oficial](${gabarito}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
