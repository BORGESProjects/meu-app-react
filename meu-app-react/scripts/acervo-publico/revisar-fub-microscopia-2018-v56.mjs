import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='844f618cc8b5dbca'
const url='https://cdn.cebraspe.org.br/concursos/FUB_18/arquivos/MATRIZ_433_FUB019__PAG_4.PDF'
const secoes=[
  [[51,60],'Biologia','Microscopia de luz: formação da imagem, lentes, foco, ampliação, orientação e resolução'],
  [[61,74],'Biologia','Estereomicroscopia e microscopia de luz: visão tridimensional, iluminação, amostras, componentes e operação'],
  [[75,86],'Biologia','Manutenção, limpeza, proteção e armazenamento de lentes e componentes de microscópios'],
  [[87,100],'Biologia','Técnicas de observação em microscopia óptica: preparação, lamínulas, foco, contraste e resolução'],
  [[101,103],'Biologia','Componentes mecânicos e identificação das partes do microscópio de luz'],
  [[104,112],'Física','Óptica geométrica aplicada à microscopia: sistemas de lentes, poder de resolução, ampliação e aberrações'],
  [[113,115],'Física','Formação de imagens por objetiva e ocular em microscópio composto'],
  [[116,120],'Física','Equação de lentes delgadas, lente biconvexa, distância focal e natureza/posição da imagem'],
]
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json'))
const base=raizesAtuais[0],decisoes=[]
for(const lote of manifesto.lotes){
  const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for(const q of qs){
    if(q.documento_id!==documento||!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||q.classificacao_revisada)continue
    const n=Number(q.numero_original),regra=secoes.find(([[de,ate]])=>n>=de&&n<=ate)
    if(!regra)throw Error(`Sem tema para o item ${q.numero_original}`)
    if(!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Integridade/tipo incompatível no item ${q.numero_original}`)
    if(q.ano&&Number(q.ano)!==2018)throw Error(`Ano divergente no item ${q.numero_original}: ${q.ano}`)
    if(q.banca!=='CEBRASPE')throw Error(`Banca divergente no item ${q.numero_original}: ${q.banca}`)
    const [[de,ate],materia,conteudo]=regra
    decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2018,
      motivo:`Item ${n}: disciplina e tópico identificados pelo comando, texto e elemento do caderno oficial FUB 2018, itens ${de}–${ate}, página ${q.pagina}.`,
      classificacao_fonte:{materia:`Comando temático e enunciados do caderno oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==70)throw Error(`Esperadas 70 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v56-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v56',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'Fundação Universidade de Brasília — prova de microscopia — 2018',classificacoes:Object.fromEntries([...new Set(decisoes.map(d=>d.materia))].map(m=>[m,decisoes.filter(d=>d.materia===m).length]))}))
