import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='174c4e0f841f1539'
const prova='https://cdn.cebraspe.org.br/concursos/TJ_ES_23/arquivos/803_TJ_ES_019_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/TJ_ES_23/arquivos/GAB_DEFINITIVO_803_TJ_ES_019_01.PDF'
const concurso='TJ/ES 2023 — Analista Judiciário — Apoio Especializado — Serviço Social'
const cargo='Analista Judiciário — Apoio Especializado — Especialidade: Serviço Social'
const organizadora='CEBRASPE'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.url!==prova)throw Error('Caderno divergente do catálogo documental')
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const selected=records.filter(q=>q.classificacao_pendente&&q.numero>=51&&q.numero<=90)
if(selected.length!==38||new Set(selected.map(q=>q.numero)).size!==38)throw Error(`Esperados 38 itens únicos pendentes, recebidos ${selected.length}`)

const content={
51:['Serviço Social','Fundamentos históricos e teórico-metodológicos: tendências de análise da profissão','Média'],
52:['Serviço Social','Fundamentos teórico-metodológicos: produção e reprodução social e mediações','Difícil'],
53:['Serviço Social','Trabalho profissional: espaços ocupacionais, assalariamento e divisão social do trabalho','Média'],
54:['Serviço Social','Trabalho profissional: transformações societárias e financeirização','Média'],
55:['Serviço Social','Fundamentos históricos: perspectiva endógena e relações sociais','Média'],
56:['Serviço Social','Projeto ético-político: renovação e reconceituação do Serviço Social brasileiro','Média'],
57:['Serviço Social','Ética profissional: história dos congressos e revisão do Código de Ética','Difícil'],
58:['Serviço Social','Ética profissional: princípios fundamentais do Código de Ética','Fácil'],
59:['Serviço Social','Legislação profissional: competências do CFESS e fiscalização profissional','Média'],
60:['Serviço Social','Legislação profissional: direitos e manifestações em matéria de Serviço Social','Média'],
61:['Serviço Social','Formação profissional: estágio supervisionado e supervisão acadêmica','Média'],
62:['Serviço Social','Formação profissional: história e reformulação curricular','Média'],
63:['Serviço Social','Pesquisa social: história, método e conhecimento do ser social','Média'],
64:['Serviço Social','Formação profissional: projeto pedagógico, valores e diretrizes','Média'],
65:['Serviço Social','Assessoria, consultoria e supervisão em Serviço Social','Média'],
66:['Serviço Social','Gestão e avaliação de programas e projetos sociais','Média'],
67:['Serviço Social','Trabalho profissional: dimensão técnico-operativa e divisão do trabalho','Média'],
68:['Serviço Social','Trabalho profissional: dimensão técnico-operativa e reconhecimento da profissão','Média'],
70:['Serviço Social','Mobilização social, participação e projeto ético-político','Média'],
71:['Seguridade Social','Organização e gestão da seguridade social: participação da comunidade','Média'],
73:['Assistência Social','SUAS: benefícios eventuais e competências dos conselhos','Média'],
74:['Saúde','SUS: subsistema de atenção à saúde indígena e organização descentralizada','Média'],
75:['Saúde','SUS: direitos dos povos indígenas e participação na avaliação de políticas','Média'],
76:['Serviço Social','Atuação profissional na saúde: orientação a familiares após óbito','Média'],
77:['Serviço Social','Legislação profissional: atribuições privativas e coordenação de atividades','Média'],
78:['Serviço Social','Ética profissional: sigilo e dever de depor','Média'],
79:['Serviço Social','Ética profissional: penalidades disciplinares','Fácil'],
80:['Serviço Social','Atuação profissional na saúde: comunicação de óbito e limites de atribuição','Média'],
81:['Direito da Criança e do Adolescente','ECA: requisitos para adoção','Média'],
82:['Direitos Humanos','Proteção da pessoa com deficiência e remoção em situação de violência doméstica','Média'],
83:['Direito da Criança e do Adolescente','ECA: acolhimento institucional e programa de apadrinhamento','Média'],
84:['Direitos da Pessoa com Deficiência','Atendimento domiciliar em perícia médica e acessibilidade','Média'],
85:['Direito à Saúde','Direitos da pessoa com deficiência internada e acompanhante','Média'],
86:['Direito da Mulher','Lei Maria da Penha: manutenção do vínculo de trabalho após afastamento','Média'],
87:['Direito da Mulher','Lei Maria da Penha: assistência à mulher em situação de violência','Média'],
88:['Direito da Saúde','Notificação compulsória de violência contra pessoa idosa','Média'],
89:['Direito da Mulher','Lei Maria da Penha: penas vedadas e cesta básica','Média'],
90:['Direito da Mulher','Lei Maria da Penha: intimação do agressor e procedimento','Média']
}
const key={51:'E',52:'C',53:'E',54:'C',55:'E',56:'C',57:'E',58:'C',59:'E',60:'C',61:'X',62:'C',63:'E',64:'C',65:'C',66:'X',67:'C',68:'E',69:'C',70:'C',71:'C',72:'E',73:'E',74:'C',75:'C',76:'C',77:'C',78:'E',79:'C',80:'E',81:'E',82:'C',83:'C',84:'C',85:'C',86:'C',87:'C',88:'C',89:'E',90:'E'}
const stems={
51:'As tendências de análise no serviço social brasileiro renegam uma intervenção pautada na realidade social.',
52:'As mediações que constituem o processo de produção e reprodução social envolvem as dimensões social, política, econômica, cultural e religiosa, bem como questões de gênero, idade e etnia.',
53:'Um dos pilares de maior sustentação dos espaços ocupacionais do serviço social é a mediação do trabalho assalariado na esfera estatal, única forma de profissionalização do serviço social.',
54:'As transformações nas relações e nos espaços ocupacionais do assistente social remontam a dinâmicas da acumulação, sob a prevalência de interesses financeiros.',
55:'Ainda que o serviço social brasileiro seja produto das transformações sociais, uma visão endógena da profissão deve ser preservada.',
56:'As bases que deram origem a uma nova perspectiva ético-política para o serviço social brasileiro foram estabelecidas entre 1970 e 1980.',
57:'O VII Congresso Brasileiro de Assistentes Sociais (CBAS) e o II Seminário Nacional de Ética, ambos realizados em 1992, foram determinantes para revisão do Código de Ética de 1975.',
58:'O reconhecimento da liberdade, a defesa dos direitos humanos, o aprofundamento da democracia e o compromisso com a qualidade dos serviços prestados são princípios fundamentais do serviço social.',
59:'Ao Conselho Federal de Serviço Social (CFESS) compete fiscalizar a prática profissional e as instituições sociais de educação.',
60:'Cabe ao assistente social o direito à manifestação em matéria de sua especialidade, quando se tratar de assuntos de interesse da população.',
61:'Conforme a Resolução n.º 15/2002 do CFESS, o estágio supervisionado é uma atividade curricular obrigatória e deve ser realizado conjuntamente pelo professor supervisor.',
62:'O debate acerca da reformulação curricular do serviço social caracterizou a profissão em um viés de caráter interventivo.',
63:'Para compreender as relações que envolvem o ser social, deve-se abrir mão do conhecimento de processos históricos, bem como do método que permite conhecê-los.',
64:'A partir de 1990, a formação profissional do assistente social sofreu mudanças profundas no projeto pedagógico da profissão, tornando possível estabelecer um conjunto de valores e diretrizes para a construção do perfil profissional.',
65:'A assessoria em serviço social pode ser compreendida como a ação desenvolvida por profissional que toma a realidade como objeto de estudo e tem a intenção de alterá-la.',
66:'O avanço dos modelos de avaliação ocorreu a partir das décadas de setenta e noventa, em especial sob uma ótica gerencialista.',
67:'É por meio do trabalho especializado coletivo que o serviço social se insere na divisão social e técnica do trabalho.',
68:'A dimensão técnica da prática profissional do assistente social não é devidamente reconhecida, o que invisibiliza a profissão.',
70:'Mobilização social pode ser compreendida como a maneira de construir, na prática, o projeto ético de soberania, cidadania, dignidade e pluralismo político.',
71:'A participação da comunidade, em especial de trabalhadores, empresários e aposentados, na gestão é um princípio da seguridade social.',
73:'O benefício eventual temporário é devido às crianças e aos adolescentes em situação de calamidade pública, e seus critérios de concessão e valores são definidos pelos conselhos municipais de serviços sociais.',
74:'O subsistema de atenção à saúde indígena deve ser financiado pela União e seu funcionamento deve ser descentralizado, hierarquizado e regionalizado.',
75:'As populações indígenas devem ter acesso aos serviços especializados do Sistema Único de Saúde (SUS) e direito de participar da avaliação de políticas de saúde.',
76:'Em caso de óbito do paciente, cabe ao assistente social do setor de saúde informar os familiares a respeito da rede de serviços para o sepultamento e o translado.',
77:'É considerada atribuição privativa do assistente social a elaboração e direção de projetos e a coordenação de seminários na área de serviço social.',
78:'É dever do assistente social depor sobre situação sigilosa de seu exercício profissional quando demandado pela autoridade competente.',
79:'As advertências reservada e pública são penalidades que podem ser aplicadas ao assistente social.',
80:'É atribuição do assistente social que trabalha na área da saúde comunicar à família o óbito do paciente.',
81:'Cláudia pode adotar uma criança que tenha doze anos de idade e esteja em acolhimento institucional.',
82:'Caso seja vítima de violência doméstica, Cláudia terá direito à remoção.',
83:'É possível a participação de Cláudia em programa de apadrinhamento de uma criança em situação de acolhimento institucional.',
84:'Cláudia pode solicitar atendimento domiciliar da perícia médica do Instituto Nacional do Seguro Social (INSS), considerando-se que seu deslocamento acarretará ônus indevido.',
85:'É direito de Cláudia ter acompanhante em tempo integral caso seja internada em instituição de saúde.',
86:'A vítima pode ter assegurado por seis meses o seu vínculo trabalhista caso precise se afastar do local de trabalho.',
87:'A vítima tem direito à contracepção de emergência e à profilaxia da síndrome da imunodeficiência adquirida (AIDS).',
88:'Um caso suspeito de violência contra uma idosa, identificado pelo serviço de saúde, é objeto de notificação compulsória.',
89:'A entrega de cestas básicas é uma opção de pena para o agressor.',
90:'A notificação do agressor pode ser realizada pela ofendida caso sua localização pela autoridade policial não seja possível.'
}
const answerDigest=hashRevisao(Array.from({length:40},(_,i)=>`${i+51}:${key[i+51]}`).join('\n'))
const decisions=selected.map(q=>{
 const n=Number(q.numero),topic=content[n],answer=key[n]
 if(!topic||!stems[n]||!answer)throw Error(`Item ${n} ausente da classificação ou gabarito`)
 const page=n<=75?1:2,image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const apoio=n<=51?'Com base nos fundamentos históricos e teórico-metodológicos do serviço social, julgue o item.':n<=54?'Considerando o redimensionamento da profissão de serviço social ante as transformações societárias, as condições e relações de trabalho, os espaços sócio-ocupacionais e as atribuições, julgue o item.':n<=56?'Com base no projeto ético-político do serviço social, julgue o item.':n<=57?'Acerca dos fundamentos éticos do serviço social, julgue o item.':n<=60?'Com base na legislação pertinente ao assistente social, julgue o item.':n<=62?'Considerando a reformulação curricular do serviço social, julgue o item.':n<=64?'Considerando a dimensão investigativa, o planejamento e a intervenção profissional, os fundamentos teórico-metodológicos e a pesquisa social, julgue o item.':n<=66?'Acerca de planejamento, operacionalização, avaliação de programas e projetos, assessoria, consultoria e supervisão em serviço social, julgue o item.':n<=68?'No que se refere à dimensão técnico-operativa, aos instrumentos e às técnicas do serviço social, julgue o item.':n===70?'Julgue o item sobre mobilização social, estudo social, perícia social, relatório social, laudo social e parecer social.':n<=75?'Julgue o item sobre seguridade social, direitos sociais e políticas públicas.':n<=80?'Em relação ao exercício da profissão de assistente social, julgue o item.':n<=85?'Cláudia, de vinte anos de idade, é solteira, servidora pública e considerada pessoa com deficiência moderada. Considerando essa situação hipotética, julgue o item.':'Em relação à violência doméstica e familiar contra a mulher, julgue o item.'
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2023,concurso,cargo,organizadora,aplicacao:'TJ/ES — Analista Judiciário — Serviço Social',numero_original:n,pagina:page,enunciado:stems[n],opcoes:['Certo','Errado'],resposta_correta:answer==='C'?0:answer==='E'?1:null,anulada:answer==='X',dificuldade:topic[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e normativa; não é classificação oficial da banca.',classificacao_fonte:prova,motivo:`CEBRASPE — TJ/ES 2023, Cargo 19 — Serviço Social, item ${n}; tema e texto conferidos na imagem do caderno oficial.`,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_803_TJ_ES_019_01.PDF',prova:'803_TJ_ES_019_01.PDF',sha256:answerDigest,sha256_tipo:'sha256_da_transcricao_canonica_dos_itens_51_a_90; nao_e_hash_do_pdf',hash_metodo:'SHA-256 da sequência canônica item:resposta transcrita da tabela do gabarito oficial definitivo; não representa o hash do PDF.',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo CEBRASPE, Cargo 19 — Serviço Social; X indica item anulado.'},apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto'],texto_apoio:apoio,reemplazarContexto:true,imagens_contexto:[{pagina:page,imagem:image,texto:apoio}],visual:{pagina:page,imagem:image,texto_apoio:apoio,motivo:`Página ${page} do caderno oficial conferida visualmente; item ${n}, cabeçalho e contexto associados.`}}
})
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(decisions.filter(d=>d.anulada).map(d=>d.numero_original).join(',')!=='61,66')throw Error('Anulações divergentes do gabarito oficial')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registros:38,itensUnicos:38,anuladas:2,paginas:[1,2],publicado:false},null,2));process.exit(0)}

