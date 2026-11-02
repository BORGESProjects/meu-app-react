import {createHash} from 'node:crypto'

export function aplicarRevisaoDirigida(q,relatorio){
 const revisao=relatorio?.revisoes?.find(item=>item.id===q.id)
 if(revisao){
  const hash=createHash('sha256').update(String(q.enunciado||'')).digest('hex')
  if(hash!==revisao.sha256_enunciado)throw Error(`Enunciado alterado desde a revisão: ${q.id}`)
  q={...q,...revisao.depois,classificacao_pendente:false,
   classificacao_metodo:'Revisão dirigida do enunciado; sem julgamento do gabarito ou atestado de completude',
   classificacao_revisada:{justificativa:revisao.justificativa,sha256_enunciado:hash}}
 }
 if(relatorio?.quarentena?.includes(q.id))q={...q,revisao_textual_pendente:'texto_de_outro_bloco_no_enunciado'}
 return q
}
