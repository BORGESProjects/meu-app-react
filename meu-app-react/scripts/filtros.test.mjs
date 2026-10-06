import test from 'node:test'
import assert from 'node:assert/strict'
import { chaveCampoFiltro, grupoConteudo, normalizarBanca, opcoesFiltro } from '../src/filtros.js'
import { unirQuestoes } from '../src/acervo.js'

test('unifica variações equivalentes de banca', () => {
  assert.equal(normalizarBanca('CPOR/SP'), 'CPOR')
  assert.equal(normalizarBanca('Efomm'), 'EFOMM')
  assert.equal(normalizarBanca('EFOMM 2019'), 'EFOMM')
  assert.equal(normalizarBanca('Enem'), 'ENEM')
  assert.equal(normalizarBanca('Fgv'), 'FGV')
  assert.equal(normalizarBanca('Esc. Naval'), 'Escola Naval')
  assert.equal(normalizarBanca('Fuzileiros Navais'), 'CFN')
  assert.equal(normalizarBanca('FN'), 'CFN')
  assert.equal(normalizarBanca('Marinha', 'Marinha / SMV Oficial 2017'), 'SMV')
  assert.equal(normalizarBanca('Estratégia Militares', 'Estratégia Militares – EEAr – Professora'), 'EEAR')
  assert.equal(normalizarBanca('Estratégia Militares', 'Estratégia Militares 2022 – EsPCEx 2020'), 'EsPCEx')
  assert.equal(normalizarBanca('Estratégia Militares', 'Estratégia Militares / Questão inédita 2021'), 'Questões inéditas')
  assert.equal(chaveCampoFiltro('banca', 'CPOR/SP'), 'cpor')
})

test('remove classificações inválidas sem excluir suas questões', () => {
  for (const valor of ['G', 'Esc', 'Fac', 'Fonte não informada']) assert.equal(normalizarBanca(valor), '')
  const questoes = unirQuestoes([{
    id: 'banca-invalida', banca: 'G', concurso: 'G 2017', enunciado: 'Enunciado válido para estudo',
    opcoes: ['Alternativa um', 'Alternativa dois'], resposta_correta: 0,
  }])
  const questao = questoes.find(item => item.id === 'banca-invalida')
  assert.ok(questao)
  assert.equal(questao.banca, '')
  assert.deepEqual(opcoesFiltro(questoes, 'banca').filter(item => item.value === 'g'), [])
})

test('lista uma única opção para cada banca normalizada', () => {
  const questoes = [
    { banca: 'CPOR' }, { banca: 'CPOR/SP' }, { banca: 'Efomm' }, { banca: 'EFOMM 2019' },
    { banca: 'G' }, { banca: 'Fuzileiros Navais' }, { banca: 'FN' }, { banca: 'CFN' },
  ]
  assert.deepEqual(opcoesFiltro(questoes, 'banca'), [
    { value: 'cfn', label: 'CFN' },
    { value: 'cpor', label: 'CPOR' },
    { value: 'efomm', label: 'EFOMM' },
  ])
})

test('química é dividida em áreas didáticas a partir do conteúdo e do enunciado', () => {
  const casos = [
    ['Química', 'A variação de entalpia pode ser calculada pela Lei de Hess.', 'Termoquímica'],
    ['Química', 'O valor de Kc para o equilíbrio químico representado é', 'Equilíbrio químico'],
    ['Soluções e equilíbrio', 'Calcule o pH de uma solução tampão.', 'Equilíbrio iônico'],
    ['Química', 'A energia de ativação diminui na presença de catalisador.', 'Cinética química'],
    ['Química', 'Uma pilha apresenta determinado potencial de redução.', 'Eletroquímica'],
    ['Misturas para', 'A filtração é usada para separar uma mistura heterogênea.', 'Matéria, misturas e separação'],
  ]
  for (const [conteudo, enunciado, esperado] of casos) {
    assert.equal(grupoConteudo(conteudo, 'Química', enunciado).label, esperado)
  }
})
