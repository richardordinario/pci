import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Serves the Vercel functions in /api during `npm run dev`, so the contact form
// works locally without the Vercel CLI. Secrets come from .env.local.
function vercelApiDev(): Plugin {
  return {
    name: 'vercel-api-dev',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''))
      server.middlewares.use('/api/contact', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const c of req) chunks.push(c as Buffer)
        const mod = await server.ssrLoadModule('/api/contact.ts')
        const handler = mod[req.method ?? 'GET']
        if (typeof handler !== 'function') {
          res.statusCode = 405
          res.end()
          return
        }
        const response: Response = await handler(
          new Request('http://localhost' + req.url, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
          }),
        )
        res.statusCode = response.status
        response.headers.forEach((v, k) => res.setHeader(k, v))
        res.end(await response.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), vercelApiDev()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Hashed bundles go to /_app so they never mix with the design images in
    // public/assets (which keep stable names), letting Vercel cache them forever.
    assetsDir: '_app',
  },
})
