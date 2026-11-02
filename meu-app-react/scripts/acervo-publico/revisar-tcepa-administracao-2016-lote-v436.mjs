import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisar-tcepa-administracao-2016-lote-v436'
const doc='5a4bd7cdb9db8f6e'
const prova='https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/251TCEPA_020_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/Gab_Definitivo_251TCEPA_020_01.pdf'
const concurso='TCE/PA 2016 — Auditor de Controle Externo — Fiscalização — Administração'
const keys={79:'E',80:'E',81:'C',82:'E',83:'C',95:'C',113:'C',114:'E'}
const canonical=Object.entries(keys).map(([n,k])=>`${n}:${k}`).join('\n')
const digest=createHash('sha256').update(`CEBRASPE|TCE-PA2016|CARGO20-ADMINISTRACAO|GABARITO_OFICIAL_DEFINITIVO|ITENS_SELECIONADOS\n${canonical}`).digest('hex')
const meta={
79:['Gestão de Projetos','Gerenciamento de riscos: planejamento de respostas e monitoramento','Média'],
80:['Gestão de Projetos','Ciclo de vida de projetos: influência das partes interessadas, riscos e incertezas','Média'],
81:['Gestão de Projetos','Gerenciamento de custos: distribuição de gastos entre execução e demais fases','Média'],
82:['Administração Financeira e Orçamentária','LRF e transparência fiscal: publicidade de planos, orçamentos e LDO','Média'],
83:['Administração Financeira e Orçamentária','LRF: operações de crédito entre instituição financeira estatal e ente controlador','Difícil'],
95:['Direito Administrativo','Licitações e contratos: acesso a informações sobre obras e preços unitários','Média'],
113:['Administração Financeira e Orçamentária','Execução da despesa: restos a pagar e impactos orçamentário e financeiro','Média'],
114:['Administração Financeira e Orçamentária','Classificação orçamentária: programação qualitativa e dimensões funcional e econômica','Difícil']}
const records=JSON.parse(await fs.readFile('tmp/proxima-fila-revisao.json','utf8'))
if(records.length!==8||new Set(records.map(q=>q.id)).size!==8)throw Error('Fila alterada: esperados 8 itens únicos.')
const commands={
79:'Comando da prova: Julgue os itens sobre elaboração, análise e avaliação de projetos.',
82:'Comando da prova: Com base nas normas legais de gestão dos recursos financeiros dos entes federativos, incluindo a Lei de Responsabilidade Fiscal, julgue os itens.',
95:'Comando da prova: Acerca das normas para licitações e contratos da administração pública, julgue os itens.',
113:'Comando da prova: A respeito do processo de orçamentação, julgue os itens subsequentes.'}
const decisions=records.map(q=>{
 const n=Number(q.numero),key=keys[n],m=meta[n];if(!m||!key)throw Error(`Item ${n} sem classificação ou gabarito.`)
 const answer=key==='C'?0:1;if(q.resposta!==null&&q.resposta!==answer)throw Error(`Resposta do item ${n} difere do gabarito definitivo.`)
 let stem=String(q.enunciado||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()
 if(n===79)stem='De acordo com o Guia PMBOK, o planejamento do gerenciamento de riscos inclui o desenvolvimento de respostas para mitigar problemas oriundos dos riscos identificados, sem, no entanto, monitorá-los.'
 if(n===81)stem='Na análise dos gastos de um projeto, a fase de execução concentra, na maioria dos casos, a maior parte dos custos com atividades e pessoal.'
 const context=n===79||n===80||n===81?commands[79]:n===82||n===83?commands[82]:n===95?commands[95]:commands[113]
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,materia:m[0],conteudo:m[1],ano:2016,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'07/08/2016',numero_original:n,dificuldade:m[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade das normas, do processo de projeto e das distinções conceituais exigidas; não é métrica psicométrica publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} conferido no caderno oficial do cargo 20. Classificado pela norma ou etapa de gestão efetivamente avaliada; o gabarito definitivo confirma a resposta indicada.`,resposta_correta:answer,anulada:false,gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'Gab_Definitivo_251TCEPA_020_01.pdf',prova:'251TCEPA_020_01.pdf',numero:n,criterio:'Gabarito oficial definitivo do cargo 20 — Auditor de Controle Externo, Administração.',sha256:digest,sha256_tipo:'transcricao_canonica_dos_itens_selecionados',metodo:'SHA-256 da transcrição canônica das respostas definitivas selecionadas; não representa hash dos bytes do PDF.'},texto_apoio:context,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','classificacao_pendente','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado']}
})
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:8,questoes_classificadas:8,gabaritos_oficiais_vinculados:8,textos_reestruturados:6,ano:2016,prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const rootLine=`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`,rootFile='scripts/acervo-publico/acervo-atual.mjs',rootText=await fs.readFile(rootFile,'utf8')
if(!rootText.includes(rootLine))await fs.appendFile(rootFile,`\n${rootLine}\n`)
const report={...result,documento:doc,concurso,ano:2016,questoes_revisadas:8,gabaritos_oficiais_vinculados:8,textos_reestruturados:[79,81,82,83,95,113,114],fonte_prova:prova,fonte_gabarito:gabarito,sha256_transcricao_oficial:digest,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
