import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-semantica-v25',destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const sha=value=>createHash('sha256').update(value).digest('hex')
const decisoes=new Map([
 ['extr-63e9e18e50d20db0760b',['Administração','Liderança: estilos e teorias contingenciais','O item identifica o estilo de liderança a partir da distribuição de tarefas e da autonomia dos subordinados.']],
 ['extr-54a68df0665052b51f60',['Administração','Gestão da qualidade: diagrama de Pareto','O enunciado identifica o gráfico de Pareto e cobra sua ordenação e uso na priorização.']],
 ['extr-71c6fa23b427b21b5453',['Serviço Social','Estudo social: registro e sigilo profissional','A questão trata do registro e do sigilo das informações obtidas em estudo social interdisciplinar.']],
 ['extr-ed9e7f36bd1fa3e71746',['Serviço Social','Parecer social: avaliação sociojurídica e adoção','O parecer social em processo de adoção e a atuação do assistente social são o objeto explícito.']],
 ['extr-dd22fb733c5bb607b87a',['Serviço Social','Estudo social no campo sociojurídico','O item aborda a finalidade do estudo social e a atuação profissional no campo sociojurídico.']],
 ['extr-a5f8c0ab8e4554b8b854',['Serviço Social','Parecer social: elaboração e identificação profissional','A questão trata da autoria, identificação e registro profissional em parecer social.']],
 ['extr-6a63491ed1a7d95131ca',['Português','Crase: emprego do acento indicativo','O item avalia a retirada do acento grave em locução que exige análise de regência e crase.']],
 ['extr-dbdd922834f9a9c8a79a',['Português','Coesão textual: referenciação pronominal','A questão solicita identificar o referente textual de uma expressão pronominal.']],
 ['extr-fcd397404951ddb860bf',['Administração','Liderança: teorias contingenciais e caminho-meta','O item descreve a aceitação da liderança como meio de satisfação de necessidades, conceito de abordagem contingencial.']],
 ['extr-28ece368b7b87a25f213',['Administração','Gestão de pessoas: recrutamento interno','O enunciado trata dos mecanismos de recrutamento interno e da integração com as áreas de lotação.']],
 ['extr-7e48806d2b572ac1fe54',['Informática','Engenharia de software: modelo MPS.BR','O item nomeia o MPS.BR e distingue processos de engenharia e de desenvolvimento de software.']],
 ['extr-c54b86875cf15afcd5bd',['Informática','Banco de dados: modelo relacional e álgebra relacional','A definição apresentada trata explicitamente de SGBD relacional e operações da álgebra relacional.']],
 ['extr-2131346d90aa9a5af7d6',['Informática','Banco de dados: normalização e formas normais','O item descreve normalização de dados, entidades e redução de redundância no modelo relacional.']],
 ['extr-d9e6183f65ce20cc2051',['Informática','Governança de TI: gestão de portfólio com COBIT','O enunciado compara o COBIT à gestão de projetos, programas e portfólios de TI.']],
 ['extr-eeec4778772a3e395eaa',['Informática','Governança de TI: processos de risco do COBIT','A questão associa diretamente um processo do COBIT à avaliação e ao monitoramento de riscos.']],
 ['extr-c0fbfe8ec61cd7c68888',['Administração','Gestão de pessoas: avaliação de desempenho','O enunciado trata da avaliação de desempenho e de sua relação com os requisitos dos cargos.']],
 ['extr-5f0dda0f47934c37552c',['Administração','Gestão de pessoas: avaliação por competências','O item relaciona avaliação de desempenho a competências profissionais.']],
 ['extr-9de6b9758190bd7cd798',['Administração','Gestão de pessoas: indicadores de desempenho','O enunciado aborda a função dos indicadores na gestão e avaliação de desempenho.']],
 ['extr-437f6cef67e464fcc7be',['Administração','Gestão de projetos: planejamento, delegação e controle','O texto descreve práticas do ciclo de gerenciamento e controle de projetos organizacionais.']],
 ['extr-b26bfd7d0b0ecd2ef2f7',['Informática','Redes sem fio: protocolos WEP e WPA2','A questão compara diretamente os mecanismos de autenticação e segurança WEP e WPA2.']],
 ['extr-4c5aeef96106ffc6c94e',['Informática','Programação: linguagem Python e execução de código','O enunciado contém código Python e cobra o resultado de sua execução.']],
 ['extr-b1909b7bb78a93304b7b',['Arquivologia','Gestão documental: produção, utilização e destinação','O enunciado descreve as fases do ciclo de gestão de documentos arquivísticos.']],
])
const anos=new Map([
 ['extr-a1308b022118ee1a594f',2014],['extr-d67c2df7c8d9135995da',2014],['extr-2c1d20a6312f864264af',2014],['extr-0f2e4f958cd20f5829d2',2014],['extr-4f9eae537f09269368e2',2014],['extr-0956def558399166c972',2014],['extr-2d3123f9ad98eac1b129',2014],['extr-6eeb99fd91925d424a5c',2014],['extr-38e42ff393e4709f1a16',2014],['extr-051197ee782a656397bf',2014],['extr-c91185aa632f19b9c542',2014],
])

if(!destino.startsWith(path.resolve('tmp')+path.sep))throw Error('Destino fora da área temporária')
await fs.rm(destino,{recursive:true,force:true});await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json',raizesAtuais)),facetas=criarIndiceFacetas(),alterados=[],aplicados=[],anosAplicados=[]
let total=0,pendentes=0,disponiveis=0
for(let i=0;i<manifesto.lotes.length;i++){
 const lote=manifesto.lotes[i],questoes=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,raizesAtuais)));let mudou=false
 for(const q of questoes){
  total++;const decisao=decisoes.get(q.id),ano=anos.get(q.id)
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
  if(ano){if(q.ano)throw Error(`Ano já preenchido; exige conferência: ${q.id}`);q.ano=ano;anosAplicados.push({id:q.id,ano,evidencia:'Texto-base e cabeçalho do caderno: Ministério da Cultura, Concurso Público/FUNARTE 2014.'});mudou=true}
  if(q.classificacao_pendente)pendentes++;if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 facetas.adicionar(i,questoes)
 if(mudou){const bytes=zlib.gzipSync(JSON.stringify(questoes),{level:9}),arquivo=`lotes/revisao-semantica-v25-${i}-${sha(bytes).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,arquivo),bytes);alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:questoes.length,sha256:sha(bytes)});lote.arquivo=arquivo}
}
if(aplicados.length!==decisoes.size||anosAplicados.length!==anos.size)throw Error(`Decisões esperadas/aplicadas: ${decisoes.size}/${aplicados.length}; anos: ${anos.size}/${anosAplicados.length}`)
const filtro=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9}),filtroArquivo=`lotes/filtros-revisao-semantica-v25-${sha(filtro).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,filtroArquivo),filtro);manifesto.indice_facetas={arquivo:filtroArquivo,sha256:sha(filtro),versao:1}
manifesto.questoes_disponiveis_resolucao=disponiveis;manifesto.questoes_indisponiveis_revisao=total-disponiveis;manifesto.gerado_em=new Date().toISOString()
manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v25',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+aplicados.length}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
const resumo={gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis,pendentes,classificadas_individualmente:aplicados.length,anos_recuperados:anosAplicados.length,lotes_alterados:alterados.length,decisoes:aplicados,anos:anosAplicados,alteracoes:alterados,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(resumo,null,2));console.log(JSON.stringify({total,disponiveis,pendentes,classificadas:aplicados.length,anos:anosAplicados.length,lotes:alterados.length},null,2))
