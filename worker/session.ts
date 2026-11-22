import type { AuthEnv } from './auth'
import type { Database } from './database'

export type SessionEnv = AuthEnv & { DB?: Database }
export type Session = {
  id: string
  username: string
  csrf: string
  expiresAt: number
}
const cookieName = '__Host-masterprep_session'
const maxAge = 3600
const maxSessions = 5
export const randomToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')
export async function hashToken(value: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)),
    ),
    (b) => b.toString(16).padStart(2, '0'),
  ).join('')
}
function cookieToken(request: Request) {
  const token = request.headers
    .get('cookie')
    ?.split(';')
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1)
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null
}
export function sessionCookie(token: string, age = maxAge) {
  return `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`
}
export async function readSession(
  request: Request,
  env: SessionEnv,
): Promise<Session | null> {
  const token = cookieToken(request)
  if (!token || !env.DB) return null
  const row = await env.DB.prepare(
    'SELECT username, csrf_token, expires_at FROM app_sessions WHERE token_hash = ? AND expires_at > ?',
  )
    .bind(await hashToken(token), Math.floor(Date.now() / 1000))
    .first<{
      username: string
      csrf_token: string
      expires_at: number
    }>()
  return row
    ? {
        id: row.username,
        username: row.username,
        csrf: row.csrf_token,
        expiresAt: row.expires_at,
      }
    : null
}
export async function revokeSession(request: Request, env: SessionEnv) {
  const token = cookieToken(request)
  if (token && env.DB)
    await env.DB.prepare('DELETE FROM app_sessions WHERE token_hash = ?')
      .bind(await hashToken(token))
      .run()
}
export async function createSession(
  request: Request,
  env: SessionEnv,
  username: string,
) {
  if (!env.DB || new URL(request.url).protocol !== 'https:') return null
  const token = randomToken()
  const csrf = randomToken()
  const now = Math.floor(Date.now() / 1000)
  // Rotate a previous session rather than accepting a client-chosen token.
  await revokeSession(request, env)
  await env.DB.prepare('DELETE FROM app_sessions WHERE expires_at <= ?')
    .bind(now)
    .run()
  await env.DB.prepare(
    'INSERT INTO app_sessions (token_hash, username, csrf_token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(await hashToken(token), username, csrf, now + maxAge, now)
    .run()
  // Keep only the newest sessions per account so stolen-token churn can't pile up.
  await env.DB.prepare(
    'DELETE FROM app_sessions WHERE username = ? AND token_hash NOT IN (SELECT token_hash FROM app_sessions WHERE username = ? ORDER BY created_at DESC, rowid DESC LIMIT ?)',
  )
    .bind(username, username, maxSessions)
    .run()
  return { cookie: sessionCookie(token), csrf, expiresAt: now + maxAge }
}
export async function validCsrf(request: Request, session: Session) {
  const token = request.headers.get('x-csrf-token')
  if (!token || token.length !== 64) return false
  // Compare fixed-size digests without an early exit on a matching prefix.
  const a = await hashToken(token)
  const b = await hashToken(session.csrf)
  let difference = 0
  for (let i = 0; i < a.length; i++)
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return difference === 0
}
/**
 * Fixed-window counter in D1. `windowSeconds` (a multiple of 60) lets one table
 * hold per-minute and per-day buckets. The `minute` column stores the minute at
 * which the window ENDS, so one global sweep removes every expired row of every
 * bucket, including buckets that are never touched again.
 */
export async function withinLimit(
  db: Database,
  bucket: string,
  limit: number,
  windowSeconds = 60,
) {
  const nowMs = Date.now()
  const slot = Math.floor(nowMs / (windowSeconds * 1000))
  const endsAt = ((slot + 1) * windowSeconds) / 60
  const result = await db
    .prepare(
      'INSERT INTO request_limits (bucket, minute, requests) VALUES (?, ?, 1) ON CONFLICT(bucket, minute) DO UPDATE SET requests = requests + 1 RETURNING requests',
    )
    .bind(bucket, endsAt)
    .first<{ requests: number }>()
  await db
    .prepare('DELETE FROM request_limits WHERE minute < ?')
    .bind(Math.floor(nowMs / 60000))
    .run()
  return !!result && result.requests <= limit
}
