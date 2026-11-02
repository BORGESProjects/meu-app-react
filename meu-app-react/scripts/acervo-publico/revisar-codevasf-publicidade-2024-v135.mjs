import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const documento = 'be432925373c15a6'
const origem = raizesAtuais[0]
const pendentes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
const prova = 'https://cdn.cebraspe.org.br/concursos/codevasf_24/arquivos/989_CODEVASF_010_01.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/codevasf_24/arquivos/GAB_DEFINITIVO_989_CODEVASF_010_01.PDF'

// Gabarito oficial definitivo para os itens 51 a 120 do cargo 10.
const letras = 'E C C E C E C C E C C C E E C E C C E E C C X E E E E C E C E C C X E C C E E C E E C C E E E C C E E C C C E E E X E E C E E E C C C C C E'.split(' ')
if (letras.length !== 70) throw new Error(`Chave oficial inválida: ${letras.length}`)
const chave = new Map(letras.map((v, i) => [i + 51, v]))

const secoes = [
  { materia: 'Publicidade e Propaganda', conteudo: 'Conceitos, finalidade, campanhas, mídia e planejamento publicitário', comando: 'Em relação aos conceitos, às finalidades e ao planejamento da publicidade e das campanhas publicitárias.', questoes: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61] },
  { materia: 'Comunicação Social', conteudo: 'Redação publicitária, briefing, recursos expressivos e retórica persuasiva', comando: 'A respeito da linguagem, da produção de textos e dos recursos retóricos em publicidade.', questoes: [62, 63, 64, 65] },
  { materia: 'Comunicação Social', conteudo: 'Linguagem cinematográfica, narrativa audiovisual, planos e movimentos de câmera', comando: 'No que diz respeito à linguagem cinematográfica.', questoes: [66, 67, 68, 69, 70] },
  { materia: 'Publicidade e Propaganda', conteudo: 'História da publicidade brasileira e evolução dos meios de comunicação', comando: 'No que se refere à história da publicidade no Brasil.', questoes: [71, 72, 73, 74, 75] },
  { materia: 'Marketing Digital', conteudo: 'Tecnologias interativas, redes sociais, realidade aumentada, Big Data e experiência de marca', comando: 'Acerca da relação entre publicidade e novas tecnologias.', questoes: [76, 77, 78, 79, 80, 81] },
  { materia: 'Planejamento de Comunicação', conteudo: 'Planejamento de mídia, integração de canais e estratégia omnichannel', comando: 'Em relação à mídia, ao planejamento e à estratégia de omnichannel.', questoes: [82, 83, 84, 85] },
  { materia: 'Relações Públicas', conteudo: 'Funções, objetivos e impacto das relações públicas', comando: 'A respeito das relações públicas.', questoes: [86, 87] },
  { materia: 'Relações Públicas', conteudo: 'Gestão organizacional, briefing, projetos e ações promocionais', comando: 'Em relação à gestão organizacional e à elaboração de projetos de relações públicas.', questoes: [88, 89, 90] },
  { materia: 'Publicidade e Propaganda', conteudo: 'Gestão de campanhas, canais, storytelling, personas, testes A/B e inbound marketing', comando: 'No que se refere à elaboração e à gestão de campanhas publicitárias.', questoes: [91, 92, 93, 94, 95] },
  { materia: 'Comunicação Organizacional', conteudo: 'Endomarketing, comunicação interna e relacionamento com colaboradores', comando: 'Acerca dos princípios do endomarketing e da comunicação com o público interno.', questoes: [96, 97, 98, 99, 100, 101] },
  { materia: 'Comunicação Pública', conteudo: 'Interesse público, transparência, cidadania e dever de informação estatal', comando: 'Em relação a conceitos e técnicas da comunicação pública.', questoes: [102, 103, 104, 105] },
  { materia: 'Direito Constitucional', conteudo: 'Comunicação social, radiodifusão, liberdade de expressão e propriedade dos meios', comando: 'Com base nas disposições da Constituição Federal de 1988 sobre comunicação social e radiodifusão.', questoes: [106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117] },
  { materia: 'Direito Administrativo', conteudo: 'Contratação pública de serviços de publicidade e qualificação técnica de agências', comando: 'Considerando as regras legais de licitação e contratação pública de serviços de publicidade.', questoes: [118, 119, 120] }
]
const temas = new Map()
for (const s of secoes) for (const numero of s.questoes) {
  if (temas.has(numero)) throw new Error(`Questão ${numero} classificada duas vezes`)
  temas.set(numero, { materia: s.materia, conteudo: s.conteudo, comando: s.comando })
}
if (temas.size !== 70) throw new Error(`Cobertura de classificação inválida: ${temas.size}`)

