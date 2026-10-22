import test from 'node:test'
import assert from 'node:assert/strict'
import {problemaDeGabarito,alternativasDistintas,apoioIntegradoNaFonte} from './validacao-livros.mjs'
import {questaoPublicavel} from '../../src/acervo.js'

const q=()=>({tipo_resposta:'multipla_escolha',resposta_correta:1,alternativas:[{rotulo:'A',correta_livro:false},{rotulo:'B',correta_livro:true}],solucao_livro:[]})
test('exige marcação única e rótulos completos; resolução contraditória não é publicada',()=>{
 assert.equal(problemaDeGabarito(q()),null)
 const dupla=q();dupla.alternativas[0].correta_livro=true;assert.ok(problemaDeGabarito(dupla))
 const rotulo=q();rotulo.alternativas[1].rotulo='C';assert.ok(problemaDeGabarito(rotulo))
 const contradicao=q();contradicao.solucao_livro=['Gabarito: A.'];assert.ok(problemaDeGabarito(contradicao))
 const correta=q();correta.solucao_livro=['A alternativa correta é B.'];assert.equal(problemaDeGabarito(correta),null)
 correta.solucao_livro=['A alternativa correta é a letra B.'];assert.equal(problemaDeGabarito(correta),null)
 correta.solucao_livro=['Resposta: a alternativa considera a influência do clima.'];assert.equal(problemaDeGabarito(correta),null)
})

test('texto integrado exige corpo e referência dentro do próprio exercício',()=>{
 const p=(classe,t)=>({tag:'p',attrs:{class:classe},children:[t]})
 assert.equal(apoioIntegradoNaFonte({enunciado_blocos:[p('enunciadoNumero','Conforme o texto, assinale.'),p('textoReferencia','Autor, 2020.')]}),false)
 assert.equal(apoioIntegradoNaFonte({enunciado_blocos:[p('enunciadoNumero','Leia.'),p('enunciadoSemNumero','Texto de apoio. '.repeat(30)),p('textoReferencia','Autor, 2020.'),p('enunciadoSemNumero','Conforme o texto, assinale.')]}),true)
})
test('não rejeita fórmulas e figuras distintas apenas por terem texto auxiliar igual',()=>{
 const img=hash=>[{tag:'img',src:`/acervo/estudo-teste/${hash.repeat(20)}.png`,children:[]}]
 assert.equal(alternativasDistintas(['',''],[img('a'),img('b')]),true)
 assert.equal(alternativasDistintas(['',''],[img('a'),img('a')]),false)
 assert.equal(alternativasDistintas(['',''],[[],[]]),false)
 assert.equal(alternativasDistintas(['Água','água'],[['Água'],['água']]),false)
})

test('√2 e 2 continuam alternativas diferentes mesmo quando a extração textual de ambas é 2',()=>{
 const math=children=>[{tag:'math',children}]
 const n={tag:'mn',children:['2']}
 const pergunta={enunciado:'Qual é a medida indicada no problema?',opcoes:['2','2'],resposta_correta:0,blocos_opcoes:[math([{tag:'msqrt',children:[n]}]),math([n])]}
 assert.equal(questaoPublicavel(pergunta),true)
 assert.equal(questaoPublicavel({...pergunta,blocos_opcoes:[math([n]),math([n])]}),false)
 assert.equal(questaoPublicavel({...pergunta,blocos_opcoes:undefined}),false)
})
