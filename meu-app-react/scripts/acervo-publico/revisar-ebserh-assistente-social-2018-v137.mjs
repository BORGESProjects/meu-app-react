import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const documento = '38111981cdc201e4'
const origem = raizesAtuais[0]
const pendentes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
const prova = 'https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/394_EBSERHASSISTENCIAL001__PAG_3.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/GAB_DEFINITIVO_394_EBSERHASSISTENCIAL001.PDF'

const letras = 'C C C C C C E C C C E E C C E E E C C E E E C C E C E E C C E E E C E C C C E C C C E C E C C E C C C C E C E C C E C C'.split(' ')
if (letras.length !== 60) throw new Error(`Chave oficial inválida: ${letras.length}`)
const chave = new Map(letras.map((v, i) => [i + 41, v]))

const grupos = [
  { materia: 'Serviço Social', conteudo: 'Formação profissional, história, institucionalização e desafios contemporâneos', comando: 'Acerca da formação profissional do assistente social, de sua trajetória na sociedade brasileira e dos desafios contemporâneos.', questoes: [41, 42, 43, 44, 45, 46, 47, 48, 49] },
  { materia: 'Serviço Social', conteudo: 'Fundamentos teórico-metodológicos, trabalho profissional e leitura da realidade social', comando: 'Considerando o texto-base sobre formação profissional e os fundamentos teórico-metodológicos do Serviço Social.', questoes: [50, 51, 52, 53, 54] },
  { materia: 'Serviço Social', conteudo: 'Conservadorismo profissional, reconceituação, teoria-prática e cotidiano', comando: 'A respeito do conservadorismo, da relação entre teoria e prática e da categoria cotidiano no Serviço Social.', questoes: [55, 56, 57, 58] },
  { materia: 'Serviço Social', conteudo: 'Diretrizes curriculares da ABEPSS e formação teórico-metodológica, ético-política e técnico-operativa', comando: 'Considerando as diretrizes curriculares para os cursos de Serviço Social propostas pela ABEPSS e os princípios da formação profissional.', questoes: [59, 60, 61, 62, 63, 64, 65] },
  { materia: 'Direitos da Pessoa com Deficiência', conteudo: 'Lei Brasileira de Inclusão — conceito, discriminação, consentimento, políticas e notificações', comando: 'Com base na Lei nº 13.146/2015, que trata da inclusão da pessoa com deficiência.', questoes: [66, 67, 68, 69, 70] },
  { materia: 'Legislação Profissional do Serviço Social', conteudo: 'Lei nº 8.662/1993, Código de Ética, competências, atribuições e supervisão de estágio', comando: 'De acordo com o Código de Ética do Assistente Social e a Lei nº 8.662/1993, considerando a situação hipotética apresentada no caderno.', questoes: [71, 72, 73, 74, 75] },
  { materia: 'Serviço Social na Saúde', conteudo: 'Lei nº 8.080/1990, SUS, determinantes sociais, intersetorialidade e projeto ético-político', comando: 'Com base na Lei nº 8.080/1990 e nos parâmetros para a atuação de assistentes sociais na política de saúde.', questoes: [76, 77, 78, 79, 80, 81] },
  { materia: 'Seguridade Social', conteudo: 'Organização e financiamento da seguridade social brasileira', comando: 'Acerca da Política de Seguridade Social no Brasil.', questoes: [82, 83, 84, 85] },
  { materia: 'Política de Assistência Social', conteudo: 'PNAS, LOAS, SUAS, proteção social, descentralização e controle social', comando: 'De acordo com a PNAS, a LOAS, suas alterações e a Constituição Federal de 1988.', questoes: [86, 87, 88, 89, 90, 91] },
  { materia: 'Serviço Social na Assistência Social', conteudo: 'Código de Ética, direitos sociais, competências profissionais e atuação crítica no SUAS', comando: 'A respeito da seguridade social e dos parâmetros para a atuação do assistente social na política de assistência social.', questoes: [92, 93, 94, 95, 96, 97, 98, 99, 100] }
]
const temas = new Map()
for (const g of grupos) for (const n of g.questoes) {
  if (temas.has(n)) throw new Error(`Questão ${n} classificada duas vezes`)
  temas.set(n, { materia: g.materia, conteudo: g.conteudo, comando: g.comando })
}
if (temas.size !== 60) throw new Error(`Cobertura incorreta: ${temas.size}`)

