import fs from 'node:fs/promises'
import path from 'node:path'
import {coletarCapitulo} from './coletor.mjs'
import {avancarFila,relatorioProgresso} from './navegar-lotes.mjs'

// Executado apenas no navegador autorizado, com os identificadores de abas
// fornecidos pelo operador. Não faz requisições autenticadas fora do navegador.
export async function prepararCoordenacao({browser,outDir,materiais,coletor=coletarCapitulo,navegar=avancarFila}){
 const inventario=JSON.parse(await fs.readFile(path.join(outDir,'inventario.json'),'utf8'))
 const cacheRecursos=new Map(),codigos={}
 for(const nome of await fs.readdir(path.join(outDir,'capitulos'))){
  if(!nome.endsWith('.json'))continue
  let cap
  try{cap=JSON.parse(await fs.readFile(path.join(outDir,'capitulos',nome),'utf8'))}catch{continue}
  if(cap.url_conteudo)codigos[cap.materia]=new URL(cap.url_conteudo).pathname.split('/').at(-3)
  for(const ar of cap.arquivos||[])if(ar.url){try{await fs.access(path.resolve(outDir,ar.arquivo));cacheRecursos.set(ar.url,ar)}catch{ /* recurso pendente */ }}
 }
 const filas=[]
 for(const m of materiais){
  if(!inventario.some(g=>g.materia===m.materia)||!codigos[m.materia])throw Error('Matéria não inventariada: '+m.materia)
  filas.push({...m,slug:m.materia.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),tab:await browser.tabs.get(m.id),concluido:false})
 }
 const arquivo=path.join(outDir,'coordenacao.json')
 async function resumo(){
  const indisponiveis=[]
  for(const fila of filas){try{const e=JSON.parse(await fs.readFile(path.join(outDir,'fila-'+fila.slug+'.json'),'utf8'));indisponiveis.push(...Object.values(e.indisponiveis||{}))}catch{/* fila nova */}}
  const processadas=filas.every(f=>f.concluido)
  return {captura_concluida:processadas&&indisponiveis.length===0,filas_processadas:processadas,indisponiveis}
 }
 let indice=0
 try{const anterior=JSON.parse(await fs.readFile(arquivo,'utf8'));if(Number.isInteger(anterior.indice)&&anterior.indice>=0)indice=anterior.indice}catch{ /* início */ }
 const identificarLeitor=async(info,meta)=>{
  try{
   const tab=await browser.tabs.get(info.id),url=await tab.url(),codigo='/'+codigos[meta.materia]+'/'
   if(url.includes('/@mount/'))return url.includes(codigo)
   await tab.playwright.waitForLoadState({state:'domcontentloaded',timeoutMs:10000})
   const iframe=tab.playwright.locator('iframe[title="Conteúdo do capítulo"]')
   if(await iframe.count()!==1)return false
   const src=await iframe.getAttribute('src')
   return typeof src==='string'&&src.includes(codigo)
  }catch{return false}
 }
 async function rodada(passos=3){
  if(!Number.isInteger(passos)||passos<1||passos>6)throw Error('Limite da rodada inválido')
  const resultados=[]
  for(let i=0;i<passos;i++){
   const fila=filas[indice++%filas.length]
   if(fila.concluido)continue
   try{
    const r=await navegar({browser,materialTab:fila.tab,inventario:inventario.filter(g=>g.materia===fila.materia),outDir,arquivoEstado:'fila-'+fila.slug+'.json',coletor:args=>coletor({...args,modoVisual:'recursos',cacheRecursos}),identificarLeitor,atualizarProgresso:false,exigirRecursosOriginais:true})
    if(r.estado==='inventario_extraido')fila.concluido=true
    resultados.push({materia:fila.materia,capitulo:r.extraido?.capitulo||r.solicitado?.capitulo||r.capitulo,questoes:r.extraido?.questoes,gabaritos:r.extraido?.com_gabarito,imagens_pendentes:r.extraido?.imagens_pendentes,estado:r.estado,reutilizado:r.extraido?.reutilizado||false})
   }catch(e){resultados.push({materia:fila.materia,erro:String(e).slice(0,500)})}
   await fs.writeFile(arquivo,JSON.stringify({indice,filas:filas.map(f=>({materia:f.materia,id:f.id,concluido:f.concluido})),ultimo:resultados.at(-1)},null,2))
  }
  await relatorioProgresso(outDir)
  return {...await resumo(),resultados}
 }
 // Cada matéria tem uma aba e um arquivo de fila próprios. Executar no
 // máximo um passo de cada fila evita corridas no mesmo capítulo e permite
 // aguardar os recursos de livros diferentes ao mesmo tempo.
 async function rodadaCompleta(){
  const ativas=filas.filter(f=>!f.concluido)
  const resultados=await Promise.all(ativas.map(async fila=>{
   try{
    const r=await navegar({browser,materialTab:fila.tab,inventario:inventario.filter(g=>g.materia===fila.materia),outDir,arquivoEstado:'fila-'+fila.slug+'.json',coletor:args=>coletor({...args,modoVisual:'recursos',cacheRecursos}),identificarLeitor,atualizarProgresso:false,exigirRecursosOriginais:true})
    if(r.estado==='inventario_extraido')fila.concluido=true
    return {materia:fila.materia,capitulo:r.extraido?.capitulo||r.solicitado?.capitulo||r.capitulo,questoes:r.extraido?.questoes,gabaritos:r.extraido?.com_gabarito,imagens_pendentes:r.extraido?.imagens_pendentes,estado:r.estado,reutilizado:r.extraido?.reutilizado||false}
   }catch(e){return {materia:fila.materia,erro:String(e).slice(0,500)}}
  }))
  indice+=ativas.length
  await fs.writeFile(arquivo,JSON.stringify({indice,filas:filas.map(f=>({materia:f.materia,id:f.id,concluido:f.concluido})),ultimo:resultados},null,2))
  await relatorioProgresso(outDir)
  return {...await resumo(),resultados}
 }
 return {rodada,rodadaCompleta}
}
