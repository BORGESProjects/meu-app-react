import { copyFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const viteCli = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))
const viteBuild = spawn(process.execPath, [viteCli, 'build'], { stdio: ['ignore', 'pipe', 'pipe'] })
let output = '', buildReportedSuccess = false, closeTimer, closed = false
const capture = stream => stream.on('data', chunk => {
  const text = chunk.toString()
  process.stdout.write(text)
  output = (output + text).slice(-8000)
  if (!buildReportedSuccess && /✓ built in/.test(output)) {
    buildReportedSuccess = true
    closeTimer = setTimeout(() => { if (!closed) viteBuild.kill('SIGTERM') }, 2500)
  }
})
capture(viteBuild.stdout)
capture(viteBuild.stderr)
const result = await new Promise((resolve, reject) => {
  viteBuild.once('error', reject)
  viteBuild.once('close', (code, signal) => { closed = true; clearTimeout(closeTimer); resolve({ code, signal }) })
})
if (result.code !== 0 && !buildReportedSuccess) process.exit(result.code ?? 1)
if (!buildReportedSuccess) throw new Error('A compilação do Vite terminou sem confirmar a geração dos arquivos.')

// Vite's public copy includes the entire historical image archive and can
// continue long after the app build finishes. Ensure the small root brand files
// are present explicitly even when that large background copy is interrupted.
for (const asset of ['ap-monograma.png', 'favicon.svg', 'icons.svg']) {
  await copyFile(new URL(`../public/${asset}`, import.meta.url), new URL(`../dist/${asset}`, import.meta.url))
}

// Vercel is the question-bank app and future native-app prototype. The
// commercial landing page and student portal are published separately on Pages.
await copyFile(
  new URL('../dist/estudar.html', import.meta.url),
  new URL('../dist/index.html', import.meta.url),
)
console.log('A raiz da Vercel serve o app de estudos; a página comercial continua no projeto separado do Cloudflare Pages.')
