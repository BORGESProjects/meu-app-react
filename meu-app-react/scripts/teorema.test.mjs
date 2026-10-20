import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { corrigirQuestaoConferida, questaoPublicavel, unirQuestoes } from '../src/acervo.js'

const root = new URL('../public/acervo/teorema-180/', import.meta.url)
const questoes = JSON.parse(fs.readFileSync(new URL('questoes.json', root), 'utf8'))

test('lote reconstruído preserva 102 questões únicas e todas as imagens vinculadas', () => {
  assert.equal(questoes.length, 102)
  assert.equal(new Set(questoes.map(q => q.id)).size, 102)
  for (const q of questoes) {
    assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)), q.id)
    assert.equal(q.opcoes_imagens.length, q.opcoes.length, q.id)
    for (const imagem of [q.imagem_original, ...q.opcoes_imagens]) {
      assert.ok(imagem.startsWith('/acervo/teorema-180/'))
      const bytes = fs.readFileSync(new URL('../public' + imagem, import.meta.url))
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF')
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP')
    }
  }
  assert.equal(unirQuestoes(questoes).filter(q => q.id?.startsWith('teorema-')).length, 102)
})

test('gabarito divergente do CSV usa a resposta conferida no PDF', () => {
  const escala = questoes.find(q => q.id === 'teorema-3ab050dc14756689')
  assert.equal(escala.resposta_correta, 4)
  assert.equal(escala.gabarito_corrigido_do_csv, true)
  assert.equal(escala.opcoes[4], 'III e IV.')
  assert.equal(questoes.filter(q => q.gabarito_corrigido_do_csv).length, 20)
})

test('classificação conserva identificação e não inventa ano para assimilação', () => {
  for (const q of questoes) {
    assert.ok(!/\d/.test(q.banca), q.banca)
    if (q.banca === 'Questões de assimilação') {
      assert.equal(q.ano, null)
      assert.equal(q.concurso, 'Questões de assimilação')
    }
    assert.ok(q.fonte_material.numero > 0)
    assert.equal(q.fonte_material.gabarito, 'Conferido no gabarito do material')
  }
  assert.ok(questoes.some(q => q.banca === 'Colégio Naval'))
  assert.ok(questoes.some(q => q.banca === 'UFMA' && q.ano === 2006))
})
