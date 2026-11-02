import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
const root='tmp/revisao-profissional/revisao-ibama-fauna-2025-v417/acervo-extraido'
const base='tmp/revisao-profissional/revisao-cau-mg-arquiteto-2025-v416/acervo-extraido'
const doc='060114ec12d567d3'
const ids=new Set(JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8')).map(q=>q.id))
const m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8'))
const b=JSON.parse(await fs.readFile(path.join(base,'manifesto.json'),'utf8'))
assert.equal(m.questoes_extraidas_unicas,b.questoes_extraidas_unicas);assert.equal(m.questoes_disponiveis_resolucao,b.questoes_disponiveis_resolucao)
const changed=[];for(let i=0;i<m.lotes.length;i++)if(m.lotes[i].arquivo!==b.lotes[i].arquivo)changed.push(i)
assert.equal(changed.length,2)
const qs=new Map()
for(const i of changed){const next=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))));for(const q of next)if(ids.has(q.id))qs.set(q.id,q)}
assert.equal(qs.size,60);let annulled=0,correctable=0
for(const q of qs.values()){
 assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.ok(q.materia&&q.conteudo&&q.ano===2025&&q.banca==='CEBRASPE'&&q.concurso.includes('IBAMA 2025'))
 assert.ok(q.integridade_profissional?.apta_resolucao===true&&q.gabarito_oficial?.sha256)
 assert.ok(q.pagina_imagem&&q.contexto_paginas?.some(x=>x.pagina===q.pagina));await fs.access(path.join('public/acervo-extraido',q.pagina_imagem))
 if(q.anulada){annulled++;assert.ok([60,72,86].includes(q.numero_original));assert.equal(q.resposta_correta,null);assert.equal(q.integridade_profissional.correcao_automatica,false)}
 else {correctable++;assert.ok(Number.isInteger(q.resposta_correta));assert.equal(q.integridade_profissional.correcao_automatica,true)}
}
assert.equal(annulled,2);assert.equal(correctable,58)
for(const field of ['indice_facetas','classificacao_principal']){const d=m[field],buf=await lerArquivoAtual(d.arquivo,raizesAtuais);assert.equal(createHash('sha256').update(buf).digest('hex'),d.sha256);JSON.parse(zlib.gunzipSync(buf))}
const out={validado_em:new Date().toISOString(),itens:qs.size,anuladas:annulled,com_correcao:correctable,lotes_alterados:changed.length,imagens_existentes:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas,nao_disponiveis_para_resolucao:m.questoes_extraidas_unicas-m.questoes_disponiveis_resolucao}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-ibama-fauna-2025-v417.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
