import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'

const root=raizesAtuais[0], manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id==='7030a729f5068e47')
const ids=new Set(catalog.questoes.map(x=>x.id)),found=new Map()
for(const file of (await fs.readdir(`${root}/lotes`)).filter(x=>x.startsWith('revisao-slu-jornalismo-2019-v215-'))){
 if(file==='revisao-slu-jornalismo-2019-v215')continue
 for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/lotes/${file}`))))if(ids.has(q.id))found.set(q.id,q)
}
if(found.size!==81)throw Error(`Esperados 81 registros OCR; encontrados ${found.size}`)
const byNumber=new Map()
for(const q of found.values()){
 if(q.classificacao_pendente||!q.classificacao_revisada||!q.materia||!q.conteudo||q.ano!==2019||!q.gabarito_oficial||!q.revisao_semantica_visual)throw Error(`Metadado pendente no id ${q.id}`)
 if(/JUSTIFICATIVA|CEBRASPE|SLUDF/.test(q.enunciado))throw Error(`Texto de justificativa/cabeçalho no enunciado ${q.numero_original}`)
 if(q.opcoes?.join('|')!=='Certo|Errado')throw Error(`Opções inválidas no item ${q.numero_original}`)
 const group=byNumber.get(q.numero_original)||[];group.push(q);byNumber.set(q.numero_original,group)
}
if(byNumber.size!==70)throw Error(`Esperados 70 números de item; encontrados ${byNumber.size}`)
for(const [n,group] of byNumber){
 const eligible=group.filter(q=>q.integridade_profissional?.apta_resolucao!==false)
 if(eligible.length!==1)throw Error(`Item ${n}: esperada uma cópia elegível, encontradas ${eligible.length}`)
 const q=eligible[0],file=`public/acervo-extraido/${q.pagina_imagem}`
 await fs.access(file)
 if(q.anulada?(n!==62||q.resposta_correta!==null):![0,1].includes(q.resposta_correta))throw Error(`Gabarito não resolvível no item ${n}`)
 for(const p of q.contexto_paginas||[])await fs.access(`public/acervo-extraido/${p.imagem}`)
}
if(!manifest.indice_facetas?.arquivo)throw Error('Índice de filtros ausente')
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:manifest.questoes_extraidas_unicas,questoes_disponiveis:manifest.questoes_disponiveis_resolucao,itens_unicos:byNumber.size,registros_ocr:found.size,duplicatas_inelegiveis:found.size-byNumber.size,questoes_com_gabarito:70,anulada:62,sem_classificacao_pendente:81,facetas:manifest.indice_facetas.arquivo}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-slu-jornalismo-2019-v215.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
