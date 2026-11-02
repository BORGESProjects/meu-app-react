import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { createHash } from 'node:crypto'
import { lotesAtuais, lerArquivoAtual, raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = 'f6c2c7da886c7155'
const pdf = 'https://download.inep.gov.br/educacao_basica/saeb/documentos_edicoes_antigas/saeb_2009-matematica_4_serie_do_ensino_fundamental.pdf'
const raw = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`, 'utf8'))
const pages = JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`)))
const norm = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const clean = s => (s || '').replace(/\u000c/g, ' ').replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim()
function parse(q) {
  const s = pages[q.pagina - 1] || ''
  const serie = s.match(/Série\.+:\s*([^\n]+)/i)?.[1]?.trim()
  const code = s.match(/Código\.+:\s*(\d+)/i)?.[1]
  const descriptor = s.match(/Descritor\.+:\s*(\d+)/i)?.[1]
  const key = s.match(/Gabarito\.+:\s*([A-D])/i)?.[1]
  const sequence = Number(s.match(/Seq(?:ü|u)ência\.+:\s*(\d+)/i)?.[1])
  if (!serie?.includes('4ª série') || !code || !descriptor || !key || !sequence) return null
  const mark = s.search(/Seq(?:ü|u)ência\.+:/i)
  let body = s.slice(mark)
  body = body.replace(/^Seq(?:ü|u)ência\.+:[^\n]*\n/i, '').replace(/^\s*-{8,}\s*/u, '')
  const stop = body.search(/\n\s*-{8,}\s*\n|\n\s*SAEB 2009,/i)
  if (stop >= 0) body = body.slice(0, stop)
  const matches = [...body.matchAll(/(?:^|\n)\s*\(([A-D])\)\s*([\s\S]*?)(?=\n\s*\([A-D]\)\s*|$)/g)]
  let stem, options
  if (matches.length === 4 && matches.map(m => m[1]).join('') === 'ABCD') {
    stem = clean(body.slice(0, matches[0].index))
    options = matches.map(m => clean(m[2]))
  } else {
    if (/fazer um cubo/i.test(body) && body.indexOf('(A)') >= 0) {
      stem = clean(body.slice(0, body.indexOf('(A)')))
      options = ['Planificação 1 (figura na imagem da questão)', 'Planificação 2 (figura na imagem da questão)', 'Planificação 3 (figura na imagem da questão)', 'Planificação 4 (figura na imagem da questão)']
    }
    // The first SAEB item prints its four coordinate choices without letter labels.
    const tail = body.match(/Qual é a localização do cinema\?\s*([\s\S]*)$/i)
    if (tail && !options) {
      stem = 'Ajude Bruno a identificar a localização do cinema no mapa. Para isso, observe a letra da linha e o número da coluna. Qual é a localização do cinema?'
      options = tail[1].split(/\r?\n/).map(clean).filter(x => /^[A-Z]\d$/u.test(x)).slice(0, 4)
    }
  }
  if (!stem || !options || options.length !== 4) return null
  stem = stem.replace(/\uF0B8/g, '÷').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim()
  // OCR extracts stacked fractions bottom-to-top; restore the image-verified notation.
  if (/50%/.test(stem)) options = ['1/2', '1/5', '2/100', '5/100']
  if (/parte sombreada dessa figura/i.test(stem)) options = ['3/10', '3/7', '7/10', '7/3']
  if (/quatro moldes|fazer um cubo/i.test(stem)) options = ['Planificação 1 (figura na imagem da questão)', 'Planificação 2 (figura na imagem da questão)', 'Planificação 3 (figura na imagem da questão)', 'Planificação 4 (figura na imagem da questão)']
  const statBlock = s.match(/SAEB 2009, Matemática, 4ª série[^\n]*Resultado:[\s\S]*?(?=SAEB 2009, Matemática, 8ª série|$)/i)?.[0]
  const rows = (statBlock || '').split(/\r?\n/).map(x => x.match(/-?\d+(?:\.\d+)?/g)).filter(x => x?.length >= 12)
  const nums = rows.at(-1)?.map(Number)
  const rate = nums?.[8 + 'ABCD'.indexOf(key)]
  return { serie, code, descriptor, key, sequence, stem, options, rate: Number.isFinite(rate) ? rate : null }
}
function topic(stem, descriptor) {
  const s = norm(stem)
  if (/localizacao|linha e o numero da coluna|casas da chegada|trajeto|percurso/.test(s)) return 'Localização e movimentação no espaço — leitura de mapas, croquis e trajetos'
  if (/cilindro|pirâmide|planific|cubo|corpos redondos/.test(s)) return 'Geometria espacial — sólidos geométricos e planificações'
  if (/ângulos|angulos|quadriláter|figura geométrica|figuras geométricas/.test(s)) return 'Geometria plana — figuras, lados e ângulos'
  if (/perímetro|perimetro|contorno/.test(s)) return 'Grandezas e medidas — perímetro'
  if (/área|area|quadradinho|malha quadriculada/.test(s)) return 'Grandezas e medidas — área em malha quadriculada'
  if (/kg|grama|peso|massa/.test(s)) return 'Grandezas e medidas — massa e unidades de medida'
  if (/hora|minuto|dia|semana|domingo|segunda-feira|horário|horario/.test(s)) return 'Grandezas e medidas — tempo, duração e calendário'
  if (/R\$|reais|centavos|moeda|nota de/.test(stem)) return 'Números e operações — sistema monetário e problemas com valores'
  if (/fração|fracao|desconto corresponde|número racional|numero racional/.test(s)) return 'Números racionais — representação e comparação de frações'
  if (/gráfico|grafico|tabela|quadro|pesquisa|preferência|preferencia|dados apresentados/.test(s)) return 'Tratamento da informação — leitura de tabelas e gráficos'
  if (/valor posicional|algarismo|numeral|unidades de milhar|decomposição/.test(s)) return 'Números — sistema de numeração decimal e valor posicional'
  if (/sequência|sequencia|letras representam|números estão representados/.test(s)) return 'Números — sequências e regularidades'
  if (/multiplic|produto|vezes|divid|quociente|soma|somar|subtr|troco|total|quantas|quantos|por quanto/.test(s)) return 'Números e operações — resolução de problemas com operações fundamentais'
  return `Matemática — resolução de problemas (descritor SAEB ${descriptor})`
}
function difficulty(rate) {
  if (rate == null) return { dificuldade: 'Média', dificuldade_estimada: true, dificuldade_evidencia: 'Estimativa pedagógica; a taxa oficial de acerto não foi recuperada para este item.' }
  const d = rate >= 70 ? 'Fácil' : rate >= 40 ? 'Média' : 'Difícil'
  return { dificuldade: d, dificuldade_estimada: true, dificuldade_evidencia: `Estimativa derivada da taxa oficial de acerto do item no SAEB 2009 (${rate}%); fácil ≥70%, média 40–69%, difícil <40%.` }
}
const parsed = raw.map(q => ({ q, item: parse(q) }))
const falhas = parsed.filter(x => !x.item)
if (falhas.length) throw new Error(`Falha na leitura fiel de ${falhas.length} registros: ${falhas.map(x => `${x.q.id}/p${x.q.pagina}`).join(', ')}`)
const baselineIndex = raizesAtuais.findIndex(r => r.includes('revisao-infrasa-administrador-2026-v144'))
if (baselineIndex < 0) throw new Error('Base profissional v144 não encontrada')
const base = raizesAtuais[baselineIndex]
const bases = raizesAtuais.slice(baselineIndex)
const manifest = JSON.parse(await lerArquivoAtual('manifesto.json', bases))
const ativos = new Map()
for (const { indice, lote } of manifest.lotes.map((lote, indice) => ({ indice, lote }))) {
  if (!lote.arquivo) continue
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo, bases)))
  for (const q of qs) if (q.documento_id === doc && raw.some(x => x.id === q.id)) ativos.set(q.id, q)
}
if (ativos.size !== raw.length) throw new Error(`Registros ativos: ${ativos.size}/${raw.length}`)
const decisoes = []
for (const { q, item } of parsed) {
  const original = ativos.get(q.id)
  const sourcePage = q.pagina - 1
  const image = `paginas/${doc}-${String(sourcePage).padStart(4, '0')}.webp`
  const imageBytes = await fs.readFile(`public/acervo-extraido/${image}`)
  const imageHash = hashRevisao(imageBytes)
  const conteudo = topic(item.stem, item.descriptor)
  const d = {
    id: q.id, sha256_enunciado: hashRevisao(original.enunciado), materia: 'Matemática', conteudo,
    ano: 2009, numero_original: item.sequence, pagina: q.pagina,
    ...difficulty(item.rate), resposta_correta: 'ABCD'.indexOf(item.key),
    gabarito_oficial: { valor: item.key, fonte: pdf, pagina: q.pagina, sha256: imageHash, numero: item.sequence, resposta: item.key, metodo: 'Gabarito impresso no cabeçalho do item; conferido com a página do caderno oficial do Inep.' },
    classificacao_fonte: pdf,
    motivo: `SAEB 2009, Matemática, 4ª série do ensino fundamental. Item ${item.sequence}, código ${item.code}, descritor ${item.descriptor}/2001. Tema atribuído pelo enunciado e pela habilidade avaliada.`,
    enunciado: item.stem, opcoes: item.options,
    imagem_pagina: image,
    texto_apoio: '',
    apta_resolucao: true,
    remover_pendencias: ['classificacao_especifica_pendente', 'gabarito_oficial_nao_vinculado', 'ano_sem_evidencia', 'enunciado_incompleto', 'alternativas_invalida', 'alternativa_vazia', 'texto_corrompido', 'texto_de_outro_bloco', 'visual_ausente']
  }
  decisoes.push(d)
}
if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ registros: raw.length, itensFielmenteExtraidos: parsed.length, fontesINEP: pdf, gabaritos: decisoes.filter(x => x.gabarito_oficial).length, respostas: decisoes.filter(x => x.resposta_correta >= 0).length, estatisticas: parsed.filter(x => x.item.rate !== null).length, semTaxa: parsed.filter(x => x.item.rate === null).length, exemplos: decisoes.slice(0, 3).map(x => ({ id: x.id, numero: x.numero_original, conteudo: x.conteudo, opcoes: x.opcoes, resposta: x.gabarito_oficial.valor, dificuldade: x.dificuldade })), paginasVerificadas: new Set(decisoes.map(x => x.pagina)).size }, null, 2))
  process.exit(0)
}
const report = await aplicarRevisoesIndividuais({ nome: 'revisao-saeb-matematica-4a-2009-v145', base, decisoes })
raizesAtuais.unshift('tmp/revisao-profissional/revisao-saeb-matematica-4a-2009-v145/acervo-extraido')
const out = { ...report, fonte: pdf, registros_revistos: raw.length, itens_recuperados_integralmente: parsed.length, questoes_com_gabarito_oficial: decisoes.length, questoes_com_taxa_de_acerto_oficial: parsed.filter(x => x.item.rate !== null).length, sem_taxa: parsed.filter(x => x.item.rate === null).length, paginas_com_imagem_preservada: new Set(decisoes.map(x => x.imagem_pagina)).size, publicada: false }
await fs.writeFile(`docs/acervo/revisao-profissional/revisao-saeb-matematica-4a-2009-v145.json`, JSON.stringify(out, null, 2))
console.log(JSON.stringify(out, null, 2))
