import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-camara-maceio-analista-legislativo-2024-pendencias-v413'
const doc='fe027f7801d67321'
const concurso='Câmara Municipal de Maceió/AL — Concurso 2024 — Cargo 2: Analista Legislativo'
const prova='https://cdn.cebraspe.org.br/concursos/camara_municipal_maceio_24/arquivos/972_CAMARA_MACEIO_002_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/camara_municipal_maceio_24/arquivos/GAB_DEFINITIVO_972_CAMARA_MACEIO_002_01.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==60||new Set(records.map(q=>q.id)).size!==60||new Set(records.map(q=>q.numero)).size!==57)throw Error('A fila mudou; reexporte antes de aplicar.')

const defs={
32:['Administração Pública','Reformas administrativas brasileiras: marco histórico da reforma de 1967'],
33:['Administração Pública','Reformas administrativas brasileiras: formação histórica do serviço público'],
34:['Administração','Teorias administrativas: abordagem neoclássica e comportamento grupal'],
36:['Administração','Administração científica: princípio da execução'],
38:['Administração','Processo decisório: centralização e natureza das decisões estratégicas'],
39:['Administração','Processo administrativo: continuidade e funções administrativas'],
42:['Administração','Estrutura organizacional: níveis gerenciais e departamentalização'],
43:['Gestão de Pessoas','Treinamento e desenvolvimento: etapas do processo de capacitação'],
44:['Gestão de Pessoas','Papéis de linha e de staff na gestão de pessoas'],
45:['Gestão de Pessoas','Análise e descrição de cargos e gestão do desempenho'],
46:['Gestão de Pessoas','Recrutamento interno: vantagens e limitações'],
48:['Administração','Planejamento estratégico: valores organizacionais'],
49:['Administração','Planejamento estratégico: cenários e escolha de alternativas'],
50:['Administração','Gestão da qualidade: qualidade total e partes interessadas'],
52:['Administração','Gestão de projetos: custos de mudança ao longo do ciclo de vida'],
53:['Administração Pública','Indicadores de desempenho: monitoramento e avaliação organizacional'],
54:['Administração Pública','Modelos de administração pública: gestão gerencial e burocrática'],
58:['Administração Pública','Avaliação de políticas públicas: eficácia e eficiência'],
59:['Administração Pública','Orçamento público federal: formalização e solicitação de crédito'],
60:['Administração Pública','Prestação de contas e accountability por resultados'],
61:['Políticas Públicas','Avaliação de programas: avaliação somativa, processo, resultados e impacto'],
62:['Direito Financeiro','Tribunal de Contas da União: fiscalização de empresas supranacionais'],
63:['Auditoria Governamental','Componentes do controle interno e sua articulação'],
64:['Auditoria Governamental','Controle interno: plano organizacional, métodos e objetivos'],
65:['Auditoria Governamental','Limitações do controle interno: falha humana e abuso de autoridade'],
66:['Auditoria Governamental','Compliance e confiabilidade das informações contábeis'],
67:['Auditoria Governamental','Controle interno: nível de segurança e atingimento de objetivos'],
68:['Auditoria Governamental','COSO: ambiente de controle e competência dos profissionais'],
69:['Auditoria Governamental','Governança: independência da supervisão dos controles internos'],
70:['Auditoria Governamental','COSO: integridade e valores éticos no ambiente de controle'],
71:['Auditoria Governamental','Atividades de controle e respostas a riscos'],
72:['Gestão de Riscos','Conceito de risco aplicado ao controle interno'],
73:['Gestão de Riscos','Tratamento de riscos: aceitação e resposta da administração'],
74:['Gestão de Riscos','Risco residual e capacidade de resposta'],
75:['Auditoria Governamental','Atividades de controle: planos de contingência e risco de conformidade'],
76:['Segurança da Informação','Gestão de riscos de informação: confidencialidade e integridade'],
77:['Auditoria Governamental','Controle interno: rastreabilidade, informação e comunicação'],
78:['Administração','Comunicação organizacional: fluxo, clareza e oportunidade'],
79:['Auditoria Governamental','Monitoramento contínuo e avaliação independente'],
80:['Auditoria Governamental','Monitoramento contínuo: integração às operações e tempestividade'],
81:['Auditoria Governamental','Monitoramento: identificação de inconsistências e medidas corretivas'],
82:['Auditoria Governamental','Auditoria independente e utilização do trabalho da auditoria interna'],
83:['Direito Administrativo','Controle da administração pública: modalidades de controle'],
84:['Direito Administrativo','Controle da administração pública: corregedorias e controle externo'],
85:['Direito Constitucional','Controle externo: fiscalização financeira e orçamentária pelo Legislativo'],
86:['Direito Constitucional','Separação de Poderes e controle recíproco entre Legislativo e Executivo'],
87:['Direito Administrativo','Controle interno do Poder Executivo como controle administrativo'],
88:['Direito Financeiro','Fiscalização financeira e orçamentária e competência dos tribunais de contas'],
90:['Direito Financeiro','Tribunais de contas: controle concomitante e subsequente'],
91:['Direito Constitucional','Controle parlamentar da administração pública'],
92:['Direito Financeiro','TCU: julgamento de contas e responsabilização por dano ao erário'],
93:['Direito Administrativo','Sistema de jurisdição una e controle jurisdicional'],
95:['Direito Administrativo','Controle jurisdicional de atos e atividade administrativa'],
96:['Direito Administrativo','Lei de Improbidade Administrativa: dolo e elemento subjetivo'],
97:['Direito Financeiro','Controle externo e fiscalização da execução financeira e orçamentária'],
98:['Direito Financeiro','Controle da execução orçamentária: receitas, despesas e obrigações'],
100:['Direito Administrativo','Controle jurisdicional e princípio da inércia da jurisdição']
}
const commands={
31:'A respeito das reformas da administração pública no Brasil, julgue os itens a seguir.',
34:'Em relação às abordagens teóricas da administração e ao seu desenvolvimento, julgue os itens subsequentes.',
36:'No que se refere às funções da administração e a seus desdobramentos, julgue os itens que se seguem.',
40:'No que diz respeito à gestão contemporânea nas organizações, julgue os itens seguintes.',
43:'A respeito da gestão de pessoas e de seus processos básicos, julgue os próximos itens.',
47:'Julgue os itens a seguir, referentes a planejamento estratégico, conceitos, métodos e técnicas organizacionais.',
50:'No que se refere aos projetos e a suas etapas, à gestão de qualidade, à análise, padronização e melhoria de processos e ao ciclo PDCA, julgue os itens subsequentes.',
53:'Julgue os próximos itens, a respeito da gestão governamental, das reformas administrativas e de modelos de gestão pública.',
56:'Acerca dos modelos contemporâneos de gestão de pessoas por competências e da liderança e do desempenho institucional, julgue os seguintes itens.',
58:'No que se refere ao sistema de planejamento e orçamento do governo federal, aos controles interno e externo e às avaliações de políticas públicas e programas governamentais, julgue os itens subsequentes.',
63:'Com relação à definição, aos objetivos, aos componentes e às limitações de efetividade do controle interno, julgue os itens a seguir.',
67:'Julgue os itens que se seguem, a respeito dos controles internos e do ambiente de controle.',
68:'Julgue os itens que se seguem, a respeito do ambiente de controle.',
71:'Acerca da avaliação de riscos e das atividades de controle, julgue os itens seguintes.',
77:'Julgue os próximos itens, referentes a monitoramento, informação e comunicação no âmbito do controle interno.',
83:'Em relação a conceito, tipos e formas de controle, bem como a controles interno e externo, julgue os itens a seguir.',
88:'Acerca dos controles parlamentar e administrativo, bem como do exercido pelos tribunais de contas, julgue os itens que se seguem.',
93:'No que se refere à Lei de Improbidade Administrativa e a sistemas de controle jurisdicional da administração pública, julgue os itens seguintes.',
97:'A respeito do controle jurisdicional da administração pública e do controle da atividade financeira do Estado, julgue os itens subsequentes.'
}
const canonical=new Map([[33,'extr-253d4e60ae50335af3d4'],[34,'extr-4bf82c877528b53a6d4b'],[48,'extr-aed613a7a95aafb0379f']])
const corrections={
33:'A padronização salarial dos servidores públicos já era tradicional no Brasil desde antes da reforma de 1930, tendo sido implementada ainda no Brasil Imperial.',
34:'De acordo com a teoria neoclássica, o trabalho é entendido como uma atividade influenciada por normas grupais.',
36:'Disciplinar a execução do trabalho é uma prática associada ao princípio da execução, típico da teoria da administração científica.',
38:'No processo decisório, as decisões estratégicas são comumente centralizadas e não repetitivas.',
39:'A execução do processo administrativo é realizada de uma única vez, sendo o planejamento sua primeira etapa.',
42:'O desenho da estrutura organizacional é tarefa típica do nível intermediário de gestão, responsável por determinar os critérios de departamentalização.',
46:'O recrutamento interno reforça a valorização e a possibilidade de crescimento da força de trabalho, além de ser menos oneroso e implicar menos riscos, porém apresenta como ponto negativo o fato de não permitir uma real renovação no quadro da força de trabalho.',
48:'Os valores são norteadores da gestão estratégica.',
67:'Um sistema de controle interno somente será considerado eficiente se conseguir fornecer um alto grau de segurança quanto ao atingimento dos objetivos traçados pela administração.',
82:'Na condução das atividades de monitoramento, o auditor independente deve evitar a utilização de informações produzidas pela auditoria interna da organização, com o intuito de preservar-se contra qualquer espécie de suspeição em relação à integridade das conclusões apresentadas no relatório de auditoria independente.',
87:'O controle interno, que pode ser realizado pelo Poder Executivo, é também uma espécie de controle administrativo.',
92:'O Tribunal de Contas da União julga as contas dos administradores e dos demais responsáveis por dinheiros, bens e valores públicos da administração direta e indireta da União, bem como as dos que derem causa a qualquer prejuízo ao erário na aplicação de valores públicos.',
95:'O Poder Judiciário pode rever atos praticados por agentes de todos os órgãos da administração direta e indireta e de poderes da União, dos estados, do Distrito Federal e dos municípios, o que configura o exercício do controle jurisdicional da atividade administrativa.',
100:'Em razão do pressuposto do juiz natural, o órgão do Poder Judiciário deve afastar a ilegalidade imposta por agente público autoritário representante do Estado, independentemente de interesse ou petição do administrado.'
}
const answers=[
 ...['C','E','E','E','E','C','C','C','E','C','C','E','E','E','C','C','E','C','C','C'],
 ...['E','E','C','C','E','E','C','E','C','C','C','E','E','C','C','E','E','C','E','C'],
 ...['C','C','E','E','E','C','C','C','C','C','C','E','C','E','C','E','C','E','E','C'],
 ...['C','E','E','E','C','C','E','C','X','E']
]
// Sequência oficial alinhada aos itens 31–100.
if(answers.length!==70)throw Error(`Gabarito com ${answers.length} itens; esperado 70.`)
const annulled=new Set([89,99]),easy=new Set([32,34,36,39,43,46,48,54,60,63,70,72,77,78,80,81,83,85,88,90,91,93,98]),hard=new Set([35,38,41,44,45,49,51,58,59,61,62,65,66,67,69,73,74,76,82,86,89,92,94,96,97,99,100])
const keyDigest=createHash('sha256').update(answers.join('')).digest('hex')
const pendingFlags=['classificacao_especifica_pendente','ano_sem_evidencia','integridade_visual_pendente','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado','classificacao_pendente']
const decisions=records.map(q=>{
 const n=Number(q.numero),cls=defs[n],page=Number(q.pagina),duplicate=canonical.has(n)&&q.id!==canonical.get(n),command=[...Object.keys(commands).map(Number)].filter(v=>v<=n).at(-1),key=answers[n-31],annulledItem=annulled.has(n),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 if(!cls||n<31||n>100||!key)throw Error(`Item ${n} sem classificação ou gabarito.`)
 let stem=corrections[n]||q.enunciado.replace(/\s+/g,' ').trim()
 if(n===58)stem=stem.replace(/\s+/g,' ').trim()
 if(n===59)stem=stem.replace(/\s+/g,' ').trim()
 if(n===69)stem=stem.replace(/\s+/g,' ').trim()
 const out={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,materia:cls[0],conteudo:cls[1],ano:2024,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'02/06/2024',cargo:'Analista Legislativo — Cargo 2',numero_original:n,numero:n,pagina:page,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],dificuldade:hard.has(n)?'Difícil':easy.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela densidade normativa, conceitual e inferencial do item; a banca não publicou índice psicométrico de dificuldade.',classificacao_fonte:prova,motivo:`Classificação individual pelo enunciado e comando de bloco do caderno oficial do Cargo 2 — Analista Legislativo. Ano e data conferidos no gabarito definitivo oficial.`,resposta_correta:annulledItem?null:key==='X'?null:key==='C'?0:1,anulada:annulledItem,gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'GAB_DEFINITIVO_972_CAMARA_MACEIO_002_01.PDF',prova:'972_CAMARA_MACEIO_002_01.PDF',sha256:keyDigest,sha256_tipo:'SHA-256 da sequência canônica dos 70 gabaritos definitivos C/E/X da tabela oficial',numero:n,pagina:1,criterio:annulledItem?'Tabela oficial definitiva marca X: item anulado.':'Gabarito definitivo CEBRASPE para Cargo 2 — Analista Legislativo.'},texto_apoio:commands[command],apoio:[{pagina:page,imagem:image,texto:commands[command]}],visual:{pagina:page,imagem:image,texto_apoio:commands[command],motivo:'Página do caderno oficial preservada e vinculada ao item; texto conferido com a prova publicada pela banca.'},apta_resolucao:!duplicate,remover_pendencias:pendingFlags,...(duplicate?{inelegibilidade_motivo:'Registro duplicado do mesmo item no mesmo caderno; desativado para impedir repetição.',duplicada_de:canonical.get(n)}:{})}
 if(!out.visual.texto_apoio)throw Error(`Item ${n} sem texto-base.`)
 return out
})
if(decisions.length!==60||decisions.filter(x=>x.apta_resolucao).length!==57)throw Error('Cobertura inesperada da fila.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:60,itensUnicos:57,duplicatas:3,edicao:concurso,anuladas:[...annulled],gabarito:'definitivo oficial',publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,edicao:concurso,documento_id:doc,prova,gabarito,registros_revisados:60,itens_unicos:57,duplicatas_desativadas:3,anuladas:[...annulled],imagens_preservadas:true,publicado:false,observacao:'Lote de itens pendentes (32–100); 57 itens únicos revisados, três duplicatas de extração desativadas. Questões já classificadas e não pendentes nesta edição não foram alteradas; não se declara revisão integral das 70 questões do caderno.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — Câmara de Maceió 2024 — Analista Legislativo — revisão v413\n\n- 60 registros de fila revistos, correspondendo a 57 itens únicos; três duplicatas foram desativadas.\n- Banca, cargo, aplicação em 02/06/2024, matéria, conteúdo, dificuldade estimada e formato certo/errado registrados individualmente.\n- Textos-base por bloco e imagens originais vinculados; trechos com OCR contaminado ou incompleto foram corrigidos a partir do caderno oficial.\n- Gabarito definitivo oficial vinculado; itens 89 e 99 anulados.\n- Revisão abrange apenas os itens pendentes exportados; não comprova a cobertura integral da edição. Alterações locais, publicação na nuvem pendente.\n`)
console.log(JSON.stringify({...result,edicao:concurso,itens_unicos:57,duplicatas_desativadas:3,anuladas:[...annulled],publicado:false}))
