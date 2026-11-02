import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='1deda52304d7edf3',root=raizesAtuais[0]
if(!root.includes('revisao-fub-taxidermista-2016-v225'))throw Error('A raiz ativa não é v225')
const manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
const keys=['C E E C C C E E E E C C E E C E E C C C','C C C E E E E C E C C E E C C E C C E E','C E C C E C C E E C E E C C C E C E C E','C C C C E E E C E E'].flatMap(x=>x.split(' '))
if(catalog?.questoes.length!==74||keys.length!==70)throw Error('Catálogo ou gabarito incompleto')
const wanted=new Set(catalog.questoes.map(x=>x.id)),found=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo?.startsWith('lotes/revisao-fub-taxidermista-2016-v225-'))continue;for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/${lot.arquivo}`))))if(wanted.has(q.id))found.set(q.id,q)}
if(found.size!==74)throw Error(`Esperados 74 registros do documento, encontrados ${found.size}`)
const canonical=new Map([[54,'extr-838dbbaa7e0aaeb14f56'],[61,'extr-ef4a54de78a9cb804703'],[65,'extr-b34066d39a36f232b532'],[66,'extr-436c0767dda8c9624e1e']]),seen=new Set(),duplicates=[]
for(const q of found.values()){
 const n=q.numero_original
 if(!n||n<51||n>120)throw Error(`Número original ausente/inválido em ${q.id}`)
 if(canonical.has(n)&&q.id!==canonical.get(n)){
  duplicates.push(q.id)
  if(q.integridade_profissional?.apta_resolucao!==false||q.elegibilidade?.elegivel_para_resolucao!==false||q.duplicada_de!==canonical.get(n))throw Error(`Duplicata ${n} continua elegível ou sem vínculo`)
  continue
 }
 if(seen.has(n))throw Error(`Item oficial repetido ${n}`);seen.add(n)
 const k=keys[n-51]
 if(q.classificacao_pendente||!q.classificacao_revisada||!q.materia||!q.conteudo||q.ano!==2016||!q.concurso||!q.texto_apoio||!q.revisao_semantica_visual)throw Error(`Classificação/contexto incompleto: ${n}`)
 if(q.opcoes?.join('|')!=='Certo|Errado'||q.gabarito_oficial?.valor!==k)throw Error(`Formato ou gabarito divergente: ${n}`)
 await fs.access(`public/acervo-extraido/${q.pagina_imagem}`)
 if(!q.imagens_paginas?.length)throw Error(`Página original não associada: ${n}`)
 if(q.anulada||q.resposta_correta!==(k==='C'?0:1))throw Error(`Resposta divergente: ${n}`)
 if(n===54&&!q.enunciado.startsWith('O timo consiste'))throw Error('OCR do item 54 não foi corrigido')
 if(n===61&&!q.enunciado.includes('2 (I3/3 – C1/1 – P3/2 – M1/1)'))throw Error('Fórmula dental do item 61 está incompleta')
 if(n>=111&&n<=115&&!q.imagens_paginas.includes('paginas/'+doc+'-0003.webp'))throw Error(`Visual taxonômico ausente no item ${n}`)
}
if(seen.size!==70||duplicates.length!==4)throw Error(`Cobertura única/duplicatas incorreta: ${seen.size}/70, dup ${duplicates.length}/4`)
const rootManifest=manifest
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:rootManifest.questoes_extraidas_unicas,questoes_disponiveis:rootManifest.questoes_disponiveis_resolucao,pendencias_elegiveis_classificacao:98662,registros_documento:74,itens_unicos:70,duplicatas_inelegiveis:duplicates.length,com_gabarito_definitivo:70,anuladas:[],imagem_etiqueta_taxonômica_associada:true,paginas_originais_verificadas:[1,2,3],pendencias_neste_caderno:0,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-fub-taxidermista-2016-v225.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
