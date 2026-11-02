import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-seduc-al-ciencias-cargo3-2018-lote-v466'
const documento = '42a5d270718ce154'
const prova = 'https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/MATRIZ_376_SEDUCAL003__PAG_4.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/GAB_DEFINITIVO_376_SEDUCAL003.PDF'
const concurso = 'SEDUC/AL — Professor — Especialidade Ciências'
const aplicacao = 'Prova objetiva — conhecimentos específicos — Cargo 3'
const arquivoLotes = [
  'lotes/blocos-326-62755a128f67.json.gz',
  'lotes/blocos-327-a498963219bd.json.gz',
  'lotes/blocos-328-c9514bb76070.json.gz',
]

// Matéria, conteúdo específico e dificuldade editorial estimada, item a item.
const classificacoes = {
  51: ['Biologia', 'Virologia: transmissão da febre amarela', 'Fácil'],
  52: ['Biologia', 'Virologia: estrutura viral e ausência de organelas celulares', 'Fácil'],
  53: ['Biologia', 'Virologia: material genético dos vírus', 'Fácil'],
  54: ['Biologia', 'Virologia: ribossomos e estrutura acelular', 'Fácil'],
  55: ['Biologia', 'Ecologia: hospedeiros e transmissão de zoonoses', 'Média'],
  56: ['Biologia', 'Evolução: parentesco entre primatas e seres humanos', 'Média'],
  57: ['Biologia', 'Virologia: teorias sobre a origem dos vírus', 'Média'],
  58: ['Biologia', 'Histologia animal: tecido muscular estriado cardíaco', 'Fácil'],
  59: ['Biologia', 'Fisiologia animal: contração dos tecidos musculares', 'Média'],
  60: ['Biologia', 'Fisiologia humana: sangue, trombólise e coagulação', 'Média'],
  61: ['Biologia', 'Citologia: mitocôndrias e metabolismo celular', 'Fácil'],
  62: ['Biologia', 'Histologia: sangue como tecido conjuntivo', 'Fácil'],
  63: ['Biologia', 'Citologia: estruturas básicas das células animais', 'Fácil'],
  64: ['Biologia', 'Saúde sexual: prevenção da gravidez e de ISTs', 'Fácil'],
  65: ['Biologia', 'Fisiologia reprodutiva: ciclo menstrual e período fértil', 'Média'],
  66: ['Biologia', 'Genética: herança ligada ao cromossomo X', 'Média'],
  67: ['Biologia', 'Saúde na adolescência: sexualidade e fatores psicossociais', 'Média'],
  68: ['Biologia', 'Endocrinologia: hormônios sexuais na puberdade', 'Fácil'],
  69: ['Biologia', 'Imunização: vacina contra HPV e prevenção de infecções', 'Fácil'],
  70: ['Biologia', 'Virologia e saúde: HPV e câncer do colo do útero', 'Fácil'],
  71: ['Biologia', 'Citologia: membrana plasmática e parede celular', 'Fácil'],
  72: ['Biologia', 'Evolução vegetal: origem e diversificação das algas', 'Média'],
  73: ['Biologia', 'Ecologia e conservação: pesca incidental e peixe-boi-marinho', 'Fácil'],
  74: ['Biologia', 'Zoologia: exoesqueleto em grupos de invertebrados', 'Fácil'],
  75: ['Biologia', 'Ecologia: fotossíntese e simbiose entre zooxantelas e corais', 'Média'],
  76: ['Química', 'Estequiometria: massa molar do etanol', 'Fácil'],
  77: ['Química', 'Estequiometria: combustão do etanol e produção de dióxido de carbono', 'Média'],
  78: ['Química', 'Estequiometria: consumo de oxigênio na combustão', 'Média'],
  79: ['Química', 'Termoquímica e estequiometria: energia por quantidade de matéria', 'Difícil'],
  80: ['Química', 'Misturas e soluções: classificação do etanol hidratado', 'Fácil'],
  81: ['Física', 'Gases ideais: relação entre densidade e pressão atmosférica', 'Média'],
  82: ['Física', 'Atmosfera: pressão em função da altitude', 'Média'],
  83: ['Física', 'Interpretação de gráfico: escala logarítmica e pressão atmosférica', 'Média'],
  84: ['Física', 'Ondas eletromagnéticas: reflexão na ionosfera', 'Média'],
  85: ['Física', 'Ondas eletromagnéticas: frequência, comprimento de onda e velocidade', 'Fácil'],
  86: ['Física', 'Espectro eletromagnético: radiação visível', 'Fácil'],
  87: ['Física', 'Óptica física: lei de Beer–Lambert e análise dimensional', 'Média'],
  88: ['Geografia', 'Climatologia: evapotranspiração e fatores climáticos', 'Média'],
  89: ['Física', 'Óptica física: absorção e vibração molecular', 'Média'],
  90: ['Física', 'Óptica geométrica: vergência de lentes', 'Média'],
  91: ['Física', 'Óptica geométrica: hipermetropia e lentes corretivas', 'Média'],
  92: ['Biologia', 'Ecologia: atmosfera e manutenção da biosfera', 'Fácil'],
  93: ['Física', 'Termologia: transferência de calor em ambientes aquáticos', 'Média'],
  94: ['Física', 'Termologia: transferência de calor no vácuo', 'Fácil'],
  95: ['Biologia', 'Ecologia: extremófilos e fontes de energia', 'Média'],
  96: ['Educação', 'Metodologia do ensino de Ciências: abordagem cognitiva', 'Fácil'],
  97: ['Educação', 'Metodologia do ensino de Ciências: diálogo e linguagem científica', 'Fácil'],
  98: ['Educação', 'Ensino de Ciências: história e filosofia da ciência', 'Média'],
  99: ['Educação', 'Metodologia do ensino de Ciências: investigação e experimentação', 'Fácil'],
  100: ['Educação', 'Educação científica: relações entre ciência, tecnologia e sociedade', 'Média'],
  101: ['Educação', 'Metodologia do ensino de Ciências: interação em sala de aula', 'Fácil'],
  102: ['Educação', 'Ensino de Ciências: natureza e construção do conhecimento científico', 'Média'],
  103: ['Educação', 'Educação não formal: espaços de ensino de Ciências', 'Fácil'],
  104: ['Educação', 'Tecnologia educacional: preparação para uso pedagógico', 'Média'],
  105: ['Educação', 'Teorias pedagógicas: construtivismo e transmissão de conhecimentos', 'Média'],
  106: ['Educação Ambiental', 'Educação ambiental: cidadania local e planetária', 'Média'],
  107: ['Educação Ambiental', 'Educação ambiental: sustentabilidade e políticas públicas', 'Média'],
  108: ['Educação Ambiental', 'Educação ambiental: diversidade cultural e povos indígenas', 'Média'],
  109: ['Educação Ambiental', 'Educação ambiental: comunicação e circulação de conhecimento', 'Média'],
  110: ['Educação Ambiental', 'Educação ambiental: consumismo e mudança de práticas', 'Média'],
  111: ['Educação Ambiental', 'História ambiental: Primavera Silenciosa e ambientalismo', 'Média'],
  112: ['Educação Ambiental', 'História ambiental: Conferência de Estocolmo', 'Média'],
  113: ['Educação Ambiental', 'História da educação ambiental e poluição urbana', 'Média'],
  114: ['Biologia', 'Genética e biotecnologia: Projeto Genoma Humano', 'Média'],
  115: ['Biologia', 'Genética molecular: método de sequenciamento de Sanger', 'Média'],
  116: ['Biologia', 'Genética bacteriana: plasmídeos', 'Fácil'],
  117: ['Biologia', 'Genética molecular: composição química do DNA', 'Fácil'],
  118: ['Biologia', 'Genética molecular: técnicas de sequenciamento genômico', 'Média'],
  119: ['Biologia', 'Genética molecular: nucleotídeos e estrutura do DNA', 'Fácil'],
  120: ['Biologia', 'Biotecnologia: sequenciamento de nova geração e método de Sanger', 'Média'],
}

