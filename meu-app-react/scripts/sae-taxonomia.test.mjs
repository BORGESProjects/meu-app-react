import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {blocosValidos,temApoioEmBlocos} from '../src/blocosQuestao.js'
import {questaoPublicavel,unirQuestoes} from '../src/acervo.js'
import {normalizarBlocos} from './sae/formato-publicacao.mjs'
import {classificarReferencia} from './sae/classificacao.mjs'
const lote=JSON.parse(fs.readFileSync(new URL('../public/acervo/estudo-biologia-taxonomia/questoes.json',import.meta.url),'utf8'))
const audit=JSON.parse(fs.readFileSync(new URL('../docs/acervo/estudo-biologia-taxonomia.json',import.meta.url),'utf8'))
test('taxonomia fecha 23 posições, preserva 18 publicáveis e exclui conflitos',()=>{
 assert.equal(lote.length,18);assert.equal(lote.length+audit.duplicatas.length+audit.quarentena.length,23)
 const ids=new Set(unirQuestoes(lote).map(q=>q.id))
 for(const q of lote){assert.equal(questaoPublicavel(q),true,q.id);assert.ok(ids.has(q.id));assert.equal(blocosValidos(q.blocos_enunciado),true);assert.equal(q.blocos_opcoes.length,q.opcoes.length);assert.equal(q.blocos_opcoes.every(blocosValidos),true)}
 for(const q of [...audit.quarentena,...audit.duplicatas])assert.equal(lote.some(p=>p.id===q.id),false)
})
test('cladogramas das alternativas ficam separados e correspondem ao gabarito',()=>{
 const q=lote.find(q=>q.banca==='FUVEST');assert.equal(q.resposta_correta,1);assert.equal(q.blocos_opcoes.length,5)
 const imagens=q.blocos_opcoes.map(b=>b.find(n=>n.tag==='img')?.src);assert.equal(new Set(imagens).size,5);assert.ok(imagens.every(Boolean));assert.equal(q.blocos_enunciado.some(n=>n.tag==='img'),false)
 assert.equal(audit.recursos.length,15)
 for(const a of audit.recursos)assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../public'+a.imagem,import.meta.url))).digest('hex'),a.sha256)
})
test('nomes científicos conservam itálico e classificação institucional',()=>{
 const q=lote.find(q=>q.referencia_original==='INSPER-2019');assert.equal(q.banca,'Insper');assert.equal(q.ano,2019)
 assert.ok(JSON.stringify(q.blocos_enunciado).includes('"em"'))
 assert.equal(lote.find(q=>q.referencia_original==='COTUCA-2019').banca,'COTUCA')
 const corrigida=classificarReferencia('1. C4:H16 (UFGRS-2018) Texto');assert.equal(corrigida.banca,'UFRGS');assert.equal(corrigida.referencia_original,'UFGRS-2018')
})
test('normalização conserva células mescladas, remove controles e rejeita elementos inseguros',()=>{
 const blocos=normalizarBlocos([{tag:'table',children:[{tag:'tbody',children:[{tag:'tr',children:[{tag:'td',attrs:{rowspan:'2'},children:['Reino']}]}]}]}],()=>{throw Error('Sem imagens')})
 assert.equal(blocos[0].children[0].children[0].children[0].rowSpan,2);assert.equal(blocosValidos(blocos),true);assert.equal(temApoioEmBlocos(blocos),true)
 const alt=normalizarBlocos([{tag:'p',attrs:{class:'alternativaLetra respostaCerta'},children:[{tag:'label',children:['Controle']},{tag:'span',children:['a)']},{tag:'em',children:['Musca domestica']}]}],()=>'',{alternativa:true})
 assert.deepEqual(alt,[{tag:'em',children:['Musca domestica']}])
 assert.throws(()=>normalizarBlocos([{tag:'script',children:['alert(1)']}],()=>''))
 for(const src of ['https://exemplo.com/i.png','javascript:alert(1)','/acervo/estudo-x/../../segredo.png'])assert.equal(blocosValidos([{tag:'img',src,children:[]}]),false)
 assert.equal(blocosValidos([{tag:'iframe',children:[]}]),false)
 assert.equal(blocosValidos([{tag:'td',rowSpan:99,children:['x']}]),false)
})
