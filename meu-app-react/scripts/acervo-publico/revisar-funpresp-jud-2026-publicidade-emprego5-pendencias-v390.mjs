import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-funpresp-jud-2026-publicidade-emprego5-pendencias-v390'
const doc='5ff89ef2e0c9fb91'
const prova='https://cdn.cebraspe.org.br/concursos/FUNPRESP_26_JUD/arquivos/C4A6B006AE90243DAC8E8FC725C598DFE1545DA10B31B9C85EABBC33A4F41E42.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/FUNPRESP_26_JUD/arquivos/AEE58581EE3C00C2BA0E78DC2C5C62365F48C3A9485BF3F2EEF602AB45F76737.pdf'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const sourcePages=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`)).toString('utf8'))
const questionStart=/^\s*(5[1-9]|6\d|7\d|8\d|9\d|10\d|11\d|120)\s+(.+)$/
const headingStart=/^(?:Acerca|A respeito|Em relação|Julgue|No que diz respeito|No que concerne|Considerando|Espaço livre|CEBRASPE\s*[–—-])/i
const sourceStems=new Map()
for(const page of sourcePages){
 let current=null,lines=[]
 const save=()=>{if(current!==null)sourceStems.set(current,lines.join(' ').replace(/\s+/g,' ').trim())}
 for(const raw of page.split(/\r?\n/)){
  const line=raw.trim()
  const start=line.match(questionStart)
  if(start){save();current=Number(start[1]);lines=[start[2]];continue}
  if(current!==null&&headingStart.test(line)){save();current=null;lines=[];continue}
  if(current!==null&&line)lines.push(line)
 }
 save()
}
const cleanFixes=[
 [/\bpr ofissional\b/g,'profissional'],[/\bconsideram\s+-se\b/g,'consideram-se'],[/\bcriaçã o\b/g,'criação'],[/\bprát icos\b/g,'práticos'],[/\bintertextualida de\b/g,'intertextualidade'],[/\bcomunicaçã o\b/g,'comunicação'],[/\bplanej amento\b/g,'planejamento'],[/\bproduçã o\b/g,'produção'],[/\borganiz açã o\b/g,'organização'],[/\borganizac?a\s*o\b/g,'organização'],[/\bposic ionamento\b/g,'posicionamento'],[/\bob jetivo\b/g,'objetivo'],[/\bprocess o\b/g,'processo'],[/\bmetod ologia\b/g,'metodologia'],[/\bintercambiáveis\b/g,'intercambiáveis'],[/\bcomunicaçã o\b/g,'comunicação'],[/\bconte údo\b/g,'conteúdo'],[/\bme todologia\b/g,'metodologia'],[/\badmin istrativas\b/g,'administrativas'],[/\bhegemônico\s+-dominante\b/g,'hegemônico-dominante'],[/\bposic ionamento\b/g,'posicionamento'],[/\bmen sagem\b/g,'mensagem']
]
const clean=t=>cleanFixes.reduce((s,[re,v])=>s.replace(re,v),t).replace(/\s+([,.;:!?])/g,'$1').replace(/\s+/g,' ').trim()
const answers=[
 'X','C','E','C','E','E','C','E','E','C','E','C','E','E','C','C','C','E','E','E',
 'C','E','E','C','E','E','C','C','E','C','E','C','E','C','E','C','C','C','E','E',
 'C','C','C','E','C','C','X','E','E','C','E','C','C','E','E','C','C','C','E','C',
 'E','C','E','E','C','C','E','E','C','C'
]
if(answers.length!==70)throw Error(`Gabarito deveria ter 70 itens; tem ${answers.length}`)
const key=new Map(answers.map((v,i)=>[i+51,v]))
const topics={
51:['Publicidade e Propaganda','Planejamento de comunicação: proposição única de venda (USP)'],
52:['Publicidade e Propaganda','Design publicitário: hierarquia visual e organização de layout'],
53:['Publicidade e Propaganda','Planejamento publicitário: briefing e coleta de informações'],
54:['Publicidade e Propaganda','Direção de arte: colaboração entre criação visual e redação'],
55:['Publicidade e Propaganda','Planejamento estratégico: análise SWOT'],
56:['Publicidade e Propaganda','Produção audiovisual publicitária: decupagem e direção de arte'],
57:['Publicidade e Propaganda','Métricas de publicidade: retorno sobre investimento (ROI) e construção de marca'],
58:['Publicidade e Propaganda','Pesquisa de mídia: mensuração de audiência televisiva'],
59:['Publicidade e Propaganda','Design e percepção: princípios da Gestalt aplicados à publicidade'],
60:['Publicidade e Propaganda','Planejamento de mídia: integração com objetivos e público-alvo'],
61:['Publicidade e Propaganda','Planejamento de mídia digital: marketing de influência e mídia paga'],
62:['Publicidade e Propaganda','Linguagem publicitária: persuasão, conotação, intertextualidade e humor'],
63:['Publicidade e Propaganda','Produção audiovisual: storyboard e planejamento de cenas'],
64:['Publicidade e Propaganda','Processo criativo: brainstorming e geração de ideias'],
65:['Publicidade e Propaganda','Pesquisa de mercado: métodos qualitativos e quantitativos'],
66:['Publicidade e Propaganda','Redação publicitária: headline e atenção do público'],
67:['Publicidade e Propaganda','Pré-produção audiovisual: storyboard'],
68:['Publicidade e Propaganda','Produção gráfica: resolução de imagens e DPI'],
69:['Comunicação Social','Cibercultura: impactos sociais e culturais das tecnologias digitais'],
70:['Publicidade e Propaganda','Produção audiovisual: edição de vídeo e efeitos visuais'],
71:['Comunicação Social','Web design: experiência do usuário (UX) e interface (UI)'],
72:['Publicidade e Propaganda','Pesquisa e planejamento de mídia: share of voice (SOV)'],
73:['Publicidade e Propaganda','Ética e legislação publicitária: merchandising editorial e identificação'],
74:['Publicidade e Propaganda','Autorregulamentação da publicidade: CONAR e limites de suas decisões'],
75:['Publicidade e Propaganda','Produção gráfica digital: imagem vetorial e imagem raster'],
76:['Publicidade e Propaganda','Redação publicitária digital: copywriting de resposta direta e branding'],
77:['Publicidade e Propaganda','Conteúdo de marca (branded content) e publicidade interruptiva'],
78:['Publicidade e Propaganda','Planejamento de mídia: alcance, frequência e orçamento'],
79:['Comunicação Social','Sociologia da comunicação: mídia e formação da opinião pública'],
80:['Comunicação Pública','Comunicação pública: participação social e solução de problemas coletivos'],
81:['Comunicação Pública','Transparência e controle social na comunicação pública'],
82:['Comunicação Pública','Redes sociais institucionais: adequação da linguagem aos públicos'],
83:['Comunicação Pública','Finalidade da comunicação pública e interesse coletivo'],
84:['Comunicação Social','Comunicação integrada: articulação de instrumentos e áreas'],
85:['Comunicação Social','Teorias da comunicação: interacionismo simbólico e recepção'],
86:['Comunicação Social','Teorias da comunicação: agenda-setting e formação da agenda pública'],
87:['Comunicação Social','Teorias da comunicação: modelo two-step flow e líderes de opinião'],
88:['Comunicação Social','Teorias da comunicação: espiral do silêncio e visibilidade de temas'],
89:['Comunicação Social','Estudos culturais: codificação e leitura hegemônico-dominante'],
90:['Comunicação Pública','Comunicação de risco: atendimento à imprensa em desastres'],
91:['Comunicação Pública','Comunicação de crise: verificação e enfrentamento da desinformação'],
92:['Comunicação Pública','Comunicação de risco em desastres naturais'],
93:['Comunicação Pública','Comunicação de crise: vulnerabilidade e assimetrias sociais'],
94:['Comunicação Social','Desinformação: diferença entre misinformation e disinformation'],
95:['Comunicação Social','Mídias digitais: não linearidade, interatividade e multiplataforma'],
96:['Comunicação Social','Mídias sociais: câmaras de eco e exposição seletiva'],
97:['Comunicação Social','Mídias sociais: blogs, podcasts, wikis e colaboração'],
98:['Comunicação Social','Comunicação online: interação síncrona e assíncrona'],
99:['Comunicação Social','Convergência midiática: processos, produção e consumo'],
100:['Comunicação Social','Jornalismo digital: coleta, análise e visualização de dados'],
101:['Marketing','Marketing digital: tecnologia e relacionamento entre empresas e consumidores'],
102:['Marketing','Conceitos fundamentais: criação, comunicação e entrega de valor'],
103:['Marketing','Marketing social: responsabilidade corporativa e relacionamentos'],
104:['Marketing','Pesquisa de marketing: identificação de problemas e oportunidades'],
105:['Marketing','Marketing organizacional: integração entre vendas e comunicação em crises'],
106:['Marketing','Endomarketing: alinhamento organizacional e participação dos colaboradores'],
107:['Marketing','Endomarketing: integração de marketing e recursos humanos'],
108:['Marketing','Marketing estratégico: segmentação e posicionamento'],
109:['Marketing','Marketing institucional: imagem, promoção e objetivos de venda'],
110:['Marketing','Marketing institucional: imagem organizacional e públicos de interesse'],
119:['Previdência Complementar','Resolução CNPC nº 32/2019: divulgação de informações e reconsideração de negativa'],
120:['Previdência Complementar','Resolução CNPC nº 32/2019: motivação e fundamento legal para negar acesso']
}
const supportRanges=[
 [51,55,'Acerca do planejamento de comunicação publicitária, da criação de arte e do design.'],
 [56,61,'Fundamentos teóricos e práticos da publicidade e da propaganda: planejamento de comunicação, criação, direção de arte, design gráfico, atendimento e planejamento de mídia.'],
 [62,64,'Criação e direção de arte.'],
 [65,69,'Redação publicitária, produção gráfica e audiovisual, cibercultura e pesquisa de mercado.'],
 [70,74,'Pesquisa de mídia, ética e legislação publicitária, merchandising editorial, web design e softwares de produção gráfica e audiovisual.'],
 [75,78,'Cibercultura e produção digital, redação publicitária, planejamento de mídia e softwares Adobe.'],
 [79,83,'Papel da comunicação pública na sociedade.'],
 [84,89,'Teorias da comunicação e conceitos da comunicação pública.'],
 [90,93,'Comunicação organizacional e comunicação de crise.'],
 [94,100,'Mídias web e digitais, redes sociais, blogs, podcasts, wikis, comunicação online e novas tecnologias.'],
 [101,103,'Conceitos fundamentais de marketing e sua função social.'],
 [104,110,'Composto mercadológico, endomarketing, marketing institucional, pesquisa de marketing, segmentação e posicionamento.'],
 [111,120,'Divulgação de informações pelas entidades fechadas de previdência complementar (EFPC), conforme a Resolução CNPC nº 32/2019.']
]
const supportFor=n=>supportRanges.find(([a,b])=>n>=a&&n<=b)?.[2]
const existing=records.filter(q=>q.resposta!=null&&key.get(Number(q.numero))!=='X'&&q.resposta!==(key.get(Number(q.numero))==='C'?0:1))
if(existing.length)throw Error(`Respostas pré-existentes divergem do gabarito: ${existing.map(q=>q.numero).join(', ')}`)
const decisions=records.map(q=>{
 const n=Number(q.numero),stem=sourceStems.get(n),topic=topics[n],answer=key.get(n)
 if(!stem||!topic||!answer)throw Error(`Fonte oficial incompleta/classificação ausente no item ${n}`)
 if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Tipo de resposta inesperado no item ${n}`)
 const annulled=answer==='X'
 const hard=[70,72,73,85,86,88,89,94,99,104,111,112,113,114,115,116,117,118,119,120].includes(n)
 const medium=[51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,71,74,75,76,77,78,79,80,81,82,83,84,87,90,91,92,93,95,96,97,98,100,101,102,103,105,106,107,108,109,110].includes(n)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:clean(stem),texto_apoio:supportFor(n),materia:topic[0],conteudo:topic[1],ano:2026,concurso:'Fundação de Previdência Complementar do Servidor Público Federal do Poder Judiciário — Funpresp-Jud 2026',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 05/07/2026',cargo:'Analista — Especialidade: Comunicação Social — Publicidade e Propaganda — Emprego 5',numero_original:n,numero:n,pagina:q.pagina,dificuldade:hard?'Difícil':medium?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na especificidade conceitual ou normativa exigida; a banca não publica faixa de dificuldade por item.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial de conhecimentos específicos do Emprego 5; conteúdo e subtema atribuídos pelo enunciado e pelo comando da seção.`,resposta_correta:annulled?null:(answer==='C'?0:1),anulada:annulled,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:'GABARITOS OFICIAIS DEFINITIVOS — Emprego 5',prova:'205_FUNPRESP_26_JUD_005_01',numero:n,pagina:1,resposta:answer,criterio:annulled?'Gabarito oficial definitivo marca X; item anulado.':'Gabarito oficial definitivo do Emprego 5, conforme sequência numerada publicada pelo CEBRASPE.'}}
})
if(decisions.length!==65)throw Error(`Esperados 65 registros; encontrados ${decisions.length}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,distintos:new Set(decisions.map(d=>d.numero)).size,duplicados:decisions.length-new Set(decisions.map(d=>d.numero)).size,semStem:decisions.filter(d=>!d.enunciado).map(d=>d.numero),anulados:decisions.filter(d=>d.anulada).map(d=>d.numero),prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — Funpresp-Jud 2026 — Analista de Comunicação Social — Publicidade e Propaganda — Emprego 5',itens:decisions.map(d=>({numero:d.numero,id:d.id,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,anulada:d.anulada,pagina:d.pagina,duplicidadePreservada:true})),prova,gabarito,publicado:false,nota:'65 registros pendentes revisados (60 números distintos; cinco ocorrências duplicadas foram preservadas, sem exclusão). Enunciados reconstruídos a partir do texto-fonte local da prova oficial, com os comandos comuns às seções preservados como texto de apoio. Gabarito definitivo vinculado; item 51 anulado conforme a publicação oficial. Ano da edição e data de aplicação separados corretamente.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — Funpresp-Jud 2026 — Publicidade e Propaganda, Emprego 5 — revisão v390\n\n- 65 registros pendentes classificados (60 números únicos; 5 duplicações preservadas) por matéria, conteúdo, concurso, cargo, ano, data de aplicação e dificuldade estimada.\n- Enunciados reconstruídos do texto-fonte local da prova; comandos comuns a cada bloco foram preservados como texto de apoio.\n- Gabarito definitivo oficial vinculado; item 51 anulado.\n- Fontes: [prova oficial CEBRASPE](${prova}) e [gabarito definitivo oficial CEBRASPE](${gabarito}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
