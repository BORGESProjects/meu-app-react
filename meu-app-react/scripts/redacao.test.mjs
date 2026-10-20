import test from 'node:test'
import assert from 'node:assert/strict'
import {PERFIS_REDACAO,relatorioValido,solicitarCorrecao,lerRascunho,salvarRascunho,validarRedacao,estatisticasRedacao} from '../src/redacao.js'
const redacao={tema:'Educação pública',texto:'A educação pública precisa de investimento e de professores valorizados. Isso amplia oportunidades.',banca:'ENEM',criterios:''}
const relatorio=()=>({resumo:'Diagnóstico',maximo:1000,nota:800,criterios:PERFIS_REDACAO.ENEM.criterios.map(([id,nome,maximo])=>({id,nome,maximo,nota:160,justificativa:'Evidência',sugestao:'Ação'})),pontos_fortes:[],prioridades:['Desenvolver argumento'],alertas:[],revisoes:[]})
test('valida notas, soma, critérios únicos e citações literais',()=>{
 assert.equal(relatorioValido(relatorio(),'ENEM',redacao.texto),true)
 for(const alterar of [r=>r.nota++,r=>r.criterios[0].nota=170,r=>r.criterios[0]=null,r=>r.criterios[0].id='C2',r=>r.revisoes=[null],r=>r.revisoes=[{trecho:'Inventado',problema:'x',sugestao:'y'}]]){const r=relatorio();alterar(r);assert.equal(relatorioValido(r,'ENEM',redacao.texto),false)}
})
test('não aceita erro legado como correção e não repete requisição',async()=>{
 let chamadas=0
 const fetcher=async()=>{chamadas++;return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:'Erro ao comunicar com a API: SECRET'}]}}]})}}
 await assert.rejects(solicitarCorrecao({redacao,fetcher}),/não concluiu/);assert.equal(chamadas,1)
})
test('trata limite sem expor detalhes do provedor e preserva relatório válido',async()=>{
 await assert.rejects(solicitarCorrecao({redacao,fetcher:async()=>({ok:false,status:429,json:async()=>({message:'SECRET'})})}),e=>!e.message.includes('SECRET')&&e.message.includes('limite'))
 const r=await solicitarCorrecao({redacao,fetcher:async()=>({ok:true,json:async()=>({relatorio:relatorio(),reutilizada:true})})});assert.equal(r.reutilizada,true)
})
test('rascunhos isolados por conta, histórico inválido descartado',()=>{
 const mapa=new Map(),storage={getItem:k=>mapa.get(k),setItem:(k,v)=>mapa.set(k,v)}
 salvarRascunho(storage,'A',redacao,[{id:'invalido',redacao,resultado:{relatorio:relatorio()}}])
 assert.equal(lerRascunho(storage,'B'),null);assert.equal(lerRascunho(storage,'A').rascunho.texto,redacao.texto);assert.equal(lerRascunho(storage,'A').historico.length,0)
})
test('valida limites antes de consumir IA e conta parágrafos sem inventar linhas',()=>{
 assert.match(validarRedacao({...redacao,texto:'teste'}),/80/)
 assert.match(validarRedacao({...redacao,texto:'a'.repeat(20001)}),/20.000/)
 assert.deepEqual(estatisticasRedacao('Um texto\n\nOutro texto'),{palavras:4,caracteres:21,paragrafos:2})
})
test('cancelamento e prazo encerram a espera sem nova chamada',async()=>{
 const fetcher=(_,o)=>new Promise((_,reject)=>o.signal.addEventListener('abort',()=>reject(new DOMException('Abortado','AbortError'))))
 await assert.rejects(solicitarCorrecao({redacao,fetcher,prazo:10}),/tempo de espera/)
 const c=new AbortController();c.abort();await assert.rejects(solicitarCorrecao({redacao,signal:c.signal}),{name:'AbortError'})
})
