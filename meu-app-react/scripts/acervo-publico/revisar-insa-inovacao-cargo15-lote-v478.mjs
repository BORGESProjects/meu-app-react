import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-insa-inovacao-cargo15-v478'
const documento = 'af162f2569af6f90'
const prova = 'https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/036_MCTIINSA_015_01.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/Gab_Definitivo_036_MCTIINSA_015_01.PDF'
const edital = 'https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/ED_1_2023_INSA_ABERTURA_.PDF'
const justificativas = 'https://cdn.cebraspe.org.br/concursos/mcti_insa_24/arquivos/MCTI_INSA_24_Justificativas_de_altera%C3%A7%C3%B5es_de_gabarito.pdf'
const concurso = 'INSA/MCTI 2024 — Tecnologista Pleno 2–I — Cargo 15: Inovação (T15)'
const oficial = JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json', 'utf8')).find(x => x.id === documento)
assert.equal(oficial?.url.toLowerCase(), prova.toLowerCase())
assert.equal(oficial?.questoes.length, 77)
const pendentes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
assert.equal(pendentes.length, 75)
const hashes = new Map(pendentes.map(q => [q.id, hashRevisao(q.enunciado)]))
const ledger = (await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl', 'utf8')).trim().split('\n').map(JSON.parse)
const chave = ledger.find(x => x.documento_id === documento)
assert.equal(chave?.status, 'tabela_lida')
assert.equal(chave?.gabarito_url, gabarito)
assert.equal(Object.keys(chave.respostas).length, 60)

const duplicatas = new Map([
  ['extr-c323c2d063d09734c263', 'extr-6bbb9e524eac089b2cab'],
  ['extr-c0c366dea20ad89d4520', 'extr-2c6090548ed1da3c1533'],
  ['extr-ac2f8287a7ec076e21fa', 'extr-bb571629d05cc16fe275'],
  ['extr-e32bc5f43571e861bd34', 'extr-05bab666866262bd1d04'],
  ['extr-b5daa061320c6987f7e0', 'extr-b2b70b2a64c46b983991'],
  ['extr-a4b759aa823c6fc4b682', 'extr-f688a851735865a2b18a'],
  ['extr-dfa551bdbcf769f18877', 'extr-3a1a97aebe4d67962b04']
])
assert.equal(duplicatas.size, 7)

// O OCR de duas colunas deslocou os itens 61–65 para os números 81–85; o 65
// também possui uma cópia com numeração incorreta, apontada para o item canônico.
const numeroCorrigido = new Map([
  ['extr-f0c23da97799bf01db54', 61],
  ['extr-b14df164189ee4176bd2', 62],
  ['extr-5e3dd3f65b3ecd5ac366', 63],
  ['extr-9329b106874c685c05e0', 64],
  ['extr-dfa551bdbcf769f18877', 65],
])

const topicos = new Map([
  [51, ['Ciência, Tecnologia e Inovação', 'Marco legal de CT&I: incentivos tributários à pesquisa, ao desenvolvimento e à inovação']],
  [52, ['Ciência, Tecnologia e Inovação', 'Marco legal de CT&I: dispensa de licitação em projetos de pesquisa e desenvolvimento']],
  [53, ['Ciência, Tecnologia e Inovação', 'Marco legal de CT&I: parcerias público-privadas para pesquisa, desenvolvimento e inovação']],
  [54, ['Propriedade Intelectual', 'Marco legal de CT&I: titularidade da propriedade intelectual em parcerias com ICT']],
  [55, ['Licitações e Contratos', 'Contratação pública de produtos, obras e serviços de pesquisa e desenvolvimento']],
  [56, ['Ciência, Tecnologia e Inovação', 'Política de CT&I: Sistema Brasileiro de Inovação e SIBRATEC']],
  [57, ['Ciência, Tecnologia e Inovação', 'Política Nacional de Inovação: princípios e universalidade das ações de fomento']],
  [58, ['Empreendedorismo', 'Políticas de inovação: programa StartUp Brasil e apoio a startups']],
  [59, ['Ciência, Tecnologia e Inovação', 'Incentivos fiscais de CT&I: redução de IPI para máquinas e equipamentos']],
  [60, ['Ciência, Tecnologia e Inovação', 'Lei de Inovação: acordos de parceria para pesquisa e desenvolvimento tecnológico']],
  [61, ['Desenvolvimento Sustentável', 'ODS 4: metas de alfabetização e competências numéricas']],
  [62, ['Desenvolvimento Sustentável', 'ODS 5: igualdade de gênero e empoderamento de mulheres e meninas']],
  [63, ['Desenvolvimento Sustentável', 'Agenda 2030: natureza voluntária dos Objetivos de Desenvolvimento Sustentável']],
  [64, ['Desenvolvimento Sustentável', 'ODS 16: redução da corrupção e do suborno']],
  [65, ['Desenvolvimento Sustentável', 'ODS 7: energia renovável e acesso universal à energia']],
  [66, ['Ciência, Tecnologia e Inovação', 'Lei de Inovação: conceito e natureza das agências de fomento']],
  [67, ['Ciência, Tecnologia e Inovação', 'Lei de Inovação: definição legal de criador']],
  [68, ['Ciência, Tecnologia e Inovação', 'Lei de Inovação: apoio de diferentes entes federativos à inovação']],
  [69, ['Ciência, Tecnologia e Inovação', 'Lei de Inovação: uso do capital intelectual de ICT pública']],
  [70, ['Propriedade Intelectual', 'Lei de Inovação: transferência de tecnologia e exclusividade']],
  [71, ['Administração Pública', 'Acordos de cooperação técnica: plano de trabalho e requisitos']],
  [72, ['Administração Pública', 'Acordos de cooperação técnica: transferência de recursos entre partícipes']],
  [73, ['Administração Pública', 'Acordos de cooperação técnica: finalidade e interesse recíproco']],
  [74, ['Administração Pública', 'Acordos de cooperação técnica: doação e compartilhamento de bens']],
  [75, ['Administração Pública', 'Transferências da União: contrato de repasse e atuação de agente financeiro']],
  [76, ['Ciência, Tecnologia e Inovação', 'Acordo de parceria com ICT: custeio de despesas operacionais e administrativas']],
  [77, ['Ciência, Tecnologia e Inovação', 'Lei de Inovação: parcerias entre ICT e instituição privada']],
  [78, ['Propriedade Intelectual', 'Lei de Inovação: cessão de direitos e recompensa em acordos de parceria']],
  [79, ['Ciência, Tecnologia e Inovação', 'Lei de Inovação: bolsa de estímulo à inovação para estudantes']],
  [80, ['Ciência, Tecnologia e Inovação', 'Lei de Inovação: transferência de recursos da União para ICT']],
  [81, ['Administração Pública', 'Convênios: distinção entre acordo de cooperação e instrumento com transferência de recursos']],
  [82, ['Administração Pública', 'Convênios: transferência de recursos para execução de programa público']],
  [83, ['Administração Pública', 'Convênios: repasse e execução descentralizada de programa público']],
  [84, ['Administração Pública', 'Transferências da União: conceito de instituição mandatária']],
  [85, ['Administração Pública', 'Convênios: conceito de convenente e responsabilidade pela transferência']],
  [86, ['Licitações e Contratos', 'Contratação pública para solução inovadora: remuneração por custos e incentivo']],
  [87, ['Empreendedorismo', 'Marco legal das startups: debêntures conversíveis']],
  [88, ['Empreendedorismo', 'Marco legal das startups: investidor-anjo e participação societária']],
  [89, ['Empreendedorismo', 'Marco legal das startups: conceito de organização empresarial inovadora']],
  [90, ['Empreendedorismo', 'Marco legal das startups: enquadramento de cooperativas e empresários individuais']],
  [91, ['Gestão da Inovação', 'Níveis de maturidade tecnológica: classificação e escala TRL']],
  [92, ['Gestão da Inovação', 'Níveis de maturidade tecnológica: conceito básico e TRL 1']],
  [93, ['Gestão da Inovação', 'Níveis de maturidade tecnológica: validação de protótipo em laboratório e TRL 4']],
  [94, ['Gestão da Inovação', 'Níveis de maturidade tecnológica: validação de algoritmo e distinção entre potencial e demonstração operacional']],
  [95, ['Gestão da Inovação', 'Níveis de maturidade tecnológica: limites de aplicação do TRL em biotecnologia']],
  [96, ['Empreendedorismo', 'Incubadoras: investimento direto em empresas incubadas']],
  [97, ['Empreendedorismo', 'Incubadoras: internacionalização e comercialização por startups']],
  [98, ['Empreendedorismo', 'Incubadoras de base tecnológica: setores e modelos de negócio apoiados']],
  [99, ['Empreendedorismo', 'Incubação de empresas: lançamento de produto, dificuldades financeiras e apoio']],
  [100, ['Empreendedorismo', 'Incubação de empresas: retorno de startup graduada à incubadora']],
  [101, ['Propriedade Intelectual', 'Patentes: período de graça e divulgação anterior ao depósito']],
  [102, ['Propriedade Intelectual', 'Patentes: novidade, anterioridade e territorialidade']],
  [103, ['Propriedade Intelectual', 'Patentes: busca de anterioridade e exame de patenteabilidade']],
  [104, ['Propriedade Intelectual', 'Patentes e marcas: duração e manutenção dos direitos']],
  [105, ['Propriedade Intelectual', 'Tratado de Cooperação em Matéria de Patentes (PCT) e proteção territorial']],
  [106, ['Propriedade Intelectual', 'Desenho industrial: objeto, autoria e requisitos de registro']],
  [107, ['Propriedade Intelectual', 'Patentes: busca e opinião preliminar sobre patenteabilidade']],
  [108, ['Propriedade Intelectual', 'Programa de computador: objeto e prazo de proteção autoral']],
  [109, ['Propriedade Intelectual', 'Patentes: prazo de vigência da patente de invenção']],
  [110, ['Propriedade Intelectual', 'Patentes: prazo de vigência do modelo de utilidade']],
  [111, ['Empreendedorismo', 'Programa Acredita: renegociação de dívidas e apoio a pequenos negócios']],
  [112, ['Empreendedorismo', 'Microempreendedor individual: limite de empregados e obrigações legais']],
  [113, ['Empreendedorismo', 'MEI e Simples Nacional: limites de receita bruta']],
  [114, ['Empreendedorismo', 'Plano de negócios: planejamento adaptável e gestão do empreendimento']],
  [115, ['Empreendedorismo', 'Franquias: royalties, remuneração e previsão contratual']],
  [116, ['Gestão da Inovação', 'Modelos de inovação: interação entre pesquisa, desenvolvimento e mercado']],
  [117, ['Gestão da Inovação', 'Inovação radical e incremental: conceitos e distinções']],
  [118, ['Gestão da Inovação', 'Inovação no setor público: Programa Nacional de Gestão e Inovação']],
  [119, ['Gestão da Inovação', 'Inovação de produto e de processo: conceitos e exemplos']],
  [120, ['Gestão da Inovação', 'Inovação aberta e fechada: colaboração e compartilhamento de conhecimento']]
])
assert.equal(topicos.size, 70)

const contextos = new Map([
  [51, 'À luz do marco legal de ciência, tecnologia e inovação, julgue os itens a seguir.'],
  [56, 'Acerca das políticas de incentivo tecnológico e de inovação, julgue os itens seguintes.'],
  [61, 'Julgue os itens relativos aos Objetivos de Desenvolvimento Sustentável (ODS).'],
  [66, 'Com base na Lei da Inovação, julgue os itens subsequentes.'],
  [71, 'Julgue os itens referentes a acordos de cooperação técnica.'],
  [76, 'No que se refere a acordos de parceria com instituições científicas, tecnológicas e de inovação (ICT), julgue os itens.'],
  [81, 'Em relação a convênios e instrumentos de transferência de recursos públicos, julgue os itens.'],
  [86, 'No contrato público para solução inovadora, julgue o item seguinte.'],
  [87, 'A respeito do marco legal das startups no Brasil, julgue os itens seguintes.'],
  [91, 'Considere que a escala dos níveis de maturidade tecnológica (TRL — Technology Readiness Levels) vai de 1 (conceito básico) a 9 (tecnologia comprovada em ambiente operacional) e é utilizada na gestão de projetos de pesquisa, desenvolvimento e inovação.'],
  [96, 'Considere que incubadoras de empresas oferecem suporte estratégico, infraestrutura e redes de relacionamento para startups em estágio inicial. Julgue os itens.'],
  [101, 'Em relação à propriedade intelectual e à busca de anterioridade, julgue os itens a seguir.'],
  [106, 'Julgue os itens pertinentes ao registro de patentes, desenhos industriais e programas de computador.'],
  [111, 'Julgue os itens a seguir, referentes a empreendedorismo.'],
  [116, 'Acerca da gestão da inovação, julgue os itens seguintes.']
])
const contextoDe = n => {
  const inicio = [...contextos.keys()].filter(k => k <= n).at(-1)
  return contextos.get(inicio)
}
const faceis = new Set([53, 56, 62, 63, 66, 68, 73, 74, 79, 83, 87, 88, 89, 92, 109, 119])
const dificeis = new Set([52, 55, 57, 60, 61, 65, 67, 69, 70, 72, 75, 77, 78, 80, 86, 91, 93, 94, 95, 96, 97, 100, 101, 102, 103, 104, 105, 106, 107, 108, 110, 111, 112, 113, 115, 116, 117, 118, 120])
const decidirNumero = q => numeroCorrigido.get(q.id) ?? Number(q.numero)

const decisoes = pendentes.map(q => {
  const n = decidirNumero(q)
  const tema = topicos.get(n)
  assert.ok(tema, `Questão sem assunto: ${q.id} (nº ${n})`)
  const pagina = Number(q.pagina)
  const img = `paginas/${documento}-${String(pagina).padStart(4, '0')}.webp`
  const duplicada = duplicatas.has(q.id)
  const chaveItem = chave.respostas[String(n)]
  const anulada = chaveItem === 'X'
  const texto = q.enunciado.replace(/\s+/g, ' ').trim()
  const dificuldade = faceis.has(n) ? 'Fácil' : dificeis.has(n) ? 'Difícil' : 'Média'
  const d = {
    id: q.id,
    sha256_enunciado: hashes.get(q.id),
    materia: tema[0],
    conteudo: tema[1],
    ano: 2025,
    concurso,
    cargo: 'Tecnologista Pleno 2–I — Área de Inovação (Cargo 15, código T15)',
    banca: 'CEBRASPE',
    organizadora: 'CEBRASPE',
    aplicacao: 'Prova objetiva — conhecimentos específicos — aplicada em 23/02/2025 — caderno 036_MCTIINSA_015_01',
    numero: n,
    numero_original: n,
    pagina,
    dificuldade,
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial conforme exigência de interpretação legal, precisão conceitual e aplicação ao cenário do item; não é índice psicométrico publicado pela banca.',
    classificacao_fonte: prova,
    motivo: `Classificação individual conforme o enunciado, o bloco temático do caderno e o conteúdo programático oficial do Cargo 15 — Inovação. Aplicação em 23/02/2025.`,
    texto_apoio: contextoDe(n),
    visual: { pagina, imagem: img, enunciado: texto, texto_apoio: contextoDe(n), motivo: `Página ${pagina} do caderno oficial conferida visualmente; seção temática e enunciado vinculados ao item ${n}.` },
    apta_resolucao: !duplicada,
    remover_pendencias: ['classificacao_especifica_pendente', 'ano_sem_evidencia', 'visual_ausente', 'integridade_visual_pendente', 'dificuldade_nao_informada', 'texto_corrompido', 'texto_corrompido_requer_reconstrucao', 'texto_de_outro_bloco', 'enunciado_incompleto', 'classificacao_pendente'],
    ...(duplicada ? {
      inelegibilidade_motivo: 'recorte_ocr_duplicado_de_item_oficial_reconstruido',
      duplicada_de: duplicatas.get(q.id)
    } : {})
  }
  if (!duplicada && n <= 110) {
    assert.ok(chaveItem, `Gabarito definitivo ausente para item ${n}`)
    d.resposta_correta = chaveItem === 'C' ? 0 : 1
    d.anulada = false
    d.gabarito_oficial = {
      fonte: gabarito,
      arquivo: 'Gab_Definitivo_036_MCTIINSA_015_01.PDF',
      sha256: chave.sha256,
      numero: n,
      resposta: chaveItem,
      criterio: 'Tabela de gabarito definitivo do caderno específico Cargo 15 registrada no inventário de gabaritos oficiais.'
    }
  } else if (!duplicada) {
    // Os itens 111–120 não constam na transcrição verificada do gabarito definitivo.
    // Preserva-se a resolução pelo estudante e desativa-se qualquer resposta automática não comprovada.
    d.resposta_correta = null
    d.anulada = false
  }
  return d
})

assert.equal(decisoes.length, 75)
assert.equal(new Set(decisoes.map(x => x.id)).size, 75)
assert.equal(decisoes.filter(x => x.apta_resolucao).length, 68)
assert.equal(decisoes.filter(x => !x.apta_resolucao).length, 7)
assert.equal(new Set(decisoes.filter(x => x.apta_resolucao).map(x => x.numero)).size, 68)
for (const d of decisoes) await fs.access(`public/acervo-extraido/${d.visual.imagem}`)

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ lote: nome, registros: 75, itens_unicos_revisados: 68, duplicatas_ocr: 7, numerações_corrigidas: 5, matérias: Object.fromEntries([...new Set([...topicos.values()].map(x => x[0]))].map(m => [m, [...topicos].filter(([, v]) => v[0] === m).length])), gabaritos_definitivos_vinculados: 60, sem_chave_oficial_verificada: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120], páginas_originais: [1, 2, 3], publicado: false }, null, 2))
  process.exit(0)
}

