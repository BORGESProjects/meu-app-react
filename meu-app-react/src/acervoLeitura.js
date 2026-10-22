import {fixarQuestaoParaLeitura} from './acervo.js'

// A validação recebida do worker é confirmada em pequenos intervalos. Assim
// o primeiro acesso a Simulados não precisa revalidar 25 mil objetos na tela.
export async function conferirAcervoParaLeitura(questoes, {ativo = () => true,
  ceder = () => new Promise(resolve => setTimeout(resolve, 0)), intervalo = 8} = {}) {
  let inicio = performance.now()
  for (const q of questoes) {
    if (!ativo()) throw new DOMException('Carregamento substituído', 'AbortError')
    fixarQuestaoParaLeitura(q)
    if (performance.now() - inicio >= intervalo) {
      await ceder()
      inicio = performance.now()
    }
  }
  if (!ativo()) throw new DOMException('Carregamento substituído', 'AbortError')
  return questoes
}