const duplicadas = new Map([['extr-d496818b683a7d813f01', 'extr-506dc47d5ca0b550385e']])
const baseFormacao = 'No contexto do processo de formação profissional, o encerramento do século XX trouxe inúmeros desafios, entre eles a necessidade de encontrar soluções para os problemas mais graves do mundo contemporâneo, um mundo complexo, dinâmico, que nos exige a capacidade de perceber, compreender, contextualizar, descobrir e captar as diferentes relações, o que requer profissionais comprometidos com os novos tempos. Fonte indicada no caderno: Rosa Maria Castilhos Fernandes, “Serviço social contemporâneo”, Cadernos Universitários, Universidade Luterana do Brasil, Canoas, n.º 71, p. 7, 2003 (com adaptações).'
const situacaoEstagio = 'Em uma unidade de saúde de atenção primária trabalham Rafaela, assistente social com carga horária de 40 horas semanais; Sheila, assistente social recém-contratada, com carga horária de 20 horas semanais; Cristiano, estudante estagiário de Serviço Social em fase de conclusão da disciplina de estágio supervisionado II, sob supervisão de campo de Rafaela; e Helena, enfermeira graduada. Rafaela e Sheila atendem também o público externo e trabalham com outros profissionais de saúde, entre eles Helena, recentemente graduada em Serviço Social, já registrada no CRESS local e que almeja atuar na área.'
const cortes = new Map([
  [54, 'Considerando o pensamento conservador incorporado pelo serviço social'],
  [58, 'CESPE | CEBRASPE – EBSERH_ASSISTENCIAL – Aplicação: 2018'],
  [70, 'Em uma unidade de saúde de atenção primária, trabalham'],
  [75, 'CESPE | CEBRASPE – EBSERH_ASSISTENCIAL – Aplicação: 2018'],
  [85, 'De acordo com a Política Nacional de Assistência Social (PNAS)'],
  [94, 'A respeito da política de seguridade social e do parâmetro para atuação']
])
const faceis = new Set([41, 44, 45, 48, 49, 61, 66, 69, 70, 72, 76, 77, 78, 79, 82, 86, 89, 91, 92, 99, 100])
const dificeis = new Set([42, 43, 46, 47, 50, 51, 52, 54, 55, 56, 57, 58, 60, 62, 65, 67, 68, 73, 74, 80, 81, 84, 85, 88, 93, 95, 96, 98])
const hashGabarito = hashRevisao(`${gabarito}\n${JSON.stringify(Object.fromEntries(chave))}`)
if (pendentes.length !== 60) throw new Error(`Esperava 60 registros; encontrei ${pendentes.length}`)

