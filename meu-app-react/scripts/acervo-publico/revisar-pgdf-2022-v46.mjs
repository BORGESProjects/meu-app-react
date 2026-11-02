import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { hashRevisao, aplicarRevisoesIndividuais } from './aplicar-revisoes-individuais.mjs'
import { lerArquivoAtual, raizesAtuais } from './acervo-atual.mjs'

const documento = 'd9c05c1e69543053'
const url = 'https://cdn.cebraspe.org.br/concursos/PG_DF_22_PROCURADOR/arquivos/MATRIZ_685_PG_DF_001_COM_JUST.PDF'
const topicos = [
  [[1,4],'Direito Constitucional','Rigidez, mutação e reforma constitucional'],
  [[5,7],'Direito Constitucional','Federação, tratados de direitos humanos e intervenção'],
  [[8,9],'Direito Constitucional','Funções essenciais à Justiça e organização da CLDF'],
  [[10,14],'Direito Constitucional','Poderes, processo legislativo e controle de constitucionalidade'],
  [[15,18],'Direito Constitucional','Defesa do Estado, direitos sociais e direito à saúde'],
  [[19,29],'Direito Tributário','Sistema Tributário Nacional: princípios, competência, limitações e crédito tributário'],
  [[30,36],'Direito Tributário','Tributos, ICMS e legislação tributária; item 35 trata de crime contra a ordem tributária'],
  [[37,41],'Direito Tributário','Processo administrativo fiscal do Distrito Federal'],
  [[42,45],'Direito Tributário','Cobrança da dívida ativa distrital — Lei Complementar Distrital n.º 904/2015'],
  [[46,53],'Direito Tributário','Execução fiscal, medidas cautelares, transação tributária e direitos do contribuinte'],
  [[54,70],'Direito Financeiro','Orçamento público, receita e despesa, créditos, fundos, precatórios e Lei de Responsabilidade Fiscal'],
  [[71,79],'Direito Administrativo','Extinção dos atos, licitações, processo disciplinar, governança, usuários, tombamento e responsabilidade estatal'],
  [[80,80],'Direitos Humanos e Cidadania','Políticas públicas para mulheres e igualdade de gênero no Distrito Federal'],
  [[81,86],'Direito Urbanístico','Parcelamento do solo, regularização fundiária urbana e concessão urbanística'],
  [[87,90],'Direito Administrativo','Desapropriação, tombamento e tutela da ordem jurídico-urbanística'],
  [[91,100],'Direito Ambiental','Proteção ambiental, áreas de preservação, vegetação nativa, fauna, terras indígenas e saneamento'],
  [[101,105],'Direito do Consumidor','Relação de consumo, responsabilidade por serviços e proteção contratual'],
  [[106,110],'Direito Processual Civil','Tutela coletiva, direitos difusos e coletivos e legitimidade para ações coletivas'],
  [[111,120],'Direito Penal','Teoria do crime, imputabilidade, aplicação da lei penal e crimes em espécie'],
  [[121,130],'Direito Processual Penal','Lei processual penal, ação penal, ANPP, nulidades, recursos e execução penal'],
  [[131,133],'Geografia','RIDE do Distrito Federal e Entorno, abastecimento de água e integração regional'],
  [[134,134],'História','História do Distrito Federal: Missão Cruls e escolha da localização da capital'],
  [[135,135],'Geografia','Clima, sazonalidade e leitura de dados geográficos do Distrito Federal'],
  [[136,144],'Direito Processual Civil','Execução, tutela provisória, ação popular, mandado de segurança e procedimentos especiais'],
  [[145,146],'Direito Administrativo','Desapropriação consensual e improbidade administrativa'],
  [[147,148],'Direito Processual Civil','Juizado Especial da Fazenda Pública, mandado de segurança e recursos'],
  [[149,161],'Direito Civil','Sucessões, contratos, pessoas, negócios jurídicos, registros públicos e responsabilidade civil'],
  [[161,161],'Direito Tributário','Responsabilidade tributária dos sucessores'],
  [[162,164],'Direito Empresarial','Simples Nacional, registro empresarial e baixa de pessoas jurídicas'],
  [[165,167],'Direito Empresarial','Propriedade industrial: marcas e licenças compulsórias'],
  [[172,174],'Direito Empresarial','Falência: efeitos sobre contratos e créditos concursais'],
  [[177,187],'Direito do Trabalho','Grupo econômico, sucessão, jornada, contratos, férias, remuneração e proteção à maternidade'],
  [[189,198],'Direito Processual do Trabalho','Audiência, prova, recursos, execução, prescrição e procedimentos trabalhistas'],
]
const excecoes = new Map([
  [17,['Direito Constitucional','Direito à saúde e ressarcimento por atendimento em hospital privado']],
  [35,['Direito Penal','Crimes contra a ordem tributária']],
  [65,['Direito Financeiro','Controle externo e fiscalização de recursos públicos']],
  [80,['Direitos Humanos e Cidadania','Políticas públicas para mulheres e igualdade de gênero no Distrito Federal']],
  [87,['Direito Constitucional','Desapropriação confiscatória por cultivo ilegal e função social da propriedade']],
  [96,['Direito Ambiental','Saneamento básico e planejamento distrital']],
  [131,['Geografia','RIDE do Distrito Federal e Entorno: abastecimento hídrico e integração regional']],
  [132,['Geografia','RIDE do Distrito Federal e Entorno: gestão integrada de recursos hídricos']],
  [133,['Geografia','RIDE do Distrito Federal e Entorno: abastecimento de água']],
  [134,['História','Missão Cruls e transferência da capital para o Planalto Central']],
  [135,['Geografia','Clima do Distrito Federal e interpretação de dados pluviométricos']],
  [161,['Direito Tributário','Sucessão tributária e cobrança de crédito inscrito em dívida ativa']],
])

