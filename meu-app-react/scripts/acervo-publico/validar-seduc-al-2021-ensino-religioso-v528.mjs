import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-seduc-al-2021-ensino-religioso-v528',doc='b203af9ec6fef254'
const dir=`tmp/revisao-profissional/${nome}/acervo-extraido`
const prova='https://cdn.cebraspe.org.br/concursos/seduc_al_21/arquivos/606_SEDUC_AL_003_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/seduc_al_21/arquivos/GAB_DEFINITIVO_606_SEDUC_AL_003_01.PDF'
const resp={51:'C',52:'E',53:'E',54:'E',55:'C',56:'C',57:'E',58:'C',59:'E',60:'C',61:'C',62:'E',63:'C',64:'E',65:'C',66:'E',67:'C',68:'E',69:'C',70:'C',71:'E',72:'E',73:'E',74:'C',75:'C',76:'E',77:'E',78:'E',79:'C',80:'C',81:'C',82:'C',83:'E',84:'C',85:'E',86:'E',87:'E',88:'C',89:'E',90:'C',91:'C',92:'C',93:'E',94:'C',95:'C',96:'C',97:'E',98:'C',99:'E',100:'C',101:'C',102:'C',103:'E',104:'C',105:'E',106:'C',107:'C',108:'C',109:'E',110:'C',111:'E',112:'E',113:'C',114:'C',115:'C',117:'E'}
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'))),qs=[]
const expected=new Set(JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8')).map(q=>q.id))
for(const l of m.lotes.filter(x=>x.arquivo.includes(nome+'-')&&!x.arquivo.includes('filtros-'))){const b=await fs.readFile(path.join(dir,l.arquivo));assert.ok(l.arquivo.includes(hashRevisao(b).slice(0,12)));qs.push(...JSON.parse(zlib.gunzipSync(b)).filter(q=>expected.has(q.id)))}
assert.equal(qs.length,72)
const by=new Map();for(const q of qs){const n=Number(q.numero_original??q.numero),a=by.get(n)||[];a.push(q);by.set(n,a)}
assert.equal(by.size,66);assert.deepEqual([...by].filter(([,a])=>a.length>1).map(([n])=>n),[52,54,55,65,68,69])
let duplicadas=0,visuais=0
for(const [n,rs] of by){const good=rs.filter(q=>q.integridade_profissional?.apta_resolucao!==false);assert.equal(good.length,1,`canonical ${n}`);const q=good[0]
 assert.equal(q.banca,'CEBRASPE');assert.equal(q.ano,2021);assert.equal(q.materia,'Ensino Religioso');assert.ok(q.conteudo);assert.equal(q.concurso,'SEDUC/AL 2021 — Professor: Ensino Religioso');assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true);assert.equal(q.gabarito_oficial?.url,gabarito);assert.equal(q.gabarito_oficial?.verificada,true);assert.equal(q.gabarito_oficial?.item,n);assert.equal(q.gabarito_oficial?.resposta,resp[n]);assert.equal(q.resposta_correta,resp[n]==='C'?0:1);assert.equal(q.anulada,false);assert.equal(q.integridade_profissional?.correcao_automatica,true);assert.ok(q.texto_apoio?.length>25)
 assert.ok(q.contexto_paginas?.length);for(const v of q.contexto_paginas){assert.equal(v.pagina,Number(v.imagem.match(/-(\d{4})\.webp$/)?.[1]));await fs.access(path.join('public/acervo-extraido',v.imagem));visuais++}
 if(n===55)assert.ok(!q.enunciado.includes('Ainda com relação'))
 if(n===58)assert.ok(!q.enunciado.includes('Convém destacar'))
 if(n===62)assert.ok(!q.enunciado.includes('Declaração Universal'))
 if(n===65)assert.ok(!q.enunciado.includes('Eliane Moura'))
 if(n===69)assert.ok(!q.enunciado.includes('606003_01N'))
 if(n===75)assert.ok(!q.enunciado.includes('606003_01N'))
 if(n===77)assert.ok(!q.enunciado.includes('James H. Cone discorre'))
 if(n===91)assert.ok(q.contexto_paginas.some(v=>v.imagem===`paginas/${doc}-0002.webp`))
 if(n===94)assert.ok(!q.enunciado.includes('Acerca de diferentes teologias'))
 if(n===97)assert.ok(!q.enunciado.includes('Considerando a legislação'))
 if(n===102)assert.ok(!q.enunciado.includes('A religiosidade de um povo'))
 if(n===107)assert.ok(!q.enunciado.includes('Considerando a autonomia'))
 if(n===112)assert.ok(!q.enunciado.includes('O ensino religioso, embora'))
 if(n===117)assert.ok(!q.enunciado.includes('intolerância religiosa'))
 for(const d of rs.filter(x=>x.integridade_profissional?.apta_resolucao===false)){assert.equal(d.duplicada_de,q.id);assert.equal(d.integridade_profissional?.correcao_automatica,false);duplicadas++}
}
assert.equal(duplicadas,6)
const report={validado_em:new Date().toISOString(),edicao:'SEDUC/AL 2021 — Professor: Ensino Religioso',documento:doc,registros:72,itens_distintos:66,faixa:'51–115 e 117; itens 116, 118–120 já constavam classificados',classificados:66,gabaritos_definitivos_vinculados:66,itens_com_correcao_automatica:66,duplicatas_inelegiveis:6,itens_duplicados:[52,54,55,65,68,69],referencias_visuais_existentes:visuais,imagem_reparada_item_91:true,prova,gabarito}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-integridade.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
