import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-fub-2016-terapia-ocupacional-cargo7-v525'
const doc='892d5e4ab4ef27e1',dir=`tmp/revisao-profissional/${nome}/acervo-extraido`
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_007_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_007_01.pdf'
const respostas={51:'E',52:'C',53:'E',54:'C',55:'C',56:'E',57:'E',58:'C',59:'C',60:'C',61:'C',62:'E',63:'C',64:'E',65:'C',66:'C',67:'E',68:'C',69:'C',70:'E',71:'C',72:'E',73:'E',74:'E',75:'E',76:'C',77:'E',78:'E',79:'C',80:'C',81:'C',82:'E',83:'E',84:'E',85:'C',86:'C',87:'E',88:'E',89:'C',90:'C',91:'C',92:'C',93:'E',94:'C',95:'E',96:'E',97:'E',98:'E',99:'C',100:'C',101:'C',102:'E',103:'E',104:'C',105:'E',106:'E',107:'E',108:'E',109:'C',110:'C',111:'C',112:'E',113:'C',114:'C',115:'E',116:'C',117:'C',118:'E',119:'E',120:'E'}
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'))),questoes=[]
for(const l of m.lotes.filter(x=>x.arquivo.includes(nome+'-'))){
 const bytes=await fs.readFile(path.join(dir,l.arquivo));assert.ok(l.arquivo.includes(hashRevisao(bytes).slice(0,12)))
 questoes.push(...JSON.parse(zlib.gunzipSync(bytes)).filter(q=>q.documento_id===doc))
}
assert.equal(questoes.length,72)
const porNumero=new Map()
for(const q of questoes){const n=Number(q.numero_original??q.numero),a=porNumero.get(n)||[];a.push(q);porNumero.set(n,a)}
assert.equal(porNumero.size,70);assert.deepEqual([...porNumero.keys()].sort((a,b)=>a-b),Array.from({length:70},(_,i)=>i+51))
assert.deepEqual([...porNumero].filter(([,a])=>a.length>1).map(([n])=>n),[54,58])
let contextos=0,anuladas=0
for(const [n,registros] of porNumero){
 const boas=registros.filter(q=>q.integridade_profissional?.apta_resolucao!==false);assert.equal(boas.length,1)
 const q=boas[0],r=respostas[n]
 assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.equal(q.materia,'Terapia Ocupacional');assert.ok(q.conteudo);assert.equal(q.banca,'CEBRASPE');assert.equal(q.ano,2016);assert.equal(q.aplicacao,'18/12/2016')
 assert.equal(q.concurso,'FUB 2016 — Cargo 7: Terapeuta Ocupacional');assert.equal(q.cargo,'Cargo 7: Terapeuta Ocupacional')
 assert.deepEqual(q.opcoes,['Certo','Errado']);assert.equal(q.tipo_resposta,'certo_errado')
 assert.equal(q.gabarito_oficial?.url,gabarito);assert.equal(q.gabarito_oficial?.verificada,true);assert.equal(q.gabarito_oficial?.resposta,r)
 assert.equal(q.resposta_correta,r==='C'?0:1);assert.equal(q.anulada,false)
 assert.equal(q.integridade_profissional?.correcao_automatica,true)
 assert.ok(q.texto_apoio?.length>20)
 if(q.contexto_paginas?.length){contextos++;for(const p of q.contexto_paginas)await fs.access(path.join('public/acervo-extraido',p.imagem))}
 if(n===54)assert.equal(q.enunciado,'A inserção da terapia ocupacional no ambiente interdisciplinar e a definição dos espaços micro e macrossociais desenvolveram os fundamentos presentes na prática da terapia ocupacional.')
 if(n===58)assert.equal(q.enunciado,'A tradução transcultural de ferramentas internacionais é uma das formas utilizadas para a criação das escalas.')
 if(n===107)assert.ok(!q.enunciado.includes('Código de Ética'))
 if(n===111)assert.ok(!q.enunciado.includes('Acerca das intervenções'))
 for(const d of registros.filter(x=>x.integridade_profissional?.apta_resolucao===false)){assert.ok(d.duplicada_de===q.id);assert.equal(d.integridade_profissional?.correcao_automatica,false)}
}
assert.equal(contextos,70)
const relatorio={validado_em:new Date().toISOString(),documento:doc,edicao:'FUB 2016 — Cargo 7: Terapeuta Ocupacional',registros:questoes.length,itens_distintos:porNumero.size,faixa:'51–120',classificados:70,gabaritos_definitivos_vinculados:70,questoes_com_correcao_automatica:70,duplicatas_inelegiveis:2,itens_duplicados:[54,58],contextos_visuais_referenciados_e_presentes:contextos,ocr_e_limites_de_enunciado_corrigidos:[54,58,107,111],respostas_anuladas:anuladas,integridade_de_lotes_por_hash:true,prova,gabarito}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-integridade.json`,JSON.stringify(relatorio,null,2));console.log(JSON.stringify(relatorio))
