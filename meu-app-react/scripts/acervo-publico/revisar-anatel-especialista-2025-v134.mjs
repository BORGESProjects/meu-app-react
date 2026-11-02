import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const documento = 'cbd2220465334053'
const origem = raizesAtuais[0]
const pendentes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
const prova = 'https://cdn.cebraspe.org.br/concursos/ANATEL_24/arquivos/074_ANATEL_001_01.pdf'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/anatel_24/arquivos/Gab_Definitivo_074_ANATEL_001_01.PDF'

// Chave definitiva do caderno 074_ANATEL_001_01, aplicação 06/04/2025.
const letras = 'C C E E E C C C E C C C E C C E C E E C'.split(' ')
const letras2 = 'C C E C E E C C E E C C E E E C E C E C'.split(' ')
const letras3 = 'E C E C E E C E E C E E C C E C E C E C'.split(' ')
const letras4 = 'C E C E C C C E E C E C E C E C C C E E'.split(' ')
const chave = [...letras, ...letras2, ...letras3, ...letras4]
if (chave.length !== 80) throw new Error(`Chave oficial malformada: ${chave.length}`)

const grupos = {
  'Administração Pública': {
    conteudo: 'Organização, governança, competências e planejamento institucional da ANATEL',
    comando: 'Acerca da estrutura, das competências, da governança e do planejamento institucional da ANATEL.',
    questoes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  'Regulação de Telecomunicações': {
    conteudo: 'História, objetivos e regimes de prestação dos serviços de telecomunicações',
    comando: 'Considerando o contexto histórico dos serviços de telecomunicações no Brasil, seus objetivos, regimes de prestação e principais serviços.',
    questoes: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  },
  'Direito Regulatório': {
    conteudo: 'Agenda regulatória, análise de impacto e resultado regulatório e participação social',
    comando: 'A respeito da agenda regulatória, do ciclo de análise de impacto e resultado regulatório e da participação social na ANATEL.',
    questoes: [22, 23, 24, 25, 26]
  },
  'Regulação Econômica': {
    conteudo: 'Concorrência, plataformas OTT, poder de mercado e Plano Geral de Metas de Competição',
    comando: 'A respeito dos fundamentos da regulação econômica, das plataformas OTT, dos grupos econômicos, do poder de mercado e do PGMC.',
    questoes: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
  },
  'Fiscalização e Sanções Administrativas': {
    conteudo: 'Acompanhamento, fiscalização regulatória, sanções, PADO e termo de ajustamento de conduta',
    comando: 'Acerca da fiscalização regulatória, do acompanhamento, das sanções administrativas, do PADO e do termo de ajustamento de conduta.',
    questoes: [37, 38, 39, 40, 41, 42, 43, 44]
  },
  'Direito do Consumidor': {
    conteudo: 'Direitos dos usuários, atendimento, conselhos de usuários e qualidade percebida',
    comando: 'Acerca da proteção dos consumidores e usuários, dos canais de atendimento e das pesquisas de satisfação e qualidade dos serviços de telecomunicações.',
    questoes: [45, 46, 47, 48, 49, 50, 51, 52, 53]
  },
  'Telecomunicações': {
    conteudo: 'Gestão do espectro, padronização, outorgas, interconexão e combate à pirataria',
    comando: 'A respeito do espectro de radiofrequências, das comissões técnicas, das outorgas, da interconexão e do combate à pirataria.',
    questoes: [54, 55, 56, 57, 58, 59, 60, 61, 62, 63]
  },
  'Administração Financeira e Orçamentária': {
    conteudo: 'Gestão da arrecadação, códigos de receitas, cobrança e créditos da ANATEL',
    comando: 'Acerca da organização e das atribuições relacionadas à arrecadação e à gestão de créditos da ANATEL.',
    questoes: [64, 65, 66, 67, 68, 69]
  },
  'Políticas Públicas': {
    conteudo: 'Cooperação internacional e governança de comissões brasileiras de comunicações',
    comando: 'A respeito da atuação internacional da ANATEL e das comissões brasileiras de comunicações.',
    questoes: [70, 71]
  },
  'Governo Digital': {
    conteudo: 'Transformação digital, inovação pública, tecnologias emergentes e sandbox regulatório',
    comando: 'Considerando a estratégia de governo digital, a inovação pública, as tecnologias emergentes e os projetos de sandbox regulatório.',
    questoes: [72, 74, 75, 76, 77]
  },
  'Direito Digital': {
    conteudo: 'Lei Geral de Proteção de Dados Pessoais, incidentes de segurança e princípios de tratamento',
    comando: 'Considerando o arcabouço legal brasileiro de proteção de dados pessoais e privacidade.',
    questoes: [78, 79, 80]
  }
}
const temas = new Map()
for (const [materia, grupo] of Object.entries(grupos)) for (const numero of grupo.questoes) {
  if (temas.has(numero)) throw new Error(`Questão ${numero} classificada duas vezes`)
  temas.set(numero, { materia, conteudo: grupo.conteudo, comando: grupo.comando })
}
if (temas.size !== 79 || temas.has(73)) throw new Error(`Cobertura de classificação inesperada (${temas.size})`)

const duplicadas = new Map([
  ['extr-78b0b66bef6f15f2d103', 'extr-9080f4b10a398be6644e'],
  ['extr-9c8182ef3fc778aea437', 'extr-2d647e04ac66ad0cea20'],
  ['extr-218e6d026fcf1e82c7b8', 'extr-2738d628648103f64e6c'],
  ['extr-4adfd9a7d3bfc9867435', 'extr-6bee7b3fabd1e40ba0f0'],
  ['extr-47f8391133b9a122bd04', 'extr-422a2295de7ef85e6979'],
  ['extr-2748ccbab141073fd1d2', 'extr-df8894b1cc2e30c54b51']
])
const cortes = new Map([
  [5, ' Em relação ao processo decisório do Conselho Diretor'],
  [10, ' Considerando o contexto histórico dos serviços de telecomunicações'],
  [13, ' Em relação aos serviços de telecomunicações no Brasil'],
  [23, ' Considerando o processo de regulamentação na ANATEL'],
  [42, ' A respeito das modalidades de fiscalização'],
  [43, ' Em relação à fiscalização regulatória'],
  [50, ' Julgue o item subsequente, relativo à pesquisa para a aferição'],
  [51, ' Em relação à pesquisa de qualidade percebida'],
  [52, ' Julgue o item seguinte, que se refere aos canais de acolhimento'],
  [62, ' No que concerne ao Plano de Ação de Combate à Pirataria'],
  [69, ' No que se refere à atuação internacional da ANATEL'],
  [70, ' A respeito das comissões brasileiras de comunicações'],
  [77, ' Considerando o arcabouço legal da proteção de dados'],
  [80, ' Espaço livre']
])
const dificuldade = new Map()
const faceis = new Set([1, 2, 9, 11, 13, 17, 19, 20, 21, 27, 29, 31, 36, 38, 45, 47, 53, 56, 58, 60, 61, 70, 71, 76, 78])
const dificeis = new Set([4, 5, 24, 26, 28, 30, 34, 37, 40, 41, 43, 46, 49, 50, 52, 55, 59, 62, 63, 65, 68, 69, 72, 75, 77, 79, 80])
for (const n of temas.keys()) dificuldade.set(n, faceis.has(n) ? 'Fácil' : dificeis.has(n) ? 'Difícil' : 'Média')

const canonical = chave.map((resposta, i) => [i + 1, resposta])
const hashGabarito = hashRevisao(`${gabarito}\n${JSON.stringify(Object.fromEntries(canonical))}`)
const correcoes = new Map([
  [2, [['govemo', 'governo']]],
  [12, [['incialmente', 'inicialmente']]],
  [11, [['modema', 'moderna']]],
  [63, [['e-commerce ,', 'e-commerce,']]]
])

if (pendentes.length !== 85) throw new Error(`Esperava 85 registros pendentes, encontrei ${pendentes.length}`)
const numeros = new Set(pendentes.map(q => Number(q.numero)))
for (const n of numeros) if (!temas.has(n)) throw new Error(`Questão sem matéria/conteúdo: ${n}`)
const decisoes = []
for (const q of pendentes) {
  const numero = Number(q.numero), tema = temas.get(numero), letra = chave[numero - 1]
  if (!tema || !['C', 'E'].includes(letra)) throw new Error(`Registro sem classificação/gabarito oficial: ${q.id}`)
  const duplicadaDe = duplicadas.get(q.id)
  let enunciado = q.enunciado.replace(/\s+/g, ' ').trim()
  if (!duplicadaDe && cortes.has(numero)) {
    const marcador = cortes.get(numero).replace(/\s+/g, ' ').trim(), pos = enunciado.indexOf(marcador)
    if (pos >= 0) enunciado = enunciado.slice(0, pos).trim()
    else if ([5, 10, 13, 23, 42, 43, 50, 51, 52, 62, 69, 70, 77, 80].includes(numero)) throw new Error(`Contaminação esperada não localizada em ${q.id}`)
  }
  if (!duplicadaDe) for (const [de, para] of correcoes.get(numero) || []) enunciado = enunciado.replaceAll(de, para)
  const imagens = [q.imagem, ...(q.contexto || []).map(x => x.imagem)].filter(Boolean)
  for (const imagem of new Set(imagens)) await fs.access(`public/acervo-extraido/${imagem}`)
  const anulada = false
  const decisao = {
    id: q.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia: tema.materia,
    conteudo: tema.conteudo,
    concurso: 'ANATEL — Especialista em Regulação de Serviços Públicos de Telecomunicações (edital 2024; aplicação 2025)',
    ano: 2025,
    numero_original: numero,
    dificuldade: dificuldade.get(numero),
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial, considerando especificidade normativa, articulação conceitual e extensão do raciocínio; não é escala psicométrica publicada pela banca.',
    resposta_correta: letra === 'C' ? 0 : 1,
    anulada,
    texto_apoio: tema.comando,
    gabarito_oficial: { valor: letra, fonte: gabarito, sha256: hashGabarito, sha256_tipo: 'transcricao_canonica_dos_80_itens_do_gabarito_definitivo' },
    classificacao_fonte: prova,
    motivo: `Item ${numero} classificado pelo conteúdo e pelo comando da seção do caderno oficial. O concurso saiu no edital de 2024, mas a prova foi aplicada em 06/04/2025. Gabarito definitivo individual confrontado com o documento oficial.`,
    ...(duplicadaDe ? { apta_resolucao: false, duplicada_de: duplicadaDe, inelegibilidade_motivo: 'Cópia redundante do mesmo item e edição; registro mantido para auditoria, sem aparecer como questão resolvível.' } : { enunciado })
  }
  decisoes.push(decisao)
}
if (decisoes.length !== pendentes.length || new Set(decisoes.map(x => x.id)).size !== pendentes.length) throw new Error('IDs de decisão repetidos ou ausentes')

const rel = await aplicarRevisoesIndividuais({ nome: 'revisao-anatel-especialista-2025-v134', base: origem, decisoes })
const raiz = 'tmp/revisao-profissional/revisao-anatel-especialista-2025-v134/acervo-extraido'
if (!raizesAtuais.includes(raiz)) raizesAtuais.unshift(raiz)
const atualPath = 'scripts/acervo-publico/acervo-atual.mjs'
let atual = await fs.readFile(atualPath, 'utf8')
if (!atual.includes(`raizesAtuais.unshift('${raiz}')`)) atual = atual.replace('export async function lerArquivoAtual', `raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`)
await fs.writeFile(atualPath, atual)

const rp = 'docs/acervo/revisao-profissional/RELATORIO.md'
let relatorio = await fs.readFile(rp, 'utf8')
relatorio += `\n\n## Revisão ANATEL — Especialista em Regulação — v134\n\n- Revisei ${rel.classificadas} registros de 79 itens distintos. Classifiquei os itens por Administração Pública, Regulação de Telecomunicações, Direito Regulatório, Regulação Econômica, Fiscalização e Sanções, Direito do Consumidor, Telecomunicações, Administração Financeira e Orçamentária, Políticas Públicas, Governo Digital e Direito Digital.\n- Corrigi o ano para 2025 (a aplicação ocorreu em 06/04/2025; 2024 é o ano do edital), associei os comandos de seção como texto de apoio, corrigi contaminações de OCR e de itens vizinhos e conferi respostas no gabarito definitivo.\n- Identifiquei 6 cópias redundantes com enunciado duplicado e OCR/trechos de itens vizinhos. Desabilitei essas cópias para resolução e mantive seus registros para auditoria; nenhuma questão anulada oficialmente neste caderno. O item 73 não constava entre as pendências exportadas e não foi alterado neste lote.\n- Validei localmente a existência das imagens de página vinculadas a cada um dos 85 registros. A dificuldade foi estimada editorialmente, não atribuída como dado oficial da banca.\n- Resultado: ${rel.total} registros no banco; ${rel.disponiveis} elegíveis para resolução; ${rel.pendentes} pendências elegíveis; ${rel.lotes_alterados} lotes regravados. Pacote local, ainda não publicado na nuvem.\n- Fontes primárias: [caderno oficial CEBRASPE — ANATEL, Especialista, caderno 074](https://cdn.cebraspe.org.br/concursos/ANATEL_24/arquivos/074_ANATEL_001_01.pdf), [gabarito definitivo — aplicação 06/04/2025](https://cdn.cebraspe.org.br/concursos/anatel_24/arquivos/Gab_Definitivo_074_ANATEL_001_01.PDF).\n`
await fs.writeFile(rp, relatorio)
console.log(JSON.stringify({ ...rel, duplicadas: duplicadas.size, itens_distintos: temas.size }, null, 2))
