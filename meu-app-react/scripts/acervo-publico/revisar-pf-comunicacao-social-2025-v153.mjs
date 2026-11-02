import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='03adf9621cd6dd13'
const prova='https://cdn.cebraspe.org.br/concursos/PF_25_ADM/arquivos/094_PF_014_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/PF_25_ADM/arquivos/Gab_Definitivo_094_PF_014_01.pdf'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const answers=('ECECECCC'+'EEECCEEC'+'CCECECE'+'EEC'+'X'+'E'+'CCEC'+'X'+'C'+'EX'+'EC'+'X'+'EC'+'EC'+'CCCE'+'EECC'+'X'+'C').split('')
// Use an explicit official-item map: source key covers items 51–120; X = annulled.
const values={51:'E',52:'C',53:'E',54:'C',55:'E',56:'C',57:'C',58:'C',59:'E',60:'E',61:'E',62:'C',63:'C',64:'E',65:'C',66:'C',67:'C',68:'E',69:'E',70:'E',71:'C',72:'X',73:'E',74:'C',75:'C',76:'E',77:'E',78:'C',79:'C',80:'C',81:'E',82:'C',83:'C',84:'C',85:'X',86:'C',87:'E',88:'X',89:'E',90:'C',91:'E',92:'C',93:'E',94:'C',95:'C',96:'C',97:'E',98:'C',99:'C',100:'C',101:'E',102:'E',103:'C',104:'C',105:'C',106:'E',107:'E',108:'E',109:'C',110:'E',111:'C',112:'E',113:'C',114:'E',115:'C',116:'C',117:'E',118:'E',119:'X',120:'C'}
const key=new Map(Object.entries(values).map(([n,v])=>[Number(n),v]))
if(raw.length!==70||key.size!==70||raw.some(q=>!key.has(Number(q.numero))))throw new Error('O conjunto do caderno ou do gabarito oficial está incompleto')
const keyHash=hashRevisao([...key].sort((a,b)=>a[0]-b[0]).map(([n,v])=>`${n}:${v}`).join('|'))

