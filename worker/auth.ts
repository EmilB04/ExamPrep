import { createRemoteJWKSet, jwtVerify } from 'jose'

export type AuthEnv = {
  ACCESS_TEAM_DOMAIN?: string
  ACCESS_AUD?: string
}
export type Identity = { id: string; email: string }

export async function identity(
  request: Request,
  env: AuthEnv,
): Promise<Identity | null> {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN))
    return null
  const token =
    request.headers.get('Cf-Access-Jwt-Assertion') ??
    request.headers
      .get('cookie')
      ?.split(';')
      .map((v) => v.trim())
      .find((v) => v.startsWith('CF_Authorization='))
      ?.slice(17)
  if (!token || token.length > 16000) return null
  const issuer = `https://${env.ACCESS_TEAM_DOMAIN}`
  try {
    const { payload } = await jwtVerify(
      token,
      createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)),
      {
        issuer,
        audience: env.ACCESS_AUD,
        algorithms: ['RS256'],
        requiredClaims: ['exp', 'iat', 'sub', 'email'],
        maxTokenAge: '1h',
        clockTolerance: 5,
      },
    )
    if (
      typeof payload.sub !== 'string' ||
      !payload.sub ||
      typeof payload.email !== 'string'
    )
      return null
    return { id: payload.sub, email: payload.email }
  } catch {
    return null
  }
}
