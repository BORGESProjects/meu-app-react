import fs from 'node:fs/promises'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {gzipSync} from 'node:zlib'
import {fileURLToPath} from 'node:url'

const raiz = fileURLToPath(new URL('../../', import.meta.url))
const base = path.join(raiz, 'output/acervo-bancas-1996-2026')
const publico = path.join(raiz, 'public/acervo-extraido')
const manifestPath = path.join(base, 'manifesto-geral.csv')
const outputText = (await fs.readFile(manifestPath, 'utf8')).replace(/^\uFEFF/u, '')

function lerCsv(texto) {
  const linhas = []
  let linha = [], campo = '', aspas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++ }
      else if (c === '"') aspas = false
      else campo += c
    } else if (c === '"') aspas = true
    else if (c === ',') { linha.push(campo); campo = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++
      linha.push(campo); campo = ''
      if (linha.some(valor => valor !== '')) linhas.push(linha)
      linha = []
    } else campo += c
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha) }
  const cabecalhos = linhas.shift() || []
  return linhas.map(valores => Object.fromEntries(cabecalhos.map((chave, i) => [chave, valores[i] ?? ''])))
}

const hash = valor => createHash('sha256').update(valor).digest('hex')
const idDocumento = registro => hash(String(registro.caminho_local || registro.caminho_texto || registro.nome_arquivo || '').replace(/\\/gu, '/').toLocaleLowerCase('pt-BR')).slice(0, 16)
const normalizar = valor => String(valor ?? '').normalize('NFKC').toLocaleLowerCase('pt-BR').replace(/\s+/gu, ' ').trim()
const slug = valor => String(valor || 'sem-banca').normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '') || 'sem-banca'
const combinar = (...valores) => valores.filter(Boolean).join(' ')

function caminhoSeguro(relativo) {
  const partes = String(relativo || '').split(/[\\/]+/u)
  if (!partes.length || path.isAbsolute(relativo) || partes.some(parte => !parte || parte === '.' || parte === '..')) return null
  const arquivo = path.resolve(base, ...partes)
  return arquivo.startsWith(base + path.sep) ? arquivo : null
}

function documentoDeProva(registro) {
  if ((registro.extensao || '').toLowerCase() !== '.pdf' || !registro.caminho_texto) return false
  const nome = combinar(registro.tipo, registro.nome_arquivo, registro.concurso)
  if (/(?:gabarito|respostas?\s+oficiais|resultado|classifica(?:ç|c)(?:ã|a)o|edital|convoca(?:ç|c)(?:ã|a)o|cronograma|retifica(?:ç|c)(?:ã|a)o|recurso|espelho|locais?\s+de\s+prova|demanda|inscri(?:ç|c)(?:õ|o)es|pontua(?:ç|c)(?:ã|a)o|mapa\s+de\s+prova|errata|relat(?:ó|o)rio|lista\s+de\s+(?:aprovados|candidatos)|cart(?:ã|a)o\s+resposta)/iu.test(nome)) return false
  if (/(?:prova|caderno|exame|quest(?:õ|o)es|avalia(?:ç|c)(?:ã|a)o)/iu.test(nome)) return true
  // Alguns cadernos históricos não incluem a palavra “prova” no nome. Nesses
  // casos, só permanecem se a extração encontrar uma sequência de questões.
  const banca = combinar(registro.banca, registro.concurso)
  if (/^(?:Cebraspe|IBFC|FGV|UFRJ|FUNATEC|FUVEST|INEP|Exército Brasileiro)$/iu.test(registro.banca || '')) {
    return !/cebraspe|cespe/iu.test(banca) || /(?:prova|objetiva|caderno|conhecimentos|quest(?:õ|o)es)/iu.test(nome)
  }
  return /(?:ENEM|ENADE|ENCCEJA|REVALIDA|SAEB|ENAMED|PND|IME CFG)/iu.test(registro.concurso || '')
}

