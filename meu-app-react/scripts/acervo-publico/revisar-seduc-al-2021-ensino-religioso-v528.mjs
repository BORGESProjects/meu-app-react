import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-seduc-al-2021-ensino-religioso-v528',doc='b203af9ec6fef254'
const base='tmp/revisao-profissional/revisao-cnmp-2023-seguranca-institucional-v527/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/seduc_al_21/arquivos/606_SEDUC_AL_003_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/seduc_al_21/arquivos/GAB_DEFINITIVO_606_SEDUC_AL_003_01.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(ps.length,72)
const respostas={51:'C',52:'E',53:'E',54:'E',55:'C',56:'C',57:'E',58:'C',59:'E',60:'C',61:'C',62:'E',63:'C',64:'E',65:'C',66:'E',67:'C',68:'E',69:'C',70:'C',71:'E',72:'E',73:'E',74:'C',75:'C',76:'E',77:'E',78:'E',79:'C',80:'C',81:'C',82:'C',83:'E',84:'C',85:'E',86:'E',87:'E',88:'C',89:'E',90:'C',91:'C',92:'C',93:'E',94:'C',95:'C',96:'C',97:'E',98:'C',99:'E',100:'C',101:'C',102:'C',103:'E',104:'C',105:'E',106:'C',107:'C',108:'C',109:'E',110:'C',111:'E',112:'E',113:'C',114:'C',115:'C',117:'E'}
const temas={
 51:'História do ensino religioso no Brasil: transformações desde a colonização',52:'História do ensino religioso: jesuítas e Reforma Protestante',53:'História do ensino religioso: objetivos e contexto colonial',54:'História do ensino religioso: relações entre Igreja e Estado no Império',55:'Laicidade e liberdade religiosa na República',56:'Ensino religioso contemporâneo: conhecimento do fenômeno religioso',57:'Constituição de 1934 e ensino religioso nas escolas',58:'Mudança metodológica: da doutrinação à observação e reflexão',
 59:'Laicidade, liberdade de crença e manifestações do sagrado',60:'Diversidade religiosa e superação de preconceitos',61:'Ensino religioso: transcendência e sagrado',62:'Laicidade e proselitismo no espaço escolar',63:'Diversidade cultural e religiosa no ensino religioso',64:'Textos sagrados como materiais de estudo',65:'Intolerância, convivência e conhecimento religioso',
 66:'Tradições religiosas, fé e obrigatoriedade curricular',67:'Conhecimento da diversidade e tolerância',68:'Monoteísmo e diversidade das tradições religiosas',69:'Historicidade dos fenômenos religiosos',70:'Mudança e releitura dos fenômenos religiosos',71:'Ensino religioso: memorização ou compreensão das tradições',72:'Tradições orientais e concepções de espaço e tempo',73:'Transmissão oral e presença curricular das tradições',74:'Tradições religiosas no tempo e no espaço',
 75:'Ciências da Religião e formação docente para ensino laico',76:'Teologia, docência e proselitismo',77:'Filosofia e ensino religioso: crítica sem viés antirreligioso',78:'Teologia negra: origem histórica e apartheid',79:'Teologia negra no Brasil: desigualdades e marginalização',80:'Teologia negra e narrativa do Êxodo',81:'Pluralidade teológica e estudos comparados na escola',82:'Formação docente, crítica teológica e laicidade',83:'Seleção de conteúdos e pluralidade religiosa',
 84:'Escrituras sagradas nas religiões abraâmicas',85:'Escrituras e legitimação de poder',86:'Cânone bíblico e diversidade entre tradições cristãs',87:'Hinduísmo e escrituras sagradas',88:'Islamismo: Alcorão e práticas religiosas',89:'Nag Hammadi e textos cristãos antigos',90:'Budismo Theravada: cânone Tripitaka',91:'Xintoísmo e escrituras sagradas',92:'Fenômeno religioso: sagrado, nomeação e sentido',93:'Estudo das religiões: história, mitos, teologias e práticas',94:'Religião, transcendência, ética e moralidade',
 95:'Teologia feminista e crítica às relações de dominação',96:'Teologia do pluralismo religioso',97:'Teologia da libertação e crítica socioeconômica',98:'Escolas confessionais, liberdade religiosa e expressão',99:'Laicidade e objetivos de instituições confessionais',100:'Projeto pedagógico e identidade de escola confessional',101:'Educação confessional e formação religiosa',102:'Estado laico, liberdade religiosa e escolha escolar',
 103:'Ensino religioso público e pluralidade de crenças familiares',104:'Planejamento didático e metodologias para ensino religioso',105:'Conhecimento religioso e questões filosóficas e sociológicas',106:'Livros didáticos plurais no ensino religioso',107:'Ensino religioso como componente da Educação Básica',108:'Pluralismo religioso e projeto CNE/UNESCO',109:'Cultura escolar, reprodução e produção de conhecimento',110:'Integração do componente religioso ao cotidiano escolar',111:'Facultatividade do ensino religioso na escola pública',112:'Legislação e organização do ensino religioso',
 113:'Objetivos do ensino religioso: compreensão das religiões',114:'Delimitação do ensino religioso, filosofia e sociologia',115:'Sagrado e objetivos do ensino religioso',117:'Ensino religioso e reprodução de ideologias coloniais'
}
const grupos=[
 [[51,58],'Texto-base e comandos sobre a história do ensino religioso brasileiro, da colonização à República.'],
 [[59,62],'Texto-base sobre laicidade escolar, liberdade de crença, combate ao proselitismo e respeito às diferentes manifestações do sagrado.'],
 [[63,65],'Referência: artigo 27 da Declaração Universal dos Direitos Humanos e texto sobre diversidade cultural e religiosa.'],
 [[66,74],'Texto-base sobre tradições religiosas como fenômenos sociais, culturais e históricos, sua historicidade e transmissão.'],
 [[75,77],'Itens sobre formação docente, Ciências da Religião, teologia, filosofia e natureza laica do componente curricular.'],
 [[78,80],'Texto-base sobre teologia negra, racismo, cristianismo e desigualdades; os itens abordam contextos africano e brasileiro e a narrativa do Êxodo.'],
 [[81,83],'Itens sobre pluralidade de teologias, formação crítica e seleção de conteúdos para o ensino fundamental.'],
 [[84,91],'Texto-base sobre revelação e cânone; itens comparam escrituras e tradições judaica, cristã, islâmica, hindu, budista e xintoísta.'],
 [[92,94],'Texto-base de Rubem Alves sobre a constituição do sagrado e a origem do fenômeno religioso.'],
 [[95,97],'Texto-base sobre transdisciplinaridade e Ciências da Religião; itens sobre teologias feminista, pluralista e da libertação.'],
 [[98,102],'Itens sobre legislação educacional, escola confessional, laicidade e liberdade religiosa.'],
 [[103,107],'Textos-base sobre expressão da religiosidade e tradições; itens de metodologia e organização pedagógica do ensino religioso.'],
 [[108,112],'Itens sobre autonomia escolar, pluralismo, currículo, facultatividade e documentos que organizam o ensino religioso.'],
 [[113,117],'Itens sobre objetivos do ensino religioso na escola pública e sua relação com a diversidade de crenças.']
]
const contexto=n=>grupos.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const correcoes={
 52:'A presença dos jesuítas influenciou a organização do ensino religioso no Brasil, modelando-o de acordo com a Reforma Protestante e suas ideias.',
 54:'No período imperial do Brasil, conflitos entre a Igreja Católica e o Império restringiram o ensino religioso somente aos negros.',
 55:'O princípio da laicidade do Estado influenciou ideais de liberdade religiosa e modificou o entendimento sobre o ensino religioso no período republicano do Brasil.',
 58:'As modificações sobre o entendimento do ensino religioso na história brasileira deslocaram suas metodologias, passando da doutrinação para a observação, informação e reflexão.',
 62:'A evangelização nas escolas deve acontecer de acordo com as práticas religiosas nas quais estão inseridas, expressando seus ritos e símbolos.',
 65:'A intolerância desafia a convivência das comunidades e o ensino religioso contribui para ampliar a tolerância a partir do conhecimento.',
 69:'A compreensão dos fenômenos religiosos em sua historicidade caracteriza as orientações para o ensino religioso nas escolas.',
 74:'Reconhecer as diversas tradições religiosas como fenômenos sociais, culturais e históricos exige situá-las no tempo e espaço.',
 75:'O docente formado no curso de Ciência da Religião é apto a ministrar a disciplina de ensino religioso, pois a natureza interdisciplinar desse curso oferece amplo espaço teórico e metodológico para a formação sobre o fenômeno e o campo do religioso, incluindo-se a descrença, o agnosticismo e o ateísmo, além de que esse curso pode fundamentar uma perspectiva de ensino religioso de natureza laica.',
 77:'Um professor formado em filosofia, ao ministrar o ensino religioso, deve buscar desconstruir as ideias de filósofos de tempos passados que usaram a filosofia para corroborar dogmas religiosos, visando ao caráter agnóstico e laico desse componente curricular.',
 80:'A teologia negra, entre outras associações, toma como ponto de partida as narrativas bíblicas do Êxodo, não no sentido de romantizar o período em que o povo hebreu viveu na condição de servidão no Egito dos faraós, mas de pensar a escravidão na subjugação de um povo por uma nação estrangeira.',
 83:'Convém filtrar as teologias a serem ensinadas, considerando-se o peso exercido pelas religiões majoritárias e as suscetibilidades religiosas dos alunos e de suas famílias, a fim de evitar que o debate sobre teologias pouco conhecidas gere conflitos religiosos entre os alunos.',
 91:'O xintoísmo, de origem japonesa, não tem uma escritura sagrada.',
 94:'A religião nasce de um forte anseio interior do ser humano de comunicar-se com o transcendental e dele receber revelações sobre como organizar a vida e ordenar o mundo; nessa perspectiva, o fenômeno religioso não é redutível à ética ou à moralidade.',
 97:'A teologia da libertação tem, em seu ideário, a crítica ao sistema socialista, revelando que ele produz a idolatria ao Estado, e a crítica à ideologia do controle estatal e da planificação da economia.',
 102:'O Brasil é um Estado laico que garante a liberdade religiosa ao indivíduo, sendo esta uma escolha pessoal, não cabendo ao Estado decidir, pelos pais, sobre o tipo de instituição de ensino em que seus filhos serão matriculados.',
 107:'O ensino religioso compõe o currículo formal da Educação Básica; dessa forma, aplicam-se a esse componente curricular as teorias desenvolvidas para a educação.',
 112:'Como a Constituição Federal de 1988 já assegura ao cidadão brasileiro a liberdade de expressão e de credo religioso, o que se reflete nas disposições que definem o rumo do ensino religioso na educação brasileira, não há necessidade de outros documentos para assegurar e organizar a efetivação desse ensino.',
 117:'Um dos objetivos do ensino religioso nas escolas de educação básica da rede educacional brasileira é torná-lo o sustentáculo ideológico de uma visão de mundo atrelada aos princípios evangelizadores do nosso período colonial.'
}
const porNumero=new Map()
for(const q of ps){const n=Number(q.numero),a=porNumero.get(n)||[];a.push(q);porNumero.set(n,a)}
assert.equal(porNumero.size,66)
assert.deepEqual([...porNumero].filter(([,a])=>a.length>1).map(([n])=>n),[52,54,55,65,68,69])
assert.deepEqual([...porNumero.keys()].filter(n=>!respostas[n]||!temas[n]||!contexto(n)),[])
const preferidos={55:'extr-c23208a5d3925c5d8622',65:'extr-d5a578d873f2ffbb6f1e',69:'extr-5b082bb83cc6eae66e34'}
const canonic=new Map([...porNumero].map(([n,a])=>[n,preferidos[n]?a.find(x=>x.id===preferidos[n]):[...a].sort((x,y)=>x.enunciado.length-y.enunciado.length)[0]]))
const faceis=new Set([51,56,58,60,61,63,65,67,69,70,74,75,79,80,88,90,91,92,95,98,100,102,104,106,107,108,110,113,115,117])
const dificeis=new Set([53,57,62,66,68,73,76,77,78,83,85,86,89,93,94,97,99,101,103,109,111,112,114])
const decisoes=[]
for(const [n,a] of [...porNumero].sort((x,y)=>x[0]-y[0])){
 const q=canonic.get(n),g=respostas[n],ctx=contexto(n),dificuldade=faceis.has(n)?'Fácil':dificeis.has(n)?'Difícil':'Média'
 assert.ok(q&&g&&ctx&&temas[n])
 const baseDecision={materia:'Ensino Religioso',conteudo:temas[n],ano:2021,concurso:'SEDUC/AL 2021 — Professor: Ensino Religioso',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'17/10/2021',cargo:'Professor — Especialidade: Ensino Religioso',numero_original:n,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada no nível de inferência histórica, conceitual ou normativa exigido; a banca não publicou dificuldade por item.',classificacao_fonte:prova,motivo:`Item ${n} comparado com o caderno oficial de Ensino Religioso; classificado pelo conteúdo avaliado e conferido no gabarito definitivo da banca.`,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:g==='C'?0:1,anulada:false,texto_apoio:ctx,gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito oficial definitivo — Professor: Ensino Religioso — aplicação em 17/10/2021',item:n,resposta:g,fonte:'CEBRASPE'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']}
 const enunciado=(correcoes[n]||q.enunciado).replace(/\s+/g,' ').trim()
 assert.ok(enunciado.length>35,`enunciado insuficiente ${n}`)
 const imagem=n===91?'paginas/b203af9ec6fef254-0002.webp':q.imagem
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),...baseDecision,enunciado,pagina:q.pagina,visual:{pagina:q.pagina,imagem,motivo:'Página original do caderno oficial preservada para leitura do item, do comando compartilhado e dos textos-base.'},apta_resolucao:true,correcao_automatica:true})
 for(const dup of a.filter(x=>x.id!==q.id))decisoes.push({id:dup.id,sha256_enunciado:hashRevisao(dup.enunciado),...baseDecision,enunciado:dup.enunciado.replace(/\s+/g,' ').trim(),resposta_correta:null,apta_resolucao:false,correcao_automatica:false,inelegibilidade_motivo:'captura_duplicada_ou_mesclada_no_mesmo_caderno',duplicada_de:q.id,pagina:dup.pagina})
}
assert.equal(decisoes.length,72)
const r=await aplicarRevisoesIndividuais({nome,base,decisoes})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,aplicacao:'17/10/2021',concurso:'SEDUC/AL 2021 — Professor: Ensino Religioso',nota:'Foram classificados 66 itens pendentes distintos. Os itens 116, 118, 119 e 120 já estavam classificados na base. Seis capturas duplicadas dos itens 52, 54, 55, 65, 68 e 69 foram reconciliadas; as cópias permaneceram inelegíveis e ligadas ao registro canônico. Os enunciados contaminados por comandos, OCR e textos de itens seguintes foram separados, mantendo as páginas originais como contexto visual.'},null,2))
console.log(JSON.stringify({...r,documento:doc,edicao:'SEDUC/AL 2021 — Professor: Ensino Religioso',itens_distintos:66,registros_revisados:72,duplicatas_inelegiveis:6,itens_previamente_classificados:[116,118,119,120],gabarito_definitivo:gabarito,prova_oficial:prova}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
