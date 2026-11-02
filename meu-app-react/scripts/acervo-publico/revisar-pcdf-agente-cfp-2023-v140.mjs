import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const documento = '715d83b6bdd9f45e'
const origem = raizesAtuais[0]
const pendentes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
const prova = 'https://cdn.cebraspe.org.br/concursos/pc_df_20_agente/arquivos/C0C18BEB0E75A9CBA54C3CC8AFF1DB4593E08F8307D52BAFEB7F0FEC6BE7EE97.pdf'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/pc_df_20_agente/arquivos/GAB_DEFINITIVO_881_PCDF_AGENTE_CF_001_01.PDF'
const letras = [
  'C C E X C X E E E C C C E C E E C C E C',
  'E X C C C E C E C C E E C C C E E E E E',
  'C E C E C E E C C E E E C C C E E C E E',
  'C C E E C E E C E E E C C C E C E C C E',
  'E E C C C C E E C C E C E C C E E E C C'
].join(' ').split(' ')
if (letras.length !== 100) throw new Error(`Esperava 100 itens no gabarito; encontrei ${letras.length}`)
const chave = new Map(letras.map((v, i) => [i + 1, v]))

const grupos = [
  { materia: 'Atendimento Pré-Hospitalar Tático', conteudo: 'APH tático, atendimento sob fogo, avaliação e triagem do ferido', comando: 'Em relação ao atendimento pré-hospitalar tático (APH-T).', questoes: [1, 2, 3, 4] },
  { materia: 'Atendimento Pré-Hospitalar Tático', conteudo: 'Controle de hemorragias, curativos hemostáticos e torniquetes', comando: 'Com base no protocolo de APH-T.', questoes: [5, 6, 7, 8] },
  { materia: 'Primeiros Socorros', conteudo: 'Suporte básico de vida, obstrução de vias aéreas e reanimação cardiopulmonar', comando: 'Julgue os itens relativos ao suporte básico de vida.', questoes: [9, 10, 11, 12] },
  { materia: 'Direitos Humanos', conteudo: 'Direitos humanos, universalidade, inderrogabilidade e proteção internacional de refugiados', comando: 'Julgue os itens seguintes relativos aos direitos humanos.', questoes: [13, 14, 15, 16, 17] },
  { materia: 'História', conteudo: 'Formação histórica da Polícia Civil e da Polícia Civil do Distrito Federal', comando: 'Com relação à história da polícia civil no Brasil e da PCDF.', questoes: [18, 19, 20, 21, 22] },
  { materia: 'Direito Constitucional', conteudo: 'Segurança pública, SUSP, competências federativas e atribuições das polícias civis', comando: 'No que diz respeito ao sistema de segurança pública do Brasil e à estrutura da PCDF.', questoes: [23, 24, 25, 26, 27] },
  { materia: 'Legislação Institucional', conteudo: 'Regime jurídico, direitos funcionais, responsabilidade e previdência de policiais civis', comando: 'De acordo com a legislação aplicável à PCDF e ao Departamento de Gestão de Pessoas.', questoes: [28, 29, 30, 31, 32] },
  { materia: 'Informática', conteudo: 'Inteligência de fontes abertas (OSINT), operadores de busca e mecanismos de pesquisa', comando: 'Em relação à investigação por meios eletrônicos em fontes abertas.', questoes: [33, 34, 35, 36, 37] },
  { materia: 'Informática', conteudo: 'Tecnologia da informação, segurança da informação, armazenamento, disponibilidade e integridade', comando: 'Considerando os conceitos de tecnologia da informação e sua aplicação na PCDF.', questoes: [38, 39, 40, 41, 42, 43, 44, 45] },
  { materia: 'Conhecimentos Policiais', conteudo: 'Sistemas corporativos da PCDF, protocolo, tramitação e registro de ocorrências', comando: 'No que se refere aos softwares corporativos utilizados na PCDF.', questoes: [46, 47, 48, 49, 50, 51] },
  { materia: 'Investigação Criminal', conteudo: 'Sistemas PROCED e ATLAS, análise e integração de dados policiais', comando: 'A respeito dos sistemas PROCED e ATLAS.', questoes: [52, 53, 54, 55] },
  { materia: 'Telecomunicações', conteudo: 'Radiocomunicação, protocolo TETRA, despacho e operação de redes', comando: 'Julgue os itens relativos às telecomunicações na PCDF.', questoes: [56, 57, 58, 59, 60] },
  { materia: 'Investigação Criminal', conteudo: 'Investigação financeira, COAF, RIF e afastamento de sigilos bancário e fiscal', comando: 'Considerando a investigação financeira de infrações penais.', questoes: [61, 62, 63, 64, 65] },
  { materia: 'Direitos Humanos', conteudo: 'Atendimento policial com perspectiva de gênero e proteção de vítimas de violência', comando: 'No que se refere à investigação criminal sob a perspectiva de gênero e aos protocolos de atendimento.', questoes: [66, 67, 68, 69, 70] },
  { materia: 'Direito Penal', conteudo: 'Investigação de crimes patrimoniais, registro da ocorrência e preservação de vestígios', comando: 'No que se refere aos crimes patrimoniais.', questoes: [71, 72, 73, 74, 75] },
  { materia: 'Direito Penal', conteudo: 'Investigação de tráfico de drogas, obtenção de prova e inteligência financeira', comando: 'Acerca da investigação criminal do tráfico de drogas e dos meios de obtenção de prova.', questoes: [76, 77, 78, 79, 80] },
  { materia: 'Direito Penal', conteudo: 'Investigação de homicídio, exame de corpo de delito e diligências no local do crime', comando: 'No que se refere à investigação criminal do homicídio e aos aspectos jurídico-penais e procedimentais.', questoes: [81, 82, 83, 84, 85] },
  { materia: 'Direitos da Criança e do Adolescente', conteudo: 'Escuta especializada, depoimento especial e proteção de crianças e adolescentes vítimas de violência', comando: 'Acerca do atendimento policial a crianças e adolescentes vítimas ou testemunhas de violência, conforme a Lei nº 13.431/2017.', questoes: [86, 87, 88, 89, 90] },
  { materia: 'Segurança Pública', conteudo: 'Segurança orgânica, contrainteligência e proteção de pessoas, documentos e informações', comando: 'A respeito da segurança orgânica e de aspectos a ela relacionados.', questoes: [91, 92, 93, 94, 95] },
  { materia: 'Psicologia', conteudo: 'Técnicas de entrevista, rapport, memória e vieses cognitivos', comando: 'No que concerne às técnicas de entrevista e aos processos de percepção, atenção e memória.', questoes: [96, 97, 98, 99, 100] }
]
const temas = new Map()
for (const g of grupos) for (const n of g.questoes) {
  if (temas.has(n)) throw new Error(`Item ${n} classificado mais de uma vez`)
  temas.set(n, { materia: g.materia, conteudo: g.conteudo, comando: g.comando })
}
if (temas.size !== 100) throw new Error(`Cobertura temática inválida: ${temas.size}`)

