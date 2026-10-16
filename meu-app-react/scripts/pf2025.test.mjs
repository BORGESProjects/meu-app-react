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

const operacionais=JSON.parse(readFileSync(new URL('../public/acervo/pf-2025-operacionais/questoes.json',import.meta.url),'utf8'))
const manifestoOp=JSON.parse(readFileSync(new URL('../public/acervo/pf-2025-operacionais/manifesto.json',import.meta.url),'utf8'))
const origemOp=id=>operacionais.find(q=>q.origens_provas.some(o=>o.id_original===id))
test('PF 2025 operacionais: 168 itens preservam 360 posições e gabarito de cada cargo',()=>{
 assert.equal(operacionais.length,168)
 assert.equal(operacionais.reduce((s,q)=>s+q.origens_provas.length,0),360)
 const corrigiveis=[112,110,112]
 const anuladas=[[37,52,62,69,85,91,94,119],[37,52,62,69,85,91,94,111,112,117],[37,52,62,69,85,91,94,102]]
 manifestoOp.cadernos.forEach((m,i)=>{
  const prova=operacionais.filter(q=>concursosDaQuestao(q).includes(m.concurso)).map(q=>questaoNaProva(q,m.concurso)).sort((a,b)=>a.numero_original-b.numero_original)
  assert.deepEqual(prova.map(q=>q.numero_original),Array.from({length:120},(_,i)=>i+1))
  assert.equal(prova.filter(podeCorrigir).length,corrigiveis[i])
  assert.deepEqual(prova.filter(q=>q.anulada).map(q=>q.numero_original),anuladas[i])
  assert.equal(prova.map(q=>q.gabarito_oficial).join(''),m.respostas)
 })
 for(const q of operacionais){
  assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)),q.id)
  assert.deepEqual(q.opcoes,['Certo','Errado'])
  for(const o of q.origens_provas){
   assert.equal(o.apoio.length,1,o.id_original)
   assert.doesNotMatch(o.apoio[0].texto,/Cada um dos itens|PROVA OBJETIVA|Folha de Respost/)
   for(const img of [o.imagem_original,...o.apoio.map(a=>a.imagem)]){
    assert.ok(!img.includes('em-revisao'),img)
    assert.ok(existsSync(new URL('../public'+img,import.meta.url)),img)
   }
  }
 }
 assert.equal(unirQuestoes([...operacionais,...operacionais]).filter(q=>q.id.startsWith('pf-2025-operacionais-')).length,168)
})
test('PF 2025: listas e conclusões pertencem aos itens 54,55 e 60, sem contaminar o seguinte',()=>{
 const q=n=>origemOp(`pf-2025-comum-bloco1-${String(n).padStart(3,'0')}`)
 assert.match(q(54).enunciado,/X afirmou/);assert.match(q(54).enunciado,/Y afirmou/);assert.match(q(54).enunciado,/culpado do crime é X/)
 assert.match(q(55).enunciado,/P:/);assert.match(q(55).enunciado,/Q:/);assert.match(q(55).enunciado,/mesmo tipo sanguíneo/)
 assert.match(q(60).enunciado,/120 apresentavam/);assert.match(q(60).enunciado,/85,/);assert.match(q(60).enunciado,/inferior a 40/)
 assert.doesNotMatch(q(60).enunciado,/Espaço livre/)
 assert.doesNotMatch(q(56).apoio.map(a=>a.texto).join(' '),/Paulo|X afirmou/)
 assert.match(q(1).apoio[0].texto,/Muitas obras cinematográficas/)
 assert.match(q(8).apoio[0].texto,/preocupações com a segurança/)
 assert.match(q(28).apoio[0].texto,/alto-mar/);assert.doesNotMatch(q(28).apoio[0].texto,/inquérito policial/)
})
test('PF 2025: fórmulas, tabela-verdade, código SQL, contabilidade e circuito preservados',()=>{
 assert.match(origemOp('pf-2025-comum-bloco2-081').enunciado,/chmod 755 policial.pdf/)
 assert.match(origemOp('pf-2025-comum-bloco2-091').apoio[0].texto,/CREATE TABLE catalogo/)
 assert.match(origemOp('pf-2025-comum-bloco2-092').apoio[0].texto,/SELECT \* FROM catalogo/)
 assert.match(origemOp('pf-2025-cargo-16-107').apoio[0].texto,/95.000/)
 assert.match(origemOp('pf-2025-cargo-15-097').enunciado,/financiamentos bancários/)
 const circuito=origemOp('pf-2025-cargo-17-107')
 const bytes=readFileSync(new URL('../public'+circuito.imagem_original,import.meta.url))
 assert.ok(bytes.length>12000,'circuito deve estar incluído na imagem')
 assert.match(origemOp('pf-2025-cargo-17-115').enunciado,/CO/)
 assert.equal(origemOp('pf-2025-cargo-17-120').recortes_pdf[0].caixa[2],568,'página final usa coluna inteira')
})
