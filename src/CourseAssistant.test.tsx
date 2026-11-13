// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { CourseAssistant } from './CourseAssistant'
import { courses } from './content'
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
it('sends selected course context, handles follow-ups and clears history', async () => {
  const fetcher = vi
    .fn()
    .mockImplementation(async () =>
      Response.json({ answer: '**A clearer explanation.**' }),
    )
  vi.stubGlobal('fetch', fetcher)
  render(<CourseAssistant context={courses[0]} signedIn />)
  fireEvent.click(screen.getByRole('button', { name: 'Ask MasterPrep' }))
  fireEvent.change(screen.getByLabelText('Your question'), {
    target: { value: 'Explain this' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Ask question' }))
  await screen.findByText('A clearer explanation.')
  const body = JSON.parse(fetcher.mock.calls[0][1].body)
  expect(body.courseId).toBe(courses[0].id)
  expect(body.lessonId).toBe(courses[0].lesson.id)
  fireEvent.change(screen.getByLabelText('Your question'), {
    target: { value: 'And an example?' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Ask question' }))
  await waitFor(() =>
    expect(screen.getAllByText('A clearer explanation.')).toHaveLength(2),
  )
  expect(JSON.parse(fetcher.mock.calls[1][1].body).messages).toHaveLength(3)
  fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }))
  expect(screen.queryByText('A clearer explanation.')).toBeNull()
})
it('retains input after AI errors and gates guest requests', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ error: 'Sign in again.' }, { status: 401 }),
      ),
  )
  const view = render(<CourseAssistant context={null} signedIn />)
  fireEvent.click(screen.getByRole('button', { name: 'Ask MasterPrep' }))
  fireEvent.change(screen.getByLabelText('Your question'), {
    target: { value: 'Keep my question' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Ask question' }))
  await screen.findByRole('alert')
  expect(
    (screen.getByLabelText('Your question') as HTMLTextAreaElement).value,
  ).toBe('Keep my question')
  view.rerender(<CourseAssistant context={null} signedIn={false} />)
  expect(
    (screen.getByRole('button', { name: 'Ask question' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true)
})

it('stops a pending response without submitting another request', async () => {
  const fetcher = vi.fn().mockImplementation(
    (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        )
      }),
  )
  vi.stubGlobal('fetch', fetcher)
  render(<CourseAssistant context={null} signedIn />)
  fireEvent.click(screen.getByRole('button', { name: 'Ask MasterPrep' }))
  fireEvent.change(screen.getByLabelText('Your question'), {
    target: { value: 'Keep this question' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Ask question' }))
  const stop = screen.getByRole('button', { name: 'Stop' })
  expect(stop.getAttribute('type')).toBe('button')
  fireEvent.click(stop)
  await screen.findByText('Response stopped. Your question is kept.')
  expect(fetcher).toHaveBeenCalledTimes(1)
  expect(
    (screen.getByLabelText('Your question') as HTMLTextAreaElement).value,
  ).toBe('Keep this question')
})

it('opens the floating chat and restores launcher focus on Escape', () => {
  render(<CourseAssistant context={null} signedIn />)
  const launcher = screen.getByRole('button', { name: 'Ask MasterPrep' })
  fireEvent.click(launcher)
  const dialog = screen.getByRole('dialog', { name: 'Ask MasterPrep' })
  expect(document.activeElement).toBe(screen.getByLabelText('Your question'))
  fireEvent.keyDown(dialog, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(document.activeElement).toBe(launcher)
  expect(launcher.getAttribute('aria-expanded')).toBe('false')
})
