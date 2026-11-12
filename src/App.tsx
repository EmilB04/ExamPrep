import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  Library,
  Lightbulb,
  Menu,
  Network,
  NotebookPen,
  Play,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { courses, courseSource, lessonCourses, lessonsFor } from './content'
import type { Lesson } from './content'
import { LectureReading } from './LectureReading'
import { LessonQuiz } from './LessonQuiz'
import type { Course } from './content'
import { Illustration } from './Illustration'
import { loadProgress, nextReview, saveProgress } from './progress'
import type { Progress } from './progress'

type Page = 'overview' | 'courses' | 'review' | 'notes' | 'materials'
const nav = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'courses', label: 'My courses', icon: BookOpen },
  { id: 'review', label: 'Recall practice', icon: Layers3 },
  { id: 'notes', label: 'My notebook', icon: NotebookPen },
  { id: 'materials', label: 'Course materials', icon: Library },
] as const
const stages = ['Read & understand', 'Explore', 'Check understanding', 'Recall']
function CourseIcon({ course, size = 22 }: { course: Course; size?: number }) {
  return course.id === 'machine-learning' ? (
    <Brain size={size} />
  ) : course.id === 'complex-systems' ? (
    <Network size={size} />
  ) : (
    <FlaskConical size={size} />
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('overview')
  const [selected, setSelected] = useState<Course | null>(null)
  const [learning, setLearning] = useState<Course | null>(null)
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [storageOk, setStorageOk] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    setStorageOk(saveProgress(progress))
  }, [progress])
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])
  const completed = lessonCourses.filter((c) => progress.completed[c.lesson.id])
  const due = completed.filter(
    (c) => Date.parse(progress.completed[c.lesson.id].reviewAt) <= now,
  )
  const next =
    lessonCourses.find(
      (c) => c.lesson.reading && !progress.completed[c.lesson.id],
    ) ||
    lessonCourses.find((c) => !progress.completed[c.lesson.id]) ||
    lessonCourses[0]
  function navigate(p: Page) {
    setPage(p)
    setSelected(null)
    setLearning(null)
    setMobileOpen(false)
    setReviewId(null)
    setRevealed(false)
    window.scrollTo(0, 0)
  }
  function openCourse(c: Course) {
    setLearning(null)
    setSelected(c)
    setPage('courses')
    setMobileOpen(false)
    window.scrollTo(0, 0)
  }
  function start(c: Course, lesson: Lesson = c.lesson) {
    setLearning({ ...c, lesson })
    window.scrollTo(0, 0)
  }
  function complete(c: Course, attempts: number) {
    const date = new Date()
    setProgress((p) => ({
      ...p,
      completed: {
        ...p.completed,
        [c.lesson.id]: {
          completedAt: date.toISOString(),
          reviewAt: new Date(date.getTime() + 86400000).toISOString(),
          attempts,
        },
      },
    }))
  }
  function rate(c: Course, remembered: boolean) {
    setProgress((p) => ({
      ...p,
      completed: {
        ...p.completed,
        [c.lesson.id]: {
          ...p.completed[c.lesson.id],
          reviewAt: nextReview(new Date(), remembered),
        },
      },
    }))
    setReviewId(null)
    setRevealed(false)
    setNow(Date.now())
  }
  const currentReview = lessonCourses.find((c) => c.lesson.id === reviewId)
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            navigate('overview')
          }}
        >
          <span className="brand-mark">
            <GraduationCap size={24} />
          </span>
          MasterPrep<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={() => navigate(item.id)}
            >
              <item.icon size={19} />
              {item.label}
              {item.id === 'review' && due.length > 0 && (
                <span className="nav-count">{due.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-rule" />
        <div className="workspace-label">THIS SEMESTER</div>
        <div className="sidebar-courses">
          {courses.map((c) => (
            <button key={c.id} onClick={() => openCourse(c)}>
              <span className={`course-dot ${c.color}`} />
              {c.shortTitle}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="small-tip">
            <span className="tip-icon">
              <Lightbulb size={19} />
            </span>
            <strong>A little, often.</strong>
            <p>Small sessions. Time to reflect. Come back and try again.</p>
          </div>
          <div className="profile">
            <span className="avatar">E</span>
            <span>
              <strong>My learning space</strong>
              <small>Master’s · Applied Computer Science</small>
            </span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu size={21} />
            </button>
            <span>My workspace</span>
            <ChevronRight size={14} />
            <b>
              {learning
                ? 'Learning session'
                : selected
                  ? selected.shortTitle
                  : nav.find((n) => n.id === page)?.label}
            </b>
          </div>
          <div className="semester">
            <span className="status-dot" />
            Autumn 2026<span className="top-avatar">E</span>
          </div>
        </header>
        <main
          id="main"
          className={learning ? 'main-content session-content' : 'main-content'}
        >
          {!storageOk && (
            <div className="storage-alert" role="alert">
              Your browser could not save progress. Keep this tab open and
              export your notes before leaving.
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={
                learning
                  ? `learn-${learning.lesson.id}`
                  : selected
                    ? selected.id
                    : page
              }
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {learning ? (
                <LearningSession
                  course={learning}
                  onBack={() => {
                    setLearning(null)
                    openCourse(learning)
                  }}
                  onComplete={(attempts) => complete(learning, attempts)}
                />
              ) : selected ? (
                <>
                  <button
                    className="back-link"
                    onClick={() => navigate('courses')}
                  >
                    <ArrowLeft size={16} />
                    All courses
                  </button>
                  <div className={`course-heading ${selected.color}`}>
                    <span className="course-icon">
                      <CourseIcon course={selected} size={30} />
                    </span>
                    <div className="eyebrow">{selected.code} · 10 ECTS</div>
                    <h1>{selected.title}</h1>
                    <p>{selected.description}</p>
                  </div>
                  <div className="detail-columns">
                    <section>
                      <div className="section-heading">
                        <h2>Learning path</h2>
                        <span>{selected.topics.length} topic areas</span>
                      </div>
                      {selected.topics.map((topic, i) => {
                        const lesson = topic.lessonId
                          ? lessonsFor(selected).find(
                              (l) => l.id === topic.lessonId,
                            )
                          : i === 0
                            ? selected.lesson
                            : undefined
                        return (
                          <div key={topic.title} className="topic-row">
                            <span
                              className={`topic-number ${lesson ? selected.color : ''}`}
                            >
                              {lesson && progress.completed[lesson.id] ? (
                                <Check size={18} />
                              ) : (
                                String(i + 1).padStart(2, '0')
                              )}
                            </span>
                            <div>
                              <h3>{topic.title}</h3>
                              <p>{topic.description}</p>
                              <small>
                                {lesson
                                  ? lesson.reading
                                    ? 'Lecture review · exploration, quiz & recall'
                                    : 'Starter lesson · reading, exercise, quiz & recall'
                                  : 'Awaiting lecture materials'}
                              </small>
                            </div>
                            {lesson && (
                              <button
                                className="secondary-button"
                                onClick={() => start(selected, lesson)}
                              >
                                {progress.completed[lesson.id]
                                  ? 'Revisit'
                                  : 'Start'}
                                <ArrowRight size={15} />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </section>
                    <aside>
                      <div className="panel">
                        <h3>About this course</h3>
                        <p>{selected.assessment}</p>
                        <a
                          className="text-link"
                          href={courseSource(selected.code)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Official course description
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <div className="notice">
                        <CircleHelp size={19} />
                        <p>
                          {selected.lessons
                            ? 'Eight imported lecture reviews and 89 questions. The reviews were written by Claude; source qualifications remain visible in each lesson. Original diagrams are not included in the export.'
                            : 'Topic groups follow the course description. The starter lesson is illustrative and has not been checked against your lecture notes.'}
                        </p>
                      </div>
                    </aside>
                  </div>
                </>
              ) : page === 'overview' ? (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">
                        A LITTLE PROGRESS, EVERY DAY
                      </div>
                      <h1>
                        Make room for understanding
                        <span className="heading-dot">.</span>
                      </h1>
                      <p>Your courses, one clear learning path at a time.</p>
                    </div>
                    <span className="term-tag">
                      <GraduationCap size={16} />
                      Master’s workspace
                    </span>
                  </div>
                  <div className="overview-columns">
                    <div>
                      <section className="continue-card">
                        <div className="continue-copy">
                          <span className="pill">
                            <span className="status-dot" />
                            {completed.length === lessonCourses.length
                              ? 'REVISIT A CONCEPT'
                              : 'YOUR NEXT STEP'}
                          </span>
                          <h2>
                            {completed.length ? (
                              'Keep your momentum.'
                            ) : (
                              <>
                                Build understanding.
                                <br />
                                Then put it to the test.
                              </>
                            )}
                          </h2>
                          <p>
                            {next.lesson.title}
                            <br />
                            <span>
                              {next.shortTitle} · {next.lesson.minutes} min
                            </span>
                          </p>
                          <button
                            className="primary-button"
                            onClick={() => start(next)}
                          >
                            {completed.length === lessonCourses.length
                              ? 'Revisit lesson'
                              : 'Start learning'}
                            <ArrowRight size={17} />
                          </button>
                        </div>
                        <div className="hero-art" aria-hidden="true">
                          <div className="orbit orbit-one" />
                          <div className="orbit orbit-two" />
                          <div className="art-spark spark-one">✦</div>
                          <div className="art-spark spark-two">✦</div>
                          <div className="floating-note note-back">
                            <div />
                            <div />
                            <div />
                            <div />
                          </div>
                          <div className="floating-note note-front">
                            <span className="note-symbol">
                              <Brain size={36} strokeWidth={1.5} />
                            </span>
                            <span className="art-line" />
                            <span className="art-line short" />
                            <span className="art-check">
                              <Check size={18} />
                            </span>
                          </div>
                          <span className="art-label">
                            <Sparkles size={14} />
                            Connect the dots
                          </span>
                        </div>
                      </section>
                      <div className="section-heading course-section">
                        <h2>
                          Your courses <span className="count-badge">03</span>
                        </h2>
                        <button
                          className="text-link"
                          onClick={() => navigate('courses')}
                        >
                          View all
                          <ArrowRight size={15} />
                        </button>
                      </div>
                      <div className="course-grid">
                        {courses.map((c) => (
                          <CourseCard
                            key={c.id}
                            course={c}
                            done={
                              lessonsFor(c).filter(
                                (l) => progress.completed[l.id],
                              ).length
                            }
                            onClick={() => openCourse(c)}
                          />
                        ))}
                      </div>
                    </div>
                    <aside className="overview-rail">
                      <div className="panel progress-panel">
                        <div className="section-heading">
                          <h3>Your progress</h3>
                          <Target size={18} />
                        </div>
                        <div
                          className="progress-ring"
                          style={
                            {
                              '--progress': `${(completed.length / lessonCourses.length) * 100}%`,
                            } as React.CSSProperties
                          }
                        >
                          <span>
                            <b>
                              {completed.length}
                              <small>/ {lessonCourses.length}</small>
                            </b>
                            <small>lessons completed</small>
                          </span>
                        </div>
                        <p>
                          {completed.length === 0
                            ? 'A fresh start. Pick a course and make your first connection.'
                            : `${completed.length} ${completed.length === 1 ? 'lesson' : 'lessons'} completed. Keep building your understanding.`}
                        </p>
                        <div className="stat-line">
                          <span>Courses in your workspace</span>
                          <b>3</b>
                        </div>
                        <div className="stat-line">
                          <span>Cards ready to review</span>
                          <b>{due.length}</b>
                        </div>
                      </div>
                      <div className="review-callout">
                        <span className="mini-icon">
                          <Layers3 size={20} />
                        </span>
                        <h3>Make it stick.</h3>
                        <p>
                          {due.length
                            ? `${due.length} recall ${due.length === 1 ? 'card is' : 'cards are'} ready for another look.`
                            : 'Complete a lesson to add its key concept to your recall practice.'}
                        </p>
                        <button
                          className="text-link"
                          onClick={() => navigate('review')}
                        >
                          Open recall practice
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </aside>
                  </div>
                  <section className="learning-method">
                    <div className="section-heading">
                      <div>
                        <h2>More than reading.</h2>
                        <p>A learning loop that goes a little deeper.</p>
                      </div>
                      <span className="subtle-label">THE WAY YOU’LL LEARN</span>
                    </div>
                    <div className="method-grid">
                      {[
                        {
                          icon: BookOpen,
                          name: 'Understand',
                          text: 'Read focused explanations with visual examples.',
                        },
                        {
                          icon: Play,
                          name: 'Explore',
                          text: 'Change a parameter. See the idea in action.',
                        },
                        {
                          icon: CheckCircle2,
                          name: 'Check',
                          text: 'Test your thinking and learn from feedback.',
                        },
                        {
                          icon: Layers3,
                          name: 'Remember',
                          text: 'Recall the idea, then revisit it over time.',
                        },
                      ].map((s, i) => (
                        <div className="method-step" key={s.name}>
                          <span className="method-icon">
                            <s.icon size={20} />
                          </span>
                          <div>
                            <small>0{i + 1}</small>
                            <h3>{s.name}</h3>
                            <p>{s.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <footer className="page-footer">
                    <span>Built for curiosity. Made for your master’s.</span>
                    <span>
                      Progress saved in this browser{' '}
                      <span className="status-dot" />
                    </span>
                  </footer>
                </>
              ) : page === 'courses' ? (
                <>
                  <PageHeading
                    eyebrow="YOUR SEMESTER"
                    title="Three courses. New connections."
                    text="Explore a topic, work through a lesson, and check what stayed with you."
                  />
                  <div className="course-grid full-grid">
                    {courses.map((c) => (
                      <CourseCard
                        key={c.id}
                        course={c}
                        done={
                          lessonsFor(c).filter((l) => progress.completed[l.id])
                            .length
                        }
                        onClick={() => openCourse(c)}
                      />
                    ))}
                  </div>
                  <div className="notice">
                    <Lightbulb size={20} />
                    <p>
                      Complex Systems has eight lecture reviews and 89 quiz
                      questions from your export. Machine Learning and
                      Scientific Methods each have an illustrative starter
                      lesson, awaiting your materials.
                    </p>
                  </div>
                </>
              ) : page === 'review' ? (
                <>
                  <PageHeading
                    eyebrow="RECALL PRACTICE"
                    title="Come back. Connect it again."
                    text="Try answering from memory before revealing the explanation."
                  />
                  {currentReview ? (
                    <div className="recall-panel panel">
                      <span className={`tag ${currentReview.color}`}>
                        {currentReview.shortTitle}
                      </span>
                      <h2>{currentReview.lesson.recall}</h2>
                      {revealed ? (
                        <>
                          <p className="revealed-answer">
                            {currentReview.lesson.recallAnswer}
                          </p>
                          <p>How did it go?</p>
                          <div className="button-row">
                            <button
                              className="secondary-button"
                              onClick={() => rate(currentReview, false)}
                            >
                              Revisit in 10 minutes
                            </button>
                            <button
                              className="primary-button"
                              onClick={() => rate(currentReview, true)}
                            >
                              Remembered · in 3 days
                              <Check size={17} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          className="primary-button"
                          onClick={() => setRevealed(true)}
                        >
                          Reveal explanation
                        </button>
                      )}
                    </div>
                  ) : completed.length ? (
                    <div className="panel">
                      <div className="section-heading">
                        <h2>{due.length} due now</h2>
                        <span>{completed.length} cards in your collection</span>
                      </div>
                      {completed.map((c) => (
                        <div className="review-row" key={c.lesson.id}>
                          <span className={`course-icon ${c.color}`}>
                            <CourseIcon course={c} />
                          </span>
                          <div>
                            <h3>{c.lesson.title}</h3>
                            <p>
                              {Date.parse(
                                progress.completed[c.lesson.id].reviewAt,
                              ) <= now
                                ? 'Ready to review'
                                : `Next review: ${new Date(progress.completed[c.lesson.id].reviewAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`}
                            </p>
                          </div>
                          <button
                            className="secondary-button"
                            onClick={() => {
                              setReviewId(c.lesson.id)
                              setRevealed(false)
                            }}
                          >
                            Practice
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Layers3 size={32} />}
                      title="Your first connection starts here."
                      text="Finish a learning session to create your first recall card. Its first review will be scheduled for tomorrow."
                      action="Explore courses"
                      onClick={() => navigate('courses')}
                    />
                  )}
                </>
              ) : page === 'notes' ? (
                <>
                  <PageHeading
                    eyebrow="YOUR NOTEBOOK"
                    title="Put it in your own words."
                    text="Keep questions, explanations, and connections alongside each course."
                  />
                  <div className="section-heading">
                    <p>Notes save automatically in this browser.</p>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        const blob = new Blob(
                          [
                            courses
                              .map(
                                (c) =>
                                  `# ${c.title}\n\n${progress.notes[c.id] || '(No notes yet)'}`,
                              )
                              .join('\n\n---\n\n'),
                          ],
                          { type: 'text/markdown' },
                        )
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = 'masterprep-notes.md'
                        link.click()
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <ArrowDownToLine size={16} />
                      Export notes
                    </button>
                  </div>
                  <div className="notes-grid">
                    {courses.map((c) => (
                      <section className="panel" key={c.id}>
                        <div className="section-heading">
                          <h3>{c.shortTitle}</h3>
                          <span className={`course-dot ${c.color}`} />
                        </div>
                        <label className="sr-only" htmlFor={`notes-${c.id}`}>
                          {c.shortTitle} notes
                        </label>
                        <textarea
                          id={`notes-${c.id}`}
                          placeholder="What clicked? What needs another look?"
                          value={progress.notes[c.id] || ''}
                          onChange={(e) =>
                            setProgress((p) => ({
                              ...p,
                              notes: { ...p.notes, [c.id]: e.target.value },
                            }))
                          }
                        />
                      </section>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <PageHeading
                    eyebrow="COURSE MATERIALS"
                    title="A place for your curriculum."
                    text="The foundation is ready. Your lecture materials will give it depth."
                  />
                  <div className="materials-intro panel">
                    <Library size={28} />
                    <div>
                      <h2>Bring your notes into the learning loop.</h2>
                      <p>
                        Complex Systems is imported from your course export:
                        eight lecture reviews, 89 questions, explanations, and
                        hints. The text is split into reading sections, followed
                        by an interactive example, a lecture quiz, and recall
                        practice.
                      </p>
                      <p>
                        Machine Learning and Scientific Methods still use
                        illustrative examples. No live Claude connection or
                        document upload processor is configured. Source
                        qualifications appear in the Complex Systems lessons;
                        original diagrams were not included in the export.
                      </p>
                    </div>
                  </div>
                  <h2 className="section-title">Course references</h2>
                  {courses.map((c) => (
                    <a
                      className="source-row panel"
                      href={courseSource(c.code)}
                      target="_blank"
                      rel="noreferrer"
                      key={c.id}
                    >
                      <span className={`course-icon ${c.color}`}>
                        <CourseIcon course={c} />
                      </span>
                      <span>
                        <small>{c.code} · AUTUMN 2026</small>
                        <h3>{c.title}</h3>
                        <p>
                          Official course description · Østfold University of
                          Applied Sciences
                        </p>
                      </span>
                      <ExternalLink size={18} />
                    </a>
                  ))}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function PageHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text: string
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </div>
  )
}
function CourseCard({
  course: c,
  done,
  onClick,
}: {
  course: Course
  done: number
  onClick: () => void
}) {
  return (
    <button className={`course-card ${c.color}`} onClick={onClick}>
      <div className="course-card-top">
        <span className="course-icon">
          <CourseIcon course={c} />
        </span>
        <span className="course-code">{c.code}</span>
        <ChevronRight size={17} />
      </div>
      <h3>{c.title}</h3>
      <p>{c.description}</p>
      <div className="course-card-bottom">
        <span>
          {done ? <CheckCircle2 size={14} /> : <BookOpen size={14} />}
          {c.lessons
            ? `${done} / ${c.lessons.length} lectures completed`
            : done
              ? 'Starter completed'
              : '1 starter lesson'}
        </span>
        <span>10 ECTS</span>
      </div>
      <div className="course-progress">
        <span style={{ width: `${(done / lessonsFor(c).length) * 100}%` }} />
      </div>
    </button>
  )
}
function EmptyState({
  icon,
  title,
  text,
  action,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  text: string
  action: string
  onClick: () => void
}) {
  return (
    <div className="empty-state panel">
      <span>{icon}</span>
      <h2>{title}</h2>
      <p>{text}</p>
      <button className="primary-button" onClick={onClick}>
        {action}
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

function LearningSession({
  course,
  onBack,
  onComplete,
}: {
  course: Course
  onBack: () => void
  onComplete: (attempts: number) => void
}) {
  const [step, setStep] = useState(0)
  const [quizReady, setQuizReady] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [recall, setRecall] = useState('')
  const [reveal, setReveal] = useState(false)
  const [finished, setFinished] = useState(false)
  const lesson = course.lesson
  return (
    <>
      <button className="back-link" onClick={onBack}>
        <X size={17} />
        Leave session
      </button>
      <div className="session-top">
        <span className={`tag ${course.color}`}>
          {course.code} · {course.shortTitle}
        </span>
        <span>
          <Clock3 size={15} />
          {lesson.minutes} min ·{' '}
          {lesson.reading ? lesson.eyebrow : 'Starter lesson'}
        </span>
      </div>
      <h1 className="lesson-title">{lesson.title}</h1>
      <ol className="session-steps">
        {stages.map((s, i) => (
          <li
            key={s}
            className={i === step ? 'current' : i < step ? 'done' : ''}
          >
            <span>{i < step ? <Check size={14} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      {finished ? (
        <div className="empty-state panel">
          <span className="completion-icon">
            <CheckCircle2 size={44} />
          </span>
          <div className="eyebrow">SESSION COMPLETE</div>
          <h2>One more idea connected.</h2>
          <p>
            You read, explored, checked your understanding, and practised
            recall. Your recall card is scheduled for tomorrow.
          </p>
          <button className="primary-button" onClick={onBack}>
            Back to learning path
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.section
            className="lesson-panel panel"
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            aria-label={stages[step]}
          >
            <div className="eyebrow">
              STEP {step + 1} OF 4 · {stages[step].toUpperCase()}
            </div>
            {lesson.caution && (
              <div className="notice">
                <CircleHelp size={18} />
                <p>{lesson.caution}</p>
              </div>
            )}
            {step === 0 ? (
              <>
                <h2>{lesson.intro}</h2>
                {lesson.reading ? (
                  <LectureReading text={lesson.reading} />
                ) : (
                  <div className="reading-grid">
                    <div>
                      {lesson.paragraphs.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>
                    <Illustration kind={course.id} />
                  </div>
                )}
                <div className="takeaway">
                  <Lightbulb size={21} />
                  <div>
                    <strong>The idea to take with you</strong>
                    <p>{lesson.takeaway}</p>
                  </div>
                </div>
                <p className="sample-note">
                  {lesson.provenance ||
                    'Illustrative starter content · replace or expand using your lecture materials.'}
                </p>
              </>
            ) : step === 1 ? (
              <>
                <h2>Make the idea tangible.</h2>
                <p>
                  {lesson.exercise
                    ? 'Try the controls and relate the result to the reading. This is an original teaching example, not an extracted slide figure.'
                    : course.id === 'machine-learning'
                      ? 'Move the slider and compare the two error curves.'
                      : course.id === 'complex-systems'
                        ? 'Advance the automaton and watch the pattern evolve.'
                        : 'Change the research question and see how a possible method changes.'}
                </p>
                <div className="interactive-figure">
                  <Illustration
                    kind={lesson.exercise || course.id}
                    interactive
                  />
                </div>
              </>
            ) : step === 2 ? (
              <LessonQuiz
                questions={
                  lesson.questions || [
                    {
                      id: lesson.id + '-q1',
                      question: lesson.question,
                      options: lesson.options,
                      answer: lesson.answer,
                      explanation: lesson.explanation,
                    },
                  ]
                }
                onComplete={(total) => {
                  setAttempts(total)
                  setQuizReady(true)
                }}
              />
            ) : (
              <>
                <h2>{lesson.recall}</h2>
                <p>
                  Close the loop: explain it in your own words before looking
                  back.
                </p>
                <label className="range-label" htmlFor="recall-answer">
                  Your explanation
                </label>
                <textarea
                  id="recall-answer"
                  value={recall}
                  onChange={(e) => setRecall(e.target.value)}
                  placeholder="Try to reconstruct the idea from memory…"
                />
                {reveal ? (
                  <div className="takeaway">
                    <Lightbulb size={21} />
                    <div>
                      <strong>Compare with this explanation</strong>
                      <p>{lesson.recallAnswer}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    className="secondary-button"
                    disabled={!recall.trim()}
                    onClick={() => setReveal(true)}
                  >
                    Compare explanation
                    <ChevronRight size={16} />
                  </button>
                )}
                <p className="sample-note">
                  This is self-assessed recall. Your response is not
                  automatically graded or saved.
                </p>
              </>
            )}
            <div className="lesson-actions">
              <button
                className="back-link"
                disabled={step === 0}
                onClick={() => {
                  if (step === 3 || step === 2) setQuizReady(false)
                  setStep((s) => s - 1)
                }}
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              <span>{step + 1} / 4</span>
              <button
                className="primary-button"
                disabled={
                  step === 2 ? !quizReady : step === 3 ? !reveal : false
                }
                onClick={() => {
                  if (step === 3) {
                    onComplete(attempts)
                    setFinished(true)
                  } else {
                    if (step === 1) setQuizReady(false)
                    setStep((s) => s + 1)
                  }
                  window.scrollTo(0, 0)
                }}
              >
                {step === 3
                  ? 'Complete lesson'
                  : step === 0
                    ? 'Explore the concept'
                    : step === 1
                      ? 'Test your understanding'
                      : 'Practise recall'}
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.section>
        </AnimatePresence>
      )}
    </>
  )
}
