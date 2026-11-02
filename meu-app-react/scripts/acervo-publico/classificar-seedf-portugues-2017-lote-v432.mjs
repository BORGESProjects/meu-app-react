import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='classificar-seedf-portugues-2017-lote-v432'
const doc='c326315a1e354974'
const fonte='https://cdn.cebraspe.org.br/concursos/SEE_16_DF/arquivos/290_SEEDF_021_01.pdf'
const concurso='SEE/DF 2016 — Professor de Educação Básica — Língua Portuguesa'
const classificacoes={
 'extr-59aa7a022701d9eaca9d':['Língua Portuguesa','Funções da linguagem: identificação da função fática no texto','Média'],
 'extr-022c87e6bb1cb8779df6':['Língua Portuguesa','Sintaxe: relações de oposição, elipse e paralelismo','Difícil'],
 'extr-56d89d6c4f4d339c125d':['Língua Portuguesa','Morfossintaxe: emprego do artigo definido com topônimos','Média'],
 'extr-956e4ba0535d8156e81a':['Língua Portuguesa','Morfologia: conversão de classes gramaticais em contexto','Média'],
 'extr-2568942b0ee929517e1f':['Língua Portuguesa','Formação de palavras: neologismo, composição e cruzamento vocabular','Difícil'],
 'extr-dc4d92adbd465e1fba90':['Língua Portuguesa','Regência verbal: usos do verbo esquecer','Média'],
 'extr-ea67b574497493ed6330':['Língua Portuguesa','Sintaxe: núcleo do sintagma nominal e aposto especificativo','Média'],
 'extr-f1545858a820c388f57b':['Língua Portuguesa','Gêneros e tipologia textual: identificação da sequência argumentativa','Média'],
 'extr-687fb3e457ff56df8558':['Língua Portuguesa','Semântica e coesão: valor aspectual do verbo continuar','Média'],
 'extr-686436d55a68ce4f503f':['Língua Portuguesa','Sintaxe de regência: verbo haver e oração subordinada','Difícil'],
 'extr-3a7bbec6305ed78fde9f':['Língua Portuguesa','Fonética e prosódia: derivação sufixal e acento secundário','Difícil'],
 'extr-a9312554903ff220a83c':['Língua Portuguesa','Morfologia: escopo e ambiguidade na derivação prefixal e sufixal','Difícil'],
 'extr-93ca8e3cf5a3f785215e':['Língua Portuguesa','Fonologia: dígrafos e correspondência entre grafemas e fonemas','Média'],
 'extr-4a10c1d737a13c2e24a3':['Literatura Brasileira','Modernismo: projeto estético e função social da poesia','Média'],
 'extr-f35d0289656e657389c2':['Literatura Brasileira','Modernismo: imagens, antítese e construção do poema Nova Poética','Média'],
 'extr-27bb678088934daee021':['Literatura Brasileira','Modernismo: ruptura com padrões tradicionais de beleza e harmonia','Média'],
 'extr-f17910e9d69af207d587':['Literatura Brasileira','Gêneros literários: predominância lírica e presença de elementos narrativos','Média'],
 'extr-35182d71c33d6a0eb4a8':['Literatura Brasileira','Machado de Assis e Modernismo: diálogo com a tradição literária','Difícil'],
 'extr-2a04bb28e8482794ceb1':['Literatura Brasileira','Crítica literária: fragmentação, elipse e formas narrativas modernas','Difícil'],
 'extr-71005245d06dff38112e':['Literatura Brasileira','Crítica literária: leitura interpretativa da ficção de Machado de Assis','Média']
}
const records=JSON.parse(await fs.readFile('tmp/proxima-fila-revisao.json','utf8'))
if(records.length!==20)throw Error('Fila alterada: esperados 20 itens.')
const decisions=records.map(q=>{const c=classificacoes[q.id];if(!c)throw Error(`Questão sem classificação: ${q.id}`);return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:c[0],conteudo:c[1],ano:2017,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'SEE/DF — aplicação 2017',numero_original:q.numero,dificuldade:c[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial considerando a complexidade linguística, o nível de inferência e a quantidade de conceitos mobilizados; não é uma métrica psicométrica oficial.',classificacao_fonte:fonte,motivo:`Item ${q.numero} do caderno oficial de Língua Portuguesa para Professor da Educação Básica da SEE/DF. Matéria e conteúdo definidos pelo conhecimento avaliado no enunciado e, quando aplicável, no texto-base associado.`,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','classificacao_pendente']}})
if(new Set(decisions.map(x=>x.id)).size!==20)throw Error('IDs duplicados na fila.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,itens:20,classificados_por_materia:new Set(decisions.map(x=>x.materia)).size,concurso,ano:2017,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const rootLine=`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`,rootFile='scripts/acervo-publico/acervo-atual.mjs',rootText=await fs.readFile(rootFile,'utf8')
if(!rootText.includes(rootLine))await fs.appendFile(rootFile,`\n${rootLine}\n`)
const report={...result,documento:doc,concurso,ano:2017,itens_classificados:20,fonte,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
