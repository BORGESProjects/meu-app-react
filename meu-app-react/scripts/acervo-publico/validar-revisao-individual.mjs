import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
const nome=process.argv[2];assert.match(nome,/^[a-z0-9-]+$/)
const dir=`tmp/revisao-profissional/${nome}/acervo-extraido`,m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'))),ids=new Set()
let total=0,disponiveis=0,alterados=0,pendentes=0
for(const lote of m.lotes){
 let bytes,local=true
 try{bytes=await fs.readFile(path.join(dir,lote.arquivo))}catch(e){if(e.code!=='ENOENT')throw e;bytes=await lerArquivoAtual(lote.arquivo,raizesAtuais);local=false}
 if(local){assert.ok(lote.arquivo.includes(hashRevisao(bytes).slice(0,12)));alterados++}
 const qs=JSON.parse(zlib.gunzipSync(bytes));assert.equal(qs.length,lote.quantidade)
 for(const q of qs){assert.ok(!ids.has(q.id));ids.add(q.id);total++;if(q.classificacao_pendente&&q.integridade_profissional?.apta_resolucao!==false&&!q.classificacao_revisada)pendentes++;if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++}
}
assert.equal(total,m.questoes_extraidas_unicas);assert.equal(disponiveis,m.questoes_disponiveis_resolucao)
let b
try{b=await fs.readFile(path.join(dir,m.indice_facetas.arquivo))}catch(e){if(e.code!=='ENOENT')throw e;b=await lerArquivoAtual(m.indice_facetas.arquivo,raizesAtuais)}
assert.equal(hashRevisao(b),m.indice_facetas.sha256)
const f=JSON.parse(zlib.gunzipSync(b));assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),disponiveis)
const r={validado_em:new Date().toISOString(),pacote:nome,total,disponiveis,pendentes,lotes_alterados:alterados,referencias_resolvidas:true,facetas_conferidas:true}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(r,null,2));console.log(JSON.stringify(r))
