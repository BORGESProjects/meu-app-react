const normalizar=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/gu,'').toLowerCase().replace(/[^a-z0-9]+/gu,' ').trim()
export function confirmarItem(q,paginas){
 const numero=Number(q.numero_original),pagina=Number(q.pagina),texto=paginas?.[pagina-1]
 if(!Number.isInteger(numero)||!texto)return null
 const fonte=normalizar(texto),tokens=normalizar(q.enunciado).replace(/^questao\s+\d+\s/u,'').split(' ')
 let pos=-1,prefixo=''
 for(const quantidade of [12,10,8,6]){
  const candidato=tokens.slice(0,quantidade).join(' ')
  if(candidato.length<24)continue
  const inicio=fonte.indexOf(candidato)
  if(inicio>=0&&fonte.indexOf(candidato,inicio+1)<0){pos=inicio;prefixo=candidato;break}
 }
 if(pos<0)return null
 const linhas=String(texto).normalize('NFD').replace(/[\u0300-\u036f]/gu,'').toLowerCase().replace(/[^a-z0-9\n]/gu,' ')
 const label=numero<10?`0?${numero}`:String(numero)
 const inicioItem=new RegExp(`(?:^|\\n)[ \\t]*(?:questao\\s+)?${label}\\s+${prefixo.split(' ').join('\\s+')}`,'u')
 if(!inicioItem.test(linhas))return null
 const ce=q.opcoes?.length===2&&new Set(q.opcoes.map(normalizar)).size===2&&q.opcoes.every(o=>/^(?:certo|errado|c|e)$/u.test(normalizar(o)))
 let opcoesConfirmadas=ce
 if(!ce&&Array.isArray(q.opcoes)&&q.opcoes.length>=2){
  const depois=fonte.slice(pos+prefixo.length),proximo=depois.search(new RegExp(`(?:^| )${numero+1} `,'u'))
  const corpo=proximo>=0?depois.slice(0,proximo):depois
  let anteriorOpcao=-1
  opcoesConfirmadas=q.opcoes.every(opcao=>{
   const trecho=normalizar(opcao).slice(0,100)
   if(trecho.length<18)return false
   const indice=corpo.indexOf(trecho)
   if(indice<0||indice<=anteriorOpcao)return false
   anteriorOpcao=indice;return true
  })
 }
 return {numero,pagina,prefixo,opcoesConfirmadas,certoErrado:ce}
}

export function vincularGabarito(q,tabela,paginas){
 if(!tabela||tabela.status!=='tabela_lida'||q.tipo_resposta==='discursiva')return q
 const letra=tabela.respostas?.[String(q.numero_original)]
 if(!letra)return q
 const evidencia=confirmarItem(q,paginas)
 if(!evidencia?.opcoesConfirmadas)return q
 let indice=null
 const anulada=/^[XN]$/u.test(letra)
 if(!anulada){
  if(evidencia.certoErrado&&!/^[CE]$/u.test(letra))return q
  indice=evidencia.certoErrado?q.opcoes.findIndex(o=>normalizar(o)===(letra==='C'?'certo':'errado')||normalizar(o)===letra.toLowerCase()):'ABCDE'.indexOf(letra)
  if(indice<0||indice>=q.opcoes.length)return q
 }
 return {...q,resposta_correta:indice,anulada,gabarito_oficial:{fonte:tabela.gabarito_url,sha256:tabela.sha256,arquivo:tabela.arquivo_gabarito,prova:tabela.arquivo_prova,numero:evidencia.numero,pagina:evidencia.pagina,resposta:letra,criterio:'identificador integral do caderno, enunciado e número localizados no PDF; alternativas em ordem conferidas'},motivos_revisao:(q.motivos_revisao||[]).filter(m=>m!=='gabarito_oficial_nao_vinculado')}
}
