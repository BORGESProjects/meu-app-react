import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { corrigirQuestaoConferida, questaoPublicavel, unirQuestoes } from '../src/acervo.js'

const root = new URL('../public/acervo/teorema-180/', import.meta.url)
const questoes = JSON.parse(fs.readFileSync(new URL('questoes.json', root), 'utf8'))
const primeiroLote = questoes.filter(q => !q.fonte_material.registro_csv)

test('lote reconstruído preserva os 102 itens iniciais e todas as imagens vinculadas', () => {
  assert.equal(primeiroLote.length, 102)
  assert.equal(new Set(questoes.map(q => q.id)).size, questoes.length)
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
  assert.equal(unirQuestoes(questoes).filter(q => q.id?.startsWith('teorema-')).length, questoes.length)
})

test('gabarito divergente do CSV usa a resposta conferida no PDF', () => {
  const escala = questoes.find(q => q.id === 'teorema-3ab050dc14756689')
  assert.equal(escala.resposta_correta, 4)
  assert.equal(escala.gabarito_corrigido_do_csv, true)
  assert.equal(escala.opcoes[4], 'III e IV.')
  assert.equal(primeiroLote.filter(q => q.gabarito_corrigido_do_csv).length, 20)
})

test('classificação conserva identificação e não inventa ano para assimilação', () => {
  for (const q of questoes) {
    assert.ok(!/^[A-Z]$|^[GS][12]$/.test(q.banca), q.banca)
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

test('fórmulas diferentes não são unidas apenas pelo texto auxiliar', () => {
  const base = {...questoes[0], extracao_visual_verificada:true}
  const a = {...base, id:'teorema-aaaaaaaaaaaaaaaa', identidade_visual:'a'.repeat(64)}
  const b = {...base, id:'teorema-bbbbbbbbbbbbbbbb', identidade_visual:'b'.repeat(64)}
  assert.equal(unirQuestoes([a,b]).filter(q => [a.id,b.id].includes(q.id)).length,2)
  assert.equal(unirQuestoes([a,{...b,identidade_visual:a.identidade_visual}]).filter(q => [a.id,b.id].includes(q.id)).length,1)
})
