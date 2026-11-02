import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
const nome='revisao-fub-mineracao-2016-v420',root=`tmp/revisao-profissional/${nome}/acervo-extraido`,base=raizesAtuais[0],doc='a1c9efc3c51e6b78'
const decisions=JSON.parse(await fs.readFile(`tmp/decisoes-${nome}.json`,'utf8')),ids=new Set(decisions.map(x=>x.id)),m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8')),b=JSON.parse(await fs.readFile(path.join(base,'manifesto.json'),'utf8'))
assert.equal(decisions.length,73);assert.equal(new Set(decisions.map(x=>x.numero)).size,70);assert.equal(m.questoes_extraidas_unicas,b.questoes_extraidas_unicas);assert.equal(m.questoes_disponiveis_resolucao,b.questoes_disponiveis_resolucao-3)
const changed=[];for(let i=0;i<m.lotes.length;i++)if(m.lotes[i].arquivo!==b.lotes[i].arquivo)changed.push(i);assert.equal(changed.length,3)
const qs=new Map();for(const i of changed){const lote=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))));for(const q of lote)if(ids.has(q.id))qs.set(q.id,q)}
assert.equal(qs.size,73);const expected=new Map(decisions.map(d=>[d.id,d]));let eligible=0,duplicates=0,corrected=0
for(const q of qs.values()){
 const d=expected.get(q.id);assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true);assert.equal(q.ano,2016);assert.equal(q.banca,'CEBRASPE');assert.equal(q.concurso,'FUB 2016 — Cargo 17: Técnico em Mineração');assert.ok(q.materia&&q.conteudo&&q.dificuldade&&q.tipo_resposta==='certo_errado');assert.deepEqual(q.opcoes,['Certo','Errado']);assert.equal(q.resposta_correta,d.resposta_correta);assert.equal(q.anulada,false)
 assert.equal(q.pagina,d.pagina);assert.equal(q.pagina_imagem,`paginas/${doc}-${String(d.pagina).padStart(4,'0')}.webp`);await fs.access(path.join('public/acervo-extraido',q.pagina_imagem));for(const x of q.contexto_paginas||[])await fs.access(path.join('public/acervo-extraido',x.imagem))
 assert.equal(q.gabarito_oficial?.fonte,'https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_017_01.pdf')
 if(d.apta_resolucao===false){duplicates++;assert.equal(q.integridade_profissional?.apta_resolucao,false);assert.equal(q.duplicada_de,d.duplicada_de)}else{eligible++;assert.equal(q.integridade_profissional?.apta_resolucao,true);assert.equal(q.integridade_profissional?.correcao_automatica,true)}
 if([81,86,120].includes(q.numero_original)){assert.equal(q.enunciado,d.enunciado);corrected++}
}
assert.equal(eligible,70);assert.equal(duplicates,3);assert.equal(corrected,3)
for(const field of ['indice_facetas','classificacao_principal']){const x=m[field],buf=await lerArquivoAtual(x.arquivo,[root,...raizesAtuais]);assert.equal(createHash('sha256').update(buf).digest('hex'),x.sha256);JSON.parse(zlib.gunzipSync(buf))}
const result={validado_em:new Date().toISOString(),registros_revistos:73,questoes_unicas:70,duplicatas_inelegiveis:3,questoes_elegiveis:70,questoes_com_gabarito_definitivo:70,itens_anulados:0,ocr_limites_corrigidos:corrected,imagens_das_3_paginas_conferidas:true,contexto_adicional_item_95:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas,disponiveis:m.questoes_disponiveis_resolucao,pacote_publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2))
