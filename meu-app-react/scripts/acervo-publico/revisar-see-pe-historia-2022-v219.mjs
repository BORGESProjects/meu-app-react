import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-see-pe-historia-2022-v219',doc='033fe1cd90a4059b'
const prova='https://cdn.cebraspe.org.br/concursos/see_pe_22_educacao_basica/arquivos/714_see_pe_007_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/see_pe_22_educacao_basica/arquivos/GAB_DEFINITIVO_714_SEE_PE_007_01.PDF'
const concurso='SEE/PE 2022 — Professor de Educação Básica — Disciplina 7: História'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='714_SEE_PE_007_01.PDF'||catalog.questoes.length!==55||catalog.questoes.at(-1).numero!==105)throw Error('Inventário SEE/PE História não corresponde aos itens catalogados')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-anp-combustiveis-2022-v218'))
if(start<0)throw Error('Base anterior v218 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const byId=new Map(),wanted=new Set(catalog.questoes.map(x=>x.id))
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){byId.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(byId.size!==55||wanted.size)throw Error(`Esperados 55 itens catalogados; encontrados ${byId.size}; ausentes ${wanted.size}`)
const textPages=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`))),officialText=textPages.join('\n')
const clean=s=>s.replace(/CEBRASPE\s*[–-]\s*SEE\s*\/?PE\s*[–-]\s*Edital:\s*2022/g,'').replace(/-\s*\n\s*/g,'-').replace(/\s+/g,' ').trim()
const re=/(?:^|\n)\s*(5[1-9]|6\d|7\d|8\d|9\d|10\d|11\d|120)\s+([\s\S]*?)(?=\n\s*(?:5[1-9]|6\d|7\d|8\d|9\d|10\d|11\d|120)\s+|$)/g
const stems=new Map([...officialText.matchAll(re)].map(m=>[Number(m[1]),clean(m[2])]))
if(stems.size!==70||Array.from({length:70},(_,i)=>51+i).some(n=>!stems.has(n)))throw Error(`Texto oficial deve conter todos os 70 itens: ${stems.size}`)
const key=['C','C','E','E','C','C','E','E','C','C','E','C','E','C','C','E','E','C','C','C','C','C','E','E','C','E','C','E','E','E','C','C','C','E','C','E','C','C','C','C','E','E','X','E','C','E','E','E','C','C','C','E','C','C','E','C','E','X','C','E','C','C','C','X','C','E','C','C','E','E']
if(key.length!==70)throw Error('Gabarito oficial precisa cobrir 70 itens')
const contexts={
 51:'Texto-base (síntese fiel do caderno): a história oral é apresentada como método de investigação do passado baseado em criação, cooperação, diálogo e debate; estimula o trabalho coletivo e as relações comunitárias, dá dimensão viva ao passado e amplia as fontes históricas para além dos registros escritos. Referência indicada no caderno: Paul Thompson (1992), com trecho de Carlos José de Farias Pontes sobre história oral no ensino de História (2016, com adaptações).',
 56:'Texto-base: os Parâmetros Curriculares Nacionais de História tratam da trajetória da disciplina escolar no Brasil, de seu surgimento no século XIX à elaboração dos PCNs. Os conteúdos sugeridos articulam conhecimento histórico e contexto dos sujeitos envolvidos na disciplina. Referência citada no caderno: Jaqueline Zarbato Schmidtt, estudo sobre currículo, ensino de História e formação docente (2015, com adaptações).',
 61:'Contexto: o bloco discute os sentidos da avaliação escolar, sua justificação e orientação, e a necessidade de professores, políticas públicas e comunidade escolar problematizarem as práticas avaliativas.',
 66:'Contexto: itens sobre competências e habilidades do Currículo de Pernambuco para História nos ensinos fundamental e médio e na área de Ciências Humanas e Sociais Aplicadas.',
 71:'Contexto: período entre o processo de humanização, as sociedades ágrafas e a Antiguidade Oriental.',
 78:'Texto-base: o legado cultural da Antiguidade Clássica inclui contribuições da filosofia grega e do direito romano. Os itens abordam a trajetória de gregos e romanos antigos.',
 82:'Contexto: Idade Média entre a queda de Roma no século V e a queda de Constantinopla no século XV; bloco sobre feudalismo, economia, cultura e instituições medievais.',
 86:'Contexto: reinos e sociedades africanas entre os séculos V e XV, com foco em regiões da África Ocidental e Central e seus vínculos históricos com o Brasil.',
 91:'Contexto: ideias, pensadores e difusão do Iluminismo europeu entre os séculos XV e XVIII.',
 96:'Contexto: Revolução Industrial, iniciada na Inglaterra no século XVIII, sua expansão e efeitos sociais, econômicos e tecnológicos, sobretudo a partir do século XIX.',
 102:'Contexto: revoltas ocorridas no Brasil durante o período regencial (1831–1840).',
 106:'Contexto: princípios da educação especial na perspectiva da educação inclusiva e articulação com o ensino regular.',
 111:'Contexto: princípios e organização do Currículo de Pernambuco, incluindo equidade, educação em direitos humanos, formação integral, competências e atendimento educacional especializado.',
 116:'Contexto: conceitos e abrangência da didática na formação e na prática docente.',
 119:'Contexto: relação professor-estudante e exercício da docência no ambiente educativo.'
}
const contextFor=n=>Object.entries(contexts).reverse().find(([s])=>n>=Number(s))?.[1]||''
const topics={
51:['História','Historiografia: história oral como método de investigação'],52:['História','História oral: memória, testemunho e fontes históricas'],53:['História','Sujeitos históricos e história oral'],54:['História','Ensino de História: história oral e pluralidade historiográfica'],55:['História','História oral: narrativa coletiva e intersubjetividade'],
56:['Ensino de História','Currículo escolar e história da disciplina no Brasil'],57:['Ensino de História','Currículo: seleção de conteúdos e representações do passado'],58:['Ensino de História','Memória, Estado e currículo de História'],59:['Ensino de História','Saberes históricos e currículo da educação básica'],60:['Ensino de História','Currículo: escolhas teóricas e metodológicas'],
61:['Ensino de História','Avaliação da aprendizagem: paradigma cognitivista'],62:['Ensino de História','Avaliação e objetivos curriculares'],63:['Ensino de História','Dimensão político-ideológica da avaliação em História'],64:['Ensino de História','Concepções pedagógicas e avaliação escolar'],65:['Ensino de História','Avaliação da aprendizagem e prática docente'],
66:['Ensino de História','Currículo de Pernambuco: seleção de habilidades e diversidade local'],67:['Ensino de História','História escolar: pertencimento e identidade nacional'],68:['Ensino de História','Currículo de Pernambuco: histórias regionais'],69:['Ensino de História','Historicidade e formação do sujeito nos anos iniciais'],70:['Ensino de História','Competências, habilidades e formação do sujeito social'],
71:['História Antiga','Revolução Neolítica: agricultura, sedentarização e Estado'],72:['História Antiga','Egito Antigo: religião funerária e crença na vida após a morte'],73:['História Antiga','Egito Antigo: construção das pirâmides e organização do Estado'],74:['História Antiga','Fenícios: economia, agricultura e comércio marítimo'],75:['História Antiga','Império Persa: Ciro e guerras contra os gregos'],76:['História Antiga','Hebreus e povoamento histórico da Palestina'],77:['História Antiga','Mesopotâmia: civilizações e rios Tigre e Eufrates'],
78:['História Antiga','Guerras Púnicas e expansão de Roma'],79:['História Antiga','Sociedades grega e romana: cultura, religião e escravidão'],80:['História Antiga','Atenas: democracia e cidadania'],81:['História Antiga','Roma: conquista da Península Itálica e do Mediterrâneo'],
82:['História Medieval','Feudalismo: estrutura social, poder político e economia agrária'],83:['História Medieval','Baixa Idade Média: renascimento comercial e urbano'],84:['História Medieval','Servidão e escravidão na economia medieval europeia'],85:['História Medieval','Preservação da cultura clássica e intercâmbio intelectual'],
86:['História da África','Expansão europeia e partilha colonial da África'],87:['História da África','Costa da Guiné: impérios do Mali, Songhai e Bornu'],88:['História da África','Povos iorubás e formação política na África Ocidental'],89:['História da África','Reino do Benin: centralização e organização política'],90:['História da África','Povos bantu: classificação linguística e expansão'],
91:['História Moderna','Iluminismo: razão e crítica dos dogmas religiosos'],92:['História Moderna','Iluminismo: diversidade e unidade das ideias'],93:['História Moderna','René Descartes e racionalismo moderno'],94:['História Moderna','Iluminismo: relações com a Igreja Católica'],95:['História Moderna','Imprensa e circulação das ideias iluministas'],
96:['História Contemporânea','Primeira Revolução Industrial: pioneirismo britânico'],97:['História Contemporânea','Industrialização: condições de trabalho e salários operários'],98:['História Contemporânea','Segunda Revolução Industrial: cronologia e características'],99:['História Contemporânea','Máquina a vapor e aumento da capacidade produtiva'],100:['História Contemporânea','Ludismo e resistência à industrialização'],101:['História Contemporânea','Trabalho infantil e feminino na industrialização'],
102:['História do Brasil','Período Regencial: Cabanagem'],103:['História do Brasil','Período Regencial: Balaiada no Maranhão'],104:['História do Brasil','Período Regencial: Revolução Farroupilha e República Rio-Grandense'],105:['História do Brasil','Período Regencial: Revolta dos Malês'],
106:['Educação Inclusiva','Política Nacional de Educação Especial na perspectiva inclusiva'],107:['Educação Inclusiva','Altas habilidades: atendimento educacional especializado'],108:['Educação Inclusiva','Formação docente para educação especial'],109:['Educação Inclusiva','Inclusão escolar e atendimento a transtornos funcionais'],110:['Educação Inclusiva','Educação precoce e educação profissional inclusiva'],
111:['Currículo e Educação','Currículo de Pernambuco: equidade, direitos humanos e formação integral'],112:['Educação Inclusiva','Atendimento educacional especializado no contraturno'],113:['Currículo e Educação','Educação por competências e aprendizagem crítica'],114:['Currículo e Educação','Currículo de Pernambuco: saberes docentes e mediação pedagógica'],115:['Currículo e Educação','Conteúdos factuais no currículo escolar'],
116:['Didática','Didática: relação entre teoria e prática'],117:['Didática','Educação formal e não formal na didática'],118:['Didática','Relação professor-estudante na ação didática'],119:['Didática','Relação pedagógica e transmissão de valores sociais'],120:['Didática','Autoridade docente e vínculo socioafetivo']
}
if(Object.keys(topics).length!==70)throw Error('Classificação não cobre os 70 itens')
const answerDigest=hashRevisao(key.join(',')),pageFor=n=>n<=70?1:n<=101?2:3
for(let p=1;p<=3;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const decisions=catalog.questoes.map(e=>{
 const n=e.numero,q=byId.get(e.id),[materia,conteudo]=topics[n],page=pageFor(n),answer=key[n-51]
 if(!q||!stems.has(n)||!materia||!conteudo||!contextFor(n)||!answer)throw Error(`Item ${n}: campo essencial ausente`)
 const annulled=answer==='X',apoio=contextFor(n)
 return {id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2022,concurso,numero_original:n,pagina:page,
  dificuldade:[52,53,57,58,63,67,68,73,74,77,78,79,80,83,84,86,87,88,89,90,92,93,96,97,98,100,101,102,104,105,107,108,109,112,114,115,119,120].includes(n)?'Difícil':[51,55,62,69,71,72,75,76,81,85,91,95,99,103,106,110,117,118].includes(n)?'Fácil':'Média',
  dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e pelo nível de articulação histórica ou pedagógica exigido; não é índice psicométrico publicado pela banca.',
  enunciado:stems.get(n),opcoes:q.opcoes?.length===2?q.opcoes:['Certo','Errado'],texto_apoio:apoio,resposta_correta:annulled?null:answer==='C'?0:1,anulada:annulled,
  gabarito_oficial:{valor:answer,fonte:gabarito,arquivo:'GAB_DEFINITIVO_714_SEE_PE_007_01.PDF',prova,numero:n,pagina:1,sha256:answerDigest,hash_metodo:'SHA-256 da sequência ordenada dos 70 gabaritos oficiais definitivos, itens 51–120; não é hash criptográfico do PDF.',criterio:'Gabarito oficial definitivo CEBRASPE — SEE/PE 2022, Disciplina 7: História.'},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura item a item do caderno oficial, do comando compartilhado e do conteúdo histórico/pedagógico.'},
  visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:apoio,motivo:`Página ${page} do caderno oficial associada ao item ${n}; o contexto comum foi reunido no campo de apoio.`},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],motivo:`Revisão v219 do item ${n}: texto conferido no caderno oficial, classificação específica de matéria/conteúdo, ano, concurso e dificuldade; gabarito definitivo e anulados validados.`}
})

const missing=Array.from({length:15},(_,i)=>106+i)
if(missing.some(n=>catalog.questoes.some(q=>q.numero===n)))throw Error('O inventário já possui algum dos itens 106–120; revisar antes de adicionar')
const imageHashes=new Map()
for(let p=1;p<=3;p++)imageHashes.set(p,hashRevisao(await fs.readFile(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)))
const additions=missing.map(n=>{
 const [materia,conteudo]=topics[n],page=pageFor(n),answer=key[n-51],anulada=answer==='X',stem=stems.get(n),apoio=contextFor(n)
 const id='extr-'+createHash('sha256').update(`${doc}:${n}:${stem}`).digest('hex').slice(0,20)
 const q={id,ano:2022,numero_original:n,banca:'CEBRASPE',concurso,materia,conteudo,enunciado:stem,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:anulada?null:answer==='C'?0:1,anulada,
  documento_id:doc,pagina:page,paginas_origem:[page],pagina_imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,imagens_paginas:[`paginas/${doc}-${String(page).padStart(4,'0')}.webp`],texto_apoio:apoio,
  dificuldade:[107,108,109,112,114,115,119,120].includes(n)?'Difícil':[106,110,117,118].includes(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e pelo nível de articulação histórica ou pedagógica exigido.',
  gabarito_oficial:{valor:answer,fonte:gabarito,arquivo:'GAB_DEFINITIVO_714_SEE_PE_007_01.PDF',prova,numero:n,pagina:1,sha256:answerDigest,hash_metodo:'SHA-256 da sequência ordenada dos 70 gabaritos oficiais definitivos, itens 51–120; não é hash criptográfico do PDF.',criterio:'Gabarito oficial definitivo CEBRASPE — SEE/PE 2022, Disciplina 7: História.'},
  classificacao_revisada:true,classificacao_pendente:false,classificacao_confianca:0.95,classificacao_metodo:'Leitura semântica individual do enunciado e do contexto oficial',classificacao_evidencia:`Revisão v219: questão ${n} transcrita da página ${page} do caderno oficial e classificada por conteúdo.`,
  integridade_profissional:{apta_resolucao:true,correcao_automatica:!anulada,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:!anulada,apontamentos:[]},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Transcrição do caderno oficial completo; o catálogo de extração local não continha os itens 106–120.'},
  revisao_semantica_visual:{imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,pagina:page,sha256:imageHashes.get(page),motivo:`Página ${page} do caderno oficial ligada ao item ${n}.`,metodo:'Conferência da página original do caderno'}}
 return q
})
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions,adicoes:additions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,itens_classificados:55,itens_adicionados_ausentes:15,itens_unicos_caderno:70,anuladas:[93,108,114],gabarito:gabarito,publicado:false},null,2))
