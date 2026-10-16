const normal = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toUpperCase()
const materias = ['Língua Portuguesa','Português','Matemática','História','História do Brasil','Geografia','Geografia do Brasil','Física','Química','Biologia','Língua Inglesa','Inglês','Espanhol','Literatura','Redação','Informática','Noções de Informática','Raciocínio Lógico','Raciocínio Lógico-Matemático','Direito Constitucional','Direito Administrativo','Direito Penal','Direito Processual Penal','Direito Civil','Direito Processual Civil','Direitos Humanos','Legislação','Legislação de Trânsito','Contabilidade','Estatística','Administração','Administração Pública','Engenharia Civil','Enfermagem','Pedagogia','Atualidades','Conhecimentos Específicos','Logística']
const nomes = new Map(materias.map(m => [normal(m),m]))
const limparNumero = t => t.replace(/^\s*(?:\d+(?:\.\d+)*[.)]?|[IVXLCDM]+|[A-Z])[\s.)–-]+/u,'').trim()
const programa = t => /^(?:ANEXO\s+[A-Z0-9IVX]+\s*[–:.-]?\s*)?(?:CONTEUDOS? PROGRAMATICOS?|PROGRAMA(?:S)? (?:DAS? |DE )?(?:MATERIAS|DISCIPLINAS|PROVAS?)|OBJETOS DE AVALIACAO)(?:\s*[–:.-].{0,80})?$/.test(normal(t))
const sumario = t => /\.{3,}|^SUMARIO\b|^INDICE\b/.test(normal(t))

export function identificarMateria(texto) {
  const t = limparNumero(texto).replace(/:\s*$/,'').trim()
  return nomes.get(normal(t)) || null
}

// Geometry is read from text items, not PDF object order. Short left table cells
// remain beside their content; true text columns are read left, then right.
export function linhasPdf(items, largura, altura) {
  const juntar=cs=>{let out='',last=null;for(const c of cs){out+=(last && c.x-(last.x+last.w)>c.h*.12 ? ' ' : '')+c.text;last=c}return out}
  const rows=[]
  for (const i of items.filter(i => i.str?.trim())) {
    const y=altura-i.transform[5], h=Math.abs(i.height || i.transform[3] || 10), x=i.transform[4]
    let row=rows.find(r=>Math.abs(r.y-y)<Math.max(2,Math.min(h,r.h)*.3))
    if (!row) {row={y,h,items:[]};rows.push(row)}
    row.items.push({text:i.str,x,w:i.width || 0,h})
  }
  rows.sort((a,b)=>a.y-b.y)
  let bifurcadas=0
  const linhas=rows.map(r=>{
    r.items.sort((a,b)=>a.x-b.x)
    const celulas=[]
    for(const i of r.items){
      const last=celulas.at(-1)
      if (!last || i.x-last.end>Math.max(12,i.h)) celulas.push({x:i.x,end:i.x+i.w,text:i.text})
      else {last.text += (i.x-last.end>i.h*.12 ? ' ' : '')+i.text;last.end=Math.max(last.end,i.x+i.w)}
    }
    if(celulas.length===2 && celulas[0].text.length>35 && celulas[1].text.length>35 && celulas[1].x>largura*.43) bifurcadas++
    return {...r,celulas}
  })
  const duasMaterias=linhas.some(r=>r.celulas.filter(c=>identificarMateria(c.text)).length>=2)
  const colunas=duasMaterias || bifurcadas>=5 && bifurcadas>rows.length*.2
  // Some tables vertically centre a subject label beside ten numbered topics.
  // Move that label to the first topic of its cell, rather than losing the first half.
  const labels=[]
  if(!colunas)for(const r of linhas)for(const c of r.celulas){
    if(c.x<largura*.27 && c.end<largura*.4 && c.text.length<70 && /^[A-ZÀ-Ý]/u.test(c.text) && !/^(?:AREA|MATERIA|DISCIPLINA|ANEXO|CAMPUS)\b/.test(normal(c.text)) && linhas.some(v=>Math.abs(v.y-r.y)<r.h*1.5 && v.celulas.some(c=>c.x>=largura*.3))){
      const last=labels.at(-1)
      if(last && r.y-last.y<r.h*2.2 && identificarMateria(last.nome+' '+c.text)){last.nome+=' '+c.text;last.y=r.y}
      else labels.push({nome:c.text,y:r.y})
    }
  }
  const tabelas=labels.filter(l=>identificarMateria(l.nome)).map(l=>{
    const anteriores=linhas.filter(r=>r.y<=l.y && /^1(?:[.)–—-]|\s)/u.test(juntar(r.items.filter(i=>i.x>=largura*.3)).trim()))
    return {...l,inicio:anteriores.at(-1)?.y}
  }).filter(l=>l.inicio!==undefined)
  if(tabelas.length){
    const out=[]
    for(const r of linhas){
      for(const t of tabelas.filter(t=>t.inicio===r.y))out.push({texto:identificarMateria(t.nome),y:r.y,altura,fonte:r.h})
      const text=(r.y>=tabelas[0].inicio ? juntar(r.items.filter(i=>i.x>=largura*.3)) : r.celulas.map(c=>c.text).join(' '))
      if(text.trim())out.push({texto:text,y:r.y,altura,fonte:r.h})
    }
    return {linhas:out,colunas:false,tabela:true}
  }
  const out=colunas ? [0,1].flatMap(col=>linhas.flatMap(r=>{
    const cs=r.items.filter(c=>col===0 ? c.x<largura*.5 : c.x>=largura*.5)
    return cs.length ? [{texto:juntar(cs),y:r.y,altura,fonte:r.h,coluna:col+1}] : []
  })) : linhas.map(r=>({texto:r.celulas.map(c=>c.text).join(r.celulas.length===2 && identificarMateria(r.celulas[0].text) ? ' | ' : ' '),y:r.y,altura,fonte:r.h}))
  return {linhas:out,colunas}
}

