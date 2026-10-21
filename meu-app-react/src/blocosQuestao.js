export const TAGS_MATEMATICAS = new Set(['math','mrow','mi','mn','mo','mtext','mfrac','msqrt','mroot','msup','msub','msubsup','mover','munder','munderover','mtable','mtr','mtd','mstyle'])
export const TAGS_BLOCOS = new Set(['p','span','strong','em','u','sub','sup','br','figure','figcaption','img','table','thead','tbody','tr','td','th','ul','ol','li',...TAGS_MATEMATICAS])
export const VARIANTES_MATEMATICAS = new Set(['normal','bold','italic','bold-italic','double-struck','bold-fraktur','script','bold-script','fraktur','sans-serif','bold-sans-serif','sans-serif-italic','sans-serif-bold-italic','monospace'])
export function imagemBlocoValida(src) {
 return typeof src==='string' && /^\/acervo\/estudo-[a-z0-9-]+\/[a-f0-9]{20}\.(?:jpg|jpeg|png|webp)$/.test(src)
}
export function blocosValidos(blocos) {
 let total=0
 function validar(n,nivel=0,emMatematica=false){
  if(++total>2500||nivel>25)return false
  if(typeof n==='string')return n.length<=20000
  if(!n||!TAGS_BLOCOS.has(n.tag)||!Array.isArray(n.children))return false
  if(emMatematica&&!TAGS_MATEMATICAS.has(n.tag))return false
  if(!emMatematica&&TAGS_MATEMATICAS.has(n.tag)&&n.tag!=='math')return false
  if(n.display!==undefined&&!['inline','block'].includes(n.display))return false
  if(n.mathvariant!==undefined&&!VARIANTES_MATEMATICAS.has(n.mathvariant))return false
  if(n.inline!==undefined&&(n.tag!=='img'||typeof n.inline!=='boolean'))return false
  const aridade={mfrac:2,mroot:2,msup:2,msub:2,msubsup:3,mover:2,munder:2,munderover:3}[n.tag]
  if(aridade&&n.children.filter(c=>typeof c!=='string'||c.trim()).length!==aridade)return false
  if(n.tag==='img'&&!imagemBlocoValida(n.src))return false
  if(n.colSpan!==undefined&&(!Number.isInteger(n.colSpan)||n.colSpan<1||n.colSpan>20))return false
  if(n.rowSpan!==undefined&&(!Number.isInteger(n.rowSpan)||n.rowSpan<1||n.rowSpan>30))return false
  return n.children.every(c=>validar(c,nivel+1,emMatematica||n.tag==='math'))
 }
 return Array.isArray(blocos)&&blocos.length>0&&blocos.every(n=>validar(n))
}
export function temApoioEmBlocos(blocos) {
 if(!blocosValidos(blocos))return false
 const tem=n=>typeof n!=='string'&&(['img','table'].includes(n.tag)||n.children.some(tem))
 return blocos.some(tem)
}

// Texto auxiliar igual não torna duas fórmulas ou figuras equivalentes.
export function assinaturaVisualBlocos(questao) {
 const relevantes=[]
 const canonico=n=>typeof n==='string'?n.replace(/\s+/gu,' ').trim():{tag:n.tag,...(n.src?{imagem:n.src.match(/([a-f0-9]{20})\.(?:png|jpe?g|webp)$/u)?.[1]||n.src}:{}),...(n.colSpan?{colSpan:n.colSpan}:{}),...(n.rowSpan?{rowSpan:n.rowSpan}:{}),...(n.mathvariant?{mathvariant:n.mathvariant}:{}),children:(n.children||[]).map(canonico)}
 const visitar=n=>{if(!n||typeof n==='string')return;if(['math','img','table'].includes(n.tag)){relevantes.push(canonico(n));return}(n.children||[]).forEach(visitar)}
 for(const b of [questao.blocos_enunciado,...(questao.blocos_opcoes||[])])if(blocosValidos(b))b.forEach(visitar)
 return relevantes.length?JSON.stringify(relevantes):''
}
