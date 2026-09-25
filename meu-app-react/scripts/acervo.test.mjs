import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { acervo as completo, anoDaQuestao, unirQuestoes, podeCorrigir } from '../src/acervo.js'
const acervo = completo.filter(q => q.banca === 'ESA')

test('a prova A tem 50 questões únicas e 47 corrigíveis', () => {
  assert.equal(acervo.length, 50)
  assert.equal(new Set(acervo.map(q => q.id)).size, 50)
  assert.deepEqual(acervo.map(q => q.numero_original), Array.from({ length:50 }, (_,i) => i+1))
  assert.deepEqual(acervo.filter(q => !podeCorrigir(q)).map(q => q.numero_original), [1,4,10])
  assert.equal(acervo.filter(podeCorrigir).length, 47)
  for (const q of acervo) {
    assert.equal(q.opcoes.length, 5)
    assert.ok(q.opcoes.every(v => v.trim()))
    assert.equal(anoDaQuestao(q), '2025')
    assert.ok(existsSync(new URL('../public' + q.imagem_original, import.meta.url)))
    for (const p of q.apoio) assert.ok(existsSync(new URL('../public' + p.imagem, import.meta.url)))
  }
})

test('respostas e distribuição conferem com o gabarito definitivo A', () => {
  // Transcrição independente por blocos de dez, da página 1 do gabarito.
  const gabarito = '-CA-AAAED-' + 'BDBBBBDBCD' + 'ACBCBEAEAC' + 'CECDEBEAAE' + 'AEBEEBCEBC'
  assert.equal(acervo.map(q => q.anulada ? '-' : 'ABCDE'[q.resposta_correta]).join(''), gabarito)
  assert.deepEqual(Object.fromEntries(['Matemática','Português','História','Geografia','Inglês'].map(m => [m,acervo.filter(q => q.materia === m).length])), {'Matemática':14,'Português':14,'História':6,'Geografia':6,'Inglês':10})
})

test('textos compartilhados incluem a continuação em outra página', () => {
  assert.equal(acervo[19].apoio.length, 2)
  assert.match(acervo[19].apoio[0].texto, /especialistas o considerem/)
  assert.match(acervo[47].apoio[0].texto, /patrols/)
  assert.match(acervo[47].apoio[1].texto, /neighbors/)
  assert.equal(acervo[17].apoio.length, 1)
})

test('anos desconhecidos continuam visíveis e registros existentes são preservados', () => {
  assert.equal(anoDaQuestao({}), 'Não informado')
  assert.equal(anoDaQuestao({concurso:'ESA 2024'}), '2024')
  assert.equal(anoDaQuestao({ano:2023,concurso:'ESA 2024'}), '2023')
  const antiga = { id:123, enunciado:'Questão existente', resposta_correta:0 }
  assert.equal(unirQuestoes([antiga]).length, completo.length + 1)
  assert.deepEqual(unirQuestoes([antiga]).find(q => q.id === 123), antiga)
  assert.equal(unirQuestoes([acervo[0]]).length, completo.length)
})

test('ENEM 2022 contém ambos os idiomas, 185 questões e os dois gabaritos oficiais', () => {
  const enem = completo.filter(q => q.banca === 'ENEM' && q.ano === 2022)
  assert.equal(enem.length, 185)
  assert.equal(new Set(enem.map(q => q.id)).size, 185)
  assert.equal(enem.filter(q => q.dia === 1).length, 95)
  assert.equal(enem.filter(q => q.dia === 2).length, 90)
  for (const idioma of ['Inglês', 'Espanhol']) {
    const idiomaQuestoes = enem.filter(q => q.idioma === idioma)
    assert.deepEqual(idiomaQuestoes.map(q => q.numero_original), [1,2,3,4,5])
    assert.equal(idiomaQuestoes.map(q => 'ABCDE'[q.resposta_correta]).join(''), idioma === 'Inglês' ? 'DCBDE' : 'EDCAA')
  }
  assert.deepEqual(enem.filter(q => !podeCorrigir(q)).map(q => q.numero_original), [157])
  assert.deepEqual(enem.filter(q => !q.idioma).map(q => q.numero_original), Array.from({length:175},(_,i)=>i+6))
  for (const q of enem) {
    assert.ok(q.enunciado.length > 30)
    assert.equal(q.opcoes.length, 5)
    assert.ok(q.opcoes.every(Boolean))
    assert.ok(q.anulada || Number.isInteger(q.resposta_correta) && q.resposta_correta >= 0 && q.resposta_correta <= 4)
    for (const file of [q.imagem_original, q.fonte_pdf, q.fonte_gabarito]) assert.ok(existsSync(new URL('../public' + file, import.meta.url)))
  }
  assert.equal(unirQuestoes(enem).length, completo.length)
})
