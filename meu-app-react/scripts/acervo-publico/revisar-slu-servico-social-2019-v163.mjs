import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='792f42b84e79d6b0'
const prova='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/19_449_SLUDF_019_00_COM_JUST.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/SLU_DF_19_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO_V_1_L.PDF'
const start=raizesAtuais.findIndex(r=>r.includes('revisao-fub-musico-2016-v162'))
if(start<0)throw Error('Base v162 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)}
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||active.size!==77)throw Error(`Esperados 77 registros do Cargo 19, recebidos ${active.size}`)
const canonical=new Map(),pages=new Map()
for(const q of catalog.questoes){if(!canonical.has(q.numero))canonical.set(q.numero,q.id);pages.set(q.id,q.pagina)}
if(canonical.size!==70||[...Array(70)].some((_,i)=>!canonical.has(i+51)))throw Error('Caderno não cobre os itens 51–120')
const changes=new Map([[70,'E'],[71,'X'],[76,'X'],[109,'X']])
// Respostas transcritas das justificativas do caderno oficial; o gabarito
// definitivo de alterações/anulações prevalece nos itens 70, 71, 76 e 109.
const answers=new Map(Object.entries({51:'E',52:'C',53:'E',54:'E',55:'C',56:'C',57:'C',58:'E',59:'C',60:'E',61:'E',62:'E',63:'C',64:'E',65:'C',66:'E',67:'E',68:'C',69:'C',70:'E',71:'X',72:'E',73:'C',74:'C',75:'C',76:'X',77:'C',78:'E',79:'C',80:'C',81:'E',82:'E',83:'C',84:'C',85:'E',86:'C',87:'C',88:'E',89:'C',90:'C',91:'E',92:'C',93:'E',94:'E',95:'E',96:'C',97:'C',98:'E',99:'C',100:'E',101:'E',102:'E',103:'C',104:'E',105:'C',106:'C',107:'C',108:'E',109:'X',110:'E',111:'C',112:'C',113:'C',114:'E',115:'E',116:'C',117:'E',118:'E',119:'C',120:'C'}).map(([i,v])=>[Number(i),v]))
const ranges=[
 [[51,53],'Serviço Social','Fundamentos históricos e teórico-metodológicos do Serviço Social — intervenção, natureza e desenvolvimento profissional','Acerca dos fundamentos históricos e teórico-metodológicos do Serviço Social, julgue os itens.'],
 [[54,58],'Ética e Pesquisa em Serviço Social','Práxis, ética profissional, moral, neutralidade científica, metodologia e pesquisa documental','A respeito da ética profissional, da produção de conhecimento e da pesquisa em Serviço Social, julgue os itens.'],
 [[59,61],'Planejamento e Ética Profissional','Projeto de intervenção, planejamento, estágio supervisionado e atribuições profissionais','A respeito do projeto de intervenção, do planejamento e da supervisão profissional, julgue os itens.'],
 [[62,65],'Instrumentalidade do Serviço Social','Instrumentos e técnicas, dimensões técnico-operativa, teórico-metodológica e ético-política','Acerca da dimensão técnico-operativa, dos instrumentos e das técnicas do Serviço Social, julgue os itens.'],
 [[66,71],'Estudo e Perícia Social','Estudo socioeconômico, perícia, relatório, laudo, parecer social e autonomia profissional','Julgue os itens sobre estudo social, perícia social, relatório, laudo e parecer social.'],
 [[72,74],'Serviço Social com Grupos','Trajetória conservadora do Serviço Social no Brasil e técnicas de trabalho com grupos','No que se refere à história da profissão e ao trabalho com grupos, julgue os itens.'],
 [[75,79],'Política de Assistência Social','CREAS, seguridade social, LOAS, PNAS, SUAS, vigilância, proteção e defesa social','Considere as legislações de saúde, assistência e previdência social e julgue os itens.'],
 [[80,85],'Direitos da Criança e do Adolescente','ECA, família extensa, pré-natal, medidas socioeducativas, trabalho infantil, situação de rua e Conselho Tutelar','Acerca das políticas, diretrizes e ações para famílias, crianças e adolescentes, julgue os itens.'],
 [[86,87],'Seguridade Social','Modelos bismarckiano e beveridgiano e sistema híbrido brasileiro após a Constituição de 1988','Acerca da história e das políticas de seguridade social, julgue os itens.'],
 [[88,90],'Política Ambiental e População em Situação de Rua','PNMA, princípios de proteção ambiental, educação ambiental e serviços de referência para população em situação de rua','Considere políticas e programas sociais e ambientais e julgue os itens.'],
 [[91,95],'Políticas Sociais e Direitos Humanos','Violência contra pessoa idosa, saúde indígena, indicadores de políticas para crianças, adolescentes e família, acolhimento familiar','Julgue os itens sobre políticas de saúde, pessoa idosa, infância, adolescência e assistência social.'],
 [[96,97],'Questão Social e Direitos Sociais','Concepções positivistas da questão social, relações sociais, direitos e resistência','A respeito da questão social, de suas expressões e formas de enfrentamento, julgue os itens.'],
 [[98,102],'Ética e Legislação Profissional','Código de Ética, atribuições privativas, estágio, educação permanente e atuação no SUS','Caso: Adriano é assistente social de uma instituição filantrópica privada de saúde, atua em equipe interdisciplinar, supervisiona estágio e coordena o núcleo de educação permanente. Julgue os itens à luz da Lei nº 8.080/1990, da Lei nº 8.662/1993 e do Código de Ética.'],
 [[103,105],'Previdência Social e Direitos da Pessoa Idosa','Segurado obrigatório, dependência de cônjuge e filhos, acompanhante e direitos da pessoa idosa','Caso: Antônio, empregado celetista de 63 anos, foi hospitalizado após fortes dores de cabeça. É casado com Maria, desempregada, e pai de dois filhos menores; Maria busca orientação sobre os direitos previdenciários e de saúde. Julgue os itens.'],
 [[106,108],'Direitos das Mulheres','Lei Maria da Penha — violência física, proteção do vínculo trabalhista e encaminhamento à assistência judiciária','À luz da Lei Maria da Penha, julgue os itens.'],
 [[109,115],'Assistência Social e Sistema Socioeducativo','BPC, SINASE, proteção de adolescentes, direitos da pessoa idosa, políticas sobre drogas, Regras de Beijing e PNDH','Caso: Sandra, 16 anos, está em centro socioeducativo de internação. Foi criada pela avó paterna Janete, 70 anos, tutora de Sandra e de outros três netos menores que moram com ela. A renda familiar vem de pensão especial indenizatória. Pedro, namorado de Sandra, tem 28 anos e cumpre pena em regime fechado por tráfico. Julgue os itens.'],
 [[116,117],'Legislação Educacional','Lei de Diretrizes e Bases da Educação e autonomia do ensino militar','De acordo com a Lei de Diretrizes e Bases da Educação Brasileira, julgue os itens.'],
 [[118,120],'Regulamentação Profissional do Serviço Social','Certidão e anotação de responsabilidade técnica, registro no CRESS e normas do CFESS','Com base nas resoluções do Conselho Federal de Serviço Social, julgue os itens sobre responsabilidade técnica.']
]
const range=i=>ranges.find(([[a,b]])=>i>=a&&i<=b)
const clean=(s='')=>s.split(/\bJUSTIFICATIVA\s*[-–:]?/i)[0].replace(/CEBRASPE\s*[–-]\s*SLUDF[\s\S]*$/iu,'').replace(/\u000c/g,' ').replace(/\s+/g,' ').trim()
const decisions=[...active.values()].map(q=>{
 const i=Number(q.numero_original??q.numero??q.numero_questao),r=range(i);if(!r)throw Error(`Item fora do mapa: ${q.id}`)
 const [[a,b],materia,conteudo,contexto]=r,canonicalId=canonical.get(i),dup=q.id!==canonicalId,pg=pages.get(q.id)||1,answer=changes.get(i)||answers.get(i),stem=clean(q.enunciado)
 if(!answer)throw Error(`Sem resposta oficial identificável para o item ${i} (${q.id})`)
 if(!stem||stem.length<22)throw Error(`Enunciado vazio/incompleto no item ${i}`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2019,concurso:'SLU/DF — Analista de Gestão de Resíduos Sólidos, Especialidade Serviço Social (Cargo 19); aplicação em 2019',numero_original:i,pagina:pg,dificuldade:[51,53,54,57,59,60,62,64,67,70,72,75,76,78,82,83,85,86,88,91,94,95,98,99,101,102,105,107,108,109,110,113,114,115,117,118,120].includes(i)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência conceitual e legal; o CEBRASPE não publicou níveis de dificuldade.',resposta_correta:answer==='X'?null:answer==='C'?0:1,anulada:answer==='X',gabarito_oficial:{valor:answer,fonte:gabarito,numero:i,resposta:answer,metodo:'Justificativa oficial do CEBRASPE com as alterações/anulações do gabarito definitivo aplicadas; itens 70 (E), 71, 76 e 109 (anulados).'},classificacao_fonte:prova,motivo:`Classificação por comando e tema, conferidos na página ${pg} do caderno oficial.`,visual:{pagina:pg,imagem:`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`,texto_apoio:contexto,motivo:`Contexto comum do bloco e página ${pg} vinculados à questão.`},enunciado:stem,...(dup?{apta_resolucao:false,duplicada_de:canonicalId,inelegibilidade_motivo:`Duplicata de OCR do item ${i}; registro canônico ${canonicalId}.`}:{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']})}
})
if(decisions.length!==77||decisions.filter(x=>x.duplicada_de).length!==7||decisions.filter(x=>x.anulada).length!==3)throw Error('Total de registros, duplicatas ou anulações divergente')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicos:70,duplicatas:7,anuladas:[...changes].filter(([,v])=>v==='X').map(([i])=>i),classificacoes:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(m=>[m,decisions.filter(x=>x.materia===m).length]))},null,2));process.exit(0)}
const name='revisao-slu-servico-social-2019-v163',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions});raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...report,prova,gabarito,registros_revistos:77,itens_unicos:70,duplicatas_inelegiveis:7,anuladas:[...changes].filter(([,v])=>v==='X').map(([i])=>i),paginas_originais:6,justificativas_removidas_dos_enunciados:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
