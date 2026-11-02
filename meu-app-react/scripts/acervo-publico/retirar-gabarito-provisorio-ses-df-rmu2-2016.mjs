import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { createHash } from 'node:crypto'

const root='tmp/revisao-profissional/revisao-ses-df-residencia-medica-intensiva-2016-2-pendencias-v273/acervo-extraido'
const manifest=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8'))
const lots=manifest.lotes.filter(x=>x.arquivo.includes('revisao-ses-df-residencia-medica-intensiva-2016-2-pendencias-v273-'))
let total=0
for(const entry of lots){
 const file=path.join(root,entry.arquivo),questions=JSON.parse(zlib.gunzipSync(await fs.readFile(file)))
 for(const q of questions){
  if(!q.classificacao_revisada||q.concurso?.includes('SES/DF')!==true)continue
  delete q.gabarito_oficial
  q.resposta_correta=null
  q.integridade_profissional={...(q.integridade_profissional||{}),correcao_automatica:false,pendencias:[...new Set([...(q.integridade_profissional?.pendencias||[]),'gabarito_definitivo_nao_localizado'])]}
  q.elegibilidade={...(q.elegibilidade||{}),elegivel_para_correcao_automatica:false,apontamentos:[...new Set([...(q.elegibilidade?.apontamentos||[]),'gabarito_definitivo_nao_localizado'])]}
  total++
 }
 const bytes=zlib.gzipSync(JSON.stringify(questions),{level:9}),hash=createHash('sha256').update(bytes).digest('hex')
 const next=`lotes/revisao-ses-df-med-intensiva-2016-sem-gab-def-${entry.arquivo.split('-').slice(-2).join('-').replace(/\.json\.gz$/,'')}-${hash.slice(0,12)}.json.gz`
 await fs.writeFile(path.join(root,next),bytes)
 entry.arquivo=next
}
if(total!==85)throw Error(`Esperava 85 questões; atualizei ${total}`)
manifest.gerado_em=new Date().toISOString()
await fs.writeFile(path.join(root,'manifesto.json'),JSON.stringify(manifest))
console.log(JSON.stringify({questoes:total,lotes:lots.length,gabarito:'não definitivo; resposta removida e correção automática desativada'}))
