import test from 'node:test'
import assert from 'node:assert/strict'
import {tituloCorresponde} from './coletor.mjs'
test('confere título do capítulo sem confundir FIXAR com seu título',()=>{
 assert.equal(tituloCorresponde('Dinâmica I',['07','Dinâmica I','FIXAR']),true)
 assert.equal(tituloCorresponde('Inequações do 1.º e 2.º grau',['08','Inequações do 1.º e do 2.º grau','FIXAR']),true)
 assert.equal(tituloCorresponde('Artrópodes',['08','Artrópodes e equinodermos','FIXAR']),true)
 assert.equal(tituloCorresponde('Funções inorgânicas II',['08','Funções inorgânicas – II','FIXAR']),true)
})
test('não aceita capítulo diferente, numeral romano diferente nem página vazia',()=>{
 assert.equal(tituloCorresponde('Dinâmica I',['08','Dinâmica II','FIXAR']),false)
 assert.equal(tituloCorresponde('Morfologia IV',['09','Sintaxe - Introdução','FIXAR']),false)
 assert.equal(tituloCorresponde('Hidrografia',[]),false)
})
