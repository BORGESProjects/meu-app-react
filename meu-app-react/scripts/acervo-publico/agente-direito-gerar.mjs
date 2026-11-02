import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {classificarDireito} from './agente-direito-classificador.mjs'
const dirs=['revisao-objetos-v2/acervo-extraido','revisao-comandos/acervo-extraido','revisao-dirigida/acervo-extraido','acervo-extraido'].map(s=>'tmp/revisao-profissional/'+s)
const manifest=JSON.parse(await fs.readFile(path.join(dirs[0],'manifesto.json')))
const patches=[],groups={},samples={}
for(const lote of manifest.lotes){
 let buf
 for(const dir of dirs){try{buf=await fs.readFile(path.join(dir,lote.arquivo));break}catch(e){if(e.code!=='ENOENT')throw e}}
 if(!buf)throw Error(lote.arquivo)
 for(const q of JSON.parse(zlib.gunzipSync(buf))){
  const c=classificarDireito(q);if(!c)continue
  const {regra,...depois}=c
  const p={id:q.id,sha256_enunciado:createHash('sha256').update(String(q.enunciado||'')).digest('hex'),antes:{materia:q.materia,conteudo:q.conteudo,classificacao_pendente:q.classificacao_pendente},depois,motivo:regra+': '+c.classificacao_evidencia}
  patches.push(p);groups[regra]=(groups[regra]||0)+1
  samples[regra]??=[]
  if(samples[regra].length<5)samples[regra].push({id:q.id,enunciado:q.enunciado,antes:p.antes,materia:c.materia,conteudo:c.conteudo,evidencia:c.classificacao_evidencia})
 }
}
const out='docs/acervo/revisao-profissional/agente-direito'
await fs.writeFile(out+'-patches.json.gz',zlib.gzipSync(JSON.stringify(patches),{level:9}))
await fs.writeFile(out+'-amostras.json',JSON.stringify(samples,null,2))
await fs.writeFile(out+'-relatorio.json',JSON.stringify({gerado_em:new Date().toISOString(),total:patches.length,grupos:groups,publicado:false,revisao_individual:false,criterio:'Somente enunciado; descartados conflitos entre disciplinas, múltiplos temas, comandos linguísticos e enunciados longos/mistos.',campos_alterados:['materia','conteudo','classificacao_evidencia','classificacao_confianca','classificacao_metodo','classificacao_pendente'],referencias_taxonomia:['https://www.qconcursos.com/questoes-de-concursos/disciplinas/direito-direito-administrativo/','https://www.qconcursos.com/questoes-de-concursos/disciplinas/administracao-administracao-financeira-e-orcamentaria']},null,2))
console.log(JSON.stringify({total:patches.length,groups},null,2))
