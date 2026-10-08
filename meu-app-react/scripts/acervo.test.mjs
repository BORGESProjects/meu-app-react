import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { acervo as completo, anoDaQuestao, unirQuestoes, podeCorrigir, corrigirQuestaoConferida, questaoPublicavel, limparMarcadoresExtracao, textoCorrompido } from '../src/acervo.js'
const acervo = completo.filter(q => q.banca === 'ESA')

test('imagens de enunciado não repetem alternativas e figuras de resposta ficam separadas', () => {
  for (const q of completo) {
    assert.equal(q.imagem_sem_alternativas, true)
    assert.match(q.imagem_original, /-enunciado\.webp$/)
    if (q.opcoes_imagens) {
      assert.equal(q.opcoes_imagens.length, q.opcoes.length)
      for (const imagem of q.opcoes_imagens) {
        assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)))
        assert.notEqual(imagem, q.imagem_original)
      }
    }
    assert.ok(q.opcoes.every(o => !o.includes('conforme a imagem')))
  }
})

test('a prova A tem 50 questões únicas e 47 corrigíveis', () => {
  assert.equal(acervo.length, 50)
  assert.equal(new Set(acervo.map(q => q.id)).size, 50)
  assert.deepEqual(acervo.map(q => q.numero_original), Array.from({ length:50 }, (_,i) => i+1))
  assert.deepEqual(acervo.filter(q => !podeCorrigir(q)).map(q => q.numero_original), [1,4,10])
  assert.equal(acervo.filter(podeCorrigir).length, 47)
  for (const q of acervo) {
    assert.equal(q.opcoes.length, 5)
    assert.ok(q.opcoes.every(v => v.trim()))
    assert.equal(anoDaQuestao(q), '2025')
    assert.ok(existsSync(new URL('../public' + q.imagem_original, import.meta.url)))
    for (const p of q.apoio) assert.ok(existsSync(new URL('../public' + p.imagem, import.meta.url)))
  }
})

test('respostas e distribuição conferem com o gabarito definitivo A', () => {
  // Transcrição independente por blocos de dez, da página 1 do gabarito.
  const gabarito = '-CA-AAAED-' + 'BDBBBBDBCD' + 'ACBCBEAEAC' + 'CECDEBEAAE' + 'AEBEEBCEBC'
  assert.equal(acervo.map(q => q.anulada ? '-' : 'ABCDE'[q.resposta_correta]).join(''), gabarito)
  assert.deepEqual(Object.fromEntries(['Matemática','Português','História','Geografia','Inglês'].map(m => [m,acervo.filter(q => q.materia === m).length])), {'Matemática':14,'Português':14,'História':6,'Geografia':6,'Inglês':10})
})

test('textos compartilhados incluem a continuação em outra página', () => {
  assert.equal(acervo[19].apoio.length, 2)
  assert.match(acervo[19].apoio[0].texto, /especialistas o considerem/)
  assert.match(acervo[47].apoio[0].texto, /patrols/)
  assert.match(acervo[47].apoio[1].texto, /neighbors/)
  assert.equal(acervo[17].apoio.length, 1)
})

test('anos desconhecidos continuam visíveis e registros existentes são preservados', () => {
  assert.equal(anoDaQuestao({}), 'Não informado')
  assert.equal(anoDaQuestao({concurso:'ESA 2024'}), '2024')
  assert.equal(anoDaQuestao({ano:2023,concurso:'ESA 2024'}), '2023')
  const antiga = { id:123, enunciado:'Questão existente e válida', opcoes:['Uma','Duas'], resposta_correta:0 }
  assert.equal(unirQuestoes([antiga]).length, completo.length + 1)
  assert.deepEqual(unirQuestoes([antiga]).find(q => q.id === 123), antiga)
  assert.equal(unirQuestoes([acervo[0]]).length, completo.length)
})

