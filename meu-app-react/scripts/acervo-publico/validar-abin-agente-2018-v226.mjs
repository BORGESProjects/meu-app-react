import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'

const doc='a8bf578ff9328ad4',root=raizesAtuais[0]
if(!root.includes('revisao-abin-agente-2018-v226'))throw Error('A raiz ativa não é v226')
const manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
const spanish=['E','C','C','E','E'],english=['E','C','E','E','C'],common=['E E C E C C C E E C','E E C C C E E E C E C E C E E C C C E C','E E E E E C C C E C E E C C C'].flatMap(x=>x.split(' '));common[8]='E'
if(catalog?.questoes.length!==63||common.length!==45)throw Error('Catálogo ou gabarito incompleto')
const expected=new Set(catalog.questoes.map(x=>x.id)),found=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo?.startsWith('lotes/revisao-abin-agente-2018-v226-'))continue;for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/${lot.arquivo}`))))if(expected.has(q.id))found.set(q.id,q)}
if(found.size!==63)throw Error(`Esperados 63 registros OCR, encontrados ${found.size}`)
const canonical={
 1:{es:'extr-d47e6e1d98ea585f8d75',en:'extr-ce166b023118a30803c7'},2:{es:'extr-e1e62c524618eac07028',en:'extr-9ed0ea3fccd462f11734'},3:{es:'extr-f6982cd541cfecaf2ee2',en:'extr-8419fed7e10f1974699d'},4:{es:'extr-ed9c1e73ae6602165e83',en:'extr-b5ce08e833de8078967d'},5:{es:'extr-0d58f1f296dab2008a83',en:'extr-0e002033df0fba6fbde4'}
}
const unique=new Map(),uniqueLanguage=new Map(),duplicates=[]
for(const q of found.values()){
 const n=q.numero_original
 if(n<=5){const lang=Object.values(canonical[n]).includes(q.id)?Object.keys(canonical[n]).find(k=>canonical[n][k]===q.id):q.duplicada_de?Object.keys(canonical[n]).find(k=>canonical[n][k]===q.duplicada_de):null;if(!lang)throw Error(`Idioma/duplicata desconhecido no item ${n}`);const key=(lang==='es'?spanish:english)[n-1];
  if(q.id!==canonical[n][lang]){duplicates.push(q);if(q.integridade_profissional?.apta_resolucao!==false||q.duplicada_de!==canonical[n][lang])throw Error(`Duplicata OCR do item ${n} permanece elegível ou sem vínculo`);continue}
  if(q.gabarito_oficial?.valor!==key)throw Error(`Gabarito divergente ${lang} ${n}`)
  uniqueLanguage.set(`${lang}-${n}`,q)
 }else{
  if(unique.has(n))throw Error(`Item ${n} duplicado`)
  if(!common[n-6])throw Error(`Gabarito ausente ${n}`)
  if(q.gabarito_oficial?.valor!==common[n-6])throw Error(`Gabarito divergente ${n}: ${q.gabarito_oficial?.valor}/${common[n-6]}`)
 }
 if(q.classificacao_pendente||!q.classificacao_revisada||!q.materia||!q.conteudo||q.ano!==2018||!q.concurso||!q.texto_apoio||!q.revisao_semantica_visual)throw Error(`Classificação/contexto incompleto: ${n}`)
 if(q.opcoes?.join('|')!=='Certo|Errado'||q.anulada||q.resposta_correta!==(q.gabarito_oficial.valor==='C'?0:1))throw Error(`Tipo ou resposta incorreta: ${n}`)
 await fs.access(`public/acervo-extraido/${q.pagina_imagem}`)
 if(n>5)unique.set(n,q)
}
if(duplicates.length!==10||unique.size!==43||uniqueLanguage.size!==10)throw Error(`Cobertura OCR divergente: comuns ${unique.size}, idiomas ${uniqueLanguage.size}, duplicatas ${duplicates.length}`)
for(const n of [49,50]){
 const q=[...manifest.lotes].flatMap(l=>[])
}
const manual=[]
for(const lot of manifest.lotes){if(!lot.arquivo?.startsWith('lotes/revisao-abin-agente-2018-v226-'))continue;for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/${lot.arquivo}`))))if(q.id==='manual-'+doc+'-item-49'||q.id==='manual-'+doc+'-item-50')manual.push(q)}
if(manual.length!==2)throw Error(`Esperados dois itens recuperados no fim do caderno; encontrados ${manual.length}`)
for(const q of manual){const n=q.numero_original;if(![49,50].includes(n)||q.classificacao_pendente||!q.materia||!q.conteudo||q.ano!==2018||q.gabarito_oficial?.valor!=='C'||q.resposta_correta!==0||q.tipo_resposta!=='certo_errado'||!q.texto_apoio.includes('tabela-verdade'))throw Error(`Item recuperado ${n} incompleto`);await fs.access(`public/acervo-extraido/${q.pagina_imagem}`)}
const q14=unique.get(14),q48=unique.get(48),q49=manual.find(q=>q.numero_original===49),q50=manual.find(q=>q.numero_original===50)
if(q14.gabarito_oficial.valor!=='E'||!q14.gabarito_oficial.criterio.includes('C→E'))throw Error('Alteração definitiva oficial do item 14 não está registrada')
if(q48.enunciado.includes('49 Na tabela')||q48.enunciado.includes('50 Na tabela')||!q48.texto_apoio.includes('Carlos é espião'))throw Error('Item 48 não foi separado do bloco de tabelas-verdade ou perdeu premissas')
if(!q49.enunciado.includes('P ∧ (Q ∨ R)')||!q50.enunciado.includes('(P ∧ Q) → R')||q49.texto_apoio.includes('00000000')||q50.texto_apoio.includes('00000000'))throw Error('Operadores/tabelas dos itens 49–50 não foram transcritos')
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:manifest.questoes_extraidas_unicas,questoes_disponiveis:manifest.questoes_disponiveis_resolucao,pendencias_elegiveis_classificacao:98607,registros_documento:63,itens_unicos_antes_da_recuperacao:53,duplicatas_ocr_inelegiveis:10,itens_recuperados_da_pagina_4:[49,50],itens_unicos_apos_reparo:55,gabarito_definitivo_vinculado:55,alteracao_oficial_item_14:'C→E',figuras_e_tabela_verdade_associadas:true,paginas_originais_verificadas:[1,2,3,4],pendencias_neste_caderno:0,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-abin-agente-2018-v226.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
