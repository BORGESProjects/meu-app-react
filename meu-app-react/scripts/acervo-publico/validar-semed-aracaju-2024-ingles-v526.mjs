import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-semed-aracaju-2024-professor-ingles-v526',doc='9021c40b9a77b9c1'
const dir=`tmp/revisao-profissional/${nome}/acervo-extraido`
const prova='https://cdn.cebraspe.org.br/concursos/semed_aracaju_24/arquivos/025_SEMED_007_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/semed_aracaju_24/arquivos/GAB_DEFINITIVO_025_SEMED_007_01.PDF'
const respostas={51:'C',52:'E',53:'E',54:'E',55:'C',56:'C',57:'E',58:'C',59:'C',60:'C',61:'C',62:'E',63:'C',64:'C',65:'E',66:'E',67:'E',68:'E',69:'E',70:'E',71:'C',72:'C',73:'C',74:'E',75:'C',76:'E',77:'E',78:'C',79:'C',80:'ANULADA',81:'E',82:'E',83:'E',84:'C',85:'C',86:'E',87:'E',88:'C',89:'E',90:'E',91:'C',92:'C',93:'C',94:'C',95:'C',96:'E',97:'E',98:'C',99:'C',100:'E',101:'E',102:'E',103:'E',104:'C',105:'C',106:'E',107:'C',108:'E',109:'C',110:'C',111:'C',112:'C',113:'C',114:'E',115:'E',117:'C',118:'E',119:'C',120:'E'}
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'))),qs=[]
const expected=new Set(JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8')).map(q=>q.id))
for(const l of m.lotes.filter(x=>x.arquivo.includes(nome+'-')&&!x.arquivo.includes('filtros-'))){const b=await fs.readFile(path.join(dir,l.arquivo));assert.ok(l.arquivo.includes(hashRevisao(b).slice(0,12)));qs.push(...JSON.parse(zlib.gunzipSync(b)).filter(q=>expected.has(q.id)))}
assert.equal(qs.length,72)
const by=new Map();for(const q of qs){const n=Number(q.numero_original??q.numero),a=by.get(n)||[];a.push(q);by.set(n,a)}
assert.equal(by.size,69)
for(const n of [52,54,55])assert.equal(by.get(n).length,2)
const duplicates=[];let anulado=0
for(const [n,rs] of by){const canonical=rs.filter(q=>q.integridade_profissional?.apta_resolucao!==false);assert.equal(canonical.length,1,`canonical ${n}`);const q=canonical[0]
 assert.equal(q.banca,'CEBRASPE');assert.equal(q.ano,2024);assert.equal(q.materia,'Língua Inglesa');assert.ok(q.conteudo);assert.equal(q.concurso,'SEMED Aracaju 2024 — Cargo 7: Professor de Língua Inglesa');assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.equal(q.gabarito_oficial?.url,gabarito);assert.equal(q.gabarito_oficial?.verificada,true);assert.equal(q.gabarito_oficial?.item,n);assert.equal(q.gabarito_oficial?.resposta,respostas[n]);assert.equal(q.resposta_correta,respostas[n]==='ANULADA'?null:respostas[n]==='C'?0:1);assert.ok(q.texto_apoio?.length>25);assert.ok(q.contexto_paginas?.length)
 for(const v of q.contexto_paginas){assert.equal(v.pagina,Number(v.imagem.match(/-(\d{4})\.webp$/)?.[1]));await fs.access(path.join('public/acervo-extraido',v.imagem))}
 assert.equal(q.integridade_profissional?.correcao_automatica,n!==80);if(n===80){assert.equal(q.anulada,true);assert.equal(q.resposta_correta,null);anulado++}
 if(n===97)assert.ok(q.contexto_paginas.some(v=>v.imagem===`paginas/${doc}-0003.webp`))
 for(const d of rs.filter(x=>x.integridade_profissional?.apta_resolucao===false)){assert.equal(d.duplicada_de,q.id);assert.equal(d.integridade_profissional?.correcao_automatica,false);duplicates.push(d)}
}
assert.equal(anulado,1);assert.equal(duplicates.length,3)
const report={validado_em:new Date().toISOString(),edicao:'SEMED Aracaju 2024 — Cargo 7: Professor de Língua Inglesa',documento:doc,registros:72,itens_distintos:69,faixa:'51–120; item 116 já constava classificado',classificados:69,gabaritos_definitivos_vinculados:69,itens_com_correcao_automatica:68,item_anulado:80,duplicatas_inelegiveis:3,itens_duplicados:[52,54,55],contextos_visuais_existentes:69,referencias_visuais_conferidas:true,prova,gabarito}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-integridade.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
