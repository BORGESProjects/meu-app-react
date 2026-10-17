import test from 'node:test'
import assert from 'node:assert/strict'
import {aplicarOperacoes, criarControleProgresso, criarRepositorioProgresso, diferencaProgresso} from '../src/progressoUsuario.js'

const clone = x=>structuredClone(x)
const vazio = ()=>({horas_estudo:[],historico_respostas:[],tarefas:[],updated_at:'2026-10-17T12:00:00.000Z'})
class Storage {
  mapa=new Map()
  get length(){return this.mapa.size}
  key(i){return [...this.mapa.keys()][i]}
  getItem(k){return this.mapa.get(k) || null}
  setItem(k,v){this.mapa.set(k,v)}
  removeItem(k){this.mapa.delete(k)}
}
const esperar=async cond=>{for(let i=0;i<100;i++){if(cond())return;await new Promise(r=>setTimeout(r,2))}assert.fail('Estado esperado não foi atingido')}
function ambiente({storage=new Storage(),repositorio,userId='a'}={}) {
  let dados=vazio(),gravacoes=0,ids=0
  const repo=repositorio || {
    async ler(){return clone(dados)},
    async gravar(_user,anterior,novos){if(anterior?.updated_at!==dados.updated_at)return null;gravacoes++;dados={...clone(novos),updated_at:`versao-${gravacoes}`};return clone(dados)},
  }
  const jobs=new Map();let n=0
  const controle=criarControleProgresso({userId,repositorio:repo,storage,id:()=>`${userId}-op-${++ids}`,
    agendar:fn=>{jobs.set(++n,fn);return n},cancelar:id=>jobs.delete(id)})
  return {controle,repo,storage,jobs,remoto:()=>dados,gravacoes:()=>gravacoes,
    async iniciar(){controle.iniciar();await esperar(()=>controle.getSnapshot().status==='salvo')},
    async enviar(){controle.tentar();await esperar(()=>controle.getSnapshot().status==='salvo')},
  }
}
test('não grava arrays vazios ao entrar; preserva os dados existentes',async()=>{
  const a=ambiente();await a.iniciar()
  assert.equal(a.gravacoes(),0)
  assert.equal(a.controle.getSnapshot().carregado,true)
  a.controle.parar()
})
test('respostas e horas são protegidas imediatamente e recuperadas após sair antes do envio',async()=>{
  const a=ambiente();await a.iniciar()
  a.controle.mudar('historico_respostas',p=>[...p,{id:'q1',acertou:true}])
  a.controle.mudar('horas_estudo',p=>[...p,{id:'h1',horas:1/60}])
  a.controle.parar() // Simula fechar antes de o agendamento de rede ser executado.
  const b=ambiente({storage:a.storage,repositorio:a.repo})
  assert.equal(b.controle.getSnapshot().dados.historico_respostas.length,1)
  assert.equal(b.controle.getSnapshot().dados.horas_estudo.length,1)
  await b.iniciar()
  assert.equal(a.remoto().historico_respostas.length,1)
  assert.equal(a.remoto().horas_estudo[0].horas,1/60)
  assert.equal(b.controle.getSnapshot().pendentes,0)
  b.controle.parar()
})
test('falha de gravação conserva a fila; nova tentativa confirma e não duplica respostas',async()=>{
  const a=ambiente();await a.iniciar();const gravar=a.repo.gravar
  a.repo.gravar=async()=>{throw Error('offline')}
  a.controle.mudar('historico_respostas',p=>[...p,{id:'q1',acertou:false}])
  a.controle.tentar();await esperar(()=>a.controle.getSnapshot().status==='erro')
  assert.equal(a.controle.getSnapshot().pendentes,1)
  assert.equal(a.controle.getSnapshot().dados.historico_respostas.length,1)
  a.repo.gravar=gravar;await a.enviar();await a.enviar()
  assert.equal(a.remoto().historico_respostas.length,1)
  a.controle.parar()
})
test('resposta perdida após o banco gravar é reenviada sem contar duas vezes',async()=>{
  const a=ambiente();await a.iniciar();const gravar=a.repo.gravar;let falhar=true
  a.repo.gravar=async(...args)=>{const r=await gravar(...args);if(falhar){falhar=false;throw Error('resposta perdida')}return r}
  a.controle.mudar('horas_estudo',p=>[...p,{id:'h1',horas:0.5}])
  a.controle.tentar();await esperar(()=>a.controle.getSnapshot().status==='erro')
  await a.enviar()
  assert.equal(a.remoto().horas_estudo.length,1)
  assert.equal(a.remoto().horas_estudo[0].horas,0.5)
  a.controle.parar()
})
test('uma alteração durante a requisição não é marcada como já sincronizada',async()=>{
  const a=ambiente();await a.iniciar();const gravar=a.repo.gravar;let liberar
  a.repo.gravar=async(...args)=>{await new Promise(r=>{liberar=r});return gravar(...args)}
  a.controle.mudar('historico_respostas',p=>[...p,{id:'q1'}]);a.controle.tentar()
  await esperar(()=>liberar)
  a.controle.mudar('historico_respostas',p=>[...p,{id:'q2'}])
  liberar();await esperar(()=>a.controle.getSnapshot().status==='pendente' && a.controle.getSnapshot().pendentes===1)
  assert.equal(a.controle.getSnapshot().dados.historico_respostas.length,2)
  assert.equal(a.controle.getSnapshot().pendentes,1)
  a.repo.gravar=gravar;await a.enviar()
  assert.equal(a.remoto().historico_respostas.length,2)
  a.controle.parar()
})
test('duas abas com versões antigas não apagam as respostas uma da outra',async()=>{
  const a=ambiente(),b=ambiente({repositorio:a.repo,userId:'a'})
  // IDs de operações de abas reais são UUIDs distintos.
  await a.iniciar();await b.iniciar()
  a.controle.mudar('historico_respostas',p=>[...p,{id:'a-resposta'}])
  b.controle.mudar('horas_estudo',p=>[...p,{id:'b-hora',horas:1}])
  await Promise.all([a.enviar(),b.enviar()])
  assert.equal(a.remoto().historico_respostas.length,1)
  assert.equal(a.remoto().horas_estudo.length,1)
  a.controle.parar();b.controle.parar()
})
test('dados e pendências são isolados por conta e resposta antiga é ignorada ao sair',async()=>{
  const a=ambiente();await a.iniciar()
  a.controle.mudar('historico_respostas',p=>[...p,{id:'privada'}]);a.controle.parar()
  const b=ambiente({storage:a.storage,userId:'b'})
  assert.equal(b.controle.getSnapshot().dados.historico_respostas.length,0)
  assert.equal(b.controle.getSnapshot().pendentes,0)
  let liberar
  const c=ambiente({repositorio:{ler:()=>new Promise(r=>{liberar=r})}})
  c.controle.iniciar();c.controle.parar();liberar({...vazio(),historico_respostas:[{id:'antiga'}]})
  await new Promise(r=>setImmediate(r))
  assert.equal(c.controle.getSnapshot().dados.historico_respostas.length,0)
})
test('tarefas são atualizadas e excluídas sem apagar tarefas independentes',()=>{
  const anterior=[{id:'1',concluida:false},{id:'2',concluida:false}]
  const op=diferencaProgresso('tarefas',anterior,[{id:'1',concluida:true}])
  const r=aplicarOperacoes({tarefas:[...anterior,{id:'3',concluida:false}]},[op])
  assert.deepEqual(r.tarefas,[{id:'1',concluida:true},{id:'3',concluida:false}])
  assert.deepEqual(aplicarOperacoes(r,[op]),r)
})
test('falha de leitura não é apresentada como histórico vazio sincronizado',async()=>{
  const a=ambiente({repositorio:{async ler(){throw Error('rede')}}})
  a.controle.iniciar();await esperar(()=>a.controle.getSnapshot().status==='erro')
  assert.equal(a.controle.getSnapshot().carregado,false)
  a.controle.parar()
})
test('retentativa agendada reenvia automaticamente após a conexão voltar',async()=>{
  const a=ambiente();await a.iniciar();const gravar=a.repo.gravar
  a.repo.gravar=async()=>{throw Error('offline')}
  a.controle.mudar('historico_respostas',p=>[...p,{id:'q-retry'}])
  a.controle.tentar();await esperar(()=>a.controle.getSnapshot().status==='erro')
  a.repo.gravar=gravar
  const retentar=[...a.jobs.values()].at(-1);retentar()
  await esperar(()=>a.controle.getSnapshot().status==='salvo')
  assert.equal(a.remoto().historico_respostas.length,1)
  a.controle.parar()
})
test('armazenamento bloqueado sinaliza a limitação e mantém os dados na memória para envio',async()=>{
  const storage={get length(){throw Error('bloqueado')},getItem(){throw Error('bloqueado')},setItem(){throw Error('quota')},removeItem(){throw Error('bloqueado')}}
  const a=ambiente({storage});await a.iniciar()
  a.controle.mudar('horas_estudo',p=>[...p,{id:'h-memoria',horas:1}])
  assert.match(a.controle.getSnapshot().avisoLocal,/Não feche/)
  assert.equal(a.controle.getSnapshot().dados.horas_estudo.length,1)
  await a.enviar()
  assert.equal(a.remoto().horas_estudo.length,1)
  assert.equal(a.controle.getSnapshot().pendentes,0)
  a.controle.parar()
})
function clienteExpirado(falhaRenovar=false) {
  let chamadas=0,renovacoes=0;const filtros=[]
  const construtor={select(){return this},update(){return this},insert(){return this},eq(...args){filtros.push(args);return this},abortSignal(){return this},
    async maybeSingle(){chamadas++;return chamadas===1?{data:null,status:401,error:{code:'PGRST303',message:'JWT expired'}}:{data:vazio(),error:null,status:200}}}
  return {client:{from:()=>construtor,auth:{async refreshSession(){renovacoes++;return falhaRenovar?{error:Error('revogada')}:{data:{session:{user:{id:'a'}}}}}}},
    chamadas:()=>chamadas,renovacoes:()=>renovacoes,filtros}
}
test('JWT expirado é renovado antes de repetir a leitura da própria conta',async()=>{
  const c=clienteExpirado();const repo=criarRepositorioProgresso(c.client)
  assert.deepEqual(await repo.ler('a'),vazio())
  assert.equal(c.chamadas(),2)
  assert.equal(c.renovacoes(),1)
  assert.deepEqual(c.filtros,[['user_id','a'],['user_id','a']])
})
test('sessão revogada pede login e não trata a falha como progresso vazio',async()=>{
  const c=clienteExpirado(true)
  await assert.rejects(()=>criarRepositorioProgresso(c.client).ler('a'),erro=>erro.code==='AUTH_RELOGIN')
  assert.equal(c.chamadas(),1)
  assert.equal(c.renovacoes(),1)
})
test('JWT expirado durante a gravação renova a sessão e preserva os filtros de versão e proprietário',async()=>{
  const c=clienteExpirado();const anterior=vazio()
  assert.deepEqual(await criarRepositorioProgresso(c.client).gravar('a',anterior,anterior),anterior)
  assert.equal(c.renovacoes(),1)
  assert.deepEqual(c.filtros,[['user_id','a'],['updated_at',anterior.updated_at],['user_id','a'],['updated_at',anterior.updated_at]])
})
