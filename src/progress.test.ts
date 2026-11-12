import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  emptyProgress,
  loadProgress,
  nextReview,
  saveProgress,
} from './progress'

afterEach(() => vi.unstubAllGlobals())
describe('browser persistence', () => {
  it('carries existing progress into the renamed workspace without overwriting newer data', () => {
    const previous = { completed: {}, notes: { course: 'Existing notes' } }
    const storage = new Map([['examprep.progress.v1', JSON.stringify(previous)]])
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    })
    expect(loadProgress()).toEqual(previous)
    expect(saveProgress(loadProgress())).toBe(true)
    expect(storage.get('masterprep.progress.v1')).toBe(JSON.stringify(previous))
    const updated = { completed: {}, notes: { course: 'Updated notes' } }
    saveProgress(updated)
    expect(loadProgress()).toEqual(updated)
  })
  it('recovers from corrupt data without breaking the workspace', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{bad json' })
    expect(loadProgress()).toEqual(emptyProgress())
  })
  it('keeps valid entries and discards invalid completions and notes', () => {
    const completion = {
      completedAt: '2026-11-12T10:00:00Z',
      reviewAt: '2026-11-13T10:00:00Z',
      attempts: 2,
    }
    vi.stubGlobal('localStorage', {
      getItem: () =>
        JSON.stringify({
          completed: { good: completion, bad: { reviewAt: 'not a date' } },
          notes: { good: 'Keep this note', bad: 99 },
        }),
    })
    expect(loadProgress()).toEqual({
      completed: { good: completion },
      notes: { good: 'Keep this note' },
    })
  })
  it('reports blocked storage so the UI can warn that saving failed', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('Quota exceeded')
      },
    })
    expect(saveProgress(emptyProgress())).toBe(false)
  })
})
describe('recall scheduling', () => {
  it('schedules difficult cards soon and remembered cards after three days', () => {
    const now = new Date('2026-11-12T10:00:00Z')
    expect(nextReview(now, false)).toBe('2026-11-12T10:10:00.000Z')
    expect(nextReview(now, true)).toBe('2026-11-15T10:00:00.000Z')
  })
})
