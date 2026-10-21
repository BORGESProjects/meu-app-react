import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {questaoPublicavel,unirQuestoes} from '../src/acervo.js'
import {normalizarBlocos} from './sae/formato-publicacao.mjs'
const lote=JSON.parse(fs.readFileSync(new URL('../public/acervo/estudo-historia-antiga/questoes.json',import.meta.url),'utf8'))
const audit=JSON.parse(fs.readFileSync(new URL('../docs/acervo/estudo-historia-antiga.json',import.meta.url),'utf8'))
test('História contabiliza os 24 registros sem publicar contradições ou duplicatas',()=>{
 assert.equal(lote.length,19);assert.equal(audit.quarentena.length,4);assert.equal(audit.duplicatas.length,1);assert.equal(lote.length+audit.quarentena.length+audit.duplicatas.length,24)
 const ids=new Set(unirQuestoes(lote).map(q=>q.id))
 for(const q of lote){assert.equal(q.materia,'História');assert.equal(q.tipo_origem,'prova_identificada');assert.ok(questaoPublicavel(q),q.id);assert.ok(ids.has(q.id));assert.doesNotMatch(q.enunciado,/Acertos:|Erros:|Pontuação Final:|Resolução/u)}
 for(const q of [...audit.quarentena,...audit.duplicatas])assert.ok(!lote.some(a=>a.id===q.id))
})
test('texto do IHGB permanece integral, com referência e comando, sem exigir imagem',()=>{
 const q=lote.find(q=>q.id==='sae-c3ec54b6afb7ec0ab4a9');assert.ok(q.apoio_integrado);assert.match(q.enunciado,/institutos regionais/u);assert.match(q.enunciado,/DEL PRIORE/u);assert.equal(q.resposta_correta,0)
 assert.equal(questaoPublicavel({...q,enunciado:'De acordo com o texto, assinale a correta.',blocos_enunciado:[{tag:'p',children:['De acordo com o texto, assinale a correta.']}]}),false)
})
test('QR de resolução e contadores da interface não viram partes de questões',()=>{
 const b=normalizarBlocos([{tag:'img',attrs:{class:'qrQuestoes',src:'qr.png'},children:[]},{tag:'p',children:['Acertos:',{tag:'span',attrs:{class:'certas'},children:['10']}]},{tag:'p',children:['Conteúdo preservado']}],()=>{throw Error('QR não deve ser copiado')})
 assert.deepEqual(b,[{tag:'p',children:['Conteúdo preservado']}]);assert.equal(audit.recursos.length,0)
})
