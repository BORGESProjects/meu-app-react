import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const documento = '60b2ea0c86ccfc42'
const origem = raizesAtuais[0]
const pendentes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
const prova = 'https://cdn.cebraspe.org.br/concursos/POLC_AL_22/arquivos/701_POLC_AL_014_01.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/POLC_AL_22/arquivos/GAB_DEFINITIVO_701_POLC_AL_014_01_%28CARGO_14%29.PDF'

const letras = [
  'C C C E E C C C E E E E C E C C C C E E',
  'X E E E E C E C C E C E C E E C E C X E',
  'C E C E C E E E C C C E E E C E C C C C'
].join(' ').split(' ')
if (letras.length !== 60) throw new Error(`Chave oficial inválida: ${letras.length}`)
const chave = new Map(letras.map((v, i) => [i + 61, v]))

const grupos = [
  { materia: 'Medicina Legal', conteudo: 'Identificação humana, prosopometria, fotografia sinalética, datiloscopia e métodos radiográficos', comando: 'Julgue os itens sobre processo de identificação humana e métodos correlacionados.', questoes: [61, 62, 63, 64, 65] },
  { materia: 'Medicina Legal', conteudo: 'Sexologia forense, himenologia, sinais de gravidez e puerpério', comando: 'Com relação à sexologia forense.', questoes: [66, 67, 68, 69, 70] },
  { materia: 'Medicina Legal', conteudo: 'Traumatologia forense, ferimentos, instrumentos vulnerantes, eletricidade e lesões', comando: 'No que concerne aos tipos de lesões ocasionadas por diferentes meios ou objetos.', questoes: [71, 72, 73, 74, 75, 76, 77, 78, 79, 80] },
  { materia: 'Medicina Legal', conteudo: 'Lesões por armas brancas, leis de ferimentos e lesões por explosão ou corrente elétrica', comando: 'Considerando os mecanismos e efeitos médico-legais das armas brancas e da energia elétrica.', questoes: [81, 82, 83, 84, 85, 86] },
  { materia: 'Direito Penal', conteudo: 'Crimes contra a vida, feminicídio, aborto e infanticídio', comando: 'Com referência aos crimes contra a vida previstos no Código Penal.', questoes: [87, 88, 89, 90] },
  { materia: 'Medicina Legal', conteudo: 'Blast injury, asfixiologia, tanatologia e identificação antropológica', comando: 'Considerando lesões por explosão e fenômenos médico-legais de asfixia e morte.', questoes: [91, 92, 93, 94, 95, 96, 97, 98] },
  { materia: 'Toxicologia Forense', conteudo: 'Intoxicação por cianeto e monóxido de carbono e sinais cadavéricos', comando: 'No que se refere à toxicologia forense.', questoes: [99, 100] },
  { materia: 'Medicina Legal', conteudo: 'Morte violenta, exame necroscópico e hipóteses de dispensa de exame interno', comando: 'Considerando a classificação da morte e as regras para realização da necropsia.', questoes: [101, 102, 103, 104] },
  { materia: 'Medicina Legal', conteudo: 'Técnicas de necropsia de Rokitansky, Virchow, Ghon e Letulle', comando: 'A respeito das diferentes técnicas de necropsia.', questoes: [105, 106, 107, 108, 109] },
  { materia: 'Medicina Legal', conteudo: 'Tanatologia médico-legal, causas jurídicas de morte e suicídio', comando: 'Acerca da determinação da causa jurídica da morte e das classificações de suicídio.', questoes: [110, 111, 112, 113] },
  { materia: 'Medicina Legal', conteudo: 'Fenômenos transformativos, decomposição cadavérica e cronotanatognose', comando: 'A respeito dos processos biológicos e químicos de decomposição e da estimativa do tempo de morte.', questoes: [114, 115, 116, 117, 118, 119, 120] }
]
const temas = new Map()
for (const g of grupos) for (const n of g.questoes) {
  if (temas.has(n)) throw new Error(`Questão ${n} classificada duas vezes`)
  temas.set(n, { materia: g.materia, conteudo: g.conteudo, comando: g.comando })
}
if (temas.size !== 60) throw new Error(`Cobertura inválida: ${temas.size}`)

const duplicadas = new Map([
  ['extr-84a2fa749c886bb9c66d', 'extr-7313c959ed5eb2eb9b03'],
  ['extr-493237bae854514b349c', 'extr-34dffcc054170dc45c97'],
  ['extr-1580e119d50759db6f41', 'extr-1ef2d5fc542f7b99ef65'],
  ['extr-607aaf71b3b18a55985b', 'extr-9cda3b44e5d7a2330836']
])
const cortes = new Map([
  [70, 'No que concerne aos tipos de lesões ocasionados por diversos meios'],
  [80, 'Tendo em vista que as armas brancas podem ser empregadas'],
  [83, 'Existem diferenças significativas entre as mortes causadas'],
  [86, 'Com referência aos crimes contra a vida, sabe-se que alguns são'],
  [90, 'Tendo em vista que, quando um composto químico passa de um estado'],
  [100, 'Para a realização de uma necropsia, é importante inicialmente'],
  [104, 'Durante a execução da necropsia, a depender de como ocorreu'],
  [109, 'Um dos objetivos da tanatologia médico-legal é estabelecer'],
  [113, 'O estudo da morte na medicina legal envolve o conhecimento']
])
const faceis = new Set([61, 62, 66, 68, 71, 76, 78, 81, 87, 89, 91, 93, 95, 101, 104, 105, 106, 107, 110, 114, 115, 120])
const dificeis = new Set([63, 64, 65, 67, 69, 70, 73, 74, 75, 79, 80, 82, 83, 84, 85, 86, 88, 90, 92, 94, 96, 97, 98, 99, 100, 102, 103, 108, 109, 111, 112, 113, 116, 117, 118, 119])
const hashGabarito = hashRevisao(`${gabarito}\n${JSON.stringify(Object.fromEntries(chave))}`)
if (pendentes.length !== 64) throw new Error(`Esperava 64 registros; encontrei ${pendentes.length}`)

