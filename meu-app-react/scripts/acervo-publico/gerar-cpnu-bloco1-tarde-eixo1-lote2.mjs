import { readFile, writeFile, mkdir } from 'node:fs/promises'

const root = new URL('../../', import.meta.url)
const template = JSON.parse(await readFile(new URL('src/data/cpnu-2024-bloco-7-manha-gerais.json', root), 'utf8'))[0]
const pdf = 'https://www.gov.br/gestao/pt-br/concursonacional/caderno-de-provas/tarde/prova-9-gabarito-1-infraestrutura-exatas-e-engenharia-tarde.pdf'
const key = 'https://www.gov.br/gestao/pt-br/concursonacional/gabaritos-finais/cpnu2024_gabaritosoficiais_todos-os-blocos-tarde.pdf'
const answers = ['D', 'E', 'C', 'B', 'A']
const rows = [
  { n: 6, page: 3, subject: 'Administração Pública', topic: 'Execução orçamentária', stem: 'Em junho de 2023, um órgão da estrutura de um determinado ministério recebeu um crédito orçamentário no valor de R$ 17 milhões, por meio de suplementação, para cumprir um acordo feito com o Ministério Público (MP). O acordo se referia à realização imediata de obras de recuperação de um edifício tombado, com estrutura arquitetônica ameaçada. O órgão não conseguiu preparar os projetos necessários para realizar a licitação antes do encerramento do exercício, portanto não empenhou o valor para a realização das obras. Para não perder os recursos, o órgão empenhou o valor para cobertura de outros contratos que estavam com empenhos insuficientes. Com isso, o órgão não cumpriu o programa de trabalho original, mas se comprometeu internamente a cumprir o acordo com o MP no exercício seguinte. Esse tipo de situação está compreendido no âmbito das atividades relativas a', options: ['auditoria de gestão.', 'auditoria operacional.', 'tomada de contas especial.', 'controle da execução orçamentária.', 'avaliação da fidelidade funcional dos agentes públicos.'] },
  { n: 7, page: 3, subject: 'Gestão de Riscos', topic: 'Identificação de eventos de risco', stem: 'Um órgão da estrutura de um determinado ministério estava conduzindo a implantação da Política de Gestão de Riscos aprovada pelo seu Comitê de Governança, com base nas boas práticas de gestão de riscos aplicáveis às entidades públicas. Na etapa de identificação de eventos de risco, foi apontada a necessidade de identificar eventos capazes de impactar os objetivos de comunicação externa das informações financeiras da organização. Pelas suas características intrínsecas, uma técnica adequada para identificar esse tipo de evento é', options: ['inventário de eventos.', 'análise de alçadas e limites.', 'análise de fluxos de processos.', 'proposição de indicadores preventivos de eventos.', 'realização de seminários e entrevistas com facilitadores.'] },
  { n: 8, page: 3, subject: 'Direito de Acesso à Informação', topic: 'Lei de Acesso à Informação: pedidos que exigem trabalho adicional', stem: 'Em janeiro de 2023, um órgão da estrutura de um determinado ministério recebeu um pedido de acesso a informação que requeria disponibilizar cópias com inteiro teor com dados sobre a execução dos contratos de prestação de serviço de vigilância armada em vigor no período de 2007 a 2014. Ocorre que houve um incêndio na área onde funcionava a Divisão de Gestão Documental e da Informação, que destruiu o acervo, incluindo os processos que continham os contratos em suporte físico. Dessa forma, para atender o pedido de acesso à informação, o órgão precisaria designar uma comissão para reconstituir os processos. Considerando-se que o órgão tem compromisso declarado com a transparência ativa e passiva e também as disposições da legislação aplicável, o referido pedido de acesso à informação', options: ['deve ser atendido em até 180 dias, pela necessidade de levantamento das informações.', 'deve ser encaminhando à deliberação do ministério acerca do seu atendimento.', 'não é de atendimento obrigatório, pois exige trabalho adicional de processamento de informações indisponíveis.', 'pode ser atendido, desde que o motivo do pedido de acesso à informação seja considerado relevante.', 'tem atendimento facultativo se o requerente aceitar expressamente aguardar o prazo necessário para levantar as informações.'] },
  { n: 9, page: 4, subject: 'Planejamento Estratégico', topic: 'Etapas da gestão estratégica', stem: 'P e R trabalham na gerência operacional de uma empresa pública de tecnologia da informação que vem apresentando baixa eficiência em seus processos produtivos. Para melhorar a eficiência dos processos, o gerente da unidade pediu que eles organizassem as etapas fundamentais do processo de gestão estratégica, que são:', options: ['desenvolvimento de produto, marketing, vendas e pós-venda.', 'análise, planejamento, implementação e monitoramento.', 'recrutamento, seleção, treinamento e desenvolvimento.', 'compra, produção, distribuição e contabilidade.', 'inovação, financiamento, aquisições e fusões.'] },
  { n: 10, page: 4, subject: 'Políticas Públicas', topic: 'Articulação entre governos e parcerias público-privadas', stem: 'As políticas públicas dos Estados contemporâneos são um dos ramos mais importantes do pensamento social da atualidade para a qualidade de vida em diversos níveis e em escalas geográficas distintas. Tais políticas serão mais bem-sucedidas quando, no nível da ação, a articulação entre as parcerias público-privadas e os governos locais, estaduais e federal seja', options: ['flexível e adaptável.', 'pragmática e rígida.', 'objetiva e restritiva.', 'subjetiva e limitada.', 'hierárquica e finita.'] },
]

