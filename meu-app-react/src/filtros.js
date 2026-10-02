export const TODOS = '__todos__'

export function limparValorFiltro(valor) {
  return String(valor ?? '').trim().replace(/\s+/g, ' ')
}

export function chaveFiltro(valor) {
  return limparValorFiltro(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

export function chaveCampoFiltro(campo, valor) {
  const chave = chaveFiltro(valor)
  if (campo === 'dificuldade' && chave === 'medio') return 'media'
  return chave
}

function rotuloPreferido(chave, contagens, campo) {
  const valores = [...contagens.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
  if (campo === 'dificuldade') return ({ facil: 'Fácil', media: 'Média', dificil: 'Difícil' })[chave] || valores[0][0]
  if (campo === 'banca') {
    const sigla = valores.find(([valor]) => valor.length <= 10 && valor === valor.toLocaleUpperCase('pt-BR'))
    if (sigla) return sigla[0]
  }
  const rotulo = valores[0][0]
  return rotulo.charAt(0).toLocaleUpperCase('pt-BR') + rotulo.slice(1)
}

export function opcoesFiltro(questoes, campo) {
  const grupos = new Map()
  for (const questao of questoes) {
    const valor = limparValorFiltro(questao?.[campo])
    const chave = chaveCampoFiltro(campo, valor)
    if (!chave) continue
    if (!grupos.has(chave)) grupos.set(chave, new Map())
    const contagens = grupos.get(chave)
    contagens.set(valor, (contagens.get(valor) || 0) + 1)
  }
  const ordemDificuldade = { facil: 0, media: 1, dificil: 2 }
  return [...grupos.entries()].map(([chave, contagens]) => ({
    value: chave,
    label: rotuloPreferido(chave, contagens, campo),
  })).sort((a, b) => campo === 'dificuldade'
    ? (ordemDificuldade[a.value] ?? 99) - (ordemDificuldade[b.value] ?? 99)
    : a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base', numeric: true }))
}
