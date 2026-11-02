import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'

const doc='fa9ed2b65deeb413',root=raizesAtuais[0]
if(!root.includes('revisao-tjpa-economia-2025-v220'))throw Error('A raiz ativa não é v220')
const manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
const keys=['E','E','C','C','C','E','C','E','C','C','E','C','E','C','E','C','C','E','C','C','E','C','E','E','C','C','E','C','E','E','C','C','C','E','E','E','C','E','E','E','C','C','C','E','E','C','E','E','C','E','E','X','E','C','E','E','C','X','E','E','E','C','C','C','C','C','C','C','C','C']
const expected=new Set(catalog.questoes.map(q=>q.id)),found=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo?.startsWith('lotes/revisao-tjpa-economia-2025-v220-'))continue;for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/${lot.arquivo}`))))if(expected.has(q.id))found.set(q.id,q)}
if(found.size!==70)throw Error(`Esperados 70 itens, encontrados ${found.size}`)
const nums=new Set(),annulled=[]
for(const q of found.values()){
 const n=q.numero_original,key=keys[n-51],annulledKey=key==='X'
 if(nums.has(n)||n<51||n>120)throw Error(`Numeração repetida ou inválida: ${n}`)
 nums.add(n)
 if(q.classificacao_pendente||!q.classificacao_revisada||!q.materia||!q.conteudo||q.ano!==2025||!q.texto_apoio||!q.revisao_semantica_visual)throw Error(`Classificação/contexto incompleto no item ${n}`)
 if(!q.enunciado||q.enunciado.length<30||/\/g\d{2,}/.test(q.enunciado)||q.opcoes?.join('|')!=='Certo|Errado')throw Error(`OCR ou estrutura incompleta no item ${n}`)
 if(q.gabarito_oficial?.valor!==key||q.gabarito_oficial?.arquivo!=='53483EE025122C939B2F57E9D9831C4AE6DBB76242274755374ADFDE74576960.pdf')throw Error(`Gabarito definitivo divergente no item ${n}`)
 await fs.access(`public/acervo-extraido/${q.pagina_imagem}`)
 if(annulledKey){annulled.push(n);if(!q.anulada||q.resposta_correta!==null||q.integridade_profissional?.correcao_automatica!==false)throw Error(`Anulação inválida no item ${n}`)}
 else if(q.anulada||q.resposta_correta!==(key==='C'?0:1))throw Error(`Resposta divergente no item ${n}`)
}
if(nums.size!==70||annulled.sort((a,b)=>a-b).join(',')!=='102,108')throw Error('Cobertura/anulações divergentes')
const formula=[...found.values()].find(q=>q.numero_original===59)?.enunciado
if(formula!=='Uma função de produção Cobb–Douglas Q(K, L) = A · K^α · L^β tem rendimentos decrescentes de escala se α + β < 1.')throw Error('Fórmula Cobb–Douglas não foi transcrita corretamente')
if([...found.values()].find(q=>q.numero_original===119)?.resposta_correta!==0)throw Error('Alteração do gabarito definitivo do item 119 não aplicada')
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:manifest.questoes_extraidas_unicas,questoes_disponiveis:manifest.questoes_disponiveis_resolucao,pendencias_elegiveis_classificacao:98986,itens_unicos:70,com_gabarito:70,anuladas:annulled,alteracao_definitiva:{item:119,de:'E',para:'C'},formula_59_corrigida:true,paginas_originais_verificadas:[1,2,3],pendencias_neste_caderno:0,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-tjpa-economia-2025-v220.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
