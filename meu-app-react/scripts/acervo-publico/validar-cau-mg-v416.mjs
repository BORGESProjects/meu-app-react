import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const root='tmp/revisao-profissional/revisao-cau-mg-arquiteto-2025-v416/acervo-extraido'
const base='tmp/revisao-profissional/revisao-ansa-seguranca-trabalho-2026-v415/acervo-extraido'
const doc='4432bc2b6b5b66cf'
const m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8'))
const b=JSON.parse(await fs.readFile(path.join(base,'manifesto.json'),'utf8'))
assert.equal(m.questoes_extraidas_unicas,b.questoes_extraidas_unicas)
assert.equal(m.questoes_disponiveis_resolucao,b.questoes_disponiveis_resolucao)
const changed=[]
for(let i=0;i<m.lotes.length;i++) if(m.lotes[i].arquivo!==b.lotes[i].arquivo) changed.push(i)
assert.equal(changed.length,3)
const byId=new Map()
for(const i of changed){
 const newer=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))))
 const older=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(b.lotes[i].arquivo,raizesAtuais.slice(1))))
 assert.equal(newer.length,older.length)
 for(let j=0;j<newer.length;j++) if(newer[j].documento_id===doc) byId.set(newer[j].id,newer[j])
}
assert.equal(byId.size,70)
let anuladas=0,correcao=0
for(const q of byId.values()){
 assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.ok(q.materia&&q.conteudo&&q.ano===2025&&q.banca==='CEBRASPE'&&q.concurso.includes('CAU/MG'))
 assert.ok(q.integridade_profissional?.apta_resolucao===true)
 assert.ok(q.pagina_imagem&&q.contexto_paginas?.some(x=>x.pagina===q.pagina))
 await fs.access(path.join('public/acervo-extraido',q.pagina_imagem))
 assert.ok(q.gabarito_oficial?.sha256&&q.gabarito_oficial.fonte.includes('cebraspe'))
 if(q.anulada){anuladas++;assert.equal(q.numero_original,93);assert.equal(q.resposta_correta,null);assert.equal(q.integridade_profissional.correcao_automatica,false)}
 else {correcao++;assert.ok(Number.isInteger(q.resposta_correta));assert.equal(q.integridade_profissional.correcao_automatica,true)}
}
assert.equal(anuladas,1);assert.equal(correcao,69)
for(const field of ['indice_facetas','classificacao_principal']){
 const d=m[field],buf=await lerArquivoAtual(d.arquivo,raizesAtuais)
 assert.equal(createHash('sha256').update(buf).digest('hex'),d.sha256)
 JSON.parse(zlib.gunzipSync(buf))
}
const out={validado_em:new Date().toISOString(),itens:byId.size,anuladas,com_correcao:correcao,lotes_alterados:changed.length,imagens_existentes:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas,nao_disponiveis_para_resolucao:m.questoes_extraidas_unicas-m.questoes_disponiveis_resolucao}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-cau-mg-arquiteto-2025-v416.json',JSON.stringify(out,null,2))
console.log(JSON.stringify(out,null,2))
