let csrfToken: string | null = null
export function setCsrfToken(token: string | null) {
  csrfToken = token
}
export async function apiFetch(input: string, init: RequestInit = {}) {
  if (!input.startsWith('/api/'))
    throw new Error('API requests must stay on this site.')
  const headers = new Headers(init.headers)
  if (
    csrfToken &&
    init.method &&
    !['GET', 'HEAD'].includes(init.method.toUpperCase())
  )
    headers.set('x-csrf-token', csrfToken)
  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'same-origin',
  })
  if (response.status === 401) {
    csrfToken = null
    if (typeof window !== 'undefined')
      window.dispatchEvent(new Event('masterprep:session-expired'))
  }
  return response
}
export type AuthAction = 'login' | 'register' | 'recover'
export type AuthOutcome =
  | { ok: true; recoveryCode: string | null }
  | { ok: false; error: string; retryAfter?: number }
export async function authenticate(
  action: AuthAction,
  fields: { username: string; pin?: string; code?: string; newPin?: string },
): Promise<AuthOutcome> {
  let response: Response
  try {
    response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ action, ...fields }),
    })
  } catch {
    return { ok: false, error: 'service_failed' }
  }
  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.csrfToken)
    return {
      ok: false,
      error: typeof body?.error === 'string' ? body.error : 'service_failed',
      retryAfter:
        typeof body?.retryAfter === 'number' ? body.retryAfter : undefined,
    }
  setCsrfToken(body.csrfToken)
  // A recovery code is shown once; the session hook reloads after it is dismissed.
  if (!body.recoveryCode) announceSignedIn()
  return { ok: true, recoveryCode: body.recoveryCode ?? null }
}
export function announceSignedIn() {
  window.dispatchEvent(new Event('masterprep:signed-in'))
}
export async function signOut() {
  const response = await apiFetch('/api/logout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
  if (!response.ok && response.status !== 401)
    throw new Error('Could not sign out. Reload and try again.')
  setCsrfToken(null)
  window.location.reload()
}
