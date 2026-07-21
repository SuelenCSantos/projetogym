export interface Exercise {
  id: string
  name: string
  force: string | null
  level: string
  mechanic: string | null
  equipment: string | null
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  category: string
  images: string[]
}

export interface WorkoutSet {
  id: string
  weight: number
  reps: number
  completedAt: number
}

export interface WorkoutExerciseEntry {
  exerciseId: string
  exerciseName: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  sets: WorkoutSet[]
}

export interface WorkoutSession {
  id: string
  date: string // YYYY-MM-DD, local day this workout belongs to
  startedAt: number
  finishedAt: number | null
  title: string
  entries: WorkoutExerciseEntry[]
}

export interface MuscleLoad {
  muscle: string
  role: 'primary' | 'secondary'
  sets: number
}
