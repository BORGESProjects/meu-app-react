import fs from 'node:fs/promises'
import {raizesAtuais,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='e239f315b0816b00'
const prova='https://cdn.cebraspe.org.br/concursos/INOVERSASUL_24/arquivos/033_INOVERSASUL_001_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/INOVERSASUL_24/arquivos/GAB_DEFINITIVO_033_INOVERSASUL_001_01.PDF'
const concurso='Fundação Inoversa Sul 2024 — Cargo 1: Analista Administrativo (Comunicação) — aplicação em 05/01/2025'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='033_INOVERSASUL_001_01.PDF')throw Error('Caderno oficial da Fundação Inoversa Sul não confere')

const respostaTexto=['E','C','C','E','E','C','E','C','E','C','C','E','E','C','C','C','E','E','C','C',
 'E','E','C','E','C','E','E','C','E','C','E','C','C','E','E','E','C','C','E','C',
 'C','E','C','E','E','E','C','C','C','C','C','E','C','C','E','E','E','C','C','C'].join('')
if(respostaTexto.length!==60||/[^CE]/.test(respostaTexto))throw Error('Gabarito definitivo inválido')
const respostas=Object.fromEntries([...respostaTexto].map((v,i)=>[i+41,v]))
const assuntos={
41:['Administração Geral','Abordagens administrativas: modelo gerencial e papel do Estado'],42:['Administração Geral','Teoria da contingência e adequação da estrutura organizacional'],43:['Administração Geral','Abordagem clássica: eficiência e desempenho de recursos'],44:['Administração Geral','Teoria burocrática de Max Weber e foco organizacional'],45:['Administração Pública','DASP e evolução dos modelos patrimonialista e burocrático'],
46:['Administração Geral','Balanced Scorecard: perspectivas de desempenho'],47:['Processo Administrativo','Funções administrativas: organização, planejamento e diagnóstico'],48:['Processo Administrativo','Função de direção e orientação de recursos'],49:['Planejamento','Planejamento tático e alocação de recursos'],50:['Planejamento Estratégico','Definição de objetivos organizacionais'],51:['Planejamento Estratégico','Missão organizacional e razão de ser'],52:['Planejamento Estratégico','Análise SWOT: fatores internos e externos'],
53:['Teorias da Administração','Teoria das relações humanas e estrutura organizacional'],54:['Processo Decisório','Racionalidade, padrões organizacionais e autonomia para decidir'],55:['Processo Decisório','Racionalidade limitada e decisão baseada em informação parcial'],56:['Cultura Organizacional','Cultura adaptativa, inovação e transformação digital'],57:['Estrutura Organizacional','Departamentalização por projetos e flexibilidade estrutural'],58:['Organização Informal','Normas informais e desempenho dos grupos'],59:['Liderança','Descentralização, delegação e compartilhamento de decisões'],60:['Liderança','Competências de liderança, motivação e desempenho'],
61:['Comunicação Organizacional','Comunicação eficaz e suficiência da informação'],62:['Gestão do Desempenho','Indicadores organizacionais e fatores externos'],63:['Processo Administrativo','Etapas do controle: critérios, medição, comparação e correção'],64:['Processo Administrativo','Controle organizacional e adaptação a mudanças'],
65:['Comunicação Corporativa','Comunicação integrada e conceito de comunicação corporativa'],66:['Comunicação Corporativa','Comunicação interna, reputação externa e coesão organizacional'],67:['Comunicação Corporativa','Diferenças entre comunicação corporativa e marketing'],68:['Comunicação','Elementos do processo: emissor, destinatário e grupos'],69:['Comunicação Corporativa','Integração entre comunicação interna e externa'],70:['Comunicação','Ruído e distorção na transmissão de mensagens'],71:['Comunicação Corporativa','Transparência e comunicação organizacional em crises'],72:['Comunicação Corporativa','Stakeholders e públicos de relacionamento'],73:['Comunicação Corporativa','Identidade organizacional e comunicação integrada'],74:['Comunicação Corporativa','Relação entre comunicação corporativa e publicidade'],75:['Comunicação Organizacional','Comunicação e formação da cultura organizacional'],
76:['Planejamento de Comunicação','Avaliação contínua de estratégias durante lançamento de produto'],77:['Comunicação Interna','Feedback de funcionários no planejamento de comunicação'],78:['Comunicação Integrada','Engajamento dos públicos interno e externo'],79:['Planejamento de Comunicação','Sequenciamento de objetivos, estratégias e táticas'],80:['Planejamento de Comunicação','Análise de público-alvo e adequação de mensagens'],81:['Planejamento de Comunicação','Flexibilidade tática e objetivos de comunicação'],82:['Comunicação Integrada','Integração entre comunicação e áreas da organização'],
83:['Marketing','Personas, públicos e matriz de posicionamento'],84:['Planejamento Estratégico','Análise SWOT: fraquezas e posicionamento competitivo'],85:['Planejamento Estratégico','Análise SWOT: fatores internos e ameaças externas'],86:['Planejamento Estratégico','Análise SWOT: oportunidades e ambiente externo'],87:['Marketing','Matriz de posicionamento e análise de concorrentes'],
88:['Indicadores de Comunicação','KPIs e métricas de comunicação digital'],89:['Indicadores de Comunicação','Seleção de indicadores e objetivos de campanha'],90:['Avaliação de Comunicação','AMEC: out-take, outcome e mensuração de resultados'],91:['Avaliação de Comunicação','Princípios de Barcelona e equivalência de valor publicitário'],92:['Métricas Digitais','Indicadores quantitativos e qualitativos em redes sociais'],
93:['Gestão de Crises','Reputação corporativa, confiança e responsabilidade'],94:['Gestão de Crises','Transparência como resposta inicial a crises de imagem'],95:['Gestão de Crises','Recall de produto e gestão de reputação'],96:['Gestão de Crises','Transparência com a imprensa durante crises corporativas'],97:['Imagem e Reputação','Diferenças entre imagem e reputação organizacional'],98:['Negociação','Negociação baseada em princípios e solução colaborativa'],99:['Negociação','Estilo de compromisso e busca de meio-termo'],100:['Negociação','Rapport e comunicação corporativa']
}
const contextoPorNumero={
41:'Julgue os itens seguintes, em relação às principais abordagens da administração e à evolução da administração pública no Brasil.',
46:'Acerca de processos administrativos, julgue os itens a seguir.',
53:'Julgue os itens subsecutivos, a respeito de processo decisório e estrutura organizacional.',
56:'Acerca dos tipos de departamentalização, da organização informal e da cultura organizacional, julgue os itens que se seguem.',
59:'Julgue os próximos itens, referentes a motivação, liderança, comunicação, descentralização e delegação.',
62:'Julgue os itens a seguir, acerca de tipos de controle e suas características e de sistemas de medição do desempenho organizacional.',
65:'Julgue os itens a seguir, a respeito da comunicação corporativa.',
76:'Texto-base: empresa emergente de tecnologia em saúde lançará a pulse fit, pulseira inteligente que monitora sinais vitais e oferece recomendações personalizadas; além da divulgação externa, deseja engajar suas equipes como embaixadoras do produto. Julgue os itens sobre o cenário.',
83:'Texto-base: empresa de tecnologia enfrenta falhas de comunicação entre desenvolvimento e marketing, respostas insuficientes a clientes e informações digitais conflitantes, prejudicando funcionários, clientes e reputação. Julgue os itens sobre SWOT e matriz de posicionamento.',
88:'Em relação aos indicadores de desempenho e ao monitoramento de resultados na comunicação corporativa, julgue os itens a seguir.',
91:'Julgue os itens acerca da mensuração de resultados da comunicação e do acompanhamento de métricas em redes sociais.',
93:'Texto-base: após mortes ligadas a cápsulas de analgésico adulteradas com cianeto nos Estados Unidos, a fabricante retirou rapidamente os lotes, submeteu-os a análise laboratorial, suspendeu a propaganda e respondeu à imprensa. Julgue os itens sobre reputação e gerenciamento de crise.',
98:'Julgue os itens a seguir, referentes a técnicas de negociação como suporte à comunicação corporativa.'
}
const contexto=n=>{let t='';for(const k of Object.keys(contextoPorNumero).map(Number).sort((a,b)=>a-b))if(k<=n)t=contextoPorNumero[k];return t}
const paginas=new Map(catalog.questoes.map(q=>[Number(q.numero),Number(q.pagina)]))
if(Object.keys(assuntos).length!==60||new Set(catalog.questoes.map(q=>Number(q.numero))).size!==60)throw Error('Classificação não cobre os 60 itens 41–100')
for(let n=41;n<=100;n++)if(!assuntos[n]||!paginas.has(n)||!respostas[n])throw Error(`Item ${n}: matéria, página ou gabarito ausente`)
const registros=[]
for await(const {questoes} of lotesAtuais())for(const q of questoes)if(q.documento_id===doc)registros.push(q)
if(registros.length!==63||new Set(registros.map(q=>Number(q.numero_original))).size!==60)throw Error(`Esperava 63 registros OCR para 60 itens; encontrei ${registros.length} e ${new Set(registros.map(q=>q.numero_original)).size}`)
const duplicadas=new Map([
 ['extr-93554b84a3e3f61af21a','extr-38780333bfa048471853'],
 ['extr-e63a306d5c1eb5e75a9f','extr-65f99863ffa2fc521418'],
 ['extr-69151ec7e6d6f03127b1','extr-8b2a513ef21b7027efcc']
])
const correcoes={44:'A consideração das pessoas como parte mais importante da organização surge no tipo ideal de burocracia de Weber.',97:'A imagem difere da reputação porque representa um julgamento de valor com dimensão histórica, isto é, construído ao longo de anos.'}
const digest=hashRevisao(respostaTexto)
const decisoes=registros.map(q=>{
 const n=Number(q.numero_original),t=assuntos[n],pagina=paginas.get(n),ctx=contexto(n),resposta=respostas[n]
 if(!t||!pagina||!ctx)throw Error(`Item ${n}: assunto, página ou contexto ausente`)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2025,concurso,numero_original:n,pagina,dificuldade:[44,45,46,49,52,54,55,57,58,62,63,64,66,67,70,73,76,80,83,84,85,86,87,88,90,91,93,95,97,98,99].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na exigência conceitual e aplicada; a banca não publicou nível por item.',motivo:`Item ${n}: classificado individualmente a partir do enunciado, do bloco temático e do cargo oficial Analista Administrativo (Comunicação).`,classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura integral do caderno oficial e inspeção visual das três páginas'},resposta_correta:resposta==='C'?0:1,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_033_INOVERSASUL_001_01.PDF',criterio:'Gabarito oficial definitivo CEBRASPE — Cargo 1: Analista Administrativo (Comunicação).',numero:n,pagina:1,resposta,sha256:digest,hash_metodo:'SHA-256 da sequência oficial dos 60 itens 41–100; não é hash do PDF.'},visual:{pagina,imagem:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,texto_apoio:ctx,motivo:`Página ${pagina} do caderno oficial vinculada ao item para preservar o bloco temático e os textos-base compartilhados.`}}
 if(correcoes[n]&&!duplicadas.has(q.id))d.enunciado=correcoes[n]
 if(duplicadas.has(q.id)){d.apta_resolucao=false;d.duplicada_de=duplicadas.get(q.id);d.inelegibilidade_motivo=`Registro OCR duplicado do item ${n}; preservado no histórico e retirado da resolução.`}
 return d
})
for(let p=1;p<=3;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const base=raizesAtuais.find(x=>x.includes('revisao-embrapa-manejo-animal-2025-v211'))
if(!base)throw Error('Raiz v211 não encontrada')
const nome='revisao-inoversasul-comunicacao-2025-v212'
const result=await aplicarRevisoesIndividuais({nome,base,decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,documento_id:doc,registros_revistos:decisoes.length,itens_oficiais_no_caderno:60,itens_unicos_classificados:60,duplicatas_ocr_excluidas:duplicadas.size,gabaritos_definitivos_associados:60,paginas_originais_conferidas:[1,2,3],data_aplicacao:'2025-01-05',prova,gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão Fundação Inoversa Sul — Analista Administrativo (Comunicação) — v212\n\n- Revisei ${decisoes.length} registros OCR dos 60 itens oficiais 41–100. Classifiquei as áreas de Administração, Administração Pública, Processo Administrativo, Comunicação Corporativa, Marketing, Indicadores, Gestão de Crises e Negociação com assunto específico, cargo, ano e dificuldade estimada.\n- Excluí três duplicatas OCR da resolução, corrigi a grafia de “Weber” no item 44 e removi contaminação OCR no item 97. Associei os textos-base compartilhados, as três páginas do caderno e o gabarito definitivo oficial.\n- Resultado local: ${out.total} registros; ${out.disponiveis} disponíveis para resolução; ${out.pendentes} pendências elegíveis. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno do Cargo 1](<${prova}>), [gabarito definitivo](<${gabarito}>), [concurso](https://www.cebraspe.org.br/concursos/INOVERSASUL_24).\n`)
console.log(JSON.stringify(out))
