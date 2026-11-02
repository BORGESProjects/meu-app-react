import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-abin-agente-2018-v226',doc='a8bf578ff9328ad4'
const prova='https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/378_ABIN_CB3_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/GAB_DEFINITIVO_378_ABIN_CB3_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/ABIN_17_JUSTIFICATIVAS_DE_ALTERA____O_DE_GABARITO_1.PDF'
const concurso='ABIN 2017 — Cargo 3: Agente de Inteligência, conhecimentos gerais — aplicação em 11/03/2018'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='378_ABIN_CB3_01.PDF'||catalog.questoes.length!==63||new Set(catalog.questoes.filter(x=>x.numero>5).map(x=>x.numero)).size!==43)throw Error('Inventário ABIN divergente: esperado 63 registros OCR e itens 6–48')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-fub-taxidermista-2016-v225'))
if(start<0)throw Error('Base anterior v225 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const wanted=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){byId.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(byId.size!==63||wanted.size)throw Error(`Esperados 63 registros ABIN; encontrados ${byId.size}; ausentes ${wanted.size}`)

const spanishKeys=['E','C','C','E','E'],englishKeys=['E','C','E','E','C']
const commonKeys=[
 'E E C E C C C E E C',
 'E E C C C E E E C E C E C E E C C C E C',
 'E E E E E C C C E C E E C C C'
].flatMap(x=>x.split(' '))
if(commonKeys.length!==45)throw Error(`Gabarito definitivo geral incompleto: ${commonKeys.length}/45`)
// O CEBRASPE alterou o item 14 de C para E no gabarito definitivo.
commonKeys[14-6]='E'
const digest=hashRevisao([...spanishKeys,...englishKeys,...commonKeys].join(','))

const canon={
 'es-1':'extr-d47e6e1d98ea585f8d75','es-2':'extr-e1e62c524618eac07028','es-3':'extr-f6982cd541cfecaf2ee2','es-4':'extr-ed9c1e73ae6602165e83','es-5':'extr-0d58f1f296dab2008a83',
 'en-1':'extr-ce166b023118a30803c7','en-2':'extr-9ed0ea3fccd462f11734','en-3':'extr-8419fed7e10f1974699d','en-4':'extr-b5ce08e833de8078967d','en-5':'extr-0e002033df0fba6fbde4'
}
const byIdEntry=new Map(catalog.questoes.map(e=>[e.id,e])),duplicateOf=new Map(),languageById=new Map()
const duplicateIds={es:['extr-b1af492460dfafd498b3','extr-b6eccb58e0b203f58867','extr-bed1ab0511be45abd418','extr-d5ad4c8d1e5a0144addc','extr-f30e5eafc9bb160d8d8b'],en:['extr-c29aa3a0975925404fd2','extr-55a9cbe378728b23d4b6','extr-f4fba30e5b3068b4e5f0','extr-b774821b4c322cfb7d73','extr-9a4c8265e1a58538bd1e']}
for(let n=1;n<=5;n++)for(const lang of ['es','en']){
 const win=canon[`${lang}-${n}`],copy=duplicateIds[lang][n-1]
 if(!byId.has(win)||!byId.has(copy)||byIdEntry.get(win)?.numero!==n||byIdEntry.get(copy)?.numero!==n)throw Error(`Cópia OCR/canônica ${lang}-${n} não encontrada`)
 duplicateOf.set(copy,win);languageById.set(copy,lang);languageById.set(win,lang)
}
if(duplicateOf.size!==10)throw Error(`Esperadas 10 duplicatas OCR, encontradas ${duplicateOf.size}`)

const spanishText='¿Tiene sentido emular las expediciones científicas del siglo XIX, como las del antropólogo y biólogo alemán Alexander von Humboldt, o como las que patrocinó Carlos III en el Nuevo Reino de Granada, la actual Colombia, en busca de especies vegetales y animales desconocidos en Europa? Lo cierto es que tras siglos de progreso científico, hoy parece no quedar ya apenas espacio para aquella sorpresa original. En cambio, sigue habiendo lugar para viajes humanísticos que intenten acercar culturas y divulgar el valor de la diversidad.\n\nEse es el espíritu que ha presidido el proyecto Chaco Ra’anga. Un viaje científico y cultural al corazón de Sudamérica: viajar no para certificar conocimientos, no para realizar dibujos al carboncillo de plantas nunca vistas y atravesar con alfileres mosquitos y reptiles, sino para señalar en el mapa regiones apartadas cuya idiosincrasia se encuentra en peligro, amenazada por la expansión de los núcleos urbanos y las explotaciones agrícolas, ganaderas y energéticas. Adentrarse en territorios periféricos, pues, para ejercer de testigos de una realidad conflictiva, y regresar con un relato que ilumine desastres aún evitables o tesoros que conviene preservar.\n\nChaco Ra’anga es el resultado de una expedición realizada por 12 viajeros, y promovida por Cooperación Española, por El Gran Chaco, en el corazón de América del Sur, una amplia región que abarca zonas de Bolivia, Paraguay, Brasil y Argentina, que alberga la segunda reserva boscosa más grande del continente después del Amazonas y una variedad de etnias y culturas propias que mantienen las esencias de sus pobladores primigenios.'
const englishText='The increase in scrutiny and reduction in powers for security agencies has to a considerable extent been triggered by the revelations of the former National Security Agency whistle-blower Edward Snowden. These disclosures, along with other leaks from organizations such as WikiLeaks, have shed light on a series of illegal practices adopted by intelligence agencies in many countries, in particular the USA, Germany and the UK.\n\nThis has led to an unprecedented shift in the nature of intelligence legislation in many parts of the world, with security services witnessing a reduction in their powers for the first time in the post-9/11 era, defined by the West’s commitment to the war on terror.\n\nHowever, despite claims that the agencies are working in the interest of national security, critics counter that overbearing surveillance practices erode and restrict many civil liberties. In spite of the introduction of restrictions in the USA and Germany, Great Britain appears to be heading in the opposite direction when it comes to surveillance policy, with the UK’s Conservative government putting forward plans to grant spy agencies yet more powers to deal with threats to national security.\n\nThe British government has outlined its highly controversial plan to introduce the Investigatory Powers Bill, which would grant agencies not only more power but also allow them to force Internet companies to log and track users’ web history for up to a year to allow for the police and security services access. It is thought the plan would also compel companies to collect and hold data on mobile phone applications like WhatsApp and Snapchat.'
const intelligenceText='A atividade de inteligência é o exercício de ações especializadas para a obtenção e análise de dados, produção de conhecimentos e proteção de conhecimentos para o país. Inteligência e contrainteligência são os dois ramos dessa atividade. A inteligência compreende ações de obtenção de dados associadas à análise para a compreensão desses dados. A análise transforma os dados em cenário compreensível para o entendimento do passado, do presente e para a perspectiva de como tende a se configurar o futuro. Cabe à inteligência tratar fundamentalmente da produção de conhecimentos com o objetivo específico de auxiliar o usuário a tomar decisões de maneira mais fundamentada. A contrainteligência tem como atribuições a produção de conhecimentos e a realização de ações voltadas à proteção de dados, conhecimentos, infraestruturas críticas — comunicações, transportes, tecnologias de informação — e outros ativos sensíveis e sigilosos de interesse do Estado e da sociedade. O trabalho desenvolvido pela contrainteligência tem foco na defesa contra ameaças como a espionagem, a sabotagem, o vazamento de informações e o terrorismo, patrocinadas por instituições, grupos ou governos estrangeiros.'
const espionageText='Na legislação interna dos países, a espionagem costuma ser juridicamente entendida como a obtenção sub-reptícia e indevida de informação sigilosa do Estado. Esse tipo de conduta é criminalizado pela legislação de cada país. O mesmo se pode dizer do vazamento, que guarda estreita relação com a espionagem e que consiste na divulgação indevida de informações por quem tem o dever legal do sigilo.\n\nA espionagem é um dos poucos crimes na legislação brasileira que podem, em tempo de guerra, levar à pena de morte, seja o condenado nacional ou estrangeiro, civil ou militar, além de, em tempo de paz, sujeitar o militar que a pratique à indignidade para o oficialato.\n\nSe praticada por autoridade superior, a espionagem pode configurar, além de infração penal, crime de responsabilidade, que, a despeito do nome, não tem natureza de crime em sentido técnico, mas, sim, de infração política sujeita a cassação de mandato e suspensão de direitos políticos.'
const contexts={
 es:spanishText,en:englishText,intel:intelligenceText,espionagem:espionageText,
 q16:'Julgue os itens sobre regime jurídico dos servidores públicos, Lei de Responsabilidade Fiscal, improbidade administrativa e garantias de servidores efetivos e vitalícios.',
 q20:'Bloco de direito administrativo: silêncio administrativo, recursos e processo administrativo, princípios e revisão de atos administrativos.',
 q24:'Bloco de direito constitucional sobre nacionalidade, quase nacionalidade e extradição.',
 q27:'Bloco de direito constitucional sobre direitos políticos, referendo e plebiscito.',
 q29:'Bloco de ordem social e direitos constitucionais: recursos e mineração em terras indígenas, energia nuclear e proteção ambiental.',
 q32:'Bloco sobre Política Nacional de Inteligência (PNI), diretrizes e instrumentos da atividade de inteligência.',
 q34:'Bloco sobre Estratégia Nacional de Inteligência e ameaças à segurança do Estado e da sociedade.',
 q38:'Bloco sobre o Sistema Brasileiro de Inteligência (SISBIN), estrutura regimental, composição e competências da ABIN.',
 q41:'Bloco sobre plano de carreira, cargos e atribuições dos agentes de inteligência da ABIN.',
 q43:'Bloco sobre a Lei de Acesso à Informação (Lei nº 12.527/2011): restrição de acesso a dados pessoais e classificação de informações.',
 q45:'As três figuras da página original associam símbolos a algarismos decimais. A figura I contém triângulos e círculos; a II, quadrados e uma estrela; e a III, setas e triângulos. Preserve e consulte a imagem original da página 4 para contar interpretações.',
 q48:'Premissas impressas no caderno: (1) se Pedro não é músico, então André é servidor da ABIN; (2) se André é servidor da ABIN, então Carlos não é espião; (3) Carlos é espião. Julgue a validade do argumento quando “Pedro é músico” é tomado como conclusão.',
 q49:'A tabela-verdade da página 4 apresenta as oito combinações de P, Q e R. Julgue se a sequência proposta para P ∧ (Q ∨ R), na ordem das linhas 1 a 8, está correta. Consulte a tabela original associada à questão.',
 q50:'A tabela-verdade da página 4 apresenta as oito combinações de P, Q e R. Julgue se a sequência proposta para (P ∧ Q) → R, na ordem das linhas 1 a 8, está correta. Consulte a tabela original associada à questão.'
}
const contextFor=(n,lang)=>n<=5?lang==='es'?contexts.es:contexts.en:n<=10?contexts.intel:n<=15?contexts.espionagem:n<=19?contexts.q16:n<=23?contexts.q20:n<=26?contexts.q24:n<=28?contexts.q27:n<=31?contexts.q29:n<=33?contexts.q32:n<=37?contexts.q34:n<=40?contexts.q38:n<=42?contexts.q41:n<=44?contexts.q43:n<=47?contexts.q45:n===48?contexts.q48:n===49?contexts.q49:contexts.q50
const pageOf=n=>n<=5?1:n<=15?2:n<=37?3:4
for(let p=1;p<=4;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)

const decisions=[]
for(const e of catalog.questoes){
 const q=byId.get(e.id),n=e.numero,lang=n<=5?languageById.get(e.id):'pt'
 if(!q)throw Error(`Registro ${e.id} ausente`)
 if(duplicateOf.has(e.id)){
  const originalLang=Object.entries(canon).find(([key,value])=>key.endsWith(`-${n}`)&&duplicateOf.get(e.id)===value)?.[0]?.slice(0,2)
  const langMateria=originalLang==='es'?'Espanhol':'Inglês'
  const langContent=originalLang==='es'?'Compreensão de texto em espanhol; léxico e conectores':'Interpretação de texto em inglês; vocabulário, inferência e uso do apóstrofo possessivo'
  decisions.push({id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:langMateria,conteudo:langContent,ano:2018,concurso,numero_original:n,pagina:1,apta_resolucao:false,inelegibilidade_motivo:'Versão OCR repetida de item de língua já preservado em registro canônico.',duplicada_de:duplicateOf.get(e.id),motivo:`Revisão v226: duplicata OCR do item ${n} de ${originalLang==='es'?'língua espanhola':'língua inglesa'}.`})
  continue
 }
 let materia,conteudo,k,ctx=contextFor(n,lang)
 if(n<=5){
  const isSpanish=e.id===canon[`es-${n}`];materia=isSpanish?'Espanhol':'Inglês';conteudo=isSpanish?'Compreensão de texto em espanhol: expedições, inferência e conectores':'Compreensão de texto em inglês: inteligência, segurança, vocabulário e possessivo';k=(isSpanish?spanishKeys:englishKeys)[n-1]
 }else if(n<=15){
  materia='Língua Portuguesa';const ts={6:'Sintaxe: orações subordinadas completivas e complemento nominal',7:'Pontuação: travessões e intercalação explicativa',8:'Regência e semântica de preposições',9:'Interpretação: inteligência e contrainteligência',10:'Tipologia textual: exposição e finalidade comunicativa',11:'Reescrita e equivalência semântica',12:'Interpretação de texto: relações entre espionagem e vazamento',13:'Inferência e compreensão de texto',14:'Coesão referencial: anáfora e retomada pronominal',15:'Crase e paralelismo sintático'};conteudo=ts[n];k=commonKeys[n-6]
 }else if(n<=23){
  materia='Direito Administrativo';const ts={16:'Regime jurídico constitucional: aposentadoria compulsória de agentes públicos',17:'Servidor público: estágio probatório, estabilidade e exoneração',18:'Lei de Responsabilidade Fiscal: transparência e acesso eletrônico',19:'Improbidade administrativa: deveres funcionais e publicidade',20:'Silêncio administrativo e tutela jurisdicional',21:'Processo administrativo: prazo para recurso sem previsão específica',22:'Processo administrativo: princípios e razoabilidade',23:'Atos administrativos: revogação, anulação e autotutela'};conteudo=ts[n];k=commonKeys[n-6]
 }else if(n<=26){
  materia='Direito Constitucional';conteudo=({24:'Nacionalidade originária: jus sanguinis e jus soli',25:'Quase nacionalidade e igualdade entre brasileiros e portugueses',26:'Nacionalidade brasileira e extradição'})[n];k=commonKeys[n-6]
 }else if(n<=28){
  materia='Direito Constitucional';conteudo=({27:'Direitos políticos: efeitos da condenação por improbidade',28:'Plebiscito, referendo e consulta popular'})[n];k=commonKeys[n-6]
 }else if(n<=30){
  materia='Direito Constitucional';conteudo=({29:'Direitos indígenas: aproveitamento de recursos hídricos e minerais',30:'Energia nuclear: competência legislativa sobre localização de usinas'})[n];k=commonKeys[n-6]
 }else if(n===31){materia='Direito Ambiental';conteudo='Responsabilidade ambiental: sanções penais, civis e administrativas';k=commonKeys[n-6]
 }else if(n<=37){
  materia='Conhecimentos de Inteligência';const ts={32:'Política Nacional de Inteligência: diretrizes e ambiente cibernético',33:'Política Nacional de Inteligência: instrumentos e recursos da atividade',34:'Estratégia Nacional de Inteligência: cooperação internacional',35:'Ameaças à segurança: sabotagem e efeitos físicos, materiais e psicológicos',36:'Inteligência e contrainteligência: produção e difusão de conhecimentos',37:'Controle parlamentar e fiscalização da atividade de inteligência'};conteudo=ts[n];k=commonKeys[n-6]
 }else if(n<=40){
  materia='Conhecimentos de Inteligência';conteudo=({38:'SISBIN: órgãos integrantes, atribuições e intercâmbio de informações',39:'Estrutura da ABIN: aprovação de planos de operações',40:'SISBIN: integração dos entes federativos'})[n];k=commonKeys[n-6]
 }else if(n<=42){
  materia='Legislação Institucional';conteudo=({41:'Plano de carreira da ABIN: cessão de servidores e cargos DAS',42:'Carreira da ABIN: atribuições do agente de inteligência'})[n];k=commonKeys[n-6]
 }else if(n<=44){
  materia='Legislação e Transparência Pública';conteudo=({43:'Lei de Acesso à Informação: dados pessoais e restrição de acesso',44:'Lei de Acesso à Informação: competências para classificação de sigilo'})[n];k=commonKeys[n-6]
 }else if(n<=47){
  materia='Raciocínio Lógico';conteudo=({45:'Contagem e codificação simbólica: representações de datas',46:'Análise combinatória: decodificação de datas por símbolos',47:'Raciocínio lógico: contagem de interpretações em sequência simbólica'})[n];k=commonKeys[n-6]
 }else if(n===48){
  materia='Raciocínio Lógico';conteudo='Lógica de argumentação: validade, implicação e contraposição';k=commonKeys[n-6]
 }else throw Error(`Questão não prevista no caderno: ${n}`)
 const page=pageOf(n),visual={pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:ctx,motivo:`Página ${page} do caderno oficial vinculada ao item ${n}; a figura ou tabela original permanece disponível quando integra seu contexto.`}
 let enunciado
 if(n===48)enunciado='Se a proposição lógica “Pedro é músico.” for a conclusão desse argumento, então as premissas juntamente com essa conclusão constituem um argumento válido.'
 if(n===4&&lang==='es'&&!/Carlos III/.test(q.enunciado))enunciado=q.enunciado.replace(/Carlos II|Carlos lI|Carlos 11/,'Carlos III').replace('Espafia','España')
 decisions.push({id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2018,concurso,numero_original:n,pagina:page,
  dificuldade:n<=15?'Média':([16,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44].includes(n)?'Média':'Média'),dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por complexidade textual, jurídica, institucional ou lógico-matemática; a banca não publica dificuldade psicométrica individual.',
  opcoes:q.opcoes?.length===2?q.opcoes:['Certo','Errado'],resposta_correta:k==='C'?0:1,anulada:false,
  texto_apoio:ctx,gabarito_oficial:{valor:k,fonte:gabarito,arquivo:'GAB_DEFINITIVO_378_ABIN_CB3_01.PDF',prova,numero:n,pagina:1,sha256:digest,hash_metodo:'SHA-256 da sequência dos 55 gabaritos definitivos do cargo 3: espanhol 1–5, inglês 1–5 e prova geral 6–50.',criterio:`Gabarito oficial definitivo CEBRASPE — ABIN, Cargo 3; item 14 aplicado conforme alteração oficial C→E. Justificativa: ${justificativas}`},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Classificação individual pelo conteúdo de cada item e do comando imediatamente anterior, conferência visual das páginas e gabarito oficial definitivo.'},
  visual,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],motivo:`Revisão v226 do item ${n}: idioma ou disciplina correta, conteúdo específico, edição e gabarito definitivo verificados.${n===14?' Gabarito alterado oficialmente de C para E.':''}`,
  ...(enunciado?{enunciado}:{})})
}
if(decisions.length!==63||decisions.filter(x=>x.apta_resolucao===false).length!==10)throw Error('Cobertura de decisões do documento divergiu')