test('corrige a alternativa contaminada da UTFPR e bloqueia questões estruturalmente inválidas', () => {
  const utfpr = corrigirQuestaoConferida({
    id:3165,
    enunciado:'Assinale a solução da equação biquadrada.',
    opcoes:['A','B','C','D','alternativa seguida por uma questão da EPCAR'],
    resposta_correta:'C',
  })
  assert.deepEqual(utfpr.opcoes, [
    '{−√2/2, √2/2}',
    '{−√3/2, √3/2}',
    '{−√2, √2}',
    '{−√2/3, √2/3}',
    '{−√3, √3}',
  ])
  assert.equal(utfpr.resposta_correta, 2)
  assert.equal(utfpr.numero_original, 19)
  assert.equal(utfpr.ano, 2018)
  assert.equal(questaoPublicavel(utfpr), true)
  assert.equal(questaoPublicavel({ ...utfpr, opcoes:['igual','igual'] }), false)
  assert.equal(questaoPublicavel({ ...utfpr, opcoes:['válida',''] }), false)
  assert.equal(questaoPublicavel({ ...utfpr, resposta_correta:8 }), false)
  assert.equal(questaoPublicavel({ ...utfpr, opcoes:['a'.repeat(501),'válida'], resposta_correta:1 }), false)
})

test('remove marcadores do PDF, restaura fórmulas oficiais e bloqueia texto ilegível', () => {
  assert.equal(limparMarcadoresExtracao('alternativa final\n#####'), 'alternativa final')
  assert.equal(textoCorrompido('x² + y² − 4x = −3'), false)
  assert.equal(textoCorrompido('𝑥ଶ൅𝑦ଶെ4𝑥ൌെ3'), true)

  const circulos = corrigirQuestaoConferida({
    id: 6442,
    enunciado: '𝑥ଶ൅𝑦ଶെ4𝑥ൌെ3',
    opcoes: ['A', 'B', 'C', 'D', 'E #####'],
    resposta_correta: 'E',
  })
  assert.match(circulos.enunciado, /x² \+ y² − 4x = −3/)
  assert.equal(circulos.opcoes[4], 'duas circunferências com centros distintos e que não se interceptam.')
  assert.equal(circulos.resposta_correta, 4)
  assert.equal(questaoPublicavel(circulos), true)

  const ilegivel = {
    id: 'quebrada',
    enunciado: 'Equação corrompida 𝑥ଶ൅𝑦ଶെ4𝑥ൌെ3',
    opcoes: ['Uma alternativa', 'Outra alternativa'],
    resposta_correta: 0,
  }
  assert.equal(questaoPublicavel(ilegivel), false)
  assert.equal(questaoPublicavel({ ...ilegivel, imagem_original: '/prova.webp' }), true)
  assert.equal(questaoPublicavel({
    ...ilegivel,
    enunciado: 'Enunciado perfeitamente legível',
    opcoes: ['Opção ilegível 𝑥ଶ', 'Outra alternativa'],
    opcoes_imagens: ['/alternativa-a.webp', null],
  }), true)
})

test('remove duplicatas exatas e põe gabaritos conflitantes em quarentena', () => {
  const base = {
    banca: 'Questões inéditas', concurso: 'Material de estudo', ano: 2022,
    materia: 'Português', conteudo: 'Sintaxe', dificuldade: 'Média',
    enunciado: 'Assinale a alternativa que completa corretamente a frase.',
    opcoes: ['Primeira resposta plausível.', 'Segunda resposta plausível.'],
  }
  const duplicadas = unirQuestoes([
    { ...base, id: 'duplicada-a', resposta_correta: 'B' },
    { ...base, id: 'duplicada-b', banca: 'ESA', concurso: 'ESA 2022', resposta_correta: 1 },
  ]).filter(q => q.id === 'duplicada-a' || q.id === 'duplicada-b')
  assert.deepEqual(duplicadas.map(q => q.id), ['duplicada-b'])

  const conflitantes = unirQuestoes([
    { ...base, id: 'conflito-a', resposta_correta: 0 },
    { ...base, id: 'conflito-b', resposta_correta: 1 },
  ])
  assert.equal(conflitantes.some(q => q.id === 'conflito-a' || q.id === 'conflito-b'), false)

  const formulas = unirQuestoes([
    { ...base, id: 'formula-quadrada', enunciado: 'Resolva a expressão x² + 1.', resposta_correta: 0 },
    { ...base, id: 'formula-cubica', enunciado: 'Resolva a expressão x³ + 1.', resposta_correta: 0 },
  ])
  assert.equal(formulas.filter(q => q.id === 'formula-quadrada' || q.id === 'formula-cubica').length, 2)
})

