export function capturarLayout(main) {
  const doc = main.ownerDocument
  const visivel = n => n.getClientRects().length > 0 && !n.closest('[hidden],.gabarito')
  const rect = n => {
    const r = n.getBoundingClientRect()
    return { x: r.x + doc.documentElement.scrollLeft, y: r.y + doc.documentElement.scrollTop, largura: r.width, altura: r.height }
  }
  const todos = [...main.querySelectorAll('*')]
  const posicoes = new Map(todos.map((n, i) => [n, i]))
  const inicios = todos.filter(n => n.matches('.enunciadoNumero') && visivel(n) && /^\s*\d+\s*[.)](?!\d)/u.test(n.innerText.replace(/^\s*Resolução\s*/iu, '')))
  const alternativas = todos.filter(n => n.matches('p.alternativaLetra') && visivel(n))
  const secoes = todos.filter(n => n.matches('h1,h2,h3,h4') && visivel(n) && /^(?:FIXAR|Interação|Sistematização|Enem e vestibulares(?:\s*\+\s*Desafio)?)$/iu.test(n.innerText.trim()))
  const controles = todos.filter(n => n.matches('a,button') && n.getClientRects().length && /Acessar (?:Gabarito|Solucionário)|ativar o Gabarito/iu.test(n.innerText))
  const depois = (a, b) => posicoes.get(a) < posicoes.get(b)
  const largura = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth)
  const altura = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight)
  const exercicios = inicios.map((inicio, i) => {
    const proximo = inicios[i + 1]
    const limites = [...secoes, ...controles].filter(n => depois(inicio, n) && (!proximo || depois(n, proximo)))
    const fimY = Math.min(proximo ? rect(proximo).y : altura, ...limites.map(n => rect(n).y))
    const candidatas = alternativas.filter(n => depois(inicio, n) && (!proximo || depois(n, proximo)) && rect(n).y < fimY)
    const objetivas = candidatas.filter(n => n.querySelector('input[type="radio"]'))
    let inicioY = rect(inicio).y
    const secao = secoes.filter(n => depois(n, inicio)).at(-1)
    if (secao && (!inicios[i - 1] || depois(inicios[i - 1], secao))) {
      const apoioAnterior = todos.filter(n => n.tagName === 'FIGURE' && visivel(n) && depois(secao, n) && depois(n, inicio))
      inicioY = Math.min(inicioY, ...apoioAnterior.map(n => rect(n).y))
    }
    const enunciadoFim = objetivas.length ? rect(objetivas[0]).y : fimY
    return {
      ordem: i, numero: Number(inicio.innerText.replace(/^\s*Resolução\s*/iu, '').match(/^\s*(\d+)\s*[.)]/u)?.[1]),
      enunciado: { x: 0, y: Math.max(0, inicioY - 3), largura, altura: Math.max(1, enunciadoFim - inicioY - 2) },
      alternativas: objetivas.map((n, j) => ({
        rotulo: n.innerText.match(/^\s*([a-e])\)/iu)?.[1]?.toUpperCase() ?? null,
        x: 0, y: rect(n).y - 2, largura,
        altura: Math.max(1, (objetivas[j + 1] ? rect(objetivas[j + 1]).y : fimY) - rect(n).y - 2),
      })),
    }
  })
  return { largura, altura, exercicios,
    imagens_nao_carregadas: [...main.querySelectorAll('img')].filter(n => visivel(n) && (!n.complete || n.naturalWidth === 0)).map(n => n.src) }
}
