import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const name='vincular-gabarito-enem-caderno10-lote-v430'
const index=raizesAtuais.findIndex(x=>x.endsWith(`/${name}/acervo-extraido`))
assert.ok(index>=0)
const root=raizesAtuais[index],previous=raizesAtuais[index+1]
const audit=JSON.parse(zlib.gunzipSync(await fs.readFile(`docs/acervo/revisao-profissional/${name}-alteracoes.json.gz`)))
const decisions=audit.map(x=>x.decisao),manifest=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'))),old=JSON.parse(await fs.readFile(path.join(previous,'manifesto.json')))
assert.equal(decisions.length,67);assert.equal(manifest.questoes_disponiveis_resolucao,old.questoes_disponiveis_resolucao)
const ids=new Set(decisions.map(d=>d.id)),actual=new Map(),changed=[]
for(let i=0;i<manifest.lotes.length;i++)if(manifest.lotes[i].arquivo!==old.lotes[i].arquivo)changed.push(i)
assert.equal(changed.length,3)
for(const i of changed){const bytes=await fs.readFile(path.join(root,manifest.lotes[i].arquivo));assert.ok(manifest.lotes[i].arquivo.includes(hashRevisao(bytes).slice(0,12)));for(const q of JSON.parse(zlib.gunzipSync(bytes)))if(ids.has(q.id))actual.set(q.id,q)}
assert.equal(actual.size,67)
let auto=0
for(const d of decisions){
 const q=actual.get(d.id);assert.ok(q);assert.equal(q.gabarito_oficial?.valor,d.gabarito_oficial.valor);assert.equal(q.gabarito_oficial?.sha256,d.gabarito_oficial.sha256)
 assert.match(q.gabarito_oficial.sha256,/^[a-f0-9]{64}$/);assert.equal(q.gabarito_oficial.sha256_tipo,'transcricao_canonica_da_tabela_oficial')
 assert.equal(q.integridade_profissional?.correcao_automatica,true);assert.equal(q.elegibilidade?.elegivel_para_correcao_automatica,true)
 assert.equal(q.resposta_correta,d.resposta_correta);auto++
}
assert.equal(auto,67)
const report={validado_em:new Date().toISOString(),documento:'bd0aa14272cba87e',gabaritos_oficiais_vinculados:67,correcao_automatica_ativa:67,impressao_digital:'SHA-256 da transcrição canônica da tabela oficial; não representa hash do PDF',lotes_e_manifesto_verificados:true,total_acervo:manifest.questoes_extraidas_unicas,disponiveis:manifest.questoes_disponiveis_resolucao,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${name}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))
