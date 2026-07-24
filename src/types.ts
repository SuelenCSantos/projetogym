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
  completed?: boolean
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

export interface TemplateSet {
  weight: number
  reps: number
}

export interface TemplateExerciseEntry {
  exerciseId: string
  exerciseName: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  sets: TemplateSet[]
}

export interface WorkoutTemplate {
  id: string
  name: string // e.g. "Treino A"
  exercises: TemplateExerciseEntry[]
  createdAt: number
}

/** Weekday index (0=domingo ... 6=sábado) -> template id, or null for descanso */
export type WeeklySchedule = Partial<Record<number, string | null>>

export interface UserProfile {
  uid: string
  username: string
  usernameLower: string
  displayName: string
  photoURL: string | null
  isPrivate: boolean
  allowInteractions?: boolean // undefined treated as true (default on)
  currentStreak: number
  lastWorkoutDate: string | null // YYYY-MM-DD
  createdAt: number
}

export type FollowStatus = 'accepted' | 'pending'

export interface FollowDoc {
  followerUid: string
  targetUid: string
  status: FollowStatus
  createdAt: number
}

export interface Post {
  id: string
  authorUid: string
  mediaType: 'photo' | 'video'
  mediaURL: string
  thumbnailURL: string | null
  caption: string
  createdAt: number
  // snapshot of the author's preference at post time - undefined treated as true
  allowInteractions?: boolean
}

export interface Comment {
  id: string
  postId: string
  authorUid: string
  text: string
  createdAt: number
}

export interface Conversation {
  id: string // sorted `${uidA}_${uidB}`
  participants: [string, string]
  lastMessageText: string
  lastMessageAt: number
  lastMessageSenderUid: string
  createdAt: number
}

export interface Message {
  id: string
  conversationId: string
  senderUid: string
  text: string
  createdAt: number
}
