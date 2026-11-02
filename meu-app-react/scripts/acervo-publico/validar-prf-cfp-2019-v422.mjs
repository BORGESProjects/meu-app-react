import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
const nome='revisao-prf-cfp-2019-v422',root=`tmp/revisao-profissional/${nome}/acervo-extraido`,base=raizesAtuais[0],doc='a21b81371dd0883a'
const ds=JSON.parse(await fs.readFile(`tmp/decisoes-${nome}.json`,'utf8')),ids=new Set(ds.map(x=>x.id)),m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8')),b=JSON.parse(await fs.readFile(path.join(base,'manifesto.json'),'utf8'))
assert.equal(ds.length,80);assert.equal(new Set(ds.map(x=>x.numero)).size,80);assert.equal(m.questoes_extraidas_unicas,b.questoes_extraidas_unicas);assert.equal(m.questoes_disponiveis_resolucao,b.questoes_disponiveis_resolucao)
const changed=[];for(let i=0;i<m.lotes.length;i++)if(m.lotes[i].arquivo!==b.lotes[i].arquivo)changed.push(i);assert.equal(changed.length,2)
const qs=new Map();for(const i of changed){const lote=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))));for(const q of lote)if(ids.has(q.id))qs.set(q.id,q)}assert.equal(qs.size,80)
let annulled=0,auto=0
for(const q of qs.values()){
 const d=ds.find(x=>x.id===q.id);assert.ok(d);assert.equal(q.ano,2019);assert.equal(q.banca,'CEBRASPE');assert.equal(q.concurso,'PRF 2019 — Curso de Formação Profissional — 1.ª prova objetiva');assert.ok(q.materia&&q.conteudo&&q.dificuldade);assert.deepEqual(q.opcoes,['Certo','Errado']);assert.equal(q.resposta_correta,d.resposta_correta);assert.equal(q.anulada,d.anulada);assert.equal(q.gabarito_oficial?.fonte,'https://cdn.cebraspe.org.br/concursos/prf_18/arquivos/GAB_DEFINITIVO_CF_PRF_1APROVA_001_01.PDF')
 assert.equal(q.pagina_imagem,`paginas/${doc}-${String(d.pagina).padStart(4,'0')}.webp`);await fs.access(path.join('public/acervo-extraido',q.pagina_imagem))
 if(d.anulada){annulled++;assert.equal(q.integridade_profissional?.correcao_automatica,false)}else{auto++;assert.equal(q.integridade_profissional?.correcao_automatica,true)}
}
assert.equal(annulled,4);assert.equal(auto,76)
const byNum=new Map([...qs.values()].map(q=>[q.numero_original,q]));assert.ok(byNum.get(36).resposta_correta===1);assert.ok(byNum.get(34).enunciado.length<170);assert.ok(byNum.get(45).enunciado.length<140)
for(const n of [1,16,35,37,46,56,66,72,79])assert.ok(byNum.get(n).texto_apoio,'Texto-base ausente no item '+n)
for(const field of ['indice_facetas','classificacao_principal']){const f=m[field],buf=await lerArquivoAtual(f.arquivo,[root,...raizesAtuais]);assert.equal(createHash('sha256').update(buf).digest('hex'),f.sha256);JSON.parse(zlib.gunzipSync(buf))}
const result={validado_em:new Date().toISOString(),itens:80,duplicatas:0,itens_anulados:4,itens_com_correcao_automatica:76,item_36_corrigido_para_E:true,textos_base_associados_aos_blocos:true,ocr_mesclado_corrigido:[34,45],imagens_das_paginas_existentes:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas,disponiveis:m.questoes_disponiveis_resolucao,pacote_publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2))
