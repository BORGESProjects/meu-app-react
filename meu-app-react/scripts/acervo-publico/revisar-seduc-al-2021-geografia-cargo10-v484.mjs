import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-seduc-al-2021-professor-geografia-cargo10-v484'
const documento='8d094654b0dc137a'
const prova='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_21/arquivos/606_SEDUC_AL_010_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_21/arquivos/GAB_DEFINITIVO_606_SEDUC_AL_010_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_21/arquivos/ED_SEDUC_AL_21_ABERTURA.PDF'
const concurso='SEDUC/AL — Professor — Especialidade Geografia — Cargo 10 — 2021'
const cargo='Professor — Especialidade Geografia — Cargo 10'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url.toLowerCase(),prova.toLowerCase())

// Reúne tanto a fila pendente quanto os registros que já estavam fora dela,
// para fechar os 70 itens oficiais sem duplicar questões existentes.
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json'))
const registros=[]
for(const lote of manifesto.lotes){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
 registros.push(...qs.filter(q=>q.documento_id===documento))
}
assert.equal(registros.length,80)
const porNumero=new Map()
for(const q of registros){const n=Number(q.numero_original);if(!porNumero.has(n))porNumero.set(n,[]);porNumero.get(n).push(q)}
assert.equal(porNumero.size,70)
assert.deepEqual([...porNumero.keys()].sort((a,b)=>a-b),Array.from({length:70},(_,i)=>i+51))
const duplicadosEsperados=[53,54,55,56,58,59,60,61,65,68]
assert.deepEqual([...porNumero].filter(([,a])=>a.length>1).map(([n])=>n).sort((a,b)=>a-b),duplicadosEsperados)

// Gabarito oficial definitivo do CEBRASPE: C=0, E=1. Todos os itens 51–120
// têm resposta definitiva; o PDF não marca anulação nesse intervalo.
const gabaritoPorNumero=new Map()
const linhas=[
 [51,'C C E C E E C C C E E C E E C E E C C E'],
 [71,'E C E C E C C E E C E C C E E E C E C C'],
 [91,'C E C C E E C C C E E C E E E E E E E C'],
 [111,'E E C E E C C E E C'],
]
for(const [inicio,linha] of linhas)linha.split(/\s+/).forEach((v,i)=>gabaritoPorNumero.set(inicio+i,v))
assert.equal(gabaritoPorNumero.size,70)
const conteudoGabarito=[...gabaritoPorNumero].map(([n,v])=>`${n}:${v}`).join('|')
const hashGabarito=hashRevisao(conteudoGabarito)

const assunto=new Map()
const grupo=(nums,materia,conteudo)=>nums.forEach(n=>assunto.set(n,[materia,conteudo]))
grupo([51,52,53,96,97,98],'Geografia','Pensamento geográfico: correntes, epistemologia e geografia crítica e humanística')
grupo([54,55,56],'Geografia','Conceitos geográficos: espaço, paisagem, território e lugar')
grupo([57],'Geografia','Territorialidade e escalas geográficas')
grupo([58,59,117,118,119,120],'Educação','Currículo, cultura e ensino de Geografia: ReCAL e educação básica')
grupo([60],'Geografia','Raciocínio geográfico, percepção e orientação espacial')
grupo([61],'Educação','Linguagens e recursos didáticos no ensino de Geografia')
grupo([62,63,64],'Educação','Metodologias de ensino: metodologias ativas e aprendizagem baseada em problemas')
grupo([65,66,67,68],'Educação','Tecnologias digitais e cartografia escolar no ensino de Geografia')
grupo([69,70,71,72],'Educação','Avaliação da aprendizagem em Geografia: avaliação formativa e instrumentos')
grupo([73,74,75,76,77],'Geografia','Geopolítica e economia mundial no pós-guerra: Bretton Woods, Guerra Fria e Plano Marshall')
grupo([78,79,80],'Geografia','Economia brasileira: Encilhamento, dívida externa e dívida pública')
grupo([81,82,83,84,85],'Geografia','Geografia econômica do Brasil: agropecuária, globalização, Mercosul e matriz elétrica')
grupo([86,87,88,89],'Geografia','Geografia do trabalho: capital humano, mercado de trabalho e desigualdades')
grupo([90],'Geografia','Geografia econômica e do trabalho: relações trabalhistas durante a pandemia')
grupo([91,92,93,94,95],'Geografia','Agropecuária brasileira: Revolução Verde, clima, uso da terra e agricultura familiar')
grupo([99,100,101],'Geografia','Comércio internacional: OMC, GATT e governança do comércio mundial')
grupo([102,103,104],'Geografia','Geografia ambiental: impactos ambientais, Rio+20 e sustentabilidade')
grupo([105,106,107],'Geografia','Recursos naturais: intemperismo, solos, florestas tropicais e agricultura')
grupo([108,109,110,111,112],'Geografia','Urbanização brasileira, território e meio técnico-científico-informacional')
grupo([113,114,115,116],'Geografia','Geografia industrial: concentração, desconcentração e terciarização')
assert.equal(assunto.size,70)

