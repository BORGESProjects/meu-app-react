import fs from 'node:fs/promises'
import path from 'node:path'
import { coletarCapitulo } from './coletor.mjs'

export async function relatorioProgresso(outDir) {
  const registros = []
  for (const nome of await fs.readdir(path.join(outDir, 'capitulos'))) {
    if (!nome.endsWith('.json')) continue
    const c = JSON.parse(await fs.readFile(path.join(outDir, 'capitulos', nome), 'utf8'))
    registros.push({ materia: c.materia, grupo: c.grupo, capitulo: c.capitulo,
      id_capitulo: c.id_capitulo, url: c.url,
      questoes: c.questoes.length,
      objetivas: c.questoes.filter(q => q.tipo_resposta === 'multipla_escolha').length,
      com_gabarito: c.questoes.filter(q => q.resposta_correta !== null).length,
      imagens_pendentes: c.imagens_pendentes?.length ?? null,
      arquivos_salvos: c.arquivos?.length ?? 0, publicado: false })
  }
  await fs.writeFile(path.join(outDir, 'progresso.json'), JSON.stringify(registros, null, 2))
  return registros
}

// Cada chamada recolhe a aba já registrada e solicita somente a próxima abertura.
// O navegador registra pop-ups entre chamadas, não durante um laço de cliques.
export async function avancarFila({ browser, materialTab, inventario, outDir, coletor = coletarCapitulo, arquivoEstado='fila.json', identificarLeitor, atualizarProgresso=true, exigirRecursosOriginais=false }) {
  if(!/^fila(?:-[a-z]+)?\.json$/u.test(arquivoEstado))throw Error('Arquivo de estado inválido')
  const caminhoEstado = path.join(outDir, arquivoEstado)
  let estado = {}
  try { estado = JSON.parse(await fs.readFile(caminhoEstado, 'utf8')) } catch { /* início */ }
  let extraido = null
  if (estado.pendente) {
    let novos = (await browser.tabs.list()).filter(t => !estado.pendente.idsAntes.includes(t.id) && t.url?.startsWith('https://livrodigital.sae.digital/'))
    if(identificarLeitor){const validos=await Promise.all(novos.map(async t=>({tab:t,correto:await identificarLeitor(t,estado.pendente.meta)})));novos=validos.filter(t=>t.correto).map(t=>t.tab)}
    if (novos.length === 0) return { estado: 'aguardando_abertura', capitulo: estado.pendente.meta.capitulo }
    if (novos.length !== 1) throw Error('Mais de uma abertura pendente; conferir as abas antes de continuar')
    const tab = await browser.tabs.get(novos[0].id)
    await tab.markHandoff()
    await tab.playwright.waitForLoadState({ state: 'domcontentloaded', timeoutMs: 20000 })
    estado.pendente.readerUrl ||= novos[0].url
    await fs.writeFile(caminhoEstado, JSON.stringify(estado, null, 2))
    let anterior = null
    try { anterior = JSON.parse(await fs.readFile(path.join(outDir, 'capitulos', `${estado.pendente.meta.id_capitulo}.json`), 'utf8')) } catch { /* pendente novo */ }
    const semChaves = anterior?.questoes?.some(q => q.tipo_resposta === 'multipla_escolha') && !anterior.questoes.some(q => q.resposta_correta !== null)
    const recursosOriginais=anterior?.arquivos?.some(a=>a.tipo==='image'||a.tipo==='stylesheet')
    if ((anterior?.captura_visual || anterior?.arquivos?.length) && anterior.questoes?.length === anterior.quantidade_inicios && !semChaves && (!exigirRecursosOriginais||recursosOriginais)) {
      extraido = { ...estado.pendente.meta, reutilizado: true }
    } else {
      extraido = await coletor({ tab, meta: estado.pendente.meta, readerUrl: estado.pendente.readerUrl, outDir })
    }
    if (extraido.objetivas > 0 && extraido.com_gabarito === 0 && !estado.pendente.conferiuChaves) {
      estado.pendente.conferiuChaves = true
      await fs.writeFile(caminhoEstado, JSON.stringify(estado, null, 2))
      return { extraido, estado: 'conferir_gabarito_apos_carregamento' }
    }
    await tab.close()
    delete estado.pendente
    await fs.writeFile(caminhoEstado, JSON.stringify(estado, null, 2))
    if(atualizarProgresso)await relatorioProgresso(outDir)
  }
  for (const grupo of inventario) for (const cap of grupo.capitulos) {
    try {
      const anterior = JSON.parse(await fs.readFile(path.join(outDir, 'capitulos', `${cap.id}.json`), 'utf8'))
      // Uma pendência do material de origem segue para revisão; não prende a fila em repetição.
      const recursosOriginais=anterior.arquivos?.some(a=>a.tipo==='image'||a.tipo==='stylesheet')
      if ((anterior.captura_visual || anterior.arquivos?.length) && anterior.questoes?.length === anterior.quantidade_inicios && (!exigirRecursosOriginais||recursosOriginais)) continue
    } catch { /* capítulo ainda não capturado */ }
    const grupoAtual = `${grupo.materia}/${grupo.grupo}`
    if (estado.grupo !== grupoAtual) {
      await materialTab.playwright.getByRole('button', { name: `${grupo.grupo} icon`, exact: true }).click()
      await materialTab.playwright.domSnapshot()
      estado.grupo = grupoAtual
      await fs.writeFile(caminhoEstado, JSON.stringify(estado, null, 2))
      return { extraido, estado: 'secao_preparada', materia: grupo.materia, grupo: grupo.grupo }
    }
    const meta = { materia: grupo.materia, grupo: grupo.grupo,
      capitulo: cap.label.replace(/^Abrir\s+/u, '').replace(/\s+Livro digital$/u, '').replace(/ - Livro do Aluno$/u, ''),
      id_capitulo: cap.id }
    estado.pendente = { meta, idsAntes: (await browser.tabs.list()).map(t => t.id) }
    await fs.writeFile(caminhoEstado, JSON.stringify(estado, null, 2))
    // A seção carrega de forma assíncrona. O rótulo distingue Livro Digital de
    // cards de vídeo/trilha e impede clicar num card reutilizado durante a troca.
    const livro = materialTab.playwright.getByLabel(cap.label, { exact: true })
    await livro.waitFor({ state: 'visible', timeoutMs: 20000 })
    await livro.click({ timeoutMs: 20000 })
    await materialTab.playwright.domSnapshot()
    return { extraido, solicitado: meta }
  }
  return { extraido, estado: 'inventario_extraido' }
}
