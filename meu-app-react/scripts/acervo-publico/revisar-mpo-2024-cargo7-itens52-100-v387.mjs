import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-mpo-2024-cargo7-itens52-100-v387',doc='874218946e40b137'
const prova='https://cdn.cebraspe.org.br/concursos/mpo_24/arquivos/958_MPO_ANALISTA_007_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/mpo_24/arquivos/GAB_DEFINITIVO_958_MPO_ANALISTA_007_01.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const rows=[
 [41,'E E E C E C C C E C E C C E E E C E C E'],
 [61,'E E C C E C E E E C C C C C E E E E C C'],
 [81,'E E C E C C C C C E C X C E C X E E E E']
]
const answers=new Map()
for(const [start,line] of rows){const values=line.split(/\s+/);if(values.length!==20)throw Error(`Linha inválida do gabarito, item ${start}: ${values.length}`);values.forEach((v,i)=>answers.set(start+i,v))}
const topics={
52:['Direito Administrativo','Contratos administrativos: alteração unilateral e manutenção do equilíbrio econômico-financeiro'],
53:['Administração Pública','Gestão de contratações: responsabilidades e segurança de acesso ao PGC'],
54:['Administração Pública','Plano de Contratações Anual: possibilidade de alteração durante a execução'],
55:['Administração Pública','Plano de Contratações Anual: revisão e adequação após a LOA'],
56:['Direito Administrativo','Pregão eletrônico: divulgação do valor máximo aceitável'],
57:['Direito Administrativo','Pregão eletrônico: sigilo do orçamento estimado e acesso dos órgãos de controle'],
58:['Direito Administrativo','Contratações públicas: linhas de defesa e controle interno'],
60:['Direito Administrativo','Planejamento de contratação de TIC: competitividade e vedação a direcionamento'],
61:['Direito Administrativo','Contratação de TIC: estudo técnico preliminar e definição da solução'],
63:['Direito Administrativo','Contratação de TIC: gestão de riscos nas fases de planejamento e seleção'],
65:['Direito Administrativo','Contratação de TIC: aprovação de adesão a atas e documentos da contratação'],
66:['Direito Administrativo','Licitações: critérios objetivos na avaliação de propostas técnicas'],
67:['Direito Administrativo','Fiscalização contratual: recebimento provisório e sumário de bens'],
68:['Tecnologia da Informação','Computação em nuvem: escopo do modelo de contratação de serviços'],
69:['Tecnologia da Informação','Operação de infraestrutura de TIC: serviços de segurança e backup'],
70:['Tecnologia da Informação','Computação em nuvem: desktop como serviço (DaaS)'],
71:['Tecnologia da Informação','Contratação de outsourcing de impressão: franquia mensal e excedente'],
72:['Engenharia de Software','Sustentação de software: metodologias ágeis'],
73:['Tecnologia da Informação','Contratação de serviços de TIC: estimativa de preços por UST e fator-k'],
74:['Tecnologia da Informação','Métrica UST: medição de artefatos intermediários e serviços contínuos'],
75:['Direito Administrativo','Registro de preços: riscos e controles em contratações por UST'],
77:['Engenharia de Software','Modelos de ciclo de vida: prototipagem e validação de software'],
78:['Engenharia de Software','Métodos ágeis: backlog do produto e planejamento da sprint'],
81:['Engenharia de Software','Estimativa ágil: story points e análise por pontos de função'],
82:['Engenharia de Software','Scrum: épicos, funcionalidades e histórias de usuário no backlog'],
83:['Engenharia de Software','Histórias de usuário: modelo 3C (cartão, conversa e confirmação)'],
86:['Redes de Computadores','Computação em nuvem: modelo de nuvem híbrida'],
87:['Redes de Computadores','Arquitetura de redes: funcionamento de redes ponto a ponto'],
88:['Tecnologia da Informação','Datacenter definido por software (SDDC): infraestrutura virtualizada'],
90:['Direito Administrativo','Terceirização na Administração Pública: vedação à ingerência sobre empregados'],
91:['Direito Administrativo','Termo de referência: adoção do critério de julgamento por técnica e preço'],
93:['Direito Administrativo','Pesquisa de preços em TIC: catálogos oficiais de soluções padronizadas'],
94:['Direito Administrativo','Estudo técnico preliminar: segregação dos papéis de requisitante e área técnica'],
96:['Direito Administrativo','Pesquisa de preços: custos unitários em sistemas oficiais de governo'],
98:['Direito Administrativo','Habilitação em licitações: SICAF e cadastros de fornecedores'],
100:['Direito Administrativo','Compras públicas sustentáveis: material reciclado e uso racional da água']
}
const cleanStems={
72:'A contratação de serviços de sustentação de software deve pautar-se, preferencialmente, pela adoção de metodologias de desenvolvimento ágil.',
87:'Em uma rede ponto a ponto, um nó tem um papel tanto de cliente quanto de servidor.'
}
const mismatches=records.filter(q=>q.resposta!=null&&answers.get(Number(q.numero))!=='X'&&q.resposta!==(answers.get(Number(q.numero))==='C'?0:1))
if(mismatches.length)throw Error(`Respostas divergentes do gabarito definitivo: ${mismatches.map(q=>`${q.numero}=${q.resposta}/${answers.get(Number(q.numero))}`).join(', ')}`)
const decisions=records.map(q=>{
 const n=Number(q.numero),t=topics[n],answer=answers.get(n)
 if(!t||!answer)throw Error(`Sem classificação ou gabarito no item ${n}`)
 if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Tipo de questão inesperado no item ${n}`)
 const annulled=answer==='X'
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2024,concurso:'Ministério do Planejamento e Orçamento 2024 — Analista de Planejamento e Orçamento — Especialidade Gestão de Contratos de TI — Cargo 7',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva P2 aplicada em 28/04/2024',cargo:'Analista de Planejamento e Orçamento — Especialidade Gestão de Contratos de TI',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[52,57,58,60,61,63,64,65,66,67,68,69,73,74,75,81,82,91,93,94,96,98,100].includes(n)?'Difícil':[53,54,55,56,70,71,72,77,78,83,86,87,88].includes(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade jurídica, normativa ou técnica do item; não é classificação individual publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial P2 do Cargo 7 — Gestão de Contratos de TI; conteúdo específico identificado pelo enunciado e pelo comando temático do bloco.`,resposta_correta:annulled?null:(answer==='C'?0:1),anulada:annulled,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_958_MPO_ANALISTA_007_01.PDF',prova:'958_MPO_ANALISTA_007_01.PDF',numero:n,pagina:1,resposta:answer,criterio:annulled?'Gabarito oficial definitivo marca X; item anulado.':'Gabarito oficial definitivo que identifica o mesmo caderno 958_MPO_ANALISTA_007_01, Cargo 7.'},...(cleanStems[n]?{enunciado:cleanStems[n]}:{})}
})
if(decisions.length!==36)throw Error(`Esperados 36 registros pendentes; encontrados ${decisions.length}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,numeros:decisions.map(d=>d.numero),anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero),enunciadosCorrigidos:Object.keys(cleanStems),prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — Ministério do Planejamento e Orçamento 2024 — Cargo 7, Gestão de Contratos de TI',itens:decisions.map(d=>({numero:d.numero,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,anulada:d.anulada,pagina:d.pagina,enunciado_corrigido:Boolean(d.enunciado)})),prova,gabarito,publicado:false,nota:'36 registros pendentes foram classificados com matéria, conteúdo, cargo, ano de aplicação, dificuldade estimada e gabarito definitivo específico. O item 96 foi mantido como anulado segundo a chave oficial; o item 92, já classificado, foi conferido e também está corretamente marcado como anulado. Foram limpos enunciados contaminados pelo comando do item seguinte nos itens 72 e 87.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — MPO 2024 — Cargo 7, Gestão de Contratos de TI — revisão v387\n\n- 36 registros pendentes classificados por conteúdo específico, matéria, cargo, ano, aplicação e dificuldade estimada.\n- Gabarito definitivo do caderno 958_MPO_ANALISTA_007_01 vinculado; item 96 marcado como anulado. A conferência constatou que o item 92, já classificado, também permanece corretamente anulado.\n- Enunciados dos itens 72 e 87 foram separados dos cabeçalhos seguintes que o OCR havia anexado.\n- Fontes: [caderno oficial](${prova}) e [gabarito definitivo oficial](${gabarito}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
