import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-dataprev-2023-tecnico-seguranca-cargo25-v467'
const documento = 'dfc684c1def1a379'
const prova = 'https://cdn.cebraspe.org.br/concursos/DATAPREV_23/arquivos/893_DATAPREV_025_01.PDF'
const gabaritoUrl = 'https://cdn.cebraspe.org.br/concursos/DATAPREV_23/arquivos/GAB_DEFINITIVO_893_DATAPREV_025_01.PDF'
const gabaritoSha = '6d35f88c6255260b49b3131898aaaeabf42ef99a1f8795eef10f6e5a76d2ec22'
const concurso = 'DATAPREV — Técnico de Segurança do Trabalho — 2023'
const aplicacao = 'Prova objetiva — conhecimentos específicos — Cargo 25 — caderno 893_DATAPREV_025_01'
const indicesLote = Array.from({ length: 40 }, (_, i) => 1772 + i)

const assuntos = {
  51: ['Higiene ocupacional: agentes físicos e doenças ocupacionais', 'Fácil'],
  52: ['Higiene ocupacional: identificação de exposições ocupacionais', 'Média'],
  53: ['Higiene ocupacional: classificação de agentes físicos e químicos', 'Média'],
  54: ['Ergonomia: posturas e riscos ergonômicos', 'Fácil'],
  55: ['SESMT: acompanhamento do plano de ação do PGR', 'Média'],
  56: ['SESMT: modalidades de constituição', 'Fácil'],
  57: ['SESMT: atribuições e responsabilidades profissionais', 'Média'],
  58: ['SESMT: dimensionamento e grau de risco', 'Média'],
  59: ['PCA: exames audiométricos ocupacionais', 'Fácil'],
  60: ['PCA: avaliação da aptidão e perda auditiva ocupacional', 'Média'],
  61: ['Saúde ocupacional: nexo causal e perda auditiva', 'Média'],
  62: ['PCA: avaliação da exposição, controles e acompanhamento audiológico', 'Média'],
  63: ['Iluminamento: adaptação da iluminação à tarefa e à capacidade visual', 'Média'],
  64: ['Iluminamento: níveis mínimos em ambientes de trabalho', 'Fácil'],
  65: ['Iluminamento: controle de luz natural e persianas', 'Fácil'],
  66: ['Iluminamento: ofuscamento, cintilação e avaliação visual', 'Média'],
  67: ['EPI: certificado de aprovação e comercialização', 'Fácil'],
  68: ['EPI: fornecimento, adequação e responsabilidades do empregador', 'Fácil'],
  69: ['EPI: responsabilidades do empregado quanto à conservação', 'Fácil'],
  70: ['EPI: treinamento para uso seguro', 'Fácil'],
  71: ['Proteção contra incêndio: dimensionamento de sistemas fixos', 'Média'],
  72: ['Proteção contra incêndio: detectores de gases e fumaça', 'Média'],
  73: ['Proteção contra incêndio: sprinklers e acionamento térmico', 'Fácil'],
  74: ['Proteção contra incêndio: sistemas de detecção endereçáveis', 'Fácil'],
  75: ['Acidente do trabalho: conceito legal e agressão no ambiente laboral', 'Média'],
  76: ['Acidente do trabalho: atividade laboral em regime de home office', 'Média'],
  77: ['Acidente do trabalho: força maior e prestação de socorro', 'Média'],
  78: ['Acidente do trabalho: nexo técnico epidemiológico', 'Média'],
  79: ['Acidente do trabalho: acidente de trajeto e atividade externa', 'Média'],
  80: ['Acidente do trabalho: distinção entre enquadramento legal e técnico', 'Média'],
  81: ['Investigação de acidentes: falhas, causas e registro estatístico', 'Média'],
  82: ['Gerenciamento de riscos: perigo, dano, probabilidade e risco', 'Média'],
  83: ['Estatística de acidentes: média, moda e mediana', 'Média'],
  84: ['Investigação de acidentes: análise causal e atribuições do SESMT', 'Média'],
  85: ['Acidente do trabalho: comunicação em caso de doença suspeita', 'Fácil'],
  86: ['Investigação de acidentes: identificação de causas e prevenção', 'Média'],
  87: ['Acidente do trabalho: responsabilidades e benefícios previdenciários', 'Média'],
  88: ['CAT: comunicação e registro de acidente do trabalho', 'Média'],
  89: ['HAZOP: identificação de perigos e desvios de processo', 'Média'],
  90: ['HAZOP: análise de perigos e problemas operacionais', 'Fácil'],
  91: ['APR: avaliação inicial de riscos e análise pós-incidente', 'Média'],
  92: ['APR: composição da equipe e identificação de ameaças', 'Média'],
  93: ['APR: identificação de perigos, causas e controles', 'Fácil'],
  94: ['APR: palavras-guia e desvios em processos', 'Média'],
  95: ['PGR: inventário de riscos e plano de ação', 'Média'],
  96: ['Mapa de riscos: representação gráfica e identificação de perigos', 'Média'],
  97: ['SESMT: dimensionamento conforme grau de risco do estabelecimento', 'Média'],
  98: ['NR-9 e PGR: controle das exposições ocupacionais', 'Média'],
  99: ['NR-9 e PGR: registro e incorporação de resultados de avaliação', 'Média'],
  100: ['Higiene ocupacional: controle de exposição combinada a ruído e agentes químicos', 'Difícil'],
  101: ['Agentes químicos: benzeno, carcinogenicidade e uso laboratorial', 'Média'],
  102: ['Hierarquia de controles: proteção coletiva, EPI e medidas administrativas', 'Média'],
  103: ['Ergonomia: adaptação das condições de trabalho e prevenção', 'Média'],
  104: ['Ergonomia: fatores psicossociais e organização do trabalho', 'Média'],
  105: ['Ergonomia: postura de trabalho e prevenção osteomuscular', 'Média'],
  106: ['Ergonomia: conforto térmico, acústico e visual', 'Média'],
  107: ['Ergonomia: assentos e pausas no trabalho em pé', 'Fácil'],
  108: ['Ergonomia: transporte manual de cargas e prevenção de danos', 'Média'],
  109: ['Emergências ambientais: P2R2 e resposta a produtos químicos perigosos', 'Média'],
  110: ['Emergências ambientais: plano de emergência individual para poluição por óleo', 'Média'],
  111: ['Emergências ambientais: definição e classificação de óleo', 'Média'],
  112: ['Higiene ocupacional: valor-teto para agentes químicos na NR-15', 'Média'],
  113: ['PCMSO: integração com riscos identificados no PGR', 'Fácil'],
  114: ['PCMSO: exame clínico de retorno ao trabalho', 'Média'],
  115: ['PCMSO: exame de mudança de função', 'Fácil'],
  116: ['PCMSO: audiometria e repouso auditivo', 'Média'],
  117: ['PCMSO: exames complementares e exposição ocupacional', 'Média'],
  118: ['PCMSO: avaliação respiratória em uso de proteção respiratória', 'Média'],
  119: ['Primeiros socorros: suporte básico de vida e compressões torácicas', 'Média'],
  120: ['Primeiros socorros: desfibrilador externo automático (DEA)', 'Média'],
}

