import test from 'node:test'
import assert from 'node:assert/strict'
import {criarProcessadorAcervo} from '../src/processarAcervo.js'
import {prepararAcervo} from '../src/prepararAcervo.js'
import {unirQuestoes} from '../src/acervo.js'
import {indexarFiltros} from '../src/indiceFiltros.js'

test('worker conserva conteúdo, gabarito, precedência e índice dos filtros',()=>{
 const entrada=[{id:'teste-worker',materia:'Química',banca:'ENEM',ano:2020,enunciado:'Uma solução aquosa em condições normais apresenta as propriedades seguintes.',opcoes:['Primeira opção','Segunda opção'],resposta_correta:1}]
 const copia=structuredClone(entrada)
 const esperado=unirQuestoes(entrada)
 assert.deepEqual(prepararAcervo(entrada),{questoes:esperado,indice:indexarFiltros(esperado)})
 assert.deepEqual(entrada,copia)
})

test('substituição e saída cancelam worker; respostas antigas não atualizam a conta',async()=>{
 const workers=[]
 const c=criarProcessadorAcervo(()=>{const w={postMessage(d){this.dados=d},terminate(){this.encerrado=true}};workers.push(w);return w})
 const a=c.preparar(['antigo']);const cancelado=assert.rejects(a,{name:'AbortError'})
 const b=c.preparar(['novo'])
 await cancelado
 assert.equal(workers[0].encerrado,true)
 workers[0].onmessage({data:{resultado:{questoes:['velho'],indice:[]}}})
 workers[1].onmessage({data:{resultado:{questoes:['novo'],indice:[]}}})
 assert.deepEqual(await b,{questoes:['novo'],indice:[]})
 assert.equal(workers[1].encerrado,true)
 const d=c.preparar([]);const sair=assert.rejects(d,{name:'AbortError'});c.cancelar();await sair
})

test('falha do worker preserva o acervo anterior e permite nova tentativa',async()=>{
 let w
 const c=criarProcessadorAcervo(()=>w={postMessage(){},terminate(){}})
 const a=c.preparar([]);const rejeitado=assert.rejects(a,/interrompido/)
 w.onerror();await rejeitado
 const b=c.preparar([])
 w.onmessage({data:{resultado:{questoes:[],indice:[]}}})
 assert.deepEqual(await b,{questoes:[],indice:[]})
})
