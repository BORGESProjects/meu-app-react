import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const origem = raizesAtuais.find(r => r.includes('revisao-ansa-eletrica-2026-v142'))
if (!origem) throw new Error('Base v142 não encontrada')
const documento = '5c3cff23c8c41d3e'
const questoes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
if (questoes.length !== 54 || questoes.some(q => q.concurso !== 'ARS AL 26' || q.banca !== 'CEBRASPE')) throw new Error('Exportação ARSAL inesperada ou desatualizada')

const prova = 'https://cdn.cebraspe.org.br/concursos/ARSAL_26/arquivos/EED98570A79710883A93F05346AAEB644C4CBFFFB8004CBCC4158822A1261539.pdf'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/ARSAL_26/arquivos/0FF6389FD56A448A5520DC5F756C35E5BE7CCDADE7A4A21C250FBDA42FEF6E81.pdf'
const paginaImagem = n => `paginas/${documento}-${String(n <= 71 ? 1 : n <= 100 ? 2 : 3).padStart(4, '0')}.webp`
for (const n of [1, 2, 3]) await fs.access(`public/acervo-extraido/paginas/${documento}-${String(n).padStart(4, '0')}.webp`)

const blocos = [
  [61, 61, 'Direito Administrativo', 'Organização administrativa: organizações da sociedade civil de interesse público'],
  [65, 69, 'Direito Constitucional', 'Direitos e garantias fundamentais: extradição, nacionalidade, mínimo existencial, prova e concursos públicos'],
  [70, 71, 'Direito Constitucional', 'Organização político-administrativa: limites de despesas municipais e formação de estados'],
  [72, 76, 'Direito Constitucional', 'Organização dos Poderes: quinto constitucional, competências presidenciais, fiscalização legislativa, processo legislativo e CPI'],
  [77, 77, 'Direito Financeiro', 'Finanças públicas: operações do Banco Central e vedação a empréstimos ao Tesouro'],
  [78, 78, 'Direito Constitucional', 'Funções essenciais à Justiça: garantias da Defensoria Pública'],
  [79, 81, 'Direito Civil', 'LINDB: competência internacional, vigência e revogação das leis'],
  [82, 85, 'Direito Civil', 'Pessoas naturais: nome, estado, direitos da personalidade e capacidade'],
  [86, 92, 'Direito Civil', 'Pessoas jurídicas: associações, responsabilidade, personalidade, registro, desconsideração, liquidação e sociedades simples'],
  [93, 100, 'Direito Processual Civil', 'Tutela coletiva e ações constitucionais: ação civil pública, mandado de segurança, improbidade e ação popular'],
  [101, 103, 'Direito Processual Civil', 'Jurisdição, interesse processual, preclusão e recursos'],
  [104, 106, 'Direito Processual Civil', 'Sujeitos do processo: representação judicial, curadoria especial e honorários advocatícios'],
  [107, 110, 'Direito do Trabalho', 'Direitos constitucionais trabalhistas: FGTS, prescrição, proteção contra despedida e seguro-desemprego'],
  [111, 114, 'Direito do Trabalho', 'Saúde e segurança do trabalho: insalubridade e base de cálculo de horas extras'],
  [115, 120, 'Direito do Trabalho', 'Duração do trabalho: intervalo intrajornada, turnos ininterruptos e efeitos da interrupção'],
]
const comandos = new Map([
  [61, 'No que concerne à organização administrativa, julgue os itens que se seguem.'],
  [65, 'Acerca da aplicabilidade das normas constitucionais, dos princípios e dos direitos fundamentais, julgue os itens a seguir.'],
  [70, 'Em relação à organização político-administrativa do Estado brasileiro, julgue os itens seguintes com base na Constituição Federal de 1988 (CF).'],
  [72, 'No que diz respeito à organização dos Poderes, suas competências e atribuições, julgue os itens subsequentes.'],
  [77, 'Acerca das funções essenciais à Justiça e das finanças públicas, julgue os itens subsecutivos.'],
  [79, 'Julgue os itens a seguir, com base no disposto na Lei de Introdução às Normas do Direito Brasileiro.'],
  [82, 'Julgue os itens subsequentes, relativos às pessoas naturais.'],
  [86, 'No que diz respeito às pessoas jurídicas, julgue os itens seguintes.'],
  [93, 'Julgue os itens que se seguem, relativos a mandado de segurança, ação popular, ação civil pública e ação de improbidade administrativa.'],
  [101, 'Julgue os itens a seguir, relativos à preclusão, aos meios de impugnação das decisões judiciais, à jurisdição, às condições da ação e aos pressupostos processuais.'],
  [104, 'Julgue os itens seguintes, acerca dos sujeitos do processo.'],
  [107, 'A filial da empresa onde João trabalhava encerrou suas atividades em 5 de abril de 2026. Em decorrência disso, em 5 de maio de 2026, o contrato de emprego dele foi rescindido. Considerando essa situação hipotética e os direitos constitucionais assegurados aos trabalhadores, julgue os itens que se seguem.'],
  [111, 'Caio é trabalhador celetista e exerce suas atividades em ambiente insalubre classificado em grau médio. Eventualmente, ele labora em regime de horas extras. Em relação a essa situação hipotética, julgue os itens a seguir.'],
  [115, 'Maria, empregada celetista, trabalha em regime de turnos ininterruptos de revezamento de seis horas. A cada turno, a empresa lhe concede um intervalo de 15 minutos para lanche e descanso. A partir dessa situação hipotética, julgue os itens subsequentes, acerca da duração do trabalho.'],
])
const facil = new Set([61, 65, 70, 73, 78, 80, 82, 85, 89, 91, 104, 107, 110, 115, 118, 119])
const dificil = new Set([64, 67, 69, 72, 75, 77, 79, 84, 90, 93, 95, 96, 97, 98, 100, 102, 105, 111, 113, 116, 117])

