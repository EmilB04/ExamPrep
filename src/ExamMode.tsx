import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock, Flag } from 'lucide-react'
import { ActionButton } from './ActionButton'
import type { Course } from './content'
import {
  buildMcqExam,
  buildOralExam,
  buildWrittenExam,
  examFormats,
  formatClock,
  questionPool,
  scoreMcq,
} from './exam'
import type { ExamFormat } from './exam'

// Counts down to a fixed deadline so a throttled background tab stays accurate.
function useCountdown(seconds: number, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds)
  const end = useRef<number | null>(null)
  const done = useRef(onEnd)
  useEffect(() => {
    done.current = onEnd
  })
  useEffect(() => {
    if (!running) {
      end.current = null
      setLeft(seconds)
      return
    }
    end.current ??= Date.now() + seconds * 1000
    const tick = () => {
      const remaining = Math.ceil((end.current! - Date.now()) / 1000)
      setLeft(Math.max(0, remaining))
      if (remaining <= 0) {
        clearInterval(id)
        done.current()
      }
    }
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [running, seconds])
  return left
}

function Timer({ left, label }: { left: number; label: string }) {
  return (
    <p className="exam-timer" role="timer" aria-label={label}>
      <Clock size={15} />
      {formatClock(left)}
    </p>
  )
}

export function ExamMode({
  course,
  onExit,
}: {
  course: Course
  onExit: () => void
}) {
  const format = examFormats[course.id]
  if (!format) return null
  return (
    <div className="exam">
      <ActionButton className="back-link" onClick={onExit}>
        <ArrowLeft size={16} />
        Back to {course.shortTitle}
      </ActionButton>
      <div className={`course-heading ${course.color}`}>
        <div className="eyebrow">Final exam practice · {course.code}</div>
        <h1>{format.title}</h1>
        <p>{format.summary}</p>
      </div>
      {format.kind === 'mcq' ? (
        <McqExam course={course} format={format} onExit={onExit} />
      ) : format.kind === 'oral' ? (
        <OralExamSession course={course} format={format} onExit={onExit} />
      ) : (
        <WrittenExam course={course} format={format} onExit={onExit} />
      )}
    </div>
  )
}

type Format<K extends ExamFormat['kind']> = Extract<ExamFormat, { kind: K }>

