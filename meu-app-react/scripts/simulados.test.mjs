import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { unirQuestoes, podeCorrigir } from '../src/acervo.js'
import { listarProvasCompletas, gerarTreinoCpor, disponibilidadeTreinoCpor, questoesDaProva, MATERIAS_TREINO_CPOR } from '../src/simulados.js'
import catalogo from '../src/data/provasCompletas.json' with {type:'json'}

const fontes = [...new Set(catalogo.map(p => p.fonte)), 'public/acervo/teorema-180/questoes.json']
const questoes = unirQuestoes(fontes.flatMap(p => JSON.parse(fs.readFileSync(p,'utf8'))))
const cfn = catalogo.find(p => p.banca === 'CFN' && p.ano === '2025')

test('provas completas exigem cada posição do catálogo, incluindo anuladas', () => {
  const prova = questoesDaProva(questoes,cfn.id)
  assert.equal(prova.length,50)
  assert.equal(listarProvasCompletas(prova,'Inglês',undefined,[cfn]).length,1)
  assert.equal(listarProvasCompletas(prova.slice(0,4),'Inglês',undefined,[cfn]).length,0)
  assert.equal(listarProvasCompletas(prova.slice(1),'Inglês',undefined,[cfn]).length,0)
  const anulada = prova.map((q,i)=>i? q : {...q,anulada:true,resposta_correta:null})
  const card = listarProvasCompletas(anulada,'Inglês',undefined,[cfn])[0]
  assert.equal(card.totalOriginal,50); assert.equal(card.questoesCount,49); assert.equal(card.anuladas,1)
  assert.equal(listarProvasCompletas(anulada.slice(1),'Inglês',undefined,[cfn]).length,0)
})

test('coleções pequenas ou com nome de concurso não viram provas oficiais', () => {
  const fragmento = questoes.filter(q=>q.banca==='CFN').slice(0,4).map(q=>({...q,id:'fragmento-'+q.id,concurso:'CPOR 2025 — coleção parcial'}))
  assert.deepEqual(listarProvasCompletas(fragmento),[])
  const incompleta = questoes.map(q=>q.id === cfn.itens[0][0] ? {...q,prova_incompleta:true}:q)
  assert.ok(!listarProvasCompletas(incompleta).some(p=>p.id===cfn.id))
})

test('cada card inicia exatamente o número prometido e respeita idioma e específicas', () => {
  for(const idioma of ['Inglês','Espanhol','Francês']) for(const especificas of [['Biologia','Química'],['Matemática','História']]) {
    const provas = listarProvasCompletas(questoes,idioma,especificas)
    assert.ok(provas.some(p=>p.id===cfn.id), 'A prova completa de referência deve continuar disponível')
    const pendentes = new Set(JSON.parse(fs.readFileSync('docs/acervo/espcex-alternativas-pendentes.json','utf8')).map(q=>q.id))
    for (const registro of catalogo.filter(p=>p.itens.some(([id])=>pendentes.has(id)))) {
      assert.ok(!provas.some(p=>p.id===registro.id), `Prova com alternativas ausentes: ${registro.prova}`)
    }
    assert.equal(new Set(provas.map(p=>p.id)).size,provas.length)
    for(const prova of provas) {
      const itens = questoesDaProva(questoes,prova.id,idioma,especificas)
      assert.equal(itens.length,prova.questoesCount,prova.prova)
      assert.ok(itens.length>=30,prova.prova)
      assert.ok(itens.every(podeCorrigir))
      assert.equal(new Set(itens.map(q=>q.id)).size,itens.length)
    }
  }
})

test('IFPR reúne núcleo e idioma; ENEM não soma dois idiomas na mesma prova', () => {
  for(const ano of ['2019','2020','2023','2024']) {
    const prova = listarProvasCompletas(questoes).find(p=>p.banca==='IFPR'&&p.ano===ano)
    assert.ok(prova,ano); assert.equal(prova.totalOriginal,50)
  }
  const enem = listarProvasCompletas(questoes).find(p=>p.banca==='ENEM'&&p.ano==='2022'&&p.prova.includes('1º dia'))
  assert.ok(enem); assert.equal(enem.totalOriginal,90)
  assert.equal(questoesDaProva(questoes,enem.id).filter(q=>q.idioma==='Inglês').length,5)
  assert.ok(!questoesDaProva(questoes,enem.id).some(q=>q.idioma==='Espanhol'))
})

test('treinos têm 40 IDs únicos, dez de cada matéria, sem alterar as questões', () => {
  const original = JSON.stringify(questoes)
  for(let n=0;n<6;n++) {
    const treino=gerarTreinoCpor(questoes)
    assert.equal(treino.length,40)
    assert.equal(new Set(treino.map(q=>q.id)).size,40)
    for(const materia of MATERIAS_TREINO_CPOR) assert.equal(treino.filter(q=>q.materia===materia).length,10,materia)
    assert.ok(treino.every(q=>!q.anulada && !q.prova_incompleta && [4,5].includes(q.opcoes.length) && !['somatoria','certo_errado'].includes(q.tipo_resposta)))
  }
  assert.equal(JSON.stringify(questoes),original)
  assert.notDeepEqual(gerarTreinoCpor(questoes,()=>0).map(q=>q.id),gerarTreinoCpor(questoes,()=>0.9).map(q=>q.id))
})

test('gerador bloqueia lotes incompletos e prioriza CPOR/NPOR sem repetir IDs', () => {
  const insuficientes=questoes.filter(q=>q.materia==='Matemática')
  assert.equal(disponibilidadeTreinoCpor(insuficientes).pronto,false)
  assert.deepEqual(gerarTreinoCpor(insuficientes),[])
  const base=gerarTreinoCpor(questoes)
  const prioritarias=base.map(q=>({...q,id:'prioritaria-'+q.id,banca:'CPOR'}))
  const treino=gerarTreinoCpor([...questoes,...prioritarias,...prioritarias])
  assert.equal(treino.length,40)
  assert.ok(treino.every(q=>q.banca==='CPOR'))
})
