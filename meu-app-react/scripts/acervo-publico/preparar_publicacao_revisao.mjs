import fs from 'node:fs/promises'
import path from 'node:path'
const destino=path.resolve('tmp/revisao-profissional/site-publicacao')
const output=path.join(destino,'.vercel/output')
if(!destino.startsWith(path.resolve('tmp')+path.sep))throw Error('Destino inválido')
await fs.mkdir(output,{recursive:true})
await fs.cp('dist',path.join(output,'static'),{recursive:true,force:true})
// Esta entrega publica a área de estudo; a página comercial segue separada.
await fs.copyFile('dist/estudar.html',path.join(output,'static/index.html'))
const config=JSON.parse(await fs.readFile('vercel.json'))
const routes=config.headers.map(rule=>({src:rule.source,headers:Object.fromEntries(rule.headers.map(h=>[h.key,h.value])),continue:true}))
routes.push({handle:'filesystem'})
await fs.writeFile(path.join(output,'config.json'),JSON.stringify({version:3,routes}))
await import('./conferir_midia_publicacao.mjs')
console.log(destino)
