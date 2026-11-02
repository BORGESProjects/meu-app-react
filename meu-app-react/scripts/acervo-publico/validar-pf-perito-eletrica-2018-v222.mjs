import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'

const doc='8262d211d2bf4345',root=raizesAtuais[0]
if(!root.includes('revisao-pf-perito-eletrica-2018-v222'))throw Error('A raiz ativa não é v222')
const manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
const keys=['E','C','E','E','E','E','C','E','E','E','E','C','C','E','E','C','C','C','C','C','C','C','C','C','E','E','C','E','E','E','E','E','E','C','C','X','C','C','C','E','E','C','C','C','E','C','E','E','E','E','E','C','C','E','C','X','C','C','E','E','E','E','C','E','C','C','E','E','C','C']
if(catalog?.questoes.length!==70||keys.length!==70)throw Error('Catálogo ou gabarito incompleto')
const wanted=new Set(catalog.questoes.map(q=>q.id)),found=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo?.startsWith('lotes/revisao-pf-perito-eletrica-2018-v222-'))continue;for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/${lot.arquivo}`))))if(wanted.has(q.id))found.set(q.id,q)}
if(found.size!==70)throw Error(`Esperados 70 registros no caderno, encontrados ${found.size}`)
const numbers=new Set(),annulled=[]
for(const q of found.values()){
 const n=q.numero_original,k=keys[n-51]
 if(numbers.has(n)||n<51||n>120)throw Error(`Numeração repetida ou inválida: ${n}`)
 numbers.add(n)
 if(q.classificacao_pendente||!q.classificacao_revisada||!q.materia||!q.conteudo||q.ano!==2018||!q.concurso||!q.texto_apoio||!q.revisao_semantica_visual)throw Error(`Classificação/contexto incompleto: ${n}`)
 if(!q.enunciado||q.opcoes?.join('|')!=='Certo|Errado'||q.gabarito_oficial?.valor!==k)throw Error(`Texto, formato ou gabarito divergente: ${n}`)
 await fs.access(`public/acervo-extraido/${q.pagina_imagem}`)
 if(k==='X'){annulled.push(n);if(!q.anulada||q.resposta_correta!==null||q.integridade_profissional?.correcao_automatica!==false)throw Error(`Anulação incorreta: ${n}`)}
 else if(q.anulada||q.resposta_correta!==(k==='C'?0:1))throw Error(`Resposta divergente: ${n}`)
}
if(numbers.size!==70||annulled.sort((a,b)=>a-b).join(',')!=='86,106')throw Error('Cobertura/anulações divergentes')
const byN=new Map([...found.values()].map(q=>[q.numero_original,q]))
if(byN.get(62)?.enunciado!=='No filtro A, considerando-se R = 1/3 kΩ, C = 500 pF e π = 3, a frequência de corte será de 1 MHz.')throw Error('Fórmula do item 62 não corrigida')
if(byN.get(75)?.enunciado!=='Em comparação com a implementação direta da transformada de Fourier, o uso da transformada rápida de Fourier reduz o número de operações entre multiplicações e adições complexas de N² para (log₂ N)/N.')throw Error('Fórmula do item 75 não foi transcrita como no caderno')
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:manifest.questoes_extraidas_unicas,questoes_disponiveis:manifest.questoes_disponiveis_resolucao,pendencias_elegiveis_classificacao:98858,itens_revisados:70,itens_no_caderno:70,itens_com_gabarito:70,anuladas:annulled,paginas_originais_verificadas:[1,2,3,4],pendencias_neste_caderno:0,pontos_ocr_corrigidos:[62,64,74,75,88,89,95,116],publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-pf-perito-eletrica-2018-v222.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
