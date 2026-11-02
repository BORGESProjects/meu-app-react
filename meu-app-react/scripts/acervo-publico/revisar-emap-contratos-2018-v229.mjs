import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-emap-contratos-2018-v229',doc='1aed38f29cffe74a'
const prova='https://cdn.cebraspe.org.br/concursos/EMAP_18/arquivos/402_EMAP004.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/EMAP_18/arquivos/GAB_DEFINITIVO_402_EMAP004__PAG_4.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/EMAP_18/arquivos/EMAP_18_JUSTIFICATIVAS_DE_ALTERA____ES_DE_GABARITO.PDF'
const concurso='EMAP 2018 — Cargo 4: Analista Portuário II, área de Contratos'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='402_EMAP004.PDF'||catalog.questoes.length!==70)throw Error('Inventário oficial divergente: eram esperados 70 itens, 51–120')
const prev=raizesAtuais.findIndex(x=>x.includes('revisao-ebserh-enfermagem-cardiologia-2018-v228'))
if(prev<0)throw Error('Base anterior v228 não encontrada')
const bases=raizesAtuais.slice(prev),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),want=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(want.has(q.id)){byId.set(q.id,q);want.delete(q.id)}
 if(!want.size)break
}
if(want.size)throw Error(`Registros ausentes da prova: ${want.size}`)

const topics={
51:'Licitação: princípios e critérios objetivos de julgamento',52:'Licitação: finalidade e seleção da proposta mais vantajosa',53:'Licitação: isonomia e tratamento diferenciado previsto em lei',54:'Licitação: vinculação ao instrumento convocatório',55:'Licitação: restrições à competição e requisitos de habilitação',56:'Licitação: parcelamento do objeto e competitividade',
57:'Pregão: prazo mínimo para apresentação de propostas',58:'Pregão: critérios de julgamento e classificação',59:'Pregão: requisitos e vínculo do pregoeiro',60:'Pregão: propostas válidas e etapa competitiva',61:'Pregão: negociação após a etapa de lances',62:'Pregão: convocação de licitantes remanescentes',
63:'Sistema de registro de preços: hipótese de uso e demanda variável',64:'Sistema de registro de preços: intenção de registro e inclusão de itens',65:'Sistema de registro de preços: adesão entre entes federativos',66:'Sistema de registro de preços: participação e adesão à ata',
67:'Regime Diferenciado de Contratações: hipóteses de aplicação',68:'RDC: regimes de execução de obras e serviços de engenharia',69:'RDC: contratação integrada e escopo do objeto',70:'RDC: sequência das fases do procedimento',71:'RDC: prazos mínimos para apresentação de propostas',
72:'Transferência de recursos federais: contrato de repasse e agente mandatário',73:'Convênios: entidades privadas com fins lucrativos',74:'Convênios: valor mínimo de repasse para obras de engenharia',
75:'Execução contratual: reajuste, correção monetária e interregno anual',76:'Execução contratual: prorrogação por atraso escusável e limites de acréscimo',77:'Execução contratual: reequilíbrio econômico-financeiro e item anulado',78:'Fiscalização contratual: registro de ocorrências pelo fiscal',
79:'Equilíbrio econômico-financeiro: aumento extraordinário de insumos e quantitativos',80:'Reajuste e repactuação: marco temporal e data-base do orçamento',81:'Reequilíbrio contratual: dissídio coletivo e fato imprevisível',82:'Responsabilidade por obra: vícios identificados após recebimento definitivo',83:'Duração contratual: crédito orçamentário, PPA e cronograma da obra',84:'Execução contratual: subcontratação parcial e previsão no edital',
85:'Formalização contratual: instrumentos substitutivos e obrigação de contratar',86:'Fiscalização contratual: representante da administração e apoio de terceiros',87:'Aditivos: manutenção do desconto global da proposta vencedora',88:'Alterações contratuais: cálculo de limites e compensação entre acréscimos e supressões',89:'Contrato por escopo: prazo de vigência e necessidade de prorrogação',90:'Prorrogação contratual: aditivo assinado após o término da vigência',
91:'Sanções administrativas: desconsideração da personalidade jurídica e inidoneidade',92:'Sanções administrativas: alcance da suspensão de licitar e contratar',93:'Rescisão contratual: culpa da administração e iniciativa do contratado',94:'Licitação: adjudicação compulsória e celebração do contrato',
95:'Responsabilidade trabalhista: contratos de obra e empreitada pública',96:'Responsabilidade subsidiária: fiscalização e culpa da administração',97:'Responsabilidade subsidiária: parcelas alcançadas pela condenação',
98:'Lei das Estatais: dispensa de licitação e limites para obras',99:'Lei das Estatais: contratação de serviços advocatícios',100:'Lei das Estatais: conflito de interesses e impedimento de licitante',101:'Lei das Estatais: alteração do procedimento e divulgação das mudanças',102:'Lei das Estatais: dispensa de licitação para capacitação de empregados',
103:'Lei das Estatais: regimes de execução e empreitada por preço unitário',104:'Lei das Estatais: participação do autor do projeto na licitação',105:'Lei das Estatais: especificação de marca e justificativa técnica',106:'Lei das Estatais: publicidade de aquisições, preços e fornecedores',
107:'Lei das Estatais: cláusulas obrigatórias e atualização monetária',108:'Lei das Estatais: garantia contratual e modalidades',109:'Lei das Estatais: transparência e acesso aos contratos públicos',110:'Lei das Estatais: alteração contratual por mudança tributária',
111:'Lei dos Portos: tarifas e cláusulas de concessão e arrendamento',112:'Lei dos Portos: critérios de julgamento para concessão e arrendamento',113:'Lei dos Portos: prazo de contratos de adesão e prorrogação',114:'Lei dos Portos: autorização de instalação portuária de turismo',115:'Lei dos Portos: requerimento e anúncio público de autorização',
116:'Administração portuária: plano de desenvolvimento e zoneamento',117:'Administração portuária: dimensões e porte bruto de embarcações',118:'Administração portuária: exploração de áreas não operacionais',119:'Administração portuária: competência aduaneira e arrecadação tributária',120:'Administração portuária: fiscalização de obras e competência da ANTAQ'
}
const easy=new Set([52,54,57,58,63,66,67,69,72,74,78,86,91,94,103,104,106,109,112,114,117,119])
const hard=new Set([60,64,65,68,70,71,76,77,79,80,81,82,83,84,87,88,89,90,92,93,96,98,99,100,101,102,105,107,108,110,113,115,116,118,120])

