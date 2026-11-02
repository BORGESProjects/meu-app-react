import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-tcepa-webdesign-2016-v424',doc='a0e1ebc82d1d6586'
const prova='https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/251TCEPA_036_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/Gab_Definitivo_251TCEPA_036_01.pdf'
const concurso='TCE-PA 2016 — Auditor de Controle Externo — Informática — Web Design (Cargo 36)'
const cargo='Auditor de Controle Externo — Área: Informática — Especialidade: Web Design (Cargo 36)'
const table=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).trim().split(/\r?\n/).map(JSON.parse).find(x=>x.documento_id===doc)
if(!table||table.status!=='tabela_lida'||Object.keys(table.respostas||{}).length!==60||table.gabarito_url!==gabarito)throw Error('Gabarito oficial local não cobre os itens 51–110 deste caderno')
// O trecho 111–120 foi conferido na tabela oficial definitiva da URL acima.
const respostas={...table.respostas,'111':'C','112':'C','113':'C','114':'E','115':'E','116':'C','117':'E','118':'C','119':'C','120':'C'}
if(Object.keys(respostas).length!==70)throw Error('Gabarito definitivo deve cobrir 70 itens, de 51 a 120')
const checksum=hashRevisao(Object.entries(respostas).sort((a,b)=>Number(a[0])-Number(b[0])).map(([n,a])=>`${n}:${a}`).join('\n'))
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==67)throw Error(`Esperados 67 registros pendentes, encontrados ${records.length}`)
const duplicateOf=new Map([
 ['extr-c01e49498995d512be69','extr-baa0c5c84b6c26d9b205'],
 ['extr-a289717c1dbb1e25d6d6','extr-cfbcd6b8d1cb760fd4f0'],
 ['extr-4689c148a23cf66324ef','extr-9ba2a3ab1a15121b12c0'],
 ['extr-7940e24ffabead9983cf','extr-8f993e6b27d28c9b1e7e'],
 ['extr-cb1505f009806f5f337b','extr-5ce0c9bde7463ed361da']
])
const subjects=new Map([
 [51,['Informática','Web Design: usabilidade, comunicabilidade e arquitetura da informação','Média']],[52,['Informática','Acessibilidade web: conteúdo e navegação','Média']],[53,['Informática','Usabilidade web: navegabilidade e funcionamento de links','Fácil']],[54,['Informática','Usabilidade de sítios: eficiência e foco no usuário','Fácil']],[55,['Informática','Engenharia de usabilidade e projeto de interfaces','Média']],[56,['Informática','Arquitetura da informação: navegação e organização','Média']],[57,['Informática','Arquitetura da informação: navegação, organização, busca e rotulação','Média']],[58,['Informática','Web Design: wireframes, interface e arquitetura da informação','Fácil']],
 [59,['Informática','Usabilidade web: análise de usuários e requisitos','Média']],[60,['Informática','Usabilidade web: prototipagem de interfaces','Fácil']],[61,['Informática','Usabilidade web: requisitos de conteúdo, usuário e contexto','Média']],[62,['Informática','Usabilidade web: testes e responsividade','Média']],[63,['Informática','Usabilidade web: avaliação de compreensão e suporte tecnológico','Média']],
 [64,['Informática','Acessibilidade web: contraste e percepção visual','Média']],[65,['Informática','Acessibilidade web: foco e navegação por teclado','Fácil']],[66,['Informática','Acessibilidade web: redimensionamento e legibilidade','Média']],[67,['Informática','Acessibilidade digital: organização de menus segundo o usuário','Média']],[68,['Informática','Acessibilidade digital: alternativas para conteúdo gráfico e sonoro','Fácil']],[69,['Informática','Usabilidade de portais públicos: carga informacional da página inicial','Média']],[70,['Informática','Acessibilidade e consistência visual: ícones, espaços e contraste','Média']],[71,['Informática','Padrões de interface em sítios governamentais','Média']],[72,['Informática','Usabilidade de serviços públicos digitais: busca de informação','Média']],[73,['Informática','Navegação e identidade visual entre páginas de um sítio','Média']],[74,['Informática','Acessibilidade digital: requisitos e componentes de sítios governamentais','Média']],[75,['Informática','Acessibilidade digital: leitores de tela','Fácil']],[76,['Informática','Acessibilidade na web: competências do W3C e legislação brasileira','Média']],[77,['Informática','Modelo e-MAG: padrões e avaliação de acessibilidade','Média']],
 [78,['Informática','Software livre: licenças e copyleft','Média']],[79,['Informática','Software livre: acesso ao código-fonte','Fácil']],[80,['Informática','Design para web: cor digital e modelos de cor','Média']],[81,['Informática','Projeto de interfaces web: etapas de desenvolvimento e teste','Fácil']],[82,['Informática','HTML: conceitos e finalidade','Fácil']],[83,['Informática','CSS: folhas de estilo e apresentação de documentos web','Fácil']],[84,['Informática','CSS: sintaxe de regras, seletores, propriedades e valores','Fácil']],[85,['Informática','Padrões e-PWG: desenho, prototipagem e teste de sítios','Média']],[86,['Informática','Padrões web: desempenho, acessibilidade e interação','Média']],[87,['Informática','Sistemas de gerenciamento de conteúdo: Joomla e arquitetura','Média']],[88,['Informática','CMS: WordPress, Joomla e Drupal','Fácil']],
 [89,['Informática','HTML: formulários, agrupamento e elementos de seleção','Média']],[90,['Informática','HTML: associação de rótulos a controles de formulário','Média']],[91,['Informática','HTML: agrupamento semântico de controles com fieldset','Fácil']],[92,['Informática','HTML: elementos de formulários eletrônicos','Média']],[93,['Informática','Acessibilidade de formulários: padrões W3C e tecnologias assistivas','Média']],[94,['Informática','HTML: elemento label e associação com campos','Média']],[95,['Informática','Web Design: metodologia tableless e manutenção','Média']],[96,['Informática','Web Design: tableless e requisitos de HTML/CSS','Fácil']],
 [97,['Informática','Design gráfico: sistema de cores RGB','Fácil']],[98,['Informática','Web Design: interatividade','Fácil']],[99,['Informática','Design responsivo: proporção e orientação de telas','Fácil']],[100,['Informática','Design de interface: UI e experiência do usuário','Média']],[101,['Informática','Design gráfico: legibilidade e identidade visual','Fácil']],[102,['Informática','Design de marcas: escala, resolução e espessura de traço','Média']],[103,['Informática','Design de marcas: versões cromáticas e monocromáticas','Média']],[104,['Informática','Design de movimento: animação e sonorização na web','Média']],
 [105,['Informática','Produção gráfica: resolução de imagens para impressão offset','Fácil']],[106,['Informática','Produção gráfica: impressão de texto em policromia','Média']],[107,['Informática','Editoração: desenho vetorial e preparação de publicações','Média']],[108,['Informática','Produção gráfica: formato padrão de papel no sistema DIN','Fácil']],[109,['Informática','Imagem digital: compressão GIF e algoritmo LZW','Média']],[110,['Informática','Vídeo digital: proporção de tela widescreen','Fácil']],[111,['Informática','Áudio digital: bitrate, frequência de amostragem e profundidade de bits','Média']],[112,['Informática','Distribuição de áudio digital: podcasts','Fácil']],[113,['Informática','Design editorial: hierarquia visual e legibilidade','Fácil']],[114,['Informática','Identidade visual: público-alvo e projeto de marca','Média']],[115,['Informática','Ferramentas de web design: edição de imagem e desenho vetorial','Média']],[116,['Informática','Imagem digital: JPEG e compressão com perdas','Fácil']],[117,['Informática','Edição de imagem: preservação de camadas, efeitos e máscaras','Média']],[118,['Informática','Imagem digital: controle de qualidade JPEG','Média']],[119,['Informática','Tipografia web: formato WOFF e padrões W3C','Fácil']],[120,['Informática','Imagem digital: resolução para web e dispositivos móveis','Fácil']]
])
const blocks=[
 [51,58,'No que se refere aos conceitos de usabilidade, comunicabilidade, acessibilidade e navegabilidade, bem como à arquitetura da informação, julgue os itens.'],
 [59,63,'Julgue os itens acerca da análise de requisitos de usabilidade, de testes de usabilidade e de interfaces web.'],
 [64,66,'Julgue os itens sobre o modelo de acessibilidade em governo eletrônico brasileiro (e-MAG).'],
 [67,68,'A respeito das diretrizes técnicas de acessibilidade constantes da cartilha técnica do e-MAG, julgue os itens.'],
 [69,71,'Julgue os itens relativos às diretrizes e recomendações da Cartilha de Usabilidade do Projeto Padrões Brasil e-Gov.'],
 [72,73,'Julgue os itens sobre disponibilização de informações e serviços públicos em sítios de Internet.'],
 [74,77,'A respeito da acessibilidade digital e das diretrizes do e-MAG, julgue os itens.'],
 [78,79,'Julgue os itens referentes ao uso e à implementação de softwares livres.'],
 [80,81,'A respeito da programação visual de sítios e sistemas web, julgue os itens.'],
 [82,84,'Acerca dos conceitos e das técnicas de construção de sítios web com CSS e HTML, julgue os itens.'],
 [85,86,'Considerando a gestão de sítios e a aplicação dos padrões de governo eletrônico e-PWG, julgue os itens.'],
 [87,88,'No que concerne a aplicativos de gerenciamento de conteúdo (CMS), julgue os itens.'],
 [89,94,'Julgue os itens referentes à construção de formulários eletrônicos.'],
 [95,96,'A propósito da metodologia tableless, julgue os itens.'],
 [97,100,'O design gráfico tradicional baseia-se em princípios fundamentais que orientam a criação e a produção do design. Julgue os itens.'],
 [101,104,'Julgue os itens acerca de design gráfico e identidade visual.'],
 [105,108,'Julgue os itens sobre preparação e acompanhamento da produção de material impresso.'],
 [109,112,'Considerando filmes, vídeos, animações e áudio digital na Internet, julgue os itens.'],
 [113,114,'O trabalho de design deve adaptar-se às condições tecnológicas de veiculação e considerar o produto e o público-alvo. Julgue os itens.'],
 [115,120,'Considerando aplicativos e ferramentas para desenvolvimento de projetos web, imagens digitais e fontes, julgue os itens.']
]
const clean=s=>String(s||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').replace(/\bIntemet\b/g,'Internet').replace(/\bsofiwares\b/gi,'softwares').replace(/\bcopylefi\b/gi,'copyleft').replace(/\bgoverno\b/gi,'governo').trim()
const decisions=records.map(q=>{
 const n=Number(q.numero),topic=subjects.get(n)
 if(!topic||!respostas[String(n)]||!q.enunciado)throw Error(`Item ${n} sem classificação, resposta ou enunciado`)
 const page=Number(q.pagina),img=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,block=blocks.find(([a,b])=>n>=a&&n<=b)
 if(!block)throw Error(`Item ${n} sem texto-base contextual`)
 const duplicate=duplicateOf.get(q.id),answer=respostas[String(n)]
 let stem=clean(q.enunciado)
 if(n===58)stem='O termo wireframe designa a estrutura de informações em um banco de dados.'
 if(n===72)stem='A administração pública, ao disponibilizar informações e serviços em um sítio de Internet, deve considerar que as pessoas buscam informações de maneira sistemática e coerente.'
 if(n===74)stem='Os elementos fundamentais que devem constar das páginas de um sítio governamental são: teclas de atalho, barra de acessibilidade, mapa do sítio, conteúdo alternativo para imagens e apresentação auditiva de formulários e documentos.'
 if(n===75)stem='Webvox, Dosvox, Jaws e Microsoft Vision são softwares leitores de tela.'
 if(n===76)stem='No Brasil, compete ao comitê W3C estabelecer, com fundamento na Lei n.º 10.098/2000, as bases legais para a acessibilidade na web.'
 if(n===84)stem='A regra CSS é composta pela seguinte sintaxe: seletor {propriedade: valor.'
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2016,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'07/08/2016',numero_original:n,pagina:page,dificuldade:topic[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e técnica; não é nível oficial da banca.',classificacao_fonte:prova,motivo:`Item ${n} classificado individualmente conforme o enunciado e a seção correspondente do caderno oficial do Cargo 36 — Web Design. Resposta conferida com o gabarito definitivo do mesmo identificador de prova.`,enunciado:stem,texto_apoio:block[2],opcoes:['Certo','Errado'],resposta_correta:answer==='C'?0:answer==='E'?1:null,anulada:answer==='X',gabarito_oficial:{fonte:gabarito,arquivo:'Gab_Definitivo_251TCEPA_036_01.pdf',prova:'251TCEPA_036_01.pdf',sha256:checksum,sha256_tipo:'sha256_da_transcricao_canonica_das_respostas_51_a_120; nao_e_hash_do_pdf',numero:n,resposta:answer,criterio:answer==='X'?'Item anulado conforme o gabarito definitivo do CEBRASPE.':'Gabarito definitivo do cargo 36 — Web Design, conferido pelo identificador oficial do caderno.'},texto_de_apoio:block[2],imagens_contexto:[],reemplazarContexto:true,imagem_pagina:img,visual:{pagina:page,imagem:img,texto_apoio:block[2],motivo:`Página ${page} do caderno oficial conferida visualmente; bloco contextual separado e imagem original mantida vinculada.`},apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']}
 if(n===84)d.texto_apoio+=' Exemplo impresso da regra: seletor {propriedade: valor.'
 if(duplicate){d.apta_resolucao=false;d.duplicada_de=duplicate;d.inelegibilidade_motivo='Cópia duplicada do mesmo item no documento de origem; foi preservada a transcrição canônica mais limpa.'}
 return d
})
const dupCount=decisions.filter(d=>d.apta_resolucao===false).length,uniqueNums=new Set(decisions.filter(d=>d.apta_resolucao!==false).map(d=>d.numero_original))
if(dupCount!==5||uniqueNums.size!==62||decisions.some(d=>!d.gabarito_oficial||!d.materia||!d.conteudo||!d.dificuldade))throw Error('Esperados 5 duplicatas desativadas e 62 números canônicos classificados')
for(const page of new Set(decisions.map(d=>d.pagina)))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decisions,null,2))
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:concurso,caderno_oficial:prova,gabarito_definitivo:gabarito,itens_pendentes_revisados:67,itens_unicos_canonicos:62,duplicatas_desativadas:5,itens_anulados_neste_lote:[84,103],paginas_conferidas:[1,2,3],checksum_gabarito:checksum,publicado_na_nuvem:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
