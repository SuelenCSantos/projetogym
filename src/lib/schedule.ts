import type { WeeklySchedule } from '../types'

const KEY = 'projetogym.weekly_schedule.v1'

export const WEEKDAY_LABELS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
export const WEEKDAY_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function getSchedule(): WeeklySchedule {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function setScheduleDay(weekday: number, templateId: string | null): WeeklySchedule {
  const schedule = getSchedule()
  schedule[weekday] = templateId
  try {
    localStorage.setItem(KEY, JSON.stringify(schedule))
  } catch {
    // storage unavailable - schedule change won't persist this session
  }
  return schedule
}

/** Removes any assignment for this weekday, going back to "not set" (distinct from an explicit rest day). */
export function clearScheduleDay(weekday: number): WeeklySchedule {
  const schedule = getSchedule()
  delete schedule[weekday]
  try {
    localStorage.setItem(KEY, JSON.stringify(schedule))
  } catch {
    // storage unavailable - schedule change won't persist this session
  }
  return schedule
}

export function todayWeekday(): number {
  return new Date().getDay()
}
