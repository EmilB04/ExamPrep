# Workspace interaction contract

- Buttons: `src/ActionButton.tsx`; styling and focus: `src/styles.css`.
- Forms: native labelled controls, app-owned validation, noValidate, explicit busy/error states. Native course select intentionally uses platform popup behavior.
- Notifications: inline status (`role=status`) and error (`role=alert`); no native dialogs.
- Navigation: learning stage buttons may skip or revisit any stage. Visiting is not completing. Quiz completion and written recall remain required for lesson completion.
- Identity: Cloudflare Access JWT verified on the server; no browser-supplied user IDs. Guest data remains guest data until explicitly imported.
- Persistence: guest storage remains browser-local; signed-in state is isolated by subject. Server revisions reject stale writes. Conflicts retain local work and offer explicit recovery; no silent remote overwrite.
- Assistant: server chooses bundled course material; conversation remains in memory, scoped to selected course, and can be cleared. Requests can be cancelled, errors retain the question, responses are advisory.
- Scrollbars: global standards-based styling in src/styles.css; forced colors use system defaults.
