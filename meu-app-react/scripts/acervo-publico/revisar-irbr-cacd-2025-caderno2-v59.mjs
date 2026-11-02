import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='a1c43b2a8de46185'
const url='https://cdn.cebraspe.org.br/concursos/IRBR_25_DIPLOMACIA/arquivos/101_IRBRCACDOBJ_002_01.pdf'
const secoes=[
  [[121,148],'Inglês','Compreensão e interpretação de textos, vocabulário e gramática contextualizada em temas de diplomacia, sociedade e meio ambiente'],
  [[149,160],'Política Internacional','Teorias das relações internacionais, ordem global, integração regional e política externa brasileira'],
  [[161,180],'Política Internacional','Relações Brasil–União Europeia e MERCOSUL, cooperação Sul–Sul, governança global e conflitos contemporâneos'],
  [[181,184],'Política Internacional','Governança climática, COP30, Acordo de Paris e políticas internacionais de conservação ambiental'],
  [[185,196],'Política Internacional','Petróleo, sanções, segurança energética e geopolítica dos recursos naturais'],
  [[197,200],'Economia','Regimes cambiais, política cambial, reservas internacionais e fluxos de capital'],
  [[201,204],'Economia','Teorias do comércio internacional, dotação de fatores e hipótese Prebisch–Singer'],
  [[205,207],'Economia','Bandas cambiais, barreiras técnicas, quotas e tarifas de importação'],
  [[208,214],'Economia','Economia brasileira: industrialização, substituição de importações, Plano de Metas e II PND'],
  [[215,224],'Direito Administrativo','Regime disciplinar do servidor público, Lei n.º 8.112/1990 e deveres do Serviço Exterior Brasileiro'],
  [[225,230],'Direito Internacional Público','Integração regional, personalidade jurídica das organizações internacionais, direito do mar e direito dos tratados'],
  [[231,234],'Direito Internacional Público','Convenção-Quadro sobre Mudança do Clima: inventários, COP e responsabilidades comuns diferenciadas'],
  [[235,236],'Direito Internacional Público','Princípios constitucionais das relações internacionais e extradição'],
  [[237,238],'Direito Internacional Público','Elementos constitutivos do Estado, descolonização e direito internacional do desenvolvimento'],
  [[239,240],'Direito Internacional Público','Corte Internacional de Justiça: jurisdição contenciosa e competência consultiva'],
]
const nuances=/\b(not|never|only|except|although|whereas|unless|neither|solely|however|não|nunca|apenas|somente|exceto|embora|todavia|salvo|necessariamente|exclusivamente)\b/i
const caso=/\b(considerando|considere|situação hipotética|nessa situação|dado que|in this situation|suppose|given that)\b/i
function dificuldade(q){
  const s=String(q.enunciado||'').replace(/\s+/g,' ').trim(),n=s.length,temNuance=nuances.test(s),temCaso=caso.test(s),refs=(s.match(/\b(?:Lei|Decreto|art\.|Treaty|Convention|Agreement)\b/gi)||[]).length
  let nivel,criterio
  if(n>=600||(temCaso&&n>=330&&(temNuance||refs>=2))){nivel='Difícil';criterio=`enunciado longo (${n} caracteres)${temCaso?'; situação aplicada':''}${temNuance?'; ressalva ou contraste':''}${refs>=2?'; múltiplas referências normativas':''}`}
  else if(n<=220&&!temCaso&&!temNuance&&refs<=1){nivel='Fácil';criterio=`afirmação curta (${n} caracteres), direta e sem hipótese ou ressalva explícita`}
  else{nivel='Média';criterio=`exige leitura contextual${temNuance?'; contém ressalva/contraste':''}${temCaso?'; aplica-se a uma situação':''}${refs?`; mobiliza ${refs} referência(s) normativa(s)`:''}; extensão ${n} caracteres`}
  return {nivel,evidencia:`Estimativa pedagógica, não estatística oficial de acertos: ${criterio}.`}
}
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json'))
const base=raizesAtuais[0],decisoes=[]
for(const lote of manifesto.lotes){
  const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for(const q of qs){
    if(q.documento_id!==documento||!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||q.classificacao_revisada)continue
    const n=Number(q.numero_original),regra=secoes.find(([[de,ate]])=>n>=de&&n<=ate)
    if(!regra)throw Error(`Sem tema para o item ${q.numero_original}`)
    if(!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Integridade/tipo incompatível no item ${q.numero_original}`)
    if(q.ano&&Number(q.ano)!==2025)throw Error(`Ano divergente no item ${q.numero_original}: ${q.ano}`)
    if(q.banca!=='CEBRASPE')throw Error(`Banca divergente no item ${q.numero_original}: ${q.banca}`)
    const [[de,ate],materia,conteudo]=regra,est=dificuldade(q)
    decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,dificuldade:est.nivel,dificuldade_estimada:true,dificuldade_evidencia:est.evidencia,
      motivo:`Item ${n}: matéria e conteúdo conferidos pelo cabeçalho e comando temático do caderno oficial CACD 2025, itens ${de}–${ate}, página ${q.pagina}.`,
      classificacao_fonte:{materia:`Comando temático do caderno oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==119)throw Error(`Esperadas 119 pendências aptas neste documento; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v59-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v59',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'Instituto Rio Branco — CACD/Diplomacia — caderno 2 — 2025',classificacoes:Object.fromEntries([...new Set(decisoes.map(d=>d.materia))].map(m=>[m,decisoes.filter(d=>d.materia===m).length])),dificuldades:Object.fromEntries([...new Set(decisoes.map(d=>d.dificuldade))].map(m=>[m,decisoes.filter(d=>d.dificuldade===m).length]))}))
