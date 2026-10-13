import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { incluirNoSimuladoUem, ESPECIFICAS_UEM } from '../src/uem.js'
import { corrigirQuestaoConferida, questaoPublicavel, unirQuestoes } from '../src/acervo.js'

for (const ano of [2021, 2022]) {
  test(`UEM ${ano} contém 140 registros oficiais e forma provas de 50 questões`, () => {
    const itens = JSON.parse(readFileSync(new URL(`../public/acervo/uem-${ano}-anual/questoes.json`, import.meta.url), 'utf8'))
    assert.equal(itens.length, 140)
    assert.equal(new Set(itens.map(q => q.id)).size, 140)
    assert.equal(itens.filter(q => !q.idioma && !q.bloco_especifico).length, 25)
    for (const materia of ESPECIFICAS_UEM) assert.equal(itens.filter(q => q.bloco_especifico === materia).length, 10, materia)
    for (const idioma of ['Inglês','Espanhol','Francês']) {
      assert.equal(itens.filter(q => q.idioma === idioma).length, 5)
      for (const especificas of [['Biologia','Química'],['Matemática','Física'],['Arte','História']]) {
        const prova = itens.filter(q => incluirNoSimuladoUem(q, idioma, especificas))
        assert.equal(prova.length, 50)
        assert.ok(prova.every(q => !q.idioma || q.idioma === idioma))
        assert.ok(prova.every(q => !q.bloco_especifico || especificas.includes(q.bloco_especifico)))
      }
    }
    assert.deepEqual(itens.filter(q => !questaoPublicavel(corrigirQuestaoConferida(q))).map(q => q.id), [])
    assert.equal(unirQuestoes(itens).filter(q => q.id.startsWith(`uem-${ano}-anual-`)).length, 140)
    for (const q of itens) {
      assert.equal(q.opcoes.length, 5, q.id)
      assert.equal(q.opcoes_imagens.length, 5, q.id)
      assert.deepEqual(q.valores_opcoes, [1,2,4,8,16], q.id)
      for (const url of [q.imagem_original, ...q.opcoes_imagens, ...(q.apoio || []).map(a => a.imagem)]) assert.ok(existsSync(new URL('../public' + url, import.meta.url)), url)
    }
  })
}

test('a seleção de específicas não remove questões de outras bancas', () => {
  assert.equal(incluirNoSimuladoUem({banca:'UFPR', materia:'Física'}, 'Inglês', ['Biologia','Química']), true)
})

for (const lote of ['uem-2019-ve','uem-2019-in','uem-2020-anual']) {
  test(`${lote} contém os dois dias, três idiomas e dez cadernos específicos`, () => {
    const itens = JSON.parse(readFileSync(new URL(`../public/acervo/${lote}/questoes.json`, import.meta.url), 'utf8'))
    assert.equal(itens.length, 220)
    assert.equal(new Set(itens.map(q => q.id)).size, 220)
    assert.deepEqual(itens.filter(q => q.dia === 1).map(q => q.numero_original), Array.from({length:40}, (_,i) => i+1))
    assert.equal(itens.filter(q => q.dia === 2 && !q.idioma && !q.bloco_especifico).length, 15)
    for (const materia of ESPECIFICAS_UEM) assert.equal(itens.filter(q => q.bloco_especifico === materia).length, 15, materia)
    for (const idioma of ['Inglês','Espanhol','Francês']) {
      assert.equal(itens.filter(q => q.idioma === idioma).length, 5)
      const prova = itens.filter(q => q.dia === 2 && incluirNoSimuladoUem(q, idioma, ['Matemática','História']))
      assert.equal(prova.length, 50)
    }
    assert.deepEqual(itens.filter(q => !questaoPublicavel(corrigirQuestaoConferida(q))).map(q => q.id), [])
    assert.equal(unirQuestoes(itens).filter(q => q.id.startsWith(lote+'-')).length, 220)
    for (const q of itens) {
      assert.equal(q.opcoes.length, 5, q.id)
      assert.equal(q.opcoes_imagens.length, 5, q.id)
      assert.equal(q.imagem_sem_alternativas, true, q.id)
      assert.deepEqual(q.valores_opcoes, [1,2,4,8,16], q.id)
      for (const url of [q.imagem_original, ...q.opcoes_imagens, ...(q.apoio || []).map(a => a.imagem)]) assert.ok(existsSync(new URL('../public'+url, import.meta.url)), url)
    }
  })
}

test('as onze aplicações UEM preservam 1.288 registros sem desaparecer na união do acervo', () => {
  const lotes = ['uem-2019-ve','uem-2019-in','uem-2020-anual','uem-2021-anual','uem-2022-anual','uem-2023-ve','uem-2023-in','uem-2024-ve','uem-2024-in','uem-2025','uem-2025-inverno']
  const todos = lotes.flatMap(nome => JSON.parse(readFileSync(new URL(`../public/acervo/${nome}/questoes.json`, import.meta.url), 'utf8')))
  assert.equal(todos.length, 1288)
  assert.equal(new Set(todos.map(q => q.id)).size, 1288)
  assert.equal(unirQuestoes(todos).filter(q => q.banca === 'UEM').length, 1288)
})

test('a matriz da afirmação 01 de Matemática UEM 2021 fica inteira fora do enunciado', () => {
  const dimensoes = nome => {
    const buffer = readFileSync(new URL(`../public/acervo/uem-2021-anual/${nome}.webp`, import.meta.url))
    assert.equal(buffer.subarray(12,16).toString(), 'VP8 ')
    return {largura:buffer.readUInt16LE(26) & 0x3fff, altura:buffer.readUInt16LE(28) & 0x3fff}
  }
  const alternativa = dimensoes('uem-2021-anual-mat-36-01')
  const enunciado = dimensoes('uem-2021-anual-mat-36-enunciado')
  assert.ok(alternativa.altura >= 100 && alternativa.altura <= 120, 'a primeira linha da matriz não pode ficar no enunciado')
  assert.ok(enunciado.altura >= 100 && enunciado.altura <= 120, 'o enunciado termina antes da matriz')
})
