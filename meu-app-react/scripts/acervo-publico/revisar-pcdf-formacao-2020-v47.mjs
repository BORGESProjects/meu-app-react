import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { hashRevisao, aplicarRevisoesIndividuais } from './aplicar-revisoes-individuais.mjs'
import { lerArquivoAtual, raizesAtuais } from './acervo-atual.mjs'

const documento='f17e5c02cd0efc21'
const url='https://cdn.cebraspe.org.br/concursos/PC_DF_20_AGENTE/arquivos/881_PCDF_AGENTE_CF_001_01.PDF'
const secoes=[
  [[1,4],'Conhecimentos Específicos','Atendimento pré-hospitalar tático: cuidados sob fogo e controle de hemorragias'],
  [[5,8],'Conhecimentos Específicos','Suporte básico de vida: parada cardiorrespiratória e obstrução das vias aéreas'],
  [[9,13],'Direitos Humanos e Cidadania','Teoria geral dos direitos humanos e sistema internacional de proteção'],
  [[14,18],'História','História da Polícia Civil no Brasil e da Polícia Civil do Distrito Federal'],
  [[19,23],'Legislação Institucional','Regime jurídico e gestão de pessoas da PCDF: carreira, direitos e deveres'],
  [[24,28],'Legislação Institucional','Corregedoria da PCDF: símbolos, ética, incompatibilidades e processo disciplinar'],
  [[29,33],'Legislação Institucional','Sistema de segurança pública, estrutura, ética e planejamento institucional da PCDF'],
  [[34,38],'Informática','Inteligência de fontes abertas, operadores de busca e ambientes da Internet'],
  [[39,42],'Direitos Humanos e Cidadania','Proteção de grupos vulneráveis, pessoa idosa, população LGBTQIA+ e ações afirmativas'],
  [[44,46],'Direito Processual Penal','Investigação de crimes financeiros: acesso a dados, sigilos e obtenção de informações'],
  [[47,48],'Direito Penal','Colaboração premiada e lavagem de dinheiro: fases e efeitos penais'],
  [[49,53],'Direito Processual Penal','Protocolos de investigação de violência doméstica e crimes sexuais; atendimento e prova'],
  [[54,58],'Direito Processual Penal','Investigação de crimes patrimoniais: diligências, perícia e reconhecimento'],
  [[59,63],'Direito Processual Penal','Investigação de tráfico de drogas, colaboração, dados telemáticos e interceptação'],
  [[64,66],'Direito Penal','Crime de homicídio: início da vida, qualificadoras, privilégio e hediondez'],
  [[67,68],'Direito Processual Penal','Investigação de homicídio e exame de corpo de delito'],
  [[69,73],'Legislação Especial','Lei n.º 13.431/2017: escuta especializada, depoimento especial e proteção de crianças'],
  [[74,78],'Segurança Pública','Segurança orgânica, segurança da informação, proteção de instalações e operações'],
  [[79,82],'Informática','Sistemas de informação, bancos de dados, integridade e proteção de dados na PCDF'],
  [[83,86],'Informática','Sistemas corporativos da PCDF: intranet, PROCED e Millenium'],
  [[87,90],'Legislação Institucional','Delegacia Eletrônica da PCDF: registro, homologação e preservação de vestígios'],
  [[91,95],'Informática','Telecomunicações da PCDF: rádio, telefonia IP, celulares e energia de estações'],
  [[96,100],'Psicologia','Técnicas de entrevista investigativa, vieses cognitivos e psicologia do testemunho'],
]
const excecoes=new Map([
  [43,['Direito Penal','Homicídio qualificado por motivo torpe e violência discriminatória']],
])
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json'))
const base=raizesAtuais[0]
const decisoes=[]
for(const lote of manifesto.lotes){
  const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for(const q of qs){
    if(q.documento_id!==documento||!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||q.classificacao_revisada)continue
    const n=q.numero_original
    const regra=excecoes.get(n)??secoes.find(([[de,ate]])=>n>=de&&n<=ate)?.slice(1)
    if(!regra)throw Error(`Sem seção temática para o item ${n}`)
    if(!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Integridade/tipo incompatível no item ${n}`)
    const [materia,conteudo]=regra
    const intervalo=excecoes.has(n)?`item ${n}`:`itens ${secoes.find(([[de,ate]])=>n>=de&&n<=ate)[0].join('–')}`
    decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,
      motivo:`Item ${n}: matéria e conteúdo identificados pelo cabeçalho temático e pelo comando do caderno oficial da prova de formação PCDF 2020 (${intervalo}), página ${q.pagina}.`,
      classificacao_fonte:{materia:`Cabeçalho e comando oficial, ${intervalo}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==103)throw Error(`Esperadas 103 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v47-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v47',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'PCDF Agente — curso de formação 2020',classificacoes:Object.fromEntries([...new Set(decisoes.map(d=>d.materia))].map(m=>[m,decisoes.filter(d=>d.materia===m).length]))}))
