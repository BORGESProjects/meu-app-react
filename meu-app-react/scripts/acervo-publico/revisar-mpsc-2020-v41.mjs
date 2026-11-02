import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { hashRevisao, aplicarRevisoesIndividuais } from './aplicar-revisoes-individuais.mjs'
import { lerArquivoAtual, raizesAtuais } from './acervo-atual.mjs'

const docId = '059838c48348d7e1'
const url = 'https://cdn.cebraspe.org.br/concursos/MP_SC_20_PROMOTOR/arquivos/530_MPSC_002_01.PDF'
const sha = '2e0f0d24eb4c64398c3259728c64de412716ec63d82bec5caceaa54d8ba09451'
const topicos = [
  { de: 1, ate: 45, materia: 'Português', fonte: 'Língua Portuguesa', conteudo: q => {
    const s = q.enunciado || ''
    if (/crase|regência|transitivo|com quem|preposição|conjunção “que”|visar/iu.test(s)) return 'Regência, crase e relações entre verbos e complementos'
    if (/sujeito|termo.*complement|função sintática|aposto|complemento indireto|sintaticamente|oração “/iu.test(s)) return 'Sintaxe: termos da oração e relações sintáticas'
    if (/vírgula|dois-pontos|travessão|pontuação/iu.test(s)) return 'Pontuação'
    if (/pronome|forma pronominal|referente|refere-se|“ambos”|“se”/iu.test(s)) return 'Pronomes e referenciação'
    if (/grafia|grafado|acentua|ortografia|contração/iu.test(s)) return 'Ortografia e acentuação'
    if (/adjetiv|substantivo|vocábulo|classe gramatical|posição pós-nominal/iu.test(s)) return 'Morfologia e classes de palavras'
    if (/verbo|forma verbal|flexion|concord/iu.test(s)) return 'Verbos e concordância'
    if (/conectivo|locução conjuntiva|Não obstante|conjunção|sentidos originais|informação veiculada/iu.test(s)) return 'Coesão, conjunções e relações de sentido'
    return 'Análise linguística e compreensão textual'
  }},
  { de: 46, ate: 49, materia: 'Direito Empresarial', fonte: 'Direito Falimentar', conteudo: 'Falência e recuperação judicial: efeitos e procedimento' },
  { de: 50, ate: 53, materia: 'Direito Processual Civil', fonte: 'Processo Coletivo', conteudo: 'Legitimidade do Ministério Público para ação civil pública' },
  { de: 54, ate: 57, materia: 'Direito Processual Civil', fonte: 'Inquérito Civil', conteudo: 'Inquérito civil: instauração, instrução e finalidade' },
  { de: 58, ate: 61, materia: 'Direito Processual Civil', fonte: 'Tutela Coletiva', conteudo: 'Ações coletivas e direitos difusos, coletivos e individuais homogêneos' },
  { de: 62, ate: 63, materia: 'Direitos Humanos e Cidadania', fonte: 'Estatuto do Idoso', conteudo: 'Proteção e tutela judicial dos direitos da pessoa idosa' },
  { de: 64, ate: 65, materia: 'Direitos Humanos e Cidadania', fonte: 'Lei Brasileira de Inclusão', conteudo: 'Capacidade civil, curatela e direitos da pessoa com deficiência' },
  { de: 66, ate: 70, materia: 'Direito Ambiental', fonte: 'Direito Ambiental', conteudo: 'Licenciamento ambiental, EIA/RIMA e licenças' },
  { de: 71, ate: 76, materia: 'Direito Ambiental', fonte: 'Direito Ambiental', conteudo: 'Tombamento e proteção do patrimônio cultural' },
  { de: 77, ate: 80, materia: 'Direito Ambiental', fonte: 'Direito Ambiental', conteudo: 'Responsabilidade por dano ambiental, incêndio e queimadas' },
  { de: 81, ate: 86, materia: 'Direito Ambiental', fonte: 'Direito Ambiental', conteudo: 'Proteção jurídica dos animais e repartição de competências' },
  { de: 87, ate: 89, materia: 'Direito Ambiental', fonte: 'Direito Ambiental', conteudo: 'Unidades de conservação e SNUC' },
  { de: 90, ate: 104, materia: 'Direito Administrativo', fonte: 'Defesa da Moralidade Administrativa', conteudo: 'Probidade, controle de recursos públicos e responsabilização por atos lesivos' },
  { de: 105, ate: 108, materia: 'Direito Administrativo', fonte: 'Controle na Administração Pública', conteudo: 'Controle administrativo, judicial e externo' },
  { de: 109, ate: 110, materia: 'Direito Administrativo', fonte: 'Marco Regulatório das Organizações da Sociedade Civil', conteudo: 'Parcerias entre o poder público e organizações da sociedade civil' },
  { de: 111, ate: 113, materia: 'Direito Administrativo', fonte: 'Acesso à Informação e Direitos dos Usuários', conteudo: 'Transparência pública e direitos dos usuários de serviços públicos' },
  { de: 114, ate: 137, materia: 'Direito do Consumidor', fonte: 'Direito do Consumidor', conteudo: q => {
    const n = q.numero_original
    if (n <= 120) return 'Princípios, vulnerabilidade, serviços e garantias do consumidor'
    if (n === 121) return 'Vícios do produto e decadência'
    if (n === 122) return 'Desconsideração da personalidade jurídica nas relações de consumo'
    if (n === 123) return 'Oferta e cumprimento forçado'
    if (n === 124 || n === 129) return 'Publicidade, interpretação e princípios do CDC'
    if (n <= 127) return 'Práticas abusivas, sanções e repetição do indébito'
    if (n === 128) return 'Cadastro de inadimplentes e dano moral'
    if (n === 130) return 'Planos de saúde e cobertura assistencial'
    if (n === 131) return 'Cláusula compromissória em contrato de adesão'
    if (n === 132) return 'Responsabilidade de matriz e filiais na cadeia de fornecimento'
    return 'Planos de saúde, práticas comerciais e crimes contra o consumidor'
  }},
  { de: 138, ate: 141, materia: 'Direito da Criança e do Adolescente', fonte: 'Direito da Criança e do Adolescente', conteudo: 'Adoção e estágio de convivência' },
  { de: 142, ate: 146, materia: 'Direito da Criança e do Adolescente', fonte: 'Direito da Criança e do Adolescente', conteudo: 'Ato infracional e medidas socioeducativas' },
  { de: 147, ate: 150, materia: 'Direito da Criança e do Adolescente', fonte: 'Direito da Criança e do Adolescente', conteudo: 'Políticas e diretrizes de atendimento à criança e ao adolescente' },
  { de: 151, ate: 155, materia: 'Direito da Criança e do Adolescente', fonte: 'Direito da Criança e do Adolescente', conteudo: 'Infrações administrativas previstas no ECA' },
  { de: 156, ate: 158, materia: 'Direito da Criança e do Adolescente', fonte: 'Direito da Criança e do Adolescente', conteudo: 'Proteção infantojuvenil na legislação de Santa Catarina' },
  { de: 159, ate: 161, materia: 'Direito da Criança e do Adolescente', fonte: 'Direito da Criança e do Adolescente', conteudo: 'Atribuições do Ministério Público na proteção infantojuvenil' },
  { de: 162, ate: 163, materia: 'Direitos Humanos e Cidadania', fonte: 'Direitos Humanos e Cidadania', conteudo: 'Direitos humanos, direitos fundamentais e reserva do possível' },
  { de: 164, ate: 165, materia: 'Direitos Humanos e Cidadania', fonte: 'Direitos Humanos e Cidadania', conteudo: 'Direitos da pessoa com deficiência e Lei Brasileira de Inclusão' },
  { de: 166, ate: 169, materia: 'Direitos Humanos e Cidadania', fonte: 'Direitos Humanos e Cidadania', conteudo: 'Estatuto da Pessoa Idosa e instituições de longa permanência' },
  { de: 170, ate: 171, materia: 'Assistência Social', fonte: 'Lei Orgânica da Assistência Social', conteudo: 'Benefício de prestação continuada e financiamento da assistência social' },
  { de: 172, ate: 172, materia: 'Direitos Humanos e Cidadania', fonte: 'Política Nacional de Busca de Pessoas Desaparecidas', conteudo: 'Busca de pessoas desaparecidas e proteção da integridade pessoal' },
  { de: 173, ate: 174, materia: 'Direitos Humanos e Cidadania', fonte: 'Direitos Humanos e Cidadania', conteudo: 'Direitos da população em situação de rua' },
  { de: 175, ate: 175, materia: 'Direitos Humanos e Cidadania', fonte: 'Direitos Humanos e Cidadania', conteudo: 'Prevenção da automutilação e do suicídio: dever de notificação' },
  { de: 176, ate: 180, materia: 'Direitos Humanos e Cidadania', fonte: 'Direitos Humanos e Cidadania', conteudo: q => q.numero_original <= 178 ? 'Igualdade, identidade de gênero e direitos das mulheres' : q.numero_original === 179 ? 'Direitos humanos e enfrentamento ao racismo' : 'Migração, refúgio e apatridia' },
  { de: 181, ate: 182, materia: 'Direito Administrativo', fonte: 'Marco Regulatório das Organizações da Sociedade Civil', conteudo: 'Instrumentos de parceria e controle de resultados' },
  { de: 183, ate: 185, materia: 'Direitos Humanos e Cidadania', fonte: 'Direito Humano à Saúde', conteudo: 'Direito à saúde, internação psiquiátrica e políticas de saúde' },
  { de: 186, ate: 200, materia: 'Legislação Institucional', fonte: 'Legislação Institucional', conteudo: q => q.numero_original <= 187 ? 'Atribuições das promotorias de justiça do MPSC' : q.numero_original <= 193 ? 'Lei Orgânica do Ministério Público de Santa Catarina' : 'Lei Orgânica Nacional do Ministério Público' },
]

