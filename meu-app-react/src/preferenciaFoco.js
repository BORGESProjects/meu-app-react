import { validarFoco } from './focoEstudo.js'
export function estadoPertenceAConta(estado, userId) { return Boolean(userId && estado?.userId === userId) }
export function focoDaConta(session) { return validarFoco(session?.user?.user_metadata?.foco_estudo) }
export async function salvarFocoConta(client, userId, foco) {
  if (!userId || validarFoco(foco)!==foco) throw new Error('Escolha um foco válido.')
  const {data: atual,error: erroSessao}=await client.auth.getUser()
  if(erroSessao || atual?.user?.id !== userId) throw new Error('Entre novamente para salvar sua preferência.')
  const {data,error}=await client.auth.updateUser({data:{foco_estudo:foco}})
  if(error || data?.user?.id !== userId) throw new Error('Não foi possível salvar o foco na conta. Tente novamente.')
  return foco
}
