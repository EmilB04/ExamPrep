import { ActionButton } from './ActionButton'
import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useId, useRef, type ReactNode } from 'react'
import { lookupTerm } from './glossary'

function Term({
  children,
  glossary,
}: {
  children?: ReactNode
  glossary: boolean
}) {
  const id = useId()
  const ref = useRef<HTMLElement>(null)
  const [flip, setFlip] = useState(false)
  const text =
    typeof children === 'string'
      ? children
      : Array.isArray(children)
        ? children.filter((c) => typeof c === 'string').join('')
        : ''
  const definition = glossary && text ? lookupTerm(text) : undefined
  if (!definition) return <strong>{children}</strong>
  const place = () => {
    const rect = ref.current?.getBoundingClientRect()
    if (rect) setFlip(rect.left + 300 > window.innerWidth - 12)
  }
  return (
    <strong
      ref={ref}
      className="term"
      tabIndex={0}
      aria-describedby={id}
      onMouseEnter={place}
      onFocus={place}
    >
      {children}
      <span
        role="tooltip"
        id={id}
        className={flip ? 'term-tip flip' : 'term-tip'}
      >
        {definition}
      </span>
    </strong>
  )
}

export function LectureReading({
  text,
  glossary = false,
}: {
  text: string
  glossary?: boolean
}) {
  const sections = text.split(/(?=^## )/m).filter((s) => s.trim())
  const [index, setIndex] = useState(0)
  const heading = (section: string, i: number) =>
    section.match(/^## (.+)/m)?.[1] || `Introduction ${i + 1}`
  function go(next: number) {
    setIndex(next)
    document
      .querySelector('#lecture-reading')
      ?.scrollIntoView({ block: 'start' })
  }
  return (
    <div className="lecture-reading" id="lecture-reading">
      <label className="range-label" htmlFor="reading-section">
        Reading section · {index + 1} of {sections.length}
      </label>
      <select
        id="reading-section"
        value={index}
        onChange={(e) => go(Number(e.target.value))}
      >
        {sections.map((section, i) => (
          <option key={i} value={i}>
            {heading(section, i)}
          </option>
        ))}
      </select>
      <motion.article
        className="markdown"
        key={index}
        initial={{ opacity: 0, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
            strong: (props) => (
              <Term glossary={glossary}>{props.children}</Term>
            ),
            img: (props) => (
              <span>
                [Source image: {props.alt || 'not included in export'}]
              </span>
            ),
          }}
        >
          {sections[index]}
        </Markdown>
      </motion.article>
      <div className="reading-controls">
        <ActionButton
          className="secondary-button"
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          <ArrowLeft size={14} />
          Previous section
        </ActionButton>
        <span>
          {index + 1} / {sections.length}
        </span>
        <ActionButton
          className="secondary-button"
          disabled={index === sections.length - 1}
          onClick={() => go(index + 1)}
        >
          Next section
          <ArrowRight size={14} />
        </ActionButton>
      </div>
      <p className="sample-note">
        Use the section menu to revisit a topic. Continue to exploration when
        you are ready.
      </p>
    </div>
  )
}
