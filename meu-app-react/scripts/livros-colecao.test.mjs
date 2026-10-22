import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {questaoPublicavel,unirQuestoes} from '../src/acervo.js'
import {blocosValidos} from '../src/blocosQuestao.js'
import {carregarLoteLivro} from '../src/livrosAcervo.js'

const ler=p=>JSON.parse(fs.readFileSync(p))
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const catalogo=ler('src/data/livrosComplementares.json')

test('sete matérias mantêm contagem, arquivos, gabaritos e todos os destinos da triagem',async()=>{
 assert.equal(catalogo.length,7)
 const ids=new Set(),todos=[]
 for(const meta of catalogo){
  const arquivo='public'+meta.url
  assert.equal(sha(arquivo),meta.sha256)
  const lote=ler(arquivo)
  const auditoria=ler('docs/acervo/'+meta.url.split('/')[2]+'.json')
  assert.equal(lote.length,meta.quantidade)
  assert.deepEqual(await carregarLoteLivro(meta,async()=>({ok:true,json:async()=>lote})),lote)
  assert.equal(auditoria.total_extraido,auditoria.publicados.length+auditoria.quarentena.length+auditoria.duplicatas.length)
  assert.deepEqual(lote.map(q=>q.id),auditoria.publicados)
  for(const recurso of auditoria.recursos)assert.equal(sha('public'+recurso.imagem),recurso.sha256)
  for(const q of lote){
   assert.equal(ids.has(q.id),false,q.id);ids.add(q.id)
   assert.equal(questaoPublicavel(q),true,q.id)
   assert.equal(q.materia,meta.materia)
   assert.equal(blocosValidos(q.blocos_enunciado),true,q.id)
   assert.equal(q.blocos_opcoes.length,q.opcoes.length)
   assert.ok(q.blocos_opcoes.every(blocosValidos),q.id)
   assert.ok(Number.isInteger(q.resposta_correta)&&q.resposta_correta>=0&&q.resposta_correta<q.opcoes.length,q.id)
   assert.doesNotMatch(JSON.stringify([q.blocos_enunciado,q.blocos_opcoes]),/correta_livro|alternativaCorreta|<script|javascript:/u,q.id)
  }
  todos.push(...lote)
 }
 const unidos=unirQuestoes(todos)
 const idsUnidos=new Set(unidos.map(q=>String(q.id)))
 assert.ok(todos.every(q=>idsUnidos.has(q.id)),'Nenhum item novo desaparece na união dos sete lotes')
})

test('estado distingue triagem terminada de material incompleto na origem',()=>{
 const e=ler('docs/acervo/estado-importacao-livros.json')
 assert.equal(e.inventario_processado,true)
 assert.equal(e.triagem_concluida,true)
 assert.equal(e.concluido,false)
 assert.equal(e.materias.length,7)
 assert.ok(e.materias.every(m=>m.revisao_pendente===0))
 assert.ok(e.capitulos.some(c=>c.indisponibilidade))
})
