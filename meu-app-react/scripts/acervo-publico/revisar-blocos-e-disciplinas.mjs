import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lotesAtuais,lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {separarComandoSeguinte} from './separar-comando-seguinte.mjs'
const sha=x=>createHash('sha256').update(x).digest('hex')
const bases=raizesAtuais.slice(raizesAtuais.findIndex(r=>r.includes('/revisao-objetos-v2/')))
const docs='docs/acervo/revisao-profissional',destino='tmp/revisao-profissional/revisao-blocos-v2/acervo-extraido'
const read=async name=>JSON.parse(zlib.gunzipSync(await fs.readFile(`${docs}/${name}.json.gz`)))
const classificacoes=new Map(),conflitos=[]
for(const p of [...await read('agente-direito-patches'),...await read('agente-ti-patches')]){
 if(classificacoes.has(p.id)){conflitos.push(p.id);continue}
 classificacoes.set(p.id,p)
}
for(const id of conflitos)classificacoes.delete(id)
const comandos=new Map((await read('comandos-pdf-candidatos')).map(p=>[p.id,p]))
const m=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),facetas=criarIndiceFacetas(),auditoria=[],fontes=new Map(),vistos=new Set()
await fs.mkdir(`${destino}/lotes`,{recursive:true})
let total=0,disponiveis=0,pendentes=0,lotesAlterados=0,classificadas=0,separadas=0,bytesTotal=0
for await(const {indice,lote,questoes} of lotesAtuais(bases)){
 let mudou=false
 for(const q of questoes){
  assert.ok(!vistos.has(q.id));vistos.add(q.id);total++
  const original=structuredClone(q),p=classificacoes.get(q.id),s=comandos.get(q.id)
  if(p){
   assert.equal(sha(q.enunciado),p.sha256_enunciado)
   assert.ok(q.classificacao_pendente&&!q.classificacao_revisada&&q.integridade_profissional?.apta_resolucao!==false)
   for(const [k,v] of Object.entries(p.antes))assert.deepEqual(q[k],v)
   Object.assign(q,p.depois);classificadas++;mudou=true
   for(const [campo,chave]of [['integridade_profissional','pendencias'],['elegibilidade','apontamentos']])if(q[campo]?.[chave])q[campo][chave]=q[campo][chave].filter(x=>x!=='classificacao_especifica_pendente')
  }
  if(s){
   assert.equal(sha(q.enunciado),s.sha256_enunciado)
   if(!fontes.has(s.documento)){
    const b=await fs.readFile(`tmp/revisao-profissional/fontes-texto/${s.documento}.json.gz`)
    fontes.set(s.documento,{sha:sha(b),paginas:JSON.parse(zlib.gunzipSync(b))})
   }
   const fonte=fontes.get(s.documento);assert.equal(fonte.sha,s.fonte_sha256)
   const corte=separarComandoSeguinte(q,fonte.paginas);assert.ok(corte);assert.equal(corte.enunciado,s.depois.enunciado)
   q.enunciado=corte.enunciado
   q.revisao_delimitacao={metodo:s.metodo,fonte_sha256:s.fonte_sha256,antes_sha256:s.sha256_enunciado,depois_sha256:sha(q.enunciado),pagina:s.pagina}
   separadas++;mudou=true
  }
  if(p||s)auditoria.push({id:q.id,classificacao:p||null,delimitacao:s||null})
  // Somente estes campos podem mudar; todo gabarito, texto-base e mídia é preservado.
  const permitidos=new Set(['enunciado','revisao_delimitacao',...Object.keys(p?.depois||{}),'integridade_profissional','elegibilidade'])
  for(const k of Object.keys(original))if(!permitidos.has(k))assert.deepEqual(q[k],original[k],`${q.id}: ${k}`)
  if(!s)assert.equal(q.enunciado,original.enunciado)
  assert.equal(q.integridade_profissional?.apta_resolucao,original.integridade_profissional?.apta_resolucao)
  if(q.classificacao_pendente)pendentes++
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 facetas.adicionar(indice,questoes)
 if(mudou){
  const b=zlib.gzipSync(JSON.stringify(questoes),{level:9});bytesTotal+=b.length
  const arquivo=`lotes/blocos-${indice}-${sha(b).slice(0,12)}.json.gz`
  await fs.writeFile(path.join(destino,arquivo),b);m.lotes[indice].arquivo=arquivo;lotesAlterados++
 }
}
assert.equal(classificadas,classificacoes.size);assert.equal(separadas,comandos.size)
assert.equal(total,m.questoes_extraidas_unicas);assert.equal(disponiveis,m.questoes_disponiveis_resolucao)
const f=facetas.finalizar();assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),disponiveis)
const b=zlib.gzipSync(JSON.stringify(f),{level:9}),arquivo=`lotes/filtros-blocos-${sha(b).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,arquivo),b)
m.indice_facetas={arquivo,sha256:sha(b),versao:1};m.gerado_em=new Date().toISOString()
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',bases))
await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(m))
const r={gerado_em:m.gerado_em,total,disponiveis,pendentes,classificadas,separadas,lotes_alterados:lotesAlterados,bytes_lotes:bytesTotal,conflitos,publicado:false,gabaritos_textos_base_imagens_anos_preservados:true,revisao_individual_integral:false}
await fs.writeFile(`${docs}/revisao-blocos.json`,JSON.stringify(r,null,2))
await fs.writeFile(`${docs}/revisao-blocos-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(auditoria),{level:9}))
console.log(JSON.stringify(r,null,2))