test('bloqueia questões sem apoio e alternativas contaminadas por outra questão', () => {
  const base = {
    id: 'incompleta', enunciado: 'According to the text, choose the correct alternative.',
    opcoes: ['A', 'B', 'C', 'D'], resposta_correta: 0,
  }
  assert.equal(questaoPublicavel(base), false)
  assert.equal(questaoPublicavel({
    ...base,
    enunciado: 'According to the text, choose the correct alternative after reading the complete passage presented below in this question, considering its central argument and supporting evidence in detail.',
    opcoes: ['A primeira afirmação está correta.', 'A segunda afirmação está correta.'],
    texto_apoio: 'Texto completo necessário para responder à questão.',
  }), true)
  assert.equal(questaoPublicavel({
    ...base,
    enunciado: 'Assinale a alternativa correta sobre o tema apresentado.',
    opcoes: ['Alternativa válida.', 'Alternativa seguida por outra questão.  **84 - These are expressions a) one b) two c) three d) four'],
    resposta_correta: 0,
  }), false)

  const visual = {
    id: 'visual-ausente',
    enunciado: 'Observe o gráfico abaixo e assinale a alternativa que representa corretamente a evolução da grandeza durante todo o período analisado.',
    opcoes: ['A grandeza aumentou.', 'A grandeza diminuiu.'],
    resposta_correta: 0,
  }
  assert.equal(questaoPublicavel(visual), false)
  assert.equal(questaoPublicavel({ ...visual, imagem_original: '/grafico.webp' }), true)
  assert.equal(questaoPublicavel({
    ...visual,
    enunciado: 'Assinale a alternativa correta sobre o tema apresentado.',
    opcoes: ['Alternativa válida.', 'Alternativa contaminada.\nFILOSOFIA'],
  }), false)
})

test('ENEM 2022 contém ambos os idiomas, 185 questões e os dois gabaritos oficiais', () => {
  const enem = completo.filter(q => q.banca === 'ENEM' && q.ano === 2022)
  assert.equal(enem.length, 185)
  assert.equal(new Set(enem.map(q => q.id)).size, 185)
  assert.equal(enem.filter(q => q.dia === 1).length, 95)
  assert.equal(enem.filter(q => q.dia === 2).length, 90)
  for (const idioma of ['Inglês', 'Espanhol']) {
    const idiomaQuestoes = enem.filter(q => q.idioma === idioma)
    assert.deepEqual(idiomaQuestoes.map(q => q.numero_original), [1,2,3,4,5])
    assert.equal(idiomaQuestoes.map(q => 'ABCDE'[q.resposta_correta]).join(''), idioma === 'Inglês' ? 'DCBDE' : 'EDCAA')
  }
  assert.deepEqual(enem.filter(q => !podeCorrigir(q)).map(q => q.numero_original), [157])
  assert.deepEqual(enem.filter(q => !q.idioma).map(q => q.numero_original), Array.from({length:175},(_,i)=>i+6))
  for (const q of enem) {
    assert.ok(q.enunciado.length > 30)
    assert.equal(q.opcoes.length, 5)
    assert.ok(q.opcoes.every(Boolean))
    assert.ok(q.anulada || Number.isInteger(q.resposta_correta) && q.resposta_correta >= 0 && q.resposta_correta <= 4)
    for (const file of [q.imagem_original, q.fonte_pdf, q.fonte_gabarito]) assert.ok(existsSync(new URL('../public' + file, import.meta.url)))
  }
  assert.equal(unirQuestoes(enem).length, completo.length)
})

