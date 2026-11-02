import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {raizesAtuais as raizes} from './acervo-atual.mjs'
const manifesto=JSON.parse(await fs.readFile(path.join(raizes[0],'manifesto.json')))
const grupos={},ids=new Set(),r={registros:0,pendentes_classificacao:0,sem_ano:0,sem_dificuldade:0,dificuldade_estimada:0,sem_gabarito:0,inaptas:0,por_aplicacao:grupos}
function conferir(q){
 if(ids.has(q.id))throw Error('ID duplicado: '+q.id);ids.add(q.id)
 const g=grupos[q.banca||'Sem aplicação']??={total:0,pendentes:0,sem_ano:0,sem_dificuldade:0,inaptas:0}
 r.registros++;g.total++
 if(q.classificacao_pendente){r.pendentes_classificacao++;g.pendentes++}
 if(!/^\d{4}$/.test(String(q.ano||''))){r.sem_ano++;g.sem_ano++}
 if(!q.dificuldade){r.sem_dificuldade++;g.sem_dificuldade++}
 if(q.dificuldade_estimada)r.dificuldade_estimada++
 if(q.resposta_correta==null&&q.resposta_soma==null&&!q.gabarito_oficial)r.sem_gabarito++
 if(q.integridade_profissional?.apta_resolucao===false){r.inaptas++;g.inaptas++}
}
for(const lote of manifesto.lotes){
 let bytes
 for(const raiz of raizes){try{bytes=await fs.readFile(path.join(raiz,lote.arquivo));break}catch(e){if(e.code!=='ENOENT')throw e}}
 const qs=JSON.parse(zlib.gunzipSync(bytes))
 if(qs.length!==lote.quantidade)throw Error('Contagem divergente: '+lote.arquivo)
 qs.forEach(conferir)
}
for(const q of JSON.parse(await fs.readFile('tmp/revisao-profissional/principal-revisado.json')))conferir(q)
r.verificacao='Cobertura estrutural e metadados, não certificação individual de todas as questões'
await fs.writeFile('docs/acervo/revisao-profissional/cobertura-atual.json',JSON.stringify(r,null,2))
console.log(JSON.stringify({...r,por_aplicacao:undefined},null,2))
