import {build} from 'vite'
import fs from 'node:fs/promises'
import path from 'node:path'
import configuracao from '../../vite.config.js'
const outDir=path.resolve('tmp/revisao-profissional/web-assets')
await build({...configuracao,configFile:false,
 plugins:configuracao.plugins.filter(plugin=>plugin.name!=='copiar-public-sem-acervo-extraido'),
 build:{...configuracao.build,outDir,rollupOptions:{input:{estudante:path.resolve('estudar.html')}}},
})
const staticDir=path.resolve('tmp/revisao-profissional/site-publicacao/.vercel/output/static')
await fs.cp(outDir,staticDir,{recursive:true,force:true})
await fs.copyFile(path.join(outDir,'estudar.html'),path.join(staticDir,'index.html'))
await import('./conferir_midia_publicacao.mjs')
console.log('Interface revisada compilada com a mídia pública já conferida.')
