import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-seduc-al-2021-professor-filosofia-cargo8-v485',documento='ce030d1e27bcfb76'
const prova='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_21/arquivos/606_SEDUC_AL_008_01.PDF'
const gabarito='https://arquivos.qconcursos.com/prova/arquivo_gabarito/85753/cespe-cebraspe-2021-seduc-al-professor-ensino-fundamental-anos-iniciais-gabarito.pdf'
const edital='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_21/arquivos/ED_SEDUC_AL_21_ABERTURA.PDF'
const concurso='SEDUC/AL — Professor — Especialidade Filosofia — Cargo 8 — 2021'
const cargo='Professor — Especialidade Filosofia — Cargo 8'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url.toLowerCase(),prova.toLowerCase())
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(pendentes.length,74)
assert.equal(catalogo.questoes.length,74)
assert.deepEqual(new Set(pendentes.map(x=>x.id)),new Set(catalogo.questoes.map(x=>x.id)))
const porNumero=new Map()
for(const q of pendentes){const n=Number(q.numero);if(!porNumero.has(n))porNumero.set(n,[]);porNumero.get(n).push(q)}
assert.equal(porNumero.size,70)
assert.deepEqual([...porNumero.keys()].sort((a,b)=>a-b),Array.from({length:70},(_,i)=>i+51))
assert.deepEqual([...porNumero].filter(([,a])=>a.length>1).map(([n])=>n),[52,53,54,55])

// Transcrição do gabarito oficial definitivo (Certo, Errado e anulações)
// conferida no documento reproduzido em PDF e cotejada com os itens do caderno.
const gabaritoPorNumero=new Map()
for(const [inicio,linha] of [
 [51,'C E C E E C C E C C E E C E C E C C E E'],
 [71,'E C C X E E C E X C E C E E X C C E C E'],
 [91,'C E E C E E E E C C C C E E E C E C C E'],
 [111,'E C C E C C C C C E']
])linha.split(/\s+/).forEach((v,i)=>gabaritoPorNumero.set(inicio+i,v))
assert.equal(gabaritoPorNumero.size,70)
const hashGabarito=hashRevisao([...gabaritoPorNumero].map(([n,v])=>`${n}:${v}`).join('|'))

const assuntos=new Map()
const grupo=(nums,conteudo)=>nums.forEach(n=>assuntos.set(n,['Filosofia',conteudo]))
grupo([51,52,53,54,55],'Filosofia antiga: nascimento da filosofia, pré-socráticos e cosmologia')
grupo([56,57,58,59,60,61,62],'Filosofia antiga: mitologia, Platão, República, justiça e política')
grupo([63,64],'Teoria do conhecimento: razão, conhecimento especulativo e Kant')
grupo([65,66],'Lógica aristotélica: juízos e proposições contrárias')
grupo([67,68,69],'Filosofia contemporânea: Nietzsche, além-do-homem e crítica da sociedade atual')
grupo([70,71,72,101,102,103,104],'Filosofia e criação de conceitos: Deleuze e Guattari, ciência e interdisciplinaridade')
grupo([73,74,75,76],'Ética: dimensões social e individual da moral')
grupo([77,78,79,80],'Ética antiga e medieval: Espinosa, Platão, Aristóteles e Agostinho')
grupo([81,82,83,84],'Ética kantiana: autonomia, imperativo categórico e lei moral')
grupo([85,86,87,88],'Nietzsche: genealogia da moral, valores e crítica da religião')
grupo([89,90,91,92],'Filosofia moderna: empirismo de Bacon e racionalismo de Descartes')
grupo([93,94,95,96],'Filosofia da técnica: téchne e técnica moderna em Heidegger')
grupo([97,98,99,100],'Estética e filosofia de Nietzsche: arte, verdade e vontade de potência')
grupo([105,106,107,108,109],'Ensino de Filosofia: BNCC, interdisciplinaridade e linguagem')
grupo([110,111,112,113,114],'Estética: arte e espírito absoluto em Hegel')
grupo([115,116,117,118,119,120],'Estética e teoria crítica: Walter Benjamin, indústria cultural e reprodutibilidade técnica')
assert.equal(assuntos.size,70)

const facil=new Set([51,52,54,55,56,57,58,59,60,61,62,69,73,74,75,76,77,78,79,80,81,82,83,84,86,87,88,89,90,91,92,95,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120])
const dificil=new Set([63,64,67,68,70,71,72,85,93,94,96,97,98,99,100])
const nivel=n=>facil.has(n)?'Fácil':dificil.has(n)?'Difícil':'Média'

