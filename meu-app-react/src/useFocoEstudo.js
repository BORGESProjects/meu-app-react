import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabaseClient'
import { focoDaConta, salvarFocoConta } from './preferenciaFoco'
import { validarFoco } from './focoEstudo'
export function useFocoEstudo(session) {
  const id=session?.user?.id, atual=useRef(id)
  useEffect(()=>{atual.current=id},[id])
  const [estado,setEstado]=useState(null)
  const foco=estado?.userId===id ? estado.foco : focoDaConta(session)
  async function escolher(valor) {
    if(!id || (estado?.userId===id && estado.salvando)) return
    setEstado({userId:id,foco:valor,salvando:true,erro:''})
    try {
      await salvarFocoConta(supabase,id,valor)
      if(atual.current===id) setEstado({userId:id,foco:valor,salvando:false,erro:''})
    } catch(e) { if(atual.current===id) setEstado({userId:id,foco:valor,salvando:false,erro:e.message}) }
  }
  return {foco,escolher,salvando:estado?.userId===id && estado.salvando,erro:estado?.userId===id ? estado.erro : '',
    salvo:estado?.userId===id ? !estado.salvando && !estado.erro : Boolean(session?.user?.user_metadata?.foco_estudo && validarFoco(session.user.user_metadata.foco_estudo)===session.user.user_metadata.foco_estudo)}
}
