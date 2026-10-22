export async function carregarLoteLivro(lote, requisitar = fetch) {
  if (!/^\/acervo\/estudo-[a-z0-9-]+\/questoes\.json$/u.test(lote.url)
      || !Number.isInteger(lote.quantidade) || lote.quantidade < 0) throw new Error('Catálogo de material de estudo inválido')
  const r = await requisitar(lote.url, { signal: AbortSignal.timeout(30000) })
  if (!r.ok) throw new Error('Material de estudo indisponível: ' + lote.materia)
  const itens = await r.json()
  if (!Array.isArray(itens) || itens.length !== lote.quantidade
      || itens.some(q => typeof q.id !== 'string' || !Array.isArray(q.opcoes))
      || new Set(itens.map(q => q.id)).size !== itens.length) throw new Error('Material de estudo incompleto: ' + lote.materia)
  return itens
}
