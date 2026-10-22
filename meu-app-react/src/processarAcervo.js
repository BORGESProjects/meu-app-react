// O worker recebe apenas questões públicas, nunca sessão ou dados de progresso.
export function criarProcessadorAcervo(criarWorker = () => new Worker(new URL('./acervo.worker.js', import.meta.url), {type: 'module'})) {
  let atual
  function cancelar() {
    if (!atual) return
    const anterior = atual
    atual = null
    clearTimeout(anterior.timer)
    anterior.worker.terminate()
    anterior.reject(new DOMException('Carregamento substituído', 'AbortError'))
  }
  function preparar(itens) {
    cancelar()
    return new Promise((resolve, reject) => {
      let worker
      try { worker = criarWorker() }
      catch { reject(new Error('Não foi possível iniciar o carregamento do acervo. Atualize o navegador e tente novamente.')); return }
      const job = {worker, reject}
      atual = job
      function terminar(erro, resultado) {
        if (atual !== job) return
        atual = null
        clearTimeout(job.timer)
        worker.terminate()
        if (erro) reject(erro)
        else resolve(resultado)
      }
      worker.onmessage = ({data}) => {
        if (data?.erro || !Array.isArray(data?.resultado?.questoes) || !Array.isArray(data?.resultado?.indice)) {
          terminar(new Error('Não foi possível organizar o acervo. Tente carregar novamente.'))
        } else terminar(null, data.resultado)
      }
      worker.onerror = () => terminar(new Error('O carregamento do acervo foi interrompido. Tente novamente.'))
      job.timer = setTimeout(() => terminar(new Error('O acervo demorou para carregar. Tente novamente.')), 90000)
      try { worker.postMessage(itens) }
      catch (erro) { terminar(erro) }
    })
  }
  return {preparar, cancelar}
}
