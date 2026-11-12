import type { Lesson } from './content'

export type RecallVerdict = 'good' | 'partial' | 'insufficient'
export type RecallFeedback = {
  verdict: RecallVerdict
  covered: string[]
  missing: string[]
  incorrect: string[]
  feedback: string
}
export type RecallRequest = { lessonId: string; recall: string }

export const limits = { recall: 4000 }

/** Everything the agent may judge a recall against: the lesson's own material. */
export function lessonMaterial(lesson: Lesson): string {
  const body = lesson.reading ?? lesson.paragraphs.join('\n\n')
  return [
    `# ${lesson.title}`,
    lesson.intro,
    body,
    `Key takeaway: ${lesson.takeaway}`,
    `Reference answer: ${lesson.recallAnswer}`,
  ].join('\n\n')
}

export function isRecallFeedback(value: unknown): value is RecallFeedback {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  const strings = (x: unknown) =>
    Array.isArray(x) && x.every((s) => typeof s === 'string')
  return (
    (v.verdict === 'good' ||
      v.verdict === 'partial' ||
      v.verdict === 'insufficient') &&
    strings(v.covered) &&
    strings(v.missing) &&
    strings(v.incorrect) &&
    typeof v.feedback === 'string'
  )
}

export async function checkRecall(
  lesson: Lesson,
  recall: string,
  signal?: AbortSignal,
): Promise<RecallFeedback> {
  const body: RecallRequest = {
    lessonId: lesson.id,
    recall: recall.trim(),
  }
  let res: Response
  try {
    res = await fetch('/api/recall-check', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('Could not reach the recall checker.')
  }
  if (res.status === 404 || res.status === 405) {
    throw new Error(
      'The recall checker is not available in this deployment. It needs the Workers deployment with an Anthropic API key.',
    )
  }
  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new Error('The recall checker returned an unreadable response.')
  }
  if (!res.ok) {
    const message = (data as { error?: unknown })?.error
    throw new Error(
      typeof message === 'string' ? message : 'The recall checker failed.',
    )
  }
  if (!isRecallFeedback(data))
    throw new Error('The recall checker returned an unexpected response.')
  return data
}