const contextos = [
  { inicio: 51, fim: 56, texto: 'Contexto: no ciclo silvestre da febre amarela, primatas não humanos são hospedeiros e mosquitos silvestres atuam como vetores. O ser humano pode ser hospedeiro acidental; no ciclo urbano, a transmissão ocorre por mosquitos infectados. A página original da prova permanece vinculada.' },
  { inicio: 58, fim: 63, texto: 'A respeito do músculo cardíaco e do sangue humanos, julgue os itens subsequentes.' },
  { inicio: 64, fim: 70, texto: 'Contexto: projeto estadual de prevenção da gravidez na adolescência, com dados de casos registrados em Alagoas em 2016 e ações de orientação sobre reprodução, práticas sexuais de risco, contracepção e vacinação contra HPV. A página original permanece vinculada.' },
  { inicio: 71, fim: 75, texto: 'Contexto: Área de Proteção Ambiental Costa dos Corais, unidade marinha com recifes, mangues e biodiversidade de algas, corais, peixes, crustáceos, moluscos e mamíferos aquáticos, incluindo espécies ameaçadas. A página original permanece vinculada.' },
  { inicio: 76, fim: 79, texto: 'Contexto: reação de oxidação do etanol, com liberação de 327 kcal por mol; massas atômicas de carbono, oxigênio e hidrogênio iguais a 12, 16 e 1, respectivamente. A equação original permanece visível na imagem da prova.' },
  { inicio: 81, fim: 83, texto: 'Contexto: gráfico da pressão atmosférica (N/m²) em função da altitude (km), com eixo vertical logarítmico (ln), eixo horizontal linear e atmosfera ideal à temperatura constante. O gráfico original permanece vinculado à questão.' },
  { inicio: 84, fim: 86, texto: 'Contexto: duas antenas, emissora e receptora, utilizam a ionosfera para transmitir sinais; considere a velocidade da luz igual a 3 × 10⁸ m/s. O esquema original permanece vinculado à questão.' },
  { inicio: 87, fim: 89, texto: 'Contexto: lei de Beer–Lambert para a intensidade de radiação que atravessa a atmosfera: I = I₀e^(−μx), em que I₀ é a intensidade incidente, x é o percurso no meio e μ é o coeficiente de absorção óptica.' },
  { inicio: 92, fim: 95, texto: 'A respeito das relações entre energia, vida e condições ambientais, julgue os itens a seguir.' },
  { inicio: 96, fim: 100, texto: 'Contexto: a abordagem cognitiva no ensino de Ciências considera a construção do conhecimento como processo individual e social, relacionado ao ambiente e aos contextos sociais e culturais dos estudantes. O texto-base e sua referência permanecem na página original vinculada.' },
  { inicio: 101, fim: 105, texto: 'Contexto: reflexão sobre a pesquisa como atividade humana e sobre a ciência como forma sistemática de produzir conhecimento, impulsionada por perguntas, contradições e necessidades de compreensão dos fenômenos naturais.' },
  { inicio: 106, fim: 110, texto: 'Contexto: itens sobre o Tratado de Educação Ambiental para Sociedades Sustentáveis e Responsabilidade Global, elaborado no Fórum Global da Rio-92, e sobre princípios de educação, sustentabilidade e políticas públicas.' },
  { inicio: 111, fim: 113, texto: 'No que concerne aos marcos históricos relacionados à educação ambiental, julgue os itens que se seguem.' },
  { inicio: 114, fim: 120, texto: 'Com relação ao Projeto Genoma Humano e a estratégias de sequenciamento disponíveis, julgue os itens seguintes.' },
]
const apoioPorNumero = n => contextos.find(x => n >= x.inicio && n <= x.fim)?.texto || ''
const enunciadosCorrigidos = {
  63: 'As células do sangue e do tecido muscular cardíaco possuem membrana celular, citoplasma e núcleo.',
  70: 'A infecção por HPV necessariamente implicará o desenvolvimento do câncer de colo do útero.',
  73: 'Uma das ameaças ao peixe-boi-marinho é a captura acidental em redes de pesca.',
  75: 'A fotossíntese ocorre em recifes de coral especialmente quando da existência de relação simbiótica entre algas zooxantelas e corais.',
  80: 'Álcool etílico hidratado é uma mistura homogênea.',
  83: 'A 4 km de altura, a pressão atmosférica é 40% do seu valor ao nível do mar.',
  86: 'Apenas parte da radiação solar forma a luz que é visível a olho nu, como é o caso dos comprimentos de onda que formam as sete cores do arco-íris.',
  91: 'Em um olho hipermetrope, os raios paralelos são focalizados de tal modo que a imagem se forma atrás da retina, por isso a lente corretiva adequada nesse caso é a ilustrada na figura a seguir.',
  95: 'Os extremófilos em solo oceânico têm como fonte principal de energia a radiação infravermelha proveniente do Sol.',
  100: 'Na abordagem cognitivista do ensino de ciências, o foco se dá na análise dos impactos ambientais promovidos pelo desenvolvimento científico e tecnológico e na promoção do desenvolvimento de ações de conservação, o que demanda a análise das implicações sociais, políticas e éticas.',
  105: 'A produção de materiais de boa qualidade informativa e a exposição entusiástica pelo professor na transmissão de seus conhecimentos para os estudantes constitui a base dos princípios construtivistas.',
  110: 'As diretrizes propostas nesse tratado incluem a identificação e o estudo das causas dos hábitos consumistas da sociedade contemporânea, o que poderá permitir mudanças nas práticas adotadas e redução do consumismo exagerado.',
  120: 'As tecnologias de sequenciamento de nova geração se baseiam na química de Sanger, em que se observa o término da síntese de DNA com a incorporação de sondas fluorescentes.',
}
const canonicosDuplicados = new Map([
  ['extr-b1067323b12b4a11caf1', 'extr-456e6058e4d7e604685d'],
  ['extr-e45aeb9417e7087e1c49', 'extr-75d5898d9274db2bd57b'],
  ['extr-d46c632853f57f7524de', 'extr-990af56f06e71445a6e4'],
  ['extr-130b038bcafbb9992815', 'extr-fb15656f2b8243a63562'],
])
const removiveis = [
  'classificacao_especifica_pendente', 'ano_sem_evidencia', 'dificuldade_nao_informada',
  'visual_ausente', 'texto_corrompido', 'texto_corrompido_requer_reconstrucao',
  'texto_de_outro_bloco', 'enunciado_incompleto',
]

