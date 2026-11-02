import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-semantica-v24',destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const sha=value=>createHash('sha256').update(value).digest('hex')
const decisoes=new Map([
 ['extr-dd06ba8cf51df468054a',['Informática','Redes: endereçamento IPv4, sub-redes e máscaras','O enunciado descreve uma rede classe C, divisão em sub-redes e cálculo da máscara para o número de hosts.']],
 ['extr-c64e85abdfd3123e0038',['Informática','Redes: tradução de endereços de rede (NAT)','A tecnologia NAT e o espaço de endereçamento IP são o objeto explícito.']],
 ['extr-e3a8d71460ad5c2b23f6',['Informática','Segurança da informação: autenticidade e não repúdio','O item nomeia diretamente o não repúdio como propriedade de segurança da informação.']],
 ['extr-5a845071079ef7b60ad2',['Informática','Segurança da informação: integridade dos dados','O enunciado define a propriedade de integridade de dados e o controle de alterações autorizadas.']],
 ['extr-acfbc75490a5bd81cc19',['Informática','Segurança da informação: resposta a incidentes','A equipe de resposta a incidentes de segurança é o objeto direto do item.']],
 ['extr-f494eb6ac4b763f580e2',['Administração','Planejamento estratégico: planejamento estratégico situacional','O item nomeia o PES e seu momento estratégico, governabilidade, recursos e negociação de atores.']],
 ['extr-7cf3c125aad5aa5b8e85',['Administração','Gestão de pessoas: mapeamento de competências','O enunciado define o mapeamento como identificação de lacunas entre competências necessárias e disponíveis.']],
 ['extr-3005efb1d79f6164cf46',['Administração','Gestão de pessoas: competências organizacionais e individuais','A questão trata da definição e disseminação de competências no planejamento estratégico de pessoas.']],
 ['extr-4cd08fa6568076e5f000',['Administração','Gestão de pessoas: treinamento por competências','A relação entre mapeamento de competências e programas de treinamento é explícita.']],
 ['extr-46741c985a48beb2761f',['Administração','Gestão de pessoas: gestão por competências','O item descreve o desenvolvimento de conhecimentos, habilidades e atitudes para agregar valor organizacional.']],
 ['extr-4c786fcdd7f3f6384e6d',['Administração Financeira e Orçamentária','Despesa pública: despesas de exercícios anteriores','A expressão técnica “despesas de exercícios anteriores” aparece explicitamente como objeto do item.']],
 ['extr-485f0a08121838cbcd4c',['Direito Constitucional','Direitos e garantias fundamentais: habeas data','O item delimita o habeas data às informações pessoais do próprio impetrante.']],
 ['extr-090dc60eb3d0ba33350f',['Direito Constitucional','Direitos e garantias fundamentais: eficácia das normas','A questão aborda a aplicabilidade das normas constitucionais que definem direitos e garantias.']],
 ['extr-66ec111a6dd73f964582',['Direito Constitucional','Remédios constitucionais: competência para habeas data','O item cobra competência originária para processar habeas data contra ato de tribunal ou juiz federal.']],
 ['extr-4e045661d1cb9320c4b7',['Direito Constitucional','Remédios constitucionais: habeas data','O enunciado identifica o habeas data como instrumento de acesso e retificação de dados pessoais.']],
 ['extr-bd09bbe3546172607862',['Biologia','Genética molecular: imprinting e metilação','O enunciado define imprinting genômico e metilação de alelos.']],
 ['extr-61bc19369a387537a6bc',['Biologia','Genética: seleção genômica ampla','A seleção genômica ampla e a predição de valor genético são o objeto específico.']],
 ['extr-15a0de940fc7a42cf992',['Biologia','Genética: alelos letais e herança recessiva','O item trata explicitamente de alelo letal recessivo e genótipo heterozigoto.']],
 ['extr-20d6ae686d9f00af43a8',['Biologia','Genética: codominância e alelos múltiplos','O enunciado define codominância e usa o sistema ABO como exemplo de alelos múltiplos.']],
 ['extr-aa6dd2d655fdbf7d1a70',['Química','Soluções: concentração molar e comparação de concentrações','A questão compara concentrações molares de soluções de HCl e NaOH.']],
 ['extr-fcd5155a4eff8af6d915',['Física','Mecânica: movimento circular e velocidade angular','O item compara velocidades angulares de componentes de uma transmissão por corrente.']],
 ['extr-bfa102ed3c286bd5a674',['Física','Ondulatória: propagação do som','A questão descreve frentes de onda esféricas emitidas por fonte sonora pontual.']],
 ['extr-ccfcff4e4c86c4383812',['Física','Ondulatória: velocidade do som e temperatura','O enunciado relaciona a velocidade de propagação sonora à temperatura do meio.']],
 ['extr-71cbaadfbd8d95e057ca',['Matemática','Probabilidade e estatística: distribuição normal','O item aplica transformação linear de variável normal e calcula a variância resultante.']],
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
   const pend=q.integridade_profissional?.pendencias||[]
   const apta=!pend.some(item=>/enunciado_ausente|alternativas_invalida|alternativa_vazia|discursiva_|multiplas_questoes|texto_corrompido|texto_de_outro_bloco|visual_ausente|documento_auxiliar/u.test(item))
   const correca=apta&&!q.anulada&&(q.resposta_correta!=null||q.resposta_soma!=null||q.gabarito_oficial)
   q.integridade_profissional={...q.integridade_profissional,apta_resolucao:apta,correcao_automatica:correca,verificada_individualmente:true}
   q.elegibilidade={...q.elegibilidade,elegivel_para_resolucao:apta,elegivel_para_correcao_automatica:correca}
   aplicados.push({id:q.id,numero:q.numero_original,antes,depois:{materia:q.materia,conteudo:q.conteudo,tipo_resposta:q.tipo_resposta},evidencia});mudou=true
  }
  if(q.classificacao_pendente)pendentes++;if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 facetas.adicionar(i,questoes)
 if(mudou){const bytes=zlib.gzipSync(JSON.stringify(questoes),{level:9}),arquivo=`lotes/revisao-semantica-v24-${i}-${sha(bytes).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,arquivo),bytes);alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:questoes.length,sha256:sha(bytes)});lote.arquivo=arquivo}
}
if(aplicados.length!==decisoes.size)throw Error(`Esperadas ${decisoes.size} decisões, aplicadas ${aplicados.length}`)
const filtro=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9}),filtroArquivo=`lotes/filtros-revisao-semantica-v24-${sha(filtro).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,filtroArquivo),filtro);manifesto.indice_facetas={arquivo:filtroArquivo,sha256:sha(filtro),versao:1}
manifesto.questoes_disponiveis_resolucao=disponiveis;manifesto.questoes_indisponiveis_revisao=total-disponiveis;manifesto.gerado_em=new Date().toISOString()
manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v24',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+aplicados.length}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
const resumo={gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis,pendentes,classificadas_individualmente:aplicados.length,lotes_alterados:alterados.length,decisoes:aplicados,alteracoes:alterados,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(resumo,null,2));console.log(JSON.stringify({total,disponiveis,pendentes,classificadas:aplicados.length,lotes:alterados.length},null,2))
