import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const documento = '872779cf6a27b29c'
const origem = raizesAtuais[0]
const pendentes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
const prova = 'https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/394_EBSERHASSISTENCIAL033__PAG_4.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/GAB_DEFINITIVO_394_EBSERHASSISTENCIAL033.PDF'
const letras = [
  'C E E C E C E E E C E E C E E C E C C E',
  'E C E C E C E E C C E C E C E E C E C C',
  'E C E C C C E C E C E C E E E C E C E C'
].join(' ').split(' ')
if (letras.length !== 60) throw new Error(`Esperava 60 respostas; encontrei ${letras.length}`)
const chave = new Map(letras.map((v, i) => [i + 41, v]))

const grupos = [
  { materia: 'Física Médica', conteudo: 'Física das radiações: decaimento radioativo, interação da radiação com a matéria e poder de freamento', comando: 'A respeito do decaimento radioativo e das interações da radiação com a matéria.', questoes: [41, 42, 43, 44, 45] },
  { materia: 'Física Médica', conteudo: 'Radioterapia: fontes, aceleradores lineares, colimação, dosimetria e curvas de rendimento em profundidade', comando: 'Tendo em vista o uso de radiações ionizantes em radioterapia.', questoes: [46, 47, 48, 49, 50, 51] },
  { materia: 'Física Médica', conteudo: 'Tecnologias e planejamento em radioterapia: radiocirurgia, radioterapia intraoperatória, braquiterapia e imagem', comando: 'Considerando a evolução tecnológica e o planejamento dos tratamentos radioterápicos.', questoes: [52, 53, 54, 55, 56, 57, 58, 59, 60, 61] },
  { materia: 'Física Médica', conteudo: 'Planejamento em radioterapia: interação da radiação, volumes-alvo, movimento e proteção de estruturas', comando: 'A respeito dos sistemas de planejamento em radioterapia.', questoes: [62, 63, 64, 65, 66, 67, 68, 69, 70] },
  { materia: 'Física Médica', conteudo: 'Braquiterapia: modalidades, taxa de dose, fontes seladas e proteção radiológica', comando: 'Com relação ao tratamento radioterápico por braquiterapia.', questoes: [71, 72, 73, 74, 75] },
  { materia: 'Física Médica', conteudo: 'Radioterapia de intensidade modulada (IMRT): controle de qualidade, MLC e planejamento inverso', comando: 'A respeito da IMRT e da otimização da distribuição de dose.', questoes: [76, 77, 78, 79, 80, 81, 82, 83, 84, 85] },
  { materia: 'Física Médica', conteudo: 'Radioproteção: grandezas dosimétricas, atenuação, monitoração e limites de dose', comando: 'Considerando recomendações de proteção radiológica e monitoração de campos.', questoes: [86, 87, 88, 89, 90, 91] },
  { materia: 'Física Médica', conteudo: 'Radiobiologia: mecanismos de lesão, resposta celular, LET, RBE e efeitos pré-natais', comando: 'Acerca dos efeitos das radiações ionizantes sobre sistemas biológicos.', questoes: [92, 93, 94, 95, 96, 97, 98, 99, 100] }
]
const temas = new Map()
for (const grupo of grupos) for (const n of grupo.questoes) {
  if (temas.has(n)) throw new Error(`Questão ${n} classificada mais de uma vez`)
  temas.set(n, { materia: grupo.materia, conteudo: grupo.conteudo, comando: grupo.comando })
}
if (temas.size !== 60) throw new Error(`Cobertura temática inválida: ${temas.size}`)

const cortes = new Map([
  [45, 'Tendo em vista que a radioterapia é uma forma de tratamento'],
  [51, 'A evolução e os avanços tecnológicos melhoraram'],
  [61, 'CESPE | CEBRASPE – EBSERH_ASSISTENCIAL'],
  [70, 'Na braquiterapia, o tratamento radioterápico é feito'],
  [75, 'Na radioterapia de intensidade modulada (IMRT), a intensidade'],
  [81, 'CESPE | CEBRASPE – EBSERH_ASSISTENCIAL'],
  [85, 'Tendo em vista que, de acordo com as recomendações da ICRP'],
  [91, 'CESPE | CEBRASPE – EBSERH_ASSISTENCIAL']
])
const faceis = new Set([43, 46, 48, 50, 53, 56, 58, 62, 65, 67, 71, 73, 74, 79, 88, 92, 94, 96])
const dificeis = new Set([41, 42, 44, 47, 49, 57, 61, 64, 66, 72, 75, 78, 82, 83, 84, 85, 89, 91, 97, 98])
const hashGabarito = hashRevisao(`${gabarito}\n${JSON.stringify(Object.fromEntries(chave))}`)
if (pendentes.length !== 57) throw new Error(`Esperava 57 registros pendentes; encontrei ${pendentes.length}`)