function corrigirTexto(q) {
  let s = q.enunciado.replace(/\s+/gu, ' ').trim()
  const cortes = new Map([
    [71, 'CEBRASPE – ARSAL'], [76, 'Acerca das funções essenciais à justiça e das finanças públicas'],
    [100, 'CEBRASPE – ARSAL'], [101, 'CEBRASPE – ARSAL'], [106, 'A filial da empresa onde João trabalhava'],
    [110, 'Caio é trabalhador celetista'], [114, 'Maria, empregada celetista'],
    [119, '120 O intervalo para descanso e alimentação de Maria']
  ])
  const corte = cortes.get(Number(q.numero))
  if (corte && s.includes(corte)) s = s.slice(0, s.indexOf(corte)).trim()
  const fixes = [
    [/admini\s+stração/giu, 'administração'], [/sujeitando\s*-\s*se/giu, 'sujeitando-se'],
    [/administra\s+tivas/giu, 'administrativas'], [/adotada\s+por pessoa/giu, 'adotada por pessoa'],
    [/conheciment\s*o do outro/giu, 'conhecimento do outro'], [/existenci\s+al/giu, 'existencial'],
    [/reputa\s+ção/giu, 'reputação'], [/sêxtupla/giu, 'sêxtupla'],
    [/político\s*-\s*administrativa/giu, 'político-administrativa'], [/nat\s+ural/giu, 'natural'],
    [/r\s+equisito/giu, 'requisito'], [/paga\s+mento/giu, 'pagamento'],
    [/parlamen\s+tares/giu, 'parlamentares'], [/tí\s+tulos/giu, 'títulos'],
    [/sendo\s*-\s*lhe/giu, 'sendo-lhe'], [/sujeita\s+a\s+o\s+duplo/giu, 'sujeita ao duplo'],
    [/rejeitada\s+o\s+u\s+havida/giu, 'rejeitada ou havida'],
    [/caracteriza\s*-\s*se/giu, 'caracteriza-se'], [/decisões\s+judiciais/giu, 'decisões judiciais'],
    [/\s+-\s*(geral|lhe|se)\b/giu, '-$1'],
    [/jurídi\s+ca/giu, 'jurídica'], [/jurídi\s+cas/giu, 'jurídicas'], [/seguran\s+ça/giu, 'segurança'],
    [/h\s+onorários/giu, 'honorários'], [/reiv\s+indicar/giu, 'reivindicar'],
    [/classifi\s+cado/giu, 'classificado'], [/alimen\s+tação/giu, 'alimentação'],
    [/limites de tolerância es\s*tabelecidos/giu, 'limites de tolerância estabelecidos'],
    [/ininter\s+rupto/giu, 'ininterrupto'],
    [/inter\s+ruptos/giu, 'ininterruptos'],
    [/interrup\s+ção/giu, 'interrupção'], [/mandamus/giu, 'mandamus'],
  ]
  for (const [re, replacement] of fixes) s = s.replace(re, replacement)
  return s
}

