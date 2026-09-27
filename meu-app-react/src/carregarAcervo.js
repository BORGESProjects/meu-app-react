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
