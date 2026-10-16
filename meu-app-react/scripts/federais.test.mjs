import test from 'node:test'
import assert from 'node:assert/strict'
import {existsSync,readFileSync} from 'node:fs'
import {corrigirQuestaoConferida,questaoPublicavel,unirQuestoes,podeCorrigir} from '../src/acervo.js'
import {concursosDaQuestao,incluirIdiomaDaProva} from '../src/provasCompartilhadas.js'
const ler=(nome,arquivo='questoes.json')=>JSON.parse(readFileSync(new URL(`../public/acervo/${nome}/${arquivo}`,import.meta.url),'utf8'))
for(const [nome,totalCorrigivel,anuladas] of [['prf-2019',108,[3,31,33,61,62,72,73,75,83,91,109,113]],['pf-2021-delegado',116,[2,4,53,112]]]) {
 test(`${nome}: caderno completo, gabarito definitivo e recortes existentes`,()=>{
  const qs=ler(nome),manifesto=ler(nome,'manifesto.json')
  assert.equal(qs.length,120)
  assert.deepEqual(qs.map(q=>q.numero_original),Array.from({length:120},(_,i)=>i+1))
  assert.deepEqual(qs.filter(q=>q.anulada).map(q=>q.numero_original),anuladas)
  assert.equal(qs.filter(podeCorrigir).length,totalCorrigivel)
  assert.equal(manifesto.respostas.length,120)
  assert.match(manifesto.sha256_pdf,/^[a-f0-9]{64}$/)
  for(const q of qs){
   assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)),q.id)
   assert.equal(q.tipo_resposta,'certo_errado')
   assert.deepEqual(q.opcoes,['Certo','Errado'])
   const letra=manifesto.respostas[q.numero_original-1]
   assert.equal(q.gabarito_oficial,letra)
   assert.equal(q.resposta_correta,letra==='X'?null:letra==='C'?0:1)
   assert.ok(q.materia && q.conteudo && q.fonte_gabarito)
   assert.equal(q.imagem_sem_alternativas,true)
   assert.ok(q.apoio.length>0,q.id)
   for(const path of [q.imagem_original,...q.apoio.map(a=>a.imagem)]){
    assert.ok(!path.includes('em-revisao'),path)
    assert.ok(existsSync(new URL('../public'+path,import.meta.url)),path)
   }
  }
  const unidos=unirQuestoes([...qs,...qs]).filter(q=>q.id.startsWith(nome+'-'))
  assert.equal(unidos.length,120)
 })
}
test('apoios jurídicos e gráficos necessários acompanham os itens isolados',()=>{
 const prf=ler('prf-2019'),pf=ler('pf-2021-delegado')
 for(const n of [24,25,26,35,36,37,45,46]) assert.ok(prf[n-1].apoio.length,`PRF ${n}`)
 assert.match(prf[26].apoio.map(a=>a.texto).join(' '),/350/)
 assert.ok(prf.every(q=>q.apoio.every(a=>!/^Espaço livre\s*(TEXTO)?$/i.test(a.texto))))
 assert.match(pf[12].apoio.map(a=>a.texto).join(' '),/concurso para o preenchimento/)
 assert.match(pf[97].apoio.map(a=>a.texto).join(' '),/ligaç[oã]o an[oô]nima/)
})
test('cadernos compartilhados mantêm associação única e PRF respeita idioma escolhido',()=>{
 assert.deepEqual(concursosDaQuestao({concurso:'Comum',provas:['Agente','Escrivão','Agente']}),['Agente','Escrivão'])
 assert.equal(incluirIdiomaDaProva({banca:'PRF',idioma:'Espanhol'},'Inglês'),false)
 assert.equal(incluirIdiomaDaProva({banca:'PRF'},'Espanhol'),true)
})

test('PRF 2021 preserva 128 itens e monta 120 por idioma, sem repetir núcleo comum',()=>{
 const qs=ler('prf-2021'),manifesto=ler('prf-2021','manifesto.json')
 assert.equal(qs.length,128)
 assert.equal(qs.filter(q=>!q.idioma).length,112)
 assert.equal(qs.filter(podeCorrigir).length,117)
 const originais=new Map(manifesto.blocos.flatMap(b=>b.numeros.map((n,i)=>[`${b.caderno}-${String(n).padStart(3,'0')}`,b.respostas[i]])))
 assert.equal(originais.size,128)
 for(const q of qs){
  assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)),q.id)
  assert.deepEqual(q.opcoes,['Certo','Errado'])
  assert.deepEqual(q.rotulos_opcoes,['C','E'])
  assert.equal(q.gabarito_oficial,originais.get(q.id),q.id)
  assert.equal(q.resposta_correta,q.gabarito_oficial==='X'?null:q.gabarito_oficial==='C'?0:1,q.id)
  assert.ok(q.apoio.length,q.id)
  for(const caminho of [q.imagem_original,...q.apoio.map(a=>a.imagem)]){
   assert.ok(existsSync(new URL('../public'+caminho,import.meta.url)),caminho)
   assert.ok(!caminho.includes('em-revisao'),caminho)
  }
 }
 for(const idioma of ['Inglês','Espanhol']){
  const prova=qs.filter(q=>incluirIdiomaDaProva(q,idioma))
  assert.equal(prova.length,120)
  assert.equal(prova.filter(podeCorrigir).length,110)
  assert.deepEqual(prova.map(q=>q.numero_original).sort((a,b)=>a-b),Array.from({length:120},(_,i)=>i+1))
 }
 assert.equal(unirQuestoes([...qs,...qs]).filter(q=>q.id.startsWith('prf-2021-')).length,128)
 assert.deepEqual(qs.filter(q=>!q.idioma&&q.anulada).map(q=>q.numero_original),[39,45,67,69,76,83,89,98,99])
})
test('PRF 2021 mantém o texto-base integral em Inglês e Espanhol, inclusive continuação',()=>{
 const qs=ler('prf-2021')
 for(const q of qs.filter(q=>q.idioma)){
  const apoio=q.apoio.map(a=>a.texto).join(' ')
  assert.ok(q.apoio.length>=2,q.id)
  if(q.idioma==='Inglês'){
   assert.match(apoio,/Lone Star/)
   assert.match(apoio,/can't import power either|can’t import power either/)
  }else{
   assert.match(apoio,/Una helada profunda/)
   assert.match(apoio,/La crisis energética/)
   assert.match(apoio,/tampoco puede importar energía/)
  }
 }
 const ing=qs.filter(q=>q.idioma==='Inglês'),esp=qs.filter(q=>q.idioma==='Espanhol')
 assert.equal(ing.map(q=>q.gabarito_oficial).join(''),'XCECECCE')
 assert.equal(esp.map(q=>q.gabarito_oficial).join(''),'XECCEECC')
 for(const n of [43,44])assert.match(qs.find(q=>q.numero_original===n&&!q.idioma).apoio.map(a=>a.texto).join(' '),/mola/)
})