const name='revisao-tjes-2023-cargo19-servico-social-itens51-90-v316'
const result=await aplicarRevisoesIndividuais({nome:name,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${name}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:concurso,cargo,registrosRevistos:38,itensUnicos:38,anuladas:[61,66],paginasConferidas:[1,2],gabaritoDefinitivo:gabarito,publicado:false,observacao:'Dois itens (61 e 66) anulados segundo a tabela definitiva. O SHA-256 é da transcrição canônica item/resposta, não do PDF.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## TJ/ES 2023 — Cargo 19, Serviço Social — itens 51–90 — v316\n\n- Revisei e classifiquei 38 itens pendentes em Serviço Social, Seguridade Social, Assistência Social, Saúde, Direito da Criança e do Adolescente, direitos da pessoa com deficiência e violência doméstica.\n- Corrigi a segmentação de enunciados e removi trechos de contexto que pertenciam à instrução do bloco ou ao item seguinte. Associei as páginas originais e instruções específicas de cada conjunto.\n- Vinculei o gabarito oficial definitivo. Os itens 61 e 66 foram anulados pela banca e ficam sem pontuação automática. Os itens 69 e 72 já estavam classificados e foram preservados.\n- Validação local: ${result.total} questões, ${result.disponiveis} elegíveis, ${result.pendentes} pendências globais; publicação na nuvem não realizada.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo oficial](<${gabarito}>).\n`)
console.log(JSON.stringify(report,null,2))
