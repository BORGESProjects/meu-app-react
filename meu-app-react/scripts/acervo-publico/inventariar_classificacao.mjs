import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'

const root=path.resolve('public/acervo-extraido')
const manifest=JSON.parse(await fs.readFile(path.join(root,'manifesto.json')))
const summary={gerado_em:new Date().toISOString(),total:0,fontes:{},bancas:{},materias:{},conteudos:{},semAno:0,semGabarito:0,idsRepetidos:0,lotesInvalidos:[],amostras:{},concursos:{},campos:new Set()}
const ids=new Set(),increment=(obj,key)=>obj[key]=(obj[key]||0)+1
function inspect(q,source){
 summary.total++;increment(summary.fontes,source);increment(summary.bancas,q.banca||'(vazia)');increment(summary.materias,q.materia||'(vazia)');increment(summary.conteudos,q.conteudo||'(vazio)')
 if(!q.ano)summary.semAno++;if(q.resposta_correta==null&&q.resposta_soma==null)summary.semGabarito++
 const key=source+':'+q.id;if(ids.has(key))summary.idsRepetidos++;ids.add(key)
 Object.keys(q).forEach(k=>summary.campos.add(k))
 const group=source+' / '+q.banca
 if(!summary.amostras[group])summary.amostras[group]=[]
 if(summary.amostras[group].length<2)summary.amostras[group].push(q)
 const c=q.concurso||'(vazio)';summary.concursos[group]||={};increment(summary.concursos[group],c)
}
for(const lot of manifest.lotes){
 try{const data=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,lot.arquivo))));if(data.length!==lot.quantidade)throw Error('quantidade divergente');for(const q of data)inspect(q,'complementar')}
 catch(error){summary.lotesInvalidos.push({arquivo:lot.arquivo,erro:error.message})}
}
for(const q of JSON.parse(await fs.readFile('native/acervo/questoes.json')))inspect(q,'principal-instalado')
summary.campos=[...summary.campos]
await fs.mkdir('docs/acervo/revisao-profissional',{recursive:true})
await fs.writeFile('docs/acervo/revisao-profissional/inventario-inicial.json',JSON.stringify(summary,null,2))
console.log(JSON.stringify({...summary,amostras:undefined,concursos:undefined,conteudos:Object.entries(summary.conteudos).sort((a,b)=>b[1]-a[1]).slice(0,25)},null,2))
