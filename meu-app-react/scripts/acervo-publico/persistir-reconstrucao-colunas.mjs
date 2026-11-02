import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {hashTextoVisual} from './aplicar_revisao_visual.mjs'
const qs=JSON.parse(await fs.readFile('tmp/revisao-profissional/questoes-consultadas.json'))
const sha=b=>createHash('sha256').update(b).digest('hex')
const correcoes={
 'extr-93c4eba24db5c7997783':{
  enunciado:'Os níveis de maturidade do MPS.BR estão diretamente relacionados aos atributos de processo (AP), que descrevem os níveis de capacidade dos processos. Para se alcançar o nível G (parcialmente gerenciado), é necessário implementar o AP 2.2, em que os produtos de trabalho do processo são gerenciados.',
  texto_apoio:'Julgue os próximos itens a respeito do MPS.BR.',materia:'Informática',conteudo:'Engenharia de software: qualidade e modelos de maturidade',ano:2015},
 'extr-7ec22b1473f83f898c41':{
  enunciado:'A próclise observada em “se multiplicam” (ℓ.7) e “se desenvolve” (ℓ.14) é opcional, de modo que o emprego da ênclise nesses dois casos também seria correto — multiplicam-se e desenvolve-se, respectivamente.',
  texto_apoio:'',materia:'Português',conteudo:'Colocação pronominal',ano:2018},
 'extr-6e970c57ca83dde67ca3':{
  enunciado:'O emprego do acento indicativo de crase em “às células-tronco adultas” (ℓ. 6 e 7) é facultativo, dada a presença de termo masculino na palavra composta “células-tronco”.',
  texto_apoio:'',materia:'Português',conteudo:'Crase',ano:2017},
}
// Texto fiel à página: a assertiva pode estar errada e não deve ser corrigida como conteúdo didático.
// Usa a extração textual do PDF conferida visualmente, evitando erros de redigitação.
for(const [id,doc,inicio,fim] of [
 ['extr-7ec22b1473f83f898c41','f59be5c8a5eba99f','Texto CB1A1AAA','A respeito das ideias e das estruturas linguísticas'],
 ['extr-6e970c57ca83dde67ca3','09e438effadb19c1','Texto CG1A1AAA','Considerando as ideias e os aspectos linguísticos'],
]){
 const pagina=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`)))[0]
 const a=pagina.indexOf(inicio),b=pagina.indexOf(fim,a)
 if(a<0||b<=a)throw Error('Texto-base sem delimitadores conferidos')
 correcoes[id].texto_apoio=pagina.slice(a,b).replace(/(?:25|22|19|16|13|10|7|4|1)\s*\n/gu,'\n').trim()
}
const revisoes=[]
for(const q of qs){
 const campos={...correcoes[q.id],classificacao_pendente:false,classificacao_metodo:'Conferência visual individual da página original e reconstrução das colunas'}
 if(!correcoes[q.id])continue
 campos.revisao_visual={fonte:q.pagina_imagem,sha256:sha(await fs.readFile('public/acervo-extraido/'+q.pagina_imagem)),metodo:campos.classificacao_metodo}
 revisoes.push({id:q.id,sha256_antes:hashTextoVisual(q),sha256_depois:hashTextoVisual({...q,...campos}),campos})
}
if(revisoes.length!==3)throw Error('Revisões incompletas')
await fs.writeFile('docs/acervo/revisao-profissional/reconstrucao-colunas.json',JSON.stringify(revisoes,null,2))
