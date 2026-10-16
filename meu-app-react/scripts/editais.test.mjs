import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {lerConteudosEdital, acrescentarConteudos, alterarTopico, resumoEdital, topicoVisivel, identidadeEdital, copiarEditalAntigo} from '../src/editais.js'
let sequence=0
const id=()=>String(++sequence)
const base = [{id:'port',nome:'Português',topicos:[{id:'p1',titulo:'Concordância verbal',status:'concluido',prioridade:'alta',notas:'Revisão no sábado'}]},
  {id:'mat',nome:'Matemática',topicos:[{id:'m1',titulo:'Equações',status:'revisar',prioridade:'normal',notas:''}]}]

test('inclusão em lote não altera matérias, anotações nem progresso existente',()=>{
  const antes=JSON.stringify(base)
  const grupos=lerConteudosEdital('PORTUGUÊS:\n1. Concordância verbal\n2. Crase\n[Matemática]\nEquações; Funções\nHistória:\nBrasil Colônia')
  const result=acrescentarConteudos(base,grupos,id)
  assert.equal(result.adicionados,3)
  assert.equal(result.repetidos,2)
  assert.equal(JSON.stringify(base),antes)
  assert.deepEqual(result.materias[0].topicos[0],base[0].topicos[0])
  assert.deepEqual(result.materias[1].topicos[0],base[1].topicos[0])
  assert.equal(result.materias.length,3)
  assert.equal(result.materias[0].topicos[1].status,'pendente')
})
test('a alteração de um tópico não modifica outras matérias ou concursos',()=>{
  const resultado=alterarTopico(base,'port','p1',{status:'estudando'})
  assert.equal(resultado[0].topicos[0].status,'estudando')
  assert.equal(base[0].topicos[0].status,'concluido')
  assert.equal(resultado[1],base[1])
  assert.deepEqual(resumoEdital(base),{total:2,concluidos:1,revisar:1,estudando:0,percentual:50})
  assert.equal(resumoEdital([]).percentual,0)
})
test('parser aceita uma matéria ou várias, normaliza repetições sem apagar conteúdo',()=>{
  assert.deepEqual(lerConteudosEdital('1.1 Morfologia; Sintaxe\n• Crase','Português'),[{nome:'Português',topicos:['Morfologia','Sintaxe','Crase']}])
  assert.deepEqual(lerConteudosEdital('2024 e suas mudanças\n2 + 2 = 4','Matemática')[0].topicos,['2024 e suas mudanças','2 + 2 = 4'])
  assert.throws(()=>lerConteudosEdital('Crase\nPontuação'),/nome da matéria/)
  assert.throws(()=>lerConteudosEdital('Matemática:\n'),/pelo menos um/)
  const result=acrescentarConteudos([],lerConteudosEdital('Funções\nFUNÇÕES\nEquações','Matemática'),id)
  assert.equal(result.adicionados,2)
  assert.equal(result.repetidos,1)
  assert.notEqual(identidadeEdital('CPOR','2025','São Paulo'),identidadeEdital('CPOR','2026','São Paulo'))
  assert.equal(identidadeEdital(' CPOR ','2026','SÃO PAULO'),identidadeEdital('cpor','2026','são paulo'))
})
test('filtros consideram etapa, notas e prioridade sem modificar o progresso',()=>{
  assert.ok(topicoVisivel(base[0].topicos[0],'sabado','concluido','alta'))
  assert.equal(topicoVisivel(base[0].topicos[0],'','pendentes',''),false)
  assert.ok(topicoVisivel(base[1].topicos[0],'equacoes','revisar',''))
})
test('cópia de modelos compartilhados não modifica o original nem herda progresso alheio',()=>{
  const antigo=[{materia:'Português',conteudo:'Crase',concluido:true},{materia:'PORTUGUÊS',conteudo:'Crase',concluido:false}]
  const copia=copiarEditalAntigo(antigo,id)
  assert.equal(copia[0].topicos.length,1)
  assert.equal(copia[0].topicos[0].status,'pendente')
  assert.equal(antigo[0].concluido,true)
})
test('persistência é privada e não reutiliza tarefas, matérias compartilhadas ou progresso de terceiros',()=>{
  const sql=readFileSync(new URL('../backend/src/main/resources/acervo-security.sql',import.meta.url),'utf8')
  assert.match(sql,/ALTER TABLE public\.editais_usuario ENABLE ROW LEVEL SECURITY/)
  assert.match(sql,/REVOKE ALL ON TABLE public\.editais_usuario FROM authenticated/)
  for(const acao of ['select','insert','update','delete']) assert.match(sql,new RegExp(`CREATE POLICY editais_usuario_${acao}_own`))
  const component=readFileSync(new URL('../src/components/EditalPlanejador.jsx',import.meta.url),'utf8')
  assert.match(component,/\.eq\('id',edital.id\)\.eq\('user_id',userId\)\.eq\('updated_at',edital.updated_at\)/)
  assert.doesNotMatch(component,/method:\s*'(?:POST|PATCH|DELETE)'/)
})
