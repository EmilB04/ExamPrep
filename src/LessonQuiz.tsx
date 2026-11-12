import { ActionButton } from './ActionButton'
import { useState } from 'react'
import { ArrowRight, Check, RotateCcw } from 'lucide-react'
import type { Question } from './content'
import { motion } from 'motion/react'

export function LessonQuiz({
  questions,
  onComplete,
}: {
  questions: Question[]
  onComplete: (attempts: number) => void
}) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [questionAttempts, setQuestionAttempts] = useState(0)
  const [firstTry, setFirstTry] = useState(0)
  const [finished, setFinished] = useState(false)
  const question = questions[index]
  if (finished)
    return (
      <motion.div
        className="quiz-summary"
        role="status"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Check size={30} />
        <h2>Quiz complete.</h2>
        <p>
          {firstTry} of {questions.length} answered correctly on the first try.
          You worked through all {questions.length} explanations.
        </p>
        <p>Now explain a key idea without the options in front of you.</p>
      </motion.div>
    )
  return (
    <motion.div
      className="lesson-quiz"
      key={question.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {question.context && (
        <div className="notice">
          <p>{question.context}</p>
        </div>
      )}
      <p className="quiz-counter">
        Question {index + 1} of {questions.length} · {question.id}
      </p>
      <h2>{question.question}</h2>
      <fieldset className="answer-options">
        <legend className="sr-only">Choose one answer</legend>
        {question.options.map((option, i) => (
          <motion.label
            key={`${question.id}-${i}`}
            className={`answer-option ${answer === i ? 'selected' : ''} ${checked && i === question.answer ? 'correct' : ''} ${checked && answer === i && i !== question.answer ? 'incorrect' : ''}`}
            whileHover={checked ? undefined : { x: 3 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          >
            <input
              type="radio"
              name={question.id}
              value={i}
              checked={answer === i}
              disabled={checked}
              onChange={() => setAnswer(i)}
            />
            <span className="option-letter">{String.fromCharCode(65 + i)}</span>
            {option}
            {checked && i === question.answer && <Check size={19} />}
          </motion.label>
        ))}
      </fieldset>
      {question.hint && !checked && (
        <details className="quiz-hint">
          <summary>Need a hint?</summary>
          <p>{question.hint}</p>
        </details>
      )}
      {checked && (
        <motion.div
          className={`answer-feedback ${answer === question.answer ? 'success' : ''}`}
          role="status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <strong>
            {answer === question.answer
              ? 'That’s right.'
              : 'Let’s look at the reasoning.'}
          </strong>
          <p>{question.explanation}</p>
        </motion.div>
      )}
      {!checked ? (
        <ActionButton
          className="primary-button"
          disabled={answer === null}
          onClick={() => {
            setChecked(true)
            setAttempts((a) => a + 1)
            setQuestionAttempts((a) => a + 1)
            if (answer === question.answer && questionAttempts === 0)
              setFirstTry((n) => n + 1)
          }}
        >
          Check answer
          <Check size={16} />
        </ActionButton>
      ) : answer !== question.answer ? (
        <ActionButton
          className="secondary-button"
          onClick={() => {
            setChecked(false)
            setAnswer(null)
          }}
        >
          <RotateCcw size={16} />
          Try again
        </ActionButton>
      ) : (
        <ActionButton
          className="primary-button"
          onClick={() => {
            if (index === questions.length - 1) {
              setFinished(true)
              onComplete(attempts)
            } else {
              setIndex((i) => i + 1)
              setAnswer(null)
              setChecked(false)
              setQuestionAttempts(0)
            }
          }}
        >
          {index === questions.length - 1 ? 'Finish quiz' : 'Next question'}
          <ArrowRight size={16} />
        </ActionButton>
      )}
    </motion.div>
  )
}
