import {getDocument, GlobalWorkerOptions} from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import {linhasPdf,identificarMateria} from './editalPdf'
GlobalWorkerOptions.workerSrc=workerUrl
const recurso='/leitura-editais/'
async function cancelavel(promise,signal) {
  if(signal.aborted)throw new DOMException('Cancelado','AbortError')
  let cancelar
  const aborto=new Promise((_,reject)=>{cancelar=()=>reject(new DOMException('Cancelado','AbortError'));signal.addEventListener('abort',cancelar,{once:true})})
  try{return await Promise.race([promise,aborto])}finally{signal.removeEventListener('abort',cancelar)}
}
function divisorDeColunas(canvas) {
  const {width,height}=canvas, pixels=canvas.getContext('2d').getImageData(0,0,width,height).data
  let melhor=0,divisor=0
  for(let x=Math.floor(width*.42);x<width*.58;x+=2){let pretos=0,total=0
    for(let y=0;y<height;y+=4){const i=(y*width+x)*4;if(pixels[i]+pixels[i+1]+pixels[i+2]<380)pretos++;total++}
    if(pretos/total>melhor){melhor=pretos/total;divisor=x}
  }
  return melhor>.35 ? divisor : null
}

export async function abrirPdfEdital(file, signal, progresso) {
  if(file.size>20*1024*1024)throw new Error('O PDF deve ter até 20 MB. Separe apenas o edital ou o anexo de conteúdos.')
  const buffer=await file.arrayBuffer()
  if(!new TextDecoder().decode(buffer.slice(0,1024)).includes('%PDF-'))throw new Error('Selecione um arquivo PDF válido.')
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(b=>b.toString(16).padStart(2,'0')).join('')
  const loading=getDocument({data:new Uint8Array(buffer),isEvalSupported:false,enableXfa:false,
    cMapUrl:recurso+'pdf/cmaps/',cMapPacked:true,standardFontDataUrl:recurso+'pdf/standard_fonts/',wasmUrl:recurso+'pdf/wasm/'})
  const cancelar=()=>{void loading.destroy()}
  signal.addEventListener('abort',cancelar,{once:true})
  let doc
  try {
    doc=await loading.promise
    if(doc.numPages>300)throw new Error('O documento tem mais de 300 páginas. Envie apenas o edital ou seu anexo de conteúdos.')
    const paginas=[]
    for(let i=1;i<=doc.numPages;i++){
      if(signal.aborted)throw new DOMException('Cancelado','AbortError')
      progresso(`Lendo página ${i} de ${doc.numPages}`,i/doc.numPages)
      const page=await doc.getPage(i), viewport=page.getViewport({scale:1})
      const texto=await page.getTextContent()
      const layout=linhasPdf(texto.items,viewport.width,viewport.height)
      const conteudo=layout.linhas.map(l=>l.texto).join('\n')
      const suspeita=/�|\(cid:\d+\)/u.test(conteudo) || (conteudo.match(/[\p{L}]/gu)||[]).length<100
      paginas.push({numero:i,...layout,ocr:false,precisaOcr:suspeita})
      page.cleanup()
    }
    return {doc,paginas,nome:file.name,hash,fechar:()=>loading.destroy()}
  }catch(e){await loading.destroy();if(signal.aborted)throw new DOMException('Cancelado','AbortError');if(e.name==='PasswordException')throw new Error('Este PDF pede senha. Envie uma cópia sem proteção.');throw e}
  finally {signal.removeEventListener('abort',cancelar)}
}

export async function imagemPagina(doc,numero,largura=1300) {
  const page=await doc.getPage(numero), base=page.getViewport({scale:1})
  const escala=Math.min(largura/base.width,Math.sqrt(6000000/(base.width*base.height)))
  const viewport=page.getViewport({scale:escala}),canvas=document.createElement('canvas')
  canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height)
  await page.render({canvasContext:canvas.getContext('2d'),viewport,background:'rgb(255,255,255)'}).promise
  return canvas
}