function inferirAno(registro, texto) {
  const declarado = Number(registro.ano)
  if (declarado >= 1900 && declarado <= 2100) return declarado
  const pista = combinar(registro.concurso, registro.tipo, registro.nome_arquivo)
  const anoDaPista = pista.match(/\b((?:19|20)\d{2})\b/u)?.[1]
  if (anoDaPista) return Number(anoDaPista)
  const caminho = String(registro.caminho_texto || '')
  const anoDoCaminho = caminho.match(/(?:^|[\\/])((?:19|20)\d{2})(?:[\\/]|[-_](?:19|20)\d{2}(?:[\\/]|$))/u)?.[1]
  if (anoDoCaminho) return Number(anoDoCaminho)
  const corpo = String(texto || '').replace(/^.*?=====\s*P[ÁA]GINA\s+\d+\s*=====\s*/su, '').slice(0, 3200)
  const anoDoDocumento = corpo.match(/\b(?:concurso(?:\s+p[úu]blico)?|vestibular|ENEM|ENADE|ENCCEJA|REVALIDA|IME|FUVEST|edi[çc][ãa]o|edital(?:\s+n[º°.]?)?)[^\n]{0,70}?\b((?:19|20)\d{2})\b/iu)?.[1]
    || corpo.match(/\b((?:19|20)\d{2})\s*[/–-]\s*(?:19|20)\d{2}\b/u)?.[1]
  return anoDoDocumento ? Number(anoDoDocumento) : null
}

function concursoLegivel(registro) {
  if (registro.concurso && !/^arquivo$/iu.test(registro.concurso.trim())) return registro.concurso
  const partes = String(registro.caminho_texto || '').split(/[\\/]+/u).filter(Boolean)
  const indice = partes.findIndex(parte => /^(?:IBFC|FGV|UFRJ|INEP|FUVEST|CEBRASPE|EXERCITO)$/iu.test(parte))
  const pasta = partes[indice + 1] || ''
  if (pasta && !/^_(?:extraidos_zip|caminhos-curtos)$/iu.test(pasta)) return pasta
  if (registro.nome_arquivo) return `${registro.tipo || registro.banca || 'Prova'} — ${registro.nome_arquivo}`
  return 'Edição sem identificação no manifesto'
}

function limparLinha(linha) {
  return String(linha || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/gu, ' � ').replace(/[\t\f\v ]+/gu, ' ').trim()
}

function separarPaginas(texto) {
  const paginas = []
  let pagina = 1, linhas = [], iniciou = false
  for (const linha of String(texto).split(/\r?\n/u)) {
    const marcador = linha.match(/^\s*=====\s*P[ÁA]GINA\s+(\d+)\s*=====\s*$/iu)
    if (marcador) {
      if (iniciou || linhas.length) paginas.push({pagina, linhas})
      pagina = Number(marcador[1]); linhas = []
      iniciou = true
    } else if (!/^\s*(?:Arquivo:|P[áa]ginas:|Status da extração:|Fonte oficial:|P[áa]gina\s+\d+(?:\s+de\s+\d+)?\s*$)/iu.test(linha)) linhas.push(limparLinha(linha))
  }
  if (iniciou || linhas.length) paginas.push({pagina, linhas})
  return paginas
}

function marcadorQuestao(linha) {
  const s = limparLinha(linha)
  let m = s.match(/^T\s*[.\-–—]\s*0*(\d{1,3})(?:\s*[:.\-–—)]\s*)?(.*)$/iu)
  if (m) return {numero: Number(m[1]), prefixo: m[2] || '', explicito: true}
  m = s.match(/^\{\s*0*(\d{1,3})\s*\}\s*$/u)
  if (m) return {numero: Number(m[1]), prefixo: '', explicito: true}
  m = s.match(/^\s*Quest(?:ã|a)o\s*(?:n[.º°o]?\s*)?0*(\d{1,3})(?:\s*[:.\-–—)]\s*)?(.*)$/iu)
  if (m) return {numero: Number(m[1]), prefixo: m[2] || '', explicito: true}
  m = s.match(/^\s*0*(\d{1,3})\s*[ªa]?\s*Quest(?:ã|a)o\b(.*)$/iu)
  if (m) return {numero: Number(m[1]), prefixo: (m[2] || '').replace(/^\s*Valor\s*:?\s*[\d,.]+\s*/iu, '').trim(), explicito: true}
  m = s.match(/^\s*\[\s*0*(\d{1,3})\s*\]\s*(.*)$/u)
  if (m) return {numero: Number(m[1]), prefixo: m[2] || '', explicito: true}
  m = s.match(/^\s*0*(\d{1,3})\s*[.)]?\s*$/u)
  if (m) return {numero: Number(m[1]), prefixo: '', explicito: /[.)]/u.test(s)}
  m = s.match(/^\s*0*(\d{1,3})\s*[.)]\s+(.{12,})$/u)
  if (m) return {numero: Number(m[1]), prefixo: m[2] || '', explicito: true}
  m = s.match(/^\s*0*(\d{1,3})\s+(.{22,})$/u)
  if (m) return {numero: Number(m[1]), prefixo: m[2] || '', explicito: false}
  return null
}

