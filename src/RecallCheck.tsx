import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, CircleHelp, Sparkles } from 'lucide-react'
import { ActionButton } from './ActionButton'
import type { Lesson } from './content'
import { checkRecall, limits } from './recall-agent'
import type { RecallFeedback, RecallVerdict } from './recall-agent'

const verdictText: Record<RecallVerdict, string> = {
  good: 'Good enough',
  partial: 'Partly there',
  insufficient: 'Not yet',
}

export function RecallCheck({
  lesson,
  recall,
}: {
  lesson: Lesson
  recall: string
}) {
  const [state, setState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'done'; result: RecallFeedback; checked: string }
  >({ status: 'idle' })
  const abort = useRef<AbortController | null>(null)
  useEffect(() => () => abort.current?.abort(), [])
  const tooLong = recall.length > limits.recall
  const stale = state.status === 'done' && state.checked !== recall.trim()

  async function run() {
    abort.current?.abort()
    const controller = new AbortController()
    abort.current = controller
    setState({ status: 'loading' })
    try {
      const result = await checkRecall(lesson, recall, controller.signal)
      if (controller.signal.aborted) return
      setState({ status: 'done', result, checked: recall.trim() })
    } catch (error) {
      if (controller.signal.aborted) return
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'The check failed.',
      })
    }
  }

  return (
    <div className="recall-check">
      <ActionButton
        className="secondary-button"
        disabled={!recall.trim() || tooLong || state.status === 'loading'}
        onClick={run}
      >
        <Sparkles size={16} />
        {state.status === 'loading' ? 'Checking…' : 'Check my recall with AI'}
      </ActionButton>
      {tooLong && (
        <p className="sample-note" role="alert">
          Shorten your recall to {limits.recall} characters to check it.
        </p>
      )}
      <div aria-live="polite">
        {state.status === 'error' && (
          <div className="notice" role="alert">
            <CircleHelp size={18} />
            <p>{state.message}</p>
          </div>
        )}
        {state.status === 'done' && (
          <div className={`takeaway recall-verdict ${state.result.verdict}`}>
            <CheckCircle2 size={21} />
            <div>
              <strong>{verdictText[state.result.verdict]}</strong>
              <p>{state.result.feedback}</p>
              {(
                [
                  ['Covered', state.result.covered],
                  ['Missing', state.result.missing],
                  ['Check again', state.result.incorrect],
                ] as const
              ).map(
                ([label, items]) =>
                  items.length > 0 && (
                    <div key={label}>
                      <small>{label}</small>
                      <ul>
                        {items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ),
              )}
              {stale && (
                <p className="sample-note">
                  You edited your recall. Check again for updated feedback.
                </p>
              )}
              <p className="sample-note">
                AI feedback compares your text with this lesson’s material and
                can be wrong. It does not affect your progress.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
