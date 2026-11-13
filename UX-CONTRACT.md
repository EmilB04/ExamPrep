# Workspace interaction contract

- Buttons: `src/ActionButton.tsx`; styling and focus: `src/styles.css`.
- Forms: native labelled controls, app-owned validation, noValidate, explicit busy/error states. Native course select intentionally uses platform popup behavior.
- Notifications: inline status (`role=status`) and error (`role=alert`); no native dialogs.
- Navigation: learning stage buttons may skip or revisit any stage. Visiting is not completing. Quiz completion and written recall remain required for lesson completion.
- Identity: Cloudflare Access JWT verified on the server; no browser-supplied user IDs. Guest data remains guest data until explicitly imported.
- Persistence: guest storage remains browser-local; signed-in state is isolated by subject. Server revisions reject stale writes. Conflicts retain local work and offer explicit recovery; no silent remote overwrite.
- Assistant opens from a fixed bottom-right bubble without shifting page content. The nonmodal panel focuses its question field (or close button for guests); Escape and Close restore focus to the bubble. The panel stays within narrow viewports and scrolls independently. Server chooses bundled course material; conversation remains in memory, scoped to selected course, and can be cleared. Requests can be cancelled, errors retain the question, responses are advisory.
- Scrollbars: global standards-based styling in src/styles.css; forced colors use system defaults.

## Canonical UI Map

| Capability     | Canonical owner                         | Source of truth | Allowed variants                   | Verification                                |
| -------------- | --------------------------------------- | --------------- | ---------------------------------- | ------------------------------------------- |
| Form           | Native labelled inputs and ActionButton | This contract   | notebook, recall, assistant        | component tests and browser workflow        |
| Select/Listbox | Native select                           | This contract   | course context, exercises, reading | keyboard and native popup browser check     |
| Scrollbar      | src/styles.css                          | DESIGN.md       | forced-colors system fallback      | browser computed styles                     |
| Toast          | Inline status and alert regions         | This contract   | saving, failure, AI busy           | sync and assistant component tests          |
| CRUD           | useStudySync and worker/api.ts          | This contract   | guest, account, conflict recovery  | SQLite isolation tests and browser workflow |