const contextos=[
 [51,'Texto-base: historiadores situam o nascimento da filosofia entre os séculos VII e VI a.C., nas colônias gregas da Ásia Menor, especialmente na Jônia. Tales de Mileto é apresentado como primeiro filósofo, e o conteúdo inicial da filosofia como cosmologia, uma explicação racional da origem e da ordem do cosmos. Fonte indicada no caderno: Marilena Chauí, Introdução à história da filosofia.'],
 [56,'Trecho de A República, de Platão: diálogo em que Sócrates discute o projeto de uma cidade ideal e a formação de seus futuros guardiões, incluindo a influência das narrativas poéticas e míticas. O texto integral está preservado na página original associada.'],
 [63,'Texto-base atribuído a Kant: o conhecimento universal in abstracto é especulativo; o conhecimento universal in concreto é comum. O conhecimento filosófico é especulativo da razão e começa quando o uso comum da razão tenta conhecer o universal in abstracto.'],
 [65,'Trecho de Aristóteles, Organon: distingue juízos e proposições contrários, incompatíveis entre si, de proposições que podem ser simultaneamente verdadeiras por se referirem a sujeitos distintos.'],
 [67,'Texto-base de Byung-Chul Han sobre os “últimos homens” de Nietzsche e a figura do Homo saliens, que salta diante da câmera e abandona a virtude do discernimento e da sabedoria associada ao Homo sapiens.'],
 [70,'Trecho de Deleuze e Guattari, O que é a filosofia?: a filosofia, assim como as artes e as ciências, é criadora; sua atividade específica é criar conceitos, que não estão prontos e precisam ser inventados.'],
 [73,'A moral pode assumir polos contraditórios, ligados ao caráter social e ao caráter individual. Os itens avaliam afirmações sobre moral, política e ética.'],
 [77,'Os itens tratam da história da ética desde a Antiguidade até o início da Modernidade e de diferentes concepções de virtude, felicidade e moralidade.'],
 [81,'Texto-base sobre a ética de Kant: a ação moral não se fundamenta apenas em felicidade ou interesse; os itens consideram razão, autonomia e universalidade da conduta.'],
 [85,'Texto-base sobre Nietzsche: a pluralidade da diferença torna os seres humanos demasiadamente humanos; os itens tratam da genealogia dos valores morais.'],
 [89,'Os itens comparam racionalismo e empirismo, incluindo as ideias de Francis Bacon e René Descartes sobre método, experiência, razão e conhecimento.'],
 [93,'Os itens abordam a relação entre a téchne grega e a técnica moderna na filosofia de Martin Heidegger.'],
 [97,'Frase 1: “Só como fenômeno estético, a existência e o mundo aparecem eternamente justificados.” (Nietzsche, O nascimento da tragédia.) Frase 2: “Temos a arte para não morrer perante a verdade.” (Nietzsche, A vontade de poder.)'],
 [101,'Trecho de Deleuze e Guattari, O que é a filosofia?: criar conceitos é a atividade própria da filosofia; ciências e artes também criam, mas seus objetos e procedimentos diferem.'],
 [105,'Texto-base da BNCC para Língua Portuguesa no ensino médio: desenvolver habilidades para lidar com informação e opinião, considerando veracidade, confiabilidade, adequação, validade e força dos argumentos. Os itens relacionam essa orientação ao ensino de Filosofia.'],
 [110,'Os itens tratam da noção de arte e do absoluto na filosofia de Hegel.'],
 [115,'Texto-base sobre as críticas de Walter Benjamin, da Escola de Frankfurt, à produção artística em uma época de avanço tecnológico e à reprodutibilidade técnica. A imagem da página original permanece associada.']
]
const contextoDe=n=>contextos.filter(([a])=>a<=n).at(-1)?.[1]||''

