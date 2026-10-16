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

// As fontes estáticas não precisam esperar o servidor da API acordar.
// A ordem original é mantida para a mesma precedência na deduplicação.
export async function carregarEmEtapas(fontes, aoCarregarEstaticas) {
  const completo = Promise.allSettled(fontes)
  const estaticas = await Promise.allSettled(fontes.slice(2))
  aoCarregarEstaticas(estaticas)
  return completo
}
