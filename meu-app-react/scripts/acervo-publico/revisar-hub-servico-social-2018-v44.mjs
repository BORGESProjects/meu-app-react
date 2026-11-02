import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { hashRevisao, aplicarRevisoesIndividuais } from './aplicar-revisoes-individuais.mjs'
import { lerArquivoAtual, raizesAtuais } from './acervo-atual.mjs'

const documento = 'cee8aa0974825f1f'
const url = 'https://cdn.cebraspe.org.br/concursos/HUB_18_MULTIPROFISSIONAL/arquivos/370_RMULT_006_01.PDF'
const secoes = [
  [1, 5, 'Serviço Social', 'Lei n.º 8.662/1993: competências e atribuições profissionais'],
  [6, 10, 'Serviço Social', 'Fiscalização profissional: Resolução CFESS n.º 512/2007 e Política Nacional de Fiscalização'],
  [11, 15, 'Serviço Social', 'Atuação crítica do Serviço Social na política de saúde'],
  [16, 20, 'Serviço Social', 'Código de Ética: deveres, direitos, sigilo e democracia'],
  [21, 25, 'Política de Assistência Social', 'Consolidação da assistência social como política de Estado; monitoramento, financiamento e benefícios'],
  [26, 30, 'Saúde Coletiva', 'Política Nacional de Promoção da Saúde: objetivos, determinantes e transversalidade'],
  [31, 35, 'Serviço Social', 'Código de Ética Profissional do Assistente Social'],
  [36, 41, 'Políticas Sociais', 'Seguridade social no Brasil: história, projetos políticos e controle social'],
  [42, 45, 'Serviço Social', 'Fundamentos teórico-metodológicos e projeto ético-político profissional'],
  [46, 51, 'Serviço Social', 'Resoluções do CFESS, trabalho multiprofissional e emissão de opinião técnica'],
  [52, 54, 'Política de Assistência Social', 'Direitos sociais e benefícios da pessoa com câncer: BPC, FGTS e previdência'],
  [55, 60, 'Serviço Social', 'Sigilo profissional, prontuário, trabalho multiprofissional, identidade de gênero e defesa de direitos'],
  [61, 65, 'Política de Assistência Social', 'Direitos previdenciários e sociais da pessoa com neoplasia maligna'],
  [66, 68, 'Serviço Social', 'Teorias sociais: marxismo, fenomenologia e funcionalismo'],
  [69, 73, 'Serviço Social', 'Pesquisa social: grupo focal, história de vida, questionários e observação participante'],
  [74, 78, 'Serviço Social', 'Atuação profissional na política de saúde e trabalho em equipe'],
  [79, 81, 'Políticas Sociais', 'Avaliação crítico-dialética de políticas públicas: direitos, equidade e impactos'],
  [82, 84, 'Serviço Social', 'Código de Ética: sigilo, intervenção profissional e autonomia do usuário'],
  [85, 90, 'Serviço Social', 'Intervenção profissional, trabalho interdisciplinar e atuação com famílias'],
  [91, 93, 'Política de Assistência Social', 'História da assistência social no Brasil e proteção social'],
  [94, 96, 'Serviço Social', 'Fundamentos históricos, teóricos e metodológicos do Serviço Social'],
  [97, 98, 'Direitos Humanos e Cidadania', 'Cidadania, direitos sociais e participação'],
  [99, 102, 'Direitos Humanos e Cidadania', 'Direitos fundamentais e proteção constitucional'],
  [103, 110, 'Serviço Social', 'Planejamento em Serviço Social: instrumentos, etapas e intervenção profissional'],
  [111, 112, 'Política de Assistência Social', 'Lei Orgânica da Assistência Social: organização, benefícios e proteção social'],
  [113, 114, 'Direito da Criança e do Adolescente', 'Estatuto da Criança e do Adolescente e direitos da infância'],
  [115, 118, 'Políticas Sociais', 'Indicadores sociais: leitura e interpretação de dados demográficos e socioeconômicos'],
  [119, 120, 'Política de Assistência Social', 'Programa Bolsa Família: critérios, benefícios e proteção social'],
]

const manifesto = JSON.parse(await lerArquivoAtual('manifesto.json'))
const base = raizesAtuais[0]
const decisoes = []
for (const lote of manifesto.lotes) {
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for (const q of qs) {
    if (q.documento_id !== documento || !q.classificacao_pendente || q.integridade_profissional?.apta_resolucao === false || q.classificacao_revisada) continue
    const regra = secoes.find(([de, ate]) => q.numero_original >= de && q.numero_original <= ate)
    if (!regra) throw Error(`Sem seção para o item ${q.numero_original}`)
    const [de, ate, materia, conteudo] = regra
    if (!q.enunciado?.trim() || q.tipo_resposta !== 'certo_errado') throw Error(`Integridade/tipo incompatível no item ${q.numero_original}`)
    decisoes.push({
      id: q.id,
      sha256_enunciado: hashRevisao(q.enunciado),
      materia,
      conteudo,
      motivo: `Item ${q.numero_original}: matéria e conteúdo conferidos com o enunciado e o cabeçalho temático oficial dos itens ${de}–${ate}, página ${q.pagina}. Prova objetiva CEBRASPE para Residência Multiprofissional do HUB, aplicação 2018.`,
      classificacao_fonte: { materia: `Seção do caderno oficial, itens ${de}–${ate}`, pagina: q.pagina, url },
    })
  }
}
if (decisoes.length !== 119) throw Error(`Esperadas 119 pendências aptas, encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v44-decisoes.json', JSON.stringify(decisoes, null, 2))
const r = await aplicarRevisoesIndividuais({ nome: 'revisao-semantica-v44', base, decisoes })
console.log(JSON.stringify({ ...r, documento, concurso: 'HUB RESIDÊNCIA MULTIPROFISSIONAL 2018', classificacoes: Object.fromEntries([...new Set(decisoes.map(d => d.materia))].map(m => [m, decisoes.filter(d => d.materia === m).length])) }))
