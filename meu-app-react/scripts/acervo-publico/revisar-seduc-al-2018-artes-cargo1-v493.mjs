import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-seduc-al-2018-artes-cargo1-v493'
const documento='97d101f0dd133d1d'
const prova='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/MATRIZ_376_SEDUCAL001__PAG_3.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/GAB_DEFINITIVO_376_SEDUCAL001.PDF'
const concurso='SEDUC/AL — Concurso para Professor — Cargo 1: Artes (edital 2017; prova aplicada em 2018)'
const cargo='Professor — Especialidade: Artes — Cargo 1'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url,prova)
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
const nums=pendentes.map(q=>Number(q.numero)).sort((a,b)=>a-b)
assert.equal(pendentes.length,51)
assert.deepEqual(nums,[51,52,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120])

// Respostas copiadas do gabarito oficial definitivo do Cargo 1.
const respostas={51:'E',52:'C',72:'C',73:'C',74:'E',75:'C',76:'C',77:'E',78:'E',79:'C',80:'E',81:'C',82:'C',83:'C',84:'E',85:'C',86:'C',87:'E',88:'E',89:'C',90:'E',91:'C',92:'C',93:'E',94:'E',95:'C',96:'E',97:'C',98:'C',99:'E',100:'E',101:'C',102:'E',103:'C',104:'C',105:'E',106:'C',107:'C',108:'E',109:'E',110:'E',111:'C',112:'C',113:'C',114:'E',115:'E',116:'C',117:'E',118:'E',119:'E',120:'C'}
assert.equal(Object.keys(respostas).length,51)
const hashGabarito=hashRevisao(Object.entries(respostas).sort(([a],[b])=>Number(a)-Number(b)).map(([n,r])=>`${n}:${r}`).join('|'))

