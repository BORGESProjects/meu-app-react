import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-saeb-1997-biologia-v477'
const documento = '3a0a61c29b9f1633'
const prova = 'https://download.inep.gov.br/educacao_basica/saeb/documentos_edicoes_antigas/saeb_1997_biologia_3_serie_ensino_medio_cadernos_prova.pdf'
const oficial = JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json', 'utf8')).find(x => x.id === documento)
assert.equal(oficial?.url, prova)
const pendentes = JSON.parse(await fs.readFile('tmp/saeb-1997-biologia-v477-pendentes.json', 'utf8'))
assert.equal(pendentes.length, 34)
const sha = new Map(pendentes.map(q => [q.id, hashRevisao(q.enunciado)]))

const formularios = new Set([
  'extr-c94fcb41bde030ca02ba', 'extr-57624176d7047f12d5bf', 'extr-420f935ee45a5e9b2d2b',
  'extr-5d57e1e7ee99fb9c0eb5', 'extr-d5140c9820458da4d178', 'extr-87639ea776d5173d947a',
  'extr-fde79e7d4445979ac898', 'extr-78818c85917a06ce81ea', 'extr-ff0dc647fc3188ec2035',
  'extr-f531fc027533b2abf8c3', 'extr-6a93da52e57f720045be', 'extr-0f297a816874a7f848f6',
  'extr-c4ef1168ed22611aa827', 'extr-73f3b9541532310f69c4', 'extr-8a52ce700db85384aca7',
  'extr-ecbf1bcd8f825ddd3abf', 'extr-47a389feb2a9af94a951', 'extr-8608c19c36094ecb0d49',
  'extr-a47f560b8e6cd1cc9963', 'extr-3f116f2d55045e12eed9', 'extr-2d472fb4f275d5cf9658',
  'extr-537ca66964f579a5e756', 'extr-cb17b42b57fc6fe2db2f', 'extr-5eb03bb9e2510eaca05a',
  'extr-a3c9fd76628143118dde', 'extr-016af1ac367ab2b08960', 'extr-48512a402851731b3873',
  'extr-12cefae9fbc0f2f6dd53', 'extr-49f19d5eae2fa40ed96e', 'extr-6adba63912cb63f1c817'
])
assert.equal(formularios.size, 30)