const duplicadas = new Map([
  ['extr-8fa55a0ffeb82021f7f0', 'extr-935d91f1a1c2ce5c6682'],
  ['extr-c8eb5fdd0810cc2c35c0', 'extr-cba29cb1e6fa812a608f'],
  ['extr-cecf742ddce900484912', 'extr-21340723565c6afc2c8c'],
  ['extr-983697581c2e481e24a2', 'extr-7b9af8e25d5d0216a8f6'],
  ['extr-4a05966a4eb51341c31c', 'extr-b1de0b5170c489c9adea'],
  ['extr-e12bb1349c6bbf18156e', 'extr-d1bf85c33f903e2901da'],
  ['extr-19e3a05107ae10d286cd', 'extr-0945621cbe29ee99c1cc']
])
const cortes = new Map([
  [4, 'Com base no protocolo de APH-T, julgue os itens seguintes.'],
  [8, 'Julgue os itens que se seguem, relativos ao suporte básico de vida.'],
  [17, 'Com relação à história da polícia civil no Brasil'],
  [19, '2 A criação da Divisão de Segurança'],
  [27, 'De acordo com a legislação que se aplica à PCDF'],
  [37, 'Considerando os conceitos de tecnologia da informação'],
  [51, 'A respeito dos sistemas PROCED e ATLAS'],
  [60, 'A investigação financeira de infrações penais'],
  [70, 'CEBRASPE – PCDF – Edital: 2020'],
  [80, 'No que se refere à investigação criminal do crime de homicídio'],
  [85, 'Acerca do atendimento policial a crianças e adolescentes'],
  [90, 'CEBRASPE – PCDF – Edital: 2020'],
  [95, 'No que concerne a técnicas de entrevista']
])
const faceis = new Set([1, 2, 5, 8, 9, 13, 14, 17, 18, 20, 23, 24, 26, 33, 37, 39, 43, 44, 46, 49, 50, 53, 54, 57, 59, 62, 66, 67, 71, 72, 73, 77, 79, 81, 82, 86, 89, 90, 91, 93, 96, 99])
const dificeis = new Set([4, 6, 11, 15, 16, 28, 29, 30, 31, 32, 35, 36, 38, 41, 42, 45, 47, 48, 52, 55, 56, 58, 60, 61, 63, 64, 65, 68, 69, 70, 74, 75, 76, 78, 80, 83, 84, 85, 87, 88, 92, 94, 95, 97, 98, 100])
const anuladas = new Set([...chave].filter(([, v]) => v === 'X').map(([n]) => n))
const hashGabarito = hashRevisao(`${gabarito}\n${JSON.stringify(Object.fromEntries(chave))}`)
if (pendentes.length !== 92) throw new Error(`Esperava 92 registros pendentes; encontrei ${pendentes.length}`)

