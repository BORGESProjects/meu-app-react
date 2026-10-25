import {useEffect,useState} from 'react'
import {aplicativoNativo} from '../plataforma'
export default function EstadoAplicativo() {
  const [online,setOnline] = useState(navigator.onLine),[erro,setErro] = useState('')
  useEffect(()=>{
    const atualizar=()=>setOnline(navigator.onLine), avisar=e=>setErro(e.detail)
    window.addEventListener('online',atualizar);window.addEventListener('offline',atualizar);window.addEventListener('erro-nativo',avisar)
    return ()=>{window.removeEventListener('online',atualizar);window.removeEventListener('offline',atualizar);window.removeEventListener('erro-nativo',avisar)}
  },[])
  if (!aplicativoNativo) return null
  return <aside className="px-4 py-2 text-sm bg-slate-900 border-b border-slate-700" aria-live="polite">
    <span>{online ? 'Aplicativo · questões no aparelho; imagens carregadas sob demanda.' : 'Sem conexão · questões em texto, simulados e progresso disponíveis. Imagens, sincronização e IA aguardam internet.'}</span>
    {erro && <p role="alert" className="mt-2 text-amber-300">{erro} <button className="underline" onClick={()=>setErro('')}>Fechar</button></p>}
  </aside>
}

