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
