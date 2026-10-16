export function concursosDaQuestao(questao) {
  const nomes = Array.isArray(questao.provas) && questao.provas.length ? questao.provas : [questao.concurso]
  return [...new Set(nomes.filter(nome => typeof nome === 'string' && nome.trim()))]
}

export function incluirIdiomaDaProva(questao, idioma) {
  if (questao.banca !== 'PRF' || !questao.idioma) return true
  return questao.idioma === (idioma === 'Espanhol' ? 'Espanhol' : 'Inglês')
}
