import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-tcepa-webdesign-2016-v424',doc='a0e1ebc82d1d6586',root=raizesAtuais[0],previous=raizesAtuais[1]
const ds=JSON.parse(await fs.readFile(`tmp/decisoes-${nome}.json`,'utf8')),m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8')),old=JSON.parse(await fs.readFile(path.join(previous,'manifesto.json'),'utf8'))
assert.equal(ds.length,67);assert.equal(ds.filter(x=>x.apta_resolucao===false).length,5);assert.equal(new Set(ds.filter(x=>x.apta_resolucao!==false).map(x=>x.numero_original)).size,62)
assert.equal(m.questoes_extraidas_unicas,old.questoes_extraidas_unicas);assert.equal(m.questoes_disponiveis_resolucao,old.questoes_disponiveis_resolucao-5)
const changed=[];for(let i=0;i<m.lotes.length;i++)if(m.lotes[i].arquivo!==old.lotes[i].arquivo)changed.push(i);assert.equal(changed.length,3)
const ids=new Set(ds.map(d=>d.id)),qs=new Map();for(const i of changed){const arr=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))));for(const q of arr)if(ids.has(q.id))qs.set(q.id,q)}assert.equal(qs.size,67)
let duplicates=0,annulled=0,auto=0
for(const d of ds){const q=qs.get(d.id);assert.ok(q);assert.equal(q.ano,2016);assert.equal(q.banca,'CEBRASPE');assert.equal(q.concurso,d.concurso);assert.equal(q.materia,'Informática');assert.equal(q.conteudo,d.conteudo);assert.equal(q.dificuldade,d.dificuldade);assert.equal(q.resposta_correta,d.resposta_correta);assert.equal(q.anulada,d.anulada);assert.equal(q.gabarito_oficial?.fonte,'https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/Gab_Definitivo_251TCEPA_036_01.pdf');assert.ok(q.enunciado?.length>20);assert.ok(q.texto_apoio?.length>20);assert.equal(q.pagina_imagem,`paginas/${doc}-${String(d.pagina).padStart(4,'0')}.webp`);await fs.access(path.join('public/acervo-extraido',q.pagina_imagem));if(d.apta_resolucao===false){duplicates++;assert.equal(q.integridade_profissional?.apta_resolucao,false);assert.equal(q.duplicada_de,d.duplicada_de)}else if(d.anulada){annulled++;assert.equal(q.integridade_profissional?.correcao_automatica,false)}else{auto++;assert.equal(q.integridade_profissional?.correcao_automatica,true)}}
assert.equal(duplicates,5);assert.equal(annulled,2);assert.equal(auto,60)
const byNum=new Map(ds.filter(d=>d.apta_resolucao!==false).map(d=>[d.numero_original,qs.get(d.id)]));assert.ok(byNum.get(84).enunciado.includes('seletor {propriedade: valor'));assert.ok(byNum.get(58).enunciado==='O termo wireframe designa a estrutura de informações em um banco de dados.')
const bytes=await fs.readFile(path.join(root,m.indice_facetas.arquivo));assert.equal(createHash('sha256').update(bytes).digest('hex'),m.indice_facetas.sha256);JSON.parse(zlib.gunzipSync(bytes))
const result={validado_em:new Date().toISOString(),registros_reclassificados:67,questoes_canonicas:62,duplicatas_desativadas:duplicates,itens_anulados_neste_lote:annulled,questoes_com_correcao_automatica: auto,caderno_e_gabarito_oficiais_vinculados:true,imagens_das_tres_paginas_preservadas:true,item_84_com_sintaxe_css_transcrita:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas,disponiveis:m.questoes_disponiveis_resolucao,indisponiveis_para_resolucao:m.questoes_indisponiveis_revisao,pacote_publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2))
