import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-mpto-2024-jornalismo-cargo10-v531',doc='0580709974a678b5'
const dir=`tmp/revisao-profissional/${nome}/acervo-extraido`
const prova='https://cdn.cebraspe.org.br/concursos/mp_to_24_servidor/arquivos/952_MP_TO_010_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/mp_to_24_servidor/arquivos/GAB_DEFINITIVO_952_MP_TO_010_01.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8')),ids=new Set(raw.map(q=>q.id))
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'))),qs=[]
for(const l of m.lotes.filter(x=>x.arquivo.includes(nome+'-')&&!x.arquivo.includes('filtros-'))){const b=await fs.readFile(path.join(dir,l.arquivo));assert.ok(l.arquivo.includes(hashRevisao(b).slice(0,12)));qs.push(...JSON.parse(zlib.gunzipSync(b)).filter(q=>ids.has(q.id)))}
assert.equal(qs.length,71)
const by=new Map();for(const q of qs){const n=Number(q.numero_original??q.numero),a=by.get(n)||[];a.push(q);by.set(n,a)}
assert.equal(by.size,70);assert.deepEqual([...by].filter(([,a])=>a.length>1).map(([n])=>n),[79])
let visual=0,dup=0,automaticas=0
for(const [n,rs]of by){
 const canonical=rs.filter(q=>q.integridade_profissional?.apta_resolucao!==false);assert.equal(canonical.length,1,`canonical ${n}`)
 const q=canonical[0];assert.equal(q.banca,'CEBRASPE');assert.equal(q.ano,2024);assert.equal(q.concurso,'MPTO 2024 — Cargo 10: Analista Ministerial Especializado — Jornalismo');assert.ok(q.cargo.includes('Jornalismo'))
 assert.ok(q.materia&&q.conteudo&&q.dificuldade&&q.dificuldade_evidencia);assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.equal(q.gabarito_oficial?.url,gabarito);assert.equal(q.gabarito_oficial?.verificada,true);assert.equal(q.gabarito_oficial?.item,n);assert.ok(['C','E'].includes(q.gabarito_oficial?.resposta));assert.equal(q.resposta_correta,q.gabarito_oficial.resposta==='C'?0:1)
 assert.equal(q.tipo_resposta,'certo_errado');assert.deepEqual(q.opcoes,['Certo','Errado']);assert.equal(q.anulada,false);assert.equal(q.integridade_profissional?.correcao_automatica,true);assert.ok(q.enunciado?.length>25);assert.ok(q.texto_apoio?.length>20);assert.equal(q.classificacao_fonte,prova)
 for(const v of q.contexto_paginas||[]){assert.equal(v.pagina,Number(v.imagem.match(/-(\d{4})\.webp$/)?.[1]));await fs.access(path.join('public/acervo-extraido',v.imagem));visual++}
 assert.ok(!/CEBRASPE\s*[–-]\s*MPTO\s*[–-]\s*Edital:\s*2024/.test(q.enunciado),`header contamination item ${n}`)
 if(n===54)assert.ok(!q.enunciado.includes('Considerando o panorama'))
 if(n===56)assert.ok(q.enunciado.includes('por meio de um pacto'))
 if(n===79)assert.ok(!q.enunciado.includes('Quanto à organização de entrevistas'))
 if(n===98)assert.ok(!q.enunciado.includes('planejamento editorial'))
 if(n===102)assert.ok(!q.enunciado.includes('mancha gráfica'))
 if(n===109)assert.ok(!q.enunciado.includes('fluxo de informação no webjornalismo'))
 automaticas++
 for(const d of rs.filter(x=>x.integridade_profissional?.apta_resolucao===false)){assert.equal(d.duplicada_de,q.id);assert.equal(d.integridade_profissional?.correcao_automatica,false);dup++}
}
assert.equal(dup,1);assert.equal(visual,70);assert.equal(automaticas,70)
const report={validado_em:new Date().toISOString(),edicao:'MPTO 2024 — Cargo 10: Analista Ministerial Especializado — Jornalismo',documento:doc,registros:71,itens_distintos:70,faixa:'51–120',classificados:70,gabaritos_definitivos_vinculados:70,itens_com_correcao_automatica:70,duplicatas_inelegiveis:1,itens_duplicados:[79],referencias_visuais_existentes:visual,prova,gabarito}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-integridade.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
