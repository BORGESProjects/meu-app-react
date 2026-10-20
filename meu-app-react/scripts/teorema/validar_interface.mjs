import fs from 'node:fs'
import {corrigirQuestaoConferida,questaoPublicavel,unirQuestoes} from '../../src/acervo.js'

const root='tmp/teorema-180-revisao/lote-colunas/'
const input=JSON.parse(fs.readFileSync(root+'aprovadas.json','utf8'))
const accepted=input.filter(q=>questaoPublicavel(corrigirQuestaoConferida(q)))
const ids=new Set(unirQuestoes(accepted).map(q=>q.id))
const approved=accepted.filter(q=>ids.has(q.id))
const approvedIds=new Set(approved.map(q=>q.id))
const held=input.filter(q=>!approvedIds.has(q.id)).map(q=>({id:q.id,numero_csv:q.fonte_material.registro_csv,motivo:'regras de integridade da interface exigem conferência adicional'}))
fs.writeFileSync(root+'aprovadas-interface.json',JSON.stringify(approved,null,2))
fs.writeFileSync(root+'retidas-interface.json',JSON.stringify(held,null,2))
console.log(JSON.stringify({aprovadas:approved.length,retidas:held.length}))
