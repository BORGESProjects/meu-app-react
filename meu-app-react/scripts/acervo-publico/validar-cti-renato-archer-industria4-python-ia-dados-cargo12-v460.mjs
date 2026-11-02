import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-cti-renato-archer-industria4-python-ia-dados-cargo12-2024-lote-v460'
const root=`tmp/revisao-profissional/${nome}/acervo-extraido`
const base='tmp/revisao-profissional/revisao-cti-renato-archer-cargo4-nanotecnologia-fotonica-energia-2024-lote-v459/acervo-extraido'
const doc='b8d68eaad16e72ed'
const gabarito='https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_006_01.PDF'
const m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8'))
const b=JSON.parse(await fs.readFile(path.join(base,'manifesto.json'),'utf8'))
const audit=JSON.parse(zlib.gunzipSync(await fs.readFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`)))
const ds=audit.map(x=>x.decisao)
assert.equal(ds.length,77);assert.equal(new Set(ds.map(x=>x.numero)).size,70)
assert.equal(m.questoes_extraidas_unicas,b.questoes_extraidas_unicas)
const changed=[];for(let i=0;i<m.lotes.length;i++)if(m.lotes[i].arquivo!==b.lotes[i].arquivo)changed.push(i)
assert.equal(changed.length,3)
const ids=new Set(ds.map(x=>x.id)),qs=new Map()
for(const i of changed){const a=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))));for(const q of a)if(ids.has(q.id))qs.set(q.id,q)}
assert.equal(qs.size,77)
const blocos=['E C E E C C E C C C C C E E C E C E C C','C C E C E E E C E C C C C E E E E C E E','E E C C E C C C E E C C C C C E C C E E','C E C C E C C C C E'].flatMap(x=>x.split(' '))
let eligible=0,duplicate=0,corrected=0
for(const q of qs.values()){
 const d=ds.find(x=>x.id===q.id),n=q.numero_original
 assert.ok(d);assert.equal(q.ano,2024);assert.equal(q.banca,'CEBRASPE');assert.ok(q.concurso.includes('CTI Renato Archer/MCTI'))
 assert.ok(q.materia&&q.conteudo&&q.dificuldade);assert.deepEqual(q.opcoes,['Certo','Errado']);assert.equal(q.gabarito_oficial?.fonte,gabarito)
 const page=n<=75?1:n<=105?2:3
 assert.equal(q.pagina_imagem,`paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
 await fs.access(path.join('public/acervo-extraido',q.pagina_imagem))
 for(const x of q.contexto_paginas||[])await fs.access(path.join('public/acervo-extraido',x.imagem))
 assert.equal(q.anulada,false);assert.equal(q.resposta_correta,blocos[n-51]==='C'?0:1);assert.equal(q.resposta_correta,d.resposta_correta)
 if(d.apta_resolucao===false){duplicate++;assert.equal(q.integridade_profissional?.apta_resolucao,false);assert.ok(q.duplicada_de)}
 else{eligible++;assert.equal(q.integridade_profissional?.apta_resolucao,true);assert.equal(q.integridade_profissional?.correcao_automatica,true);corrected++}
 if([65,66].includes(n))assert.ok(q.texto_apoio.includes('aluno1 = “Maria”'))
 if([67,68,69,70].includes(n))assert.ok(q.texto_apoio.includes('#define PI 3.14159'))
 if(n===75)assert.ok(!q.enunciado.includes('servo-controle visual'))
 if(n===81)assert.ok(!q.enunciado.includes('Com relação a técnicas de processamento'))
}
assert.equal(eligible,70);assert.equal(duplicate,7);assert.equal(corrected,70)
for(const field of ['indice_facetas','classificacao_principal']){const f=m[field],buf=await lerArquivoAtual(f.arquivo,[root,...raizesAtuais]);assert.equal(createHash('sha256').update(buf).digest('hex'),f.sha256);JSON.parse(zlib.gunzipSync(buf))}
const out={validado_em:new Date().toISOString(),registros_revistos:77,questoes_unicas_elegiveis:70,duplicatas_inelegiveis:7,anuladas:0,com_gabarito_automatico:70,classificacao_especifica_em_todas:true,blocos_python_cpp_reconstituídos:true,contaminacao_ocr_corrigida:true,imagens_origem_por_pagina_corretas:true,gabarito_definitivo_conferido:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas,disponiveis:m.questoes_disponiveis_resolucao,pacote_publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