const gruposContexto = [
  [51, 54, 'Programa de prevenção de riscos ambientais (PPRA): conceitos de agentes de risco ocupacional.'],
  [55, 58, 'Serviço Especializado em Engenharia de Segurança e em Medicina do Trabalho (SESMT): atribuições, constituição e dimensionamento.'],
  [59, 62, 'Exposição ao ruído e Programa de Conservação Auditiva (PCA).'],
  [63, 66, 'Avaliação dos níveis de iluminamento em ambientes internos de trabalho.'],
  [67, 70, 'Equipamentos de proteção individual (EPI).'],
  [71, 74, 'Sistemas fixos e portáteis de combate ao fogo.'],
  [75, 80, 'Conceito técnico e legal de acidente do trabalho.'],
  [81, 88, 'Causas e consequências de acidentes do trabalho, taxas de frequência e gravidade, comunicação, estatísticas, investigação, análise, custos e registro.'],
  [89, 90, 'HAZOP (hazard and operability study).'],
  [91, 94, 'Princípios de análise, avaliação e gerenciamento de riscos, inspeção de segurança e análise preliminar de riscos (APR).'],
  [95, 97, 'Normas regulamentadoras sobre SESMT, CIPA e gerenciamento de riscos ocupacionais.'],
  [98, 102, 'Prevenção de doenças relacionadas ao trabalho e controle de exposições ocupacionais.'],
  [103, 108, 'Elementos da ergonomia.'],
  [109, 112, 'Plano Nacional de Prevenção, Preparação e Resposta Rápida a Emergências Ambientais com Produtos Químicos Perigosos, resoluções do CONAMA e normas de saúde e segurança do trabalho.'],
  [113, 118, 'Programa de Controle Médico de Saúde Ocupacional (PCMSO).'],
  [119, 120, 'Suporte básico à vida.'],
]
const apoio = n => gruposContexto.find(([a,b]) => n >= a && n <= b)?.[2] || ''

