import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {questaoPublicavel,unirQuestoes} from '../src/acervo.js'
const lote=JSON.parse(fs.readFileSync(new URL('../public/acervo/estudo-quimica-modelos/questoes.json',import.meta.url),'utf8'))
const auditoria=JSON.parse(fs.readFileSync(new URL('../docs/acervo/estudo-quimica-modelos.json',import.meta.url),'utf8'))
test('lote de modelos atômicos fecha todas as posições sem publicar pendências',()=>{
 assert.equal(lote.length,29);assert.equal(new Set(lote.map(q=>q.id)).size,29)
 assert.equal(lote.length+auditoria.quarentena.length+auditoria.duplicatas.length,auditoria.total_extraido)
 assert.equal(auditoria.quarentena.length,8)
 for(const q of lote){assert.equal(questaoPublicavel(q),true,q.id);assert.ok(q.resposta_correta>=0&&q.resposta_correta<q.opcoes.length);assert.ok(q.opcoes.length===4||q.opcoes.length===5);assert.equal(q.materia,'Química');assert.equal(q.conteudo,'Modelos atômicos');assert.ok(q.origem_livro.secao&&q.origem_livro.numero)}
 const ids=new Set(unirQuestoes(lote).map(q=>q.id));for(const q of lote)assert.ok(ids.has(q.id),q.id)
 const bloqueados=new Set([...auditoria.quarentena,...auditoria.duplicatas].map(q=>q.id));assert.ok(lote.every(q=>!bloqueados.has(q.id)))
})
test('figuras e equação nuclear são locais, íntegras e não contêm alternativas',()=>{
 assert.equal(auditoria.recursos.length,7)
 for(const a of auditoria.recursos){assert.match(a.imagem,/^\/acervo\/estudo-quimica-modelos\/[a-f0-9]+\.jpg$/);assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../public'+a.imagem,import.meta.url))).digest('hex'),a.sha256)}
 const nuclear=lote.find(q=>q.id==='sae-fcfbb4a2eb63fd5961c7');assert.equal(nuclear.apoio.length,1);assert.equal(nuclear.resposta_correta,4);assert.deepEqual(nuclear.opcoes,['1 e 3.','1 e 1.','2 e 3.','2 e 1.','1 e 2.'])
 for(const q of lote){assert.ok(!/Resolução|C\d+:H\d+/.test(q.enunciado));assert.ok(!q.imagem_original);assert.ok(q.apoio.every(a=>auditoria.recursos.some(r=>r.imagem===a.imagem)))}
})
test('tabela e texto-base completos, classificação sem ano inventado',()=>{
 const tabela=lote.find(q=>q.id==='sae-0c66c625805cf74c4ff6');for(const trecho of ['Elemento | Cor','sódio | laranja','cobre | azul-esverdeada'])assert.ok(tabela.enunciado.includes(trecho),trecho)
 const sacks=lote.find(q=>q.id==='sae-a54693913bde2a9258ca');assert.ok(sacks.enunciado.includes('Oliver Sacks'));assert.ok(sacks.enunciado.includes('uma alteração fundamental de identidade'))
 for(const q of lote.filter(q=>q.tipo_origem==='assimilacao')){assert.equal(q.banca,'Questões de assimilação');assert.equal(q.ano,null)}
 assert.ok(lote.every(q=>q.banca!=='SAE'))
 assert.ok(lote.every(q=>!q.enunciado.includes('http://127.0.0.1')))
})
