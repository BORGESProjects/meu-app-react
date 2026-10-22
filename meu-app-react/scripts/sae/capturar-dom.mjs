// Executada pelo leitor autorizado, apenas sobre elementos renderizados do capítulo.
export function capturarCapituloDom(main) {
  const visivel = n => n.nodeType === 1 && n.getClientRects().length > 0
    && !n.closest('[hidden],script,style,template')
  function ler(n) {
    if (n.nodeType === 3) return n.textContent
    if (!visivel(n) || /^(SCRIPT|STYLE|TEMPLATE|BUTTON)$/u.test(n.tagName)) return null
    if (n.tagName === 'INPUT') return n.type === 'text' ? { tag: 'lacuna', children: ['________'] } : null
    if (n.tagName === 'TEXTAREA') return { tag: 'resposta-livre', children: [] }
    if (n.tagName.toLowerCase() === 'svg') return { tag: 'svg', html: n.outerHTML, children: [] }
    const attrs = Object.fromEntries(['id', 'class', 'style', 'href', 'src', 'alt', 'colspan', 'rowspan', 'display', 'mathvariant']
      .filter(k => n.hasAttribute(k)).map(k => [k, k === 'src' && n.tagName === 'IMG' ? n.src : n.getAttribute(k)]))
    return { tag: n.tagName.toLowerCase(), attrs,
      escolha_unica: n.matches('p.alternativaLetra') && Boolean(n.querySelector('input[type="radio"]')),
      children: [...n.childNodes].map(ler).filter(v => v !== null) }
  }
  // Alguns livros repetem a classe do enunciado no link interno da mesma
  // questão. Contar somente o marcador externo, sem perder uma questão que
  // esteja dentro de um contêiner malformado cujo texto não comece por número.
  const marcadores = [...main.querySelectorAll('.enunciadoNumero')].filter(n => visivel(n) && !n.closest('.gabarito') && /^\s*\d+\s*[.)](?!\d)/u.test(n.innerText.replace(/^\s*Resolução\s*/iu, '')))
  const candidatos = new Set(marcadores)
  const inicios = marcadores.filter(n => {
    for (let pai = n.parentElement; pai && pai !== main; pai = pai.parentElement) if (candidatos.has(pai)) return false
    return true
  })
  // Fragmentos rasos evitam os limites de profundidade e de tamanho por string do transporte.
  const json = JSON.stringify({
    titulo_documento: main.ownerDocument.title,
    conteudo: ler(main),
    quantidade_inicios: inicios.length,
    imagens: [...main.querySelectorAll('img')].filter(visivel).map(n => ({ src: n.src, alt: n.alt, carregada: n.complete && n.naturalWidth > 0 })),
    respostas_destacadas: [...main.querySelectorAll('.respostaCerta')].filter(visivel).length,
    gabaritos_visiveis: [...main.querySelectorAll('.gabarito')].filter(n => visivel(n) && n.tagName !== 'BUTTON').length,
  })
  return { partes: json.match(/[\s\S]{1,60000}/gu) ?? [], caracteres: json.length }
}
