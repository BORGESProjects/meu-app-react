import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
const itens=JSON.parse(zlib.gunzipSync(await fs.readFile('docs/acervo/revisao-profissional/revisao-semantica-v3-alteracoes.json.gz')))
const porIndice=new Map(itens.map(r=>[r.decisao.indice_revisao,r.depois]))
test('as 222 revisões preservam identidade, alternativas, gabarito, ano e elegibilidade',()=>{
 assert.equal(itens.length,222);assert.equal(new Set(itens.map(r=>r.id)).size,222)
 for(const {antes,depois,decisao} of itens){
  for(const k of ['id','banca','ano','resposta_correta','gabarito_oficial','opcoes','fonte','dificuldade','anulada'])assert.deepEqual(depois[k],antes[k])
  assert.equal(depois.integridade_profissional.apta_resolucao,antes.integridade_profissional.apta_resolucao)
  assert.equal(depois.classificacao_pendente,false)
  if(!decisao.visual)for(const k of ['enunciado','texto_apoio','imagens_paginas'])assert.deepEqual(depois[k],antes[k])
 }
})
test('contextos de resolução são recuperados sem transportar questões vizinhas',()=>{
 assert.match(porIndice.get(393).texto_apoio,/material de consumo — 5\.200/)
 assert.match(porIndice.get(393).texto_apoio,/Total — 226\.000 — 226\.000/)
 assert.match(porIndice.get(393).texto_apoio,/R\$ 1\.800/)
 assert.match(porIndice.get(401).texto_apoio,/integra ata de registro de preços/)
 assert.doesNotMatch(porIndice.get(354).texto_apoio,/ocitocina|People analytics|106/)
 assert.doesNotMatch(porIndice.get(397).texto_apoio,/transformador/)
 assert.doesNotMatch(porIndice.get(316).texto_apoio,/81 |82 |83 |84 /)
})
test('reconstrução não transforma assertivas deliberadamente erradas em corretas',()=>{
 assert.match(porIndice.get(348).enunciado,/153/)
 assert.match(porIndice.get(377).enunciado,/Ctrl \+ R/)
 assert.match(porIndice.get(399).enunciado,/IaaS/)
 assert.match(porIndice.get(407).enunciado,/Lei de Diretrizes Orçamentárias/)
 assert.match(porIndice.get(344).enunciado,/afeta direta/)
 assert.match(porIndice.get(397).enunciado,/o tamanho/)
 assert.equal(porIndice.get(264).materia,'Segurança do Trabalho')
 assert.equal(porIndice.get(285).materia,'Engenharia Civil')
 assert.equal(porIndice.get(324).materia,'Agronomia')
 assert.equal(porIndice.get(380).materia,'Direito Administrativo')
})
test('as 12 conferências visuais têm origem e hash verificáveis',async()=>{
 const visuais=itens.filter(r=>r.decisao.visual);assert.equal(visuais.length,12)
 for(const {depois} of visuais){const v=depois.revisao_semantica_visual;assert.equal(createHash('sha256').update(await fs.readFile('public/acervo-extraido/'+v.imagem)).digest('hex'),v.sha256);assert.equal(depois.pagina_imagem,v.imagem);assert.equal(depois.documento_id,v.imagem.slice(8,24))}
})
