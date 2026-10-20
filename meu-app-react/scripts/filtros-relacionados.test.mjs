import test from 'node:test'
import assert from 'node:assert/strict'
import { indexarFiltros, filtrarIndice, contarOpcoesRelacionadas, opcoesRelacionadas, atualizarFiltrosRelacionados, CAMPOS_FILTRO } from '../src/indiceFiltros.js'
const q=(id,banca,materia,ano,dificuldade,conteudo=materia)=>({id,banca,materia,ano,dificuldade,conteudo,enunciado:'Pergunta de conhecimento geral independente',opcoes:['Primeira','Segunda']})
const indice=indexarFiltros([
 q('c1','CPOR','Matemática',2025,'Fácil','Álgebra'),q('c2','CPOR/SP','Língua Portuguesa',2024,'Médio','Sintaxe'),
 q('e1','ESA','Matemática',2025,'Média','Geometria'),q('e2','ESA','História',2024,'Difícil','Brasil Império'),
 q('n1','ENEM','Química',2025,'Difícil','Termoquímica'),q('n2','ENEM','Filosofia',2024,'Média','Filosofia antiga'),
 q('n3','ENEM','Matemática',2025,'Fácil','Álgebra'),q('u1','UFPR','Química',2024,'Médio','Equilíbrio químico'),
])
const valores=(opcoes,campo)=>opcoes[campo].map(o=>o.value)

test('CPOR só oferece matérias, conteúdos, anos e dificuldades com questões nessa banca',()=>{
 const opcoes=opcoesRelacionadas(indice,{banca:['cpor']})
 assert.deepEqual(valores(opcoes,'materia'),['matematica','portugues'])
 assert.deepEqual(valores(opcoes,'ano'),['2025','2024'])
 assert.deepEqual(valores(opcoes,'dificuldade'),['facil','media'])
 assert.ok(!valores(opcoes,'materia').includes('quimica'))
 assert.equal(opcoes.conteudo.length,2)
 assert.ok(opcoes.conteudo.every(o=>o.label.endsWith('(1)')))
})
test('ESA sem Filosofia não oferece a matéria; não há proibição fixa por instituição',()=>{
 assert.ok(!valores(opcoesRelacionadas(indice,{banca:['esa']}),'materia').includes('filosofia'))
 const outro=indexarFiltros([...indice.map(i=>i.questao),q('nova','ESA','Filosofia',2025,'Médio')])
 assert.ok(valores(opcoesRelacionadas(outro,{banca:['esa']}),'materia').includes('filosofia'))
})
test('multisseleção de bancas une as opções e o próprio campo continua expansível',()=>{
 const opcoes=opcoesRelacionadas(indice,{banca:['cpor','enem']})
 assert.deepEqual(valores(opcoes,'materia'),['filosofia','matematica','portugues','quimica'])
 assert.deepEqual(valores(opcoes,'banca'),['cpor','enem','esa','ufpr'])
 const mat=opcoesRelacionadas(indice,{banca:['cpor','enem'],materia:['matematica']})
 assert.ok(valores(mat,'materia').includes('quimica'))
 assert.ok(!valores(mat,'banca').includes('ufpr'))
})
test('ano, dificuldade e matéria restringem as demais listas com contagens corretas',()=>{
 const opcoes=opcoesRelacionadas(indice,{ano:['2025'],dificuldade:['facil']})
 assert.deepEqual(valores(opcoes,'materia'),['matematica'])
 assert.deepEqual(valores(opcoes,'banca'),['cpor','enem'])
 assert.equal(opcoes.conteudo.length,1);assert.match(opcoes.conteudo[0].label,/\(2\)$/)
 const ufpr=opcoesRelacionadas(indice,{banca:['ufpr'],materia:['quimica']})
 assert.deepEqual(valores(ufpr,'ano'),['2024'])
 assert.deepEqual(valores(ufpr,'dificuldade'),['media'])
})
test('trocar banca mantém seleções compatíveis e remove apenas as incompatíveis',()=>{
 const anterior={banca:['enem'],materia:['quimica'],ano:['2025'],dificuldade:['dificil'],conteudo:[]}
 const {filtros,removidos}=atualizarFiltrosRelacionados(indice,anterior,'banca',['cpor'])
 assert.deepEqual(filtros.banca,['cpor']);assert.deepEqual(filtros.ano,['2025'])
 assert.deepEqual(filtros.materia,[]);assert.deepEqual(filtros.dificuldade,[])
 assert.equal(removidos.length,2);assert.equal(filtrarIndice(indice,filtros).length,1)
 const compativel=atualizarFiltrosRelacionados(indice,{banca:['cpor'],materia:['matematica'],ano:['2025']},'banca',['cpor','esa'])
 assert.deepEqual(compativel.filtros.materia,['matematica']);assert.deepEqual(compativel.removidos,[])
})
test('limpar ou remover uma banca expande opções e não deixa escolhas ocultas',()=>{
 const limpos=atualizarFiltrosRelacionados(indice,{banca:['cpor']},'banca',[]).filtros
 assert.ok(valores(opcoesRelacionadas(indice,limpos),'materia').includes('quimica'))
 assert.deepEqual(filtrarIndice(indice,limpos),[])
 const resultado=atualizarFiltrosRelacionados(indice,{banca:['cpor','enem'],materia:['quimica']},'banca',['cpor'])
 assert.deepEqual(resultado.filtros.materia,[])
 for(const campo of CAMPOS_FILTRO) for(const valor of resultado.filtros[campo]) assert.ok(valores(opcoesRelacionadas(indice,resultado.filtros),campo).includes(valor))
})
test('índice vazio é válido e opções não dependem de dados ainda não carregados',()=>{
 assert.ok(Object.values(opcoesRelacionadas([],{})).every(v=>v.length===0))
 const parcial=indexarFiltros(indice.slice(0,1).map(i=>i.questao))
 assert.deepEqual(valores(opcoesRelacionadas(parcial,{banca:['cpor']}),'materia'),['matematica'])
 assert.deepEqual(valores(opcoesRelacionadas(indice,{banca:['cpor']}),'materia'),['matematica','portugues'])
})
test('contagem otimizada equivale a cruzar todos os outros filtros em cada campo',()=>{
 const cenarios=[{}, {banca:['cpor']},{banca:['cpor','enem'],ano:['2025']},{materia:['quimica','matematica'],dificuldade:['media']},{conteudo:[indice[0].conteudo],ano:['2025']},{ano:['2024','2025'],materia:['portugues'],banca:['cpor','esa']},{banca:['inexistente'],materia:['quimica']}]
 for(const filtros of cenarios) {
  const original=JSON.stringify(filtros), contagens=contarOpcoesRelacionadas(indice,filtros)
  for(const campo of CAMPOS_FILTRO) {
   const esperadas=new Map()
   for(const item of indice) if(Object.entries(filtros).every(([outro,v])=>outro===campo||!v.length||v.includes(item[outro]))) esperadas.set(item[campo],(esperadas.get(item[campo])||0)+1)
   assert.deepEqual(contagens[campo],esperadas,JSON.stringify([campo,filtros]))
  }
  assert.equal(JSON.stringify(filtros),original)
 }
})
