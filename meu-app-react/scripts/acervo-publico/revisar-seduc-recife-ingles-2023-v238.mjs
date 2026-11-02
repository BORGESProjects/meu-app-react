import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-seduc-recife-ingles-2023-v238',doc='ad8fae020a16c9e4'
const prova='https://cdn.cebraspe.org.br/concursos/SEDUC_RECIFE_23_PROFESSOR/arquivos/829_SEDUC_RECIFE_23_007_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/SEDUC_RECIFE_23_PROFESSOR/arquivos/ED_1_2023_SEDUC_RECIFE_ABERTURA_V19.PDF'
const concurso='SEDUC Recife 2023 — Cargo 7: Professor II, Língua Inglesa'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='829_SEDUC_RECIFE_23_007_01.PDF'||catalog.questoes.length!==75)throw Error('Inventário incompatível: esperados 75 registros OCR')
const grupos=new Map();for(const e of catalog.questoes){const a=grupos.get(e.numero)||[];a.push(e);grupos.set(e.numero,a)}
if(grupos.size!==70||[...grupos.keys()].some(n=>n<51||n>120))throw Error('Esperados 70 itens únicos, números 51–120')
const prev=raizesAtuais.findIndex(x=>x.includes('revisao-inpi-biologia-2023-v237'))
if(prev<0)throw Error('Base anterior v237 ausente')
const bases=raizesAtuais.slice(prev),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),want=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
for(const lote of manifest.lotes.filter(x=>x.arquivo&&x.ano===2023&&/SEDUC RECIFE 23/i.test(x.concurso||''))){
 const chunk=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,bases)))
 for(const q of chunk)if(want.has(q.id)){byId.set(q.id,q);want.delete(q.id)}
 if(!want.size)break
}
if(want.size)throw Error(`Questões ausentes do acervo: ${want.size}`)

