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

const peritos=JSON.parse(readFileSync(new URL('../public/acervo/pf-2025-peritos/questoes.json',import.meta.url),'utf8'))
const manifestoPeritos=JSON.parse(readFileSync(new URL('../public/acervo/pf-2025-peritos/manifesto.json',import.meta.url),'utf8'))
test('PF 2025 Perito: apenas áreas completas liberadas, sem duplicar o núcleo comum',()=>{
 assert.equal(peritos.length,50+70*manifestoPeritos.cadernos.length-(manifestoPeritos.sobreposicoes_conferidas??0))
 for(const m of manifestoPeritos.cadernos){
  const prova=peritos.filter(q=>concursosDaQuestao(q).includes(m.concurso)).map(q=>questaoNaProva(q,m.concurso)).sort((a,b)=>a.numero_original-b.numero_original)
  assert.deepEqual(prova.map(q=>q.numero_original),Array.from({length:120},(_,i)=>i+1))
  assert.equal(prova.filter(podeCorrigir).length,m.corrigiveis)
  assert.equal(prova.map(q=>q.gabarito_oficial).join(''),m.respostas)
  if(m.concurso.includes('Contábil-Financeira')){
   assert.equal(m.corrigiveis,110)
   assert.deepEqual(m.anuladas,[18,19,31,38,53,67,80,82,94,114])
  }
 }
 assert.deepEqual([...new Set(peritos.flatMap(concursosDaQuestao))].sort(),manifestoPeritos.cadernos.map(m=>m.concurso).sort())
 const unidas=unirQuestoes([...peritos,...operacionais,...qs])
 for(const q of peritos){
  assert.ok(unidas.some(item=>item.id===q.id),q.id)
  assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)),q.id)
  assert.equal(q.apoio.length,1,q.id)
  for(const img of [q.imagem_original,...q.apoio.map(a=>a.imagem)])assert.ok(existsSync(new URL('../public'+img,import.meta.url)),img)
 }
})
test('PF 2025 Perito Contábil: casos independentes, gráficos e código completos',()=>{
 const q=n=>peritos.find(q=>q.id===`pf-2025-cargo-2-${String(n).padStart(3,'0')}`)
 assert.match(q(99).apoio[0].texto,/gráfico precedente/)
 assert.match(q(101).apoio[0].texto,/amortização constante/);assert.doesNotMatch(q(101).apoio[0].texto,/gráfico precedente/)
 assert.match(q(103).apoio[0].texto,/duplicata/);assert.doesNotMatch(q(103).apoio[0].texto,/amortização constante/)
 assert.match(q(105).apoio[0].texto,/boxplot/);assert.doesNotMatch(q(105).apoio[0].texto,/duplicata/)
 assert.match(q(113).apoio[0].texto,/arquivo JSON/);assert.doesNotMatch(q(113).apoio[0].texto,/regressão linear/)
 assert.match(q(114).enunciado,/80 a 84/);assert.match(q(114).enunciado,/distribuição\s+normal/)
 assert.match(q(120).enunciado,/print\(resultado\)/);assert.match(q(120).enunciado,/v_3/)
 const p31=peritos.find(q=>q.id==='pf-2025-comum-peritos-031')
 assert.match(p31.apoio[0].texto,/falsificação de documento/);assert.doesNotMatch(p31.apoio[0].texto,/Argentina/)
 const p46=peritos.find(q=>q.id==='pf-2025-comum-peritos-046')
 assert.match(p46.apoio[0].texto,/alarme de movimentação/)
 for(const n of [99,105])assert.ok(readFileSync(new URL('../public'+q(n).apoio[0].imagem,import.meta.url)).length>12000)
})

test('PF 2025 Perito: elétrica e informática preservam frações, códigos e diagrama',()=>{
 const q=(cargo,n)=>peritos.find(q=>q.id===`pf-2025-cargo-${cargo}-${String(n).padStart(3,'0')}`)
 const eletrica=manifestoPeritos.cadernos.find(p=>p.concurso.includes('Área 2:'))
 const informatica=manifestoPeritos.cadernos.find(p=>p.concurso.includes('Área 3:'))
 assert.equal(eletrica.corrigiveis,116)
 assert.deepEqual(eletrica.anuladas,[18,19,31,38])
 assert.ok(informatica)
 assert.match(q(3,51).apoio[0].texto,/resposta ao impulso/)
 assert.match(q(3,69).apoio[0].texto,/conjunto H/)
 assert.doesNotMatch(q(3,71).apoio[0].texto,/conjunto H/)
 assert.match(q(4,81).apoio[0].texto,/mysqli_query/)
 assert.match(q(4,82).enunciado,/SELECT \* FROM users WHERE username/)
 assert.doesNotMatch(q(4,83).apoio[0].texto,/SELECT|Nesse caso/)
 assert.match(q(4,98).enunciado,/chmod 664 testepf/)
 assert.match(q(4,98).enunciado,/Nesse caso/)
 assert.doesNotMatch(q(4,99).apoio[0].texto,/Nesse caso|testepf/)
 const diagrama=q(4,93)
 assert.ok(diagrama.recortes_pdf[0].caixa[3]-diagrama.recortes_pdf[0].caixa[1]>240)
 assert.ok(readFileSync(new URL('../public'+diagrama.imagem_original,import.meta.url)).length>20000)
 assert.doesNotMatch(q(4,120).enunciado,/Espaço livre/)
})

