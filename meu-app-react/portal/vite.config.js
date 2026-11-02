import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const portal = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: portal,
  envDir: raiz,
  build: {
    outDir: process.env.VITE_PORTAL_OUTPUT === 'vercel' ? resolve(raiz, 'dist') : resolve(raiz, 'public-page'),
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(portal, 'aluno.html'),
      output: {
        entryFileNames: 'assets/portal/aluno-[hash].js',
        chunkFileNames: 'assets/portal/chunk-[hash].js',
        assetFileNames: 'assets/portal/[name]-[hash][extname]',
      },
    },
  },
})
