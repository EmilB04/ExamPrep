import { courses, lessonsFor } from './content'

export type SearchKind =
  'page' | 'course' | 'lesson' | 'section' | 'question' | 'notes'
export type SearchTarget =
  | {
      type: 'page'
      page: 'overview' | 'courses' | 'review' | 'notes' | 'materials'
    }
  | { type: 'course'; courseId: string }
  | { type: 'lesson'; courseId: string; lessonId: string }
export type SearchItem = {
  id: string
  kind: SearchKind
  title: string
  context: string
  /** Extra searchable text, not shown. */
  body: string
  color?: 'green' | 'violet' | 'orange'
  target: SearchTarget
}
export type SearchResult = SearchItem & { score: number }

const pages: [SearchTarget & { type: 'page' }, string, string][] = [
  [
    { type: 'page', page: 'overview' },
    'Overview',
    'Your next step and progress',
  ],
  [{ type: 'page', page: 'courses' }, 'Courses', 'Browse the course library'],
  [
    { type: 'page', page: 'review' },
    'Recall practice',
    'Review due recall cards',
  ],
  [{ type: 'page', page: 'notes' }, 'Notebook', 'Your notes per course'],
  [
    { type: 'page', page: 'materials' },
    'Course materials',
    'Sources and references',
  ],
]

const strip = (text: string) =>
  text
    .replace(/[`*_>#|]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

/** Static course content. Built once; notes are indexed separately as they change. */
export function buildIndex(): SearchItem[] {
  const items: SearchItem[] = pages.map(([target, title, context]) => ({
    id: `page:${target.page}`,
    kind: 'page',
    title,
    context,
    body: '',
    target,
  }))
  for (const course of courses) {
    items.push({
      id: `course:${course.id}`,
      kind: 'course',
      title: course.title,
      context: `${course.code} · course`,
      body: `${course.shortTitle} ${course.description} ${course.topics.map((t) => `${t.title} ${t.description}`).join(' ')}`,
      color: course.color,
      target: { type: 'course', courseId: course.id },
    })
    for (const lesson of lessonsFor(course)) {
      const target: SearchTarget = {
        type: 'lesson',
        courseId: course.id,
        lessonId: lesson.id,
      }
      const where = `${course.shortTitle} · ${lesson.title}`
      items.push({
        id: `lesson:${lesson.id}`,
        kind: 'lesson',
        title: lesson.title,
        context: `${course.shortTitle} · ${lesson.eyebrow}`,
        body: [
          lesson.intro,
          lesson.takeaway,
          lesson.recall,
          lesson.recallAnswer,
          ...lesson.paragraphs,
        ].join(' '),
        color: course.color,
        target,
      })
      const headings = (lesson.reading ?? '').matchAll(/^#{2,4}\s+(.+)$/gm)
      for (const [i, m] of [...headings].entries()) {
        const title = strip(m[1])
        if (title)
          items.push({
            id: `section:${lesson.id}:${i}`,
            kind: 'section',
            title,
            context: where,
            body: '',
            color: course.color,
            target,
          })
      }
      for (const q of lesson.questions ?? []) {
        items.push({
          id: `question:${q.id}`,
          kind: 'question',
          title: strip(q.question),
          context: where,
          body: `${q.options.join(' ')} ${q.explanation} ${q.hint ?? ''}`,
          color: course.color,
          target,
        })
      }
    }
  }
  return items
}

export function notesItems(notes: Record<string, string>): SearchItem[] {
  return courses.flatMap((course) => {
    const text = (notes[course.id] ?? '').trim()
    return text
      ? [
          {
            id: `notes:${course.id}`,
            kind: 'notes' as const,
            title: `${course.shortTitle} notes`,
            context: strip(text).slice(0, 80),
            body: text,
            color: course.color,
            target: { type: 'page', page: 'notes' } as const,
          },
        ]
      : []
  })
}

const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const kindWeight: Record<SearchKind, number> = {
  page: 6,
  course: 5,
  lesson: 4,
  section: 2,
  question: 1,
  notes: 1,
}

/** Every query word must match (prefix of a word scores highest). */
export function search(
  items: SearchItem[],
  query: string,
  limit = 30,
): SearchResult[] {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const results: SearchResult[] = []
  for (const item of items) {
    const title = normalize(item.title)
    const context = normalize(item.context)
    const body = normalize(item.body)
    let score = kindWeight[item.kind]
    let ok = true
    for (const word of words) {
      const titleWords = title.split(/[^a-z0-9]+/)
      if (titleWords.some((w) => w === word)) score += 12
      else if (titleWords.some((w) => w.startsWith(word))) score += 9
      else if (title.includes(word)) score += 6
      else if (context.includes(word)) score += 3
      else if (body.includes(word)) score += 1
      else {
        ok = false
        break
      }
    }
    if (ok && title.startsWith(words.join(' '))) score += 8
    if (ok) results.push({ ...item, score })
  }
  return results
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
}
