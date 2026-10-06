import test from 'node:test'
import assert from 'node:assert/strict'
import { formatarTextoAlternativa } from '../src/textoQuestao.js'

test('usa a largura disponível removendo quebras artificiais do PDF', () => {
  assert.equal(
    formatarTextoAlternativa('Os farroupilhas eram pequenos proprietários rurais e\ncomerciantes, representavam o setor mais conserva-\ndor do grupo.'),
    'Os farroupilhas eram pequenos proprietários rurais e comerciantes, representavam o setor mais conservador do grupo.',
  )
  assert.equal(formatarTextoAlternativa('medidas centralizado-\nras.'), 'medidas centralizadoras.')
})

test('preserva parágrafos e não confunde subtração com palavra hifenizada', () => {
  assert.equal(formatarTextoAlternativa('Primeiro parágrafo.\n\nSegundo parágrafo.'), 'Primeiro parágrafo.\n\nSegundo parágrafo.')
  assert.equal(formatarTextoAlternativa('x-\ny = 2'), 'x- y = 2')
})
