import {temApoioEmBlocos} from './blocosQuestao.js'
// Somente evidências estruturais: não tenta resolver a questão nem inferir dados.
const comentario = /(?:^|\n)\s*(?:coment[aá]rios?|resolu[çc][aã]o|solu[çc][aã]o)\s*(?::|\n|$)|\s+coment[aá]rios?\s*:/iu
const chaveVazada = /(?:^|\s)(?:gabarito|resposta\s+correta)\s*:\s*(?:[a-e]\b|\d)/iu
const listaGabarito = /\b\d{1,2}\.\d{1,2}\.?\s*[-–—]?\s*gabarito\b/iu
const comandoComoOpcao = /^(?:considerando[^\n]*[,:]\s*)?(?:marque|assinale)\s+(?:a|uma)\s+alternativa\s+(?:correta|incorreta)/iu

export function separarRodapeEditorial(valor) {
 const texto=String(valor??'')
 // Só remove título isolado no fim. Nunca corta uma explicação, fórmula ou resposta.
 const m=texto.match(/\n(?:\s*_{8,}\s*\n)?\s*(?:(?:\d{1,2}\.){1,2}\d{0,2}\.?\s*[-–—]?\s*)?gabarito\s*:?\s*$/iu)
 if(!m||!texto.slice(0,m.index).trim())return {texto,removido:''}
 return {texto:texto.slice(0,m.index).replace(/\n\s*_{8,}\s*$/u,'').trim(),removido:texto.slice(m.index)}
}

export function problemasDeIntegridade(q) {
 if(!q||!Array.isArray(q.opcoes))return []
 const problemas=[]
 const textoBlocos=n=>typeof n==='string'?n:(Array.isArray(n?.children)?n.children:[]).map(textoBlocos).join(' ')
 q.opcoes.forEach((opcao,indice)=>{
  const blocos=Array.isArray(q.blocos_opcoes?.[indice])?q.blocos_opcoes[indice]:[]
  const texto=String(opcao??'')+'\n'+blocos.map(textoBlocos).join('\n')
  const temRepresentacao=n=>n&&typeof n==='object'&&(['img','math'].includes(n.tag)||(Array.isArray(n.children)&&n.children.some(temRepresentacao)))
  if(/^\s*(?:alternativa|diagrama da alternativa)\s+[a-e](?:\s*[—–-]\s*consulte o recorte original\.)?\s*$/iu.test(String(opcao))&&!q.opcoes_imagens?.[indice]&&!blocos.some(temRepresentacao))problemas.push({codigo:'conteudo_da_alternativa_ausente',indice})
  if(comentario.test(texto))problemas.push({codigo:'comentario_na_alternativa',indice})
  if(chaveVazada.test(texto)||listaGabarito.test(texto))problemas.push({codigo:'gabarito_na_alternativa',indice})
  if(comandoComoOpcao.test(texto.trim()))problemas.push({codigo:'comando_no_lugar_da_alternativa',indice})
 })
 if(q.opcoes.filter(t=>/^\s*(?:corret[oa]|incorret[oa])\.\s/iu.test(String(t))).length>=2)problemas.push({codigo:'resolucao_no_lugar_das_alternativas'})
 const texto=String(q.enunciado??'')
 const tabelaTextual=texto.split('\n').filter(l=>l.trim()&&l.includes('|')).length>=3
 const temApoio=Boolean(q.imagem_original||q.pagina_imagem||q.apoio?.length||String(q.texto_apoio??'').trim()||temApoioEmBlocos(q.blocos_enunciado)||tabelaTextual)
 const referenciaVisual=/(?:conforme|como)\s+(?:(?:est[aá]|foi)\s+)?(?:mostra(?:do|da)?|representad[oa]|ilustrad[oa]|indicado|apresentado)\s+(?:n[ao]\s+)?(?:figura|imagem|gráfico|esquema)|(?:com base|de acordo)\s+(?:n[ao]|com (?:o|a))\s+(?:figura|imagem|gráfico|esquema)|(?:figura|gráfico|mapa|tabela)\s+ao lado|(?:a|essa|esta)\s+(?:figura|tabela|imagem)\s+(?:ilustra|mostra|apresenta|representa)|(?:ironia|humor|sentido)\s+d[ao]\s+(?:tirinha|charge)/iu
 if(!temApoio&&referenciaVisual.test(texto))problemas.push({codigo:'apoio_visual_ausente'})
 if(!temApoio&&texto.length<140&&/(?:ao|no|do|pelo)\s+gráfico\b|(?:na|da)\s+(?:figura|charge|tirinha)\b/iu.test(texto))problemas.push({codigo:'apoio_visual_ausente'})
 const alvoSemDestaque=/\b(?:termo|palavra|express[aã]o|voc[aá]bulo|verbo|adjetivo)s?\s+(?:(?:em|que\s+est[aá])\s+)?(?:destaque|sublinhad[oa]s?|destacad[oa]s?|negrito)/iu.test(texto)
 const alvoExplicito=/\b(?:termo|palavra|express[aã]o|voc[aá]bulo|verbo|adjetivo)\s+(?:sublinhad[oa]|destacad[oa]|em destaque|em negrito)\s*[:(,]?\s*[“"']([^”"'\n]{1,60})[”"']/iu.test(texto)
 const temFormatacao=n=>n&&typeof n==='object'&&(['u','strong','em'].includes(n.tag)||(Array.isArray(n.children)&&n.children.some(temFormatacao)))
 if(!temApoio&&alvoSemDestaque&&!alvoExplicito&&!(Array.isArray(q.blocos_enunciado)&&q.blocos_enunciado.some(temFormatacao)))problemas.push({codigo:'destaque_tipografico_ausente'})
 return problemas
}
