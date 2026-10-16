import test from 'node:test'
import assert from 'node:assert/strict'
import {formatarTempoEstudo, lerSessao, pausarSessao, segundosDaSessao} from '../src/sessaoEstudo.js'
const inicio = 1700000000000
const s = {id:'teste',materia:'Física',conteudo:'Óptica',inicio,acumulado:0}
test('contabiliza uma hora em segundo plano sem depender de callbacks',()=>{
  assert.equal(segundosDaSessao(s,inicio+3600000),3600)
  assert.equal(segundosDaSessao(s,inicio+3600999),3600)
})
test('pausa preserva milissegundos, retoma e não inclui o intervalo da pausa',()=>{
  const pausada=pausarSessao(s,inicio+12345)
  assert.equal(segundosDaSessao(pausada,inicio+900000),12)
  assert.deepEqual(pausarSessao(pausada,inicio+900000),pausada)
  const retomada={...pausada,inicio:inicio+900000}
  assert.equal(segundosDaSessao(retomada,inicio+900655),13)
  assert.equal(segundosDaSessao(retomada,inicio+903655),16)
})
test('recupera a sessão da própria conta após recarregar e tolera dados inválidos',()=>{
  const storage={getItem:chave=>chave==='usuario-a'?JSON.stringify(s):null}
  assert.deepEqual(lerSessao(storage,'usuario-a'),s)
  assert.equal(lerSessao(storage,'usuario-b'),null)
  for(const value of ['{','null',JSON.stringify({...s,acumulado:-1}),JSON.stringify({...s,inicio:'ontem'})])
    assert.equal(lerSessao({getItem:()=>value},'a'),null)
  assert.equal(lerSessao({getItem:()=>{throw Error('bloqueado')}},'a'),null)
})
test('formata horas e protege duração contra relógio atrasado',()=>{
  assert.equal(formatarTempoEstudo(9),'00:09')
  assert.equal(formatarTempoEstudo(3661),'01:01:01')
  assert.equal(formatarTempoEstudo(360000),'100:00:00')
  assert.equal(segundosDaSessao(s,inicio-1000),0)
  assert.equal(segundosDaSessao(null),0)
})