const temas={
51:'Compreensão leitora: inteligência artificial, tradução automática e interpretação contextual',
52:'Compreensão leitora: diferenças entre tradução automática e jogos de regras definidas',
53:'Compreensão leitora: ambiguidade e regras da linguagem natural',
54:'Compreensão leitora: interpretação cultural e perspectivas sobre tecnologia',
55:'Compreensão leitora: tradução automática, contexto e interpretação de frases',
56:'Vocabulário: cognatos entre inglês e português e reconhecimento lexical',
57:'Compreensão leitora: metáforas e referências culturais no texto',
58:'Compreensão leitora: identificação de informação explícita sobre personagem',
59:'Vocabulário: sentido de expressões relativas à dependência de tecnologia',
60:'Compreensão leitora: fatores culturais e humanos na tradução',
61:'Vocabulário: sinonímia contextual do adjetivo widened',
62:'Estratégias de leitura: scanning para localizar números e datas',
63:'Estratégias de leitura: scanning e localização de informação específica',
64:'Estratégias de leitura: consulta lexical e scanning em dicionários',
65:'Estratégias de leitura: skimming, leitura global e antecipação de conteúdo',
66:'Didática de língua inglesa: práticas linguísticas e foco do ensino',
67:'Sociolinguística: variantes linguísticas, fluência e norma padrão',
68:'Ensino comunicativo: negociação de sentidos e contextualização lexical',
69:'Pedagogia crítica: identidade, agência e expressão de realidades dos estudantes',
70:'Compreensão audiovisual: leitura de tirinha e inferência de intenção comunicativa',
71:'Vocabulário: inferência de sentido em expressão idiomática e apresentação',
72:'Compreensão audiovisual: humor, ironia e interpretação de tirinha',
73:'Pragmática: sarcasmo e inferência de significado em diálogo',
74:'Sociolinguística: universais linguísticos e diversidade estrutural',
75:'Sociolinguística: classificação de línguas e critérios contextuais',
76:'Compreensão leitora: vocabulário cultural e domínios lexicais',
77:'Gramática contextual: estrutura sintática e pontuação',
78:'Sociolinguística: conjunções concessivas e relação lógico-discursiva',
79:'Vocabulário: substituição lexical e preservação de sentido',
80:'Compreensão leitora: inferência de informação sobre povos e cultura',
81:'Coesão textual: referência pronominal e retomada anafórica',
82:'Interculturalidade: diferenças culturais e conflitos de comunicação',
83:'Compreensão audiovisual: inferência de sequência narrativa em tirinha',
84:'Interculturalidade: língua franca e comunicação entre comunidades',
85:'Gramática: ordem de adjetivos em inglês',
86:'Compreensão leitora: inferência sobre iniciativas e ações em texto',
87:'Coesão textual: referência de pronome relativo e omissão',
88:'Vocabulário e paráfrase: equivalência semântica de expressão percentual',
89:'Compreensão leitora: sentido de separate em contexto institucional',
90:'Vocabulário: formação de palavras e sufixo -like',
91:'Compreensão leitora: gênero gramatical e assistentes virtuais',
92:'Gramática: presente perfeito contínuo em discurso indireto',
93:'Gramática: gerúndio e nominalização de verbos em inglês',
94:'Coesão textual: referência de pronomes possessivos e pessoais',
95:'Vocabulário: verbo conduct em combinação lexical',
96:'Gramática: genitivo e relação de posse em inglês',
97:'BNCC: plurilinguismo, multiculturalismo e aprendizagem de língua inglesa',
98:'BNCC: língua inglesa como acesso a conhecimentos e perspectivas culturais',
99:'BNCC: repertórios linguístico-discursivos e uso contextualizado do inglês',
100:'BNCC: cultura digital, multiletramentos e práticas de linguagem',
101:'BNCC: patrimônio cultural material e imaterial em língua inglesa',
102:'BNCC: diversidade linguística, repertórios híbridos e multilíngues',
103:'Produção escrita: etapas de produção, reflexão, revisão e reescrita',
104:'Gêneros digitais: blog, redes sociais e linha do tempo como gêneros textuais',
105:'Produção textual: linguagem como prática social e construção de sentidos',
106:'Ensino de escrita: adequação ao nível escolar e desenvolvimento de gêneros',
107:'Multimodalidade: recursos verbais e não verbais em textos de circulação pública',
108:'Processo de escrita: brainstorming e planejamento textual',
109:'BNCC: eixo formativo e reflexão crítica no ensino de inglês',
110:'BNCC: eixo oralidade e interação na construção de sentidos',
111:'BNCC: eixo leitura, compreensão e interpretação de gêneros escritos',
112:'BNCC: dimensão intercultural e constituição de identidades plurais',
113:'BNCC: eixo escrita e autoria em práticas sociais',
114:'BNCC: conhecimentos linguísticos articulados a oralidade, leitura e escrita',
115:'BNCC: língua inglesa como língua franca e diversidade de falantes',
116:'Ensino de inglês: aprendizagem linguística e participação no mundo globalizado',
117:'BNCC: contextualização cultural dos conteúdos de língua inglesa',
118:'BNCC: competências de leitura, interpretação e resolução de problemas',
119:'Ensino de inglês: aprendizagem comunicativa e contato com língua em uso',
120:'Ensino de inglês: vocabulário, gramática e reflexão sobre funcionamento da língua'
}
const blocos=[
 [51,'Text 7A1 aborda desafios de inteligência artificial na tradução, a importância do contexto, da ironia, dos idiomatismos e das diferenças culturais. Julgue os itens com base no texto da página 1.'],
 [56,'Considere as informações do Text 7A1 sobre tradução automática, cognatos, referências culturais e vocabulário. Julgue os itens.'],
 [62,'Com base nos conceitos de skimming e scanning, estratégias de leitura global e busca rápida de informação específica, julgue os itens.'],
 [66,'Considere o excerto em português sobre pedagogia crítica, língua como interação social e formação de estudantes agentes de transformação. Julgue os itens.'],
 [70,'Considere a tirinha do Garfield reproduzida na página 2 e as falas dos personagens. Julgue os itens sobre compreensão e humor.'],
 [74,'Text 7A2 discute vocabulário, cultura e a capacidade das línguas de atender a necessidades socioculturais diversas. Julgue os itens relacionados ao texto e ao tema.'],
 [82,'Considere a tirinha Itchy Feet, na página 3, e as situações de comunicação intercultural nela retratadas. Julgue os itens.'],
 [85,'Considere o texto da página 3 sobre os efeitos da perda de línguas indígenas na saúde mental, identidade e bem-estar de comunidades. Julgue os itens de vocabulário e gramática.'],
 [90,'Considere o texto da página 4 sobre assistentes virtuais com voz neutra em relação a gênero, estereótipos sociais e comportamento dos usuários. Julgue os itens de vocabulário e gramática.'],
 [97,'Com base na BNCC e nos eixos de organização da área de linguagens, julgue os itens sobre competências de língua inglesa.'],
 [103,'Com base na BNCC, julgue os itens relativos às etapas de produção escrita e ao tratamento da produção escrita em língua inglesa.'],
 [109,'Considere os eixos organizadores da BNCC para língua inglesa. Julgue os itens referentes a formação, oralidade, leitura, dimensão intercultural, escrita e conhecimentos linguísticos.'],
 [115,'À luz da BNCC e dos fundamentos de avaliação e aprendizagem de língua inglesa na educação básica, julgue os itens.']
]
function contexto(n){return blocos.filter(([inicio])=>inicio<=n).at(-1)[1]}
const canon=new Map([[53,'extr-6d81ee351c306a06e503'],[55,'extr-53314dbe88f91d48a5df'],[56,'extr-8b8cd795e1d48213bae2'],[59,'extr-88cd2229fd37f292c694'],[61,'extr-f9c344e052f861ea6fed']])
const facil=new Set([51,52,53,56,58,59,61,62,63,64,65,66,67,69,71,73,75,77,79,81,82,83,84,85,87,88,89,90,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120])
const dificil=new Set([54,57,60,68,70,72,74,76,78,80,86,91])
const corrigidos=new Map([[53,'Even though language is everywhere, its rules are not as exact as in games.'],[55,'Dr. Majfud considers that AI will soon be able to interpret full sentences.'],[56,'In the text, there are examples of English-Portuguese cognate words such as “sarcasm”, “cultural” and “cemeteries”.'],[59,'Dr. Majfud warns about the excess of reliance on language technology.'],[61,'In “He noted that sarcasm and irony only make sense within this widened context”, the adjective “widened” is synonymous with “expanded”.']])
const decisoes=[]
for(const [n,entries] of grupos){const conteudo=temas[n],canonical=canon.get(n)||entries[0].id
 if(!conteudo)throw Error(`Questão ${n} sem conteúdo específico`)
 for(const e of entries){const q=byId.get(e.id),pagina=e.pagina,img=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,duplicada=e.id!==canonical
  if(!q||q.pagina!==pagina)throw Error(`Registro/página divergente: questão ${n}`)
  await fs.access(`public/acervo-extraido/${img}`)
  const d={id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Língua Inglesa',conteudo,ano:2023,concurso,numero_original:n,pagina,
   dificuldade:facil.has(n)?'Fácil':dificil.has(n)?'Difícil':'Média',dificuldade_estimada:true,
   dificuldade_evidencia:'Estimativa editorial pela extensão do texto, complexidade lexical/gramatical e tipo de inferência; não representa índice psicométrico oficial.',
   classificacao_fonte:{documento:catalog.arquivo,prova,edital,metodo:'Leitura individual dos itens, textos-base, tirinhas e conteúdo programático do Cargo 7: Língua Inglesa.'},
   visual:{pagina,imagem:img,motivo:`Página ${pagina} do caderno oficial conferida; texto-base, tirinha ou contexto visual permanece acessível na questão.`},
   remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],
   motivo:duplicada?`Duplicata OCR do item ${n}; versão canônica mantida.`:`Classificação individual por habilidade de leitura, vocabulário, gramática, ensino de inglês ou eixo da BNCC. Gabarito preexistente preservado.`}
  if(!duplicada){d.apta_resolucao=true;d.texto_apoio=contexto(n);if(corrigidos.has(n))d.enunciado=corrigidos.get(n)}
  else{d.apta_resolucao=false;d.inelegibilidade_motivo=`Cópia OCR do item ${n}; questão canônica ${canonical} mantida.`;d.duplicada_de=canonical}
  decisoes.push(d)
 }
}
if(decisoes.length!==75)throw Error(`Esperados 75 registros OCR, obtidos ${decisoes.length}`)
const out=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[prev],decisoes})
console.log(JSON.stringify({...out,documento:catalog.arquivo,registros_revisados:75,itens_unicos:70,duplicatas_inelegiveis:5,paginas_conferidas:[1,2,3,4,5],publicado:false},null,2))
