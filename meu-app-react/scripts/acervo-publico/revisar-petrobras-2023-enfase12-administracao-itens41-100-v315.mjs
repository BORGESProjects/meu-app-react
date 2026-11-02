import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='7308fb33e46445ee'
const prova='https://cdn.cebraspe.org.br/concursos/PETROBRAS_23_NM/arquivos/822_PETROBRAS_23_012_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/petrobras_23_nm/arquivos/GAB_DEFINITIVO_822_PETROBRAS_23_012_01.PDF'
const concurso='PETROBRAS 2023 — Profissional de Nível Técnico Júnior — Ênfase 12: Suprimento de Bens e Serviços – Administração'
const cargo='Profissional Petrobras de Nível Técnico Júnior — Ênfase 12: Suprimento de Bens e Serviços – Administração'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.url!==prova||catalog.questoes.length!==64)throw Error('Caderno PETROBRAS Ênfase 12 divergente do catálogo')
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const selected=records.filter(q=>q.numero>=41&&q.numero<=100)
if(selected.length!==64||new Set(selected.map(q=>q.numero)).size!==60)throw Error(`Esperados 60 itens e 4 duplicatas, recebidos ${selected.length}`)

const stems={
41:'O planejamento estratégico está relacionado a objetivos de longo prazo, com maneiras e ações que afetam toda a empresa.',
42:'O planejamento tático auxilia na definição de metas, processos, prazos, ferramentas e recursos a médio e longo prazo.',
43:'Os planejamentos operacionais correspondem a um conjunto de partes homogêneas do planejamento tático.',
44:'A garantia da qualidade é focada na melhoria dos processos e produtos.',
45:'Avaliar insumos, matérias-primas e embalagens e executar controle do produto em processo são consideradas técnicas de controle da qualidade.',
46:'A gestão por processos é uma abordagem administrativa com propósito de priorização e foco nos processos.',
47:'Procedimentos são subdivididos em tarefas, que são atividades rotineiras.',
48:'A qualidade no atendimento ao cliente fundamenta-se em uma maneira única e padronizada de atender bem a todos os clientes.',
49:'A satisfação do cliente está relacionada com a percepção que este tem em relação à qualidade do atendimento recebido em comparação ao valor pago pelo produto ou serviço.',
50:'A função compras é reconhecida como uma atividade rotineira e faz parte do processo de logística das empresas.',
51:'Preço justo, qualidade e celeridade são atributos de uma gestão de compras eficiente.',
52:'Pedido de compra, processamento de compra e cadastro de fornecedores são etapas do processo de compras em uma empresa.',
53:'O processo de gestão de compras inicia-se com a cotação junto aos fornecedores, a fim de identificar a demanda, o preço e a qualidade dos bens a serem adquiridos.',
54:'Identificar as motivações do outro, mostrar convicção nos argumentos e inflexibilidade diante de novas ideias e condições são consideradas boas estratégias de negociação.',
55:'As negociações devem ser baseadas em princípios morais, éticos, subjetivos, objetivos e pragmáticos.',
56:'Por serem absolutamente confiáveis, guias industriais e de fornecedores são ótimos cadastros de fornecedores.',
57:'Para além de condições comerciais, a afinidade com valores da empresa compradora pode ser um dos critérios a serem considerados na seleção dos fornecedores.',
58:'A avaliação de fornecedores termina na efetivação da compra ou na contratação do serviço.',
59:'A principal função da gestão e fiscalização de um contrato de serviço é manter o suprimento desse serviço de forma adequada e previamente estabelecida.',
60:'O controle sobre fornecedores de serviços só pode ocorrer durante a execução da operação.',
61:'Dadas as características específicas de cada contratante de um serviço de limpeza e conservação, não é possível a padronização das atividades relativas a esse serviço.',
62:'A avaliação dos serviços prestados por terceiros deve incluir o atendimento recebido pelos funcionários e os esclarecimentos a respeito da operação.',
63:'O modal hidroviário é dividido em marítimo, fluvial e lacustre.',
64:'Granéis, líquidos e gases podem ser transportados por metrovias.',
65:'A atividade de transporte de cargas, em geral, contribui com a emissão de poluentes que podem contaminar a água, o solo e a atmosfera.',
66:'A sustentabilidade na cadeia de suprimentos inclui a ampliação de benefícios sociais relacionados às suas atividades primárias.',
67:'O layout de um almoxarifado interfere na eficiência e na segurança da equipe.',
68:'O cartão kanban pode ser usado para controlar o estoque mínimo dentro do almoxarifado.',
69:'O inventário físico dos estoques deve ser realizado uma única vez ao ano, ao final do período fiscal da empresa.',
70:'A identificação de materiais no estoque deve ser realizada obrigatoriamente em lotes.',
71:'As empresas públicas e as sociedades de economia mista estão dispensadas da realização de licitação para obras e serviços de engenharia de valor até R$ 200.000.',
72:'A contratação direta será feita quando houver inviabilidade de competição, em especial na hipótese de aquisição de materiais, equipamentos ou gêneros que só possam ser fornecidos por produtor, empresa ou representante comercial exclusivo.',
73:'Nos casos de dispensa de licitação, se comprovado pelo órgão de controle externo, sobrepreço ou superfaturamento, responde pelo dano causado quem houver decidido pela contratação direta e, subsidiariamente, o fornecedor ou o prestador de serviços.',
74:'Nas contratações de obras, serviços e compras, poderá ser exigida prestação de garantia nas modalidades de caução em dinheiro, seguro-garantia ou fiança bancária.',
75:'As licitações realizadas e os contratos celebrados por empresas públicas e sociedades de economia mista devem observar, entre outros princípios, o da vinculação ao instrumento convocatório e o do desenvolvimento nacional sustentável.',
76:'Em razão do princípio da publicidade, o valor estimado do contrato a ser celebrado pela empresa pública ou pela sociedade de economia mista será público, sendo obrigatório que a contratante divulgue o valor estimado do objeto da licitação.',
77:'A relação das aquisições de bens efetivadas pelas empresas públicas e pelas sociedades de economia mista deverá ser divulgada, com periodicidade mínima semestral, em sítio eletrônico oficial na Internet de acesso irrestrito.',
78:'Quando a PETROBRAS entender conveniente, será iniciado procedimento de pré-qualificação de fornecedores ou bens por meio da publicação de convocação em portal eletrônico, para que quaisquer interessados demonstrem o cumprimento das exigências.',
79:'A PETROBRAS poderá abrir procedimento de manifestação de interesse privado para a apresentação, exclusivamente por pessoas jurídicas, de projetos, levantamentos, investigações ou estudos, com a finalidade de subsidiá-la na estruturação de seus empreendimentos, atendendo a necessidades previamente identificadas.',
80:'É obrigatória a licitação pelo rito do pregão para a contratação de bens e serviços comuns, assim considerados aqueles cujos padrões de desempenho e qualidade possam ser objetivamente definidos pelo edital.',
81:'Na preparação da licitação, que constitui fase interna do processo licitatório, a PETROBRAS deverá elaborar os documentos e praticar os atos necessários para a caracterização do objeto a ser licitado e para a definição dos parâmetros do certame.',
82:'Nos procedimentos para alienação de bens imóveis, caso não apareçam interessados no primeiro procedimento de licitação, a PETROBRAS poderá, desde logo, disponibilizá-los para venda direta por essa hipótese caracterizada como procedimento licitatório fracassado.',
83:'A publicidade do edital de licitação deverá ser realizada mediante publicação de seu extrato no Diário Oficial da União e em portal eletrônico, sem prejuízo da possibilidade de divulgação direta aos potenciais interessados, sejam eles cadastrados ou não.',
84:'No modo de disputa aberto, os licitantes deverão apresentar propostas escritas ou eletrônicas em sessão pública e, na sequência, deverão ofertar lances públicos e sucessivos, crescentes ou decrescentes, conforme o critério de julgamento adotado.',
85:'O critério de julgamento da licitação pela melhor técnica poderá ser utilizado para a contratação de projetos e trabalhos de natureza técnica ou científica, excluídos os projetos arquitetônicos e de engenharia.',
86:'A contabilidade é uma ciência social.',
87:'O fornecimento de informações úteis para a tomada de decisão pelos agentes econômicos é uma das finalidades da ciência contábil.',
88:'Contabilidade aplicada é sinônima de contabilidade geral, visto que ambas se ocupam da aplicação dos métodos, conceitos e princípios contábeis a um ramo da economia.',
89:'Segundo a escola patrimonialista, o objetivo da contabilidade é registrar os fatos que afetam o patrimônio dos entes contábeis.',
90:'Uma finalidade da ciência contábil é observar se a riqueza administrada está atingindo os fins propostos pelo sujeito contábil.',
91:'Receita é definida como o aumento em uma conta patrimonial ativa que não provoca um aumento correspondente em uma conta patrimonial passiva.',
92:'Verifica-se lucro contábil quando a soma de saldos credores em contas de resultado supera a soma de saldos devedores.',
93:'Uma redução em conta patrimonial ativa constitui necessariamente uma despesa.',
94:'Por constituir um valor de ingresso no patrimônio da entidade, o custo corrente assemelha-se ao custo histórico, mas, diferentemente deste, o custo corrente reflete condições na data da mensuração.',
95:'O custo de um item estocado transforma-se em um tipo de despesa quando esse bem é transferido a um terceiro pela venda.',
96:'O consumo de um recurso ou serviço para a produção de outro bem ou serviço constitui um custo.',
97:'Para facilitar a gestão tributária, um imposto e uma taxa podem ter a mesma base de cálculo.',
98:'O Simples Nacional, também conhecido como Simples Federal, unificou os sistemas de tributação de microempresas e pequenas empresas, englobando oito tributos distintos.',
99:'Um tributo recolhido com a finalidade de custear a prestação de um serviço público é uma taxa.',
100:'Impostos, taxas e multas são tipos de tributos que podem ser instituídos por qualquer ente federativo, respeitadas as restrições legais.'
}
const topics={
41:['Administração','Planejamento estratégico: objetivos de longo prazo e abrangência organizacional','Fácil'],42:['Administração','Planejamento tático: metas, prazos, recursos e desdobramento estratégico','Média'],43:['Administração','Planejamento operacional: planos, processos e tarefas','Média'],
44:['Administração','Gestão da qualidade: garantia da qualidade e melhoria contínua','Média'],45:['Administração','Gestão da qualidade: controle de insumos, processo e produto','Média'],46:['Administração','Gestão por processos: foco, priorização e melhoria de processos','Fácil'],47:['Administração','Gestão por processos: procedimentos, atividades e tarefas','Fácil'],48:['Atendimento ao Público','Qualidade no atendimento: personalização e padronização de serviços','Média'],49:['Atendimento ao Público','Satisfação do cliente: percepção de qualidade e valor','Média'],
50:['Administração','Gestão de compras: função de compras e logística empresarial','Fácil'],51:['Administração','Gestão de compras: preço, qualidade e prazo','Fácil'],52:['Administração','Processo de compras: pedido, processamento e cadastro de fornecedores','Média'],53:['Administração','Processo de compras: identificação de demanda e cotação','Média'],54:['Administração','Negociação: preparação, escuta, flexibilidade e interesses','Média'],55:['Administração','Negociação: princípios e critérios de decisão','Média'],56:['Administração','Gestão de fornecedores: fontes e confiabilidade cadastral','Média'],57:['Administração','Seleção de fornecedores: critérios comerciais e alinhamento de valores','Média'],58:['Administração','Avaliação de fornecedores: acompanhamento do ciclo contratual','Fácil'],59:['Administração','Gestão de contratos de serviços: níveis de serviço e fiscalização','Média'],60:['Administração','Gestão de contratos: controle do fornecedor em todo o ciclo','Média'],61:['Administração','Terceirização de serviços: padronização e especificação de atividades','Média'],62:['Administração','Fiscalização de serviços terceirizados: atendimento e evidências de execução','Média'],
63:['Logística','Modais de transporte: navegação marítima, fluvial e lacustre','Fácil'],64:['Logística','Modais de transporte: cargas e limitações do transporte metroviário','Fácil'],65:['Logística','Logística e sustentabilidade: impactos ambientais do transporte de cargas','Fácil'],66:['Administração','Sustentabilidade da cadeia de suprimentos: benefícios sociais e atividades primárias','Média'],67:['Logística','Armazenagem: layout, eficiência operacional e segurança','Fácil'],68:['Logística','Gestão de estoques: kanban e nível mínimo de reposição','Média'],69:['Logística','Gestão de estoques: inventário físico e contagem cíclica','Média'],70:['Logística','Armazenagem: identificação e rastreabilidade de materiais','Média'],
71:['Direito Administrativo','Lei das Estatais: hipóteses de dispensa de licitação e limites de valor','Média'],72:['Direito Administrativo','Lei das Estatais: inexigibilidade e fornecedor exclusivo','Média'],73:['Direito Administrativo','Lei das Estatais: responsabilização por sobrepreço e superfaturamento','Difícil'],74:['Direito Administrativo','Lei das Estatais: garantias contratuais e modalidades','Média'],75:['Direito Administrativo','Lei das Estatais: princípios e desenvolvimento nacional sustentável','Média'],76:['Direito Administrativo','Lei das Estatais: publicidade e sigilo do orçamento estimado','Média'],77:['Direito Administrativo','Lei das Estatais: divulgação de contratos e aquisições','Média'],78:['Direito Administrativo','Lei das Estatais: pré-qualificação de fornecedores e bens','Média'],79:['Direito Administrativo','Lei das Estatais: procedimento de manifestação de interesse','Difícil'],80:['Direito Administrativo','Lei das Estatais: pregão para bens e serviços comuns','Média'],81:['Direito Administrativo','Lei das Estatais: fase preparatória e definição do objeto','Média'],82:['Direito Administrativo','Lei das Estatais: alienação de bens imóveis e licitação fracassada','Difícil'],83:['Direito Administrativo','Lei das Estatais: publicidade e divulgação de editais','Média'],84:['Direito Administrativo','Lei das Estatais: modo de disputa aberto e apresentação de lances','Média'],85:['Direito Administrativo','Lei das Estatais: critério de julgamento por melhor técnica','Média'],
86:['Contabilidade','Conceitos básicos: natureza social da ciência contábil','Fácil'],87:['Contabilidade','Finalidade da contabilidade: informação útil para decisões econômicas','Fácil'],88:['Contabilidade','Contabilidade geral e aplicada: ramos de aplicação','Média'],89:['Contabilidade','Escolas contábeis: patrimonialismo e objeto da contabilidade','Média'],90:['Contabilidade','Objeto e finalidade da contabilidade: gestão da riqueza patrimonial','Média'],
91:['Contabilidade','Receitas: reconhecimento e efeitos sobre ativos e passivos','Média'],92:['Contabilidade','Apuração de resultado: receitas, despesas e lucro contábil','Média'],93:['Contabilidade','Variações patrimoniais: redução de ativos e reconhecimento de despesas','Média'],94:['Contabilidade','Bases de mensuração: custo histórico e custo corrente','Difícil'],95:['Contabilidade','Estoques: reconhecimento do custo como despesa na venda','Média'],96:['Contabilidade','Custos: consumo de recursos na produção de bens e serviços','Fácil'],
97:['Direito Tributário','Espécies tributárias: imposto e taxa e suas bases de cálculo','Média'],98:['Direito Tributário','Simples Nacional: regime unificado e tributos abrangidos','Média'],99:['Direito Tributário','Taxas: vinculação à prestação de serviço público específico','Média'],100:['Direito Tributário','Competência tributária: impostos, taxas e penalidades','Média']
}
if(Object.keys(stems).length!==60||Object.keys(topics).length!==60)throw Error('Transcrição ou classificação incompleta')