const labels = ['A', 'B', 'C', 'D', 'E']
const questions = rows.map((row, i) => {
  const q = structuredClone(template)
  const answer = answers[i]
  const index = labels.indexOf(answer)
  const officialAnswer = { verificada: true, url: key, pdf_url: pdf, numero: row.n, resposta: answer, anulada: false }
  Object.assign(q, {
    id: `cpnu-2024-bloco-1-tarde-eixo-1-q${row.n}`, ano: 2024, ano_concurso: 2024, ano_aplicacao: 2024,
    numero: row.n, numero_original: row.n, modelo: 'Gabarito 1', banca: 'CPNU', organizadora: 'Fundação Cesgranrio',
    concurso: 'CPNU 2024 — Bloco 1, Infraestrutura, Exatas e Engenharia (tarde)', cargo: 'Bloco 1 — Infraestrutura, Exatas e Engenharia',
    aplicacao: '18/08/2024 — prova objetiva oficial', materia: row.subject, conteudo: row.topic,
    dificuldade: 'Média', dificuldade_estimada: true, dificuldade_metodo: 'estimativa editorial pela complexidade conceitual e de interpretação exigida',
    enunciado: row.stem, texto_apoio: '', opcoes: row.options, rotulos_opcoes: labels, resposta_correta: index,
    anulada: false, tipo_resposta: 'alternativa', tipo: 'objetiva', provas: ['CPNU 2024 — Prova 9 — Gabarito 1 — Bloco 1 — tarde'],
    documento_id: 'cpnu-2024-prova-9-gabarito-1-bloco-1-tarde',
    documento_origem: 'prova-9-gabarito-1-infraestrutura-exatas-e-engenharia-tarde.pdf',
    arquivo_origem: 'prova-9-gabarito-1-infraestrutura-exatas-e-engenharia-tarde.pdf', pagina: row.page, paginas_origem: [row.page],
    fonte_pdf: pdf, fonte_gabarito: key, apoio: [], gabarito_oficial: officialAnswer,
    origens_provas: [{ concurso: 'CPNU 2024 — Bloco 1 — tarde', aplicacao: '18/08/2024', modelo: 'Gabarito 1', numero_original: row.n,
      pagina: row.page, arquivo_origem: 'prova-9-gabarito-1-infraestrutura-exatas-e-engenharia-tarde.pdf', fonte_pdf: pdf,
      fonte_gabarito: key, resposta_correta: index, anulada: false, gabarito_oficial: officialAnswer }],
    classificacao_revisada: true, classificacao_pendente: false, classificacao_confianca: 1,
    classificacao_metodo: 'classificação editorial pelo conceito diretamente cobrado no caderno oficial',
    classificacao_evidencia: `Caderno oficial CPNU 2024, Prova 9 Gabarito 1, página ${row.page}; gabarito final oficial da tarde, Bloco 1`,
    integridade_profissional: { verificada_individualmente: true, apta_resolucao: true, pendencias: [], fontes_verificadas: true, questao_completa: true },
    elegibilidade: { elegivel_para_resolucao: true, elegivel_para_correcao_automatica: true, apontamentos: [] },
    origem: 'Caderno oficial CPNU 2024 — Prova 9 — Bloco 1 — tarde',
  })
  return q
})

if (questions.length !== 5 || questions.some((q, i) => q.numero_original !== i + 6 || q.opcoes.length !== 5 || !q.gabarito_oficial.verificada || q.rotulos_opcoes[q.resposta_correta] !== answers[i])) throw new Error('Validação estrutural CPNU Bloco 1 tarde q6–10 falhou')
const out = new URL('src/data/cpnu-2024-bloco-1-tarde-eixo-1-lote-2.json', root)
const dir = new URL('public/acervo/cpnu-2024-bloco-1-tarde-eixo-1-lote-2/', root)
await mkdir(dir, { recursive: true })
await writeFile(out, `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
await writeFile(new URL('questoes.json', dir), `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
console.log('Generated CPNU Block 1 afternoon questions 6–10 from official booklet and final key.')
