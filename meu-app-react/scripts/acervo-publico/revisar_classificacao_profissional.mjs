import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {enriquecerQuestaoExtraida,modalidadeQuestaoExtraida} from '../../src/classificacaoQuestaoExtraida.js'
import {normalizarMetadadosQuestao} from '../../src/origemQuestao.js'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
import {vincularGabarito} from './vincular_gabaritos.mjs'
import {avaliarTipoDocumento} from './tipo_documento_fonte.mjs'
import {aplicarRevisaoDirigida} from './aplicar_revisao_dirigida.mjs'
import {aplicarRevisaoVisual} from './aplicar_revisao_visual.mjs'
import {classificarObjetoExplicito} from './classificar_objeto_explicito.mjs'

const entrada=path.resolve('public/acervo-extraido'),saida=path.resolve('tmp/revisao-profissional/acervo-extraido')
const docs=path.resolve('docs/acervo/revisao-profissional')
const revisaoDirigida=await fs.readFile(path.join(docs,'revisao-dirigida.json'),'utf8').then(JSON.parse).catch(error=>{if(error.code==='ENOENT')return null;throw error})
const revisoesVisuais=await fs.readFile(path.join(docs,'revisoes-visuais-persistentes.json'),'utf8').then(JSON.parse).catch(error=>{if(error.code==='ENOENT')return [];throw error})
const revisoesColunas=await fs.readFile(path.join(docs,'reconstrucao-colunas.json'),'utf8').then(JSON.parse).catch(error=>{if(error.code==='ENOENT')return [];throw error})
if(!saida.startsWith(path.resolve('tmp')+path.sep))throw Error('Destino temporário fora da pasta de trabalho')
await fs.rm(saida,{recursive:true,force:true})
await fs.mkdir(path.join(saida,'lotes'),{recursive:true});await fs.mkdir(docs,{recursive:true})
const manifest=JSON.parse(await fs.readFile(path.join(entrada,'manifesto.json')))
const correcoes=JSON.parse(await fs.readFile(path.join(docs,'correcoes-fontes.json'))).documentos
const documentos=new Map(JSON.parse(await fs.readFile(path.join(docs,'fontes-documentais.json'))).map(d=>[d.id,d]))
const fontesLidas=new Map(),materiasFonte=new Map()
const gabaritos=new Map(),cacheTextos=new Map()
try{for(const linha of (await fs.readFile(path.join(docs,'gabaritos-conferidos.jsonl'),'utf8')).trim().split('\n'))if(linha.trim()){const g=JSON.parse(linha);if(g.status==='tabela_lida')gabaritos.set(g.documento_id,g)}}catch(error){if(error.code!=='ENOENT')throw error}
async function paginasFonte(id){
 if(typeof id!=='string'||!/^[a-f0-9]{16,64}$/i.test(id)||!gabaritos.has(id))return null
 if(cacheTextos.has(id))return cacheTextos.get(id)
 let paginas
 try{paginas=JSON.parse(zlib.gunzipSync(await fs.readFile(path.resolve('tmp/revisao-profissional/fontes-texto',id+'.json.gz'))))}catch(error){if(error.code!=='ENOENT')throw error;paginas=null}
 cacheTextos.set(id,paginas)
 if(cacheTextos.size>64)cacheTextos.delete(cacheTextos.keys().next().value)
 return paginas
}
try{
 let evidencias=await fs.readFile(path.join(docs,'conferencia-fontes-pdf.jsonl'),'utf8')
 try{evidencias+='\n'+await fs.readFile(path.join(docs,'conferencia-fontes-compactadas.jsonl'),'utf8')}catch(error){if(error.code!=='ENOENT')throw error}
 for(const linha of evidencias.trim().split('\n')){
  if(!linha.trim())continue
  const fonte=JSON.parse(linha)
  if(fonte.status==='pdf_lido')fontesLidas.set(fonte.documento_id,fonte)
 }
 for(const fonte of fontesLidas.values())for(const e of fonte.evidencias||[])if(e.materia_cabecalho)materiasFonte.set(e.id,{materia:e.materia_cabecalho,pagina:e.pagina,sha256:fonte.sha256,url:fonte.url})
}catch(error){if(error.code!=='ENOENT')throw error}
const facetas=criarIndiceFacetas(),ids=new Set(),imagens=new Set(),duplicatas=new Map(),linhas=[],mudancas=[]
const resumo={gerado_em:new Date().toISOString(),registros:0,principal:0,complementar:0,alteracoes:{banca:0,materia:0,conteudo:0,ano:0},aplicacoes:{},organizadoras:{},materias:{},pendencias:{},classificacaoPendente:0,semGabarito:0,gabaritosNovosVinculados:0,semAno:0,aptasResolucao:0,discursivas:0,duplicatasCandidatas:0,idsDuplicados:[],imagensAusentes:[],fontesPendentes:[],bytesPacote:0}
const contador=(obj,key)=>obj[key]=(obj[key]||0)+1
const csv=x=>'"'+String(x??'').replaceAll('"','""')+'"'
const digest=x=>createHash('sha256').update(x).digest('hex')
function auditar(q,original,origem,lote){
 resumo.registros++;resumo[origem]++;contador(resumo.aplicacoes,q.banca||'(sem aplicação)');contador(resumo.materias,q.materia||'(sem matéria)')
 if(q.organizadora)contador(resumo.organizadoras,q.organizadora)
 if(ids.has(String(q.id)))resumo.idsDuplicados.push(String(q.id));ids.add(String(q.id))
 if(!q.ano)resumo.semAno++
 const problemas=[]
 if(q.revisao_textual_pendente)problemas.push(q.revisao_textual_pendente)
 if(!String(q.enunciado||'').trim()||String(q.enunciado).trim().length<8)problemas.push('enunciado_ausente_ou_curto')
 if(!Array.isArray(q.opcoes)||q.opcoes.length<2||q.opcoes.length>5)problemas.push('quantidade_alternativas_invalida')
 if(q.opcoes?.some(v=>!String(v??'').trim()))problemas.push('alternativa_vazia')
 const visual=Boolean(q.pagina_imagem||q.imagem_original||q.imagens_paginas?.length||q.blocos_enunciado?.length)
 if(/[\uFFFD\uE000-\uF8FF]/u.test([q.enunciado,...(q.opcoes||[])].join(' ')))problemas.push('texto_corrompido_requer_reconstrucao')
 if(q.tipo_resposta==='discursiva'){problemas.push('discursiva_fora_do_escopo');resumo.discursivas++}
 const marcadores=[...String(q.enunciado||'').matchAll(/\bQUEST[ÃA]O\s+(\d{1,3})\b/gu)]
 if(new Set(marcadores.map(m=>m[1])).size>1)problemas.push('multiplas_questoes_no_enunciado')
 if(!q.materia||!q.conteudo||q.classificacao_pendente){problemas.push('classificacao_especifica_pendente');resumo.classificacaoPendente++}
 if(!q.ano)problemas.push('ano_sem_evidencia')
 if(q.documento_auxiliar)problemas.push('documento_auxiliar_nao_e_questao')
 if(q.resposta_correta==null&&q.resposta_soma==null&&!q.gabarito_oficial){problemas.push('gabarito_oficial_nao_vinculado');resumo.semGabarito++}
 if(q.gabarito_oficial&&!original.gabarito_oficial)resumo.gabaritosNovosVinculados++
 if(origem==='complementar'&&!visual)problemas.push('referencia_visual_ausente')
 if(/estrat[eé]gia|gran.?cursos|qconcursos|seja.?oficial|eu.?militar|r2.?cursos/iu.test(JSON.stringify({concurso:q.concurso,origem:q.origem,livro:q.origem_livro,material:q.fonte_material})))problemas.push('proveniencia_comercial_requer_conferencia')
 const apta=!problemas.some(p=>/enunciado_ausente|alternativas_invalida|alternativa_vazia|discursiva_|multiplas_questoes|texto_corrompido|texto_de_outro_bloco|visual_ausente|documento_auxiliar/u.test(p))
 if(apta)resumo.aptasResolucao++
 const correcaoAutomatica=apta&&!q.anulada&&(q.resposta_correta!=null||q.resposta_soma!=null)
 q.integridade_profissional={versao:1,apta_resolucao:apta,correcao_automatica:correcaoAutomatica,verificada_individualmente:false,pendencias:problemas}
 q.elegibilidade={elegivel_para_resolucao:apta,elegivel_para_correcao_automatica:correcaoAutomatica,apontamentos:problemas}
 for(const p of problemas)contador(resumo.pendencias,p)
 for(const campo of ['banca','materia','conteudo','ano'])if(String(original[campo]??'')!==String(q[campo]??'')){resumo.alteracoes[campo]++;mudancas.push({id:q.id,lote,campo,antes:original[campo]??null,depois:q[campo]??null})}
 for(const img of [...(q.imagens_paginas||[]),q.pagina_imagem].filter(Boolean))if(origem==='complementar')imagens.add(img)
 const corpo=String(q.enunciado||'').normalize('NFKC').replace(/\s+/gu,' ').trim()
 if(corpo.length>=100&&q.tipo_resposta!=='certo_errado'){
  const hash=digest(JSON.stringify([corpo,q.texto_apoio||'',q.opcoes||[],q.opcoes_imagens||[],q.imagem_original||'']))
  if(duplicatas.has(hash)){resumo.duplicatasCandidatas++;problemas.push('duplicata_textual_candidata')}else duplicatas.set(hash,q.id)
 }
 linhas.push([q.id,origem,q.banca,q.organizadora||'',q.ano,q.materia,q.conteudo,apta,q.classificacao_confianca??'',problemas.join('|'),q.fonte||q.fonte_pdf||'',lote].map(csv).join(','))
 return q
}