const manifesto = JSON.parse(await lerArquivoAtual('manifesto.json', raizesAtuais.slice(raizesAtuais.indexOf('tmp/revisao-profissional/revisao-semantica-v40/acervo-extraido'))))
const base = raizesAtuais.find(r => r.endsWith('revisao-semantica-v40/acervo-extraido'))
const decisoes = []
for (const lote of manifesto.lotes) {
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for (const q of qs) {
    if (q.documento_id !== docId || !q.classificacao_pendente || q.integridade_profissional?.apta_resolucao === false || q.classificacao_revisada) continue
    const regra = topicos.find(t => q.numero_original >= t.de && q.numero_original <= t.ate)
    if (!regra) throw Error(`Sem regra para item ${q.numero_original}`)
    const conteudo = typeof regra.conteudo === 'function' ? regra.conteudo(q) : regra.conteudo
    decisoes.push({ id: q.id, sha256_enunciado: hashRevisao(q.enunciado), materia: regra.materia, conteudo, motivo: `Questão ${q.numero_original}: classificação confrontada com o enunciado e com o cabeçalho/ comando da seção “${regra.fonte}” no PDF oficial; página impressa ${q.pagina}.`, classificacao_fonte: { materia: regra.fonte, pagina: q.pagina, sha256: sha, url } })
  }
}
if (decisoes.length !== 169) throw Error(`Esperadas 169 pendências classificáveis neste documento, encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v41-decisoes.json', JSON.stringify(decisoes, null, 2))
const r = await aplicarRevisoesIndividuais({ nome: 'revisao-semantica-v41', base, decisoes })
console.log(JSON.stringify({ ...r, classificacoes: Object.fromEntries([...new Set(decisoes.map(d => d.materia))].map(m => [m, decisoes.filter(d => d.materia === m).length])) }))
