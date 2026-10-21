import test from 'node:test'
import assert from 'node:assert/strict'
import {recuperarFonteOficial} from './recuperacoes-oficiais.mjs'
import {normalizarBlocos} from './formato-publicacao.mjs'
import {blocosValidos} from '../../src/blocosQuestao.js'
const fixture=()=>({id:'sae-e44f51c2d0a952dd28bb',resposta_correta:0,alternativas:['3.','5.','6.','9.','12.'].map(texto=>({texto})),enunciado_blocos:[{tag:'p',children:['Se ',{tag:'img',attrs:{src:'https://livrodigital.sae.digital/resources/image/EXT21MA07099.jpg'},children:[]},', para todo número real x...']}]})
test('recupera fórmula verificada mantendo prova, número e original intactos',()=>{
 const original=fixture(),copia=JSON.stringify(original),q=recuperarFonteOficial(original)
 assert.equal(JSON.stringify(original),copia)
 assert.equal(q.recuperacao_oficial.numero,20)
 assert.equal(q.recuperacao_oficial.modelo,'V')
 const blocos=normalizarBlocos(q.enunciado_blocos,()=>{throw Error('Imagem não deve ser necessária')})
 assert.ok(blocosValidos(blocos))
 assert.equal(JSON.stringify(blocos).match(/msup/g).length,3)
})
test('recusa recuperação se prova capturada mudou ou o recurso não é único',()=>{
 const q=fixture();q.resposta_correta=1;assert.throws(()=>recuperarFonteOficial(q))
 const r=fixture();r.enunciado_blocos=[];assert.throws(()=>recuperarFonteOficial(r))
 assert.deepEqual(recuperarFonteOficial({id:'outro'}),{id:'outro'})
})
