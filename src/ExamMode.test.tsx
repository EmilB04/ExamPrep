// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { courses } from './content'
import { ExamMode } from './ExamMode'

const course = (id: string) => courses.find((c) => c.id === id)!
beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it('runs a timed multiple-choice exam and shows results only after hand in', () => {
  render(<ExamMode course={course('scientific-methods')} onExit={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: /Start exam/ }))
  expect(screen.getByRole('timer').textContent).toContain('2:00:00')
  expect(screen.getByText('0 / 47 answered')).toBeTruthy()
  fireEvent.click(screen.getAllByRole('radio')[0])
  expect(screen.getByText('1 / 47 answered')).toBeTruthy()
  expect(screen.queryByText(/Correct:/)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Hand in' }))
  expect(screen.getByRole('status').textContent).toContain('46 questions')
  fireEvent.click(screen.getByRole('button', { name: 'Confirm hand in' }))
  expect(
    screen.getByRole('heading', { name: /^\d+ \/ \d+ correct/ }),
  ).toBeTruthy()
})

it('hands in automatically when time runs out', () => {
  render(<ExamMode course={course('scientific-methods')} onExit={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: /Start exam/ }))
  act(() => {
    vi.advanceTimersByTime(120 * 60 * 1000 + 2000)
  })
  expect(
    screen.getByRole('heading', { name: /^\d+ \/ \d+ correct/ }),
  ).toBeTruthy()
})

it('runs a four-hour written exam and lets you mark yourself', () => {
  render(<ExamMode course={course('machine-learning')} onExit={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: /Start exam/ }))
  expect(screen.getByRole('timer').textContent).toContain('4:00:00')
  expect(screen.getByText(/Part A/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Finish and mark' }))
  fireEvent.click(screen.getAllByRole('button', { name: 'Got it' })[0])
  expect(
    screen.getByRole('heading', { name: /Self-marked: 1 \/ 22/ }),
  ).toBeTruthy()
})

it('draws an oral topic, times the presentation, then asks follow-ups', () => {
  render(<ExamMode course={course('complex-systems')} onExit={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: 'Draw a topic' }))
  expect(screen.getByText(/Your topic:/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: /Start presenting/ }))
  expect(screen.getByRole('timer').textContent).toContain('10:00')
  fireEvent.click(screen.getByRole('button', { name: /go to questions/ }))
  for (let i = 0; i < 6; i++) {
    expect(
      screen.getByText(new RegExp(`Examiner question ${i + 1} of 6`)),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reveal model answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }))
  }
  expect(
    screen.getByRole('heading', { name: /Follow-ups: 6 \/ 6/ }),
  ).toBeTruthy()
})
