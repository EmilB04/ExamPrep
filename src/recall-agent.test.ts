// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { courses } from './content'
import { checkRecall, isRecallFeedback, lessonMaterial } from './recall-agent'

const lesson = courses[0].lesson
afterEach(() => vi.unstubAllGlobals())

it('builds material from the lesson including the reference answer', () => {
  const material = lessonMaterial(lesson)
  expect(material).toContain(lesson.title)
  expect(material).toContain(lesson.recallAnswer)
})

it('validates feedback shape', () => {
  expect(
    isRecallFeedback({
      verdict: 'good',
      covered: [],
      missing: [],
      incorrect: [],
      feedback: 'ok',
    }),
  ).toBe(true)
  expect(isRecallFeedback({ verdict: 'great' })).toBe(false)
})

it('posts the recall and returns parsed feedback', async () => {
  const result = {
    verdict: 'partial',
    covered: ['a'],
    missing: ['b'],
    incorrect: [],
    feedback: 'Add b.',
  }
  const fetchMock = vi.fn(async () => Response.json(result))
  vi.stubGlobal('fetch', fetchMock)
  expect(await checkRecall(lesson, '  my recall ')).toEqual(result)
  const body = JSON.parse(
    (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
      .body as string,
  )
  expect(body).toEqual({ lessonId: lesson.id, recall: 'my recall' })
})

it('explains when the endpoint is missing', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('', { status: 404 })),
  )
  await expect(checkRecall(lesson, 'x')).rejects.toThrow(/not available/)
})
