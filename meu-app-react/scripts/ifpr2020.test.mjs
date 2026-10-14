import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { questaoPublicavel, corrigirQuestaoConferida, unirQuestoes } from '../src/acervo.js'

test('IFPR 2020: lote inicial mantém quatro alternativas, gabarito definitivo e poema integral', () => {
  const itens = JSON.parse(readFileSync(new URL('../public/acervo/ifpr-2020/questoes.json', import.meta.url), 'utf8'))
  assert.deepEqual(itens.map(q => q.numero_original), [1,2,3,4])
  assert.deepEqual(itens.map(q => q.resposta_correta), [2,3,1,3])
  assert.equal(unirQuestoes(itens).filter(q => String(q.id).startsWith('ifpr-2020-')).length, 4)
  for (const q of itens) {
    assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)), q.id)
    assert.equal(q.opcoes.length, 4)
    assert.equal(q.opcoes_imagens.length, 4)
    assert.equal(q.prova_incompleta, true)
    assert.equal(q.imagem_sem_alternativas, true)
    assert.ok(q.fonte_gabarito.endsWith('gabarito.pdf'))
    assert.equal(q.apoio[0].imagem, '/acervo/ifpr-2020/poema-em-linha-reta.webp')
    for (const texto of [q.enunciado, ...q.opcoes]) {
      assert.ok(!texto.includes(String.fromCharCode(2)) && !texto.includes('�'), q.id)
      assert.doesNotMatch(texto, /\b[A-D]\)/, q.id)
    }
    for (const url of [q.imagem_original, ...q.opcoes_imagens, q.apoio[0].imagem]) assert.ok(existsSync(new URL('../public'+url, import.meta.url)), url)
  }
  assert.match(itens[0].opcoes[3], /^O eu lírico gostaria/)
  assert.match(itens[3].opcoes[3], /^O eu lírico afirma/)
})
