import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {questaoPublicavel,unirQuestoes} from '../src/acervo.js'
const lote=JSON.parse(fs.readFileSync('public/acervo/estudo-geografia-introducao/questoes.json'))
const audit=JSON.parse(fs.readFileSync('docs/acervo/estudo-geografia-introducao.json'))
test('Geografia contabiliza o capítulo sem publicar chave duvidosa ou figura cortada',()=>{
 assert.equal(lote.length,14);assert.equal(audit.quarentena.length,8)
 assert.equal(lote.length+audit.quarentena.length,22)
 const ids=new Set(unirQuestoes(lote).map(q=>q.id))
 for(const q of lote)assert.ok(ids.has(q.id))
 for(const q of lote){assert.ok(questaoPublicavel(q),q.id);assert.equal(q.materia,'Geografia');assert.equal(q.tipo_origem,'prova_identificada');assert.doesNotMatch(q.enunciado,/Acertos:|Erros:|Pontuação Final:|Resolução/u)}
 for(const q of audit.quarentena)assert.ok(!lote.some(p=>p.id===q.id))
})
test('Canal de Suez preserva mapa e marés, além das cinco alternativas separadas',()=>{
 const q=lote.find(q=>q.id==='sae-4fa1a7bf421aa5fcd214')
 const imagens=[];function visitar(n){if(typeof n==='string')return;if(n.src)imagens.push(n.src);(n.children||[]).forEach(visitar)}
 q.blocos_enunciado.forEach(visitar)
 assert.equal(imagens.length,2);assert.equal(q.opcoes.length,5);assert.equal(q.resposta_correta,1);assert.equal(q.ano,2022)
 for(const recurso of audit.recursos){const bytes=fs.readFileSync('public'+recurso.imagem);assert.equal(createHash('sha256').update(bytes).digest('hex'),recurso.sha256);assert.ok(bytes.length>1000)}
})
test('associação de categorias geográficas mantém todas as definições do texto-base',()=>{
 const q=lote.find(q=>q.id==='sae-e93292e03d1b920ae79c')
 for(const trecho of ['Paisagem','Território','Rede','afetividade','socioespaciais'])assert.ok(q.enunciado.includes(trecho),trecho)
 assert.equal(q.resposta_correta,2)
})