for(let i=0;i<manifest.lotes.length;i++){
 const lot=manifest.lotes[i],bytes=await fs.readFile(path.join(entrada,lot.arquivo)),dados=JSON.parse(zlib.gunzipSync(bytes))
 if(dados.length!==lot.quantidade)throw Error('Quantidade divergente: '+lot.arquivo)
 const paginasDoLote=new Map()
 for(const id of new Set(dados.map(q=>q.documento_id)))paginasDoLote.set(id,await paginasFonte(id))
 const revisadas=dados.map(original=>{
  const doc=documentos.get(original.documento_id),fonte=fontesLidas.get(original.documento_id),correcao=correcoes[original.documento_id]||{}
  const tipoFonte=avaliarTipoDocumento(doc)
  const anoFonte=correcao.ano||fonte?.ano_cabecalho||(!original.ano?doc?.ano_catalogo:null)
  const comFonte={...original,...correcao,...(anoFonte?{ano:Number(anoFonte)}:{}),...(!original.fonte&&doc?.url?{fonte:doc.url}:{}),...(materiasFonte.has(original.id)?{classificacao_fonte:materiasFonte.get(original.id)}:{})}
  if(tipoFonte.auxiliar)comFonte.documento_auxiliar=true
  if(tipoFonte.discursivo)comFonte.tipo_resposta='discursiva'
  if(!comFonte.tipo_documento&&doc?.tipo_catalogo)comFonte.tipo_documento=doc.tipo_catalogo
  if(anoFonte&&Number(anoFonte)!==Number(original.ano))comFonte.ano_edicao_anterior=original.ano
  const enriquecida=enriquecerQuestaoExtraida(comFonte)
  let q=aplicarRevisaoDirigida(normalizarMetadadosQuestao(enriquecida),revisaoDirigida)
  q=aplicarRevisaoVisual(q,revisoesVisuais)
  q=aplicarRevisaoVisual(q,revisoesColunas)
  if(q.classificacao_pendente&&!q.classificacao_revisada&&!q.revisao_textual_pendente)Object.assign(q,classificarObjetoExplicito(q)||{})
  q=vincularGabarito(q,gabaritos.get(original.documento_id),paginasDoLote.get(original.documento_id))
  q.classificacao_anterior={materia:original.materia,conteudo:original.conteudo,confianca:original.classificacao_confianca}
  return auditar(q,original,'complementar',lot.arquivo)
 })
 const aplicacoes=new Set(revisadas.map(q=>q.banca)),anos=new Set(revisadas.map(q=>q.ano))
 if(aplicacoes.size===1)lot.banca=[...aplicacoes][0]
 if(anos.size===1)lot.ano=[...anos][0]
 facetas.adicionar(i,revisadas)
 const out=zlib.gzipSync(JSON.stringify(revisadas),{level:9});resumo.bytesPacote+=out.length
 const novoNome=lot.arquivo.replace(/\.json\.gz$/u,`-revisao-v2-${digest(out).slice(0,10)}.json.gz`)
 lot.arquivo=novoNome
 await fs.writeFile(path.join(saida,novoNome),out)
 if((i+1)%300===0)console.log(`Lotes revisados: ${i+1}/${manifest.lotes.length}`)
}
resumo.aptasComplementar=resumo.aptasResolucao
manifest.questoes_disponiveis_resolucao=resumo.aptasComplementar
manifest.questoes_indisponiveis_revisao=Number(manifest.questoes_extraidas_unicas)-resumo.aptasComplementar
const principalOriginal=JSON.parse(await fs.readFile('native/acervo/questoes.json'))
const principal=principalOriginal.map(original=>auditar(normalizarMetadadosQuestao({...original,tipo_resposta:original.tipo_resposta||modalidadeQuestaoExtraida(original)}),original,'principal','native/acervo/questoes.json'))
const overlay=principal.map(q=>Object.fromEntries(['id','banca','banca_original','concurso','concurso_original','aplicacao','organizadora','ano','materia','conteudo','integridade_profissional'].filter(k=>q[k]!==undefined).map(k=>[k,q[k]])))
const overlayBytes=zlib.gzipSync(JSON.stringify(overlay),{level:9})
await fs.writeFile(path.join(saida,'lotes/classificacao-principal-v2.json.gz'),overlayBytes)
manifest.classificacao_principal={arquivo:'lotes/classificacao-principal-v2.json.gz',quantidade:overlay.length,sha256:digest(overlayBytes)}
const facetasBytes=zlib.gzipSync(JSON.stringify(facetas.finalizar()),{level:9})
await fs.writeFile(path.join(saida,'lotes/indice-filtros-v2.json.gz'),facetasBytes)
manifest.indice_facetas={arquivo:'lotes/indice-filtros-v2.json.gz',sha256:digest(facetasBytes),versao:1}
delete manifest.facetas
manifest.gerado_em=resumo.gerado_em
manifest.revisao_profissional={versao:1,registros_complementares:resumo.complementar,verificacao_estrutural_em_todos_registros:true,revisao_individual_concluida:false,criterio:'origem e ano por metadados; matéria por evidência textual delimitada; assuntos restritos à matéria; incertezas e problemas preservados por registro'}
const grupos=new Map()
for(const lote of manifest.lotes){const g=grupos.get(lote.banca)||{banca:lote.banca,questoes:0,arquivos_com_questoes:0};g.questoes+=lote.quantidade;g.arquivos_com_questoes++;grupos.set(lote.banca,g)}
manifest.bancas=[...grupos.values()]
await fs.copyFile(path.join(entrada,'visuais.json'),path.join(saida,'visuais.json'))
await fs.writeFile(path.join(saida,'manifesto.json'),JSON.stringify(manifest))
await fs.writeFile('tmp/revisao-profissional/principal-revisado.json',JSON.stringify(principal))
// As imagens não são duplicadas no pacote: seus caminhos existentes no R2 permanecem.
const imagensLista=[...imagens]
let proxima=0
await Promise.all(Array.from({length:20},async()=>{while(proxima<imagensLista.length){const img=imagensLista[proxima++];try{await fs.access(path.join(entrada,img))}catch{resumo.imagensAusentes.push(img)}}}))
resumo.imagensReferenciadas=imagens.size
resumo.bytesPacote+=overlayBytes.length+facetasBytes.length+(await fs.stat(path.join(saida,'manifesto.json'))).size
resumo.documentosConferidos=fontesLidas.size
resumo.materiasComCabecalhoFonte=materiasFonte.size
resumo.supabase=(await fs.readFile('tmp/revisao-profissional/supabase-questoes-antes.json').then(JSON.parse).catch(()=>[])).length
if(resumo.registros!==principal.length+Number(manifest.questoes_extraidas_unicas))throw Error('O total de registros não fecha')
if(resumo.idsDuplicados.length)throw Error('IDs duplicados: '+resumo.idsDuplicados.slice(0,10))
await fs.writeFile(path.join(docs,'auditoria-registro-a-registro.csv.gz'),zlib.gzipSync('id,acervo,aplicacao,organizadora,ano,materia,conteudo,apta_resolucao,confianca,pendencias,fonte,lote\n'+linhas.join('\n'),{level:9}))
await fs.writeFile(path.join(docs,'historico-alteracoes.json.gz'),zlib.gzipSync(JSON.stringify(mudancas),{level:9}))
await fs.writeFile(path.join(docs,'resultado.json'),JSON.stringify(resumo,null,2))
console.log(JSON.stringify({...resumo,materias:undefined,aplicacoes:undefined,organizadoras:undefined},null,2))
