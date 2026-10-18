import test from 'node:test'
import assert from 'node:assert/strict'
import { ASSIMILACAO, classificarReferencia } from './classificacao.mjs'

test('recupera referências reais após número e competências do livro', () => {
  for (const [texto, banca, ano] of [
    ['Resolução  2.C5:H17 (UFRGS-2018) Considere...', 'UFRGS', 2018],
    ['15.C7:H24 (Enem-2019) Um teste...', 'ENEM', 2019],
    ['27.C7:H24 (Espcex-2023) A elaboração...', 'EsPCEx', 2023],
    ['11.C5:H17 (IFCE - 2019) Comparando...', 'IFCE', 2019],
    ['5.C5:H17 (COSEAC-UFF-2016) A palavra...', 'COSEAC-UFF', 2016],
  ]) {
    const resultado = classificarReferencia(texto)
    assert.equal(resultado.banca, banca)
    assert.equal(resultado.ano, ano)
    assert.equal(resultado.tipo_origem, 'prova_identificada')
  }
})

test('não inventa ano ou banca a partir de citação, assunto ou edição do livro', () => {
  for (const texto of [
    'Resolução 1. Diferentemente das câmeras de 1860. FONTES, Bruna, 2017. Acesso em 2020.',
    '4.C5:H17 O desastre radioativo ocorreu em Goiânia, em 1987.',
    '3. (H2O) Analise a molécula.',
    '1. (2026) Analise as afirmações.',
    '1. (FONTES-2017) Texto de apoio sem identificação de prova.',
    'Texto sobre o ENEM de 2019, sem identificação de autoria do exercício.',
  ]) {
    const resultado = classificarReferencia(texto)
    assert.equal(resultado.banca, ASSIMILACAO)
    assert.equal(resultado.ano, null)
  }
})

test('preserva identificação parcial sem atribuir ano do livro', () => {
  const resultado = classificarReferencia('1. (UFPR) Considere o gráfico.')
  assert.equal(resultado.banca, 'UFPR')
  assert.equal(resultado.ano, null)
})

test('preserva informação de adaptação', () => {
  const resultado = classificarReferencia('(ENEM-2019-adaptada) Analise...')
  assert.equal(resultado.banca, 'ENEM')
  assert.equal(resultado.ano, 2019)
  assert.equal(resultado.adaptada, true)
  assert.equal(resultado.referencia_original, 'ENEM-2019-adaptada')
})
