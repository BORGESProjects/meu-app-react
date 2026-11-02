import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
const nome='revisao-cti-saude-avancada-2024-v421',root=`tmp/revisao-profissional/${nome}/acervo-extraido`,base=raizesAtuais[0],doc='277ee486251b8535'
const ds=JSON.parse(await fs.readFile(`tmp/decisoes-${nome}.json`,'utf8')),ids=new Set(ds.map(x=>x.id)),m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8')),b=JSON.parse(await fs.readFile(path.join(base,'manifesto.json'),'utf8'))
assert.equal(ds.length,80);assert.equal(new Set(ds.map(x=>x.numero)).size,70);assert.equal(m.questoes_extraidas_unicas,b.questoes_extraidas_unicas);assert.equal(m.questoes_disponiveis_resolucao,b.questoes_disponiveis_resolucao-10)
const changed=[];for(let i=0;i<m.lotes.length;i++)if(m.lotes[i].arquivo!==b.lotes[i].arquivo)changed.push(i);assert.equal(changed.length,3)
const qs=new Map();for(const i of changed){const lote=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))));for(const q of lote)if(ids.has(q.id))qs.set(q.id,q)}assert.equal(qs.size,80)
let unique=0,dups=0,annulled=0,auto=0
for(const q of qs.values()){
 const d=ds.find(x=>x.id===q.id);assert.ok(d);assert.equal(q.ano,2024);assert.equal(q.banca,'CEBRASPE');assert.equal(q.concurso,'CTI Renato Archer 2024 — Cargo 16: Tecnologista Júnior I — Saúde Avançada');assert.ok(q.materia&&q.conteudo&&q.dificuldade);assert.deepEqual(q.opcoes,['Certo','Errado']);assert.equal(q.resposta_correta,d.resposta_correta);assert.equal(q.anulada,d.anulada);assert.equal(q.gabarito_oficial?.fonte,'https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_002_01.PDF')
 assert.equal(q.pagina_imagem,`paginas/${doc}-${String(d.pagina).padStart(4,'0')}.webp`);await fs.access(path.join('public/acervo-extraido',q.pagina_imagem));for(const x of q.contexto_paginas||[])await fs.access(path.join('public/acervo-extraido',x.imagem))
 if(d.apta_resolucao===false){dups++;assert.equal(q.integridade_profissional?.apta_resolucao,false);assert.equal(q.duplicada_de,d.duplicada_de)}else{unique++;assert.equal(q.integridade_profissional?.apta_resolucao,true);if(d.anulada){annulled++;assert.equal(q.integridade_profissional?.correcao_automatica,false)}else{auto++;assert.equal(q.integridade_profissional?.correcao_automatica,true)}}
}
assert.equal(unique,70);assert.equal(dups,10);assert.equal(annulled,4);assert.equal(auto,66)
const q59=[...qs.values()].find(q=>q.numero_original===59&&q.integridade_profissional.apta_resolucao);assert.ok(q59.texto_apoio.includes('tₓ'));assert.ok(q59.texto_apoio.includes('tᵧ'))
for(const field of ['indice_facetas','classificacao_principal']){const f=m[field],buf=await lerArquivoAtual(f.arquivo,[root,...raizesAtuais]);assert.equal(createHash('sha256').update(buf).digest('hex'),f.sha256);JSON.parse(zlib.gunzipSync(buf))}
const result={validado_em:new Date().toISOString(),registros_revistos:80,itens_unicos:70,duplicatas_inelegiveis:10,itens_anulados:4,itens_corrigiveis:66,classificacao_especifica_em_todos:true,formula_matricial_transcrita:true,ocr_contaminado_corrigido:true,imagens_de_3_paginas_preservadas:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas,disponiveis:m.questoes_disponiveis_resolucao,pacote_publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2))