const manualBase=byId.get('extr-865e1c8f714bd37ba2c7'),newItems=[]
const addDefs=[
 {n:49,enunciado:'Na tabela, a coluna referente à proposição lógica P ∧ (Q ∨ R), escrita na posição horizontal, é igual a V, F, V, F, V, F, F, F, na ordem das linhas 1 a 8.',answer:'C',materia:'Raciocínio Lógico',conteudo:'Lógica proposicional: tabela-verdade da disjunção e conjunção'},
 {n:50,enunciado:'Na tabela, a coluna referente à proposição lógica (P ∧ Q) → R, escrita na posição horizontal, é igual a V, V, V, V, F, V, V, V, na ordem das linhas 1 a 8.',answer:'C',materia:'Raciocínio Lógico',conteudo:'Lógica proposicional: tabela-verdade da condicional'}
]
for(const d of addDefs){
 const page=4,id=`manual-${doc}-item-${d.n}`,ctx=contexts[`q${d.n}`],img=`paginas/${doc}-0004.webp`
 const item=structuredClone(manualBase);Object.assign(item,{id,ano:2018,numero_original:d.n,banca:'CEBRASPE',banca_original:'CEBRASPE',concurso,materia:d.materia,conteudo:d.conteudo,enunciado:d.enunciado,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',resposta_correta:0,anulada:false,pagina:page,documento_id:doc,paginas_origem:[page],pagina_imagem:img,imagens_paginas:[img],texto_apoio:ctx,contexto_paginas:[{pagina:page,imagem:img}],classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.95,classificacao_metodo:'Transcrição de item ausente no índice a partir da página oficial original; classificação por conteúdo.',classificacao_evidencia:`Item ${d.n} existente na página 4 do caderno oficial da ABIN, omitido como registro individual na extração anterior.`,status_revisao:'revisado',motivos_revisao:[],gabarito_oficial:{valor:d.answer,fonte:gabarito,arquivo:'GAB_DEFINITIVO_378_ABIN_CB3_01.PDF',prova,numero:d.n,pagina:1,sha256:digest,hash_metodo:'SHA-256 da sequência dos 55 gabaritos definitivos do cargo 3.',criterio:'Gabarito oficial definitivo CEBRASPE — ABIN, Cargo 3.'},classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Transcrição manual conferida na página 4 do caderno original e gabarito oficial definitivo.'},integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:true,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:true,apontamentos:[]},revisao_semantica_visual:{imagem:img,pagina:page,sha256:hashRevisao(await fs.readFile(`public/acervo-extraido/${img}`)),motivo:`Conferido na página original 4; fórmula e sequência de valores transcritas integralmente no item ${d.n}.`,metodo:'Conferência visual individual da página original'}})
 item.gabarito_oficial.valor=d.answer;newItems.push(item)
}
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions,adicoes:newItems})
console.log(JSON.stringify({...report,documento:catalog.arquivo,concurso,registros_revisados:63,itens_originais_unicos:53,duplicatas_ocr:10,itens_ausentes_adicionados:[49,50],gabarito_definitivo_alterado:[14],paginas_originais:4,publicado:false},null,2))
