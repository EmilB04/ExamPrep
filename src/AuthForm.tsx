import { useId, useState } from 'react'
import { KeyRound, LogIn, UserPlus } from 'lucide-react'
import { ActionButton } from './ActionButton'
import { announceSignedIn, authenticate, type AuthAction } from './api-client'

const messages: Record<string, string> = {
  bad_credentials: 'Wrong username or PIN.',
  bad_pin: 'The PIN must be 4 to 6 digits.',
  weak_pin:
    'That PIN is too easy to guess (like 1234 or 0000). Choose another.',
  name_reserved: 'That username is reserved. Pick another.',
  pin_mismatch: 'The two PINs do not match.',
  name_taken: 'That username is taken. Pick another.',
  username_empty: 'Enter a username.',
  username_too_long: 'The username can be at most 20 characters.',
  username_chars: 'Use letters, numbers, spaces and . _ - only.',
  bad_code_format:
    'The recovery code is 12 letters and digits, e.g. K7QM-2XRP-9FHD.',
  not_configured: 'Sign-in needs a secure (https) connection.',
  service_failed: 'Could not reach the service. Try again.',
}
function describe(error: string, retryAfter?: number) {
  if (error === 'locked') {
    const minutes = Math.max(1, Math.ceil((retryAfter ?? 60) / 60))
    return `Too many attempts. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`
  }
  return messages[error] ?? messages.service_failed
}

export function AuthForm() {
  const id = useId()
  const [mode, setMode] = useState<AuthAction>('login')
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [shownCode, setShownCode] = useState<string | null>(null)
  const needsConfirm = mode !== 'login'

  function switchMode(next: AuthAction) {
    setMode(next)
    setError('')
    setPin('')
    setConfirm('')
    setCode('')
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    if (needsConfirm && pin !== confirm) {
      setError(describe('pin_mismatch'))
      setConfirm('')
      return
    }
    setBusy(true)
    setError('')
    const result = await authenticate(
      mode,
      mode === 'recover' ? { username, code, newPin: pin } : { username, pin },
    )
    setBusy(false)
    setPin('')
    setConfirm('')
    if (!result.ok) return setError(describe(result.error, result.retryAfter))
    setCode('')
    if (result.recoveryCode) setShownCode(result.recoveryCode)
  }

  if (shownCode)
    return (
      <div className="auth-form">
        <p>
          <strong>Save your recovery code.</strong> It is the only way to reset
          a forgotten PIN, and it is shown once.
        </p>
        <code className="auth-code" aria-label="Recovery code">
          {shownCode}
        </code>
        <ActionButton
          className="profile-action"
          onClick={() => {
            setShownCode(null)
            announceSignedIn()
          }}
        >
          I have saved it
        </ActionButton>
      </div>
    )
  const Icon =
    mode === 'login' ? LogIn : mode === 'register' ? UserPlus : KeyRound
  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-tabs" role="group" aria-label="Account action">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m || (mode === 'recover' && m === 'login')}
            onClick={() => switchMode(m)}
          >
            {m === 'login' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>
      <label htmlFor={`${id}-user`}>Username</label>
      <input
        id={`${id}-user`}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        maxLength={20}
        required
      />
      {mode === 'recover' && (
        <>
          <label htmlFor={`${id}-code`}>Recovery code</label>
          <input
            id={`${id}-code`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="K7QM-2XRP-9FHD"
            required
          />
        </>
      )}
      <label htmlFor={`${id}-pin`}>
        {mode === 'recover' ? 'New PIN' : 'PIN'}
      </label>
      <input
        id={`${id}-pin`}
        type="password"
        inputMode="numeric"
        pattern="\d{4,6}"
        minLength={4}
        maxLength={6}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        placeholder="4–6 digits"
        required
      />
      {needsConfirm && (
        <>
          <label htmlFor={`${id}-confirm`}>Repeat PIN</label>
          <input
            id={`${id}-confirm`}
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))}
            autoComplete="new-password"
            required
          />
        </>
      )}
      {error && <p role="alert">{error}</p>}
      <button className="profile-action" type="submit" disabled={busy}>
        <Icon size={16} aria-hidden="true" />
        {busy
          ? 'Please wait…'
          : mode === 'login'
            ? 'Sign in'
            : mode === 'register'
              ? 'Create account'
              : 'Reset PIN'}
      </button>
      {mode === 'login' && (
        <button
          type="button"
          className="auth-link"
          onClick={() => switchMode('recover')}
        >
          Forgot PIN?
        </button>
      )}
      {mode === 'recover' && (
        <button
          type="button"
          className="auth-link"
          onClick={() => switchMode('login')}
        >
          Back to sign in
        </button>
      )}
    </form>
  )
}
