import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='fee3159d8b33e3c1'
const url='https://cdn.cebraspe.org.br/concursos/IRBR_25_DIPLOMACIA/arquivos/101_IRBRCACDOBJ_001_01.pdf'
const secoes=[
  [[1,14],'Português','Compreensão, interpretação e análise linguística de texto literário'],
  [[15,28],'Português','Interpretação, coesão, referenciação e efeitos de sentido em texto literário'],
  [[29,40],'Português','Compreensão e análise estilística de texto literário'],
  [[41,55],'História','História do Brasil: colonização, Independência e primeiras décadas do Império'],
  [[56,73],'História','História do Brasil Republicano: Era Vargas, transformações sociais e constituições'],
  [[74,78],'História','História mundial: Primeira Guerra Mundial e período entre guerras'],
  [[79,96],'História','História mundial: Segunda Guerra, Guerra Fria e ordem internacional contemporânea'],
  [[97,114],'Geografia','Pensamento geográfico, migrações e blocos econômicos internacionais'],
  [[115,117],'Geografia','Geografia urbana: metropolização, centralidades e segregação socioespacial'],
  [[118,120],'Geografia','Geopolítica: teoria do Heartland e poder continental de Mackinder'],
]
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json'))
const base=raizesAtuais[0],decisoes=[]
for(const lote of manifesto.lotes){
  const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for(const q of qs){
    if(q.documento_id!==documento||!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||q.classificacao_revisada)continue
    const n=q.numero_original,regra=secoes.find(([[de,ate]])=>n>=de&&n<=ate)
    if(!regra)throw Error(`Sem tema no programa oficial para o item ${n}`)
    if(!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Integridade/tipo incompatível no item ${n}`)
    const [[de,ate],materia,conteudo]=regra
    decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,
      motivo:`Item ${n}: matéria e conteúdo identificados pelo cabeçalho temático e pelo comando do caderno oficial CACD 2025, itens ${de}–${ate}, página ${q.pagina}.`,
      classificacao_fonte:{materia:`Cabeçalho temático oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==105)throw Error(`Esperadas 105 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v49-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v49',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'CACD/IRBr primeira fase 2025',classificacoes:Object.fromEntries([...new Set(decisoes.map(d=>d.materia))].map(m=>[m,decisoes.filter(d=>d.materia===m).length]))}))
