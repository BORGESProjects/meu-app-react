import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const origem = raizesAtuais[0]
if (!origem.includes('revisao-pcdf-agente-cfp-2023-v140')) throw new Error(`Base inesperada: ${origem}`)
const pcdf = JSON.parse(await fs.readFile('tmp/registros-documento-715d83b6bdd9f45e.json', 'utf8'))
const ebserh = JSON.parse(await fs.readFile('tmp/registros-documento-872779cf6a27b29c.json', 'utf8'))
const fontePcdf = 'https://cdn.cebraspe.org.br/concursos/pc_df_20_agente/arquivos/C0C18BEB0E75A9CBA54C3CC8AFF1DB4593E08F8307D52BAFEB7F0FEC6BE7EE97.pdf'
const gabPcdf = 'https://cdn.cebraspe.org.br/concursos/pc_df_20_agente/arquivos/GAB_DEFINITIVO_881_PCDF_AGENTE_CF_001_01.PDF'
const fonteEbs = 'https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/394_EBSERHASSISTENCIAL033__PAG_4.PDF'
const gabEbs = 'https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/GAB_DEFINITIVO_394_EBSERHASSISTENCIAL033.PDF'
const keyPcdf = [
  'C C E X C X E E E C C C E C E E C C E C',
  'E X C C C E C E C C E E C C C E E E E E',
  'C E C E C E E C C E E E C C C E E C E E',
  'C C E E C E E C E E E C C C E C E C C E',
  'E E C C C C E E C C E C E C C E E E C C'
].join(' ').split(' ')
const keyEbs = [
  'C E E C E C E E E C E E C E E C E C C E',
  'E C E C E C E E C C E C E C E E C E C C',
  'E C E C C C E C E C E C E E E C E C E C'
].join(' ').split(' ')
if (keyPcdf.length !== 100 || keyEbs.length !== 60) throw new Error('Tamanho de chave oficial incorreto')
const shaPcdf = hashRevisao(`${gabPcdf}\n${JSON.stringify(Object.fromEntries(keyPcdf.map((v, i) => [i + 1, v])))}`)
const shaEbs = hashRevisao(`${gabEbs}\n${JSON.stringify(Object.fromEntries(keyEbs.map((v, i) => [i + 41, v])))}`)

