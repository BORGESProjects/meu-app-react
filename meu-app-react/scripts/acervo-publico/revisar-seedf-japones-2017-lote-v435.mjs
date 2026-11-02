import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisar-seedf-japones-2017-lote-v435'
const doc='f4bc9c77bc274516'
const prova='https://cdn.cebraspe.org.br/concursos/SEE_16_DF/arquivos/290_SEEDF_020_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/SEE_16_DF/arquivos/Gab_Definitivo_290_SEEDF_020_01.pdf'
const concurso='SEE/DF 2016 — Conhecimentos Específicos — Professor de Educação Básica — LEM/Japonês'
const keyByNumber={101:'C',102:'C',103:null,104:null,105:'E',106:'C',107:'E',108:'E',109:'E',110:'E'}
const canonical=Object.entries(keyByNumber).map(([n,k])=>`${n}:${k||'ANULADO'}`).join('\n')
const digest=createHash('sha256').update(`CEBRASPE|SEE-DF|2017|CARGO20-JAPONES|GABARITO_OFICIAL_DEFINITIVO|ITENS_SELECIONADOS\n${canonical}`).digest('hex')
const meta={
101:['Língua Japonesa','Metodologias de ensino de língua estrangeira: abordagem sociocultural, inclusão e diversidade','Média'],
102:['Língua Japonesa','Ensino de língua estrangeira: cidadania e comparação intercultural','Média'],
103:['Língua Japonesa','Metodologias de ensino: método audiolingual e aquisição de língua japonesa','Média'],
104:['Língua Japonesa','Abordagem comunicativa: competência linguística, variação e comunicação','Média'],
105:['Língua Japonesa','Didática da escrita japonesa: alfabetização, letramento e sistemas de escrita','Média'],
106:['Língua Japonesa','Materiais didáticos e variação linguística no ensino do japonês','Média'],
107:['Língua Japonesa','Gêneros discursivos e textuais no ensino do japonês','Média'],
108:['Língua Japonesa','Ensino de kanji: progressão didática, interação e desenvolvimento do aprendiz','Média'],
109:['Pedagogia','Educação de Jovens e Adultos: trajetórias, temporalidade e função social','Média'],
110:['Legislação Educacional','LDB e ensino de língua estrangeira moderna na educação básica','Média']}
const commands={
101:'Comando comum: Considerando a formação do professor de língua japonesa e as metodologias mais comuns no ensino de língua estrangeira, julgue os itens.',
105:'Comando comum: Tendo em vista a organização didático-pedagógica do ensino de japonês e as exigências do processo de ensino-aprendizagem, julgue os itens.',
109:'Comando comum: Com base nas Diretrizes Curriculares do Ensino Básico e nos fundamentos da psicologia histórico-cultural, julgue os itens.'}
const records=JSON.parse(await fs.readFile('tmp/proxima-fila-revisao.json','utf8'))
if(records.length!==10||new Set(records.map(q=>q.id)).size!==10)throw Error('Fila alterada: esperados 10 itens únicos.')
const decisions=records.map(q=>{
 const n=Number(q.numero),key=keyByNumber[n],m=meta[n];if(!m||key===undefined)throw Error(`Item ${n} não catalogado.`)
 const annulled=key===null,answer=annulled?null:(key==='C'?0:1)
 if(!annulled&&q.resposta!==answer)throw Error(`Resposta do item ${n} diverge do gabarito definitivo.`)
 let stem=String(q.enunciado||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()
 if(n===104)stem='O método comunicativo foca na competência linguística do aluno, considerando-se as variantes linguísticas e culturais, o que permite a proficiência comunicativa na língua-alvo.'
 if(n===108)stem='O estudo de ideogramas no japonês deve ser visto como ferramenta imprescindível para a interação com a língua. Assim, é importante que se comece esse estudo pelas letras mais simples, aumentando-se a dificuldade conforme o aprendiz ganha proficiência.'
 const context=n<=103?commands[101]:n<=108?commands[105]:commands[109]
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,materia:m[0],conteudo:m[1],ano:2017,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'29/01/2017',numero_original:n,dificuldade:m[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela análise conceitual e didática exigida; a banca não publica dificuldade psicométrica individual.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial para Professor de LEM/Japonês. Matéria e conteúdo definidos pela habilidade didática ou norma educacional avaliada.`,resposta_correta:answer,anulada:annulled,gabarito_oficial:{valor:annulled?'Anulado':key,fonte:gabarito,arquivo:'Gab_Definitivo_290_SEEDF_020_01.pdf',prova:'290_SEEDF_020_01.pdf',numero:n,criterio:annulled?'Item anulado no gabarito definitivo oficial.':'Gabarito definitivo do cargo 20 — Professor de Educação Básica, LEM/Japonês.',sha256:digest,sha256_tipo:'transcricao_canonica_dos_itens_selecionados',metodo:'SHA-256 da transcrição canônica das respostas definitivas selecionadas; não representa hash dos bytes do PDF.'},texto_apoio:context,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','classificacao_pendente','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado']}
})
if(decisions.filter(x=>x.anulada).length!==2||decisions.length!==10)throw Error('Esperados dez itens, dois anulados pela banca.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:10,questoes_classificadas:10,anuladas:[103,104],gabaritos_vinculados:8,contextos_limpos:10,prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const rootLine=`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`,rootFile='scripts/acervo-publico/acervo-atual.mjs',rootText=await fs.readFile(rootFile,'utf8')
if(!rootText.includes(rootLine))await fs.appendFile(rootFile,`\n${rootLine}\n`)
const report={...result,documento:doc,concurso,ano:2017,questoes_revisadas:10,questoes_anuladas:[103,104],gabaritos_oficiais_vinculados:10,contextos_reestruturados:10,fonte_prova:prova,fonte_gabarito:gabarito,sha256_transcricao_oficial:digest,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
