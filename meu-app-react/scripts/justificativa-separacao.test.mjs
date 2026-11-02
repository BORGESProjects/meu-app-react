import test from 'node:test'
import assert from 'node:assert/strict'
import {separarJustificativa} from './acervo-publico/separar-justificativa.mjs'
const enunciado='A duração do contrato está indicada no documento.',comentario='JUSTIFICATIVA - ERRADO. O documento não contém essa informação.'
const q={banca:'CEBRASPE',opcoes:['Certo','Errado'],numero_original:1,pagina:1,pagina_imagem:'paginas/doc.webp',enunciado:enunciado+'\n'+comentario},paginas=[`1 ${q.enunciado}\n2 A segunda questão.`]
test('separa justificativa completa sem inventar gabarito',()=>{const r=separarJustificativa(q,paginas);assert.equal(r.enunciado,enunciado);assert.equal(r.comentario,comentario);assert.equal(r.resposta_correta,undefined)})
test('recusa fonte divergente, comentário existente e conflito de gabarito',()=>{assert.equal(separarJustificativa({...q,resposta_correta:0},paginas),null);assert.equal(separarJustificativa({...q,comentario:'Anterior'},paginas),null);assert.equal(separarJustificativa(q,['Texto divergente']),null)})
test('recusa mistura de grupos e preserva itens sem marca explícita',()=>{const t=q.enunciado+'\nJulgue os itens seguintes.';assert.equal(separarJustificativa({...q,enunciado:t},[`1 ${t}\n2 Outro item.`]),null);assert.equal(separarJustificativa({...q,enunciado:'O termo JUSTIFICATIVA está empregado corretamente.'},paginas),null)})
