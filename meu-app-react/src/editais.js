const chave = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('pt-BR')
const texto = valor => String(valor || '').replace(/^\s*(?:[-•●▪]\s*|\d+(?:\.\d+)*(?:[.)]\s+|\s*[-–—]\s+)|\d+(?:\.\d+)+\s+)/, '').trim()
export const STATUS_EDITAL = {pendente:'Não iniciado', estudando:'Em estudo', revisar:'Revisar', concluido:'Estudado'}
export const novoIdEdital = () => crypto.randomUUID()

// Paste is deliberately explicit: a subject heading ends in ':' or is [bracketed].
// Paragraphs inside a subject never rename or replace existing subjects.
export function lerConteudosEdital(entrada, materia = '') {
  let atual = materia.trim()
  const grupos = []
  for (const linha of entrada.split(/\r?\n/)) {
    const valor = linha.trim()
    if (!valor) continue
    if (!materia) {
      const heading = valor.match(/^\[([^\]]+)\]\s*$/) || valor.match(/^([^:]{1,100}):\s*$/)
      if (heading) { atual = texto(heading[1]); continue }
      if (!atual) throw new Error('Coloque o nome da matéria seguido de dois-pontos antes dos conteúdos. Exemplo: Matemática:')
    }
    if (!atual) throw new Error('Informe a matéria dos conteúdos.')
    for (const item of valor.split(';').map(texto).filter(Boolean)) {
      if (item.length > 1500) throw new Error('Um tópico ficou muito longo. Separe o conteúdo em linhas menores.')
      let grupo = grupos.find(g => chave(g.nome) === chave(atual))
      if (!grupo) { grupo = {nome:atual, topicos:[]}; grupos.push(grupo) }
      grupo.topicos.push(item)
    }
  }
  if (!grupos.length) throw new Error('Adicione pelo menos um conteúdo, um por linha ou separado por ponto e vírgula.')
  if (grupos.reduce((n,g) => n+g.topicos.length,0) > 1000) throw new Error('Inclua até 1.000 tópicos por vez.')
  return grupos
}

export function acrescentarConteudos(materias, grupos, id = novoIdEdital) {
  const copia = materias.map(m => ({...m, topicos:m.topicos.map(t => ({...t}))}))
  let adicionados = 0, repetidos = 0
  for (const grupo of grupos) {
    let materia = copia.find(m => chave(m.nome) === chave(grupo.nome))
    if (!materia) { materia = {id:id(), nome:grupo.nome.trim(), topicos:[]}; copia.push(materia) }
    const existentes = new Set(materia.topicos.map(t => chave(t.titulo)))
    for (const titulo of grupo.topicos) {
      if (existentes.has(chave(titulo))) { repetidos++; continue }
      materia.topicos.push({id:id(), titulo, status:'pendente', prioridade:'normal', notas:''})
      existentes.add(chave(titulo)); adicionados++
    }
  }
  return {materias:copia, adicionados, repetidos}
}

export function alterarTopico(materias, materiaId, topicoId, alteracoes) {
  return materias.map(m => m.id !== materiaId ? m : {...m, topicos:m.topicos.map(t => t.id !== topicoId ? t : {...t, ...alteracoes})})
}

export function resumoEdital(materias) {
  const topicos = materias.flatMap(m => m.topicos)
  const concluidos = topicos.filter(t => t.status === 'concluido').length
  return {total:topicos.length, concluidos, revisar:topicos.filter(t => t.status === 'revisar').length,
    estudando:topicos.filter(t => t.status === 'estudando').length,
    percentual:topicos.length ? Math.round(concluidos/topicos.length*100) : 0}
}

export function topicoVisivel(topico, busca, status, prioridade) {
  return (!busca || chave(`${topico.titulo} ${topico.notas}`).includes(chave(busca))) &&
    (!status || (status === 'pendentes' ? topico.status !== 'concluido' : topico.status === status)) &&
    (!prioridade || topico.prioridade === prioridade)
}

export function identidadeEdital(titulo, edicao, unidade) {
  return [titulo, edicao, unidade].map(chave).join('|')
}

export function copiarEditalAntigo(itens, id = novoIdEdital) {
  const grupos = itens.filter(i => (i.conteudo || i.topico) && i.materia).map(i => ({nome:i.materia, topicos:[i.conteudo || i.topico]}))
  // Legacy data is shared; its completion flags are not anybody's private progress.
  return acrescentarConteudos([], grupos, id).materias
}