const assuntosPcdf = new Map([
  [15, ['Direitos Humanos', 'Direitos fundamentais e abertura do catálogo constitucional', 'Julgue os itens seguintes relativos aos direitos humanos.']],
  [16, ['Direitos Humanos', 'Direitos humanos no sistema internacional e Proclamação de Teerã', 'Julgue os itens seguintes relativos aos direitos humanos.']],
  [17, ['Direitos Humanos', 'Conceito de refugiado e proteção internacional', 'Julgue os itens seguintes relativos aos direitos humanos.']],
  [19, ['História', 'Criação do Departamento Regional de Polícia de Brasília e trajetória institucional da PCDF', 'Com relação à história da polícia civil no Brasil e da Polícia Civil do Distrito Federal (PCDF).']],
  [20, ['História', 'Divisão de Segurança Pública da NOVACAP e construção de Brasília', 'Com relação à história da polícia civil no Brasil e da Polícia Civil do Distrito Federal (PCDF).']],
  [21, ['História', 'Intendência-Geral de Polícia e origem da polícia civil no Brasil', 'Com relação à história da polícia civil no Brasil e da Polícia Civil do Distrito Federal (PCDF).']],
  [22, ['História', 'Criação oficial da Polícia Civil do Distrito Federal', 'Com relação à história da polícia civil no Brasil e da Polícia Civil do Distrito Federal (PCDF).']],
  [28, ['Direito Constitucional', 'Direito de greve dos servidores públicos que atuam na segurança pública', 'De acordo com a legislação aplicável à PCDF e ao Departamento de Gestão de Pessoas.']],
  [29, ['Direito Administrativo', 'Responsabilidade civil do servidor por danos ao patrimônio público', 'De acordo com a legislação aplicável à PCDF e ao Departamento de Gestão de Pessoas.']],
  [30, ['Legislação Institucional', 'Acidente em serviço e remuneração do policial civil durante incapacidade laboral', 'De acordo com a legislação aplicável à PCDF e ao Departamento de Gestão de Pessoas.']],
  [31, ['Direito Constitucional', 'Competência legislativa sobre a organização das polícias civis', 'De acordo com a legislação aplicável à PCDF e ao Departamento de Gestão de Pessoas.']],
  [32, ['Direito Previdenciário', 'Aposentadoria dos servidores da PCDF após a Emenda Constitucional nº 103/2019', 'De acordo com a legislação aplicável à PCDF e ao Departamento de Gestão de Pessoas.']],
  [33, ['Inteligência Policial', 'Inteligência de fontes abertas (OSINT), coleta e análise de dados públicos', 'Em relação à investigação por meios eletrônicos em fontes abertas (OSINT).']],
  [34, ['Inteligência Policial', 'OSINT e integração entre ramos da atividade de inteligência', 'Em relação à investigação por meios eletrônicos em fontes abertas (OSINT).']],
  [35, ['Inteligência Policial', 'Operadores de busca na investigação por fontes abertas', 'Em relação à investigação por meios eletrônicos em fontes abertas (OSINT).']],
  [45, ['Informática', 'Política de segurança da informação e aplicação a servidores e prestadores de serviço', 'Julgue os itens seguintes relativos à segurança da informação.']],
  [52, ['Investigação Criminal', 'Sistemas PROCED e ATLAS: importação e relacionamento de dados', 'A respeito dos sistemas PROCED e ATLAS.']],
  [78, ['Direito Processual Penal', 'Notícia anônima, notitia criminis e instauração de inquérito policial', 'Acerca da investigação criminal do tráfico de drogas e dos meios de obtenção de prova.']]
])
const duplicatas = new Map([
  ['extr-39f2051c1d151828c82f', 'extr-ad5e50c7e73cc093146b'],
  ['extr-ce0849c6e8a7a44b366e', 'extr-883a46fda2310f481831'],
  ['extr-d122c75d80c22828d96b', 'extr-fe0f6705a1e1495c3bce']
])
const dificuldadesFacil = new Set([17, 20, 21, 33, 34, 45])
const dificuldadesDificil = new Set([16, 28, 29, 31, 32, 35, 52, 78])
const duplicataHash = new Map()
const decisoes = []
for (const q of pcdf.filter(q => assuntosPcdf.has(Number(q.numero)))) {
  const n = Number(q.numero), [materia, conteudo, comando] = assuntosPcdf.get(n), letra = keyPcdf[n - 1]
  let enunciado = q.enunciado.replace(/\s+/g, ' ').trim()
  if (n === 16) enunciado = enunciado.replace('Re solução', 'Resolução')
  if (n === 21) enunciado = enunciado.replace('Intendência -Geral', 'Intendência-Geral')
  if (n === 22) {
    const corte = enunciado.indexOf('CEBRASPE – PCDF – Edital: 2020')
    if (corte >= 0) enunciado = enunciado.slice(0, corte).trim()
  }
  if (n === 35) enunciado = enunciado.replace('busc a', 'busca')
  if (n === 45) {
    const corte = enunciado.indexOf('CEBRASPE – PCDF – Edital: 2020')
    if (corte >= 0) enunciado = enunciado.slice(0, corte).trim()
  }
  const anulada = letra === 'X', dup = duplicatas.get(q.id)
  const pageImages = [q.imagem, ...(q.contexto || []).map(x => x.imagem)].filter(Boolean)
  for (const img of new Set(pageImages)) await fs.access(`public/acervo-extraido/${img}`)
  if (dup) duplicataHash.set(q.id, hashRevisao(q.enunciado))
  decisoes.push({
    id: q.id, sha256_enunciado: hashRevisao(q.enunciado), materia, conteudo,
    concurso: 'PCDF — Curso de Formação Profissional de Agente; avaliação de verificação de aprendizagem (Edital 2020)',
    ano: 2023, numero_original: n,
    dificuldade: dificuldadesFacil.has(n) ? 'Fácil' : dificuldadesDificil.has(n) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pela complexidade conceitual, normativa ou técnica do item; não é escala psicométrica divulgada pela banca.',
    resposta_correta: anulada ? null : letra === 'C' ? 0 : 1, anulada, texto_apoio: comando,
    gabarito_oficial: { valor: letra, fonte: gabPcdf, sha256: shaPcdf, numero: n, pagina: 1, resposta: letra, sha256_tipo: 'transcricao_canonica_dos_itens_1_a_100_do_gabarito_definitivo' },
    classificacao_fonte: fontePcdf,
    motivo: `Item ${n} reavaliado no caderno oficial da PCDF e no gabarito definitivo do Curso de Formação; aplicação em 27/08/2023.`,
    ...(dup ? { apta_resolucao: false, duplicada_de: dup, inelegibilidade_motivo: 'Cópia repetida de item já presente no mesmo caderno; OCR e pontuação piores, mantida para auditoria e desativada para resolução.' } : { enunciado })
  })
}
if (decisoes.filter(x => x.classificacao_fonte === fontePcdf).length !== 21) throw new Error('Esperava 21 registros PCDF (18 itens distintos e 3 cópias OCR)')

