import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-cti-renato-archer-cargo4-nanotecnologia-fotonica-energia-2024-lote-v459'
const root=`tmp/revisao-profissional/${nome}/acervo-extraido`
const base=raizesAtuais[1]
const doc='a7ae1fbbcbaf158f'
const prova='https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/922_MCTI_RENATO_ARCHER_004_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_004_01.PDF'
const m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8'))
const b=JSON.parse(await fs.readFile(path.join(base,'manifesto.json'),'utf8'))
const audit=JSON.parse(zlib.gunzipSync(await fs.readFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`)))
const ds=audit.map(x=>x.decisao)
assert.equal(ds.length,77)
assert.equal(new Set(ds.map(x=>x.numero)).size,70)
assert.equal(m.questoes_extraidas_unicas,b.questoes_extraidas_unicas)
assert.equal(m.questoes_disponiveis_resolucao,b.questoes_disponiveis_resolucao-6)
const changed=[]
for(let i=0;i<m.lotes.length;i++)if(m.lotes[i].arquivo!==b.lotes[i].arquivo)changed.push(i)
assert.equal(changed.length,2)
const ids=new Set(ds.map(x=>x.id)), qs=new Map()
for(const i of changed){
 const lote=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))))
 for(const q of lote)if(ids.has(q.id))qs.set(q.id,q)
}
assert.equal(qs.size,77)
let elegiveis=0,duplicadas=0,anuladas=0,corrigiveis=0
for(const q of qs.values()){
 const d=ds.find(x=>x.id===q.id),n=q.numero_original
 assert.ok(d);assert.equal(q.ano,2024);assert.equal(q.banca,'CEBRASPE')
 assert.ok(q.concurso.includes('CTI Renato Archer/MCTI'))
 assert.ok(q.materia&&q.conteudo&&q.dificuldade)
 assert.deepEqual(q.opcoes,['Certo','Errado'])
 assert.equal(q.gabarito_oficial?.fonte,gabarito)
 assert.equal(q.gabarito_oficial?.prova,prova)
 const pagina=n<=70?1:n<=97?2:3
 assert.equal(q.pagina_imagem,`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`)
 await fs.access(path.join('public/acervo-extraido',q.pagina_imagem))
 for(const x of q.contexto_paginas||[])await fs.access(path.join('public/acervo-extraido',x.imagem))
 if([98,99,100].includes(n))assert.ok(q.contexto_paginas.some(x=>x.pagina===2))
 if(n===98){assert.ok(q.enunciado.includes('e^(qVₗ/(n k T))'));assert.ok(q.enunciado.includes('i_sh'))}
 assert.equal(q.resposta_correta,d.resposta_correta)
 assert.equal(q.anulada,d.anulada)
 if(d.apta_resolucao===false){duplicadas++;assert.equal(q.integridade_profissional?.apta_resolucao,false);assert.ok(q.duplicada_de)}
 else{elegiveis++;assert.equal(q.integridade_profissional?.apta_resolucao,true);if(d.anulada){anuladas++;assert.equal(q.resposta_correta,null);assert.equal(q.integridade_profissional?.correcao_automatica,false)}else{corrigiveis++;assert.equal(q.integridade_profissional?.correcao_automatica,true)}}
}
assert.equal(elegiveis,70);assert.equal(duplicadas,7);assert.equal(anuladas,1);assert.equal(corrigiveis,69)
for(const field of ['indice_facetas','classificacao_principal']){
 const f=m[field],buf=await lerArquivoAtual(f.arquivo,[root,...raizesAtuais])
 assert.equal(createHash('sha256').update(buf).digest('hex'),f.sha256)
 JSON.parse(zlib.gunzipSync(buf))
}
const out={validado_em:new Date().toISOString(),registros_revistos:77,questoes_unicas_elegiveis:70,duplicatas_inelegiveis:7,anuladas:1,corrigiveis:69,classificacao_especifica_em_todas:true,questao_98_formula_validada:true,imagem_do_circuito_preservada_nas_questoes_96_a_100:true,imagens_de_origem_por_pagina_corretas:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas,disponiveis:m.questoes_disponiveis_resolucao,pacote_publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(out,null,2))
console.log(JSON.stringify(out,null,2))
