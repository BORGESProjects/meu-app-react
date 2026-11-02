import test from 'node:test'
import assert from 'node:assert/strict'
import {classificarPeloComando} from '../src/classificacaoPorComando.js'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {imagemDaAlternativa} from '../src/textoQuestao.js'
import {blocosValidos} from '../src/blocosQuestao.js'

test('comando linguístico prevalece sobre assunto tecnológico ou médico do texto',()=>{
 for(const enunciado of ['De acordo com o texto, a revolução digital exige novas práticas de ensino.','O termo “da mortalidade” exerce a função sintática de complemento.'])assert.equal(classificarPeloComando({enunciado}).materia,'Língua Portuguesa')
 assert.equal(classificarPeloComando({enunciado:'De acordo com o texto constitucional, a competência é privativa.'}),null)
 assert.equal(classificarPeloComando({enunciado:'According to the text, choose the correct statement.'}),null)
})
test('não desloca fatos contábeis para atos administrativos',()=>{
 assert.equal(classificarPeloComando({enunciado:'O ato administrativo provoca alteração qualitativa no patrimônio da entidade contábil.'}),null)
 assert.equal(classificarPeloComando({enunciado:'O empenho global abrange a despesa contratual.'}).materia,'Administração Financeira e Orçamentária')
})
test('transcrições da UTFPR preservam fonte, ordem, gabarito e fração',()=>{
 const registros=JSON.parse(readFileSync('docs/acervo/utfpr-alternativas-transcritas.json')).questoes
 const qs=new Map(JSON.parse(readFileSync('public/acervo/utfpr-2023/questoes.json')).map(q=>[q.id,q]))
 for(const r of registros){
  const q=qs.get(r.id);assert.deepEqual(q.opcoes,r.opcoes);assert.equal(q.resposta_correta,r.resposta_correta)
  for(let i=0;i<5;i++){
   assert.equal(imagemDaAlternativa(q,i),null)
   assert.equal(createHash('sha256').update(readFileSync('public'+r.fontes[i].imagem)).digest('hex'),r.fontes[i].sha256)
  }
  if(q.blocos_opcoes)assert.ok(q.blocos_opcoes.every(blocosValidos))
 }
 assert.match(qs.get('utfpr-2023-37').opcoes[4],/\[NO\]²\[O₂\]\/\[NO₂\]²/u)
 assert.equal(imagemDaAlternativa({opcoes:['Diagrama da alternativa A'],opcoes_imagens:['figura.webp'],opcoes_em_texto:[true]},0),'figura.webp')
})
