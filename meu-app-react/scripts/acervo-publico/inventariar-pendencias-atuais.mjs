import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
const raizes=['tmp/revisao-profissional/revisao-comandos/acervo-extraido','tmp/revisao-profissional/revisao-dirigida/acervo-extraido','tmp/revisao-profissional/acervo-extraido']
const m=JSON.parse(await fs.readFile(path.join(raizes[0],'manifesto.json')))
const grupos=new Map(),amostras=[]
for(const lote of m.lotes){
 let bytes
 for(const raiz of raizes){try{bytes=await fs.readFile(path.join(raiz,lote.arquivo));break}catch(e){if(e.code!=='ENOENT')throw e}}
 if(!bytes)throw Error(lote.arquivo)
 for(const q of JSON.parse(zlib.gunzipSync(bytes))){
  if(!q.classificacao_pendente)continue
  const chave=q.materia+' | '+q.conteudo
  const g=grupos.get(chave)||{grupo:chave,quantidade:0,exemplos:[]};g.quantidade++
  if(g.exemplos.length<3)g.exemplos.push({id:q.id,documento:q.documento_id,ano:q.ano,banca:q.banca,enunciado:q.enunciado,apoio:q.texto_apoio,opcoes:q.opcoes,fonte:q.classificacao_fonte})
  grupos.set(chave,g)
 }
}
const ordenados=[...grupos.values()].sort((a,b)=>b.quantidade-a.quantidade)
await fs.writeFile('docs/acervo/revisao-profissional/pendencias-atuais-amostras.json',JSON.stringify(ordenados,null,2))
console.log(JSON.stringify(ordenados.slice(0,18),null,2))
