import { defineConfig } from 'cf/config'

export default defineConfig({
  worker: {
    name: 'examprep',
    compatibilityDate: '2026-11-12',
    assets: { notFoundHandling: 'single-page-application' },
  },
})
