import {cp, mkdir, readdir, copyFile} from 'node:fs/promises'
const destino = new URL('../public/leitura-editais/',import.meta.url)
await mkdir(new URL('core/',destino),{recursive:true})
await copyFile(new URL('../node_modules/tesseract.js/dist/worker.min.js',import.meta.url),new URL('worker.min.js',destino))
for (const nome of await readdir(new URL('../node_modules/tesseract.js-core/',import.meta.url))) {
  if (nome.endsWith('.wasm.js')) await copyFile(new URL('../node_modules/tesseract.js-core/'+nome,import.meta.url),new URL('core/'+nome,destino))
}
for (const nome of ['cmaps','standard_fonts','wasm']) {
  await cp(new URL('../node_modules/pdfjs-dist/'+nome,import.meta.url),new URL('pdf/'+nome,destino),{recursive:true})
}
console.log('Recursos locais de PDF e OCR preparados.')
