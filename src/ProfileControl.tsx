import { useEffect, useRef, useState } from 'react'
import { LogIn, LogOut, UserRound } from 'lucide-react'
import { ActionButton } from './ActionButton'

export function ProfileControl({
  user,
  configured,
  status,
}: {
  user: { email: string } | null
  configured: boolean
  status: string
}) {
  const [open, setOpen] = useState(false)
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
        {user && <span className="profile-online" aria-hidden="true" />}
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
          {user ? (
            <a className="profile-action" href="/cdn-cgi/access/logout">
              <LogOut size={16} />
              Sign out
            </a>
          ) : configured ? (
            <a className="profile-action" href="/api/login">
              <LogIn size={16} />
              Sign in to sync your studies
            </a>
          ) : (
            <p className="sample-note">
              Account sign-in is not configured for this deployment. Your notes
              and progress stay in this browser.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
