// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useStudySync } from './useStudySync'
const empty = { notes: {}, completed: {} }
const guest = { notes: { course: 'Guest notes' }, completed: {} }
const user = { id: 'alice', email: 'alice@example.test' }
const response = (data: unknown, status = 200) =>
  Response.json(data, { status })
beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
it('loads account data without importing or overwriting guest notes', async () => {
  localStorage.setItem('masterprep.progress.v1', JSON.stringify(guest))
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(response({ user, configured: true }))
    .mockResolvedValueOnce(response({ progress: empty, revision: 2 }))
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(useStudySync)
  await waitFor(() => expect(result.current.ready).toBe(true))
  expect(result.current.progress).toEqual(empty)
  expect(JSON.parse(localStorage.getItem('masterprep.progress.v1')!)).toEqual(
    guest,
  )
  expect(fetcher).toHaveBeenCalledTimes(2)
  act(() => result.current.importGuest())
  expect(result.current.progress.notes).toEqual(guest.notes)
})
it('retains dirty local work and blocks cloud writes when another device changed it', async () => {
  localStorage.setItem(
    'masterprep.account.alice',
    JSON.stringify({ progress: guest, revision: 1, dirty: true }),
  )
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(response({ user, configured: true }))
    .mockResolvedValueOnce(response({ progress: empty, revision: 2 }))
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(useStudySync)
  await waitFor(() => expect(result.current.blocked).toBe(true))
  expect(result.current.progress).toEqual(guest)
  expect(fetcher).toHaveBeenCalledTimes(2)
})
it('serializes edits made during an in-flight write using the returned revision', async () => {
  let resolveWrite!: (v: Response) => void
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(response({ user, configured: true }))
    .mockResolvedValueOnce(response({ progress: empty, revision: 0 }))
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveWrite = resolve
        }),
    )
    .mockResolvedValueOnce(response({ revision: 2 }))
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(useStudySync)
  await waitFor(() => expect(result.current.ready).toBe(true))
  vi.useFakeTimers()
  act(() => result.current.setProgress(guest))
  await act(async () => {
    await vi.advanceTimersByTimeAsync(850)
  })
  expect(fetcher).toHaveBeenCalledTimes(3)
  const second = { ...guest, notes: { course: 'More edits' } }
  act(() => result.current.setProgress(second))
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000)
  })
  expect(fetcher).toHaveBeenCalledTimes(3)
  await act(async () => {
    resolveWrite(response({ revision: 1 }))
    await Promise.resolve()
  })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(850)
  })
  expect(fetcher).toHaveBeenCalledTimes(4)
  expect(JSON.parse(fetcher.mock.calls[3][1].body)).toEqual({
    progress: second,
    revision: 1,
  })
  expect(result.current.blocked).toBe(false)
  expect(
    JSON.parse(localStorage.getItem('masterprep.account.alice')!).dirty,
  ).toBe(false)
})
it('never writes an empty snapshot after hydration fails and keeps offline edits', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(response({ user, configured: true }))
    .mockRejectedValueOnce(new Error('offline'))
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(useStudySync)
  await waitFor(() => expect(result.current.blocked).toBe(true))
  act(() => result.current.setProgress(guest))
  expect(
    JSON.parse(localStorage.getItem('masterprep.account.alice')!).progress,
  ).toEqual(guest)
  expect(fetcher).toHaveBeenCalledTimes(2)
})
