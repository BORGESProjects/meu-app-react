import {prepararAcervo} from './prepararAcervo.js'
import {prepararBasesFiltro} from './indiceFiltros.js'

self.onmessage = ({data}) => {
  try {
    const resultado = prepararAcervo(data)
    const opcoesBase = prepararBasesFiltro(resultado.indice)
    self.postMessage({resultado, opcoesBase})
  }
  catch { self.postMessage({erro: 'Não foi possível organizar o acervo. Tente carregar novamente.'}) }
}