const answers='CECECCEECE|CCEECECECE|ECCECCCCEE|ECECCECCEE|CECCECEEEC|ECECCCEECE'.replaceAll('|','')
if(answers.length!==60)throw Error(`Gabarito canônico tem ${answers.length} respostas para 60 itens`)
const keyMap=new Map(Array.from({length:60},(_,i)=>[i+41,answers[i]]))
const answerDigest=hashRevisao([...keyMap].map(([n,a])=>`${n}:${a}`).join('\n'))
const contexts={
41:{p:1,t:'Julgue os itens a seguir relativos a planejamento estratégico, tático e operacional.'},44:{p:1,t:'Julgue os itens que se seguem quanto à administração da qualidade.'},46:{p:1,t:'Em relação à gestão de processos, julgue os itens seguintes.'},48:{p:1,t:'No que se refere ao atendimento ao cliente, julgue os itens subsecutivos.'},50:{p:1,t:'Com referência à gestão de compras, julgue os itens seguintes.'},54:{p:1,t:'Julgue os itens a seguir acerca de estratégias de negociação.'},56:{p:1,t:'Julgue os itens seguintes relativos à seleção e avaliação de fornecedores e à gestão e fiscalização de contratos.'},63:{p:1,t:'No que se refere à sustentabilidade na cadeia de suprimentos e à gestão do transporte de cargas, julgue os itens subsequentes.'},67:{p:1,t:'Considerando a gestão de estoques e almoxarifados, julgue os itens seguintes.'},71:{p:2,t:'Com base na Lei nº 13.303/2016, julgue os itens seguintes.'},78:{p:2,t:'À luz do Regulamento de Licitações e Contratos da PETROBRAS (RLCP), julgue os itens seguintes.'},86:{p:2,t:'Relativamente aos conceitos básicos da ciência contábil, julgue os itens que se seguem.'},91:{p:2,t:'Em relação a receitas, despesas, custos e resultados contábeis, julgue os itens subsequentes.'},97:{p:2,t:'No que se refere à administração tributária, julgue os itens a seguir.'}
}
const duplicates=new Map([
 ['extr-b96804391a602674da49','extr-1f925ab077652ab5e9d9'],
 ['extr-a007a1f08d5e2b24f1fc','extr-487866afe85b934fbeb0'],
 ['extr-e9919170f73bbb81fe71','extr-0fa73515f52e3ce2cc10'],
 ['extr-d0bdd646d4ef68f2f949','extr-cf918e2855045be4a102']
])
const decisions=selected.map(q=>{
 const n=Number(q.numero),topic=topics[n],answer=keyMap.get(n)
 if(!stems[n]||!topic||!answer)throw Error(`Item ${n} ausente do mapa`)
 const ctx=[...Object.entries(contexts)].reverse().find(([start])=>n>=Number(start))?.[1]
 const page=n<=70?1:2,image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,duplicate=duplicates.get(q.id)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2023,concurso,cargo,organizadora:'CEBRASPE',aplicacao:'PETROBRAS — Ênfase 12 — Suprimento de Bens e Serviços – Administração',numero_original:n,pagina:page,enunciado:stems[n],opcoes:['Certo','Errado'],resposta_correta:answer==='C'?0:1,anulada:false,dificuldade:topic[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por complexidade conceitual e normativa; não é classificação oficial da banca.',classificacao_fonte:prova,motivo:`CEBRASPE — PETROBRAS/PSP RH 2023.1, Ênfase 12: Suprimento de Bens e Serviços – Administração, item ${n}; conteúdo e aplicação conferidos no caderno oficial.`,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_822_PETROBRAS_23_012_01.PDF',prova:'822_PETROBRAS_23_012_01.PDF',sha256:answerDigest,sha256_tipo:'sha256_da_transcricao_canonica_dos_60_itens; nao_e_hash_do_pdf',hash_metodo:'SHA-256 da sequência canônica item:resposta da tabela do gabarito oficial definitivo; não representa o hash do PDF.',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do CEBRASPE para a Ênfase 12 — Administração.'},apta_resolucao:!duplicate,...(!duplicate?{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto']}:{inelegibilidade_motivo:'Cópia OCR do mesmo item e caderno, com numeração idêntica; removida da resolução para evitar repetição.',duplicada_de:duplicate}),texto_apoio:ctx.text,reemplazarContexto:true,imagens_contexto:[{pagina:ctx.p,imagem:`paginas/${doc}-${String(ctx.p).padStart(4,'0')}.webp`,texto:ctx.text}],visual:{pagina:page,imagem:image,texto_apoio:ctx.text,motivo:`Página ${page} do caderno oficial conferida; enunciado, numeração e contexto do bloco associados ao item ${n}.`}}
})
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(decisions.length!==64||decisions.filter(d=>!d.apta_resolucao).length!==4)throw Error('Contagem de registros ou duplicatas divergente')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registros:64,itensUnicos:60,duplicatas:4,gabaritoDefinitivo:true,paginas:[1,2],publicado:false},null,2));process.exit(0)}

