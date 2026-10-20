import test from 'node:test'
import assert from 'node:assert/strict'
import {FOCOS_ESTUDO,validarFoco,categoriaQuestao,pertenceAoFoco,gerarSimuladoPersonalizado,gerarTreinoVestibular,planoRevisao,ultimasTentativas,dataProximaRevisao,materiaCanonica,AREAS_VESTIBULAR} from '../src/focoEstudo.js'
import {focoDaConta,salvarFocoConta,estadoPertenceAConta} from '../src/preferenciaFoco.js'
const DIA=86400000, agora=Date.parse('2026-10-20T12:00:00Z')
function questao(id,materia='Matemática',banca='UFPR') {return {id,materia,banca,conteudo:'Conteúdo '+id,concurso:banca+' 2025',enunciado:'Uma pergunta íntegra para praticar conhecimentos e encontrar a resposta correta.',opcoes:['Primeira opção','Segunda opção','Terceira opção','Quarta opção','Quinta opção'],resposta_correta:1}}
const materias=['Português','Geografia','História','Matemática','Física','Química','Biologia','Inglês']
const pool=materias.flatMap(m=>Array.from({length:30},(_,i)=>questao(m+'-'+i,m)))
const tentativa=(q,acertou,dias,id)=>({id,questaoId:q.id,acertou,respondidaEm:new Date(agora-dias*DIA).toISOString()})

