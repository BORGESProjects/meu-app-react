import {spawnSync} from 'node:child_process'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const script = fileURLToPath(new URL('./completar_paginas_questoes.py', import.meta.url))
const configurado = process.env.CODEX_PYTHON || process.env.PYTHON
const pythonEmpacotado = process.platform === 'win32' && process.env.USERPROFILE
  ? path.join(process.env.USERPROFILE, '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', 'python.exe')
  : ''
const candidatos = configurado
  ? [{exe: configurado, prefixo: []}]
  : process.platform === 'win32'
    ? [...(pythonEmpacotado ? [{exe: pythonEmpacotado, prefixo: []}] : []), {exe: 'python', prefixo: []}, {exe: 'py', prefixo: ['-3']}, {exe: 'python3', prefixo: []}]
    : [{exe: 'python3', prefixo: []}, {exe: 'python', prefixo: []}]

for (const {exe, prefixo} of candidatos) {
  const probe = spawnSync(exe, [...prefixo, '--version'], {encoding: 'utf8', windowsHide: true})
  if (probe.error || probe.status !== 0) continue
  const resultado = spawnSync(exe, [...prefixo, script, ...process.argv.slice(2)], {stdio: 'inherit', windowsHide: true})
  if (resultado.error) throw resultado.error
  process.exit(resultado.status ?? 1)
}

throw new Error(`Python não encontrado. Defina CODEX_PYTHON com o caminho do executável. Tentativas: ${candidatos.map(item => path.join(item.exe, '')).join(', ')}`)