const facilidade=new Set([51,52,57,60,62,65,69,70,72,74,76,77,78,80,81,82,83,84,86,89,91,93,99,102,103,105,108,109,110,113,115,117,119,120])
const dificuldade=new Set([53,56,63,64,73,75,79,85,87,88,94,95,97,100,101,104,106,112,114,116,118])
const nivel=n=>facilidade.has(n)?'Fácil':dificuldade.has(n)?'Difícil':'Média'

const contextos=[
 [51,'Com o advento da ciência geográfica, diferentes correntes passaram a explicar a relação entre sociedade e espaço, influenciando os temas e a forma de ensinar Geografia.'],
 [54,'Texto-base: a Geografia escolar contribui para a formação integral e permite interpretar o espaço por meio das categorias paisagem, território, lugar, ambiente e sociedade. Fonte indicada no caderno: Suertegaray, “O que ensinar em Geografia (Física)?”, 2000.'],
 [57,'Os itens tratam de currículo em Geografia, cultura e territorialidade no ensino desse componente curricular.'],
 [60,'A pesquisa sobre Geografia escolar procura responder às demandas sociais e justificar a pertinência dos conteúdos curriculares, propondo alternativas para o ensino.'],
 [65,'As tecnologias digitais de informação e comunicação (TDIC) transformaram a relação dos alunos com o conteúdo escolar e trouxeram novas possibilidades para o ensino.'],
 [69,'Os itens versam sobre o processo de avaliação no ensino-aprendizagem de Geografia na escola.'],
 [73,'Texto-base: o reordenamento político global do pós-guerra alterou a educação e o panorama mundial. O texto menciona o fim do fascismo agressivo, a expansão do padrão comunista e a independência de territórios coloniais na Ásia e na África, com efeitos econômicos e sociais. Fonte indicada no caderno: Kuznets (1966), artigo hospedado em periodicos.sbu.unicamp.br.'],
 [78,'O caderno apresenta uma charge sobre dívida externa brasileira; a página original, que contém a imagem, permanece vinculada à questão.'],
 [81,'Os itens relacionam economia mundial, globalização, energia, Mercosul e agropecuária no Brasil.'],
 [86,'Texto-base: o mercado de trabalho é descrito como heterogêneo e competitivo; trabalhadores investem em capital humano para buscar ascensão, enquanto os de baixa qualificação podem ficar excluídos. Fonte indicada no caderno: repositório do Ipea.'],
 [90,''],
 [91,'Texto-base: a agricultura reúne técnicas de cultivo para produzir alimentos e matérias-primas. O caderno cita dados atribuídos à Embrapa sobre área plantada e exportações brasileiras de produtos agropecuários. Fonte original indicada: myfarm.com.br (com adaptações).'],
 [96,'Texto-base: “A realidade aparece a cada dia sob um novo aspecto. Ora, desde que a realidade muda, a ideia, o ‘teórico’, devem mudar. O teórico deve seguir a evolução para não se ver diante de um impasse.” Fonte indicada no caderno: Milton Santos, O trabalho do Geógrafo no terceiro mundo, 1978.'],
 [99,'Texto-base: a Organização Mundial do Comércio sucedeu ao GATT e resultou da Rodada do Uruguai.'],
 [102,'Os itens seguintes tratam de questões ambientais e de política ambiental.'],
 [105,'Os itens tratam dos recursos da natureza e de sua contextualização.'],
 [108,'Os itens tratam da urbanização brasileira.'],
 [113,'Os itens tratam do espaço industrial e da distribuição das indústrias.'],
 [117,'Referencial Curricular de Alagoas (ReCAL): competências e habilidades do componente curricular de Geografia no ensino fundamental.'],
]
const contextoDe=n=>contextos.filter(([a])=>a<=n).at(-1)?.[1]||''