const topicFor=n=>{
 if(n<=54)return ['Comunicação Social','Comunicação pública, transparência, linguagem simples e impessoalidade']
 if(n<=63)return ['Relações Públicas','Assessoria de comunicação, relacionamento com a imprensa e comunicação de crise']
 if(n===64)return ['Comunicação Social','Design thinking e planejamento da comunicação pública']
 if(n<=72)return ['Relações Públicas','Comunicação interna, endomarketing e planejamento editorial']
 if(n<=78)return ['Jornalismo','Teorias do jornalismo, agenda setting, gatekeeping e noticiabilidade']
 if(n<=92)return ['Jornalismo','Produção, apuração, edição, gêneros e formatos jornalísticos']
 if(n<=98)return ['Jornalismo','Jornalismo digital, portais, interface e narrativa multimídia']
 if(n<=100)return ['Comunicação Social','Educação midiática, alfabetização informacional e desinformação']
 if(n<=104)return ['Comunicação Social','Convergência das mídias e cultura participativa']
 if(n<=106)return ['Comunicação Social','Inteligência artificial e produção jornalística']
 if(n<=111)return ['Legislação e normas','Ética jornalística, interesse público, privacidade e imagem']
 if(n<=113)return ['Comunicação Social','Elementos e modelos do processo de comunicação']
 if(n===114)return ['Relações Públicas','Planejamento estratégico e análise do ambiente organizacional']
 return ['Cerimonial e Protocolo','Cerimonial público, símbolos nacionais e ordem de precedência']
}
const contexts=[
 [[51,54],'Julgue os itens relativos à comunicação pública, seus processos, instrumentos e à linguagem simples no setor público.'],
 [[55,59],'Acerca da comunicação nas organizações, julgue os itens.'],
 [[60,63],'Ainda no que se refere à comunicação nas organizações, julgue os itens.'],
 [[64,64],'No que se refere à aplicação do design thinking na comunicação institucional e no setor público, julgue o item.'],
 [[65,67],'Acerca da comunicação interna e do endomarketing, julgue os itens.'],
 [[68,72],'No que se refere a canais e estratégias de comunicação interna e ao planejamento editorial de publicações internas, julgue os itens.'],
 [[73,78],'Acerca das teorias do jornalismo e dos critérios de noticiabilidade, julgue os itens.'],
 [[79,85],'No que se refere à produção jornalística, edição, revisão, técnicas de produção, características e linguagem jornalística, julgue os itens.'],
 [[86,92],'No que se refere ao telejornalismo, ao radiojornalismo, ao webjornalismo, ao fotojornalismo e às técnicas de redação jornalística, julgue os itens.'],
 [[93,98],'No que se refere ao jornalismo digital, julgue os itens.'],
 [[99,100],'No que se refere a fake news e jornalismo, julgue os itens.'],
 [[101,104],'No que diz respeito às novas tecnologias de comunicação e à cultura da convergência como elementos da comunicação, julgue os itens.'],
 [[105,106],'A respeito do uso da inteligência artificial para a produção de conteúdo no jornalismo, julgue os itens.'],
 [[107,111],'No que diz respeito à ética e à legislação em comunicação social, julgue os itens.'],
 [[112,113],'No que diz respeito aos elementos básicos da comunicação social e aos conceitos básicos, natureza e funções estratégicas das relações públicas, julgue os itens.'],
 [[114,114],'No que diz respeito à análise estratégica e à atuação dos profissionais de relações públicas, julgue o item.'],
 [[115,120],'Acerca do cerimonial e do protocolo, julgue os itens.']
]
const contextFor=n=>contexts.find(([[a,b]])=>n>=a&&n<=b)[1]
const corrections=new Map([
 [55,'Em órgãos públicos federais, a assessoria de comunicação deve se estruturar como um núcleo operacional subordinado à comunicação social do Poder Executivo, sendo sua atuação restrita à execução de tarefas técnicas, como produção de releases e gestão de redes sociais.'],
 [59,'Releases e sugestões de pauta são peças opinativas destinadas a reforçar o posicionamento ideológico da instituição diante de temas de alta sensibilidade política.'],
 [64,'O uso do design thinking em assessorias de comunicação implica abandonar os modelos tradicionais de planejamento estratégico para adotar práticas experimentais, não lineares e baseadas em intuições criativas, o que torna essa abordagem incompatível com os rigores e normativas da administração pública.'],
 [106,'Os algoritmos da inteligência artificial são capazes de mapear, com alto grau de precisão, a personalidade de seus usuários, podendo definir suas preferências e gostos pessoais e, consequentemente, impactar a distribuição de conteúdo.']
])
const removeFollowing={
 54:/\s+Acerca da comunicação nas organizações[\s\S]*$/iu,
 59:/\s+Ainda no que se refere à comunicação nas organizações[\s\S]*$/iu,
 63:/\s+No que se refere à aplicação do design thinking[\s\S]*$/iu,
 67:/\s+No que se refere a canais e estratégias de comunicação interna[\s\S]*$/iu,
 72:/\s+Acerca das teorias do jornalismo[\s\S]*$/iu,
 78:/\s+No que se refere à produção jornalística[\s\S]*$/iu,
 92:/\s+No que se refere ao jornalismo digital[\s\S]*$/iu,
 98:/\s+No que se refere a fake news e jornalismo[\s\S]*$/iu,
 100:/\s+No que diz respeito às novas tecnologias de comunicação[\s\S]*$/iu,
 104:/\s+A respeito do uso da inteligência artificial[\s\S]*$/iu,
 106:/\s+No que diz respeito à ética e à legislação[\s\S]*$/iu,
 111:/\s+No que diz respeito aos elementos básicos da comunicação social[\s\S]*$/iu,
 114:/\s+Acerca do cerimonial e do protocolo[\s\S]*$/iu,
 120:/\s+Espaço livre\s*$/iu
}
const clean=(n,s)=>{
 let out=(corrections.get(n)||s||'').replace(/\u000c/g,' ').replace(/\s+CEBRASPE\s*[–-]\s*PF\s*[–-]\s*Edital:\s*2025[\s\S]*$/iu,'')
 if(removeFollowing[n])out=out.replace(removeFollowing[n],'')
 return out.replace(/\s+/g,' ').replace(/\s+([.,;:!?])/g,'$1').trim()
}

