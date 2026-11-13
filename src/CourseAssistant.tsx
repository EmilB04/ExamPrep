import { apiFetch } from './api-client'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MessageCircle, Send, X } from 'lucide-react'
import { courses, type Course } from './content'
import { ActionButton } from './ActionButton'

type Message = { role: 'user' | 'assistant'; content: string }
export function CourseAssistant({
  context,
  signedIn,
}: {
  context: Course | null
  signedIn: boolean
}) {
  const [open, setOpen] = useState(false)
  const [courseId, setCourseId] = useState(context?.id || courses[0].id)
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const abort = useRef<AbortController | null>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  function close() {
    setOpen(false)
    launcher.current?.focus()
  }
  useEffect(() => {
    if (open) (signedIn ? input.current : closeButton.current)?.focus()
  }, [open, signedIn])
  useEffect(() => () => abort.current?.abort(), [])
  useEffect(() => {
    abort.current?.abort()
    abort.current = null
    setMessages([])
    setError('')
    setBusy(false)
    if (context) setCourseId(context.id)
  }, [context?.id, context?.lesson.id, signedIn])
  async function ask(text = question) {
    if (!text.trim() || busy) return
    const controller = new AbortController()
    abort.current = controller
    const history: Message[] = [
      ...messages.slice(-18),
      { role: 'user', content: text.trim() },
    ]
    setBusy(true)
    setError('')
    try {
      const response = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          courseId,
          lessonId: context?.id === courseId ? context.lesson.id : undefined,
          messages: history,
        }),
      })
      if (!response.headers.get('content-type')?.includes('application/json'))
        throw new Error('The assistant is unavailable. Sign in and try again.')
      const data = await response.json()
      if (!response.ok)
        throw new Error(data.error || 'Could not answer. Try again.')
      if (!controller.signal.aborted) {
        setMessages([...history, { role: 'assistant', content: data.answer }])
        setQuestion('')
      }
    } catch (e) {
      if (abort.current === controller)
        setError(
          controller.signal.aborted
            ? 'Response stopped. Your question is kept.'
            : e instanceof Error
              ? e.message
              : 'Could not connect. Try again.',
        )
    } finally {
      if (abort.current === controller) {
        setBusy(false)
        input.current?.focus()
      }
    }
  }
  return (
    <section className="course-assistant" aria-label="Course assistant">
      <ActionButton
        ref={launcher}
        className="assistant-toggle"
        aria-label="Ask MasterPrep"
        title="Ask MasterPrep"
        aria-expanded={open}
        aria-controls="course-assistant-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle size={25} aria-hidden="true" />
      </ActionButton>
      {open && (
        <div
          className="assistant-panel panel"
          id="course-assistant-panel"
          role="dialog"
          aria-labelledby="assistant-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation()
              close()
            }
          }}
        >
          <div className="assistant-heading">
            <div>
              <div className="eyebrow">YOUR STUDY PARTNER</div>
              <h2 id="assistant-title">Ask MasterPrep</h2>
            </div>
            <ActionButton
              className="icon-button"
              ref={closeButton}
              aria-label="Close course assistant"
              onClick={close}
            >
              <X size={18} />
            </ActionButton>
          </div>
          <p>
            Ask about your courses, work through an example, or try a different
            explanation. Answers use the available lesson material and may
            contain mistakes.
          </p>
          <label htmlFor="assistant-course">Course</label>
          <select
            id="assistant-course"
            value={courseId}
            disabled={busy}
            onChange={(e) => {
              setCourseId(e.target.value)
              setMessages([])
              setError('')
            }}
          >
            {courses.map((c) => (
              <option value={c.id} key={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {context?.id === courseId && (
            <p className="sample-note">
              Lesson context: {context.lesson.title}
            </p>
          )}
          {!signedIn && (
            <p className="notice">
              Sign in to ask the assistant. Your notes are never included in
              questions automatically.
            </p>
          )}
          {!messages.length && (
            <div className="assistant-suggestions">
              {[
                'Explain the main idea more simply',
                'Give me a worked example',
                'Ask me a practice question',
              ].map((q) => (
                <ActionButton
                  className="secondary-button"
                  key={q}
                  disabled={busy || !signedIn}
                  onClick={() => {
                    setQuestion(q)
                    void ask(q)
                  }}
                >
                  {q}
                </ActionButton>
              ))}
            </div>
          )}
          <div className="assistant-messages" aria-label="Conversation">
            {messages.map((m, i) => (
              <article className={`assistant-message ${m.role}`} key={i}>
                <strong>{m.role === 'user' ? 'You' : 'MasterPrep'}</strong>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </article>
            ))}
          </div>
          <div role="status">
            {busy
              ? 'Thinking through your course material…'
              : messages.length
                ? 'Answer ready'
                : ''}
          </div>
          {error && <p role="alert">{error}</p>}
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              void ask()
            }}
          >
            <label htmlFor="assistant-question">Your question</label>
            <textarea
              className="resize-none"
              style={{ resize: 'none' }}
              ref={input}
              id="assistant-question"
              rows={3}
              maxLength={6000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to understand?"
            />
            <div className="assistant-actions">
              <ActionButton
                className="primary-button"
                type="submit"
                disabled={busy || !signedIn || !question.trim()}
              >
                <Send size={16} />
                Ask question
              </ActionButton>
              {busy ? (
                <ActionButton
                  className="secondary-button"
                  onClick={() => {
                    abort.current?.abort()
                    abort.current = null
                    setBusy(false)
                    setError('Response stopped. Your question is kept.')
                    input.current?.focus()
                  }}
                >
                  Stop
                </ActionButton>
              ) : (
                <ActionButton
                  className="back-link"
                  disabled={!messages.length}
                  onClick={() => {
                    setMessages([])
                    setError('')
                  }}
                >
                  Clear conversation
                </ActionButton>
              )}
            </div>
          </form>
          <p className="sample-note">
            Questions and this conversation are sent to the AI provider. Chat
            stays in this tab until cleared or the course changes.
          </p>
        </div>
      )}
    </section>
  )
}