function marcadoresAlternativa(linhas, aceitarMinusculas = false) {
  const encontrados = []
  for (let i = 0; i < linhas.length; i++) {
    const s = limparLinha(linhas[i])
    const m = s.match(/^\s*(?:\(([A-Ea-e])\)|\[([A-Ea-e])\]|([A-Ea-e])\s*[).:\-–])\s*(.*)$/u) || s.match(/^\s*([A-Ea-e])\s*$/u)
    if (m) {
      const capturada = m[1] || m[2] || m[3]
      if (!aceitarMinusculas && capturada !== capturada.toUpperCase()) continue
      const letra = capturada.toUpperCase()
      const inicio = m[4] || ''
      encontrados.push({indice: i, letra, inicio: inicio || (!m[2] && !m[3] && !m[4] ? linhas[i + 1] || '' : '')})
    }
  }
  return encontrados
}

function sequenciaAlternativas(marcadores) {
  let melhor = []
  for (let inicio = 0; inicio < marcadores.length; inicio++) {
    if (marcadores[inicio].letra !== 'A') continue
    let fim = inicio + 1
    while (fim < marcadores.length && fim - inicio < 5 && marcadores[fim].letra.charCodeAt(0) === 65 + (fim - inicio)) fim++
    const candidata = marcadores.slice(inicio, fim)
    if (candidata.length > melhor.length || (candidata.length === melhor.length && candidata.length >= 2 && candidata[0].indice > (melhor[0]?.indice ?? -1))) melhor = candidata
  }
  return melhor.length >= 2 ? melhor : []
}

function agruparMarcadores(linhas, {exigirAlternativas = true, aceitarMinusculas = false} = {}) {
  const candidatos = []
  for (let i = 0; i < linhas.length; i++) {
    const marcador = marcadorQuestao(linhas[i])
    if (marcador && marcador.numero >= 1 && marcador.numero <= 200) candidatos.push({indice: i, ...marcador})
  }
  const explicitos = candidatos.filter(item => item.explicito)
  const marcadores = explicitos.length >= 2 ? explicitos : candidatos
  if (!marcadores.length) return []
  const blocos = []
  for (let i = 0; i < marcadores.length; i++) {
    const atual = marcadores[i]
    const fim = marcadores[i + 1]?.indice ?? linhas.length
    const trecho = linhas.slice(atual.indice + 1, fim)
    if (atual.prefixo) trecho.unshift(atual.prefixo)
    const opcoes = marcadoresAlternativa(trecho, aceitarMinusculas)
    const sequencia = sequenciaAlternativas(opcoes)
    const marcadorExplicito = atual.explicito
    if (exigirAlternativas && !sequencia.length) continue
    if (marcadores.length === 1 && !marcadorExplicito && !sequencia.length) continue
    blocos.push({numero: atual.numero, indice: atual.indice, fimIndice: Math.max(atual.indice, fim - 1), marcadorExplicito, linhas: trecho, opcoes: sequencia})
  }
  return blocos
}

