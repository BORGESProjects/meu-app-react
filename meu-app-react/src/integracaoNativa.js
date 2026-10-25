import {aplicativoNativo,recursoLocal} from './plataforma'
export function iniciarIntegracaoNativa() {
  if (!aplicativoNativo) return
  const informar = erro => window.dispatchEvent(new CustomEvent('erro-nativo',{detail:erro?.message || 'Não foi possível abrir o arquivo.'}))
  const clickAnterior = HTMLAnchorElement.prototype.click
  async function abrir(a) {
    if (a.download && a.href.startsWith('blob:')) {
      const bytes = new Uint8Array(await (await fetch(a.href)).arrayBuffer())
      const [{save},{writeFile}] = await Promise.all([import('@tauri-apps/plugin-dialog'),import('@tauri-apps/plugin-fs')])
      const destino = await save({defaultPath:a.download.replace(/[\\/]/g,'-')})
      if (destino) await writeFile(destino,bytes)
      return
    }
    const url = new URL(a.href,location.href)
    if(url.origin === location.origin && /\.pdf$/iu.test(url.pathname)) {
      const {openUrl}=await import('@tauri-apps/plugin-opener')
      await openUrl('https://apaprovado.vercel.app'+url.pathname+url.search+url.hash);return
    }
    if (url.origin !== location.origin && ['https:','http:'].includes(url.protocol)) {
      const {openUrl} = await import('@tauri-apps/plugin-opener');await openUrl(url.href);return
    }
    if (/\.(?:png|jpe?g|webp|gif)(?:$|[?#])/iu.test(url.href)) {
      const d = document.createElement('dialog'), imagem = document.createElement('img'), fechar = document.createElement('button')
      d.style.cssText='width:96vw;max-width:1200px;max-height:94vh;background:#0a0d09;color:white;padding:16px;border-radius:12px'
      fechar.textContent='Fechar imagem';fechar.onclick=()=>d.close();imagem.src=recursoLocal(url.pathname);imagem.style.cssText='display:block;max-width:100%;height:auto;margin:12px auto'
      d.append(fechar,imagem);d.onclose=()=>d.remove();document.body.append(d);d.showModal();return
    }
    if (url.origin === location.origin) location.assign(url.href)
  }
  const interceptar = a => (a.download && a.href.startsWith('blob:')) || a.target === '_blank' || (a.href.startsWith('https:') && new URL(a.href).origin !== location.origin)
  HTMLAnchorElement.prototype.click = function() {
    if (interceptar(this)) {void abrir(this).catch(informar);return}
    clickAnterior.call(this)
  }
  document.addEventListener('click',e=>{
    const a = e.target.closest?.('a')
    if (!a || e.defaultPrevented || !interceptar(a)) return
    e.preventDefault();void abrir(a).catch(informar)
  })
}

