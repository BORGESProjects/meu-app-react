// O acervo complementar só recebe pontuação com vínculo documental conferido.
export function avaliarRespostaComplementar(questao, selecionada) {
  const correta = questao.resposta_correta
  if (!questao.gabarito_oficial?.sha256 || questao.anulada
    || questao.integridade_profissional?.correcao_automatica !== true
    || !Number.isInteger(correta) || correta < 0 || correta >= (questao.opcoes?.length || 0)
    || selecionada === '' || selecionada === null || selecionada === undefined) return null
  const escolhida = Number(selecionada)
  if (!Number.isInteger(escolhida) || escolhida < 0 || escolhida >= questao.opcoes.length) return null
  return {escolhida, correta, acertou: escolhida === correta}
}