const decisoes = []
for (const q of pendentes) {
  const n = Number(q.numero), tema = temas.get(n), letra = chave.get(n)
  if (!tema || !letra) throw new Error(`Questão sem matéria ou gabarito: ${q.id}`)
  let enunciado = q.enunciado.replace(/\s+/g, ' ').trim()
  if (cortes.has(n)) {
    const marcador = cortes.get(n).replace(/\s+/g, ' '), pos = enunciado.indexOf(marcador)
    if (pos < 0) throw new Error(`Limite de texto-base não encontrado no item ${n}`)
    enunciado = enunciado.slice(0, pos).trim()
  }
  for (const imagem of new Set([q.imagem, ...(q.contexto || []).map(x => x.imagem)].filter(Boolean))) {
    await fs.access(`public/acervo-extraido/${imagem}`)
  }
  decisoes.push({
    id: q.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia: tema.materia,
    conteudo: tema.conteudo,
    concurso: 'EBSERH — Cargo 33: Físico, Física Médica, especialidade Radioterapia',
    ano: 2018,
    numero_original: n,
    dificuldade: faceis.has(n) ? 'Fácil' : dificeis.has(n) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial por densidade de física médica, radioterapia e dosimetria; não é escala psicométrica publicada pela banca.',
    resposta_correta: letra === 'C' ? 0 : 1,
    anulada: false,
    texto_apoio: tema.comando,
    enunciado,
    gabarito_oficial: { valor: letra, fonte: gabarito, sha256: hashGabarito, numero: n, pagina: 1, resposta: letra, sha256_tipo: 'transcricao_canonica_dos_itens_41_a_100_do_gabarito_definitivo' },
    classificacao_fonte: prova,
    motivo: `Item ${n} classificado pelo conteúdo e pelo bloco temático do caderno oficial CEBRASPE/EBSERH. Aplicação em 06/05/2018; resposta conferida no gabarito definitivo do Cargo 33.`
  })
}

const rel = await aplicarRevisoesIndividuais({ nome: 'revisao-ebserh-fisica-medica-radioterapia-2018-v139', base: origem, decisoes })
const raiz = 'tmp/revisao-profissional/revisao-ebserh-fisica-medica-radioterapia-2018-v139/acervo-extraido'
if (!raizesAtuais.includes(raiz)) raizesAtuais.unshift(raiz)
const atualPath = 'scripts/acervo-publico/acervo-atual.mjs'
let atual = await fs.readFile(atualPath, 'utf8')
if (!atual.includes(`raizesAtuais.unshift('${raiz}')`)) atual = atual.replace('export async function lerArquivoAtual', `raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`)
await fs.writeFile(atualPath, atual)

const rp = 'docs/acervo/revisao-profissional/RELATORIO.md'
let relatorio = await fs.readFile(rp, 'utf8')
relatorio += `\n\n## Revisão EBSERH — Física Médica/Radioterapia — v139\n\n- Revisei ${rel.classificadas} registros cobrindo os itens pendentes de 41–99 (itens 82, 95 e 100 já não constavam entre as pendências exportáveis). Classifiquei física das radiações, radioterapia, braquiterapia, IMRT, radioproteção e radiobiologia.\n- Concurso, cargo, ano e aplicação confirmados: EBSERH, Cargo 33 — Físico, Física Médica, especialidade Radioterapia; aplicação em 06/05/2018. Respostas conferidas no gabarito definitivo oficial; nenhum item anulado na tabela deste cargo.\n- Removi do enunciado dos itens 45, 51, 61, 70, 75, 81, 85 e 91 cabeçalhos e comandos de blocos seguintes que tinham sido concatenados durante a extração. Os demais registros mantêm a redação matemática, notação e imagens originais; arquivos de imagem/contexto foram verificados.\n- Dificuldade estimada editorialmente. Resultado: ${rel.total} registros; ${rel.disponiveis} elegíveis para resolução; ${rel.pendentes} pendências elegíveis; ${rel.lotes_alterados} lotes regravados. Pacote local, ainda não publicado na nuvem.\n- Fontes primárias: [caderno oficial CEBRASPE — EBSERH, Cargo 33](https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/394_EBSERHASSISTENCIAL033__PAG_4.PDF), [gabarito definitivo oficial](https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/GAB_DEFINITIVO_394_EBSERHASSISTENCIAL033.PDF).\n`
await fs.writeFile(rp, relatorio)
console.log(JSON.stringify({ ...rel, itens_distintos: new Set(pendentes.map(q => q.numero)).size, intervalo: [pendentes[0].numero, pendentes.at(-1).numero], anuladas: [] }, null, 2))