const duplicadas = new Map([
  ['extr-b35e2b89e7958c6dd272', 'extr-f09b0d27875f5e11d2fa'],
  ['extr-6801af6b99831ff53eff', 'extr-c6e3cd18e831f87fb25b'],
  ['extr-4c178c0d40cf2374d74c', 'extr-b15791ecd00a92c6ff73'],
  ['extr-6233ecea46c8bbc19352', 'extr-f5615bf82a9d6c0a9a30']
])
const cortes = new Map([
  [55, 'No que se refere à campanha publicitária, julgue os próximos itens.'],
  [81, 'CEBRASPE – CODEVASF – Edital: 2024'],
  [105, 'Com base no disposto na Constituição Federal de 1988 sobre a comunicação social, julgue os itens a seguir.']
])
const faceis = new Set([52, 53, 58, 59, 67, 68, 71, 73, 74, 78, 82, 84, 86, 90, 98, 103, 104, 108, 111, 115])
const dificeis = new Set([54, 60, 61, 64, 65, 66, 69, 70, 72, 75, 79, 81, 83, 87, 89, 92, 94, 95, 97, 101, 106, 107, 109, 110, 112, 114, 116, 117, 118, 119, 120])
const hashGabarito = hashRevisao(`${gabarito}\n${JSON.stringify(Object.fromEntries(chave))}`)
if (pendentes.length !== 74) throw new Error(`Esperava 74 registros pendentes; chegaram ${pendentes.length}`)

const decisoes = []
for (const q of pendentes) {
  const numero = Number(q.numero), tema = temas.get(numero), letra = chave.get(numero)
  if (!tema || !letra) throw new Error(`Questão sem tema ou chave oficial: ${q.id}`)
  const duplicadaDe = duplicadas.get(q.id)
  let enunciado = q.enunciado.replace(/\s+/g, ' ').trim()
  if (!duplicadaDe && cortes.has(numero)) {
    const marcador = cortes.get(numero), pos = enunciado.indexOf(marcador)
    if (pos >= 0) enunciado = enunciado.slice(0, pos).trim()
    else if (numero !== 81 && numero !== 105) throw new Error(`Contaminação esperada não localizada em ${q.id}`)
    else if (numero === 81 && !enunciado.endsWith('aplicativos.')) throw new Error(`Q81 não termina corretamente: ${q.id}`)
    else if (numero === 105 && !enunciado.endsWith('transparência.')) throw new Error(`Q105 não termina corretamente: ${q.id}`)
  }
  if (!duplicadaDe && numero === 54) enunciado = enunciado.replace('targer', 'target')
  const imagens = [q.imagem, ...(q.contexto || []).map(x => x.imagem)].filter(Boolean)
  for (const imagem of new Set(imagens)) await fs.access(`public/acervo-extraido/${imagem}`)
  const anulada = letra === 'X'
  decisoes.push({
    id: q.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia: tema.materia,
    conteudo: tema.conteudo,
    concurso: 'CODEVASF — Analista em Desenvolvimento Regional, Cargo 10: Publicidade e Propaganda (aplicação 2024)',
    ano: 2024,
    numero_original: numero,
    dificuldade: faceis.has(numero) ? 'Fácil' : dificeis.has(numero) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial por densidade conceitual, especificidade normativa e número de relações necessárias; não é escala psicométrica publicada pela banca.',
    resposta_correta: anulada ? null : letra === 'C' ? 0 : 1,
    anulada,
    texto_apoio: tema.comando,
    gabarito_oficial: { valor: letra, fonte: gabarito, sha256: hashGabarito, sha256_tipo: 'transcricao_canonica_dos_itens_51_a_120_do_gabarito_definitivo' },
    classificacao_fonte: prova,
    motivo: `Item ${numero} classificado conforme o conteúdo e o comando do bloco no caderno oficial do Cargo 10. Ano de aplicação 2024, confirmado no edital e gabarito definitivos. Resposta e anulações confrontadas com a chave oficial.`,
    ...(duplicadaDe ? { apta_resolucao: false, duplicada_de: duplicadaDe, inelegibilidade_motivo: 'Cópia redundante do mesmo item e edição; mantida para auditoria, sem aparecer como questão resolvível.' } : { enunciado })
  })
}
if (decisoes.length !== pendentes.length || new Set(decisoes.map(x => x.id)).size !== pendentes.length) throw new Error('IDs de decisão repetidos ou ausentes')

