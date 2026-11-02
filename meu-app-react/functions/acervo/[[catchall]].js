const ORIGEM_ACERVO = 'https://apaprovado.vercel.app/acervo/'
const EXTENSOES_PERMITIDAS = /\.(?:json|webp|jpg|jpeg|png|pdf|md)$/i

export async function onRequest(context) {
  const {request, params} = context
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Método não permitido.', {status: 405, headers: {Allow: 'GET, HEAD'}})
  }

  const partes = Array.isArray(params.catchall) ? params.catchall : [params.catchall]
  if (!partes.length || partes.some(parte => !parte || parte === '.' || parte === '..' || parte.includes('\\'))) {
    return new Response('Arquivo não encontrado.', {status: 404})
  }
  const caminho = partes.join('/')
  if (!EXTENSOES_PERMITIDAS.test(caminho)) return new Response('Arquivo não encontrado.', {status: 404})

  const urlPedido = new URL(request.url)
  const chaveCache = new Request(urlPedido.toString(), {method: 'GET'})
  const cache = caches.default
  if (request.method === 'GET') {
    const guardado = await cache.match(chaveCache)
    if (guardado) return guardado
  }

  const urlOrigem = ORIGEM_ACERVO + partes.map(encodeURIComponent).join('/')
  let origem
  try {
    origem = await fetch(urlOrigem, {method: request.method, redirect: 'follow'})
  } catch {
    return new Response('Acervo temporariamente indisponível.', {status: 502})
  }

  const cabecalhos = new Headers(origem.headers)
  cabecalhos.delete('Set-Cookie')
  cabecalhos.set('Access-Control-Allow-Origin', '*')
  cabecalhos.set('X-Content-Type-Options', 'nosniff')
  if (origem.status === 200) {
    cabecalhos.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800')
  }
  const resposta = new Response(request.method === 'HEAD' ? null : origem.body, {
    status: origem.status,
    statusText: origem.statusText,
    headers: cabecalhos,
  })

  if (request.method === 'GET' && resposta.status === 200) {
    context.waitUntil(cache.put(chaveCache, resposta.clone()).catch(() => {}))
  }
  return resposta
}
