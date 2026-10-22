import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabaseClient'
import { focoDaConta, salvarFocoConta, estadoPertenceAConta } from './preferenciaFoco'
import { validarFoco } from './focoEstudo'
import {aplicativoNativo} from './plataforma'
export function useFocoEstudo(session) {
  const id=session?.user?.id, atual=useRef(id)
  useEffect(()=>{atual.current=id},[id])
  const [estado,setEstado]=useState(null)
  const propria=estadoPertenceAConta(estado,id)
  let local=null
  try {if(aplicativoNativo && id)local=JSON.parse(localStorage.getItem(`ap-aprovado:foco:${id}`))}catch{ /* Preferência padrão continua disponível. */ }
  const foco=propria ? estado.foco : local?.foco || focoDaConta(session)
  useEffect(()=>{
    if(!aplicativoNativo || !id)return
    const enviar=async()=>{
      try {
        const chave=`ap-aprovado:foco:${id}`,salvo=JSON.parse(localStorage.getItem(chave))
        if(!salvo?.pendente||!navigator.onLine)return
        await salvarFocoConta(supabase,id,salvo.foco)
        if(JSON.parse(localStorage.getItem(chave))?.foco===salvo.foco)localStorage.setItem(chave,JSON.stringify({...salvo,pendente:false}))
      }catch{ /* Fica na fila desta conta. */ }
    }
    void enviar();window.addEventListener('online',enviar);return()=>window.removeEventListener('online',enviar)
  },[id])
  async function escolher(valor) {
    if(!id || (propria && estado.salvando)) return
    setEstado({userId:id,foco:valor,salvando:true,erro:''})
    try {
      if(aplicativoNativo) {
        localStorage.setItem(`ap-aprovado:foco:${id}`,JSON.stringify({foco:valor,pendente:true}))
        if(!navigator.onLine) {setEstado({userId:id,foco:valor,salvando:false,erro:''});return}
      }
      await salvarFocoConta(supabase,id,valor)
      if(aplicativoNativo)localStorage.setItem(`ap-aprovado:foco:${id}`,JSON.stringify({foco:valor,pendente:false}))
      if(atual.current===id) setEstado({userId:id,foco:valor,salvando:false,erro:''})
    } catch(e) { if(atual.current===id) setEstado({userId:id,foco:valor,salvando:false,erro:e.message}) }
  }
  return {foco,escolher,salvando:propria && estado.salvando,erro:propria ? estado.erro : '',
    salvo:propria ? !estado.salvando && !estado.erro : Boolean(session?.user?.user_metadata?.foco_estudo && validarFoco(session.user.user_metadata.foco_estudo)===session.user.user_metadata.foco_estudo)}
}
