import test from 'node:test'
import assert from 'node:assert/strict'
import { extrairCapitulo } from './extrair-capitulo.mjs'

const p = (classe, ...children) => ({ tag: 'p', attrs: { class: classe }, children })
const capitulo = children => ({ id_capitulo: 'teste', materia: 'Química', grupo: 'Frente A - Volume 3', capitulo: 'Eletrólise',
  conteudo: { tag: 'main', children } })
const alternativa = (rotulo, texto, correta = false) => ({ ...p(`alternativaLetra${correta ? ' respostaCerta' : ''}`, `${rotulo}) ${texto}`), escolha_unica: true })

test('mantém fórmula e texto-base mesmo quando o livro usa a classe de enunciado numerado', () => {
  const dados = capitulo([
    p('enunciadoNumero', 'Resolução 1. O alumínio é produzido por eletrólise.'),
    p('enunciadoNumero', 'Transformar partes do corpo em obra de arte'),
    p('enunciadoNumero', 'Aℓ', { tag: 'sup', children: ['3+'] }, ' + 3e− → Aℓ'),
    alternativa('a', 'Primeira opção', true), alternativa('b', 'Segunda opção'),
    { tag: 'div', attrs: { class: 'gabarito' }, children: [p('enunciadoNumero', '1. A')] },
    p('enunciadoNumero', 'Resolução 2. Outra questão completa.'),
    alternativa('a', 'Uma'), alternativa('b', 'Duas', true),
  ])
  const resultado = extrairCapitulo(dados)
  assert.equal(resultado.length, 2)
  assert.equal(resultado[0].enunciado_blocos.length, 3)
  assert.match(JSON.stringify(resultado[0].enunciado_blocos), /Transformar partes/)
  assert.match(JSON.stringify(resultado[0].enunciado_blocos), /3e− → Aℓ/)
  assert.equal(resultado[0].alternativas.length, 2)
  assert.equal(resultado[0].resposta_correta, 0)
  assert.equal(resultado[1].resposta_correta, 1)
  assert.equal(resultado[0].solucao_livro.length, 1)
})

test('subitens discursivos não se tornam alternativas objetivas', () => {
  const dados = capitulo([p('enunciadoNumero', '1. Explique o experimento.'),
    p('alternativaLetra', 'a) Descreva.'), { tag: 'resposta-livre', children: [] },
    p('alternativaLetra', 'b) Justifique.'), { tag: 'resposta-livre', children: [] },
  ])
  const [q] = extrairCapitulo(dados)
  assert.equal(q.tipo_resposta, 'discursiva')
  assert.equal(q.resposta_correta, null)
  assert.equal(q.campos_discursivos, 2)
})
