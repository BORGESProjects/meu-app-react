import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='4798936e340e70c5'
const url='https://cdn.cebraspe.org.br/concursos/PF_18/arquivos/MATRIZ_408_DGPPF012__PAG_9.PDF'
const secoes=[
  [[1,24],'Português','Compreensão, interpretação e análise linguística de textos'],
  [[25,26],'Direito Administrativo','Organização administrativa: administração direta e indireta, descentralização e desconcentração'],
  [[27,28],'Direito Administrativo','Controle administrativo e judicial dos atos da administração'],
  [[29,30],'Direito Constitucional','Defesa do Estado, estado de defesa, estado de sítio e direitos fundamentais'],
  [[31,32],'Direito Constitucional','Segurança pública e competências constitucionais da Polícia Federal'],
  [[33,34],'Direito Penal','Receptação e aplicação da lei penal no tempo'],
  [[35,37],'Direito Processual Penal','Inquérito policial, acareação e prisão em flagrante'],
  [[38,39],'Legislação Especial','Lei de Drogas e Lei de Migração: tráfico interestadual e procedimento de deportação'],
  [[40,40],'Direito Penal','Crimes ambientais e tentativa de pesca em local interditado'],
  [[41,50],'Estatística','Distribuição de Bernoulli e binomial, estimação, intervalos de confiança, regressão e distribuição normal'],
  [[51,56],'Raciocínio Lógico','Lógica proposicional: negação, conectivos, equivalência e tautologia'],
  [[57,60],'Estatística','Análise combinatória, conjuntos e cálculo de probabilidades'],
  [[61,65],'Informática','Endereçamento IPv4, proxy, Windows Defender, WHOIS e acesso remoto'],
  [[66,69],'Segurança da Informação','Malware, ransomware, autenticação multifator e proteção de dados pessoais'],
  [[70,72],'Informática','Computação em nuvem: SaaS, PaaS, IaaS e migração de aplicações'],
  [[73,73],'Sistemas de Informação','Teoria geral dos sistemas e princípios unificadores'],
  [[74,78],'Informática','Internet e intranet, indexação e busca, transferência multimídia e ferramentas de escritório'],
  [[79,80],'Sistemas de Informação','Teoria da informação e sistemas de informação'],
  [[81,82],'Banco de Dados','Modelo entidade-relacionamento, entidades, atributos e chaves'],
  [[84,86],'Tecnologia da Informação','Mineração de dados, big data e aprendizado de máquina'],
  [[87,93],'Redes de Computadores','Comutação, topologias, abrangência, camadas e protocolos de transporte'],
  [[94,96],'Programação','Noções de programação em Python e R'],
  [[97,120],'Contabilidade','Contabilidade geral: patrimônio, escrituração, balancetes, demonstrações e características da informação contábil'],
]
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json'))
const base=raizesAtuais[0],decisoes=[]
for(const lote of manifesto.lotes){
  const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for(const q of qs){
    if(q.documento_id!==documento||!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||q.classificacao_revisada)continue
    const n=q.numero_original,regra=secoes.find(([[de,ate]])=>n>=de&&n<=ate)
    if(!regra)throw Error(`Sem tema para o item ${n}`)
    if(!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Integridade/tipo incompatível no item ${n}`)
    if(q.ano&&Number(q.ano)!==2018)throw Error(`Ano divergente no item ${n}: ${q.ano}`)
    const [[de,ate],materia,conteudo]=regra
    decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,
      motivo:`Item ${n}: assunto classificado pelo bloco temático, pelo enunciado e pelo comando do caderno oficial da prova objetiva PF 2018, itens ${de}–${ate}, página ${q.pagina}.`,
      classificacao_fonte:{materia:`Cabeçalho temático oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==91)throw Error(`Esperadas 91 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v51-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v51',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'Polícia Federal — prova objetiva, cargo 12, 2018',classificacoes:Object.fromEntries([...new Set(decisoes.map(d=>d.materia))].map(m=>[m,decisoes.filter(d=>d.materia===m).length]))}))
