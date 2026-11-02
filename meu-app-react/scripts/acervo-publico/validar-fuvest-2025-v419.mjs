import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
const root='tmp/revisao-profissional/revisao-fuvest-2025-v419/acervo-extraido',base='tmp/revisao-profissional/revisao-tcern-arquivologia-2026-v418/acervo-extraido',doc='d97d20aed8c4e370'
const decisoes=JSON.parse(await fs.readFile(`tmp/decisoes-revisao-fuvest-2025-v419.json`,'utf8')),ids=new Set(decisoes.map(x=>x.id))
const m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8')),b=JSON.parse(await fs.readFile(path.join(base,'manifesto.json'),'utf8'))
assert.equal(m.questoes_extraidas_unicas,b.questoes_extraidas_unicas);assert.equal(m.questoes_disponiveis_resolucao,b.questoes_disponiveis_resolucao)
const changed=[];for(let i=0;i<m.lotes.length;i++)if(m.lotes[i].arquivo!==b.lotes[i].arquivo)changed.push(i);assert.equal(changed.length,1)
const qs=new Map();for(const i of changed){const lote=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))));for(const q of lote)if(ids.has(q.id))qs.set(q.id,q)}
assert.equal(qs.size,79);const expected=new Map(decisoes.map(d=>[d.id,d]));let linked=0
for(const q of qs.values()){
 const d=expected.get(q.id);assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.equal(q.ano,2025);assert.equal(q.banca,'FUVEST');assert.equal(q.concurso,'Vestibular USP 2025 — 1ª fase — Prova V1')
 assert.ok(q.materia&&q.conteudo&&q.tipo_resposta==='objetiva');assert.equal(q.opcoes.length,5);assert.equal(q.resposta_correta,d.resposta_correta)
 assert.ok(q.integridade_profissional?.apta_resolucao===true&&q.integridade_profissional.correcao_automatica===true)
 assert.ok(q.pagina_imagem.endsWith(`-${String(q.pagina).padStart(4,'0')}.webp`));await fs.access(path.join('public/acervo-extraido',q.pagina_imagem))
 for(const x of q.contexto_paginas||[])await fs.access(path.join('public/acervo-extraido',x.imagem))
 assert.ok(q.gabarito_oficial?.fonte=== 'https://www.fuvest.br/wp-content/uploads/fuvest2025_gabarito_primeira_fase.pdf');linked++
 assert.ok(!q.opcoes.some(o=>o.includes('#####')))
}
assert.equal(linked,79)
const formula=new Map([...qs.values()].map(q=>[q.numero_original,q.enunciado]))
assert.ok(formula.get(19).includes('λ′ = λ₀ + (α/m)'));assert.ok(formula.get(59).includes('ΔL = α L₀ (T − T₀)'));assert.ok(formula.get(70).includes('bₙ₊₁ = bₙ + aₙ'))
for(const field of ['indice_facetas','classificacao_principal']){const d=m[field],buf=await lerArquivoAtual(d.arquivo,raizesAtuais);assert.equal(createHash('sha256').update(buf).digest('hex'),d.sha256);JSON.parse(zlib.gunzipSync(buf))}
const out={validado_em:new Date().toISOString(),itens:qs.size,gabaritos_v1:linked,lotes_alterados:changed.length,imagens_contextuais_existentes:true,alternativas_sem_marcadores:true,formulas_reconstruidas:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-fuvest-2025-v419.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
