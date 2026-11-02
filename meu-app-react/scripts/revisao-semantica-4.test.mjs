import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
const itens=JSON.parse(zlib.gunzipSync(await fs.readFile('docs/acervo/revisao-profissional/revisao-semantica-v4-alteracoes.json.gz')))
const porIndice=new Map(itens.map(r=>[r.decisao.indice_revisao,r.depois]))
test('pacote acumulado preserva todas as 222 revisões anteriores e mais 160 classificações',async()=>{
 const anteriores=JSON.parse(zlib.gunzipSync(await fs.readFile('docs/acervo/revisao-profissional/revisao-semantica-v3-alteracoes.json.gz')))
 assert.equal(itens.length,382);assert.equal(new Set(itens.map(r=>r.id)).size,382)
 const mapa=new Map(itens.map(x=>[x.id,x.depois]));for(const r of anteriores)assert.deepEqual(mapa.get(r.id),r.depois)
 for(const {antes,depois,decisao} of itens){
  for(const k of ['id','banca','ano','resposta_correta','gabarito_oficial','opcoes','fonte','dificuldade','anulada'])assert.deepEqual(depois[k],antes[k])
  assert.equal(depois.integridade_profissional.apta_resolucao,antes.integridade_profissional.apta_resolucao)
  assert.equal(depois.classificacao_pendente,false)
  if(!decisao.visual)for(const k of ['enunciado','texto_apoio','imagens_paginas'])assert.deepEqual(depois[k],antes[k])
 }
})
test('tabelas, SQL e cenários necessários ficam junto da assertiva correspondente',()=>{
 const sql=porIndice.get(505);assert.match(sql.texto_apoio,/20250111112/);assert.match(sql.texto_apoio,/5 \| 2 \| 101 \| réu/)
 assert.match(sql.enunciado,/LEFT JOIN Partes pa ON p\.id_processo = pa\.id_processo/)
 assert.match(sql.enunciado,/LEFT JOIN Pessoas ps ON pa\.id_pessoa = ps\.id_pessoa/)
 assert.match(porIndice.get(498).texto_apoio,/100% inscritos em restos a pagar processados/)
 assert.match(porIndice.get(563).texto_apoio,/40 dias/);assert.doesNotMatch(porIndice.get(563).texto_apoio,/João/)
 assert.match(porIndice.get(565).texto_apoio,/VPA\) — 980\.000/)
 assert.match(porIndice.get(599).texto_apoio,/fevereiro de 2026/)
 assert.match(porIndice.get(530).enunciado,/para cada para cada/)
})
test('classificação considera a cobrança e o contexto da área',()=>{
 for(const i of [455,497])assert.equal(porIndice.get(i).materia,'Contabilidade Pública')
 assert.equal(porIndice.get(483).materia,'Engenharia Elétrica')
 assert.equal(porIndice.get(573).materia,'Comunicação Social')
 assert.equal(porIndice.get(592).materia,'Serviço Social')
 assert.match(porIndice.get(496).conteudo,/Teams/)
 assert.doesNotMatch(porIndice.get(580).conteudo,/Programação/)
 assert.match(porIndice.get(581).conteudo,/DHCP/)
})
test('29 reconstruções mantêm vínculo verificável com as imagens conferidas',async()=>{
 const visuais=itens.filter(r=>r.decisao.visual);assert.equal(visuais.length,29)
 for(const {depois} of visuais){const v=depois.revisao_semantica_visual;assert.equal(createHash('sha256').update(await fs.readFile('public/acervo-extraido/'+v.imagem)).digest('hex'),v.sha256);assert.equal(depois.pagina_imagem,v.imagem)}
})