const canonicos = new Map([
  ['extr-da061b5c3162342bc7c8', 'extr-336cb0154a6a19786775'],
  ['extr-223ce6095267618de411', 'extr-3797494e02e23e50dc5b'],
  ['extr-c74570b4bac256beb685', 'extr-bf2a68888ee4be8d38e8'],
  ['extr-1f9d5ea0306b7dce0124', 'extr-450668cd192264e099b4'],
  ['extr-d1d38872f9a1428465b7', 'extr-46969782d28053a8aa5b'],
])
const respostas = {
  51:'C',52:'E',53:'E',54:'C',55:'C',56:'E',57:'C',58:'E',59:'E',60:'E',61:'C',62:'C',63:'E',64:'C',65:'C',66:'E',67:'C',68:'E',69:'E',70:'C',
  71:'E',72:'E',73:'C',74:'C',75:'E',76:'C',77:'E',78:'C',79:'E',80:'E',81:'E',82:'C',83:'C',84:'E',85:'C',86:'E',87:'E',88:'E',89:'E',90:'C',
  91:'E',92:'E',93:'C',94:'E',95:'C',96:'E',97:'E',98:'E',99:'C',100:'C',101:'E',102:'E',103:'E',104:'C',105:'E',106:'C',107:'E',108:'C',109:'C',110:'C',
  111:'E',112:'C',113:'C',114:'E',115:'E',116:'E',117:'E',118:'C',119:'C',120:'C',
}
const cabecalhos = [
  'Quanto ao serviço especializado em engenharia de segurança e medicina do trabalho (SESMT), julgue os itens a seguir.',
  'Acerca da exposição ao ruído e ao programa de conservação auditiva (PCA), julgue os itens subsequentes.',
  'A respeito da avaliação dos níveis de iluminamento em ambientes internos de trabalho, julgue os itens que se seguem.',
  'No que diz respeito a equipamentos de proteção individual (EPI), julgue os itens seguintes.',
  'Acerca dos sistemas fixos e portáteis de combate ao fogo, julgue os próximos itens.',
  'Em relação ao conceito técnico e legal de acidente do trabalho, julgue os itens a seguir.',
  'A respeito de causas e consequências de acidentes do trabalho, suas taxas de frequência e gravidade, sua comunicação, suas estatísticas, sua investigação e análise, bem como seus custos e seu registro, julgue os itens seguintes.',
  'Quanto ao HAZOP (hazard and operability study), julgue os itens que se seguem.',
  'No que se refere aos princípios de análise, avaliação e gerenciamento de riscos, inspeção de segurança e análise preliminar de riscos (APR), julgue os itens a seguir.',
  'Com base nas normas regulamentadoras que tratam do SESMT, da CIPA e do gerenciamento de riscos ocupacionais, julgue os itens a seguir.',
  'A respeito da prevenção de doenças relacionadas ao trabalho, julgue os itens a seguir.',
  'Em relação aos elementos da ergonomia, julgue os próximos itens.',
  'Em relação ao programa de controle médico de saúde ocupacional (PCMSO), julgue os itens a seguir.',
  'Acerca do suporte básico à vida, julgue os itens a seguir.',
  'Tendo como referência o Plano Nacional de Prevenção, Preparação e Resposta Rápida a Emergências Ambientais com Produtos Químicos Perigosos, as resoluções do Conselho Nacional de Meio Ambiente (CONAMA) e as normas regulamentadoras de saúde e segurança no trabalho, julgue os itens a seguir.',
]
const removerPendencias = [
  'classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada',
  'visual_ausente','texto_corrompido','texto_corrompido_requer_reconstrucao',
  'texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado',
]
const normalizar = s => String(s || '').replace(/\s+/g, ' ').trim()
function limparEnunciado(texto) {
  let s = normalizar(texto)
  for (const h of cabecalhos) {
    const i = s.indexOf(h)
    if (i > 0) s = s.slice(0, i).trim()
  }
  s = s.replace(/\s+(?:89302501510285\s+)?CEBRASPE\s*[–-]\s*DATAPREV\s*[–-]\s*Edital:\s*2023\s*$/iu, '').trim()
  return s
}

