# MasterPrep

A learning platform for master's courses, built with React, TypeScript, Vite, Tailwind CSS v4, and Motion. The course library is shared; progress, notebook content, and display preferences belong to each visitor's browser.

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
- Four-stage learning: reading in sections → interactive exploration → lecture quiz with feedback, retry, and first-attempt summary → written, self-assessed recall.
- Course topic outlines; topics without lessons are explicitly labelled as awaiting materials.
- Browser-local progress and notes, Markdown note export, and recall cards scheduled one day after lesson completion. Reviewing a card schedules another review in ten minutes or three days.
- Responsive navigation, keyboard-operable exercises, reduced-motion support, and feedback when browser persistence fails.
- Light, Dark, and System display options, with a saved browser preference, live system-theme updates, and an early theme script to avoid a light flash on reload. Fonts are self-hosted.
- Motion transitions for navigation and theme selection, cards, buttons, reading sections, quiz feedback, lesson steps, and interactive diagrams. System reduced-motion preferences are respected.

- AI recall checker: in the recall step, "Check my recall with AI" sends your text and that lesson's material to a Worker route (`/api/recall-check`), where Claude judges whether the recall is good enough and lists what is covered, missing, or wrong. Feedback is advisory and does not change progress. Needs the Workers deployment and an `ANTHROPIC_API_KEY` secret (`npx cf workers secrets update ANTHROPIC_API_KEY`; locally, a `.dev.vars` file). On static Pages the button reports that the checker is unavailable.

Progress is local to the browser and origin. There are no accounts or cross-device sync. Quiz completion requires working through every question; recall is self-assessed, not automatically marked. First-attempt quiz scores appear during the session; completion dates and total answer attempts persist, but score history is not yet stored.

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

The Workers command deploys the verified Cloudflare build output. Authentication and remote deployment are separate from local build verification. No remote resources are provisioned by this setup.

## Adding your lecture materials

Course and lesson types live in `src/content.ts`; lesson presentation is in `src/App.tsx` and interactive diagrams in `src/Illustration.tsx`. Export the relevant presentations and notes from Claude; there is no automatic Claude connection or upload processor.

For each topic, add source references (file name, lecture, page/slide), focused explanations, an appropriate illustration, an interactive exercise, several quiz items with explanations, and recall prompts. Courses support a `lessons` collection; preserve stable lesson IDs so progress remains meaningful. `scripts/import-complex-systems.mjs` transforms the supplied lecture Markdown and quiz JSON into the committed content data, without shipping the personal group-project summary or raw combined export.

The next backend increment can use Cloudflare D1 for authenticated progress and notes and R2 for private source documents. These are planned extensions, not implemented bindings. Add identity and per-user authorization before storing private material or progress remotely.

Official references: [Scientific Methods](https://www.hiof.no/english/studies/courses/iio/itk/2026/autumn/iti41020.html), [Complex Systems](https://www.hiof.no/english/studies/courses/iio/itk/2026/autumn/iti41225.html), [Machine Learning](https://www.hiof.no/english/studies/courses/iio/itk/2026/autumn/iti41720.html).
