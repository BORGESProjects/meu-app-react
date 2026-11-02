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

// Keep the commercial landing page at the domain root. The question-bank app
// remains available at /estudar.html as the web prototype for the future native apps.
