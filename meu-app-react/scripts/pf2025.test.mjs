import test from 'node:test'
import assert from 'node:assert/strict'
import {existsSync,readFileSync} from 'node:fs'
import {corrigirQuestaoConferida,questaoPublicavel,podeCorrigir,unirQuestoes} from '../src/acervo.js'
import {concursosDaQuestao,questaoNaProva} from '../src/provasCompartilhadas.js'
const ler=nome=>JSON.parse(readFileSync(new URL('../public/acervo/pf-2025-delegado/'+nome,import.meta.url),'utf8'))
const qs=ler('questoes.json'),m=ler('manifesto.json')
test('PF 2025 Delegado: 120 posições oficiais e 114 corrigíveis, inclusive no simulado',()=>{
 assert.equal(qs.length,120)
 const prova=qs.filter(q=>concursosDaQuestao(q).includes(m.concurso)).map(q=>questaoNaProva(q,m.concurso)).sort((a,b)=>a.numero_original-b.numero_original)
 assert.deepEqual(prova.map(q=>q.numero_original),Array.from({length:120},(_,i)=>i+1))
 assert.equal(prova.filter(podeCorrigir).length,114)
 assert.deepEqual(qs.filter(q=>q.anulada).map(q=>q.numero_original),[2,3,10,14,35,78])
 assert.equal(m.respostas,'CXXEECEECXCECXCEEECCECECEECCECCCCEXEEEEECCEECECEEECECEEECECCCEECCECCEECCECCEEXECECEEECCEECECECCECCEECECCEEEECCCEECCEECEC')
 assert.equal(unirQuestoes([...qs,...qs]).filter(q=>q.id.startsWith('pf-2025-cargo-1-')).length,120)
 for(const q of qs){
  assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)),q.id)
  assert.deepEqual(q.opcoes,['Certo','Errado'])
  assert.deepEqual(q.rotulos_opcoes,['C','E'])
  const letra=m.respostas[q.numero_original-1]
  assert.equal(q.gabarito_oficial,letra)
  assert.equal(q.resposta_correta,letra==='X'?null:letra==='C'?0:1)
  assert.notEqual(q.materia,'Conhecimentos específicos')
  assert.equal(q.apoio.length,1,q.id)
  for(const img of [q.imagem_original,...q.apoio.map(a=>a.imagem)]){
   assert.ok(!img.includes('em-revisao'),img)
   assert.ok(existsSync(new URL('../public'+img,import.meta.url)),img)
  }
 }
 assert.match(m.fonte_pdf,/^https:\/\/www.gov.br\/pf\//)
 assert.match(m.fonte_gabarito,/gabaritos-definitivos/)
})
test('PF 2025 Delegado: casos hipotéticos completos não herdam comandos de outra matéria',()=>{
 const apoio=n=>qs[n-1].apoio.map(a=>a.texto).join(' ')
 for(const n of [55,56,57]){assert.match(apoio(n),/Caetano/);assert.match(apoio(n),/Ana/);assert.doesNotMatch(apoio(n),/bem jurídico/)}
 for(const n of [74,75,76,77,78]){assert.match(apoio(n),/COAF/);assert.match(apoio(n),/recusou a comparecer/)}
 for(const n of [113,114,115]){assert.match(apoio(n),/restinga/);assert.doesNotMatch(apoio(n),/Sistema Tributário/)}
 for(const n of [119,120]){assert.match(apoio(n),/motosserra/);assert.doesNotMatch(apoio(n),/Constituição Federal/)}
 assert.match(qs[63].enunciado,/imposto sobre importação/)
 assert.match(qs[63].enunciado,/fé pública/)
 assert.equal(qs[112].materia,'Direito Ambiental')
 assert.equal(qs[109].materia,'Direito Tributário')
})
