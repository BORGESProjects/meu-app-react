export function resumirProgresso(dados = {}) {
  const respostas = Array.isArray(dados.historico_respostas) ? dados.historico_respostas : []
  const tentativas = respostas.filter(item => typeof item?.acertou === 'boolean')
  const acertos = tentativas.filter(item => item.acertou).length
  const erros = tentativas.length - acertos
  const horas = Array.isArray(dados.horas_estudo) ? dados.horas_estudo : []
  const segundosEstudo = horas.reduce((total, item) => {
    const segundos = Number(item?.segundos)
    const horasRegistradas = Number(item?.horas)
    const valor = Number.isFinite(segundos) && segundos > 0
      ? segundos
      : Number.isFinite(horasRegistradas) && horasRegistradas > 0 ? horasRegistradas * 3600 : 0
    return total + valor
  }, 0)
  return {
    questoesRespondidas: tentativas.length,
    acertos,
    erros,
    percentualAcerto: tentativas.length ? Math.round(acertos * 100 / tentativas.length) : 0,
    segundosEstudo: Math.floor(segundosEstudo),
  }
}

export function formatarDuracao(segundos = 0) {
  const total = Math.max(0, Math.floor(Number(segundos) || 0))
  const horas = Math.floor(total / 3600)
  const minutos = Math.floor((total % 3600) / 60)
  if (horas && minutos) return `${horas}h ${minutos}min`
  if (horas) return `${horas}h`
  return `${minutos}min`
}
