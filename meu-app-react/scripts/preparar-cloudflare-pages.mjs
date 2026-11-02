import {existsSync, rmSync, writeFileSync, readdirSync, statSync} from 'node:fs'
import {resolve, relative, sep} from 'node:path'
import {fileURLToPath} from 'node:url'

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)))
const dist = resolve(raiz, 'dist')
const acervoGerado = resolve(dist, 'acervo')
const caminhoRelativo = relative(dist, acervoGerado)

if (!existsSync(resolve(dist, 'index.html')) || !existsSync(resolve(dist, 'estudar.html'))) {
  throw new Error('Gere o build Vite antes de preparar a publicação no Cloudflare Pages.')
}
if (caminhoRelativo !== `acervo` || caminhoRelativo.startsWith(`..${sep}`)) {
  throw new Error('O diretório de saída não corresponde ao caminho de acervo esperado.')
}

if (existsSync(acervoGerado)) rmSync(acervoGerado, {recursive: true, force: true})
writeFileSync(resolve(dist, '_routes.json'), JSON.stringify({version: 1, include: ['/acervo/*'], exclude: []}))

function contarArquivos(diretorio) {
  return readdirSync(diretorio, {withFileTypes: true}).reduce((total, item) => {
    const caminho = resolve(diretorio, item.name)
    return total + (item.isDirectory() ? contarArquivos(caminho) : statSync(caminho).isFile() ? 1 : 0)
  }, 0)
}

console.log(`Pacote Cloudflare preparado: ${contarArquivos(dist)} arquivos estáticos; arquivos de /acervo serão servidos pela função de compatibilidade.`)
