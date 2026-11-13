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
export async function signOut() {
  const response = await apiFetch('/api/logout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
  if (!response.ok && response.status !== 401)
    throw new Error('Could not sign out. Reload and try again.')
  setCsrfToken(null)
  window.location.assign('/cdn-cgi/access/logout')
}
