export function destinoApiPermitido(endereco) {
  try {const u=new URL(endereco);return u.origin==='https://aprovado-api.onrender.com' && u.pathname.startsWith('/api/') && !u.username && !u.password}
  catch {return false}
}
export async function transportarApi(endereco,opcoes,{nativo=false,web=fetch,carregar=()=>import('@tauri-apps/plugin-http')}={}) {
  if(!nativo)return web(endereco,opcoes)
  if(!destinoApiPermitido(endereco))throw Error('Destino da API não autorizado no aplicativo.')
  const {fetch:requisitar}=await carregar()
  return requisitar(endereco,{...opcoes,maxRedirections:0})
}
