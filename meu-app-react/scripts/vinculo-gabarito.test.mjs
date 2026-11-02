import test from 'node:test'
import assert from 'node:assert/strict'
import {confirmarItem,vincularGabarito} from './acervo-publico/vincular_gabaritos.mjs'
const texto='1 A Secretaria-Geral de Contencioso representa a União e orienta os órgãos públicos.\n2 A consultoria jurídica possui competências definidas em lei.'
const q={id:'item-1',numero_original:1,pagina:1,enunciado:'A Secretaria-Geral de Contencioso representa a União e orienta os órgãos públicos.',opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',resposta_correta:null}
const tabela={status:'tabela_lida',respostas:{1:'E',2:'C'},gabarito_url:'https://cdn.cebraspe.org.br/gabarito.pdf',sha256:'a'.repeat(64),arquivo_prova:'187AGU_001_01.pdf',arquivo_gabarito:'Gab_Definitivo_187AGU_001_01.pdf'}
test('vincula C/E quando texto, número e caderno têm evidência',()=>{
 const ligada=vincularGabarito(q,tabela,[texto]);assert.equal(ligada.resposta_correta,1);assert.equal(ligada.gabarito_oficial.numero,1)
})
test('não transfere o gabarito de outro número para um enunciado igual',()=>{
 const errada={...q,numero_original:2};assert.equal(confirmarItem(errada,[texto]),null);assert.equal(vincularGabarito(errada,tabela,[texto]).resposta_correta,null)
})
test('não usa caderno ausente, texto não localizado ou alternativa não conferida',()=>{
 assert.equal(vincularGabarito(q,null,[texto]),q);assert.equal(vincularGabarito(q,tabela,['Outra prova completamente diferente']),q)
 const objetiva={...q,opcoes:['Primeira alternativa muito extensa','Segunda alternativa muito extensa','Terceira alternativa muito extensa']}
 assert.equal(vincularGabarito(objetiva,tabela,[texto]),objetiva)
})
test('anulação oficial não vira uma alternativa correta inventada',()=>{
 const anulada=vincularGabarito(q,{...tabela,respostas:{1:'X'}},[texto]);assert.equal(anulada.anulada,true);assert.equal(anulada.resposta_correta,null)
})
test('letras A/B/D de múltipla escolha não se transformam em Errado',()=>{
 assert.equal(vincularGabarito(q,{...tabela,respostas:{1:'A'}},[texto]),q)
})
test('um número no meio de uma frase não se passa pelo marcador da questão',()=>{
 const fonte='2 Considere o valor 1 A Secretaria-Geral de Contencioso representa a União e orienta os órgãos públicos.'
 assert.equal(confirmarItem(q,[fonte]),null)
})