const resultado = await aplicarRevisoesIndividuais({ nome, base: raizesAtuais[0], decisoes })
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs', `\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio = {
  ...resultado,
  documento,
  prova,
  gabarito,
  edital,
  justificativas,
  concurso,
  recortes_ocr: 75,
  itens_unicos_revisados: 68,
  duplicatas_ocr: 7,
  numeracoes_corrigidas: 5,
  gabaritos_definitivos_vinculados: 60,
  itens_sem_gabarito_definitivo_verificado: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120],
  publicado: false
}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`, JSON.stringify(relatorio, null, 2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md', `\n\n## INSA/MCTI 2024 — Cargo 15, Inovação — revisão v478\n\n- Revisei os 75 recortes OCR que cobrem 68 itens ainda pendentes do caderno oficial 036_MCTIINSA_015_01; sete cópias de OCR foram vinculadas aos respectivos registros canônicos e retiradas da resolução.\n- Corrigi cinco numerações que a extração em duas colunas deslocou: os itens de ODS 61–65 haviam sido registrados como 81–85. As questões foram associadas aos blocos de ODS, marco de CT&I, acordos de cooperação/parceria, convênios, TRL, incubadoras, propriedade intelectual, empreendedorismo e modelos de inovação.\n- Registrei o Cargo 15 — Tecnologista Pleno 2–I, área de Inovação (T15), CEBRASPE, edital 2024 e aplicação em 23/02/2025. A dificuldade é estimativa editorial. As páginas 1–3 do caderno foram conferidas e vinculadas.\n- Vinculei os gabaritos definitivos verificados para os itens 51–110. Os itens 111–120 não constam na transcrição validada do gabarito; não inventei resposta, e a correção automática permanece desativada para esses itens.\n- Pacote local, sem publicação na nuvem.\n- Fontes: [caderno oficial](<${prova}>), [edital oficial](<${edital}>), [justificativas oficiais](<${justificativas}>), [registro do gabarito definitivo no catálogo](<${gabarito}>).\n`)
console.log(JSON.stringify(relatorio, null, 2))
