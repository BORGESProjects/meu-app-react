import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-fub-2016-audiovisual-cargo14-v529',doc='d1a7a3630fb86fab'
const dir=`tmp/revisao-profissional/${nome}/acervo-extraido`
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_014_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_014_01.pdf'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8')),ids=new Set(raw.map(q=>q.id))
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'))),qs=[]
for(const l of m.lotes.filter(x=>x.arquivo.includes(nome+'-')&&!x.arquivo.includes('filtros-'))){
 const b=await fs.readFile(path.join(dir,l.arquivo));assert.ok(l.arquivo.includes(hashRevisao(b).slice(0,12)))
 qs.push(...JSON.parse(zlib.gunzipSync(b)).filter(q=>ids.has(q.id)))
}
assert.equal(qs.length,72)
const porNumero=new Map();for(const q of qs){const n=Number(q.numero_original??q.numero),a=porNumero.get(n)||[];a.push(q);porNumero.set(n,a)}
assert.equal(porNumero.size,70);assert.deepEqual([...porNumero].filter(([,a])=>a.length>1).map(([n])=>n),[75,76])
let visuais=0,duplicatas=0
for(const [n,rs] of porNumero){
 const aptas=rs.filter(q=>q.integridade_profissional?.apta_resolucao!==false);assert.equal(aptas.length,1,`canonical ${n}`)
 const q=aptas[0];assert.equal(q.banca,'CEBRASPE');assert.equal(q.ano,2016);assert.equal(q.concurso,'FUB 2016 — Cargo 14: Técnico em Audiovisual');assert.ok(q.cargo.includes('Técnico em Audiovisual'))
 assert.ok(q.materia&&q.conteudo&&q.dificuldade&&q.dificuldade_evidencia);assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.equal(q.gabarito_oficial?.url,gabarito);assert.equal(q.gabarito_oficial?.verificada,true);assert.equal(q.gabarito_oficial?.item,n);assert.ok(['C','E'].includes(q.gabarito_oficial?.resposta))
 assert.equal(q.resposta_correta,q.gabarito_oficial.resposta==='C'?0:1);assert.deepEqual(q.opcoes,['Certo','Errado']);assert.equal(q.tipo_resposta,'certo_errado');assert.equal(q.anulada,false)
 assert.equal(q.integridade_profissional?.correcao_automatica,true);assert.ok(q.enunciado?.length>25);assert.ok(q.texto_apoio?.length>25)
 assert.ok(q.classificacao_fonte===prova);assert.equal(q.revisao_semantica_visual?.metodo,'Conferência visual individual da página original')
 for(const v of q.contexto_paginas||[]){assert.equal(v.pagina,Number(v.imagem.match(/-(\d{4})\.webp$/)?.[1]));await fs.access(path.join('public/acervo-extraido',v.imagem));visuais++}
 assert.ok(!/\|\|281FUB_014_01N492975\|\|/.test(q.enunciado),`header contamination item ${n}`)
 if(n===92)assert.ok(q.enunciado.includes('regra dos terços da proporção áurea')&&q.enunciado.includes('sequências de Fibonacci'))
 if(n===98)assert.ok(q.enunciado.includes('CYMK'))
 if(n===103)assert.ok(q.enunciado.includes('equivale à máxima qualidade')&&q.enunciado.includes('720 linhas horizontais e 1.280 linhas verticais'))
 if(n===108)assert.ok(q.enunciado.includes('taxa de bites')&&q.enunciado.includes('megabites'))
 for(const d of rs.filter(x=>x.integridade_profissional?.apta_resolucao===false)){assert.equal(d.duplicada_de,q.id);assert.equal(d.integridade_profissional?.correcao_automatica,false);duplicatas++}
}
assert.equal(duplicatas,2);assert.equal(visuais,70)
const report={validado_em:new Date().toISOString(),edicao:'FUB 2016 — Cargo 14: Técnico em Audiovisual',documento:doc,registros:72,itens_distintos:70,faixa:'51–120',classificados:70,gabaritos_definitivos_vinculados:70,itens_com_correcao_automatica:70,duplicatas_inelegiveis:2,itens_duplicados:[75,76],referencias_visuais_existentes:visuais,prova,gabarito}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-integridade.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
