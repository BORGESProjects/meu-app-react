import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-antt-engenharia-transportes-2024-v427',doc='8099a3423efb5efe'
const root=raizesAtuais[0],previous=raizesAtuais[1]
const audit=JSON.parse(zlib.gunzipSync(await fs.readFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`)))
const decisions=audit.map(x=>x.decisao)
const manifest=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8'))
const old=JSON.parse(await fs.readFile(path.join(previous,'manifesto.json'),'utf8'))
assert.equal(decisions.length,77)
assert.equal(decisions.filter(d=>d.anulada).length,5)
assert.equal(new Set(decisions.filter(d=>!d.anulada).map(d=>d.numero)).size,72)
assert.equal(manifest.questoes_extraidas_unicas,old.questoes_extraidas_unicas)
assert.equal(manifest.questoes_disponiveis_resolucao,old.questoes_disponiveis_resolucao)
const ids=new Set(decisions.map(d=>d.id)),questions=new Map(),changed=[]
for(let i=0;i<manifest.lotes.length;i++)if(manifest.lotes[i].arquivo!==old.lotes[i].arquivo)changed.push(i)
assert.equal(changed.length,3)
for(const i of changed){
 const bytes=await fs.readFile(path.join(root,manifest.lotes[i].arquivo))
 assert.ok(manifest.lotes[i].arquivo.includes(hashRevisao(bytes).slice(0,12)))
 const lot=JSON.parse(zlib.gunzipSync(bytes))
 for(const q of lot)if(ids.has(q.id))questions.set(q.id,q)
}
assert.equal(questions.size,77)
let annulled=0,automaticallyCorrected=0
for(const d of decisions){
 const q=questions.get(d.id);assert.ok(q,`ID ausente: ${d.id}`)
 assert.equal(q.ano,2024);assert.equal(q.banca,'CEBRASPE');assert.equal(q.concurso,d.concurso)
 assert.equal(q.materia,d.materia);assert.equal(q.conteudo,d.conteudo);assert.equal(q.dificuldade,d.dificuldade)
 assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.equal(q.numero_original,d.numero);assert.equal(q.enunciado,d.visual.enunciado)
 assert.equal(q.gabarito_oficial?.fonte,d.gabarito_oficial.fonte);assert.equal(q.gabarito_oficial?.valor,d.gabarito_oficial.valor)
 assert.equal(q.anulada,d.anulada);assert.equal(q.resposta_correta,d.resposta_correta)
 assert.equal(q.texto_apoio,d.visual.texto_apoio);assert.equal(q.pagina_imagem,d.visual.imagem)
 assert.ok(q.enunciado.length>20);assert.ok(q.conteudo.length>10)
 assert.equal(q.revisao_semantica_visual?.metodo,'Conferência visual individual da página original')
 await fs.access(path.join('public/acervo-extraido',d.visual.imagem))
 if(d.anulada){annulled++;assert.equal(q.integridade_profissional?.correcao_automatica,false);assert.equal(q.gabarito_oficial?.valor,'X')}
 else{automaticallyCorrected++;assert.equal(q.integridade_profissional?.correcao_automatica,true);assert.equal(q.integridade_profissional?.apta_resolucao,true)}
}
assert.equal(annulled,5);assert.equal(automaticallyCorrected,72)
const q95=questions.get(decisions.find(d=>d.numero===95).id).enunciado
assert.ok(q95.includes('janeiro 363'));assert.ok(q95.includes('dezembro 333'));assert.ok(q95.includes('capacidade do veículo de 70 passageiros'))
const q102=questions.get(decisions.find(d=>d.numero===102).id).enunciado
assert.ok(q102.includes('[A] + [B] → [C]'));assert.ok(q102.includes('[F] → [H]'))
const keyText=await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')
const key=keyText.trim().split(/\r?\n/).map(JSON.parse).find(x=>x.documento_id===doc)
assert.ok(key);assert.equal(Object.keys(key.respostas).length,120)
for(const d of decisions)assert.equal(key.respostas[d.numero],d.gabarito_oficial.valor)
const facets=await fs.readFile(path.join(root,manifest.indice_facetas.arquivo))
assert.equal(hashRevisao(facets),manifest.indice_facetas.sha256)
const f=JSON.parse(zlib.gunzipSync(facets));assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),manifest.questoes_disponiveis_resolucao)
const report={validado_em:new Date().toISOString(),documento:doc,registros_revistos:77,itens_canonicos:77,anulados_conforme_gabarito:annulled,questoes_com_correcao_automatica:automaticallyCorrected,transcricoes_conferidas_visualmente:77,imagens_originais_preservadas:77,tabela_e_diagrama_transcritos:true,classificacao_banca_ano_materia_conteudo_dificuldade:true,gabarito_definitivo_oficial_cobre_1_a_120:true,integridade_dos_lotes_e_facetas_verificada:true,total_acervo:manifest.questoes_extraidas_unicas,disponiveis:manifest.questoes_disponiveis_resolucao,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
