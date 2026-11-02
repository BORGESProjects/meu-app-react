import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='c90028d01ba3a446'
const prova='https://cdn.cebraspe.org.br/concursos/FUNPRESP_26_JUD/arquivos/449DB077293A0D672A4D8A23B8B5C5D5ED890FCEE7A58C3B87632D5BB1B48644.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/FUNPRESP_26_JUD/arquivos/E74405349257F743B365031B2BEDF8D1CF980DEF0176B749818FFF56D2FFD7C4.pdf'
const start=raizesAtuais.findIndex(r=>r.includes('revisao-mpto-fotografia-2024-v160'))
if(start<0)throw Error('Base v160 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)}
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||active.size!==73)throw Error(`Esperados 73 registros do documento, recebidos ${active.size}`)
const canonical=new Map(),pages=new Map()
for(const q of catalog.questoes){if(!canonical.has(q.numero))canonical.set(q.numero,q.id);pages.set(q.id,q.pagina)}
if(canonical.size!==70||[...Array(70)].some((_,i)=>!canonical.has(i+51)))throw Error(`Caderno não cobre 51–120: ${canonical.size} itens únicos`)
const keyRows=[
 ['E','C','C','E','E','E','E','C','E','E','C','C','E','E','C','E','C','C','C','E'],
 ['C','E','E','E','C','C','C','E','E','E','E','C','C','E','C','E','C','E','E','E'],
 ['C','C','E','C','E','E','C','E','C','E','C','E','E','C','C','C','E','C','E','E'],
 ['E','C','E','C','C','E','C','E','E','E']
],key=new Map();let n=51;for(const row of keyRows)for(const answer of row)key.set(n++,answer);if(n!==121||key.size!==70)throw Error('Gabarito definitivo incompleto')
const blocks=[
 [[51,54],'Auditoria Interna','Controle interno — técnicas de auditoria, segurança documental e segregação de funções','No que concerne ao controle interno, julgue os itens.'],
 [[55,58],'Auditoria Governamental','Controle externo — separação de Poderes, formas de fiscalização, eficiência e competências dos tribunais de contas','Acerca do controle externo, julgue os itens.'],
 [[59,62],'Auditoria Interna','Papéis de trabalho — evidências, propriedade, documentação, organização e codificação','No que diz respeito a papéis de trabalho, julgue os itens.'],
 [[63,70],'Governança Corporativa e Gestão de Riscos','EFPC, controles internos, risco operacional, comitê de auditoria e governança corporativa','Em relação à avaliação de riscos e aos controles internos em entidades fechadas de previdência complementar, julgue os itens; em seguida, considere os conceitos de governança corporativa e auditoria.'],
 [[71,80],'Auditoria','Auditoria independente, operacional, governamental e financeira; planejamento, evidências, materialidade e resposta a riscos','Em relação aos tipos e classificações da auditoria, ao seu objeto e objetivos, à natureza e às fases do processo; depois, considere normas de auditoria e governança corporativa.'],
 [[81,85],'Regulação do Sistema Financeiro e Previdenciário','Competências de SUSEP, PREVIC, TCU, CMN, BACEN e CVM','A respeito dos órgãos de regulação e fiscalização, julgue os itens.'],
 [[86,90],'Previdência Complementar','Plano de benefícios — resgate, benefício proporcional diferido, contribuições extraordinárias, carência e cessação de vínculo','Considere o ingresso de uma servidora em plano de previdência complementar vinculado à administração pública federal e julgue os itens conforme a legislação vigente.'],
 [[91,92],'Direito Administrativo e Proteção de Dados','Lei Anticorrupção e sanções administrativas da LGPD','Julgue os itens com base na Lei Geral de Proteção de Dados e na Lei Anticorrupção.'],
 [[93,95],'Gestão de Riscos e Controles Internos','COSO e ISO 31.000 — gerenciamento de riscos, ambiente de controle e normalização','Julgue os itens relativos às normas de controle interno estabelecidas pelo COSO e à ISO 31.000.'],
 [[96,110],'Gestão de Processos','Processos organizacionais, auditoria baseada em riscos, modelagem, classificação, reengenharia e melhoria contínua','Julgue os itens sobre gestão, análise, modelagem e melhoria de processos organizacionais.'],
 [[111,116],'Auditoria e Regulação de EFPC','Auditoria independente, conselho fiscal, substituição de auditor, controles internos e prevenção à lavagem de dinheiro em fundos de pensão','À luz das Resoluções PREVIC nº 23/2023 e CNPC nº 44/2021, julgue os itens.'],
 [[117,118],'Investimentos de Entidades Fechadas de Previdência Complementar','Alocação em títulos públicos e conflito de interesses em investimentos','Considere a operação de alocação de recursos de um plano previdenciário e julgue os itens conforme a Resolução CMN nº 4.994/2022.'],
 [[119,120],'Auditoria e Controles Internos','Segregação de funções e reporte de deficiências de controles em EFPC','Julgue os itens conforme a Resolução MPS/CGPC nº 13/2004.']
]
const block=i=>blocks.find(([[a,b]])=>i>=a&&i<=b)
const fix=new Map([
 [65,'O risco operacional é definido como a possibilidade de ocorrência de perdas resultantes de falhas, deficiências ou inadequação de processos internos, pessoas e sistemas, ou de eventos externos.'],
 [66,'O comitê de auditoria deve ser composto majoritariamente por conselheiros internos ou executivos, de modo a ampliar a integração com a gestão operacional.'],
 [67,'Nas organizações com estrutura formal de governança corporativa, a auditoria interna tende a subordinar-se ao conselho de administração por intermédio do comitê de auditoria.'],
 [79,'Nos procedimentos de avaliação de riscos, a obtenção de informações junto à administração pode fornecer evidência de auditoria suficiente para dispensar a realização de procedimentos analíticos e de observação e inspeção.'],
 [83,'O TCU exerce o controle externo sobre as entidades de previdência complementar vinculadas à administração pública federal, especialmente no que se refere à utilização de recursos públicos, à governança e à atuação dos patrocinadores federais, sem substituir a competência técnica da PREVIC.'],
 [84,'O CMN e o BACEN são entidades responsáveis pela execução da política monetária nacional, e, diferentemente do primeiro, o segundo exerce apenas função consultiva.'],
 [88,'A entidade de previdência complementar poderá instituir contribuições extraordinárias para custeio de eventuais déficits apenas quando a servidora for beneficiária de prestação continuada, pois os participantes ativos não podem ser responsabilizados por eventuais inconsistências na constituição de reservas.'],
 [92,'Em caso de infrações às normas previstas na LGPD, os agentes de tratamento de dados ficam sujeitos a sanções administrativas que podem variar desde advertências, com indicação de prazo para adoção de medidas corretivas, à proibição parcial ou total do exercício de atividades relacionadas ao tratamento de dados.'],
 [95,'A ISO 31.000 estabelece modelo normativo obrigatório de certificação internacional para sistemas de gestão de riscos, impondo requisitos vinculantes exclusivamente às organizações do setor financeiro.'],
 [100,'Uma vez que o foco da análise de processos são os indicadores financeiros, é irrelevante examinar tempo de execução, qualidade e aderência normativa no âmbito desse tipo de análise.'],
 [102,'A modelagem de processos é dispensável quando a unidade auditada possui normas escritas formais, pois fluxogramas e representações gráficas não agregam valor à análise.'],
 [107,'Os processos organizacionais são integralmente estruturados e previsíveis, independentemente do nível de complexidade e do ambiente decisório.'],
 [109,'A adoção de reengenharia ou de melhoria contínua é incompatível com a auditoria de conformidade, visto que ambas priorizam eficiência e ignoram controles internos, foco das auditorias.'],
 [110,'A melhoria contínua dispensa indicadores e monitoramento, pois seu foco principal está na adoção espontânea de mudanças.'],
 [111,'As entidades devem solicitar ao auditor independente a produção de relatório circunstanciado sobre as deficiências identificadas no curso dos trabalhos e a adequação dos controles internos aos riscos suportados, sendo obrigatória a elaboração desse documento apenas para as EFPC classificadas pela PREVIC no segmento S1.'],
 [112,'A atuação do conselho fiscal das EFPC deve ser pautada na análise dos atos e decisões de gestão praticados por órgãos de administração ou colegiados, podendo o referido conselho contratar especialistas ou empresa especializada para a consecução dos seus objetivos.'],
 [113,'Realizada a substituição de responsável técnico da equipe de auditoria independente, este somente poderá retornar à mesma EFPC após decorridos dois exercícios sociais contados a partir da data de sua substituição.'],
 [114,'O auditor independente contratado pelas EFPC deve ser devidamente registrado na Comissão de Valores Mobiliários (CVM), quer seja pessoa física, quer seja pessoa jurídica.'],
 [115,'As EFPC devem contratar auditor independente para produzir, anualmente, relatório circunstanciado sobre as deficiências de controles internos identificadas e as respectivas recomendações, em consonância com a norma brasileira de contabilidade para trabalhos de auditoria — Comunicação de Deficiências de Controle Interno.'],
 [116,'As EFPC devem implementar procedimentos para a identificação de seus clientes, sendo, entretanto, facultativa a qualificação daqueles enquadrados como pessoas expostas politicamente, a fim de se garantir a isonomia no tratamento dos participantes.']
])
const clean=(s='')=>s.replace(/\u000c/g,' ').replace(/(?:=|—){3,}[\s\S]*$/u,'').replace(/\s+(?:CEBRASPE|Espaço livre|Considerando|Julgue os itens|Acerca|À luz do disposto)[\s\S]*$/u,'').replace(/\s+/g,' ').trim()
const decisions=[...active.values()].map(q=>{
 const i=Number(q.numero_original??q.numero??q.numero_questao),b=block(i);if(!b||!key.has(i))throw Error(`Item fora do mapa: ${q.id}`)
 const [[lo,hi],materia,conteudo,contexto]=b,ans=key.get(i),canonicalId=canonical.get(i),dup=q.id!==canonicalId,pg=pages.get(q.id)||1,stem=fix.get(i)||clean(q.enunciado)
 if(!stem||stem.length<25)throw Error(`Enunciado incompleto no item ${i} (${q.id})`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2026,concurso:'FUNPRESP-JUD — Analista, Especialidade Auditoria e Controle Interno (Emprego 3); aplicação em 05/07/2026',numero_original:i,pagina:pg,dificuldade:[52,55,57,59,62,64,65,67,71,73,76,78,79,80,83,86,88,91,92,95,97,99,102,104,108,109,111,114,115,118,120].includes(i)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade técnica; a banca não publicou grau de dificuldade.',resposta_correta:ans==='C'?0:1,anulada:false,gabarito_oficial:{valor:ans,fonte:gabarito,numero:i,resposta:ans,metodo:'Gabarito definitivo oficial do Emprego 3, aplicação em 05/07/2026.'},classificacao_fonte:prova,motivo:`Classificação por enunciado e bloco, conferidos visualmente na página ${pg} do caderno oficial.`,visual:{pagina:pg,imagem:`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`,texto_apoio:contexto,motivo:`Contexto do bloco e página ${pg} conferidos no caderno oficial.`},enunciado:stem,...(dup?{apta_resolucao:false,duplicada_de:canonicalId,inelegibilidade_motivo:`Duplicata OCR do item ${i}; registro canônico ${canonicalId}.`}:{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']})}
})
if(decisions.length!==73||decisions.filter(x=>x.duplicada_de).length!==3)throw Error('Total de registros/duplicatas divergente')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicos:70,duplicatas:3,anuladas:[],paginas:[1,2,3],materias:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(m=>[m,decisions.filter(x=>x.materia===m).length]))},null,2));process.exit(0)}
const name='revisao-funpresp-jud-auditoria-2026-v161',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions});raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...report,prova,gabarito,registros_revistos:73,itens_unicos:70,duplicatas_inelegiveis:3,anuladas:[],paginas_originais:3,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
