// Revisão por leitura do item. Não altera enunciados, alternativas ou gabaritos.
import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
const revisoes = new Map([
 ['extr-86438e04bc61d7b017b0',['Direito Administrativo','Conciliação e arbitragem na Administração Pública','A controvérsia envolve órgão municipal, autarquia federal e a Câmara de Conciliação da Administração Federal.']],
 ['extr-24569918d4f3aa0e89dd',['Direito Administrativo','Forma dos atos administrativos','O item pergunta pela forma de um ato de indeferimento: resolução ou despacho.']],
 ['extr-0df90bd74f46c6d70906',['Direito Administrativo','Poder regulamentar e controle legislativo','O item trata da sustação de portaria ministerial por exorbitância do poder regulamentar.']],
 ['extr-a3e17d0243da6cb7ab08',['Direito Constitucional','Repartição de competências legislativas','A questão examina a competência estadual para disciplinar procedimento processual.']],
 ['extr-98362f9a403a3542fad9',['Direito Constitucional','Repartição de competências legislativas','O item discute a constitucionalidade de restrições estaduais ao comércio e transporte de produtos importados.']],
 ['extr-26d6d2d161b9ac0300fe',['Administração Pública','Despesa pública: empenho, liquidação e pagamento','O objeto é a anulação de empenho e sua modalidade global.']],
 ['extr-ad24a68b9e17f59cb258',['Administração Pública','Despesa pública: empenho, liquidação e pagamento','O item discute a modalidade de empenho em contratos de obras com medição.']],
 ['extr-e9f1e481015950b6103b',['Administração Pública','Despesa pública: empenho, liquidação e pagamento','A obrigação de atestar a prestação do serviço caracteriza a discussão sobre estágios da despesa, não sobre direitos do servidor.']],
 ['extr-d14909ec257b3cf97421',['Direito Econômico','Infrações à ordem econômica e posição dominante','O item define domínio de mercado relevante e eficiência competitiva.']],
 ['extr-f7aaa0c9cbeb9bcdd473',['Direito Econômico','Infrações à ordem econômica e posição dominante','O item discute dolo na infração por abuso de posição dominante.']],
 ['extr-d4b87c0569ea8bb23c3a',['Direito Ambiental','Responsabilidade civil e administrativa ambiental','O objeto é a recomposição ambiental pelo proprietário sucessor e a distinção entre responsabilidades ambientais.']],
])
const base=path.resolve('tmp/revisao-profissional/acervo-extraido')
const destino=path.resolve('tmp/revisao-profissional/revisao-dirigida/acervo-extraido')
await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const manifesto=JSON.parse(await fs.readFile(path.join(base,'manifesto.json')))
const hash=b=>createHash('sha256').update(b).digest('hex')
const indice=criarIndiceFacetas(),historico=[]
let pendentes=0,total=0,disponiveis=0
for(const [i,lote] of manifesto.lotes.entries()){
 const questoes=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(base,lote.arquivo))))
 let alterado=false
 for(const q of questoes){
  const revisao=revisoes.get(q.id)
  if(revisao){
   historico.push({id:q.id,antes:{materia:q.materia,conteudo:q.conteudo},depois:{materia:revisao[0],conteudo:revisao[1]},justificativa:revisao[2],sha256_enunciado:hash(q.enunciado)})
   q.materia=revisao[0];q.conteudo=revisao[1];q.classificacao_pendente=false
   q.classificacao_metodo='Revisão dirigida do enunciado; sem julgamento do gabarito ou atestado de completude'
   q.classificacao_revisada={justificativa:revisao[2],sha256_enunciado:hash(q.enunciado)}
   q.integridade_profissional.pendencias=q.integridade_profissional.pendencias.filter(p=>p!=='classificacao_especifica_pendente')
   q.elegibilidade.apontamentos=q.elegibilidade.apontamentos.filter(p=>p!=='classificacao_especifica_pendente')
   alterado=true
  }
  if(q.id==='extr-e0161eaab1e33b06bbc5'){
   // O enunciado inclui o início de outro bloco após o primeiro item.
   q.integridade_profissional.apta_resolucao=false
   q.integridade_profissional.correcao_automatica=false
   q.integridade_profissional.pendencias.push('texto_de_outro_bloco_no_enunciado')
   q.elegibilidade.elegivel_para_resolucao=false
   q.elegibilidade.elegivel_para_correcao_automatica=false
   q.elegibilidade.apontamentos.push('texto_de_outro_bloco_no_enunciado')
   alterado=true
  }
  total++;if(q.classificacao_pendente)pendentes++
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 indice.adicionar(i,questoes)
 if(alterado){
  const bytes=zlib.gzipSync(JSON.stringify(questoes),{level:9})
  lote.arquivo=`lotes/revisao-dirigida-${i}-${hash(bytes).slice(0,12)}.json.gz`
  await fs.writeFile(path.join(destino,lote.arquivo),bytes)
 }
}
if(historico.length!==revisoes.size)throw Error('A revisão não encontrou todos os IDs esperados')
const bytes=zlib.gzipSync(JSON.stringify(indice.finalizar()),{level:9})
const arquivo=`lotes/indice-filtros-dirigido-${hash(bytes).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,arquivo),bytes)
manifesto.indice_facetas={arquivo,sha256:hash(bytes),versao:1}
manifesto.questoes_disponiveis_resolucao=disponiveis
manifesto.questoes_indisponiveis_revisao=total-disponiveis
manifesto.gerado_em=new Date().toISOString()
await fs.copyFile(path.join(base,'visuais.json'),path.join(destino,'visuais.json'))
await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(manifesto))
await fs.writeFile('docs/acervo/revisao-profissional/revisao-dirigida.json',JSON.stringify({gerado_em:manifesto.gerado_em,total,disponiveis,pendentes_complementar:pendentes,revisoes:historico,quarentena:['extr-e0161eaab1e33b06bbc5'],publicado:false},null,2))
console.log(JSON.stringify({total,disponiveis,pendentes,revisadas:historico.length,destino}))
