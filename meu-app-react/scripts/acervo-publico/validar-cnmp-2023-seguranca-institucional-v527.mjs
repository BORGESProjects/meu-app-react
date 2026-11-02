import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-cnmp-2023-seguranca-institucional-v527',doc='90d41c34c408851f'
const dir=`tmp/revisao-profissional/${nome}/acervo-extraido`
const prova='https://cdn.cebraspe.org.br/concursos/cnmp_23/arquivos/814_CNMP_011_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/cnmp_23/arquivos/GAB_DEFINITIVO_814_CNMP_011_01.PDF'
const resp={51:'C',52:'C',53:'E',54:'E',55:'C',56:'C',57:'E',58:'C',59:'C',60:'C',61:'E',62:'C',63:'E',64:'E',65:'C',66:'ANULADA',67:'C',68:'E',69:'C',70:'E',71:'C',72:'E',73:'ANULADA',74:'C',75:'E',76:'E',77:'C',78:'C',79:'E',80:'C',81:'E',82:'E',83:'C',84:'C',85:'C',86:'E',87:'E',88:'C',89:'C',90:'ANULADA',91:'ANULADA',92:'E',93:'ANULADA',94:'ANULADA',95:'E',96:'E',97:'C',98:'E',99:'ANULADA',100:'ANULADA',101:'E',102:'E',103:'ANULADA',104:'C',105:'E',106:'E',107:'E',108:'E',109:'E',110:'C',111:'C',112:'E',113:'C',114:'C',115:'C',116:'E',117:'E',118:'E',119:'C',120:'E'}
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'))),qs=[]
const expected=new Set(JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8')).map(q=>q.id))
for(const l of m.lotes.filter(x=>x.arquivo.includes(nome+'-')&&!x.arquivo.includes('filtros-'))){const b=await fs.readFile(path.join(dir,l.arquivo));assert.ok(l.arquivo.includes(hashRevisao(b).slice(0,12)));qs.push(...JSON.parse(zlib.gunzipSync(b)).filter(q=>expected.has(q.id)))}
assert.equal(qs.length,72)
const by=new Map();for(const q of qs){const n=Number(q.numero_original??q.numero),a=by.get(n)||[];a.push(q);by.set(n,a)}
assert.equal(by.size,70);assert.deepEqual([...by].filter(([,a])=>a.length>1).map(([n])=>n),[54,55])
let anuladas=0,dup=0,visuais=0
for(const [n,rs] of by){const good=rs.filter(q=>q.integridade_profissional?.apta_resolucao!==false);assert.equal(good.length,1,`canonical ${n}`);const q=good[0]
 assert.equal(q.banca,'CEBRASPE');assert.equal(q.ano,2023);assert.ok(q.materia&&q.conteudo);assert.equal(q.concurso,'CNMP 2023 — Cargo 11: Técnico, Segurança Institucional');assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true);assert.equal(q.gabarito_oficial?.url,gabarito);assert.equal(q.gabarito_oficial?.verificada,true);assert.equal(q.gabarito_oficial?.item,n);assert.equal(q.gabarito_oficial?.resposta,resp[n]);assert.ok(q.texto_apoio?.length>25)
 const anulada=resp[n]==='ANULADA';assert.equal(q.anulada,anulada);assert.equal(q.resposta_correta,anulada?null:resp[n]==='C'?0:1);assert.equal(q.integridade_profissional?.correcao_automatica,!anulada);if(anulada)anuladas++
 assert.ok(q.contexto_paginas?.length);for(const v of q.contexto_paginas){assert.equal(v.pagina,Number(v.imagem.match(/-(\d{4})\.webp$/)?.[1]));await fs.access(path.join('public/acervo-extraido',v.imagem));visuais++}
 if(n===54)assert.ok(!q.enunciado.includes('Julgue os itens'))
 if(n===68)assert.ok(!q.enunciado.includes('Com base na Lei'))
 if(n===74)assert.ok(!q.enunciado.includes('Decreto'))
 if(n===103)assert.ok(!q.enunciado.includes('À luz da Lei'))
 if(n===106)assert.ok(!q.enunciado.includes('Acerca dos crimes'))
 if(n===110)assert.ok(!q.enunciado.includes('Lei de Abuso de Autoridade'))
 if(n===112)assert.ok(!q.enunciado.includes('crimes resultantes'))
 if(n===116)assert.ok(!q.enunciado.includes('Estatuto da Pessoa Idosa'))
 for(const d of rs.filter(x=>x.integridade_profissional?.apta_resolucao===false)){assert.equal(d.duplicada_de,q.id);assert.equal(d.integridade_profissional?.correcao_automatica,false);dup++}
}
assert.equal(anuladas,9);assert.equal(dup,2)
const report={validado_em:new Date().toISOString(),edicao:'CNMP 2023 — Cargo 11: Técnico — Segurança Institucional',documento:doc,registros:72,itens_distintos:70,faixa:'51–120',classificados:70,gabaritos_definitivos_vinculados:70,itens_com_correcao_automatica:61,itens_anulados:[66,73,90,91,93,94,99,100,103],duplicatas_inelegiveis:2,itens_duplicados:[54,55],referencias_visuais_existentes:visuais,prova,gabarito}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-integridade.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
