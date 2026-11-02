import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {classificarPeloComando} from '../../src/classificacaoPorComando.js'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-semantica-v21'
const destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const sha=s=>createHash('sha256').update(s).digest('hex')
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
  if(q.classificacao_pendente&&q.integridade_profissional?.apta_resolucao!==false&&!q.classificacao_revisada&&!q.revisao_textual_pendente){
   const p=classificarPeloComando(q)
   if(p){
    const antes={materia:q.materia,conteudo:q.conteudo}
    q.materia=p.materia;q.conteudo=p.conteudo;q.classificacao_pendente=false
    q.classificacao_confianca=p.confianca
    q.classificacao_metodo='Revisão semântica pelo objeto/comando expresso no enunciado; regra conservadora, sem inferir pelo cargo ou por contexto alheio'
    q.classificacao_evidencia=p.evidencia
    q.classificacao_revisada={justificativa:`O enunciado identifica o objeto de conhecimento por meio do comando ou conceito “${p.evidencia}”.`,sha256_enunciado:sha(Buffer.from(q.enunciado||''))}
    for(const [obj,chave] of [[q.integridade_profissional,'pendencias'],[q.elegibilidade,'apontamentos']])if(obj?.[chave])obj[chave]=obj[chave].filter(x=>x!=='classificacao_especifica_pendente')
    q.integridade_profissional={...q.integridade_profissional,verificada_individualmente:true}
    aplicados.push({id:q.id,numero:q.numero_original,antes,depois:{materia:q.materia,conteudo:q.conteudo},evidencia:p.evidencia,metodo:q.classificacao_metodo})
    mudou=true
   }
  }
  if(q.classificacao_pendente)pendentes++
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 facetas.adicionar(i,qs)
 if(mudou){
  const bytes=zlib.gzipSync(JSON.stringify(qs),{level:9})
  const arquivo=`lotes/revisao-semantica-v21-${i}-${sha(bytes).slice(0,12)}.json.gz`
  await fs.writeFile(path.join(destino,arquivo),bytes)
  alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:qs.length,sha256:sha(bytes)})
  lote.arquivo=arquivo
 }
}
if(!aplicados.length)throw Error('Nenhuma classificação foi confirmada pela regra')
const filtro=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9})
const filtroArquivo=`lotes/filtros-revisao-semantica-v21-${sha(filtro).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,filtroArquivo),filtro)
manifesto.indice_facetas={arquivo:filtroArquivo,sha256:sha(filtro),versao:1}
manifesto.questoes_disponiveis_resolucao=disponiveis
manifesto.questoes_indisponiveis_revisao=total-disponiveis
manifesto.gerado_em=new Date().toISOString()
manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v21',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+aplicados.length}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais))
await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify({gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis,pendentes,classificadas_individualmente:aplicados.length,lotes_alterados:alterados.length,decisoes:aplicados,alteracoes:alterados,publicado:false},null,2))
console.log(JSON.stringify({total,disponiveis,pendentes,classificadas:aplicados.length,lotes:alterados.length,filtroArquivo,distribuicao:Object.entries(aplicados.reduce((a,x)=>{let k=x.depois.materia+' | '+x.depois.conteudo;a[k]=(a[k]||0)+1;return a},{})).sort((a,b)=>b[1]-a[1])},null,2))