const decisoes = []
for (const q of pendentes) {
  const n = Number(q.numero), tema = temas.get(n), letra = chave.get(n)
  if (!tema || !letra) throw new Error(`Item sem matéria ou gabarito: ${q.id}`)
  let enunciado = q.enunciado.replace(/\s+/g, ' ').trim()
  if (cortes.has(n)) {
    const marcador = cortes.get(n).replace(/\s+/g, ' '), pos = enunciado.indexOf(marcador)
    if (pos >= 0) enunciado = enunciado.slice(0, pos).trim()
  }
  if (n === 19 && !duplicadas.has(q.id)) enunciado = 'A Lei nº 2.364/1958 criou o Departamento Regional de Polícia de Brasília (DRPB), extinguindo a Guarda Especial de Brasília (GEB) e desvinculando completamente a segurança pública de Brasília da Secretaria de Segurança Pública do Estado de Goiás.'
  if (n === 6 && !duplicadas.has(q.id)) enunciado = enunciado.replace('deve -se', 'deve-se')
  if (n === 8 && !duplicadas.has(q.id)) enunciado = `${enunciado.replace(/[.\s]+$/u, '')}.`
  if (n === 86) enunciado = enunciado.replace('espontanea mente', 'espontaneamente').replace('relat asse', 'relatasse')
  if (n === 80) enunciado = enunciado.replace('encaminhamento d o material', 'encaminhamento do material').replace('jurídico -penais', 'jurídico-penais')
  if (n === 85) enunciado = enunciado.replace('protocolo s da PCDF', 'protocolos da PCDF')
  if (n === 95) enunciado = enunciado.replace('prod ução', 'produção')
  const imagens = [q.imagem, ...(q.contexto || []).map(x => x.imagem)].filter(Boolean)
  for (const imagem of new Set(imagens)) await fs.access(`public/acervo-extraido/${imagem}`)
  const duplicadaDe = duplicadas.get(q.id)
  const anulada = anuladas.has(n)
  decisoes.push({
    id: q.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia: tema.materia,
    conteudo: tema.conteudo,
    concurso: 'PCDF — Curso de Formação Profissional de Agente; avaliação de verificação de aprendizagem (Edital 2020)',
    ano: 2023,
    numero_original: n,
    dificuldade: faceis.has(n) ? 'Fácil' : dificeis.has(n) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pela complexidade normativa e técnica do item; não representa escala psicométrica divulgada pela banca.',
    resposta_correta: anulada ? null : letra === 'C' ? 0 : 1,
    anulada,
    texto_apoio: tema.comando,
    gabarito_oficial: { valor: letra, fonte: gabarito, sha256: hashGabarito, numero: n, pagina: 1, resposta: letra, sha256_tipo: 'transcricao_canonica_dos_itens_1_a_100_do_gabarito_definitivo' },
    classificacao_fonte: prova,
    motivo: `Item ${n} classificado pelo conteúdo e bloco temático do caderno oficial da PCDF. Gabarito definitivo do curso de formação, aplicação em 27/08/2023.`,
    ...(duplicadaDe ? { apta_resolucao: false, duplicada_de: duplicadaDe, inelegibilidade_motivo: 'Cópia duplicada do mesmo item, com OCR mais defeituoso ou questões seguintes concatenadas; preservada para auditoria e desativada para resolução.' } : { enunciado })
  })
}

