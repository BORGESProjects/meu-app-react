import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {lotesAtuais} from './acervo-atual.mjs'
import {separarComandoSeguinte} from './separar-comando-seguinte.mjs'
const sha=x=>createHash('sha256').update(x).digest('hex'),cache=new Map(),mudancas=[],amostras={}
for await(const {questoes} of lotesAtuais())for(const q of questoes){
 if(!/julgue/iu.test(q.enunciado||'')||q.banca!=='CEBRASPE')continue
 const doc=q.documento_id
 if(!/^[a-f0-9]{16,64}$/u.test(doc||''))continue
 if(!cache.has(doc)){
  try{const bytes=await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`);cache.set(doc,{paginas:JSON.parse(zlib.gunzipSync(bytes)),sha:sha(bytes)})}catch(e){if(e.code!=='ENOENT')throw e;cache.set(doc,null)}
 }
 const fonte=cache.get(doc);if(!fonte)continue
 const r=separarComandoSeguinte(q,fonte.paginas);if(!r)continue
 const registro={id:q.id,documento:doc,sha256_enunciado:sha(q.enunciado),antes:q.enunciado,depois:{enunciado:r.enunciado},comando_removido:r.comando_seguinte,pagina:r.pagina,imagem:q.pagina_imagem,fonte_sha256:fonte.sha,metodo:r.metodo}
 mudancas.push(registro)
 const grupo=r.comando_seguinte.split(/\s/u).slice(0,3).join(' ')
 amostras[grupo]??=[];if(amostras[grupo].length<3)amostras[grupo].push(registro)
}
await fs.writeFile('docs/acervo/revisao-profissional/comandos-pdf-candidatos.json.gz',zlib.gzipSync(JSON.stringify(mudancas)))
await fs.writeFile('docs/acervo/revisao-profissional/comandos-pdf-amostras.json',JSON.stringify(amostras,null,2))
console.log(JSON.stringify({candidatos:mudancas.length,documentos:new Set(mudancas.map(r=>r.documento)).size,grupos:Object.keys(amostras)}))
