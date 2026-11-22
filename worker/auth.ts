import type { Database } from './database'
import { hashToken, withinLimit } from './session'

export const PIN_RE = /^\d{4,6}$/
export const USERNAME_MAX = 20
export const MAX_FAILED = 5
// Total PIN attempts per name per day, across all IPs.
const DAILY_ATTEMPTS = 20
export const LOCKOUT_SECONDS = 15 * 60
// Repeat lockouts double (15m, 30m, 1h) but stay capped at an hour so an anonymous
// attacker cannot lock an owner out for long; recovery has its own counter and lock.
const MAX_LOCKOUT_SECONDS = 60 * 60
const RECOVER_MAX_FAILED = 10
const RECOVER_LOCKOUT_SECONDS = 60 * 60
// Workers cap PBKDF2 at 100000; the attempt lockout is what actually stops guessing.
export const PBKDF2_ROUNDS = 100000
const encoder = new TextEncoder()
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
export const RECOVERY_LENGTH = 12

export type AuthEnv = { DB?: Database }
type Row = {
  username: string
  pin_hash: string
  pin_salt: string
  failed: number
  locked_until: number | null
  recovery_hash: string | null
  recovery_salt: string | null
  recover_failed: number
  recover_locked_until: number | null
}

const b64 = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
const unb64 = (text: string) => {
  const p = text.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(p + '='.repeat((4 - (p.length % 4)) % 4)), (c) =>
    c.charCodeAt(0),
  )
}
export const newSalt = () => b64(crypto.getRandomValues(new Uint8Array(16)))
export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
export async function hashPin(pin: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  return b64(
    await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: unb64(salt),
        iterations: PBKDF2_ROUNDS,
      },
      key,
      256,
    ),
  )
}
async function hashCode(code: string, salt: string) {
  const s = unb64(salt)
  const bytes = new Uint8Array(s.length + code.length)
  bytes.set(s)
  bytes.set(encoder.encode(code), s.length)
  return b64(await crypto.subtle.digest('SHA-256', bytes))
}
/** A 60-bit code shown once, e.g. K7QM-2XRP-9FHD. Only its salted hash is stored. */
export function newRecoveryCode() {
  const chars = Array.from(
    crypto.getRandomValues(new Uint8Array(RECOVERY_LENGTH)),
    (b) => ALPHABET[b % 32],
  ).join('')
  return chars.match(/.{4}/g)!.join('-')
}
export function normalizeCode(input: unknown) {
  if (typeof input !== 'string') return null
  const code = input
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1')
  return code.length === RECOVERY_LENGTH &&
    [...code].every((c) => ALPHABET.includes(c))
    ? code
    : null
}
const RESERVED = new Set([
  'admin',
  'administrator',
  'root',
  'system',
  'support',
  'moderator',
  'masterprep',
  'examprep',
  'staff',
  'null',
  'undefined',
])
/** PINs that are among the first things anyone guesses: repeats and straight runs. */
export function weakPin(pin: string) {
  if (/^(\d)\1+$/.test(pin)) return true
  const digits = [...pin].map(Number)
  const step = digits[1] - digits[0]
  if (
    (step === 1 || step === -1) &&
    digits.every((d, i) => i === 0 || d - digits[i - 1] === step)
  )
    return true
  return ['1212', '2580', '1122', '6969', '1004', '2000', '4321'].includes(pin)
}
export function validateUsername(value: unknown) {
  if (typeof value !== 'string') return 'username_empty'
  const name = value.trim()
  if (!name) return 'username_empty'
  if (name.length > USERNAME_MAX) return 'username_too_long'
  if (!/^[\p{L}\p{N} ._'-]+$/u.test(name)) return 'username_chars'
  // Letters/digits must be present, and the name can't impersonate the site.
  if (!/[\p{L}\p{N}]/u.test(name)) return 'username_chars'
  if (RESERVED.has(name.toLowerCase().replace(/[ ._'-]+/g, '')))
    return 'name_reserved'
  return null
}
const now = () => Math.floor(Date.now() / 1000)
export type AuthResult =
  | { ok: true; username: string; recoveryCode?: string }
  | { ok: false; error: string; status: number; retryAfter?: number }
const fail = (error: string, status: number, retryAfter?: number) =>
  ({ ok: false, error, status, retryAfter }) as const
// Every PIN lock reports the same fixed hint, real account or not, so the
// response never reveals whether a name exists (or how long its lock really is).
const locked = (_until?: number) => fail('locked', 429, LOCKOUT_SECONDS)

async function lookup(db: Database, username: string) {
  return db
    .prepare('SELECT * FROM players WHERE username = ?')
    .bind(username)
    .first<Row>()
}
/**
 * Claim one attempt atomically BEFORE checking the secret, so parallel guesses
 * each consume a slot instead of all reading the same counter. False = locked.
 * The slot that reaches the limit sets the lock and resets the counter.
 */
async function claimAttempt(
  db: Database,
  username: string,
  column: 'failed' | 'recover_failed',
  lockColumn: 'locked_until' | 'recover_locked_until',
  countColumn: 'lock_count' | 'recover_lock_count',
  max: number,
  lockSeconds: number,
) {
  const t = now()
  const claimed = await db
    .prepare(
      `UPDATE players SET
         ${lockColumn} = CASE WHEN ${column} + 1 >= ?1
           THEN ?2 + MIN(?3, ?4 * (1 << MIN(${countColumn}, 10))) ELSE NULL END,
         ${countColumn} = CASE WHEN ${column} + 1 >= ?1 THEN ${countColumn} + 1 ELSE ${countColumn} END,
         ${column} = CASE WHEN ${column} + 1 >= ?1 THEN 0 ELSE ${column} + 1 END
       WHERE username = ?5 AND (${lockColumn} IS NULL OR ${lockColumn} <= ?2)
       RETURNING username`,
    )
    .bind(max, t, MAX_LOCKOUT_SECONDS, lockSeconds, username)
    .first<{ username: string }>()
  return !!claimed
}
async function issueRecovery(db: Database, username: string) {
  const code = newRecoveryCode()
  const salt = newSalt()
  await db
    .prepare(
      'UPDATE players SET recovery_hash = ?, recovery_salt = ? WHERE username = ?',
    )
    .bind(await hashCode(normalizeCode(code)!, salt), salt, username)
    .run()
  return code
}

export async function register(
  db: Database,
  usernameInput: unknown,
  pin: unknown,
): Promise<AuthResult> {
  const invalid = validateUsername(usernameInput)
  if (invalid) return fail(invalid, 400)
  if (typeof pin !== 'string' || !PIN_RE.test(pin)) return fail('bad_pin', 400)
  if (weakPin(pin)) return fail('weak_pin', 400)
  const username = (usernameInput as string).trim()
  const salt = newSalt()
  const t = now()
  const result = await db
    .prepare(
      'INSERT INTO players (username, pin_hash, pin_salt, created_at, last_seen) VALUES (?, ?, ?, ?, ?) ON CONFLICT(username) DO NOTHING',
    )
    .bind(username, await hashPin(pin, salt), salt, t, t)
    .run()
  if (!result.meta.changes) return fail('name_taken', 409)
  return { ok: true, username, recoveryCode: await issueRecovery(db, username) }
}

export async function login(
  db: Database,
  usernameInput: unknown,
  pin: unknown,
): Promise<AuthResult> {
  const invalid = validateUsername(usernameInput)
  if (invalid || typeof pin !== 'string' || !PIN_RE.test(pin))
    return fail('bad_credentials', 401)
  // ONE throttle per name hash, applied BEFORE any lookup, so a real account and
  // an unknown name are indistinguishable by construction: same counters, same
  // windows, same 429. Two tiers: a short burst limit, and a daily budget that
  // bounds slow guessing (a lost-PIN owner still gets in with the recovery code).
  // Each check is one atomic upsert, so parallel guesses cannot outrun it.
  const nameKey = await hashToken(
    (usernameInput as string).trim().toLowerCase(),
  )
  const burstOk = await withinLimit(
    db,
    `pin:${nameKey}`,
    MAX_FAILED,
    LOCKOUT_SECONDS,
  )
  const dayOk = await withinLimit(
    db,
    `pin-day:${nameKey}`,
    DAILY_ATTEMPTS,
    86400,
  )
  if (!burstOk || !dayOk) return locked()
  const row = await lookup(db, (usernameInput as string).trim())
  // Unknown name and wrong PIN answer identically so the form can't list accounts.
  if (!row) {
    await hashPin(pin, newSalt()) // keep timing similar
    return fail('bad_credentials', 401)
  }
  if (!timingSafeEqual(await hashPin(pin, row.pin_salt), row.pin_hash))
    return fail('bad_credentials', 401)
  await db
    .prepare('UPDATE players SET last_seen = ? WHERE username = ?')
    .bind(now(), row.username)
    .run()
  return { ok: true, username: row.username }
}

/** Forgotten PIN: set a new one with the one-time recovery code. Rotates the code. */
export async function recover(
  db: Database,
  usernameInput: unknown,
  codeInput: unknown,
  newPin: unknown,
): Promise<AuthResult> {
  const invalid = validateUsername(usernameInput)
  if (invalid) return fail(invalid, 400)
  if (typeof newPin !== 'string' || !PIN_RE.test(newPin))
    return fail('bad_pin', 400)
  if (weakPin(newPin)) return fail('weak_pin', 400)
  const code = normalizeCode(codeInput)
  if (!code) return fail('bad_code_format', 400)
  const row = await lookup(db, (usernameInput as string).trim())
  if (!row) return fail('bad_credentials', 401)
  if (
    !(await claimAttempt(
      db,
      row.username,
      'recover_failed',
      'recover_locked_until',
      'recover_lock_count',
      RECOVER_MAX_FAILED,
      RECOVER_LOCKOUT_SECONDS,
    ))
  ) {
    const current = await lookup(db, row.username)
    return locked(
      current?.recover_locked_until ?? now() + RECOVER_LOCKOUT_SECONDS,
    )
  }
  const ok =
    !!row.recovery_hash &&
    !!row.recovery_salt &&
    timingSafeEqual(await hashCode(code, row.recovery_salt), row.recovery_hash)
  if (!ok) return fail('bad_credentials', 401)
  const salt = newSalt()
  const fresh = newRecoveryCode()
  const freshSalt = newSalt()
  // Matching on the old hash makes the code single-use even under concurrency.
  const result = await db
    .prepare(
      `UPDATE players SET pin_hash = ?, pin_salt = ?, failed = 0, locked_until = NULL, lock_count = 0,
         recover_failed = 0, recover_locked_until = NULL, recover_lock_count = 0,
         recovery_hash = ?, recovery_salt = ?, last_seen = ?
       WHERE username = ? AND recovery_hash = ?`,
    )
    .bind(
      await hashPin(newPin, salt),
      salt,
      await hashCode(normalizeCode(fresh)!, freshSalt),
      freshSalt,
      now(),
      row.username,
      row.recovery_hash!,
    )
    .run()
  if (!result.meta.changes) return fail('bad_credentials', 401)
  // A recovered account drops every existing session (the old PIN may be known).
  await db
    .prepare('DELETE FROM app_sessions WHERE username = ?')
    .bind(row.username)
    .run()
  return { ok: true, username: row.username, recoveryCode: fresh }
}
