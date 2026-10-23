import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs/promises'
import path from 'node:path'

function copiarArquivosPublicosSemAcervoPesado() {
  let pastaPublica
  let pastaSaida
  return {
    name: 'copiar-public-sem-acervo-extraido',
    apply: 'build',
    configResolved(config) {
      pastaPublica = config.publicDir
      pastaSaida = path.resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      if (!pastaPublica || pastaPublica === false) return
      await fs.cp(pastaPublica, pastaSaida, {
        recursive: true,
        force: true,
        filter(origem) {
          const relativo = path.relative(pastaPublica, origem)
          return relativo === '' || relativo.split(path.sep)[0] !== 'acervo-extraido'
        },
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copiarArquivosPublicosSemAcervoPesado(),
  ],
  build: { copyPublicDir: false },
})
