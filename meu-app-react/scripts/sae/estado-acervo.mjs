import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

export function consolidarEstado(inventario,capitulos,auditorias,indisponiveis=[]){
 const publicadas=new Set(auditorias.flatMap(a=>a.publicados||[]))
 const separadas=new Set(auditorias.flatMap(a=>(a.quarentena||[]).map(q=>q.id)))
 const duplicadas=new Set(auditorias.flatMap(a=>(a.duplicatas||[]).map(q=>q.id)))
 const porId=new Map(capitulos.map(c=>[c.id_capitulo,c]))
 const linhas=inventario.flatMap(g=>g.capitulos.map(ref=>{
  const c=porId.get(ref.id),qs=c?.questoes||[]
  const publicadasCap=qs.filter(q=>publicadas.has(q.id)).length
  const quarentena=qs.filter(q=>separadas.has(q.id)).length
  const duplicatas=qs.filter(q=>duplicadas.has(q.id)).length
  return {materia:g.materia,grupo:g.grupo,id:ref.id,capitulo:c?.capitulo||ref.label.replace(/^Abrir /u,'').replace(/ Livro digital$/u,''),capturado:Boolean(c),registros:qs.length,com_gabarito:qs.filter(q=>q.resposta_correta!==null).length,publicadas:publicadasCap,quarentena,duplicatas,revisao_pendente:qs.length-publicadasCap-quarentena-duplicatas,imagens_pendentes:c?.imagens_pendentes?.length||0,recuperar_recursos:Boolean(c?.captura_visual&&!c.arquivos?.some(a=>a.tipo==='image'||a.tipo==='stylesheet'))}
 }))
 const materias=[...new Set(linhas.map(c=>c.materia))].map(m=>{
  const cs=linhas.filter(c=>c.materia===m)
  return {materia:m,capitulos:cs.length,capturados:cs.filter(c=>c.capturado).length,registros:cs.reduce((s,c)=>s+c.registros,0),publicadas:cs.reduce((s,c)=>s+c.publicadas,0),quarentena:cs.reduce((s,c)=>s+c.quarentena,0),duplicatas:cs.reduce((s,c)=>s+c.duplicatas,0),revisao_pendente:cs.reduce((s,c)=>s+c.revisao_pendente,0)}
 })
 for(const linha of linhas){const falha=indisponiveis.find(p=>p.id===linha.id);if(falha)linha.indisponibilidade= falha}
 const inventarioProcessado=linhas.every(c=>c.capturado||c.indisponibilidade)
 return {escopo:'Todos os volumes e frentes de Química, Biologia, Física, Matemática, História, Geografia e Português',concluido:linhas.every(c=>c.capturado&&!c.recuperar_recursos&&c.revisao_pendente===0&&c.quarentena===0&&c.imagens_pendentes===0),inventario_processado:inventarioProcessado,triagem_concluida:inventarioProcessado&&linhas.every(c=>c.revisao_pendente===0),materias,capitulos:linhas}
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const raiz='tmp/sae-importacao'
 const inventario=JSON.parse(fs.readFileSync(raiz+'/inventario.json','utf8'))
 const capitulos=fs.readdirSync(raiz+'/capitulos').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(raiz+'/capitulos/'+f,'utf8')))
 const auditorias=fs.readdirSync('docs/acervo').filter(f=>/^estudo-[a-z0-9-]+\.json$/u.test(f)).map(f=>JSON.parse(fs.readFileSync('docs/acervo/'+f,'utf8')))
 const falhas='docs/acervo/pendencias-livros.json'
 const estado=consolidarEstado(inventario,capitulos,auditorias,fs.existsSync(falhas)?JSON.parse(fs.readFileSync(falhas,'utf8')):[])
 fs.writeFileSync('docs/acervo/estado-importacao-livros.json',JSON.stringify(estado,null,2)+'\n')
 console.log(JSON.stringify({concluido:estado.concluido,materias:estado.materias}))
}
