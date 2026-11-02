import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-trf6-2024-agente-policia-judicial-itens51-120-v389',doc='07412209ec18d95f'
const prova='https://cdn.cebraspe.org.br/concursos/trf6_24/arquivos/034_TRF6_025_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/trf6_24/arquivos/GAB_DEFINITIVO_034_TRF6_025_01.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const keyRows=[
 [51,'EE C E E C C C E C C E E E E E C C C E'],
 [71,'EE E E C C C E C C C E C C E E C E E C'],
 [91,'EC E E C E C C E E E E E C E C C C E C'],
 [111,'CE C E E E X X E X']
]
const answers=new Map()
for(const [start,row] of keyRows){
 const values=row.split(/\s+/).flatMap(token=>token.split(''))
 const expected=start===111?10:20
 if(values.length!==expected||values.some(v=>!'CEX'.includes(v)))throw Error(`Linha inválida do gabarito definitivo, item ${start}: ${values.length}`)
 values.forEach((v,i)=>answers.set(start+i,v))
}
const topics={
51:['Segurança Institucional','Segurança de dignitários: planejamento de esquemas e emprego proporcional de recursos'],
52:['Segurança Institucional','Segurança de dignitários: prevenção, antecipação de riscos e resposta a ameaças'],
53:['Segurança Institucional','Segurança de dignitários: avaliação do contexto social e dos órgãos de segurança locais'],
54:['Segurança Institucional','Segurança de dignitários: planejamento antecipado de eventos públicos'],
55:['Segurança Institucional','Segurança de dignitários: cooperação e emprego de recursos de segurança pública'],
56:['Inteligência','Fontes abertas (OSINT): análise de redes sociais e monitoramento de ameaças'],
57:['Segurança da Informação','Tríade CID: confidencialidade, integridade e disponibilidade'],
58:['Gestão de Riscos','Análise de riscos: ameaças, vulnerabilidades e impactos'],
59:['Inteligência','Contrainteligência: identificação e neutralização de ações adversas'],
60:['Inteligência','Produção de conhecimento: análise de riscos, ameaças e vulnerabilidades'],
61:['Gestão de Crises','Gerenciamento de crise: emprego coordenado de força e manutenção da negociação'],
62:['Gestão de Crises','Negociação de crises: atribuições do negociador e decisão tática'],
63:['Gestão de Crises','Gerenciamento de crise: planejamento prévio e resposta a eventos críticos'],
64:['Gestão de Crises','Primeiro interventor: contenção, isolamento e início da negociação'],
65:['Gestão de Crises','Gerenciamento de crise com refém: procedimento diante de rendição voluntária'],
66:['Segurança Institucional','Segurança orgânica: educação e desenvolvimento da mentalidade de segurança'],
67:['Segurança Institucional','Política Nacional de Segurança do Poder Judiciário: princípios e proteção de ativos'],
68:['Segurança Patrimonial','Plano de segurança orgânica: identificação de riscos a instalações'],
69:['Segurança Institucional','Controle de acesso a tribunais: inspeção por detector de metais'],
70:['Segurança contra Incêndio','Saídas de emergência: requisitos de desobstrução e fechamento'],
71:['Segurança contra Incêndio','Sistemas de combate a incêndio: extintores, hidrantes e chuveiros automáticos'],
72:['Segurança contra Incêndio','Inspeção e manutenção de extintores de dióxido de carbono'],
73:['Segurança contra Incêndio','Classes de incêndio: materiais sólidos e características da combustão'],
74:['Segurança contra Incêndio','Combate a incêndio: uso de água em fogo de classe B'],
75:['Segurança contra Incêndio','Incêndio em óleo de cozinha: agentes extintores adequados'],
76:['Primeiros Socorros','Segurança da cena: avaliação dos riscos antes do atendimento'],
77:['Segurança Institucional','Plano de evacuação: exercícios simulados de abandono predial'],
78:['Primeiros Socorros','Crise convulsiva: proteção da vítima e manejo de vias aéreas'],
79:['Inteligência','Fontes abertas: verificação de autenticidade e precisão da informação'],
80:['Segurança Institucional','Polícia judicial: capacitação e cooperação entre órgãos'],
81:['Direitos Humanos','Sistema interamericano: Convenção Americana e pena de morte'],
82:['Direitos Humanos','Declaração Universal dos Direitos Humanos: direito de buscar asilo'],
83:['Direitos Humanos','Sistema interamericano: atribuições da Comissão Interamericana de Direitos Humanos'],
84:['Direitos Humanos','Declaração Universal dos Direitos Humanos: gratuidade da instrução básica'],
85:['Direitos Humanos','Tratados internacionais de direitos humanos: denúncia e efeitos no direito brasileiro'],
87:['Direito Constitucional','Controle de convencionalidade: competência e parâmetros de compatibilidade'],
88:['Direitos Humanos','Tratados de direitos humanos: rito de aprovação equivalente a emenda constitucional'],
89:['Direitos Humanos','Afirmação histórica dos direitos humanos: internacionalização e DUDH'],
90:['Direitos Humanos','Características dos direitos humanos: indivisibilidade e proteção jurídica'],
91:['Direitos Humanos','Eficácia dos direitos humanos: dimensões vertical e horizontal'],
92:['Direitos Humanos','Dimensões dos direitos humanos: direitos coletivos e princípio da solidariedade'],
93:['Direito Penal','Imputabilidade penal: embriaguez fortuita ou decorrente de força maior'],
94:['Direito Penal','Culpabilidade: coação moral ou física irresistível'],
95:['Direito Penal','Excludentes de ilicitude: legítima defesa sucessiva'],
96:['Direito Penal','Extinção ou redução de pena: arrependimento posterior'],
97:['Direito Penal','Crimes contra a dignidade sexual: divulgação de cena de estupro'],
98:['Direito Penal','Crimes contra a Administração Pública e o patrimônio: concussão e extorsão'],
99:['Direito Penal','Crimes contra a vida: homicídio e emprego de arma de fogo de uso permitido'],
100:['Direito Penal','Furto mediante fraude eletrônica: forma de execução e substituição da pena'],
101:['Direito Processual Penal','Provas: hipóteses e pessoas sujeitas à acareação'],
102:['Direito Processual Penal','Inquérito policial: instauração e prazos conforme a situação de liberdade'],
103:['Direito Processual Penal','Busca pessoal e apreensão de correspondência: limites probatórios'],
104:['Direito Processual Penal','Cadeia de custódia: reconhecimento e preservação de vestígios'],
105:['Direito Processual Penal','Prisões cautelares: prazo e prorrogação da prisão temporária'],
106:['Direito Processual Penal','Prisão preventiva: dúvida sobre identidade civil e requisitos legais'],
107:['Direito Penal','Abuso de autoridade: ação penal e penas restritivas de direitos'],
108:['Direito Penal','Crimes contra o patrimônio: consumação do furto e inversão da posse'],
109:['Direito Penal','Crimes contra a Administração Pública: desacato e liberdade de expressão'],
110:['Direito Penal','Crimes de racismo: acompanhamento jurídico da vítima no processo'],
111:['Segurança Institucional','Polícia judicial: cessão de servidores e autorização para porte de arma'],
112:['Direito Processual Penal','Poder de polícia dos tribunais: apuração preliminar de infração penal'],
113:['Direitos Humanos','Estatuto da Pessoa Idosa: processo administrativo sancionador'],
114:['Direitos Humanos','Estatuto da Pessoa Idosa: prioridade de tramitação processual'],
115:['Direitos Humanos','Estatuto da Pessoa com Deficiência: tecnologia assistiva e vedação de cobrança adicional'],
116:['Direitos Humanos','Direitos da pessoa com deficiência: comunicação de violações ao CNJ'],
117:['Segurança Institucional','Sistema de Inteligência de Segurança Institucional do Poder Judiciário: prioridade processual'],
118:['Segurança Institucional','Segurança institucional judiciária: destinação de armamentos apreendidos'],
119:['Segurança Institucional','Sistema de Inteligência de Segurança Institucional do Poder Judiciário: composição permanente'],
120:['Segurança Institucional','Política Nacional de Segurança do Poder Judiciário: execução e coordenação do SINASPJ']
}
const cleanStems={
60:'A atividade de inteligência está diretamente associada à análise de riscos, porquanto objetiva a produção de conhecimentos com vistas à redução de vulnerabilidades e à neutralização de ameaças.',
69:'Serão dispensados de se submeter ao pórtico detector de metais, ao acessar as dependências dos tribunais, os integrantes de escolta de presos.',
92:'A terceira geração dos direitos humanos diz respeito aos direitos de titularidade coletiva, a exemplo da paz mundial e do meio ambiente equilibrado, consagrando o princípio da solidariedade.',
96:'Deve-se aplicar o arrependimento posterior quando o acusado de crime cometido sem violência ou grave ameaça à pessoa reparar, integral e voluntariamente, o dano até o momento da prolação da sentença.',
100:'Suponha que Romualdo, réu primário, seja condenado pela prática de furto de pequeno valor mediante fraude, cometido por meio de dispositivo informático não conectado à Internet. Nessa situação, é cabível a substituição da pena de reclusão pela de detenção, em razão da primariedade do réu.',
103:'Devido ao direito fundamental ao sigilo da correspondência, não é permitido proceder-se à busca pessoal a fim de apreender cartas, ainda não abertas, destinadas ao acusado ou em seu poder, quando haja suspeita de que o conhecimento do seu conteúdo possa ser útil à elucidação do fato.',
110:'Nos crimes de racismo, é obrigatório que a vítima esteja acompanhada de advogado ou defensor público em todos os atos processuais.',
112:'No caso de infração penal praticada nas dependências físicas de tribunal, seu presidente poderá, sem prejuízo da requisição da instauração de inquérito policial, instaurar procedimento apuratório preliminar, ainda que o infrator não esteja sujeito à jurisdição do referido tribunal.',
116:'Juízes e tribunais que, no exercício de suas funções, se depararem com fatos que caracterizem violações aos direitos e garantias das pessoas com deficiência deverão reportar esses eventos ao CNJ, remetendo a este conselho as peças do processo, para que sejam tomadas as providências cabíveis.'
}
const dignitary='Cenário dos itens 51 a 55: autoridade judiciária de grande exposição na mídia participará de evento público de grande repercussão. O deslocamento será em carro oficial, seguido de percurso a pé de aproximadamente 200 metros por praça pública, por exigência protocolar.'
const crisis='Cenário dos itens 61 a 65: durante audiência criminal, um réu aproveitou um descuido da segurança interna, tomou o magistrado como refém e exigiu sua liberdade. O primeiro interventor acionou apoio e equipe especializada em negociação para gerenciar a crise.'
const mismatches=records.filter(q=>q.resposta!=null&&answers.get(Number(q.numero))!=='X'&&q.resposta!==(answers.get(Number(q.numero))==='C'?0:1))
if(mismatches.length)throw Error(`Respostas existentes divergem do gabarito definitivo: ${mismatches.map(q=>`${q.numero}=${q.resposta}/${answers.get(Number(q.numero))}`).join(', ')}`)
const decisions=records.map(q=>{
 const n=Number(q.numero),t=topics[n],answer=answers.get(n)
 if(!t||!answer)throw Error(`Item sem classificação ou gabarito oficial: ${n}`)
 if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato inesperado no item ${n}`)
 const anulada=answer==='X'
 const texto_apoio=n>=51&&n<=55?dignitary:n>=61&&n<=65?crisis:undefined
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2025,concurso:'TRF da 6ª Região 2024 — Técnico Judiciário — Área Administrativa — Especialidade Agente da Polícia Judicial — Cargo 25',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 19/01/2025',cargo:'Técnico Judiciário — Área Administrativa — Especialidade Agente da Polícia Judicial — Cargo 25',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[51,52,59,61,62,63,65,69,72,73,74,78,81,83,85,86,87,88,89,91,93,95,96,97,99,100,101,102,103,105,106,107,109,110,111,112,113,114,115,116,117,118,119,120].includes(n)?'Difícil':[53,54,55,56,57,58,60,64,66,67,68,70,71,75,76,77,79,80,82,84,90,92,94,98,104,108].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial conforme a complexidade jurídica, procedimental ou operacional; não corresponde a uma escala publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 25 — Agente da Polícia Judicial; conteúdo atribuído pelo enunciado e pelo bloco temático correspondente.`,resposta_correta:anulada?null:(answer==='C'?0:1),anulada,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_034_TRF6_025_01.PDF',prova:'034_TRF6_025_01.PDF',numero:n,pagina:1,resposta:answer,criterio:anulada?'Gabarito oficial definitivo marca X; item anulado.':'Gabarito oficial definitivo específico do caderno 034_TRF6_025_01, Cargo 25.'},...(cleanStems[n]?{enunciado:cleanStems[n]}:{}),...(texto_apoio?{texto_apoio}:{})}
})
if(decisions.length!==69)throw Error(`Esperados 69 registros pendentes; encontrados ${decisions.length}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero),contextos:decisions.filter(d=>d.texto_apoio).map(d=>d.numero),enunciadosCorrigidos:Object.keys(cleanStems),prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — TRF da 6.ª Região 2024 — Técnico Judiciário, Agente da Polícia Judicial — Cargo 25',itens:decisions.map(d=>({numero:d.numero,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,anulada:d.anulada,pagina:d.pagina,contextualizada:Boolean(d.texto_apoio),enunciado_corrigido:Boolean(d.enunciado)})),prova,gabarito,publicado:false,nota:'69 questões pendentes classificadas com identificação profissional de matéria, conteúdo, concurso, cargo, ano de aplicação e dificuldade estimada. Itens 117, 118 e 120 foram anulados segundo a chave definitiva. Os enunciados 60, 69, 92, 96, 100, 103, 110, 112 e 116 foram separados de blocos seguintes colados pelo OCR; os casos comuns aos itens 51–55 e 61–65 foram preservados como texto de apoio.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — TRF6 2024 — Agente da Polícia Judicial, Cargo 25 — revisão v389\n\n- 69 registros pendentes classificados por conteúdo específico, matéria, ano da aplicação (19/01/2025), concurso, cargo e dificuldade estimada.\n- Gabarito definitivo do mesmo caderno vinculado; itens 117, 118 e 120 marcados como anulados.\n- Enunciados contaminados pelos comandos dos itens seguintes foram limpos; os contextos comuns dos cenários de segurança de dignitário e gerenciamento de crise foram recompostos nos itens 51–55 e 61–65.\n- Fontes: [caderno oficial](${prova}) e [gabarito definitivo oficial](${gabarito}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
