// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

afterEach(cleanup)
import { courses, lessonsFor } from './content'
import { ExamPractice } from './ExamPractice'
import { deeperQuestions, entryQuestions } from './exam-practice'
import { complexLessons } from './complex-systems'

it('references real lessons and valid follow-ups', () => {
  const ids = new Set(complexLessons.map((l) => l.id))
  const deeper = new Set(deeperQuestions.map((q) => q.id))
  for (const q of [...entryQuestions, ...deeperQuestions]) {
    expect(ids.has(q.lessonId)).toBe(true)
    expect(q.keyPoints.length).toBeGreaterThan(2)
  }
  for (const e of entryQuestions)
    for (const f of e.followUps) expect(deeper.has(f)).toBe(true)
})

it('goes from broad question to specific question with key points', () => {
  const course = courses.find((c) => c.id === 'complex-systems')!
  render(<ExamPractice lessons={lessonsFor(course)} />)
  expect(screen.queryByText(/Explain the “/)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Cellular automata' }))
  expect(screen.getByText(/Explain this: “Cellular automata”/)).toBeTruthy()
  fireEvent.click(
    screen.getByRole('button', { name: 'Neural cellular automaton model' }),
  )
  expect(
    screen.getByText(/Explain the “Neural cellular automaton model”/),
  ).toBeTruthy()
  fireEvent.click(screen.getAllByRole('button', { name: 'Show key points' })[1])
  expect(screen.getByText(/small neural network that is learned/)).toBeTruthy()
})
