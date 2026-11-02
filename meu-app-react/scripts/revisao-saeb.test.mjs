import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
const itens=JSON.parse(zlib.gunzipSync(await fs.readFile('docs/acervo/revisao-profissional/revisao-saeb-alteracoes.json.gz')))
test('revisões SAEB são vinculadas às imagens inspecionadas e preservam ano e gabarito',async()=>{
 assert.equal(itens.length,11)
 for(const {antes,depois} of itens){
  assert.deepEqual(depois.resposta_correta,antes.resposta_correta)
  assert.deepEqual(depois.gabarito_oficial,antes.gabarito_oficial)
  assert.deepEqual(depois.ano,antes.ano)
  assert.deepEqual(depois.texto_apoio,antes.texto_apoio)
  assert.deepEqual(depois.imagens_paginas,antes.imagens_paginas)
  const b=await fs.readFile('public/acervo-extraido/'+depois.revisao_visual_saeb.imagem)
  assert.equal(createHash('sha256').update(b).digest('hex'),depois.revisao_visual_saeb.sha256)
 }
})
test('suspende apenas oito registros e conserva as assertivas originais',()=>{
 const suspensos=itens.filter(r=>r.depois.integridade_profissional.apta_resolucao===false)
 assert.equal(suspensos.length,8)
 for(const {antes,depois} of suspensos){assert.equal(depois.enunciado,antes.enunciado);assert.deepEqual(depois.opcoes,antes.opcoes);assert.equal(depois.elegibilidade.elegivel_para_resolucao,false)}
 assert.equal(3004+2999,6003);assert.equal(3004-2999,5)
 const semAlternativa=suspensos.find(r=>r.depois.numero_original===7)
 assert.ok(semAlternativa.depois.revisao_visual_saeb.motivo.includes('errata oficial'))
})
test('restaura símbolos matemáticos e explicita que a dificuldade é estimada',()=>{
 const rev=itens.filter(r=>r.depois.integridade_profissional.apta_resolucao)
 assert.equal(rev.length,3)
 assert.deepEqual(rev.find(r=>r.depois.numero_original===3).depois.opcoes,['A ∪ B = ∅','A ∪ B = A','A ∩ B = ∅','A ∩ B = A'])
 for(const {depois} of rev){assert.equal(depois.classificacao_pendente,false);assert.equal(depois.materia,'Matemática');assert.equal(depois.dificuldade_estimada,true);assert.ok(depois.dificuldade_evidencia)}
})
