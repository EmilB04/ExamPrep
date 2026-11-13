import { ActionButton } from './ActionButton'
import { useEffect, useRef, useState } from 'react'
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
  Search,
  Target,
  X,
} from 'lucide-react'
import { courses, courseSource, lessonCourses, lessonsFor } from './content'
import type { Lesson } from './content'
import { LectureReading } from './LectureReading'
import { LessonQuiz } from './LessonQuiz'
import type { Course } from './content'
import { Illustration } from './Illustration'
import { nextReview } from './progress'
import { useStudySync } from './useStudySync'
import { CourseAssistant } from './CourseAssistant'
import { ThemeControl } from './ThemeControl'
import { ProfileControl } from './ProfileControl'
import { ConceptPattern } from './ConceptPattern'
import { RecallCheck } from './RecallCheck'
import { SpotlightSearch } from './SpotlightSearch'
import type { SearchItem } from './search'

type Page = 'overview' | 'courses' | 'review' | 'notes' | 'materials'
const nav = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'review', label: 'Recall practice', icon: Layers3 },
  { id: 'notes', label: 'Notebook', icon: NotebookPen },
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
  const sync = useStudySync()
  const { progress, setProgress, storageOk } = sync
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [searchOpen, setSearchOpen] = useState(false)
  const [cloudConfirm, setCloudConfirm] = useState(false)
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
      if (
        (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) ||
        (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey)
      ) {
        event.preventDefault()
        setMobileOpen(false)
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])
  useEffect(() => {
    if (!mobileOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sidebarRef.current?.querySelector<HTMLElement>('button, a')?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
      if (event.key !== 'Tab') return
      const controls =
        sidebarRef.current?.querySelectorAll<HTMLElement>('a, button')
      if (!controls?.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    const desktop = window.matchMedia?.('(min-width: 761px)')
    const closeOnDesktop = () => {
      if (desktop?.matches) setMobileOpen(false)
    }
    desktop?.addEventListener('change', closeOnDesktop)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      desktop?.removeEventListener('change', closeOnDesktop)
      previousFocus?.focus()
    }
  }, [mobileOpen])
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
  function openResult(item: SearchItem) {
    setSearchOpen(false)
    const t = item.target
    if (t.type === 'page') return navigate(t.page)
    const course = courses.find((c) => c.id === t.courseId)
    if (!course) return
    if (t.type === 'course') return openCourse(course)
    const lesson = lessonsFor(course).find((l) => l.id === t.lessonId)
    if (!lesson) return openCourse(course)
    setPage('courses')
    setSelected(null)
    setMobileOpen(false)
    start(course, lesson)
  }
  const currentReview = lessonCourses.find((c) => c.lesson.id === reviewId)
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {mobileOpen && (
        <ActionButton
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          whileHover={{}}
          whileTap={{}}
        />
      )}
      <aside
        id="primary-navigation"
        ref={sidebarRef}
        aria-label="Learning navigation"
        className={`sidebar ${mobileOpen ? 'open' : ''}`}
      >
        <ActionButton
          className="icon-button sidebar-close"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </ActionButton>
        <a
          className="brand"
          href="/"
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
        <div className="workspace-label">LEARN</div>
        <nav aria-label="Main navigation">
          {nav.map((item) => (
            <ActionButton
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={() => navigate(item.id)}
            >
              {page === item.id && (
                <motion.span
                  className="nav-slider"
                  layoutId="active-navigation"
                  transition={{ type: 'spring', stiffness: 430, damping: 34 }}
                  aria-hidden="true"
                />
              )}
              <item.icon size={19} />
              {item.label}
              {item.id === 'review' && due.length > 0 && (
                <span className="nav-count">{due.length}</span>
              )}
            </ActionButton>
          ))}
        </nav>
        <div className="sidebar-rule" />
        <div className="workspace-label">COURSE LIBRARY</div>
        <div className="sidebar-courses">
          {courses.map((c) => (
            <ActionButton key={c.id} onClick={() => openCourse(c)}>
              <span className={`course-dot ${c.color}`} />
              {c.shortTitle}
            </ActionButton>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="local-workspace">
            <NotebookPen size={18} />
            <div>
              <strong>Pick up where you left off</strong>
              <p>Study as a guest or sign in to sync notes and progress.</p>
            </div>
          </div>
        </div>
      </aside>
      <SpotlightSearch
        open={searchOpen}
        notes={progress.notes}
        onClose={() => setSearchOpen(false)}
        onSelect={openResult}
      />
      <div className="main-shell" inert={mobileOpen || searchOpen}>
        <header className="topbar">
          <div className="breadcrumb">
            <ActionButton
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              aria-controls="primary-navigation"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu size={21} />
            </ActionButton>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <b>
              {learning
                ? 'Learning session'
                : selected
                  ? selected.shortTitle
                  : nav.find((n) => n.id === page)?.label}
            </b>
          </div>
          <div className="topbar-actions">
            <ActionButton
              className="search-trigger"
              aria-label="Search"
              aria-keyshortcuts="Control+K Meta+K"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
              <span>Search</span>
              <kbd>⌘K</kbd>
            </ActionButton>
            <ThemeControl />
            <ProfileControl
              user={sync.user}
              configured={sync.configured}
              expired={sync.sessionExpired}
              status={sync.status}
            />
          </div>
        </header>
        <main
          id="main"
          className={learning ? 'main-content session-content' : 'main-content'}
        >
          <div className="account-status panel">
            <div>
              <strong>
                {sync.user ? sync.user.email : 'Your study workspace'}
              </strong>
              <p role="status">{sync.status}</p>
            </div>
            <div className="account-actions">
              {sync.user && (
                <ActionButton
                  className="back-link"
                  disabled={!sync.ready || sync.blocked}
                  onClick={sync.importGuest}
                >
                  Import browser notes & progress
                </ActionButton>
              )}
              {sync.blocked && (
                <>
                  <ActionButton
                    className="secondary-button"
                    onClick={sync.download}
                  >
                    Download local copy
                  </ActionButton>
                  <ActionButton
                    className="secondary-button"
                    onClick={sync.reconnect}
                  >
                    Retry connection
                  </ActionButton>
                  {sync.user && (
                    <ActionButton
                      className="back-link"
                      disabled={!sync.ready}
                      onClick={() => setCloudConfirm(true)}
                    >
                      Load cloud version
                    </ActionButton>
                  )}
                </>
              )}
            </div>
            {cloudConfirm && (
              <div className="notice">
                <p>
                  Loading the cloud version replaces this account’s local copy.
                  Download your copy first to keep unsynced edits.
                </p>
                <ActionButton
                  className="secondary-button"
                  onClick={() => {
                    sync.download()
                    void sync.loadCloud()
                    setCloudConfirm(false)
                  }}
                >
                  Download copy and load cloud
                </ActionButton>
                <ActionButton
                  className="back-link"
                  onClick={() => setCloudConfirm(false)}
                >
                  Cancel
                </ActionButton>
              </div>
            )}
          </div>
          <CourseAssistant
            context={learning || selected}
            signedIn={!!sync.user && !sync.sessionExpired}
          />
          {!storageOk && (
            <div className="storage-alert" role="alert">
              Your browser could not save progress. Keep this tab open and
              export your notes before leaving.
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              inert={!sync.ready || sync.sessionExpired}
              aria-busy={!sync.ready}
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
                  <ActionButton
                    className="back-link"
                    onClick={() => navigate('courses')}
                  >
                    <ArrowLeft size={16} />
                    All courses
                  </ActionButton>
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
                              <ActionButton
                                className="secondary-button"
                                onClick={() => start(selected, lesson)}
                              >
                                {progress.completed[lesson.id]
                                  ? 'Revisit'
                                  : 'Start'}
                                <ArrowRight size={15} />
                              </ActionButton>
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
                            : 'Topic groups follow the course description. The starter lesson is illustrative and has not been checked against the full lecture materials.'}
                        </p>
                      </div>
                    </aside>
                  </div>
                </>
              ) : page === 'overview' ? (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">READ. EXPLORE. RECALL.</div>
                      <h1>
                        Make sense of the complex
                        <span className="heading-dot">.</span>
                      </h1>
                      <p>
                        Explore a concept. Put it into practice. See what stays.
                      </p>
                    </div>
                    <span className="term-tag">
                      <GraduationCap size={16} />
                      Master’s courses · Autumn 2026
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
                          <h2>{next.lesson.title}</h2>
                          <p>
                            {next.shortTitle}
                            <span className="hero-meta">
                              <Clock3 size={14} />
                              {next.lesson.minutes} min ·{' '}
                              {next.lesson.reading
                                ? next.lesson.eyebrow
                                : 'Starter lesson'}
                            </span>
                          </p>
                          <ActionButton
                            className="primary-button"
                            onClick={() => start(next)}
                          >
                            {completed.length === lessonCourses.length
                              ? 'Revisit lesson'
                              : 'Start learning'}
                            <ArrowRight size={17} />
                          </ActionButton>
                        </div>
                        <ConceptPattern />
                      </section>
                      <div className="section-heading course-section">
                        <h2>
                          Course library{' '}
                          <span className="count-badge">{courses.length}</span>
                        </h2>
                        <ActionButton
                          className="text-link"
                          onClick={() => navigate('courses')}
                        >
                          View all
                          <ArrowRight size={15} />
                        </ActionButton>
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
                          <span>Available courses</span>
                          <b>{courses.length}</b>
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
                        <ActionButton
                          className="text-link"
                          onClick={() => navigate('review')}
                        >
                          Open recall practice
                          <ArrowRight size={15} />
                        </ActionButton>
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
                    <span>MasterPrep · Read, explore, and recall</span>
                    <span>
                      {storageOk
                        ? sync.user
                          ? sync.status
                          : 'Progress saved in this browser'
                        : 'Progress could not be saved'}{' '}
                      <span className="status-dot" />
                    </span>
                  </footer>
                </>
              ) : page === 'courses' ? (
                <>
                  <PageHeading
                    eyebrow="COURSE LIBRARY"
                    title="Find your next concept."
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
                      questions. Machine Learning and Scientific Methods each
                      have an illustrative starter lesson; full lecture content
                      is not available yet.
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
                            <ActionButton
                              className="secondary-button"
                              onClick={() => rate(currentReview, false)}
                            >
                              Revisit in 10 minutes
                            </ActionButton>
                            <ActionButton
                              className="primary-button"
                              onClick={() => rate(currentReview, true)}
                            >
                              Remembered · in 3 days
                              <Check size={17} />
                            </ActionButton>
                          </div>
                        </>
                      ) : (
                        <ActionButton
                          className="primary-button"
                          onClick={() => setRevealed(true)}
                        >
                          Reveal explanation
                        </ActionButton>
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
                          <ActionButton
                            className="secondary-button"
                            onClick={() => {
                              setReviewId(c.lesson.id)
                              setRevealed(false)
                            }}
                          >
                            Practice
                            <ArrowRight size={15} />
                          </ActionButton>
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
                    eyebrow="NOTEBOOK"
                    title="Put it in your own words."
                    text="Keep questions, explanations, and connections alongside each course."
                  />
                  <div className="section-heading">
                    <p>
                      {sync.user
                        ? 'Notes save automatically to your account.'
                        : 'Notes save automatically in this browser.'}
                    </p>
                    <ActionButton
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
                    </ActionButton>
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
                          className="resize-none"
                          id={`notes-${c.id}`}
                          maxLength={100000}
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
                    title="The material behind the lessons."
                    text="See what is available and where each course begins."
                  />
                  <div className="materials-intro panel">
                    <Library size={28} />
                    <div>
                      <h2>Lecture reviews and source references</h2>
                      <p>
                        The Complex Systems collection includes eight lecture
                        reviews, 89 questions, explanations, and hints. The text
                        is split into reading sections, followed by an
                        interactive example, a lecture quiz, and recall
                        practice.
                      </p>
                      <p>
                        Machine Learning and Scientific Methods still use
                        illustrative examples. Lecture imports are curated; file
                        uploads are not available yet. Source qualifications
                        appear in the Complex Systems lessons; original diagrams
                        were not included in the export.
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
    <ActionButton
      className={`course-card ${c.color}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.24 }}
    >
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
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${(done / lessonsFor(c).length) * 100}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>
    </ActionButton>
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
      <ActionButton className="primary-button" onClick={onClick}>
        {action}
        <ArrowRight size={16} />
      </ActionButton>
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
      <ActionButton className="back-link" onClick={onBack}>
        <X size={17} />
        Leave session
      </ActionButton>
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
          <motion.li key={s} className={i === step ? 'current' : ''}>
            <button
              type="button"
              aria-current={i === step ? 'step' : undefined}
              onClick={() => {
                if (i === 2 && step !== 2) setQuizReady(false)
                setStep(i)
                setFinished(false)
              }}
            >
              <motion.span
                animate={{ scale: i === step ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
              >
                {i + 1}
              </motion.span>
              {s}
            </button>
          </motion.li>
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
          <ActionButton className="primary-button" onClick={onBack}>
            Back to learning path
            <ArrowRight size={16} />
          </ActionButton>
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
                  className="resize-none"
                  id="recall-answer"
                  value={recall}
                  onChange={(e) => setRecall(e.target.value)}
                  placeholder="Try to reconstruct the idea from memory…"
                />
                <RecallCheck lesson={lesson} recall={recall} />
                {reveal ? (
                  <div className="takeaway">
                    <Lightbulb size={21} />
                    <div>
                      <strong>Compare with this explanation</strong>
                      <p>{lesson.recallAnswer}</p>
                    </div>
                  </div>
                ) : (
                  <ActionButton
                    className="secondary-button"
                    disabled={!recall.trim()}
                    onClick={() => setReveal(true)}
                  >
                    Compare explanation
                    <ChevronRight size={16} />
                  </ActionButton>
                )}
                <p className="sample-note">
                  This is self-assessed recall. Your response is not
                  automatically graded or saved.
                </p>
              </>
            )}
            {step === 3 && !quizReady && (
              <p className="notice">
                Complete Check understanding before marking this lesson
                complete. You can jump there using the header.
              </p>
            )}
            <div className="lesson-actions">
              <ActionButton
                className="back-link"
                disabled={step === 0}
                onClick={() => {
                  if (step === 3 || step === 2) setQuizReady(false)
                  setStep((s) => s - 1)
                }}
              >
                <ArrowLeft size={16} />
                Previous
              </ActionButton>
              <span>{step + 1} / 4</span>
              <ActionButton
                className="primary-button"
                disabled={
                  step === 2
                    ? !quizReady
                    : step === 3
                      ? !reveal || !quizReady
                      : false
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
              </ActionButton>
            </div>
          </motion.section>
        </AnimatePresence>
      )}
    </>
  )
}
