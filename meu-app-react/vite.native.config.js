import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins:[react(),tailwindcss()],
  publicDir:false,
  define:{'import.meta.env.VITE_APP_NATIVE':JSON.stringify('true')},
  build:{outDir:'dist-native',emptyOutDir:true},
  clearScreen:false,
})
