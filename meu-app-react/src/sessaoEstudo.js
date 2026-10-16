export function segundosDaSessao(sessao, agora = Date.now()) {
  if (!sessao) return 0
  const ativo = sessao.inicio === null ? 0 : Math.max(0, agora - sessao.inicio)
  return Math.floor((sessao.acumulado + ativo) / 1000)
}

export function pausarSessao(sessao, agora = Date.now()) {
  return sessao.inicio === null ? sessao : {...sessao,
    acumulado: sessao.acumulado + Math.max(0, agora - sessao.inicio), inicio: null}
}

export function lerSessao(storage, chave) {
  try {
    const s = JSON.parse(storage.getItem(chave))
    return s && typeof s.id === 'string' && typeof s.materia === 'string' && s.materia.trim()
      && typeof s.conteudo === 'string' && Number.isFinite(s.acumulado) && s.acumulado >= 0
      && (s.inicio === null || (Number.isFinite(s.inicio) && s.inicio > 0)) ? s : null
  } catch { return null }
}

export function formatarTempoEstudo(segundos) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor(segundos / 60) % 60
  const partes = [minutos, segundos % 60].map(n => String(n).padStart(2, '0'))
  if (horas) partes.unshift(String(horas).padStart(2, '0'))
  return partes.join(':')
}
