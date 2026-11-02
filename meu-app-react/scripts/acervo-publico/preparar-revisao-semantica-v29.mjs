import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-semantica-v29'
const destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const sha=v=>createHash('sha256').update(v).digest('hex')
const candidatos=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/modalidade-discursiva-ce-candidatos-v29.json','utf8'))
const ids=new Set(candidatos.strictIds)
if(ids.size!==2136)throw Error(`Esperados 2.136 casos estritos, encontrados ${ids.size}`)
if(!destino.startsWith(path.resolve('tmp')+path.sep))throw Error('Destino fora da área temporária')
await fs.rm(destino,{recursive:true,force:true})
await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json',raizesAtuais))
const facetas=criarIndiceFacetas(),alterados=[],aplicados=[]
let total=0,pending=0,available=0
const permitidas=new Set(['discursiva_fora_do_escopo','classificacao_especifica_pendente','gabarito_oficial_nao_vinculado'])
for(let i=0;i<manifesto.lotes.length;i++){
 const lote=manifesto.lotes[i]
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,raizesAtuais)))
 let mudou=false
 for(const q of qs){
  total++
  if(ids.has(q.id)){
   const opcoes=q.opcoes||[]
   const issues=q.integridade_profissional?.pendencias||[]
   if(q.tipo_resposta!=='discursiva'||opcoes.length!==2||!/^certo$/iu.test(opcoes[0])||!/^errado$/iu.test(opcoes[1])||q.documento_auxiliar||issues.some(x=>!permitidas.has(x)))throw Error(`Questão não atende aos critérios da correção segura: ${q.id}`)
   const antes={tipo_resposta:q.tipo_resposta,apta_resolucao:q.integridade_profissional?.apta_resolucao}
   q.tipo_resposta='certo_errado'
   for(const [o,k] of [[q.integridade_profissional,'pendencias'],[q.elegibilidade,'apontamentos']])if(o?.[k])o[k]=o[k].filter(x=>x!=='discursiva_fora_do_escopo')
   const remaining=q.integridade_profissional?.pendencias||[]
   const apta=!remaining.some(x=>/enunciado_ausente|alternativas_invalida|alternativa_vazia|discursiva_|multiplas_questoes|texto_corrompido|texto_de_outro_bloco|visual_ausente|documento_auxiliar/u.test(x))
   const corr=apta&&!q.anulada&&(q.resposta_correta!=null||q.resposta_soma!=null||q.gabarito_oficial)
   q.integridade_profissional={...q.integridade_profissional,apta_resolucao:apta,correcao_automatica:Boolean(corr),verificada_individualmente:true}
   q.elegibilidade={...q.elegibilidade,elegivel_para_resolucao:apta,elegivel_para_correcao_automatica:Boolean(corr)}
   q.revisao_tipo_resposta={metodo:'Conferência do texto da página-fonte: comando de julgamento objetivo, opções Certo/Errado, sem marcador discursivo local; enunciado passou validação estrutural.',evidencia:'A página da prova delimita o bloco como itens objetivos de julgamento; a questão aparece no bloco correspondente e não como critério de correção discursiva.'}
   aplicados.push({id:q.id,antes,depois:{tipo_resposta:q.tipo_resposta,apta_resolucao:apta},classificacao_pendente_permanece:Boolean(q.classificacao_pendente)})
   mudou=true
  }
  if(q.classificacao_pendente)pending++
  if(q.integridade_profissional?.apta_resolucao!==false)available++
 }
 facetas.adicionar(i,qs)
 if(mudou){const bytes=zlib.gzipSync(JSON.stringify(qs),{level:9}),arquivo=`lotes/${nome}-${i}-${sha(bytes).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,arquivo),bytes);alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:qs.length,sha256:sha(bytes)});lote.arquivo=arquivo}
}
if(aplicados.length!==ids.size)throw Error(`Esperadas ${ids.size}; aplicadas ${aplicados.length}`)
const filtros=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9}),filtroArquivo=`lotes/filtros-${nome}-${sha(filtros).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,filtroArquivo),filtros)
manifesto.indice_facetas={arquivo:filtroArquivo,sha256:sha(filtros),versao:1}
manifesto.questoes_disponiveis_resolucao=available
manifesto.questoes_indisponiveis_revisao=total-available
manifesto.gerado_em=new Date().toISOString()
manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v29',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+aplicados.length}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais))
await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
const rel={gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis:available,pendentes:pending,classificadas_individualmente:aplicados.length,lotes_alterados:alterados.length,decisoes:aplicados,alteracoes:alterados,publicado:false,observacao:'A correção de tipo de resposta não resolve a classificação específica de matéria/conteúdo nem cria gabarito; esses campos permanecem pendentes quando assim estavam.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(rel,null,2))
console.log(JSON.stringify({total,disponiveis:available,pendentes:pending,revisadas:aplicados.length,lotes:alterados.length},null,2))