const registros = []
for (const arquivo of arquivoLotes) {
  const questoes = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(arquivo)))
  registros.push(...questoes.filter(q => q.documento_id === documento))
}
assert.equal(registros.length, 74, `Esperados 74 registros do documento; recebidos ${registros.length}`)
const porNumero = new Map()
for (const q of registros) {
  const n = Number(q.numero_original)
  assert.ok(n >= 51 && n <= 120, `Numeração inesperada: ${q.id} / ${n}`)
  const grupo = porNumero.get(n) || []
  grupo.push(q)
  porNumero.set(n, grupo)
  assert.equal(q.tipo_resposta, 'certo_errado', `Tipo de resposta inesperado no item ${n}`)
  assert.equal(q.opcoes?.length, 2, `Alternativas C/E ausentes ou duplicadas no item ${n}`)
  assert.ok((q.imagens_paginas || []).length || q.pagina_imagem || q.imagem, `Imagem original sem referência no item ${n}`)
}
assert.equal(porNumero.size, 70, 'O caderno oficial deve cobrir os itens 51 a 120')
for (let n = 51; n <= 120; n++) assert.ok(porNumero.has(n), `Item ${n} ausente`)
for (const [n, grupo] of porNumero) assert.ok(grupo.length === 1 || [57, 58, 59, 63].includes(n), `Duplicata não auditada no item ${n}`)
assert.deepEqual([...porNumero].filter(([, g]) => g.length > 1).map(([n]) => n).sort((a,b)=>a-b), [57, 58, 59, 63])

