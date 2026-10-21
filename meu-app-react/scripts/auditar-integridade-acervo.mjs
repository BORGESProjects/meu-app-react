import fs from 'node:fs'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {acervo,corrigirQuestaoConferida,questaoPublicavel,unirQuestoes} from '../src/acervo.js'
import {problemasDeIntegridade,separarRodapeEditorial} from '../src/qualidadeQuestao.js'

const sha=valor=>createHash('sha256').update(valor).digest('hex')
const entradas=acervo.map(q=>({fonte:'src/data',q}))
for(const pasta of fs.readdirSync('public/acervo',{withFileTypes:true}).filter(d=>d.isDirectory())){
 const arquivo=`public/acervo/${pasta.name}/questoes.json`
 if(fs.existsSync(arquivo))for(const q of JSON.parse(fs.readFileSync(arquivo)))entradas.push({fonte:arquivo,q})
}
const externas=process.argv.slice(2),snapshots=[]
const entradasExternas=[]
for(const arquivo of externas){
 const bytes=fs.readFileSync(arquivo),itens=JSON.parse(bytes)
 if(!Array.isArray(itens))throw Error('Snapshot não é uma lista')
 snapshots.push({arquivo:path.basename(arquivo),sha256:sha(bytes),registros:itens.length})
 for(const q of itens)entradasExternas.push({fonte:path.basename(arquivo),q})
}
// Mesma precedência da aplicação: banco, importadas, cadernos publicados.
entradas.unshift(...entradasExternas)
const cache=new Map(),arquivosAusentes=[],problemas=[],limpezas=[],pendenciasVisuais=[]
function recursos(q){
 const encontrados=new Set()
 function visitar(n){if(!n||typeof n!=='object')return
  for(const [chave,v] of Object.entries(n)){
   if(typeof v==='string'&&['imagem_original','pagina_imagem','imagem','src'].includes(chave)&&v.startsWith('/acervo/'))encontrados.add(v)
   if(chave==='opcoes_imagens'&&Array.isArray(v))for(const img of v)if(typeof img==='string'&&img.startsWith('/acervo/'))encontrados.add(img)
   if(v&&typeof v==='object')visitar(v)
  }
 }
 visitar(q);return [...encontrados]
}
function conferirImagem(url){
 if(cache.has(url))return cache.get(url)
 const raiz=path.resolve('public'),arquivo=path.resolve(raiz,'.'+url)
 let erro=null
 if(!arquivo.startsWith(raiz+path.sep)||!fs.existsSync(arquivo))erro='arquivo_ausente'
 else {const b=fs.readFileSync(arquivo);const png=b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),jpg=b[0]===255&&b[1]===216&&b[2]===255,webp=b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP';if(b.length<100||!png&&!jpg&&!webp)erro='arquivo_visual_invalido'}
 cache.set(url,erro);return erro
}
for(const {fonte,q:original} of entradas){
 const q=corrigirQuestaoConferida(original),itens=problemasDeIntegridade(q)
 const base={fonte,id:String(q.id),sha256:sha(JSON.stringify(original))}
 if(itens.length)problemas.push({...base,motivos:itens})
 for(const [indice,opcao] of (original.opcoes||[]).entries())if(separarRodapeEditorial(opcao).removido)limpezas.push({...base,indice})
 for(const url of recursos(q)){const erro=conferirImagem(url);if(erro)arquivosAusentes.push({...base,url,motivo:erro})}
 // Indicadores para conferência na fonte; não são prova de erro nem autorização para apagar.
 if(questaoPublicavel(q)&&!q.imagem_original&&!q.pagina_imagem&&!q.texto_apoio&&!q.apoio?.length&&!q.blocos_enunciado&&/(?:sublinhad[oa]|em negrito|destacad[oa]|linhas?\s+\d)/iu.test(q.enunciado))pendenciasVisuais.push({...base,motivo:'Conferir destaque tipográfico ou contexto referido; texto simples não comprova a preservação.'})
}
const publicaveis=entradas.filter(({q})=>questaoPublicavel(corrigirQuestaoConferida(q))).length
const contagem=Object.fromEntries([...new Set(problemas.flatMap(q=>q.motivos.map(m=>m.codigo)))].map(codigo=>[codigo,problemas.filter(q=>q.motivos.some(m=>m.codigo===codigo)).length]))
const relatorio={escopo:'Verificação estrutural de cada registro das fontes publicadas, banco e central de importações; não equivale à resolução ou conferência visual de todas as provas.',snapshots,total_registros:entradas.length,registros_publicaveis:publicaveis,total_apos_uniao:unirQuestoes(entradas.map(e=>e.q)).length,recursos_locais_verificados:cache.size,problemas_por_tipo:contagem,problemas,rodapes_editoriais_limpos:limpezas,arquivos_ausentes_ou_invalidos:arquivosAusentes,conferencia_tipografica_pendente:pendenciasVisuais}
const remotos='tmp/auditoria-recursos-remotos.json'
if(fs.existsSync(remotos))relatorio.recursos_remotos=JSON.parse(fs.readFileSync(remotos))
const manifestoImagens=JSON.stringify([...cache.keys()])
fs.writeFileSync('tmp/imagens-auditoria.json',manifestoImagens)
if(fs.existsSync('tmp/auditoria-pixels.json')){const pixels=JSON.parse(fs.readFileSync('tmp/auditoria-pixels.json'));if(pixels.manifesto_sha256===sha(manifestoImagens))relatorio.decodificacao_imagens=pixels}
fs.writeFileSync('docs/acervo/auditoria-integridade.json',JSON.stringify(relatorio,null,2)+'\n')
console.log(JSON.stringify({registros:entradas.length,uniao:relatorio.total_apos_uniao,problemas:problemas.length,tipos:contagem,rodapes:limpezas.length,recursos:cache.size,arquivos_faltantes:arquivosAusentes.length,destaques_para_revisao:pendenciasVisuais.length}))
