import {useEffect, useMemo, useSyncExternalStore} from 'react'
import {supabase} from './supabaseClient'
import {criarControleProgresso, criarRepositorioProgresso} from './progressoUsuario'
import {aplicativoNativo} from './plataforma'

const storageSeguro = {
  get length(){return window.localStorage.length},
  key:i=>window.localStorage.key(i), getItem:k=>window.localStorage.getItem(k),
  setItem:(k,v)=>window.localStorage.setItem(k,v),removeItem:k=>window.localStorage.removeItem(k),
}
export function useProgressoUsuario(userId, dependencias) {
  const controle = useMemo(()=>criarControleProgresso({userId:userId || 'sem-conta',
    repositorio:dependencias?.repositorio || criarRepositorioProgresso(supabase),storage:dependencias?.storage || storageSeguro,permitirInicioLocal:aplicativoNativo}),[userId,dependencias])
  const estado = useSyncExternalStore(controle.subscribe,controle.getSnapshot)
  useEffect(()=>{
    if (!userId) return
    controle.iniciar()
    const voltar = ()=>{if (!document.hidden) controle.tentar()}
    const outraAba = evento=>{if (evento.key?.startsWith(`ap-aprovado:progresso:${userId}:op:`)) voltar()}
    window.addEventListener('online',voltar)
    window.addEventListener('focus',voltar)
    window.addEventListener('storage',outraAba)
    document.addEventListener('visibilitychange',voltar)
    return ()=>{
      controle.parar()
      window.removeEventListener('online',voltar)
      window.removeEventListener('focus',voltar)
      window.removeEventListener('storage',outraAba)
      document.removeEventListener('visibilitychange',voltar)
    }
  },[userId,controle])
  return {...estado,
    setHorasEstudo:valor=>controle.mudar('horas_estudo',valor),
    setHistoricoRespostas:valor=>controle.mudar('historico_respostas',valor),
    setTarefas:valor=>controle.mudar('tarefas',valor),tentarNovamente:controle.tentar,
  }
}
