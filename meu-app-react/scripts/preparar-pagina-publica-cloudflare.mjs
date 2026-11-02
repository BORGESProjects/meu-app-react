import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const diretorioRaiz = resolve(fileURLToPath(new URL('..', import.meta.url)))
const diretorioPublico = resolve(diretorioRaiz, 'public-page')
const paginaInicial = resolve(diretorioPublico, 'index.html')

if (!existsSync(paginaInicial)) {
  throw new Error('A página pública não foi encontrada em public-page/index.html.')
}

function listarRelativos(diretorio, relativo = '') {
  return readdirSync(diretorio, { withFileTypes: true }).flatMap(item => {
    const caminhoRelativo = relativo ? `${relativo}/${item.name}` : item.name
    return item.isDirectory()
      ? [caminhoRelativo, ...listarRelativos(resolve(diretorio, item.name), caminhoRelativo)]
      : [caminhoRelativo]
  })
}

const arquivosPermitidos = caminho => caminho === 'index.html'
  || caminho === 'aluno.html'
  || caminho === '_headers'
  || caminho === 'assets'
  || caminho === 'assets/portal'
  || caminho.startsWith('assets/portal/')
const inesperados = listarRelativos(diretorioPublico).filter(caminho => !arquivosPermitidos(caminho))
if (inesperados.length) {
  throw new Error(`O deploy público contém arquivos fora do escopo: ${inesperados.slice(0, 12).join(', ')}`)
}

console.log('Pacote Cloudflare validado: página de marketing e portal comercial do aluno, sem o app de estudos.')