const rel = await aplicarRevisoesIndividuais({ nome: 'revisao-pcdf-agente-cfp-2023-v140', base: origem, decisoes })
const raiz = 'tmp/revisao-profissional/revisao-pcdf-agente-cfp-2023-v140/acervo-extraido'
if (!raizesAtuais.includes(raiz)) raizesAtuais.unshift(raiz)
const atualPath = 'scripts/acervo-publico/acervo-atual.mjs'
let atual = await fs.readFile(atualPath, 'utf8')
if (!atual.includes(`raizesAtuais.unshift('${raiz}')`)) atual = atual.replace('export async function lerArquivoAtual', `raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`)
await fs.writeFile(atualPath, atual)

const rp = 'docs/acervo/revisao-profissional/RELATORIO.md'
let relatorio = await fs.readFile(rp, 'utf8')
relatorio += `\n\n## Revisão PCDF — Agente, Curso de Formação — v140\n\n- Revisei ${rel.classificadas} registros cobrindo 85 números distintos dos itens 1–100; os demais já não constavam entre as pendências exportáveis. Classifiquei APH tático, primeiros socorros, direitos humanos, história da PCDF, segurança pública, legislação institucional, informática, investigação criminal, telecomunicações, Direito Penal, proteção de crianças e adolescentes, segurança orgânica e psicologia da entrevista.\n- Atribuição e data corrigidas com fontes oficiais: avaliação de verificação de aprendizagem do Curso de Formação Profissional para Agente da PCDF; edital de 2020, aplicação do gabarito definitivo em 27/08/2023. Itens anulados no gabarito: 4, 6 e 22.\n- Detectei 7 duplicatas de OCR nos itens 1, 2, 3, 4, 6, 8 e 14; as versões redundantes foram preservadas para auditoria e desativadas. Corrigi o enunciado truncado do item 19 e removi comandos de seções seguintes dos itens 4, 8, 17, 19, 27, 37, 51, 60, 70, 80, 85, 90 e 95; ajustei erros claros de OCR nos itens 6, 80, 85, 86 e 95. Referências de página/imagem foram verificadas.\n- Dificuldade estimada editorialmente. Resultado: ${rel.total} registros; ${rel.disponiveis} elegíveis para resolução; ${rel.pendentes} pendências elegíveis; ${rel.lotes_alterados} lotes regravados. Pacote local, ainda não publicado na nuvem.\n- Fontes primárias: [caderno oficial de avaliação da PCDF](https://cdn.cebraspe.org.br/concursos/pc_df_20_agente/arquivos/C0C18BEB0E75A9CBA54C3CC8AFF1DB4593E08F8307D52BAFEB7F0FEC6BE7EE97.pdf), [gabarito definitivo do Curso de Formação — aplicação em 27/08/2023](https://cdn.cebraspe.org.br/concursos/pc_df_20_agente/arquivos/GAB_DEFINITIVO_881_PCDF_AGENTE_CF_001_01.PDF).\n`
await fs.writeFile(rp, relatorio)
console.log(JSON.stringify({ ...rel, duplicadas: duplicadas.size, itens_distintos: new Set(pendentes.map(q => q.numero)).size, anuladas: [...anuladas] }, null, 2))
