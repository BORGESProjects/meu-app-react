import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
const raiz='public/acervo-extraido',manifest=JSON.parse(await fs.readFile(raiz+'/manifesto.json'))
const catalogo=new Map(),nomes=new Map(),documentos=new Map()
const correcoes=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/correcoes-fontes.json')).documentos
for(const nome of await fs.readdir('public/acervo-provas'))if(nome.endsWith('.json')){
 const dados=JSON.parse(await fs.readFile('public/acervo-provas/'+nome));if(!Array.isArray(dados))continue
 for(const doc of dados){catalogo.set(doc.id,doc);const nome=String(doc.arquivo||'').toLowerCase();if(!nomes.has(nome))nomes.set(nome,[]);nomes.get(nome).push(doc)}
}
for(const lote of manifest.lotes){
 for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(raiz,lote.arquivo))))){
  const id=q.documento_id||q.documento_origem;if(!id)continue
  if(!documentos.has(id)){
   let ref=catalogo.get(id)
   const homonimos=nomes.get(String(q.documento_origem||'').toLowerCase())||[]
   if(!ref&&new Set(homonimos.map(x=>x.url)).size===1)ref=homonimos[0]
   const correcao=correcoes[id]||{}
   const url=correcao.fonte||q.fonte||ref?.url||''
   documentos.set(id,{id,url,arquivo:q.documento_origem,banca:q.banca,concurso:ref?.concurso||q.concurso,ano_catalogo:correcao.ano||ref?.ano||null,tipo_catalogo:ref?.tipo||'',pagina_catalogo:correcao.fonte_catalogo||ref?.pagina||'',questoes:[]})
  }
  documentos.get(id).questoes.push({id:q.id,numero:q.numero_original,pagina:q.pagina,paginas:q.paginas_origem||[],trecho:String(q.enunciado||'').slice(0,220),alternativas:q.opcoes?.length})
 }
}
const lista=[...documentos.values()]
await fs.writeFile('docs/acervo/revisao-profissional/fontes-documentais.json',JSON.stringify(lista))
const resumo={documentos:lista.length,comUrl:lista.filter(d=>d.url.startsWith('https://')).length,semUrl:lista.filter(d=>!d.url).length,comAnoCatalogo:lista.filter(d=>d.ano_catalogo).length,questoes:lista.reduce((n,d)=>n+d.questoes.length,0)}
console.log(JSON.stringify(resumo))
