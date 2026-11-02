import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {classificarPeloComando} from '../../src/classificacaoPorComando.js'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {blocosValidos} from '../../src/blocosQuestao.js'
const base=path.resolve('tmp/revisao-profissional/acervo-extraido')
const anterior=path.resolve('tmp/revisao-profissional/revisao-dirigida/acervo-extraido')
const destino=path.resolve('tmp/revisao-profissional/revisao-comandos/acervo-extraido')
await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
const m=JSON.parse(await fs.readFile(path.join(anterior,'manifesto.json')))
const sha=b=>createHash('sha256').update(b).digest('hex')
const el=(tag,...children)=>({tag,children})
const fonte='paginas/e1ae2fce531ca12d-0003.webp'
const imagemSHA=sha(await fs.readFile(path.join('public/acervo-extraido',fonte)))
const correcoes=new Map([
 ['extr-796e50606d0812b456ce',{conteudo:'Estatística: média, moda e mediana',opcoes:['8,59','9,15','9,96','8,35','8,15'],dificuldade_justificativa:'Combina leitura de gráfico, média ponderada, moda e mediana.'}],
 ['extr-b7c313723446dfdd5609',{conteudo:'Polinômios: relações entre coeficientes e raízes',enunciado:'As raízes do polinômio p(x) = 2x³ − mx² + 17x − 6 são a, b e 2, com a > b. Nesse caso, é correto afirmar que aᵇ é igual a:',opcoes:['1','√2','2','√3','4'],dificuldade_justificativa:'Exige usar a raiz conhecida, determinar as outras raízes e calcular uma potência.'}],
 ['extr-ab8417aab21a33f9e63c',{conteudo:'Geometria espacial: posições relativas de retas e planos',enunciado:'Observe o paralelepípedo ABCDEFGH na figura. Marque a única alternativa correta entre as afirmações abaixo:',opcoes:['As retas BE e FG são coplanares.','Os vértices A, B e G não definem um plano.','As retas BC e EF são ortogonais.','As retas AE e BF são reversas.','Os vértices C, E, H e G pertencem a um mesmo plano.'],dificuldade_justificativa:'Exige leitura espacial e distinção entre coplanaridade, ortogonalidade e retas reversas.'}],
 ['extr-8e85769357be4c31495b',{conteudo:'Probabilidade: eventos dependentes',opcoes:['44/663','45/663','176/663','48/663','50/663'],blocos_opcoes:[44,45,176,48,50].map(n=>[el('math',el('mfrac',el('mn',String(n)),el('mn','663')))]),dificuldade_justificativa:'Combina duas retiradas sucessivas e simplificação de frações.'}],
])
const indice=criarIndiceFacetas(),mudancas=[]
let classificadas=0,transcritas=0,pendentes=0,disponiveis=0
for(const [i,lote]of m.lotes.entries()){
 const bytes=await fs.readFile(path.join(anterior,lote.arquivo)).catch(e=>{if(e.code==='ENOENT')return fs.readFile(path.join(base,lote.arquivo));throw e})
 const qs=JSON.parse(zlib.gunzipSync(bytes));let alterado=false
 for(const q of qs){
  const antes={materia:q.materia,conteudo:q.conteudo,opcoes:q.opcoes,enunciado:q.enunciado,dificuldade:q.dificuldade}
  let tipo=''
  if(q.classificacao_pendente&&!q.classificacao_fonte?.materia&&!q.classificacao_revisada&&q.integridade_profissional?.apta_resolucao!==false){
   const c=classificarPeloComando(q)
   if(c){q.materia=c.materia;q.conteudo=c.conteudo;q.classificacao_confianca=c.confianca;q.classificacao_metodo=c.metodo;q.classificacao_evidencia=c.evidencia;q.classificacao_pendente=false;classificadas++;tipo='comando_explicitado'}
  }
  if(correcoes.has(q.id)){
   Object.assign(q,correcoes.get(q.id),{materia:'Matemática',ano:2026,dificuldade:'Média',dificuldade_estimada:true,classificacao_pendente:false})
   q.revisao_visual={fonte,sha256:imagemSHA,metodo:'Leitura visual individual da página 3 da prova ESA Música 2026 tipo A; sem inventar gabarito.'}
   if(q.blocos_opcoes&&!q.blocos_opcoes.every(blocosValidos))throw Error('Fórmula inválida: '+q.id)
   transcritas++;tipo='transcricao_visual'
  }
  if(tipo){
   q.integridade_profissional.pendencias=q.integridade_profissional.pendencias.filter(p=>p!=='classificacao_especifica_pendente')
   q.elegibilidade.apontamentos=q.elegibilidade.apontamentos.filter(p=>p!=='classificacao_especifica_pendente')
   mudancas.push({id:q.id,tipo,antes,depois:{materia:q.materia,conteudo:q.conteudo,opcoes:q.opcoes,enunciado:q.enunciado,dificuldade:q.dificuldade},evidencia:q.classificacao_evidencia,revisao_visual:q.revisao_visual});alterado=true
  }
  if(q.classificacao_pendente)pendentes++
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
 }
 indice.adicionar(i,qs)
 if(alterado){const b=zlib.gzipSync(JSON.stringify(qs),{level:9});lote.arquivo=`lotes/comandos-${i}-${sha(b).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,lote.arquivo),b)}
}
if(transcritas!==4)throw Error('Transcrições incompletas')
const b=zlib.gzipSync(JSON.stringify(indice.finalizar()),{level:9}),arquivo=`lotes/filtros-comandos-${sha(b).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,arquivo),b)
m.indice_facetas={arquivo,sha256:sha(b),versao:1};m.gerado_em=new Date().toISOString();m.questoes_disponiveis_resolucao=disponiveis
await fs.copyFile(path.join(base,'visuais.json'),path.join(destino,'visuais.json'))
await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(m))
const resumo={gerado_em:m.gerado_em,classificadas,transcritas,pendentes,disponiveis,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/revisao-comandos.json',JSON.stringify(resumo,null,2))
await fs.writeFile('docs/acervo/revisao-profissional/revisao-comandos-alteracoes.json.gz',zlib.gzipSync(JSON.stringify(mudancas)))
console.log(JSON.stringify(resumo))
