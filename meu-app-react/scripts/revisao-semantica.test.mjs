import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {classificarTI} from './acervo-publico/agente-ti-regras.mjs'
import {classificarDireito} from './acervo-publico/agente-direito-classificador.mjs'
import {classificarObjetoExplicito} from './acervo-publico/classificar_objeto_explicito.mjs'
const itens=JSON.parse(zlib.gunzipSync(await fs.readFile('docs/acervo/revisao-profissional/revisao-semantica-alteracoes.json.gz')))
const porIndice=new Map(itens.map(r=>[r.indice_revisao,r.depois]))
test('revisão semântica preserva identidade, gabaritos e elegibilidade',()=>{
 assert.equal(itens.length,220);assert.equal(new Set(itens.map(r=>r.id)).size,220)
 for(const {antes,depois} of itens){
  for(const k of ['id','banca','ano','resposta_correta','gabarito_oficial','opcoes','fonte','dificuldade','anulada'])assert.deepEqual(depois[k],antes[k])
  assert.equal(depois.integridade_profissional.apta_resolucao,antes.integridade_profissional.apta_resolucao)
  assert.equal(depois.classificacao_pendente,false)
  if(!depois.revisao_semantica_visual)for(const k of ['enunciado','texto_apoio','imagens_paginas'])assert.deepEqual(depois[k],antes[k])
 }
})
test('classifica pela cobrança e não por palavras incidentais',()=>{
 assert.equal(porIndice.get(25).materia,'Administração')
 assert.equal(porIndice.get(60).materia,'Administração Financeira e Orçamentária')
 assert.equal(porIndice.get(140).materia,'Arquivologia')
 assert.equal(porIndice.get(164).materia,'Segurança do Trabalho')
 assert.equal(porIndice.get(218).materia,'Educação Física')
 assert.equal(porIndice.get(96).conteudo,'Colocação pronominal')
 assert.match(porIndice.get(176).conteudo,/IPSec/)
})
test('contextos reconstruídos permanecem vinculados às seis imagens conferidas',async()=>{
 const visuais=itens.filter(r=>r.depois.revisao_semantica_visual);assert.equal(visuais.length,6)
 for(const {depois} of visuais){const v=depois.revisao_semantica_visual;assert.equal(createHash('sha256').update(await fs.readFile('public/acervo-extraido/'+v.imagem)).digest('hex'),v.sha256);assert.equal(depois.pagina_imagem,v.imagem)}
 assert.equal(porIndice.get(9).enunciado,'Um firewall é incapaz de fazer roteamento.')
 assert.doesNotMatch(porIndice.get(195).enunciado,/ABNT/)
 assert.match(porIndice.get(31).enunciado,/S̲ ▾/)
 assert.match(porIndice.get(95).texto_apoio,/Porta: 191\.125\.13\.1/)
 assert.doesNotMatch(porIndice.get(217).texto_apoio,/Santo Agostinho/)
})
test('os classificadores não repetem falsos positivos identificados nesta revisão',()=>{
 const antes=i=>itens.find(r=>r.indice_revisao===i).antes
 for(const i of [25,140,164,176,217])assert.equal(classificarTI(antes(i)),null)
 for(const i of [75,210,218])assert.equal(classificarDireito(antes(i)),null)
 assert.equal(classificarObjetoExplicito(antes(60)),null)
})