const name='revisao-petrobras-2023-enfase12-administracao-itens41-100-v315'
const result=await aplicarRevisoesIndividuais({nome:name,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${name}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:concurso,cargo,registrosRevistos:64,itensUnicos:60,duplicatasDesativadas:4,paginasConferidas:[1,2],gabaritoDefinitivo:gabarito,publicado:false,observacao:'Gabaritos mapeados da tabela oficial definitiva. Hash salvo como SHA-256 de transcrição canônica item/resposta, não como hash do arquivo PDF.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## PETROBRAS 2023 — Ênfase 12, Suprimento de Bens e Serviços – Administração — itens 41–100 — v315\n\n- Revisei 60 itens únicos sobre planejamento, qualidade e processos, atendimento, compras e fornecedores, negociação, contratos de serviços, logística e suprimentos, Lei das Estatais (Lei nº 13.303/2016), contabilidade e tributação.\n- Atualizei banca, concurso, ênfase/cargo, ano, matéria, conteúdo, dificuldade estimada e imagens/contextos das páginas 1 e 2. Corrigi a classificação anterior genérica e os rótulos incorretos de administração pública, logística, contabilidade e direito administrativo.\n- Associei as respostas do gabarito oficial definitivo e desativei quatro registros OCR duplicados (itens 42, 43, 46 e 47).\n- Validação local: ${result.total} questões, ${result.disponiveis} elegíveis, ${result.pendentes} pendências globais; publicação na nuvem não realizada.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo oficial](<${gabarito}>), [edital e conteúdo do concurso](<https://cdn.cebraspe.org.br/concursos/PETROBRAS_23_NM/arquivos/ED_1_PETROBRAS_PSP_1_23_ABERTURA.PDF>).\n`)
console.log(JSON.stringify(report,null,2))
