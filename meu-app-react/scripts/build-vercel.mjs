import { build } from 'vite'
import { copyFile } from 'node:fs/promises'

await build()

// Vercel serves the question-bank app at the domain root.
// The commercial page and its student portal are built separately for Cloudflare Pages.
await copyFile(new URL('../dist/estudar.html', import.meta.url), new URL('../dist/index.html', import.meta.url))
