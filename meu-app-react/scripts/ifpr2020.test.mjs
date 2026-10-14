import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { incluirNoSimuladoIfpr } from '../src/ifpr.js'
import { questaoPublicavel, corrigirQuestaoConferida, unirQuestoes } from '../src/acervo.js'

test('IFPR 2020: lote inicial mantém quatro alternativas, gabarito definitivo e poema integral', () => {
  const itens = JSON.parse(readFileSync(new URL('../public/acervo/ifpr-2020/questoes.json', import.meta.url), 'utf8')).slice(0,4)
  assert.deepEqual(itens.map(q => q.numero_original), [1,2,3,4])
  assert.deepEqual(itens.map(q => q.resposta_correta), [2,3,1,3])
  assert.equal(unirQuestoes(itens).filter(q => String(q.id).startsWith('ifpr-2020-')).length, 4)
  for (const q of itens) {
    assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)), q.id)
    assert.equal(q.opcoes.length, 4)
    assert.equal(q.opcoes_imagens.length, 4)
    assert.ok(!q.prova_incompleta)
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

test('IFPR 2020 completo forma provas de 50 questões e confere todos os gabaritos', () => {
  const itens = JSON.parse(readFileSync(new URL('../public/acervo/ifpr-2020/questoes.json', import.meta.url), 'utf8'))
  assert.equal(itens.length, 55)
  assert.equal(new Set(itens.map(q => q.id)).size, 55)
  assert.equal(unirQuestoes(itens).filter(q => String(q.id).startsWith('ifpr-2020-')).length, 55)
  assert.equal(itens.filter(q => !q.idioma).map(q => 'ABCD'[q.resposta_correta]).join(''), 'CDBDBADACACABBDDBCACDABBCADACDCBDABADBCBAABDC')
  for (const [idioma, respostas] of [['Inglês','CBCDA'],['Espanhol','ACBBD']]) {
    assert.equal(itens.filter(q => q.idioma === idioma).map(q => 'ABCD'[q.resposta_correta]).join(''), respostas)
    const prova = itens.filter(q => incluirNoSimuladoIfpr(q, idioma))
    assert.equal(prova.length, 50)
    assert.deepEqual(prova.map(q => q.numero_original), Array.from({length:50}, (_,i) => i+1))
  }
  for (const q of itens) {
    assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)), q.id)
    assert.equal(q.opcoes.length, 4)
    assert.equal(q.opcoes_imagens.length, 4)
    assert.ok(!q.prova_incompleta)
    for (const url of [q.imagem_original, ...q.opcoes_imagens, ...q.apoio.map(a => a.imagem)]) assert.ok(existsSync(new URL('../public'+url, import.meta.url)), url)
  }
  const espanhol = itens.find(q => q.id === 'ifpr-2020-esp-46')
  assert.match(espanhol.apoio[0].texto, /Montevideo/)
  const estatic = itens.find(q => q.id === 'ifpr-2020-19')
  assert.deepEqual(estatic.opcoes, ['50√3 N.','50 N.','100√3 N.','150 N.'])
})
