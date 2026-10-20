import test from 'node:test'
import assert from 'node:assert/strict'
import {lerMapa,mapaDoResumo,validarMaterial,registrarRevisao,revisaoPendente,salvarMaterial,TIPO_REVISAO,materialDeRevisao} from '../src/revisao.js'
import {aplicarOperacoes,diferencaProgresso} from '../src/progressoUsuario.js'
const material={id:'revisao:1',tipo:TIPO_REVISAO,titulo:'Equilíbrio',materia:'quimica',resumo:'Reação reversível.',roteiro:'Equilíbrio\n  Reação reversível\n  Exemplo\nCinética'}
test('mapa preserva os tópicos e hierarquia sem interpretar marcação HTML',()=>{
 const m=lerMapa(material.roteiro);assert.equal(m.length,2);assert.equal(m[0].filhos.length,2);assert.equal(m[0].filhos[1].titulo,'Exemplo')
 assert.equal(lerMapa('<script>alert(1)</script>')[0].titulo,'<script>alert(1)</script>')
 assert.equal(lerMapa('Raiz\n    Salto de nível\nOutra raiz')[0].filhos[0].titulo,'Salto de nível')
})
test('organização do resumo preserva as frases e não acrescenta informação',()=>{
 const texto='O equilíbrio é dinâmico. A temperatura interfere.\n\nConcentração\nDeslocamento'
 const m=lerMapa(mapaDoResumo(texto));assert.equal(m.length,2);assert.equal(m[0].filhos[0].titulo,'A temperatura interfere.');assert.equal(m[1].filhos[0].titulo,'Deslocamento')
 assert.equal(mapaDoResumo(''), '')
 assert.equal(lerMapa(mapaDoResumo('K = 1.25 e ΔH = −20 kJ/mol. A pressão varia.'))[0].titulo,'K = 1.25 e ΔH = −20 kJ/mol.')
})
test('valida materiais vazios, grandes e excessos de nós',()=>{
 assert.equal(validarMaterial(material),'');assert.match(validarMaterial({...material,titulo:''}),/título/)
 assert.match(validarMaterial({...material,resumo:'',roteiro:''}),/resumo/)
 assert.match(validarMaterial({...material,roteiro:'Tópico\n'.repeat(101)}),/100/)
 assert.match(validarMaterial({...material,resumo:'a'.repeat(12001)}),/12.000/)
})
test('revisão agenda retomada sem duplicar ou alterar conteúdo',()=>{
 const agora=new Date('2026-10-20T12:00:00Z');const revisado=registrarRevisao(material,3,agora)
 assert.equal(revisado.revisoesFeitas,1);assert.equal(revisado.resumo,material.resumo);assert.equal(Date.parse(revisado.proximaRevisao)-agora.getTime(),3*86400000)
 assert.equal(revisaoPendente(revisado,agora.getTime()),false);assert.equal(revisaoPendente(revisado,agora.getTime()+4*86400000),true)
 assert.throws(()=>registrarRevisao(material,0,agora));assert.equal(material.revisoesFeitas,undefined)
})
test('salvar material preserva tarefas e operações de progresso da conta',()=>{
 const tarefa={id:'tarefa1',texto:'Estudar',concluida:false};const original=[tarefa]
 const salvos=salvarMaterial(original,material);assert.equal(salvos[0],tarefa);assert.equal(original.length,1)
 const editado=salvarMaterial(salvos,{...material,titulo:'Novo título'});assert.equal(editado.length,2)
 const op=diferencaProgresso('tarefas',salvos,editado);const sincronizado=aplicarOperacoes({tarefas:salvos},[op])
 assert.equal(sincronizado.tarefas.find(materialDeRevisao).titulo,'Novo título');assert.equal(sincronizado.tarefas[0],tarefa)
 assert.throws(()=>salvarMaterial([tarefa],{...material,id:'tarefa1'}))
})
