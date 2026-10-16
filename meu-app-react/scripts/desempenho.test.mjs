import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { indexarFiltros, filtrarIndice, conteudosDoIndice } from '../src/indiceFiltros.js'
import { chaveCampoFiltro, chaveConteudoFiltro, opcoesConteudo } from '../src/filtros.js'
import { anoDaQuestao } from '../src/acervo.js'
import { carregarEmEtapas } from '../src/carregarAcervo.js'

const ler=p=>JSON.parse(readFileSync(new URL('../public/acervo/'+p+'/questoes.json',import.meta.url),'utf8'))
const qs=[...ler('pf-2025-delegado'),...ler('ufpr-2025'),...ler('prf-2021')]
const indice=indexarFiltros(qs)
test('índice preserva multisseleção, agrupamento de conteúdos e ordem das questões',()=>{
 const cenarios=[{ano:['2025']},{materia:['matematica','direito penal']},{banca:['pf','ufpr']},
  {dificuldade:['media']},{conteudo:[indice[0].conteudo],ano:['2025'],banca:['pf']},
  {materia:['fisica'],ano:['2021','2025'],banca:['prf','ufpr']}]
 for(const filtros of cenarios){
  const antigo=qs.filter(q=>Object.entries(filtros).every(([campo,valores])=>valores.includes(campo==='ano'?anoDaQuestao(q):campo==='conteudo'
   ?chaveConteudoFiltro(q.conteudo,q.materia,`${q.enunciado||''} ${(q.opcoes||[]).join(' ')}`):chaveCampoFiltro(campo,q[campo]))))
  assert.deepEqual(filtrarIndice(indice,filtros),antigo)
 }
 assert.deepEqual(filtrarIndice(indice,{}),[])
 for(const materias of [[],['matematica'],['direito penal','direito ambiental']]){
  const base=qs.filter(q=>!materias.length||materias.includes(chaveCampoFiltro('materia',q.materia)))
  assert.deepEqual(conteudosDoIndice(indice,materias),opcoesConteudo(base))
 }
})
test('acervo estático fica disponível enquanto API espera; resultado final mantém precedência e falhas',async()=>{
 let concluirBanco
 const banco=new Promise(resolve=>{concluirBanco=resolve})
 let recebido
 const final=carregarEmEtapas([banco,Promise.reject(new Error('API indisponível')),Promise.resolve(['lote'])],r=>{recebido=r})
 await new Promise(resolve=>setImmediate(resolve))
 assert.deepEqual(recebido,[{status:'fulfilled',value:['lote']}])
 concluirBanco(['banco'])
 const resultados=await final
 assert.deepEqual(resultados[0],{status:'fulfilled',value:['banco']})
 assert.equal(resultados[1].status,'rejected')
 assert.deepEqual(resultados[2],{status:'fulfilled',value:['lote']})
})