function agruparCebraspe(paginas) {
  const linhas = paginas.flatMap(pagina => pagina.linhas)
  const paginaDaLinha = []
  for (const pagina of paginas) for (let i = 0; i < pagina.linhas.length; i++) paginaDaLinha.push(pagina.pagina)
  const itens = []
  let sequencia = [], ultimo = null
  for (let i = 0; i < linhas.length; i++) {
    const m = linhas[i].match(/^\s*(\d{1,3})\s+(.{12,})$/u)
    if (!m) continue
    const instrucoesDoCaderno = /^(?:ao\s*receber\s+este\s+caderno|durante\s+a\s*realiza(?:ç|c)[ãa]o\s+(?:da|das)\s+provas?|na\s*dura(?:ç|c)[ãa]o\s+(?:da|das)\s+provas?|ao\s*terminar\s+(?:a|as)\s+provas?|nenhuma\s*folha\s+(?:deste|desse|do)\s+caderno|a\s*desobedi[eê]ncia\s+a\s+qualquer\s+uma\s+das\s+determina(?:ç|c)[õo]es|leia[m]?\s+com\s+aten(?:ç|c)[ãa]o\s+as\s+instru(?:ç|c)[õo]es|confira[m]?\s+inicialmente|n[aã]o\s+se\s+comunique\s+com\s+outros|n[aã]o\s+se\s+levante\s+sem\s+autoriza(?:ç|c)[ãa]o|est[aá]\s+inclu[ií]do\s+o\s+tempo\s+destinado\s+[àa]\s+identifica(?:ç|c)[ãa]o|chame\s+o\(?a\)?\s+aplicador\(?a\)?\s+de\s+provas|devolva-lhe\s+a\s+sua\s+folha\s+de\s+respostas)/iu.test(m[2].trim())
    if (instrucoesDoCaderno) continue
    const numero = Number(m[1])
    if (numero < 1 || numero > 250) continue
    if (ultimo !== null && numero !== ultimo + 1) {
      if (sequencia.length >= 5) itens.push(...sequencia)
      sequencia = []
    }
    sequencia.push({numero, indice: i})
    ultimo = numero
  }
  if (sequencia.length >= 5) itens.push(...sequencia)
  const vistos = new Set()
  const marcados = itens.filter(item => {
    if (vistos.has(item.indice)) return false
    vistos.add(item.indice)
    return true
  }).sort((a, b) => a.indice - b.indice)
  return marcados.map((atual, i) => {
    const fim = marcados[i + 1]?.indice ?? linhas.length
    const bloco = linhas.slice(atual.indice, fim)
    const primeiro = bloco[0] || ''
    const limpo = primeiro.replace(/^\s*\d{1,3}\s+/u, '')
    return {numero: atual.numero, indice: atual.indice, fimIndice: Math.max(atual.indice, fim - 1), pagina: paginaDaLinha[atual.indice] || 1, enunciado: [limpo, ...bloco.slice(1)].filter(Boolean).join('\n').trim()}
  })
}

function indexarPaginas(paginas) {
  const linhas = [], paginaDaLinha = [], inicioPagina = new Map()
  for (const pagina of paginas) {
    inicioPagina.set(pagina.pagina, linhas.length)
    for (const linha of pagina.linhas) { linhas.push(linha); paginaDaLinha.push(pagina.pagina) }
  }
  return {linhas, paginaDaLinha, inicioPagina}
}

function paginasDaFaixa(paginaDaLinha, inicio, fim) {
  return [...new Set(paginaDaLinha.slice(inicio, fim + 1).filter(Boolean))]
}

function temListaNumerada(linhas) {
  let ultimo = null, sequencia = 0
  for (const linha of linhas) {
    const numero = linha.match(/^\s*(\d{1,3})\s+(?=\p{Lu})/u)?.[1]
    if (!numero) { ultimo = null; sequencia = 0; continue }
    const atual = Number(numero)
    sequencia = ultimo !== null && atual === ultimo + 1 ? sequencia + 1 : 1
    if (sequencia >= 2) return true
    ultimo = atual
  }
  return false
}

function textoAntesDaQuestao(paginas, inicioPagina, pagina, indiceQuestao) {
  const origem = paginas.find(item => item.pagina === pagina)
  if (!origem) return ''
  const inicio = inicioPagina.get(pagina) ?? 0
  const prefixo = origem.linhas.slice(0, Math.max(0, indiceQuestao - inicio)).filter(Boolean)
  if (!prefixo.length || temListaNumerada(prefixo) || prefixo.some(linha => marcadorQuestao(linha)?.explicito || /^\s*(?:\(?[A-Ea-e]\)?\s*[).:\-–]|\[[A-Ea-e]\])/u.test(linha))) return ''
  const texto = prefixo.join('\n').trim()
  return texto.length >= 20 ? texto : ''
}

function contextoAnteriorDaQuestao(paginas, paginasOrigem, pagina, enunciado, textoApoio) {
  const pedeContexto = /\b(?:texto|fragmento|trecho|excerto|passagem|figura|gr[aá]fico|tabela|quadro|mapa|tirinha|charge|imagem)\b|com\s+base\s+no\s+(?:texto|quadro|gr[aá]fico)/iu.test(enunciado)
  if (!pedeContexto || pagina <= 1) return {paginas: paginasOrigem, textoApoio}
  const duasPaginasDeContexto = /\b(?:texto|fragmento|trecho|excerto|passagem)\b/iu.test(enunciado)
  const paginasContexto = duasPaginasDeContexto ? [pagina - 2, pagina - 1] : [pagina - 1]
  const paginasAnteriores = paginasContexto.map(numero => paginas.find(item => item.pagina === numero)).filter(Boolean)
  if (!paginasAnteriores.length) return {paginas: paginasOrigem, textoApoio}
  const textosAnteriores = paginasAnteriores.filter(anterior => !temListaNumerada(anterior.linhas) && !anterior.linhas.some(linha => marcadorQuestao(linha)?.explicito || /^\s*(?:\(?[A-Ea-e]\)?\s*[).:\-–]|\[[A-Ea-e]\])/u.test(linha)))
    .map(anterior => ({pagina: anterior.pagina, texto: anterior.linhas.filter(Boolean).join('\n').trim()}))
    .filter(item => item.texto.length >= 40)
  const apoioAnterior = textosAnteriores.map(item => `Página ${item.pagina} — texto de apoio\n${item.texto}`).join('\n\n')
  return {
    paginas: [...new Set([...paginasOrigem, ...paginasAnteriores.map(item => item.pagina)])].sort((a, b) => a - b),
    textoApoio: [textoApoio, apoioAnterior].filter(Boolean).join('\n\n'),
  }
}

