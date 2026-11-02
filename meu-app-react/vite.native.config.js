import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

const entradaEstudante = {
  name:'entrada-estudante-nativa',
  transformIndexHtml(html, contexto) {
    if (path.basename(contexto?.filename || contexto?.path || 'index.html') !== 'index.html') return html
    return fs.readFileSync(path.resolve(process.cwd(), 'estudar.html'), 'utf8')
  },
}

export default defineConfig({
  plugins:[entradaEstudante,react(),tailwindcss()],
  publicDir:false,
  define:{'import.meta.env.VITE_APP_NATIVE':JSON.stringify('true')},
  build:{outDir:'dist-native',emptyOutDir:true},
  clearScreen:false,
})
