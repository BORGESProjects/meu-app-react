import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
const root=path.resolve('tmp/revisao-profissional/acervo-extraido')
const manifest=JSON.parse(await fs.readFile(path.join(root,'manifesto.json')))
const original=JSON.parse(await fs.readFile('public/acervo-extraido/manifesto.json'))
const hash=b=>createHash('sha256').update(b).digest('hex')
const fields=['id','enunciado','texto_apoio','opcoes','pagina','paginas_origem','transcricoes_ocr']
const ids=new Set();let total=0,eligible=0,linked=0,max=0,bytes=0
assert.equal(manifest.lotes.length,original.lotes.length)
for(let i=0;i<manifest.lotes.length;i++){
 const lot=manifest.lotes[i]
 assert.match(lot.arquivo,/^lotes\/[A-Za-z0-9_-]+\.json\.gz$/u)
 const content=await fs.readFile(path.join(root,lot.arquivo));bytes+=content.length;max=Math.max(max,content.length)
 assert.ok(lot.arquivo.includes(hash(content).slice(0,10)), 'Nome versionado e hash divergem')
 const revised=JSON.parse(zlib.gunzipSync(content))
 const before=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join('public/acervo-extraido',original.lotes[i].arquivo))))
 assert.equal(revised.length,before.length);assert.equal(revised.length,lot.quantidade)
 for(let n=0;n<revised.length;n++){
  const q=revised[n],old=before[n]
  assert.ok(!ids.has(String(q.id)),'Identificador repetido');ids.add(String(q.id))
  for(const field of fields)if(field!=='paginas_origem')assert.deepEqual(q[field],old[field],`${q.id}: conteúdo alterado em ${field}`)
  assert.ok(q.integridade_profissional)
  if(q.integridade_profissional.apta_resolucao)eligible++
  if(q.gabarito_oficial){
   linked++
   assert.match(q.gabarito_oficial.sha256,/^[a-f0-9]{64}$/u)
   assert.equal(Number(q.numero_original),q.gabarito_oficial.numero)
   assert.ok(q.gabarito_oficial.fonte.startsWith('https://'))
   if(!q.anulada)assert.ok(Number.isInteger(q.resposta_correta)&&q.resposta_correta>=0&&q.resposta_correta<q.opcoes.length)
  }
  total++
 }
}
assert.equal(total,manifest.questoes_extraidas_unicas)
assert.equal(eligible,manifest.questoes_disponiveis_resolucao)
let facetas
for(const field of ['indice_facetas','classificacao_principal']){
 const descriptor=manifest[field],content=await fs.readFile(path.join(root,descriptor.arquivo))
 assert.equal(hash(content),descriptor.sha256)
 const value=JSON.parse(zlib.gunzipSync(content))
 if(field==='indice_facetas')facetas=value
 else assert.equal(value.length,descriptor.quantidade)
}
assert.equal(facetas.linhas.reduce((n,r)=>n+r[6],0),eligible)
const report={validado_em:new Date().toISOString(),registros:total,disponiveis:eligible,gabaritos_vinculados:linked,maior_lote_bytes:max,bytes_lotes:bytes,conteudos_originais_preservados:true}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-pacote.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
