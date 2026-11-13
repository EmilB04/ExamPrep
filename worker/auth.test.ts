import { beforeAll, expect, it, vi } from 'vitest'
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'

const keys = await generateKeyPair('RS256')
const publicKey = await exportJWK(keys.publicKey)
vi.mock('jose', async (importOriginal) => {
  const original = await importOriginal<typeof import('jose')>()
  return {
    ...original,
    createRemoteJWKSet: () => original.createLocalJWKSet({ keys: [publicKey] }),
  }
})
const { identity } = await import('./auth')
const env = {
  ACCESS_TEAM_DOMAIN: 'masterprep.cloudflareaccess.com',
  ACCESS_AUD: 'study-app',
}
async function token(claims: Record<string, unknown> = {}, otherKey = false) {
  return new SignJWT({ email: 'student@example.test', ...claims })
    .setProtectedHeader({ alg: 'RS256' })
    .setSubject('student-1')
    .setIssuedAt()
    .setIssuer(`https://${env.ACCESS_TEAM_DOMAIN}`)
    .setAudience(env.ACCESS_AUD)
    .setExpirationTime('5m')
    .sign(
      otherKey ? (await generateKeyPair('RS256')).privateKey : keys.privateKey,
    )
}
it('accepts a signed Access assertion and cookie, deriving identity from verified claims', async () => {
  const jwt = await token()
  expect(
    await identity(
      new Request('https://study.test', {
        headers: { 'Cf-Access-Jwt-Assertion': jwt },
      }),
      env,
    ),
  ).toEqual({ id: 'student-1', email: 'student@example.test' })
  expect(
    await identity(
      new Request('https://study.test', {
        headers: { cookie: `other=x; CF_Authorization=${jwt}` },
      }),
      env,
    ),
  ).toEqual({ id: 'student-1', email: 'student@example.test' })
})
it('fails closed for missing configuration, forged identity headers, invalid signature, audience, issuer, and expiry', async () => {
  expect(
    await identity(
      new Request('https://study.test', {
        headers: { 'Cf-Access-Authenticated-User-Email': 'fake@example.test' },
      }),
      env,
    ),
  ).toBeNull()
  const jwt = await token()
  const request = new Request('https://study.test', {
    headers: { 'Cf-Access-Jwt-Assertion': jwt },
  })
  expect(await identity(request, {})).toBeNull()
  expect(
    await identity(request, { ...env, ACCESS_AUD: 'other-app' }),
  ).toBeNull()
  expect(
    await identity(request, {
      ...env,
      ACCESS_TEAM_DOMAIN: 'other.cloudflareaccess.com',
    }),
  ).toBeNull()
  expect(
    await identity(
      new Request('https://study.test', {
        headers: { 'Cf-Access-Jwt-Assertion': await token({}, true) },
      }),
      env,
    ),
  ).toBeNull()
  vi.useFakeTimers()
  vi.setSystemTime(Date.now() + 3600000)
  expect(await identity(request, env)).toBeNull()
  vi.useRealTimers()
})
