import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-semantica-v19'
const destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const hash=b=>createHash('sha256').update(b).digest('hex')
const ids=new Set([
 'extr-70f98e08c86b6ff4f92e','extr-eb2fd88128f9f29c7a48','extr-13328e09d4a6b973f77b','extr-f48233c106d33c5b2958','extr-11ffd83488eac45e7fc3',
 'extr-6a2b70fdbfba14a39310','extr-6212ebc66b78ecb0b3e0','extr-5b2f296f8338560648b6','extr-eaee4f49775e87c3a028','extr-3084e1341778d6d28862','extr-b13d0b587c97f7e73cc4'
])
await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json',raizesAtuais))
const facetas=criarIndiceFacetas(),alterados=[],revisados=[]
let total=0,pendentes=0,disponiveis=0
let textoOpenAI='',textoQatar=''
for(let i=0;i<manifesto.lotes.length;i++){
 const lote=manifesto.lotes[i]
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,raizesAtuais)))
 let mudou=false
 const porId=new Map(qs.map(q=>[q.id,q]))
 // Usa o texto já extraído da página original e só delimita o trecho pertencente a cada bloco.
 for(const q of qs){
  if(q.id==='extr-70f98e08c86b6ff4f92e'){
   const pool=`${q.enunciado||''}\n${q.texto_apoio||''}`
   const start=pool.indexOf('OpenAI, the company that owns ChatGPT')
   if(start<0)throw Error('Texto-base OpenAI não encontrado para a questão 46')
   const tail=pool.slice(start)
   const end=tail.search(/\nAccording to the preceding text, judge the following items\./iu)
   if(end<0)throw Error('Limite do texto-base OpenAI não encontrado')
   textoOpenAI=tail.slice(0,end).trim()
  }
  if(q.id==='extr-6a2b70fdbfba14a39310'){
   const start=(q.enunciado||'').indexOf('Qatar has made itself into the diplomatic capital')
   const end=(q.enunciado||'').indexOf('About the preceding text, judge the following items.',start)
   if(start<0||end<0)throw Error('Texto-base Qatar não delimitado na questão 135')
   textoQatar=q.enunciado.slice(start,end).trim()
  }
 }
 for(const q of qs){
  total++
  if(ids.has(q.id)){
   const before={materia:q.materia,conteudo:q.conteudo,enunciado:q.enunciado,texto_apoio:q.texto_apoio,classificacao_pendente:q.classificacao_pendente}
   if(q.id.startsWith('extr-70f98')){
    const m=q.enunciado.search(/\nCEBRASPE\s*[–-]\s*FAPEAL\s*[–-]\s*Edital:/iu)
    if(m<0||!textoOpenAI)throw Error('Não foi possível separar o item 46 do texto-base')
    q.enunciado=q.enunciado.slice(0,m).trim();q.texto_apoio=textoOpenAI
   } else if(q.id==='extr-6a2b70fdbfba14a39310'){
    const m=q.enunciado.indexOf('\nQatar has made itself into the diplomatic capital')
    if(m<0)throw Error('Questão 135 não contém a contaminação esperada')
    q.enunciado=q.enunciado.slice(0,m).trim()
   } else if(q.id==='extr-11ffd83488eac45e7fc3'){
    q.enunciado=q.enunciado.split(/\n(?:47 In the excerpt|48 The text discusses|49 The text indicates)\b/iu)[0].replace(/\nEspaço livre\s*$/iu,'').trim()
   } else if(q.id==='extr-b13d0b587c97f7e73cc4'){
    q.enunciado=q.enunciado.split(/\nEspaço livre\s*\nCEBRASPE\s*[–-]\s*IRBr/iu)[0].trim()
   } else if(['extr-13328e09d4a6b973f77b','extr-f48233c106d33c5b2958'].includes(q.id)){
    q.enunciado=q.enunciado.split(/\n47 In the excerpt/iu)[0].trim()
   }
   if(['extr-eb2fd88128f9f29c7a48','extr-13328e09d4a6b973f77b','extr-f48233c106d33c5b2958','extr-11ffd83488eac45e7fc3'].includes(q.id)){
    const q47=porId.get('extr-eb2fd88128f9f29c7a48')
    q.texto_apoio=q47?.texto_apoio
   }
   if(['extr-6212ebc66b78ecb0b3e0','extr-5b2f296f8338560648b6','extr-eaee4f49775e87c3a028','extr-3084e1341778d6d28862','extr-b13d0b587c97f7e73cc4'].includes(q.id)){
    if(!textoQatar)throw Error('Texto-base Qatar ainda não foi recuperado')
    q.texto_apoio=textoQatar
   }
   q.materia='Inglês'
   q.conteudo='Interpretação e compreensão textual em língua inglesa'
   q.classificacao_pendente=false
   q.classificacao_confianca=0.99
   q.classificacao_metodo='Revisão individual com conferência da página original e associação do texto-base; gabarito não reavaliado'
   q.classificacao_evidencia='Caderno oficial CEBRASPE 2026: bloco de Inglês e itens de compreensão lexical, inferência e leitura, conferidos pela imagem da página de origem.'
   q.classificacao_revisada={justificativa:q.classificacao_evidencia,sha256_enunciado:hash(Buffer.from(q.enunciado||''))}
   for(const [obj,chave] of [[q.integridade_profissional,'pendencias'],[q.elegibilidade,'apontamentos']])if(obj?.[chave])obj[chave]=obj[chave].filter(p=>p!=='classificacao_especifica_pendente')
   q.integridade_profissional={...q.integridade_profissional,verificada_individualmente:true}
   revisados.push({id:q.id,numero:q.numero_original,antes:{materia:before.materia,conteudo:before.conteudo},depois:{materia:q.materia,conteudo:q.conteudo},texto_base_corrigido:before.texto_apoio!==q.texto_apoio||before.enunciado!==q.enunciado,justificativa:q.classificacao_evidencia})
   mudou=true
  }
  if(q.classificacao_pendente)pendentes++
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 facetas.adicionar(i,qs)
 if(mudou){
  const bytes=zlib.gzipSync(JSON.stringify(qs),{level:9})
  const arquivo=`lotes/revisao-semantica-v19-${i}-${hash(bytes).slice(0,12)}.json.gz`
  await fs.writeFile(path.join(destino,arquivo),bytes)
  alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:qs.length,sha256:hash(bytes)})
  lote.arquivo=arquivo
 }
}
if(revisados.length!==ids.size)throw Error(`Esperadas ${ids.size} decisões, encontradas ${revisados.length}`)
const filtro=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9})
const filtroArquivo=`lotes/filtros-revisao-semantica-v19-${hash(filtro).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,filtroArquivo),filtro)
manifesto.indice_facetas={arquivo:filtroArquivo,sha256:hash(filtro),versao:1}
manifesto.questoes_disponiveis_resolucao=disponiveis
manifesto.questoes_indisponiveis_revisao=total-disponiveis
manifesto.gerado_em=new Date().toISOString()
manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v19',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+revisados.length}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais))
await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
const relatorio={gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis,pendentes,classificadas_individualmente:revisados.length,lotes_alterados:alterados.length,decisoes:revisados,alteracoes:alterados,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify({total,disponiveis,pendentes,classificadas:revisados.length,lotes:alterados.length,arquivos:alterados.map(x=>x.arquivo),filtroArquivo},null,2))
