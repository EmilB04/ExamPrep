import { LogOut, ShieldCheck } from 'lucide-react'
import { ActionButton } from './ActionButton'
import { AuthForm } from './AuthForm'
import { signOut } from './api-client'

export function AccountPage({
  user,
  expired,
  configured,
  status,
}: {
  user: { username: string } | null
  expired: boolean
  configured: boolean
  status: string
}) {
  const signedIn = !!user && !expired
  return (
    <section className="account-page" aria-labelledby="account-title">
      <div className="eyebrow">YOUR ACCOUNT</div>
      <h1 id="account-title">
        {signedIn
          ? `Signed in as ${user.username}`
          : expired
            ? 'Sign in again'
            : 'Sign in or create an account'}
        <span className="heading-dot">.</span>
      </h1>
      <div className="panel account-card">
        {signedIn ? (
          <>
            <p>{status}</p>
            <ActionButton
              className="profile-action"
              onClick={() => void signOut().catch(() => undefined)}
            >
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </ActionButton>
          </>
        ) : configured ? (
          <>
            <p>
              {expired
                ? `Your session expired${user ? `, ${user.username}` : ''}. Your work is kept in this browser.`
                : 'Pick a username and a 4–6 digit PIN to sync your progress and notes across devices. No email needed.'}
            </p>
            <AuthForm />
          </>
        ) : (
          <p role="alert">
            Account sign-in needs a secure (https) connection to the study
            database, which this deployment does not have. Your notes and
            progress are saved in this browser. You can keep studying as a
            guest.
          </p>
        )}
        {!signedIn && (
          <p className="account-note">
            <ShieldCheck size={14} aria-hidden="true" /> Your PIN is stored
            hashed and never shown again. Save the recovery code you get when
            creating an account: it is the only way to reset a forgotten PIN.
          </p>
        )}
      </div>
    </section>
  )
}
