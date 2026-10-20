import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabaseClient'
import { focoDaConta, salvarFocoConta, estadoPertenceAConta } from './preferenciaFoco'
import { validarFoco } from './focoEstudo'
export function useFocoEstudo(session) {
  const id=session?.user?.id, atual=useRef(id)
  useEffect(()=>{atual.current=id},[id])
  const [estado,setEstado]=useState(null)
  const propria=estadoPertenceAConta(estado,id)
  const foco=propria ? estado.foco : focoDaConta(session)
  async function escolher(valor) {
    if(!id || (propria && estado.salvando)) return
    setEstado({userId:id,foco:valor,salvando:true,erro:''})
    try {
      await salvarFocoConta(supabase,id,valor)
      if(atual.current===id) setEstado({userId:id,foco:valor,salvando:false,erro:''})
    } catch(e) { if(atual.current===id) setEstado({userId:id,foco:valor,salvando:false,erro:e.message}) }
  }
  return {foco,escolher,salvando:propria && estado.salvando,erro:propria ? estado.erro : '',
    salvo:propria ? !estado.salvando && !estado.erro : Boolean(session?.user?.user_metadata?.foco_estudo && validarFoco(session.user.user_metadata.foco_estudo)===session.user.user_metadata.foco_estudo)}
}
