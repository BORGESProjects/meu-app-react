import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lotesAtuais,lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'

const sha=x=>createHash('sha256').update(x).digest('hex')
const pares=[
  {duplicada:'extr-19c1d5d2bff3e52d40e5',principal:'extr-cece395d512d02b5fc43'},
  {duplicada:'extr-0fa7fd594cf30ec3913f',principal:'extr-2e5faec12fd8cfec7c44'},
  {duplicada:'extr-cf8eeeccc558cee59388',principal:'extr-fffbedf3b46b5770b36d'},
]
const mapa=new Map(pares.map(x=>[x.duplicada,x.principal]))
const normalizar=s=>String(s||'').normalize('NFKC').toLowerCase().replaceAll('‘','').replaceAll('’','').replaceAll('“','').replaceAll('”','').replaceAll("'",'').replaceAll('"','').replace(/[^\p{L}\p{N}]+/gu,' ').trim()
function similar(a,b){
 const x=normalizar(a),y=normalizar(b);if(x===y)return 1
 const prev=Array.from({length:y.length+1},(_,i)=>i)
 for(let i=1;i<=x.length;i++){let diag=prev[0];prev[0]=i;for(let j=1;j<=y.length;j++){const old=prev[j];prev[j]=Math.min(prev[j]+1,prev[j-1]+1,diag+(x[i-1]===y[j-1]?0:1));diag=old}}
 return 1-Math.min(prev[y.length]/Math.max(x.length,y.length,1),1)
}
const base=raizesAtuais[0],inicio=raizesAtuais.indexOf(base)
assert.equal(base,'tmp/revisao-profissional/revisao-semantica-v59/acervo-extraido')
const bases=raizesAtuais.slice(inicio),destino='tmp/revisao-profissional/revisao-semantica-v60/acervo-extraido'
const m=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),facetas=criarIndiceFacetas(),historico=[]
const anterior=JSON.parse(zlib.gunzipSync(await fs.readFile('docs/acervo/revisao-profissional/revisao-semantica-v59-alteracoes.json.gz')))
const principals=new Map(anterior.filter(x=>pares.some(p=>p.principal===x.id)).map(x=>[x.id,x.depois]))
await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
let total=0,disponiveis=0,pendentes=0,lotesMudados=0,bytes=0,encontradas=new Set()
for await(const {indice,questoes,lote} of lotesAtuais(bases)){
 let mudou=false
 for(const q of questoes){
  total++
  if(mapa.has(q.id)){
   const principalId=mapa.get(q.id)
   assert.equal(q.documento_id,'a1c43b2a8de46185')
   assert.equal(Number(q.ano),2025)
   assert.equal(Number(q.numero_original),Number(questoes.find(x=>x.id===principalId)?.numero_original))
   const principal=principals.get(principalId)
   assert.ok(principal,`Questão principal ausente no lote da duplicata ${q.id}`)
   assert.ok(similar(q.enunciado,principal.enunciado)>=0.95,`Similaridade textual insuficiente em ${q.id}`)
   assert.ok(q.pagina_imagem&&principal.pagina_imagem,`Página original sem imagem vinculada: ${q.id}`)
   await fs.access(path.join('public/acervo-extraido',q.pagina_imagem));await fs.access(path.join('public/acervo-extraido',principal.pagina_imagem))
   const antes=structuredClone(q),motivo=`Duplicata semântica do mesmo item ${q.numero_original} no caderno oficial CACD 2025; o registro principal ${principalId} é mantido. Enunciados normalizados com similaridade ${similar(q.enunciado,principal.enunciado).toFixed(4)} e comparação com a página renderizada.`
   q.integridade_profissional={...q.integridade_profissional,apta_resolucao:false,correcao_automatica:false,verificada_individualmente:true,pendencias:[...new Set([...(q.integridade_profissional?.pendencias||[]),'duplicata_semantica_de_item'])]}
   q.elegibilidade={...q.elegibilidade,elegivel_para_resolucao:false,elegivel_para_correcao_automatica:false,apontamentos:[...new Set([...(q.elegibilidade?.apontamentos||[]),'duplicata_semantica_de_item'])]}
   q.duplicada_de=principalId
   q.revisao_duplicidade={principal:principalId,sha256_enunciado_normalizado:sha(normalizar(q.enunciado)),pagina:q.pagina_imagem,metodo:'Comparação de texto normalizado e página original renderizada',motivo}
   historico.push({id:q.id,antes,depois:structuredClone(q)});mudou=true;encontradas.add(q.id)
  }
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
  if(q.classificacao_pendente&&q.integridade_profissional?.apta_resolucao!==false&&!q.classificacao_revisada)pendentes++
 }
 facetas.adicionar(indice,questoes)
 if(mudou){const b=zlib.gzipSync(JSON.stringify(questoes),{level:9});const arquivo=`lotes/duplicatas-irbr-${indice}-${sha(b).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,arquivo),b);m.lotes[indice].arquivo=arquivo;lotesMudados++;bytes+=b.length}
}
assert.equal(encontradas.size,3);assert.equal(total,m.questoes_extraidas_unicas)
assert.equal(disponiveis,m.questoes_disponiveis_resolucao-3)
const f=facetas.finalizar();assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),disponiveis)
const fb=zlib.gzipSync(JSON.stringify(f),{level:9}),filtroArquivo=`lotes/filtros-duplicatas-irbr-${sha(fb).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,filtroArquivo),fb);m.indice_facetas={arquivo:filtroArquivo,sha256:sha(fb),versao:1};m.questoes_disponiveis_resolucao=disponiveis;m.gerado_em=new Date().toISOString()
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',bases));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(m))
const relatorio={gerado_em:m.gerado_em,duplicatas_excluidas_da_resolucao:encontradas.size,total,disponiveis,pendentes,lotes_alterados:lotesMudados,bytes,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/revisao-duplicatas-irbr-v60.json',JSON.stringify(relatorio,null,2));await fs.writeFile('docs/acervo/revisao-profissional/revisao-duplicatas-irbr-v60-alteracoes.json.gz',zlib.gzipSync(JSON.stringify(historico),{level:9}));console.log(JSON.stringify(relatorio))
