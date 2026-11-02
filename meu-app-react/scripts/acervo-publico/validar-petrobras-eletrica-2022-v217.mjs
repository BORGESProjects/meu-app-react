import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'

const root=raizesAtuais[0],manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const cat=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id==='e6ea69eded342472'),ids=new Set(cat.questoes.map(x=>x.id)),found=new Map()
for(const f of (await fs.readdir(`${root}/lotes`)).filter(x=>x.startsWith('revisao-petrobras-eletrica-2022-v217-'))){for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/lotes/${f}`))))if(ids.has(q.id))found.set(q.id,q)}
if(found.size!==70)throw Error(`Esperados 70 itens; encontrados ${found.size}`)
const numbers=new Set(),annulled=[]
for(const q of found.values()){
 if(q.classificacao_pendente||!q.classificacao_revisada||!q.materia||!q.conteudo||q.ano!==2022||!q.gabarito_oficial?.sha256||!q.revisao_semantica_visual)throw Error(`Metadado ausente no item ${q.numero_original}`)
 if(!q.enunciado||q.enunciado.length<30||/\/g\d{2,}|CEBRASPE\s*\|\s*PETROBRAS/.test(q.enunciado))throw Error(`OCR incompleto no item ${q.numero_original}`)
 const image=`public/acervo-extraido/${q.pagina_imagem}`;await fs.access(image)
 for(const p of q.contexto_paginas||[])await fs.access(`public/acervo-extraido/${p.imagem}`)
 if(q.anulada){annulled.push(q.numero_original);if(q.resposta_correta!==null)throw Error(`Item anulado ${q.numero_original} tem resposta ativa`)}
 else if(![0,1].includes(q.resposta_correta))throw Error(`Gabarito ausente no item ${q.numero_original}`)
 numbers.add(q.numero_original)
}
if(numbers.size!==70||annulled.sort((a,b)=>a-b).join(',')!=='53,67,82,107')throw Error('Numeração ou anulações divergentes')
for(const n of [53,56,58,75,100,101,102,103,104,105,106,107,108,109,110,111,112,113])if(![...found.values()].some(q=>q.numero_original===n&&!/\/g\d{2,}/.test(q.enunciado)))throw Error(`Fórmula não transcrita no item ${n}`)
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:manifest.questoes_extraidas_unicas,questoes_disponiveis:manifest.questoes_disponiveis_resolucao,itens_unicos:numbers.size,registros_revisados:found.size,com_gabarito:70,anuladas:annulled,formulas_transcritas:18,paginas_originais:4,pendencias_no_caderno:[...found.values()].filter(q=>q.classificacao_pendente).length,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-petrobras-eletrica-2022-v217.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))
