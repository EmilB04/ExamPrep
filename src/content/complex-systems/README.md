# Complex Systems content provenance

Imported from the user's `complex-systems-export.zip` on 12 November 2026. `ALL_complex-systems-course.md` is the duplicate combined export; the individual lecture files and `quizzes.json` are the import sources.

The reviews, explanations, hints and quizzes were authored by Claude from lecture materials. This is not an independently verified textbook. Lectures 1–4 have extracted slide text in the original package, but slide images and videos are absent. Lectures 5–8 were reconstructed from prior project chats; their original PDFs are absent. No source diagrams are presented as restored figures.

The importer preserves lecture reading text and quiz answer keys, separates reading from quiz solutions, and excludes the combined document, raw slide dump and personal group-project summary from the shipped application. No automatic question shuffling changes the answer mapping.

Important qualifications retained in the readings:

- L3: the alpha masking inequality is a correction made in the export, not independently checked against original slides here.
- L5: exact link cutting/rewiring in adaptive SIS needs verification against Code 16.15. The app labels this uncertainty; it must not become an unqualified answer.
- L5–L8: chat-derived reviews need checking against the original slides.
- The export describes a written December exam, whereas the official Autumn 2026 course description specifies an oral exam. The app flags this conflict and does not invent an exam date.
- “Exam focus” and “likely exam” headings are the export's study guidance, not guarantees about exam questions. Bonus/out-of-syllabus labels remain visible.

Re-import from an extracted package with:

```sh
node scripts/import-complex-systems.mjs /path/to/handover
```

The application adds original interactive teaching examples and self-assessed recall prompts alongside this imported material. Original source PDFs and a full subject-matter audit remain outstanding.
