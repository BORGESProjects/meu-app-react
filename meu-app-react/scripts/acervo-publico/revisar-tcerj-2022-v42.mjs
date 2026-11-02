import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { hashRevisao, aplicarRevisoesIndividuais } from './aplicar-revisoes-individuais.mjs'
import { lerArquivoAtual, raizesAtuais } from './acervo-atual.mjs'

const documento = 'e3275dab1126ee98'
const url = 'https://cdn.cebraspe.org.br/concursos/TCE_RJ_22_PROCURADOR/arquivos/788_TCE_RJ_001_01.PDF'
const secoes = [
  [1, 3, 'Direito Administrativo', 'Controle da administração pública: abrangência, espécies e controle judicial'],
  [4, 6, 'Direito Administrativo', 'Controle externo: fiscalização parlamentar, CPI e decisões dos tribunais de contas'],
  [7, 7, 'Direito Financeiro', 'Fiscalização contábil, financeira, orçamentária, operacional e patrimonial'],
  [8, 10, 'Direito Administrativo', 'Tribunais de contas: natureza, composição, prerrogativas e vedações'],
  [11, 12, 'Direito Administrativo', 'Tomada de contas especial e fiscalização pelo TCE/RJ'],
  [13, 14, 'Direito Previdenciário', 'Registro de atos de aposentadoria, reforma e pensão pelos tribunais de contas'],
  [15, 15, 'Legislação Institucional', 'Ministério Público de Contas: competências e incidentes processuais'],
  [16, 20, 'Direito Administrativo', 'Lei Orgânica e Regimento Interno do TCE/RJ: jurisdição, sanções e competências'],
  [21, 22, 'Direito Administrativo', 'Prestação, julgamento e classificação das contas públicas'],
  [23, 25, 'Direito Administrativo', 'Fontes, princípios e regime jurídico da administração pública'],
  [26, 29, 'Direito Administrativo', 'Órgãos, atos e processos administrativos; eficiência e formalização'],
  [30, 33, 'Direito Administrativo', 'Serviços públicos, servidões, registro de preços, consórcios e ouvidorias'],
  [34, 36, 'Direito Administrativo', 'Estatuto do servidor fluminense, bens públicos e responsabilidade civil estatal'],
  [37, 40, 'Legislação Institucional', 'Legislação estadual, TCE/RJ e Ministério Público de Contas'],
  [41, 42, 'Legislação Institucional', 'Lei Orgânica Nacional e Lei Orgânica do Ministério Público do Rio de Janeiro'],
  [43, 45, 'Legislação Institucional', 'Ministério Público de Contas: regime, autonomia e controle institucional'],
  [46, 53, 'Direito Constitucional', 'Controle externo, tribunais de contas e fiscalização legislativa'],
  [54, 55, 'Direito Administrativo', 'Decisões dos tribunais de contas e garantias processuais'],
  [56, 58, 'Direito Constitucional', 'Constituição do Estado do Rio de Janeiro: controle interno, intervenção e orçamento'],
  [59, 61, 'Direito Tributário', 'Sistema tributário: contribuições previdenciárias, repartição de receitas e dívida tributária'],
  [62, 66, 'Direito Civil', 'Direitos da personalidade: nome, imagem, voz e liberdade de informação'],
  [67, 69, 'Direito Civil', 'Contratos civis: fiança, seguro de vida e bem de família do fiador'],
  [70, 74, 'Direito Civil', 'Defeitos do negócio jurídico: erro, simulação, coação, dolo e lesão'],
  [75, 79, 'Direito Civil', 'Pessoas jurídicas, fundações, associações e organizações religiosas'],
  [80, 84, 'Direito Processual Civil', 'Normas fundamentais, jurisdição, competência, atos processuais e tutela provisória'],
  [85, 90, 'Direito Processual Civil', 'Provas, intervenção do Ministério Público, recursos, tribunais e responsabilidade estatal'],
  [91, 94, 'Direito Processual Civil', 'Mandado de segurança, ação civil pública, ação monitória e improbidade administrativa'],
  [95, 96, 'Direito Administrativo', 'Execução de decisões e multas dos tribunais de contas'],
  [97, 99, 'Direito Administrativo', 'Processo de controle externo no TCE/RJ: recursos, prazos e julgamento virtual'],
  [100, 102, 'Direito Penal', 'Crimes em licitações e contratos administrativos'],
  [103, 104, 'Direito Penal', 'Lavagem de dinheiro: tipicidade, concurso de agentes e colaboração'],
  [105, 110, 'Direito Penal', 'Crimes contra a administração pública e crimes funcionais'],
  [111, 114, 'Direito Penal', 'Abuso de autoridade, prescrição, ação penal e extinção da punibilidade'],
  [115, 118, 'Direito Econômico', 'Evolução histórica do direito econômico e proteção constitucional da ordem econômica'],
  [119, 127, 'Direito Econômico', 'Ordem econômica constitucional, serviços públicos, recursos e atuação estatal'],
  [128, 129, 'Direito Econômico', 'Princípios da ordem econômica: subsidiariedade e igualdade'],
  [130, 132, 'Direito Econômico', 'Defesa da concorrência, parcerias público-privadas e intervenção no domínio econômico'],
  [133, 139, 'Direito Empresarial', 'Sociedades anônimas, transformações societárias, fusão, incorporação e cisão'],
  [140, 142, 'Direito Civil', 'Desconsideração direta e inversa da personalidade jurídica'],
  [143, 147, 'Direito Empresarial', 'Falência e recuperação judicial: sujeitos, competência, mediação e efeitos'],
  [148, 152, 'Direito Financeiro', 'Finanças públicas, moeda, Banco Central, orçamento e vinculação de receitas'],
  [153, 158, 'Direito Financeiro', 'Lei de Responsabilidade Fiscal e regime de recuperação fiscal'],
  [159, 161, 'Direito Financeiro', 'Programa de acompanhamento fiscal, equilíbrio fiscal e operações de crédito'],
  [162, 167, 'Direito Financeiro', 'Leis orçamentárias, exclusividade, empenho e emendas parlamentares'],
  [168, 171, 'Direito Previdenciário', 'Seguridade social, custeio, contagem recíproca e RGPS'],
  [172, 182, 'Direito Previdenciário', 'RGPS e RPPS: filiação, benefícios, pensão, acumulação e regime complementar'],
  [183, 186, 'Direito Tributário', 'Limitações constitucionais ao poder de tributar e anterioridade'],
  [187, 192, 'Direito Tributário', 'Competência tributária, tributos, delegação de capacidade ativa e contribuições'],
  [193, 200, 'Direito Tributário', 'Legislação, crédito e obrigações tributárias: tratados, extinção e lançamento'],
]

