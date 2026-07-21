import { Fragment } from 'react'
import type { WorkoutExerciseEntry } from '../types'
import { muscleLabel } from '../lib/exercises'

interface Props {
  entry: WorkoutExerciseEntry
  onAddSet: () => void
  onUpdateSet: (setId: string, field: 'weight' | 'reps', value: number) => void
  onRemoveSet: (setId: string) => void
  onRemoveEntry: () => void
  lastWeight?: number
}

export function WorkoutEntryCard({ entry, onAddSet, onUpdateSet, onRemoveSet, onRemoveEntry }: Props) {
  return (
    <div className="bg-slate-900 rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-medium truncate">{entry.exerciseName}</h3>
          <p className="text-xs text-slate-500 truncate">
            {entry.primaryMuscles.map(muscleLabel).join(', ')}
          </p>
        </div>
        <button
          onClick={onRemoveEntry}
          className="text-slate-500 text-xs px-2 py-1 shrink-0"
          aria-label="Remover exercício"
        >
          remover
        </button>
      </div>

      {entry.sets.length > 0 && (
        <div className="mt-3 grid grid-cols-[auto_1fr_1fr_auto] gap-x-2 gap-y-2 items-center text-xs text-slate-500">
          <span />
          <span>Peso (kg)</span>
          <span>Reps</span>
          <span />
          {entry.sets.map((set, i) => (
            <Fragment key={set.id}>
              <span className="text-slate-400 font-medium w-4 text-center">{i + 1}</span>
              <input
                type="number"
                inputMode="decimal"
                value={set.weight}
                onChange={(e) => onUpdateSet(set.id, 'weight', Number(e.target.value))}
                className="bg-slate-800 rounded-lg px-2 py-1.5 text-slate-100 text-sm outline-none focus:ring-2 ring-cyan-500 w-full"
              />
              <input
                type="number"
                inputMode="numeric"
                value={set.reps}
                onChange={(e) => onUpdateSet(set.id, 'reps', Number(e.target.value))}
                className="bg-slate-800 rounded-lg px-2 py-1.5 text-slate-100 text-sm outline-none focus:ring-2 ring-cyan-500 w-full"
              />
              <button
                onClick={() => onRemoveSet(set.id)}
                className="text-slate-600 w-6 h-6 flex items-center justify-center"
                aria-label="Remover série"
              >
                ×
              </button>
            </Fragment>
          ))}
        </div>
      )}

      <button
        onClick={onAddSet}
        className="mt-3 w-full border border-dashed border-slate-700 text-slate-400 rounded-lg py-2 text-sm"
      >
        + Adicionar série
      </button>
    </div>
  )
}
