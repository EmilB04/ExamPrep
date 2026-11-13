import type { Progress } from './progress'
export function validProgress(value: unknown): value is Progress {
  if (!value || typeof value !== 'object') return false
  const p = value as Progress
  if (!p.notes || !p.completed || Array.isArray(p.notes) || Array.isArray(p.completed) || typeof p.notes !== 'object' || typeof p.completed !== 'object') return false
  if (Object.keys(p.notes).length > 100 || Object.keys(p.completed).length > 1000) return false
  return Object.entries(p.notes).every(([k, v]) => k.length < 200 && typeof v === 'string' && v.length <= 100000) && Object.entries(p.completed).every(([k, v]) => k.length < 200 && v && typeof v.completedAt === 'string' && Number.isFinite(Date.parse(v.completedAt)) && typeof v.reviewAt === 'string' && Number.isFinite(Date.parse(v.reviewAt)) && Number.isInteger(v.attempts) && v.attempts > 0)
}
