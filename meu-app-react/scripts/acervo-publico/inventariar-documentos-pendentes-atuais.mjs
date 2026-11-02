import fs from 'node:fs/promises'
import {lerArquivoAtual,lotesAtuais} from './acervo-atual.mjs'

const manifest=JSON.parse(await lerArquivoAtual('manifesto.json'))
const docs=new Map()
for await(const {questoes} of lotesAtuais()){
 for(const q of questoes){
  if(!q.classificacao_pendente||q.classificacao_revisada||q.integridade_profissional?.apta_resolucao===false)continue
  const id=q.documento_id||'sem-documento-id'
  const d=docs.get(id)||{documento_id:id,pendentes:0,banca:q.banca||'',concurso:q.concurso||'',ano:q.ano||null,cargo:q.cargo||'',amostras:[]}
  d.pendentes++
  if(d.amostras.length<3)d.amostras.push({id:q.id,numero:q.numero_original??q.numero??null,pagina:q.pagina??null,materia:q.materia||'',conteudo:q.conteudo||'',enunciado:(q.enunciado||'').replace(/\s+/g,' ').slice(0,260),imagem:q.pagina_imagem||''})
  docs.set(id,d)
 }
}
const out=[...docs.values()].sort((a,b)=>b.pendentes-a.pendentes||a.documento_id.localeCompare(b.documento_id))
await fs.writeFile('docs/acervo/revisao-profissional/documentos-pendentes-atuais.json',JSON.stringify({inventariado_em:new Date().toISOString(),total_documentos:out.length,total_pendentes:out.reduce((n,x)=>n+x.pendentes,0),documentos:out},null,2))
console.log(JSON.stringify({total_documentos:out.length,total_pendentes:out.reduce((n,x)=>n+x.pendentes,0),proximo:out[0],proximos_documentos:out.slice(0,5).map(({documento_id,pendentes,banca,concurso,ano,cargo})=>({documento_id,pendentes,banca,concurso,ano,cargo}))},null,2))
