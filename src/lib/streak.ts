import type { WorkoutSession } from '../types'
import { formatLocalDate } from './db'

/**
 * Consecutive trained days counting back from today. If today has no
 * finished session yet, counting starts from yesterday instead (a one-day
 * grace period) so the streak doesn't drop to zero before the day is over.
 */
export function computeStreak(sessions: WorkoutSession[]): number {
  const trainedDates = new Set(sessions.filter((s) => s.finishedAt !== null).map((s) => s.date))
  if (trainedDates.size === 0) return 0

  const cursor = new Date()
  if (!trainedDates.has(formatLocalDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!trainedDates.has(formatLocalDate(cursor))) return 0
  }

  let streak = 0
  while (trainedDates.has(formatLocalDate(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
