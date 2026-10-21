import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { corrigirQuestaoConferida, questaoPublicavel, unirQuestoes } from '../src/acervo.js'
import { listarProvasCompletas, questoesDaProva } from '../src/simulados.js'

const lote = JSON.parse(fs.readFileSync('public/acervo/espcex-2017-2026/questoes.json'))
const manifesto = JSON.parse(fs.readFileSync('docs/acervo/espcex-recuperacao-integral.json'))

test('recuperação preserva as 123 pendências e separa todas as alternativas do caderno', () => {
  assert.equal(manifesto.questoes.length, 248)
  assert.equal(manifesto.pendentes_recuperadas.length, 123)
  assert.equal(manifesto.arquivos.length, 1498)
  const recuperadas = new Set(manifesto.questoes.map(q => q.id))
  for (const id of manifesto.pendentes_recuperadas) assert.ok(recuperadas.has(id))
  for (const r of manifesto.questoes) {
    const q = lote.find(q => q.id === r.id)
    assert.equal(q.resposta_correta, r.resposta_correta)
    assert.equal(q.pagina, r.pagina)
    assert.equal(q.opcoes_imagens.length, 5)
    assert.equal(new Set(q.opcoes_imagens).size, 5)
    assert.equal(questaoPublicavel(corrigirQuestaoConferida(q)), true, q.id)
  }
  for (const a of manifesto.arquivos) {
    assert.equal(createHash('sha256').update(fs.readFileSync('public' + a.url)).digest('hex'), a.sha256, a.url)
    assert.ok(a.dimensoes.every(d => d > 10))
  }
})

test('EsPCEx oferece os 20 dias completos com posições sequenciais e modelo correspondente', () => {
  const unidas = unirQuestoes(lote).filter(q => q.banca === 'EsPCEx')
  assert.equal(unidas.length, 1000, 'rótulos auxiliares iguais não podem colapsar fórmulas distintas')
  const provas = listarProvasCompletas(unidas)
  assert.equal(provas.length, 20)
  for (const prova of provas) {
    const itens = questoesDaProva(unidas, prova.id)
    assert.equal(itens.length + prova.anuladas, prova.totalOriginal)
    assert.equal(new Set(itens.map(q => q.numero_original)).size, itens.length)
  }
  assert.ok(lote.filter(q => q.ano === 2026 && q.dia === 1).every(q => q.modelo === 'Versão 1'))
})

test('digitalizações conservam os 200 números e os textos compartilhados de ambos os idiomas', () => {
  const digitalizadas = manifesto.questoes.filter(q => /^espcex-202[34]-/u.test(q.id))
  assert.equal(digitalizadas.length, 200)
  assert.equal(manifesto.apoios.length, 10)
  for (const ano of [2023, 2024]) {
    for (const dia of [1, 2]) {
      const itens = lote.filter(q => q.ano === ano && q.dia === dia)
      assert.deepEqual(itens.map(q => q.numero_original), Array.from({ length: dia === 1 ? 44 : 56 }, (_, i) => i + 1))
      for (const q of itens.filter(q => dia === 1 ? q.numero_original <= 20 : q.numero_original >= 45)) {
        assert.equal(q.apoio.length, 1, q.id)
        assert.ok(fs.existsSync('public' + q.apoio[0].imagem))
      }
    }
  }
  const primeira = lote.find(q => q.id === 'espcex-2024-d1-01')
  assert.match(primeira.enunciado, /^De acordo com o texto/u)
  assert.match(primeira.opcoes[0], /palavra latina liber/u)
  const continuada = manifesto.questoes.find(q => q.id === 'espcex-2023-d1-19')
  assert.equal(continuada.partes_enunciado.length, 2)
  assert.notEqual(continuada.partes_enunciado[0][0], continuada.partes_enunciado[1][0])
  assert.deepEqual(manifesto.conferencia_gabaritos.divergencias, [])
  assert.equal(manifesto.conferencia_gabaritos.fontes.reduce((n, f) => n + f.questoes, 0), 1000)
})