const registros = []
const manifestoAtual = JSON.parse(await lerArquivoAtual('manifesto.json'))
for (const indice of indicesLote) {
  const lote = manifestoAtual.lotes[indice]
  assert.ok(lote, `Lote ativo ${indice} ausente`)
  const questoes = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  registros.push(...questoes.filter(q => q.documento_id === documento))
}
assert.equal(registros.length, 75, `Esperados 75 registros; encontrados ${registros.length}`)
const porNumero = new Map()
for (const q of registros) {
  const n = Number(q.numero_original)
  assert.ok(n >= 51 && n <= 120, `Numeração fora do caderno: ${q.id} / ${n}`)
  const a = porNumero.get(n) || []; a.push(q); porNumero.set(n, a)
  assert.equal(q.tipo_resposta, 'certo_errado', `Tipo de resposta inesperado no item ${n}`)
  assert.equal(q.opcoes?.length, 2, `Opções C/E inválidas no item ${n}`)
  assert.ok((q.imagens_paginas || []).length || q.pagina_imagem || q.imagem, `Imagem original sem referência no item ${n}`)
}
assert.equal(porNumero.size, 70)
for (let n = 51; n <= 120; n++) assert.ok(porNumero.has(n), `Item oficial ${n} ausente`)
assert.deepEqual([...porNumero].filter(([,a])=>a.length>1).map(([n])=>n).sort((a,b)=>a-b), [53,54,58,64,66])
assert.equal(Object.keys(respostas).length, 70)
assert.equal(Object.keys(assuntos).length, 70)

