import { bindings, defineConfig } from 'cf/config'

export default defineConfig({
  worker: {
    name: 'masterprep',
    compatibilityDate: '2026-11-13',
    entrypoint: './worker/index.ts',
    assets: {
      notFoundHandling: 'single-page-application',
      runWorkerFirst: ['/api/*'],
    },
    observability: {
      enabled: true,
      traces: { enabled: true },
      redactQueryString: true,
    },
    env: {
      DB: bindings.d1({
        name: 'masterprep-study',
        ...(process.env.MASTERPREP_D1_ID
          ? { id: process.env.MASTERPREP_D1_ID }
          : {}),
      }),
      ACCESS_TEAM_DOMAIN: bindings.text(process.env.ACCESS_TEAM_DOMAIN || ''),
      ACCESS_AUD: bindings.text(process.env.ACCESS_AUD || ''),
      AI_MODEL: bindings.text(process.env.AI_MODEL || 'claude-haiku-5-5'),
      ANTHROPIC_API_KEY: bindings.secret(),
    },
  },
})
