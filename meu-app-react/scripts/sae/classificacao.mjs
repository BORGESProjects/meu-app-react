import { BANCA_ASSIMILACAO, normalizarBanca } from '../../src/filtros.js'

export const ASSIMILACAO = BANCA_ASSIMILACAO

// Só a identificação no início do exercício pode determinar sua origem.
// Datas de textos de apoio, referências bibliográficas e edição do livro não são anos de prova.
export function classificarReferencia(enunciado) {
  const inicio = String(enunciado ?? '')
    .replace(/^\s*Resolução\s*/iu, '')
    .replace(/^\s*\d{1,3}\s*[.)]\s*/u, '')
    .replace(/^\s*(?:C?\d+\s*:\s*H\d+\s*)+/iu, '')
    .trimStart()
  const referencia = inicio.match(/^\(([^)\n]{1,100})\)/u)?.[1]?.trim() ?? ''
  const porAno = referencia.match(/^(.+?)\s*[-–—/,]\s*((?:19|20)\d{2})(?:\s*[-–—/,]\s*(adaptad[ao]))?$/iu)
  const semAno = /^(?:ENEM|FUVEST|AFA|EPCAR|FAMEMA|ESPM|ETEC|VUNESP|FPP|FUNDATEC|FEPAR|EsPCEx|ESA|EEAR|EAM|EFOMM|CFN|CPOR|NPOR|(?:UF|UE|IF|UN)[A-Z]{1,18}|UTFPR|UCPEL|PUC(?:RS|PR|RJ|SP|MG|GO|RIO)?|UPF|UPE|UDESC|UCS|USCS|USF|ACAFE|FALBE|FMP|CEFET|CFTRJ|CFTMG|CFTCE|COSEAC-UFF|FTT|FCMSCSP|FATEC|FAMERP|COTIL|COTUCA|INSPER|CPS|EBMSP|IME|ITA|FGV|FCC|MACKENZIE)(?:[- /](?:[A-Z]{2,18}|\d+))*$/iu
  const bancaDeclarada = porAno?.[1]?.trim() || (semAno.test(referencia) ? referencia : '')
  // Exige sigla/nome institucional, evitando tratar uma fórmula ou data entre parênteses como banca.
  const identificada = bancaDeclarada && semAno.test(bancaDeclarada)
  if (!identificada) return {
    banca: ASSIMILACAO, concurso: ASSIMILACAO, ano: null,
    tipo_origem: 'assimilacao', referencia_original: null, adaptada: false,
    // Uma sigla ainda desconhecida acompanhada de ano exige revisão humana.
    // Não transformar erro de reconhecimento em questão autoral publicada.
    ...(porAno && /\p{L}/u.test(porAno[1]) ? { referencia_pendente: referencia } : {}),
  }
  // PUC-PR, PUC-MG e PUC-Campinas são referências diferentes: não reduzir
  // todas a “PUC” ao remover qualificadores como UFJF-PISM.
  const base = bancaDeclarada.match(/^((?:UF|UE|IF|UN)[A-Z]{1,18}|CEFET|USCS|USF)(?:[- /]|$)/iu)?.[1]
  const sigla = (base || bancaDeclarada).toUpperCase()
  const banca = normalizarBanca(sigla === 'UFGRS' ? 'UFRGS' : sigla)
  const ano = porAno ? Number(porAno[2]) : null
  return {
    banca, concurso: ano ? `${sigla === 'UFGRS' ? 'UFRGS' : bancaDeclarada} ${ano}` : bancaDeclarada, ano,
    tipo_origem: 'prova_identificada', referencia_original: referencia,
    adaptada: Boolean(porAno?.[3]),
  }
}
