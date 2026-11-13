import { expect, it } from 'vitest'
import { buildIndex, notesItems, search } from './search'

const index = buildIndex()

it('finds pages, courses and lessons', () => {
  expect(search(index, 'notebook')[0].target).toEqual({
    type: 'page',
    page: 'notes',
  })
  expect(search(index, 'machine')[0].target).toMatchObject({
    type: 'course',
    courseId: 'machine-learning',
  })
  const cellular = search(index, 'cellular automata')
  expect(cellular.length).toBeGreaterThan(0)
  expect(cellular.some((r) => r.target.type === 'lesson')).toBe(true)
})

it('requires every word, ignores case and accents, and handles empty input', () => {
  expect(search(index, '   ')).toEqual([])
  expect(search(index, 'zzzqqq')).toEqual([])
  expect(search(index, 'EMERGENCE').length).toBeGreaterThan(0)
  expect(search(index, 'emergence zzzqqq')).toEqual([])
})

it('indexes notes by course', () => {
  const items = [
    ...index,
    ...notesItems({ 'complex-systems': 'remember the glider gun' }),
  ]
  const hit = search(items, 'glider').find((r) => r.kind === 'notes')
  expect(hit?.target).toEqual({ type: 'page', page: 'notes' })
})