test('PF 2025 Perito: Geologia e Engenharia Civil mantêm dados e casos separados',()=>{
 const q=(cargo,n)=>peritos.find(q=>q.id===`pf-2025-cargo-${cargo}-${String(n).padStart(3,'0')}`)
 assert.match(q(5,54).apoio[0].texto,/Serra Geral/)
 assert.doesNotMatch(q(5,59).apoio[0].texto,/Serra Geral/)
 assert.equal(q(5,51).materia,'Geologia')
 assert.match(q(5,116).apoio[0].texto,/legislação ambiental/)
 assert.match(q(6,74).apoio[0].texto,/10.000 m3/)
 assert.match(q(6,74).apoio[0].texto,/17,40/)
 assert.match(q(6,74).apoio[0].texto,/16,50/)
 assert.match(q(6,77).enunciado,/174.000/)
 assert.doesNotMatch(q(6,78).apoio[0].texto,/aterro|10.000/)
 assert.match(q(6,107).apoio[0].texto,/semi-integrada/)
 assert.doesNotMatch(q(6,111).apoio[0].texto,/semi-integrada/)
 assert.equal(q(6,120).materia,'Engenharia Civil')
 assert.doesNotMatch(q(6,120).enunciado,/Espaço livre/)
})

test('PF 2025 Perito: imagem orbital, matriz de classificação e comandos entre colunas',()=>{
 const q=(cargo,n)=>peritos.find(q=>q.id===`pf-2025-cargo-${cargo}-${String(n).padStart(3,'0')}`)
 assert.match(q(7,112).enunciado,/linha de ruído/)
 assert.ok(readFileSync(new URL('../public'+q(7,112).imagem_original,import.meta.url)).length>40000)
 assert.match(q(7,117).apoio[0].texto,/52 6 0 28 0 86/)
 assert.match(q(7,120).apoio[0].texto,/65 60 82 143 80 430/)
 assert.match(q(7,120).apoio[0].texto,/verdade terrestre/)
 assert.match(q(8,63).apoio[0].texto,/energias de ordem mecânica/)
 assert.match(q(8,115).apoio[0].texto,/servidor público federal/)
 assert.match(q(8,116).apoio[0].texto,/servidor público federal/)
 assert.doesNotMatch(q(8,117).apoio[0].texto,/servidor público federal/)
 assert.match(q(8,120).enunciado,/Schilling/)
 assert.doesNotMatch(q(8,120).enunciado,/Espaço livre/)
})

test('PF 2025 Física e Minas: gráficos e numeração própria sobrevivem à deduplicação',()=>{
 const q=(cargo,n)=>peritos.find(q=>q.id===`pf-2025-cargo-${cargo}-${String(n).padStart(3,'0')}`)
 assert.match(q(9,66).apoio[0].texto,/equações de Maxwell/)
 assert.match(q(9,70).apoio[0].texto,/duas partículas/)
 assert.match(q(9,73).apoio[0].texto,/motor térmico/)
 for(const n of [66,70,73])assert.ok(readFileSync(new URL('../public'+q(9,n).apoio[0].imagem,import.meta.url)).length>20000)
 assert.equal(q(9,120).recortes_pdf[0].caixa[2],568)
 assert.doesNotMatch(q(9,120).enunciado,/Espaço livre/)
 assert.ok(readFileSync(new URL('../public'+q(10,59).imagem_original,import.meta.url)).length>20000)
 assert.match(q(10,61).apoio[0].texto,/convergência\/confinamento/)
 assert.match(q(10,63).apoio[0].texto,/5 12 18 6 7 14 22 4/)
 assert.match(q(10,64).apoio[0].texto,/20 kN\/m3/)
 assert.equal(manifestoPeritos.sobreposicoes_conferidas,8)
 const provaMinas=manifestoPeritos.cadernos.find(p=>p.concurso.includes('Área 17:')).concurso
 const compartilhada=q(5,111)
 const origem=questaoNaProva(compartilhada,provaMinas)
 assert.equal(origem.numero_original,115)
 assert.match(origem.imagem_original,/cargo-10\/q115/)
 assert.match(compartilhada.imagem_original,/cargo-5\/q111/)
 for(const item of peritos)for(const o of item.origens_provas)for(const img of [o.imagem_original,...o.apoio.map(a=>a.imagem)])assert.ok(existsSync(new URL('../public'+img,import.meta.url)))
})

test('PF 2025: treze áreas de Perito completas e textos da genética preservados',()=>{
 assert.equal(manifestoPeritos.cadernos.length,13)
 assert.equal(peritos.length,952)
 const q=(cargo,n)=>peritos.find(q=>q.id===`pf-2025-cargo-${cargo}-${String(n).padStart(3,'0')}`)
 assert.match(q(11,51).apoio[0].texto,/6 e 24 horas/)
 assert.match(q(11,51).apoio[0].texto,/Damour/)
 assert.match(q(11,69).apoio[0].texto,/2.723 brasileiros/)
 assert.match(q(11,91).apoio[0].texto,/15%/)
 assert.doesNotMatch(q(11,95).apoio[0].texto,/15%|genótipo AB/)
 assert.match(q(11,99).apoio[0].texto,/1 em 300/)
 assert.match(q(11,103).apoio[0].texto,/100%/)
 assert.match(q(12,97).apoio[0].texto,/10 8 30/)
 assert.match(q(12,97).apoio[0].texto,/20 10 A/)
 assert.match(q(12,97).apoio[0].texto,/B 30 80/)
 assert.match(q(13,67).enunciado,/Nesse caso/)
 assert.match(q(13,120).enunciado,/Minnesota/)
 assert.equal(q(14,120).recortes_pdf[0].caixa[2],568)
 assert.doesNotMatch(q(14,120).enunciado,/Espaço livre/)
 const todas=[...peritos,...operacionais,...qs]
 const provas=[...new Set(todas.flatMap(concursosDaQuestao))]
 assert.equal(provas.length,17)
 assert.equal(provas.reduce((s,p)=>s+todas.filter(q=>concursosDaQuestao(q).includes(p)).length,0),2040)
})
