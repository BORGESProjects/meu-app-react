import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-semantica-v26',destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const sha=value=>createHash('sha256').update(value).digest('hex')
const decisoes=new Map([
 ['extr-0ec24ea1257d8b790ca0',['Biblioteconomia','Sistemas de classificação: Classificação Decimal Universal (CDU)','O item identifica sinais auxiliares da CDU e sua posição na notação.']],
 ['extr-dcf9d2c641a6c908c1e3',['Biblioteconomia','Indexação: linguagens documentárias e elaboração de tesauros','A questão compara os métodos a posteriori e a priori na elaboração de linguagem documentária.']],
 ['extr-990b089825fd7396e382',['Biblioteconomia','Linguagens documentárias: fontes para elaboração de tesauros','O enunciado pergunta quais fontes de informação podem apoiar a elaboração de tesauros.']],
 ['extr-33311442ee5c9e1ecfa2',['Biblioteconomia','Desenvolvimento de coleções: política para bibliotecas digitais','A questão trata da necessidade de política de desenvolvimento de coleções em biblioteca digital.']],
 ['extr-fd99fff75e26ea4613f4',['Biblioteconomia','Estudos de usuários: métodos e instrumentos de pesquisa','O item trata dos estudos de usuários em bibliotecas públicas e de seus métodos de pesquisa.']],
 ['extr-59e07727792718e25997',['Administração','Gestão de projetos: grupos de processos','O enunciado enumera os grupos de processos que compõem o gerenciamento de projetos.']],
])
if(!destino.startsWith(path.resolve('tmp')+path.sep))throw Error('Destino fora da área temporária')
await fs.rm(destino,{recursive:true,force:true});await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json',raizesAtuais)),facetas=criarIndiceFacetas(),alterados=[],aplicados=[]
let total=0,pendentes=0,disponiveis=0
for(let i=0;i<manifesto.lotes.length;i++){
 const lote=manifesto.lotes[i],questoes=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,raizesAtuais)));let mudou=false
 for(const q of questoes){
  total++;const decisao=decisoes.get(q.id)
  if(decisao){
   if(!q.classificacao_pendente||q.documento_auxiliar||!Array.isArray(q.opcoes)||q.opcoes.length!==2||!/^certo$/iu.test(q.opcoes[0])||!/^errado$/iu.test(q.opcoes[1]))throw Error(`Questão inelegível ou fora do formato C/E: ${q.id}`)
   const antes={materia:q.materia,conteudo:q.conteudo},evidencia=decisao[2]
   q.tipo_resposta='certo_errado';q.materia=decisao[0];q.conteudo=decisao[1];q.classificacao_pendente=false
   q.classificacao_confianca=0.94;q.classificacao_metodo='Revisão semântica manual de enunciado explícito; assunto delimitado ao objeto cobrado';q.classificacao_evidencia=evidencia
   q.classificacao_revisada={justificativa:evidencia,sha256_enunciado:sha(Buffer.from(q.enunciado||''))}
   for(const [obj,chave] of [[q.integridade_profissional,'pendencias'],[q.elegibilidade,'apontamentos']])if(obj?.[chave])obj[chave]=obj[chave].filter(item=>!['classificacao_especifica_pendente','discursiva_fora_do_escopo'].includes(item))
   const pend=q.integridade_profissional?.pendencias||[],apta=!pend.some(item=>/enunciado_ausente|alternativas_invalida|alternativa_vazia|discursiva_|multiplas_questoes|texto_corrompido|texto_de_outro_bloco|visual_ausente|documento_auxiliar/u.test(item))
   const correcao=apta&&!q.anulada&&(q.resposta_correta!=null||q.resposta_soma!=null||q.gabarito_oficial)
   q.integridade_profissional={...q.integridade_profissional,apta_resolucao:apta,correcao_automatica:correcao,verificada_individualmente:true}
   q.elegibilidade={...q.elegibilidade,elegivel_para_resolucao:apta,elegivel_para_correcao_automatica:correcao}
   aplicados.push({id:q.id,antes,depois:{materia:q.materia,conteudo:q.conteudo},evidencia});mudou=true
  }
  if(q.classificacao_pendente)pendentes++;if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 facetas.adicionar(i,questoes)
 if(mudou){const bytes=zlib.gzipSync(JSON.stringify(questoes),{level:9}),arquivo=`lotes/revisao-semantica-v26-${i}-${sha(bytes).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,arquivo),bytes);alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:questoes.length,sha256:sha(bytes)});lote.arquivo=arquivo}
}
if(aplicados.length!==decisoes.size)throw Error(`Decisões esperadas/aplicadas: ${decisoes.size}/${aplicados.length}`)
const filtro=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9}),filtroArquivo=`lotes/filtros-revisao-semantica-v26-${sha(filtro).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,filtroArquivo),filtro);manifesto.indice_facetas={arquivo:filtroArquivo,sha256:sha(filtro),versao:1}
manifesto.questoes_disponiveis_resolucao=disponiveis;manifesto.questoes_indisponiveis_revisao=total-disponiveis;manifesto.gerado_em=new Date().toISOString()
manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v26',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+aplicados.length}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
const resumo={gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis,pendentes,classificadas_individualmente:aplicados.length,lotes_alterados:alterados.length,decisoes:aplicados,alteracoes:alterados,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(resumo,null,2));console.log(JSON.stringify({total,disponiveis,pendentes,classificadas:aplicados.length,lotes:alterados.length},null,2))

