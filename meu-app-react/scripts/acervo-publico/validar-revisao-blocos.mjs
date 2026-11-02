import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lerArquivoAtual} from './acervo-atual.mjs'
const dir='tmp/revisao-profissional/revisao-blocos-v2/acervo-extraido',hash=b=>createHash('sha256').update(b).digest('hex')
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'))),ids=new Set()
let total=0,disponiveis=0,alterados=0,pendentes=0
for(const lote of m.lotes){
 let bytes,local=true
 try{bytes=await fs.readFile(path.join(dir,lote.arquivo))}catch(e){if(e.code!=='ENOENT')throw e;bytes=await lerArquivoAtual(lote.arquivo);local=false}
 if(local){assert.ok(lote.arquivo.includes(hash(bytes).slice(0,12)));alterados++}
 const qs=JSON.parse(zlib.gunzipSync(bytes));assert.equal(qs.length,lote.quantidade)
 for(const q of qs){assert.ok(!ids.has(q.id));ids.add(q.id);total++;if(q.classificacao_pendente)pendentes++;if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++}
}
assert.equal(total,m.questoes_extraidas_unicas);assert.equal(disponiveis,m.questoes_disponiveis_resolucao)
const b=await fs.readFile(path.join(dir,m.indice_facetas.arquivo));assert.equal(hash(b),m.indice_facetas.sha256)
const f=JSON.parse(zlib.gunzipSync(b));assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),disponiveis)
const r={validado_em:new Date().toISOString(),total,disponiveis,pendentes,lotes_alterados:alterados,referencias_resolvidas:true,facetas_conferidas:true}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-blocos.json',JSON.stringify(r,null,2));console.log(JSON.stringify(r))
