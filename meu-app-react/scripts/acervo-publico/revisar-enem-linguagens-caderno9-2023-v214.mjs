import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='210e40b558106672'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2023_Dia_1_P1_LC_Caderno_09_Laranja_NVDA.pdf'
const gabarito='https://download.inep.gov.br/enem/provas_e_gabaritos/2023_GB_impresso_D1_CD9.pdf'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='2023_Dia_1_P1_LC_Caderno_09_Laranja_NVDA.pdf')throw Error('Caderno INEP do ENEM 2023 não confere')
const paginas=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`),'utf8'))
if(!Array.isArray(paginas)||paginas.length<59)throw Error('Extração textual oficial do Caderno 9 está incompleta')

const chaves={
 ingles:['B','D','B','B','A'],
 espanhol:['B','A','A','A','E'],
 portugues:['A','A','E','C','B','B','E','A','A','C','A','A','A','C','E','A','C','B','C','A','C','C','C','E','D','E','D','A','D','B','D','B','E','E','D','D','A','C','C','C']
}
if(chaves.portugues.length!==40)throw Error('Gabarito INEP de Língua Portuguesa não contém 40 respostas')
const mapaGabarito=new Map()
for(let n=1;n<=5;n++){mapaGabarito.set(`Inglês-${n}`,chaves.ingles[n-1]);mapaGabarito.set(`Espanhol-${n}`,chaves.espanhol[n-1])}
for(let n=6;n<=45;n++)mapaGabarito.set(`Português-${n}`,chaves.portugues[n-6])

const temas={
'Inglês-1':['Inglês','Leitura de poema: metáfora e interdependência humana'],
'Inglês-2':['Inglês','Poesia e migração: deslocamento, refúgio e experiências plurais'],
'Inglês-3':['Inglês','Leitura de campanha ambiental: desperdício de alimentos e aterros'],
'Inglês-4':['Inglês','Cartum e diversidade: discriminação etária, racial e de gênero'],
'Inglês-5':['Inglês','Bilinguismo, hibridismo linguístico e identidade cultural'],
'Espanhol-1':['Espanhol','Expressão idiomática e estratégias de manipulação da informação'],
'Espanhol-2':['Espanhol','Leitura multimodal e inclusão escolar de estudante com dislexia'],
'Espanhol-3':['Espanhol','Canção de protesto e denúncia da xenofobia e do racismo'],
'Espanhol-4':['Espanhol','Identidade negra e recursos linguísticos de autoafirmação'],
'Espanhol-5':['Espanhol','Gastronomia espanhola como representação de identidade cultural'],
'Português-6':['Literatura','Retórica, metáfora e paralelismo em discurso de homenagem'],
'Português-7':['Língua Portuguesa','Leitura de campanha publicitária e informação sobre amamentação'],
'Português-8':['Língua Portuguesa','Gênero carta aberta e demandas de políticas para a população idosa'],
'Português-9':['Língua Portuguesa','Semântica lexical e atualização do significado de casamento'],
'Português-10':['Educação Física','Esporte olímpico, identidade de gênero e representatividade'],
'Português-11':['Educação Física','Abuso sexual no esporte e proteção de atletas'],
'Português-12':['Educação Física','Desigualdade social no acesso às práticas corporais e atividades físicas'],
'Português-13':['Educação Física','Esporte eletrônico, cultura digital e crescimento de mercado'],
'Português-14':['Artes','Marabaixo, tradição afro-amapaense e identidade cultural'],
'Português-15':['Artes','Redes sociais, circulação e reconhecimento da produção artística'],
'Português-16':['Artes','Rap indígena, território e afirmação identitária'],
'Português-17':['Artes','Música, paisagem e experiência cultural no espaço'],
'Português-18':['Artes','Expressionismo e censura nazista à arte considerada degenerada'],
'Português-19':['Artes','Dança contemporânea, matrizes culturais e construção de sentidos'],
'Português-20':['Literatura','Conto, intertextualidade e tradição literária'],
'Português-21':['Literatura','Romance brasileiro e representação do autoritarismo'],
'Português-22':['Literatura','Poesia contemporânea, metáfora e relações afetivas'],
'Português-23':['Literatura','Romance contemporâneo, memória e voz narrativa'],
'Português-24':['Literatura','Escravidão e construção da memória histórica na poesia'],
'Português-25':['Literatura','Prosa contemporânea, deslocamento e relações humanas'],
'Português-26':['Literatura','Poesia falada, oralidade e performance'],
'Português-27':['Literatura','Literatura afro-brasileira, ancestralidade e memória'],
'Português-28':['Língua Portuguesa','Representações de gênero na mídia e estereótipos sociais'],
'Português-29':['Língua Portuguesa','Leitura de peça publicitária, diversidade e representação social'],
'Português-30':['Língua Portuguesa','Canção, intertextualidade e denúncia do racismo estrutural'],
'Português-31':['Língua Portuguesa','Artigo de opinião: intertextualidade e construção argumentativa'],
'Português-32':['Língua Portuguesa','Variação lexical regional e tradução de termos populares para linguagem médica'],
'Português-33':['Língua Portuguesa','Variação linguística regional e diversidade lexical do português brasileiro'],
'Português-34':['Língua Portuguesa','Gênero editorial e interlocução com o público leitor'],
'Português-35':['Língua Portuguesa','Intertextualidade em letras de canção e crítica à sociedade de consumo'],
'Português-36':['Literatura','Narrativa oral, rádio e circulação de histórias'],
'Português-37':['Língua Portuguesa','Patrimônio cultural, memória coletiva e perda do acervo do Museu Nacional'],
'Português-38':['Língua Portuguesa','Circulação de notícias na Idade Média e redes de comunicação'],
'Português-39':['Língua Portuguesa','Desinformação, contas falsas e debate democrático em redes sociais'],
'Português-40':['Língua Portuguesa','Campanha de segurança no trânsito e construção de alerta público'],
'Português-41':['Educação Física','Lema olímpico, valores do esporte e transformação cultural'],
'Português-42':['Literatura','Poesia contemporânea, corpo e autoimagem'],
'Português-43':['Língua Portuguesa','Língua, migração, pertencimento e preconceito linguístico'],
'Português-44':['Literatura','Romance brasileiro: narrador, caracterização e normas sociais'],
'Português-45':['Literatura','Poesia lírica: imagens, silêncio e expressão de sentimentos']
}

function limparRuido(s){return s
 .replace(/^\s*(?:Exame Nacional do Ensino Médio[^\n]*|ENEM\s+2023[^\n]*|LC\s*[•·].*|PROVA DE LINGUAGENS[^\n]*|SUAS TECNOLOGIAS[^\n]*|CADERNO\s+\d+[^\n]*|\d{1,2})\s*$/gim,'')
 .replace(/\u000c/g,'\n').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim()
}
function extrair(q){
 const n=Number(q.numero_original),start=Number(q.pagina),paginasUsadas=[];let texto=''
 for(let p=start;p<=Math.min(start+3,paginas.length);p++){
  const atual=paginas[p-1]||'';paginasUsadas.push(p);texto+=`\n${atual}`
  const labels=[...texto.matchAll(/^\s*([a-e])\s*[.)]\s+/gim)].map(m=>m[1].toLowerCase())
  if(labels.length>=5)break
 }
 const chave=n<=5?(start<=7?`Inglês-${n}`:`Espanhol-${n}`):`Português-${n}`
 const marcador=new RegExp(`QUESTÃO\\s*0?${n}\\b`,'i').exec(texto)
 if(!marcador)throw Error(`Item ${chave}: cabeçalho não encontrado na página ${start}`)
 let corpo=limparRuido(texto.slice(marcador.index+marcador[0].length))
 const primeiraOpcao=/^\s*a\s*[.)]\s+/im.exec(corpo)
 if(!primeiraOpcao)throw Error(`Item ${chave}: alternativas não encontradas`)
 const enunciado=limparRuido(corpo.slice(0,primeiraOpcao.index))
 const trechoOpcoes=corpo.slice(primeiraOpcao.index)
 const re=/^\s*([a-e])\s*[.)]\s+([\s\S]*?)(?=^\s*[a-e]\s*[.)]\s+|$)/gim
 const opcoes=[...trechoOpcoes.matchAll(re)].map(m=>limparRuido(m[2]))
 const labels=[...trechoOpcoes.matchAll(/^\s*([a-e])\s*[.)]\s+/gim)].map(m=>m[1].toLowerCase())
 if(enunciado.length<10||labels.join('')!=='abcde'||opcoes.length!==5||opcoes.some(x=>!x))throw Error(`Item ${chave}: extração inválida; enunciado=${enunciado.length}, opções=${labels.join('')}/${opcoes.length}`)
 return {chave,enunciado,opcoes,paginasUsadas}
}

const registros=[]
for await(const {questoes} of lotesAtuais())for(const q of questoes)if(q.documento_id===doc)registros.push(q)
if(registros.length!==52)throw Error(`Esperava 52 registros do PDF acessível; encontrei ${registros.length}`)
const capa=registros.filter(q=>Number(q.pagina)<3)
const questoes=registros.filter(q=>Number(q.pagina)>=3)
if(capa.length!==2||questoes.length!==50)throw Error(`Esperava dois registros de capa e 50 versões de questão; encontrei capa=${capa.length}, questões=${questoes.length}`)
const digest=hashRevisao([...chaves.ingles,...chaves.espanhol,...chaves.portugues].join(''))
const concurso='ENEM 2023 — 1º dia, Caderno 9 Laranja (NVDA), Linguagens, Códigos e suas Tecnologias'
const decisoes=[]
for(const q of capa){
 if(typeof q.enunciado!=='string')throw Error(`Registro de capa ${q.id} sem enunciado original`)
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Metadados de prova',conteudo:'Instruções de capa; não corresponde a uma questão',ano:2023,concurso,numero_original:Number(q.numero_original),pagina:Number(q.pagina),motivo:'Registro associado às instruções iniciais do PDF; não há enunciado nem resposta, portanto não é questão resolvível.',apta_resolucao:false,inelegibilidade_motivo:'Página de instruções do caderno, não é questão.'})
}
for(const q of questoes){
 const n=Number(q.numero_original),start=Number(q.pagina),extraida=extrair(q),tema=temas[extraida.chave],resposta=mapaGabarito.get(extraida.chave)
 if(!tema||!resposta)throw Error(`Item ${extraida.chave}: tema ou gabarito oficial ausente`)
 const language=extraida.chave.startsWith('Inglês-')?' — versão em inglês':extraida.chave.startsWith('Espanhol-')?' — versão em espanhol':''
 const paginasContexto=extraida.paginasUsadas.filter(p=>p!==start).map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Continuação da mesma questão no caderno oficial acessível.'}))
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2023,concurso:`${concurso}${language}`,numero_original:n,pagina:start,dificuldade:[2,4,5,8,10,11,12,14,18,19,20,21,23,24,26,27,28,30,31,33,35,36,37,38,39,41,43,44,45].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela extensão do texto, inferência e repertório sociocultural exigidos; o INEP não divulga dificuldade por item no gabarito.',motivo:`Questão ${n} (${extraida.chave.split('-')[0]}): classificação individual pelo texto integral, comando e descrições visuais do caderno oficial.` ,classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Extração da versão NVDA oficial, inspeção do texto completo e conferência do gabarito definitivo do Caderno 9'},resposta_correta:'ABCDE'.indexOf(resposta),opcoes:extraida.opcoes,enunciado:extraida.enunciado,gabarito_oficial:{fonte:gabarito,arquivo:'2023_GB_impresso_D1_CD9.pdf',criterio:'Gabarito oficial definitivo INEP do ENEM 2023, 1º dia, Caderno 9 Laranja; itens 1–5 conforme variante de língua estrangeira.',numero:n,idioma:extraida.chave.split('-')[0],pagina:1,resposta,sha256:digest,hash_metodo:'SHA-256 das três sequências oficiais — inglês, espanhol e questões 6–45; não é hash do PDF.'},visual:{pagina:start,imagem:`paginas/${doc}-${String(start).padStart(4,'0')}.webp`,motivo:'Página original da versão NVDA; descrições de cartazes, cartuns e obras são preservadas no enunciado extraído.'}}
 if(paginasContexto.length)d.imagens_contexto=paginasContexto
 decisoes.push(d)
}
const paginasNecessarias=[...new Set(decisoes.filter(x=>x.visual).flatMap(x=>[x.visual.pagina,...(x.imagens_contexto||[]).map(p=>p.pagina)]))]
for(const p of paginasNecessarias)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const base=raizesAtuais.find(x=>x.includes('revisao-ebserh-terapia-intensiva-pediatrica-2018-v213'))
if(!base)throw Error('Raiz v213 não encontrada')
const nome='revisao-enem-linguagens-caderno9-2023-v214'
const result=await aplicarRevisoesIndividuais({nome,base,decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,documento_id:doc,registros_revistos:decisoes.length,questoes_objetivas_completas:50,variantes_idioma_estrangeiro:10,artefatos_de_capa_excluidos:capa.length,alternativas_transcritas:questoes.length*5,gabaritos_definitivos_associados:questoes.length,paginas_originais_vinculadas:paginasNecessarias.length,data_aplicacao:'2023-11-05',prova,gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão ENEM 2023 — Linguagens, Caderno 9 Laranja (NVDA) — v214\n\n- Revisei ${questoes.length} questões resolvíveis: 40 em português e cinco de cada variante de língua estrangeira (inglês e espanhol). Transcrevi as cinco opções de cada questão da versão acessível e vinculei o gabarito oficial específico da variante.\n- Dois registros que reproduziam instruções de capa foram preservados no histórico e excluídos da resolução. As descrições textuais das imagens, textos-base e continuações em páginas seguintes foram mantidas junto às questões.\n- Classifiquei cada item por matéria, conteúdo, ano e dificuldade estimada. Resultado local: ${out.total} registros; ${out.disponiveis} disponíveis para resolução; ${out.pendentes} pendências elegíveis. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno acessível do ENEM 2023](<${prova}>), [gabarito definitivo do Caderno 9](<${gabarito}>), [portal do INEP](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem).\n`)
console.log(JSON.stringify(out))