test('UFRGS 2024 contém as 135 questões oficiais com os apoios visuais restaurados', () => {
  const arquivo = new URL('../public/acervo/ufrgs-2024/questoes.json', import.meta.url)
  const ufrgs = JSON.parse(readFileSync(arquivo, 'utf8'))

  assert.equal(ufrgs.length, 135)
  assert.equal(new Set(ufrgs.map(q => q.id)).size, 135)
  assert.equal(ufrgs.filter(q => q.modelo === '1º dia').length, 60)
  assert.equal(ufrgs.filter(q => q.modelo === '2º dia').length, 75)
  assert.deepEqual(ufrgs.filter(q => q.anulada).map(q => q.id), ['ufrgs-2024-d1-46', 'ufrgs-2024-d2-40'])
  const quarentena = ufrgs.filter(questao => !questaoPublicavel(corrigirQuestaoConferida(questao)))
  assert.deepEqual(quarentena.map(q => q.id), [])
  for (const questao of ufrgs) {
    assert.equal(questao.opcoes.length, 5, questao.id)
    assert.ok(questao.opcoes.every(Boolean), questao.id)
    for (const imagem of [questao.imagem_original, ...(questao.opcoes_imagens || [])].filter(Boolean)) {
      assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
    }
  }
})

test('UFRGS 2022 contém as 135 questões oficiais com os apoios visuais restaurados', () => {
  const arquivo = new URL('../public/acervo/ufrgs-2022/questoes.json', import.meta.url)
  const ufrgs = JSON.parse(readFileSync(arquivo, 'utf8'))

  assert.equal(ufrgs.length, 135)
  assert.equal(new Set(ufrgs.map(q => q.id)).size, 135)
  assert.equal(ufrgs.filter(q => q.modelo === '1º dia').length, 60)
  assert.equal(ufrgs.filter(q => q.modelo === '2º dia').length, 75)
  assert.deepEqual(ufrgs.filter(q => q.anulada).map(q => q.id), ['ufrgs-2022-d2-25', 'ufrgs-2022-d2-60'])
  const quarentena = ufrgs.filter(questao => !questaoPublicavel(corrigirQuestaoConferida(questao)))
  assert.deepEqual(quarentena.map(q => q.id), [])
  for (const questao of ufrgs) {
    assert.equal(questao.opcoes.length, 5, questao.id)
    assert.ok(questao.opcoes.every(Boolean), questao.id)
    for (const imagem of [questao.imagem_original, ...(questao.opcoes_imagens || [])].filter(Boolean)) {
      assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
    }
  }
})

test('UFRGS 2023 contém as 135 questões oficiais com os apoios visuais restaurados', () => {
  const arquivo = new URL('../public/acervo/ufrgs-2023/questoes.json', import.meta.url)
  const ufrgs = JSON.parse(readFileSync(arquivo, 'utf8'))

  assert.equal(ufrgs.length, 135)
  assert.equal(new Set(ufrgs.map(q => q.id)).size, 135)
  assert.equal(ufrgs.filter(q => q.modelo === '1º dia').length, 60)
  assert.equal(ufrgs.filter(q => q.modelo === '2º dia').length, 75)
  assert.deepEqual(ufrgs.filter(q => q.anulada).map(q => q.id), ['ufrgs-2023-d2-20'])
  assert.deepEqual(ufrgs.filter(q => !questaoPublicavel(corrigirQuestaoConferida(q))).map(q => q.id), [])
  for (const questao of ufrgs) {
    assert.equal(questao.opcoes.length, 5, questao.id)
    for (const imagem of [questao.imagem_original, ...(questao.opcoes_imagens || [])].filter(Boolean)) {
      assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
    }
  }
})

