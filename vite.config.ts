import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig(({ mode }) => ({
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
