// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import App from './App'
import { complexLessons } from './complex-systems'

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
}))
beforeEach(() => {
  localStorage.clear()
  window.scrollTo = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(cleanup)

it('uses a shared workspace without a fixed profile and supports closing the navigation with Escape', () => {
  render(<App />)
  expect(document.querySelector('.avatar, .top-avatar, .profile')).toBeNull()
  expect(screen.queryByText('My learning space')).toBeNull()
  expect(screen.getByRole('group', { name: 'Color theme' })).toBeTruthy()
  const menu = screen.getByRole('button', { name: 'Open navigation' })
  menu.focus()
  fireEvent.click(menu)
  expect(menu.getAttribute('aria-expanded')).toBe('true')
  expect(document.body.style.overflow).toBe('hidden')
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(menu.getAttribute('aria-expanded')).toBe('false')
  expect(document.activeElement).toBe(menu)
  expect(document.body.style.overflow).toBe('')
})

it('completes the selected imported lecture and restores its recall card after reloading', () => {
  const view = render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Complex Systems' }))
  expect(screen.getByText(/Assessment format needs confirmation/)).toBeTruthy()
  const starts = screen.getAllByRole('button', { name: 'Start' })
  expect(starts).toHaveLength(8)
  fireEvent.click(starts[7])
  expect(
    screen.getByRole('heading', { name: complexLessons[7].title }),
  ).toBeTruthy()
  expect(screen.getByLabelText(/Reading section/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Explore the concept' }))
  expect(screen.getByLabelText(/Input current/)).toBeTruthy()
  fireEvent.click(
    screen.getByRole('button', { name: 'Test your understanding' }),
  )
  expect(
    (
      screen.getByRole('button', {
        name: 'Practise recall',
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true)
  for (const [index, question] of complexLessons[7].questions!.entries()) {
    fireEvent.click(screen.getAllByRole('radio')[question.answer])
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(
      screen.getByRole('button', {
        name: index === 11 ? 'Finish quiz' : 'Next question',
      }),
    )
  }
  fireEvent.click(screen.getByRole('button', { name: 'Practise recall' }))
  expect(
    (
      screen.getByRole('button', {
        name: 'Complete lesson',
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true)
  fireEvent.change(screen.getByLabelText('Your explanation'), {
    target: {
      value:
        'A spiking neuron tracks potential over time and emits discrete spikes.',
    },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Compare explanation' }))
  fireEvent.click(screen.getByRole('button', { name: 'Complete lesson' }))
  const saved = JSON.parse(localStorage.getItem('masterprep.progress.v1')!)
  expect(Object.keys(saved.completed)).toEqual(['cs-lecture-8'])
  expect(saved.completed['cs-lecture-8'].attempts).toBe(12)
  view.unmount()
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Recall practice' }))
  expect(
    screen.getByRole('heading', { name: complexLessons[7].title }),
  ).toBeTruthy()
  expect(screen.getAllByRole('button', { name: 'Practice' })).toHaveLength(1)
})
