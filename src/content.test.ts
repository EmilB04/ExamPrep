import { describe, expect, it } from 'vitest'
import { courses, lessonCourses, lessonsFor } from './content'
import { networkDensity, bitFitness } from './ComplexExploration'

describe('Complex Systems import', () => {
  const course = courses.find((c) => c.id === 'complex-systems')!
  it('makes all eight lectures and 89 questions available with stable unique IDs', () => {
    const lessons = lessonsFor(course)
    expect(lessons).toHaveLength(8)
    expect(lessons.flatMap((l) => l.questions!)).toHaveLength(89)
    expect(new Set(lessonCourses.map((c) => c.lesson.id)).size).toBe(10)
    expect(lessons.map((l) => l.id)).toEqual(
      Array.from({ length: 8 }, (_, i) => `cs-lecture-${i + 1}`),
    )
    for (const lesson of lessons) {
      expect(lesson.reading).not.toMatch(/^## Quiz:/m)
      expect(lesson.provenance).toBeTruthy()
      for (const q of lesson.questions!) {
        expect(q.answer).toBeGreaterThanOrEqual(0)
        expect(q.answer).toBeLessThan(q.options.length)
        expect(q.options[q.answer]).toBeTruthy()
        expect(q.explanation.length).toBeGreaterThan(10)
      }
    }
  })
  it('preserves uncertain provenance and the assessment conflict', () => {
    expect(course.assessment).toContain('needs confirmation')
    expect(lessonsFor(course)[4].caution).toContain('Code 16.15')
    expect(lessonsFor(course)[7].provenance).toContain('chat-derived')
  })
})
describe('interactive examples', () => {
  it('calculates density against possible undirected edges', () => {
    expect(networkDensity(6, 15)).toBe(1)
    expect(networkDensity(6, 6)).toBe(0.4)
    expect(networkDensity(1, 0)).toBe(0)
    expect(bitFitness([1, 0, 1, 0, 1])).toBe(3)
  })
})