const decisoes = questoes.map(q => {
  const n = Number(q.numero), grupo = blocos.find(([de, ate]) => n >= de && n <= ate)
  if (!grupo) throw new Error(`Item ARSAL fora da taxonomia: ${n}`)
  const [, , materia, conteudo] = grupo
  const comando = [...comandos].filter(([inicio]) => n >= inicio).at(-1)?.[1]
  const pagina = n <= 71 ? 1 : n <= 100 ? 2 : 3
  let enunciado = corrigirTexto(q)
  if (n === 111) enunciado = 'Para calcular o pagamento das horas extras cumpridas por Caio, o empregador deve utilizar, como base de cálculo, o resultado da soma do salário contratual acrescido do adicional de insalubridade.'
  const visual = { pagina, imagem: paginaImagem(n), motivo: `Conferência do item ${n} na página ${pagina} do caderno oficial específico do Cargo 3 — Direito.` }
  return {
    id: q.id, sha256_enunciado: hashRevisao(q.enunciado), materia, conteudo,
    concurso: 'ARSAL 2026 — Cargo 3: Analista de Regulação, especialidade Direito', ano: 2026,
    numero_original: n, pagina, dificuldade: facil.has(n) ? 'Fácil' : dificil.has(n) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pelo nível de abstração jurídica e integração de normas exigido; não corresponde a escala psicométrica da banca.',
    classificacao_fonte: prova, visual,
    texto_apoio: comando || 'Julgue o item com base na legislação e na jurisprudência aplicáveis ao tema indicado.',
    enunciado,
    motivo: `Classificação individual pelo enunciado, bloco temático, página e caderno oficial do Cargo 3 — Direito. Gabarito definitivo disponível em ${gabarito}, mas a transcrição item a item não foi validada nesta revisão.`
  }
})
if (new Set(questoes.map(q => Number(q.numero))).size !== questoes.length) throw new Error('Há itens repetidos na exportação ARSAL')
for (const q of questoes) {
  const n = Number(q.numero), expected = n <= 71 ? 1 : n <= 100 ? 2 : 3
  if (q.pagina !== expected && q.pagina !== 1) throw new Error(`Página inesperada no item ${n}: ${q.pagina}`)
}

const rel = await aplicarRevisoesIndividuais({ nome: 'revisao-arsal-direito-2026-v143', base: origem, decisoes })
const raiz = 'tmp/revisao-profissional/revisao-arsal-direito-2026-v143/acervo-extraido'
if (!raizesAtuais.includes(raiz)) raizesAtuais.unshift(raiz)
const atualPath = 'scripts/acervo-publico/acervo-atual.mjs'
let atual = await fs.readFile(atualPath, 'utf8')
if (!atual.includes(`raizesAtuais.unshift('${raiz}')`)) atual = atual.replace('export async function lerArquivoAtual', `raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`)
await fs.writeFile(atualPath, atual)
const reportPath = 'docs/acervo/revisao-profissional/RELATORIO.md'
let report = await fs.readFile(reportPath, 'utf8')
const marker = '\n\n## Revisão ARSAL — Cargo 3, Direito — v143\n'
const old = report.indexOf(marker)
if (old >= 0) report = report.slice(0, old)
report += `\n\n## Revisão ARSAL — Cargo 3, Direito — v143\n\n- Revisei ${decisoes.length} registros pendentes do caderno específico do Cargo 3 — Analista de Regulação, especialidade Direito, aplicado em 2026. Classifiquei por Direito Administrativo, Constitucional, Financeiro, Civil, Processual Civil e do Trabalho, com conteúdos por bloco temático e estimativa editorial de dificuldade.\n- Conferi visualmente as três páginas locais e comparei o texto com o caderno oficial. Corrigi OCR legível e removi texto de questões vizinhas anexado aos itens 71, 106, 110, 114 e 119; o item 119 agora não contém o item 120. Corrigi também as páginas de origem e mantive cada questão ligada à imagem correta.\n- A página do Cebraspe identifica o Cargo 3 como especialidade Direito e disponibiliza gabarito definitivo específico. Não transcrevi respostas automáticas sem validar visualmente cada marcação do PDF do gabarito; a correção automática segue condicionada à validação da resposta.\n- Resultado: ${rel.total} registros; ${rel.disponiveis} elegíveis para resolução; ${rel.pendentes} pendências elegíveis. Alteração local, não publicada na nuvem.\n- Fontes oficiais: [prova objetiva específica do Cargo 3](https://cdn.cebraspe.org.br/concursos/ARSAL_26/arquivos/EED98570A79710883A93F05346AAEB644C4CBFFFB8004CBCC4158822A1261539.pdf), [gabarito definitivo específico do Cargo 3](https://cdn.cebraspe.org.br/concursos/ARSAL_26/arquivos/0FF6389FD56A448A5520DC5F756C35E5BE7CCDADE7A4A21C250FBDA42FEF6E81.pdf), [página oficial do concurso e cargos](https://www.cebraspe.org.br/concursos/ARSAL_26).\n`
await fs.writeFile(reportPath, report)
console.log(JSON.stringify({ ...rel, revisados: decisoes.length, prova, gabarito, publicado: false }, null, 2))
