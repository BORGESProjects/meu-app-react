import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = 'e73e96abe3d750f5'
const fonte = 'https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/CTI_23_PROVA_ORAL_PADRAO_DE_RESPOSTA.PDF'
const raw = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`, 'utf8'))
const pages = new Map([
  [2, ['Engenharia Eletrônica', 'Qualificação de produtos eletroeletrônicos — conformidade eletromagnética, mecânica e ambiental']],
  [5, ['Engenharia de Materiais', 'Caracterização físico-química e elétrica de circuitos impressos flexíveis (PCIFlex)']],
  [31, ['Biossegurança', 'Higienização, desinfecção e boas práticas de laboratório']],
  [54, ['Ciência de Dados', 'Seleção de linguagens, ferramentas e bibliotecas para aprendizado de máquina']],
  [62, ['Ciência de Dados', 'Etapas do ciclo de vida de dados e modelos de aprendizado de máquina']],
  [64, ['Acessibilidade e UX', 'Princípios do design universal e acessibilidade de interfaces']],
  [67, ['Tecnologia da Informação', 'Big data, inteligência artificial, cibersegurança e robótica']],
  [68, ['Interação Humano-Computador', 'Heurísticas de usabilidade de Nielsen']],
  [70, ['Cidades Inteligentes', 'Indicadores de acesso à informação, conectividade e participação cidadã']],
  [96, ['Gestão de Serviços de TI', 'Governança e gestão de serviços — ISO/IEC 20000']],
  [99, ['Gestão de Projetos', 'Scrum, planejamento de sprint e responsabilidades da equipe']],
  [100, ['Gestão de Projetos de TI', 'Manifesto Ágil e princípios de desenvolvimento de software']],
  [101, ['Segurança da Informação', 'Controle de acesso, autenticação, criptografia e proteção de dados']],
  [102, ['Proteção de Dados', 'LGPD, agentes de tratamento e governança de dados pessoais']]
])

const start = raizesAtuais.findIndex(r => r.includes('revisao-hub-servico-social-2019-v146'))
if (start < 0) throw new Error('Base v146 não encontrada')
const base = raizesAtuais[start]
const bases = raizesAtuais.slice(start)
const manifest = JSON.parse(await lerArquivoAtual('manifesto.json', bases))
const byId = new Map()
for (const lot of manifest.lotes) {
  if (!lot.arquivo) continue
  const items = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo, bases)))
  for (const q of items) if (q.documento_id === doc) byId.set(q.id, q)
}
if (raw.length !== 76 || raw.some(x => !byId.has(x.id))) throw new Error(`Esperados 76 registros originais do documento ${doc}; encontrados ${raw.filter(x => byId.has(x.id)).length}`)

const decisions = raw.map(x => {
  const q = byId.get(x.id)
  const classification = pages.get(Number(x.pagina))
  if (!classification) throw new Error(`Página sem classificação: ${x.pagina}`)
  if (!x.imagem || !x.imagem.startsWith(`paginas/${doc}-`)) throw new Error(`Imagem original ausente: ${x.id}`)
  return {
    id: x.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia: classification[0],
    conteudo: classification[1],
    ano: 2023,
    concurso: 'CTI Renato Archer 2023 — padrão de resposta das provas orais (Malotes 1 e 2)',
    numero_original: Number(x.numero),
    pagina: Number(x.pagina),
    classificacao_fonte: fonte,
    motivo: `A imagem da página ${x.pagina} identifica uma prova oral e mostra padrão de resposta/espelho, não um item objetivo. O trecho extraído é parte da resposta esperada, portanto fica fora do acervo resolvível. Classificação temática baseada no tópico oficial e no conteúdo integral da página.`,
    apta_resolucao: false,
    inelegibilidade_motivo: 'Trecho de padrão de resposta de avaliação oral/discursiva; não contém questão objetiva autônoma para resolução.'
  }
})

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ registros: decisions.length, paginas: [...new Set(raw.map(x => x.pagina))], classificacoes: Object.fromEntries([...pages].map(([page, [materia, conteudo]]) => [`${page}: ${materia} — ${conteudo}`, raw.filter(x => Number(x.pagina) === page).length])), fonte, marcadosForaDoResolviv: decisions.length }, null, 2))
  process.exit(0)
}

const report = await aplicarRevisoesIndividuais({ nome: 'revisao-cti-oral-respostas-2023-v147', base, decisoes: decisions })
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cti-oral-respostas-2023-v147/acervo-extraido')
const output = { ...report, fonte, registros_revistos: decisions.length, registros_discursivos_excluidos: decisions.length, publicada: false }
await fs.writeFile('docs/acervo/revisao-profissional/revisao-cti-oral-respostas-2023-v147.json', JSON.stringify(output, null, 2))
console.log(JSON.stringify(output, null, 2))
