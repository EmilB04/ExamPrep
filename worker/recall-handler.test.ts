import { expect, it } from 'vitest'
import { handleRecallCheck } from './recall-handler'

const call = (
  body: unknown,
  init: { method?: string; origin?: string; key?: string } = {},
) =>
  handleRecallCheck(
    new Request('https://masterprep.example/api/recall-check', {
      method: init.method ?? 'POST',
      headers: {
        'content-type': 'application/json',
        ...(init.origin ? { origin: init.origin } : {}),
      },
      body: init.method === 'GET' ? undefined : JSON.stringify(body),
    }),
    { ANTHROPIC_API_KEY: init.key ?? 'test-key' },
  )

it('rejects non-POST, cross-origin and unconfigured requests', async () => {
  expect((await call({}, { method: 'GET' })).status).toBe(405)
  expect(
    (
      await call(
        { lessonId: 'x', recall: 'y' },
        { origin: 'https://evil.test' },
      )
    ).status,
  ).toBe(403)
  expect((await call({ lessonId: 'x', recall: 'y' }, { key: '' })).status).toBe(
    503,
  )
})

it('validates input before calling the model', async () => {
  expect((await call({ lessonId: 1 })).status).toBe(400)
  expect(
    (await call({ lessonId: 'ml-generalisation', recall: '  ' })).status,
  ).toBe(400)
  expect(
    (await call({ lessonId: 'ml-generalisation', recall: 'x'.repeat(4001) }))
      .status,
  ).toBe(400)
  expect((await call({ lessonId: 'nope', recall: 'hello' })).status).toBe(404)
})