function McqExam({
  course,
  format,
  onExit,
}: {
  course: Course
  format: Format<'mcq'>
  onExit: () => void
}) {
  const [paper, setPaper] = useState<ReturnType<typeof buildMcqExam> | null>(
    null,
  )
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const left = useCountdown(format.minutes * 60, !!paper && !submitted, () =>
    setSubmitted(true),
  )
  const result = useMemo(
    () => (paper && submitted ? scoreMcq(paper, answers) : null),
    [paper, submitted, answers],
  )
  if (!paper)
    return (
      <div className="panel exam-intro">
        <h2>Before you start</h2>
        <ul>
          <li>
            {Math.min(format.questions, questionPool(course).length)} questions,{' '}
            {format.minutes} minutes.
          </li>
          <li>
            No feedback until you hand in. You can move back and flag questions.
          </li>
          <li>Unanswered questions count as wrong, so answer everything.</li>
        </ul>
        <ActionButton
          className="primary-button"
          onClick={() => setPaper(buildMcqExam(course, format.questions))}
        >
          Start exam <ArrowRight size={15} />
        </ActionButton>
      </div>
    )
  if (result) {
    const pct = Math.round((result.right / result.total) * 100)
    const wrong = paper.filter(
      (p) => answers[p.question.id] !== p.question.answer,
    )
    return (
      <div className="exam-results">
        <div className="panel" role="status">
          <Check size={28} />
          <h2>
            {result.right} / {result.total} correct ({pct}%)
          </h2>
          <p>
            {wrong.length
              ? 'Review the questions you missed below, then revisit the lectures where you lost points.'
              : 'Perfect paper.'}
          </p>
          <ul className="exam-breakdown">
            {result.byLesson.map((row) => (
              <li key={row.title}>
                <span>{row.title}</span>
                <strong>
                  {row.right} / {row.n}
                </strong>
              </li>
            ))}
          </ul>
          <div className="exam-actions">
            <ActionButton
              className="primary-button"
              onClick={() => {
                setPaper(null)
                setAnswers({})
                setFlags({})
                setIndex(0)
                setSubmitted(false)
                setConfirm(false)
              }}
            >
              New paper
            </ActionButton>
            <ActionButton className="secondary-button" onClick={onExit}>
              Back to course
            </ActionButton>
          </div>
        </div>
        {wrong.map(({ question }) => (
          <div key={question.id} className="panel exam-review">
            <h3>{question.question}</h3>
            <p>
              Your answer:{' '}
              {answers[question.id] === undefined
                ? 'not answered'
                : question.options[answers[question.id]]}
            </p>
            <p>
              <strong>Correct: {question.options[question.answer]}</strong>
            </p>
            <p>{question.explanation}</p>
          </div>
        ))}
      </div>
    )
  }
  const { question } = paper[index]
  const answered = Object.keys(answers).length
  return (
    <div className="exam-paper">
      <div className="exam-bar">
        <Timer left={left} label="Time remaining" />
        <p>
          {answered} / {paper.length} answered
        </p>
      </div>
      <nav className="exam-nav" aria-label="Questions">
        {paper.map((p, i) => (
          <button
            key={p.question.id}
            type="button"
            className={`${i === index ? 'current' : ''} ${answers[p.question.id] !== undefined ? 'answered' : ''} ${flags[p.question.id] ? 'flagged' : ''}`}
            aria-label={`Question ${i + 1}${answers[p.question.id] !== undefined ? ', answered' : ''}${flags[p.question.id] ? ', flagged' : ''}`}
            aria-current={i === index ? 'step' : undefined}
            onClick={() => setIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </nav>
      <div className="lesson-quiz">
        {question.context && (
          <div className="notice">
            <p>{question.context}</p>
          </div>
        )}
        <p className="quiz-counter">
          Question {index + 1} of {paper.length}
        </p>
        <h2>{question.question}</h2>
        <fieldset className="answer-options">
          <legend className="sr-only">Choose one answer</legend>
          {question.options.map((option, i) => (
            <label
              key={`${question.id}-${i}`}
              className={`answer-option ${answers[question.id] === i ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={question.id}
                checked={answers[question.id] === i}
                onChange={() => setAnswers((a) => ({ ...a, [question.id]: i }))}
              />
              <span className="option-letter">
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </label>
          ))}
        </fieldset>
        <div className="exam-actions">
          <ActionButton
            className="secondary-button"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            <ArrowLeft size={15} /> Previous
          </ActionButton>
          <ActionButton
            className="secondary-button"
            aria-pressed={!!flags[question.id]}
            onClick={() =>
              setFlags((f) => ({ ...f, [question.id]: !f[question.id] }))
            }
          >
            <Flag size={15} />
            {flags[question.id] ? 'Unflag' : 'Flag for review'}
          </ActionButton>
          {index < paper.length - 1 ? (
            <ActionButton
              className="primary-button"
              onClick={() => setIndex(index + 1)}
            >
              Next <ArrowRight size={15} />
            </ActionButton>
          ) : null}
          <ActionButton
            className={
              index < paper.length - 1 ? 'secondary-button' : 'primary-button'
            }
            onClick={() => (confirm ? setSubmitted(true) : setConfirm(true))}
          >
            {confirm ? 'Confirm hand in' : 'Hand in'}
          </ActionButton>
        </div>
        {confirm && (
          <p role="status" className="exam-warning">
            {paper.length - answered > 0
              ? `${paper.length - answered} question${paper.length - answered === 1 ? ' is' : 's are'} unanswered. `
              : ''}
            Handing in is final.
          </p>
        )}
      </div>
    </div>
  )
}

type Mark = 'full' | 'partial' | 'missed'
const markPoints: Record<Mark, number> = { full: 1, partial: 0.5, missed: 0 }
const markLabels: Record<Mark, string> = {
  full: 'Got it',
  partial: 'Partly',
  missed: 'Missed',
}

function MarkButtons({
  value,
  onChange,
  name,
}: {
  value?: Mark
  onChange: (m: Mark) => void
  name: string
}) {
  return (
    <div className="exam-actions" role="group" aria-label={`Mark ${name}`}>
      {(Object.keys(markLabels) as Mark[]).map((m) => (
        <ActionButton
          key={m}
          className={value === m ? 'primary-button' : 'secondary-button'}
          aria-pressed={value === m}
          onClick={() => onChange(m)}
        >
          {markLabels[m]}
        </ActionButton>
      ))}
    </div>
  )
}

function WrittenExam({
  course,
  format,
  onExit,
}: {
  course: Course
  format: Format<'written'>
  onExit: () => void
}) {
  const [paper, setPaper] = useState<ReturnType<
    typeof buildWrittenExam
  > | null>(null)
  const [marking, setMarking] = useState(false)
  const [marks, setMarks] = useState<Record<string, Mark>>({})
  const left = useCountdown(format.minutes * 60, !!paper && !marking, () =>
    setMarking(true),
  )
  if (!paper)
    return (
      <div className="panel exam-intro">
        <h2>Before you start</h2>
        <ul>
          <li>
            {format.minutes / 60} hours. Put your phone and notes away and use
            pen and paper.
          </li>
          <li>
            Part A has short explanations, part B has questions where you should
            justify your answer.
          </li>
          <li>Expect to:</li>
          {format.advice.map((a) => (
            <li key={a} className="exam-sub">
              {a}
            </li>
          ))}
          <li>When time runs out, mark yourself against the model answers.</li>
        </ul>
        <ActionButton
          className="primary-button"
          onClick={() =>
            setPaper(
              buildWrittenExam(course, format.recallPrompts, format.questions),
            )
          }
        >
          Start exam <ArrowRight size={15} />
        </ActionButton>
      </div>
    )
  if (!marking)
    return (
      <div className="exam-paper">
        <div className="exam-bar">
          <Timer left={left} label="Time remaining" />
          <ActionButton
            className="secondary-button"
            onClick={() => setMarking(true)}
          >
            Finish and mark
          </ActionButton>
        </div>
        {(['A', 'B'] as const).map((part) => (
          <section key={part} className="exam-part">
            <h2>
              Part {part}
              {part === 'A' ? ' · Explain' : ' · Answer and justify'}
            </h2>
            <ol>
              {paper
                .filter((p) => p.part === part)
                .map((p) => (
                  <li key={p.id}>
                    <p>{p.prompt}</p>
                    {p.options && (
                      <ul className="exam-options">
                        {p.options.map((o, i) => (
                          <li key={i}>
                            <strong>{String.fromCharCode(65 + i)}.</strong> {o}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </div>
    )
  const marked = paper.filter((p) => marks[p.id])
  const score = paper.reduce(
    (n, p) => n + (marks[p.id] ? markPoints[marks[p.id]] : 0),
    0,
  )
  return (
    <div className="exam-results">
      <div className="panel" role="status">
        <h2>
          Self-marked: {score} / {paper.length}
        </h2>
        <p>
          {marked.length} of {paper.length} marked. Be strict: a model answer
          you only half remember is a partial.
        </p>
        <div className="exam-actions">
          <ActionButton className="secondary-button" onClick={onExit}>
            Back to course
          </ActionButton>
        </div>
      </div>
      {paper.map((p, i) => (
        <div key={p.id} className="panel exam-review">
          <p className="quiz-counter">
            {i + 1}. {p.lesson}
          </p>
          <h3>{p.prompt}</h3>
          <p className="exam-model">{p.model}</p>
          <MarkButtons
            name={`question ${i + 1}`}
            value={marks[p.id]}
            onChange={(m) => setMarks((s) => ({ ...s, [p.id]: m }))}
          />
        </div>
      ))}
    </div>
  )
}

type Phase = 'draw' | 'present' | 'questions' | 'done'

function OralExamSession({
  course,
  format,
  onExit,
}: {
  course: Course
  format: Format<'oral'>
  onExit: () => void
}) {
  const [exam, setExam] = useState<ReturnType<typeof buildOralExam> | null>(
    null,
  )
  const [phase, setPhase] = useState<Phase>('draw')
  const [covered, setCovered] = useState<Record<string, boolean>>({})
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(false)
  const [marks, setMarks] = useState<Record<string, Mark>>({})
  const left = useCountdown(
    format.presentationMinutes * 60,
    phase === 'present',
    () => setPhase('questions'),
  )
  if (!exam || phase === 'draw')
    return (
      <div className="panel exam-intro">
        <h2>Before you start</h2>
        <ul>
          <li>
            A topic is drawn at random. You get no preparation time beyond
            reading it.
          </li>
          <li>
            Talk out loud for {format.presentationMinutes} minutes. Imagine an
            examiner listening, and use a whiteboard or paper for diagrams.
          </li>
          <li>
            Then {format.followUps} follow-up questions. Answer out loud before
            you reveal the model answer.
          </li>
        </ul>
        {exam && (
          <div className="notice">
            <p>
              <strong>Your topic: {exam.lesson.title}</strong> (
              {exam.lesson.eyebrow})
            </p>
          </div>
        )}
        <div className="exam-actions">
          <ActionButton
            className="secondary-button"
            onClick={() => setExam(buildOralExam(course, format.followUps))}
          >
            {exam ? 'Draw another topic' : 'Draw a topic'}
          </ActionButton>
          {exam && (
            <ActionButton
              className="primary-button"
              onClick={() => setPhase('present')}
            >
              Start presenting <ArrowRight size={15} />
            </ActionButton>
          )}
        </div>
      </div>
    )
  if (phase === 'present')
    return (
      <div className="exam-paper">
        <div className="exam-bar">
          <Timer left={left} label="Presentation time remaining" />
          <ActionButton
            className="primary-button"
            onClick={() => setPhase('questions')}
          >
            I am done, go to questions
          </ActionButton>
        </div>
        <div className="panel">
          <p className="quiz-counter">{exam.lesson.eyebrow}</p>
          <h2>{exam.lesson.title}</h2>
          <p>
            Explain the topic from the beginning: what it is, how it works, an
            example, and where it breaks down. Talk out loud.
          </p>
        </div>
      </div>
    )
  if (phase === 'questions') {
    const item = exam.followUps[index]
    if (!item) return null
    const { question } = item
    const last = index === exam.followUps.length - 1
    return (
      <div className="exam-paper">
        <div className="panel">
          <p className="quiz-counter">
            Examiner question {index + 1} of {exam.followUps.length}
            {item.lesson.id !== exam.lesson.id ? ' · related lecture' : ''}
          </p>
          <h2>{question.question}</h2>
          {question.context && <p>{question.context}</p>}
          {!shown ? (
            <ActionButton
              className="primary-button"
              onClick={() => setShown(true)}
            >
              Reveal model answer
            </ActionButton>
          ) : (
            <>
              <ul className="exam-options">
                {question.options.map((o, i) => (
                  <li
                    key={i}
                    className={i === question.answer ? 'exam-right' : ''}
                  >
                    <strong>{String.fromCharCode(65 + i)}.</strong> {o}
                  </li>
                ))}
              </ul>
              <p className="exam-model">{question.explanation}</p>
              <MarkButtons
                name={`question ${index + 1}`}
                value={marks[question.id]}
                onChange={(m) => {
                  setMarks((s) => ({ ...s, [question.id]: m }))
                  setShown(false)
                  if (last) setPhase('done')
                  else setIndex(index + 1)
                }}
              />
            </>
          )}
        </div>
      </div>
    )
  }
  const asked = exam.followUps
  const score = asked.reduce(
    (n, q) => n + (marks[q.question.id] ? markPoints[marks[q.question.id]] : 0),
    0,
  )
  return (
    <div className="exam-results">
      <div className="panel" role="status">
        <h2>
          Follow-ups: {score} / {asked.length}
        </h2>
        <p>
          Topic: {exam.lesson.title}. Now check what you left out of your
          presentation.
        </p>
        {exam.points.length > 0 && (
          <fieldset className="exam-points">
            <legend>Did you cover these points?</legend>
            {exam.points.map((p) => (
              <label key={p}>
                <input
                  type="checkbox"
                  checked={!!covered[p]}
                  onChange={() => setCovered((c) => ({ ...c, [p]: !c[p] }))}
                />
                {p}
              </label>
            ))}
          </fieldset>
        )}
        <p className="exam-model">
          <strong>Key idea: </strong>
          {exam.lesson.recallAnswer}
        </p>
        <div className="exam-actions">
          <ActionButton
            className="primary-button"
            onClick={() => {
              setExam(null)
              setPhase('draw')
              setCovered({})
              setMarks({})
              setIndex(0)
              setShown(false)
            }}
          >
            Draw a new topic
          </ActionButton>
          <ActionButton className="secondary-button" onClick={onExit}>
            Back to course
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