const conteudos={
51:['PCN e ensino da arte: objetivos da disciplina','Média'],52:['PCN: linguagens artísticas e comunicação de ideias','Fácil'],
72:['PCNEM: representação, investigação e contextualização sociocultural','Fácil'],73:['PCNEM: arte, sensibilidade, percepção e cognição','Média'],74:['PCNEM: interdisciplinaridade e competências em arte','Média'],75:['PCNEM: competências, habilidades e práticas sociais','Média'],
76:['Estética: filosofia do belo e apreciação artística','Difícil'],77:['Arte-educação: linguagens e núcleo curricular','Média'],78:['Arte-educação: finalidade e formação artística','Fácil'],79:['Estética: apreciação de objetos e acontecimentos cotidianos','Média'],80:['Arte-educação: cognição, sentimentos e valores','Difícil'],81:['Estética: obra de arte e relação entre conjunto e elementos','Média'],
82:['Arte e cidadania: diversidade cultural no planejamento didático','Fácil'],83:['Arte pública: grafite, identidade e participação comunitária','Fácil'],84:['Cultura visual: campo de estudo e instituições culturais','Média'],85:['Arte-educação multicultural: produção popular, minorias e mídia','Média'],86:['Arte pré-histórica: Parque Nacional Serra da Capivara','Média'],87:['Arte pré-colombiana: petroglifos e pintura rupestre','Média'],88:['História da arte: Barroco no Brasil','Fácil'],89:['História da arte brasileira: Missão Artística Francesa e Academia Imperial','Média'],
90:['Arte e cultura digital: sensibilidade e ensino contemporâneo','Média'],91:['Mídias digitais: democratização do acesso à arte','Fácil'],92:['Cultura digital: competência geral da BNCC','Média'],93:['Comunicação digital: emojis, pictogramas e caracteres','Média'],94:['Linguagem audiovisual: frequência de quadros e cinema','Média'],
95:['Cultura popular brasileira: Toré e povos indígenas','Média'],96:['Música brasileira colonial: funções sociais','Média'],97:['Música brasileira colonial: fontes e registros históricos','Média'],98:['Música colonial: José Maurício Nunes Garcia','Média'],99:['Ópera brasileira: O Guarani e Carlos Gomes','Média'],100:['Música: dodecafonismo e organização das alturas','Difícil'],101:['Cultura popular nordestina: coco de roda e ciclo junino','Média'],102:['Coco de roda: instrumentos musicais','Fácil'],103:['Coco de roda: palmas, sapateado e ritmo','Fácil'],104:['Coco de roda: origens regionais','Média'],105:['Cultura popular: manifestações tradicionais do Nordeste','Média'],
106:['Modernismo brasileiro: vanguardas e identidade nacional','Média'],107:['Modernismo: transformações do circuito cultural brasileiro','Difícil'],108:['Tarsila do Amaral: regionalismo, cores e expressionismo','Difícil'],109:['Semana de Arte Moderna: recepção crítica e ruptura acadêmica','Média'],110:['Neoconcretismo: artistas e manifesto','Média'],111:['Neoconcretismo: geometria e experimentação subjetiva','Média'],112:['Concretismo e neoconcretismo: divergências regionais','Média'],113:['Neoconcretismo: participação do público e dimensão sensorial','Média'],114:['Abstração geométrica: Bauhaus, De Stijl e neoconcretismo','Difícil'],115:['Manifesto Neoconcreto: arte figurativa e não figurativa','Média'],
116:['Teatro brasileiro: Vestido de noiva e renovação cênica','Fácil'],117:['Teatro brasileiro: grupos, direção e montagem de Vestido de noiva','Média'],118:['História do teatro brasileiro: produção anterior a 1940','Difícil'],119:['Teatro brasileiro: Zbigniew Ziembinski e estilo de direção','Difícil'],120:['Teatro brasileiro: dramaturgia, cenografia, direção e interpretação','Média']
}
const stems={
75:'Na perspectiva dos PCNEM, as competências e habilidades estão ligadas às práticas sociais — tanto em arte quanto em outras disciplinas ou áreas.',
85:'O multiculturalismo na arte-educação, ou seja, a apreciação crítica da produção do povo, das minorias e das mídias, surgiu no Brasil nos anos 80 do século passado.',
89:'A missão artística francesa que chegou ao Brasil em 1816 para impulsionar as artes e a ciência organizou a Imperial Academia e Escola de Belas Artes.',
94:'Apesar de, com o avanço tecnológico, ter surgido uma grande variedade de frequências de quadros (fotogramas) por segundo na produção audiovisual, o cinema clássico tradicional faz uso de uma frequência de 30 qps (quadros por segundo).',
105:'Jongo, maxixe e xaxado são outros nomes dados ao coco de roda.'
}
const contextos={
 '51-56':'Comando: julgue os itens conforme os Parâmetros Curriculares Nacionais e as orientações sobre arte na educação.',
 '72-75':'Comando: avalie as competências e habilidades dos PCNEM para a disciplina de arte.',
 '76-81':'Texto-base: reflexão sobre educação estética, expressão artística, percepção, sentidos e apreciação do belo. A página original mantém o texto integral.',
 '82-85':'Comando: julgue os itens sobre arte, cidadania e manifestações culturais populares no Brasil.',
 '86-89':'Texto-base: crítica ao predomínio eurocêntrico na história da arte e à necessidade de reconhecer matrizes indígenas, africanas e pré-colombianas. A página original contém a passagem integral.',
 '90-94':'Texto-base: a informatização e as tecnologias digitais transformaram a comunicação, a produção e as manifestações artísticas; o comando trata de educação visual e interatividade.',
 '95-95':'Contexto: descrição do Toré, ritual Xucuru-Kariri com cantos, dança circular e instrumentos como chocalhos e maracás.',
 '96-100':'Comando: julgue os itens sobre a música brasileira do período colonial.',
 '101-105':'Comando: julgue os itens sobre o coco de roda, dança típica das regiões praieiras do Nordeste.',
 '106-109':'Texto-base: a Semana de Arte Moderna de 1922, em São Paulo, marcou uma inflexão cultural e uma reação ao passadismo intelectual. A página original preserva o texto completo e a referência.',
 '110-115':'Comando: julgue os itens sobre o movimento neoconcreto.',
 '116-120':'Comando: julgue os itens sobre história e renovação do teatro brasileiro.'
}
const faixa=n=>Object.keys(contextos).find(k=>{const [a,b]=k.split('-').map(Number);return n>=a&&n<=b})
const limpar=['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=[]
for(const q of pendentes){
 const n=Number(q.numero),meta=conteudos[n],key=respostas[n]
 assert.ok(meta&&key,`Item ${n} sem classificação ou resposta oficial`)
 const imagem=`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 let enunciado=stems[n]||q.enunciado.replace(/\s+/g,' ').replace(/\s*CESPE \| CEBRASPE – SEDUC\/AL – Aplicação: 2018\s*/g,' ').replace(/\s*(?:A educação estética compreende|A respeito desse assunto, julgue|A informatização dos lares|Considerando a navegabilidade|A respeito do movimento modernista|Sarampo antropofágico|A respeito da Semana de Arte Moderna|Acerca do teatro no Brasil|Com relação ao neoconcretismo).*/,'').replace(/\s*Espaço livre\s*$/,'').trim()
 if(!stems[n]&&n===93)enunciado=enunciado.replace('emojis','emojis').replace('diacríticos','diacríticos')
 assert.ok(enunciado.length>15,`Item ${n} sem enunciado íntegro`)
 const texto_apoio=contextos[faixa(n)]
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Artes',conteudo:meta[0],ano:2018,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 1º/4/2018',cargo,numero:n,numero_original:n,pagina:q.pagina,dificuldade:meta[1],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo o domínio de história, teorias e práticas artísticas e a especificidade do conceito; não corresponde a índice oficial de acertos.',resposta_correta:key==='C'?0:1,anulada:false,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_376_SEDUCAL001.PDF — Cargo 1: Professor, Artes',sha256:hashGabarito,numero:n,resposta:key,criterio:'Transcrição do gabarito oficial definitivo do mesmo cargo e caderno.'},classificacao_fonte:prova,motivo:`Item ${n}: matéria e conteúdo definidos pelo enunciado e pelo comando do bloco; ano de aplicação, cargo e banca conferidos nas fontes oficiais. Dificuldade estimada editorialmente.`,enunciado,texto_apoio,imagem_pagina:imagem,visual:{pagina:q.pagina,imagem,enunciado,texto_apoio,motivo:`Página ${q.pagina} do caderno oficial conferida visualmente; texto-base ou comando de seção foi separado do item e a página original permanece associada.`},apta_resolucao:true,remover_pendencias:limpar})
}
assert.equal(decisoes.length,51);assert.equal(new Set(decisoes.map(x=>x.id)).size,51)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:51,itens_unicos:51,aptas:51,paginas_conferidas:[1,2,3],gabarito_definitivo_oficial:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,concurso,registros_revisados:51,itens_unicos:51,questoes_aptas:51,paginas_conferidas:[1,2,3],gabarito_definitivo_oficial_vinculado:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SEDUC/AL 2018 — Professor de Artes, Cargo 1 — revisão v493\n\n- Revisei os 51 itens pendentes e classifiquei PCN/PCNEM, arte-educação, estética, cultura popular e indígena, música colonial, modernismo, neoconcretismo e teatro brasileiro.\n- Separei itens dos textos-base e comandos que haviam sido incorporados pelo OCR; as páginas originais 1–3 continuam ligadas às questões.\n- Associei o gabarito definitivo oficial do mesmo cargo. Todas as questões revisadas ficaram aptas; a dificuldade é estimativa editorial. Pacote local, ainda não publicado na nuvem.\n- Fontes: [caderno oficial](${prova}), [gabarito definitivo oficial](${gabarito}).\n`)
console.log(JSON.stringify(relatorio,null,2))
