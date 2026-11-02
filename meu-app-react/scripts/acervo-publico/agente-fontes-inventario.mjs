import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
const raiz='tmp/revisao-profissional/'
const dirs=['revisao-objetos-v2/acervo-extraido','revisao-comandos/acervo-extraido','revisao-dirigida/acervo-extraido','acervo-extraido'].map(x=>raiz+x)
const m=JSON.parse(await fs.readFile(path.join(dirs[0],'manifesto.json')))
const catalogo=new Map(JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json')).map(x=>[x.id,x]))
const grupos=new Map()
const tabelas=new Map((await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).trim().split('\n').map(JSON.parse).map(x=>[x.documento_id,x]))
const foco=/ESA|EsPCEx|IME|ITA|EEAR|EAM|Naval|ENEM|ENADE|ENCCEJA|ENAMED|REVALIDA|SAEB|PND/
for(const lote of m.lotes){
 let b
 for(const dir of dirs){try{b=await fs.readFile(path.join(dir,lote.arquivo));break}catch(e){if(e.code!=='ENOENT')throw e}}
 for(const q of JSON.parse(zlib.gunzipSync(b))){
  if(!foco.test(q.banca)||q.integridade_profissional?.apta_resolucao===false)continue
  if(q.ano&&q.gabarito_oficial)continue
  const d=catalogo.get(q.documento_id),t=tabelas.get(q.documento_id)
  const g=grupos.get(q.documento_id)||{id:q.documento_id,banca:q.banca,ano:q.ano,total:0,semAno:0,semGabarito:0,url:d?.url,arquivo:d?.arquivo,catalogo:d?.ano_catalogo,concurso:d?.concurso,gabarito:t?.status,amostras:[]}
  g.total++;if(!q.ano)g.semAno++;if(!q.gabarito_oficial)g.semGabarito++
  if(g.amostras.length<2)g.amostras.push({id:q.id,numero:q.numero_original,pagina:q.pagina,enunciado:q.enunciado.slice(0,300),opcoes:q.opcoes,fonte:q.fonte})
  grupos.set(q.documento_id,g)
 }
}
const saida=[...grupos.values()].sort((a,b)=>(b.semAno-a.semAno)||(b.semGabarito-a.semGabarito))
await fs.writeFile('docs/acervo/revisao-profissional/agente-fontes-inventario.json',JSON.stringify(saida,null,2))
console.log(JSON.stringify(saida.slice(0,12),null,2))
