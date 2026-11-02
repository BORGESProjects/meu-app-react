import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {enriquecerQuestaoExtraida} from '../../src/classificacaoQuestaoExtraida.js'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const pasta = path.join(raiz, 'public', 'acervo-extraido')
const aplicar = process.argv.includes('--aplicar')
const manifesto = JSON.parse(await fs.readFile(path.join(pasta, 'manifesto.json'), 'utf8'))
const totais = {questoes: 0, ano: 0, semAno: 0, objetiva: 0, discursiva: 0, materia: {}, banco: {}}
const novosLotes = []
const arquivosAntigos = []

for (const lote of manifesto.lotes || []) {
  if (!['Cebraspe', 'INEP'].includes(lote.banca)) continue
  const arquivo = path.join(pasta, lote.arquivo)
  const bytes = await fs.readFile(arquivo)
  const originais = JSON.parse(zlib.gunzipSync(bytes))
  if (!Array.isArray(originais) || originais.length !== Number(lote.quantidade)) throw new Error(`Lote inconsistente: ${lote.arquivo}`)
  const enriquecidas = originais.map(enriquecerQuestaoExtraida)
  for (let indice = 0; indice < enriquecidas.length; indice++) {
    const q = enriquecidas[indice]
    totais.questoes++
    if (q.ano) totais.ano++; else totais.semAno++
    totais[q.tipo_resposta]++
    totais.materia[q.materia] = (totais.materia[q.materia] || 0) + 1
    const quadro = totais.banco[q.banca] ||= {questoes: 0, ano: 0, semAno: 0, objetiva: 0, discursiva: 0, materia: {}}
    quadro.questoes++
    if (q.ano) quadro.ano++; else quadro.semAno++
    quadro[q.tipo_resposta]++
    quadro.materia[q.materia] = (quadro.materia[q.materia] || 0) + 1
  }
  const grupos = new Map()
  for (const q of enriquecidas) {
    const chave = q.ano ? String(q.ano) : 'sem-ano'
    if (!grupos.has(chave)) grupos.set(chave, [])
    grupos.get(chave).push(q)
  }
  const partes = [...grupos.entries()]
  for (const [ano, questoes] of partes) {
    let nome = lote.arquivo
    if (partes.length > 1) {
      const prefixo = lote.arquivo.replace(/^lotes\//u, '').replace(/\.json\.gz$/u, '').replace(/(?:^|-)sem-ano(?=-|$)/u, `-${ano}`)
      const hash = createHash('sha256').update(`${lote.banca}|${ano}|${lote.concurso}|${questoes.map(q => q.id).join('|')}`).digest('hex').slice(0, 7)
      nome = `lotes/${prefixo}-${hash}.json.gz`
    }
    novosLotes.push({...lote, ano: ano === 'sem-ano' ? null : Number(ano), quantidade: questoes.length, arquivo: nome})
    if (aplicar) {
      const novo = zlib.gzipSync(Buffer.from(JSON.stringify(questoes)), {level: 9})
      const destino = path.join(pasta, nome)
      const temporario = `${destino}.classificando`
      await fs.writeFile(temporario, novo)
      await fs.rename(temporario, destino)
    }
  }
  arquivosAntigos.push(arquivo)
}

if (!aplicar) {
  console.log(JSON.stringify({modo: 'prévia; use --aplicar para salvar', ...totais}, null, 2))
} else {
  const preservados = (manifesto.lotes || []).filter(lote => !['Cebraspe', 'INEP'].includes(lote.banca))
  manifesto.lotes = [...preservados, ...novosLotes].sort((a, b) => a.banca.localeCompare(b.banca, 'pt-BR') || String(a.ano || '').localeCompare(String(b.ano || '')) || a.concurso.localeCompare(b.concurso, 'pt-BR'))
  for (const arquivo of arquivosAntigos) if (!(novosLotes.some(lote => path.join(pasta, lote.arquivo) === arquivo))) await fs.rm(arquivo, {force: true})
  manifesto.classificacao = {
    atualizada_em: new Date().toISOString(),
    criterio: 'metadados da edição e sinais textuais; casos sem evidência ficam marcados para revisão',
    questoes_classificadas: totais.questoes,
    materia_identificada: totais.questoes - (totais.materia['Não identificada automaticamente'] || 0),
    objetiva: totais.objetiva,
    discursiva: totais.discursiva,
    sem_ano: totais.semAno,
    distribuicao_por_banca: totais.banco,
  }
  manifesto.bancas = (manifesto.bancas || []).map(banca => {
    const lotes = manifesto.lotes.filter(item => item.banca === banca.banca)
    const anos = new Map()
    for (const lote of lotes) {
      const chave = lote.ano ? String(lote.ano) : 'sem-ano'
      anos.set(chave, (anos.get(chave) || 0) + lote.quantidade)
    }
    return {...banca, questoes: lotes.reduce((soma, lote) => soma + lote.quantidade, 0), arquivos_com_questoes: lotes.length,
      edicoes: [...anos].sort(([a], [b]) => a === 'sem-ano' ? 1 : b === 'sem-ano' ? -1 : Number(a) - Number(b)).map(([ano, quantidade]) => ({ano, quantidade}))}
  })
  await fs.writeFile(path.join(pasta, 'manifesto.json'), JSON.stringify(manifesto, null, 2))
  console.log(JSON.stringify({modo: 'aplicado', ...totais}, null, 2))
}
