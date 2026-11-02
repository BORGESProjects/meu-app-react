import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { lerArquivoAtual } from './acervo-atual.mjs'

const ids = new Set(['60b2ea0c86ccfc42', '872779cf6a27b29c', '715d83b6bdd9f45e'])
const m = JSON.parse(await lerArquivoAtual('manifesto.json'))
const porDocumento = new Map([...ids].map(id => [id, []]))
for (const lote of m.lotes) {
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for (const q of qs) if (ids.has(q.documento_id)) porDocumento.get(q.documento_id).push(q)
}
const alvo = new Map([
  ['60b2ea0c86ccfc42', { ini: 61, fim: 120, antes: [] }],
  ['872779cf6a27b29c', { ini: 41, fim: 100, antes: [82, 95, 100] }],
  ['715d83b6bdd9f45e', { ini: 1, fim: 100, antes: [15, 20, 21, 22, 28, 29, 30, 31, 32, 33, 34, 35, 45, 52, 78] }]
])
const rel = []
for (const [id, qs] of porDocumento) {
  const { ini, fim, antes } = alvo.get(id)
  const byN = new Map()
  for (const q of qs) {
    const n = Number(q.numero_original)
    const arr = byN.get(n) || []; arr.push(q); byN.set(n, arr)
  }
  const missing = Array.from({ length: fim - ini + 1 }, (_, i) => i + ini).filter(n => !byN.has(n))
  const questionable = qs.filter(q => q.classificacao_pendente || !q.materia || !q.conteudo || !q.ano).map(q => ({ id: q.id, numero: q.numero_original, classificacao_pendente: q.classificacao_pendente, materia: q.materia, conteudo: q.conteudo, ano: q.ano, elegivel: q.integridade_profissional?.apta_resolucao !== false }))
  const anuladas = qs.filter(q => q.anulada).map(q => Number(q.numero_original)).sort((a, b) => a - b)
  const excecoes = antes.flatMap(n => (byN.get(n) || []).map(q => ({ id: q.id, numero: n, ano: q.ano, concurso: q.concurso, materia: q.materia, conteudo: q.conteudo, classificacao_revisada: q.classificacao_revisada, classificacao_pendente: q.classificacao_pendente, resposta_correta: q.resposta_correta, anulada: q.anulada, gabarito: q.gabarito_oficial ? { numero: q.gabarito_oficial.numero, resposta: q.gabarito_oficial.resposta, fonte: q.gabarito_oficial.fonte } : null, apta: q.integridade_profissional?.apta_resolucao !== false })))
  rel.push({ documento: id, registros: qs.length, itens_presentes: byN.size, itens_ausentes_no_banco: missing, pendencias_de_classificacao: questionable, anuladas_ja_presentes: anuladas, registros_ja_revisados: qs.filter(q => q.classificacao_revisada && !q.classificacao_pendente).length, registros_inelegiveis: qs.filter(q => q.integridade_profissional?.apta_resolucao === false).length, distribuicao_ano: Object.fromEntries([...new Set(qs.map(q => q.ano))].map(ano => [ano, qs.filter(q => q.ano === ano).length])), excecoes_previamente_tratadas: excecoes })
}
const saida = { analisados_em: new Date().toISOString(), documentos: rel }
await fs.writeFile('docs/acervo/revisao-profissional/auditoria-itens-ja-tratados-v138-v140.json', JSON.stringify(saida, null, 2))
console.log(JSON.stringify(saida, null, 2))
