import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='d950b36430d1b6fc'
const fonte='https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/251TCEPA_004_01.pdf'
const edital='https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/ED_1_2016_TCE_PA_ABT.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/Gab_Definitivo_251TCEPA_004_01.pdf'
const concurso='TCE/PA 2016 — Auditor de Controle Externo, Área Administrativa, Especialidade Arquitetura'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==70||catalog.url!==fonte)throw Error('Catálogo TCE/PA 2016, Cargo 4, divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-enem-ppl2017-caderno21-v244'))
if(start<0)throw Error('Base v244 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==70)throw Error(`Esperados 70 itens do Cargo 4, encontrados ${active.size}`)

const topics=new Map([
 [51,'Arquitetura moderna: planta livre, estrutura independente e sistema Dom-ino de Le Corbusier'],
 [52,'Arquitetura moderna: cinco pontos de Le Corbusier e orientação solar das aberturas'],
 [53,'Conforto ambiental: terraço-jardim, cobertura vegetada e desempenho térmico'],
 [54,'Patrimônio: preservação e manutenção de valores materiais e históricos'],
 [55,'Patrimônio: restauração, remoção de acréscimos e recomposição de elementos arquitetônicos'],
 [56,'Patrimônio: preservação, restauração e adaptação de edificação histórica para novo uso'],
 [57,'Geometria descritiva: perspectiva isométrica e representação axonométrica'],
 [58,'Geometria descritiva: diedros e sistemas de projeção ortogonal'],
 [59,'Desenho técnico: projeção em primeiro e terceiro diedros'],
 [60,'Representação arquitetônica: perspectiva cônica e modelagem com SketchUp'],
 [61,'Desenho técnico: tipos de linhas e convenções da ABNT NBR 8403'],
 [62,'Direito urbanístico: usucapião especial urbana coletiva e Estatuto da Cidade'],
 [63,'Direito urbanístico: requisitos da usucapião especial individual urbana'],
 [64,'Desenho urbano: mobiliário urbano de interesse urbanístico e elemento escultórico'],
 [65,'Desenho urbano: mobiliário simbólico e arte pública no espaço urbano'],
 [66,'Desenho urbano: parklets, calçadas e ativação do espaço público'],
 [67,'Infraestrutura urbana: drenagem pluvial, caimentos transversais e sarjetas'],
 [68,'Sistema viário: classificação funcional e dimensionamento de via local'],
 [69,'Implantação arquitetônica: topografia, curvas de nível e movimentação de terra'],
 [70,'Sistemas prediais: aquecimento solar de água e circuito hidráulico por termossifão'],
 [71,'Sistemas prediais: válvula de retenção e circulação em coletor solar térmico'],
 [72,'Sistemas prediais: válvula de retenção horizontal em circuito de aquecimento solar'],
 [73,'Conforto térmico: absorção da radiação por coletores solares'],
 [74,'Comunicação visual: legibilidade de mensagens dirigidas ao público infantil'],
 [75,'Sinalização urbana: pictogramas, tipografia e compreensão transcultural'],
 [76,'Paisagem urbana: poluição visual, publicidade e ordenamento da comunicação visual'],
 [77,'Comunicação visual: análise de ambiente, projeto de informação e orientação espacial'],
 [78,'Acessibilidade: passeio livre e faixa de circulação na calçada'],
 [79,'Acessibilidade: módulo de referência e área de manobra para cadeira de rodas'],
 [80,'Acessibilidade comunicacional: sinalização tátil, piso tátil e braille'],
 [81,'Acessibilidade urbana: soluções de transposição de desnível em passarela'],
 [82,'Acessibilidade: sanitários de uso público e circulação independente'],
 [83,'Acessibilidade: percentual de sanitários acessíveis em edifícios de saúde'],
 [84,'Paisagismo: composição e características de jardins japoneses tradicionais'],
 [85,'Paisagismo: espaços verdes públicos e qualidade ambiental urbana'],
 [86,'Paisagismo: história da jardinagem e formação de espaços urbanos'],
 [87,'Projeto arquitetônico: implantação, condicionantes do lugar e topografia'],
 [88,'Projeto arquitetônico: programa de necessidades, atividades e relações funcionais'],
 [89,'Projeto arquitetônico: setorização e diagrama de relações em programas complexos'],
 [90,'Tecnologia da construção: racionalização, repetição e componentes pré-moldados'],
 [91,'História da arquitetura brasileira: Lúcio Costa, racionalismo e pré-fabricação'],
 [92,'Conforto acústico: absorção sonora e tratamento de auditórios'],
 [93,'Conforto ambiental: cartas solares e trajetória aparente do Sol'],
 [94,'Projeto bioclimático: insolação, carta solar e arborização urbana'],
 [95,'Conforto luminoso: iluminação natural, reflexão e posicionamento de aberturas'],
 [96,'Conforto acústico: absorção e isolamento sonoro em materiais de vedação'],
 [97,'Acessibilidade: barras de apoio para degrau isolado conforme ABNT NBR 9050'],
 [98,'Acessibilidade: corrimãos em escadas e rampas conforme ABNT NBR 9050'],
 [99,'Acessibilidade: continuidade de corrimãos e interrupções em patamares'],
 [100,'Acessibilidade: prolongamento de corrimãos em edificações existentes'],
 [101,'Acessibilidade: posicionamento de barras de apoio junto à bacia sanitária'],
 [102,'Acessibilidade: dimensões de barras de apoio para adultos e crianças'],
 [103,'Acessibilidade: altura de barras horizontais em sanitários acessíveis'],
 [104,'Acessibilidade: transferência lateral e dimensões de boxe sanitário infantil'],
 [105,'Acessibilidade: altura de bacia sanitária com assento para adultos e crianças'],
 [106,'Legislação profissional: autoria, alteração de projeto e responsabilidade técnica — Lei 12.378/2010'],
 [107,'Legislação profissional: uso da denominação Arquitetura e Urbanismo e registro de pessoa jurídica no CAU'],
 [108,'Legislação profissional: coautoria, equipes e responsabilidades em serviços de arquitetura'],
 [109,'Legislação profissional: Registro de Responsabilidade Técnica (RRT)'],
 [110,'Legislação profissional: anuidade, suspensão e exercício profissional no CAU'],
 [111,'Segurança contra incêndio: dimensionamento de escadas pela fórmula de Blondel — ABNT NBR 9077'],
 [112,'Segurança contra incêndio: uniformidade dimensional de degraus e lanços de escada'],
 [113,'Segurança contra incêndio: altura e geometria de degraus em rotas de saída'],
 [114,'Tecnologia de revestimentos: cura de emboço antes do assentamento de placas cerâmicas'],
 [115,'Tecnologia de revestimentos: juntas de dessolidarização e movimentação diferencial'],
 [116,'Gestão de obras: caderno de encargos, legislação e obrigações contratuais'],
 [117,'Gestão de obras: especificações de execução e produtividade da construção'],
 [118,'Gestão de obras: conteúdo do caderno de encargos e responsabilidades das partes'],
 [119,'Gestão de obras: autoria e responsabilidade pela elaboração do caderno de encargos'],
 [120,'Gestão de obras: recebimento e aceitação definitiva dos serviços'],
])
if(topics.size!==70)throw Error(`Classificação específica incompleta: ${topics.size}/70`)
const removable=['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente']
for(const page of new Set(catalog.questoes.map(x=>x.pagina)))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
const decisions=[...active.values()].map(q=>{
 const e=catalog.questoes.find(x=>x.id===q.id),n=Number(q.numero_original),page=e?.pagina
 if(!e||!topics.has(n)||!page)throw Error(`Questão sem tópico ou página: ${q.id}`)
 const stem=String(q.enunciado||'').replace(/[ \t\r\n]+/g,' ').trim()
 if(stem.length<20||/�|\ufffd/.test(stem))throw Error(`Texto suspeito em ${q.id}; manter revisão manual pendente`)
 const visual=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const context=(e.paginas||[]).filter(p=>p!==page).map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Página contígua do caderno oficial; preserva diagramas, figuras e texto-base associado ao item.'}))
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Arquitetura',conteudo:topics.get(n),ano:2016,concurso,numero_original:n,pagina:page,dificuldade:[56,59,60,61,62,63,67,69,72,79,93,94,97,101,102,103,104,106,108,109,111,112,116,118].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial considerando interpretação normativa, integração de representação gráfica e aplicação de conceitos; não divulgada pela banca.',classificacao_fonte:fonte,motivo:`Cebraspe, TCE/PA 2016, Cargo 4 — Arquitetura. Questão ${n}, página ${page}. O caderno oficial e o edital identificam a especialidade; o tópico foi definido pelo comando e pelo conteúdo técnico do item.`,visual:{pagina:page,imagem:visual,texto_apoio:q.texto_apoio||'',motivo:'Página original do caderno vinculada para preservar desenhos técnicos, fotografias, gráficos, fórmulas e elementos de apoio.'},...(context.length?{imagens_contexto:context}:{}),apta_resolucao:true,remover_pendencias:removable}
})
if(decisions.length!==70||new Set(decisions.map(x=>x.id)).size!==70)throw Error('Cobertura ou unicidade do lote incorreta')
const preview={registros:decisions.length,pendentesAntes:decisions.filter(x=>active.get(x.id).classificacao_pendente&&!active.get(x.id).classificacao_revisada).length,por_materia:{Arquitetura:70},paginasOriginais:[...new Set(decisions.map(x=>x.pagina))].length,referenciasVisuais:decisions.length,faixasConteudo:{'Arquitetura moderna/patrimônio/representação':19,'urbanismo/paisagismo/acessibilidade':31,'conforto/tecnologia/gestão profissional':20},fontes:[fonte,edital,gabarito]}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify(preview,null,2));process.exit(0)}
const name='revisao-tcepa-arquitetura-2016-v245'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,...preview,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão TCE/PA 2016 — Cargo 4: Arquitetura — v245\n\n- Reanalisei os 70 itens específicos (51–120) do caderno. A auditoria os agrupava como Engenharia Civil; o cabeçalho, o edital e o gabarito oficial identificam corretamente Auditor de Controle Externo, Área Administrativa, Especialidade Arquitetura. Corrigi a matéria e removi essa associação genérica.\n- Atribuí conteúdos específicos de arquitetura moderna, patrimônio, geometria descritiva, desenho técnico, direito urbanístico, desenho urbano, infraestrutura, aquecimento solar, comunicação visual, acessibilidade, paisagismo, projeto arquitetônico, conforto ambiental, legislação profissional, segurança contra incêndio, revestimentos e gestão de obras. Mantive fórmulas, desenhos, plantas, figuras e fotografias acessíveis pela página original do PDF; preservei as respostas existentes.\n- Validação local: ${result.classificadas} registros revistos, ${result.novas_classificacoes} novas classificações, ${result.contextos_visuais} referências visuais, ${result.total} registros totais, ${result.disponiveis} elegíveis e ${result.pendentes} pendências. Alteração local, não publicada na nuvem.\n- Fontes oficiais: [caderno do Cargo 4](https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/251TCEPA_004_01.pdf), [edital de abertura](https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/ED_1_2016_TCE_PA_ABT.PDF), [gabarito definitivo](https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/Gab_Definitivo_251TCEPA_004_01.pdf), [página oficial do concurso](https://www.cebraspe.org.br/concursos/TCE_PA_16).\n`)
console.log(JSON.stringify(out,null,2))
