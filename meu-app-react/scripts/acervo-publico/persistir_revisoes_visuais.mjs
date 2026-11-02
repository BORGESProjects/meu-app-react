import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import path from 'node:path'
import {hashTextoVisual, aplicarRevisaoVisual} from './aplicar_revisao_visual.mjs'
const docs='docs/acervo/revisao-profissional'
const pasta='tmp/revisao-profissional/revisao-comandos/acervo-extraido'
const mudancas=JSON.parse(zlib.gunzipSync(await fs.readFile(`${docs}/revisao-comandos-alteracoes.json.gz`))).filter(r=>r.tipo==='transcricao_visual')
const encontrados=new Map()
for(const nome of await fs.readdir(`${pasta}/lotes`)){
 if(!nome.startsWith('comandos-'))continue
 for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(pasta,'lotes',nome)))))if(mudancas.some(r=>r.id===q.id))encontrados.set(q.id,q)
}
const revisoes=mudancas.map(r=>{
 const q=encontrados.get(r.id)
 if(!q)throw Error('Questão ausente: '+r.id)
 const campos=Object.fromEntries(['enunciado','opcoes','blocos_opcoes','materia','conteudo','ano','dificuldade','dificuldade_estimada','dificuldade_justificativa','classificacao_pendente','revisao_visual'].filter(k=>q[k]!==undefined).map(k=>[k,q[k]]))
 const item={id:q.id,sha256_antes:hashTextoVisual(r.antes),sha256_depois:hashTextoVisual(q),campos}
 aplicarRevisaoVisual({id:q.id,...r.antes},[item])
 return item
})
if(revisoes.length!==4)throw Error('Revisões incompletas')
await fs.writeFile(`${docs}/revisoes-visuais-persistentes.json`,JSON.stringify(revisoes,null,2))
console.log(`${revisoes.length} revisões preservadas com validação do texto de origem`)
