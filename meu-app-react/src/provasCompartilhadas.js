export function concursosDaQuestao(questao) {
  const nomes = Array.isArray(questao.provas) && questao.provas.length ? questao.provas : [questao.concurso]
  return [...new Set(nomes.filter(nome => typeof nome === 'string' && nome.trim()))]
}

export function incluirIdiomaDaProva(questao, idioma) {
  if (questao.banca !== 'PRF' || !questao.idioma) return true
  return questao.idioma === (idioma === 'Espanhol' ? 'Espanhol' : 'Inglês')
}

// Uma questão compartilhada pode ter números e recortes distintos por cargo.
export function questaoNaProva(questao, concurso) {
  if (!concursosDaQuestao(questao).includes(concurso)) return null
  const origem = questao.origens_provas?.find(item => item.concurso === concurso)
  return { ...questao, ...origem, id: questao.id, concurso }
}
