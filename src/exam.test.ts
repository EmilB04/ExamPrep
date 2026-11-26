import { describe, expect, it } from 'vitest'
import { courses } from './content'
import {
  buildMcqExam,
  buildOralExam,
  buildWrittenExam,
  examFormats,
  formatClock,
  questionPool,
  scoreMcq,
  shuffle,
} from './exam'

const course = (id: string) => courses.find((c) => c.id === id)!
const seeded = () => {
  let s = 7
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

describe('final exam formats', () => {
  it('defines a format for every course', () => {
    for (const c of courses) expect(examFormats[c.id]).toBeTruthy()
    expect(examFormats['scientific-methods'].kind).toBe('mcq')
    expect(examFormats['complex-systems'].kind).toBe('oral')
    expect(examFormats['machine-learning']).toMatchObject({
      kind: 'written',
      minutes: 240,
    })
  })
  it('shuffles without losing items', () => {
    const items = [1, 2, 3, 4, 5, 6]
    expect(shuffle(items, seeded()).sort()).toEqual(items)
  })
  it('draws a 40-question multiple-choice paper without duplicates', () => {
    const paper = buildMcqExam(course('scientific-methods'), 40, seeded())
    expect(paper).toHaveLength(40)
    expect(new Set(paper.map((p) => p.question.id)).size).toBe(40)
  })
  it('scores answers and groups them by lecture', () => {
    const paper = buildMcqExam(course('scientific-methods'), 10, seeded())
    const answers = Object.fromEntries(
      paper.slice(0, 4).map((p) => [p.question.id, p.question.answer]),
    )
    const result = scoreMcq(paper, answers)
    expect(result.right).toBe(4)
    expect(result.total).toBe(10)
    expect(result.byLesson.reduce((n, r) => n + r.n, 0)).toBe(10)
  })
  it('builds a written paper with recall prompts then justified questions', () => {
    const paper = buildWrittenExam(course('machine-learning'), 10, 12, seeded())
    expect(paper.filter((p) => p.part === 'A')).toHaveLength(10)
    expect(paper.filter((p) => p.part === 'B')).toHaveLength(12)
    expect(paper.every((p) => p.model.length > 0)).toBe(true)
  })
  it('draws one oral topic with follow-ups mostly from that topic', () => {
    const c = course('complex-systems')
    const oral = buildOralExam(c, 6, seeded())
    expect(oral.followUps).toHaveLength(6)
    const own = oral.followUps.filter((f) => f.lesson.id === oral.lesson.id)
    expect(own.length).toBeGreaterThanOrEqual(4)
    expect(questionPool(c).length).toBeGreaterThan(6)
    expect(oral.points.length).toBeGreaterThan(0)
  })
  it('formats the clock', () => {
    expect(formatClock(240 * 60)).toBe('4:00:00')
    expect(formatClock(65)).toBe('01:05')
    expect(formatClock(-3)).toBe('00:00')
  })
})
