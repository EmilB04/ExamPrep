export type Completion = {
  completedAt: string
  reviewAt: string
  attempts: number
}
export type Progress = {
  completed: Record<string, Completion>
  notes: Record<string, string>
}
const key = 'masterprep.progress.v1'
// Read the previous storage key so existing notes and progress survive the rename.
const legacyKey = 'examprep.progress.v1'
export const emptyProgress = (): Progress => ({ completed: {}, notes: {} })
export function loadProgress(): Progress {
  try {
    const raw: unknown = JSON.parse(
      localStorage.getItem(key) ?? localStorage.getItem(legacyKey) ?? 'null',
    )
    if (!raw || typeof raw !== 'object') return emptyProgress()
    const data = raw as Partial<Progress>
    const completed = Object.fromEntries(
      Object.entries(data.completed || {}).filter(
        ([, v]) =>
          v &&
          typeof v.completedAt === 'string' &&
          Number.isFinite(Date.parse(v.completedAt)) &&
          typeof v.reviewAt === 'string' &&
          Number.isFinite(Date.parse(v.reviewAt)) &&
          Number.isInteger(v.attempts) &&
          v.attempts > 0,
      ),
    )
    const notes = Object.fromEntries(
      Object.entries(data.notes || {}).filter(([, v]) => typeof v === 'string'),
    )
    return { completed, notes }
  } catch {
    return emptyProgress()
  }
}
export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(key, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}
export function nextReview(now: Date, remembered: boolean) {
  return new Date(
    now.getTime() + (remembered ? 3 * 86400000 : 10 * 60000),
  ).toISOString()
}
