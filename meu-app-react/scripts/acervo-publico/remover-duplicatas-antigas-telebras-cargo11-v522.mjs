import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-telebras-cargo11-duplicatas-antigas-v522'
const records=JSON.parse(await fs.readFile('tmp/telebras-2021-cargo11-document-records.json','utf8'))
const pairs=[
 [51,'extr-0ebd672e38a7fb3c5226','extr-a72ae0d202d14de1d985'],
 [52,'extr-cd16764d628796ec3c65','extr-e96f87a8b7bf9eb9ffc0'],
 [53,'extr-dc1fa337b15c01c799ec','extr-26948092b2c8b24898f1'],
 [54,'extr-d00966752548634763f4','extr-0134d9a8d913b096fc28'],
 [55,'extr-2404fd323d32f971d73d','extr-27a5c25bfef95658e8ee'],
]
const decisions=pairs.map(([n,id,keeper])=>{
 const q=records.find(x=>x.id===id)
 assert.ok(q,`registro antigo ${id}`)
 assert.equal(q.n,n)
 return {id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Física',conteudo:`Captura duplicada do item ${n}; mantida a versão revisada`,ano:2021,
  banca:'CEBRASPE',organizadora:'CEBRASPE',concurso:'Concurso Público da TELEBRAS 2021 — Cargo 11 — Engenheiro — Subatividade Aeroespacial',
  aplicacao:'20/02/2022',cargo:'Especialista em Gestão de Telecomunicações — Engenheiro — Subatividade Aeroespacial (Cargo 11)',numero_original:n,
  apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_antiga_do_mesmo_item'}
})
console.log(JSON.stringify({pacote:nome,duplicatas_antigas_desativadas:decisions.length,ids:decisions.map(x=>({id:x.id,duplicada_de:x.duplicada_de}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
