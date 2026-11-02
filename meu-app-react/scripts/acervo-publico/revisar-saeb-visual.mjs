import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lerArquivoAtual} from './acervo-atual.mjs'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
const sha=b=>createHash('sha256').update(b).digest('hex')
const base='tmp/revisao-profissional/revisao-blocos-v2/acervo-extraido',destino='tmp/revisao-profissional/revisao-saeb-v1/acervo-extraido'
const m=JSON.parse(await fs.readFile(path.join(base,'manifesto.json'))),facetas=criarIndiceFacetas(),mudancas=[]
const originais=new Map(JSON.parse(await fs.readFile('tmp/revisao-profissional/saeb-conferir.json')).map(q=>[q.id,q]))
const documento='5c5123afb1efa4b7'
const motivos=new Map([
 ['extr-bfb06c1d6c2e5af24336','Trecho do manual: procedimentos de amostragem, não é questão de prova.'],
 ['extr-31ee39bc0cb82229e13f','Trecho do manual: crítica do levantamento, não é questão de prova.'],
 ['extr-b4358e74a42c1debdb91','Trecho do manual: encerramento do levantamento, não é questão de prova.'],
 ['extr-09482e0df4364765d454','Orientações de preenchimento de formulário de pessoal, não é questão de prova.'],
 ['extr-9f3fc38989e348e05beb','Manual de processamento: bloco de crítica e consolidação, não é questão de prova.'],
 ['extr-b337222bd6bce495f50e','Instruções de transporte de bancos e instalação de programas, não é questão de prova.'],
 ['extr-0736ca78fd26bd568ebf','Exercícios de resposta escrita misturados; não são alternativas de questão objetiva.'],
 ['extr-07232b1c5c2a9a1940c7','A página original imprime 3.004 + 2.999 e 3.004 − 2.999; resultados 6.003 e 5 não constam juntos em nenhuma alternativa. Necessita errata oficial.'],
])
const ajustes=new Map([
 ['extr-0ef5f60328fefbd2b515',{enunciado:'Se A = {1, 2, 3, 4, 5, 6} e B = {0, 2, 4, 6, 8}, então',opcoes:['A ⊂ B','B ⊂ A','{2, 4, 6} ⊂ A','{1, 2, 3, 4} ⊂ B'],conteudo:'Teoria dos conjuntos: inclusão e subconjuntos'}],
 ['extr-33d0f7f854e73cfdcfd8',{enunciado:'Se A = {a, b} e B = {a, b, c}, então é verdade que',opcoes:['A ∪ B = ∅','A ∪ B = A','A ∩ B = ∅','A ∩ B = A'],conteudo:'Teoria dos conjuntos: união e interseção'}],
 ['extr-add88ba480fd55f3397c',{enunciado:'A metade de três mil e cinquenta e quatro é',opcoes:['177','1 527','1 752','1 775'],conteudo:'Aritmética: números naturais e operações fundamentais'}],
])
await fs.mkdir(`${destino}/lotes`,{recursive:true})
let total=0,disponiveis=0,pendentes=0,alterados=0,suspensas=0,transcritas=0
for(const [i,lote] of m.lotes.entries()){
 let b
 try{b=await fs.readFile(path.join(base,lote.arquivo))}catch(e){if(e.code!=='ENOENT')throw e;b=await lerArquivoAtual(lote.arquivo)}
 const qs=JSON.parse(zlib.gunzipSync(b));let mudou=false
 for(const q of qs){
  total++
  if(motivos.has(q.id)||ajustes.has(q.id)){
   assert.equal(q.documento_id,documento)
   const old=originais.get(q.id),antes=structuredClone(q)
   assert.equal(q.enunciado,old.enunciado);assert.deepEqual(q.opcoes,old.opcoes)
   const imagem=path.join('public/acervo-extraido',q.pagina_imagem),evidencia={imagem:q.pagina_imagem,sha256:sha(await fs.readFile(imagem)),pagina:q.pagina,metodo:'Conferência visual individual da página original',antes_sha256:sha(JSON.stringify([q.enunciado,q.opcoes]))}
   if(motivos.has(q.id)){
    const motivo=motivos.get(q.id)
    q.integridade_profissional={...q.integridade_profissional,apta_resolucao:false,correcao_automatica:false,verificada_individualmente:true,pendencias:[...new Set([...(q.integridade_profissional?.pendencias||[]),'revisao_visual_impeditiva'])]}
    q.elegibilidade={...q.elegibilidade,elegivel_para_resolucao:false,elegivel_para_correcao_automatica:false,apontamentos:[...new Set([...(q.elegibilidade?.apontamentos||[]),'revisao_visual_impeditiva'])]}
    q.revisao_visual_saeb={...evidencia,motivo};suspensas++
   }else{
    Object.assign(q,ajustes.get(q.id),{materia:'Matemática',classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:1,classificacao_metodo:'Leitura visual individual do enunciado e alternativas na página 188',dificuldade:'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa pedagógica: uma operação aritmética ou comparação direta entre conjuntos finitos; não é índice estatístico da banca.'})
    q.revisao_visual_saeb={...evidencia,motivo:'Símbolos e alternativas transcritos conforme a prova; sem atribuir gabarito oficial.'}
    for(const [campo,chave]of [['integridade_profissional','pendencias'],['elegibilidade','apontamentos']])if(q[campo]?.[chave])q[campo][chave]=q[campo][chave].filter(x=>x!=='classificacao_especifica_pendente')
    transcritas++
   }
   for(const campo of ['ano','resposta_correta','gabarito_oficial','pagina_imagem','imagens_paginas','texto_apoio'])assert.deepEqual(q[campo],antes[campo])
   mudancas.push({id:q.id,antes,depois:q});mudou=true
  }
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
  if(q.classificacao_pendente)pendentes++
 }
 facetas.adicionar(i,qs)
 if(mudou){const novo=zlib.gzipSync(JSON.stringify(qs),{level:9});lote.arquivo=`lotes/saeb-visual-${i}-${sha(novo).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,lote.arquivo),novo);alterados++}
}
assert.equal(suspensas,8);assert.equal(transcritas,3);assert.equal(total,m.questoes_extraidas_unicas);assert.equal(disponiveis,m.questoes_disponiveis_resolucao-8)
const f=facetas.finalizar();assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),disponiveis)
const b=zlib.gzipSync(JSON.stringify(f),{level:9}),arquivo=`lotes/filtros-saeb-visual-${sha(b).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,arquivo),b);m.indice_facetas={arquivo,sha256:sha(b),versao:1};m.questoes_disponiveis_resolucao=disponiveis;m.gerado_em=new Date().toISOString()
await fs.copyFile(path.join(base,'visuais.json'),path.join(destino,'visuais.json'));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(m))
const r={gerado_em:m.gerado_em,total,disponiveis,pendentes,suspensas,transcritas,lotes_alterados:alterados,publicado:false,sem_exclusao_fisica:true,ano_e_gabarito_preservados:true}
await fs.writeFile('docs/acervo/revisao-profissional/revisao-saeb.json',JSON.stringify(r,null,2));await fs.writeFile('docs/acervo/revisao-profissional/revisao-saeb-alteracoes.json.gz',zlib.gzipSync(JSON.stringify(mudancas),{level:9}));console.log(JSON.stringify(r))
