import { build } from 'vite'

await build()

// The commercial student portal is also emitted into Vercel's static output,
// so existing software links can stay on the same origin and share login.
process.env.VITE_PORTAL_OUTPUT = 'vercel'
try {
  await build({ configFile: 'portal/vite.config.js' })
} finally {
  delete process.env.VITE_PORTAL_OUTPUT
}
