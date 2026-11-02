import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const documento = '722c53481302dee8'
const origem = raizesAtuais[0]
const pendentes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
const prova = 'https://cdn.cebraspe.org.br/concursos/EBSERH_18_ADMINISTRATIVO/arquivos/393_EBSERHADMINISTRATIVA014__PAG_2.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/EBSERH_18_ADMINISTRATIVO/arquivos/GAB_DEFINITIVO_393_EBSERHADMINISTRATIVA014.PDF'

const letras = 'C C E C E C C E E C C E C C E E C E E E C C E C X E E E E C C C E C E E E E C C E E E C C E E E C E C C C E E E C C E C'.split(' ')
if (letras.length !== 60) throw new Error(`Chave oficial inválida: ${letras.length}`)
const chave = new Map(letras.map((v, i) => [i + 41, v]))

const materias = [
  { materia: 'Jornalismo', conteudo: 'Estrutura da notícia, lide, critérios de noticiabilidade e texto jornalístico', comando: 'Tendo em vista a notícia como construção retórica referencial, julgue os itens acerca da estrutura da notícia e do texto jornalístico.', questoes: [41, 42, 43, 44, 45, 46] },
  { materia: 'Ética Jornalística', conteudo: 'Ética profissional, processos jornalísticos, objetividade e direito à informação', comando: 'Com relação à ética, ao processo jornalístico e ao direito à informação.', questoes: [47, 48, 49, 50, 51, 52, 53, 54] },
  { materia: 'Teoria da Comunicação', conteudo: 'Comunicação, cultura, modelos comunicacionais, signos e meios', comando: 'A respeito das relações entre comunicação, sociedade e cultura.', questoes: [55, 56, 57, 58, 59, 60] },
  { materia: 'Produção Gráfica', conteudo: 'Fluxo gráfico, preparação de texto, revisão, prova e softwares editoriais', comando: 'Com relação aos processos de produção gráfica.', questoes: [61, 62, 63, 64, 65] },
  { materia: 'Teoria da Comunicação', conteudo: 'Opinião pública, economia da comunicação, mídia e espaço simbólico', comando: 'Acerca da comunicação como produto do processo social.', questoes: [66, 67, 68, 69, 70] },
  { materia: 'Comunicação Organizacional', conteudo: 'Comunicação para promoção da saúde, comunicação interna e externa e endomarketing', comando: 'Considerando a comunicação voltada ao desenvolvimento e as práticas de comunicação interna e externa.', questoes: [71, 72, 73, 74, 75] },
  { materia: 'Comunicação Audiovisual', conteudo: 'Teoria da imagem, realidade aumentada, linguagem audiovisual e cinema', comando: 'Considerando o texto-base sobre imagem, julgue os itens relativos à teoria da imagem.', questoes: [76, 77, 78, 79, 80] },
  { materia: 'Design Gráfico', conteudo: 'Design da informação, infografia, semiótica visual e interpretação de peças gráficas', comando: 'Considerando o texto-base de design da informação, julgue os itens sobre seus fundamentos.', questoes: [81, 82, 83, 84, 85] },
  { materia: 'Jornalismo Digital', conteudo: 'Novas mídias, hipertextualidade, interatividade, formatos de notícia e mobilidade', comando: 'Considerando a importância das novas mídias digitais para o jornalismo.', questoes: [86, 87, 88, 89, 90, 91] },
  { materia: 'Assessoria de Comunicação', conteudo: 'Planejamento estratégico, relacionamento com a imprensa, mailing, releases e comunicação institucional', comando: 'Considerando o texto-base sobre mídia e práticas jornalísticas, julgue os itens de assessoria de comunicação.', questoes: [92, 93, 94, 95, 96, 97, 98, 99, 100] }
]
const temas = new Map()
for (const g of materias) for (const n of g.questoes) {
  if (temas.has(n)) throw new Error(`Questão ${n} classificada duas vezes`)
  temas.set(n, { materia: g.materia, conteudo: g.conteudo, comando: g.comando })
}
if (temas.size !== 60) throw new Error(`Cobertura incompleta: ${temas.size}`)

