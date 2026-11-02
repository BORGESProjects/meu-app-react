import fs from 'node:fs/promises'
const docs=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json'))
const catalogo=[]
for(const file of await fs.readdir('public/acervo-provas'))if(file.endsWith('.json')){const d=JSON.parse(await fs.readFile('public/acervo-provas/'+file));if(Array.isArray(d))catalogo.push(...d)}
const definitivo=d=>/gabarito|gab[_ -]|[_ -]gb[_ -]/iu.test(d.tipo+' '+d.arquivo)&&!/preliminar/iu.test(d.tipo+' '+d.arquivo)
const nome=d=>String(d.arquivo||'').replace(/\.pdf$/iu,'').toLowerCase()
const candidatos=[]
for(const doc of docs){
 const base=nome(doc)
 if(base.length<8)continue
 const matches=catalogo.filter(d=>definitivo(d)&&d.url&&d.banca===doc.banca&&(
  (d.concurso===doc.concurso&&nome(d).includes(base))||
  (doc.banca==='INEP'&&/_pv_/u.test(base)&&nome(d)===base.replace('_pv_','_gb_'))))
 const unicos=[...new Map(matches.map(d=>[d.url,d])).values()]
 if(unicos.length===1)candidatos.push({documento_id:doc.id,arquivo_prova:doc.arquivo,prova_url:doc.url,gabarito_url:unicos[0].url,arquivo_gabarito:unicos[0].arquivo,tipo:unicos[0].tipo,criterio:'mesmo identificador completo de caderno no catálogo oficial'})
}
await fs.writeFile('docs/acervo/revisao-profissional/gabaritos-candidatos.json',JSON.stringify(candidatos,null,2))
console.log(JSON.stringify({candidatos:candidatos.length,questoes:docs.filter(d=>candidatos.some(c=>c.documento_id===d.id)).reduce((s,d)=>s+d.questoes.length,0)}))
