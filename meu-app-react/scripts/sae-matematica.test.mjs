import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizarBlocos,textoDosBlocos} from './sae/formato-publicacao.mjs'
import {blocosValidos,assinaturaVisualBlocos} from '../src/blocosQuestao.js'
import {unirQuestoes} from '../src/acervo.js'
const n=(tag,...children)=>({tag,children})
test('MathJax conserva uma só fórmula semântica com fração, radical e expoente',()=>{
 const formula=n('math',n('mfrac',n('msup',n('mi','x'),n('mn','2')),n('msqrt',n('mi','y'))))
 formula.attrs={display:'block'}
 const origem=n('mjx-container',n('mjx-math',n('mjx-c','cópia visual')),n('mjx-assistive-mml',formula))
 const resultado=normalizarBlocos([origem],()=>{throw Error('Não há imagens')})
 assert.equal(resultado.length,1);assert.equal(resultado[0].tag,'math');assert.equal(resultado[0].display,'block');assert.ok(blocosValidos(resultado))
 assert.equal(textoDosBlocos(resultado),'x2y');assert.ok(!JSON.stringify(resultado).includes('cópia visual'))
 assert.throws(()=>normalizarBlocos([n('mjx-container',n('mjx-math','sem representação semântica'))],()=>''))
})
test('fórmulas não aceitam HTML, execução, variantes arbitrárias ou operandos faltando',()=>{
 assert.equal(blocosValidos([n('math',n('mfrac',n('mn','1')))]),false)
 assert.equal(blocosValidos([n('math',n('img'))]),false)
 assert.equal(blocosValidos([n('mi','x')]),false)
 assert.equal(blocosValidos([{...n('math',n('mi','x')),mathvariant:'javascript:alert(1)'}]),false)
 assert.throws(()=>normalizarBlocos([n('math',n('annotation-xml',n('script','x')))],()=>''))
})
test('imagem de fração fica na linha sem se confundir com diagrama independente',()=>{
 const img={tag:'img',attrs:{class:'fracao',src:'recurso-local'},children:[]}
 const [b]=normalizarBlocos([img],()=>'/acervo/estudo-matematica/01234567890123456789.png')
 assert.equal(b.inline,true);assert.ok(blocosValidos([b]));assert.equal(blocosValidos([{...b,inline:'onclick'}]),false)
})
test('deduplicação conserva expressões diferentes apesar do texto auxiliar igual',()=>{
 const base={materia:'Matemática',banca:'Questões de assimilação',concurso:'Questões de assimilação',enunciado:'Considere a expressão apresentada e calcule seu valor.',opcoes:['1','2','3','4','5'],resposta_correta:0}
 const a={...base,id:'teste-fracao-potencia-a',blocos_enunciado:[n('math',n('msup',n('mi','x'),n('mn','2')))]}
 const b={...base,id:'teste-fracao-potencia-b',blocos_enunciado:[n('math',n('mrow',n('mi','x'),n('mn','2')))]}
 assert.notEqual(assinaturaVisualBlocos(a),assinaturaVisualBlocos(b))
 const ids=new Set(unirQuestoes([a,b]).map(q=>q.id));assert.ok(ids.has(a.id));assert.ok(ids.has(b.id))
})
