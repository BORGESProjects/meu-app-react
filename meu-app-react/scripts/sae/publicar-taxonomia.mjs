import fs from 'node:fs'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {classificarReferencia} from './classificacao.mjs'
import {normalizarBlocos,textoDosBlocos,textoBruto} from './formato-publicacao.mjs'
import {acervo,questaoPublicavel,unirQuestoes} from '../../src/acervo.js'
const pasta='estudo-biologia-taxonomia',destino='public/acervo/'+pasta,raiz='tmp/sae-importacao'
const cap=JSON.parse(fs.readFileSync(`${raiz}/capitulos/695c1076ba77cf5c87d7e6dd.json`,'utf8'))
fs.mkdirSync(destino,{recursive:true});const arquivos=new Map(),lote=[],quarentena=[],duplicatas=[]
const norm=t=>String(t).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'')
const chave=q=>(q.opcoes||[]).map(norm).sort().join('|')
const anteriores=[...acervo]
for(const dir of fs.readdirSync('public/acervo',{withFileTypes:true}))if(dir.isDirectory()&&dir.name!==pasta){const f=`public/acervo/${dir.name}/questoes.json`;if(fs.existsSync(f))anteriores.push(...JSON.parse(fs.readFileSync(f,'utf8')))}
function copiarImagem(url){
 const ar=cap.arquivos.find(a=>a.url===url);if(!ar)throw Error('Figura ausente')
 const bytes=fs.readFileSync(path.join(raiz,ar.arquivo)),hash=createHash('sha256').update(bytes).digest('hex'),ext=path.extname(ar.arquivo).toLowerCase()
 if(!['.jpg','.jpeg','.png','.webp'].includes(ext))throw Error('Formato não conferido')
 const nome=hash.slice(0,20)+ext,imagem='/acervo/'+pasta+'/'+nome
 arquivos.set(imagem,{imagem,sha256:hash,origem:url});fs.writeFileSync(path.join(destino,nome),bytes);return imagem
}
for(const q of cap.questoes){
 if(q.id==='sae-8739e19fbaeaf5358b95'){quarentena.push({id:q.id,motivo:'Marcação D incompatível com a grafia dos gêneros na alternativa. Necessária conferência com a prova UECE 2019.'});continue}
 if(q.tipo_resposta!=='multipla_escolha'||q.resposta_correta===null){quarentena.push({id:q.id,motivo:'Discursiva ou sem gabarito objetivo único'});continue}
 const blocos_enunciado=normalizarBlocos(q.enunciado_blocos,copiarImagem)
 const blocos_opcoes=q.alternativas.map(a=>normalizarBlocos([a.bloco],copiarImagem,{alternativa:true}))
 const opcoes=blocos_opcoes.map((b,i)=>textoDosBlocos(b)||`Diagrama da alternativa ${'ABCDE'[i]}`)
 const referencia=classificarReferencia(q.enunciado_blocos.map(textoBruto).join(' '))
 const dificuldade=q.enunciado_blocos.some(n=>n.attrs?.class?.includes('iconeDificil'))?'Difícil':q.enunciado_blocos.some(n=>n.attrs?.class?.includes('iconeFacil'))?'Fácil':q.enunciado_blocos.some(n=>n.attrs?.class?.includes('iconeMedio'))?'Média':'Não informada'
 const item={id:q.id,materia:'Biologia',conteudo:'Taxonomia e classificação dos seres vivos',...referencia,dificuldade,
  enunciado:textoDosBlocos(blocos_enunciado),opcoes,blocos_enunciado,blocos_opcoes,resposta_correta:q.resposta_correta,tipo_resposta:'multipla_escolha',
  origem_livro:{...q.origem_livro,numero:q.numero_livro,secao:q.secao},fonte_gabarito:'Marcação no material autorizado e revisão de consistência do lote'}
 const ja=anteriores.find(a=>chave(a)===chave(item)&&(norm(a.enunciado).includes(norm(item.enunciado).slice(0,100))||norm(item.enunciado).includes(norm(a.enunciado).slice(0,100))))
 if(ja){duplicatas.push({id:q.id,existente:ja.id});continue}
 if(!questaoPublicavel(item))throw Error('Item recusado: '+q.id)
 lote.push(item)
}
const unido=new Set(unirQuestoes([...anteriores,...lote]).map(q=>String(q.id)))
for(const q of lote)if(!unido.has(q.id))throw Error('Item excluído na união: '+q.id)
const usados=new Set();const coletar=n=>{if(!n||typeof n==='string')return;if(n.src)usados.add(n.src);(n.children||[]).forEach(coletar)}
for(const q of lote){q.blocos_enunciado.forEach(coletar);q.blocos_opcoes.flat().forEach(coletar)}
for(const [img] of arquivos)if(!usados.has(img))fs.unlinkSync('public'+img)
fs.writeFileSync(destino+'/questoes.json',JSON.stringify(lote,null,2)+'\n')
fs.writeFileSync('docs/acervo/estudo-biologia-taxonomia.json',JSON.stringify({capitulo:cap.capitulo,id_capitulo:cap.id_capitulo,total_extraido:cap.questoes.length,publicados:lote.map(q=>q.id),quarentena,duplicatas,recursos:[...arquivos.values()].filter(a=>usados.has(a.imagem)),observacoes:['Nomes científicos, tabelas com células mescladas e diagramas foram preservados como blocos seguros.','UFGRS é normalizada como UFRGS; a referência original permanece registrada.','Gabaritos contraditórios não foram corrigidos por inferência.']},null,2)+'\n')
console.log(JSON.stringify({publicados:lote.length,quarentena:quarentena.length,duplicatas:duplicatas.length,imagens:usados.size}))
