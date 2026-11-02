import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc='e2a619831de77921',nome='revisao-ses-df-residencia-medica-intensiva-2016-2-pendencias-v273'
const prova='https://cdn.cebraspe.org.br/concursos/SES_DF_16_RESIDENCIA_2/arquivos/240RMU2PROC_002_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/SES_DF_16_RESIDENCIA_2/arquivos/Gab_Preliminar_240RMU2PROC_002_01.pdf'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(raw.length!==85)throw Error(`Esperava 85 itens pendentes; encontrei ${raw.length}`)

// Transcrição do gabarito oficial PRELIMINAR: o definitivo não foi localizado.
const answers=`E E E E C C E C E C E E E E E E E E E C
C E E C E C E C C C E C E E C C C C C C
E E C C E C C E E C C E E E C E C C C E
E C C C C E C E E E E E E E C C C C C E
C E C C C E C E C C C E E E C E E E C E
E E C C C E C E C E C E E E E C E E C C`.trim().split(/\s+/)
if(answers.length!==120)throw Error(`Gabarito canônico: ${answers.length}/120`)
const keyFor=n=>answers[n-1]
const keyHash=createHash('sha256').update(answers.join('|')).digest('hex')
const exam='SES/DF e HUB — Residência Médica Unificada 2016/2 — Medicina Intensiva (pré-requisito: Anestesiologia, Cirurgia-Geral ou Clínica Médica)'

const groups={
 '7,8,9,20,21,22,23':['Medicina','Clínica Médica — infectologia, pneumonia, transfusão e vasculites','Média'],
 '38,39,40':['Medicina','Psiquiatria — terapia hormonal e tratamento da depressão','Média'],
 '41,42,43,44,45,46,47,48':['Medicina','Anestesiologia — farmacocinética, metabolismo e farmacologia de receptores e bloqueadores neuromusculares','Difícil'],
 '49,50,51,52':['Medicina','Anestesiologia — anestésicos inalatórios, sedação, anestésicos locais e opioides','Difícil'],
 '53,54,55':['Medicina','Anestesiologia — hipotermia perioperatória e termorregulação','Média'],
 '56,57':['Medicina','Anestesiologia — equilíbrio ácido-base e distúrbios hidroeletrolíticos','Média'],
 '58':['Medicina','Alergia e Imunologia — hipersensibilidade imediata ao látex','Fácil'],
 '59,60,61,62,63,64':['Medicina','Anestesiologia — farmacologia, analgesia e efeitos sistêmicos de medicamentos','Difícil'],
 '65,66,67,68,69,70':['Medicina','Anestesiologia — opioides, mecanismo de ação, potência e antagonistas','Média'],
 '71,72':['Medicina','Anestesiologia — equilíbrio ácido-base e distúrbios hidroeletrolíticos','Média'],
 '73,74,75,76,77,78,79,80':['Medicina','Anestesiologia — dor, nocicepção, síndromes dolorosas e adjuvantes analgésicos','Média'],
 '81,82,83,84,85,86,88,90,91,92,93,95':['Medicina','Medicina Intensiva e Cirurgia-Geral — avaliação à beira do leito, choque e monitorização hemodinâmica','Média'],
 '96,97,98,99,100':['Medicina','Epidemiologia Clínica — níveis de evidência e hierarquia de estudos','Média'],
 '101,102,103,104,105':['Medicina','Cirurgia-Geral — diagnóstico diferencial e abdome agudo','Média'],
 '106,107,108':['Medicina','Cirurgia-Geral e Medicina de Emergência — trauma, reanimação e tríade letal','Média'],
 '109,110,111,112,113':['Medicina','Cirurgia-Geral — avaliação perioperatória e comorbidades','Média'],
 '114,115,117,118,119,120':['Medicina','Cirurgia-Geral e Medicina Intensiva — avaliação clínica, pancreatite, coagulação e prognóstico','Média']
}
const classify=n=>{for(const [ns,v] of Object.entries(groups))if(ns.split(',').map(Number).includes(n))return v;throw Error(`Sem classificação específica para item ${n}`)}

const decisions=raw.map(q=>{
 const n=Number(q.numero),[materia,conteudo,dificuldade]=classify(n),key=keyFor(n),page=Number(q.pagina)
 if(!['C','E'].includes(key))throw Error(`Gabarito preliminar ausente no item ${n}`)
 let stem=String(q.enunciado||'').split(/\|\|240RMU2PROC_002_01N162813\|\|/i)[0]
 stem=stem.replace(/\s+/g,' ').replace(/\bmani festações\b/g,'manifestações').replace(/\bresi stência\b/g,'resistência').replace(/\bacidose\s+metabólica\s+com\s+ânion\s+gap\s+aumentado\b/g,'acidose metabólica com ânion gap aumentado').trim()
 if(!stem)throw Error(`Enunciado vazio no item ${n}`)
 const image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2016,concurso:exam,cargo:'Programa de Residência Médica — Medicina Intensiva',numero_original:n,pagina:page,dificuldade,dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pela terminologia clínica, integração de conceitos e etapas de raciocínio; não publicada pela banca.',
  classificacao_fonte:prova,motivo:`Classificação editorial baseada no texto do item e nos cabeçalhos temáticos do caderno oficial da seleção de Residência Médica 2016/2.`,
  enunciado:stem,texto_apoio:q.apoio||null,opcoes:['Certo','Errado'],resposta_correta:key==='C'?0:1,anulada:false,
  gabarito_oficial:{fonte:gabarito,sha256:keyHash,sha256_tipo:'sha256_da_transcricao_dos_120_itens_do_gabarito_preliminar; nao_e_hash_do_pdf',arquivo:'Gab_Preliminar_240RMU2PROC_002_01.pdf',numero:n,pagina:1,resposta:key,criterio:'Transcrito do gabarito oficial preliminar do programa de Medicina Intensiva. Não foi localizado o gabarito definitivo; a resposta deve ser considerada provisória.',status:'preliminar',fontes_complementares:[]},
  apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente'],
  visual:{pagina:page,imagem:image,motivo:`Página ${page} do caderno oficial; imagem e contexto preservados.`}}
})
if(decisions.length!==85||new Set(decisions.map(x=>x.id)).size!==85)throw Error('Contagem ou unicidade inconsistentes')
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const base='tmp/revisao-profissional/revisao-abin-oficial-inteligencia-area3-2018-pendencias-v272/acervo-extraido'
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SES/DF — Residência Médica 2016/2, Medicina Intensiva — v273\n\n- Classifiquei 85 itens pendentes com matéria e conteúdo clínico específicos, separando infectologia, psiquiatria, anestesiologia, medicina intensiva, cirurgia-geral e epidemiologia clínica.\n- Normalizei falhas pontuais de OCR sem remover os textos-base e as imagens de página já vinculadas. As páginas e o contexto visual foram preservados.\n- Vinculei as respostas do gabarito oficial preliminar. Não localizei o gabarito definitivo; por isso, cada resposta está explicitamente marcada como preliminar e provisória.\n- Dificuldades são estimativas editoriais. Alteração local, não publicada na nuvem.\n- Fontes: [caderno oficial](<${prova}>), [gabarito oficial preliminar](<${gabarito}>).\n`)
console.log(JSON.stringify({...report,documento:doc,revisadas:85,gabarito:'preliminar; definitivo não localizado',publicacao:'local'},null,2))
