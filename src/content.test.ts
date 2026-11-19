import { describe, expect, it } from 'vitest'
import { courses, lessonCourses, lessonsFor } from './content'
import { networkDensity, bitFitness } from './ComplexExploration'

describe('Complex Systems import', () => {
  const course = courses.find((c) => c.id === 'complex-systems')!
  it('makes all nine lectures and 102 questions available with stable unique IDs', () => {
    const lessons = lessonsFor(course)
    expect(lessons).toHaveLength(9)
    expect(lessons.flatMap((l) => l.questions!)).toHaveLength(102)
    expect(new Set(lessonCourses.map((c) => c.lesson.id)).size).toBe(23)
    expect(lessons.map((l) => l.id)).toEqual(
      Array.from({ length: 9 }, (_, i) => `cs-lecture-${i + 1}`),
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

describe('Scientific Methods lessons', () => {
  const course = courses.find((c) => c.id === 'scientific-methods')!
  it('has three Notion-based lessons plus the starter, with valid questions', () => {
    const lessons = lessonsFor(course)
    expect(lessons.map((l) => l.id)).toEqual([
      'sm-sampling-measurement',
      'sm-central-tendency',
      'sm-t-test',
      'sm-research-design',
    ])
    for (const lesson of lessons.slice(0, 3)) {
      expect(lesson.questions!.length).toBeGreaterThanOrEqual(8)
      for (const q of lesson.questions!) {
        expect(q.options[q.answer]).toBeTruthy()
        expect(new Set(q.options).size).toBe(q.options.length)
      }
    }
  })
})

describe('Machine Learning lessons', () => {
  const course = courses.find((c) => c.id === 'machine-learning')!
  it('has nine source-based lessons plus the starter, with valid questions', () => {
    const lessons = lessonsFor(course)
    expect(lessons).toHaveLength(10)
    expect(lessons[9].id).toBe('ml-generalisation')
    const real = lessons.slice(0, 9)
    expect(real.flatMap((l) => l.questions!)).toHaveLength(122)
    const ids = real.flatMap((l) => l.questions!.map((q) => q.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const lesson of real) {
      expect(lesson.provenance).toBeTruthy()
      expect(lesson.reading).toMatch(/^## /m)
      for (const q of lesson.questions!) {
        expect(q.options[q.answer]).toBeTruthy()
        expect(new Set(q.options).size).toBe(q.options.length)
        expect(q.explanation.length).toBeGreaterThan(10)
      }
    }
  })
  it('states the exam format from the last lecture', () => {
    expect(course.assessment).toContain('3 hours')
  })
})