const decisoes = []
for (let n = 51; n <= 120; n++) {
  const [conteudo, dificuldade] = assuntos[n]
  const grupo = porNumero.get(n)
  const canonical = grupo.length === 1 ? grupo[0].id : grupo.find(q => !canonicos.has(q.id))?.id
  assert.ok(canonical, `Registro canônico não localizado para ${n}`)
  const letra = respostas[n]
  assert.ok(letra === 'C' || letra === 'E')
  for (const q of grupo) {
    const duplicada = q.id !== canonical
    const materia = n === 83 ? 'Matemática' : 'Segurança do Trabalho'
    const decisao = {
      id: q.id,
      sha256_enunciado: hashRevisao(q.enunciado),
      materia,
      conteudo,
      ano: 2023,
      concurso,
      banca: 'CEBRASPE',
      organizadora: 'CEBRASPE',
      aplicacao,
      cargo: 'Técnico de Segurança do Trabalho',
      numero_original: n,
      pagina: Number(q.pagina),
      dificuldade,
      dificuldade_estimada: true,
      dificuldade_evidencia: 'Estimativa editorial com base na interpretação de norma, no número de etapas conceituais e na complexidade de cálculo; não corresponde a nível oficial da banca.',
      classificacao_fonte: prova,
      motivo: 'Classificação por leitura individual do item e do bloco temático no caderno oficial; cargo e identificação do caderno confirmados no gabarito definitivo do Cargo 25.',
      texto_apoio: apoio(n),
      resposta_correta: letra === 'C' ? 0 : 1,
      anulada: false,
      gabarito_oficial: {
        fonte: gabaritoUrl,
        sha256: gabaritoSha,
        arquivo_gabarito: 'GAB_DEFINITIVO_893_DATAPREV_025_01.PDF',
        arquivo_prova: '893_DATAPREV_025_01.PDF',
        prova,
        numero: n,
        pagina: Number(q.pagina),
        resposta: letra,
        criterio: 'Caderno 893_DATAPREV_025_01 e número do item confrontados com a tabela oficial definitiva do Cargo 25; alternativas C/E conferidas na ordem do caderno.',
      },
      apta_resolucao: !duplicada,
      remover_pendencias: removerPendencias,
    }
    const limpo = limparEnunciado(q.enunciado)
    if (limpo !== normalizar(q.enunciado)) decisao.enunciado = limpo
    if (duplicada) {
      decisao.inelegibilidade_motivo = 'duplicata_do_mesmo_item_no_documento_oficial_dataprev_cargo25_2023'
      decisao.duplicada_de = canonical
    }
    decisoes.push(decisao)
  }
}
assert.equal(decisoes.length, 75)

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({
    documento, concurso, itens_oficiais: porNumero.size, registros: registros.length,
    pendentes: registros.filter(q=>q.classificacao_pendente).length,
    duplicatas_internas: canonicos.size,
    enunciados_limpos: decisoes.filter(d=>Object.hasOwn(d,'enunciado')).length,
    gabaritos_oficiais_vinculados: decisoes.length,
    imagens_preservadas: registros.every(q=>(q.imagens_paginas||[]).length||q.pagina_imagem||q.imagem),
    respostas_c_e: Object.values(respostas).every(x=>x==='C'||x==='E'),
    prova, gabarito: gabaritoUrl, publicado:false,
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
  classificados: registros.filter(q=>q.classificacao_pendente).length,
  duplicatas_marcadas: canonicos.size,
  enunciados_limpos: decisoes.filter(d=>Object.hasOwn(d,'enunciado')).length,
  respostas_oficiais_vinculadas: Object.keys(respostas).length,
  gabarito_sha256: gabaritoSha,
  imagens_e_paginas_de_origem_preservadas: true,
  prova,
  gabarito: gabaritoUrl,
  publicado: false,
}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`, JSON.stringify(relatorio, null, 2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md', `\n\n## DATAPREV — Técnico de Segurança do Trabalho, Cargo 25 — 2023 — revisão v467\n\n- Classifiquei os 70 itens oficiais, 51–120, por conteúdo específico e dificuldade editorial estimada, usando a taxonomia do banco para Segurança do Trabalho.\n- Revisei 75 registros; cinco eram cópias internas dos itens 53, 54, 58, 64 e 66 e foram marcadas inelegíveis, com ligação ao item canônico.\n- Limpei enunciados contaminados por cabeçalhos de questões seguintes, sem remover as imagens e referências de página originais.\n- Vinculei a chave definitiva oficial para os 70 itens C/E, conferida pelo identificador exato do caderno.\n- Fonte oficial: [prova do Cargo 25](${prova}) e [gabarito definitivo](${gabaritoUrl}).\n- Publicação na nuvem: não realizada.\n`)
console.log(JSON.stringify(relatorio, null, 2))
