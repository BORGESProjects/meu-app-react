import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-semantica-v22'
const destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const sha=s=>createHash('sha256').update(s).digest('hex')
const decisoes=new Map([
 ['extr-ec2a23d1c3b6f46b52f2',{materia:'Administração Pública',conteudo:'Governança e políticas públicas',evidencia:'O item trata explicitamente da geração de valor na gestão pública e de resultados para as partes interessadas.',hashEnunciado:'A geração de valor na gestão pública consiste em gerenciar de forma a alcançar resultados consistentes, assegurando-se, para todas as partes interessadas, a primazia do aumento do valor intangível sobre o tangível.'}],
 ['extr-4b75e058634089ab299e',{materia:'Engenharia Civil',conteudo:'Materiais de construção: aço para armaduras e concreto armado',evidencia:'CA-60 é uma classe de aço para armaduras de concreto; resistência ao escoamento e aplicação em vigas/pilares situam o item em materiais e estruturas de concreto armado.',hashEnunciado:'O aço CA -60, devido à sua resistência característica ao escoamento, é preferencialmente utilizado como armadura longitudinal principal em vigas e pilares de concreto armado.'}],
])
await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json',raizesAtuais))
const facetas=criarIndiceFacetas(),alterados=[],aplicados=[]
let total=0,pendentes=0,disponiveis=0
for(let i=0;i<manifesto.lotes.length;i++){
 const lote=manifesto.lotes[i],qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,raizesAtuais)))
 let mudou=false
 for(const q of qs){
  total++
  const r=decisoes.get(q.id)
  if(r){
   if(!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||String(q.enunciado||'').normalize('NFKC').replace(/\s+/gu,' ').trim()!==r.hashEnunciado)throw Error(`Evidência mudou ou questão inelegível: ${q.id}`)
   const antes={materia:q.materia,conteudo:q.conteudo}
   q.materia=r.materia;q.conteudo=r.conteudo;q.classificacao_pendente=false
   q.classificacao_confianca=0.96
   q.classificacao_metodo='Revisão manual semântica; compatibilidade do conceito verificada no enunciado'
   q.classificacao_evidencia=r.evidencia
   q.classificacao_revisada={justificativa:r.evidencia,sha256_enunciado:sha(Buffer.from(q.enunciado||''))}
   for(const [obj,chave] of [[q.integridade_profissional,'pendencias'],[q.elegibilidade,'apontamentos']])if(obj?.[chave])obj[chave]=obj[chave].filter(x=>x!=='classificacao_especifica_pendente')
   q.integridade_profissional={...q.integridade_profissional,verificada_individualmente:true}
   aplicados.push({id:q.id,numero:q.numero_original,antes,depois:{materia:q.materia,conteudo:q.conteudo},evidencia:r.evidencia})
   mudou=true
  }
  if(q.classificacao_pendente)pendentes++
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 facetas.adicionar(i,qs)
 if(mudou){
  const bytes=zlib.gzipSync(JSON.stringify(qs),{level:9})
  const arquivo=`lotes/revisao-semantica-v22-${i}-${sha(bytes).slice(0,12)}.json.gz`
  await fs.writeFile(path.join(destino,arquivo),bytes)
  alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:qs.length,sha256:sha(bytes)})
  lote.arquivo=arquivo
 }
}
if(aplicados.length!==decisoes.size)throw Error(`Esperadas ${decisoes.size} decisões, aplicadas ${aplicados.length}`)
const filtro=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9}),filtroArquivo=`lotes/filtros-revisao-semantica-v22-${sha(filtro).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,filtroArquivo),filtro)
manifesto.indice_facetas={arquivo:filtroArquivo,sha256:sha(filtro),versao:1}
manifesto.questoes_disponiveis_resolucao=disponiveis;manifesto.questoes_indisponiveis_revisao=total-disponiveis;manifesto.gerado_em=new Date().toISOString()
manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v22',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+aplicados.length}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify({gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis,pendentes,classificadas_individualmente:aplicados.length,lotes_alterados:alterados.length,decisoes:aplicados,alteracoes:alterados,publicado:false},null,2))
console.log(JSON.stringify({total,disponiveis,pendentes,classificadas:aplicados.length,lotes:alterados.length,filtroArquivo,decisoes:aplicados},null,2))
