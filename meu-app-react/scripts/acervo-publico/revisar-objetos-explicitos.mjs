import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {classificarObjetoExplicito} from './classificar_objeto_explicito.mjs'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {aplicarRevisaoVisual} from './aplicar_revisao_visual.mjs'
const raizes=['tmp/revisao-profissional/revisao-comandos/acervo-extraido','tmp/revisao-profissional/revisao-dirigida/acervo-extraido','tmp/revisao-profissional/acervo-extraido']
const destino='tmp/revisao-profissional/revisao-objetos-v2/acervo-extraido',docs='docs/acervo/revisao-profissional'
const revisoesVisuais=JSON.parse(await fs.readFile(`${docs}/reconstrucao-colunas.json`))
const m=JSON.parse(await fs.readFile(path.join(raizes[0],'manifesto.json')))
await fs.mkdir(`${destino}/lotes`,{recursive:true})
const sha=b=>createHash('sha256').update(b).digest('hex')
const indice=criarIndiceFacetas(),mudancas=[],grupos={},amostras={},pendenciasEstruturais=[]
let pendentes=0,disponiveis=0,lotesAlterados=0,transcritas=0
for(const [i,lote]of m.lotes.entries()){
 let bytes
 for(const raiz of raizes){try{bytes=await fs.readFile(path.join(raiz,lote.arquivo));break}catch(e){if(e.code!=='ENOENT')throw e}}
 if(!bytes)throw Error(lote.arquivo)
 const qs=JSON.parse(zlib.gunzipSync(bytes));let alterado=false
 for(const q of qs){
  if(revisoesVisuais.some(r=>r.id===q.id)){
   const gabarito=JSON.stringify([q.resposta_correta,q.gabarito_oficial,q.opcoes,q.pagina_imagem,q.imagens_paginas])
   Object.assign(q,aplicarRevisaoVisual(q,revisoesVisuais));transcritas++;alterado=true
   if(gabarito!==JSON.stringify([q.resposta_correta,q.gabarito_oficial,q.opcoes,q.pagina_imagem,q.imagens_paginas]))throw Error('Gabarito ou imagem alterado')
   for(const [campo,chave]of [['integridade_profissional','pendencias'],['elegibilidade','apontamentos']])if(q[campo]?.[chave])q[campo][chave]=q[campo][chave].filter(p=>p!=='classificacao_especifica_pendente')
  }
  const corpo=JSON.stringify([q.id,q.enunciado,q.texto_apoio,q.opcoes,q.opcoes_imagens,q.pagina_imagem,q.imagens_paginas,q.resposta_correta,q.gabarito_oficial,q.ano,q.banca])
  const c=q.classificacao_pendente&&!q.classificacao_revisada&&q.integridade_profissional?.apta_resolucao!==false?classificarObjetoExplicito(q):null
  if(c){
   const antes={materia:q.materia,conteudo:q.conteudo}
   Object.assign(q,c)
   for(const [campo,chave]of [['integridade_profissional','pendencias'],['elegibilidade','apontamentos']])if(q[campo]?.[chave])q[campo][chave]=q[campo][chave].filter(p=>p!=='classificacao_especifica_pendente')
   const registro={id:q.id,antes,depois:c,sha256_conteudo:sha(corpo)}
   mudancas.push(registro);alterado=true
   const grupo=c.materia+' | '+c.conteudo;grupos[grupo]=(grupos[grupo]||0)+1
   amostras[grupo]??=[]
   if(amostras[grupo].length<8)amostras[grupo].push({id:q.id,enunciado:q.enunciado,antes,fonte:q.classificacao_fonte,evidencia:c.classificacao_evidencia})
  }
  if(corpo!==JSON.stringify([q.id,q.enunciado,q.texto_apoio,q.opcoes,q.opcoes_imagens,q.pagina_imagem,q.imagens_paginas,q.resposta_correta,q.gabarito_oficial,q.ano,q.banca]))throw Error('Conteúdo alterado: '+q.id)
  if(q.classificacao_pendente)pendentes++
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
  if(/\bjulgue os (?:próximos itens|itens (?:subsequentes|seguintes))\b/iu.test(q.enunciado||''))pendenciasEstruturais.push({id:q.id,documento:q.documento_id,pagina:q.pagina_imagem,motivo:'comando_de_bloco_possivelmente_anexado_ao_item',enunciado:q.enunciado})
 }
 indice.adicionar(i,qs)
 if(alterado){const b=zlib.gzipSync(JSON.stringify(qs),{level:9});lote.arquivo=`lotes/objetos-${i}-${sha(b).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,lote.arquivo),b);lotesAlterados++}
}
const facetas=zlib.gzipSync(JSON.stringify(indice.finalizar()),{level:9});const arquivo=`lotes/filtros-objetos-${sha(facetas).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,arquivo),facetas)
m.indice_facetas={arquivo,sha256:sha(facetas),versao:1};m.gerado_em=new Date().toISOString();m.questoes_disponiveis_resolucao=disponiveis
await fs.copyFile(path.join(raizes[0],'visuais.json'),path.join(destino,'visuais.json'))
await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(m))
if(transcritas!==3)throw Error('Transcrições incompletas')
const resumo={gerado_em:m.gerado_em,classificadas:mudancas.length,transcritas,pendentes,disponiveis,lotes_alterados:lotesAlterados,grupos,gabaritos_e_imagens_preservados:true,textos_modificados_apenas_em_tres_revisoes_visuais:true,publicado:false,possiveis_blocos_misturados:pendenciasEstruturais.length}
await fs.writeFile(`${docs}/revisao-objetos.json`,JSON.stringify(resumo,null,2))
await fs.writeFile(`${docs}/revisao-objetos-amostras.json`,JSON.stringify(amostras,null,2))
await fs.writeFile(`${docs}/revisao-objetos-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(mudancas)))
await fs.writeFile(`${docs}/blocos-misturados-candidatos.json.gz`,zlib.gzipSync(JSON.stringify(pendenciasEstruturais)))
console.log(JSON.stringify(resumo,null,2))
