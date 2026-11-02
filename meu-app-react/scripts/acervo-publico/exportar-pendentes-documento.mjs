import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
const documento=process.argv[2]
const termo=(process.argv[3]||'').toLocaleLowerCase('pt-BR')
if(!documento||!termo)throw Error('Informe documento_id e parte do nome do concurso para limitar a leitura')
const m=JSON.parse(await fs.readFile(path.join(raizesAtuais[0],'manifesto.json'))),out=[]
// Use the manifest's contest metadata to avoid decompressing thousands of unrelated lots.
const registro=m.lotes.filter(l=>`${l.banca||''} ${l.concurso||''}`.toLocaleLowerCase('pt-BR').includes(termo))
const arquivos=new Set(registro.map(l=>l.arquivo)),indice=new Map()
// Index each layered acervo once. The former reader tried every root again for every lot.
for(const raiz of raizesAtuais){
  let nomes
  try{nomes=await fs.readdir(path.join(raiz,'lotes'))}catch(e){if(e.code==='ENOENT')continue;throw e}
  for(const nome of nomes){const arquivo=`lotes/${nome}`;if(arquivos.has(arquivo)&&!indice.has(arquivo))indice.set(arquivo,path.join(raiz,arquivo))}
  if(indice.size===arquivos.size)break
}
const ausentes=[...arquivos].filter(a=>!indice.has(a))
if(ausentes.length)throw Error(`Lotes do documento não encontrados: ${ausentes.length}`)
for(const lote of registro){const qs=JSON.parse(zlib.gunzipSync(await fs.readFile(indice.get(lote.arquivo))));for(const q of qs){if(q.documento_id!==documento||!q.classificacao_pendente||q.classificacao_revisada||q.integridade_profissional?.apta_resolucao===false)continue;out.push({id:q.id,numero:q.numero_original,pagina:q.pagina,ano:q.ano,materia:q.materia,conteudo:q.conteudo,enunciado:q.enunciado,apoio:q.texto_apoio,opcoes:q.opcoes,resposta:q.resposta_correta,anulada:q.anulada,imagem:q.pagina_imagem,contexto:q.contexto_paginas,banca:q.banca,concurso:q.concurso,cargo:q.cargo,tipo:q.tipo_resposta})}}
out.sort((a,b)=>(a.numero||0)-(b.numero||0));await fs.writeFile(`tmp/pendentes-documento-${documento}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify({documento,pendentes:out.length,amostras:out.slice(0,4).map(x=>({numero:x.numero,pagina:x.pagina,id:x.id,materia:x.materia,conteudo:x.conteudo,enunciado:x.enunciado?.slice(0,220)}))}))
