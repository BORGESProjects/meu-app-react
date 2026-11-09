import {podeCorrigir, questaoPublicavel} from './acervo.js'

const REFERENCIA_VISUAL = /\b(?:figura|imagem|gr[aá]fico|mapa|infogr[aá]fico|diagrama|esquema|charge|tirinha|cartum|fotografia|quadro|tabela|texto[- ]base|trecho|poema)\b/iu

function temContextoVisual(questao) {
  return Boolean(
    questao?.imagem_original
    || questao?.pagina_imagem
    || questao?.texto_apoio_imagem
    || questao?.texto_apoio_url
    || String(questao?.texto_apoio || '').trim()
    || questao?.imagens_paginas?.length
    || questao?.opcoes_imagens?.some(Boolean)
    || questao?.imagens_opcoes?.some(Boolean)
    || questao?.apoio?.length
    || questao?.blocos_enunciado?.length
  )
}

function temGabaritoUtilizavel(questao) {
  const quantidade = questao?.opcoes?.length || 0
  const indice = questao?.resposta_correta
  const indiceValido = Number.isInteger(indice) && indice >= 0 && indice < quantidade
  const letraValida = /^[A-E]$/iu.test(String(indice || '').trim())
  const somaValida = Number.isInteger(questao?.resposta_soma)
    || (questao?.tipo_resposta === 'somatoria' && Number.isInteger(questao?.resposta_correta))
  const gabarito = questao?.gabarito_oficial
  const gabaritoValido = Boolean(
    gabarito?.resposta
    || Number.isInteger(gabarito?.numero)
    || (Array.isArray(questao?.respostas_aceitas) && questao.respostas_aceitas.length)
  )
  return indiceValido || letraValida || somaValida || gabaritoValido
}

/**
 * Publica somente itens com revisão individual e classificação documentadas,
 * aptos para resolução e com gabarito, metadados e contexto suficientes.
 * A mesma regra é usada no acervo Supabase, nos lotes R2 e nos simulados.
 */
export function questaoIntegraPublicavel(questao) {
  if (!questao || typeof questao !== 'object') return false
  const integridade = questao.integridade_profissional
  const opcoes = questao.opcoes
  const discursiva = questao.tipo_resposta === 'discursiva' || questao.tipo === 'discursiva'
  const classificacaoCompleta = Boolean(
    questao.classificacao_revisada === true
    && questao.classificacao_pendente !== true
    && String(questao.classificacao_evidencia || '').trim()
    && String(questao.banca || questao.concurso || questao.aplicacao || '').trim()
    && /^\d{4}$/u.test(String(questao.ano || ''))
    && String(questao.materia || '').trim()
    && String(questao.conteudo || '').trim()
    && String(questao.dificuldade || '').trim()
  )
  const integridadeConfirmada = Boolean(
    integridade?.verificada_individualmente === true
    && integridade?.apta_resolucao === true
    && Array.isArray(integridade?.pendencias)
    && integridade.pendencias.length === 0
  )
  const alternativasValidas = Array.isArray(opcoes)
    && opcoes.length >= 2
    && opcoes.length <= 5
    && opcoes.every((opcao, indice) => String(opcao || '').trim() || questao.opcoes_imagens?.[indice] || questao.imagens_opcoes?.[indice])
  const necessitaContexto = REFERENCIA_VISUAL.test(String(questao.enunciado || ''))
    || REFERENCIA_VISUAL.test(String(questao.comando || ''))
  const contextoCompleto = !necessitaContexto || temContextoVisual(questao)

  return Boolean(
    classificacaoCompleta
    && integridadeConfirmada
    && !discursiva
    && questao.anulada !== true
    && !questao.documento_auxiliar
    && String(questao.enunciado || '').trim().length >= 12
    && alternativasValidas
    && temGabaritoUtilizavel(questao)
    && contextoCompleto
    && questaoPublicavel(questao)
    && podeCorrigir(questao)
  )
}
