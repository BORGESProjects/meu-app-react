const normalizar=t=>String(t||'').normalize('NFKC').replace(/\s+/gu,' ').trim()
const inicio=/^(?:Acerca|A respeito|Com relação|Com referência|No que se refere|No que concerne|No que diz respeito|Em relação|Quanto [aà]s?|Quanto aos?|Julgue)\b/iu
const final=/\b(?:julgue (?:os |o )?(?:próximos |seguintes )?(?:itens?|assertivas?)|julgue os itens (?:subsequentes|subsecutivos|seguintes)|itens? (?:a seguir|que se seguem|seguintes|subsequentes|subsecutivos))[^.!?]*[.:]\s*$/iu
export function separarComandoSeguinte(q,paginas){
 if(q.banca!=='CEBRASPE'||q.revisao_visual||!Array.isArray(q.opcoes)||q.opcoes.length!==2||!/certo/iu.test(q.opcoes[0])||!/errado/iu.test(q.opcoes[1]))return null
 const n=Number(q.numero_original),p=Number(q.pagina)
 if(!Number.isInteger(n)||n<1||!Number.isInteger(p)||!paginas?.[p-1])return null
 const linhas=paginas[p-1].split(/\r?\n/u)
 const marcadores=linhas.map((linha,i)=>({linha,i,match:linha.match(/^\s*(\d{1,3})\s+(\S.*)$/u)})).filter(x=>x.match)
 const encontrados=marcadores.filter(x=>Number(x.match[1])===n)
 if(encontrados.length!==1)return null
 const a=encontrados[0],b=marcadores.find(x=>x.i>a.i&&Number(x.match[1])===n+1)
 if(!b)return null
 // Requer sequência exata e contígua no PDF; outro número intermediário invalida.
 if(marcadores.some(x=>x.i>a.i&&x.i<b.i))return null
 const trecho=[a.match[2],...linhas.slice(a.i+1,b.i)]
 const candidatos=trecho.map((linha,i)=>i>0&&inicio.test(linha.trim())?i:-1).filter(i=>i>=0)
 if(candidatos.length!==1)return null
 const corte=candidatos[0],antes=trecho.slice(0,corte).join('\n').trim(),comando=trecho.slice(corte).join('\n').trim()
 if(antes.length<30||comando.length>350||!/[.!?]\s*$/u.test(antes)||!final.test(comando))return null
 const posicaoJulgue=comando.search(/\bjulgue\b/iu)
 if(posicaoJulgue<0||posicaoJulgue>220||/[.!?]/u.test(comando.slice(0,posicaoJulgue)))return null
 if(/\/g\d{3,}|[\uFFFD\uE000-\uF8FF]/u.test(antes))return null
 if(!/\b(?:julgue|itens?|assertivas?)\b/iu.test(comando))return null
 if(normalizar(q.enunciado)!==normalizar(trecho.join('\n')))return null
 return {enunciado:antes,comando_seguinte:comando,pagina:p,numero:n,metodo:'Separação por numeração consecutiva e comando delimitado no texto PDF; correspondência integral do enunciado antes da alteração'}
}
