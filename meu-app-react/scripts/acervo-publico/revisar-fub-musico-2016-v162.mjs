import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='62a783280755228f'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_005_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_005_01.pdf'
const start=raizesAtuais.findIndex(r=>r.includes('revisao-funpresp-jud-auditoria-2026-v161'))
if(start<0)throw Error('Base v161 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)}
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||active.size!==72)throw Error(`Esperados 72 registros do caderno, recebidos ${active.size}`)
const canonical=new Map(),pages=new Map()
for(const q of catalog.questoes){if(!canonical.has(q.numero))canonical.set(q.numero,q.id);pages.set(q.id,q.pagina)}
if(canonical.size!==70||[...Array(70)].some((_,i)=>!canonical.has(i+51)))throw Error('Caderno não cobre todos os números 51–120')
const keyRows=[
 ['C','C','E','C','C','E','C','E','E','E','C','C','C','C','C','E','C','C','E','E'],
 ['C','C','E','C','E','C','E','C','C','C','C','E','C','E','E','C','E','E','C','E'],
 ['E','C','E','E','C','C','C','E','E','E','C','E','C','X','C','C','E','C','C','C'],
 ['E','C','E','C','E','E','C','C','E','E']
],key=new Map();let number=51;for(const row of keyRows)for(const answer of row)key.set(number++,answer);if(number!==121||key.size!==70)throw Error('Gabarito definitivo incompleto')
const blocks=[
 [[51,53],'História da Música','Música na Grécia Antiga, palavra falada, rap, repente, recitativo e teatro musical de Wagner','Julgue os itens relacionados às informações do texto sobre a relação entre música e palavra falada.'],
 [[54,56],'História da Música','Música medieval — tetragrama, antifonário e cantochão','Com relação às manifestações musicais e à notação musical na Idade Média, julgue os itens.'],
 [[57,59],'História da Música','Polifonia medieval — escola de Notre Dame, Leonin, Pérotin e organum','Acerca das manifestações polifônicas da Idade Média, julgue os itens.'],
 [[60,63],'História da Música','Renascimento — frottola, escola franco-flamenga, contraponto e madrigal','Considere o texto sobre compositores e movimentos musicais dos séculos XV e XVI.'],
 [[64,67],'História da Música','Música renascentista — dança, famílias de flautas, alaúde e baixo contínuo','Em relação à dança e aos instrumentos empregados na música do século XVI, julgue os itens.'],
 [[68,69],'História da Música','Barroco — baixo contínuo, contraponto, fuga e paixões de Bach','Considere o texto sobre J. S. Bach e as características da música barroca.'],
 [[70,71],'História da Música','Classicismo — Beethoven e influência de Haydn sobre Mozart','No que se refere aos períodos clássico e romântico, julgue os itens.'],
 [[72,85],'Teoria e Análise Musical','Análise harmônica de coral de Bach a cinco vozes — trítono, enarmonia, tônica, síncope, inversões, fermatas, sensível e acordes','Considere a partitura de coral de J. S. Bach a cinco vozes, apresentada na figura da página original.'],
 [[86,93],'Teoria e Análise Musical','Análise de melodias, dinâmica, modos, escalas, armaduras, cromatismo e transposição para trompa em fá','Considere as seis melodias da figura na página original e julgue os itens.'],
 [[94,96],'Teoria e Análise Musical','Ritmo e métrica — compassos simples, compostos e agrupamento de colcheias','Considere o trecho musical da página original e a organização rítmica dos compassos.'],
 [[97,99],'Harmonia','Acordes de sexta aumentada italiana, alemã e francesa e resolução de dominantes','Considere o texto-base sobre alterações e acordes de sexta aumentada.'],
 [[100,104],'Contraponto','Primeira espécie — cantus firmus, consonâncias, condução de vozes e intervalos paralelos','Considere o texto-base sobre contraponto de primeira espécie e julgue os itens.'],
 [[105,107],'Contraponto','Dissonâncias e espécies de contraponto — cambiata, suspensão, retardamento e notas melódicas','Acerca da utilização de dissonâncias no contraponto, julgue os itens.'],
 [[108,110],'Forma Musical','Fuga e invenção — sujeito, episódios, imitação e número de vozes','Considere as semelhanças e diferenças entre os gêneros polifônicos invenção e fuga.'],
 [[111,115],'Teoria e Análise Musical','Análise harmônica e condução de vozes no minueto do Quarteto nº 11 de Mozart','Considere a partitura do minueto de Mozart apresentada na página original.'],
 [[116,120],'Teoria e Análise Musical','Análise formal e motívica da Sonata op. 22 nº 11 de Beethoven — sentença, sequências, dominante e harmonia','Considere a partitura do minueto da Sonata op. 22 nº 11 de Beethoven apresentada na página original.']
]
const block=i=>blocks.find(([[a,b]])=>i>=a&&i<=b)
const fix=new Map([
 [63,'Johannes Ockeghem e Josquin des Prez são representantes dos compositores do norte europeu daquela época.'],
 [69,'As “paixões” citadas no texto referem-se aos diversos casamentos que J. S. Bach teve ao longo de sua vida.'],
 [71,'A obra de Mozart foi fortemente influenciada pela música de Joseph Haydn.'],
 [78,'Na segunda metade do terceiro tempo do primeiro compasso, as notas formam um acorde de sétima diminuta.'],
 [85,'No segundo tempo do terceiro compasso, as vozes formam um acorde maior com sétima na segunda inversão.'],
 [86,'Na melodia de número 1, as indicações dim. e o sinal gráfico de decrescendo (>) têm efeito idêntico.'],
 [96,'O trecho contém três compassos simples, três compassos compostos e nove compassos compostos irregulares.'],
 [99,'Caso a alteração III seja efetuada, os acordes de dominante gerados passarão a conter dois trítonos.'],
 [101,'No contraponto de primeira espécie, o primeiro e o último compasso devem conter apenas consonâncias perfeitas.'],
 [104,'No contraponto de primeira espécie, não se utiliza o intervalo de quarta justa.'],
 [106,'Na quarta espécie de contraponto, os intervalos dissonantes presentes na suspensão ou no retardamento são utilizados apenas no tempo forte.'],
 [107,'Intervalos melódicos dissonantes, tais como bordadura, nota de passagem, cambiata, escapada e apojatura, são admitidos na terceira espécie de contraponto.'],
 [110,'A invenção limita-se usualmente a duas ou três vozes; na fuga, esse número varia de três a seis, geralmente.'],
 [111,'As notas lá natural e dó natural observadas no primeiro tempo do sétimo compasso sugerem o acorde incompleto de lá menor, terceiro grau da tonalidade de fá maior.'],
 [114,'O cruzamento de vozes presente no segundo compasso tem por função ocultar as oitavas paralelas implícitas no trecho musical em questão.'],
 [116,'O trecho musical em questão apresenta a estrutura de uma sentença, ou seja, quatro compassos antecedentes seguidos de quatro compassos consequentes que contêm reduções do motivo.'],
 [119,'O motivo de três notas apresentado a partir da anacruse reaparecerá variado ao longo do trecho em razão de diferentes técnicas composicionais, entre as quais ornamentação, transposição e retrogradação.']
])
const clean=(s='')=>s.replace(/\u000c/g,' ').replace(/\|\|281FUB_[\s\S]*$/u,'').replace(/\s+(?:Espaço livre|Ainda considerando|No que se refere|Considerando|Acerca das manifestações|Acerca da utilização|Com relação|Em relação)[\s\S]*$/u,'').replace(/\s+/g,' ').trim()
const decisions=[...active.values()].map(q=>{
 const i=Number(q.numero_original??q.numero??q.numero_questao),group=block(i);if(!group||!key.has(i))throw Error(`Item fora do mapa: ${q.id}`)
 const [[a,b],materia,conteudo,contexto]=group,canonicalId=canonical.get(i),dup=q.id!==canonicalId,pg=pages.get(q.id)||1,ans=key.get(i),stem=fix.get(i)||clean(q.enunciado)
 if(!stem||stem.length<20)throw Error(`Enunciado incompleto no item ${i}`)
 const useScore=(i>=72&&i<=85)||(i>=86&&i<=93)||(i>=94&&i<=96)||(i>=111&&i<=120)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2016,concurso:'FUB — Músico (Cargo 5); aplicação em 18/12/2016',numero_original:i,pagina:pg,dificuldade:[53,56,59,61,63,68,71,74,76,78,81,84,86,87,90,92,96,98,101,102,104,106,108,110,112,113,114,116,118,120].includes(i)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência teórica e analítica; a banca não publicou níveis de dificuldade.',resposta_correta:ans==='X'?null:ans==='C'?0:1,anulada:ans==='X',gabarito_oficial:{valor:ans,fonte:gabarito,numero:i,resposta:ans,metodo:'Gabarito definitivo oficial do Cargo 5: Músico, aplicação em 18/12/2016.'},classificacao_fonte:prova,motivo:`Classificação por assunto e comando, conferidos no caderno oficial, página ${pg}.`,visual:{pagina:pg,imagem:`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`,...(useScore?{imagem_necessaria:true}:{}),texto_apoio:contexto,motivo:`Página ${pg} original vinculada ao bloco; partitura ou figura preservada quando necessária à resolução.`},enunciado:stem,...(dup?{apta_resolucao:false,duplicada_de:canonicalId,inelegibilidade_motivo:`Duplicata OCR do item ${i}; registro canônico ${canonicalId}.`}:{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']})}
})
if(decisions.length!==72||decisions.filter(x=>x.duplicada_de).length!==2)throw Error('Registros ou duplicatas divergentes')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicos:70,duplicatas:2,anuladas:[...key].filter(([,v])=>v==='X').map(([i])=>i),partiturasPreservadas:decisions.filter(x=>x.visual.imagem_necessaria).length,paginas:[1,2,3,4,5]},null,2));process.exit(0)}
const name='revisao-fub-musico-2016-v162',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions});raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...report,prova,gabarito,registros_revistos:72,itens_unicos:70,duplicatas_inelegiveis:2,anuladas:[...key].filter(([,v])=>v==='X').map(([i])=>i),partituras_preservadas:true,paginas_originais:5,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
