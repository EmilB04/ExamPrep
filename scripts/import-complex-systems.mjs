import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'

// Input is an extracted handover directory. Import data only; never execute it.
const root = process.argv[2]
if (!root) throw new Error('Usage: node scripts/import-complex-systems.mjs /path/to/handover')
const quiz = JSON.parse(await readFile(join(root, 'quizzes.json'), 'utf8'))
const files = (await readdir(join(root, 'lectures'))).filter(f => /^L\d{2}_.+\.md$/.test(f)).sort()
if (files.length !== 8 || quiz.lectures.length !== 8) throw new Error('Expected eight lectures')
const lectures = await Promise.all(files.map(async (file, index) => {
  const markdown = await readFile(join(root, 'lectures', file), 'utf8')
  const [reading] = markdown.split(/^## Quiz:/m)
  const body = reading.slice(reading.indexOf('\n---\n') + 5).trim().replace(/\n---\s*$/, '')
  const lecture = quiz.lectures[index]
  if (lecture.lecture !== index + 1) throw new Error('Lecture ordering mismatch')
  for (const q of lecture.questions) {
    if (!q.id || !q.prompt || !q.explanation || !Object.hasOwn(q.options, q.correct)) throw new Error(`Invalid question ${q.id}`)
    if (Object.keys(q.options).length < 2) throw new Error(`Missing options ${q.id}`)
  }
  return { number: index + 1, title: markdown.split('\n')[0].replace(/^# Lecture \d+: /, ''), sourceFile: file, reading: body, questions: lecture.questions }
}))
if (lectures.reduce((sum, l) => sum + l.questions.length, 0) !== 89) throw new Error('Expected 89 questions')
const output = resolve('src/content/complex-systems')
await mkdir(output, { recursive: true })
await writeFile(join(output, 'lectures.json'), JSON.stringify(lectures, null, 2) + '\n')
console.log(`Imported ${lectures.length} lectures and 89 questions; quiz answers excluded from reading sections.`)
