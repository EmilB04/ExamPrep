import { useEffect, useRef, useState } from 'react'
import {
  emptyProgress,
  loadProgress,
  saveProgress,
  type Progress,
} from './progress'
import { validProgress } from './study-data'

type User = { id: string; email: string }
type Snapshot = { progress: Progress; revision: number; dirty: boolean }
export function useStudySync() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [user, setUser] = useState<User | null>(null)
  const [configured, setConfigured] = useState(false)
  const [storageOk, setStorageOk] = useState(true)
  const [status, setStatus] = useState('Checking sign-in…')
  const [blocked, setBlocked] = useState(false)
  const [ready, setReady] = useState(false)
  const [retry, setRetry] = useState(0)
  const [saveTick, setSaveTick] = useState(0)
  const saving = useRef(false)
  const revision = useRef(0)
  const initial = useRef<Progress | null>(null)
  const latest = useRef(progress)
  latest.current = progress
  const accountKey = (id: string) => `masterprep.account.${id}`
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch('/api/session', {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(15000),
          ]),
        })
        if (
          !response.ok ||
          !response.headers.get('content-type')?.includes('application/json')
        )
          throw new Error()
        const session = await response.json()
        if (!active) return
        setConfigured(session.configured)
        if (!session.user) {
          setUser(null)
          setProgress(loadProgress())
          setStatus('Guest · saved in this browser')
          setReady(true)
          setBlocked(false)
          return
        }
        const account: User = session.user
        setUser(account)
        let cached: Snapshot | null = null
        try {
          cached = JSON.parse(
            localStorage.getItem(accountKey(account.id)) || 'null',
          )
        } catch {
          /* storage unavailable */
        }
        if (
          cached &&
          validProgress(cached.progress) &&
          Number.isSafeInteger(cached.revision)
        ) {
          revision.current = cached.revision
          initial.current = cached.dirty ? null : cached.progress
          latest.current = cached.progress
          setProgress(cached.progress)
        } else {
          initial.current = emptyProgress()
          latest.current = initial.current
          setProgress(initial.current)
        }
        const remote = await fetch('/api/progress', {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(15000),
          ]),
        })
        if (!remote.ok)
          throw new Error('Cloud data could not be loaded. Retry to reconnect.')
        const data = await remote.json()
        if (
          !validProgress(data.progress) ||
          !Number.isSafeInteger(data.revision)
        )
          throw new Error('Cloud data is invalid.')
        if (!active) return
        if (cached?.dirty && validProgress(cached.progress)) {
          if (cached.revision !== data.revision) {
            setBlocked(true)
            setStatus(
              'Another device saved changes. Download your copy before loading cloud data.',
            )
          } else setStatus('Saving recovered changes…')
        } else {
          revision.current = data.revision
          initial.current = data.progress
          latest.current = data.progress
          setProgress(data.progress)
          setStatus('Saved to your account')
        }
        setReady(true)
      } catch (error) {
        if (!active) return
        setStatus(
          error instanceof Error && error.message
            ? error.message
            : 'Guest · cloud sign-in unavailable',
        )
        setReady(true)
        // Never send an unhydrated account snapshot to the server.
        setBlocked(true)
      }
    }
    void load()
    return () => {
      active = false
      controller.abort()
    }
  }, [retry])
  useEffect(() => {
    if (!user) {
      setStorageOk(saveProgress(progress))
      return
    }
    const dirty = progress !== initial.current
    try {
      localStorage.setItem(
        accountKey(user.id),
        JSON.stringify({ progress, revision: revision.current, dirty }),
      )
      setStorageOk(true)
    } catch {
      setStorageOk(false)
    }
    if (!ready || blocked || !dirty || saving.current) return
    const timer = setTimeout(async () => {
      saving.current = true
      setStatus('Saving to your account…')
      try {
        const response = await fetch('/api/progress', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ progress, revision: revision.current }),
          signal: AbortSignal.timeout(15000),
        })
        const body = await response.json()
        if (!response.ok)
          throw new Error(
            body.error || 'Cloud save failed. Retry to reconnect.',
          )
        revision.current = body.revision
        initial.current = progress
        localStorage.setItem(
          accountKey(user.id),
          JSON.stringify({
            progress: latest.current,
            revision: body.revision,
            dirty: latest.current !== progress,
          }),
        )
        setStatus('Saved to your account')
      } catch (error) {
        setBlocked(true)
        setStatus(
          error instanceof Error
            ? error.message
            : 'Cloud save failed. Retry to reconnect.',
        )
      } finally {
        saving.current = false
        setSaveTick((n) => n + 1)
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [progress, user, ready, blocked, saveTick])
  function reconnect() {
    if (saving.current) return
    setReady(false)
    setBlocked(false)
    setRetry((n) => n + 1)
  }
  async function loadCloud() {
    if (!user || saving.current || !ready) return
    setReady(false)
    setStatus('Loading cloud version…')
    try {
      const response = await fetch('/api/progress', {
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) throw new Error()
      const data = await response.json()
      if (
        !validProgress(data.progress) ||
        !Number.isSafeInteger(data.revision) ||
        data.revision < 0
      )
        throw new Error()
      revision.current = data.revision
      initial.current = data.progress
      setProgress(data.progress)
      setBlocked(false)
      setStatus('Loaded cloud version')
    } catch {
      setStatus('Could not load cloud data. Your local copy is kept.')
    } finally {
      setReady(true)
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(latest.current, null, 2)], {
        type: 'application/json',
      }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'masterprep-study-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  function importGuest() {
    const guest = loadProgress()
    setProgress((p) => ({
      completed: { ...guest.completed, ...p.completed },
      notes: Object.fromEntries(
        [
          ...new Set([...Object.keys(guest.notes), ...Object.keys(p.notes)]),
        ].map((k) => [
          k,
          p.notes[k] && guest.notes[k] && !p.notes[k].includes(guest.notes[k])
            ? `${p.notes[k]}\n\n--- Imported browser notes ---\n${guest.notes[k]}`
            : p.notes[k] || guest.notes[k],
        ]),
      ),
    }))
  }
  return {
    progress,
    setProgress,
    storageOk,
    user,
    configured,
    status,
    blocked,
    ready,
    reconnect,
    loadCloud,
    download,
    importGuest,
  }
}
