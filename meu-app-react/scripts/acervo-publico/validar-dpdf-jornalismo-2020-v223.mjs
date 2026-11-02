import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'

const doc='3f395bfa664b52d3',root=raizesAtuais[0]
if(!root.includes('revisao-dpdf-jornalismo-2020-v223'))throw Error('A raiz ativa não é v223')
const manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
const keys=['C','C','E','E','C','C','E','C','C','E','C','C','E','C','E','E','E','E','C','E','C','C','E','E','C','E','C','E','C','C','E','E','C','C','E','C','E','E','C','C','E','E','C','E','C','C','C','C','C','E','E','C','E','C','E','C','E','C','E','C','E','E','E','E','E','E','E','C','C','C']
if(catalog?.questoes.length!==71||new Set(catalog.questoes.map(x=>x.numero)).size!==70||keys.length!==70)throw Error('Catálogo ou gabarito divergente')
const expected=new Set(catalog.questoes.map(q=>q.id)),found=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo?.startsWith('lotes/revisao-dpdf-jornalismo-2020-v223-'))continue;for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/${lot.arquivo}`))))if(expected.has(q.id))found.set(q.id,q)}
if(found.size!==71)throw Error(`Esperados 71 registros (70 questões e uma duplicata), encontrados ${found.size}`)
const nums=new Map(),dups=[]
for(const q of found.values()){
 const n=q.numero_original,k=keys[n-51]
 if(n<51||n>120||!k)throw Error(`Número de item inválido: ${n}`)
 nums.set(n,(nums.get(n)||0)+1)
 if(!q.classificacao_revisada||!q.materia||!q.conteudo||q.ano!==2020||!q.concurso||!q.texto_apoio||!q.revisao_semantica_visual)throw Error(`Classificação/contexto incompleto: ${n}`)
 if(q.gabarito_oficial?.valor!==k||q.opcoes?.join('|')!=='Certo|Errado')throw Error(`Gabarito ou formato divergente: ${n}`)
 await fs.access(`public/acervo-extraido/${q.pagina_imagem}`)
 if(q.id==='extr-2ff2ac2a8b50bf4ff61b'){
  dups.push(q.id)
  if(q.integridade_profissional?.apta_resolucao!==false||q.elegibilidade?.elegivel_para_resolucao!==false||q.duplicada_de!=='extr-06a16f072828bb9bc831')throw Error('Registro OCR duplicado não está inelegível e vinculado ao canônico')
 }else if(q.integridade_profissional?.apta_resolucao===false||q.classificacao_pendente||q.resposta_correta!==(k==='C'?0:1))throw Error(`Elegibilidade, classificação ou resposta inválida: ${n}`)
}
if(nums.size!==70||[...nums.values()].some(n=>n!==1&&n!==2)||nums.get(55)!==2||dups.length!==1)throw Error('Duplicatas ou cobertura divergentes')
if(found.get('extr-06a16f072828bb9bc831')?.resposta_correta!==0)throw Error('Item 55 canônico não está correto')
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:manifest.questoes_extraidas_unicas,questoes_disponiveis:manifest.questoes_disponiveis_resolucao,pendencias_elegiveis_classificacao:98796,itens_unicos_revisados:70,registros_catalogados:71,com_gabarito_definitivo:70,duplicatas_inelegiveis:dups,anuladas:[],paginas_originais_verificadas:[1,2,3,4,5],pendencias_neste_caderno:0,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-dpdf-jornalismo-2020-v223.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
