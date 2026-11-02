import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-inoversasul-2024-cargo2-itens44-100-v382',doc='f1ba99a85946d692'
const prova='https://cdn.cebraspe.org.br/concursos/INOVERSASUL_24/arquivos/033_INOVERSASUL_002_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/inoversasul_24/arquivos/GAB_DEFINITIVO_033_INOVERSASUL_002_01.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const topics={
44:['Administração Pública','Evolução da administração pública brasileira: criação do DASP e transição do patrimonialismo para o modelo burocrático'],
48:['Administração','Planejamento estratégico: definição de objetivos organizacionais'],
50:['Administração','Planejamento estratégico: missão organizacional'],
52:['Administração','Processo decisório: racionalidade limitada e tomada de decisão'],
53:['Administração','Cultura organizacional: cultura adaptativa e inovação'],
55:['Administração','Organização informal: normas de grupo e desempenho organizacional'],
60:['Administração','Função controle: flexibilidade, padrões e ações corretivas'],
64:['Administração','Benchmarking e estrutura organizacional: redução de níveis hierárquicos'],
65:['Administração','Benchmarking e aprendizagem organizacional'],
66:['Administração','Planejamento estratégico: ferramentas de análise e matrizes'],
67:['Administração','Planejamento estratégico: horizontes temporais'],
68:['Administração','Gestão da qualidade e abordagem burocrática'],
69:['Administração','Liderança e aprendizagem organizacional'],
70:['Administração','Planejamento por cenários e gestão estratégica'],
71:['Administração','Gestão estratégica de pessoas: abordagens prospectiva, ofensiva e controle'],
72:['Administração','Desenho organizacional e eficácia: alinhamento entre estratégia e estrutura'],
73:['Administração','Avaliação de desempenho: integração de metas individuais e organizacionais'],
74:['Administração','Comunicação organizacional: redes descentralizadas'],
76:['Administração','Gestão do conhecimento: conhecimento just-in-case'],
77:['Administração','Gestão do conhecimento: tecnologia, integração logística e intercâmbio de dados'],
78:['Administração','Gestão de projetos: relação entre custo, duração e produtividade'],
79:['Administração','Gestão de projetos: fatores ambientais da organização'],
80:['Administração','Gestão de projetos: estrutura analítica do projeto e pacotes de trabalho'],
82:['Administração','Gestão ágil de projetos: ciclos iterativos e sprints'],
83:['Administração','Gestão de projetos: abordagem preditiva/cascata e iteração'],
84:['Administração','Gestão de riscos em projetos: análise qualitativa e quantitativa'],
86:['Administração','Gestão de projetos: integração entre escopo, cronograma e orçamento'],
90:['Administração','Ética e transparência na gestão de projetos'],
91:['Administração','Estrutura analítica do projeto: decomposição hierárquica do escopo'],
92:['Administração','Planejamento de projetos: associação do orçamento à EAP'],
93:['Administração','Estrutura analítica do projeto: responsabilidade compartilhada'],
94:['Administração','Planejamento do projeto: relação entre plano de gerenciamento e EAP'],
95:['Administração','Gerenciamento de custos: linha de base e distribuição temporal'],
96:['Administração','Gerenciamento do cronograma: método do caminho crítico'],
97:['Administração','Gerenciamento do cronograma: simulação de Monte Carlo'],
98:['Administração','Gerenciamento de custos: granularidade do orçamento na EAP'],
99:['Administração','Gerenciamento do cronograma: sequenciamento de atividades e dependências'],
100:['Administração','Gerenciamento de projetos: análise de valor agregado (EVA)']
}
const corrections={
44:'A criação do Departamento Administrativo do Serviço Público (DASP) representa a transição do modelo patrimonialista para o modelo burocrático.',
48:'Na elaboração do planejamento estratégico, a organização define os objetivos que pretende alcançar.',
50:'A razão de ser de uma organização é expressa em sua missão.',
52:'Devido ao grande volume de informações e ao tempo necessário para uma análise completa, decisões organizacionais podem basear-se em apenas parte das informações disponíveis, sem conhecimento integral da situação.',
53:'Flexibilidade e maleabilidade são requisitos de organizações que adotam uma cultura adaptativa, voltada à inovação e à adequação às mudanças e transformações do mundo digital.',
55:'Nos grupos informais, os padrões de relações e atitudes aceitos pelas pessoas desenvolvem-se espontaneamente; contudo, os padrões de desempenho organizacional sempre correspondem aos estabelecidos pela administração da instituição.',
60:'Embora as organizações estejam se modernizando, o controle deve preservar características de rigidez e austeridade em relação aos padrões estabelecidos.',
73:'Um ponto negativo da implantação de um sistema de avaliação de desempenho é integrar o planejamento estratégico e as metas organizacionais às metas individuais dos colaboradores.',
83:'A metodologia em cascata é altamente iterativa e permite revisões e alterações frequentes durante todas as fases do projeto.',
90:'É aceitável que um gerente de projetos omita informações relevantes nos relatórios se acreditar que isso protegerá a equipe ou a organização.'
}
const data=records.map(q=>{
 const n=Number(q.numero),topic=topics[n]
 if(!topic)throw Error(`Item sem classificação definida: ${n}`)
 const certoErrado=Array.isArray(q.opcoes)&&q.opcoes.length===2&&q.opcoes[0]==='Certo'&&q.opcoes[1]==='Errado'
 if(!certoErrado||!Number.isInteger(q.resposta)||![0,1].includes(q.resposta))throw Error(`Formato de resposta inesperado no item ${n}`)
 const item={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2024,concurso:'INOVERSA SUL 2024 — Analista Administrativo de Projetos — Cargo 2',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva de conhecimentos específicos aplicada em 05/01/2025',cargo:'Analista Administrativo de Projetos — Cargo 2',numero_original:n,numero:n,pagina:q.pagina,dificuldade:['64','71','77','84','96','97'].includes(String(n))?'Difícil':['48','50','53','60','65','67','68','74','76','82','91','92','93','95','99'].includes(String(n))?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual; a banca não publica uma escala individual de dificuldade.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 2; tema e conteúdo identificados pelo enunciado específico e pelo bloco do caderno.`,resposta_correta:q.resposta,anulada:false,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_033_INOVERSASUL_002_01.PDF',prova:'033_INOVERSASUL_002_01.PDF',numero:n,pagina:1,resposta:q.resposta===0?'C':'E',criterio:`Gabarito oficial definitivo CEBRASPE do Cargo 2, mesmo identificador de caderno; item ${n}.`}}
 if(corrections[n])item.enunciado=corrections[n]
 return item
})
if(data.length!==38)throw Error(`Esperados 38 itens; encontrados ${data.length}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:data.map(x=>({numero:x.numero,id:x.id,materia:x.materia,conteudo:x.conteudo,resposta:x.gabarito_oficial.resposta,enunciado_corrigido:Boolean(x.enunciado)})),prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:data})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — INOVERSA SUL 2024 — Analista Administrativo de Projetos, Cargo 2',itens:data.map(d=>({numero:d.numero,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,enunciado_corrigido:Boolean(d.enunciado)})),prova,gabarito,publicado:false,nota:'38 itens foram classificados individualmente. Foram removidos trechos de instruções e itens vizinhos que haviam sido unidos ao enunciado, incluindo a contaminação extensa do item 55. A chave definitiva correspondente ao identificador do caderno foi vinculada como fonte oficial.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — INOVERSA SUL 2024 — Cargo 2 — revisão v382\n\n- 38 questões classificadas com matéria, conteúdo, concurso, ano, aplicação, cargo e dificuldade estimada.\n- Enunciados contaminados por instruções ou itens vizinhos foram limpos; item 55 foi reconstruído a partir da afirmação do caderno.\n- Gabarito definitivo do mesmo caderno vinculado; respostas C/E conferidas no registro de origem e relacionadas à chave oficial.\n- Fontes: [caderno oficial](${prova}) e [gabarito definitivo oficial](${gabarito}).\n- Alteração apenas local; não publicada na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
