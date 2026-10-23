export const PERFIS_REDACAO = {
 ENEM:{nome:'ENEM',maximo:1000,criterios:[['C1','Norma-padrão',200],['C2','Tema e repertório',200],['C3','Argumentação',200],['C4','Coesão',200],['C5','Intervenção',200]]},
 FUVEST:{nome:'FUVEST · temas históricos',maximo:100,criterios:[['tema','Tema e organização',40],['articulacao','Coerência e articulação',30],['linguagem','Gramática e vocabulário',30]]},
 GERAL:{nome:'Concurso ou tema livre',maximo:100,criterios:[['tema','Adequação ao tema',30],['argumentacao','Argumentação',30],['coesao','Estrutura e coesão',20],['linguagem','Norma-padrão',20]]},
}
export const assinaturaRedacao = r => JSON.stringify([r.tema?.trim(),r.texto,r.banca,r.ano||null,r.criterios||''])
export function estatisticasRedacao(texto='') {
 const limpo=texto.trim();return {palavras:limpo?limpo.split(/\s+/u).length:0,caracteres:texto.length,paragrafos:limpo?limpo.split(/\n\s*\n/u).filter(Boolean).length:0}
}
export function validarRedacao(r) {
 if(!r.tema?.trim() || r.tema.trim().length<3) return 'Informe um tema com pelo menos 3 caracteres.'
 if(r.tema.length>500) return 'O tema deve ter até 500 caracteres.'
 if((r.texto||'').trim().length<80) return 'Escreva pelo menos 80 caracteres para uma análise útil. Isso não é um limite oficial de linhas da prova.'
 if(r.texto.length>20000) return 'O texto deve ter até 20.000 caracteres.'
 if((r.criterios||'').length>3000) return 'As instruções devem ter até 3.000 caracteres.'
 return ''
}
const textoSeguro=(t,max=3000)=>typeof t==='string'&&t.length<=max
export function relatorioValido(r,perfil='GERAL',texto='') {
 const rubrica=PERFIS_REDACAO[perfil]||PERFIS_REDACAO.GERAL
 if(!r || !textoSeguro(r.resumo) || !r.resumo.trim() || !Array.isArray(r.criterios) || r.criterios.length!==rubrica.criterios.length || r.maximo!==rubrica.maximo) return false
 for(const [id,,max] of rubrica.criterios) {
  const notas=r.criterios.filter(c=>c?.id===id),c=notas[0]
  if(notas.length!==1 || !Number.isInteger(c.nota)||c.nota<0||c.nota>max||c.maximo!==max||!textoSeguro(c.justificativa)||!textoSeguro(c.sugestao)||perfil==='ENEM'&&c.nota%40!==0)return false
 }
 if(r.nota!==r.criterios.reduce((a,c)=>a+c.nota,0))return false
 for(const campo of ['pontos_fortes','prioridades','alertas'])if(!Array.isArray(r[campo])||r[campo].length>8||r[campo].some(t=>!textoSeguro(t)))return false
 if(!r.prioridades.length||!Array.isArray(r.revisoes)||r.revisoes.length>6)return false
 return r.revisoes.every(v=>v&&textoSeguro(v.trecho,500)&&v.trecho.trim()&&texto.includes(v.trecho)&&textoSeguro(v.problema)&&textoSeguro(v.sugestao))
}
export async function solicitarCorrecao({url,redacao,token,chave,signal,fetcher=fetch,prazo=150000}) {
 const erro=validarRedacao(redacao);if(erro)throw new Error(erro)
 const controle=new AbortController(),cancelar=()=>controle.abort();let expirou=false
 if(signal?.aborted)throw new DOMException('Correção cancelada','AbortError')
 signal?.addEventListener('abort',cancelar,{once:true})
 const timer=setTimeout(()=>{expirou=true;controle.abort()},prazo)
 try {
  const response=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,'X-Supabase-Key':chave},body:JSON.stringify(redacao),signal:controle.signal})
  if(!response.ok) {
   const mensagens={400:'Confira o tema, o texto e os limites do formulário.',401:'Sua sessão expirou. Entre novamente; seu rascunho está preservado.',404:'O serviço de redação precisa ser atualizado no servidor. Seu rascunho está preservado.',429:'O limite de correções foi atingido ou já há uma correção em andamento. Aguarde antes de tentar novamente.',502:'O serviço de correção não conseguiu concluir a análise. Seu rascunho está preservado; tente mais tarde.',503:'A IA está temporariamente indisponível. Tente novamente mais tarde; seu rascunho está preservado.',504:'A IA demorou além do prazo. Seu rascunho está preservado.'}
   throw new Error(mensagens[response.status]||'Não foi possível concluir a correção. Seu texto está preservado.')
  }
  let data;try{data=await response.json()}catch{throw new Error('O serviço enviou uma resposta incompatível. A correção precisa ser verificada no servidor; seu rascunho está preservado.')}
  if(!data || typeof data!=='object')throw new Error('O serviço enviou uma resposta vazia. Seu rascunho está preservado.')
  if(data.relatorio) {
   if(!relatorioValido(data.relatorio,redacao.banca,redacao.texto))throw new Error('O relatório está incompleto ou contém notas inconsistentes. Tente novamente mais tarde.')
   return {relatorio:data.relatorio,reutilizada:Boolean(data.reutilizada),modelo:typeof data.modelo==='string'?data.modelo:''}
  }
  const legado=data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('\n')
  if(!textoSeguro(legado,40000)||!legado.trim()||/^\s*(?:erro ao|n[aã]o foi poss[ií]vel|gemini:)/i.test(legado))throw new Error('O serviço de IA não concluiu a correção. Seu rascunho está preservado; tente mais tarde.')
  return {legado,reutilizada:false}
 } catch(e) {
  if(e.name==='AbortError'&&expirou)throw new Error('O tempo de espera terminou. Seu rascunho está preservado; tente novamente mais tarde.')
  if(e instanceof TypeError)throw new Error('Não foi possível conectar ao serviço. Confira sua conexão e tente novamente.')
  throw e
 } finally {clearTimeout(timer);signal?.removeEventListener('abort',cancelar)}
}
export async function verificarServicoRedacao({url,fetcher=fetch,signal}) {
 const resposta=await fetcher(url,{signal,cache:'no-store'})
 if(resposta.status===404)throw new Error('A correção aguarda atualização do servidor. Você pode escrever e baixar seu rascunho normalmente.')
 if(!resposta.ok)throw new Error('O serviço de correção está indisponível no momento. Seu rascunho continua salvo.')
 let dados;try{dados=await resposta.json()}catch{throw new Error('O servidor de correção está respondendo em formato incompatível.')}
 if(dados?.versao!==2 || dados.formato!=='relatorio_v1')throw new Error('A versão do serviço de correção precisa ser atualizada.')
 return dados
}
export function chaveRascunho(userId) {if(!userId)throw new Error('Conta necessária');return 'ap-aprovado:redacao:v1:'+userId}
export function lerRascunho(storage,userId) {
 try {const r=JSON.parse(storage.getItem(chaveRascunho(userId))||'null');if(!r||r.userId!==userId)return null
  const d=r.rascunho;if(!d||!textoSeguro(d.tema,500)||!textoSeguro(d.texto,20000)||!textoSeguro(d.criterios||'',3000)||!PERFIS_REDACAO[d.banca])return null
  const historico=Array.isArray(r.historico)?r.historico.filter(h=>textoSeguro(h?.id,100)&&typeof h.criadaEm==='string'&&Number.isFinite(Date.parse(h.criadaEm))&&h?.redacao&&PERFIS_REDACAO[h.redacao.banca]&&textoSeguro(h.redacao.texto,20000)&&textoSeguro(h.redacao.tema,500)&&(h.resultado?.relatorio?relatorioValido(h.resultado.relatorio,h.redacao.banca,h.redacao.texto):textoSeguro(h.resultado?.legado,40000)&&!/^\s*erro/i.test(h.resultado.legado))).slice(0,5):[]
  return {rascunho:d,historico}
 }catch{return null}
}
export function salvarRascunho(storage,userId,rascunho,historico=[]) {storage.setItem(chaveRascunho(userId),JSON.stringify({userId,rascunho,historico:historico.slice(0,5)}))}
export function textoRelatorio(item) {
 const r=item.resultado.relatorio
 if(!r)return item.resultado.legado||''
 return [`Tema: ${item.redacao.tema}`,`Perfil: ${item.redacao.banca}`,`Estimativa: ${r.nota}/${r.maximo}`,r.escala||'',r.resumo,...r.criterios.map(c=>`${c.nome}: ${c.nota}/${c.maximo}\n${c.justificativa}\nPróximo passo: ${c.sugestao}`),'Prioridades:',...r.prioridades,'Trechos para revisar:',...r.revisoes.map(v=>`${v.trecho}\n${v.problema}\nSugestão: ${v.sugestao}`),'\nTEXTO AVALIADO\n'+item.redacao.texto].join('\n\n')
}

