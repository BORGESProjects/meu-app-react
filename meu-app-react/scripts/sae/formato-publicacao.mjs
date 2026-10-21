import {TAGS_BLOCOS,VARIANTES_MATEMATICAS} from '../../src/blocosQuestao.js'
export const textoBruto=n=>typeof n==='string'?n:(n?.children||[]).map(textoBruto).join('')
export const limparTexto=t=>t.replace(/\s+/g,' ').trim()
export function normalizarBlocos(originais,copiarImagem,{alternativa=false}={}) {
 let primeiro=true
 function converter(n){
  if(typeof n==='string'){
   let t=n.replace(/\s+/gu,' ')
   if(primeiro&&t.trim()){t=t.replace(/^\s*(?:C?\d+\s*:\s*H\d+\s*)+/iu,'');primeiro=false}
   return t
  }
  if(!n)return null
  const texto=textoBruto(n).trim(),classe=n.attrs?.class||''
  if(n.tag==='img'&&classe.split(/\s+/).includes('qrQuestoes'))return null
  if(n.tag==='p'&&/^(?:Acertos|Erros|Pontuação Final):\s*-?\d+$/iu.test(texto)&&(n.children||[]).some(c=>typeof c!=='string'&&/(?:^|\s)(?:certas|erradas|pontFinal)(?:\s|$)/u.test(c.attrs?.class||'')))return null
  if(n.tag==='mjx-container'){
   const formulas=[]
   const buscar=o=>{if(!o||typeof o==='string')return;if(o.tag==='math'){formulas.push(o);return}(o.children||[]).forEach(buscar)}
   buscar(n)
   if(formulas.length!==1)throw Error('MathJax sem fórmula semântica única')
   return converter(formulas[0])
  }
  // Colunas vazias especificam só a largura; a estrutura semântica está nas células.
  if(n.tag==='colgroup'&&(n.children||[]).every(c=>typeof c==='string'?!c.trim():c.tag==='col'&&!(c.children||[]).length))return null
  if(n.tag==='label'||classe.split(/\s+/).includes('numeracao')||n.tag==='a'&&texto==='Resolução'||alternativa&&n.tag==='span'&&/^[a-e]\)$/iu.test(texto))return null
  if(['script','style','svg'].includes(n.tag))throw Error('Fórmula ou bloco exige conferência visual específica')
  const tag=n.tag==='a'||n.tag==='lacuna'?'span':n.tag==='i'?'em':n.tag==='b'?'strong':/^h[1-6]$/.test(n.tag)?'strong':n.tag==='div'?'p':n.tag
  if(!TAGS_BLOCOS.has(tag))throw Error('Elemento não preservado: '+tag)
  if(tag==='img')return {tag:'img',src:copiarImagem(n.attrs.src),alt:n.attrs.alt||'Figura da questão',...(classe.split(/\s+/).includes('fracao')?{inline:true}:{}),children:[]}
  const children=(n.children||[]).map(converter).filter(c=>c!==null && (!['table','thead','tbody','tr'].includes(tag)||typeof c!=='string'||c.trim()))
  if(children.every(c=>typeof c==='string'&&!c.trim())&&!['img','br'].includes(tag))return null
  const novo={tag,children}
  if(['inline','block'].includes(n.attrs?.display))novo.display=n.attrs.display
  if(VARIANTES_MATEMATICAS.has(n.attrs?.mathvariant))novo.mathvariant=n.attrs.mathvariant
  for(const [orig,dest] of [['colspan','colSpan'],['rowspan','rowSpan']])if(n.attrs?.[orig])novo[dest]=Number(n.attrs[orig])
  if(/font-style\s*:\s*italic/iu.test(n.attrs?.style||''))novo.enfase='italico'
  if(/text-decoration\s*:\s*underline/iu.test(n.attrs?.style||''))novo.enfase='sublinhado'
  return novo
 }
 const resultado=originais.map(converter).filter(n=>n!==null)
 return alternativa?resultado.flatMap(n=>typeof n!=='string'&&n.tag==='p'?n.children:n):resultado
}
export function textoDosBlocos(blocos){
 const ler=n=>typeof n==='string'?n:n.tag==='img'?'':n.tag==='br'?'\n':(n.children||[]).map(ler).join('')+(['p','li','tr','figure'].includes(n.tag)?'\n\n':'')
 return blocos.map(ler).join('').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim()
}
