import { useState } from 'react'
import {
  ArrowRight,
  Dices,
  Lightbulb,
  MessageCircleQuestion,
} from 'lucide-react'
import { ActionButton } from './ActionButton'
import { RecallCheck } from './RecallCheck'
import type { Lesson } from './content'
import {
  deeperQuestions,
  entryQuestions,
  questionById,
  type ExamQuestion,
} from './exam-practice'

const pick = <T,>(items: T[], not?: T) => {
  const pool = items.length > 1 ? items.filter((i) => i !== not) : items
  return pool[Math.floor(Math.random() * pool.length)]
}

function Answer({
  question,
  lessons,
}: {
  question: ExamQuestion
  lessons: Lesson[]
}) {
  const [text, setText] = useState('')
  const [shown, setShown] = useState(false)
  const lesson = lessons.find((l) => l.id === question.lessonId)
  const id = `exam-answer-${question.id}`
  return (
    <div className="exam-answer">
      <label className="range-label" htmlFor={id}>
        Your answer
      </label>
      <textarea
        className="resize-none"
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Answer as you would out loud. Examples are fine."
      />
      {lesson && <RecallCheck lesson={lesson} recall={text} />}
      <ActionButton
        className="secondary-button"
        onClick={() => setShown((s) => !s)}
      >
        <Lightbulb size={16} />
        {shown ? 'Hide key points' : 'Show key points'}
      </ActionButton>
      {shown && (
        <div className="takeaway">
          <Lightbulb size={21} />
          <div>
            <strong>Key points</strong>
            <ul>
              {question.keyPoints.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p>
              <strong>Example:</strong> {question.example}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function ExamPractice({ lessons }: { lessons: Lesson[] }) {
  const [entryId, setEntryId] = useState<string | null>(null)
  const [deeperId, setDeeperId] = useState<string | null>(null)
  const entry = entryQuestions.find((q) => q.id === entryId)
  const deeper = deeperId ? questionById(deeperId) : undefined

  const chooseEntry = (id: string) => {
    setEntryId(id)
    setDeeperId(null)
  }
  const followUps = entry
    ? entry.followUps.map((id) => questionById(id)!).filter(Boolean)
    : []

  return (
    <section
      className="exam-practice panel"
      aria-labelledby="exam-practice-title"
    >
      <div className="section-heading">
        <h2 id="exam-practice-title">Oral exam practice</h2>
        <span>Broad, then specific</span>
      </div>
      <p>
        The exam usually opens with a broad topic and then narrows to one model.
        Skip anything you do not know. Examples are fine.
      </p>

      <h3>1. Broad question</h3>
      <div className="exam-options">
        {entryQuestions.map((q) => (
          <ActionButton
            key={q.id}
            className={entryId === q.id ? 'primary-button' : 'secondary-button'}
            onClick={() => chooseEntry(q.id)}
          >
            {q.topic}
          </ActionButton>
        ))}
        <ActionButton
          className="secondary-button"
          onClick={() => chooseEntry(pick(entryQuestions, entry).id)}
        >
          <Dices size={16} />
          Surprise me
        </ActionButton>
      </div>
      {entry && (
        <div key={entry.id}>
          <h4>
            <MessageCircleQuestion size={18} /> Explain this: “{entry.topic}”
          </h4>
          <Answer question={entry} lessons={lessons} />

          <h3>2. Specific question</h3>
          <p>Now the examiner goes deeper.</p>
          <div className="exam-options">
            {followUps.map((q) => (
              <ActionButton
                key={q.id}
                className={
                  deeperId === q.id ? 'primary-button' : 'secondary-button'
                }
                onClick={() => setDeeperId(q.id)}
              >
                {q.topic}
              </ActionButton>
            ))}
            <ActionButton
              className="secondary-button"
              onClick={() =>
                setDeeperId(pick(entry.followUps, deeperId ?? undefined))
              }
            >
              <Dices size={16} />
              Surprise me
              <ArrowRight size={15} />
            </ActionButton>
          </div>
        </div>
      )}
      {deeper && (
        <div key={deeper.id}>
          <h4>
            <MessageCircleQuestion size={18} /> Explain the “{deeper.topic}”
          </h4>
          <Answer question={deeper} lessons={lessons} />
        </div>
      )}
      <p className="sample-note">
        Key points are a study aid built from the lecture reviews. Check them
        against your course material. {deeperQuestions.length} specific models
        are included.
      </p>
    </section>
  )
}
