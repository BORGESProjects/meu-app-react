export const TAGS_BLOCOS = new Set(['p','span','strong','em','u','sub','sup','br','figure','figcaption','img','table','thead','tbody','tr','td','th','ul','ol','li'])
export function imagemBlocoValida(src) {
 return typeof src==='string' && /^\/acervo\/estudo-[a-z0-9-]+\/[a-f0-9]{20}\.(?:jpg|jpeg|png|webp)$/.test(src)
}
export function blocosValidos(blocos) {
 let total=0
 function validar(n,nivel=0){
  if(++total>2500||nivel>25)return false
  if(typeof n==='string')return n.length<=20000
  if(!n||!TAGS_BLOCOS.has(n.tag)||!Array.isArray(n.children))return false
  if(n.tag==='img'&&!imagemBlocoValida(n.src))return false
  if(n.colSpan!==undefined&&(!Number.isInteger(n.colSpan)||n.colSpan<1||n.colSpan>20))return false
  if(n.rowSpan!==undefined&&(!Number.isInteger(n.rowSpan)||n.rowSpan<1||n.rowSpan>30))return false
  return n.children.every(c=>validar(c,nivel+1))
 }
 return Array.isArray(blocos)&&blocos.length>0&&blocos.every(n=>validar(n))
}
export function temApoioEmBlocos(blocos) {
 if(!blocosValidos(blocos))return false
 const tem=n=>typeof n!=='string'&&(['img','table'].includes(n.tag)||n.children.some(tem))
 return blocos.some(tem)
}
