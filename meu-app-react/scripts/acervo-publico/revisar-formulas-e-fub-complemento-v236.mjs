import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-formulas-fub-complemento-v236'
const prev=raizesAtuais.findIndex(x=>x.includes('revisao-fub-estatistico-2022-v235'))
if(prev<0)throw Error('Base anterior v235 ausente')
const bases=raizesAtuais.slice(prev),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const wanted=new Set(['extr-329e7c8eb1bc125d4a1c','extr-cf429c44ab0a6865bbcd','extr-945c9f80987a381e7ba9','extr-a5bc23a81507e12ffec7','extr-59af3d64492f245a8c5e','extr-b51043d752f1611abf7f','extr-20d444f00fc0065aa0ba'])
const qs=new Map()
for(const lote of manifest.lotes.filter(x=>x.arquivo&&((x.ano===2021&&/telebras/i.test(x.concurso||''))||(x.ano===2022&&/fub/i.test(x.concurso||''))))){
 const chunk=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,bases)))
 for(const q of chunk)if(wanted.has(q.id)){qs.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(wanted.size)throw Error(`Itens a corrigir não encontrados: ${[...wanted].join(', ')}`)
const decisoes=[]
function dec(q,{materia,conteudo,ano,concurso,numero,pagina,documento,prova,texto,contexto,dificuldade='Média'}){
 const img=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano,concurso,numero_original:numero,pagina,dificuldade,dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pela interpretação e manipulação da expressão; não representa índice psicométrico oficial.',
  classificacao_fonte:{documento:documento==='c020f8957d11f9cf'?'678_FUB_007_01.PDF':'657_TELEBRAS_007_01.PDF',prova,metodo:'Conferência da expressão no caderno oficial e classificação conforme o conteúdo programático do cargo.'},
  enunciado:texto,texto_apoio:contexto,visual:{pagina,imagem:img,motivo:`Transcrição dos símbolos conferida visualmente na página ${pagina} da prova oficial; a imagem original permanece vinculada.`},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],apta_resolucao:true,motivo:`Correção de símbolos matemáticos corrompidos após conferência visual da prova; classificação e contexto conferidos individualmente.`})
}
const teleProva='https://cdn.cebraspe.org.br/concursos/telebras_21/arquivos/657_TELEBRAS_007_01.PDF'
const fubProva='https://cdn.cebraspe.org.br/concursos/FUB_22/arquivos/678_FUB_007_01.PDF'
const contexto52='Considerando um título padrão de mercado com pagamento anual de cupom e taxa de juros de 10% ao ano, julgue os itens. O valor de face é 1.000; os fluxos descontados são ponderados pelos períodos e divididos pelo preço do título.'
const contexto56='Em relação à precificação de títulos e ativos, julgue os itens seguintes.'
dec(qs.get('extr-329e7c8eb1bc125d4a1c'),{materia:'Economia',conteudo:'Mercado financeiro: duration de título com cupom e valor presente dos fluxos',ano:2021,concurso:'TELEBRAS 2021 — Especialista em Gestão de Telecomunicações, Cargo 7: Analista Superior, Subatividade Finanças',numero:52,pagina:1,documento:'9a32d70b8f28e262',prova:teleProva,texto:'Se a taxa anual de cupom for de 8%, a duration do título será [(80 ÷ 1,10) + (2 × 80 ÷ 1,10²) + (3 × 1.080 ÷ 1,10³)] ÷ preço do título.',contexto:contexto52,dificuldade:'Difícil'})
dec(qs.get('extr-cf429c44ab0a6865bbcd'),{materia:'Matemática Financeira',conteudo:'Taxas de juros: conversão de taxa nominal mensal em taxa efetiva anual',ano:2021,concurso:'TELEBRAS 2021 — Especialista em Gestão de Telecomunicações, Cargo 7: Analista Superior, Subatividade Finanças',numero:56,pagina:1,documento:'9a32d70b8f28e262',prova:teleProva,texto:'A taxa efetiva anual de um título que paga uma taxa nominal de 12% capitalizada mensalmente será de (1 + 0,12 ÷ 12)¹² − 1.',contexto:contexto56})
const base117='Suponha uma população finita de tamanho N formada por y₁,…,yN, cuja média é μ = (1/N) Σᵢ yᵢ e cuja variância populacional é V² = (1/(N−1)) Σᵢ (yᵢ−μ)², com V > 0. Considere uma amostra aleatória simples sem reposição de tamanho n, Y₁,…,Yn, e a média amostral Ȳ = (1/n) Σₖ Yₖ = (1/n) Σᵢ πᵢyᵢ, em que πᵢ tem distribuição Bernoulli(n/N) e Σᵢπᵢ = n. Julgue os itens 116–120.'
const fubConcurso='FUB 2022 — Cargo 7: Estatístico'
const fubTopics={
 'extr-945c9f80987a381e7ba9':[116,'Probabilidade e amostragem: covariância entre indicadores de inclusão em amostra sem reposição','Se i ≠ j, a covariância entre πᵢ e πⱼ é negativa.'],
 'extr-a5bc23a81507e12ffec7':[117,'Distribuição amostral: esperança da média em amostragem aleatória simples','O valor esperado de Ȳ é igual a μ.'],
 'extr-59af3d64492f245a8c5e':[118,'Distribuição amostral: variância da média e correção para população finita','A variância de Ȳ é igual a (V² ÷ n) × (1 − n ÷ N).'],
 'extr-b51043d752f1611abf7f':[119,'Estimadores: não tendenciosidade da variância amostral corrigida','Se o estimador da variância populacional for S² = [1 ÷ (n − 1)] Σₖ₌₁ⁿ (Yₖ − Ȳ)², então o valor esperado de S² é igual a V².'],
 'extr-20d444f00fc0065aa0ba':[120,'Amostragem sem reposição: variância do indicador de inclusão','Var(πᵢ) = (n ÷ N) × (1 − n ÷ N).']
}
for(const [id,[numero,conteudo,texto]] of Object.entries(fubTopics))dec(qs.get(id),{materia:'Estatística',conteudo,ano:2022,concurso:fubConcurso,numero,pagina:5,documento:'c020f8957d11f9cf',prova:fubProva,texto,contexto:base117,dificuldade:[118,119,120].includes(numero)?'Média':'Fácil'})
if(decisoes.length!==7)throw Error('Esperadas sete correções complementares')
const out=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[prev],decisoes})
console.log(JSON.stringify({...out,itens_com_formula_corrigida:7,questoes_fub_116_a_120:5,adicionadas:0,publicado:false},null,2))
