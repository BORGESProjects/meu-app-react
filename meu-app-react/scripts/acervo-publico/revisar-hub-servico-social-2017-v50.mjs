import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='d2f8b9fe92469702'
const url='https://cdn.cebraspe.org.br/concursos/HUB_17_MULTIPROFISSIONAL/arquivos/289RMULTHUB_008_01.pdf'
const secoes=[
  [[1,20],'Serviço Social','Proteção social e formação histórica das políticas sociais'],
  [[21,23],'Serviço Social','Prática profissional, instrumentalidade e dimensões teórico-metodológica, ético-política e técnico-operativa'],
  [[24,42],'Serviço Social','Atuação profissional na saúde e parâmetros do Serviço Social no SUS'],
  [[43,47],'Serviço Social','Políticas sociais para pessoas idosas, população em situação de rua, pessoas com deficiência e crianças e adolescentes'],
  [[48,63],'Serviço Social','Competências e atribuições profissionais na saúde'],
  [[64,67],'Serviço Social','Conceitos de pobreza, desigualdade e políticas de assistência social'],
  [[68,80],'Serviço Social','Políticas públicas, direitos sociais e financiamento da proteção social'],
  [[81,85],'Serviço Social','Instrumentos técnico-operativos, estudos sociais e avaliação de políticas sociais'],
  [[86,100],'Serviço Social','Normas e resoluções do CFESS: sigilo, documentos e exercício profissional'],
  [[101,105],'Serviço Social','Benefício de Prestação Continuada: elegibilidade, revisão e composição familiar'],
  [[106,120],'Serviço Social','Lei Orgânica da Saúde, princípios, organização e competências do SUS'],
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
    decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,
      motivo:`Item ${n}: matéria e conteúdo identificados pelo cabeçalho temático e pelo comando do caderno oficial HUB Serviço Social 2017, itens ${de}–${ate}, página ${q.pagina}.`,
      classificacao_fonte:{materia:`Cabeçalho temático oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==118)throw Error(`Esperadas 118 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v50-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v50',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'HUB Residência Multiprofissional — Serviço Social 2017'}))