test('UFRGS 2025 contém as 135 questões oficiais com os apoios visuais restaurados', () => {
  const arquivo = new URL('../public/acervo/ufrgs-2025/questoes.json', import.meta.url)
  const ufrgs = JSON.parse(readFileSync(arquivo, 'utf8'))

  assert.equal(ufrgs.length, 135)
  assert.equal(new Set(ufrgs.map(q => q.id)).size, 135)
  assert.equal(ufrgs.filter(q => q.modelo === '1º dia').length, 75)
  assert.equal(ufrgs.filter(q => q.modelo === '2º dia').length, 60)
  assert.deepEqual(ufrgs.filter(q => q.anulada).map(q => q.id), [])
  assert.equal(ufrgs.filter(q => q.imagem_original?.includes('/imagens/reparadas/')).length, 25)
  assert.deepEqual(ufrgs.filter(q => !questaoPublicavel(corrigirQuestaoConferida(q))).map(q => q.id), [])
  for (const questao of ufrgs) {
    assert.equal(questao.opcoes.length, 5, questao.id)
    assert.ok(questao.opcoes.every(Boolean), questao.id)
    for (const imagem of [questao.imagem_original, ...(questao.opcoes_imagens || [])].filter(Boolean)) {
      assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
    }
  }
})

test('CFN 2020 a 2025 contém 300 questões publicáveis e os seis apoios restaurados', () => {
  const arquivo = new URL('../public/acervo/cfn-2020-2025/questoes.json', import.meta.url)
  const cfn = JSON.parse(readFileSync(arquivo, 'utf8'))
  const reparadas = new Set([
    'cfn-2020-88-35', 'cfn-2021-11-34', 'cfn-2021-11-46',
    'cfn-2023-14-28', 'cfn-2024-55-29', 'cfn-2025-11-34',
  ])
  assert.equal(cfn.length, 300)
  assert.equal(new Set(cfn.map(q => q.id)).size, 300)
  for (const questao of cfn) {
    assert.equal(questaoPublicavel(corrigirQuestaoConferida(questao)), true, questao.id)
    if (reparadas.has(questao.id)) {
      assert.equal(questao.apoio.length, 1, questao.id)
      assert.ok(existsSync(new URL('../public' + questao.apoio[0].imagem, import.meta.url)), questao.id)
    }
  }
})

test('EsPCEx 2017 a 2026 contém as 1.000 questões publicáveis com apoios visuais', async () => {
  const arquivo = new URL('../public/acervo/espcex-2017-2026/questoes.json', import.meta.url)
  const espcex = JSON.parse(await (await import('node:fs/promises')).readFile(arquivo, 'utf8'))

  assert.equal(espcex.length, 1000)
  assert.equal(new Set(espcex.map(q => q.id)).size, 1000)
  for (const ano of Array.from({ length:10 }, (_, indice) => 2017 + indice)) {
    const edicao = espcex.filter(q => q.ano === ano)
    assert.equal(edicao.length, 100)
    assert.equal(edicao.filter(q => q.dia === 1).length, 44)
    assert.equal(edicao.filter(q => q.dia === 2).length, 56)
  }

  const publicaveis = espcex.filter(questao => questaoPublicavel(corrigirQuestaoConferida(questao)))
  assert.equal(publicaveis.length, 1000)
  for (const questao of publicaveis) {
    for (const imagem of [questao.imagem_original, ...(questao.opcoes_imagens || []), ...(questao.apoio || []).map(item => item.imagem)].filter(Boolean)) {
      assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
    }
  }
})