const start=raizesAtuais.findIndex(r=>r.includes('revisao-sesau-assistente-social-2021-v152'))
if(start<0)throw new Error('Base v152 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)));for(const q of qs)if(q.documento_id===doc)active.set(q.id,q)}
if(active.size!==70||raw.some(x=>!active.has(x.id)))throw new Error(`Documento inesperado: ${active.size} itens ativos`)
const decisions=raw.map(x=>{
 const n=Number(x.numero),q=active.get(x.id),ans=key.get(n),topic=topicFor(n),stem=clean(n,x.enunciado),ctx=contextFor(n)
 if(!ans||!x.imagem?.startsWith(`paginas/${doc}-`)||stem.length<35)throw new Error(`Questão incompleta no item ${n}`)
 const annulled=ans==='X'
 const pageImage=`paginas/${doc}-${String(x.pagina).padStart(4,'0')}.webp`
 return {id:x.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2025,concurso:'Polícia Federal — Técnico em Comunicação Social (Cargo 14), edital 2025 — aplicação em 29/06/2025',numero_original:n,pagina:Number(x.pagina),dificuldade:[55,61,64,73,74,76,77,88,93,96,97,101,102,105,106,108,110,114,115,118,119].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e normativa; não é nota oficial de dificuldade da banca.',resposta_correta:annulled?null:ans==='C'?0:1,anulada:annulled,gabarito_oficial:{valor:ans,fonte:gabarito,sha256:keyHash,sha256_tipo:'hash_da_transcricao_canonica_dos_itens_51_a_120_do_gabarito_definitivo',numero:n,resposta:ans,metodo:'Gabarito definitivo oficial do Cargo 14 — Técnico em Comunicação Social. Aplicação em 29/06/2025. Os itens 72, 85, 88 e 119 foram anulados; o hash representa a transcrição, não o PDF.'},classificacao_fonte:prova,motivo:`Item ${n} classificado pelo conteúdo do enunciado e pelo comando temático impresso no caderno oficial.`,visual:{pagina:Number(x.pagina),imagem:pageImage,texto_apoio:ctx,motivo:`Página ${x.pagina} do caderno oficial conferida visualmente; contexto do bloco associado e contaminação de cabeçalho removida quando presente.`},enunciado:stem,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']}
})
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicos:new Set(decisions.map(d=>d.numero_original)).size,gabaritos:key.size,anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero_original),corrigidos:corrections.size,paginas:[...new Set(decisions.map(d=>d.pagina))],contaminacoes:decisions.filter(d=>/CEBRASPE|Acerca da comunicação|No que se refere ao|Ainda no que|No que diz respeito|A respeito do uso|Espaço livre/.test(d.enunciado)).map(d=>d.numero_original)},null,2));process.exit(0)}
const name='revisao-pf-comunicacao-social-2025-v153',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const output={...report,fonte_prova:prova,fonte_gabarito:gabarito,fonte_justificativas:'https://cdn.cebraspe.org.br/concursos/PF_25_ADM/arquivos/F2B1D0B8277AF5E6BE3A037CC5FA6F2F6028403C76346A890B24B36BFC21335F.pdf',registros_revistos:decisions.length,itens_unicos:decisions.length,anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero_original),transcricoes_corrigidas:corrections.size,paginas_originais:[...new Set(decisions.map(d=>d.pagina))].length,contextos_e_imagens_associados:true,publicada:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2))
