import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = '566883eca8415560'
const prova = 'https://cdn.cebraspe.org.br/concursos/hub_20_multiprofissional/arquivos/MATRIZ_497_RMULTI008.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/hub_20_multiprofissional/arquivos/GAB_DEFINITIVO_MATRIZ_497_RMULTI008.PDF'
const raw = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`, 'utf8'))
const chaves = new Map(Object.entries({
  41:'C',42:'C',43:'C',44:'E',45:'C',46:'E',47:'E',48:'C',49:'C',50:'C',
  51:'E',52:'E',53:'E',54:'E',55:'C',56:'C',57:'E',58:'E',59:'C',60:'E',
  61:'C',62:'E',63:'E',64:'E',65:'E',66:'E',67:'C',68:'E',69:'C',70:'C',
  71:'C',72:'E',73:'C',74:'C',75:'C',76:'C',77:'C',78:'E',79:'E',80:'C',
  81:'E',82:'C',83:'E',84:'C',85:'E',86:'E',87:'C',88:'C',89:'C',90:'E',
  91:'C',92:'E',93:'C',94:'C',95:'C',96:'C',97:'E',98:'C',99:'E',100:'C'
}).map(([n, v]) => [Number(n), v]))
const shaGabarito = hashRevisao([...chaves.entries()].sort((a, b) => a[0] - b[0]).map(([n, v]) => `${n}:${v}`).join('|'))
const contexto = new Map([
  [42, 'Angélica, assistente social, trabalha em um hospital terciário e realiza estudos sociais de pacientes internados para conhecer suas condições de vida e trabalho, necessidades e reivindicações. Esses estudos produzem laudos, relatórios e pareceres. Considerando essa situação e a metodologia de trabalho, os instrumentais do Serviço Social e a Lei nº 8.662/1993, julgue os itens.'],
  [47, 'Paulo cancelou sua inscrição no Conselho Regional de Serviço Social (CRESS) quando estava desempregado. Depois foi contratado como assistente social em uma empresa de construção civil e assumiu a função sem pedir reinscrição. Com base nas Resoluções CFESS nº 572 e nº 590 e na Lei nº 8.662/1993, julgue os itens.'],
  [51, 'Joaquim, assistente social e chefe de equipe em uma instituição de saúde, incorpora planejamento, avaliação e sistematização ao trabalho e promove reuniões mensais para análise coletiva da realidade e planejamento das ações. Considerando o planejamento como processo técnico-político de intervenção e as atribuições privativas do assistente social, julgue os itens.'],
  [56, 'Considerando os conceitos de multidisciplinaridade e interdisciplinaridade, julgue os itens.'],
  [59, 'Julgue os itens a seguir, acerca da questão social.'],
  [61, 'Considerando os fundamentos históricos, teóricos e metodológicos do Serviço Social brasileiro, julgue os itens.'],
  [66, 'Considerando o conteúdo histórico e os aspectos legais dos códigos de ética profissional do assistente social no Brasil, julgue os itens.'],
  [72, 'A respeito do projeto ético-político profissional do Serviço Social, julgue os itens.'],
  [76, 'Com base nas resoluções profissionais emitidas pelo Conselho Federal de Serviço Social (CFESS), julgue os itens.'],
  [81, 'No que se refere ao papel do assistente social na assistência à saúde, julgue os itens.'],
  [84, 'Com relação à formação, à qualificação e à atuação do profissional de Serviço Social, julgue os itens.'],
  [89, 'Julgue os itens relativos à população em situação de rua, a pessoas trans e à violência contra a mulher.'],
  [94, 'Acerca das teorias sobre projetos, pesquisa e avaliação, julgue os itens.'],
  [99, 'No que se refere à reabilitação profissional, julgue os itens.']
])
const faixas = [
  [42,46,'Serviço Social','Trabalho profissional — estudo social, instrumentos, documentos técnicos e atribuições'],
  [47,50,'Legislação Profissional','Exercício profissional — inscrição no CRESS, fiscalização e sanções'],
  [51,55,'Serviço Social','Planejamento do trabalho profissional — planos, programas, projetos e intervenção'],
  [56,58,'Serviço Social','Trabalho interdisciplinar e multidisciplinar'],
  [59,60,'Serviço Social','Questão social — capitalismo, desigualdades e direitos sociais'],
  [61,65,'Serviço Social','Fundamentos históricos, teóricos e metodológicos do Serviço Social brasileiro'],
  [66,71,'Ética Profissional','Códigos de ética do Serviço Social — princípios, direitos, deveres e sigilo'],
  [72,75,'Serviço Social','Projeto ético-político profissional — organização, sujeitos e materialização'],
  [76,80,'Legislação Profissional','Resoluções do CFESS — exercício profissional e Serviço Social na saúde'],
  [81,83,'Serviço Social','Política de saúde — saúde mental, educação em saúde e direitos humanos'],
  [84,88,'Serviço Social','Formação profissional — competências, currículos e fundamentos da atuação'],
  [89,93,'Políticas Sociais','Direitos sociais — população em situação de rua, população trans e violência de gênero'],
  [94,98,'Serviço Social','Pesquisa, projetos e avaliação de políticas sociais'],
  [99,100,'Previdência Social','Reabilitação profissional e proteção previdenciária']
]
const cortes = new Map([
  [46,'Paulo cancelou sua inscrição'],[50,'Joaquim é assistente social'],
  [55,'Considerando os conceitos de multidisciplinaridade'],[58,'||Matriz_497_RMULTI008||'],
  [60,'Considerando os fundamentos históricos'],[65,'Considerando o conteúdo histórico'],
  [71,'A respeito do projeto ético-político'],[75,'Com base nas resoluções profissionais'],
  [80,'||Matriz_497_RMULTI008||'],[83,'Com relação à formação'],
  [88,'Julgue os próximos itens, relativos à população'],[93,'Acerca das teorias sobre projetos'],
  [98,'No que se refere à reabilitação profissional']
])
const dif = new Set([46,49,50,52,53,54,58,60,63,64,67,72,76,78,83,85,86,94,97,99])
const limpar = s => (s || '').replace(/\u000c/g, ' ').replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim()
const baselineIndex = raizesAtuais.findIndex(r => r.includes('revisao-saeb-matematica-4a-2009-v145'))
if (baselineIndex < 0) throw new Error('Base v145 não encontrada')
const base = raizesAtuais[baselineIndex]
const bases = raizesAtuais.slice(baselineIndex)
const manifest = JSON.parse(await lerArquivoAtual('manifesto.json', bases))
const ativos = new Map()
for (const lote of manifest.lotes) {
  if (!lote.arquivo) continue
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo, bases)))
  for (const q of qs) if (q.documento_id === doc && raw.some(x => x.id === q.id)) ativos.set(q.id, q)
}
if (ativos.size !== raw.length || raw.length !== 58) throw new Error(`Pacote HUB inesperado: ${ativos.size}/${raw.length}`)
const decisoes = []
for (const x of raw) {
  const n = Number(x.numero), letra = chaves.get(n)
  if (!letra || !x.enunciado || !x.opcoes || x.opcoes.length !== 2) throw new Error(`Item sem estrutura/gabarito confirmado: ${n}`)
  const original = ativos.get(x.id)
  if (!original) throw new Error(`Registro ativo ausente: ${x.id}`)
  const faixa = faixas.find(([a,b]) => n >= a && n <= b)
  if (!faixa) throw new Error(`Conteúdo não mapeado: ${n}`)
  let enunciado = x.enunciado
  const stop = cortes.get(n)
  if (stop && enunciado.includes(stop)) enunciado = enunciado.slice(0, enunciado.indexOf(stop))
  enunciado = limpar(enunciado.replace(/\|\|Matriz_497_RMULTI008\|\|.*$/u, ''))
  if (enunciado.length < 20) throw new Error(`Enunciado curto após limpeza: ${n}`)
  const bloco = [...contexto.keys()].filter(start => start <= n).at(-1)
  const ctx = contexto.get(bloco) || ''
  const image = x.imagem
  if (!image || !image.startsWith(`paginas/${doc}-`)) throw new Error(`Imagem ausente: ${n}`)
  await fs.access(`public/acervo-extraido/${image}`)
  const d = {
    id: x.id, sha256_enunciado: hashRevisao(original.enunciado), materia: faixa[2], conteudo: faixa[3],
    ano: 2019, concurso: 'HUB — Residência Multiprofissional 2020 (prova aplicada em 2019)', numero_original: n, pagina: x.pagina,
    dificuldade: dif.has(n) ? 'Difícil' : 'Média', dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pela especificidade conceitual e normativa do item; o Cebraspe não publicou nível de dificuldade.',
    resposta_correta: letra === 'C' ? 0 : 1,
    gabarito_oficial: { valor: letra, fonte: gabarito, sha256: shaGabarito, sha256_tipo: 'hash_da_transcricao_canonica_dos_itens_41_a_100_do_gabarito_oficial_definitivo', numero: n, pagina: 1, resposta: letra, metodo: 'Gabarito definitivo oficial do Cebraspe, cargo Serviço Social; aplicação em 3/11/2019. O hash identifica a transcrição canônica dos itens, não o arquivo PDF.' },
    classificacao_fonte: prova, motivo: `HUB — Residência Multiprofissional 2020, cargo Serviço Social. Aplicação em 3/11/2019; item ${n}. Classificação por conteúdo do enunciado e bloco temático do caderno oficial.`,
    enunciado, opcoes: ['Certo', 'Errado'], texto_apoio: ctx, imagem_pagina: image, apta_resolucao: true,
    remover_pendencias: ['classificacao_especifica_pendente', 'gabarito_oficial_nao_vinculado', 'ano_sem_evidencia', 'enunciado_incompleto', 'alternativas_invalida', 'alternativa_vazia', 'texto_corrompido', 'texto_de_outro_bloco', 'visual_ausente']
  }
  decisoes.push(d)
}
if (new Set(decisoes.map(x => x.numero_original)).size !== 58) throw new Error('Número repetido dentro do lote')
if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ registros: raw.length, aplicacao: '2019-11-03', gabaritosOficiais: decisoes.length, respostas: decisoes.filter(x => x.resposta_correta >= 0).length, enunciadosLimpos: decisoes.filter(x => x.enunciado.length >= 20).length, imagensPreservadas: new Set(decisoes.map(x => x.imagem_pagina)).size, conteudos: Object.fromEntries(faixas.map(([a,b,,t]) => [t, decisoes.filter(x => x.numero_original >= a && x.numero_original <= b).length])), cortesAplicados: [...cortes.keys()].filter(n => decisoes.find(x => x.numero_original === n)?.enunciado !== raw.find(x => x.numero === n)?.enunciado) }, null, 2))
  process.exit(0)
}
const report = await aplicarRevisoesIndividuais({ nome: 'revisao-hub-servico-social-2019-v146', base, decisoes })
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-servico-social-2019-v146/acervo-extraido')
const out = { ...report, fonte_prova: prova, fonte_gabarito: gabarito, registros_revistos: raw.length, aplicacao: '2019-11-03', questões_com_gabarito_oficial: decisoes.length, itens_com_contexto_base: decisoes.filter(x => x.texto_apoio).length, páginas_com_imagem_preservada: new Set(decisoes.map(x => x.imagem_pagina)).size, publicada: false }
await fs.writeFile('docs/acervo/revisao-profissional/revisao-hub-servico-social-2019-v146.json', JSON.stringify(out, null, 2))
console.log(JSON.stringify(out, null, 2))
