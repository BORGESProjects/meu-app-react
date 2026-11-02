import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='69d3e1ac32e93523'
const prova='https://download.inep.gov.br/educacao_basica/enem/provas/2017/2017_PV_reaplicacao_PPL_D1_CD13.pdf'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==93)throw Error('Catálogo ENEM PPL 2017, 1º dia, Caderno 13 divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-inss-formacao-3turma-2025-v169'))
if(start<0)throw Error('Base v169 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==93)throw Error(`Esperados 93 registros do ENEM PPL 2017, encontrados ${active.size}`)
const entries=catalog.questoes,englishIds=new Set(entries.slice(0,5).map(q=>q.id)),spanishIds=new Set(entries.slice(5,10).map(q=>q.id))
const languageTopics=new Map([
 [6,['Língua Portuguesa','Interpretação textual: crítica à ideia de que a mudança contemporânea representa uma ruptura absoluta']],
 [7,['Artes Cênicas','Teatro físico: relação entre gesto, esforço, movimento e expressividade corporal']],
 [8,['Língua Portuguesa','Gênero textual e construção da voz do eu lírico em poema de crítica social']],
 [9,['Língua Portuguesa','Interpretação de texto sobre identidade regional, pertencimento e cultura de torcida']],
 [10,['Língua Portuguesa','Gênero crônica: finalidade, voz autoral e reflexão sobre a escrita']],
 [11,['Linguagens e Mídias','Leitura de infográfico e relação entre informação visual e linguagem verbal']],
 [12,['Literatura Brasileira','Regionalismo e construção de sentido em narrativa de Guimarães Rosa']],
 [13,['Língua Portuguesa','Interpretação e inferência em texto argumentativo sobre trabalho e progresso']],
 [14,['Educação Física','Classificação dos esportes por critérios de interação e cooperação']],
 [15,['Literatura Brasileira','Representação literária da escravidão e relações sociais']],
 [16,['Língua Portuguesa','Interpretação de crônica sobre transformações dos meios de comunicação']],
 [17,['Artes Visuais','Colagem e composição visual em obra cubista de Pablo Picasso']],
 [18,['Sociolinguística','Línguas indígenas, língua geral e preservação da diversidade linguística']],
 [19,['Literatura Brasileira','Cultura popular rural e representação da festa junina em texto literário']],
 [20,['Língua Portuguesa','Argumentação e efeito de sentido na interpretação do comportamento do público']],
 [21,['Linguagens e Mídias','Gênero digital: leitura de postagem e circulação de informação em blog']],
 [22,['Língua Portuguesa','Interpretação de metáfora e finalidade argumentativa em texto sobre educação']],
 [23,['Literatura Brasileira','Prosa regionalista e efeitos expressivos na narrativa de Graciliano Ramos']],
 [24,['Linguagens e Mídias','Tecnologia e comunicação: usos sociais e construção de sentidos']],
 [25,['Língua Portuguesa','Entrevista: identificação de ponto de vista e estratégia de pergunta e resposta']],
 [26,['Literatura Brasileira','Oralidade, regionalismo e variação linguística em diálogo narrativo']],
 [27,['Artes Visuais','Escultura monumental e arte soviética: leitura de obra de Vera Mukhina']],
 [28,['Língua Portuguesa','Gêneros jornalísticos e construção de perspectiva narrativa']],
 [29,['Linguagens e Mídias','Práticas de leitura e escrita nos meios digitais e canais de comunicação']],
 [30,['Artes e Cultura Popular','Frevo: dança, patrimônio cultural e identidade pernambucana']],
 [31,['Literatura Brasileira','Construção de narrador, imagens e efeitos de sentido em conto contemporâneo']],
 [32,['Artes Visuais','Dadaísmo e ready-made: ressignificação de objeto cotidiano em Marcel Duchamp']],
 [33,['Literatura Brasileira','Interpretação de narrativa literária e caracterização de personagem']],
 [34,['Literatura Brasileira','Crônica: tempo, envelhecimento e elaboração de experiência cotidiana']],
 [35,['Linguagens e Tecnologia','Entrevista e argumentação sobre tecnologia, inovação e demandas sociais']],
 [36,['Linguagens e Mídias','Leitura de campanha de conscientização e integração de texto e imagem']],
 [37,['Artes Visuais','Grafite e intervenção urbana: ressignificação estética de materiais descartados']],
 [38,['Linguagens e Mídias','Publicidade: persuasão e produção de experiência de consumo']],
 [39,['Língua Portuguesa','Humor e crítica social em texto multimodal/cartum']],
 [40,['Linguagens e Mídias','Mídia esportiva, televisão e estratégias de programação e mercado']],
 [41,['Língua Portuguesa','Gênero carta: interlocução, marcas de formalidade e intenção comunicativa']],
 [42,['Linguagens e Saúde','Divulgação científica: leitura de pesquisa e comunicação de resultados']],
 [43,['Literatura Brasileira','Expressividade poética: ritmo, modulação e valor sonoro das palavras']],
 [44,['Literatura Brasileira','Prosa literária e representação simbólica da morte']],
 [45,['Artes Visuais','Performance e intervenção urbana na obra New Look, de Flávio de Carvalho']]
])
const humanities=new Map([
 [46,['História','Direitos civis e liberalismo político: garantias individuais contra o absolutismo']],
 [47,['História','Patrimônio histórico no Brasil e formação de uma política de identidade nacional']],
 [48,['História','Economia da borracha na Amazônia e crise do ciclo extrativista']],
 [49,['História','Estado-nação, nacionalismo e formação de identidades nacionais na Europa']],
 [50,['Geografia','Segurança alimentar, produção agrícola e estratégias de sobrevivência']],
 [51,['Geografia','Leitura de dados demográficos do Censo e desigualdades socioespaciais']],
 [52,['Geografia','Mudanças climáticas, Amazônia e impactos ambientais']],
 [53,['Geografia','Geomorfologia: transporte e deposição de sedimentos e fragmentos rochosos']],
 [54,['Sociologia','Trabalho, remuneração e desigualdades na organização da produção']],
 [55,['Sociologia','Socialização, gênero e construção histórica de normas familiares']],
 [56,['Sociologia','Racismo institucional e desigualdade racial nas organizações']],
 [57,['Geografia','Expansão da fronteira agrícola no semiárido nordestino']],
 [58,['Sociologia','Colonialismo, racismo e crítica à desumanização de povos colonizados']],
 [59,['Geografia','Relações entre espaço rural e urbano e transformação territorial']],
 [60,['História','História cultural: circulação de hábitos e transformações dos costumes']],
 [61,['Geografia','Relevo e processos geomorfológicos: interpretação de representação cartográfica']],
 [62,['Sociologia','Desigualdade social, exclusão e direitos de cidadania']],
 [63,['Sociologia','Movimentos sociais, diversidade sexual e reconhecimento de direitos']],
 [64,['Filosofia','Distanciamento crítico e interpretação da experiência social']],
 [65,['Geografia','Infraestrutura, investimento público e organização do território']],
 [66,['Ciência Política','Democracia, soberania popular e relação entre governantes e governados']],
 [67,['Filosofia','Epistemologia aristotélica: conhecimento científico, opinião e intuição']],
 [68,['Antropologia','Povos indígenas, conversão religiosa e estratégias de reconhecimento e resistência']],
 [69,['Filosofia','Estoicismo: aceitação serena da perda e dos acontecimentos fora de controle']],
 [70,['História','Crise de 1929, Grande Depressão e economia capitalista no entreguerras']],
 [71,['Sociologia','Políticas de pacificação, violência urbana e segregação socioespacial']],
 [72,['História','Abolicionismo, escravidão e mobilização política no Brasil imperial']],
 [73,['Geografia','Intemperismo, erosão e transformação da paisagem']],
 [74,['Geopolítica','Relações Brasil–Argentina e integração regional sul-americana']],
 [75,['Geografia','Cartografia: projeções plana, cilíndrica e cônica']],
 [76,['Geografia','Agricultura, regulação ambiental e uso de agrotóxicos']],
 [77,['Sociologia','Racismo, relações étnico-raciais e políticas de enfrentamento']],
 [78,['Ciência Política','Supremo Tribunal Federal, direitos e interpretação constitucional']],
 [79,['História','Era Vargas, organização sindical e controle estatal do movimento operário']],
 [80,['Ciência Política','Administração pública, nepotismo e moralidade no serviço público']],
 [81,['Sociologia','Carnaval, hierarquia social e inversão simbólica da ordem cotidiana']],
 [82,['Filosofia','Filosofia antiga: definição, paradoxo e interpretação de enigma em Aristóteles']],
 [83,['Ciência Política','Migração, segurança nacional e direitos de estrangeiros']],
 [84,['Geografia','Desastres ambientais e consequências das mudanças climáticas']],
 [85,['Geografia','Demografia: estrutura etária e interpretação de gráfico populacional']],
 [86,['História','Patrimônio urbano, memória histórica e preservação de conjuntos arquitetônicos']],
 [87,['Geografia','Revolução Verde, modernização agrícola e impactos socioambientais']],
 [88,['Geografia','Urbanização, impermeabilização do solo e escoamento superficial']],
 [89,['Geografia','Acidificação dos oceanos e impactos do aumento de CO₂ nos ecossistemas marinhos']],
 [90,['Ciência Política','Representação democrática, meios de comunicação e participação popular']]
])
const subjectAliases={'Língua Inglesa':'Inglês','Língua Espanhola':'Espanhol','Língua Portuguesa':'Português','Literatura Brasileira':'Literatura','Artes Cênicas':'Artes','Artes Visuais':'Artes','Artes e Cultura Popular':'Artes','Sociolinguística':'Português','Linguagens e Mídias':'Português','Linguagens e Tecnologia':'Português','Linguagens e Saúde':'Português','Ciência Política':'Sociologia','Geopolítica':'Geografia'}
const difficultyFor=(subject,n)=>subject==='Inglês'||subject==='Espanhol'?'Média':[7,11,14,17,27,30,32,37,45,49,51,53,56,58,61,63,64,66,67,68,70,74,75,77,78,80,82,83,85,87,88,89,90].includes(n)?'Difícil':[6,8,10,12,13,16,18,19,20,21,22,24,25,26,28,29,31,33,34,36,38,39,41,42,43,44,46,47,48,50,52,54,55,57,59,60,62,65,69,71,72,73,76,79,81,84,86].includes(n)?'Média':'Fácil'
const knownPages=new Set(Array.from({length:31},(_,i)=>`paginas/${doc}-${String(i+1).padStart(4,'0')}.webp`))
for(const file of knownPages)await fs.access(`public/acervo-extraido/${file}`)
const removable=['classificacao_especifica_pendente','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']
const decisions=[...active.values()].map(q=>{
 const entry=entries.find(e=>e.id===q.id),n=Number(q.numero_original),page=entry?.pagina
 if(!entry||!page||!knownPages.has(`paginas/${doc}-${String(page).padStart(4,'0')}.webp`))throw Error(`Questão sem referência original: ${q.id}`)
 let materia,conteudo
 if(englishIds.has(q.id)){materia='Inglês';conteudo='Compreensão leitora em inglês: ideia central, inferência, vocabulário em contexto e propósito do texto.'}
 else if(spanishIds.has(q.id)){materia='Espanhol';conteudo='Compreensão leitora em espanhol: interpretação, inferência, vocabulário e finalidade comunicativa.'}
 else if(n>=6&&n<=45){[materia,conteudo]=languageTopics.get(n)||['Língua Portuguesa','Leitura e interpretação de texto e linguagem multimodal']}
 else if(n>=46&&n<=90){[materia,conteudo]=humanities.get(n)||['Ciências Humanas','Interpretação de fenômenos históricos, geográficos, sociais e políticos']}
 else throw Error(`Número fora da estrutura do caderno: ${n} (${q.id})`)
 materia=subjectAliases[materia]||materia
 const sourcePages=[...(entry.paginas||[page])].filter(p=>p!==page)
 const imagesContext=sourcePages.map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Página associada pelo catálogo oficial da prova; consultar quando o texto-base ou elemento visual se estender além da página do item.'}))
 const stem=String(q.enunciado||'').replace(/\u00a0/g,' ').replace(/[ \t\r\n]+/g,' ').trim()
 if(stem.length<20||/�|\ufffd/.test(stem))throw Error(`Enunciado suspeito em ${q.id}`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2017,concurso:'ENEM PPL 2017 — reaplicação, 1º dia, Caderno 13 (Azul)',numero_original:n,pagina:page,dificuldade:difficultyFor(materia,n),dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo tipo de leitura, integração de fontes e domínio conceitual; não publicada oficialmente pelo INEP.',classificacao_fonte:prova,motivo:`Questão ${n}, página ${page}, Caderno 13. Classificação individual pelo texto, comando, linguagem visual e área do exame; a prova separa Linguagens (1–45) e Ciências Humanas (46–90).`,visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:q.texto_apoio||'',motivo:'Página original do caderno oficial associada para preservar textos-base, imagens, gráficos e itens visuais.'},...(imagesContext.length?{imagens_contexto:imagesContext}:{}),enunciado:stem,apta_resolucao:true,remover_pendencias:removable}
})
const expected=new Set([...Array.from({length:5},(_,i)=>`en:${i+1}`),...Array.from({length:5},(_,i)=>`es:${i+1}`),...Array.from({length:85},(_,i)=>`n:${i+6}`)])
const present=new Set(decisions.map(d=>englishIds.has(d.id)?`en:${d.numero_original}`:spanishIds.has(d.id)?`es:${d.numero_original}`:`n:${d.numero_original}`))
const missing=[...expected].filter(n=>!present.has(n))
if(missing.join(',')!=='n:75,n:90')throw Error(`Lacunas inesperadas no caderno: ${missing.join(',')}`)
const add=(n,page,enunciado,opcoes,topic,subject)=>({id:`extr-enem-ppl17-d1-c13-${n}`,ano:2017,banca:'ENEM',banca_original:'INEP',organizadora:'INEP',concurso:'ENEM PPL 2017 — reaplicação, 1º dia, Caderno 13 (Azul)',aplicacao:'ENEM PPL — 1º dia — Caderno 13',numero_original:n,pagina:page,documento_id:doc,materia:subject,conteudo:topic,enunciado,opcoes,resposta_correta:null,anulada:false,origem:'INEP — ENEM PPL 2017, reaplicação, Caderno 13',fonte:prova,documento_origem:catalog.arquivo,tipo_documento:'Prova objetiva — 1º dia — Caderno 13 — Azul',tipo_extraido:'multipla_escolha',tipo_resposta:'multipla_escolha',status_revisao:'revisado',classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.95,classificacao_metodo:'Transcrição do comando e alternativas; assunto inferido a partir do conteúdo e da competência avaliada.',classificacao_evidencia:`Questão ${n}, p. ${page}, INEP, Caderno 13; texto e alternativa conferidos no documento oficial.`,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; o INEP não publica faixa de dificuldade por questão.',pagina_imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,imagens_paginas:[`paginas/${doc}-${String(page).padStart(4,'0')}.webp`],paginas_origem:[page],contexto_paginas:[{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`}],texto_apoio:'',integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:false,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:false,apontamentos:[]}})
const add75=add(75,27,'Projeção cartográfica é uma transformação que faz corresponder, a cada ponto da superfície terrestre, um ponto no plano. As relações do plano de projeção à superfície projetada mostradas nas figuras são identificadas, respectivamente, em:',
 ['A','B','C','D','E'],'Cartografia: projeções cartográficas e superfícies de projeção','Geografia')
add75.texto_apoio='A página original vinculada contém os três mapas e as figuras completas das cinco alternativas; como as opções são exclusivamente diagramas cartográficos, a imagem é necessária para responder.'
const add90=add(90,31,'Em um governo que deriva sua legitimidade de eleições livres e regulares, a ativação de uma corrente comunicativa entre a sociedade política e a civil é essencial e constitutiva, não apenas inevitável. As múltiplas fontes de informação e as variadas formas de comunicação e influência que os cidadãos ativam através da mídia, movimentos sociais e partidos políticos dão o tom da representação em uma sociedade democrática.\n\nURBINATI, N. O que torna a representação democrática? Lua Nova, n. 67, 2006.\n\nEsse papel exercido pelos meios de comunicação favorece uma transformação democrática em função do(a):',[
 'A — limitação dos gastos públicos.',
 'B — interesse de grupos corporativos.',
 'C — dissolução de conflitos ideológicos.',
 'D — fortalecimento da participação popular.',
 'E — autonomia dos órgãos governamentais.'
],'Representação democrática, meios de comunicação e participação popular','Sociologia')
if(decisions.length!==93||add75.id===add90.id)throw Error('Contagem de registros/aditamentos inconsistente')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({existentes:decisions.length,questoes_adicionadas:[75,90],lacunas_antes:missing,variantes_de_idioma:{ingles:englishIds.size,espanhol:spanishIds.size},pendentes_antes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length,disciplinas:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(s=>[s,decisions.filter(d=>d.materia===s).length])),paginas_originais:31,prova},null,2));process.exit(0)}
const name='revisao-enem-ppl-2017-dia1-v170'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions,adicoes:[add75,add90]})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,prova,fonte_catalogo:catalog.pagina_catalogo,registros_revistos:93,questoes_recuperadas:[{numero:75,pagina:27,imagem_opcoes:true},{numero:90,pagina:31,imagem_opcoes:false}],variantes_estrangeiras:'Os itens 1–5 em inglês e espanhol são versões alternativas legítimas do caderno e permanecem separados por matéria.',itens_validos:95,lacunas_finais:[],correcao_automatica_novas:false,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
