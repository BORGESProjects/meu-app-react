import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='8b5cf1dd9a5d3285'
const url='https://cdn.cebraspe.org.br/concursos/TJ_AM_19_SERVIDOR/arquivos/481_TJAM010__MATRIZ.PDF'
const secoes=[
  [[40,40],'Direito Processual Civil','Processo judicial eletrônico: atos de comunicação e digitalização de documentos'],
  [[41,46],'Psicologia','Avaliação psicológica, psicometria e testes projetivos'],
  [[47,56],'Psicologia','Psicopatologia, diagnóstico diferencial, transtornos psicóticos e de ansiedade'],
  [[57,60],'Psicologia','Psicoterapia e processos grupais em instituições'],
  [[61,65],'Psicologia','Psicologia da saúde, prevenção e promoção da saúde'],
  [[66,80],'Psicologia','Psicologia jurídica: violência contra crianças, trauma, avaliação e atuação profissional'],
  [[81,86],'Psicologia','Violência familiar e conjugal: fatores de risco, consequências e prevenção'],
  [[87,91],'Psicologia','Abuso sexual: avaliação, tratamento, fatores de risco e consequências'],
  [[92,100],'Psicologia','Proteção integral, acolhimento institucional e desenvolvimento de crianças e adolescentes'],
  [[101,104],'Psicologia','Psicologia organizacional: teorias das organizações, diagnóstico e significado do trabalho'],
  [[105,108],'Psicologia','Cultura organizacional, motivação e satisfação no trabalho'],
  [[109,112],'Psicologia','Grupos e equipes, liderança, conflitos e relações de poder'],
  [[113,116],'Psicologia','Qualidade de vida no trabalho, saúde, bem-estar e ergonomia'],
  [[117,120],'Psicologia','Seleção de pessoal, avaliação de desempenho e validade dos métodos'],
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
      motivo:`Item ${n}: matéria, conteúdo e ano conferidos no cabeçalho e na seção temática do caderno oficial TJ/AM Psicologia 2019, itens ${de}–${ate}, página ${q.pagina}.`,
      classificacao_fonte:{materia:`Cabeçalho temático oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==76)throw Error(`Esperadas 76 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v53-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v53',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'TJ/AM Servidor — Psicologia — 2019'}))
