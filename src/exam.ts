import { lessonsFor } from './content'
import type { Course, Lesson, Question } from './content'

export type Rng = () => number
export type PoolItem = { lesson: Lesson; question: Question }

export type ExamFormat =
  | {
      kind: 'mcq'
      title: string
      minutes: number
      questions: number
      summary: string
    }
  | {
      kind: 'oral'
      title: string
      minutes: number
      presentationMinutes: number
      followUps: number
      summary: string
    }
  | {
      kind: 'written'
      title: string
      minutes: number
      recallPrompts: number
      questions: number
      summary: string
      advice: string[]
    }

// Formats follow what the course teachers have said about each final exam.
export const examFormats: Record<string, ExamFormat> = {
  'scientific-methods': {
    kind: 'mcq',
    title: 'Multiple-choice exam',
    minutes: 120,
    questions: 50,
    summary:
      'About 50 multiple-choice questions, drawn at random from every lecture. Answers are only revealed after you hand in.',
  },
  'complex-systems': {
    kind: 'oral',
    title: 'Oral exam',
    minutes: 30,
    presentationMinutes: 10,
    followUps: 6,
    summary:
      'A random topic is drawn. You present it, then the examiner asks follow-up questions about that topic.',
  },
  'machine-learning': {
    kind: 'written',
    title: 'Written exam on paper',
    minutes: 240,
    recallPrompts: 10,
    questions: 12,
    summary:
      'Four hours, pen and paper, no aids. Write your answers on paper, then mark yourself against model answers.',
    advice: [
      'Draw neural networks and label inputs, weights, and outputs.',
      'Set up entropy and information-gain calculations; you do not need to finish the logarithms.',
      'Work out neural network weights by hand.',
      'Explain model structures in your own words.',
    ],
  },
}

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const asQuestion = (lesson: Lesson): Question => ({
  id: lesson.id,
  question: lesson.question,
  options: lesson.options,
  answer: lesson.answer,
  explanation: lesson.explanation,
})

export function questionPool(course: Course): PoolItem[] {
  return lessonsFor(course).flatMap((lesson) =>
    (lesson.questions ?? [asQuestion(lesson)]).map((question) => ({
      lesson,
      question,
    })),
  )
}

export const buildMcqExam = (
  course: Course,
  count: number,
  rng: Rng = Math.random,
) => shuffle(questionPool(course), rng).slice(0, count)

export type WrittenItem = {
  id: string
  part: 'A' | 'B'
  prompt: string
  options?: string[]
  model: string
  lesson: string
}

export function buildWrittenExam(
  course: Course,
  recallPrompts: number,
  questions: number,
  rng: Rng = Math.random,
): WrittenItem[] {
  const lessons = lessonsFor(course)
  const a = shuffle(lessons, rng)
    .slice(0, recallPrompts)
    .map<WrittenItem>((lesson) => ({
      id: `${lesson.id}-recall`,
      part: 'A',
      prompt: lesson.recall,
      model: lesson.recallAnswer,
      lesson: lesson.title,
    }))
  const b = shuffle(
    questionPool(course).filter((p) => p.lesson.questions),
    rng,
  )
    .slice(0, questions)
    .map<WrittenItem>(({ lesson, question }) => ({
      id: question.id,
      part: 'B',
      prompt: question.question,
      options: question.options,
      model: `${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}\n${question.explanation}`,
      lesson: lesson.title,
    }))
  return [...a, ...b]
}

export type OralExam = {
  lesson: Lesson
  points: string[]
  followUps: PoolItem[]
}

export const readingPoints = (reading?: string) =>
  (reading ?? '')
    .split('\n')
    .filter((l) => l.startsWith('## '))
    .map((l) => l.slice(3).trim())

// Draw one topic at random, then follow-ups: mostly about that topic,
// with one or two that reach into neighbouring lectures.
export function buildOralExam(
  course: Course,
  followUps: number,
  rng: Rng = Math.random,
): OralExam {
  const lessons = lessonsFor(course)
  const topics = lessons.filter((l) => l.reading || l.questions)
  const lesson = shuffle(topics.length ? topics : lessons, rng)[0]
  const pool = questionPool(course)
  const own = shuffle(
    pool.filter((p) => p.lesson.id === lesson.id),
    rng,
  )
  const other = shuffle(
    pool.filter((p) => p.lesson.id !== lesson.id),
    rng,
  )
  const reach = Math.min(Math.floor(followUps / 3), other.length)
  return {
    lesson,
    points: readingPoints(lesson.reading),
    followUps: [...own.slice(0, followUps - reach), ...other.slice(0, reach)],
  }
}

export function scoreMcq(paper: PoolItem[], answers: Record<string, number>) {
  const byLesson = new Map<
    string,
    { title: string; right: number; n: number }
  >()
  let right = 0
  for (const { lesson, question } of paper) {
    const row = byLesson.get(lesson.id) ?? {
      title: lesson.title,
      right: 0,
      n: 0,
    }
    row.n++
    if (answers[question.id] === question.answer) {
      row.right++
      right++
    }
    byLesson.set(lesson.id, row)
  }
  return { right, total: paper.length, byLesson: [...byLesson.values()] }
}

export const formatClock = (seconds: number) => {
  const s = Math.max(0, Math.ceil(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const mm = String(m).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
