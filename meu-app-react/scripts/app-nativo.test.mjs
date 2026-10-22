import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import {sha256,raiz,caminhoPublico,recursosQuestoes} from './empacotar-acervo.mjs'
import {carregarAcervoInstalado,lembrarConta,contaOffline,esquecerConta} from '../src/plataforma.js'
import {criarEditaisOffline} from '../src/editaisOffline.js'
import {criarControleProgresso} from '../src/progressoUsuario.js'
import {unirQuestoes} from '../src/acervo.js'
function storage() {
  const dados=new Map()
  return {getItem:k=>dados.get(k)||null,setItem:(k,v)=>dados.set(k,v),removeItem:k=>dados.delete(k),key:i=>[...dados.keys()][i],get length(){return dados.size}}
}
test('o pacote contém as mesmas 25.495 questões válidas, sem duplicação',async()=>{
  const bytes=await fs.readFile(path.join(raiz,'native/acervo/questoes.json')),m=JSON.parse(await fs.readFile(path.join(raiz,'native/acervo/manifesto.json')))
  assert.equal(sha256(bytes),m.sha256)
  const q=JSON.parse(bytes);assert.equal(q.length,25495);assert.equal(new Set(q.map(x=>String(x.id))).size,25495)
  assert.equal(unirQuestoes(q).length,25495)
  assert.ok(m.recursos.length>38000)
  for(const url of recursosQuestoes(q))assert.ok(url.startsWith('/acervo/') || m.mapa[url],url)
})
test('cada figura incluída é local e corresponde ao hash conferido',async()=>{
  const m=JSON.parse(await fs.readFile(path.join(raiz,'native/acervo/manifesto.json')))
  let tamanho=0
  for(const r of m.recursos) {
    const p=r.url.startsWith('/native-media/')?path.join(raiz,'native/media',path.basename(r.url)):caminhoPublico(r.url)
    const bytes=await fs.readFile(p);assert.equal(bytes.length,r.bytes,r.url);assert.equal(sha256(bytes),r.sha256,r.url);tamanho+=bytes.length
  }
  assert.equal(tamanho,m.bytesImagens)
})
test('o carregamento rejeita pacote adulterado ou contagem divergente',async()=>{
  const bytes=new TextEncoder().encode('[{"id":"exemplo"}]')
  const m={versao:1,questoes:1,sha256:sha256(bytes)}
  const requisitar=async url=>new Response(url.endsWith('manifesto.json')?JSON.stringify(m):bytes)
  assert.equal((await carregarAcervoInstalado(requisitar)).questoes.length,1)
  m.questoes=2;await assert.rejects(carregarAcervoInstalado(requisitar),/incompleto/)
  m.sha256='alterado';await assert.rejects(carregarAcervoInstalado(requisitar),/integridade/)
})
test('a conta offline não ganha token ou privilégios e sair remove a identificação',()=>{
  const s=storage();lembrarConta({access_token:'nao-copiar',user:{id:'a',email:'a@example.test',app_metadata:{role:'admin'},user_metadata:{foco_estudo:'vestibulares',role:'admin'}}},s)
  assert.equal(contaOffline(s).user.id,'a');assert.equal(contaOffline(s).access_token,'');assert.equal(contaOffline(s).offline,true)
  assert.equal(JSON.stringify(contaOffline(s)).includes('admin'),false)
  lembrarConta({user:{id:'b',email:'b@example.test'}},s);assert.equal(contaOffline(s).user.id,'b')
  esquecerConta(s);assert.equal(contaOffline(s),null)
})
test('caminhos de imagens não escapam do diretório público',()=>{
  for(const u of ['/acervo/../../.env','/acervo/%2e%2e/%2e%2e/.env','/acervo/a\\..\\.env','https://externo.test/foto.png'])assert.throws(()=>caminhoPublico(u))
})
test('progresso criado offline sobrevive à reabertura e se soma ao remoto',async()=>{
  const s=storage(),dados={horas_estudo:[],historico_respostas:[{id:'remoto'}],tarefas:[],updated_at:'2026-01-01T00:00:00Z'}
  let online=false
  const repo={ler:async()=>{if(!online)throw Error('offline');return dados},gravar:async(_id,_anterior,novo)=>Object.assign(dados,novo)}
  const deps={userId:'a',storage:s,repositorio:repo,permitirInicioLocal:true,agendar:()=>1,cancelar:()=>{}}
  const a=criarControleProgresso(deps);a.mudar('historico_respostas',[{id:'local',acertou:true}])
  const b=criarControleProgresso(deps);assert.equal(b.getSnapshot().dados.historico_respostas[0].id,'local')
  online=true;b.iniciar();await new Promise(r=>setTimeout(r,20));b.parar()
  assert.deepEqual(new Set(dados.historico_respostas.map(r=>r.id)),new Set(['local','remoto']))
  assert.equal(criarControleProgresso({...deps,userId:'b'}).getSnapshot().dados.historico_respostas.length,0)
})
function bancoEditais() {
  const rows=new Map();let conflito=false
  return {rows,setConflito:v=>{conflito=v},client:{from:()=>{
    let modo='ler',payload,filtros=[]
    const q={select:()=>q,order:()=>q,abortSignal:()=>q,eq:(k,v)=>{filtros.push([k,v]);return q},insert:p=>{modo='novo';payload=p;return q},update:p=>{modo='editar';payload=p;return q},
      maybeSingle:async()=>{
        if(conflito)return {data:null,error:null}
        const id=payload.id||filtros.find(([k])=>k==='id')[1],anterior=rows.get(id)
        if(modo==='editar'&&filtros.some(([k,v])=>anterior?.[k]!==v))return {data:null}
        const row={...anterior,...payload,id};rows.set(id,row);return {data:row}
      },then:resolve=>resolve({data:[...rows.values()].filter(r=>filtros.every(([k,v])=>r[k]===v))})}
    return q
  }}}
}
test('editais criados e alterados offline persistem, sincronizam e isolam contas',async()=>{
  const s=storage(),b=bancoEditais();let online=false
  const deps={client:b.client,userId:'a',storage:s,online:()=>online}
  const a=criarEditaisOffline(deps),edital={id:'edital-1',titulo:'CPOR',edicao:'2026',unidade:'SP',materias:[]}
  await a.gravar(edital,true);const recuperado=criarEditaisOffline(deps)
  assert.equal((await recuperado.listar()).rows.length,1)
  assert.equal((await criarEditaisOffline({...deps,userId:'b'}).listar()).rows.length,0)
  online=true;const lista=await recuperado.listar();assert.equal(lista.aviso,'');assert.equal(b.rows.size,1)
  online=false;await a.gravar({...lista.rows[0],titulo:'CPOR atualizado'},false)
  online=true;await a.listar();assert.equal(b.rows.get(edital.id).titulo,'CPOR atualizado')
})
test('conflito de edital mantém a cópia local e não altera a versão remota',async()=>{
  const s=storage(),b=bancoEditais();let online=false
  const repo=criarEditaisOffline({client:b.client,userId:'a',storage:s,online:()=>online})
  await repo.gravar({id:'e',titulo:'Meu edital',edicao:'',unidade:'',materias:[]},true)
  online=true;b.setConflito(true)
  const resultado=await repo.listar();assert.equal(resultado.rows[0].titulo,'Meu edital');assert.match(resultado.aviso,/pendentes/);assert.equal(b.rows.size,0)
})
test('permissões nativas não autorizam arquivos arbitrários ou shell',async()=>{
  const c=JSON.parse(await fs.readFile(path.join(raiz,'src-tauri/capabilities/default.json'))),t=JSON.stringify(c)
  assert.ok(!/shell|allow-execute|fs:default|\$HOME|\*\*/u.test(t))
  assert.ok(c.permissions.includes('dialog:allow-save'));assert.ok(c.permissions.includes('fs:allow-write-file'))
  assert.equal(c.remote,undefined)
})
