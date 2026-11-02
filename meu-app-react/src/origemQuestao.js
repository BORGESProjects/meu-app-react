import {normalizarBanca,normalizarMateria,chaveFiltro} from './filtros.js'

const anoValido=v=>Number.isInteger(Number(v))&&Number(v)>=1990&&Number(v)<=new Date().getFullYear()?Number(v):null
const organizadoras=/^(?:cebraspe|cespe|fgv|vunesp|ibfc|fcc|cesgranrio|funatec|fundatec|inep)$/u
const comercial=/estrat[eé]gia|gran\s*cursos|qconcursos|seja\s*oficial|eu\s*militar|r2\s*cursos|professor(?:a)?\s+[A-ZÀ-Ú]/iu

export function anoDaAplicacao(q) {
 const explicito=anoValido(q.ano)
 if(explicito)return explicito
 const banca=normalizarBanca(q.banca,q.concurso),referencia=String(q.referencia_original||'')
 const inicio=String(q.enunciado||'').match(/^\s*(?:\d+[.)]\s*)?\(([^)\n]{1,100})\)/u)?.[1]||''
 const base=[referencia,inicio,q.concurso].filter(Boolean).join(' ')
 const chave=chaveFiltro(base),sigla=chaveFiltro(banca)
 // Prefere o ano ao lado da instituição a uma data de edição de cursinho.
 if(sigla!=='questoes de assimilacao'){
  const seguro=sigla.replace(/[.*+?^${}()|[\]\\]/gu,'\\$&')
  const perto=chave.match(new RegExp(`(?:^|[^a-z])${seguro}[^0-9]{0,20}((?:19|20)\\d{2})(?!\\d)`,'u'))
  if(perto)return anoValido(perto[1])
 }
 if(!comercial.test(base))return anoValido(base.match(/(?<!\d)(?:19|20)\d{2}(?!\d)/u)?.[0])
 return null
}

export function normalizarMetadadosQuestao(original) {
 const banca=normalizarBanca(original.banca,original.concurso)
 const ano=anoDaAplicacao(original)
 const q={...original,banca,ano,materia:normalizarMateria(original.materia,original.conteudo)}
 if(banca!==original.banca)q.banca_original=original.banca
 const bruta=chaveFiltro(original.banca)
 if(organizadoras.test(bruta))q.organizadora=bruta==='cespe'?'CEBRASPE':String(original.banca).toUpperCase()
 q.aplicacao=banca
 if(comercial.test(String(original.concurso||''))){
  q.concurso_original=original.concurso
  q.concurso=`${banca}${ano?' '+ano:''}`
 }
 // As citações de autores, a fonte e as imagens não são alteradas.
 return q
}
