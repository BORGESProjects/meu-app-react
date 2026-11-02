import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {classificarObjetoExplicito as c} from './acervo-publico/classificar_objeto_explicito.mjs'
import {aplicarRevisaoVisual} from './acervo-publico/aplicar_revisao_visual.mjs'
test('distingue termos técnicos homônimos e contexto linguístico',()=>{
 assert.equal(c({enunciado:'O polimorfismo explica diferenças no metabolismo da succinilcolina.'}),null)
 assert.equal(c({enunciado:'O encapsulamento com acesso protegido aos métodos permite acesso pela própria classe.'}).materia,'Informática')
 assert.equal(c({enunciado:'No texto, o autor discute phishing para alertar seus leitores.'}),null)
 assert.equal(c({enunciado:'As chaves estrangeiras são descritas no texto do autor.'}),null)
 assert.equal(c({enunciado:'O acesso direto a registros é eficiente ao se usar funções hash.'}).materia,'Informática')
})
test('a tarefa específica prevalece sobre reescrita genérica e palavra incidental',()=>{
 assert.equal(c({enunciado:'A correção gramatical seria mantida se o termo fosse isolado por vírgulas.'}).conteudo,'Pontuação: emprego da vírgula')
 assert.match(c({enunciado:'No planejamento estratégico, a cultura organizacional integra os fatores internos.'}).conteudo,/Planejamento estratégico/)
 assert.equal(c({enunciado:'O MPS.BR define processos. Com relação ao regimento interno, julgue os itens seguintes.'}),null)
})
test('reconstrução de colunas conserva palavras críticas e autoria dos textos-base',()=>{
 const revisoes=JSON.parse(fs.readFileSync('docs/acervo/revisao-profissional/reconstrucao-colunas.json'))
 const fontes=JSON.parse(fs.readFileSync('tmp/revisao-profissional/questoes-consultadas.json'))
 assert.equal(revisoes.length,3)
 for(const q of fontes){
  const r=aplicarRevisaoVisual(q,revisoes)
  assert.equal(r.resposta_correta,q.resposta_correta)
  assert.deepEqual(r.opcoes,q.opcoes)
  assert.deepEqual(r.imagens_paginas,q.imagens_paginas)
  assert.equal(r.ano,q.ano)
 }
 const pm=revisoes.find(r=>r.id==='extr-6e970c57ca83dde67ca3').campos
 assert.match(pm.texto_apoio,/Alexandra Ozorio de Almeida/u)
 assert.match(pm.texto_apoio,/não renda prêmios/u)
 assert.doesNotMatch(pm.enunciado,/imploram|Julgue os p/u)
 const abin=revisoes.find(r=>r.id==='extr-7ec22b1473f83f898c41').campos
 assert.match(abin.enunciado,/multiplicam-se e desenvolve-se/u)
 assert.match(abin.texto_apoio,/conhece hoje por/u)
 assert.match(abin.texto_apoio,/sempre desempenhou/u)
 assert.match(abin.texto_apoio,/o que chamo de guerra/u)
 assert.doesNotMatch(abin.texto_apoio,/Texto CB1A1BBB/u)
})