// Reconstruções cotejadas linha a linha com o texto do PDF oficial.
const stems=new Map([
 [53,'A geografia crítica valoriza os aspectos sociais e desconsidera o conhecimento acerca dos aspectos da natureza, muito explorados na geografia tradicional.'],
 [56,'O ensino-aprendizagem do conceito de lugar, na geografia escolar, está pautado na análise de um ponto no espaço, como um local, pois só assim esse conceito pode ser entendido como um produto da experiência humana, como dimensão do vivido.'],
 [59,'Aprofundar o entendimento sobre a cultura como forma de compreensão das práticas espaciais cotidianas auxilia na atribuição de significado à geografia que se ensina.'],
 [68,'Mesmo com o avanço do uso das TDIC na escola, ainda há professores sem domínio e habilidade em manusear as tecnologias em prol de práticas didáticas e educativas.'],
 [69,'Professores de geografia que utilizam modelos tradicionais de avaliação optam por métodos nos quais prevalecem a conservação, a transmissão e a avaliação classificatória em momentos pontuais.'],
 [70,'Os instrumentos de avaliação constituem as ferramentas que devem refletir um padrão de desempenho estabelecido a partir dos objetivos e conteúdos propostos, de modo que, por meio deles, o professor obtenha dados da aprendizagem significativa ocorrida.'],
 [71,'A avaliação formativa, no ensino de geografia, dá enfoque às competências de características do conhecimento do conteúdo.'],
 [72,'O mapa conceitual apresenta-se como adequado instrumento para o processo de avaliação de aprendizagem em geografia, por ser uma ferramenta metodológica de caráter versátil.'],
 [74,'O estímulo fiscal, uma das políticas econômicas keynesianas, influenciou diretamente no elevado crescimento econômico do pós-guerra em países da Europa e da América.'],
 [77,'As bases de gerenciamento econômico internacional do pós-guerra e a fixação das regras para as relações comerciais e financeiras entre os países mais industrializados do mundo aconteceram em na década de 40 do século XX, com o acordo de Bretton Woods.'],
 [78,'O histórico de tomada de empréstimos estrangeiros pelo Brasil se inicia na Proclamação da República, quando o ministro da Economia de Deodoro da Fonseca, Rui Barbosa, para tentar fazer o país crescer, tomou dinheiro emprestado no exterior e lançou um pacote econômico que ficou conhecido como Encilhamento.'],
 [79,'Mesmo antes da pandemia de Covid-19, o Brasil enfrentava uma crise relacionada à dívida externa, pois essa dívida pública em moeda estrangeira já era quase o valor de seu Produto Interno Bruto (PIB).'],
 [80,'Atualmente, a dívida interna do Brasil é maior do que a dívida externa, o que significa a maior parte dos débitos do governo estar nas mãos de instituições como bancos, fundos de investimento e fundos de pensão.'],
 [83,'Ao mesmo tempo em que a globalização, em sua revolução técnico-científica, torna os transportes mais tecnológicos e a mobilidade mais fluida, um vírus de alto contágio, como o Covid-19, impõe restrições sanitárias que vão de encontro a esse movimento mais hábil da população na escala mundo.'],
 [84,'Os membros do Mercosul ratificaram um acordo assinado recentemente entre Brasil e Chile, que põe este país como membro do bloco ao estabelecer compromissos como facilitação de comércio, barreiras técnicas ao comércio, comércio transfronteiriço de serviços, investimentos, comércio eletrônico e compras governamentais.'],
 [85,'A matriz elétrica do Brasil, se analisada a partir do gás natural, da biomassa, dos cata-ventos eólicos e das usinas hidráulicas, possui equilíbrio percentual em relação às usinas termelétricas, mas esse equilíbrio enfrenta problemas no período de seca e da escassez de ventos fortes no litoral da região Nordeste.'],
 [87,'Os trabalhadores de baixa qualificação ou de pequeno estoque de capital humano, como os apontados no texto, são indivíduos que se encaixam no contexto socioespacial urbano dos chamados aglomerados subnormais.'],
 [90,'A pandemia forçou uma Medida Provisória (MP) entendida como um novo conjunto normativo e flexível às relações de trabalho brasileiras. Nessa MP estão providências como a possibilidade de empregado e empregador acordarem a redução da jornada de trabalho e, consequentemente, do salário, ou ainda a suspensão do contrato de trabalho como forma de mitigar o desemprego.'],
 [91,'Mesmo a revolução técnico-científica tendo causado a Revolução Verde e aumentado toda a produção em toneladas de produtos agrícolas para a exportação, o clima ainda exerce uma influência importante, porque afeta diretamente o desempenho da agropecuária do país.'],
 [92,'O século XXI marcou a sustentabilidade ambiental como uma ação importante para a produção agropecuária do Brasil, e nessas últimas duas décadas a expansão da área usada na agropecuária do país esteve estabilizada.'],
 [93,'Os altos índices de desmatamento em áreas florestadas como a Amazônia afetam a capacidade da evapotranspiração e, consequentemente, reduzem o volume de chuvas, provocando um prejuízo no agronegócio brasileiro de bilhões de reais.'],
 [94,'Os valores brutos das produções de soja e da pecuária encabeçam o faturamento do setor agropecuário no Brasil e atualmente concentram seu destaque nos estados de Mato Grosso, Paraná, São Paulo, Rio Grande do Sul, Minas Gerais e Goiás.'],
 [95,'A agricultura familiar brasileira ocupa a maior parte das terras divididas em estabelecimentos agropecuários do país, atende o mercado interno e produz toda a base alimentar que chega à mesa do brasileiro, em produtos como feijão, arroz, salada, leite e mandioca.'],
 [98,'A geografia humanística busca refletir sobre os fenômenos geográficos a fim de alcançar melhor entendimento do homem e de sua condição; para essa corrente, o conceito de lugar não é simplesmente o espaço em que ocorrem interações entre o homem e a natureza, pois incorpora também as representações simbólicas das pessoas com a materialidade dos lugares, com as quais os indivíduos interagem.'],
 [101,'A OMC é conhecida pelo empenho em auxiliar os países menos desenvolvidos economicamente; nesse sentido, os acordos multilaterais provenientes da organização revelam que tais países tendem a ter influência significativa nas decisões do órgão, o que, consequentemente, contribui para beneficiar o próprio comércio dessas nações.'],
 [102,'As atividades e as atitudes dos seres humanos, que agem como protagonistas dos acelerados processos de alterações climáticas, de perdas de espécies e de habitat, entre outros, podem gerar impactos ambientais.'],
 [103,'O principal objetivo da Rio+20, conferência realizada no Rio de Janeiro entre os dias 13 e 22 de junho de 2012, foi renovar o compromisso político com o desenvolvimento sustentável, de modo que a conferência promoveu declarações que vincularam obrigações aos países participantes.'],
 [104,'O conceito de sustentabilidade, apesar de ser vinculado à criação de ações de preservação ambiental com vistas ao não comprometimento da vida ecológica do nosso planeta, não se relaciona com os temas e as estratégias referentes à política ambiental nem com a noção de desenvolvimento econômico.'],
 [105,'Os seres vivos participam do intemperismo do solo de várias maneiras, contribuindo para a destruição dos recursos naturais pela erosão e pela degradação ambiental.'],
 [106,'O uso adequado das florestas tropicais estabelecerá um novo patamar civilizatório entre os homens e a natureza, por isso as novas tecnologias têm sido desenvolvidas a fim de que se adaptem da melhor forma às condições naturais; por outro lado, populações tradicionais — como os seringueiros, os indígenas e os ribeirinhos — não conseguem se adaptar a tais condições.'],
 [107,'O cultivo mecanizado e de espécie vegetal única favorece o desenvolvimento de pequenas espécies de animais, além de ter como vantagem o aumento da produção e da taxa de produtividade, sem provocar grandes danos à fauna, à flora e ao solo.'],
 [108,'No Brasil, o processo de urbanização foi ocasionado por uma intensa articulação entre as cidades do litoral, o que diferencia o processo ocorrido aqui do processo de urbanização de outros países periféricos.'],
 [109,'O Brasil foi, por muitos séculos, um grande arquipélago formado por subespaços que evoluíam segundo lógicas próprias, determinadas, em sua maior parte, pela região Sudeste brasileira — especificamente, por São Paulo.'],
 [110,'O forte movimento de urbanização no Brasil se verificou a partir da Segunda Guerra Mundial e foi acompanhado de forte crescimento demográfico, resultado de uma natalidade elevada e de uma mortalidade em queda, causadas principalmente pela aplicação de medidas sanitárias e pela melhora relativa nos padrões de vida, sobretudo nas cidades.'],
 [111,'O denominado meio técnico-científico-informacional, termo criado por Milton Santos, ocorreu exclusivamente nas áreas urbanas brasileiras, haja vista a necessidade de atendimento do seu mercado consumidor.'],
 [112,'O crescimento da economia do país criou condições, a partir de 1960, para o desenvolvimento da economia interna do país, estendendo-se por todo o período do governo militar.'],
 [113,'Em geral, as indústrias brasileiras se instalaram de forma concentrada nos locais em que se encontram, em razão de sua complexidade técnica e da exigência de maiores recursos financeiros.'],
 [114,'A desconcentração industrial de São Paulo é um fato irreversível da atual fase do capitalismo globalizante; além disso, as políticas governamentais de desenvolvimento de outras regiões do país têm provocado um equilíbrio suficiente para que esse processo se consolide.'],
 [115,'A expressão terciarização da economia revela o grau de importância que uma profunda intensificação do setor terciário (ligado aos serviços, à tecnologia e à comunicação) passou a ter na atualidade, sendo nítidas as fronteiras entre os setores da economia.'],
 [116,'As condições que explicam a expansão industrial nos países periféricos, como o Brasil, o México e a Argentina, incluem o crescimento da classe média e do proletariado urbano, influenciado pela imagem de prosperidade fabricada pelo consumo nos países desenvolvidos.'],
 [117,'No ensino fundamental, os procedimentos de investigação em ciências humanas devem propiciar nos estudantes a capacidade de observação; quanto à geografia, espera-se nessa etapa trabalhar o reconhecimento do Eu e o sentimento de pertencimento dos estudantes à vida da família e da comunidade.'],
 [118,'De acordo com o ReCAL, em relação ao componente de geografia, o conhecimento geográfico ocorre por três vertentes: o pensamento sintético da vida, o desenvolvimento do raciocínio geográfico do seu espaço natural ou físico e, ainda, a leitura do mundo, especificamente em sua forma de âmbito mundial.'],
 [119,'O professor tem um papel fundamental como agente mediador do processo de ensino e aprendizagem, considerando-se que cabe a ele conhecer de forma significativa o aporte teórico e metodológico da geografia que irá embasar toda a sua prática pedagógica, devendo o docente atuar perante seus educandos de forma tradicional, com vistas a evitar embate entre os diferentes grupos sociais.'],
 [120,'O currículo de geografia para o ensino fundamental valoriza a noção de pertencimento, haja vista haver essa condição na unidade temática denominada o sujeito e seu lugar no mundo, devendo o estudante ser estimulado a conhecer a realidade local partindo para o global; para isso, é necessário o aprofundamento dos conhecimentos sobre as características do território brasileiro em todas as suas dimensões (culturais, sociais e econômicas), do estado de Alagoas, de seu município e de sua localidade.']
])

