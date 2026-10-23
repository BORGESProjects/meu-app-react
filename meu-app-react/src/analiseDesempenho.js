const DIA = 24 * 60 * 60 * 1000

function resumoGrupo(registros, chave) {
  const grupos = new Map()
  for (const item of registros) {
    const nome = String(item[chave] || '').trim()
    if (!nome) continue
    const grupo = grupos.get(nome) || { nome, tentativas: 0, acertos: 0, erros: 0 }
    grupo.tentativas++
    if (item.acertou) grupo.acertos++
    else grupo.erros++
    grupos.set(nome, grupo)
  }
  return [...grupos.values()].map(grupo => ({
    ...grupo,
    percentual: grupo.tentativas ? Math.round(grupo.acertos / grupo.tentativas * 100) : 0,
  })).sort((a, b) => b.tentativas - a.tentativas || a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function analisarDesempenho(historico = [], questoes = [], agora = Date.now()) {
  const porId = new Map(questoes.map(questao => [String(questao.id), questao]))
  const registros = historico.map(item => {
    const questao = porId.get(String(item.questaoId))
    return {
      ...item,
      materia: item.materia || questao?.materia || '',
      conteudo: item.conteudo || questao?.conteudo || '',
      banca: item.banca || questao?.banca || '',
      respondidaEmMs: Date.parse(item.respondidaEm) || 0,
    }
  }).filter(item => typeof item.acertou === 'boolean')

  const recentes = registros.filter(item => item.respondidaEmMs >= agora - 7 * DIA)
  const semanaAnterior = registros.filter(item => item.respondidaEmMs >= agora - 14 * DIA && item.respondidaEmMs < agora - 7 * DIA)
  const percentual = itens => itens.length ? Math.round(itens.filter(item => item.acertou).length / itens.length * 100) : null
  const materias = resumoGrupo(registros, 'materia')
  const conteudos = resumoGrupo(registros, 'conteudo')
  const bancas = resumoGrupo(registros, 'banca')
  const pontosAtencao = conteudos.filter(item => item.tentativas >= 3 && item.percentual < 70)
    .sort((a, b) => a.percentual - b.percentual || b.erros - a.erros).slice(0, 5)

  return {
    tentativas: registros.length,
    recentes: recentes.length,
    acertoRecente: percentual(recentes),
    acertoSemanaAnterior: percentual(semanaAnterior),
    variacaoSemanal: percentual(recentes) == null || percentual(semanaAnterior) == null
      ? null : percentual(recentes) - percentual(semanaAnterior),
    materias: materias.slice(0, 8),
    bancas: bancas.slice(0, 8),
    conteudos: conteudos.slice(0, 10),
    pontosAtencao,
  }
}
