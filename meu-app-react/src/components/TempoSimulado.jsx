import {useEffect,useState} from 'react'
export default function TempoSimulado({inicio,respondidas,total}) {
  const [agora,setAgora]=useState(()=>Date.now())
  useEffect(()=>{
    const atualizar=()=>setAgora(Date.now()), timer=setInterval(atualizar,1000)
    document.addEventListener('visibilitychange',atualizar)
    return ()=>{clearInterval(timer);document.removeEventListener('visibilitychange',atualizar)}
  },[inicio])
  const segundos=Math.max(0,Math.floor((agora-inicio)/1000)), minutos=Math.floor(segundos/60)
  return <div className="flex flex-wrap justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm"><span>{respondidas} de {total} respondidas</span><span>Tempo decorrido: {String(Math.floor(minutos/60)).padStart(2,'0')}:{String(minutos%60).padStart(2,'0')}:{String(segundos%60).padStart(2,'0')}</span><p className="w-full text-xs text-slate-400">O tempo inclui os intervalos fora da página. O resultado aparece apenas ao entregar.</p></div>
}
