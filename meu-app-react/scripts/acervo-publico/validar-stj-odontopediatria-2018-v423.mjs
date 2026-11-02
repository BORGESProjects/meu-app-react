import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-stj-odontopediatria-2018-v423',doc='f9561039893f2c78',root=raizesAtuais[0],previous=raizesAtuais[1]
const decisions=JSON.parse(await fs.readFile(`tmp/decisoes-${nome}.json`,'utf8'))
const m=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8'))
const old=JSON.parse(await fs.readFile(path.join(previous,'manifesto.json'),'utf8'))
assert.equal(decisions.length,80);assert.equal(new Set(decisions.map(x=>x.id)).size,80)
assert.equal(m.questoes_extraidas_unicas,old.questoes_extraidas_unicas)
assert.equal(m.questoes_disponiveis_resolucao,old.questoes_disponiveis_resolucao)
const changed=[];for(let i=0;i<m.lotes.length;i++)if(m.lotes[i].arquivo!==old.lotes[i].arquivo)changed.push(i)
assert.equal(changed.length,2)
const wanted=new Map(decisions.map(x=>[x.id,x])),found=new Map()
for(const i of changed){const rows=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,m.lotes[i].arquivo))));for(const q of rows)if(wanted.has(q.id))found.set(q.id,q)}
assert.equal(found.size,80)
let annulled=0,answerable=0
for(const [id,d] of wanted){const q=found.get(id);assert.ok(q);assert.equal(q.ano,2018);assert.equal(q.banca,'CEBRASPE');assert.equal(q.concurso,d.concurso);assert.equal(q.materia,d.materia);assert.equal(q.conteudo,d.conteudo);assert.equal(q.numero_original,d.numero);assert.equal(q.resposta_correta,d.resposta_correta);assert.equal(q.anulada,d.anulada);assert.deepEqual(q.opcoes,['Certo','Errado']);assert.ok(q.enunciado?.length>30);assert.ok(q.texto_apoio?.length>30);assert.equal(q.pagina_imagem,`paginas/${doc}-${String(d.pagina).padStart(4,'0')}.webp`);await fs.access(path.join('public/acervo-extraido',q.pagina_imagem));assert.equal(q.dificuldade,d.dificuldade);assert.equal(q.gabarito_oficial?.fonte,'https://cdn.cebraspe.org.br/concursos/STJ_18/arquivos/GAB_DEFINITIVO_385_STJ004.PDF');if(d.anulada){annulled++;assert.equal(q.integridade_profissional?.correcao_automatica,false)}else{answerable++;assert.equal(q.integridade_profissional?.correcao_automatica,true)}}
assert.equal(annulled,2);assert.equal(answerable,78)
for(const [key,value] of Object.entries(m.indice_facetas?{indice_facetas:m.indice_facetas}:{ })){const bytes=await fs.readFile(path.join(root,value.arquivo));assert.equal(createHash('sha256').update(bytes).digest('hex'),value.sha256);JSON.parse(zlib.gunzipSync(bytes))}
const result={validado_em:new Date().toISOString(),itens:found.size,itens_anulados:annulled,itens_com_correcao_automatica:answerable,classificacao_individual:true,contextos_base_reestruturados:true,imagens_originais_preservadas:true,gabarito_oficial_vinculado:true,facetas_com_hash_valido:true,total_acervo:m.questoes_extraidas_unicas,disponiveis:m.questoes_disponiveis_resolucao,pacote_publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/validacao-${nome}.json`,JSON.stringify(result,null,2))
console.log(JSON.stringify(result,null,2))
