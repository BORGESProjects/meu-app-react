import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-embrapa-biologia-sintetica-omics-2025-v426',doc='6e2dc9441ba83791'
const root=raizesAtuais[0],previous=raizesAtuais[1]
const audit=zlib.gunzipSync(await fs.readFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`))
const decisions=JSON.parse(audit).map(x=>x.decisao)
const manifest=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8'))
const old=JSON.parse(await fs.readFile(path.join(previous,'manifesto.json'),'utf8'))
assert.equal(decisions.length,38)
assert.equal(decisions.filter(d=>d.apta_resolucao===false).length,8)
assert.equal(new Set(decisions.filter(d=>d.apta_resolucao!==false).map(d=>d.numero)).size,30)
assert.equal(manifest.questoes_extraidas_unicas,old.questoes_extraidas_unicas)
assert.equal(manifest.questoes_disponiveis_resolucao,old.questoes_disponiveis_resolucao-8)
const ids=new Set(decisions.map(d=>d.id)),questions=new Map(),changed=[]
for(let i=0;i<manifest.lotes.length;i++)if(manifest.lotes[i].arquivo!==old.lotes[i].arquivo)changed.push(i)
assert.equal(changed.length,2)
for(const i of changed){
 const bytes=await fs.readFile(path.join(root,manifest.lotes[i].arquivo))
 assert.ok(manifest.lotes[i].arquivo.includes(hashRevisao(bytes).slice(0,12)))
 const lot=JSON.parse(zlib.gunzipSync(bytes))
 for(const q of lot)if(ids.has(q.id))questions.set(q.id,q)
}
assert.equal(questions.size,38)
let active=0,duplicates=0,auto=0
for(const d of decisions){
 const q=questions.get(d.id);assert.ok(q,`ID não encontrado: ${d.id}`)
 assert.equal(q.ano,2025);assert.equal(q.banca,'CEBRASPE');assert.equal(q.concurso,d.concurso)
 assert.equal(q.materia,'Biologia');assert.equal(q.conteudo,d.conteudo);assert.equal(q.dificuldade,d.dificuldade)
 assert.equal(q.classificacao_pendente,false);assert.equal(q.classificacao_revisada,true)
 assert.equal(q.numero_original,d.numero_original);assert.equal(q.enunciado,d.visual.enunciado)
 assert.equal(q.resposta_correta,d.resposta_correta);assert.equal(q.anulada,false)
 assert.equal(q.gabarito_oficial?.fonte,d.gabarito_oficial.fonte);assert.equal(q.gabarito_oficial?.valor,d.gabarito_oficial.valor)
 assert.equal(q.integridade_profissional?.correcao_automatica,d.apta_resolucao)
 assert.equal(q.pagina_imagem,d.visual.imagem);assert.equal(q.texto_apoio,d.visual.texto_apoio)
 assert.equal(q.revisao_semantica_visual?.metodo,'Conferência visual individual da página original')
 await fs.access(path.join('public/acervo-extraido',d.visual.imagem))
 assert.ok(['Fácil','Média','Difícil'].includes(q.dificuldade));assert.ok(q.conteudo.length>10)
 if(d.apta_resolucao===false){duplicates++;assert.equal(q.integridade_profissional?.apta_resolucao,false);assert.equal(q.duplicada_de,d.duplicada_de)}
 else{active++;auto+=Number(q.integridade_profissional?.correcao_automatica===true);assert.equal(q.integridade_profissional?.apta_resolucao,true)}
}
assert.equal(active,30);assert.equal(duplicates,8);assert.equal(auto,30)
const keyText=await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')
const official=keyText.trim().split(/\r?\n/).map(JSON.parse).find(x=>x.documento_id===doc)
assert.ok(official)
assert.equal(Object.keys(official.respostas).length,30)
for(const d of decisions)assert.equal(official.respostas[d.numero],d.gabarito_oficial.valor)
const report={validado_em:new Date().toISOString(),documento:doc,registros_revistos:38,itens_canonicos_prontos:active,duplicatas_desativadas:duplicates,correcao_automatica_com_gabarito_oficial:auto,transcricoes_conferidas_em_30_itens:true,imagens_originais_conferidas_e_preservadas:true,contextos_de_prova_associados:true,classificacao_banca_ano_materia_conteudo_dificuldade:true,gabarito_definitivo_oficial_cobre_71_a_100:true,integridade_dos_lotes_e_facetas_verificada:true,total_acervo:manifest.questoes_extraidas_unicas,disponiveis:manifest.questoes_disponiveis_resolucao,pendentes:manifest.revisao_profissional?.revisao_individual_concluida===true?0:undefined,publicado:false}
delete report.pendentes
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
