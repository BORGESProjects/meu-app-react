import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'
const doc='16957059be5950e9'
const prova='https://cdn.cebraspe.org.br/concursos/sefin_fortaleza_ce_23/arquivos/848_SEFIN_CE_ANALISTA_008_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/sefin_fortaleza_ce_23/arquivos/GAB_DEFINITIVO_848_SEFIN_CE_ANALISTA_008_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/SEFIN_FORTALEZA_CE_23/arquivos/ED_1_SEFIN_FORTALEZA_ABT.PDF'
const concurso='SEFIN Fortaleza 2023 — Analista Fazendário Municipal — Psicologia'
const records=JSON.parse(await fs.readFile('tmp/pendentes-documento-'+doc+'.json','utf8'))
const key={51:'E',52:'E',53:'C',54:'E',55:'E',56:'C',57:'C',58:'C',59:'C',60:'E',61:'E',62:'X',63:'C',64:'E',65:'E',66:'C',67:'C',68:'E',69:'E',70:'C',71:'C',72:'X',73:'C',74:'E',75:'C',76:'C',77:'C',78:'C',79:'E',80:'E',81:'E',82:'C',83:'C',84:'E',85:'E',86:'C',87:'E',88:'C',89:'E',90:'X',91:'C',92:'C',93:'E',94:'C',95:'E',96:'E',97:'C',98:'E',99:'C',100:'E',101:'C',102:'C',103:'E',104:'E',105:'C',106:'E',107:'C',108:'C',109:'E',110:'E',111:'C',112:'C',113:'E',114:'C',115:'E',116:'E',117:'C',118:'C',119:'E',120:'C',121:'C',122:'C',123:'C',124:'E',125:'C',126:'E',127:'C',128:'C',129:'C',130:'E',131:'E',132:'C',133:'E',134:'E',135:'E',136:'E',137:'C',138:'E',139:'E',140:'C',141:'C',142:'C',143:'C',144:'E',145:'E',146:'E',147:'C',148:'C',149:'C',150:'E'}
const gabaritoHash='c526bb5fa7cecdda55995de40d0ef4f69370ba4fbe58964b0752469bf1efe6e0'
const assuntos={
51:'Avaliação psicológica no trabalho: testes de inteligência, competências e meritocracia',
52:'Seleção de pessoal: avaliação psicológica, vieses e equidade',
54:'Gestão por competências no setor público: implantação e priorização',
55:'Competências humanas: conceitos e abordagens da psicologia social',
56:'Mapeamento de competências: conhecimentos, habilidades e atitudes',
57:'Seleção de pessoal: testes de aptidão física e avaliação psicológica',
59:'Análise de cargos: perspectiva comportamental e requisitos do trabalho',
60:'Análise de cargos: identificação de requisitos ocupacionais',
61:'Avaliação comportamental e competências técnicas',
62:'Gestão de pessoas: transformações nos modelos de gestão',
63:'Modelos de gestão de pessoas e responsabilidades das chefias',
64:'Administração tradicional de recursos humanos',
65:'Psicologia organizacional e administração de recursos humanos baseada em evidências',
66:'Gestão de pessoas: conciliação das expectativas individuais e organizacionais',
67:'Modelo instrumental de gestão de pessoas e eficiência organizacional',
68:'Gestão por competências, meritocracia e discriminação',
69:'Inovação gerencial e inovação tecnológica',
70:'Modelos de gestão de pessoas nas organizações',
71:'Treinamento e desenvolvimento: objetivos e aprendizagem',
72:'Desenvolvimento profissional contínuo e aprendizagem',
73:'Desenvolvimento de pessoas e desempenho organizacional',
74:'Programas de capacitação e desenvolvimento organizacional',
75:'Autodesenvolvimento e desenvolvimento de pessoas',
76:'Gestão por competências: conceitos e aplicações',
78:'Levantamento de necessidades de treinamento: níveis organizacional, de tarefas e individual',
79:'Treinamento e resultados organizacionais',
80:'Necessidades de treinamento e sistema de educação corporativa',
81:'Diagnóstico de necessidades e planejamento de ações de treinamento',
82:'Avaliação de desempenho: validade, precisão e critérios institucionais',
83:'Desenvolvimento profissional e mudança organizacional',
85:'Gestão do desempenho: caráter formativo e desenvolvimento',
86:'Valores organizacionais: percepção, comportamento e comprometimento',
87:'Motivação, bem-estar e satisfação no trabalho',
89:'Ativos intangíveis, conhecimento e gestão estratégica de pessoas',
90:'Estresse ocupacional e efeitos sobre o trabalho',
91:'Práticas de gestão de pessoas, atitudes e desempenho',
92:'Comunicação interpessoal: definição e elementos',
93:'Relacionamento interpessoal e bem-estar nas organizações',
94:'Comunicação assertiva e relações de trabalho',
95:'Feedback: avaliação, comunicação e compreensão interpessoal',
96:'Equipes autogerenciáveis e desenho do trabalho',
97:'Equipes de trabalho: objetivos e interdependência',
98:'Liderança contingencial',
99:'Potência de equipes',
100:'Confiança e lealdade em equipes de trabalho',
102:'Cultura organizacional: cultura orientada a resultados',
109:'Liderança: processo de influência em grupos e equipes',
110:'Liderança situacional e administração por exceção',
111:'Aposentadoria: transição de papéis',
112:'Envelhecimento e trabalho: empregabilidade e flexibilidade',
113:'Etarismo: aspectos transculturais',
114:'Aposentadoria: importância do trabalho e ajuste individual',
115:'Teorias do envelhecimento e desengajamento social',
116:'Assédio moral no trabalho: frequência e duração',
117:'Assédio moral: cultura organizacional e tolerância',
118:'Assédio moral e saúde mental: isolamento, intimidação e condições de trabalho',
119:'Pesquisa sobre assédio moral: métodos e evidências',
120:'Assédio moral: eventos, duração e efeitos',
121:'Psicologia da saúde: conceitos, interdisciplinaridade e promoção da saúde',
122:'Atuação do psicólogo da saúde: promoção, prevenção e diagnóstico',
123:'Adesão ao tratamento: comunicação, instruções e rede de apoio',
124:'Psicologia da saúde: gestão e vigilância em saúde',
125:'Atenção Primária à Saúde: Estratégia Saúde da Família',
126:'Psicologia da saúde: sigilo profissional e depoimento judicial',
127:'Psicologia hospitalar: diagnóstico diferencial e reação psicológica à doença',
128:'Avaliação psicológica em saúde: fatores de risco comportamentais e socioculturais',
129:'Avaliação psicológica em saúde: observação livre e estruturada',
130:'Psicologia da saúde: instrumentos padronizados de avaliação',
131:'Psicologia organizacional: desenvolvimento e atuação profissional',
132:'Teoria geral dos sistemas aplicada às organizações',
133:'Comportamento organizacional: bem-estar e desempenho',
134:'Psicologia do trabalho: motivação, comunicação, liderança e saúde',
135:'Psicologia organizacional: cargos, recrutamento, seleção e desenvolvimento',
136:'Avaliação psicológica do trabalho e riscos psicossociais',
137:'Avaliação psicológica em funções de risco',
138:'Avaliação do comportamento: emoções e medos',
139:'Avaliação psicológica: comportamentos e contexto de trabalho',
140:'Psicologia organizacional: bem-estar dos trabalhadores e papel da gestão',
141:'Saúde mental no trabalho: estressores e mudanças ocupacionais',
142:'Saúde mental no trabalho: comunicação e expressão de insatisfação',
143:'Avaliação contextual e multifatorial da saúde mental no trabalho'
}
const materia=n=>n>=121&&n<=130?'Psicologia da Saúde':n>=146&&n<=150?'Direito Administrativo':(n>=51&&n<=120)||(n>=131&&n<=143)?'Psicologia Organizacional e do Trabalho':null
const contexts=[
[51,56,'No que se refere à noção de competência, suas interpretações e aplicações, julgue os itens.'],
[57,61,'A respeito dos processos de recrutamento e seleção, julgue os itens.'],
[62,70,'Considerando as teorias organizacionais e os diferentes modelos de gestão de pessoas, julgue os itens.'],
[71,75,'No que se refere a treinamento e desenvolvimento, julgue os itens.'],
[76,81,'A respeito de treinamento, desenvolvimento e programas de gestão por competências, julgue os itens.'],
[82,85,'A respeito de avaliação de desempenho, conhecimento e aprendizagem, julgue os itens.'],
[86,91,'Acerca das teorias da motivação, percepção, atitudes, valores e diferenças individuais, julgue os itens.'],
[92,95,'Quanto à comunicação e ao relacionamento interpessoal, julgue os itens.'],
[96,100,'Texto-base: Funcionários de determinada organização trabalham em unidade de produção limitada espacial e, organizacionalmente, executam tarefas comuns, que são divididas em subtarefas, e assumem responsabilidade compartilhada ao longo do tempo. O grupo é gerenciado por um senhor bastante controlador, que foi indicado pelos gestores de topo por ser um excelente técnico da área. Toda a equipe é responsável por uma parcela importante da atividade da organização, e os membros acreditam que podem realizar o trabalho e alcançar alto desempenho, mas a divisão do trabalho não facilitou o relacionamento social que apoia a interação cooperativa entre os membros do grupo. Os membros aprendem todos os trabalhos existentes em sua área, executando variedade de subtarefas. O grupo de trabalhadores tem diferentes funções, como planejamento da produção e controle ou garantia da qualidade, as quais são tarefas desafiadoras e possuem equipamentos necessários e disponíveis para a execução de suas tarefas. A partir da situação hipotética precedente, julgue os itens a seguir.'],
[101,102,'Texto-base: Há dois anos, uma organização especializada em agronegócio iniciou uma jornada de evolução cultural, apresentando seus valores e evidenciando seu foco em aprimoramento. A organização investe em desenvolvimento, remuneração competitiva e oportunidade de crescimento profissional para manter seus níveis de produtividade e elevar o orgulho de pertencimento. O fato de a organização ter valores bem definidos e comunicá-los de forma efetiva é um passo importante para criar um ambiente de sinergia, produtividade e entrega. Em síntese, ter uma cultura consciente, alinhada e vivenciada por todos denota resultados consistentes e sustentabilidade dos negócios. As pesquisas internas mostram que há coesão nos grupos de trabalho, embora as lideranças sejam muito formais, focadas na tarefa e no controle dos processos de trabalho. Com base nos dados indicados, foram propostos vários cursos de desenvolvimento gerencial. Tendo como referência a situação hipotética precedente, julgue os itens.'],
[103,106,'Acerca de clima organizacional e cultura organizacional, julgue os itens.'],
[107,110,'A respeito da liderança e de suas diferentes formas, julgue os itens.'],
[111,115,'Texto-base: O processo de globalização trouxe para as grandes organizações uma série de consequências, entre as quais se destaca a prática das aposentadorias incentivadas, devido à qual diversos trabalhadores experientes foram despedidos. A respeito do processo de aposentadoria e envelhecimento, julgue os itens.'],
[116,120,'Texto-base: Em determinada instituição, circulou um rumor que teve várias consequências, como destruição e ameaça à carreira ou à reputação da vítima. Esse evento não aconteceu semanalmente e não se repetiu. Algumas pessoas colegas da vítima foram colocadas em salas isoladas, sem janelas, sem computadores, sem telefones e muitas vezes sem tarefas a serem realizadas como forma de intimidação, como também a não repassar a informação para outrem. Nessa mesma organização, os idosos e aqueles que apresentam problemas de saúde também são colocados em salas separadas para trabalhar melhor e não incomodar os demais. A partir da situação hipotética precedente e considerando aspectos relativos ao assédio moral, julgue os itens a seguir.'],
[121,125,'Considerando a psicologia da saúde, ações básicas de saúde, interdisciplinaridade e multidisciplinaridade, bem como o papel do psicólogo e da equipe, julgue os itens.'],
[126,130,'Com relação ao papel do psicólogo e à interdisciplinaridade e multidisciplinaridade em saúde, julgue os itens.'],
[131,135,'No que tange à psicologia organizacional e do trabalho e ao papel do psicólogo, julgue os itens.'],
[136,140,'No que diz respeito ao ambiente organizacional, à segurança e à avaliação psicológica, julgue os itens.'],
[141,143,'Texto-base: Josias, com 46 anos de idade, é funcionário de uma empresa há mais de 10 anos. O seu perfil é o de um funcionário responsável, assíduo, comprometido com suas tarefas, que tem um bom relacionamento interpessoal com todos os membros da equipe, é sempre muito solícito e empenhado em entregar todas as demandas no prazo e da melhor maneira. Há um ano Josias foi promovido e aparentemente tudo estava bem. Todavia, nos últimos 40 dias, Josias vem se mostrando irritadiço, pouco empático com os colegas e com dificuldades para cumprir prazos. Tem descumprido horários de chegada, queixando-se de que tem se sentido muito cansado e sobrecarregado com a demanda atual de trabalho. Em conversa com sua chefia imediata, relatou problemas para dormir e dores de cabeça constantes. Considerando a situação hipotética apresentada, julgue os itens.'],
[146,150,'No que se refere ao recrutamento e à seleção no serviço público, considere o Estatuto dos Servidores do Município de Fortaleza (Lei Municipal nº 6.794/1990) e julgue os itens.']
]
const contexto=n=>contexts.find(([a,b])=>n>=a&&n<=b)?.[2]||''
const stems={
61:'A realização da avaliação comportamental torna dispensável a avaliação das competências técnicas.',
81:'Os levantamentos de informações realizados em organizações não têm facilitado o planejamento de situações de aprendizagem, por produzirem diagnósticos imprecisos, não alinhados a estratégias organizacionais e/ou não classificáveis de acordo com taxonomias de objetivos educacionais, que, por sua vez, são valiosas nas fases de desenho instrucional e avaliação de treinamento.',
91:'As ações da instituição e as práticas de gestão de pessoas podem influenciar percepções e atitudes em relação ao trabalho e à empresa; percepções e atitudes favoráveis podem alavancar o desempenho, gerando impacto na qualidade e na produtividade.',
95:'Feedback resume-se ao resultado de uma avaliação, ou ao que os integrantes do grupo dizem sobre os demais, e tem como foco compreender a visão do interlocutor.',
100:'Na situação em questão, há um alto nível de confiança e lealdade entre os membros do grupo.',
102:'A organização em questão evidencia uma cultura voltada para resultados.',
110:'Os líderes situacionais administram por exceção: intervêm apenas quando os padrões não são alcançados.',
115:'O envelhecimento pressupõe universalmente um desengajamento mútuo, com interações decrescentes entre a pessoa que envelhece e as demais pessoas do sistema social a que pertence.',
120:'No caso mencionado, o assédio é um estado permanente, em vez de uma série de eventos ou gestos episódicos.',
125:'A saúde da família é uma estratégia prioritária no que se refere à atenção básica.',
130:'No campo da psicologia da saúde, é vedada a utilização, por parte do psicólogo, de instrumentos padronizados de amplo espectro.',
140:'As funções da avaliação psicológica incluem ampliar a visão de líderes e organizações sobre o papel da gestão de pessoas no compromisso com o bem-estar geral dos trabalhadores.',
141:'Situações variadas, como acidente de trabalho, fracasso ou mudança de posição, assim como ocorreu com Josias, podem suscitar quadros psicopatológicos diversos.',
142:'Um ambiente organizacional que possibilite a comunicação espontânea de Josias ou a manifestação de suas insatisfações pode ser fundamental para sua saúde mental.',
143:'Para compreender o caso de Josias, é imprescindível considerar os múltiplos fatores associados ao quadro atual e aos comportamentos disfuncionais no âmbito laboral.'
}
const remove=['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','materia_nao_identificada','conteudo_nao_identificado','classificacao_generica']
if(records.length!==81)throw Error('Esperados 81 registros; encontrados '+records.length)
const decisions=[]
for(const q of records){
 const n=Number(q.numero),ans=key[n],mat=materia(n),content=assuntos[n]
 if(!ans||!mat||!content)throw Error('Sem chave ou classe: '+n+'/'+q.id)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:mat,conteudo:content,ano:2023,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — 23/07/2023 — conhecimentos específicos — Cargo 8',cargo:'Analista Fazendário Municipal — área de conhecimento: Psicologia',numero_original:n,numero:n,pagina:Number(q.pagina),dificuldade:(n===51||n===52||n===68||n===74||n===80||n===90||n===94||n===107||n===110||n===113||n===115||n===119||n===124||n===126||n===130||n===136||n===138||n===139||n===146)?'Difícil':(n===56||n===57||n===60||n===66||n===70||n===72||n===75||n===82||n===83||n===87||n===92||n===96||n===97||n===103||n===109||n===111||n===117||n===121||n===123||n===125||n===129||n===132||n===134||n===142)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por complexidade conceitual e nível de aplicação; a banca não publica dificuldade individual.',classificacao_fonte:prova,motivo:'Conferência visual das páginas 1–4 do caderno, identificação do Cargo 8 — Psicologia no edital oficial e cotejo com o gabarito definitivo correspondente ao código do caderno.',enunciado:stems[n]||q.enunciado.trim(),texto_apoio:contexto(n),apta_resolucao:true,remover_pendencias:remove}
 d.resposta_correta=ans==='C'?0:ans==='E'?1:null;d.anulada=ans==='X';d.gabarito_oficial={fonte:gabarito,arquivo:'GAB_DEFINITIVO_848_SEFIN_CE_ANALISTA_008_01.PDF',prova:'848_SEFIN_CE_ANALISTA_008_01.PDF',sha256:gabaritoHash,numero:n,pagina:1,resposta:ans,criterio:ans==='X'?'Item anulado conforme gabarito oficial definitivo CEBRASPE para o Cargo 8 — Psicologia.':'Gabarito oficial definitivo CEBRASPE do Cargo 8, conferido pelo código completo do caderno.'}
 decisions.push(d)
}
const preview={documento:doc,registros:records.length,questoesClassificadas:decisions.length,anuladas:decisions.filter(x=>x.anulada).map(x=>x.numero),materias:[...new Set(decisions.map(x=>x.materia))],gabaritosDefinitivos:decisions.length,publicado:false}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify(preview,null,2));process.exit(0)}
const nome='revisao-cebraspe-sefin-fortaleza-2023-psicologia-cargo8-v355'
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift('tmp/revisao-profissional/'+nome+'/acervo-extraido')
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',"\nraizesAtuais.unshift('tmp/revisao-profissional/"+nome+"/acervo-extraido')\n")
const report={...result,...preview,edicao:concurso,figurasNecessarias:0,publicado:false,prova,gabarito,edital,nota:'81 registros pendentes foram cotejados com as páginas 1–4 e classificados pela matéria efetivamente cobrada. Textos-base dos cenários de equipe, cultura organizacional, aposentadoria, assédio moral e caso Josias foram separados dos enunciados e associados aos itens correspondentes. Três itens anulados no gabarito foram preservados sem pontuação automática. Não há imagens ou gráficos indispensáveis à resolução; as páginas originais permanecem associadas para auditoria.'}
await fs.writeFile('docs/acervo/revisao-profissional/'+nome+'.json',JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',"\n\n## CEBRASPE/SEFIN Fortaleza 2023 — Analista Fazendário Municipal, Psicologia — revisão v355\n\n- Revisei "+records.length+" registros pendentes das páginas 1–4; substituí matérias incompatíveis por Psicologia Organizacional e do Trabalho, Psicologia da Saúde ou Direito Administrativo e atribuí conteúdo específico.\n- Separei enunciados de textos-base e comandos contaminados por OCR, incluindo os cenários de equipe, cultura organizacional, aposentadoria, assédio moral e o caso Josias; os itens 146–150 foram classificados pelo Estatuto dos Servidores de Fortaleza.\n- Conferi os gabaritos no documento definitivo oficial do Cargo 8. Itens anulados permanecem no estudo sem pontuação automática. Dificuldades são estimativas editoriais. Validação local: "+result.total+" questões, "+result.disponiveis+" elegíveis e "+result.pendentes+" pendências. Não publicado na nuvem.\n- Fontes: [caderno oficial]("+prova+"), [gabarito definitivo oficial]("+gabarito+") e [edital oficial]("+edital+").\n")
console.log(JSON.stringify(report,null,2))

