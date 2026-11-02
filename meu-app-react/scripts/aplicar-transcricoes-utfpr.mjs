import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {blocosValidos} from '../src/blocosQuestao.js'
import {formatarTextoAlternativa} from '../src/textoQuestao.js'
const arquivo='public/acervo/utfpr-2023/questoes.json'
const itens=JSON.parse(await fs.readFile(arquivo))
const ids=new Set(['utfpr-2023-37','utfpr-2023-53','utfpr-2023-54'])
const historico=[]
const el=(tag,...children)=>({tag,children})
const sub=(a,b)=>el('msub',el('mi',a),el('mn',b))
const concentracao=(nome,subscrito,expoente)=>{
 const grupo=el('mrow',el('mo','['),subscrito?sub(nome,subscrito):el('mi',nome),el('mo',']'))
 return expoente?el('msup',grupo,el('mn',expoente)):grupo
}
for(const q of itens){
 if(!ids.has(q.id))continue
 const antes=[...q.opcoes]
 q.opcoes=q.opcoes.map(formatarTextoAlternativa)
 if(q.id==='utfpr-2023-37'){
  q.opcoes[0]='O valor de Kc para este equilíbrio é de 0,1.'
  q.opcoes[4]='O equilíbrio é representado por Kc = [NO]²[O₂]/[NO₂]².'
  q.blocos_opcoes=q.opcoes.map(t=>[t])
  q.blocos_opcoes[4]=['O equilíbrio é representado por ',el('math',el('mrow',sub('K','c'),el('mo','='),el('mfrac',el('mrow',concentracao('NO',null,'2'),concentracao('O','2')),concentracao('NO','2','2'))))]
  if(!q.blocos_opcoes.every(blocosValidos))throw Error('Fórmula inválida')
 }
 q.opcoes_em_texto=Array(5).fill(true)
 q.opcoes_texto_corrompido=Array(5).fill(false)
 const fontes=[]
 for(const imagem of q.opcoes_imagens){
  if(!imagem.startsWith('/acervo/utfpr-2023/imagens/'))throw Error('Fonte fora do lote')
  fontes.push({imagem,sha256:createHash('sha256').update(await fs.readFile('public'+imagem)).digest('hex')})
 }
 historico.push({id:q.id,antes,opcoes:q.opcoes,blocos_opcoes:q.blocos_opcoes,fontes,resposta_correta:q.resposta_correta,metodo:'Leitura visual individual dos cinco recortes; conteúdo das alternativas preservado, inclusive distratores.'})
}
if(historico.length!==3)throw Error('IDs não encontrados')
await fs.writeFile(arquivo,JSON.stringify(itens)+'\n')
const nativeFile='native/acervo/questoes.json'
const nativas=JSON.parse(await fs.readFile(nativeFile)),porId=new Map(itens.filter(q=>ids.has(q.id)).map(q=>[q.id,q]))
for(const q of nativas){const fonte=porId.get(q.id);if(fonte)for(const c of ['opcoes','blocos_opcoes','opcoes_em_texto','opcoes_texto_corrompido'])if(fonte[c]!==undefined)q[c]=fonte[c]}
await fs.writeFile(nativeFile,JSON.stringify(nativas))
await fs.writeFile('docs/acervo/utfpr-alternativas-transcritas.json',JSON.stringify({gerado_em:new Date().toISOString(),questoes:historico,publicado:false},null,2))
console.log('15 alternativas conferidas; texto e fórmula estruturada aplicados. Gabaritos e imagens-fonte preservados.')