test('itens publicáveis de todos os lotes possuem estrutura e imagens válidas', () => {
  const raiz = new URL('../public/acervo/', import.meta.url)
  const lotes = readdirSync(raiz, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => new URL(`${item.name}/questoes.json`, raiz))
    .filter(existsSync)

  assert.ok(lotes.length >= 6)
  for (const arquivo of lotes) {
    const questoes = JSON.parse(readFileSync(arquivo, 'utf8'))
    for (const questao of questoes.map(corrigirQuestaoConferida).filter(questaoPublicavel)) {
      const corrigida = questao
      for (const imagem of [
        corrigida.imagem_original,
        corrigida.pagina_imagem,
        ...(corrigida.opcoes_imagens || []),
        ...(corrigida.apoio || []).map(item => item.imagem),
      ].filter(Boolean)) {
        if (imagem.startsWith('/')) assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
        else assert.match(imagem, /^https:\/\//, imagem)
      }
    }
  }
})

test('UFPR 2025 contém 90 questões oficiais com recortes independentes', () => {
  const arquivo = new URL('../public/acervo/ufpr-2025/questoes.json', import.meta.url)
  const ufpr = JSON.parse(readFileSync(arquivo, 'utf8'))
  assert.equal(ufpr.length, 90)
  assert.deepEqual(ufpr.map(q => q.numero_original), Array.from({length: 90}, (_, i) => i + 1))
  assert.deepEqual(ufpr.filter(q => q.anulada).map(q => q.numero_original), [39])
  for (const questao of ufpr) {
    assert.equal(questao.opcoes.length, 5, questao.id)
    assert.equal(questao.opcoes_imagens.length, 5, questao.id)
    assert.equal(questao.imagem_sem_alternativas, true, questao.id)
    assert.equal(questaoPublicavel(corrigirQuestaoConferida(questao)), true, questao.id)
    for (const imagem of [questao.imagem_original, ...questao.opcoes_imagens, ...(questao.apoio || []).map(item => item.imagem)]) {
      assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
    }
  }
})

test('UTFPR 2025 contém as 60 questões oficiais com recortes independentes', () => {
  const arquivo = new URL('../public/acervo/utfpr-2025/questoes.json', import.meta.url)
  const utfpr = JSON.parse(readFileSync(arquivo, 'utf8'))

  assert.equal(utfpr.length, 60)
  assert.equal(new Set(utfpr.map(q => q.id)).size, 60)
  assert.deepEqual(utfpr.filter(q => q.anulada).map(q => q.id), ['utfpr-2025-51'])
  assert.deepEqual(utfpr.filter(q => !questaoPublicavel(corrigirQuestaoConferida(q))).map(q => q.id), [])
  for (const questao of utfpr) {
    assert.equal(questao.opcoes.length, 5, questao.id)
    assert.equal(questao.opcoes_imagens.length, 5, questao.id)
    assert.equal(questao.imagem_sem_alternativas, true, questao.id)
    assert.ok(questao.enunciado.length > 10, questao.id)
    for (const imagem of [questao.imagem_original, ...questao.opcoes_imagens, ...(questao.apoio || []).map(item => item.imagem)]) {
      assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
    }
  }
})

test('UFPR 2024 contém as 90 questões oficiais com apoios e recortes independentes', () => {
  const arquivo = new URL('../public/acervo/ufpr-2024/questoes.json', import.meta.url)
  const ufpr = JSON.parse(readFileSync(arquivo, 'utf8'))

  assert.equal(ufpr.length, 90)
  assert.deepEqual(ufpr.map(q => q.numero_original), Array.from({length: 90}, (_, i) => i + 1))
  assert.deepEqual(ufpr.filter(q => q.anulada).map(q => q.numero_original), [66])
  assert.deepEqual(ufpr.filter(q => !questaoPublicavel(corrigirQuestaoConferida(q))).map(q => q.id), [])
  for (const questao of ufpr) {
    assert.equal(questao.opcoes.length, 5, questao.id)
    assert.equal(questao.opcoes_imagens.length, 5, questao.id)
    assert.equal(questao.imagem_sem_alternativas, true, questao.id)
    assert.ok(questao.enunciado.length > 10, questao.id)
    for (const imagem of [questao.imagem_original, ...questao.opcoes_imagens, ...(questao.apoio || []).map(item => item.imagem)]) {
      assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
    }
  }
})

test('UFPR 2023 contém as 90 questões oficiais com apoios e recortes independentes', () => {
  const arquivo = new URL('../public/acervo/ufpr-2023/questoes.json', import.meta.url)
  const ufpr = JSON.parse(readFileSync(arquivo, 'utf8'))

  assert.equal(ufpr.length, 90)
  assert.deepEqual(ufpr.map(q => q.numero_original), Array.from({length: 90}, (_, i) => i + 1))
  assert.deepEqual(ufpr.filter(q => q.anulada).map(q => q.numero_original), [84])
  assert.deepEqual(ufpr.filter(q => !questaoPublicavel(corrigirQuestaoConferida(q))).map(q => q.id), [])
  for (const questao of ufpr) {
    assert.equal(questao.opcoes.length, 5, questao.id)
    assert.equal(questao.opcoes_imagens.length, 5, questao.id)
    assert.equal(questao.imagem_sem_alternativas, true, questao.id)
    assert.ok(questao.enunciado.length > 10, questao.id)
    for (const imagem of [questao.imagem_original, ...questao.opcoes_imagens, ...(questao.apoio || []).map(item => item.imagem)]) {
      assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
    }
  }
})

test('UFPR 2022 contém as 60 questões oficiais com apoios e recortes independentes', () => {
  const arquivo = new URL('../public/acervo/ufpr-2022/questoes.json', import.meta.url)
  const ufpr = JSON.parse(readFileSync(arquivo, 'utf8'))

  assert.equal(ufpr.length, 60)
  assert.deepEqual(ufpr.map(q => q.numero_original), Array.from({length: 60}, (_, i) => i + 1))
  assert.deepEqual(ufpr.filter(q => q.anulada).map(q => q.numero_original), [29, 60])
  assert.deepEqual(ufpr.filter(q => !questaoPublicavel(corrigirQuestaoConferida(q))).map(q => q.id), [])
  assert.ok(!ufpr[59].opcoes.some(opcao => opcao.includes('QUESTÃO DISCURSIVA')))
  for (const questao of ufpr) {
    assert.equal(questao.opcoes.length, 5, questao.id)
    assert.equal(questao.opcoes_imagens.length, 5, questao.id)
    assert.equal(questao.imagem_sem_alternativas, true, questao.id)
    assert.ok(questao.enunciado.length > 10, questao.id)
    for (const imagem of [questao.imagem_original, ...questao.opcoes_imagens, ...(questao.apoio || []).map(item => item.imagem)]) {
      assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
    }
  }
})

test('UFPR 2021 contém as 60 questões oficiais com apoios e recortes independentes', () => {
  const arquivo = new URL('../public/acervo/ufpr-2021/questoes.json', import.meta.url)
  const ufpr = JSON.parse(readFileSync(arquivo, 'utf8'))

  assert.equal(ufpr.length, 60)
  assert.deepEqual(ufpr.map(q => q.numero_original), Array.from({length: 60}, (_, i) => i + 1))
  assert.deepEqual(ufpr.filter(q => q.anulada).map(q => q.numero_original), [])
  assert.deepEqual(ufpr.filter(q => !questaoPublicavel(corrigirQuestaoConferida(q))).map(q => q.id), [])
  assert.equal(ufpr[50].materia, 'Química')
  assert.equal(ufpr[52].opcoes_imagens.length, 5)
  assert.ok(!ufpr[59].opcoes.some(opcao => opcao.includes('COMPREENSÃO E PRODUÇÃO DE TEXTO')))
  for (const questao of ufpr) {
    assert.equal(questao.opcoes.length, 5, questao.id)
    assert.equal(questao.opcoes_imagens.length, 5, questao.id)
    assert.equal(questao.imagem_sem_alternativas, true, questao.id)
    assert.ok(questao.enunciado.length > 10, questao.id)
    for (const imagem of [questao.imagem_original, ...questao.opcoes_imagens, ...(questao.apoio || []).map(item => item.imagem)]) {
      assert.ok(existsSync(new URL('../public' + imagem, import.meta.url)), imagem)
    }
  }
})