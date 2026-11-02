import {chaveCampoFiltro, grupoConteudo, normalizarBanca, normalizarMateria} from './filtros.js'

export const CAMPOS_ACERVO=['banca','ano','materia','conteudo','dificuldade']
const caches=new WeakMap()
export function valoresFaceta(q) {
 const banca=normalizarBanca(q.banca,q.concurso),materia=normalizarMateria(q.materia,q.conteudo)
 const conteudo=grupoConteudo(q.conteudo,materia,`${q.enunciado||''} ${(q.opcoes||[]).join(' ')}`)
 return [
  [chaveCampoFiltro('banca',banca),banca==='FUVEST'?'USP (FUVEST)':banca.startsWith('PUC')?'PUC':banca],
  [q.ano?String(q.ano):'sem-ano',q.ano?String(q.ano):'Ano não identificado'],
  [chaveCampoFiltro('materia',materia),materia],
  [conteudo.value,conteudo.label],
  [chaveCampoFiltro('dificuldade',q.dificuldade),q.dificuldade||''],
 ]
}
// Dicionários + contagens conjuntas: filtros exatos sem baixar os enunciados.
export function criarIndiceFacetas() {
 const dicionarios=CAMPOS_ACERVO.map(()=>[]),mapas=CAMPOS_ACERVO.map(()=>new Map()),linhas=[]
 return {
  adicionar(lote,questoes) {
   const grupos=new Map()
   for(const q of questoes){
    if(q.integridade_profissional?.apta_resolucao===false)continue
    const ids=valoresFaceta(q).map(([valor,rotulo],i)=>{
     if(!mapas[i].has(valor)){mapas[i].set(valor,dicionarios[i].length);dicionarios[i].push({value:valor,label:rotulo})}
     return mapas[i].get(valor)
    })
    const chave=ids.join(',');const grupo=grupos.get(chave)||{ids,total:0};grupo.total++;grupos.set(chave,grupo)
   }
   for(const {ids,total}of grupos.values())linhas.push([lote,...ids,total])
  },
  finalizar(){return {versao:1,campos:CAMPOS_ACERVO,dicionarios,linhas}},
 }
}
function preparar(manifesto){
 if(caches.has(manifesto))return caches.get(manifesto)
 const indice=manifesto?.facetas
 if(!indice||indice.versao!==1||indice.campos?.join()!==CAMPOS_ACERVO.join())return null
 // Índices antigos podem conter categorias brutas, marcadores de extração e
 // variações de matéria. Reagrupa as linhas com a mesma taxonomia do app antes
 // de expor as opções; as questões e seus metadados originais não são alterados.
 const dicionarios=CAMPOS_ACERVO.map(()=>[]),mapas=CAMPOS_ACERVO.map(()=>new Map()),linhasAgrupadas=new Map()
 const canonicalizar=(campo,entrada,materia='')=>{
  const bruto=String(entrada?.label??entrada?.value??'').trim()
  if(campo==='banca'){
   const label=normalizarBanca(bruto)
   return [chaveCampoFiltro('banca',label),label]
  }
  if(campo==='ano'){
   const match=bruto.match(/(?:^|\D)(19\d{2}|20\d{2})(?:\D|$)/u)
   return match?[match[1],match[1]]:['sem-ano','Ano não identificado']
  }
  if(campo==='materia'){
   const label=normalizarMateria(bruto)
   return [chaveCampoFiltro('materia',label),label]
  }
  if(campo==='conteudo'){
   const grupo=grupoConteudo(bruto,materia)
   return [grupo.value,grupo.label]
  }
  if(campo==='dificuldade'){
   const chave=bruto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR')
   const label=({facil:'Fácil',media:'Média',medio:'Média',dificil:'Difícil'})[chave]
   return label?[chaveCampoFiltro('dificuldade',label),label]:['','']
  }
  return [String(entrada?.value??''),bruto]
 }
 const adicionar=(i,valor,rotulo)=>{
  if(!mapas[i].has(valor)){mapas[i].set(valor,dicionarios[i].length);dicionarios[i].push({value:valor,label:rotulo})}
  return mapas[i].get(valor)
 }
 for(const linha of indice.linhas){
  const idsOriginais=linha.slice(1,6),materiaOriginal=indice.dicionarios[2][idsOriginais[2]]
  const materia=canonicalizar('materia',materiaOriginal)[1]
  const ids=idsOriginais.map((id,i)=>{
   const campo=CAMPOS_ACERVO[i],entrada=indice.dicionarios[i][id]
   const [valor,label]=canonicalizar(campo,entrada,materia)
   return adicionar(i,valor,label)
  })
  const chave=[linha[0],...ids].join(',')
  linhasAgrupadas.set(chave,(linhasAgrupadas.get(chave)||0)+(Number(linha[6])||0))
 }
 const linhas=[...linhasAgrupadas].map(([chave,total])=>[...chave.split(',').map(Number),total])
 const porLote=new Map()
 for(const linha of linhas){if(!porLote.has(linha[0]))porLote.set(linha[0],[]);porLote.get(linha[0]).push(linha)}
 const pronto={...indice,dicionarios,linhas,porLote};caches.set(manifesto,pronto);return pronto
}
function corresponde(linha,indice,filtros,ignorar=-1){
 return CAMPOS_ACERVO.every((campo,i)=>i===ignorar||!filtros[campo]?.length||filtros[campo].includes(indice.dicionarios[i][linha[i+1]]?.value))
}
export function opcoesFacetasAcervo(manifesto,filtros={}){
 const indice=preparar(manifesto)
 if(!indice)return {}
 return Object.fromEntries(CAMPOS_ACERVO.map((campo,i)=>{
  const totais=new Map()
  for(const linha of indice.linhas)if(corresponde(linha,indice,filtros,i))totais.set(linha[i+1],(totais.get(linha[i+1])||0)+linha[6])
  return [campo,[...totais].map(([id,quantidade])=>({...indice.dicionarios[i][id],quantidade})).filter(o=>o.value)]
 }))
}
export function loteCorrespondeFacetas(manifesto,numero,filtros={}){
 const indice=preparar(manifesto)
 if(!indice)return null
 return (indice.porLote.get(numero)||[]).some(linha=>corresponde(linha,indice,filtros))
}
