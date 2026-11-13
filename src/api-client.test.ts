// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { apiFetch, setCsrfToken } from './api-client'
afterEach(() => {
  vi.unstubAllGlobals()
  setCsrfToken(null)
})
it('attaches the in-memory CSRF token and same-origin credentials to mutations', async () => {
  const fetcher = vi.fn().mockResolvedValue(Response.json({}))
  vi.stubGlobal('fetch', fetcher)
  setCsrfToken('c'.repeat(64))
  await apiFetch('/api/progress', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
  const init = fetcher.mock.calls[0][1]
  expect(init.credentials).toBe('same-origin')
  expect(init.headers.get('x-csrf-token')).toBe('c'.repeat(64))
  expect(init.headers.get('content-type')).toBe('application/json')
  await expect(
    apiFetch('https://other.test/api/progress', { method: 'PUT' }),
  ).rejects.toThrow('must stay on this site')
  expect(fetcher).toHaveBeenCalledTimes(1)
})
it('announces expired sessions and drops the stale CSRF token', async () => {
  const fetcher = vi.fn().mockResolvedValue(Response.json({}, { status: 401 }))
  vi.stubGlobal('fetch', fetcher)
  const expired = vi.fn()
  window.addEventListener('masterprep:session-expired', expired)
  try {
    setCsrfToken('c'.repeat(64))
    await apiFetch('/api/progress', { method: 'PUT' })
    expect(expired).toHaveBeenCalledOnce()
    await apiFetch('/api/logout', { method: 'POST' })
    expect(fetcher.mock.calls[1][1].headers.has('x-csrf-token')).toBe(false)
  } finally {
    window.removeEventListener('masterprep:session-expired', expired)
  }
})