export function faixaProgramatica(paginas) {
  const hits=paginas.filter(p=>p.linhas.some(l=>programa(l.texto) && !sumario(l.texto)))
  if(!hits.length) return {inicio:1,fim:paginas.length,detectada:false}
  const inicio=hits[0].numero
  let fim=paginas.length
  for(const p of paginas.filter(p=>p.numero>inicio)) {
    const texto=p.linhas.slice(0,8).map(l=>normal(l.texto)).join('\n')
    if (/ANEXO\s+[A-Z0-9IVX]+/.test(texto) && !p.linhas.some(l=>programa(l.texto)) &&
      /(?:CRONOGRAMA|REQUERIMENTO|DECLARACAO|FORMULARIO|MODELO|INSCRICAO|ATESTADO|AVALIACAO FISICA)/.test(texto)) {fim=p.numero-1;break}
  }
  return {inicio,fim,detectada:true}
}

export function extrairPrograma(paginas,{manual=false}={}) {
  const repetidas=new Map()
  for (const p of paginas) for(const l of p.linhas) {
    const key=normal(l.texto)
    if ((l.y<l.altura*.18 || l.y>l.altura*.94) && !programa(key) && !identificarMateria(key)) {
      if(!repetidas.has(key))repetidas.set(key,new Set())
      repetidas.get(key).add(p.numero)
    }
  }
  const grupos=[], ignoradas=[], avisos=[]
  let grupo=null, atual=null, referencias=false
  const flush=()=>{if(atual?.titulo.trim())grupo?.itens.push(atual);atual=null}
  function novoGrupo(nome) {
    flush();referencias=false
    grupo=grupos.find(g=>normal(g.nome)===normal(nome))
    if(grupo?.itens.length)avisos.push(`A matéria “${nome}” aparece novamente. Confira se o trecho abrange mais de um cargo ou programa.`)
    if(!grupo){grupo={nome,itens:[]};grupos.push(grupo)}
  }
  for (const p of paginas) {
    if(p.ocr)avisos.push(`Página ${p.numero}: texto reconhecido por OCR; confira acentos, números e símbolos.`)
    if(p.ocr && p.confianca<75)avisos.push(`Página ${p.numero}: baixa confiança no OCR. Compare os conteúdos com a imagem original.`)
    for(const l of p.linhas) {
      if(l.materia){novoGrupo(l.materia);if(l.materia.startsWith('Matéria a conferir'))avisos.push('Uma coluna está sem matéria identificada. Confira a página original e corrija o nome antes de acrescentar.');continue}
      let t=l.texto.replace(/\u00ad/g,'').replace(/\s+/g,' ').trim()
      const key=normal(t)
      if(!t || sumario(t) || programa(t) || /^\d+\s*$/.test(t) || /^[-–]?\s*(?:PAG(?:INA)?\.?\s*\d+|\d+\s*(?:DE|\/)\s*\d+)\s*[-–]?$/u.test(key) || (repetidas.get(key)?.size>=2))continue
      if(/^(?:ANEXO\s+[A-Z0-9IVX]+|CONHECIMENTOS (?:BASICOS|GERAIS)|PROVA (?:ESCRITA|OBJETIVA))\s*[:–.-]?$/u.test(key))continue
      if(/^(?:CARGO|ESPECIALIDADE|NIVEL)\s+.{1,150}$/u.test(key)){flush();grupo=null;avisos.push(`Identifiquei um cargo ou área: “${t}”. Confira se as páginas correspondem ao seu concurso.`);ignoradas.push({pagina:p.numero,texto:t});continue}
      if(/^(?:REFERENCIAS(?: BIBLIOGRAFICAS)?|BIBLIOGRAFIA(?: SUGERIDA)?)\s*:?.*$/u.test(limparNumero(key))) {flush();referencias=true;continue}
      let nome=identificarMateria(t), resto=''
      const celulas=t.split(/\s*\|\s*/)
      if(celulas.length>1 && identificarMateria(celulas[0])) {nome=identificarMateria(celulas[0]);resto=celulas.slice(1).join(' ')}
      const doisPontos=t.match(/^([^:]{2,100}):\s*(.+)$/)
      if(!nome && doisPontos && identificarMateria(doisPontos[1])) {nome=identificarMateria(doisPontos[1]);resto=doisPontos[2]}
      if(nome){novoGrupo(nome);if(!resto)continue;t=resto}
      // Unknown explicit subject headings remain editable, never silently discarded.
      else if (/^[^:]{3,80}:$/u.test(t) && (manual || t===t.toLocaleUpperCase('pt-BR')) && !/^(?:\d|[-–•]|ITEM|CARGO|AREA|NIVEL|ANEXO|EDITAL|TEMA|CONTEUDO|PROGRAMA|BLOCO|OBSERVACAO|NOTA|ATENCAO)/.test(key) && (manual || !grupo || !atual)) {novoGrupo(limparNumero(t.slice(0,-1)));avisos.push(`Matéria “${grupo.nome}” identificada pelo título; confira o agrupamento.`);continue}
      if(!grupo || referencias) {ignoradas.push({pagina:p.numero,texto:t});continue}
      if(/^(?:ANEXO|EDITAL|CAPITULO)\b/.test(key)) {flush();grupo=null;ignoradas.push({pagina:p.numero,texto:t});continue}
      // Separate inline numbering without splitting dates, law numbers or decimals.
      const partes=t.split(/\s+(?=\d{1,3}(?:\.\d{1,3})*(?:[.)]\s+|\s+[A-ZÀ-Ý]))/u)
      for(const parte of partes){
        const m=parte.match(/^(\d{1,3}(?:\.\d{1,3})*)(?:\s*[.)–—-]\s*|\s+)(.+)$/u)
        const bullet=parte.match(/^(?:[-–•●▪]\s*|[a-z][.)]\s+)(.+)$/u)
        if(m || bullet || !atual){
          flush();atual={titulo:(m?.[2] || bullet?.[1] || parte).trim(),numero:m?.[1] || '',bullet:Boolean(bullet),pagina:p.numero,pagina_fim:p.numero,ocr:Boolean(p.ocr)}
        }else{
          atual.titulo=atual.titulo.endsWith('-') ? atual.titulo.slice(0,-1)+parte : atual.titulo+' '+parte
          atual.pagina_fim=p.numero;atual.ocr ||= Boolean(p.ocr)
        }
      }
    }
  }
  flush()
  const resultado=grupos.map(g=>{
    const pais=new Map(), topicos=[];let tituloBullet=''
    for(let i=0;i<g.itens.length;i++){
      const item=g.itens[i]
      if(item.numero) {
        const pai=item.numero.split('.').slice(0,-1).join('.')
        if(g.itens[i+1]?.numero.startsWith(item.numero+'.') || g.itens[i+1]?.bullet){pais.set(item.numero,item.titulo);tituloBullet=item.titulo.replace(/:\s*$/,'');continue}
        tituloBullet=''
        const caminho=[];let n=pai
        while(n){if(pais.has(n))caminho.unshift(pais.get(n));n=n.split('.').slice(0,-1).join('.')}
        if(caminho.length)item.titulo=caminho.join(' → ')+' → '+item.titulo
      }else if(item.bullet && tituloBullet)item.titulo=tituloBullet+' → '+item.titulo
      const alertas=[]
      if(/�|\(cid:\d+\)/u.test(item.titulo))alertas.push('Caracteres ilegíveis')
      if(item.titulo.length>1500)alertas.push('Texto longo: divida este tópico')
      if(item.ocr)alertas.push('Conferir reconhecimento OCR')
      if(item.titulo.length>3)topicos.push({...item,alertas})
    }
    return {nome:g.nome,topicos}
  }).filter(g=>g.topicos.length)
  if(!resultado.length)avisos.push('Não foi possível identificar matérias com segurança. Ajuste as páginas ou organize o texto extraído por matéria.')
  if(ignoradas.length)avisos.push(`${ignoradas.length} linha(s) fora das matérias ou de bibliografia não foram incluídas. Você pode conferi-las no texto original.`)
  return {grupos:resultado,avisos:[...new Set(avisos)],ignoradas}
}
