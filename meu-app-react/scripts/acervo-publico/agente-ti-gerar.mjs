import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {classificarTI} from './agente-ti-regras.mjs'
const docs='docs/acervo/revisao-profissional'
const qs=JSON.parse(zlib.gunzipSync(await fs.readFile(`${docs}/agente-ti-candidatos.json.gz`)))
const patches=[],grupos={}
for(const q of qs){
 const depois=classificarTI(q)
 if(!depois)continue
 const antes={materia:q.materia,conteudo:q.conteudo,classificacao_pendente:q.classificacao_pendente}
 const item={id:q.id,sha256_enunciado:createHash('sha256').update(String(q.enunciado||'')).digest('hex'),antes,depois,motivo:`${depois.classificacao_evidencia}; classificação pelo enunciado e não por cargo ou texto-base.`}
 patches.push(item)
 const chave=`${depois.materia} | ${depois.conteudo}`
 ;(grupos[chave]??=[]).push({id:q.id,enunciado:q.enunciado,antes,evidencia:depois.classificacao_evidencia,documento:q.documento_id})
}
const amostras=Object.fromEntries(Object.entries(grupos).map(([k,vs])=>[k,{quantidade:vs.length,amostra:vs.filter((v,i)=>new Set([0,1,2,Math.floor(vs.length/3),Math.floor(vs.length*2/3),vs.length-1]).has(i))}]))
await fs.writeFile(`${docs}/agente-ti-patches.json.gz`,zlib.gzipSync(JSON.stringify(patches),{level:9}))
await fs.writeFile(`${docs}/agente-ti-amostras.json`,JSON.stringify(amostras,null,2))
const r={data:new Date().toISOString(),pendentes_lidos:qs.length,patches:patches.length,grupos:Object.fromEntries(Object.entries(grupos).map(([k,v])=>[k,v.length])),publicado:false,altera_somente:['materia','conteudo','classificacao_pendente','classificacao_confianca','classificacao_metodo','classificacao_evidencia'],revisao_individual_de_todos:false}
await fs.writeFile(`${docs}/agente-ti-relatorio.json`,JSON.stringify(r,null,2))
console.log(JSON.stringify(r,null,2))
