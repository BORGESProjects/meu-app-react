import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
const ids=new Set(process.argv.slice(2))
const raizes=['tmp/revisao-profissional/revisao-comandos/acervo-extraido','tmp/revisao-profissional/revisao-dirigida/acervo-extraido','tmp/revisao-profissional/acervo-extraido']
const m=JSON.parse(await fs.readFile(path.join(raizes[0],'manifesto.json')))
const encontrados=[]
for(const lote of m.lotes){
 let bytes
 for(const raiz of raizes){try{bytes=await fs.readFile(path.join(raiz,lote.arquivo));break}catch(e){if(e.code!=='ENOENT')throw e}}
 for(const q of JSON.parse(zlib.gunzipSync(bytes)))if(ids.has(q.id)){encontrados.push(q);ids.delete(q.id)}
 if(!ids.size)break
}
await fs.writeFile('tmp/revisao-profissional/questoes-consultadas.json',JSON.stringify(encontrados,null,2))
for(const q of encontrados)console.log(JSON.stringify({id:q.id,documento:q.documento_id,numero:q.numero,pagina:q.pagina_imagem,imagens:q.imagens_paginas,enunciado:q.enunciado,opcoes:q.opcoes,materia:q.materia,conteudo:q.conteudo}))
if(ids.size)throw Error('Não encontradas: '+[...ids])
