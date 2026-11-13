# MasterPrep

A learning platform for master's courses, built with React, TypeScript, Vite, Tailwind CSS v4, and Motion. The course library is shared. Guests keep progress and notes in their browser; signed-in students sync private study data through Cloudflare Access and D1.

## Start locally

```sh
npm ci
npm run dev
```

Open the printed local URL. Use a current Node.js LTS release; Cloudflare's CLI requires Node 22.23+, 24.22+, or 26.12+ within those major releases.

```sh
npm run check
npm test
npm run build
```

## Included

- Three courses: ITI41020, ITI41225, and ITI41720, with links to the official Autumn 2026 course descriptions.
- Eight Complex Systems lectures imported from the supplied course export, including 89 questions with explanations and hints; one illustrative starter lesson each for Machine Learning and Scientific Methods.
- Clickable header stages allow skipping ahead and going back without marking a lesson complete. Four-stage learning: reading in sections → interactive exploration → lecture quiz with feedback, retry, and first-attempt summary → written, self-assessed recall.
- Course topic outlines; topics without lessons are explicitly labelled as awaiting materials.
- Guest browser-local and authenticated cloud progress and notes, Markdown note export, and recall cards scheduled one day after lesson completion. Reviewing a card schedules another review in ten minutes or three days.
- Responsive navigation, keyboard-operable exercises, reduced-motion support, and feedback when browser persistence fails.
- Light, Dark, and System display options, with a saved browser preference, live system-theme updates, and an early theme script to avoid a light flash on reload. Fonts are self-hosted.
- Motion transitions for navigation and theme selection, cards, buttons, reading sections, quiz feedback, lesson steps, and interactive diagrams. System reduced-motion preferences are respected.

- AI recall checker: in the recall step, "Check my recall with AI" sends your text and that lesson's material to a Worker route (`/api/recall-check`), where Claude judges whether the recall is good enough and lists what is covered, missing, or wrong. Feedback is advisory and does not change progress. Requires sign-in, a D1 binding, and `ANTHROPIC_API_KEY`: on Cloudflare Pages, add it as a secret under the project's Settings → Variables and Secrets (the Pages Function in `functions/api/recall-check.ts` serves the route); on a Workers deployment, `npx cf workers secrets update ANTHROPIC_API_KEY`; locally, a `.dev.vars` file and `npm run dev:ai`. If the Pages build or runtime complains about `node:` modules, enable the `nodejs_compat` flag under Settings → Runtime; it was not needed in a local `wrangler pages dev` run. Without a backend the button reports that the checker is unavailable.

Guest progress is local to the browser and origin. Signed-in accounts use Cloudflare Access identity and D1 storage for cross-device sync, with revision checks to prevent silent overwrites. Browser-local guest data is imported only when the student chooses Import browser notes & progress. Account data has a separate recovery cache, and sync conflicts offer a backup download before loading the cloud version. Quiz completion requires working through every question; recall is self-assessed, not automatically marked. First-attempt quiz scores appear during the session; completion dates and total answer attempts persist, but score history is not yet stored.

The Complex Systems source is Claude-authored lecture review material, not an independently audited curriculum. Lectures 1–4 have slide-text sources in the supplied export; Lectures 5–8 are chat-derived and need the original slides for verification. Its exam-format discrepancy, the Lecture 3 alpha-masking correction, and the Lecture 5 adaptive-SIS uncertainty remain visible. Original slide images and videos were not included. See [content provenance](src/content/complex-systems/README.md).

## Cloudflare

### Pages (static deployment)

Connect this repository in Cloudflare Pages:

| Setting          | Value                                             |
| ---------------- | ------------------------------------------------- |
| Framework        | React (Vite)                                      |
| Build command    | `npm run build`                                   |
| Output directory | `dist`                                            |
| Node version     | Set `NODE_VERSION` to a supported current release |

No API keys or environment variables are required by the frontend. `npm run preview` serves the static build locally. Do not put private materials into `public/` or compiled content if you intend to host this publicly.

### Workers + Static Assets

`cloudflare.config.ts` and the Cloudflare Vite integration provide an alternative Workers deployment. The plugin is enabled only for the `cloudflare` build mode, so regular builds retain the Pages-compatible `dist` output and unit tests do not start a Worker runtime.

```sh
npx cf auth login
npm run cf:build
npm run deploy
```