const opcoesBiomas = [
  'A) 1–a, 2–b, 4–c',
  'B) 2–a, 3–b, 4–c',
  'C) 1–c, 3–b, 4–a',
  'D) 2–a, 3–c, 4–b',
  'E) 1–b, 2–c, 3–a'
]
const decisoes = pendentes.map(q => {
  const comum = {
    id: q.id,
    sha256_enunciado: sha.get(q.id),
    ano: 1997,
    concurso: 'SAEB — Sistema de Avaliação da Educação Básica — 3ª série do Ensino Médio',
    banca: 'INEP',
    organizadora: 'Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira (INEP)',
    aplicacao: 'Avaliação educacional — 3ª série do Ensino Médio',
    classificacao_fonte: prova,
    motivo: 'Revisão individual com conferência das páginas escaneadas do caderno oficial do INEP; distinção entre instrumento de contexto e item cognitivo.'
  }
  if (formularios.has(q.id)) return {
    ...comum,
    materia: 'Questionário de contexto',
    conteudo: 'Instrumento socioeducacional do SAEB — não é questão de conteúdo de Biologia',
    dificuldade: 'Não se aplica',
    apta_resolucao: false,
    inelegibilidade_motivo: 'instrumento_de_contexto_nao_e_item_cognitivo'
  }
  if (q.id === 'extr-cb3041dbe1386816d033') {
    const texto = 'Relacione corretamente as características morfológicas e fisionômicas dos biomas: 1. campos; 2. floresta amazônica; 3. mata de araucária; 4. caatinga. Características: a. vegetação latifoliada; b. plantas xerófitas; c. estrato arbóreo homogêneo.'
    return {
      ...comum,
      materia: 'Biologia',
      conteudo: 'Ecologia: biomas brasileiros e características da vegetação',
      dificuldade: 'Média',
      dificuldade_estimada: true,
      dificuldade_evidencia: 'Estimativa editorial considerando a associação entre formações vegetais e biomas; não é nível oficial do INEP.',
      numero: 7,
      numero_original: 7,
      enunciado: texto,
      opcoes: opcoesBiomas,
      texto_apoio: 'Lista de biomas e características apresentada no caderno: campos; floresta amazônica; mata de araucária; caatinga; vegetação latifoliada; plantas xerófitas; estrato arbóreo homogêneo.',
      apta_resolucao: true,
      remover_pendencias: ['classificacao_especifica_pendente', 'ano_sem_evidencia', 'visual_ausente', 'dificuldade_nao_informada', 'texto_corrompido', 'texto_corrompido_requer_reconstrucao', 'texto_de_outro_bloco', 'enunciado_incompleto'],
      visual: { pagina: 271, imagem: `paginas/${documento}-0271.webp`, enunciado: texto, texto_apoio: 'Relação de biomas e características vegetais reproduzida no enunciado.' }
    }
  }
  if (q.id === 'extr-052cc82191c1ae5f2d1a') {
    const texto = 'Podemos manter alimentos saudáveis por longos períodos usando alguns procedimentos que evitam a contaminação por bactérias. Qual afirmativa está INCORRETA?'
    return {
      ...comum,
      materia: 'Biologia',
      conteudo: 'Microbiologia: microrganismos e conservação de alimentos',
      dificuldade: 'Média',
      dificuldade_estimada: true,
      dificuldade_evidencia: 'Estimativa editorial baseada na aplicação de conceitos de controle microbiano; não é nível oficial do INEP.',
      numero: 7,
      numero_original: 7,
      enunciado: texto,
      opcoes: [
        'A) Usar óleo, cebola e azeite para conservar os alimentos da ação das bactérias.',
        'B) Manter os alimentos a baixas temperaturas para impedir a reprodução de seres decompositores.',
        'C) Cozinhar os alimentos a altas temperaturas para destruir as bactérias.',
        'D) Salgar alguns alimentos, o que impede a sobrevivência de microrganismos.'
      ],
      apta_resolucao: true,
      remover_pendencias: ['classificacao_especifica_pendente', 'ano_sem_evidencia', 'visual_ausente', 'dificuldade_nao_informada', 'texto_corrompido', 'texto_corrompido_requer_reconstrucao', 'texto_de_outro_bloco', 'enunciado_incompleto'],
      visual: { pagina: 376, imagem: `paginas/${documento}-0376.webp`, enunciado: texto, texto_apoio: 'A questão pede para identificar a afirmativa incorreta entre quatro alternativas; transcrição conferida visualmente no caderno.' }
    }
  }
  if (q.id === 'extr-aae94348b670fcf0d09b') return {
    ...comum,
    materia: 'Biologia',
    conteudo: 'Saúde pública: incidência e letalidade de câncer por sexo',
    dificuldade: 'Média',
    dificuldade_estimada: true,
    enunciado: 'As tabelas apresentam dados de incidência de câncer no Brasil em 1996. Homens — estômago: 15.060 casos e 7.800 óbitos; pulmão: 14.680 casos e 8.650 óbitos; próstata: 13.820 casos e 4.350 óbitos; esôfago: 5.350 casos e 3.700 óbitos. Mulheres — mama: 31.210 casos e 6.450 óbitos; colo do útero: 20.110 casos e 3.300 óbitos; estômago: 12.350 casos e 4.000 óbitos; pulmão: 5.720 casos e 2.950 óbitos. Os dados permitem afirmar que:',
    opcoes: [
      'A) O câncer de pulmão é o mais letal entre os homens, pois apresenta a maior proporção de óbitos em relação ao número de casos.',
      'B) O número de óbitos por câncer de estômago é o menor entre todos os tipos que afetam as mulheres.',
      'C) O câncer de mama é o mais letal entre as mulheres, pois apresenta a maior proporção de óbitos em relação ao número de casos.',
      'D) A proporção de óbitos em relação ao número de casos faz do câncer de estômago o mais letal entre os homens.',
      'E) A incidência dos diversos tipos de câncer que afetam os brasileiros independe do sexo.'
    ],
    texto_apoio: 'Tabela transcrita integralmente do caderno. A comparação das proporções não confirma nenhuma das alternativas: entre os homens, a maior proporção é a do câncer de esôfago; entre as mulheres, a do câncer de pulmão. A alternativa B também é falsa, pois os óbitos por câncer de pulmão (2.950) são menos numerosos que os por câncer de estômago (4.000).',
    apta_resolucao: false,
    inelegibilidade_motivo: 'alternativas_inconsistentes_com_tabela_nenhuma_resposta_correta',
    visual: { pagina: 196, imagem: `paginas/${documento}-0196.webp`, texto_apoio: 'Tabela de incidência de câncer no Brasil em 1996; questão não elegível porque nenhuma alternativa corresponde aos dados.' }
  }
  if (q.id === 'extr-3c0ff2459fb83ed9d2ba') return {
    ...comum,
    materia: 'Biologia',
    conteudo: 'Saúde pública: incidência e letalidade de câncer por sexo — duplicata de item inconsistente',
    dificuldade: 'Média',
    apta_resolucao: false,
    inelegibilidade_motivo: 'duplicata_de_item_inconsistente_mesma_tabela_e_alternativas',
    duplicada_de: 'extr-aae94348b670fcf0d09b'
  }
  throw new Error(`Registro pendente sem decisão: ${q.id}`)
})
assert.equal(decisoes.length, 34)
assert.equal(decisoes.filter(q => q.apta_resolucao === true).length, 2)
assert.equal(decisoes.filter(q => q.apta_resolucao === false).length, 32)
for (const q of decisoes.filter(q => q.visual?.imagem)) await fs.access(`public/acervo-extraido/${q.visual.imagem}`)

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ lote: nome, revisadas: decisoes.length, formularios_contextuais: formularios.size, questoes_biologia_reparadas: 2, item_sem_alternativa_correta: 1, duplicata: 1, elegiveis_para_resolucao: 2, publicacao_na_nuvem: false }, null, 2))
  process.exit(0)
}
const resultado = await aplicarRevisoesIndividuais({ nome, base: raizesAtuais[0], decisoes })
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs', `\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio = {
  ...resultado,
  documento,
  concurso: 'SAEB 1997 — Biologia — 3ª série do Ensino Médio',
  registros_revisados: 34,
  formularios_contextuais_nao_resolutiveis: 30,
  itens_cognitivos_reparados_e_elegiveis: 2,
  item_inconsistente_excluido: 'extr-aae94348b670fcf0d09b',
  duplicata_excluida: 'extr-3c0ff2459fb83ed9d2ba',
  prova,
  publicado_na_nuvem: false
}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`, JSON.stringify(relatorio, null, 2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md', `\n\n## SAEB 1997 — Biologia, 3ª série do Ensino Médio — revisão v477\n\n- Revisei 34 registros do documento oficial do INEP e conferi as páginas escaneadas correspondentes.\n- Separei 30 perguntas dos questionários socioeducacionais, que não são itens cognitivos de Biologia e não devem aparecer como questões resolvíveis.\n- Corrigi e transcrevi integralmente duas questões de Biologia: associação de biomas (p. 271) e conservação de alimentos/microrganismos (p. 376), mantendo as imagens da prova.\n- Excluí da resolução a questão da tabela de câncer: conferindo os valores e as cinco alternativas, nenhuma afirmação corresponde aos dados. A ocorrência repetida em outro caderno foi marcada como duplicata.\n- O INEP informa que cadernos e gabaritos do SAEB não são divulgados imediatamente; não inventei gabarito nem habilitei correção automática. Pacote local, não publicado na nuvem.\n- Fonte: [documento oficial do INEP](<${prova}>).\n`)
console.log(JSON.stringify(relatorio, null, 2))