export async function reconhecerPaginas(pdf,inicio,fim,usarOcr,signal,progresso,forcar=false) {
  const selecionadas=pdf.paginas.filter(p=>p.numero>=inicio && p.numero<=fim).map(p=>forcar ? {...p,precisaOcr:true} : p)
  const necessarias=selecionadas.filter(p=>p.precisaOcr)
  if(usarOcr && necessarias.length>20)throw new Error('Reconheça até 20 páginas digitalizadas por lote. Escolha as páginas do conteúdo programático e depois acrescente outros trechos.')
  let worker
  try{
    if(usarOcr && necessarias.length){
      progresso('Preparando a leitura de páginas digitalizadas…',0)
      const {createWorker}=await import('tesseract.js')
      worker=await cancelavel(createWorker('por',1,{workerPath:recurso+'worker.min.js',corePath:recurso+'core',langPath:recurso.slice(0,-1),gzip:false,workerBlobURL:false}).then(w=>{if(signal.aborted){void w.terminate();throw new DOMException('Cancelado','AbortError')}return w}),signal)
      if(signal.aborted)throw new DOMException('Cancelado','AbortError')
      signal.addEventListener('abort',cancelar,{once:true})
    }
    const resultado=[]
    for(let i=0;i<selecionadas.length;i++){
      if(signal.aborted)throw new DOMException('Cancelado','AbortError')
      const p=selecionadas[i]
      progresso(`${p.precisaOcr && worker ? 'Reconhecendo' : 'Organizando'} página ${p.numero}`,i/selecionadas.length)
      if(p.precisaOcr && worker){
        const canvas=await imagemPagina(pdf.doc,p.numero,2000)
        const divisor=divisorDeColunas(canvas) || (p.colunas ? Math.round(canvas.width/2) : null)
        if(divisor){
          await cancelavel(worker.setParameters({tessedit_pageseg_mode:6}),signal)
          const linhas=[],confiancas=[]
          let coluna=0
          for(const [left,width] of [[0,divisor],[divisor,canvas.width-divisor]]){
            await cancelavel(worker.setParameters({tessedit_pageseg_mode:6}),signal)
            const {data}=await cancelavel(worker.recognize(canvas,{rectangle:{left,top:0,width,height:canvas.height}}, {text:true,blocks:true}),signal)
            confiancas.push(data.confidence)
            const ls=(data.blocks || []).flatMap(b=>b.paragraphs.flatMap(par=>par.lines))
            const primeiro=ls.findIndex(l=>/^\d{1,3}(?:\.\d{1,3})*(?:\s*[.)–-]\s*|\s+)\D/u.test(l.text.trim()))
            const nativo=p.colunas ? p.linhas.filter(l=>l.coluna===coluna+1).map(l=>identificarMateria(l.texto)).find(Boolean) : null
            let nome=ls.map(l=>identificarMateria(l.text.replace(/[|]/g,''))).find(Boolean) || nativo
            if(!nome && primeiro>=0){
              await cancelavel(worker.setParameters({tessedit_pageseg_mode:11}),signal)
              const header=await cancelavel(worker.recognize(canvas,{rectangle:{left,top:0,width,height:Math.max(1,ls[primeiro].bbox.y0)}},{text:true}),signal)
              nome=header.data.text.split(/\r?\n/).map(identificarMateria).find(Boolean)
            }
            coluna++
            linhas.push({texto:nome || `Matéria a conferir — coluna ${coluna}`,materia:nome || `Matéria a conferir — coluna ${coluna}`,y:0,altura:canvas.height,fonte:12})
            for(const l of (primeiro>=0 ? ls.slice(primeiro) : ls)){
              const texto=l.text.replace(/^[|\s]+|[|\s]+$/g,'').trim()
              if(l.bbox.y1>canvas.height*.94 && /^(?:[-–]?\s*\d|e\s*\d)/iu.test(texto))continue
              if(texto)linhas.push({texto,y:l.bbox.y1,altura:canvas.height,fonte:l.bbox.y1-l.bbox.y0})
            }
          }
          resultado.push({...p,linhas,colunas:true,ocr:true,confianca:confiancas.reduce((a,b)=>a+b,0)/confiancas.length})
          canvas.width=canvas.height=0;continue
        }
        await cancelavel(worker.setParameters({tessedit_pageseg_mode:3}),signal)
        const {data}=await cancelavel(worker.recognize(canvas,{}, {text:true,blocks:true}),signal)
        const words=(data.blocks || []).flatMap(b=>b.paragraphs.flatMap(par=>par.lines.flatMap(l=>l.words.map(w=>({...w,baseline:l.bbox.y1,altura:l.bbox.y1-l.bbox.y0})))))
        const layout=words.length ? linhasPdf(words.map(w=>({str:w.text,width:w.bbox.x1-w.bbox.x0,height:w.altura,transform:[1,0,0,w.altura,w.bbox.x0,canvas.height-w.baseline]})),canvas.width,canvas.height) : {linhas:data.text.split(/\r?\n/).map(texto=>({texto,y:0,altura:1,fonte:12})).filter(l=>l.texto.trim())}
        resultado.push({...p,...layout,ocr:true,confianca:data.confidence})
        canvas.width=canvas.height=0
      }else resultado.push(p)
    }
    return resultado
  }finally{signal.removeEventListener('abort',cancelar);if(worker){await worker.terminate();worker=null}}
  function cancelar(){if(worker){void worker.terminate();worker=null}}
}
