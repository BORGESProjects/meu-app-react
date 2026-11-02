import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='97488cfe74215424'
const url='https://cdn.cebraspe.org.br/concursos/TJ_AM_19_SERVIDOR/arquivos/481_TJAM011__MATRIZ.PDF'
const secoes=[
  [[40,40],'Direito Processual Civil','Processo judicial eletrônico: atos de comunicação e digitalização de documentos'],
  [[41,50],'Serviço Social','Fundamentos históricos, questão social e referenciais teórico-metodológicos da profissão'],
  [[51,54],'Serviço Social','Movimento de reconceituação e projeto ético-político do Serviço Social'],
  [[55,60],'Serviço Social','Ética profissional, legislação e atribuições no trabalho multiprofissional'],
  [[61,65],'Serviço Social','Gestão democrática e planejamento social'],
  [[66,71],'Serviço Social','Intervenção profissional em instituição judiciária, ética e trabalho interdisciplinar'],
  [[72,83],'Serviço Social','Dimensão técnico-operativa, instrumentais, pesquisa social e estudo socioeconômico'],
  [[84,86],'Serviço Social','Marco Legal da Primeira Infância: direitos e proteção à maternidade e à paternidade'],
  [[87,91],'Legislação Especial','Estatuto da Criança e do Adolescente: adoção, convivência familiar e proteção integral'],
  [[92,96],'Direitos Humanos e Cidadania','Direitos das pessoas vivendo com HIV: proteção contra discriminação, sigilo e benefícios'],
  [[97,100],'Legislação Especial','Lei Brasileira de Inclusão: capacidade civil, autonomia e direitos da pessoa com deficiência'],
  [[101,105],'Serviço Social','Seguridade social, assistência social, previdência e atribuições do SUS'],
  [[106,111],'Serviço Social','Lei de regulamentação profissional, Código de Ética, sigilo e processo disciplinar'],
  [[112,116],'Legislação Especial','Estatuto da Pessoa Idosa: prioridade, saúde, BPC, transporte e proteção contra violência'],
  [[117,120],'Legislação Especial','SINASE e normas internacionais de proteção de crianças e adolescentes'],
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
    const [[de,ate],materia,conteudo]=regra
    decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2019,
      motivo:`Item ${n}: matéria, conteúdo e ano verificados no caderno oficial TJ/AM 2019, itens ${de}–${ate}, página ${q.pagina}.`,
      classificacao_fonte:{materia:`Cabeçalho temático oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==78)throw Error(`Esperadas 78 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v52-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v52',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'TJ/AM Servidor — cargo 11 — 2019',classificacoes:Object.fromEntries([...new Set(decisoes.map(d=>d.materia))].map(m=>[m,decisoes.filter(d=>d.materia===m).length]))}))