const manifesto = JSON.parse(await lerArquivoAtual('manifesto.json'))
const base = raizesAtuais[0]
const decisoes = []
const gabaritoUrl = 'https://cdn.cebraspe.org.br/concursos/tce_rj_22_procurador/arquivos/GAB_DEFINITIVO_788_TCE_RJ_001_01.PDF'
for (const lote of manifesto.lotes) {
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for (const q of qs) {
    if (q.documento_id !== documento || !q.classificacao_pendente || q.integridade_profissional?.apta_resolucao === false || q.classificacao_revisada) continue
    const regra = secoes.find(([de, ate]) => q.numero_original >= de && q.numero_original <= ate)
    if (!regra) throw Error(`Sem seção no PDF oficial para item ${q.numero_original}`)
    const [de, ate, materia, conteudo] = regra
    if (!q.enunciado?.trim() || q.tipo_resposta !== 'certo_errado') throw Error(`Integridade/tipo incompatível no item ${q.numero_original}`)
    decisoes.push({
      id: q.id,
      sha256_enunciado: hashRevisao(q.enunciado),
      materia,
      conteudo,
      motivo: `Item ${q.numero_original}: enunciado conferido com o texto indexado do PDF oficial; seção temática ${de}–${ate}, página ${q.pagina}. Aplicação: Procurador do Ministério Público junto ao TCE/RJ (2022).`,
      classificacao_fonte: { materia: `Seção do caderno oficial, itens ${de}–${ate}`, pagina: q.pagina, url },
      gabarito_oficial: { ...q.gabarito_oficial, fonte: gabaritoUrl, prova: '788_TCE_RJ_001_01.PDF', criterio: 'gabarito definitivo oficial CEBRASPE, identificado pelo caderno e número do item' },
    })
  }
}
if (decisoes.length !== 148) throw Error(`Esperadas 148 questões pendentes aptas desta prova, encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v42-decisoes.json', JSON.stringify(decisoes, null, 2))
const r = await aplicarRevisoesIndividuais({ nome: 'revisao-semantica-v42', base, decisoes })
console.log(JSON.stringify({ ...r, documento, concurso: 'TCE RJ 22 PROCURADOR', classificacoes: Object.fromEntries([...new Set(decisoes.map(d => d.materia))].map(m => [m, decisoes.filter(d => d.materia === m).length])) }))