const decisoes = []
for (let numero = 51; numero <= 120; numero++) {
  const [materia, conteudo, dificuldade] = classificacoes[numero] || []
  assert.ok(materia && conteudo && dificuldade, `Classificação ausente no item ${numero}`)
  const grupo = porNumero.get(numero)
  const canonicalId = grupo.length === 1
    ? grupo[0].id
    : grupo.find(q => !canonicosDuplicados.has(q.id))?.id
  assert.ok(canonicalId, `Registro canônico não localizado no item ${numero}`)
  for (const q of grupo) {
    const duplicada = q.id !== canonicalId
    const decisao = {
      id: q.id,
      sha256_enunciado: hashRevisao(q.enunciado),
      materia,
      conteudo,
      ano: 2018,
      concurso,
      banca: 'CEBRASPE',
      organizadora: 'CEBRASPE',
      aplicacao,
      cargo: 'Professor — Especialidade Ciências',
      numero_original: numero,
      pagina: Number(q.pagina),
      dificuldade,
      dificuldade_estimada: true,
      dificuldade_evidencia: 'Estimativa editorial baseada no número de etapas conceituais, interpretação de contexto e operações exigidas; não é nível oficial da banca.',
      classificacao_fonte: prova,
      motivo: 'Classificação por leitura individual, conferência da numeração e do conteúdo no caderno oficial; cargo e aplicação confrontados com a página oficial do concurso e com o gabarito definitivo do Cargo 3.',
      texto_apoio: apoioPorNumero(numero),
      apta_resolucao: !duplicada,
      remover_pendencias: removiveis,
    }
    if (Object.hasOwn(enunciadosCorrigidos, numero) && !duplicada) decisao.enunciado = enunciadosCorrigidos[numero]
    if (duplicada) {
      decisao.inelegibilidade_motivo = 'duplicata_do_mesmo_item_no_documento_oficial_seduc_al_cargo3_2018'
      decisao.duplicada_de = canonicalId
    }
    decisoes.push(decisao)
  }
}
assert.equal(decisoes.length, 74)

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({
    documento, edicao: concurso, itens: porNumero.size, registros: registros.length,
    pendentes_a_classificar: registros.filter(q => q.classificacao_pendente).length,
    duplicatas_internas: canonicosDuplicados.size,
    itens_com_texto_reparado: Object.keys(enunciadosCorrigidos).length,
    imagens_preservadas: registros.every(q => (q.imagens_paginas || []).length || q.pagina_imagem || q.imagem),
    prova, gabarito_definitivo_consultado: gabarito,
    publicado: false,
  }, null, 2))
  process.exit(0)
}

