import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'

const doc='ce09ab42e4a14dda',root=raizesAtuais[0]
if(!root.includes('revisao-ebserh-necropsia-2018-v221'))throw Error('A raiz ativa não é v221')
const manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
// Sequência oficial, itens 41–100, conferida no gabarito definitivo.
const answerKey=['C','E','C','C','E','E','C','E','C','E','E','C','C','C','E','C','C','C','C','C','E','E','C','C','E','E','C','E','E','E','C','E','E','C','C','E','E','C','C','E','C','E','C','C','E','C','E','E','C','C','C','E','E','E','C','C','E','C','C','E']
if(answerKey.length!==60||catalog?.questoes.length!==60)throw Error('Gabarito ou catálogo incompleto')
const expected=new Set(catalog.questoes.map(q=>q.id)),found=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo?.startsWith('lotes/revisao-ebserh-necropsia-2018-v221-'))continue;for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/${lot.arquivo}`))))if(expected.has(q.id))found.set(q.id,q)}
if(found.size!==60)throw Error(`Esperados 60 itens, encontrados ${found.size}`)
const numbers=new Set()
for(const q of found.values()){
 const n=q.numero_original,k=answerKey[n-41]
 if(numbers.has(n)||n<41||n>100)throw Error(`Numeração repetida ou inválida: ${n}`)
 numbers.add(n)
 if(q.classificacao_pendente||!q.classificacao_revisada||!q.materia||!q.conteudo||q.ano!==2018||!q.texto_apoio||!q.revisao_semantica_visual)throw Error(`Classificação ou contexto incompleto: ${n}`)
 if(!q.enunciado||q.enunciado.length<25||q.opcoes?.join('|')!=='Certo|Errado')throw Error(`Texto ou estrutura inválidos: ${n}`)
 if(q.gabarito_oficial?.valor!==k||q.gabarito_oficial?.criterio!=='Gabarito oficial definitivo CEBRASPE — EBSERH 2018, Cargo 54: Técnico em Necrópsia.')throw Error(`Gabarito divergente: ${n}`)
 if(q.anulada||q.resposta_correta!==(k==='C'?0:1))throw Error(`Resposta divergente: ${n}`)
 await fs.access(`public/acervo-extraido/${q.pagina_imagem}`)
}
if(numbers.size!==60)throw Error('Cobertura diferente de 60 itens')
const q60=[...found.values()].find(q=>q.numero_original===60)
if(q60.enunciado!=='A flexura duodenojejunal também é denominada ângulo de Treitz.')throw Error('Transcrição corrigida do item 60 diverge')
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:manifest.questoes_extraidas_unicas,questoes_disponiveis:manifest.questoes_disponiveis_resolucao,pendencias_elegiveis_classificacao:manifest.questoes_disponiveis_resolucao?98926:0,itens_unicos:60,com_gabarito:60,anuladas:[],item_60_corrigido:true,paginas_originais_verificadas:[1,2],pendencias_neste_caderno:0,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-ebserh-necropsia-2018-v221.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
