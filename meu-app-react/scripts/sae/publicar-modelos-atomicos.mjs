import fs from 'node:fs/promises'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {acervo,unirQuestoes,questaoPublicavel} from '../../src/acervo.js'
import {classificarReferencia} from './classificacao.mjs'

const raiz='tmp/sae-importacao', destino='public/acervo/estudo-quimica-modelos'
const cap=JSON.parse(await fs.readFile(`${raiz}/capitulos/695c1076ba77cf5c87d7e6d2.json`,'utf8'))
const textoBruto=n=>typeof n==='string'?n:(n?.children||[]).map(textoBruto).join('')
const sub='₀₁₂₃₄₅₆₇₈₉',sup='⁰¹²³⁴⁵⁶⁷⁸⁹'
export function textoDoBloco(n) {
 if(typeof n==='string')return n.replace(/\s+/gu,' ')
 if(!n)return ''
 const classe=n.attrs?.class||''
 if(classe.split(/\s+/).includes('numeracao') || n.tag==='a'&&/^Resolução$/iu.test(textoBruto(n)))return ''
 if(n.tag==='img')return ''
 if(['script','style','svg','math'].includes(n.tag))throw Error('Bloco exige renderização visual específica')
 if(n.tag==='table') {
  const linhas=[];function visitar(x){if(typeof x==='string')return;if(x.tag==='tr')linhas.push((x.children||[]).filter(c=>c?.tag==='td'||c?.tag==='th').map(c=>textoDoBloco(c).trim()).join(' | '));else(x.children||[]).forEach(visitar)}visitar(n);return '\n\n'+linhas.join('\n')+'\n\n'
 }
 let t=(n.children||[]).map(textoDoBloco).join('')
 if(n.tag==='sub'||n.tag==='sup'){const digitos=n.tag==='sub'?sub:sup;t=t.replace(/\d/g,d=>digitos[Number(d)])}
 return ['p','h1','h2','h3','h4','li','div','figure'].includes(n.tag)?'\n\n'+t.trim()+'\n\n':t
}
const limpar=t=>t.replace(/^[\s\u00a0]*(?:C?\d+\s*:\s*H\d+\s*)+/iu,'').replace(/[ \t]+/g,' ').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim()
const norm=t=>String(t).replace(/ℓ/g,'l').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'')
const chave=q=>(q.opcoes||[]).map(norm).sort().join('|')
const anteriores=[...acervo]
for(const pasta of await fs.readdir('public/acervo',{withFileTypes:true}))if(pasta.isDirectory()&&pasta.name!=='estudo-quimica-modelos'){
 try{const itens=JSON.parse(await fs.readFile(`public/acervo/${pasta.name}/questoes.json`,'utf8'));if(Array.isArray(itens))anteriores.push(...itens)}catch(e){if(e.code!=='ENOENT')throw e}
}
const index=new Map();for(const q of anteriores){const k=chave(q);if(!index.has(k))index.set(k,[]);index.get(k).push(q)}
const conflitos=new Map([
 ['sae-248c91527e181959cc6e','A marcação B contradiz as alternativas e a explicação do próprio material sobre Rutherford. Aguardar conferência.'],
 ['sae-39c447ae09a4951440b9','A sequência marcada 3–2–1–4 contradiz a associação histórica apresentada. Aguardar gabarito original da UPF.'],
 ['sae-f376e2c3c07b6e39e5a8','Os índices atômicos do material (B com massa 21) não sustentam a alternativa marcada. Aguardar conferência com a aplicação IFCE 2019.'],
])
await fs.mkdir(destino,{recursive:true})
const publicados=[],quarentena=[],duplicatas=[],recursos=new Map()
for(const q of cap.questoes){
 if(conflitos.has(q.id)){quarentena.push({id:q.id,motivo:conflitos.get(q.id)});continue}
 if(q.tipo_resposta!=='multipla_escolha'||q.resposta_correta===null){quarentena.push({id:q.id,motivo:'Discursiva ou sem marcação única de gabarito'});continue}
 const enunciado=limpar(q.enunciado_blocos.map(textoDoBloco).join('\n'))
 const referencia=classificarReferencia(q.enunciado_blocos.map(textoBruto).join(' '))
 const dificuldade=q.enunciado_blocos.some(n=>n.attrs?.class?.includes('iconeDificil'))?'Difícil':q.enunciado_blocos.some(n=>n.attrs?.class?.includes('iconeMedio'))?'Média':'Não informada'
 const item={id:q.id,materia:q.materia,conteudo:q.conteudo,...referencia,dificuldade,enunciado,
  opcoes:q.alternativas.map(a=>a.texto),resposta_correta:q.resposta_correta,tipo_resposta:'multipla_escolha',
  fonte_gabarito:'Marcação do gabarito do material autorizado, conferida na revisão do lote',origem_livro:{...q.origem_livro,secao:q.secao,numero:q.numero_livro},apoio:[]}
 // Erratas exclusivamente ortográficas; nenhuma resposta é alterada.
 if(q.id==='sae-d1a33b9da92aeee2f6bf')item.opcoes=item.opcoes.map(t=>t.replace('Rutherford-Bhor','Rutherford-Bohr'))
 if(q.id==='sae-77f605056beb4c9c3d5b')item.opcoes=item.opcoes.map(t=>t.replace('fórmula&','fórmula'))
 const semelhantes=index.get(chave(item))||[]
 const jaExiste=semelhantes.find(a=>{const x=norm(a.enunciado),y=norm(item.enunciado);return x.includes(y)||y.includes(x)||x.includes(y.slice(0,100))||y.includes(x.slice(0,100))})
 if(jaExiste){duplicatas.push({id:q.id,existente:jaExiste.id});continue}
 const imagens=[];function buscar(n){if(!n||typeof n==='string')return;if(n.tag==='img')imagens.push(n.attrs.src);(n.children||[]).forEach(buscar)}q.enunciado_blocos.forEach(buscar)
 if(imagens.length){
  const possuiImagem=n=>n&&typeof n!=='string'&&(n.tag==='img'||(n.children||[]).some(possuiImagem))
  const posicao=q.enunciado_blocos.findIndex(possuiImagem)
  item.enunciado_antes_apoio=limpar(q.enunciado_blocos.slice(0,posicao).map(textoDoBloco).join('\n'))
  item.enunciado_depois_apoio=limpar(q.enunciado_blocos.slice(posicao).map(textoDoBloco).join('\n'))
 }
 for(const url of new Set(imagens)){
  const asset=cap.arquivos.find(a=>a.url===url);if(!asset)throw Error('Imagem ausente: '+url)
  const extensao=path.extname(asset.arquivo).toLowerCase();if(!['.jpg','.jpeg','.png','.webp'].includes(extensao))throw Error('Formato não conferido')
  const bytes=await fs.readFile(path.join(raiz,asset.arquivo));const nome=createHash('sha256').update(bytes).digest('hex').slice(0,20)+extensao
  await fs.writeFile(path.join(destino,nome),bytes);const imagem='/acervo/estudo-quimica-modelos/'+nome
  recursos.set(imagem,{imagem,sha256:createHash('sha256').update(bytes).digest('hex'),origem:url})
  item.apoio.push({imagem,texto:`Figura de apoio do exercício de ${q.conteudo}; atribuição preservada no enunciado.`})
 }
 if(!questaoPublicavel(item))throw Error('Questão recusada pela validação do acervo: '+q.id)
 publicados.push(item);if(!index.has(chave(item)))index.set(chave(item),[]);index.get(chave(item)).push(item)
}
const noAcervo=unirQuestoes([...anteriores,...publicados]);const ids=new Set(noAcervo.map(q=>String(q.id)))
for(const q of publicados)if(!ids.has(q.id))throw Error('Lote removido pela deduplicação final: '+q.id)
await fs.writeFile(`${destino}/questoes.json`,JSON.stringify(publicados,null,2)+'\n')
await fs.mkdir('docs/acervo',{recursive:true})
await fs.writeFile('docs/acervo/estudo-quimica-modelos.json',JSON.stringify({capitulo:cap.capitulo,id_capitulo:cap.id_capitulo,total_extraido:cap.questoes.length,publicados:publicados.map(q=>q.id),quarentena,duplicatas,recursos:[...recursos.values()],observacoes:['Não foi usado o recorte antigo: desalinhamento visual identificado.','Figuras originais são recursos locais; tabelas são preservadas como linhas com colunas separadas por |; índices químicos em Unicode.','Nenhuma marcação de gabarito foi corrigida por inferência. Questões contraditórias permaneceram em quarentena.']},null,2)+'\n')
console.log(JSON.stringify({publicados:publicados.length,quarentena:quarentena.length,duplicatas:duplicatas.length,imagens:recursos.size}))
