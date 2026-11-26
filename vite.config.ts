import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  /**
   * Absolute site URL for social preview tags (LinkedIn, Slack, etc. need absolute image URLs).
   * Set SITE_URL in the Cloudflare Pages build settings (or .env), e.g. https://example.com.
   * Falls back to the deployment's own pages.dev URL, then to relative paths.
   */
  const siteUrl = (env.SITE_URL || env.CF_PAGES_URL || '').replace(/\/$/, '')

  return {
    base: './',
    // Phaser alone is ~1.5 MB; it's lazy-loaded in its own chunk, so the warning isn't useful.
    build: { chunkSizeWarningLimit: 1600 },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'site-url',
        transformIndexHtml: (html: string) => html.replaceAll('%SITE_URL%', siteUrl),
      },
    ],
  }
})
