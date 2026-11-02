import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'

const root=raizesAtuais[0],manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const cat=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id==='02a6e38c5ae6b3ba'),ids=new Set(cat.questoes.map(x=>x.id)),found=new Map()
for(const f of (await fs.readdir(`${root}/lotes`)).filter(x=>x.startsWith('revisao-uneal-direito-2026-v216-'))){
 for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/lotes/${f}`))))if(ids.has(q.id))found.set(q.id,q)
}
if(found.size!==70)throw Error(`Esperados 70 itens; encontrados ${found.size}`)
const nums=new Set()
for(const q of found.values()){
 if(q.classificacao_pendente||!q.classificacao_revisada||!q.materia||!q.conteudo||q.ano!==2026||!q.gabarito_oficial?.sha256||!q.revisao_semantica_visual)throw Error(`Metadados incompletos em ${q.numero_original}`)
 if(!q.enunciado||q.enunciado.length<35||/CEBRASPE|UNEAL|Edital:\s*2026/i.test(q.enunciado))throw Error(`Enunciado inválido no item ${q.numero_original}`)
 if(q.opcoes?.join('|')!=='Certo|Errado')throw Error(`Opções inválidas no item ${q.numero_original}`)
 const pageFile=`public/acervo-extraido/${q.pagina_imagem}`;await fs.access(pageFile)
 if(q.texto_apoio)for(const p of q.contexto_paginas||[])await fs.access(`public/acervo-extraido/${p.imagem}`)
 if(q.numero_original===72){if(!q.anulada||q.resposta_correta!==null)throw Error('Item 72 não consta como anulado')}
 else if(q.anulada||![0,1].includes(q.resposta_correta))throw Error(`Resposta inválida no item ${q.numero_original}`)
 nums.add(q.numero_original)
}
if(nums.size!==70)throw Error('Numeração não cobre 51–120')
for(const [start,end] of [[82,84],[87,91],[92,97],[98,102],[103,108]])for(let n=start;n<=end;n++)if(![...found.values()].some(q=>q.numero_original===n&&q.texto_apoio))throw Error(`Contexto compartilhado ausente no item ${n}`)
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:manifest.questoes_extraidas_unicas,questoes_disponiveis:manifest.questoes_disponiveis_resolucao,itens_unicos:nums.size,registros_revisados:found.size,com_gabarito:70,anulada:72,contextos_compartilhados_verificados:5,sem_classificacao_pendente:70,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-uneal-direito-2026-v216.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
