import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const lote = nome => JSON.parse(readFileSync(new URL(`../public/acervo/${nome}/questoes.json`, import.meta.url), 'utf8'))

test('matérias UFPR respeitam mudanças de ordem e questões nas fronteiras entre disciplinas', () => {
  const casos = {
    2019: {9:'História',10:'Química',18:'Química',19:'Biologia',37:'Língua Portuguesa',49:'Literatura',55:'Física',64:'Geografia',73:'Filosofia',79:'Sociologia'},
    2020: {10:'Matemática',19:'História',49:'Literatura',64:'Filosofia',69:'Geografia',78:'Sociologia'},
    2021: {4:'Língua Inglesa',5:'Língua Portuguesa',13:'Literatura',17:'História',29:'Biologia',35:'Física',41:'Filosofia',45:'Matemática',51:'Química',57:'Sociologia'},
    2022: {4:'Língua Inglesa',5:'Biologia',11:'Matemática',17:'História',23:'Física',29:'Língua Portuguesa',37:'Literatura',41:'Química',47:'Filosofia',51:'Geografia',57:'Sociologia'},
    2023: {10:'Matemática',19:'História',64:'Filosofia',69:'Geografia',78:'Sociologia'},
    2024: {34:'Biologia',36:'Biologia',37:'Geografia',45:'Geografia',46:'História',54:'História',66:'Língua Portuguesa',67:'Literatura',72:'Literatura',73:'Sociologia',77:'Filosofia'},
    2025: {18:'Física',19:'Química',22:'Química',45:'Geografia',46:'História',66:'Língua Portuguesa',67:'Literatura',72:'Literatura',73:'Filosofia',77:'Filosofia',78:'Sociologia'},
  }
  for (const [ano, fronteiras] of Object.entries(casos)) {
    const itens = lote(`ufpr-${ano}`)
    for (const [numero,materia] of Object.entries(fronteiras)) {
      assert.equal(itens.find(q=>q.numero_original===Number(numero)).materia,materia,`${ano} questão ${numero}`)
    }
  }
})

test('UTFPR 2025 mantém a divisão indicada nas instruções oficiais', () => {
  const itens=lote('utfpr-2025')
  const contagens={Literatura:4,'Língua Portuguesa':8,'Língua Inglesa':6,História:4,Geografia:4,Filosofia:2,Sociologia:2,Biologia:6,Química:8,Matemática:8,Física:8}
  for (const [materia,quantidade] of Object.entries(contagens)) assert.equal(itens.filter(q=>q.materia===materia).length,quantidade,materia)
  assert.equal(itens.find(q=>q.numero_original===44).materia,'Química')
})