const rel = await aplicarRevisoesIndividuais({ nome: 'revisao-codevasf-publicidade-2024-v135', base: origem, decisoes })
const raiz = 'tmp/revisao-profissional/revisao-codevasf-publicidade-2024-v135/acervo-extraido'
if (!raizesAtuais.includes(raiz)) raizesAtuais.unshift(raiz)
const atualPath = 'scripts/acervo-publico/acervo-atual.mjs'
let atual = await fs.readFile(atualPath, 'utf8')
if (!atual.includes(`raizesAtuais.unshift('${raiz}')`)) atual = atual.replace('export async function lerArquivoAtual', `raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`)
await fs.writeFile(atualPath, atual)

const rp = 'docs/acervo/revisao-profissional/RELATORIO.md'
let relatorio = await fs.readFile(rp, 'utf8')
relatorio += `\n\n## Revisão CODEVASF — Publicidade e Propaganda — v135\n\n- Revisei ${rel.classificadas} registros, cobrindo 70 itens distintos (51–120). Classifiquei publicidade e campanhas, redação publicitária, audiovisual, história da publicidade, marketing digital, planejamento omnichannel, relações públicas, endomarketing, comunicação pública, direito constitucional da comunicação social e contratação pública de publicidade.\n- Ano, cargo e aplicação confirmados: CODEVASF, Analista em Desenvolvimento Regional, Cargo 10, aplicação em 20/10/2024. Respostas confrontadas com o gabarito definitivo. Itens anulados: 73, 84 e 108.\n- Identifiquei 4 cópias redundantes com OCR ou contaminação de item vizinho e as desabilitei para resolução, mantendo os registros auditáveis. Limpei os trechos estranhos no item 55 e nos itens em que o comando seguinte foi agregado ao enunciado; mantive o comando correto de cada seção como texto de apoio.\n- Verifiquei localmente os arquivos de página associados aos 74 registros. Dificuldade registrada como estimativa editorial, não como dado oficial da banca.\n- Resultado: ${rel.total} registros no banco; ${rel.disponiveis} elegíveis para resolução; ${rel.pendentes} pendências elegíveis; ${rel.lotes_alterados} lotes regravados. Pacote local, ainda não publicado na nuvem.\n- Fontes primárias: [caderno oficial CEBRASPE — CODEVASF, Cargo 10](https://cdn.cebraspe.org.br/concursos/codevasf_24/arquivos/989_CODEVASF_010_01.PDF), [gabarito definitivo oficial](https://cdn.cebraspe.org.br/concursos/codevasf_24/arquivos/GAB_DEFINITIVO_989_CODEVASF_010_01.PDF).\n`
await fs.writeFile(rp, relatorio)
console.log(JSON.stringify({ ...rel, duplicadas: duplicadas.size, itens_distintos: temas.size, anuladas: [...chave].filter(([, v]) => v === 'X').map(([n]) => n) }, null, 2))
