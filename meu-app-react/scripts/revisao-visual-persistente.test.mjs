import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {gunzipSync} from 'node:zlib'
import {aplicarRevisaoVisual} from './acervo-publico/aplicar_revisao_visual.mjs'
const revisoes=JSON.parse(readFileSync('docs/acervo/revisao-profissional/revisoes-visuais-persistentes.json'))
const mudancas=JSON.parse(gunzipSync(readFileSync('docs/acervo/revisao-profissional/revisao-comandos-alteracoes.json.gz')))
test('reaplica as quatro transcrições e preserva gabaritos e imagens',()=>{
 assert.equal(revisoes.length,4)
 for(const r of revisoes){
  const antes=mudancas.find(m=>m.id===r.id).antes
  const q={id:r.id,...antes,resposta_correta:null,pagina_imagem:'pagina-preservada.webp'}
  const depois=aplicarRevisaoVisual(q,revisoes)
  assert.equal(depois.resposta_correta,null)
  assert.equal(depois.pagina_imagem,q.pagina_imagem)
  assert.deepEqual(aplicarRevisaoVisual(depois,revisoes),depois)
  assert.throws(()=>aplicarRevisaoVisual({...q,enunciado:q.enunciado+' Texto novo'},revisoes),/Texto mudou/)
 }
})
