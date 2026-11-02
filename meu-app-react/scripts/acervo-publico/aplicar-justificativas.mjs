import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lotesAtuais,lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
import {separarJustificativa} from './separar-justificativa.mjs'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
const sha=b=>createHash('sha256').update(b).digest('hex'),docs='docs/acervo/revisao-profissional'
const bases=raizesAtuais.slice(raizesAtuais.findIndex(r=>r.includes('/revisao-saeb-v1/')))
const destino='tmp/revisao-profissional/revisao-justificativas-v2/acervo-extraido',facetas=criarIndiceFacetas()
const candidatos=JSON.parse(zlib.gunzipSync(await fs.readFile(`${docs}/justificativas-candidatos.json.gz`))),map=new Map(candidatos.map(p=>[p.id,p])),fontes=new Map(),auditoria=[]
const m=JSON.parse(await lerArquivoAtual('manifesto.json',bases));let alterados=0,bytes=0,total=0
await fs.mkdir(`${destino}/lotes`,{recursive:true})
for await(const {indice,lote,questoes} of lotesAtuais(bases)){
 let mudou=false
 for(const q of questoes){
  total++;const p=map.get(q.id);if(!p)continue
  assert.equal(sha(q.enunciado),p.sha256_enunciado)
  if(!fontes.has(p.documento)){const b=await fs.readFile(`tmp/revisao-profissional/fontes-texto/${p.documento}.json.gz`);fontes.set(p.documento,{sha:sha(b),paginas:JSON.parse(zlib.gunzipSync(b))})}
  const f=fontes.get(p.documento);assert.equal(f.sha,p.fonte_sha256)
  const r=separarJustificativa(q,f.paginas);assert.deepEqual(r,p.depois)
  const antes=structuredClone(q)
  q.enunciado=r.enunciado;q.comentario=r.comentario
  q.revisao_justificativa={metodo:r.metodo,fonte_sha256:p.fonte_sha256,antes_sha256:p.sha256_enunciado,depois_sha256:sha(q.enunciado),pagina:p.pagina}
  for(const k of Object.keys(antes))if(k!=='enunciado')assert.deepEqual(q[k],antes[k])
  assert.ok(q.pagina_imagem);auditoria.push(p);mudou=true
 }
 facetas.adicionar(indice,questoes)
 if(mudou){const b=zlib.gzipSync(JSON.stringify(questoes),{level:9});const arquivo=`lotes/justificativas-${indice}-${sha(b).slice(0,12)}.json.gz`;m.lotes[indice].arquivo=arquivo;await fs.writeFile(path.join(destino,arquivo),b);bytes+=b.length;alterados++}
}
assert.equal(auditoria.length,candidatos.length);assert.equal(total,m.questoes_extraidas_unicas)
m.gerado_em=new Date().toISOString()
const f=facetas.finalizar();assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),m.questoes_disponiveis_resolucao)
const fb=zlib.gzipSync(JSON.stringify(f),{level:9}),fa=`lotes/filtros-justificativas-${sha(fb).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,fa),fb);m.indice_facetas={arquivo:fa,sha256:sha(fb),versao:1}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',bases));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(m))
const r={gerado_em:m.gerado_em,questoes_corrigidas:auditoria.length,lotes_alterados:alterados,bytes,publicado:false,gabaritos_classificacao_textos_base_imagens_preservados:true,comentario_preservado:true,comentario_consultavel_na_pagina_original:true}
await fs.writeFile(`${docs}/revisao-justificativas.json`,JSON.stringify(r,null,2));await fs.writeFile(`${docs}/revisao-justificativas-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(auditoria),{level:9}));console.log(JSON.stringify(r))