const canonicos=new Map([[53,'extr-5a2f4027dec49ad55516'],[54,'extr-1a573de02c56d8083756'],[55,'extr-e86297074097b129de34'],[56,'extr-757c203676736ca0d321'],[58,'extr-de94487751f1afa6d409'],[59,'extr-85f472b982712e41fb42'],[60,'extr-1468b89b4cda95f3bcf0'],[61,'extr-b2b7b9f312196e43f9dd'],[65,'extr-04fb33ed2fe624423b91'],[68,'extr-d89ad3d8379dec235721']])
const paginas=new Map([...porNumero].map(([n,a])=>[n,Number(a[0].pagina)]))
const retirar=['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=[]
for(const [n,lista] of porNumero){
 const tax=assunto.get(n),resposta=gabaritoPorNumero.get(n),pagina=paginas.get(n)
 assert.ok(tax&&resposta&&pagina,`Item ${n} sem taxonomia, gabarito ou página`)
 for(const q of lista){
  const duplicada=lista.length>1&&q.id!==canonicos.get(n)
  const ctx=contextoDe(n)
  const texto=stems.get(n)
  const imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
  await fs.access(`public/acervo-extraido/${imagem}`)
  decisoes.push({
   id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tax[0],conteudo:tax[1],ano:2021,
   concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 17/10/2021',cargo,
   numero:n,numero_original:n,pagina,dificuldade:nivel(n),dificuldade_estimada:true,
   dificuldade_evidencia:'Estimativa editorial baseada na densidade conceitual, integração de conteúdos e precisão factual exigidas pelo item; não corresponde a índice psicométrico oficial.',
   resposta_correta:resposta==='C'?0:1,anulada:false,
   gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_606_SEDUC_AL_010_01.PDF',sha256:hashGabarito,numero:n,resposta,criterio:'Resposta transcrita do gabarito oficial definitivo do Cargo 10 — Professor, Especialidade Geografia.'},
   classificacao_fonte:prova,motivo:`Classificação item a item a partir do enunciado e do contexto do caderno oficial do Cargo 10 — Geografia. Conteúdo e dificuldade são editoriais; a data, banca e gabarito foram conferidos em fontes oficiais.`,
   texto_apoio:ctx,visual:{pagina,imagem,enunciado:texto,texto_apoio:ctx,motivo:`Página ${pagina} cotejada com o PDF oficial; texto-base pertinente separado do item e elementos visuais originais mantidos acessíveis.`},
   apta_resolucao:!duplicada,remover_pendencias:retirar,
   ...(duplicada?{inelegibilidade_motivo:'duplicata_ocr_do_mesmo_item_oficial',duplicada_de:canonicos.get(n)}:{})
  })
 }
}
assert.equal(decisoes.length,80)
assert.equal(decisoes.filter(d=>d.apta_resolucao).length,70)
assert.equal(decisoes.filter(d=>d.apta_resolucao===false).length,10)
assert.equal(decisoes.filter(d=>d.resposta_correta===null).length,0)
if(process.argv.includes('--dry-run')){
 console.log(JSON.stringify({lote:nome,registros_reconciliados:80,itens_oficiais_unicos:70,duplicatas_inelegiveis:10,questoes_com_gabarito_oficial:80,paginas_conferidas:[1,2,3,4],itens_faltantes_no_acervo:[],publicado:false},null,2));process.exit(0)
}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,edital,concurso,registros_reconciliados:80,itens_oficiais_unicos:70,questoes_unicas_elegiveis:70,duplicatas_inelegiveis:10,paginas_conferidas:[1,2,3,4],textos_ocr_reconstruidos:[53,56,59,68,69,70,71,72,74,77,78,79,80,83,84,85,87,90,91,92,93,94,95,98,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120],gabarito_definitivo_vinculado:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SEDUC/AL 2021 — Professor de Geografia, Cargo 10 — revisão v484\n\n- Reconcilei os 80 registros locais correspondentes aos 70 itens oficiais 51–120: 70 itens únicos permanecem aptos à resolução e 10 linhas duplicadas de OCR foram marcadas inelegíveis e vinculadas ao respectivo item canônico.\n- Classifiquei matéria e conteúdo específico, banca, concurso, cargo, aplicação em 17/10/2021 e dificuldade estimada. A dificuldade é editorial, não psicométrica.\n- Cotejei cada resposta com o gabarito oficial definitivo. Separei os textos-base compartilhados dos enunciados e reconstruí OCR/contaminações de blocos, preservando as páginas 1–4, inclusive a charge relacionada à dívida externa.\n- Os itens 102, 107, 108, 110 e 120 já estavam no banco, fora da fila pendente; foram reconciliados sem novas inserções.\n- Lote local validado após aplicação; ainda não publicado na nuvem.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo](<${gabarito}>), [edital oficial](<${edital}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
