import { ActionButton } from './ActionButton'
import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'

export function LectureReading({ text }: { text: string }) {
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
