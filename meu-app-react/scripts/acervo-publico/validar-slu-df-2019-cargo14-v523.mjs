import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'

const nome='revisao-slu-df-2019-engenharia-mecanica-cargo14-v523'
const doc='6659e1925079b821'
const dir=`tmp/revisao-profissional/${nome}/acervo-extraido`
const gabaritoUrl='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/14_GAB_DEFINITIVO_449_SLUDF_014_00_PAG_5.PDF'
const respostas={51:'C',52:'E',53:'E',54:'C',55:'E',56:'C',57:'E',58:'E',59:'E',60:'C',61:'C',62:'C',63:'E',64:'C',65:'E',66:'E',67:'E',68:'E',69:'E',70:'C',71:'C',72:'E',73:'E',74:'C',75:'C',76:'C',77:'E',78:'C',79:'C',80:'E',81:'E',82:'E',83:'E',84:'E',85:'C',86:'E',87:'C',88:'C',89:'E',90:'E',91:'C',92:'C',93:'C',94:'E',95:'C',96:'E',97:'C',98:'C',99:'E',100:'C',101:'E',102:'C',103:'E',104:'E',105:'X',106:'E',107:'C',108:'C',109:'E',110:'C',111:'E',112:'E',113:'C',114:'E',115:'C',116:'E',117:'E',118:'C',119:'E',120:'E'}
const imagemEsperada={51:'diagrama-fe-c',52:'diagrama-fe-c',53:'diagrama-fe-c',54:'diagrama-fe-c',55:'diagrama-fe-c',66:'sistema-frenagem-tambor',67:'sistema-frenagem-tambor',68:'sistema-frenagem-tambor',69:'sistema-frenagem-tambor',70:'esteira-transportadora',71:'tubo-pitot-manometro',72:'tubo-pitot-manometro',73:'tubo-pitot-manometro',74:'tubo-pitot-manometro',93:'ciclo-rankine',95:'simbolo-valvula-direcional'}
const sha=x=>createHash('sha256').update(x).digest('hex')
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'),'utf8'))
assert.equal(m.questoes_extraidas_unicas,168256)
assert.equal(m.questoes_disponiveis_resolucao,163149)
const ids=new Set(),registros=[]
for(const l of m.lotes.filter(x=>x.arquivo.includes(nome+'-'))){
 const qs=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(dir,l.arquivo))))
 for(const q of qs)if(q.documento_id===doc){assert.ok(!ids.has(q.id));ids.add(q.id);registros.push(q)}
}
assert.equal(registros.length,75)
const porN=new Map()
for(const q of registros){const n=Number(q.numero_original??q.numero),v=porN.get(n)||[];v.push(q);porN.set(n,v)}
assert.equal(porN.size,70)
assert.deepEqual([...porN.keys()].sort((a,b)=>a-b),Array.from({length:70},(_,i)=>i+51))
assert.deepEqual([...porN].filter(([,v])=>v.length>1).map(([n])=>n),[51,52,53,54,55])
for(const [n,v] of porN){
 const canonicas=v.filter(q=>q.integridade_profissional?.apta_resolucao!==false)
 assert.equal(canonicas.length,1,`versão elegível do item ${n}`)
 for(const q of v){
  assert.equal(q.ano,2019);assert.equal(q.banca,'CEBRASPE');assert.ok(q.concurso.includes('Cargo 14'));assert.ok(q.materia&&q.conteudo)
  assert.ok(!/JUSTIFICATIVA/i.test(q.enunciado));assert.deepEqual(q.opcoes,['Certo','Errado'])
 }
 const q=canonicas[0],r=respostas[n]
 assert.equal(q.classificacao_revisada,true);assert.equal(q.classificacao_pendente,false)
 assert.equal(q.gabarito_oficial?.verificada,true);assert.equal(q.gabarito_oficial?.url,gabaritoUrl);assert.equal(q.gabarito_oficial?.resposta,r)
 assert.equal(q.anulada,r==='X');assert.equal(q.resposta_correta,r==='C'?0:r==='E'?1:null)
 const esperado=imagemEsperada[n]
 if(esperado){
  const imagem=`ilustracoes/${doc}-${esperado}.png`,recursos=q.apoio?.filter(x=>x.imagem===imagem)||[]
  assert.equal(recursos.length,1,`recorte do item ${n}`);assert.deepEqual(q.imagens_paginas,[imagem])
  const bytes=await fs.readFile(path.join('public','acervo-extraido',imagem))
  assert.equal(q.revisao_semantica_visual?.sha256,sha(bytes),`hash da figura ${n}`)
 }else{
  assert.equal(q.pagina_imagem,undefined,`página integral não deve exibir justificativa no item ${n}`)
  assert.deepEqual(q.imagens_paginas||[],[])
 }
}
const anulada=porN.get(105).find(q=>q.integridade_profissional?.apta_resolucao!==false)
assert.equal(anulada.anulada,true);assert.equal(anulada.integridade_profissional.correcao_automatica,false)
const r={validado_em:new Date().toISOString(),documento:'SLU/DF 2019 — Cargo 14 — Engenharia Mecânica',itens_distintos:porN.size,registros_brutos:registros.length,duplicatas_inelegiveis:5,recortes_visuais_verificados:Object.keys(imagemEsperada).length,gabarito_definitivo_conferido:true,item_67:'Errado (gabarito definitivo alterado)',item_105:'Anulado',enunciados_sem_justificativa:true,referencias_de_imagem_com_hash:true,pendencias:0}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-integridade.json`,JSON.stringify(r,null,2))
console.log(JSON.stringify(r))
