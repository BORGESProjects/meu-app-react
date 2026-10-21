import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {blocosValidos} from '../src/blocosQuestao.js'
import {questaoPublicavel,unirQuestoes} from '../src/acervo.js'
import {normalizarBlocos} from './sae/formato-publicacao.mjs'
const lote=JSON.parse(fs.readFileSync(new URL('../public/acervo/estudo-biologia-microorganismos/questoes.json',import.meta.url),'utf8'))
const audit=JSON.parse(fs.readFileSync(new URL('../docs/acervo/estudo-biologia-microorganismos.json',import.meta.url),'utf8'))
test('microrganismos fecha os 75 registros com 48 questões completas e sem repetidas',()=>{
 assert.equal(lote.length,48);assert.equal(lote.length+audit.duplicatas.length+audit.quarentena.length,75)
 assert.deepEqual(audit.capitulos.map(c=>c.publicados.length),[15,18,15])
 const ids=new Set(unirQuestoes(lote).map(q=>q.id));assert.ok(lote.every(q=>ids.has(q.id)))
 for(const q of lote){assert.ok(questaoPublicavel(q),q.id);assert.ok(blocosValidos(q.blocos_enunciado));assert.equal(q.blocos_opcoes.length,q.opcoes.length);assert.ok(q.blocos_opcoes.every(blocosValidos));assert.ok(Number.isInteger(q.resposta_correta));assert.ok(q.resposta_correta>=0&&q.resposta_correta<q.opcoes.length);assert.equal(new Set(q.opcoes).size,q.opcoes.length);assert.doesNotMatch(q.enunciado,/undefined|Acertos:|Pontuação Final:/u);assert.equal(q.tipo_origem,'prova_identificada',q.id)}
 for(const a of [...audit.quarentena,...audit.duplicatas])assert.ok(!lote.some(q=>q.id===a.id))
})
test('fluxograma do ENEM e tabelas permanecem completos e separados das alternativas',()=>{
 const q=lote.find(q=>q.id==='sae-56702b0d094660b739ff');assert.equal(q.resposta_correta,3);assert.equal(q.opcoes.length,5)
 assert.equal(audit.recursos.length,1)
 const r=audit.recursos[0];assert.ok(JSON.stringify(q.blocos_enunciado).includes(r.imagem));assert.ok(!JSON.stringify(q.blocos_opcoes).includes(r.imagem))
 assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../public'+r.imagem,import.meta.url))).digest('hex'),r.sha256)
 const tabela=lote.find(q=>q.id==='sae-3dfbcab1ac16fd2b3e4f');assert.ok(JSON.stringify(tabela.blocos_enunciado).includes('Treponema'));assert.ok(JSON.stringify(tabela.blocos_enunciado).includes('"table"'))
})
test('colgroup de largura é descartado sem apagar células ou aceitar conteúdo inesperado',()=>{
 const col={tag:'colgroup',children:[{tag:'col',attrs:{width:'30%'},children:[]}]}
 assert.deepEqual(normalizarBlocos([col,{tag:'p',children:['Texto']}],()=>''),[{tag:'p',children:['Texto']}])
 assert.throws(()=>normalizarBlocos([{tag:'colgroup',children:[{tag:'script',children:['x']}]}],()=>''))
})
