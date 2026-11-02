const norm=t=>String(t||'').normalize('NFKC').replace(/\s+/gu,' ').trim()
export function separarJustificativa(q,paginas){
 if(q.banca!=='CEBRASPE'||q.revisao_visual||q.comentario||q.explicacao||q.integridade_profissional?.apta_resolucao===false)return null
 if(q.opcoes?.length!==2||norm(q.opcoes[0]).toLowerCase()!=='certo'||norm(q.opcoes[1]).toLowerCase()!=='errado')return null
 const t=String(q.enunciado||''),marcas=[...t.matchAll(/^\s*JUSTIFICATIVA\s*[:–-]\s*(CERTO|ERRADO)\b/gmu)]
 if(marcas.length!==1)return null
 const marca=marcas[0],enunciado=t.slice(0,marca.index).trim(),comentario=t.slice(marca.index).trim()
 if(enunciado.length<35||!/[.!?]$/u.test(enunciado)||comentario.length<35||/\bjulgue\b/iu.test(t)||/^\s*\d{1,3}[.\s]+\S/mu.test(t))return null
 if(/[\uFFFD\uFFFE\uE000-\uF8FF]|\/[gc]\d{3,}/u.test(enunciado))return null
 const n=Number(q.numero_original),p=Number(q.pagina)
 if(!Number.isInteger(n)||!Number.isInteger(p)||!paginas?.[p-1]||!q.pagina_imagem)return null
 const ls=paginas[p-1].split(/\r?\n/u),ms=ls.map((l,i)=>({i,m:l.match(/^\s*(\d{1,3})\s+(\S.*)$/u)})).filter(x=>x.m)
 const a=ms.filter(x=>Number(x.m[1])===n);if(a.length!==1)return null
 const b=ms.find(x=>x.i>a[0].i&&Number(x.m[1])===n+1);if(!b)return null
 if(ms.some(x=>x.i>a[0].i&&x.i<b.i))return null
 const fonte=[a[0].m[2],...ls.slice(a[0].i+1,b.i)].join('\n')
 if(norm(fonte)!==norm(t))return null
 // A resposta oficial vinculada, quando existente, não pode contradizer o texto da justificativa.
 const indicada=marca[1]==='CERTO'?0:1
 if(Number.isInteger(q.resposta_correta)&&q.resposta_correta!==indicada)return null
 return {enunciado,comentario,metodo:'Justificativa separada do enunciado por marca explícita, numeração consecutiva e correspondência integral com a página original; gabarito preservado'}
}