// Os gabaritos 51–110 já estavam associados a esta fonte oficial. O CEBRASPE
// anulou o item 77; os dez itens finais foram transcritos do quadro definitivo.
const keys=new Map()
for(const e of catalog.questoes){
 const q=byId.get(e.id),n=e.numero
 if(!q||n<51||n>120||!topics[n])throw Error(`Item sem classificação: ${n}`)
 if(n<=110){
  if(!q.gabarito_oficial?.fonte?.includes('GAB_DEFINITIVO_402_EMAP004'))throw Error(`Fonte oficial ausente no item ${n}`)
  if(n===67){
   // O registro antigo foi marcado anulada por erro de extração; a justificativa
   // oficial anula somente o item 77 e a chave oficial do item 67 é E.
   keys.set(n,'E')
  }else{
   if(![0,1].includes(q.resposta_correta))throw Error(`Resposta existente não binária no item ${n}`)
   keys.set(n,n===77?'X':q.resposta_correta===0?'C':'E')
  }
 }
}
const lastTen=['E','C','E','C','C','E','C','E','C','E']
for(let i=0;i<10;i++)keys.set(111+i,lastTen[i])
if(keys.size!==70||keys.get(77)!=='X')throw Error('Sequência definitiva do gabarito incompleta ou item 77 sem anulação')
const keyHash=hashRevisao(Array.from({length:70},(_,i)=>keys.get(51+i)).join(','))

const scenario79Source=byId.get(catalog.questoes.find(e=>e.numero===79).id).texto_apoio
const scenario79Start=scenario79Source.indexOf('Mediante licitação pública, firmou-se contrato')
const scenario79End=scenario79Source.indexOf('A partir dessa situação hipotética, julgue os itens que se seguem.',scenario79Start)
if(scenario79Start<0||scenario79End<0)throw Error('Contexto comum dos itens 79–84 não pôde ser isolado')
const scenario79=scenario79Source.slice(scenario79Start,scenario79End+'A partir dessa situação hipotética, julgue os itens que se seguem.'.length).trim()
const scenario85Source=byId.get(catalog.questoes.find(e=>e.numero===85).id).texto_apoio
const scenario85Start=scenario85Source.indexOf('A administração contratou, mediante licitação pública')
const scenario85EndMatch=/Com referência a essa situação hipotética,\s*julgue os itens\s*subsecutivos\./.exec(scenario85Source.slice(scenario85Start))
if(scenario85Start<0||!scenario85EndMatch)throw Error('Contexto comum dos itens 85–90 não pôde ser isolado')
const scenario85=scenario85Source.slice(scenario85Start,scenario85Start+scenario85EndMatch.index+scenario85EndMatch[0].length).trim()