function extrairAlternativas(linhas, marcadores) {
  if (!marcadores.length) return {enunciado: linhas.join('\n').trim(), opcoes: []}
  const primeira = marcadores[0].indice
  const enunciado = linhas.slice(0, primeira).filter(Boolean).join('\n').trim()
  const opcoes = []
  for (let i = 0; i < marcadores.length; i++) {
    const atual = marcadores[i]
    const fim = marcadores[i + 1]?.indice ?? linhas.length
    const comeca = atual.inicio && atual.inicio === linhas[atual.indice + 1] ? atual.indice + 2 : atual.indice + 1
    const conteudo = [atual.inicio, ...linhas.slice(comeca, fim)].filter(Boolean).join('\n').trim()
    opcoes.push(conteudo)
  }
  return {enunciado, opcoes}
}

function classificarMotivos(item) {
  const motivos = []
  if (!item.enunciado || item.enunciado.length < 20) motivos.push('enunciado_curto_ou_incompleto')
  if (item.tipo === 'objetiva' && item.opcoes.length < 4) motivos.push('alternativas_incompletas_ou_atipicas')
  if (item.tipo === 'discursiva') motivos.push('questao_discursiva_sem_alternativas')
  if (item.tipo === 'certo_errado') motivos.push('gabarito_certo_errado_nao_vinculado')
  if (item.tipo === 'objetiva') motivos.push('gabarito_oficial_nao_vinculado')
  if (/(?:conforme|como)\s+(?:mostra|indica|apresenta|representa)|(?:figura|gr[aá]fico|imagem|mapa|tirinha|charge|tabela)\s+(?:a seguir|abaixo|ao lado)/iu.test(item.enunciado) && !item.imagem_original && !item.imagens_paginas?.length) motivos.push('verificar_imagem_ou_diagrama_no_pdf')
  if (/(?:�|\uFFFD|Ã.|Â.|˙|„)/u.test(item.enunciado) || item.opcoes.some(opcao => /(?:�|\uFFFD|Ã.|Â.|˙|„)/u.test(opcao))) motivos.push('possivel_corrupcao_de_caracteres')
  if (/\bT\s*[.\-–—]\s*\d{1,3}\b/iu.test([item.enunciado, ...item.opcoes].join('\n'))) motivos.push('marcadores_de_questoes_vizinhas_na_transcricao')
  return motivos
}

function questaoRegistro(registro, pagina, numero, enunciado, opcoes, tipo, ano, paginasOrigem = [pagina], textoApoio = '', transcricoesOcr = []) {
  const url = registro.url_origem || ''
  const concurso = concursoLegivel(registro)
  const documentoId = idDocumento(registro)
  const paginas = [...new Set(paginasOrigem.filter(Number.isFinite))].sort((a, b) => a - b)
  const imagens = paginas.map(numeroPagina => `paginas/${documentoId}-${String(numeroPagina).padStart(4, '0')}.webp`)
  const chave = hash([registro.banca, concurso, ano || '', numero, normalizar(enunciado), ...opcoes.map(normalizar)].join('|'))
  const item = {
    id: `extr-${chave.slice(0, 20)}`,
    ano: ano || inferirAno(registro, ''),
    numero_original: numero,
    banca: registro.banca || 'Sem banca identificada',
    concurso,
    materia: '',
    conteudo: '',
    enunciado,
    opcoes,
    resposta_correta: null,
    anulada: false,
    pagina,
    documento_id: documentoId,
    paginas_origem: paginas,
    imagens_paginas: imagens,
    pagina_imagem: imagens[0] || '',
    texto_apoio: textoApoio,
    transcricoes_ocr: transcricoesOcr,
    fonte: url,
    origem: `${registro.banca || 'Fonte pública'} — ${concurso || registro.nome_arquivo || ''}`.trim(),
    documento_origem: registro.nome_arquivo || '',
    tipo_documento: registro.tipo || '',
    tipo_extraido: tipo,
    status_revisao: 'pendente',
    motivos_revisao: [],
  }
  item.motivos_revisao = classificarMotivos({...item, tipo})
  return item
}

