// A edição 2020 tem 45 questões comuns e cinco de cada idioma.
export function incluirNoSimuladoIfpr(questao, idioma) {
  if (questao.banca !== 'IFPR' || !questao.idioma) return true
  return questao.idioma === (idioma === 'Espanhol' ? 'Espanhol' : 'Inglês')
}