const contexts={
 licitacao:'A respeito de finalidades e princípios norteadores da licitação, julgue os itens a seguir.',
 pregao:'Com base nas disposições da Lei n.º 10.520/2002, julgue os próximos itens, relativos a pregão.',
 registro:'Acerca do sistema de registro de preços, julgue os itens que se seguem, com fundamento nas disposições do Decreto n.º 7.892/2013.',
 rdc:'À luz da Lei n.º 12.462/2011 — Regime Diferenciado de Contratações Públicas (RDC) —, julgue os itens subsequentes.',
 transferencia:'Acerca das normas que regulam a transferência de recursos da União, julgue os itens a seguir.',
 fase:'Concluída a fase licitatória, com a seleção da melhor proposta para a administração, tem início a etapa de contratação, que se inicia com a assinatura do contrato e se encerra com o termo de recebimento definitivo do objeto. Em relação às atividades inerentes à fase contratual, julgue os itens subsequentes.',
 contratos:'Julgue os itens seguintes, relativos a contratos administrativos.',
 trabalhista:'Acerca da responsabilidade previdenciária e trabalhista nos contratos administrativos, julgue os itens que se seguem.',
 estatais:'À luz do previsto na Lei n.º 13.303/2016, julgue os itens seguintes, a respeito de licitações e contratos.',
 estataisAquisi:'Julgue os itens subsequentes, quanto às normas específicas para a contratação de obras e serviços e aquisição de bens contidas na Lei n.º 13.303/2016.',
 formalizacao:'Com base nas disposições da Lei n.º 13.303/2016, julgue os itens subsequentes, a respeito da formalização e da alteração de contratos.',
 portos:'A respeito da exploração de portos e instalações portuárias, julgue os itens seguintes, de acordo com disposições da Lei n.º 12.815/2013.',
 administracaoPortuaria:'Julgue os itens subsequentes, acerca das competências administrativas de porto organizado, de acordo com a legislação específica.'
}
function contextFor(n){
 if(n<=56)return contexts.licitacao
 if(n<=62)return contexts.pregao
 if(n<=66)return contexts.registro
 if(n<=71)return contexts.rdc
 if(n<=74)return contexts.transferencia
 if(n<=78)return contexts.fase
 if(n<=84)return scenario79
 if(n<=90)return scenario85
 if(n<=94)return contexts.contratos
 if(n<=97)return contexts.trabalhista
 if(n<=102)return contexts.estatais
 if(n<=106)return contexts.estataisAquisi
 if(n<=110)return contexts.formalizacao
 if(n<=115)return contexts.portos
 return contexts.administracaoPortuaria
}

const decisions=[]
for(const e of catalog.questoes){
 const q=byId.get(e.id),n=e.numero,answer=keys.get(n),img=`paginas/${doc}-${String(e.pagina).padStart(4,'0')}.webp`
 if(await fs.access(`public/acervo-extraido/${img}`).then(()=>false,()=>true))throw Error(`Imagem da página ${e.pagina} ausente para o item ${n}`)
 if(q.pagina!==e.pagina)throw Error(`Página de origem divergente no item ${n}`)
 const anulada=answer==='X',materia=n>=111?'Legislação Portuária':'Direito Administrativo'
 decisions.push({id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo:topics[n],ano:2018,concurso,numero_original:n,pagina:e.pagina,
  dificuldade:easy.has(n)?'Fácil':hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial conforme a operação exigida: reconhecer regra jurídica, aplicar norma ou resolver situação contratual composta; a banca não publica parâmetro psicométrico individual.',
  resposta_correta:anulada?null:answer==='C'?0:1,anulada,
  texto_apoio:contextFor(n),pagina_imagem:img,
  gabarito_oficial:{valor:answer,fonte:gabarito,arquivo:'GAB_DEFINITIVO_402_EMAP004__PAG_4.PDF',prova,numero:n,pagina:1,sha256:keyHash,hash_metodo:'SHA-256 da sequência definitiva C/E/X dos itens 51–120 do Cargo 4; os itens 51–110 preservam as chaves já associadas à fonte e os itens 111–120 foram transcritos do quadro oficial.',criterio:anulada?'Gabarito definitivo: item anulado conforme justificativa oficial.':'Gabarito oficial definitivo do Cargo 4 — Analista Portuário II, área de Contratos.'},
  classificacao_fonte:{documento:catalog.arquivo,prova,gabarito,metodo:'Enunciado, comando e contexto conferidos no caderno oficial; chave final cotejada com o gabarito definitivo do Cargo 4.'},
  visual:{pagina:e.pagina,imagem:img,texto_apoio:contextFor(n),motivo:`Página original ${e.pagina} conferida e vinculada para o item ${n}; esta prova não utiliza gráfico ou figura indispensável fora do caderno textual.`},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],apta_resolucao:true,
  motivo:`Revisão v229: matéria, assunto, ano, cargo, contexto compartilhado e chave definitiva conferidos individualmente.${anulada?' Item 77 corrigido para anulado conforme justificativa oficial.':''}`})
}
if(decisions.length!==70)throw Error(`Esperadas 70 revisões, obtidas ${decisions.length}`)
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[prev],decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,concurso,itens_revisados:70,novas_classificacoes:report.novas_classificacoes,chaves_definitivas:70,item_anulado:77,contextos_reconstruidos:70,imagens_de_pagina_validas:4,paginas_originais:[1,2,3,4],publicado:false},null,2))
