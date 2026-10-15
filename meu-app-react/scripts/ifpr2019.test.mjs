import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { questaoPublicavel, corrigirQuestaoConferida, unirQuestoes } from '../src/acervo.js'
import { incluirNoSimuladoIfpr } from '../src/ifpr.js'

test('IFPR 2019 preserva as 55 questões e o gabarito definitivo', () => {
  const qs = JSON.parse(readFileSync(new URL('../public/acervo/ifpr-2019/questoes.json', import.meta.url), 'utf8'))
  assert.equal(qs.length,55)
  assert.deepEqual(qs.map(q=>q.numero_original),Array.from({length:55},(_,i)=>i+1))
  assert.equal(qs.map(q=>'ABCD'[q.resposta_correta]).join(''),'CADABBCDADBCBADCADCBADCDABADBCACBBADBADCACBDCBADCDCABCD')
  assert.equal(unirQuestoes(qs).filter(q=>String(q.id).startsWith('ifpr-2019-')).length,55)
  for (const idioma of ['Inglês','Espanhol']) {
    const prova=qs.filter(q=>incluirNoSimuladoIfpr(q,idioma))
    assert.equal(prova.length,50)
    assert.equal(prova.filter(q=>q.idioma===idioma).length,5)
  }
  for (const q of qs) {
    assert.ok(questaoPublicavel(corrigirQuestaoConferida(q)),q.id)
    assert.equal(q.opcoes.length,4)
    assert.equal(q.opcoes_imagens.length,4)
    assert.equal(q.ano,2019)
    assert.equal(q.data_aplicacao,'2018-10-14')
    assert.ok(q.imagem_sem_alternativas)
    for (const path of [q.imagem_original,...q.opcoes_imagens,...q.apoio.map(a=>a.imagem)]) assert.ok(existsSync(new URL('../public'+path,import.meta.url)),path)
  }
  assert.match(qs.find(q=>q.numero_original===7).apoio[0].texto,/Amadalena/)
  assert.match(qs.find(q=>q.numero_original===51).apoio[0].texto,/lesión interna/)
  assert.deepEqual(qs.find(q=>q.numero_original===31).opcoes,['1 − √3/2','2 − 2√3/3','2 − √3','1'])
})