const resultado = await aplicarRevisoesIndividuais({ nome, base: raizesAtuais[0], decisoes })
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs', `\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio = {
  ...resultado,
  documento,
  concurso,
  itens_oficiais: porNumero.size,
  registros_revisados: registros.length,
  classificados: registros.filter(q => q.classificacao_pendente).length,
  duplicatas_marcadas: canonicosDuplicados.size,
  textos_reparados: Object.keys(enunciadosCorrigidos).length,
  imagens_e_paginas_de_origem_preservadas: true,
  gabarito_definitivo_consultado: gabarito,
  gabarito_nao_associado_automaticamente: true,
  prova,
  publicado: false,
  nota: 'Os itens corretos continuam com as opções C/E e suas páginas originais. Quatro cópias internas foram marcadas inelegíveis, sem excluir o histórico nem alterar as respostas do estudante.',
}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`, JSON.stringify(relatorio, null, 2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md', `\n\n## SEDUC/AL — Professor, especialidade Ciências — 2018 — revisão v466\n\n- Classifiquei individualmente os 70 itens numerados de 51 a 120 em Biologia, Química, Física, Geografia, Educação e Educação Ambiental, com conteúdo específico e dificuldade editorial estimada.\n- Revisei 74 registros: 4 eram cópias internas dos itens 57, 58, 59 e 63; as cópias estão inelegíveis e vinculadas ao registro canônico.\n- Separei trechos de questões seguintes que haviam sido concatenados a 13 enunciados; os textos-base foram associados ao bloco correto e as referências de página/imagem existentes foram preservadas.\n- O gabarito definitivo do Cargo 3 foi consultado, mas não associado automaticamente porque o lote de itens é C/E e a vinculação precisa de uma conferência item a item independente.\n- Validação local pendente nesta execução; nenhuma publicação na nuvem ocorreu.\n- Fontes oficiais: [caderno do Cargo 3](${prova}) e [gabarito definitivo](${gabarito}).\n`)
console.log(JSON.stringify(relatorio, null, 2))
