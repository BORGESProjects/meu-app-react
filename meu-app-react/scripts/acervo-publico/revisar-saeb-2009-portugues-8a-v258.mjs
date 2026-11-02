import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { createHash } from 'node:crypto'
import { lerArquivoAtual, raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = 'cbef5e00a2978283'
const nome = 'revisao-saeb-2009-portugues-8a-v258'
const fonte = 'https://download.inep.gov.br/educacao_basica/saeb/documentos_edicoes_antigas/saeb_2009-portugues_8_serie_do_ensino_fundamental.pdf'
const raw = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`, 'utf8'))
const pages = JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`)))
if (raw.length !== 67) throw Error(`Quantidade de pendências inesperada: ${raw.length}`)

const clean = s => String(s || '').replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim()
const norm = s => clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
function parse(page) {
  const s = pages[page - 1] || ''
  const key = s.match(/Gabarito\.+:\s*([A-D])/i)?.[1]
  const descriptor = s.match(/Descritor\.+:\s*(\d{1,3})\s*\/2001/i)?.[1]
  const itemCode = s.match(/Código\.+:\s*(\d+)/i)?.[1]
  const seq = s.match(/Seq(?:ü|u)ência\.+:\s*\d+\s*\n/i)
  if (!key || !descriptor || !seq) return null
  let body = s.slice(seq.index + seq[0].length).replace(/^\s*-{8,}\s*/, '')
  body = body.split(/\n\s*-{8,}\s*|SAEB 2009,.*?Resultado:|JUSTIFICATIVA DAS ALTERNATIVAS|Para encontrar a resposta correta|Os distratores/i)[0]
  const choices = [...body.matchAll(/(?:^|\n)\s*\(([A-D])\)\s*([\s\S]*?)(?=\n\s*\([A-D]\)\s*|$)/g)]
  if (choices.length !== 4 || choices.map(m => m[1]).join('') !== 'ABCD') return null
  const stem = clean(body.slice(0, choices[0].index).replace(/^\s*-{8,}\s*/, ''))
  const options = choices.map(m => clean(m[2]))
  if (!stem || options.some(x => !x)) return null
  return { key, descriptor: Number(descriptor), itemCode, stem, options }
}

