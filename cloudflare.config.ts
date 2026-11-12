import { bindings, defineConfig } from 'cf/config'

export default defineConfig({
  worker: {
    name: 'masterprep',
    compatibilityDate: '2026-11-12',
    entrypoint: './worker/index.ts',
    assets: {
      notFoundHandling: 'single-page-application',
      runWorkerFirst: ['/api/*'],
    },
    // Recall checker. Set with: npx cf secret put ANTHROPIC_API_KEY (or .dev.vars locally)
    env: { ANTHROPIC_API_KEY: bindings.secret() },
  },
})
