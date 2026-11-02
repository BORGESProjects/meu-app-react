import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {lotesAtuais} from './acervo-atual.mjs'
import {separarJustificativa} from './separar-justificativa.mjs'
const cache=new Map(),a=[],sha=b=>createHash('sha256').update(b).digest('hex')
for await(const {questoes} of lotesAtuais())for(const q of questoes){
 if(!/JUSTIFICATIVA/u.test(q.enunciado||''))continue
 const doc=q.documento_id;if(!/^[a-f0-9]{16,64}$/u.test(doc||''))continue
 if(!cache.has(doc)){try{const b=await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`);cache.set(doc,{paginas:JSON.parse(zlib.gunzipSync(b)),sha:sha(b)})}catch(e){if(e.code!=='ENOENT')throw e;cache.set(doc,null)}}
 const fonte=cache.get(doc);if(!fonte)continue
 const r=separarJustificativa(q,fonte.paginas);if(r)a.push({id:q.id,documento:doc,pagina:q.pagina,imagem:q.pagina_imagem,antes:q.enunciado,sha256_enunciado:sha(q.enunciado),fonte_sha256:fonte.sha,depois:r,gabarito:q.resposta_correta})
}
await fs.writeFile('docs/acervo/revisao-profissional/justificativas-candidatos.json.gz',zlib.gzipSync(JSON.stringify(a)))
await fs.writeFile('docs/acervo/revisao-profissional/justificativas-amostras.json',JSON.stringify([a[0],a[Math.floor(a.length/3)],a[Math.floor(a.length*2/3)],a.at(-1)],null,2))
console.log(JSON.stringify({candidatas:a.length,documentos:new Set(a.map(r=>r.documento)).size,publicado:false}))
