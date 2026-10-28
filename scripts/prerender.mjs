// Build step: renders the homepage to static HTML inside dist/index.html so
// crawlers and link previews get the full content without running JS, and
// writes robots.txt and sitemap.xml for the production URL.
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const ssr = path.join(root, 'dist-ssr')
const site = (process.env.VITE_SITE_URL || 'https://www.pcitech.com.ph').replace(/\/+$/, '')

const { render } = await import(pathToFileURL(path.join(ssr, 'entry-server.js')).href)
const file = path.join(dist, 'index.html')
const html = await fs.readFile(file, 'utf8')
if (!html.includes('<!--app-html-->')) throw new Error('index.html is missing the <!--app-html--> marker')
await fs.writeFile(file, html.replace('<!--app-html-->', render()))

await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`)
await fs.writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
)
await fs.rm(ssr, { recursive: true, force: true })
console.log(`prerendered dist/index.html, robots.txt and sitemap.xml for ${site}`)
