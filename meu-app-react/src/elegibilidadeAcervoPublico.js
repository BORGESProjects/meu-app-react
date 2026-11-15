import {podeCorrigir, questaoPublicavel} from './acervo.js'

const REFERENCIA_VISUAL = /(?:\b(?:figura|imagem|gr[aá]fico|mapa|infogr[aá]fico|diagrama|esquema|charge|tirinha|cartum|fotografia|quadro|tabela|texto[- ]base)\s+(?:a seguir|abaixo|acima|ao lado|apresentad[oa]|ilustrad[oa]|representad[oa])\b|\b(?:observe|analise|considere|conforme|como|com base|de acordo com)\s+(?:a|o|esta|esse|nesta|nesse)\s+(?:figura|imagem|gr[aá]fico|mapa|infogr[aá]fico|diagrama|esquema|charge|tirinha|cartum|fotografia|quadro|tabela|texto[- ]base)\b|\b(?:ironia|humor|sentido)\s+d[ao]\s+(?:tirinha|charge|cartum)\b)/iu

function temContextoVisual(questao) {
  return Boolean(
    questao?.imagem_original
    || questao?.pagina_imagem
    || questao?.imagens?.length
    || questao?.texto_apoio_imagem
    || questao?.texto_apoio_url
    || String(questao?.texto_apoio || '').trim()
    || questao?.imagens_paginas?.length
    || questao?.opcoes_imagens?.some(Boolean)
    || questao?.imagens_opcoes?.some(Boolean)
    || questao?.apoio?.length
    || questao?.blocos_enunciado?.length
    || questao?.integridade_profissional?.figura_original_substituida_por_descricao_textual_integral === true
    || questao?.integridade_profissional?.recursos_visuais_essenciais_transcritos_quando_aplicavel === true
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
  const textoConferidoComOriginal = [
    'enunciado_e_alternativas_transcritos_e_conferidos_com_imagem',
    'enunciado_e_alternativas_transcritos_e_conferidos_com_caderno_oficial',
    'enunciado_e_alternativas_conferidos_com_caderno_oficial',
  ].some(campo => integridade?.[campo] === true)
  const figuraSubstituidaPorDescricao = integridade?.figura_original_substituida_por_descricao_textual_integral === true
  const originalVisualConferido = integridade?.recortes_originais_preservados_e_conferidos_com_a_fonte === true
    && Boolean(questao.imagem_original)
    && Array.isArray(questao.opcoes_imagens)
    && questao.opcoes_imagens.length === opcoes?.length
  const conferidaComOriginal = integridade?.gabarito_conferido_com_gabarito_oficial === true
    && (textoConferidoComOriginal || figuraSubstituidaPorDescricao || originalVisualConferido)
  const anuladaConsultaCompleta = Boolean(
    questao?.anulada === true
    && questao?.resposta_correta == null
    && integridade?.verificada_individualmente === true
    && integridade?.correcao_automatica === false
    && conferidaComOriginal
    && Array.isArray(integridade?.pendencias)
    && integridade.pendencias.length === 0
  )
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
    (anuladaConsultaCompleta || (
      (integridade?.verificada_individualmente === true || conferidaComOriginal)
      && integridade?.apta_resolucao === true
    ))
    // Os cadernos locais mais antigos guardam a mesma lista no nível da
    // questão (`integridade_pendente`). Aceitar esse formato legado só quando
    // ele existe e está vazio conserva o bloqueio para registros sem auditoria.
    // Também há edições antigas que registram a conferência do texto, da mídia
    // e do gabarito em campos explícitos, sem criar o marcador agregador ou uma
    // lista vazia. Esses campos equivalentes só liberam quando o gabarito é
    // oficial e a conferência da fonte está registrada.
    && (Array.isArray(integridade?.pendencias)
      ? integridade.pendencias.length === 0
      : Array.isArray(questao.integridade_pendente)
        ? questao.integridade_pendente.length === 0
        : questao.integridade_pendente !== true && conferidaComOriginal)
  )
  const respostaEsperada = String(
    questao.resposta_esperada
      || (discursiva ? questao.gabarito_oficial?.resposta : '')
      || '',
  ).trim()
  // Alguns espelhos oficiais podem conter erros materiais. Nesses casos,
  // aceitar somente uma resolução editorial revisada independentemente,
  // acompanhada da inconsistência explícita e da fonte oficial consultável.
  const respostaDiscursivaEditorialRevisada = Boolean(
    integridade?.resposta_editorial_revisada_matematicamente === true
    && String(questao.nota_resposta || '').trim().length >= 50
    && String(questao.gabarito_oficial?.inconsistencia_detectada || '').trim().length >= 30
    && /^https:\/\//u.test(String(questao.gabarito_oficial?.fonte_url || ''))
  )
  const integridadeDiscursivaConfirmada = Boolean(
    integridade?.verificada_individualmente === true
    && integridade?.apta_resolucao === true
    && integridade?.enunciado_conferido_com_caderno_oficial === true
    && (integridade?.resposta_esperada_conferida_com_gabarito_oficial === true
      || respostaDiscursivaEditorialRevisada)
    && integridade?.recortes_originais_preservados_e_conferidos_com_a_fonte === true
    && Array.isArray(integridade?.pendencias)
    && integridade.pendencias.length === 0
    && questao.gabarito_oficial?.definitivo === true
    && questao.gabarito_oficial?.verificada === true
    && respostaEsperada.length >= 30
  )
  const alternativasValidas = Array.isArray(opcoes)
    && opcoes.length >= 2
    && opcoes.length <= 5
    && opcoes.every((opcao, indice) => String(opcao || '').trim() || questao.opcoes_imagens?.[indice] || questao.imagens_opcoes?.[indice])
  const referenciaTextual = `${questao.enunciado || ''} ${questao.comando || ''}`
  // Em enunciados médicos, “quadro acima” costuma retomar o caso clínico já
  // descrito no próprio texto, e não uma imagem/tabela ausente.
  const quadroClinicoIntegral = /\b(?:caso clínico|quadro clínico)\b/iu.test(referenciaTextual)
    && /\bquadro\s+(?:a seguir|acima|abaixo)\b/iu.test(referenciaTextual)
    && !/\b(?:figura|imagem|gr[aá]fico|mapa|diagrama|tabela|fotografia|tirinha|charge)\b/iu.test(referenciaTextual)
  const necessitaContexto = !quadroClinicoIntegral && (REFERENCIA_VISUAL.test(referenciaTextual))
  const contextoCompleto = !necessitaContexto || temContextoVisual(questao)

  // Questões abertas seguem uma validação própria. Não passam pelo corretor
  // objetivo e nunca são aceitas como itens de múltipla escolha por acidente.
  if (discursiva) {
    return Boolean(
      classificacaoCompleta
      && integridadeDiscursivaConfirmada
      && questao.anulada !== true
      && !questao.documento_auxiliar
      && String(questao.enunciado || '').trim().length >= 12
      && (!necessitaContexto || temContextoVisual(questao))
      && (!questao.imagem_original || temContextoVisual(questao))
    )
  }

  return Boolean(
    classificacaoCompleta
    && integridadeConfirmada
    && !questao.documento_auxiliar
    && String(questao.enunciado || '').trim().length >= 12
    && alternativasValidas
    && (anuladaConsultaCompleta || temGabaritoUtilizavel(questao))
    && contextoCompleto
    && questaoPublicavel(questao)
    && (anuladaConsultaCompleta || podeCorrigir(questao))
  )
}
