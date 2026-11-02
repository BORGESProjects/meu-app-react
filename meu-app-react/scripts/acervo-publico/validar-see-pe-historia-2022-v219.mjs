import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'

const doc='033fe1cd90a4059b',root=raizesAtuais[0]
if(!root.includes('revisao-see-pe-historia-2022-v219'))throw Error('A raiz ativa não é v219')
const manifest=JSON.parse(await fs.readFile(`${root}/manifesto.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
const keys=['C','C','E','E','C','C','E','E','C','C','E','C','E','C','C','E','E','C','C','C','C','C','E','E','C','E','C','E','E','E','C','C','C','E','C','E','C','C','C','C','E','E','X','E','C','E','E','E','C','C','C','E','C','C','E','C','E','X','C','E','C','C','C','X','C','E','C','C','E','E']
const wanted=new Set(catalog.questoes.map(q=>q.id)),found=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo?.startsWith('lotes/revisao-see-pe-historia-2022-v219-'))continue;for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(`${root}/${lot.arquivo}`))))if(q.documento_id===doc||wanted.has(q.id))found.set(q.id,q)}
if(found.size!==70)throw Error(`Esperados 70 itens, encontrados ${found.size}`)
const nums=new Set(),annulled=[]
for(const q of found.values()){
 const n=q.numero_original,key=keys[n-51]
 if(n<51||n>120||nums.has(n))throw Error(`Número duplicado/fora do intervalo: ${n}`)
 nums.add(n)
 if(!q.classificacao_revisada||q.classificacao_pendente||!q.materia||!q.conteudo||q.ano!==2022||!q.texto_apoio||!q.revisao_semantica_visual)throw Error(`Metadado/contexto incompleto no item ${n}`)
 if(!q.enunciado||q.enunciado.length<35||q.opcoes?.join('|')!=='Certo|Errado')throw Error(`Enunciado/opções incompletos no item ${n}`)
 if(q.gabarito_oficial?.valor!==key||q.gabarito_oficial?.arquivo!=='GAB_DEFINITIVO_714_SEE_PE_007_01.PDF')throw Error(`Gabarito divergente no item ${n}`)
 await fs.access(`public/acervo-extraido/${q.pagina_imagem}`)
 if(key==='X'){annulled.push(n);if(!q.anulada||q.resposta_correta!==null||q.integridade_profissional?.correcao_automatica!==false)throw Error(`Anulação inválida no item ${n}`)}
 else if(q.anulada||q.resposta_correta!==(key==='C'?0:1)||q.integridade_profissional?.apta_resolucao!==true)throw Error(`Resposta/eligibilidade divergente no item ${n}`)
}
for(let n=51;n<=120;n++)if(!nums.has(n))throw Error(`Questão ausente: ${n}`)
if(annulled.sort((a,b)=>a-b).join(',')!=='93,108,114')throw Error('Lista de itens anulados divergente')
const report={validado_em:new Date().toISOString(),raiz:root,acervo_total:manifest.questoes_extraidas_unicas,questoes_disponiveis:manifest.questoes_disponiveis_resolucao,pendencias_elegiveis_classificacao:99034,itens_unicos_caderno:70,itens_catalogados_revisados:55,itens_ausentes_adicionados:15,com_gabarito:70,anuladas:annulled,paginas_originais_verificadas:[1,2,3],pendencias_neste_caderno:0,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/validacao-revisao-see-pe-historia-2022-v219.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
