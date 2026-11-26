# Workspace interaction contract

- Buttons: `src/ActionButton.tsx`; styling and focus: `src/styles.css`.
- Forms: native labelled controls, app-owned validation, noValidate, explicit busy/error states. Native course select intentionally uses platform popup behavior.
- Notifications: inline status (`role=status`) and error (`role=alert`); no native dialogs.
- Navigation: learning stage buttons may skip or revisit any stage. Visiting is not completing. Quiz completion and written recall remain required for lesson completion.
- Identity: username + 4–6 digit PIN (no email). `POST /api/auth` verifies it and creates a revocable, host-only application session. A recovery code is shown once at account creation and resets a forgotten PIN; PIN entry is always repeated when it is being set. API writes use the shared api-client with per-session CSRF tokens and matching Origin; no browser-supplied user IDs. Guest data remains guest data until explicitly imported.
- Final exam practice: each course page has a Final exam practice panel that opens `ExamMode`, which mimics that course's real exam (Scientific Methods: ~50-question timed multiple choice; Complex Systems: random-topic presentation then follow-up questions; Machine Learning: 4-hour pen-and-paper paper, self-marked). Sessions are in-memory only and never change lesson progress. Answers stay hidden until hand-in or self-marking.
- Persistence: guest storage remains browser-local; signed-in state is isolated by subject. Server revisions reject stale writes. Conflicts retain local work and offer explicit recovery; no silent remote overwrite.
- Assistant opens from a fixed bottom-right bubble without shifting page content. The nonmodal panel focuses its question field (or close button for guests); Escape and Close restore focus to the bubble. The panel grows with its content up to the viewport limit and widens for answers on desktop. Only the body scrolls; the close control and composer remain visible. Desktop supports expand/collapse; mobile follows PortfolioV2 with a full-screen modal, focus containment, background scroll lock, and visual-viewport sizing so the keyboard does not cover the composer. Markdown headings use chat typography rather than page-heading sizes. Server chooses bundled course material; conversation remains in memory, scoped to selected course, and can be cleared. Requests can be cancelled, errors retain the question, responses are advisory.
- Scrollbars: global standards-based styling in src/styles.css; forced colors use system defaults.

## Canonical UI Map

| Capability     | Canonical owner                         | Source of truth | Allowed variants                   | Verification                                |
| -------------- | --------------------------------------- | --------------- | ---------------------------------- | ------------------------------------------- |
| Form           | Native labelled inputs and ActionButton | This contract   | notebook, recall, assistant        | component tests and browser workflow        |
| Select/Listbox | Native select                           | This contract   | course context, exercises, reading | keyboard and native popup browser check     |
| Scrollbar      | src/styles.css                          | DESIGN.md       | forced-colors system fallback      | browser computed styles                     |
| Toast          | Inline status and alert regions         | This contract   | saving, failure, AI busy           | sync and assistant component tests          |
| CRUD           | useStudySync and worker/api.ts          | This contract   | guest, account, conflict recovery  | SQLite isolation tests and browser workflow |

- Profile: the far-right circular person button opens an account disclosure. Escape restores focus to the trigger; clicking outside dismisses it. Guests also have a visible Sign in action beside the profile icon. The header Sign in button and the disclosure open a dedicated Account page with Sign in, Create account (PIN entered twice, recovery code shown once) and Forgot PIN; it returns to Overview once signed in. Sign-out lives in the disclosure and on the Account page. If authentication is unavailable, Sign in opens a clear inline explanation and preserves guest study.

- Session expiry blocks remote edits while preserving the current account recovery cache. Offer Sign in again without saving account data under the guest storage key. Sign out revokes the application session through a CSRF-protected POST.
