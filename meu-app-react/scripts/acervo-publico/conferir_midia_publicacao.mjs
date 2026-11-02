import fs from 'node:fs/promises'
import path from 'node:path'
const source=path.resolve('public'),target=path.resolve('tmp/revisao-profissional/site-publicacao/.vercel/output/static')
const files=[]
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){
 const full=path.join(dir,entry.name),relative=path.relative(source,full)
 if(relative.split(path.sep)[0]==='acervo-extraido')continue
 if(entry.isDirectory())await walk(full)
 else if(entry.isFile())files.push({full,relative})
}}
await walk(source)
let next=0,copied=0,totalBytes=0
await Promise.all(Array.from({length:24},async()=>{while(next<files.length){
 const {full,relative}=files[next++],to=path.join(target,relative),stat=await fs.stat(full)
 let current;try{current=await fs.stat(to)}catch(error){if(error.code!=='ENOENT')throw error}
 if(!current||current.size!==stat.size){await fs.mkdir(path.dirname(to),{recursive:true});await fs.copyFile(full,to);copied++}
 if((await fs.stat(to)).size!==stat.size)throw Error('Mídia incompleta: '+relative)
 totalBytes+=stat.size
}}))
const report={arquivos_conferidos:files.length,arquivos_completados:copied,bytes:totalBytes,acervo_pesado_excluido:true}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-midia-publicacao.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