const stems=new Map([
 [51,'Houve contribuições de outros povos além dos gregos para o nascimento da filosofia na Grécia, haja vista a passagem de cosmogonias para cosmologias.'],
 [52,'O período inicial da história da filosofia é denominado pré-socrático, e, apesar de reunir pensadores localizados em diferentes colônias gregas, todos convergiram numa mesma cosmologia.'],
 [53,'Além de Mileto, Éfeso também se situava na Jônia, onde o principal expoente da filosofia pré-socrática era Heráclito, famoso pela obscuridade de seu pensamento.'],
 [54,'Em Mileto, além de Tales, também Anaximandro e Anaxímenes recusaram-se a investigar a física e nada escreveram, a fim de evitar perseguições religiosas.'],
 [55,'Atenas e Esparta foram as cidades que mais influenciaram o surgimento da filosofia pré-socrática na Ásia Menor.'],
 [56,'A teogonia, conhecida como genealogia dos deuses, é um conjunto de narrativas orais reunidas por Hesíodo, que apresentam conspirações, combates e lutas entre os deuses.'],
 [57,'As mitologias, apesar de não serem subordinadas à lógica nem às realidades objetivas nem às verdades científicas, relacionam-se com o pensamento filosófico.'],
 [58,'A filosofia platônica confunde-se com a mitologia grega na medida em que ambas apresentam uma mesma teoria cotidiana sobre a imortalidade da alma.'],
 [59,'Platão, em seu diálogo n’A República, apresenta o projeto para uma cidade ideal, cujo eixo condutor é a justiça.'],
 [60,'No diálogo platônico apresentado, Sócrates critica a fabulação poética como algo prejudicial à formação dos futuros guardiões da cidade idealizada em seu projeto.'],
 [61,'O regime democrático grego já estava presente desde as primeiras narrativas mitológicas, como exemplo de criação divina.'],
 [62,'A condenação de Sócrates à morte foi um fator determinante para os elogios de Platão à democracia ateniense, presentes em seu diálogo.'],
 [63,'O intelecto especulativo constitui-se numa condição para que seja possível o conhecimento filosófico.'],
 [64,'Não há diferença entre o uso comum da razão e seu uso especulativo, porque o conhecimento humano deve ser universal.'],
 [65,'O juízo é um ato do espírito pelo qual é possível afirmar ou negar uma coisa de outra.'],
 [66,'Proposições contrárias derivam de proposições verdadeiras, porque afirmam e predicam qualidades verdadeiras, porém contrárias.'],
 [67,'Ao apresentar a figura do “último homem” associada à do seu contrário, o “além do homem” ou “super-homem”, Nietzsche anunciava uma nova perspectiva de sentido para a humanidade.'],
 [68,'No texto apresentado, Byung-Chul Han atualiza a crítica nietzschiana ao apresentar a figura do Homo saliens, pela qual indica a decadência humana observada no cotidiano atual.'],
 [69,'O “super-homem” (ou “além do homem”) constitui uma figura para ilustrar o aperfeiçoamento da existência humana por meio da moral e da religião.'],
 [70,'Desde Aristóteles, a filosofia é pensada como reminiscência, e essa característica é o que a distingue das artes e das ciências.'],
 [71,'A criação dos conceitos é subordinada à criação nas artes e nas ciências, o que faz da filosofia uma arte ou ciência das verdades.'],
 [72,'O conceito é fundamental para as filosofias e cabe aos filósofos sua invenção, fabricação ou criação.'],
 [73,'Enaltecer a exclusividade do caráter social da moral resulta no dogmatismo.'],
 [74,'O individualismo leva ao amoralismo.'],
 [75,'Política e ética são campos independentes: a primeira cuida da justiça social e a segunda dos interesses pessoais.'],
 [76,'Um ato moral é livre, consciente, intencional e solitário.'],
 [77,'A ética de Espinosa valoriza o conhecimento racional.'],
 [78,'Para Platão, a virtude se identifica com a sabedoria, por isso não pode ser aprendida.'],
 [79,'Para Aristóteles, o homem atinge a vida contemplativa ao buscar a felicidade.'],
 [80,'A ética agostiniana nega o virtuosismo e o maniqueísmo.'],
 [81,'As ações nunca derivam apenas da razão; elas precisam ter uma fonte não racional.'],
 [82,'A ação de cada indivíduo deve valer como princípio universal de conduta.'],
 [83,'As consequências de uma ação são o que a tornam certa ou errada.'],
 [84,'A lei moral é descritiva.'],
 [85,'Os conceitos de bom e mal surgem dos conceitos de puro e impuro, que serviam para separar as castas entre superiores e inferiores.'],
 [86,'Toda classe social institui os seus valores, mesmo que de forma obscura ou espelhada nos valores de outra classe.'],
 [87,'As religiões deturpam a moral em sua originalidade.'],
 [88,'O homem mau cria seus valores pelo que tem e pelo que é.'],
 [89,'Francis Bacon é considerado um dos fundadores do método indutivo de investigação científica.'],
 [90,'Para René Descartes, a existência precede a essência.'],
 [91,'Para Francis Bacon, os filósofos antigos falharam por não terem aplicado um método adequado que possibilitasse a construção de um conhecimento mais sólido que a mente humana era capaz de construir por si mesma.'],
 [92,'De acordo com o pensamento de René Descartes, não existe uma verdade absoluta.'],
 [93,'Para Heidegger, não há distinção entre a téchne dos gregos e a “técnica moderna”.'],
 [94,'Heidegger afirma que a técnica é um modo do descobrimento, é um fazer vir.'],
 [95,'A técnica deve ser vista como uma aplicação eventual da ciência, conforme Heidegger.'],
 [96,'A téchne, de acordo com Heidegger, se concretiza no fazer e manusear, assim como na aplicação de meios.'],
 [97,'Verifica-se na obra de Nietzsche, principalmente em Assim Falou Zaratustra, a adesão a uma estética de características platônicas.'],
 [98,'Assim como autores da Grécia Clássica, Nietzsche defendeu uma mútua identificação entre o belo e o bom, o que pode ser corroborado pela frase 1.'],
 [99,'Com a passagem apresentada na frase 2, verifica-se que Nietzsche se contrapõe ao movimento cientificista e tecnicista de sua época.'],
 [100,'A doutrina da vida como vontade de potência, entre outros aspectos, fez Nietzsche se distanciar da postura schopenhaueriana de contemplação da arte.'],
 [101,'Apontando para os limites e os perigos do saber especialista, a interdisciplinaridade deve ultrapassar a especialização, sendo reconhecidos, entretanto, seus méritos e virtudes.'],
 [102,'O processo de especialização foi impulsionado pelo surgimento e desenvolvimento das ciências naturais.'],
 [103,'O método cartesiano influenciou positivamente a perspectiva interdisciplinar.'],
 [104,'Thomas Kuhn aponta para a necessidade de superação da especialização, em alguns momentos históricos, por identificar nos processos históricos da ciência os períodos de ciência normal.'],
 [105,'A organização da BNCC para o ensino médio mantém a estrutura da divisão por disciplinas, sendo a Filosofia uma delas.'],
 [106,'A citação apresentada remete à possibilidade do uso da Filosofia na consideração do fenômeno da pós-verdade, abordando-o, por exemplo, sob diferentes perspectivas éticas, como a de Kant e a de Stuart Mill.'],
 [107,'A citação apresentada e as habilidades e competências da área de Ciências Humanas abrem a possibilidade do uso da Filosofia, por meio da lógica, para desenvolver a capacidade de identificar premissas e garantir a verdade das conclusões.'],
 [108,'A citação apresentada e as habilidades e competências da área de Ciências Humanas apontam para a possibilidade do uso da Filosofia para identificar fontes usadas em uma narrativa.'],
 [109,'A citação apresentada e as habilidades e competências da área de Ciências Humanas apontam para a possibilidade do uso da Filosofia em sua dimensão socioafetiva.'],
 [110,'O sistema do espírito absoluto em Hegel obedece a uma hierarquia composta pelas figuras da arte, da filosofia e da lógica.'],
 [111,'Em Hegel, o belo artístico é sempre inferior ao belo natural, pois este último é fruto da obra divina.'],
 [112,'A autodeterminação do espírito absoluto se dá, do ponto de vista da arte, pelo longo processo da exterioridade sensível.'],
 [113,'A arte cumpre uma função dialética ao revelar a contradição da vida humana e, assim, se torna matéria para o filósofo.'],
 [114,'A estética hegeliana trata de questões das belezas diversas inerentes às variadas manifestações artísticas.'],
 [115,'Para Walter Benjamin, a produção artística deixa de se realizar como um ritual e passa a ser apropriada pela indústria cultural (fabricada), que a reproduz na intenção de que ela possa ser absorvida pelas massas.'],
 [116,'Mesmo sendo um crítico da perda de sentido da obra de arte, no processo de reprodutibilidade técnica, Walter Benjamin consegue ser otimista quanto ao uso do cinema, por exemplo, como ferramenta que torna possíveis profundas transformações sociais por meio do alcance do proletariado.'],
 [117,'Para Walter Benjamin, a grande questão a ser pensada e analisada na era da indústria cultural, quanto ao conceito de reprodutibilidade técnica da obra de arte, é o valor da quintessência de tudo que foi transmitido pela tradição a partir de sua origem, duração e conteúdo histórico.'],
 [118,'O conceito de indústria cultural, no que se refere à arte, só se aplica ao contexto das relações capitalistas de produção, pois a cultura não é produzida pelas massas, e sim para as massas; o que verdadeiramente interessa é o seu valor de venda nas sociedades de mercado.'],
 [119,'Para Walter Benjamin, a indústria cultural e a reprodutibilidade técnica possibilitaram ao homem contemporâneo criar fenômenos como a estetização da política (própria do fascismo) e a politização da arte (própria do comunismo).'],
 [120,'Para Benjamin, toda obra de arte está rodeada por uma aura e a reprodução técnica, própria da sociedade industrial, sendo o aumento da produtividade a força motriz que sustenta o alcance dotado de sentido da obra de arte.']
])

