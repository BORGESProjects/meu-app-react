const normalizar=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/gu,'').toLowerCase()
export function avaliarTipoDocumento(doc={}){
 const arquivo=normalizar(doc.arquivo),tipo=normalizar(doc.tipo_catalogo)
 const auxiliar=/(?:^|[_\s-])chamada(?:[_\s.-]|$)|avaliacao.de.titulos|prova.de.titulos|av.de.titulos|melhores treineiros|relacao de (?:aprovados|candidatos)|lista de (?:aprovados|convocados)|resultado final|matricula/u.test(arquivo+' '+tipo)
  || /^(?:padrao (?:de |esperado)|expectativa de resposta|gabarito(?: |$))/u.test(tipo)
 const discursivo=/discursiv|dissertativ|prova escrita e pratica|prova pratica/u.test(tipo)
 return {auxiliar,discursivo}
}
