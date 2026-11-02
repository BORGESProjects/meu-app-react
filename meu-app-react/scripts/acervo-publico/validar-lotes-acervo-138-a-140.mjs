import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import { lerArquivoAtual } from './acervo-atual.mjs'

const manifest = JSON.parse(await lerArquivoAtual('manifesto.json'))
const docs = new Map([
  ['60b2ea0c86ccfc42', { nome: 'POLC/AL 2023 — Perito Médico-Legista', total: 64, itens: 60, anuladas: [81, 99], sha256_tipo: 'transcricao_canonica_dos_itens_61_a_120_do_gabarito_definitivo', versao: 'revisao-polcal-perito-medico-legista-2023-v138' }],
  ['872779cf6a27b29c', { nome: 'EBSERH 2018 — Física Médica/Radioterapia', total: 57, itens: 57, anuladas: [], sha256_tipo: 'transcricao_canonica_dos_itens_41_a_100_do_gabarito_definitivo', versao: 'revisao-ebserh-fisica-medica-radioterapia-2018-v139' }],
  ['715d83b6bdd9f45e', { nome: 'PCDF CFP Agente — avaliação 2023', total: 92, itens: 85, anuladas: [4, 6], anuladas_no_gabarito: [4, 6, 22], duplicadas: 7, sha256_tipo: 'transcricao_canonica_dos_itens_1_a_100_do_gabarito_definitivo', versao: 'revisao-pcdf-agente-cfp-2023-v140' }]
])
const lotes = manifest.lotes.filter(l => [...docs.values()].some(d => l.arquivo.includes(d.versao)))
assert.ok(lotes.length >= 6, `Esperava os lotes alterados pelas três revisões, encontrados: ${lotes.length}`)
const vistos = new Map([...docs.keys()].map(id => [id, []]))
const arquivosImagem = new Set()
for (const lote of lotes) {
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  assert.equal(qs.length, lote.quantidade)
  for (const q of qs) {
    if (!vistos.has(q.documento_id) || q.gabarito_oficial?.sha256_tipo !== docs.get(q.documento_id).sha256_tipo) continue
    vistos.get(q.documento_id).push(q)
  }
}
const rel = { total_registros_acervo: manifest.questoes_extraidas_unicas, elegiveis_acervo: manifest.questoes_disponiveis_resolucao, revisoes: [] }
for (const [doc, info] of docs) {
  const qs = vistos.get(doc)
  assert.equal(qs.length, info.total, `${info.nome}: quantidade de registros divergente`)
  const itens = new Set(qs.map(q => Number(q.numero_original)))
  assert.equal(itens.size, info.itens, `${info.nome}: número de itens distintos divergente`)
  assert.ok(qs.every(q => q.classificacao_revisada && q.classificacao_pendente === false && q.materia && q.conteudo && q.concurso && q.ano && q.dificuldade), `${info.nome}: campo de classificação ausente`)
  assert.ok(qs.every(q => q.gabarito_oficial?.sha256 && q.gabarito_oficial.numero === q.numero_original && q.gabarito_oficial.resposta && q.gabarito_oficial.fonte?.startsWith('https://')), `${info.nome}: metadados do gabarito incompletos`)
  const anuladas = [...new Set(qs.filter(q => q.anulada).map(q => Number(q.numero_original)))].sort((a, b) => a - b)
  assert.deepEqual(anuladas, [...info.anuladas].sort((a, b) => a - b), `${info.nome}: itens anulados divergentes`)
  if (info.duplicadas) {
    const duplicadas = qs.filter(q => q.duplicada_de)
    assert.equal(duplicadas.length, info.duplicadas)
    assert.ok(duplicadas.every(q => q.integridade_profissional?.apta_resolucao === false))
  }
  for (const q of qs) for (const path of [q.pagina_imagem, ...(q.imagens_paginas || []), ...(q.contexto_paginas || []).map(x => x.imagem)].filter(Boolean)) arquivosImagem.add(path)
  rel.revisoes.push({ documento: doc, nome: info.nome, registros: qs.length, itens_distintos: itens.size, anuladas_neste_lote: anuladas, ...(info.anuladas_no_gabarito ? { anuladas_no_gabarito: info.anuladas_no_gabarito } : {}), duplicadas_desativadas: info.duplicadas || 0, imagens_referenciadas: new Set(qs.flatMap(q => [q.pagina_imagem, ...(q.imagens_paginas || []), ...(q.contexto_paginas || []).map(x => x.imagem)].filter(Boolean))).size })
}
for (const img of arquivosImagem) await fs.access(`public/acervo-extraido/${img}`)
rel.imagens_verificadas = arquivosImagem.size
rel.publicado_na_nuvem = false
rel.validado_em = new Date().toISOString()
await fs.writeFile('docs/acervo/revisao-profissional/validacao-lotes-v138-v140.json', JSON.stringify(rel, null, 2))
console.log(JSON.stringify(rel, null, 2))
