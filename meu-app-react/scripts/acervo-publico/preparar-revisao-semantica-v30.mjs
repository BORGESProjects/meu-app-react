import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-semantica-v30',id='extr-e0161eaab1e33b06bbc5'
const destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const sha=v=>createHash('sha256').update(v).digest('hex')
const pdfGabarito='https://cdn.cebraspe.org.br/concursos/AGU_15_ADV/arquivos/Gab_Definitivo_187AGU_001_01.pdf'
const shaGabarito='bf96cf6ac26b7c5e277959f777e90c37eee2bb5beeb779358284e1ea53b19335'
const contexto='O titular do Ministério da Ciência, Tecnologia e Inovação redigiu e submeteu à análise de sua consultoria jurídica minuta de despacho pelo indeferimento de pedido da empresa Salus à habilitação em dada política pública governamental. A despeito de não apresentar os fundamentos de fato e de direito para o indeferimento, o despacho em questão invoca como fundamento da negativa uma nota técnica produzida no referido ministério, cuja conclusão exaure matéria coincidente com aquela objeto do pedido da empresa Salus. A propósito dessa situação hipotética, julgue os itens que se seguem, relativos à forma dos atos administrativos.'
const enunciado='Na hipótese considerada, a minuta do ato do ministro apresenta vício de forma em razão da obrigatoriedade de motivação dos atos administrativos que neguem direitos aos interessados.'
if(!destino.startsWith(path.resolve('tmp')+path.sep))throw Error('Destino fora da área temporária')
await fs.rm(destino,{recursive:true,force:true});await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json',raizesAtuais)),facetas=criarIndiceFacetas(),alterados=[]
let total=0,available=0,pending=0,aplicados=0
for(let i=0;i<manifesto.lotes.length;i++){
 const lote=manifesto.lotes[i],qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,raizesAtuais)));let mudou=false
 for(const q of qs){
  total++
  if(q.id===id){
   if(q.concurso!=='AGU ADVOGADO 2015'||q.banca!=='CEBRASPE'||q.ano!==2015||q.numero_original!==6||q.pagina_imagem!=='paginas/c29c50e772c83fa4-0001.webp'||q.tipo_resposta!=='certo_errado'||JSON.stringify(q.opcoes)!==JSON.stringify(['Certo','Errado']))throw Error('Identidade, página ou formato da questão não confere com a prova')
   q.enunciado=enunciado;q.texto_apoio=contexto;q.materia='Direito Administrativo';q.conteudo='Atos administrativos';q.classificacao_pendente=false;q.classificacao_confianca=0.99;q.classificacao_metodo='Revisão manual da página original e do item 6; assunto confirmado pela situação hipotética e pelo comando do bloco.';q.classificacao_evidencia='A prova delimita os itens 5 a 9 como relativos à forma dos atos administrativos; a afirmação exige avaliar vício por falta de motivação do ato que nega direito.';q.classificacao_revisada={justificativa:q.classificacao_evidencia,sha256_enunciado:sha(Buffer.from(q.enunciado))}
   q.resposta_correta=1;q.gabarito_oficial={fonte:pdfGabarito,sha256:shaGabarito,arquivo:'Gab_Definitivo_187AGU_001_01.pdf',prova:'187AGU_001_01.pdf',numero:6,pagina:1,resposta:'E',criterio:'Gabarito oficial definitivo do CEBRASPE; caderno 187AGU_001_01, item 6. A alternativa Errado corresponde ao índice 1.'}
   for(const [o,k] of [[q.integridade_profissional,'pendencias'],[q.elegibilidade,'apontamentos']])if(o?.[k])o[k]=o[k].filter(x=>!['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','texto_de_outro_bloco_no_enunciado'].includes(x))
   const issues=q.integridade_profissional?.pendencias||[]
   if(issues.length)throw Error(`Persistem pendências de integridade após reconstrução: ${issues.join(', ')}`)
   q.integridade_profissional={...q.integridade_profissional,apta_resolucao:true,correcao_automatica:true,verificada_individualmente:true}
   q.elegibilidade={...q.elegibilidade,elegivel_para_resolucao:true,elegivel_para_correcao_automatica:true}
   aplicados++;mudou=true
  }
  if(q.classificacao_pendente)pending++
  if(q.integridade_profissional?.apta_resolucao!==false)available++
 }
 facetas.adicionar(i,qs)
 if(mudou){const bytes=zlib.gzipSync(JSON.stringify(qs),{level:9}),arquivo=`lotes/${nome}-${i}-${sha(bytes).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,arquivo),bytes);alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:qs.length,sha256:sha(bytes)});lote.arquivo=arquivo}
}
if(aplicados!==1)throw Error(`Esperada uma questão reconstruída; aplicadas ${aplicados}`)
const filtros=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9}),filtroArquivo=`lotes/filtros-${nome}-${sha(filtros).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,filtroArquivo),filtros)
manifesto.indice_facetas={arquivo:filtroArquivo,sha256:sha(filtros),versao:1};manifesto.questoes_disponiveis_resolucao=available;manifesto.questoes_indisponiveis_revisao=total-available;manifesto.gerado_em=new Date().toISOString();manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v30',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+1}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
const rel={gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis:available,pendentes:pending,classificadas_individualmente:1,lotes_alterados:alterados.length,decisoes:[{id,concurso:'AGU ADVOGADO 2015',ano:2015,numero:6,materia:'Direito Administrativo',conteudo:'Atos administrativos',enunciado_reconstruido:true,texto_apoio_reconstruido:true,gabarito:'Errado',referencia_gabarito:pdfGabarito,referencia_prova:'https://cdn.cebraspe.org.br/concursos/AGU_15_ADV/arquivos/187AGU_001_01.pdf',prova_visual:'public/acervo-extraido/paginas/c29c50e772c83fa4-0001.webp'}],alteracoes:alterados,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(rel,null,2));console.log(JSON.stringify({total,disponiveis:available,pendentes:pending,questoes_corrigidas:aplicados,lotes:alterados.length},null,2))
