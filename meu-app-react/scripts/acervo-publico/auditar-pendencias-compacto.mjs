import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { lerArquivoAtual, raizesAtuais } from './acervo-atual.mjs'

const manifest = JSON.parse(await lerArquivoAtual('manifesto.json'))
const grupos = new Map()
for (const lote of manifest.lotes) {
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for (const q of qs) {
    if (!q.classificacao_pendente || q.integridade_profissional?.apta_resolucao === false || q.classificacao_revisada) continue
    const k = `${q.banca || 'Sem aplicação'}\t${q.documento_id || ''}\t${q.ano || ''}\t${q.materia || ''}\t${q.conteudo || ''}`
    const g = grupos.get(k) || { total: 0, amostras: [] }
    g.total++
    if (g.amostras.length < 2) g.amostras.push({ id: q.id, tipo: q.tipo_resposta, stem: (q.enunciado || '').replace(/\s+/g, ' ').slice(0, 260), alternativas: q.alternativas?.length || 0, imagens: q.imagens?.length || 0 })
    grupos.set(k, g)
  }
}
const out = [...grupos].map(([grupo, dados]) => ({ grupo, ...dados })).sort((a, b) => b.total - a.total)
await fs.writeFile('docs/acervo/revisao-profissional/pendencias-compactas.json', JSON.stringify(out, null, 2))
console.log(JSON.stringify({ grupos: out.length, pendentes: out.reduce((n, g) => n + g.total, 0), maiores: out.slice(0, 35) }, null, 2))
