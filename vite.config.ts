import { existsSync, readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

// Accounts need HTTPS (Secure __Host- cookie). `.certs/` holds a local self-signed cert.
const https = existsSync('.certs/dev.pem')
  ? {
      key: readFileSync('.certs/dev-key.pem'),
      cert: readFileSync('.certs/dev.pem'),
    }
  : undefined

export default defineConfig(({ mode }) => ({
  server: { https },
  preview: { https },
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === 'cloudflare' ? [cloudflare()] : []),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'course-content': ['./src/content/complex-systems/lectures.json'],
          markdown: ['react-markdown', 'remark-gfm'],
          motion: ['motion/react'],
        },
      },
    },
  },
}))
