import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-depen-cargo8-agente-federal-execucao-penal-v524'
const doc='706b0a315cf4ce57',dir=`tmp/revisao-profissional/${nome}/acervo-extraido`
const urls={
 basicos:'https://cdn.cebraspe.org.br/concursos/depen_20/arquivos/GAB_DEFINITIVO_MATRIZ_541_DEPEN_CB2_00.PDF',
 especificos:'https://cdn.cebraspe.org.br/concursos/depen_20/arquivos/gab_definitivo_matriz_541_depen_008_00.pdf',
 complementares:'https://cdn.cebraspe.org.br/concursos/depen_20/arquivos/GAB_DEFINITIVO_MATRIZ_541_DEPEN_CG2_00.PDF'
}
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'),'utf8'))
const ids=new Set(),questoes=[]
for(const lote of m.lotes.filter(x=>x.arquivo.includes(nome+'-'))){
 const bytes=await fs.readFile(path.join(dir,lote.arquivo));assert.ok(lote.arquivo.includes(hashRevisao(bytes).slice(0,12)))
 for(const q of JSON.parse(zlib.gunzipSync(bytes)))if(q.documento_id===doc){assert.ok(!ids.has(q.id));ids.add(q.id);questoes.push(q)}
}
const edicao=questoes.filter(q=>q.documento_id===doc)
assert.equal(edicao.length,120)
const porN=new Map(edicao.map(q=>[Number(q.numero_original??q.numero),q]));assert.equal(porN.size,120)
assert.deepEqual([...porN.keys()].sort((a,b)=>a-b),Array.from({length:120},(_,i)=>i+1))
const alvo=edicao;assert.equal(alvo.length,120)
let contexto=0,correcao=0,anuladas=0,pendentes=0
for(const q of alvo){
 const n=Number(q.numero_original??q.numero),url=n<=30?urls.basicos:n<=80?urls.especificos:urls.complementares
 assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.ok(q.materia&&q.conteudo);assert.equal(q.banca,'CEBRASPE');assert.equal(q.ano,2021);assert.equal(q.aplicacao,'27/06/2021')
 assert.equal(q.concurso,'DEPEN 2020 — Cargo 8: Agente Federal de Execução Penal (prova aplicada em 2021)')
 assert.deepEqual(q.opcoes,['Certo','Errado']);assert.equal(q.tipo_resposta,'certo_errado')
 assert.equal(q.gabarito_oficial?.url,url);assert.equal(q.gabarito_oficial?.verificada,true)
 assert.equal(q.resposta_correta,q.gabarito_oficial.resposta==='C'?0:q.gabarito_oficial.resposta==='E'?1:null)
 assert.equal(q.anulada,q.gabarito_oficial.resposta==='X')
 assert.ok(q.integridade_profissional?.apta_resolucao!==false)
 if(q.classificacao_pendente)pendentes++
 if(q.contexto_paginas?.length){contexto++;for(const p of q.contexto_paginas)await fs.access(path.join('public/acervo-extraido',p.imagem))}
 if(q.gabarito_oficial.resposta==='X'){anuladas++;assert.equal(q.integridade_profissional?.correcao_automatica,false)}
}
assert.equal(pendentes,0);assert.equal(anuladas,5)
assert.ok(porN.get(20).enunciado.includes('∧')&&porN.get(20).enunciado.includes('¬'))
assert.ok(porN.get(21).enunciado.includes('∧')&&porN.get(21).enunciado.includes('¬'))
assert.ok(/Ctrl \+ S/.test(porN.get(25).enunciado));assert.ok(porN.get(26).enunciado.includes('Pincel de Formatação'))
correcao=questoes.filter(q=>q.integridade_profissional?.correcao_automatica===true).length
const relatorio={validado_em:new Date().toISOString(),documento:doc,edicao:'DEPEN 2020 — Cargo 8: Agente Federal de Execução Penal',itens_da_edicao_presentes:edicao.length,itens_da_edicao_distintos:porN.size,faixa_de_itens_coberta:'1–120',registros_revisados_ou_adicionados:alvo.length,classificados:alvo.length,pendencias_classificacao:pendentes,gabaritos_oficiais_vinculados:alvo.length,correcao_automatica_eligivel:correcao,itens_anulados:anuladas,contextos_de_imagem_referenciados_e_presentes:contexto,notacao_e_icones_transcritos:[20,21,25,26],hashes_dos_lotes_validos:true}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-integridade.json`,JSON.stringify(relatorio,null,2));console.log(JSON.stringify(relatorio))
