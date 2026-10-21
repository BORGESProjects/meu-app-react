import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { imagemDaAlternativa } from '../src/textoQuestao.js'
import { blocosValidos } from '../src/blocosQuestao.js'
import { corrigirQuestaoConferida, questaoPublicavel, unirQuestoes } from '../src/acervo.js'
import { listarProvasCompletas } from '../src/simulados.js'

const lote = JSON.parse(readFileSync('public/acervo/espcex-2017-2026/questoes.json'))
const manifesto = JSON.parse(readFileSync('docs/acervo/espcex-alternativas-transcritas.json'))
const porId = new Map(lote.map(q => [q.id, q]))

test('1.285 alternativas transcritas usam texto, com fonte e gabarito preservados', () => {
  assert.equal(manifesto.questoes.length, 257)
  for (const registro of manifesto.questoes) {
    const q = corrigirQuestaoConferida(porId.get(registro.id))
    assert.equal(q.resposta_correta, registro.resposta_correta, q.id)
    assert.equal(questaoPublicavel(q), true, q.id)
    assert.deepEqual(q.opcoes, registro.opcoes, q.id)
    for (let i = 0; i < 5; i++) {
      assert.equal(imagemDaAlternativa(q, i), null, `${q.id}: ${i}`)
      assert.doesNotMatch(q.opcoes[i], /consulte o recorte|\[(?:A|B|C|D|E)\]/u)
      const fonte = registro.fontes[i]
      assert.equal(createHash('sha256').update(readFileSync('public' + fonte.imagem)).digest('hex'), fonte.sha256)
    }
    if (q.blocos_opcoes) assert.ok(q.blocos_opcoes.every(blocosValidos), q.id)
  }
  const espcex = unirQuestoes(lote).filter(q => q.banca === 'EsPCEx')
  assert.equal(espcex.length, 1000)
  assert.equal(listarProvasCompletas(espcex).length, 20)
})

test('mapas e gráficos reais continuam visuais; texto auxiliar não os substitui', () => {
  assert.equal(manifesto.visuais_preservadas.length, 9)
  for (const id of manifesto.visuais_preservadas) {
    const q = porId.get(id)
    for (let i = 0; i < 5; i++) assert.equal(imagemDaAlternativa(q, i), q.opcoes_imagens[i])
  }
  assert.equal(imagemDaAlternativa({ opcoes: ['Alternativa A — consulte o recorte original.'], opcoes_em_texto: [true], opcoes_imagens: ['/figura.webp'] }, 0), '/figura.webp')
})

test('transcrição conserva símbolos, distratores e destaques que mudam a interpretação', () => {
  assert.equal(porId.get('espcex-2020-d1-25').opcoes[2], '6,3·10⁻⁶ J')
  assert.equal(porId.get('espcex-2017-d2-03').opcoes[2], '−3√3/5')
  assert.match(porId.get('espcex-2024-d2-04').opcoes[3], /\(−3x³ − x² \+ 5x − 10\)\/\(2x − 5\)/u)
  assert.match(porId.get('espcex-2024-d1-01').opcoes[1], /primórdios da vida humana/u)
  // Não corrigir uma afirmação deliberadamente errada que pertence à prova.
  assert.match(porId.get('espcex-2024-d1-44').opcoes[0], /C₆H₆SO₃/u)
  assert.equal(porId.get('espcex-2023-d1-04').opcoes[2], 'Pararelo.')
  const grifos = porId.get('espcex-2023-d1-12').blocos_opcoes
  assert.deepEqual(grifos.map(b => b.find(n => n.tag === 'u').children[0]), ['Ele', 'calma', 'modo', 'vista', 'me'])
})
