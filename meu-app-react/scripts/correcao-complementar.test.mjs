import test from 'node:test'
import assert from 'node:assert/strict'
import {avaliarRespostaComplementar} from '../src/correcaoAcervoComplementar.js'
const q = {opcoes:['Certo','Errado'],resposta_correta:0,gabarito_oficial:{sha256:'documento-conferido'},integridade_profissional:{correcao_automatica:true}}
test('corrige seleção explícita com gabarito conferido',()=>{
  assert.deepEqual(avaliarRespostaComplementar(q,'0'),{escolhida:0,correta:0,acertou:true})
  assert.equal(avaliarRespostaComplementar(q,'1').acertou,false)
})
test('não pontua seleção vazia, anulada ou gabarito sem evidência',()=>{
  for (const resposta of ['',null,undefined,'3','abc']) assert.equal(avaliarRespostaComplementar(q,resposta),null)
  assert.equal(avaliarRespostaComplementar({...q,anulada:true},'0'),null)
  assert.equal(avaliarRespostaComplementar({...q,gabarito_oficial:null},'0'),null)
  assert.equal(avaliarRespostaComplementar({...q,integridade_profissional:{correcao_automatica:false}},'0'),null)
  assert.equal(avaliarRespostaComplementar({...q,resposta_correta:null},'0'),null)
})