test('quatro perfis explícitos, sem preferência como padrão seguro',()=>{
  assert.equal(FOCOS_ESTUDO.length,4);assert.equal(validarFoco('valor inválido'),'sem-preferencia')
  assert.equal(focoDaConta(null),'sem-preferencia')
  assert.equal(focoDaConta({user:{user_metadata:{foco_estudo:'vestibulares'}}}),'vestibulares')
  for(const banca of ['CPOR','NPOR/PR','ESA','EsPCEx','CFN','PMPR']) assert.equal(categoriaQuestao(questao('a','História',banca)),'militares',banca)
  for(const banca of ['UFPR','UTFPR','ENEM','UFRGS','UEM','PUC-PR','UFSC','UEPG','UNIVALI']) assert.equal(categoriaQuestao(questao('a','História',banca)),'vestibulares',banca)
  for(const banca of ['PF','PRF','CEBRASPE']) assert.equal(categoriaQuestao(questao('a','História',banca)),'concursos',banca)
})
test('sem preferência não exclui instituições nem apaga o acervo',()=>{
  const q=questao('desconhecida','Física','Instituição desconhecida')
  assert.equal(pertenceAoFoco(q,'sem-preferencia'),true)
  assert.equal(pertenceAoFoco(q,'vestibulares'),false)
  assert.equal(pertenceAoFoco(questao('a','Física','Questões de assimilação'),'militares',true),true)
  assert.equal(pertenceAoFoco(questao('a','Física','Questões de assimilação'),'militares'),false)
  assert.equal(pertenceAoFoco(questao('a','Física','PF'),'vestibulares'),false)
})
test('personalização mantém cota por matéria, IDs únicos, gabaritos e banco escolhido',()=>{
  const entrada=[...pool,...pool,...materias.flatMap(m=>Array.from({length:30},(_,i)=>questao('pf-'+m+i,m,'PF')))]
  const original=JSON.stringify(entrada), ms=materias.slice(0,4)
  const {itens,erro}=gerarSimuladoPersonalizado(entrada,{foco:'vestibulares',banca:'UFPR',materias:ms,quantidade:40})
  assert.equal(erro,'');assert.equal(itens.length,40);assert.equal(new Set(itens.map(q=>q.id)).size,40)
  for(const m of ms) assert.equal(itens.filter(q=>q.materia===m).length,10)
  assert.ok(itens.every(q=>q.banca==='UFPR'&&q.resposta_correta===1));assert.equal(JSON.stringify(entrada),original)
})
test('treino por áreas de vestibular tem dez por área e nenhuma questão militar',()=>{
  const itens=gerarTreinoVestibular([...pool,...pool.map(q=>({...q,id:'mil-'+q.id,banca:'CPOR'}))])
  assert.equal(itens.length,40);assert.equal(new Set(itens.map(q=>q.id)).size,40)
  for(const area of Object.values(AREAS_VESTIBULAR))assert.equal(itens.filter(q=>area.includes(materiaCanonica(q))).length,10)
  assert.ok(itens.every(q=>q.banca==='UFPR'))
  assert.deepEqual(gerarTreinoVestibular(pool.filter(q=>q.materia==='Matemática')),[])
})
test('não gera treino insuficiente, com gabarito ausente ou questão anulada',()=>{
  assert.ok(gerarSimuladoPersonalizado(pool,{quantidade:121}).erro)
  assert.ok(gerarSimuladoPersonalizado(pool,{quantidade:1,materias:['História','Geografia']}).erro)
  assert.ok(gerarSimuladoPersonalizado(pool,{quantidade:40,materias:['História']}).erro)
  const invalidas=pool.map(q=>({...q,anulada:true}))
  assert.ok(gerarSimuladoPersonalizado(invalidas,{quantidade:10}).erro)
  assert.ok(gerarSimuladoPersonalizado(pool.map(q=>({...q,resposta_correta:null})),{quantidade:10}).erro)
})
test('inéditas exclui questões já respondidas, sem confundir IDs numéricos e texto',()=>{
  const q=questao('123'), outra=questao('outra')
  const historico=[tentativa({...q,id:123},false,2,'h')]
  assert.deepEqual(gerarSimuladoPersonalizado([q,outra],{quantidade:1,modo:'ineditas',historico,agora}).itens.map(q=>q.id),['outra'])
})
test('caderno usa última tentativa por data; acerto posterior resolve erro antigo',()=>{
  const q=pool[0],h1=tentativa(q,false,5,'h1'),h2=tentativa(q,true,1,'h2')
  assert.equal(planoRevisao([q],[h2,h1],agora).erros.length,0)
  assert.equal(planoRevisao([q],[h1,h2,h1],agora).ultimas.get(q.id).id,'h2')
  assert.equal(planoRevisao([q],[h2,tentativa(q,false,0.5,'h3')],agora).erros.length,1)
  assert.equal(ultimasTentativas([{...h1,respondidaEm:'invalid'},{...h1,respondidaEm:'2030-01-01'}],agora).size,0)
})
test('revisão não é adiantada e intervalos crescem só com acertos consecutivos',()=>{
  const q=pool[0],r=pool[1], h1=tentativa(q,false,0.5,'h1'),h2=tentativa(r,true,2,'h2')
  let plano=planoRevisao([q,r],[h1,h2],agora)
  assert.deepEqual(plano.vencidas.map(q=>q.id),[r.id]);assert.equal(plano.proxima,Date.parse(h1.respondidaEm)+DIA)
  const h3=tentativa(r,true,1,'h3'),ultimo=ultimasTentativas([h2,h3],agora).get(r.id)
  assert.equal(ultimo.sequencia,2);assert.equal(dataProximaRevisao(ultimo),Date.parse(h3.respondidaEm)+3*DIA)
  assert.equal(ultimasTentativas([h2,h3,h3],agora).get(r.id).sequencia,2)
  const treino=gerarSimuladoPersonalizado([q,r],{quantidade:1,modo:'revisao',historico:[h1,h2],agora})
  assert.deepEqual(treino.itens.map(q=>q.id),[r.id])
})
test('preferência é armazenada somente na conta autenticada, sem alterar credenciais',async()=>{
  let gravado
  const client={auth:{getUser:async()=>({data:{user:{id:'a'}}}),updateUser:async dados=>{gravado=dados;return {data:{user:{id:'a'}}}}}}
  assert.equal(await salvarFocoConta(client,'a','sem-preferencia'),'sem-preferencia')
  assert.deepEqual(gravado,{data:{foco_estudo:'sem-preferencia'}})
  await assert.rejects(salvarFocoConta(client,'b','vestibulares'),/Entre novamente/)
  await assert.rejects(salvarFocoConta(client,'a','inválido'),/válido/)
})
test('falha remota de preferência não é apresentada como salvamento confirmado',async()=>{
  const client={auth:{getUser:async()=>({data:{user:{id:'a'}}}),updateUser:async()=>({error:new Error('indisponível')})}}
  await assert.rejects(salvarFocoConta(client,'a','militares'),/Não foi possível salvar/)
})

test('inicialização sem sessão não confunde estado nulo com usuário indefinido',()=>{
  assert.equal(estadoPertenceAConta(null,undefined),false)
  assert.equal(estadoPertenceAConta(null,'a'),false)
  assert.equal(estadoPertenceAConta({userId:undefined},undefined),false)
  assert.equal(estadoPertenceAConta({userId:'a'},'b'),false)
  assert.equal(estadoPertenceAConta({userId:'a',foco:'vestibulares'},'a'),true)
})
