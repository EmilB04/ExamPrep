import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  CircleHelp,
  FileText,
  GraduationCap,
  Heading2,
  LayoutDashboard,
  NotebookPen,
  Search,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { buildIndex, notesItems, search } from './search'
import type { SearchItem, SearchKind } from './search'

const icons: Record<SearchKind, LucideIcon> = {
  page: LayoutDashboard,
  course: GraduationCap,
  lesson: BookOpen,
  section: Heading2,
  question: CircleHelp,
  notes: NotebookPen,
}
const kindLabel: Record<SearchKind, string> = {
  page: 'Page',
  course: 'Course',
  lesson: 'Lesson',
  section: 'Section',
  question: 'Question',
  notes: 'Notes',
}

export function SpotlightSearch({
  open,
  notes,
  onClose,
  onSelect,
}: {
  open: boolean
  notes: Record<string, string>
  onClose: () => void
  onSelect: (item: SearchItem) => void
}) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const id = useId()
  const staticIndex = useMemo(buildIndex, [])
  const results = useMemo(
    () => search([...staticIndex, ...notesItems(notes)], query),
    [staticIndex, notes, query],
  )

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [open])

  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView?.({ block: 'nearest' })
  }, [active, results])

  if (!open) return null
  const activeItem = results[active]
  const pick = (item?: SearchItem) => item && onSelect(item)

  return (
    <div
      className="spotlight-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="spotlight"
        role="dialog"
        aria-modal="true"
        aria-label="Search MasterPrep"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            onClose()
          } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((a) => (results.length ? (a + 1) % results.length : 0))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) =>
              results.length ? (a - 1 + results.length) % results.length : 0,
            )
          } else if (e.key === 'Enter') {
            e.preventDefault()
            pick(activeItem)
          } else if (e.key === 'Tab') {
            e.preventDefault() // focus stays in the input
          }
        }}
      >
        <div className="spotlight-input">
          <Search size={19} aria-hidden="true" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-activedescendant={
              activeItem ? `${id}-${activeItem.id}` : undefined
            }
            aria-label="Search courses, lectures, questions and notes"
            placeholder="Search courses, lectures, questions, notes…"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <ul
          id={`${id}-list`}
          ref={listRef}
          role="listbox"
          aria-label="Results"
          className="spotlight-results"
        >
          {results.map((item, i) => {
            const Icon = icons[item.kind] ?? FileText
            return (
              <li
                key={item.id}
                id={`${id}-${item.id}`}
                role="option"
                aria-selected={i === active}
                className={`spotlight-row ${item.color ?? ''}`}
                onMouseMove={() => i !== active && setActive(i)}
                onClick={() => pick(item)}
              >
                <span className="spotlight-icon">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span className="spotlight-text">
                  <b>{item.title}</b>
                  <small>{item.context}</small>
                </span>
                <span className="spotlight-kind">{kindLabel[item.kind]}</span>
              </li>
            )
          })}
        </ul>
        <div className="spotlight-status" aria-live="polite">
          {!query.trim()
            ? 'Type to search. ↑↓ to move, Enter to open.'
            : results.length
              ? `${results.length} ${results.length === 1 ? 'result' : 'results'}`
              : `No results for “${query.trim()}”`}
        </div>
      </div>
    </div>
  )
}
