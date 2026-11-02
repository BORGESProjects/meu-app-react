import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'

const doc='8934a552b36346fb',root=raizesAtuais[0]
if(!root.includes('revisao-anp-combustiveis-2022-v218'))throw Error('A raiz ativa não é v218')
const manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
const keys=['C','E','C','E','E','C','E','E','E','E','C','E','C','E','C','C','C','C','E','E','C','E','C','C','E','C','E','C','C','C','E','E','C','C','E','C','C','E','C','C','E','C','E','E','C','E','E','E','E','C','E','C','E','C','C','E','E','C','C','E','C','E','E','C','E','E','E','C','C','C']
const expectedIds=new Set(catalog.questoes.map(x=>x.id)),found=new Map()
for(const l of manifest.lotes){if(!l.arquivo?.startsWith('lotes/revisao-anp-combustiveis-2022-v218-'))continue;for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/${l.arquivo}`))))if(expectedIds.has(q.id))found.set(q.id,q)}
if(found.size!==76)throw Error(`Esperados 76 registros revisados, encontrados ${found.size}`)
const counts=new Map(),dup=[],unique=[],numberSet=new Set()
for(const q of found.values()){
 const n=q.numero_original;counts.set(n,(counts.get(n)||0)+1)
 if(q.classificacao_pendente||!q.classificacao_revisada||!q.materia||!q.conteudo||q.ano!==2022||!q.revisao_semantica_visual)throw Error(`Classificação/visual ausente em ${q.id}`)
 if(!q.enunciado||q.enunciado.length<35||/CEBRASPE\s*[–|]\s*ANP|\b(?:questão|item)\s*\d{2,3}\s*$/i.test(q.enunciado))throw Error(`Enunciado suspeito em ${q.id}`)
 await fs.access(`public/acervo-extraido/${q.pagina_imagem}`)
 const nkey=keys[n-51],answer=nkey==='C'?0:1
 if(q.resposta_correta!==answer||q.gabarito_oficial?.valor!==nkey||q.gabarito_oficial?.arquivo!=='GAB_PRELIMINAR_725_ANP_001_01.PDF')throw Error(`Gabarito divergente no item ${n}`)
 if(q.integridade_profissional?.apta_resolucao===false){dup.push(q);if(!q.duplicada_de)throw Error(`Duplicata sem vínculo de exclusão no item ${n}`)}
 else {unique.push(q);if(numberSet.has(n))throw Error(`Mais de um registro resolvível para o item ${n}`);numberSet.add(n);if(q.integridade_profissional?.apta_resolucao!==true||q.opcoes?.join('|')!=='Certo|Errado')throw Error(`Elegibilidade/opções inválidas no item ${n}`)}
}
if(numberSet.size!==70||counts.size!==70||dup.length!==6)throw Error(`Cobertura inesperada: itens ${numberSet.size}, números ${counts.size}, duplicatas ${dup.length}`)
for(let n=51;n<=120;n++)if(!numberSet.has(n))throw Error(`Item ausente: ${n}`)
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:manifest.questoes_extraidas_unicas,questoes_disponiveis:manifest.questoes_disponiveis_resolucao,pendencias_elegiveis_classificacao:99083,itens_unicos:70,registros_ocr_revisados:76,com_gabarito:70,anuladas:0,duplicatas_preservadas_fora_da_resolucao:dup.length,paginas_originais:3,paginas_verificadas:[1,2,3],pendencias_no_caderno:[...found.values()].filter(q=>q.classificacao_pendente&&!q.classificacao_revisada).length,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-anp-combustiveis-2022-v218.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