const registros = lerCsv(outputText)
const candidatos = registros.filter(documentoDeProva)
const porShard = new Map()
const resumoBancas = new Map()
const recursosPorDocumento = new Map()
let docsLidos = 0, docsComTexto = 0, docsSemQuestao = 0, docsForaPeriodo = 0, docsAdministrativos = 0, falhasLeitura = 0, itensBrutos = 0, duplicadas = 0
const deduplicacao = new Map()

function marcarRecurso(registro, paginas, ocr = false) {
  const id = idDocumento(registro)
  if (!recursosPorDocumento.has(id)) recursosPorDocumento.set(id, {documento_id: id, caminho_local: registro.caminho_local, paginas: new Set(), paginas_ocr: new Set()})
  const recurso = recursosPorDocumento.get(id)
  for (const numeroPagina of paginas.filter(Number.isFinite)) {
    recurso.paginas.add(numeroPagina)
    if (ocr) recurso.paginas_ocr.add(numeroPagina)
  }
}

for (const registro of candidatos) {
  docsLidos++
  const arquivoTexto = caminhoSeguro(registro.caminho_texto)
  if (!arquivoTexto) { falhasLeitura++; continue }
  let texto
  try { texto = await fs.readFile(arquivoTexto, 'utf8') }
  catch { falhasLeitura++; continue }
  let paginas = separarPaginas(texto)
  let ocrPorPagina = {}
  try { ocrPorPagina = JSON.parse(await fs.readFile(path.join(base, 'textos-ocr', `${idDocumento(registro)}.json`), 'utf8')) }
  catch (erro) { if (erro.code !== 'ENOENT') throw erro }
  for (const pagina of paginas) {
    const ocr = String(ocrPorPagina[pagina.pagina] || '').trim()
    const textoPagina = pagina.linhas.join('\n')
    if (ocr) {
      pagina.ocr_texto = ocr
      const caracteresLegiveis = textoPagina.replace(/\s/gu, '').replace(/[�\uFFFD]/gu, '').length
      if (caracteresLegiveis < 25) pagina.linhas = ocr.split(/\r?\n/u).map(limparLinha).filter(Boolean)
    }
    if (pagina.linhas.join('').replace(/\s/gu, '').length < 35) marcarRecurso(registro, [pagina.pagina], true)
  }
  const statusComTexto = /Status da extração:\s*extra[ií]do/iu.test(texto) || /Status da extração:\s*parcial/iu.test(texto)
  const temOcr = Object.values(ocrPorPagina).some(valor => String(valor || '').trim().length >= 30)
  if (!statusComTexto && !temOcr) {
    const paginasDeclaradas = Number(texto.match(/^Páginas:\s*(\d+)/mu)?.[1] || 0)
    if (paginasDeclaradas) marcarRecurso(registro, Array.from({length: paginasDeclaradas}, (_, i) => i + 1), true)
    continue
  }
  docsComTexto++
  const cabecalho = texto.slice(0, 6000).normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLocaleUpperCase('pt-BR').replace(/[^A-Z0-9]/gu, '')
  if (/(?:RESPOSTAS?AOS?RECURSOS|RECURSOS?CONTRA(?:O)?GABARITO|RESULTADODOS?RECURSOS)/u.test(cabecalho)) { docsAdministrativos++; continue }
  const cespe = /cebraspe|cespe/iu.test(registro.banca || '') || /CESPE\s*\|\s*CEBRASPE/iu.test(texto)
  const tipoDoc = combinar(registro.tipo, registro.nome_arquivo)
  const anoRegistro = inferirAno(registro, texto)
  if (anoRegistro && (anoRegistro < 1997 || anoRegistro > 2026)) { docsForaPeriodo++; continue }
  let encontrados = []
  const indexadas = indexarPaginas(paginas)
  if (cespe && /(?:prova|objetiva|caderno|conhecimentos)/iu.test(tipoDoc)) {
    encontrados = agruparCebraspe(paginas).map(q => {
      let paginasOrigem = paginasDaFaixa(indexadas.paginaDaLinha, q.indice, q.fimIndice)
      let apoio = textoAntesDaQuestao(paginas, indexadas.inicioPagina, q.pagina, q.indice)
      const contexto = contextoAnteriorDaQuestao(paginas, paginasOrigem, q.pagina, q.enunciado, apoio)
      paginasOrigem = contexto.paginas
      apoio = contexto.textoApoio
      const transcricoes = paginas.filter(p => paginasOrigem.includes(p.pagina) && p.ocr_texto).map(p => ({pagina: p.pagina, texto: p.ocr_texto}))
      return questaoRegistro(registro, q.pagina, q.numero, q.enunciado, ['Certo', 'Errado'], 'certo_errado', anoRegistro, paginasOrigem, apoio, transcricoes)
    }).filter(q => q.enunciado.length >= 24)
  } else {
    const {linhas, paginaDaLinha} = indexadas
    const blocos = agruparMarcadores(linhas, {exigirAlternativas: false, aceitarMinusculas: true})
    const discursiva = /(?:discursiv|dissertativ|resposta\s+aberta)/iu.test(tipoDoc) || /IME CFG/i.test(registro.concurso || '')
    for (const bloco of blocos) {
        const partes = extrairAlternativas(bloco.linhas, bloco.opcoes)
        const enunciado = partes.enunciado
          .replace(/^\s*(?::\s*)?Valor\s*:?\s*[\d,.]+\s*/iu, '')
          .replace(/\n{3,}/gu, '\n\n')
          .trim()
        const paginaQuestao = paginaDaLinha[bloco.indice] || 1
        let paginasOrigem = paginasDaFaixa(paginaDaLinha, bloco.indice, bloco.fimIndice)
        let apoio = textoAntesDaQuestao(paginas, indexadas.inicioPagina, paginaQuestao, bloco.indice)
        const contexto = contextoAnteriorDaQuestao(paginas, paginasOrigem, paginaQuestao, enunciado, apoio)
        paginasOrigem = contexto.paginas
        apoio = contexto.textoApoio
        const transcricoes = paginas.filter(p => paginasOrigem.includes(p.pagina) && p.ocr_texto).map(p => ({pagina: p.pagina, texto: p.ocr_texto}))
        if (partes.opcoes.length >= 2 && partes.opcoes.every(opcao => opcao.length >= 2) && enunciado.length >= 24) {
          encontrados.push(questaoRegistro(registro, paginaQuestao, bloco.numero, enunciado, partes.opcoes, 'objetiva', anoRegistro, paginasOrigem, apoio, transcricoes))
        } else if (discursiva && bloco.marcadorExplicito && enunciado.length >= 35) {
          encontrados.push(questaoRegistro(registro, paginaQuestao, bloco.numero, enunciado, [], 'discursiva', anoRegistro, paginasOrigem, apoio, transcricoes))
        }
    }
  }
  if (!encontrados.length) {
    docsSemQuestao++
    continue
  }
  const banco = registro.banca || 'Sem banca identificada'
  const ano = encontrados[0].ano || 'sem-ano'
  const concurso = encontrados[0].concurso
  const shardKey = `${slug(banco)}-${ano}-${slug(concurso).slice(0, 40)}-${hash(`${banco}|${ano}|${concurso}`).slice(0, 7)}`
  if (!porShard.has(shardKey)) porShard.set(shardKey, new Map())
  const shard = porShard.get(shardKey)
  for (const questao of encontrados) {
    marcarRecurso(registro, questao.paginas_origem, questao.motivos_revisao.includes('possivel_corrupcao_de_caracteres'))
    itensBrutos++
    const assinatura = hash([questao.banca, questao.ano || '', questao.concurso, normalizar(questao.enunciado), ...questao.opcoes.map(normalizar)].join('|'))
    if (deduplicacao.has(assinatura)) { duplicadas++; continue }
    deduplicacao.set(assinatura, questao.id)
    shard.set(questao.id, questao)
    if (!resumoBancas.has(banco)) resumoBancas.set(banco, {banca: banco, questoes: 0, anos: new Map(), arquivos: new Set()})
    const resumo = resumoBancas.get(banco)
    resumo.questoes++
    resumo.anos.set(String(ano), (resumo.anos.get(String(ano)) || 0) + 1)
    resumo.arquivos.add(registro.nome_arquivo || registro.caminho_texto)
  }
}

