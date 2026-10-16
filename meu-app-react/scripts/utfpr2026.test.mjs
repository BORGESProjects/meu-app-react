import test from 'node:test'
import assert from 'node:assert/strict'
import {existsSync, readFileSync} from 'node:fs'
import {corrigirQuestaoConferida, questaoPublicavel, unirQuestoes, podeCorrigir} from '../src/acervo.js'
import {concursosDaQuestao, questaoNaProva} from '../src/provasCompartilhadas.js'

const qs = JSON.parse(readFileSync(new URL('../public/acervo/utfpr-2026/questoes.json', import.meta.url), 'utf8'))
const manifest = JSON.parse(readFileSync(new URL('../public/acervo/utfpr-2026/manifesto.json', import.meta.url), 'utf8'))

test('UTFPR 2026: dois idiomas completos, núcleo comum único e gabarito retificado', () => {
  assert.equal(qs.length, 44)
  assert.equal(new Set(qs.map(q => q.id)).size, 44)
  assert.equal(manifest.questoes_por_idioma, 40)
  assert.match(manifest.fonte_gabarito, /gabarito_vest_definitivo_311225/)
  for (const idioma of ['Inglês', 'Espanhol']) {
    const nome = `Vestibular de Verão UTFPR 2026 — ${idioma}`
    const prova = qs.filter(q => concursosDaQuestao(q).includes(nome)).map(q => questaoNaProva(q, nome)).sort((a,b) => a.numero_original-b.numero_original)
    assert.deepEqual(prova.map(q => q.numero_original), Array.from({length:40}, (_,i) => i+1))
    assert.equal(prova.filter(podeCorrigir).length, 39)
    assert.deepEqual(prova.filter(q => q.anulada).map(q => q.numero_original), [34])
    const letras = prova.map(q => q.gabarito_oficial).join('')
    assert.equal(letras, 'CECBEDBA'+(idioma === 'Inglês' ? 'DABC' : 'BCED')+'EDBAAAECBECBDCB EDE AADXC ADBDE'.replaceAll(' ', ''))
  }
  assert.equal(unirQuestoes([...qs, ...qs]).filter(q => q.id.startsWith('utfpr-2026-')).length, 44)
})

test('UTFPR 2026: todos os itens sobrevivem à validação e possuem imagens separadas', () => {
  for (const q of qs) {
    assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)), q.id)
    assert.equal(q.ano, 2026)
    assert.equal(q.data_aplicacao, '2025-11-23')
    assert.equal(q.opcoes.length, 5)
    assert.equal(q.opcoes_imagens.length, 5)
    assert.equal(q.imagem_sem_alternativas, true)
    assert.ok(q.conteudo && q.materia && q.fonte_pdf && q.fonte_gabarito)
    assert.equal(q.resposta_correta, q.anulada ? null : q.gabarito_oficial.charCodeAt(0)-65)
    for (const img of [q.imagem_original, ...q.opcoes_imagens, ...q.apoio.map(a => a.imagem)]) {
      assert.ok(existsSync(new URL('../public'+img, import.meta.url)), img)
      assert.ok(!img.includes('em-revisao'))
    }
    if (q.numero_original >= 3 && q.numero_original <= 8 || q.idioma === 'Inglês' || q.idioma === 'Espanhol' && q.numero_original >= 11) {
      assert.equal(q.apoio.length, 1, q.id)
    }
  }
})

test('UTFPR 2026: continuidades de colunas, textos-base e frações mantêm o conteúdo', () => {
  const q = id => qs.find(q => q.id === 'utfpr-2026-'+id)
  assert.match(q('38').enunciado, /descrito/)
  assert.match(q('40').enunciado, /III/)
  assert.match(q('40').enunciado, /IV/)
  assert.match(q('10-en').enunciado, /gaming storefronts/)
  assert.match(q('09-es').enunciado, /departamento/)
  for (const n of ['23','24','28','31','32','33','36']) assert.ok(q(n).imagem_original)
  assert.equal(q('31').opcoes_imagens.length, 5)
  assert.equal(q('34').anulada, true)
})
