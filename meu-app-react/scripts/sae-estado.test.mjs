import test from 'node:test'
import assert from 'node:assert/strict'
import {consolidarEstado} from './sae/estado-acervo.mjs'
test('captura não equivale a publicação e pendências não somem do escopo',()=>{
 const inv=[{materia:'Biologia',grupo:'V1',capitulos:[{id:'c1',label:'Abrir Capítulo Livro digital'},{id:'c2',label:'Abrir Outro Livro digital'}]}]
 const cap=[{id_capitulo:'c1',questoes:[{id:'a',resposta_correta:0},{id:'b',resposta_correta:null},{id:'c',resposta_correta:1},{id:'d',resposta_correta:2}],imagens_pendentes:['figura']}]
 const e=consolidarEstado(inv,cap,[{publicados:['a'],quarentena:[{id:'b'}],duplicatas:[{id:'c'}]}])
 assert.equal(e.concluido,false);assert.deepEqual(e.materias[0],{materia:'Biologia',capitulos:2,capturados:1,registros:4,publicadas:1,quarentena:1,duplicatas:1,revisao_pendente:1});assert.equal(e.capitulos[0].imagens_pendentes,1);assert.equal(e.capitulos[1].capturado,false)
})

test('capítulo indisponível é contabilizado sem fingir captura ou conclusão integral',()=>{
 const inv=[{materia:'Matemática',grupo:'V2',capitulos:[{id:'c',label:'Abrir Troncos Livro digital'}]}]
 const e=consolidarEstado(inv,[],[],[{id:'c',motivo:'Link incorreto na origem.'}])
 assert.equal(e.concluido,false)
 assert.equal(e.inventario_processado,true)
 assert.equal(e.materias[0].capturados,0)
 assert.equal(e.capitulos[0].indisponibilidade.motivo,'Link incorreto na origem.')
})