const contextoRadiobiologia = 'Considerando que um sistema biológico exposto a radiações sofre lesões detectáveis nos seus diferentes níveis de organização — fragmentos de moléculas, moléculas inteiras, organelas celulares, células, tecidos, órgãos e subsistemas —, julgue os itens que se seguem, acerca dos efeitos da radioterapia sobre o organismo humano.'
const dadosEbs = new Map([
  [82, { materia: 'Física Médica', conteudo: 'IMRT: planejamento inverso, parâmetros de otimização e objetivos do DVH', comando: 'Considerando a figura do planejamento inverso de IMRT vinculada à página original do caderno.', dificuldade: 'Difícil', apoio: 'O planejamento inverso de IMRT utiliza parâmetros dos campos, objetivos de dose e restrições para volumes-alvo (PTV) e órgãos de risco (OAR). A figura correspondente está vinculada à imagem original da página.' }],
  [95, { materia: 'Física Médica', conteudo: 'Radiobiologia: efeitos agudos e tardios das radiações ionizantes', comando: contextoRadiobiologia, dificuldade: 'Média', apoio: contextoRadiobiologia }],
  [100, { materia: 'Física Médica', conteudo: 'Radiobiologia: efeitos pré-natais e exposição fetal à radiação ionizante', comando: contextoRadiobiologia, dificuldade: 'Média', apoio: contextoRadiobiologia }]
])
for (const q of ebserh.filter(q => dadosEbs.has(Number(q.numero)))) {
  const n = Number(q.numero), tema = dadosEbs.get(n), letra = keyEbs[n - 41]
  let enunciado = q.enunciado.replace(/\s+/g, ' ').trim()
  if (n === 100) enunciado = enunciado.replace(/\s*Espaço livre\s*$/u, '').trim()
  for (const img of new Set([q.imagem, ...(q.contexto || []).map(x => x.imagem)].filter(Boolean))) await fs.access(`public/acervo-extraido/${img}`)
  decisoes.push({
    id: q.id, sha256_enunciado: hashRevisao(q.enunciado), materia: tema.materia, conteudo: tema.conteudo,
    concurso: 'EBSERH — Cargo 33: Físico, Física Médica, especialidade Radioterapia', ano: 2018,
    numero_original: n, dificuldade: tema.dificuldade, dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pela densidade de física médica e radiobiologia; não é escala psicométrica divulgada pela banca.',
    resposta_correta: letra === 'C' ? 0 : 1, anulada: false, enunciado, texto_apoio: tema.apoio,
    gabarito_oficial: { valor: letra, fonte: gabEbs, sha256: shaEbs, numero: n, pagina: 1, resposta: letra, sha256_tipo: 'transcricao_canonica_dos_itens_41_a_100_do_gabarito_definitivo' },
    classificacao_fonte: fonteEbs,
    motivo: `Item ${n} anteriormente classificado em área incompatível; reclassificado em Física Médica conforme o enunciado e o bloco radiobiológico do caderno oficial. Gabarito definitivo conferido.`
  })
}
if (decisoes.length !== 24) throw new Error(`Esperava 24 registros reavaliados; encontrei ${decisoes.length}`)

