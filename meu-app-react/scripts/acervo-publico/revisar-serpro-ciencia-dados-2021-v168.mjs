import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='12d0c488fd7e6319'
const prova='https://cdn.cebraspe.org.br/concursos/serpro_21/arquivos/MATRIZ__CARGO_1.PDF'
const gabaritoBasico='https://cdn.cebraspe.org.br/concursos/serpro_21/arquivos/GAB_DEFINITIVO_MATRIZ_589_SERPRO_CB1_00_PAG_3.PDF'
const gabaritoEspecifico='https://cdn.cebraspe.org.br/concursos/serpro_21/arquivos/GAB_DEFINITIVO_MATRIZ_589_SERPRO_001_00_PAG_4.PDF'
const start=raizesAtuais.findIndex(r=>r.includes('revisao-pf-fisica-forense-2025-v167'))
if(start<0)throw Error('Base v167 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==119)throw Error('Catálogo do SERPRO Cargo 1 divergente')
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.concurso==='SERPRO 2021'&&l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==119)throw Error(`Esperados 119 registros do SERPRO Cargo 1, encontrados ${active.size}`)
const pages=new Map(catalog.questoes.map(q=>[q.id,q.pagina]))
const support={
 portuguese:'Texto CB1A1-I (Yuk Hui, Tecnodiversidade, 2020): o autor propõe uma ecologia das máquinas baseada em tecnodiversidade e localidade; compara seus efeitos à biodiversidade, menciona pesticidas como solução universal e discute os impactos da modernização e da globalização. O texto integral e sua continuação estão preservados nas páginas originais vinculadas.',
 english:'Texto em inglês sobre a contradição da sociedade conectada durante a pandemia, a politização da tecnologia, o debate ético, modelos de negócio baseados em dados e publicidade, a influência da arquitetura digital e o potencial da tecnologia para reduzir injustiças. O texto integral está na página original vinculada.',
 cpfs:'Situação hipotética: são gerados cinco números de CPF válidos para cinco indivíduos distintos; em seguida, escolhem-se aleatoriamente dois CPFs e separam-se três indivíduos. Para o item 35, a e b são últimos dígitos de dois CPFs e são ímpares consecutivos.',
 optimization:'Um parâmetro β será estimado recursivamente por método de otimização matemática, com base em uma função objetivo g(β) e em uma base de treinamento com n observações.',
 binomial:'O número X de erros registrados em determinado tipo de código computacional segue distribuição binomial com média 4 e variância 3.',
 project:'Situação hipotética: I — aplicação de modelo baseado em Six Sigma às etapas de mineração de dados; II — processo Sequenciar Atividades no cronograma, com base no PMBOK; III — abordagem ágil para criação de backlog do projeto.',
 model108:'Consulte o modelo entidade-relacionamento reproduzido na página original: as relações numeradas #1, #2 e #3 ligam EMPREGADO, DEPARTAMENTO e PARTICIPAÇÃO. A imagem é necessária para interpretar os itens 108 e 109.',
 model110:'Consulte o diagrama relacional e as tabelas reproduzidos na página original, com a tabela fato FATO_FREQUÊNCIA e suas dimensões; o esquema visual é necessário para interpretar os itens 110 e 111.',
 governance:'Situação hipotética: I — identificar data stewards como parte da governança e do planejamento da gestão de dados; II — implementar gestão da qualidade de dados e arquitetura de dados; III — gerir fatores ambientais, como pessoas e tecnologias, afetos à governança de dados.'
}
const contentFor=n=>{
 if(n<=6)return 'Interpretação e compreensão do texto: tecnodiversidade, ecologia das máquinas e biodiversidade.'
 if(n===7)return 'Semântica e valor modal do verbo “gostaria”.'
 if(n===8)return 'Crase: regência e emprego do acento grave.'
 if(n===9)return 'Morfossintaxe: classe e função do advérbio “primeiro”.'
 if(n===10)return 'Conjunções e orações subordinadas adverbiais de finalidade.'
 if(n===11)return 'Coesão referencial e oração adjetiva restritiva.'
 if(n===12||n===15)return 'Coesão textual e referência pronominal.'
 if(n===13)return 'Semântica lexical: relações de sentido.'
 if(n===14||n===17||n===19)return 'Reescrita, conectores e coerência textual.'
 if(n===16)return 'Pontuação e alteração de sentido.'
 if(n===18)return 'Voz verbal e construção com “se”.'
 if(n===20)return 'Concordância verbal e identificação do sujeito.'
 if(n>=21&&n<=25)return 'Leitura em língua inglesa: compreensão global, conectores, paráfrase, vocabulário e inferência.'
 if(n>=26&&n<=30)return 'Estatuto Social do SERPRO: competências, receitas, governança societária e cargos de gestão.'
 if(n===31||n===32)return 'Lógica proposicional e negação de proposições categóricas.'
 if(n===33||n===34)return 'Análise combinatória e probabilidade.'
 if(n===35)return 'Teoria dos números: paridade e divisibilidade.'
 if(n>=36&&n<=40)return 'LGPD: conceitos, princípios, bases legais, consentimento e governança da privacidade.'
 if(n>=41&&n<=44)return 'Lei de Acesso à Informação: direito de acesso, classificação de sigilo, prazos e responsabilização.'
 if(n>=45&&n<=50)return 'LGPD e LAI: pesquisa, dados pessoais, sanções, sigilo e legítimo interesse.'
 if(n>=51&&n<=53)return 'Aprendizado de máquina: árvores de decisão, Naive Bayes, SVM e normalização de atributos.'
 if(n>=54&&n<=56)return 'Aprendizado de máquina e estatística: agrupamento hierárquico, máquina de Boltzmann e multicolinearidade.'
 if(n>=57&&n<=59)return 'Estatística: dados ausentes e mecanismos MCAR, MAR e MNAR.'
 if(n>=60&&n<=63)return 'Otimização matemática: gradiente em lote, Newton-Raphson, convexidade e gradiente estocástico.'
 if(n>=64&&n<=65)return 'Linguagem Python: tuplas, listas, mutabilidade e estruturas aninhadas.'
 if(n>=66&&n<=67)return 'Linguagem Java: compilação, bytecode, polimorfismo e sobrescrita.'
 if(n>=68&&n<=69)return 'Frameworks e ecossistema de dados: TensorFlow e PySpark.'
 if(n>=70&&n<=74)return 'Probabilidade e estatística: distribuição binomial, média, variância, padronização e coeficiente de variação.'
 if(n>=75&&n<=77)return 'Gestão de projetos de ciência de dados: backlog ágil, CRISP-DM, PMBOK e diagrama de precedência.'
 if(n>=78&&n<=79)return 'Big data: volume, variedade, velocidade e características dos dados.'
 if(n>=80&&n<=83)return 'Apache Hadoop: HDFS, modos de execução, Sqoop e Hive.'
 if(n>=84&&n<=86)return 'Bancos NoSQL: Cypher/Neo4j, MongoDB, HBase e compactação.'
 if(n>=87&&n<=88)return 'Sistemas distribuídos e indexação: HDFS e clusters Elasticsearch.'
 if(n>=89&&n<=93)return 'Ingestão de dados: CDC, processamento em lote, dados estruturados, não estruturados e streaming.'
 if(n>=94&&n<=96)return 'Processamento de dados: MapReduce, processamento em lote e fluxo em tempo real.'
 if(n>=97&&n<=99)return 'Big data e Hadoop: arquitetura, custos, distribuições e suporte comercial.'
 if(n>=100&&n<=102)return 'Business intelligence: dashboards, indicadores e camadas de monitoramento, análise e gestão.'
 if(n>=103&&n<=107)return 'Gestão e qualidade de dados: ciclo de vida, acurácia, unicidade, profiling, regras de negócio e consistência.'
 if(n>=108&&n<=109)return 'Modelagem de dados: transformação do modelo entidade-relacionamento para o modelo relacional, especialização e cardinalidade.'
 if(n>=110&&n<=111)return 'Modelagem dimensional: tabela fato, dimensões, chaves e aditividade de métricas.'
 if(n>=112&&n<=117)return 'Master Data Management: golden record, identificadores, metadados, matching, arquitetura e governança de dados.'
 return 'Governança de dados: data stewards, gestão da qualidade, arquitetura e fatores organizacionais conforme o DMBOK.'
}
const groupFor=n=>n<=20?'Língua Portuguesa':n<=25?'Língua Inglesa':n<=30?'Legislação Institucional':n<=35?'Raciocínio Lógico e Matemática':n<=50?'Legislação e Proteção de Dados':n>=51&&n<=56?'Aprendizado de Máquina':n>=57&&n<=63?'Estatística':n>=64&&n<=67?'Programação':n>=68&&n<=69?'Frameworks de Ciência de Dados':n>=70&&n<=74?'Estatística':n>=75&&n<=77?'Gerenciamento de Projetos':n>=78&&n<=83?'Big Data':n>=84&&n<=86?'Banco de Dados':n>=87&&n<=88?'Sistemas Distribuídos':n>=89&&n<=93?'Engenharia de Dados':n>=94&&n<=96?'Processamento de Dados':n>=97&&n<=99?'Big Data':n>=100&&n<=102?'Business Intelligence':n>=103&&n<=107?'Qualidade de Dados':n>=108&&n<=111?'Modelagem de Dados':n>=112&&n<=117?'Gestão de Dados':'Governança de Dados'
const contextFor=n=>n<=20?support.portuguese:n<=25?support.english:n>=33&&n<=35?support.cpfs:n>=57&&n<=59?'Dados ausentes podem ocorrer no preenchimento de formulários. A taxonomia estatística distingue MCAR (missing completely at random), MAR (missing at random) e MNAR (missing not at random).':n>=60&&n<=63?support.optimization:n>=70&&n<=74?support.binomial:n>=75&&n<=77?support.project:n>=108&&n<=109?support.model108:n>=110&&n<=111?support.model110:n>=118?support.governance:''
const markers=['\nCEBRASPE – SERPRO','\nCEBRASPE - SERPRO','\nLíngua Inglesa','\nEstatuto Social do SERPRO','\nRaciocínio Lógico','\nLegislação acerca de privacidade','\nDe acordo com a Lei n.º 12.527','\nAcerca de privacidade e proteção','\n-- CONHECIMENTOS ESPECÍFICOS --','\nSobre as técnicas de classificação','\nNo que se refere a técnicas de regressão','\nDados ausentes são muito comuns','\nDeterminado parâmetro β','\nA respeito da linguagem de programação Python','\nSobre a linguagem de programação JAVA','\nA respeito de frameworks','\nConsiderando que o número X','\nEm uma organização, foram elencadas','\nCom relação aos fundamentos do big data','\nConsiderando o projeto Apache Hadoop','\nA respeito de conceitos de NoSQL','\nCom relação a conceitos de sistemas de arquivos','\nAcerca dos conceitos de ingestão','\nJulgue os itens subsequentes relativos a conceitos de ingestão','\nSobre processamento de dados','\nJulgue os próximos itens, relativos à tecnologia de big data','\nAcerca de dashboards','\nJulgue os próximos itens, relativos à qualidade de dados','\nCada uma das próximas assertivas','\nInternet: <','\nTendo como referência inicial esse modelo','\nJulgue os itens seguintes, referentes a conceitos e especificidades','\nJulgue os próximos itens, relativos à governança','\nEspaço livre']
const cleanStem=(n,raw)=>{
 let s=String(raw||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim()
 for(const m of markers){const i=s.indexOf(m.replace(/^\n/,''));if(i>25)s=s.slice(0,i).trim()}
 if(n===64)s=s.replace(/ - /g,'-')
 return s
}
const imgsContext=(n,page)=>{
 if(n>=15&&n<=20&&page!==2)return [{pagina:2,imagem:`paginas/${doc}-0002.webp`,texto:'Texto-base CB1A1-I — continuação na página 2 do caderno.'}]
 return []
}
const removable=['classificacao_especifica_pendente','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']
const decisions=[...active.values()].map(q=>{
 const n=Number(q.numero_original),pg=pages.get(q.id),stem=cleanStem(n,q.enunciado)
 if(n<1||n>120||!pg||stem.length<25||/�|\ufffd|\/g\d+/.test(stem))throw Error(`Item ${n} sem enunciado íntegro/página`)
 const apoio=contextFor(n)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:groupFor(n),conteudo:contentFor(n),ano:2021,concurso:'SERPRO — Edital 2021, Cargo 1: Analista — Especialização em Ciência de Dados; prova aplicada em 06/06/2021',numero_original:n,pagina:pg,dificuldade:[14,21,33,34,51,53,54,56,60,61,62,63,70,71,73,74,76,77,80,84,86,87,89,90,94,100,102,104,108,109,110,111,114,116,117,119,120].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo domínio conceitual, linguístico, estatístico ou técnico; a banca não publicou níveis oficiais de dificuldade.',enunciado:stem,classificacao_fonte:prova,motivo:`Matéria e tópico individualizados a partir do comando e do bloco temático no caderno oficial do Cargo 1; item ${n}, página ${pg}.`,visual:{pagina:pg,imagem:`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`,texto_apoio:apoio,motivo:'Página original conferida no caderno oficial e associada para manter o contexto, texto-base, diagrama ou esquema necessário.'},...(apoio&&n>=15&&n<=20?{imagens_contexto:imgsContext(n,pg)}:{}),apta_resolucao:true,remover_pendencias:removable}
})
const present=new Set(decisions.map(x=>x.numero_original)),missing=[...Array(120)].map((_,i)=>i+1).filter(n=>!present.has(n))
if(decisions.length!==119||missing.join(',')!=='73')throw Error(`Cobertura anormal do caderno: registros=${decisions.length}, ausentes=${missing}`)
const add73={id:'extr-serpro21-c1-073',ano:2021,numero_original:73,banca:'CEBRASPE',concurso:'SERPRO — Edital 2021, Cargo 1: Analista — Especialização em Ciência de Dados; prova aplicada em 06/06/2021',materia:'Estatística',conteudo:contentFor(73),enunciado:'P(X = 0) = 3/4.',opcoes:['Certo','Errado'],resposta_correta:1,anulada:false,pagina:6,documento_id:doc,paginas_origem:[6],imagens_paginas:[`paginas/${doc}-0006.webp`],pagina_imagem:`paginas/${doc}-0006.webp`,texto_apoio:support.binomial,fonte:prova,origem:'CEBRASPE — SERPRO 2021',documento_origem:'MATRIZ__CARGO_1.PDF',tipo_documento:'Prova objetiva — Cargo 1 — Conhecimentos específicos',tipo_extraido:'certo_errado',status_revisao:'revisado',motivos_revisao:[],classificacao_confianca:0.95,classificacao_metodo:'Recuperação da página original e validação matemática: pela média 4 e variância 3 da binomial, p=1/4 e n=16; portanto P(X=0)=(3/4)^16, não 3/4.',tipo_resposta:'certo_errado',contexto_paginas:[{pagina:6,imagem:`paginas/${doc}-0006.webp`,texto:support.binomial}],classificacao_pendente:false,classificacao_revisada:true,banca_original:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Analista — Ciência de Dados',integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:false,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:false,apontamentos:[]}}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros_existentes:decisions.length,pendentesAntes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length,itens_ausentes:missing,itens_adicionados:1,cobertura_final:120,disciplinas:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(m=>[m,decisions.filter(d=>d.materia===m).length+(m==='Estatística'?1:0)])),enunciados_corrigidos:decisions.filter(d=>d.enunciado!==active.get(d.id).enunciado).map(d=>d.numero_original)},null,2));process.exit(0)}
const name='revisao-serpro-ciencia-dados-2021-v168'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions,adicoes:[add73]})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,prova,gabarito_basico:gabaritoBasico,gabarito_especifico:gabaritoEspecifico,registros_existentes_revistos:119,adicionada:73,itens_caderno_completos:120,paginas_originais:8,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
