// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LessonQuiz } from './LessonQuiz'

afterEach(cleanup)
it('requires each answer, supports feedback and retry, and preserves answer mapping across questions', () => {
  const onComplete = vi.fn()
  render(
    <LessonQuiz
      questions={[
        {
          id: 'one',
          question: 'First question',
          options: ['Wrong one', 'Right one'],
          answer: 1,
          explanation: 'Explanation one',
          hint: 'Hint one',
        },
        {
          id: 'two',
          question: 'Second question',
          options: ['Right two', 'Wrong two'],
          answer: 0,
          explanation: 'Explanation two',
        },
      ]}
      onComplete={onComplete}
    />,
  )
  expect(
    (screen.getByRole('button', { name: 'Check answer' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true)
  fireEvent.click(screen.getAllByRole('radio')[0])
  fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
  expect(screen.getByRole('status').textContent).toContain('Explanation one')
  expect(onComplete).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  fireEvent.click(screen.getAllByRole('radio')[1])
  fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
  fireEvent.click(screen.getByRole('button', { name: 'Next question' }))
  expect(screen.getByRole('heading').textContent).toBe('Second question')
  expect(
    (screen.getByRole('button', { name: 'Check answer' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true)
  fireEvent.click(screen.getAllByRole('radio')[0])
  fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
  fireEvent.click(screen.getByRole('button', { name: 'Finish quiz' }))
  expect(onComplete).toHaveBeenCalledExactlyOnceWith(3)
  expect(screen.getByRole('status').textContent).toContain(
    '1 of 2 answered correctly on the first try',
  )
})
