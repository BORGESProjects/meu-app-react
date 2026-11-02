import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-enem-2024-caderno10-ampliada-lote-v429',doc='bd0aa14272cba87e'
const rootIndex=raizesAtuais.findIndex(x=>x.endsWith('/revisao-enem-2024-caderno10-ampliada-lote-v429/acervo-extraido'))
assert.ok(rootIndex>=0)
const root=raizesAtuais[rootIndex],previous=raizesAtuais[rootIndex+1]
const audit=JSON.parse(zlib.gunzipSync(await fs.readFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`)))
const decisions=audit.map(x=>x.decisao),manifest=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'))),old=JSON.parse(await fs.readFile(path.join(previous,'manifesto.json')))
assert.equal(decisions.length,68);assert.equal(new Set(decisions.map(d=>d.id)).size,68)
assert.equal(decisions.filter(d=>d.apta_resolucao).length,67)
assert.equal(decisions.filter(d=>d.apta_resolucao===false).length,1)
assert.equal(manifest.questoes_extraidas_unicas,old.questoes_extraidas_unicas)
assert.equal(manifest.questoes_disponiveis_resolucao,old.questoes_disponiveis_resolucao-1)
const ids=new Set(decisions.map(d=>d.id)),questions=new Map(),changed=[]
for(let i=0;i<manifest.lotes.length;i++)if(manifest.lotes[i].arquivo!==old.lotes[i].arquivo)changed.push(i)
assert.equal(changed.length,3)
for(const i of changed){const bytes=await fs.readFile(path.join(root,manifest.lotes[i].arquivo));assert.ok(manifest.lotes[i].arquivo.includes(hashRevisao(bytes).slice(0,12)));for(const q of JSON.parse(zlib.gunzipSync(bytes)))if(ids.has(q.id))questions.set(q.id,q)}
assert.equal(questions.size,68)
for(const d of decisions){
 const q=questions.get(d.id);assert.ok(q);assert.equal(q.ano,2024);assert.equal(q.banca,'INEP');assert.equal(q.concurso,d.concurso)
 assert.equal(q.numero,d.numero);assert.equal(q.numero_original,d.numero_original);assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.equal(q.materia,d.materia);assert.equal(q.conteudo,d.conteudo);assert.equal(q.dificuldade,d.dificuldade)
 assert.equal(q.enunciado,d.enunciado);if(d.texto_apoio!==undefined)assert.equal(q.texto_apoio,d.texto_apoio)
 if(d.apta_resolucao){assert.equal(q.gabarito_oficial?.fonte,d.gabarito_oficial.fonte);assert.equal(q.opcoes.length,5);assert.equal(q.resposta_correta,d.resposta_correta);assert.equal(q.gabarito_oficial?.valor,d.gabarito_oficial.valor);assert.ok(q.enunciado.length>20)}
 else{assert.equal(q.integridade_profissional?.apta_resolucao,false);assert.equal(q.opcoes.length,0)}
 assert.ok(q.pagina_imagem?.startsWith(`paginas/${doc}-`));await fs.access(path.join('public/acervo-extraido',q.pagina_imagem))
 assert.ok(q.imagens_paginas?.includes(q.pagina_imagem));assert.ok(q.contexto_paginas?.length)
 for(const ref of q.contexto_paginas)await fs.access(path.join('public/acervo-extraido',ref.imagem))
 assert.equal(q.revisao_semantica_visual?.metodo,'Conferência visual individual da página original')
 assert.ok(!/\*011775RX\d+\*|011775RX\.indb|ENEM2024/.test([q.enunciado,...q.opcoes].join(' ')))
}
const cover=decisions.find(d=>d.id==='extr-aedf51bd70d8bff6d1f2'),q10=decisions.find(d=>d.id==='extr-55985cd2caaaf21f3068'),q80=decisions.find(d=>d.numero===80)
assert.equal(cover.apta_resolucao,false);assert.equal(q10.numero,10);assert.equal(q10.gabarito_oficial.valor,'A');assert.equal(q80.opcoes.length,5)
const keyUrl='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_GB_impresso_D1_CD10.pdf'
for(const d of decisions.filter(x=>x.apta_resolucao))assert.equal(d.gabarito_oficial.fonte,keyUrl)
const facets=await fs.readFile(path.join(root,manifest.indice_facetas.arquivo));assert.equal(hashRevisao(facets),manifest.indice_facetas.sha256)
const f=JSON.parse(zlib.gunzipSync(facets));assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),manifest.questoes_disponiveis_resolucao)
const report={validado_em:new Date().toISOString(),documento:doc,questoes_revisadas:67,capa_inabilitada:1,numero_corrigido_de_4_para_10:true,alternativas_completas:67,gabaritos_oficiais_conferidos:67,textos_ocr_e_contextos_verificados:true,imagens_graficos_e_paginas_preservados:67,integridade_lotes_e_facetas_verificada:true,total_acervo:manifest.questoes_extraidas_unicas,disponiveis:manifest.questoes_disponiveis_resolucao,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))
