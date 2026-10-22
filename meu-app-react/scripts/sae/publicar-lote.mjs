import fs from 'node:fs'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {classificarReferencia} from './classificacao.mjs'
import {normalizarBlocos,textoDosBlocos,textoBruto} from './formato-publicacao.mjs'
import {acervo,questaoPublicavel,unirQuestoes} from '../../src/acervo.js'
import {assinaturaVisualBlocos} from '../../src/blocosQuestao.js'
import {recuperarFonteOficial} from './recuperacoes-oficiais.mjs'
import {problemaDeGabarito,alternativasDistintas} from './validacao-livros.mjs'


export function publicarLote({pasta,definicoes,conflitos=new Map(),conteudoPara,apoioIntegradoIds=new Set(),fontesAdicionais=[]}) {
 if(!/^estudo-[a-z0-9-]+$/u.test(pasta))throw Error('Pasta de lote inválida')
 const destino='public/acervo/'+pasta,raiz='tmp/sae-importacao'
 const capitulos=definicoes.map(([id,conteudo])=>({...JSON.parse(fs.readFileSync(raiz+'/capitulos/'+id+'.json','utf8')),conteudo}))
fs.mkdirSync(destino,{recursive:true})
const arquivos=new Map(),lote=[],quarentena=[],duplicatas=[]
const norm=t=>String(t).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'')
const chave=q=>(q.opcoes||[]).map(norm).sort().join('|')+'::'+assinaturaVisualBlocos(q)
const anteriores=[...acervo,...fontesAdicionais]
for(const dir of fs.readdirSync('public/acervo',{withFileTypes:true}))if(dir.isDirectory()&&dir.name!==pasta){const f=`public/acervo/${dir.name}/questoes.json`;if(fs.existsSync(f))anteriores.push(...JSON.parse(fs.readFileSync(f,'utf8')))}
const indiceOpcoes=new Map()
const indexar=q=>{const k=chave(q);if(!indiceOpcoes.has(k))indiceOpcoes.set(k,[]);indiceOpcoes.get(k).push(q)}
anteriores.forEach(indexar)
const textoComparavel=q=>{
 const t=String(q.enunciado||'')
 return norm(classificarReferencia(t).tipo_origem==='prova_identificada'?t.replace(/^\s*\([^)]{1,100}\)\s*/u,''):t)
}
const respostaTexto=q=>{const i=Number.isInteger(q.resposta_correta)?q.resposta_correta:/^[A-E]$/iu.test(String(q.resposta_correta))?String(q.resposta_correta).toUpperCase().charCodeAt(0)-65:-1;return i>=0?norm(q.opcoes?.[i]||''):''}
for(const cap of capitulos){
 function copiarImagem(url){
  const ar=cap.arquivos.find(a=>a.url===url);if(!ar)throw Error('Figura ausente')
  const bytes=fs.readFileSync(path.join(raiz,ar.arquivo)),hash=createHash('sha256').update(bytes).digest('hex'),ext=path.extname(ar.arquivo).toLowerCase()
  if(!['.jpg','.jpeg','.png','.webp'].includes(ext))throw Error('Formato não conferido')
  const nome=hash.slice(0,20)+ext,imagem='/acervo/'+pasta+'/'+nome
  arquivos.set(imagem,{imagem,sha256:hash,origem:url});fs.writeFileSync(path.join(destino,nome),bytes);return imagem
 }
 for(const original of cap.questoes){
  let q=original
  const excluir=motivo=>quarentena.push({id:q.id,capitulo:cap.capitulo,numero:q.numero_livro,motivo})
  if(conflitos.has(q.id)){excluir(conflitos.get(q.id));continue}
  try{q=recuperarFonteOficial(original)}catch(e){excluir('Recuperação oficial pendente: '+e.message);continue}
  const referencia=classificarReferencia(q.enunciado_blocos.map(textoBruto).join(' '))
  if(referencia.referencia_pendente){excluir('Referência institucional não reconhecida; conferir antes de classificar: '+referencia.referencia_pendente);continue}
  const problemaChave=problemaDeGabarito(q)
  if(problemaChave){excluir(problemaChave);continue}
  let blocos_enunciado,blocos_opcoes
  try{blocos_enunciado=normalizarBlocos(q.enunciado_blocos,copiarImagem);blocos_opcoes=q.alternativas.map(a=>normalizarBlocos([a.bloco],copiarImagem,{alternativa:true}))}catch(e){excluir('Formatação ou figura pendente: '+e.message);continue}
  const opcoes=blocos_opcoes.map((b,i)=>textoDosBlocos(b)||`Diagrama da alternativa ${'ABCDE'[i]}`)
  if(!alternativasDistintas(opcoes,blocos_opcoes)){excluir('Alternativas vazias ou repetidas, considerando também fórmulas e figuras.');continue}
  const dificuldade=q.enunciado_blocos.some(n=>n.attrs?.class?.includes('iconeDificil'))?'Difícil':q.enunciado_blocos.some(n=>n.attrs?.class?.includes('iconeFacil'))?'Fácil':q.enunciado_blocos.some(n=>n.attrs?.class?.includes('iconeMedio'))?'Média':'Não informada'
  const item={id:q.id,materia:cap.materia,conteudo:conteudoPara?.(q,cap)||cap.conteudo,...referencia,dificuldade,enunciado:textoDosBlocos(blocos_enunciado),opcoes,blocos_enunciado,blocos_opcoes,...(apoioIntegradoIds.has(q.id)?{apoio_integrado:true}:{}),resposta_correta:q.resposta_correta,tipo_resposta:'multipla_escolha',origem_livro:{...q.origem_livro,numero:q.numero_livro,secao:q.secao},fonte_gabarito:'Marcação no material autorizado e revisão de consistência do lote'}
  if(q.recuperacao_oficial){item.recuperacao_oficial=q.recuperacao_oficial;item.fonte_gabarito=q.recuperacao_oficial.gabarito}
  const t=textoComparavel(item)
  const ja=(indiceOpcoes.get(chave(item))||[]).find(a=>{const outro=textoComparavel(a);return t.length>=30&&t===outro})
  if(ja){if(respostaTexto(ja)!==respostaTexto(item)){excluir('Conteúdo já existente com resposta divergente: '+ja.id);continue}duplicatas.push({id:q.id,existente:ja.id,capitulo:cap.capitulo});continue}
  if(!questaoPublicavel(item)){excluir('Item recusado pelas validações públicas; conferir campos e texto de apoio.');continue}
  lote.push(item)
  indexar(item)
 }
}
const unido=new Set(unirQuestoes([...anteriores,...lote]).map(q=>String(q.id)))
for(let i=lote.length-1;i>=0;i--)if(!unido.has(lote[i].id)){
 const q=lote[i]
 quarentena.push({id:q.id,capitulo:q.origem_livro.capitulo,numero:q.origem_livro.numero,motivo:'Outra representação foi escolhida pela união global do acervo; conferir equivalência antes de publicar novamente.'})
 lote.splice(i,1)
}
const usados=new Set();const coletar=n=>{if(!n||typeof n==='string')return;if(n.src)usados.add(n.src);(n.children||[]).forEach(coletar)}
for(const q of lote){q.blocos_enunciado.forEach(coletar);q.blocos_opcoes.flat().forEach(coletar)}
for(const nome of fs.readdirSync(destino))if(/^[a-f0-9]{20}\.(?:png|jpe?g|webp)$/u.test(nome)&&!usados.has('/acervo/'+pasta+'/'+nome))fs.unlinkSync(path.join(destino,nome))
fs.writeFileSync(destino+'/questoes.json',JSON.stringify(lote,null,2)+'\n')
const auditoria={capitulos:capitulos.map(c=>({id:c.id_capitulo,nome:c.capitulo,total_extraido:c.questoes.length,publicados:lote.filter(q=>q.origem_livro?.id_capitulo===c.id_capitulo).map(q=>q.id)})),total_extraido:capitulos.reduce((s,c)=>s+c.questoes.length,0),publicados:lote.map(q=>q.id),quarentena,duplicatas,recursos:[...arquivos.values()].filter(a=>usados.has(a.imagem)),observacoes:['A referência institucional e o gabarito são os declarados pelo material autorizado, sem alegação de conferência oficial independente.','As questões discursivas, somatórias ou com conflitos não foram convertidas por inferência.','Preservados textos, tabelas, imagens e quantidade original de alternativas.']}
fs.writeFileSync('docs/acervo/'+pasta+'.json',JSON.stringify(auditoria,null,2)+'\n')
console.log(JSON.stringify({publicados:lote.length,quarentena:quarentena.length,duplicatas:duplicatas.length,imagens:usados.size}))
return auditoria
}
