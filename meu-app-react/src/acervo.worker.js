import {prepararAcervo} from './prepararAcervo.js'

self.onmessage = ({data}) => {
  try { self.postMessage({resultado: prepararAcervo(data)}) }
  catch { self.postMessage({erro: 'Não foi possível organizar o acervo. Tente carregar novamente.'}) }
}
