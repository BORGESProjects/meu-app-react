// Só repetir leituras: cadastrar ou publicar nunca deve ser repetido automaticamente.
export async function tentarLeitura(ler, esperar = ms => new Promise(resolve => setTimeout(resolve, ms))) {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try { return await ler() }
    catch (erro) {
      if (tentativa === 2) throw erro
      await esperar(1500 * (tentativa + 1))
    }
  }
}

// Mostra um primeiro conjunto de questões antes de esperar por todo o acervo.
// As promessas já estão em andamento; o restante continua carregando em paralelo.
export async function carregarEmEtapas(fontes, aoCarregarEstaticas) {
  const completo = Promise.allSettled(fontes)
  const primeiraEtapa = await Promise.allSettled(fontes.slice(2, 14))
  await aoCarregarEstaticas?.(primeiraEtapa)
  return completo
}
