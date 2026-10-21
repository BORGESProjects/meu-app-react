// O recorte pode continuar guardado como fonte depois da transcrição conferida.
// Nunca usar o texto auxiliar de OCR no lugar de uma figura sem essa conferência.
export function imagemDaAlternativa(questao, indice) {
  const texto = questao.opcoes?.[indice]
  const transcrita = questao.opcoes_em_texto?.[indice] === true
    && typeof texto === 'string' && texto.trim()
    && !/^\s*(?:alternativa|diagrama da alternativa)\s+[a-e]\b/iu.test(texto)
  return transcrita ? null : questao.opcoes_imagens?.[indice]
}

export function formatarTextoAlternativa(valor) {
  return String(valor ?? '')
    .replace(/\r\n?/gu, '\n')
    .split(/\n{2,}/gu)
    .map(bloco => bloco
      .replace(/([\p{L}]{2,})-\n\s*([\p{Ll}]+)/gu, '$1$2')
      .replace(/\s*\n\s*/gu, ' ')
      .replace(/[ \t]{2,}/gu, ' ')
      .trim())
    .filter(Boolean)
    .join('\n\n')
}
