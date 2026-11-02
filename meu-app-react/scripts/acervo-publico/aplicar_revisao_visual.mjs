import {createHash} from 'node:crypto'

export function hashTextoVisual(q) {
  return createHash('sha256').update(JSON.stringify([q.enunciado, q.opcoes])).digest('hex')
}

// A transcrição só pode ser reaplicada ao texto efetivamente conferido.
export function aplicarRevisaoVisual(q, revisoes = []) {
  const r = revisoes.find(item => item.id === q.id)
  if (!r) return q
  const hash = hashTextoVisual(q)
  if (hash !== r.sha256_antes && hash !== r.sha256_depois) {
    throw new Error(`Texto mudou após a conferência visual: ${q.id}`)
  }
  return {...q, ...r.campos}
}
