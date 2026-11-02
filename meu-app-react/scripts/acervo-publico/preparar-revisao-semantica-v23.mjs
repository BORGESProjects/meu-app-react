import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-semantica-v23'
const destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const sha=value=>createHash('sha256').update(value).digest('hex')
const decisoes=new Map([
 ['extr-9ae2cfa770362c1d5dcb',['Administração','Gestão de pessoas: recrutamento e seleção','O enunciado trata diretamente da adequação de testes práticos durante a seleção de profissionais.']],
 ['extr-c8dfc8651799430cc734',['Administração','Gestão de pessoas: recrutamento e seleção','O índice de seleção é apresentado no contexto de candidatos e vagas em processo seletivo.']],
 ['extr-431b204fca378828a68e',['Português','Reescrita de frases: substituição verbal e correção gramatical','O comando avalia explicitamente a substituição de forma verbal e a preservação de sentido e correção.']],
 ['extr-1fd24df9a95ceb518223',['Português','Reescrita de frases: substituição verbal e correção gramatical','O comando compara uma reescrita com o período original e cobra sentido e correção gramatical.']],
 ['extr-f7ca43254b8165105b3f',['Português','Reescrita de frases: voz passiva e equivalência verbal','A questão pede equivalência entre forma pronominal e locução de voz passiva.']],
 ['extr-7df125bfb05399d0a51b',['Português','Crase: emprego do acento indicativo','O item pergunta se a retirada do acento grave preserva correção e sentido.']],
 ['extr-d3d56695fb712d5371f8',['Português','Colocação pronominal: próclise','O item identifica a posição do pronome e a atração exercida por palavra negativa.']],
 ['extr-06eacc626386eb900c0b',['Português','Reescrita de frases: substituição de conjunção','O comando verifica a troca de uma oração condicional por expressão temporal.']],
 ['extr-3db5752ee0be8a1a38f2',['Português','Semântica lexical: sinonímia em contexto','O item avalia a substituição de advérbio por expressão de sentido equivalente.']],
 ['extr-2e1e5d5a71c8982c7aa1',['Português','Pontuação: emprego da vírgula','O enunciado avalia o efeito da supressão de vírgula na correção e coerência.']],
 ['extr-dcc227b15c55c4e23b6e',['Português','Crase: emprego do acento indicativo','O item avalia a obrigatoriedade do acento grave diante de termo feminino.']],
 ['extr-5e32b547b109c71646b3',['Português','Conjunções: relações semânticas','O enunciado compara o valor semântico de “onde” e de uma conjunção causal.']],
 ['extr-fadd49d750e4ddc56665',['Português','Conjunções: relações concessivas','A questão cobra a equivalência entre “embora” e uma locução concessiva.']],
 ['extr-ea929e9896209762aece',['Português','Coesão textual: referenciação adverbial','O item solicita o referente de um advérbio demonstrativo no texto.']],
 ['extr-ee688937895052294b43',['Administração','Teorias administrativas: administração científica','O enunciado associa estudo de tempos e movimentos à escola da administração científica.']],
 ['extr-cdb46b35deead7e02b35',['Administração','Teorias administrativas: abordagem contingencial','A comparação entre teoria clássica e contingencial é o objeto direto do item.']],
 ['extr-ead0c31f934ad010ea33',['Administração','Planejamento estratégico: Balanced Scorecard','O enunciado cobra as perspectivas do BSC e a perspectiva ambiental.']],
 ['extr-d87e2d88f7bc8c1692c1',['Administração','Gestão de projetos: abordagem preditiva em cascata','A questão caracteriza diretamente a sequência de execução da metodologia cascata.']],
 ['extr-77cad2d8095ac0c3dc11',['Administração','Gestão por processos: integração entre áreas','O enunciado relaciona gestão por processos à redução de barreiras entre áreas.']],
 ['extr-b9d8d58ddf7fc105d287',['Administração','Gestão de projetos: indicadores de desempenho','O item discute indicadores de desempenho no contexto do gerenciamento de projetos.']],
 ['extr-9884bba686cd07d16c06',['Administração','Teorias administrativas: relações humanas e teoria clássica','O enunciado compara explicitamente a abordagem das relações humanas com a teoria clássica.']],
 ['extr-c0ac37a1c7957c8aee6e',['Administração','Gestão de pessoas: avaliação de desempenho 360 graus','A questão trata das fontes de informação e dos custos da avaliação 360 graus.']],
 ['extr-f4f711d691fbbe470931',['Arquivologia','Arquivos permanentes: recolhimento e destinação','O item pergunta quais documentos devem integrar o arquivo permanente.']],
 ['extr-d6c367644256e90a3add',['Administração','Planejamento estratégico: Balanced Scorecard','O item identifica a perspectiva de processos internos no BSC.']],
 ['extr-f1665005826aeb81d23c',['Informática','Desenvolvimento web: biblioteca React e renderização','O enunciado caracteriza React como biblioteca JavaScript baseada em componentes e menciona renderização no servidor.']],
 ['extr-2e7236a3f314197ce72c',['Informática','Desenvolvimento de software: arquitetura Java EE em camadas','O objeto explícito é o padrão Fachada na arquitetura de aplicações Java EE.']],
 ['extr-e928b1c72ac674dc0ed3',['Administração','Gestão de pessoas: avaliação de desempenho','O item trata da coleta periódica de dados sobre o desempenho de colaboradores.']],
 ['extr-ad3d6a9b6ff400107415',['Administração','Gestão de pessoas: gestão por competências','O enunciado aborda a definição de objetivos na implantação da gestão por competências.']],
 ['extr-300ff5a50afb38c62439',['Administração','Planejamento estratégico: análise SWOT','O item identifica oportunidades e ameaças como elementos do ambiente externo na matriz SWOT.']],
])

