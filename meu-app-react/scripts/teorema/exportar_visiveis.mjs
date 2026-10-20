import fs from 'node:fs'
import {execFileSync} from 'node:child_process'
import {unirQuestoes} from '../../src/acervo.js'

// Local read-only bank snapshots plus the archives already tracked in Git.
// Apply the same visibility/deduplication rules as the public application.
const files=execFileSync('git',['ls-files','public/acervo/*/questoes.json'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean)
files.push('tmp/teorema-180-revisao/acervo-existente-0.json','tmp/teorema-180-revisao/acervo-existente-1.json')
const all=files.flatMap(path=>{
  const data=JSON.parse(fs.readFileSync(path,'utf8'))
  const rows=Array.isArray(data)?data:(data.questoes||[])
  return rows.map((q,index)=>q.id?q:{...q,id:`snapshot-${path}-${index}`})
})
const visible=unirQuestoes(all)
fs.writeFileSync('tmp/teorema-180-revisao/acervo-visivel-anterior.json',JSON.stringify(visible))
console.log(JSON.stringify({registros:all.length,visiveis:visible.length}))
