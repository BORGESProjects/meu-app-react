import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
const root='tmp/revisao-profissional/revisao-tcern-arquivologia-2026-v418/acervo-extraido'
const base='tmp/revisao-profissional/revisao-ibama-fauna-2025-v417/acervo-extraido'
const doc='346e9fb95534b7af',ids=new Set(JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8')).map(q=>q.id))
const m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8')),b=JSON.parse(await fs.readFile(path.join(base,'manifesto.json'),'utf8'))
assert.equal(m.questoes_extraidas_unicas,b.questoes_extraidas_unicas);assert.equal(m.questoes_disponiveis_resolucao,b.questoes_disponiveis_resolucao)
const changed=[];for(let i=0;i<m.lotes.length;i++)if(m.lotes[i].arquivo!==b.lotes[i].arquivo)changed.push(i);assert.equal(changed.length,2)
const qs=new Map();for(const i of changed){const lote=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))));for(const q of lote)if(ids.has(q.id))qs.set(q.id,q)}
assert.equal(qs.size,44);let anuladas=0,correcao=0
for(const q of qs.values()){
 assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true);assert.ok(q.materia&&q.conteudo&&q.ano===2026&&q.banca==='CEBRASPE'&&q.concurso.includes('TCE/RN 2026'))
 assert.ok(q.integridade_profissional?.apta_resolucao===true&&q.gabarito_oficial?.sha256);assert.ok(q.pagina_imagem&&q.contexto_paginas?.some(x=>x.pagina===q.pagina));await fs.access(path.join('public/acervo-extraido',q.pagina_imagem))
 if(q.anulada){anuladas++;assert.ok([88,99].includes(q.numero_original));assert.equal(q.resposta_correta,null);assert.equal(q.integridade_profissional.correcao_automatica,false)}else{correcao++;assert.ok(Number.isInteger(q.resposta_correta));assert.equal(q.integridade_profissional.correcao_automatica,true)}
}
assert.equal(anuladas,2);assert.equal(correcao,42)
const q87=[...qs.values()].find(q=>q.numero_original===87),q88=[...qs.values()].find(q=>q.numero_original===88),q89=[...qs.values()].find(q=>q.numero_original===89)
assert.ok(q87.enunciado.includes('não são apresentados mecanismos'));assert.ok(q88.enunciado.includes('bem como o tempo'));assert.equal(q89.enunciado,'A confiabilidade de um custodiante de documentos digitais não deve ser fundamentada no uso de determinadas tecnologias.')
for(const field of ['indice_facetas','classificacao_principal']){const d=m[field],buf=await lerArquivoAtual(d.arquivo,raizesAtuais);assert.equal(createHash('sha256').update(buf).digest('hex'),d.sha256);JSON.parse(zlib.gunzipSync(buf))}
const out={validado_em:new Date().toISOString(),itens:qs.size,anuladas,com_correcao:correcao,lotes_alterados:changed.length,imagens_existentes:true,ocr_revisado:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-tcern-arquivologia-2026-v418.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