const diretorioLotes = path.join(publico, 'lotes')
await fs.mkdir(diretorioLotes, {recursive: true})
for (const nome of await fs.readdir(diretorioLotes)) {
  if (/\.json(?:\.gz)?$/u.test(nome)) await fs.rm(path.join(diretorioLotes, nome), {force: true})
}
const lotes = []
let bytesSemCompressao = 0, bytesCompactados = 0
for (const [chave, questoesMap] of [...porShard.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const questoes = [...questoesMap.values()]
  if (!questoes.length) continue
  const arquivo = `lotes/${chave}.json.gz`
  const dados = Buffer.from(JSON.stringify(questoes))
  const compactados = gzipSync(dados, {level: 9})
  bytesSemCompressao += dados.length
  bytesCompactados += compactados.length
  await fs.writeFile(path.join(publico, arquivo), compactados)
  const banca = questoes[0].banca
  const ano = questoes[0].ano || null
  const concurso = questoes[0].concurso
  lotes.push({banca, ano, concurso, quantidade: questoes.length, arquivo})
}

const tarefasRecursos = {
  gerado_em: new Date().toISOString(),
  documentos: [...recursosPorDocumento.values()].map(item => ({
    documento_id: item.documento_id,
    caminho_local: item.caminho_local,
    paginas: [...item.paginas].sort((a, b) => a - b),
    paginas_ocr: [...item.paginas_ocr].sort((a, b) => a - b),
  })).sort((a, b) => a.documento_id.localeCompare(b.documento_id)),
}
await fs.writeFile(path.join(base, 'tarefas-recursos-questoes.json'), JSON.stringify(tarefasRecursos, null, 2))
const paginasComImagemPlanejadas = tarefasRecursos.documentos.reduce((soma, item) => soma + item.paginas.length, 0)
const paginasOcrPlanejadas = tarefasRecursos.documentos.reduce((soma, item) => soma + item.paginas_ocr.length, 0)

const manifesto = {
  gerado_em: new Date().toISOString(),
  intervalo: '1997–2026 conforme os documentos efetivamente presentes no corpus local',
  documentos_candidatos: candidatos.length,
  documentos_lidos: docsLidos,
  documentos_com_texto: docsComTexto,
  documentos_sem_questoes_reconstruiveis: docsSemQuestao,
  documentos_fora_do_periodo_1997_2026: docsForaPeriodo,
  documentos_de_recursos_e_resultados_excluidos: docsAdministrativos,
  falhas_leitura: falhasLeitura,
  paginas_com_imagem_planejadas: paginasComImagemPlanejadas,
  paginas_para_ocr: paginasOcrPlanejadas,
  questoes_encontradas_antes_de_deduplicar: itensBrutos,
  questoes_extraidas_unicas: lotes.reduce((soma, lote) => soma + lote.quantidade, 0),
  duplicadas_removidas: duplicadas,
  bytes_json_sem_compressao: bytesSemCompressao,
  bytes_json_gzip: bytesCompactados,
  reducao_compressao_percentual: bytesSemCompressao ? Math.round((1 - bytesCompactados / bytesSemCompressao) * 1000) / 10 : 0,
  status_do_acervo: 'Questões transcritas e vinculadas às páginas visuais de origem; respostas não são inferidas nem usadas para correção automática.',
  lotes: lotes.sort((a, b) => a.banca.localeCompare(b.banca, 'pt-BR') || String(a.ano).localeCompare(String(b.ano))),
  bancas: [...resumoBancas.values()].map(b => ({banca: b.banca, questoes: b.questoes, edicoes: [...b.anos.entries()].sort(([a], [c]) => a.localeCompare(c)).map(([ano, quantidade]) => ({ano, quantidade})), arquivos_com_questoes: b.arquivos.size})).sort((a, b) => a.banca.localeCompare(b.banca, 'pt-BR')),
}
await fs.writeFile(path.join(publico, 'manifesto.json'), JSON.stringify(manifesto, null, 2))
await fs.writeFile(path.join(base, 'manifesto-questoes-extraidas.json'), JSON.stringify(manifesto, null, 2))
console.log(JSON.stringify({documentos_candidatos: candidatos.length, documentos_com_texto: docsComTexto, documentos_sem_questoes_reconstruiveis: docsSemQuestao, documentos_fora_do_periodo: docsForaPeriodo, documentos_de_recursos_excluidos: docsAdministrativos, questoes_brutas: itensBrutos, questoes_unicas: manifesto.questoes_extraidas_unicas, duplicadas, paginas_com_imagem_planejadas: paginasComImagemPlanejadas, paginas_para_ocr: paginasOcrPlanejadas, bytes_json_sem_compressao: bytesSemCompressao, bytes_json_gzip: bytesCompactados, lotes: lotes.length, output: publico}, null, 2))
