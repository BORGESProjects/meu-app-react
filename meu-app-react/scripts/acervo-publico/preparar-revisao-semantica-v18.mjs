import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {classificarObjetoExplicito} from './classificar_objeto_explicito.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const aprovacoes = new Map([
 ['extr-6c2d30a6a2f846bf6f2d',['Português','Reescrita de frases e substituição de palavras','O item avalia correção e preservação de sentido em uma reformulação explícita.']],
 ['extr-6bd0eb1eda93ae8cac4e',['Português','Semântica: sentido das palavras e expressões','O comando pergunta pelo emprego de “padrão” como sinônimo de “análogo”.']],
 ['extr-71833cb6cbaecdda8256',['Português','Verbos: tempos, modos e vozes verbais','O objeto é o efeito aspectual do pretérito imperfeito em duas formas verbais.']],
 ['extr-a55a2b64095abccdf930',['Português','Crase','O enunciado trata expressamente do sinal indicativo de crase.']],
 ['extr-9807778e0b131363beaf',['Português','Reescrita de frases e substituição de palavras','A tarefa compara uma reformulação proposta e seus efeitos gramaticais e semânticos.']],
 ['extr-77ad4fa8c2a16dfbe6e7',['Português','Reescrita de frases e substituição de palavras','O item avalia a inserção de oração e os efeitos de correção e sentido.']],
 ['extr-d0556294e71719c35e7a',['Português','Coesão e referenciação','O comando identifica o antecedente de uma expressão referencial.']],
 ['extr-76db51383beea3a32c0e',['Português','Semântica: sentido das palavras e expressões','O item pergunta pelo sentido contextual de “cornucópia”.']],
 ['extr-011499dc40129fc8d2c0',['Português','Semântica: sentido das palavras e expressões','O item compara o sentido contextual de “disseminada” com “aceita”.']],
 ['extr-f6323f545bc51d3bc82f',['Administração','Gestão de pessoas: recrutamento e seleção','O objeto é a vantagem do recrutamento interno; a menção a cultura aparece na justificativa como consequência.']],
 ['extr-e580a4f1523d62920e8a',['Arquivologia','Gestão documental: classificação e temporalidade','O item trata dos prazos de guarda previstos em tabela de temporalidade.']],
 ['extr-ef832f1bade07a88422a',['Português','Pontuação: emprego da vírgula','O objeto é a retirada de vírgulas que isolam expressão adverbial.']],
 ['extr-97e059803d37b685d428',['Arquivologia','Gestão documental: classificação e temporalidade','A proposição examina as funções da tabela de temporalidade documental.']],
 ['extr-c1f617172e257710a167',['Informática','Bancos de dados: modelos NoSQL e distribuídos','O item compara diretamente bancos NoSQL e relacionais.']],
 ['extr-5d53c161cd14a3d06ea4',['Informática','Segurança da informação: ameaças e proteção','O item avalia risco de ransomware e estratégia de cópias de segurança.']],
 ['extr-985ccd284bf25d8648f0',['Administração','Gestão da qualidade: ferramentas e melhoria contínua','O ciclo PDCA é explicitamente relacionado à melhoria contínua de processos.']],
 ['extr-44e6d4fd7238ba619bf3',['Arquivologia','Gestão documental: classificação e temporalidade','O enunciado trata da gestão de classes e temporalidade em SIGAD.']],
 ['extr-276440e27ac3ffccec2c',['Administração','Gestão de projetos: adaptação e tailoring','O item trata da adaptação do PMO a contexto, complexidade e objetivos do projeto.']],
])

const nome='revisao-semantica-v18'
const destino=path.resolve(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json',raizesAtuais))
const hash=b=>createHash('sha256').update(b).digest('hex')
const facetas=criarIndiceFacetas(),historico=[],alterados=[]
let total=0,pendentes=0,disponiveis=0
for(let i=0;i<manifesto.lotes.length;i++){
 const lote=manifesto.lotes[i]
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,raizesAtuais)))
 let mudou=false
 for(const q of qs){
  total++
  const decisao=aprovacoes.get(q.id)
  if(decisao){
   if(!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false)throw Error(`Estado inesperado para ${q.id}`)
   const proposta=classificarObjetoExplicito(q)
   if(!proposta)throw Error(`Regra automática não confirmou a revisão manual: ${q.id}`)
   const anterior={materia:q.materia,conteudo:q.conteudo}
   q.materia=decisao[0];q.conteudo=decisao[1];q.classificacao_pendente=false
   q.classificacao_confianca=0.98
   q.classificacao_metodo='Revisão semântica individual do enunciado e conferência da evidência; gabarito não avaliado'
   q.classificacao_evidencia=decisao[2]
   q.classificacao_revisada={justificativa:decisao[2],sha256_enunciado:hash(Buffer.from(q.enunciado||''))}
   for(const [obj,chave] of [[q.integridade_profissional,'pendencias'],[q.elegibilidade,'apontamentos']])if(obj?.[chave])obj[chave]=obj[chave].filter(p=>p!=='classificacao_especifica_pendente')
   historico.push({id:q.id,antes:anterior,depois:{materia:q.materia,conteudo:q.conteudo},justificativa:decisao[2]})
   mudou=true
  }
  if(q.classificacao_pendente)pendentes++
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 facetas.adicionar(i,qs)
 if(mudou){
  const bytes=zlib.gzipSync(JSON.stringify(qs),{level:9})
  const arquivo=`lotes/revisao-semantica-v18-${i}-${hash(bytes).slice(0,12)}.json.gz`
  await fs.writeFile(path.join(destino,arquivo),bytes)
  alterados.push({indice:i,anterior:lote.arquivo,arquivo,quantidade:qs.length,sha256:hash(bytes)})
  lote.arquivo=arquivo
 }
}
if(historico.length!==aprovacoes.size)throw Error(`Esperadas ${aprovacoes.size} decisões, encontradas ${historico.length}`)
const filtro=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9})
const filtroArquivo=`lotes/filtros-revisao-semantica-v18-${hash(filtro).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,filtroArquivo),filtro)
manifesto.indice_facetas={arquivo:filtroArquivo,sha256:hash(filtro),versao:1}
manifesto.questoes_disponiveis_resolucao=disponiveis
manifesto.questoes_indisponiveis_revisao=total-disponiveis
manifesto.gerado_em=new Date().toISOString()
manifesto.revisao_profissional={...manifesto.revisao_profissional,revisao_individual_concluida:false,ultima_revisao:'v18',itens_classificados_individualmente:(manifesto.revisao_profissional?.itens_classificados_individualmente||0)+historico.length}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',raizesAtuais))
await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
const relatorio={gerado_em:manifesto.gerado_em,pacote:nome,total,disponiveis,pendentes,classificadas_individualmente:historico.length,lotes_alterados:alterados.length,decisoes:historico,alteracoes:alterados,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify({total,disponiveis,pendentes,classificadas:historico.length,lotes:alterados.length,arquivos:alterados.map(x=>x.arquivo),filtroArquivo},null,2))
