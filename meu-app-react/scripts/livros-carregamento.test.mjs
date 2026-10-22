import test from 'node:test'
import assert from 'node:assert/strict'
import {carregarLoteLivro} from '../src/livrosAcervo.js'
const lote={materia:'Português',url:'/acervo/estudo-portugues-colecao/questoes.json',quantidade:2}
test('catálogo exige contagem e identificadores únicos; falha não vira acervo vazio',async()=>{
 const itens=[{id:'a',opcoes:['Sim','Não']},{id:'b',opcoes:['Sim','Não']}]
 assert.deepEqual(await carregarLoteLivro(lote,async()=>({ok:true,json:async()=>itens})),itens)
 await assert.rejects(carregarLoteLivro(lote,async()=>({ok:false})),/indisponível/u)
 await assert.rejects(carregarLoteLivro(lote,async()=>({ok:true,json:async()=>itens.slice(0,1)})),/incompleto/u)
 await assert.rejects(carregarLoteLivro(lote,async()=>({ok:true,json:async()=>[itens[0],itens[0]]})),/incompleto/u)
 await assert.rejects(carregarLoteLivro({...lote,url:'https://outro-site/questoes.json'}),/inválido/u)
})