const manifesto = JSON.parse(await lerArquivoAtual('manifesto.json'))
const base = raizesAtuais[0]
const decisoes = []
for (const lote of manifesto.lotes) {
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for (const q of qs) {
    if (q.documento_id !== documento || !q.classificacao_pendente || q.integridade_profissional?.apta_resolucao === false || q.classificacao_revisada) continue
    const numero = q.numero_original
    const regra = excecoes.get(numero) ?? topicos.find(([[de, ate]]) => numero >= de && numero <= ate)?.slice(1)
    if (!regra) throw Error(`Sem regra temática para o item ${numero}`)
    if (!q.enunciado?.trim() || q.tipo_resposta !== 'certo_errado') throw Error(`Integridade ou tipo incompatível no item ${numero}`)
    const [materia, conteudo] = regra
    const range = topicos.find(([[de, ate]]) => numero >= de && numero <= ate)?.[0]
    const intervalo = excecoes.has(numero) ? `item ${numero}` : `itens ${range[0]}–${range[1]}`
    decisoes.push({
      id: q.id,
      sha256_enunciado: hashRevisao(q.enunciado),
      materia,
      conteudo,
      motivo: `Item ${numero}: disciplina e assunto identificados pelo comando temático e pelo conteúdo do enunciado no caderno oficial do concurso PGDF 2022; ${intervalo}; página ${q.pagina}.`,
      classificacao_fonte: { materia: `Caderno oficial, comando dos itens ${intervalo}`, pagina: q.pagina, url },
    })
  }
}
if (decisoes.length !== 130) throw Error(`Esperadas 130 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v46-decisoes.json', JSON.stringify(decisoes, null, 2))
const resultado = await aplicarRevisoesIndividuais({ nome: 'revisao-semantica-v46', base, decisoes })
console.log(JSON.stringify({ ...resultado, documento, concurso: 'PGDF Procurador 2022', classificacoes: Object.fromEntries([...new Set(decisoes.map(d => d.materia))].map(m => [m, decisoes.filter(d => d.materia === m).length])) }))