const baseSaude = 'O objetivo da comunicação voltada para o desenvolvimento é estimular a mudança de comportamento da população com vistas à adoção de modelos comportamentais e estilos de vida saudáveis. A promoção da saúde seria alcançada pela informação divulgada nos canais corretos e com a mensagem adequada a determinado público. Essa comunicação reforçaria condutas e hábitos saudáveis e a diminuição de comportamentos de risco. Fonte indicada no caderno: Ministério da Saúde, Secretaria de Vigilância em Saúde, Relatório de pesquisa: Gestão da saúde aplicada à vigilância em saúde: a percepção dos gestores, Brasília, 2008 (com adaptações).'
const baseImagem = 'Podemos dizer que a imagem é narrativa. Por mais estática que ela seja, outras tantas são desencadeadas em nossa mente, num movimento frenético de associações. Nossas ideias se constroem a partir de imagens. A imagem é questionadora e sempre tentaremos encontrar uma resposta diante dela. Por último, em uma perspectiva subjetiva e até um pouco poética, ela é o próprio espelho, na lente da câmera, na tela, nos olhos de outro alguém. A imagem é a linguagem da alma. Fonte indicada no caderno: Márcia Nogueira Alves et al., Mídia e produção audiovisual: uma introdução, Curitiba: IBPEX, 2008 (com adaptações).'
const baseDesign = 'Entre os meios de design de informação, o infográfico surge com a informação a partir de desenhos e gráficos que denotam um conteúdo dinâmico e interativo. A Internet propicia um ambiente que privilegia a interatividade de forma ampla a partir dos elementos da hipermídia (som, imagem e movimento), que facilitam uma melhor absorção de conhecimento e informação. Fonte indicada no caderno: Ailton S. Silva et al., Design de informação: uma explosão de possibilidades num mundo imagético e interativo, Portugal: Instituto Politécnico de Tomar, 2013 (com adaptações).'
const baseDigital = 'Quando deixam de chamar a atenção e se tornam triviais, as mídias se tornam realmente importantes. Se sua articulação com o cotidiano atinge um nível muito alto, a própria vida se transforma. Não por conta da mídia em si, mas pelas relações humanas ligadas a elas. Fonte indicada no caderno: Luís M. de Sá Martino, Teoria das mídias digitais, Petrópolis: Vozes, 2015 (com adaptações).'
const baseAssessoria = 'No século XXI, o ser humano se recria a partir da mídia. O movimento iniciado há um século com o cinema e a televisão atinge um grau inédito, no qual as pessoas têm a possibilidade de criar uma nova identidade individual nas mídias eletrônicas, ao mesmo tempo em que o planeta se unifica quase à força no fluxo global de imagens e sentidos. Fonte indicada no caderno: Márcia Nogueira Alves et al., Mídia e produção audiovisual: uma introdução, Curitiba: IBPEX, 2008 (com adaptações).'
const cortes = new Map([
  [60, 'Com relação aos processos de produção gráfica, julgue os itens que se seguem.'],
  [70, 'O objetivo da comunicação voltada para o desenvolvimento'],
  [75, 'CESPE | CEBRASPE – EBSERH_ADMINISTRATIVA – Aplicação: 2018'],
  [81, 'Entre os meios de design de informação, o infográfico'],
  [85, 'Quando deixam de chamar a atenção e se tornam triviais,'],
  [91, 'No século XXI, o ser humano se recria a partir da mídia.']
])
const faceis = new Set([41, 44, 46, 47, 50, 55, 61, 63, 67, 70, 72, 74, 78, 80, 83, 86, 89, 95, 97, 99, 100])
const dificeis = new Set([42, 45, 48, 51, 54, 56, 57, 58, 60, 62, 64, 65, 66, 68, 69, 73, 75, 77, 79, 84, 85, 87, 90, 91, 92, 93, 94, 96, 98])
const hashGabarito = hashRevisao(`${gabarito}\n${JSON.stringify(Object.fromEntries(chave))}`)
if (pendentes.length !== 60) throw new Error(`Esperava 60 registros; encontrei ${pendentes.length}`)

