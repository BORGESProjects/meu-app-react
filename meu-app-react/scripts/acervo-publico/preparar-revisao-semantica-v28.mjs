import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
const nome='revisao-semantica-v28',destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`),sha=v=>createHash('sha256').update(v).digest('hex')
const decisoes=new Map([
 ['extr-04f4660b9fd0bc416d3f',['Português','Interpretação e compreensão de textos','A questão pede uma inferência sobre a tese do texto; o cabeçalho da página diz “Acerca das ideias, dos sentidos e dos aspectos linguísticos do texto” e manda julgar itens objetivos.']],
 ['extr-e49cd7aff1f75c0cb742',['Português','Interpretação e compreensão de textos','O item pergunta o que se infere do texto sobre cenários climáticos; a página original delimita a seção às ideias e aos aspectos linguísticos e determina julgamento C/E.']],
 ['extr-832d863dbc564726c812',['Português','Interpretação e compreensão de textos','O item avalia inferência sobre os efeitos do aquecimento global descritos no texto; a página original o inclui em bloco de compreensão textual com resposta C/E.']],
])
if(!destino.startsWith(path.resolve('tmp')+path.sep))throw Error('Destino fora da área temporária')
await fs.rm(destino,{recursive:true,force:true});await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json',raizesAtuais)),facetas=criarIndiceFacetas(),alterados=[],aplicados=[];let total=0,pending=0,available=0
for(let i=0;i<manifesto.lotes.length;i++){
 const lote=manifesto.lotes[i],qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,raizesAtuais)));let mudou=false
 for(const q of qs){total++;const d=decisoes.get(q.id);if(d){
  if(!q.classificacao_pendente||q.documento_auxiliar||q.opcoes?.length!==2||!/^certo$/iu.test(q.opcoes[0])||!/^errado$/iu.test(q.opcoes[1]))throw Error(`Questão não confere com a fonte objetiva: ${q.id}`)
  const antes={materia:q.materia,conteudo:q.conteudo,tipo_resposta:q.tipo_resposta},ev=d[2]
  q.tipo_resposta='certo_errado';q.materia=d[0];q.conteudo=d[1];q.classificacao_pendente=false;q.classificacao_confianca=0.97;q.classificacao_metodo='Revisão manual com conferência do comando e da seção na página-fonte';q.classificacao_evidencia=ev;q.classificacao_revisada={justificativa:ev,sha256_enunciado:sha(Buffer.from(q.enunciado||''))}
  for(const [o,k] of [[q.integridade_profissional,'pendencias'],[q.elegibilidade,'apontamentos']])if(o?.[k])o[k]=o[k].filter(x=>!['classificacao_especifica_pendente','discursiva_fora_do_escopo'].includes(x))
  const issues=q.integridade_profissional?.pendencias||[],apta=!issues.some(x=>/enunciado_ausente|alternativas_invalida|alternativa_vazia|discursiva_|multiplas_questoes|texto_corrompido|texto_de_outro_bloco|visual_ausente|documento_auxiliar/u.test(x)),corr=apta&&!q.anulada&&(q.resposta_correta!=null||q.resposta_soma!=null||q.gabarito_oficial)
  q.integridade_profissional={...q.integridade_profissional,apta_resolucao:apta,correcao_automatica:corr,verificada_individualmente:true};q.elegibilidade={...q.elegibilidade,elegivel_para_resolucao:apta,elegivel_para_correcao_automatica:corr}
  aplicados.push({id:q.id,antes,depois:{materia:q.materia,conteudo:q.conteudo,tipo_resposta:q.tipo_resposta},evidencia:ev});mudou=true
 }if(q.classificacao_pendente)pending++;if(q.integridade_profissional?.apta_resolucao!==false)available++}
 facetas.adicionar(i,qs);if(mudou){const bytes=zlib.gzipSync(JSON.stringify(qs),{level:9}),arquivo=`lotes/revisao-semantica-v28-${i}-${sha(bytes).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,arquivo),bytes);alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:qs.length,sha256:sha(bytes)});lote.arquivo=arquivo}
}
if(aplicados.length!==decisoes.size)throw Error(`Esperadas ${decisoes.size}; aplicadas ${aplicados.length}`)
const filtros=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9}),filtroArquivo=`lotes/filtros-revisao-semantica-v28-${sha(filtros).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,filtroArquivo),filtros)
manifesto.indice_facetas={arquivo:filtroArquivo,sha256:sha(filtros),versao:1};manifesto.questoes_disponiveis_resolucao=available;manifesto.questoes_indisponiveis_revisao=total-available;manifesto.gerado_em=new Date().toISOString();manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v28',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+aplicados.length}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
const rel={gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis:available,pendentes:pending,classificadas_individualmente:aplicados.length,lotes_alterados:alterados.length,decisoes:aplicados,alteracoes:alterados,publicado:false};await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(rel,null,2));console.log(JSON.stringify({total,disponiveis:available,pendentes:pending,classificadas:aplicados.length,lotes:alterados.length},null,2))
