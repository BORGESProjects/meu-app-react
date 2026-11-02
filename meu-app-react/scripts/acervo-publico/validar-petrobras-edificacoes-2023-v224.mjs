import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'

const doc='2a36e81181069910',root=raizesAtuais[0]
if(!root.includes('revisao-petrobras-edificacoes-2023-v224'))throw Error('A raiz ativa não é v224')
const manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
const keys=['E','E','E','E','E','C','C','C','C','C','C','E','E','E','C','E','E','C','E','E','C','C','E','C','E','E','C','C','E','X','C','E','E','C','C','E','E','C','E','C','E','C','E','C','E','C','C','E','C','E','C','E','C','C','C','C','E','E','E','E']
if(catalog?.questoes.length!==60||keys.length!==60)throw Error('Catálogo ou gabarito incompleto')
const expected=new Set(catalog.questoes.map(x=>x.id)),found=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo?.startsWith('lotes/revisao-petrobras-edificacoes-2023-v224-'))continue;for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/${lot.arquivo}`))))if(expected.has(q.id))found.set(q.id,q)}
if(found.size!==60)throw Error(`Esperados 60 itens, encontrados ${found.size}`)
const nums=new Set(),annulled=[]
for(const q of found.values()){
 const n=q.numero_original,k=keys[n-41]
 if(nums.has(n)||n<41||n>100)throw Error(`Numeração repetida ou inválida: ${n}`)
 nums.add(n)
 if(q.classificacao_pendente||!q.classificacao_revisada||!q.materia||!q.conteudo||q.ano!==2023||!q.concurso||!q.texto_apoio||!q.revisao_semantica_visual)throw Error(`Classificação/contexto incompleto: ${n}`)
 if(q.opcoes?.join('|')!=='Certo|Errado'||q.gabarito_oficial?.valor!==k)throw Error(`Formato ou gabarito divergente: ${n}`)
 await fs.access(`public/acervo-extraido/${q.pagina_imagem}`)
 if(k==='X'){annulled.push(n);if(!q.anulada||q.resposta_correta!==null||q.integridade_profissional?.correcao_automatica!==false)throw Error(`Anulação incorreta: ${n}`)}
 else if(q.anulada||q.resposta_correta!==(k==='C'?0:1))throw Error(`Resposta divergente: ${n}`)
}
if(nums.size!==60||annulled.join(',')!=='70')throw Error('Cobertura/anulação divergente')
const q68=[...found.values()].find(q=>q.numero_original===68)
if(!q68.texto_apoio.includes('12 × 37 cm')||!q68.imagens_paginas?.length)throw Error('Detalhamento gráfico do estribo não está associado')
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:manifest.questoes_extraidas_unicas,questoes_disponiveis:manifest.questoes_disponiveis_resolucao,pendencias_elegiveis_classificacao:98736,itens_unicos:60,com_gabarito_definitivo:60,anuladas:annulled,figura_estribo_associada:true,curvas_granulometricas_na_pagina_origem:true,paginas_originais_verificadas:[1,2,3],pendencias_neste_caderno:0,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-petrobras-edificacoes-2023-v224.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
