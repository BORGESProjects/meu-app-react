import {recursoLocal} from '../plataforma'
import {createElement} from 'react'
import {blocosValidos} from '../blocosQuestao'
export default function BlocosQuestao({blocos,inline=false}) {
 if(!blocosValidos(blocos))return null
 function renderizar(n,i){
  if(typeof n==='string')return n
  const props={key:i}
  const classes={p:'my-3 leading-relaxed',em:'italic',strong:'font-semibold',u:'underline',figure:'my-4',figcaption:'mt-2 text-xs text-slate-400',td:'border border-slate-600 p-2 align-top',th:'border border-slate-600 bg-slate-800 p-2 text-left',ul:'list-disc pl-5',ol:'list-decimal pl-5'}
  props.className=classes[n.tag]||undefined
  if(n.tag==='img')return <img key={i} src={recursoLocal(n.src)} alt={n.alt||'Figura da questão'} loading="lazy" className={n.inline?'inline-block h-auto w-auto max-w-full align-middle bg-white':'mx-auto h-auto w-auto max-w-full rounded-lg bg-white'}/>
  if(n.tag==='math'){props.display=n.display||'inline';props.className='text-lg'}
  if(n.mathvariant)props.mathvariant=n.mathvariant
  if(n.colSpan)props.colSpan=n.colSpan
  if(n.rowSpan)props.rowSpan=n.rowSpan
  if(n.enfase==='italico')props.className=(props.className||'')+' italic'
  if(n.enfase==='sublinhado')props.className=(props.className||'')+' underline'
  const filhos=n.children.map(renderizar)
  if(n.tag==='math')return <span key={i} className="inline-block max-w-full overflow-x-auto overflow-y-hidden py-1 align-middle">{createElement('math',props,filhos)}</span>
  if(n.tag==='table')return <div key={i} className="my-4 max-w-full overflow-x-auto"><table className="w-full border-collapse text-sm">{filhos}</table></div>
  return createElement(n.tag,props,n.tag==='br'?undefined:filhos)
 }
 return createElement(inline?'span':'div',{className:'min-w-0 break-words text-base leading-relaxed'},blocos.map(renderizar))
}