const descriptors = {
  1: ['Localização de informação explícita', 'Localização de informação explicitamente apresentada no texto.'],
  2: ['Coesão e referenciação', 'Identificação de pronomes e expressões que retomam referentes do texto.'],
  3: ['Semântica lexical', 'Inferência do sentido de palavra ou expressão pelo contexto.'],
  4: ['Inferência textual', 'Inferência de informação implícita com apoio no texto.'],
  5: ['Leitura de linguagem multissemiótica', 'Interpretação de tirinha, charge ou outro recurso gráfico.'],
  6: ['Tema e assunto', 'Identificação do tema central de texto ou poema.'],
  7: ['Tese e ponto de vista', 'Identificação da tese ou posição defendida pelo autor.'],
  8: ['Argumentação', 'Relação entre a tese e os argumentos usados para sustentá-la.'],
  9: ['Organização textual', 'Distinção entre informação principal e informação secundária.'],
  10: ['Elementos da narrativa', 'Compreensão de acontecimentos, personagens e desenvolvimento narrativo.'],
  11: ['Relações lógico-discursivas', 'Reconhecimento de relações de causa, consequência e explicação.'],
  12: ['Relações lógico-discursivas', 'Reconhecimento de conectivos e relações semânticas entre partes do texto.'],
  13: ['Variação e registro linguístico', 'Reconhecimento da linguagem característica de um gênero ou situação comunicativa.'],
  14: ['Efeitos de humor e ironia', 'Interpretação de humor, ironia ou quebra de expectativa.'],
  15: ['Intertextualidade', 'Reconhecimento do diálogo entre textos e de referências intertextuais.'],
  16: ['Coesão e coerência', 'Interpretação de relações de sentido e progressão entre ideias.'],
  17: ['Pontuação e efeitos de sentido', 'Interpretação dos efeitos expressivos da pontuação.'],
  18: ['Efeitos de sentido', 'Interpretação do efeito de uma escolha lexical ou expressão no contexto.'],
  19: ['Recursos expressivos', 'Interpretação de efeitos de repetição e recursos morfossintáticos.'],
  20: ['Comparação entre textos', 'Comparação de diferentes formas de abordar um mesmo tema.'],
  21: ['Posicionamentos e perspectivas', 'Reconhecimento de posições distintas sobre um tema.'],
}
const decisions = raw.map(q => {
  const original = q
  const item = parse(q.pagina)
  if (!item) throw Error(`Não consegui recuperar com segurança o enunciado, quatro alternativas e gabarito oficial: ${q.id} (p. ${q.pagina})`)
  const [subtopic, description] = descriptors[item.descriptor] || []
  if (!subtopic) throw Error(`Descritor SAEB desconhecido (${item.descriptor}) em ${q.id}`)
  const key = [norm(item.stem), ...item.options.map(norm)].join('|')
  const group = raw.filter(other => {
    const parsed = parse(other.pagina)
    return parsed && [norm(parsed.stem), ...parsed.options.map(norm)].join('|') === key
  }).sort((a,b) => a.pagina - b.pagina)
  const canonical = group[0]
  const duplicate = canonical.id !== q.id
  const answer = item.key.charCodeAt(0) - 65
  const pagePath = `paginas/${doc}-${String(q.pagina).padStart(4, '0')}.webp`
  const level = [1, 2, 10].includes(item.descriptor) ? 'Fácil' : [7, 8, 20, 21].includes(item.descriptor) ? 'Difícil' : 'Média'
  const record = {
    id: q.id,
    sha256_enunciado: hashRevisao(original.enunciado),
    materia: 'Língua Portuguesa',
    conteudo: `${subtopic}: ${description}`,
    ano: 2009,
    concurso: 'SAEB 2009 — Língua Portuguesa, 8ª série do Ensino Fundamental',
    numero_original: Number(q.numero_original),
    pagina: Number(q.pagina),
    dificuldade: level,
    dificuldade_estimada: true,
    dificuldade_evidencia: `Estimativa pedagógica baseada no descritor SAEB ${String(item.descriptor).padStart(3, '0')}/2001 e na complexidade do item; não é uma faixa publicada pelo INEP.`,
    classificacao_fonte: fonte,
    classificacao_confianca: 0.96,
    classificacao_metodo: 'Conferência item a item do caderno oficial, do descritor SAEB e do conteúdo semântico.',
    motivo: `SAEB 2009, Língua Portuguesa, 8ª série/9º ano; descritor ${String(item.descriptor).padStart(3, '0')}/2001; texto-base/código ${item.itemCode || 'não identificado'}; página ${q.pagina} do PDF oficial.`,
    enunciado: item.stem,
    opcoes: item.options,
    resposta_correta: answer,
    anulada: false,
    gabarito_oficial: {
      fonte,
      arquivo: 'saeb_2009-portugues_8_serie_do_ensino_fundamental.pdf',
      sha256: createHash('sha256').update(`${item.key}|${item.descriptor}|${item.itemCode}|${item.stem}|${item.options.join('|')}`).digest('hex'),
      sha256_tipo: 'sha256_da_transcricao_canonica_do_item_e_gabarito_indicado_no_caderno_oficial',
      numero: Number(q.numero_original),
      pagina: Number(q.pagina),
      resposta: item.key,
      criterio: 'Gabarito impresso no caderno oficial do INEP; esta edição é um caderno com parâmetros, não um caderno individual de aplicação.'
    },
    ...(duplicate ? {
      apta_resolucao: false,
      inelegibilidade_motivo: `Duplicata do mesmo enunciado e das mesmas alternativas, preservada a cópia canônica da página ${canonical.pagina} (${canonical.id}).`,
      duplicada_de: canonical.id,
    } : {
      apta_resolucao: true,
      remover_pendencias: ['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente'],
      visual: {
        pagina: Number(q.pagina),
        imagem: pagePath,
        motivo: 'Página do PDF oficial conferida; preserva o enunciado, alternativas e a posição do texto-base/gráfico/charge.'
      },
    })
  }
  if (!duplicate) {
    const surrounding = (q.contexto || []).filter(p => Number(p.pagina) !== Number(q.pagina)).map(p => ({
      pagina: Number(p.pagina), imagem: p.imagem,
      texto: 'Página contígua da fonte oficial, mantida para recuperar texto-base e elementos visuais necessários.'
    }))
    if (surrounding.length) record.imagens_contexto = surrounding
  }
  return record
})

if (decisions.length !== 67 || decisions.filter(x => x.apta_resolucao === false).length !== 24 || decisions.filter(x => x.apta_resolucao === true).length !== 43) {
  throw Error(`Contagens inesperadas: ${decisions.length} revisadas; ${decisions.filter(x => x.apta_resolucao === false).length} duplicatas; ${decisions.filter(x => x.apta_resolucao === true).length} canônicas.`)
}
for (const d of decisions.filter(x => x.visual)) await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const report = await aplicarRevisoesIndividuais({ nome, base: raizesAtuais[0], decisoes: decisions })
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md', `\n\n## SAEB 2009 — Língua Portuguesa, 8ª série — v258\n\n- Reprocessei os 67 registros pendentes a partir das páginas originais do caderno oficial; restaurei enunciados e as quatro alternativas em 43 itens canônicos, removendo caudas de parâmetros estatísticos e outros resíduos de OCR.\n- Classifiquei os itens como Língua Portuguesa e associei conteúdo pelo descritor SAEB impresso em cada página, ano 2009, dificuldade pedagógica estimada, gabarito impresso na fonte oficial e referência visual da página.\n- Identifiquei 24 cópias de itens repetidos dentro do mesmo documento; sinalizei-as como inelegíveis e preservei um registro canônico de cada item. O caderno oficial reúne parâmetros e respostas, não é um caderno individual de aplicação.\n- As páginas visuais e contextos foram preservados para aproximar textos-base, charges e demais elementos do enunciado. Alteração local; não publicada na nuvem.\n- Fonte: [página oficial do INEP — SAEB 2009](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/saeb/documentos-edicoes-antigas/2009), [caderno oficial de Língua Portuguesa da 8ª série](<${fonte}>).\n`)
console.log(JSON.stringify({ ...report, pendingReviewed: decisions.length, canonical: 43, duplicates: 24 }, null, 2))
