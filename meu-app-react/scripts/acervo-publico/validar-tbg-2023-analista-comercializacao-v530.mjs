import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-tbg-2023-analista-comercializacao-v530',doc='dc89e45c51027076'
const dir=`tmp/revisao-profissional/${nome}/acervo-extraido`
const prova='https://cdn.cebraspe.org.br/concursos/tbg_23/arquivos/888_TBG_003_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/tbg_23/arquivos/GAB_DEFINITIVO_888_TBG_003_01.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8')),ids=new Set(raw.map(q=>q.id))
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'))),qs=[]
for(const l of m.lotes.filter(x=>x.arquivo.includes(nome+'-')&&!x.arquivo.includes('filtros-'))){const b=await fs.readFile(path.join(dir,l.arquivo));assert.ok(l.arquivo.includes(hashRevisao(b).slice(0,12)));qs.push(...JSON.parse(zlib.gunzipSync(b)).filter(q=>ids.has(q.id)))}
assert.equal(qs.length,72)
const by=new Map();for(const q of qs){const n=Number(q.numero_original??q.numero),a=by.get(n)||[];a.push(q);by.set(n,a)}
assert.equal(by.size,66);assert.deepEqual([...by].filter(([,a])=>a.length>1).map(([n])=>n),[34,38,39,40,45,54])
let visuais=0,duplicatas=0,anulados=0,auto=0
for(const [n,rs] of by){
 const canon=rs.filter(q=>q.integridade_profissional?.apta_resolucao!==false);assert.equal(canon.length,1,`canonical ${n}`)
 const q=canon[0];assert.equal(q.banca,'CEBRASPE');assert.equal(q.ano,2023);assert.equal(q.concurso,'TBG 2023 — Cargo 3: Analista Júnior — Ênfase: Comercialização');assert.equal(q.cargo,'Analista Júnior — Ênfase: Comercialização')
 assert.ok(q.materia&&q.conteudo&&q.dificuldade&&q.dificuldade_evidencia);assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.equal(q.gabarito_oficial?.url,gabarito);assert.equal(q.gabarito_oficial?.verificada,true);assert.equal(q.gabarito_oficial?.item,n);assert.ok(['C','E','X'].includes(q.gabarito_oficial?.resposta))
 assert.deepEqual(q.opcoes,['Certo','Errado']);assert.equal(q.tipo_resposta,'certo_errado');assert.ok(q.enunciado?.length>25);assert.ok(q.texto_apoio?.length>25);assert.equal(q.classificacao_fonte,prova)
 if(n===85){assert.equal(q.anulada,true);assert.equal(q.gabarito_oficial.resposta,'X');assert.equal(q.resposta_correta,null);assert.equal(q.integridade_profissional.correcao_automatica,false);anulados++}
 else {assert.equal(q.anulada,false);assert.equal(q.integridade_profissional.correcao_automatica,true);assert.equal(q.resposta_correta,q.gabarito_oficial.resposta==='C'?0:1);auto++}
 for(const v of q.contexto_paginas||[]){assert.equal(v.pagina,Number(v.imagem.match(/-(\d{4})\.webp$/)?.[1]));await fs.access(path.join('public/acervo-extraido',v.imagem));visuais++}
 assert.ok(!/\|\|8880030182845\|\|/.test(q.enunciado),`header contamination item ${n}`)
 if(n===34)assert.ok(q.enunciado.includes('estado gasoso para o estado líquido'))
 if(n===73)assert.ok(q.enunciado.includes('∛(6% × 8% × 13%)'))
 if(n===74)assert.ok(q.enunciado.includes('(6% + 8% + 13%) / 3'))
 if(n===75)assert.ok(q.enunciado.includes('10.000 × (0,90)³')&&q.enunciado.includes('10.000 / (1,10)³'))
 if(n===77)assert.ok(q.texto_apoio.includes('R$ 250.000')&&q.texto_apoio.includes('R$ 150.000'))
 if(n===80)assert.ok(q.texto_apoio.includes('opção 1 = 20, 10, 20 e 10')&&q.texto_apoio.includes('opção 2 = 15, 18, 15 e 18'))
 for(const d of rs.filter(x=>x.integridade_profissional?.apta_resolucao===false)){assert.equal(d.duplicada_de,q.id);assert.equal(d.integridade_profissional?.correcao_automatica,false);duplicatas++}
}
assert.equal(duplicatas,6);assert.equal(anulados,1);assert.equal(auto,65);assert.equal(visuais,66)
const report={validado_em:new Date().toISOString(),edicao:'TBG 2023 — Cargo 3: Analista Júnior — Ênfase: Comercialização',documento:doc,registros:72,itens_distintos_pendentes:66,faixa_da_prova:'31–100; quatro itens já estavam fora da fila de classificação',classificados:66,gabaritos_definitivos_vinculados:66,itens_com_correcao_automatica:65,anulados:[85],duplicatas_inelegiveis:6,itens_duplicados:[34,38,39,40,45,54],referencias_visuais_existentes:visuais,prova,gabarito}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-integridade.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
