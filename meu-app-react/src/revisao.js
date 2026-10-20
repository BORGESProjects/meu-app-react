export const TIPO_REVISAO = 'material_revisao'
export const materialDeRevisao = item => item?.tipo === TIPO_REVISAO
export function lerMapa(texto = '') {
  const raizes = [], pilha = []
  const linhas = texto.split('\n').filter(l => l.trim())
  if (linhas.length > 100) throw new Error('Use até 100 tópicos no mapa.')
  for (const [i, linha] of linhas.entries()) {
    const espacos = linha.match(/^\s*/)[0].replace(/\t/g, '  ').length
    const nivel = Math.min(4, Math.floor(espacos / 2))
    const titulo = linha.trim().replace(/^(?:[-*•]|\d+[.)])\s+/, '')
    const no = {id: String(i), titulo, filhos: []}
    while (pilha.length && pilha.at(-1).nivel >= nivel) pilha.pop()
    if (pilha.length) pilha.at(-1).no.filhos.push(no)
    else raizes.push(no)
    pilha.push({nivel, no})
  }
  return raizes
}
// Organização literal: não inventa conceitos nem usa uma API de IA.
export function mapaDoResumo(resumo) {
  return resumo.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => {
    const linhas = p.split('\n').map(l => l.trim()).filter(Boolean)
    if (linhas.length > 1) return [linhas[0], ...linhas.slice(1).map(l => '  ' + l)].join('\n')
    const frases = p.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý])/u)
    return [frases[0], ...frases.slice(1).map(s => '  ' + s)].join('\n')
  }).join('\n')
}
export function validarMaterial(m) {
  if (!m.titulo?.trim() || m.titulo.length > 160) return 'Informe um título com até 160 caracteres.'
  if (!m.materia) return 'Escolha a matéria para organizar sua revisão.'
  if ((m.resumo || '').length > 12000 || (m.roteiro || '').length > 16000) return 'Use até 12.000 caracteres no resumo e 16.000 no mapa.'
  if (!m.resumo?.trim() && !m.roteiro?.trim()) return 'Escreva um resumo ou acrescente tópicos ao mapa.'
  try { lerMapa(m.roteiro) } catch (e) { return e.message }
  return ''
}
export function registrarRevisao(material, dias, agora = new Date()) {
  if (![1,3,7].includes(dias)) throw new Error('Intervalo de revisão inválido')
  const proxima = new Date(agora); proxima.setDate(proxima.getDate() + dias)
  return {...material, revisoesFeitas: (Number(material.revisoesFeitas) || 0) + 1,
    ultimaRevisao: agora.toISOString(), proximaRevisao: proxima.toISOString(),
    revisoes: [...(material.revisoes || []), {data: agora.toISOString(), dias}].slice(-20)}
}
export const revisaoPendente = (m, agora = Date.now()) => !m.proximaRevisao || Date.parse(m.proximaRevisao) <= agora
export function salvarMaterial(registros, material) {
  if (registros.some(m => m.id === material.id && !materialDeRevisao(m))) throw new Error('Identificador já utilizado')
  return registros.some(m => m.id === material.id) ? registros.map(m => m.id === material.id ? material : m) : [...registros,material]
}
export function exportarMaterial(m) {
  return `${m.titulo}\n${m.materiaNome || m.materia}${m.conteudoNome ? ' · '+m.conteudoNome : ''}\n\nRESUMO\n${m.resumo || ''}\n\nMAPA · tópicos e subtópicos\n${m.roteiro || ''}\n`
}
