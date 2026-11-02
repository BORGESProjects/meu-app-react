import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-semantica-v20'
const destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const sha=s=>createHash('sha256').update(s).digest('hex')
const revisoes=JSON.parse(await fs.readFile('tmp/candidatos-classificacao-v20.json','utf8')).filter(c=>c.id!=='extr-2be6be979329dc5741fa')
const porId=new Map(revisoes.map(c=>[c.id,c]))
await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json',raizesAtuais))
const facetas=criarIndiceFacetas(),alterados=[],aplicados=[]
let total=0,pendentes=0,disponiveis=0
for(let i=0;i<manifesto.lotes.length;i++){
 const lote=manifesto.lotes[i]
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,raizesAtuais)))
 let mudou=false
 for(const q of qs){
  total++
  const r=porId.get(q.id)
  if(r){
   if(!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||q.enunciado!==r.enunciado||q.materia!==r.antes.materia||q.conteudo!==r.antes.conteudo)throw Error(`Evidência ou estado mudou desde a revisão: ${q.id}`)
   q.materia=r.depois.materia;q.conteudo=r.depois.conteudo;q.classificacao_pendente=false
   q.classificacao_confianca=0.9
   q.classificacao_metodo='Revisão semântica individual por sinal textual específico do enunciado; sem inferir a partir do cargo ou de outra questão'
   q.classificacao_evidencia=r.evidencia
   q.classificacao_revisada={justificativa:`O objeto de conhecimento está explicitamente identificado no enunciado (${r.evidencia}).`,sha256_enunciado:sha(Buffer.from(q.enunciado||''))}
   for(const [obj,chave] of [[q.integridade_profissional,'pendencias'],[q.elegibilidade,'apontamentos']])if(obj?.[chave])obj[chave]=obj[chave].filter(p=>p!=='classificacao_especifica_pendente')
   q.integridade_profissional={...q.integridade_profissional,verificada_individualmente:true}
   aplicados.push({id:q.id,numero:q.numero_original,antes:r.antes,depois:r.depois,evidencia:r.evidencia})
   mudou=true
  }
  if(q.classificacao_pendente)pendentes++
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 facetas.adicionar(i,qs)
 if(mudou){
  const bytes=zlib.gzipSync(JSON.stringify(qs),{level:9})
  const arquivo=`lotes/revisao-semantica-v20-${i}-${sha(bytes).slice(0,12)}.json.gz`
  await fs.writeFile(path.join(destino,arquivo),bytes)
  alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:qs.length,sha256:sha(bytes)})
  lote.arquivo=arquivo
 }
}
if(aplicados.length!==revisoes.length)throw Error(`Esperadas ${revisoes.length} classificações, aplicadas ${aplicados.length}`)
const filtro=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9})
const filtroArquivo=`lotes/filtros-revisao-semantica-v20-${sha(filtro).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,filtroArquivo),filtro)
manifesto.indice_facetas={arquivo:filtroArquivo,sha256:sha(filtro),versao:1}
manifesto.questoes_disponiveis_resolucao=disponiveis
manifesto.questoes_indisponiveis_revisao=total-disponiveis
manifesto.gerado_em=new Date().toISOString()
manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v20',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+aplicados.length}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais))
await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify({gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis,pendentes,classificadas_individualmente:aplicados.length,lotes_alterados:alterados.length,excluida_por_ambiguidade:'extr-2be6be979329dc5741fa',decisoes:aplicados,alteracoes:alterados,publicado:false},null,2))
console.log(JSON.stringify({total,disponiveis,pendentes,classificadas:aplicados.length,lotes:alterados.length,arquivos:alterados.map(x=>x.arquivo),filtroArquivo},null,2))