const decisoes = []
for (const q of pendentes) {
  const n = Number(q.numero), tema = temas.get(n), letra = chave.get(n)
  if (!tema || !letra) throw new Error(`Questão sem matéria ou gabarito: ${q.id}`)
  const duplicadaDe = duplicadas.get(q.id)
  let enunciado = q.enunciado.replace(/\s+/g, ' ').trim()
  if (!duplicadaDe && cortes.has(n)) {
    const marcador = cortes.get(n).replace(/\s+/g, ' '), pos = enunciado.indexOf(marcador)
    if (pos >= 0) enunciado = enunciado.slice(0, pos).trim()
    else throw new Error(`Limite de contexto não localizado em ${q.id}`)
  }
  const imagens = [q.imagem, ...(q.contexto || []).map(x => x.imagem)].filter(Boolean)
  for (const imagem of new Set(imagens)) await fs.access(`public/acervo-extraido/${imagem}`)
  const anulada = letra === 'X'
  decisoes.push({
    id: q.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia: tema.materia,
    conteudo: tema.conteudo,
    concurso: 'Polícia Científica de Alagoas (POLC/AL) — Cargo 14: Perito Médico-Legista',
    ano: 2023,
    numero_original: n,
    dificuldade: faceis.has(n) ? 'Fácil' : dificeis.has(n) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pela especificidade médico-legal, densidade conceitual e articulação normativa; não é escala psicométrica divulgada pela banca.',
    resposta_correta: anulada ? null : letra === 'C' ? 0 : 1,
    anulada,
    texto_apoio: tema.comando,
    gabarito_oficial: { valor: letra, fonte: gabarito, sha256: hashGabarito, numero: n, pagina: 1, resposta: letra, sha256_tipo: 'transcricao_canonica_dos_itens_61_a_120_do_gabarito_definitivo' },
    classificacao_fonte: prova,
    motivo: `Item ${n} classificado por conteúdo e seção do caderno oficial POLC/AL. Edital 2022, aplicação em 15/01/2023. Gabarito definitivo e anulações conferidos na fonte oficial.`,
    ...(duplicadaDe ? { apta_resolucao: false, duplicada_de: duplicadaDe, inelegibilidade_motivo: 'Cópia redundante do mesmo item; versão redundante tem pontuação ou trecho de outro item anexado por erro de extração, permanece para auditoria e não deve ser resolvida.' } : { enunciado })
  })
}

const rel = await aplicarRevisoesIndividuais({ nome: 'revisao-polcal-perito-medico-legista-2023-v138', base: origem, decisoes })
const raiz = 'tmp/revisao-profissional/revisao-polcal-perito-medico-legista-2023-v138/acervo-extraido'
if (!raizesAtuais.includes(raiz)) raizesAtuais.unshift(raiz)
const atualPath = 'scripts/acervo-publico/acervo-atual.mjs'
let atual = await fs.readFile(atualPath, 'utf8')
if (!atual.includes(`raizesAtuais.unshift('${raiz}')`)) atual = atual.replace('export async function lerArquivoAtual', `raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`)
await fs.writeFile(atualPath, atual)

const rp = 'docs/acervo/revisao-profissional/RELATORIO.md'
let relatorio = await fs.readFile(rp, 'utf8')
relatorio += `\n\n## Revisão POLC/AL — Perito Médico-Legista — v138\n\n- Revisei ${rel.classificadas} registros cobrindo 60 itens distintos (61–120), em Medicina Legal, Direito Penal e Toxicologia Forense. Classifiquei identificação humana, sexologia forense, traumatologia, explosões, asfixiologia, necropsia, toxicologia, crimes contra a vida, causa jurídica da morte e decomposição cadavérica.\n- Concurso, cargo e ano corrigidos: Polícia Científica de Alagoas, Cargo 14 — Perito Médico-Legista; aplicação em 15/01/2023 (edital 2022). Itens anulados no gabarito definitivo: 81 e 99.\n- Identifiquei 4 cópias redundantes (itens 62, 65, 82 e 89), mantidas para auditoria e desativadas para resolução. Limpei comandos de seção agregados aos itens 70, 80, 83, 86, 90, 100, 104, 109 e 113; imagens de página existentes foram verificadas.\n- Dificuldade estimada editorialmente. Resultado: ${rel.total} registros; ${rel.disponiveis} elegíveis para resolução; ${rel.pendentes} pendências elegíveis; ${rel.lotes_alterados} lotes regravados. Pacote local, ainda não publicado na nuvem.\n- Fontes primárias: [caderno oficial CEBRASPE — POLC/AL, Cargo 14](https://cdn.cebraspe.org.br/concursos/POLC_AL_22/arquivos/701_POLC_AL_014_01.PDF), [gabarito definitivo oficial](https://cdn.cebraspe.org.br/concursos/POLC_AL_22/arquivos/GAB_DEFINITIVO_701_POLC_AL_014_01_%28CARGO_14%29.PDF).\n`
await fs.writeFile(rp, relatorio)
console.log(JSON.stringify({ ...rel, duplicadas: duplicadas.size, itens_distintos: new Set(pendentes.map(q => q.numero)).size, anuladas: [...chave].filter(([, v]) => v === 'X').map(([n]) => n) }, null, 2))