const decisoes = []
for (const q of pendentes) {
  const n = Number(q.numero), tema = temas.get(n), letra = chave.get(n)
  if (!tema || !letra) throw new Error(`Questão sem classificação ou gabarito: ${q.id}`)
  const duplicadaDe = duplicadas.get(q.id)
  let enunciado = q.enunciado.replace(/\s+/g, ' ').trim()
  if (!duplicadaDe && cortes.has(n)) {
    const marcador = cortes.get(n).replace(/\s+/g, ' '), pos = enunciado.indexOf(marcador)
    if (pos >= 0) enunciado = enunciado.slice(0, pos).trim()
    else throw new Error(`Limite do enunciado contaminado não localizado no item ${n}`)
  }
  const imagens = [q.imagem, ...(q.contexto || []).map(x => x.imagem)].filter(Boolean)
  for (const imagem of new Set(imagens)) await fs.access(`public/acervo-extraido/${imagem}`)
  const anulada = letra === 'X'
  const textoApoio = n >= 50 && n <= 52 ? baseFormacao : n >= 71 && n <= 75 ? situacaoEstagio : tema.comando
  decisoes.push({
    id: q.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia: tema.materia,
    conteudo: tema.conteudo,
    concurso: 'EBSERH Assistencial — Cargo 1: Assistente Social',
    ano: 2018,
    numero_original: n,
    dificuldade: faceis.has(n) ? 'Fácil' : dificeis.has(n) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pela densidade normativa, teórica e interdisciplinar; não é medida psicométrica publicada pela banca.',
    resposta_correta: anulada ? null : letra === 'C' ? 0 : 1,
    anulada,
    texto_apoio: textoApoio,
    gabarito_oficial: { valor: letra, fonte: gabarito, sha256: hashGabarito, sha256_tipo: 'transcricao_canonica_dos_itens_41_a_100_do_gabarito_definitivo' },
    classificacao_fonte: prova,
    motivo: `Questão ${n} classificada pelo conteúdo e pelo comando do bloco do caderno oficial EBSERH Assistencial, Cargo 1 — Assistente Social. Aplicação em 06/05/2018; respostas conferidas no gabarito definitivo. Texto-base bibliográfico e situação hipotética compartilhada foram separados dos enunciados.`,
    ...(duplicadaDe ? { apta_resolucao: false, duplicada_de: duplicadaDe, inelegibilidade_motivo: 'Cópia redundante do item 55, com outros itens e cabeçalhos anexados por erro de extração; preservada para auditoria e desativada para resolução.' } : { enunciado })
  })
}

const rel = await aplicarRevisoesIndividuais({ nome: 'revisao-ebserh-assistente-social-2018-v137', base: origem, decisoes })
const raiz = 'tmp/revisao-profissional/revisao-ebserh-assistente-social-2018-v137/acervo-extraido'
if (!raizesAtuais.includes(raiz)) raizesAtuais.unshift(raiz)
const atualPath = 'scripts/acervo-publico/acervo-atual.mjs'
let atual = await fs.readFile(atualPath, 'utf8')
if (!atual.includes(`raizesAtuais.unshift('${raiz}')`)) atual = atual.replace('export async function lerArquivoAtual', `raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`)
await fs.writeFile(atualPath, atual)

const rp = 'docs/acervo/revisao-profissional/RELATORIO.md'
let relatorio = await fs.readFile(rp, 'utf8')
relatorio += `\n\n## Revisão EBSERH — Assistente Social — v137\n\n- Revisei ${rel.classificadas} registros cobrindo 59 itens distintos pendentes (41–100, exceto o 84, que não estava na exportação de pendências). Classifiquei formação e fundamentos do Serviço Social, diretrizes curriculares, direitos da pessoa com deficiência, legislação profissional, saúde, seguridade social, PNAS/LOAS/SUAS e intervenção profissional.\n- Concurso, cargo e ano confirmados: EBSERH Assistencial, Cargo 1 — Assistente Social, aplicação em 06/05/2018. Respostas conferidas no gabarito oficial definitivo; item anulado neste conjunto: nenhum.\n- Corrigi a cópia redundante e contaminada do item 55, desativando-a e mantendo o registro para auditoria. Separei o texto-base de formação profissional dos itens 50–52 e a situação hipotética compartilhada dos itens 71–75. Limpei comandos de seção anexados aos itens 54, 58, 70, 75, 85 e 94; verifiquei os arquivos de imagem/página dos registros.\n- Dificuldade estimada editorialmente. Resultado: ${rel.total} registros; ${rel.disponiveis} elegíveis para resolução; ${rel.pendentes} pendências elegíveis; ${rel.lotes_alterados} lotes regravados. Pacote local, ainda não publicado na nuvem.\n- Fontes primárias: [caderno oficial CEBRASPE — EBSERH Assistencial, Cargo 1](https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/394_EBSERHASSISTENCIAL001__PAG_3.PDF), [gabarito definitivo oficial](https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/GAB_DEFINITIVO_394_EBSERHASSISTENCIAL001.PDF).\n`
await fs.writeFile(rp, relatorio)
console.log(JSON.stringify({ ...rel, duplicadas: duplicadas.size, itens_distintos_exportados: new Set(pendentes.map(q => q.numero)).size, anuladas: [...chave].filter(([, v]) => v === 'X').map(([n]) => n) }, null, 2))