if(!destino.startsWith(path.resolve('tmp')+path.sep))throw Error('Destino fora da área temporária')
await fs.rm(destino,{recursive:true,force:true})
await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json',raizesAtuais))
const facetas=criarIndiceFacetas(),alterados=[],aplicados=[]
let total=0,pendentes=0,disponiveis=0
for(let i=0;i<manifesto.lotes.length;i++){
 const lote=manifesto.lotes[i],questoes=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,raizesAtuais)))
 let mudou=false
 for(const q of questoes){
  total++
  const decisao=decisoes.get(q.id)
  if(decisao){
   if(!q.classificacao_pendente||q.documento_auxiliar||!Array.isArray(q.opcoes)||q.opcoes.length!==2||!/^certo$/iu.test(q.opcoes[0])||!/^errado$/iu.test(q.opcoes[1]))throw Error(`Questão inelegível ou fora do formato C/E: ${q.id}`)
   const antes={materia:q.materia,conteudo:q.conteudo}
   const evidencia=decisao[2]
   // Muitos itens objetivos CEBRASPE herdaram “discursiva” de um documento fonte que contém rubrica de redação. As duas opções C/E confirmam a modalidade objetiva deste item.
   q.tipo_resposta='certo_errado'
   q.materia=decisao[0];q.conteudo=decisao[1];q.classificacao_pendente=false
   q.classificacao_confianca=0.94
   q.classificacao_metodo='Revisão semântica manual de candidatos explícitos; assunto delimitado ao objeto cobrado'
   q.classificacao_evidencia=evidencia
   q.classificacao_revisada={justificativa:evidencia,sha256_enunciado:sha(Buffer.from(q.enunciado||''))}
   for(const [obj,chave] of [[q.integridade_profissional,'pendencias'],[q.elegibilidade,'apontamentos']])if(obj?.[chave])obj[chave]=obj[chave].filter(item=>!['classificacao_especifica_pendente','discursiva_fora_do_escopo'].includes(item))
   const pendencias=q.integridade_profissional?.pendencias||[]
   const apta=!pendencias.some(item=>/enunciado_ausente|alternativas_invalida|alternativa_vazia|discursiva_|multiplas_questoes|texto_corrompido|texto_de_outro_bloco|visual_ausente|documento_auxiliar/u.test(item))
   const correcao=apta&&!q.anulada&&(q.resposta_correta!=null||q.resposta_soma!=null||q.gabarito_oficial)
   q.integridade_profissional={...q.integridade_profissional,apta_resolucao:apta,correcao_automatica:correcao,verificada_individualmente:true}
   q.elegibilidade={...q.elegibilidade,elegivel_para_resolucao:apta,elegivel_para_correcao_automatica:correcao}
   aplicados.push({id:q.id,numero:q.numero_original,antes,depois:{materia:q.materia,conteudo:q.conteudo},evidencia})
   mudou=true
  }
  if(q.classificacao_pendente)pendentes++
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 facetas.adicionar(i,questoes)
 if(mudou){
  const bytes=zlib.gzipSync(JSON.stringify(questoes),{level:9})
  const arquivo=`lotes/revisao-semantica-v23-${i}-${sha(bytes).slice(0,12)}.json.gz`
  await fs.writeFile(path.join(destino,arquivo),bytes)
  alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:questoes.length,sha256:sha(bytes)})
  lote.arquivo=arquivo
 }
}
if(aplicados.length!==decisoes.size)throw Error(`Esperadas ${decisoes.size} decisões, aplicadas ${aplicados.length}`)
const filtro=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9})
const filtroArquivo=`lotes/filtros-revisao-semantica-v23-${sha(filtro).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,filtroArquivo),filtro)
manifesto.indice_facetas={arquivo:filtroArquivo,sha256:sha(filtro),versao:1}
manifesto.questoes_disponiveis_resolucao=disponiveis;manifesto.questoes_indisponiveis_revisao=total-disponiveis;manifesto.gerado_em=new Date().toISOString()
manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v23',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+aplicados.length}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais))
await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
const resumo={gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis,pendentes,classificadas_individualmente:aplicados.length,lotes_alterados:alterados.length,decisoes:aplicados,alteracoes:alterados,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(resumo,null,2))
console.log(JSON.stringify({total,disponiveis,pendentes,classificadas:aplicados.length,lotes:alterados.length},null,2))
