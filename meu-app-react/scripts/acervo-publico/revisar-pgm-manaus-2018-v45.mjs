import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { hashRevisao, aplicarRevisoesIndividuais } from './aplicar-revisoes-individuais.mjs'
import { lerArquivoAtual, raizesAtuais } from './acervo-atual.mjs'

const documento = '625c39d0a50a54e7'
const url = 'https://cdn.cebraspe.org.br/concursos/PGM_MANAUS_18_PROCURADOR/arquivos/388_PGMMANAUS001.PDF'
const secoes = [
  [1, 3, 'Direito Administrativo', 'Transformações contemporâneas: constitucionalização, juridicidade, processo administrativo e participação'],
  [4, 6, 'Direito Administrativo', 'Instrumentos de parceria e cooperação para prestação de serviços públicos'],
  [7, 8, 'Direito Administrativo', 'Serviços públicos e direitos dos usuários'],
  [9, 12, 'Direito Administrativo', 'Licitações e contratos administrativos: execução, contratação direta e RDC'],
  [13, 15, 'Direito Administrativo', 'Processo administrativo municipal: delegação, motivação e validade dos atos'],
  [16, 17, 'Direito Administrativo', 'Improbidade administrativa: elemento subjetivo, prova e dano ao erário'],
  [18, 18, 'Direito Administrativo', 'Responsabilidade civil do Estado e independência entre instâncias'],
  [19, 20, 'Direito Ambiental', 'Proteção constitucional do meio ambiente e ação popular ambiental'],
  [21, 23, 'Direito Ambiental', 'SISNAMA e licenciamento ambiental: órgãos, licenças e competências'],
  [24, 26, 'Direito Ambiental', 'Recursos hídricos, proteção florestal e produtos florestais'],
  [27, 28, 'Direito Ambiental', 'Responsabilidade civil ambiental e crimes contra a fauna'],
  [29, 30, 'Direito Ambiental', 'SNUC, unidades de conservação, áreas de preservação permanente e reserva legal'],
  [31, 35, 'Direito Civil', 'Integração das leis, negócios jurídicos, fraude contra credores, prescrição, obrigações e contratos'],
  [36, 37, 'Direito Civil', 'Propriedade, posse e responsabilidade por obrigações condominiais'],
  [38, 38, 'Direito Civil', 'Preferências e privilégios creditórios na insolvência civil'],
  [39, 39, 'Direito Civil', 'Locação urbana: denúncia vazia e prorrogação contratual'],
  [40, 40, 'Direito do Consumidor', 'Cadastro de proteção ao crédito e informação de protesto'],
  [41, 41, 'Direito Civil', 'Direitos autorais e execução pública de obras musicais por streaming'],
  [42, 42, 'Direito Civil', 'Registros públicos: procedimento de dúvida registral e natureza da decisão'],
  [43, 46, 'Direito Civil', 'Responsabilidade civil: dano moral, responsabilidade bancária e repetição do indébito'],
  [47, 51, 'Direito Processual Civil', 'Sujeitos do processo: litisconsórcio, representação processual e assistência'],
  [52, 56, 'Direito Processual Civil', 'Atos processuais, publicidade, tutela de evidência, contraditório e adequação procedimental'],
  [57, 59, 'Direito Processual Civil', 'Procedimentos especiais, ações possessórias, monitória e execução'],
  [60, 62, 'Direito Processual Civil', 'Juizados especiais cíveis e da Fazenda Pública: recursos, partes e competência'],
  [63, 65, 'Direito Constitucional', 'Direito de greve dos servidores públicos e eficácia das normas constitucionais'],
  [66, 66, 'Direito Processual do Trabalho', 'Competência da Justiça do Trabalho para causas de servidores celetistas'],
  [67, 69, 'Direito Constitucional', 'Prerrogativas constitucionais dos vereadores: imunidade e foro'],
  [70, 72, 'Direito Constitucional', 'Controle abstrato de constitucionalidade e técnicas de decisão'],
  [73, 75, 'Direito Constitucional', 'Comissões parlamentares de inquérito: poderes e limites'],
  [76, 78, 'Direito Constitucional', 'Mandado de injunção: legitimidade, omissão normativa e efeitos'],
  [79, 81, 'Direito do Trabalho', 'Rescisão contratual, justa causa e contrato de experiência'],
  [82, 83, 'Direito do Trabalho', 'Convenções e acordos coletivos de trabalho'],
  [84, 87, 'Direito do Trabalho', 'Greve, proteção à maternidade, perdão tácito e equiparação salarial'],
  [88, 90, 'Direito do Trabalho', 'Insalubridade, periculosidade, vínculo de emprego e FGTS'],
  [91, 94, 'Direito Processual do Trabalho', 'Competência, revelia, prova pericial e requisição de testemunha'],
  [95, 99, 'Direito Processual do Trabalho', 'Recursos, remessa necessária, liquidação e execução trabalhista'],
  [100, 102, 'Direito Processual do Trabalho', 'Dissídio coletivo, ação rescisória e mandado de segurança trabalhista'],
  [103, 105, 'Direito Financeiro', 'Lei n.º 4.320/1964: despesas, classificação orçamentária e suprimento de fundos'],
  [106, 107, 'Direito Financeiro', 'Orçamento público: unidade orçamentária e créditos suplementares'],
  [108, 111, 'Direito Financeiro', 'Lei de Responsabilidade Fiscal: crédito, transparência e despesa pública'],
  [112, 112, 'Direito Financeiro', 'Crédito público municipal e autorização para operações de crédito'],
  [113, 114, 'Direito Financeiro', 'Precatórios: obrigações de pequeno valor e juros de mora'],
  [115, 117, 'Direito Previdenciário', 'Seguridade social: gestão, regra da contrapartida e fontes de custeio'],
  [118, 123, 'Direito Previdenciário', 'RGPS: filiação, carência, benefício rural, acumulação, decadência e cálculo'],
  [124, 126, 'Direito Previdenciário', 'RPPS e previdência complementar: aposentadoria, adesão e contagem recíproca'],
  [127, 130, 'Direito Tributário', 'Limitações constitucionais ao poder de tributar e competência tributária'],
  [131, 135, 'Direito Tributário', 'CTN: lançamento, responsabilidade, sujeitos ativos, sigilo e certidões'],
  [136, 138, 'Direito Tributário', 'Tributos municipais, ISSQN, IPTU e regime do Simples Nacional'],
  [139, 141, 'Direito Constitucional', 'Poderes e controle do município: competências legislativas e fiscalização'],
  [142, 147, 'Legislação Institucional', 'Lei Orgânica de Manaus e Lei da PGM: patrimônio, orçamento, poder de polícia e atribuições'],
  [148, 150, 'Direito Constitucional', 'Autonomia municipal, intervenção estadual e interesse local'],
]

