import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
const roots=['revisao-objetos-v2/acervo-extraido','revisao-comandos/acervo-extraido','revisao-dirigida/acervo-extraido','acervo-extraido'].map(p=>path.join('tmp/revisao-profissional',p))
const manifest=JSON.parse(await fs.readFile(path.join(roots[0],'manifesto.json')))
const candidatos=[]
for(const lot of manifest.lotes){
 let b
 for(const root of roots){try{b=await fs.readFile(path.join(root,lot.arquivo));break}catch(e){if(e.code!=='ENOENT')throw e}}
 for(const q of JSON.parse(zlib.gunzipSync(b))){
  if(!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||q.classificacao_revisada)continue
  candidatos.push(Object.fromEntries(['id','enunciado','materia','conteudo','classificacao_pendente','documento_id','classificacao_fonte'].map(k=>[k,q[k]])))
 }
}
await fs.writeFile('docs/acervo/revisao-profissional/agente-ti-candidatos.json.gz',zlib.gzipSync(JSON.stringify(candidatos)))
for(const area of ['Informática','Administração','Administração Pública','Arquivologia','Biblioteconomia']){
 const qs=candidatos.filter(q=>q.materia===area)
 console.log(area,qs.length)
 for(let i=0;i<25&&qs.length;i++){const q=qs[Math.floor(i*qs.length/25)];console.log(JSON.stringify({id:q.id,enunciado:q.enunciado}))}
}
