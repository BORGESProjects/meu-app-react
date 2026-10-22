import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {avancarFila} from './navegar-lotes.mjs'

test('vínculo de livro comprovadamente incorreto não é importado como outro conteúdo',async()=>{
 const outDir=await fs.mkdtemp(path.join(os.tmpdir(),'sae-fila-'))
 try{
  const falha={id:'capitulo',motivo:'Índice aponta para outro conteúdo.'}
  await fs.writeFile(path.join(outDir,'fila.json'),JSON.stringify({indisponiveis:{capitulo:falha}}))
  const r=await avancarFila({browser:{tabs:{list:async()=>[]}},materialTab:{},inventario:[{materia:'Matemática',grupo:'V2',capitulos:[{id:'capitulo',label:'Abrir Troncos e esfera Livro digital'}]}],outDir})
  assert.equal(r.estado,'inventario_extraido')
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(outDir,'fila.json'))).indisponiveis.capitulo,falha)
 }finally{
  assert.ok(path.resolve(outDir).startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(outDir).startsWith('sae-fila-'))
  await fs.rm(outDir,{recursive:true,force:true})
 }
})
