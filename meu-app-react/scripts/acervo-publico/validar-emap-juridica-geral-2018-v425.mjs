import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-emap-juridica-geral-2018-v425',doc='05761e9fab4df4ac',root=raizesAtuais[0],previous=raizesAtuais[1]
const ds=JSON.parse(await fs.readFile(`tmp/decisoes-${nome}.json`,'utf8')),m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8')),old=JSON.parse(await fs.readFile(path.join(previous,'manifesto.json'),'utf8'))
assert.equal(ds.length,59);assert.equal(ds.filter(x=>x.apta_resolucao===false).length,1);assert.equal(new Set(ds.filter(x=>x.apta_resolucao!==false).map(x=>x.numero_original)).size,58)
assert.equal(m.questoes_extraidas_unicas,old.questoes_extraidas_unicas);assert.equal(m.questoes_disponiveis_resolucao,old.questoes_disponiveis_resolucao-1)
const changed=[];for(let i=0;i<m.lotes.length;i++)if(m.lotes[i].arquivo!==old.lotes[i].arquivo)changed.push(i);assert.equal(changed.length,2)
const ids=new Set(ds.map(d=>d.id)),qs=new Map();for(const i of changed){const arr=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))));for(const q of arr)if(ids.has(q.id))qs.set(q.id,q)}assert.equal(qs.size,59)
let duplicate=0,auto=0
for(const d of ds){const q=qs.get(d.id);assert.ok(q);assert.equal(q.ano,2018);assert.equal(q.banca,'CEBRASPE');assert.equal(q.concurso,d.concurso);assert.equal(q.materia,d.materia);assert.equal(q.conteudo,d.conteudo);assert.equal(q.dificuldade,d.dificuldade);assert.equal(q.resposta_correta,d.resposta_correta);assert.equal(q.anulada,false);assert.equal(q.gabarito_oficial?.fonte,'https://cdn.cebraspe.org.br/concursos/EMAP_18/arquivos/GAB_DEFINITIVO_402_EMAP008__PAG_4.PDF');assert.ok(q.enunciado?.length>20);assert.ok(q.texto_apoio?.length>20);assert.equal(q.pagina_imagem,`paginas/${doc}-${String(d.pagina).padStart(4,'0')}.webp`);await fs.access(path.join('public/acervo-extraido',q.pagina_imagem));if(d.apta_resolucao===false){duplicate++;assert.equal(q.integridade_profissional?.apta_resolucao,false);assert.equal(q.duplicada_de,d.duplicada_de)}else{auto++;assert.equal(q.integridade_profissional?.correcao_automatica,true);assert.ok(q.gabarito_oficial?.sha256)}}
assert.equal(duplicate,1);assert.equal(auto,58)
const byNum=new Map(ds.filter(d=>d.apta_resolucao!==false).map(d=>[d.numero_original,qs.get(d.id)]));assert.ok(!byNum.get(54).enunciado.includes('Julgue os próximos itens relativos'));assert.ok(!byNum.get(57).enunciado.includes('programação financeira'));assert.ok(!byNum.get(110).enunciado.includes('Maria, casada'));assert.ok(byNum.get(111).texto_apoio.includes('Maria, casada'));assert.ok(byNum.get(120).enunciado.endsWith('embarcações.'))
const facets=await fs.readFile(path.join(root,m.indice_facetas.arquivo));assert.equal(createHash('sha256').update(facets).digest('hex'),m.indice_facetas.sha256);JSON.parse(zlib.gunzipSync(facets))
const result={validado_em:new Date().toISOString(),registros_reclassificados:59,itens_canonicos:58,duplicatas_desativadas:duplicate,questoes_com_correcao_automatica:auto,caderno_e_gabarito_oficiais_vinculados:true,textos_de_contexto_separados:true,imagens_das_quatro_paginas_preservadas:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas,disponiveis:m.questoes_disponiveis_resolucao,indisponiveis_para_resolucao:m.questoes_indisponiveis_revisao,pacote_publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2))
