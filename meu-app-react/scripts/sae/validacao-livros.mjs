import {assinaturaVisualBlocos} from '../../src/blocosQuestao.js'
import {textoBruto} from './formato-publicacao.mjs'

export function problemaDeGabarito(q) {
 if(q.tipo_resposta!=='multipla_escolha'||!Number.isInteger(q.resposta_correta))return 'Sem gabarito objetivo único; não inferir resposta.'
 if(!Array.isArray(q.alternativas)||q.alternativas.length<2||q.alternativas.length>5)return 'Quantidade de alternativas inválida.'
 if(q.alternativas.some((a,i)=>a.rotulo!=='ABCDE'[i]))return 'Rótulos de alternativas ausentes ou fora de sequência.'
 const corretas=q.alternativas.flatMap((a,i)=>a.correta_livro?[i]:[])
 if(corretas.length!==1||corretas[0]!==q.resposta_correta)return 'Marcação de gabarito inconsistente com a alternativa extraída.'
 const solucao=(q.solucao_livro||[]).map(textoBruto).join(' ')
 const letras=[...solucao.matchAll(/(?:gabarito\s*[:—–-]|alternativa\s+correta\s*(?:é|:)?|resposta\s*:)\s*(?:a\s+)?(?:(?:letra|alternativa)\s+)?["“'([]?([A-E])\b(?=\s*(?:[.)\];,:]|$))/giu)].map(m=>m[1].toUpperCase())
 if(letras.some(l=>l!=='ABCDE'[q.resposta_correta]))return 'A resolução declara uma alternativa diferente da marcação do livro.'
 return null
}

export function alternativasDistintas(opcoes,blocos) {
 const norm=t=>String(t).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'')
 const chaves=opcoes.map((t,i)=>{
  const visual=assinaturaVisualBlocos({blocos_opcoes:[blocos[i]]})
  return norm(t)+'::'+visual
 })
 return chaves.every((k,i)=>Boolean(norm(opcoes[i])||assinaturaVisualBlocos({blocos_opcoes:[blocos[i]]})))&&new Set(chaves).size===chaves.length
}

// A referência bibliográfica e os parágrafos pertencem ao próprio enunciado
// capturado. Nunca reutiliza o texto de outra questão ou o capítulo teórico.
export function apoioIntegradoNaFonte(q) {
 const ps=q.enunciado_blocos?.filter(n=>n?.tag==='p')||[]
 const referencia=ps.some(n=>/(?:^|\s)textoReferencia(?:\s|$)/u.test(n.attrs?.class||''))
 const corpo=ps.filter(n=>!/(?:textoReferencia|enunciadoNumero|quebraLinha)/u.test(n.attrs?.class||''))
 return referencia&&ps.length>=3&&corpo.slice(0,-1).map(textoBruto).join(' ').trim().length>=200
}