const rel = await aplicarRevisoesIndividuais({ nome: 'revisao-excecoes-pcdf-ebserh-v141', base: origem, decisoes })
const raiz = 'tmp/revisao-profissional/revisao-excecoes-pcdf-ebserh-v141/acervo-extraido'
if (!raizesAtuais.includes(raiz)) raizesAtuais.unshift(raiz)
const atualPath = 'scripts/acervo-publico/acervo-atual.mjs'
let atual = await fs.readFile(atualPath, 'utf8')
if (!atual.includes(`raizesAtuais.unshift('${raiz}')`)) atual = atual.replace('export async function lerArquivoAtual', `raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`)
await fs.writeFile(atualPath, atual)
const manifest = JSON.parse(await fs.readFile(`${raiz}/manifesto.json`, 'utf8'))
manifest.revisao_profissional.itens_classificados_individualmente += decisoes.length - rel.novas_classificacoes
await fs.writeFile(`${raiz}/manifesto.json`, JSON.stringify(manifest))

const reportPath = 'docs/acervo/revisao-profissional/RELATORIO.md'
let report = await fs.readFile(reportPath, 'utf8')
report += `\n\n## Correção de itens previamente marcados como tratados — v141\n\n- Reavaliei 24 registros existentes: 21 da avaliação PCDF (18 itens distintos e 3 cópias OCR) e 3 da prova EBSERH Física Médica. Corrigi classificações anteriores incompatíveis com o enunciado, ano de aplicação e gabarito.\n- PCDF: ajustei os itens 15–17, 19–22, 28–35, 45, 52 e 78 para aplicação em 2023, corrigi matéria e conteúdo específicos, vinculei as respostas definitivas e marquei o item 22 como anulado. Os registros antigos duplicados de 16, 17 e 19 foram desativados e ligados às versões mantidas.\n- EBSERH Física Médica: reclassifiquei os itens 82, 95 e 100, corrigi os metadados do cargo, vinculei o gabarito definitivo e limpei os textos-base anexados indevidamente nos itens 95 e 100. Imagem do planejamento inverso do item 82 mantida vinculada à página original.\n- Resultado: ${rel.total} registros no acervo; ${rel.disponiveis} elegíveis para resolução; ${rel.pendentes} pendências elegíveis. Revisão local, não publicada na nuvem.\n- Fontes primárias: [caderno e avaliação oficial PCDF](https://cdn.cebraspe.org.br/concursos/pc_df_20_agente/arquivos/C0C18BEB0E75A9CBA54C3CC8AFF1DB4593E08F8307D52BAFEB7F0FEC6BE7EE97.pdf), [gabarito definitivo PCDF, aplicação em 27/08/2023](https://cdn.cebraspe.org.br/concursos/pc_df_20_agente/arquivos/GAB_DEFINITIVO_881_PCDF_AGENTE_CF_001_01.PDF), [caderno EBSERH Cargo 33](https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/394_EBSERHASSISTENCIAL033__PAG_4.PDF), [gabarito definitivo EBSERH Cargo 33](https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/GAB_DEFINITIVO_394_EBSERHASSISTENCIAL033.PDF).\n`
await fs.writeFile(reportPath, report)
console.log(JSON.stringify({ ...rel, revisados_previos: decisoes.length - rel.novas_classificacoes, duplicatas_pcdf_desativadas: duplicatas.size, anuladas_pcdf_corrigidas: [22] }, null, 2))
