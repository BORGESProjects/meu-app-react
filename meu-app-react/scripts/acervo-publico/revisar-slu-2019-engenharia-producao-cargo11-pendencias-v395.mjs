import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-slu-2019-engenharia-producao-cargo11-pendencias-v395'
const doc='d48e6a20daf6c4d6'
const prova='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/11_449_SLUDF_011_00_COM_JUST.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/11_GAB_DEFINITIVO_449_SLUDF_011_00_PAG_7.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const pages=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`)).toString('utf8'))
const source=new Map()
for(const page of pages){
  let current=null,parts=[]
  const save=()=>{if(current!==null)source.set(current,parts.join(' ').replace(/\s+/g,' ').trim())}
  for(const raw of page.split(/\r?\n/)){
    const line=raw.trim(),m=line.match(/^\s*(5[1-9]|[6-9]\d|1[01]\d|120)\s+(.+)$/)
    if(m){save();current=Number(m[1]);parts=[m[2]];continue}
    if(current!==null&&/^(?:JUSTIFICATIVA\b|CEBRASPE\s*[|–—-]|Pedro resolveu|Acerca|Julgue|Nos hospitais|Tendo como|A seguinte tabela|Uma empresa|O analista|A respeito|O método|Com base|Espaço livre)/i.test(line)){save();current=null;parts=[];continue}
    if(current!==null&&line)parts.push(line)
  }
  save()
}
const rows=[
 [51,'C E E C E C C E C C C C E C C C X E X C'],
 [71,'X E E C C C C C E E C C E E C E C E X C'],
 [91,'C E E C C E E E C C C C C E C E E E C C'],
 [111,'C E E E E E E C E C']
]
const answers=new Map()
for(const [start,row] of rows){const values=row.split(/\s+/),expected=start===111?10:20;if(values.length!==expected||values.some(v=>!['C','E','X'].includes(v)))throw Error(`Gabarito oficial inválido no bloco ${start}`);values.forEach((v,i)=>answers.set(start+i,v))}
const T={
51:['Engenharia de Produção','Gestão da demanda e previsão de volume de produção'],52:['Engenharia de Produção','Planejamento integrado da produção, entrega e atendimento'],53:['Engenharia de Produção','Estratégias de atendimento ao pedido: assembly-to-order'],54:['Engenharia de Produção','Lead time do processo e fluxo pedido-entrega'],55:['Engenharia de Produção','Controle da produção e desempenho da entrega'],
56:['Engenharia de Produção','Gestão por processos: integração, qualidade e handoffs'],57:['Engenharia de Produção','Gestão por processos: transferência de trabalho e informação'],58:['Engenharia de Produção','Cadeia de valor, modelagem e gestão de processos'],59:['Engenharia de Produção','Melhoria de processos: análise e redesenho organizacional'],60:['Engenharia de Produção','Automação de processos e tecnologia da informação'],
61:['Administração','Planejamento de projetos: canvas e plano de gerenciamento'],62:['Administração','Gestão ágil de projetos: Scrum e quadro Kanban'],63:['Administração','Gestão de portfólio: critérios de priorização de projetos'],64:['Administração','Maturidade em gerenciamento de projetos e gráfico radar'],
65:['Engenharia de Produção','Gestão da qualidade: dimensões da qualidade do produto'],66:['Engenharia de Produção','SIPOC e delimitação da unidade de negócio'],67:['Engenharia de Produção','Gestão da qualidade: prevenção de defeitos e inspeção'],68:['Engenharia de Produção','Qualidade de fornecedores e indicador IQF'],69:['Engenharia de Produção','Gestão da qualidade e abordagem de riscos em normas certificáveis'],
70:['Engenharia de Produção','SMED e redução do tempo de setup em serviços de saúde'],71:['Engenharia de Produção','Controle estatístico de processos: limite de especificação'],72:['Engenharia de Produção','Controle estatístico da qualidade: variáveis e atributos'],73:['Engenharia de Produção','Gráficos de controle: média, amplitude e desvio-padrão'],74:['Engenharia de Produção','Metrologia: calibração e repetibilidade de instrumentos'],
75:['Engenharia Econômica','Análise incremental de investimentos por VPL e TIR'],76:['Engenharia Econômica','Valor anual uniforme equivalente (VAUE)'],77:['Engenharia Econômica','VPL, vidas úteis diferentes e reinvestimento'],78:['Engenharia Econômica','Payback descontado e fluxos de caixa'],79:['Engenharia Econômica','Custos fixos, valor residual e vida econômica'],80:['Engenharia Econômica','Custo total médio e volume de produção'],81:['Engenharia Econômica','Ponto de equilíbrio entre sistemas de produção'],
82:['Finanças','CAPM: beta de carteira e retorno esperado'],83:['Finanças','CAPM: risco sistemático e risco total'],84:['Finanças','CAPM e alfa de Jensen: retorno observado e esperado'],
85:['Engenharia de Produção','Desenvolvimento de produtos: projeto informacional e especificações'],86:['Engenharia de Produção','Desenvolvimento de produtos: projeto conceitual'],87:['Engenharia de Produção','Projeto preliminar: manufaturabilidade e viabilidade econômica'],88:['Engenharia de Produção','Projeto detalhado e preparação da produção'],89:['Engenharia de Produção','QFD: estrutura das matrizes do desdobramento da função qualidade'],90:['Engenharia de Produção','QFD: voz do cliente e requisitos do produto'],91:['Engenharia de Produção','QFD: características da qualidade e especificações de projeto'],92:['Engenharia de Produção','Casa da qualidade: matriz de relacionamento e priorização'],93:['Engenharia de Produção','Casa da qualidade: correlação entre requisitos de projeto'],94:['Engenharia de Produção','Ecodesign e ciclo de vida do produto'],95:['Engenharia de Produção','Projeto modular e arquitetura de produto'],96:['Engenharia de Produção','Projeto para configuração e precisão funcional'],97:['Engenharia de Produção','Projeto para desmontagem e recuperação de materiais'],
98:['Administração','Gestão estratégica e horizontes de decisão'],99:['Administração','Planejamento estratégico e relação organização-ambiente'],100:['Administração','Diagnóstico estratégico: análise interna e externa'],101:['Administração','Análise de mercado e participação de produtos nas vendas'],102:['Administração','Estratégia competitiva de diferenciação'],103:['Administração','Matriz de Ansoff: diversificação de produtos e mercados'],104:['Administração','Estratégia de marketing alinhada às metas organizacionais'],105:['Administração','Visão baseada em recursos e recursos valiosos'],106:['Administração','Visão baseada em recursos e competências centrais'],107:['Administração','Balanced Scorecard como sistema de controle gerencial'],108:['Administração','Balanced Scorecard: processos internos de negócio'],109:['Administração','Balanced Scorecard: satisfação e fidelidade do cliente'],110:['Administração','Gestão tecnológica e aplicação do conhecimento científico'],111:['Administração','Pesquisa e desenvolvimento (P&D) nas organizações'],112:['Administração','Benchmarking: adoção de melhores práticas intersetoriais'],113:['Administração','ERP e benchmarking: distinção entre sistemas e técnicas'],114:['Administração','Sistemas de informação e sistemas de produção'],115:['Administração','Inovação, empreendedorismo e teoria schumpeteriana'],116:['Administração','Gestão da inovação: fatores internos e externos'],117:['Administração','Gestão de inovação e risco tecnológico'],118:['Administração','Gestão do conhecimento: dados, informação e conhecimento'],119:['Administração','Gestão ambiental: prevenção e participação comunitária'],120:['Administração','Gestão ambiental e mobilidade sustentável de empregados']
}
const contexts={
production:'Pedro pretende operar um serviço de disk pizza, atividade que combina manufatura e serviços. O bloco trata de previsão da demanda, planejamento, sistema de produção, lead time e controle até a entrega.',
process:'Os itens abordam gestão de processos, handoffs, cadeia de valor, melhoria e automação de processos organizacionais.',
projects:'Os itens tratam de gerenciamento de projetos, planejamento tradicional e ágil, portfólio e avaliação de maturidade.',
quality:'Os itens tratam da gestão da qualidade, dimensões do produto, SIPOC, prevenção de defeitos, qualidade de fornecedores, normas e indicadores.',
hospital:'Em uma rede hospitalar de mesmo perfil, o setup de um leito recém-desocupado foi medido em 50 minutos e adotado como referência. Os itens abordam SMED, controle estatístico e metrologia.',
investment:'Tabela dos fluxos de caixa e TIR dos projetos mutuamente excludentes (UM): A: investimento inicial −10.000, ano 1 +15.000, TIR 50%; B: −15.000, ano 1 +21.000, TIR 40%; C: −20.000, anos 1, 2 e 3 +13.000 em cada ano, TIR 43%. Taxa mínima de atratividade: 10% a.a. Aproximações fornecidas no caderno: (1,1)⁻¹ ≈ 0,9; (1,1)⁻² ≈ 0,8; fator de valor presente de anuidade de três anos ≈ 2,5.',
systems:'Tabela dos sistemas de produção (UM): A — investimento inicial 1.000.000, vida econômica 8 anos, 200 unidades/dia, valor residual 110.000 e custo variável unitário 20; B — investimento inicial 500.000, vida econômica 6 anos, 100 unidades/dia, valor residual 80.000 e custo variável unitário 40. TMA: 10% a.a. O caderno fornece os fatores de valor presente/recuperação de capital para cada vida útil.',
capm:'Um banco avalia carteira com 60% de ações da empresa A (beta 1,5) e 40% de ações da empresa B (beta 0,75). Taxa livre de risco: 5% a.a.; prêmio de risco de mercado: 10% a.a. Os itens abordam CAPM, risco e alfa de Jensen.',
product:'Os itens tratam das fases do processo de desenvolvimento de produtos: projeto informacional, conceitual, preliminar e detalhado.',
qfd:'Considere o método QFD (desdobramento da função qualidade), conhecido como método das matrizes; uma delas é a casa da qualidade. Os itens abordam necessidades dos clientes, requisitos de projeto, priorização e relações entre características.',
design:'Os itens abordam projeto integrado de produto, ecodesign, modularidade, configuração e desmontagem.',
strategy:'Os itens tratam de gestão estratégica e organizacional, análise de mercado, estratégias genéricas e matriz de Ansoff.',
scorecard:'Os itens abordam integração da estratégia organizacional ao marketing, visão baseada em recursos e perspectivas do Balanced Scorecard.',
knowledge:'Os itens tratam de gestão do conhecimento, tecnologia, P&D, benchmarking, ERP e sistemas de informação organizacionais.',
innovation:'Os itens abordam inovação, empreendedorismo, fatores externos e internos e gestão de riscos.',
environment:'Os itens tratam de responsabilidade e gestão ambiental nas organizações.'
}
const contextFor=n=>n<=55?contexts.production:n<=60?contexts.process:n<=64?contexts.projects:n<=69?contexts.quality:n<=74?contexts.hospital:n<=78?contexts.investment:n<=81?contexts.systems:n<=84?contexts.capm:n<=88?contexts.product:n<=93?contexts.qfd:n<=97?contexts.design:n<=103?contexts.strategy:n<=109?contexts.scorecard:n<=114?contexts.knowledge:n<=118?contexts.innovation:contexts.environment
const duplicates={
 'extr-f350f5d9eb8157b4a0c5':'extr-4e4a5182b6210e640244',
 'extr-6cd9f128a52bdb94c5c6':'extr-e1efae567b93e60c8df2',
 'extr-13b5145242ef37a220cf':'extr-832af2bf7cfdf3efe424'
}
if(records.length!==66)throw Error(`Esperados 66 registros pendentes, recebidos ${records.length}`)
if(records.some(q=>q.resposta!=null))throw Error('Há respostas preexistentes; compare antes de sobrescrever.')
const decisions=records.map(q=>{
  const n=Number(q.numero),topic=T[n],answer=answers.get(n),stem=source.get(n)
  if(!topic||!answer||!stem)throw Error(`Item ${n}: classificação, gabarito definitivo ou enunciado oficial ausente.`)
  if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato incompatível no item ${n}`)
  const duplicate=duplicates[q.id],anulada=answer==='X'
  const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,texto_apoio:contextFor(n),materia:n>=82&&n<=84?'Finanças':n>=98?'Administração':n>=61&&n<=64?'Administração':n>=75&&n<=81?'Engenharia Econômica':'Engenharia de Produção',conteudo:topic[1],ano:2019,concurso:'SLU/DF 2019 — Analista de Gestão de Resíduos Sólidos — Especialidade Engenharia de Produção — Cargo 11',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 19/05/2019',cargo:'Analista de Gestão de Resíduos Sólidos — Especialidade Engenharia de Produção — Cargo 11',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[53,54,59,63,64,70,72,73,74,75,77,78,79,80,81,82,83,84,86,89,92,93,96,97,100,105,106,107,110,114,117].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual, normativa ou quantitativa; não é faixa publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 11; classificação temática específica segundo o tópico e conceito de Engenharia de Produção, Engenharia Econômica, Finanças ou Administração avaliado.`,resposta_correta:anulada?null:(answer==='C'?0:1),anulada,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:'11_GAB_DEFINITIVO_449_SLUDF_011_00_PAG_7.PDF',prova:'11_449_SLUDF_011_00_COM_JUST.PDF',numero:n,pagina:1,resposta:answer,criterio:anulada?'Gabarito oficial definitivo marca X; item anulado.':'Gabarito oficial definitivo do Cargo 11 — Engenharia de Produção.'}}
  if(duplicate){d.apta_resolucao=false;d.inelegibilidade_motivo='duplicacao_de_extracao_mesmo_item';d.duplicada_de=duplicate}else d.apta_resolucao=true
  return d
})
if(decisions.some(d=>!d.texto_apoio))throw Error('Há item sem contexto.')
if(decisions.filter(d=>d.apta_resolucao===false).length!==3)throw Error('Quantidade de duplicatas inesperada.')
if(decisions.filter(d=>d.anulada).map(d=>d.numero).sort((a,b)=>a-b).join(',')!=='67,69,71,89')throw Error('Itens anulados divergem do gabarito oficial.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,unicos:new Set(decisions.map(d=>d.numero)).size,duplicatas:decisions.filter(d=>!d.apta_resolucao).map(d=>({numero:d.numero,id:d.id,duplicadaDe:d.duplicada_de})),anulados:decisions.filter(d=>d.anulada).map(d=>d.numero),semFonte:records.filter(q=>!source.has(Number(q.numero))).map(q=>q.numero),comJustificativaNoStem:decisions.filter(d=>/JUSTIFICATIVA/i.test(d.enunciado)).map(d=>d.numero),prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — SLU/DF 2019 — Analista de Gestão de Resíduos Sólidos — Engenharia de Produção — Cargo 11',itens:decisions.map(d=>({numero:d.numero,id:d.id,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,anulada:d.anulada,duplicadaDe:d.duplicada_de||null,pagina:d.pagina,textoBase:Boolean(d.texto_apoio)})),prova,gabarito,publicado:false,nota:'66 registros pendentes revistos, com conteúdo específico e gabarito definitivo oficial. As justificativas que haviam entrado no texto OCR foram removidas dos enunciados. As duas tabelas de investimentos e sistemas de produção foram transcritas em texto acessível. Três duplicatas foram preservadas para auditoria e marcadas inelegíveis; anulados 67, 69, 71 e 89.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — SLU/DF 2019 — Engenharia de Produção, Cargo 11 — revisão v395\n\n- 66 registros pendentes reclassificados em Engenharia de Produção, Engenharia Econômica, Finanças e Administração, com conteúdo técnico específico e metadados da aplicação.\n- Separadas as justificativas do gabarito que haviam contaminado enunciados OCR. Os contextos disk pizza, setup hospitalar, CAPM, QFD e gestão estratégica foram restabelecidos; tabelas de fluxos de caixa e de sistemas A/B foram transcritas para texto.\n- Gabarito definitivo conferido item a item; itens 67, 69, 71 e 89 anulados.\n- Três cópias OCR dos itens 51, 54 e 55 preservadas para auditoria e marcadas inelegíveis, vinculadas às versões canônicas.\n- Fontes: [caderno oficial com justificativas](${prova}) e [gabarito definitivo oficial do Cargo 11](${gabarito}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