The Workers command deploys the verified Cloudflare build output. Authentication and remote deployment are separate from local build verification. The D1 binding may be provisioned at deployment if MASTERPREP_D1_ID does not select an existing database. Local builds do not provision remote resources.

## Adding your lecture materials

Course and lesson types live in `src/content.ts`; lesson presentation is in `src/App.tsx` and interactive diagrams in `src/Illustration.tsx`. Export the relevant presentations and notes from Claude; there is no automatic Claude connection or upload processor.

For each topic, add source references (file name, lecture, page/slide), focused explanations, an appropriate illustration, an interactive exercise, several quiz items with explanations, and recall prompts. Courses support a `lessons` collection; preserve stable lesson IDs so progress remains meaningful. `scripts/import-complex-systems.mjs` transforms the supplied lecture Markdown and quiz JSON into the committed content data, without shipping the personal group-project summary or raw combined export.

D1 stores authenticated progress and notes. Private source-document uploads and R2 storage are not implemented; bundled course material remains shared.

Official references: [Scientific Methods](https://www.hiof.no/english/studies/courses/iio/itk/2026/autumn/iti41020.html), [Complex Systems](https://www.hiof.no/english/studies/courses/iio/itk/2026/autumn/iti41225.html), [Machine Learning](https://www.hiof.no/english/studies/courses/iio/itk/2026/autumn/iti41720.html).

## Sign-in, sync, and course assistant setup

1. Create a Cloudflare Access self-hosted application for **your exact MasterPrep hostname at `/api/login`**. Keep the rest of the site public so guests can study. Enable email one-time PIN or an identity provider, and add an Allow policy for the students who should have access. Do not use Bypass or Service Auth for this login application. Configure the same hostname you use for the app; cookie authentication does not transfer between preview and production hosts.
2. Copy the Access team domain (`your-team.cloudflareaccess.com`) and application audience (AUD). For Workers, set the build-time variables in `.env.example` before building (export them in your shell/CI). For Pages, add `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` as runtime variables in project settings.
3. Create a D1 database named `masterprep-study`. Workers use the `DB` binding declared in `cloudflare.config.ts`; set `MASTERPREP_D1_ID` to the database UUID to bind an existing database. On Pages add a D1 binding named `DB` in project settings. Apply `migrations/0001_study.sql` to that database using the D1 dashboard SQL console or `npm run db:migrate -- <DATABASE_ID>` (add `--local` for local data). Apply the schema before enabling login on the deployed app.
4. Add `ANTHROPIC_API_KEY` as a runtime secret. `AI_MODEL` optionally selects the model; the default matches the existing recall checker. Model access depends on your provider account. Questions, recent conversation, and bundled course material go to Anthropic; personal notes are never included automatically. Both AI routes require sign-in and share a per-user limit of ten requests per minute.
5. Build/deploy through the existing Pages or Workers workflow, then verify with two accounts: sign in, import guest data if desired, edit a note, reload on another device, and confirm the other account cannot see the note. Also check sign-out, expired sessions, and a simultaneous-edit conflict. Pages preview deployments need separate Access configuration; avoid sharing the production D1 binding with previews.

The API validates Access JWT signatures against the team JWKS, audience, issuer, expiration, and required identity claims. An email header alone never grants access. Data queries bind the verified subject; client-supplied user IDs are ignored. JSON mutations require a matching Origin. Unconfigured services fail closed. No authentication bypass is included for local development: use unit tests for authenticated behavior or a separately configured Access-protected development hostname.

The **Ask MasterPrep** panel supports course questions, alternate explanations, worked examples, and practice prompts. It automatically uses the current course/lesson, has a course selector outside a lesson, keeps follow-up context in tab memory, and offers Stop and Clear conversation. It does not change grades or progress. Source gaps and course caveats are included in its context. The existing recall checker remains available in the recall step.

Cloud saves debounce by 800 ms. In-flight writes are serialized; revision conflicts stop sync and preserve local edits. Download local copy exports the full study JSON. Loading the cloud version first downloads a backup and then replaces the current account view. Reloading recovers unsynced account edits from this browser. Guest data is not automatically merged into accounts. Sign-out returns to guest data after reload; cached account data remains available for recovery on that browser, so use a private browser session on shared devices.

Display theme remains a browser preference. In-progress quiz answers and unsent recall text are session-only; completed lessons, review scheduling, total attempts, and notebook notes sync. Chat history is tab-only.

References: [Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [Cloudflare configuration](https://developers.cloudflare.com/cf/projects/cloudflare-config/).
