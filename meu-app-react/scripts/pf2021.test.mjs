import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,existsSync} from 'node:fs'
import {concursosDaQuestao,questaoNaProva} from '../src/provasCompartilhadas.js'
import {unirQuestoes,podeCorrigir,questaoPublicavel,corrigirQuestaoConferida} from '../src/acervo.js'
const ler=arquivo=>JSON.parse(readFileSync(new URL('../public/acervo/pf-2021-operacionais/'+arquivo,import.meta.url),'utf8'))
const itens=ler('questoes.json'),manifesto=ler('manifesto.json')
const localizar=id=>itens.find(q=>q.origens_provas.some(o=>o.id_original===id))
const origem=id=>{const q=localizar(id);return questaoNaProva(q,q.origens_provas.find(o=>o.id_original===id).concurso)}

test('PF 2021: 153 questões únicas preservam todas as 360 posições oficiais',()=>{
 assert.equal(itens.length,153)
 assert.equal(new Set(itens.map(q=>q.id)).size,153)
 assert.equal(itens.reduce((n,q)=>n+q.origens_provas.length,0),360)
 assert.equal(itens.filter(q=>q.anulada).length,7)
 assert.equal(unirQuestoes([...itens,...itens]).filter(q=>q.id.startsWith('pf-2021-operacionais-')).length,153)
 for(const q of itens){
  assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)),q.id)
  assert.deepEqual(q.opcoes,['Certo','Errado'])
  assert.deepEqual(q.rotulos_opcoes,['C','E'])
  assert.equal(q.origens_provas.length,concursosDaQuestao(q).length)
  for(const o of q.origens_provas){
   assert.equal(o.fonte_pdf.startsWith('https://www.gov.br/pf/'),true)
   assert.equal(o.fonte_gabarito.startsWith('https://www.gov.br/pf/'),true)
   assert.ok(o.apoio.length,o.id_original)
   for(const path of [o.imagem_original,...o.apoio.map(a=>a.imagem)]){
    assert.ok(!path.includes('em-revisao'),path)
    assert.ok(existsSync(new URL('../public'+path,import.meta.url)),path)
   }
  }
 }
})

test('cada cargo recupera sua numeração, imagens, gabarito e quantidade corrigível',()=>{
 const esperado={'pf-2021-agente':{corrigiveis:115,anuladas:[28,92,106,108,119]},'pf-2021-escrivao':{corrigiveis:115,anuladas:[28,92,101,103,113]},'pf-2021-papiloscopista':{corrigiveis:116,anuladas:[28,92,109,112]}}
 for(const m of manifesto.cadernos){
  const prova=itens.filter(q=>concursosDaQuestao(q).includes(m.concurso)).map(q=>questaoNaProva(q,m.concurso)).sort((a,b)=>a.numero_original-b.numero_original)
  assert.equal(prova.length,120,m.caderno)
  assert.deepEqual(prova.map(q=>q.numero_original),Array.from({length:120},(_,i)=>i+1))
  assert.equal(prova.filter(podeCorrigir).length,esperado[m.caderno].corrigiveis)
  assert.deepEqual(prova.filter(q=>q.anulada).map(q=>q.numero_original),esperado[m.caderno].anuladas)
  for(const q of prova){
   const n=q.numero_original,resposta=m.respostas[n-1]
   assert.equal(q.gabarito_oficial,resposta,q.id_original)
   assert.equal(q.resposta_correta,resposta==='X'?null:resposta==='C'?0:1,q.id_original)
   assert.equal(q.id_original,`${m.caderno}-${String(n).padStart(3,'0')}`)
   assert.ok(q.imagem_original.includes(`/${m.caderno}/q${String(n).padStart(3,'0')}.webp`))
   assert.match(q.enunciado,new RegExp(`(?:^|\\n)${n} `))
  }
 }
})

test('deduplicação mantém diferenças de casos e adapta numeração de questões idênticas',()=>{
 assert.notEqual(localizar('pf-2021-agente-034').id,localizar('pf-2021-papiloscopista-034').id)
 assert.equal(localizar('pf-2021-agente-055').id,localizar('pf-2021-escrivao-055').id)
 assert.equal(localizar('pf-2021-agente-102').id,localizar('pf-2021-escrivao-097').id)
 const q=localizar('pf-2021-agente-102')
 assert.equal(questaoNaProva(q,'Outro cargo'),null)
 assert.equal(origem('pf-2021-escrivao-097').numero_original,97)
 assert.notEqual(origem('pf-2021-escrivao-097').imagem_original,origem('pf-2021-agente-102').imagem_original)
})

test('frações, continuações, gráficos e casos completos ficam no item correto',()=>{
 for(const cargo of ['agente','escrivao','papiloscopista']){
  const q41=origem(`pf-2021-${cargo}-041`),q42=origem(`pf-2021-${cargo}-042`)
  assert.ok(q42.recortes_pdf[0].caixa[1]<792)
  assert.equal(q41.recortes_pdf[0].caixa[3],q42.recortes_pdf[0].caixa[1])
  assert.doesNotMatch(q41.enunciado,/cid:/)
  assert.ok(origem(`pf-2021-${cargo}-077`).apoio.some(a=>/traficantes/.test(a.texto)))
 }
 assert.match(origem('pf-2021-agente-108').enunciado,/dessas aplicações financeiras/)
 assert.match(origem('pf-2021-escrivao-103').enunciado,/dessas aplicações financeiras/)
 assert.doesNotMatch(origem('pf-2021-escrivao-097').apoio.map(a=>a.texto).join(' '),/API/)
 assert.doesNotMatch(origem('pf-2021-agente-102').apoio.map(a=>a.texto).join(' '),/elemento patrimonial/)
 assert.match(origem('pf-2021-papiloscopista-111').apoio.map(a=>a.texto).join(' '),/Figura A/)
 assert.match(origem('pf-2021-papiloscopista-119').apoio.map(a=>a.texto).join(' '),/Fe/)
})
