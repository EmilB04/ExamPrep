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
        id:
          process.env.MASTERPREP_D1_ID ||
          '3b83e0d6-824c-4596-abd9-9db6a2c6147b',
      }),
      ACCESS_TEAM_DOMAIN: bindings.text(
        process.env.ACCESS_TEAM_DOMAIN || 'quiet-dew-ae0f.cloudflareaccess.com',
      ),
      ACCESS_AUD: bindings.text(
        process.env.ACCESS_AUD ||
          '60e4eb5bbb18fc7aa967379674cd11867c8e46cf4693d936ebf5b89152463447',
      ),
      AUTH_ORIGIN: bindings.text(
        process.env.AUTH_ORIGIN || 'https://masterprep.pages.dev',
      ),
      AI_MODEL: bindings.text(process.env.AI_MODEL || 'claude-haiku-5-5'),
      ANTHROPIC_API_KEY: bindings.secret(),
    },
  },
})
