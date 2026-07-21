import type { Exercise } from '../types'
import { ExerciseImage } from './ExerciseImage'
import { equipmentLabel, muscleLabel } from '../lib/exercises'

interface Props {
  exercise: Exercise
  displayName?: string
  onClick: () => void
  rightAdornment?: React.ReactNode
}

export function ExerciseCard({ exercise, displayName, onClick, rightAdornment }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-slate-900 hover:bg-slate-800 rounded-xl p-2.5 text-left transition-colors"
    >
      <ExerciseImage
        images={exercise.images}
        alt={exercise.name}
        animate={false}
        className="w-16 h-16 rounded-lg shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="font-medium text-slate-100 truncate">{displayName ?? exercise.name}</div>
        <div className="text-xs text-slate-400 truncate">
          {exercise.primaryMuscles.map(muscleLabel).join(', ') || 'Geral'}
        </div>
        <div className="text-xs text-slate-500">{equipmentLabel(exercise.equipment)}</div>
      </div>
      {rightAdornment}
    </button>
  )
}
