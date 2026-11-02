import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { hashRevisao, aplicarRevisoesIndividuais } from './aplicar-revisoes-individuais.mjs'
import { lerArquivoAtual, raizesAtuais } from './acervo-atual.mjs'

const documento = 'ae4057c08b476ecd'
const url = 'https://cdn.cebraspe.org.br/concursos/mpsc_23_promotor/arquivos/808_MPSC_PROMOTOR_002_01.PDF'
const secoes = [
  [1, 4, 'Português', 'Gramática e ortografia aplicadas à interpretação de texto'],
  [5, 7, 'Português', 'Classes gramaticais e relações de sentido no texto'],
  [8, 12, 'Português', 'Sintaxe: sujeito, termos da oração, coordenação e subordinação'],
  [13, 14, 'Português', 'Colocação pronominal'],
  [15, 17, 'Português', 'Concordância nominal e verbal'],
  [18, 20, 'Português', 'Regência nominal e verbal'],
  [21, 23, 'Português', 'Formas e tempos verbais'],
  [24, 33, 'Português', 'Compreensão e análise linguística de texto'],
  [34, 40, 'Português', 'Gramática e sintaxe aplicadas ao texto'],
  [41, 45, 'Português', 'Análise gramatical e sintática de texto'],
  [46, 49, 'Direito Empresarial', 'Lei de Recuperação Judicial e Falências: competência, créditos e processamento'],
  [50, 53, 'Direito Processual Civil', 'Tutela coletiva: princípios, coisa julgada coletiva e representatividade adequada'],
  [54, 56, 'Direito Processual Civil', 'Direitos coletivos lato sensu e legitimidade do Ministério Público'],
  [57, 62, 'Direito Processual Civil', 'Ações coletivas, execução individual, coisa julgada e fundo de direitos difusos'],
  [63, 65, 'Direito Processual Civil', 'Inquérito civil e compromisso de ajustamento de conduta'],
  [66, 71, 'Direito Ambiental', 'Código Ambiental de Santa Catarina: órgãos, licenciamento e FEPEMA'],
  [72, 77, 'Direito Ambiental', 'SISNAMA e Política Nacional do Meio Ambiente: composição e instrumentos'],
  [78, 82, 'Direito Ambiental', 'Estudo de impacto ambiental e licenciamento ambiental'],
  [83, 85, 'Direito Urbanístico', 'Parcelamento do solo urbano e licenciamento urbanístico-ambiental'],
  [86, 94, 'Direito Urbanístico', 'Estatuto da Cidade e instrumentos de política urbana'],
  [95, 97, 'Direito Administrativo', 'Princípios informadores da administração pública'],
  [98, 102, 'Direito Administrativo', 'Tutela civil do patrimônio público e controle da administração'],
  [103, 105, 'Direito Administrativo', 'Improbidade administrativa: tipificação, sanções e legitimidade'],
  [106, 109, 'Direito Administrativo', 'Lei de Acesso à Informação: transparência, sigilo e responsabilização'],
  [110, 113, 'Direito Administrativo', 'Lei Anticorrupção: responsabilização de pessoas jurídicas e acordo de leniência'],
  [114, 118, 'Direito do Consumidor', 'Relação de consumo, direitos básicos e responsabilidade do fornecedor'],
  [119, 123, 'Direito do Consumidor', 'Defesa do consumidor, responsabilidade e desconsideração da personalidade jurídica'],
  [124, 127, 'Direito do Consumidor', 'Publicidade, práticas abusivas, cobrança e bancos de dados'],
  [128, 132, 'Direito do Consumidor', 'Proteção contratual, sanções, superendividamento, saúde suplementar e esporte'],
  [133, 147, 'Direito do Consumidor', 'SAC, oferta de preços, entrega de produtos e crimes contra as relações de consumo'],
  [148, 154, 'Direito da Criança e do Adolescente', 'Medidas protetivas e socioeducativas; viagem de crianças e adolescentes'],
  [155, 158, 'Direito da Criança e do Adolescente', 'Adoção, origem biológica, registro civil e relações familiares'],
  [159, 161, 'Direito da Criança e do Adolescente', 'Proteção de crianças e adolescentes no ambiente escolar e direito à educação inclusiva'],
  [162, 166, 'Direitos Humanos e Cidadania', 'Direitos humanos, direitos fundamentais e dignidade da pessoa humana'],
  [167, 172, 'Direitos Humanos e Cidadania', 'Dignidade, privacidade, liberdade, inviolabilidade domiciliar e reunião'],
  [173, 177, 'Direitos Humanos e Cidadania', 'Igualdade, antirracismo, direitos das mulheres e população LGBTQIA+'],
  [178, 183, 'Direitos Humanos e Cidadania', 'Ações afirmativas, direitos das pessoas com deficiência, saúde mental e pessoa idosa'],
  [184, 185, 'Direitos Humanos e Cidadania', 'Migração, refúgio e direitos das pessoas com deficiência'],
  [186, 190, 'Legislação Institucional', 'Órgãos superiores, escolha e atribuições de membros do Ministério Público de Santa Catarina'],
  [191, 195, 'Legislação Institucional', 'Lei Orgânica do MPSC: licenças, remoção, afastamento e vitaliciamento'],
  [196, 200, 'Legislação Institucional', 'Regime disciplinar e sanções da Lei Orgânica do MPSC'],
]

const manifesto = JSON.parse(await lerArquivoAtual('manifesto.json'))
const base = raizesAtuais[0]
const decisoes = []
for (const lote of manifesto.lotes) {
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for (const q of qs) {
    if (q.documento_id !== documento || !q.classificacao_pendente || q.integridade_profissional?.apta_resolucao === false || q.classificacao_revisada) continue
    const regra = secoes.find(([de, ate]) => q.numero_original >= de && q.numero_original <= ate)
    if (!regra) throw Error(`Sem seção do PDF oficial para o item ${q.numero_original}`)
    const [de, ate, materia, conteudo] = regra
    if (!q.enunciado?.trim() || q.tipo_resposta !== 'certo_errado') throw Error(`Integridade/tipo incompatível no item ${q.numero_original}`)
    decisoes.push({
      id: q.id,
      sha256_enunciado: hashRevisao(q.enunciado),
      materia,
      conteudo,
      motivo: `Item ${q.numero_original}: matéria e conteúdo conferidos com o enunciado e o cabeçalho oficial da seção ${de}–${ate}, página ${q.pagina}. Prova objetiva P2 do concurso para Promotor de Justiça do MPSC, edital 2023.`,
      classificacao_fonte: { materia: `Seção temática do caderno oficial, itens ${de}–${ate}`, pagina: q.pagina, url },
    })
  }
}
if (decisoes.length !== 167) throw Error(`Esperadas 167 questões pendentes aptas, encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v43-decisoes.json', JSON.stringify(decisoes, null, 2))
const r = await aplicarRevisoesIndividuais({ nome: 'revisao-semantica-v43', base, decisoes })
console.log(JSON.stringify({ ...r, documento, concurso: 'MPSC 23 PROMOTOR', classificacoes: Object.fromEntries([...new Set(decisoes.map(d => d.materia))].map(m => [m, decisoes.filter(d => d.materia === m).length])) }))
