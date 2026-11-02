import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-pgdf-comunicacao-2019-v230',doc='f4da186a7bd5c9c9'
const fonte='https://cdn.cebraspe.org.br/concursos/PG_DF_19/arquivos/MATRIZ_521_PGDF_010_COM_JUSTIFICATIVA.PDF'
const concurso='PGDF 2019 — Cargo 10: Comunicação Social'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='MATRIZ_521_PGDF_010_COM_JUSTIFICATIVA.PDF'||catalog.questoes.length!==70)throw Error('Inventário da prova PGDF incompatível; eram esperados 70 itens, 50–119')
const prev=raizesAtuais.findIndex(x=>x.includes('revisao-emap-contratos-2018-v229'))
if(prev<0)throw Error('Base anterior v229 não encontrada')
const bases=raizesAtuais.slice(prev),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),want=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(want.has(q.id)){byId.set(q.id,q);want.delete(q.id)}
 if(!want.size)break
}
if(want.size)throw Error(`Questões ausentes do acervo: ${want.size}`)

const assuntos={
50:'Direito Administrativo: Procuradoria-Geral do Distrito Federal — organização e prerrogativas',
51:'Jornalismo: critérios de noticiabilidade e valores-notícia',52:'Jornalismo: fatores organizacionais e socioculturais de seleção de notícias',53:'Jornalismo: fontes de informação e construção da notícia',54:'Jornalismo: noticiabilidade, acontecimento e rotinas produtivas',55:'Teoria do Jornalismo: pseudoevento e construção midiática',56:'Jornalismo: distorção involuntária e critérios de seleção',
57:'Comunicação Organizacional: história da comunicação institucional no Brasil',58:'Assessoria de Comunicação: redemocratização e relações com a imprensa',59:'Comunicação Organizacional: terceiro setor, imagem e relações públicas',60:'Comunicação para o Desenvolvimento: extensão rural e Projeto SACI',61:'Teoria da Comunicação: indústria cultural, cultura de massa e teoria crítica',62:'Políticas de Comunicação: Nova Ordem Mundial da Informação e Comunicação',
63:'Redação Jornalística: pirâmide invertida e lead',64:'Edição Jornalística: organização da informação em mídia impressa e televisão',65:'Entrevista Jornalística: formatos e condução do diálogo',66:'Assessoria de Imprensa: release como fonte de pauta',67:'Apuração Jornalística: verificação, pluralidade e equilíbrio de versões',68:'Assessoria de Imprensa: briefing e preparação de entrevistas',69:'Assessoria de Imprensa: spin doctor e gestão de enquadramento',70:'Assessoria de Imprensa: esvaziamento de pauta e agenda midiática',71:'História da Assessoria de Imprensa: Ivy Lee e ética profissional',72:'Jornalismo Digital: jornalismo das fontes e mediação editorial',73:'Comunicação Pública: AERP e comunicação governamental',74:'Assessoria de Imprensa: decisão editorial e valor-notícia institucional',
75:'Ética em Assessoria de Imprensa: independência editorial e área comercial',76:'Relações Institucionais: lobby e atribuições da assessoria de imprensa',77:'Entrevista: informação em off e regras de confidencialidade',78:'Assessoria de Imprensa: relacionamento profissional com jornalistas',79:'Assessoria de Imprensa: agendamento e interesse público',80:'Ética Jornalística: independência editorial e conflito comercial',81:'Entrevista Coletiva: pluralidade de perguntas e tratamento da imprensa',82:'Assessoria de Imprensa: limites de interferência na publicação',83:'Media Training: treinamento para diferentes níveis organizacionais',84:'Entrevista: gravação, registro e transparência',85:'Comunicação Pública: entrevistas de agentes públicos e acesso à informação',86:'Media Training: preparação para entrevistas e perguntas críticas',87:'Assessoria de Imprensa: relacionamento e acompanhamento de repercussão',88:'Jornalismo Institucional: cobertura factual e atualidade',89:'Assessoria de Imprensa: clipping e monitoramento de mídia',90:'Media Training: adequação de declarações ao tema e domínio técnico',
91:'Assessoria de Imprensa: eventos de relacionamento e formação de jornalistas',92:'Jornalismo Público: jornalismo cívico e participação social',93:'Comunicação Organizacional: mídia espontânea e conteúdo editorial',94:'Comunicação de Crise: prevenção e preparação organizacional',95:'Comunicação de Crise: governança e resposta institucional',96:'Comunicação Pública: nota oficial e esclarecimento à população',97:'Redação Jornalística: lead e hierarquia da informação',98:'Gêneros Jornalísticos: informação factual e contextualização',99:'Gêneros Jornalísticos: tipologia dos textos impressos',100:'Gêneros Jornalísticos: notícia, reportagem e aprofundamento',101:'Redação Jornalística: nota e síntese de fatos de interesse público',102:'Assessoria de Imprensa: estrutura e elementos do release',103:'Gêneros Jornalísticos: entrevista e organização narrativa',104:'Planejamento Editorial: pauta, edição e distribuição de matérias',105:'Redação Jornalística: nariz de cera e introdução não objetiva',106:'Estilo Jornalístico: figuras de linguagem, precisão e objetividade',107:'Gêneros Opinativos: artigo, editorial, crônica e resenha crítica',
108:'Editoração: legibilidade, tipografia, entrelinha e comprimento de linha',109:'Editoração: intertítulos e navegação em textos longos',110:'Jornalismo Impresso: primeira página, chamadas e localização de conteúdo',111:'Design Editorial: hierarquia visual, zonas de leitura e áreas mortas',112:'Comunicação Digital: release online e distinção entre jornalismo e publicidade',113:'Jornalismo de Dados: tabelas, gráficos e apresentação de dados quantitativos',114:'Design para Web: contraste cromático e hierarquia visual',115:'Redação Digital: função conativa e linguagem publicitária',116:'Jornalismo Digital: pirâmide deitada e níveis de leitura',117:'Design Editorial Digital: organização da página inicial de jornal online',118:'Tipografia: paica e sistemas de medida gráfica',119:'Editoração: sangria, área impressa e mancha gráfica'
}
const simples=new Set([51,54,55,57,58,59,63,65,66,71,73,77,78,82,83,84,89,90,92,93,97,101,104,105,108,109,110,118,119])
const complexas=new Set([53,56,60,61,62,64,67,69,70,72,74,76,80,81,85,88,95,98,99,103,106,107,111,113,114,115,116,117])
const comandos={
 50:'À luz da Lei Complementar do Distrito Federal n.º 395/2001, que dispõe sobre a organização da Procuradoria-Geral do Distrito Federal, julgue o item.',
 jornalismoNoticia:'No que diz respeito à noticiabilidade e à notícia, julgue os itens subsequentes.',
 tecnicas:'A respeito de técnicas de elaboração da notícia, julgue os itens que se seguem.',
 assessoria:'A respeito da produção da notícia e das rotinas do assessor de imprensa, julgue os itens seguintes.',
 controle:'Acerca das possibilidades de uma organização exercer o controle institucional da informação, julgue os itens subsequentes.',
 editacao:'Com base nos critérios que devem ser seguidos na preparação de originais e na editoração, julgue os itens subsequentes.'
}
function context(n){if(n===50)return comandos[50];if(n<=62)return comandos.jornalismoNoticia;if(n<=74)return comandos.tecnicas;if(n<=93)return comandos.assessoria;if(n<=107)return comandos.controle;return comandos.editacao}
const decisions=[]
for(const e of catalog.questoes){
 const q=byId.get(e.id),n=e.numero,img=`paginas/${doc}-${String(e.pagina).padStart(4,'0')}.webp`
 if(!q||!assuntos[n])throw Error(`Item sem classificação individual: ${n}`)
 if(q.pagina!==e.pagina)throw Error(`Página catalogada difere do registro no item ${n}`)
 await fs.access(`public/acervo-extraido/${img}`)
 decisions.push({id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:n===50?'Direito Administrativo':'Comunicação Social',conteudo:assuntos[n],ano:2019,concurso,numero_original:n,pagina:e.pagina,
  dificuldade:simples.has(n)?'Fácil':complexas.has(n)?'Difícil':'Média',dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pelo tipo de conhecimento e pela quantidade de conceitos que o item combina; a banca não publica métrica psicométrica individual.',
  texto_apoio:context(n),
  classificacao_fonte:{documento:catalog.arquivo,prova:fonte,pagina_catalogo:catalog.pagina_catalogo,metodo:'Leitura individual do enunciado e do bloco temático no caderno oficial; não inferir resposta apenas pelo assunto.'},
  visual:{pagina:e.pagina,imagem:img,texto_apoio:context(n),motivo:`Página ${e.pagina} do caderno oficial conferida e associada ao item ${n}; não há figura externa indispensável neste item textual.`},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],apta_resolucao:true,
  motivo:`Classificação individual por conteúdo: ${assuntos[n]}. A chave existente não foi criada nem alterada nesta revisão.`})
}
if(decisions.length!==70)throw Error(`Esperados 70 itens; encontrados ${decisions.length}`)
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[prev],decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,itens_revisados:70,novas_classificacoes:report.novas_classificacoes,contextos_associados:70,paginas_origem:[7,8,9,10,11,12,13],publicado:false},null,2))
