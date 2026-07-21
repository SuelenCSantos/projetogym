import type { MuscleLoad, WorkoutExerciseEntry } from '../types'

export function computeMuscleLoad(entries: WorkoutExerciseEntry[]): MuscleLoad[] {
  const map = new Map<string, { sets: number; role: 'primary' | 'secondary' }>()

  for (const entry of entries) {
    const completedSets = entry.sets.length
    if (completedSets === 0) continue

    for (const m of entry.primaryMuscles) {
      const cur = map.get(m)
      if (cur) {
        cur.sets += completedSets
        cur.role = 'primary'
      } else {
        map.set(m, { sets: completedSets, role: 'primary' })
      }
    }
    for (const m of entry.secondaryMuscles) {
      const cur = map.get(m)
      if (cur) {
        cur.sets += completedSets * 0.5
      } else {
        map.set(m, { sets: completedSets * 0.5, role: 'secondary' })
      }
    }
  }

  return Array.from(map.entries())
    .map(([muscle, v]) => ({ muscle, role: v.role, sets: Math.round(v.sets * 10) / 10 }))
    .sort((a, b) => b.sets - a.sets)
}

export function intensityFor(load: MuscleLoad | undefined): 'none' | 'light' | 'strong' {
  if (!load) return 'none'
  if (load.role === 'primary' && load.sets >= 3) return 'strong'
  if (load.role === 'primary') return 'light'
  if (load.sets >= 4) return 'light'
  return 'light'
}