const manifesto = JSON.parse(await lerArquivoAtual('manifesto.json'))
const base = raizesAtuais[0]
const decisoes = []
for (const lote of manifesto.lotes) {
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for (const q of qs) {
    if (q.documento_id !== documento || !q.classificacao_pendente || q.integridade_profissional?.apta_resolucao === false || q.classificacao_revisada) continue
    const regra = secoes.find(([de, ate]) => q.numero_original >= de && q.numero_original <= ate)
    if (!regra) throw Error(`Sem seção temática para o item ${q.numero_original}`)
    const [de, ate, materia, conteudo] = regra
    if (!q.enunciado?.trim() || q.tipo_resposta !== 'certo_errado') throw Error(`Integridade/tipo incompatível no item ${q.numero_original}`)
    decisoes.push({
      id: q.id,
      sha256_enunciado: hashRevisao(q.enunciado),
      materia,
      conteudo,
      motivo: `Item ${q.numero_original}: classificação verificada pelo enunciado e pelo cabeçalho temático oficial dos itens ${de}–${ate}, página ${q.pagina}; prova de Procurador da PGM/Manaus, aplicação CEBRASPE 2018.`,
      classificacao_fonte: { materia: `Seção do caderno oficial, itens ${de}–${ate}`, pagina: q.pagina, url },
    })
  }
}
if (decisoes.length !== 114) throw Error(`Esperadas 114 pendências aptas, encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v45-decisoes.json', JSON.stringify(decisoes, null, 2))
const r = await aplicarRevisoesIndividuais({ nome: 'revisao-semantica-v45', base, decisoes })
console.log(JSON.stringify({ ...r, documento, concurso: 'PGM MANAUS PROCURADOR 2018', classificacoes: Object.fromEntries([...new Set(decisoes.map(d => d.materia))].map(m => [m, decisoes.filter(d => d.materia === m).length])) }))