const canonicos=new Map([[52,'extr-93c0dde23f39a73643ba'],[53,'extr-b551896517a2e8347bc4'],[54,'extr-b38829468f364c47ca7d'],[55,'extr-4f03b55374581897afdb']])
const retirar=['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=[]
for(const [n,lista] of porNumero){
 const resposta=gabaritoPorNumero.get(n),tax=assuntos.get(n),pagina=Number(lista[0].pagina)
 assert.ok(resposta&&tax&&pagina,`Item ${n} sem gabarito, classificação ou página`)
 for(const q of lista){
  const duplicada=lista.length>1&&q.id!==canonicos.get(n),anulada=resposta==='X',ctx=contextoDe(n)
  const imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
  await fs.access(`public/acervo-extraido/${imagem}`)
  decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tax[0],conteudo:tax[1],ano:2021,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 17/10/2021',cargo,numero:n,numero_original:n,pagina,dificuldade:nivel(n),dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na abstração conceitual, na interpretação dos textos filosóficos e na integração entre autores e correntes; não corresponde a índice psicométrico oficial.',resposta_correta:anulada?null:resposta==='C'?0:1,anulada,gabarito_oficial:{fonte:gabarito,arquivo:'Gabaritos oficiais definitivos — SEDUC/AL 2021 — Cargo 8: Filosofia',sha256:hashGabarito,numero:n,resposta,criterio:'Transcrição do gabarito oficial definitivo reproduzido em PDF; os itens 74, 79 e 85 constam como anulados.'},classificacao_fonte:prova,motivo:`Classificação semântica item a item, com base no enunciado, no texto-base e no programa de Filosofia do Cargo 8. Banca, cargo, aplicação e gabarito foram cotejados com documentos do concurso; dificuldade é estimada.`,texto_apoio:ctx,visual:{pagina,imagem,enunciado:stems.get(n),texto_apoio:ctx,motivo:`Página ${pagina} conferida visualmente; enunciado reconstruído e texto-base associado ao bloco correto.`},apta_resolucao:!duplicada,remover_pendencias:retirar,...(duplicada?{inelegibilidade_motivo:'duplicata_ocr_do_mesmo_item_oficial',duplicada_de:canonicos.get(n)}:{})})
 }
}
assert.equal(decisoes.length,74)
assert.equal(decisoes.filter(x=>x.apta_resolucao).length,70)
assert.equal(decisoes.filter(x=>x.apta_resolucao===false).length,4)
assert.deepEqual(decisoes.filter(x=>x.anulada&&x.apta_resolucao).map(x=>x.numero).filter((n,i,a)=>a.indexOf(n)===i).sort((a,b)=>a-b),[74,79,85])
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros_reconciliados:74,itens_oficiais_unicos:70,duplicatas_inelegiveis:4,anuladas:[74,79,85],gabaritos_vinculados:74,paginas_conferidas:[1,2,3],publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,edital,concurso,registros_reconciliados:74,itens_oficiais_unicos:70,questoes_unicas_elegiveis:70,questoes_anuladas:[74,79,85],duplicatas_inelegiveis:4,paginas_conferidas:[1,2,3],gabarito_definitivo_vinculado:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SEDUC/AL 2021 — Professor de Filosofia, Cargo 8 — revisão v485\n\n- Reconciliei 74 registros para 70 itens oficiais. Setenta questões únicas permanecem aptas à resolução; quatro cópias de OCR foram marcadas inelegíveis e vinculadas ao item canônico.\n- Classifiquei conteúdos em Filosofia antiga, teoria do conhecimento, lógica, ética, filosofia moderna e contemporânea, estética e ensino de Filosofia. Registrei banca, concurso, ano, cargo, aplicação em 17/10/2021 e dificuldade estimada.\n- Conferi visualmente as páginas 1–3, corrigi OCR e separei textos-base dos enunciados. Vinculei o gabarito definitivo e preservei as anulações oficiais dos itens 74, 79 e 85 sem atribuir resposta correta.\n- Pacote local; não publicado na nuvem.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo reproduzido em PDF](<${gabarito}>), [edital oficial](<${edital}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
