import { signOut } from './api-client'
import { useEffect, useRef, useState } from 'react'
import { LogIn, LogOut, UserRound } from 'lucide-react'
import { ActionButton } from './ActionButton'

export function ProfileControl({
  user,
  configured,
  status,
  expired = false,
}: {
  user: { email: string } | null
  configured: boolean
  status: string
  expired?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [signInRequested, setSignInRequested] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const action = panel.current?.querySelector<HTMLElement>(
      'a, button:not([disabled])',
    )
    ;(action || panel.current)?.focus()
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    function keyboard(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
      trigger.current?.focus()
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', keyboard)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', keyboard)
    }
  }, [open])
  return (
    <div className="profile-control" ref={root}>
      {(!user || expired) &&
        (configured ? (
          <a className="header-sign-in" href="/api/login">
            <LogIn size={16} aria-hidden="true" />
            Sign in
          </a>
        ) : (
          <ActionButton
            className="header-sign-in"
            onClick={() => {
              setSignInRequested(true)
              setOpen(true)
            }}
          >
            <LogIn size={16} aria-hidden="true" />
            Sign in
          </ActionButton>
        ))}
      <ActionButton
        ref={trigger}
        className="profile-trigger"
        aria-label="Profile"
        title="Profile"
        aria-expanded={open}
        aria-controls="profile-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <UserRound size={21} aria-hidden="true" />
        {user && !expired && (
          <span className="profile-online" aria-hidden="true" />
        )}
      </ActionButton>
      {open && (
        <div
          ref={panel}
          tabIndex={-1}
          className="profile-panel panel"
          id="profile-panel"
          role="region"
          aria-label="Profile details"
        >
          <div className="eyebrow">YOUR ACCOUNT</div>
          <strong>{user?.email || 'Studying as a guest'}</strong>
          <p>{status}</p>
          {error && <p role="alert">{error}</p>}
          {user && !expired ? (
            <ActionButton
              className="profile-action"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true)
                setError('')
                try {
                  await signOut()
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : 'Could not sign out. Try again.',
                  )
                  setSigningOut(false)
                }
              }}
            >
              <LogOut size={16} />
              {signingOut ? 'Signing out…' : 'Sign out'}
            </ActionButton>
          ) : configured ? (
            <>
              <p>
                We’ll send a one-time code to your email. No password needed.
              </p>
              <a className="profile-action" href="/api/login">
                <LogIn size={16} />
                Sign in with email
              </a>
            </>
          ) : (
            <>
              <ActionButton
                className="profile-action"
                onClick={() => setSignInRequested(true)}
              >
                <LogIn size={16} />
                Sign in to sync your studies
              </ActionButton>
              <p
                className="sample-note"
                role={signInRequested ? 'alert' : undefined}
              >
                Cloud sign-in is not available on this deployment yet. Your
                notes and progress are saved in this browser. You can keep
                studying as a guest.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