const decisoes = []
for (const q of pendentes) {
  const n = Number(q.numero), tema = temas.get(n), letra = chave.get(n)
  if (!tema || !letra) throw new Error(`Questão sem matéria ou chave oficial: ${q.id}`)
  let enunciado = q.enunciado.replace(/\s+/g, ' ').trim()
  if (cortes.has(n)) {
    const marcador = cortes.get(n).replace(/\s+/g, ' '), pos = enunciado.indexOf(marcador)
    if (pos >= 0) enunciado = enunciado.slice(0, pos).trim()
    else if (n === 75 && enunciado.includes('A Internet alterou a rotina')) enunciado = enunciado.slice(0, enunciado.indexOf('A Internet alterou a rotina')).trim()
    else if (n === 81 && enunciado.includes('Entre os meios de design')) enunciado = enunciado.slice(0, enunciado.indexOf('Entre os meios de design')).trim()
    else if (n === 85 && enunciado.includes('Quando deixam de chamar')) enunciado = enunciado.slice(0, enunciado.indexOf('Quando deixam de chamar')).trim()
    else if (n === 91 && enunciado.includes('No século XXI')) enunciado = enunciado.slice(0, enunciado.indexOf('No século XXI')).trim()
    else throw new Error(`Não localizei o limite do texto-base no item ${n}`)
  }
  if (n === 66) enunciado = enunciado.replace('tendo vista', 'tendo em vista')
  const imagens = [q.imagem, ...(q.contexto || []).map(x => x.imagem)].filter(Boolean)
  for (const imagem of new Set(imagens)) await fs.access(`public/acervo-extraido/${imagem}`)
  const anulada = letra === 'X'
  const textoApoio = n >= 71 && n <= 75 ? baseSaude : n >= 76 && n <= 80 ? baseImagem : n >= 82 && n <= 85 ? baseDesign : n >= 86 && n <= 90 ? baseDigital : n >= 92 && n <= 98 ? baseAssessoria : tema.comando
  decisoes.push({
    id: q.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia: tema.materia,
    conteudo: tema.conteudo,
    concurso: 'EBSERH — Área Administrativa, Cargo 14: Jornalista',
    ano: 2018,
    numero_original: n,
    dificuldade: faceis.has(n) ? 'Fácil' : dificeis.has(n) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial por densidade conceitual e especificidade do conteúdo; não é medida psicométrica publicada pela banca.',
    resposta_correta: anulada ? null : letra === 'C' ? 0 : 1,
    anulada,
    texto_apoio: textoApoio,
    gabarito_oficial: { valor: letra, fonte: gabarito, sha256: hashGabarito, sha256_tipo: 'transcricao_canonica_dos_itens_41_a_100_do_gabarito_definitivo' },
    classificacao_fonte: prova,
    motivo: `Questão ${n} classificada individualmente pelo enunciado e pelo bloco temático do caderno oficial EBSERH, Cargo 14 — Jornalista. Aplicação em 06/05/2018 e gabarito definitivo conferidos em fonte oficial. Textos-base compartilhados foram separados do enunciado e mantidos com a referência bibliográfica impressa no caderno.`,
    enunciado
  })
}

const rel = await aplicarRevisoesIndividuais({ nome: 'revisao-ebserh-jornalista-2018-v136', base: origem, decisoes })
const raiz = 'tmp/revisao-profissional/revisao-ebserh-jornalista-2018-v136/acervo-extraido'
if (!raizesAtuais.includes(raiz)) raizesAtuais.unshift(raiz)
const atualPath = 'scripts/acervo-publico/acervo-atual.mjs'
let atual = await fs.readFile(atualPath, 'utf8')
if (!atual.includes(`raizesAtuais.unshift('${raiz}')`)) atual = atual.replace('export async function lerArquivoAtual', `raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`)
await fs.writeFile(atualPath, atual)

const rp = 'docs/acervo/revisao-profissional/RELATORIO.md'
let relatorio = await fs.readFile(rp, 'utf8')
relatorio += `\n\n## Revisão EBSERH — Jornalista — v136\n\n- Revisei ${rel.classificadas} itens pendentes (41–100), classificando-os em Jornalismo, Ética Jornalística, Teoria da Comunicação, Produção Gráfica, Comunicação Organizacional, Comunicação Audiovisual, Design Gráfico, Jornalismo Digital e Assessoria de Comunicação.\n- Corrigi concurso, cargo e ano de aplicação: EBSERH — Área Administrativa, Cargo 14 — Jornalista, aplicação em 06/05/2018. Respostas conferidas no gabarito definitivo; item 65 anulado oficialmente.\n- Separei os textos-base dos itens 71–75, 76–80, 82–85, 86–90 e 92–98 dos enunciados correspondentes, com referências bibliográficas do próprio caderno. Limpei contaminação de comandos nos itens 60, 70, 75, 81, 85 e 91. Verifiquei a existência das páginas originais associadas aos registros.\n- Dificuldade estimada editorialmente. Resultado: ${rel.total} registros; ${rel.disponiveis} elegíveis; ${rel.pendentes} pendências elegíveis; ${rel.lotes_alterados} lotes regravados. Pacote local, ainda não publicado na nuvem.\n- Fontes primárias: [caderno oficial CEBRASPE — EBSERH, Jornalista](https://cdn.cebraspe.org.br/concursos/EBSERH_18_ADMINISTRATIVO/arquivos/393_EBSERHADMINISTRATIVA014__PAG_2.PDF), [gabarito definitivo oficial — Cargo 14](https://cdn.cebraspe.org.br/concursos/EBSERH_18_ADMINISTRATIVO/arquivos/GAB_DEFINITIVO_393_EBSERHADMINISTRATIVA014.PDF).\n`
await fs.writeFile(rp, relatorio)
console.log(JSON.stringify({ ...rel, itens_distintos: temas.size, anuladas: [...chave].filter(([, v]) => v === 'X').map(([n]) => n) }, null, 2))
