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
