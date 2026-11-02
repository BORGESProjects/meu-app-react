import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-hub-cirurgia-residencia-2020-v428',doc='3ac113b6de0703f9'
const root=raizesAtuais[0],previous=raizesAtuais[1]
const audit=JSON.parse(zlib.gunzipSync(await fs.readFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`)))
const decisions=audit.map(x=>x.decisao)
const manifest=JSON.parse(await fs.readFile(path.join(root,'manifesto.json')))
const old=JSON.parse(await fs.readFile(path.join(previous,'manifesto.json')))
assert.equal(decisions.length,79)
assert.equal(new Set(decisions.map(d=>d.id)).size,79)
assert.equal(new Set(decisions.map(d=>d.numero)).size,79)
assert.deepEqual(decisions.filter(d=>d.anulada).map(d=>d.numero),[10])
assert.equal(manifest.questoes_extraidas_unicas,old.questoes_extraidas_unicas)
assert.equal(manifest.questoes_disponiveis_resolucao,old.questoes_disponiveis_resolucao)
const ids=new Set(decisions.map(d=>d.id)),questions=new Map(),changed=[]
for(let i=0;i<manifest.lotes.length;i++)if(manifest.lotes[i].arquivo!==old.lotes[i].arquivo)changed.push(i)
assert.equal(changed.length,2)
for(const i of changed){
 const bytes=await fs.readFile(path.join(root,manifest.lotes[i].arquivo))
 assert.ok(manifest.lotes[i].arquivo.includes(hashRevisao(bytes).slice(0,12)))
 const lot=JSON.parse(zlib.gunzipSync(bytes))
 for(const q of lot)if(ids.has(q.id))questions.set(q.id,q)
}
assert.equal(questions.size,79)
for(const d of decisions){
 const q=questions.get(d.id);assert.ok(q)
 assert.equal(q.ano,2020);assert.equal(q.banca,'CEBRASPE');assert.equal(q.materia,d.materia);assert.equal(q.conteudo,d.conteudo)
 assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.equal(q.dificuldade,d.dificuldade);assert.equal(q.numero_original,d.numero)
 assert.equal(q.enunciado,d.enunciado);assert.equal(q.texto_apoio,d.texto_apoio)
 assert.equal(q.resposta_correta,d.resposta_correta);assert.equal(q.anulada,d.anulada)
 assert.equal(q.gabarito_oficial?.fonte,d.gabarito_oficial.fonte);assert.equal(q.gabarito_oficial?.valor,d.gabarito_oficial.valor)
 assert.ok(q.enunciado.length>=25);assert.ok(q.conteudo.length>10)
 assert.equal(q.revisao_semantica_visual?.metodo,'Conferência visual individual da página original')
 assert.ok(q.pagina_imagem.startsWith(`paginas/${doc}-`))
 await fs.access(path.join('public/acervo-extraido',q.pagina_imagem))
 assert.ok(q.contexto_paginas?.length);assert.ok(q.imagens_paginas?.includes(q.pagina_imagem))
 if(d.anulada){assert.equal(q.integridade_profissional?.correcao_automatica,false);assert.equal(q.gabarito_oficial?.valor,'X')}
 else assert.equal(q.integridade_profissional?.correcao_automatica,true)
 assert.ok(!/\|\|Matriz_496_RM003\|\||Espaço livre/.test(q.enunciado))
}
const source=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
assert.equal(source.url,'https://cdn.cebraspe.org.br/concursos/HUB_20_MEDICA/arquivos/MATRIZ_496_RM003.PDF')
const key=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).trim().split(/\r?\n/).map(JSON.parse).find(x=>x.documento_id===doc)
assert.equal(Object.keys(key.respostas).length,100)
for(const d of decisions)assert.equal(key.respostas[d.numero],d.gabarito_oficial.valor)
const facets=await fs.readFile(path.join(root,manifest.indice_facetas.arquivo))
assert.equal(hashRevisao(facets),manifest.indice_facetas.sha256)
const f=JSON.parse(zlib.gunzipSync(facets));assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),manifest.questoes_disponiveis_resolucao)
const report={validado_em:new Date().toISOString(),documento:doc,registros_revisados:79,itens_unicos:79,anulado_no_lote:[10],com_correcao_automatica:78,gabarito_definitivo_oficial_cobre_1_a_100:true,classificacao_banca_ano_materia_conteudo_dificuldade:true,contextos_imagens_e_paginas_preservados:79,integridade_dos_lotes_e_facetas_verificada:true,total_acervo:manifest.questoes_extraidas_unicas,disponiveis:manifest.questoes_disponiveis_resolucao,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
