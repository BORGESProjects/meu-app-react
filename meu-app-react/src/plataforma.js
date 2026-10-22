export const aplicativoNativo = import.meta.env?.VITE_APP_NATIVE === 'true'
let mapaRecursos = Object.create(null)
let recursosInstalados = new Set()
export function configurarRecursos(mapa,recursos=[]) {mapaRecursos = mapa || Object.create(null);recursosInstalados=new Set(recursos.map(r=>r.url))}
export function resolverRecurso(url,{nativo=aplicativoNativo,mapa=mapaRecursos,locais=recursosInstalados}={}) {
  if(!nativo)return url
  if(mapa[url] || locais.has(url))return mapa[url] || url
  // Questões publicadas depois da edição instalada continuam disponíveis online.
  if(typeof url==='string' && url.startsWith('/acervo/'))return 'https://apaprovado.vercel.app'+url
  if(typeof url==='string' && url.startsWith('/api/'))return 'https://aprovado-api.onrender.com'+url
  return url
}
export const recursoLocal = url=>resolverRecurso(url)
export async function carregarAcervoInstalado(requisitar = fetch) {
  const [m,q] = await Promise.all([requisitar('/offline/manifesto.json'),requisitar('/offline/questoes.json')])
  if (!m.ok || !q.ok) throw Error('Não foi possível abrir o acervo instalado.')
  const manifesto = await m.json(), bytes = await q.arrayBuffer()
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('')
  if (manifesto.versao !== 1 || hash !== manifesto.sha256) throw Error('O acervo instalado não passou na verificação de integridade.')
  const questoes = JSON.parse(new TextDecoder().decode(bytes))
  if (!Array.isArray(questoes) || questoes.length !== manifesto.questoes) throw Error('O acervo instalado está incompleto.')
  configurarRecursos(manifesto.mapa,manifesto.recursos)
  return {questoes,manifesto}
}
const chaveConta = 'ap-aprovado:conta-offline:v1'
export function lembrarConta(session, storage = localStorage) {
  if (!session?.user?.id || session.offline) return
  // A identificação offline não inclui senha nem token e nunca concede acesso administrativo.
  storage.setItem(chaveConta,JSON.stringify({user:{id:session.user.id,email:session.user.email,user_metadata:{foco_estudo:session.user.user_metadata?.foco_estudo}}}))
}
export function contaOffline(storage = localStorage) {
  try { const c = JSON.parse(storage.getItem(chaveConta)); return c?.user?.id ? {...c,offline:true,access_token:''} : null }
  catch { return null }
}
export function esquecerConta(storage = localStorage) { storage.removeItem(chaveConta) }
