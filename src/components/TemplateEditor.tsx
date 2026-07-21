import { useState } from 'react'
import type { Exercise, TemplateExerciseEntry, WorkoutTemplate } from '../types'
import { ExercisePicker } from './ExercisePicker'
import { getCachedName } from '../lib/translate'
import { muscleLabel } from '../lib/exercises'

interface DraftExercise {
  exerciseId: string
  exerciseName: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  weight: number
  reps: number
  count: number
}

interface Props {
  template: WorkoutTemplate | null // null = creating a new one
  allExercises: Exercise[]
  existingNames: string[]
  onSave: (template: WorkoutTemplate) => void
  onDelete?: () => void
  onClose: () => void
}

function nextDefaultName(existingNames: string[]): string {
  const letters = 'ABCDEFGHIJ'
  for (const letter of letters) {
    const candidate = `Treino ${letter}`
    if (!existingNames.includes(candidate)) return candidate
  }
  return `Treino ${existingNames.length + 1}`
}

function toDraft(entry: TemplateExerciseEntry): DraftExercise {
  const first = entry.sets[0]
  return {
    exerciseId: entry.exerciseId,
    exerciseName: entry.exerciseName,
    primaryMuscles: entry.primaryMuscles,
    secondaryMuscles: entry.secondaryMuscles,
    weight: first?.weight ?? 0,
    reps: first?.reps ?? 10,
    count: entry.sets.length || 3,
  }
}

export function TemplateEditor({ template, allExercises, existingNames, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState(template?.name ?? nextDefaultName(existingNames))
  const [exercises, setExercises] = useState<DraftExercise[]>(
    template?.exercises.map(toDraft) ?? [],
  )
  const [showPicker, setShowPicker] = useState(false)

  function addExercise(exercise: Exercise) {
    if (exercises.some((e) => e.exerciseId === exercise.id)) {
      setShowPicker(false)
      return
    }
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        primaryMuscles: exercise.primaryMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
        weight: 0,
        reps: 10,
        count: 3,
      },
    ])
    setShowPicker(false)
  }

  function updateExercise(exerciseId: string, field: 'weight' | 'reps' | 'count', value: number) {
    setExercises((prev) =>
      prev.map((e) => (e.exerciseId === exerciseId ? { ...e, [field]: Math.max(0, value) } : e)),
    )
  }

  function removeExercise(exerciseId: string) {
    setExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId))
  }

  function handleSave() {
    const finalName = name.trim() || nextDefaultName(existingNames)
    const result: WorkoutTemplate = {
      id: template?.id ?? crypto.randomUUID(),
      name: finalName,
      createdAt: template?.createdAt ?? Date.now(),
      exercises: exercises.map(
        (e): TemplateExerciseEntry => ({
          exerciseId: e.exerciseId,
          exerciseName: e.exerciseName,
          primaryMuscles: e.primaryMuscles,
          secondaryMuscles: e.secondaryMuscles,
          sets: Array.from({ length: Math.max(1, e.count) }, () => ({ weight: e.weight, reps: e.reps })),
        }),
      ),
    }
    onSave(result)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 shrink-0">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-900 text-slate-300"
        >
          ←
        </button>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do treino"
          className="font-semibold text-lg bg-transparent outline-none flex-1 min-w-0"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {exercises.map((e) => (
          <div key={e.exerciseId} className="bg-slate-900 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{getCachedName(e.exerciseId) ?? e.exerciseName}</h3>
                <p className="text-xs text-slate-500 truncate">
                  {e.primaryMuscles.map(muscleLabel).join(', ')}
                </p>
              </div>
              <button
                onClick={() => removeExercise(e.exerciseId)}
                className="text-slate-500 text-xs px-2 py-1 shrink-0"
              >
                remover
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-slate-500">
                Peso (kg)
                <input
                  type="number"
                  inputMode="decimal"
                  value={e.weight}
                  onChange={(ev) => updateExercise(e.exerciseId, 'weight', Number(ev.target.value))}
                  className="mt-1 w-full bg-slate-800 rounded-lg px-2 py-1.5 text-slate-100 text-sm outline-none focus:ring-2 ring-cyan-500"
                />
              </label>
              <label className="text-xs text-slate-500">
                Séries
                <input
                  type="number"
                  inputMode="numeric"
                  value={e.count}
                  onChange={(ev) => updateExercise(e.exerciseId, 'count', Number(ev.target.value))}
                  className="mt-1 w-full bg-slate-800 rounded-lg px-2 py-1.5 text-slate-100 text-sm outline-none focus:ring-2 ring-cyan-500"
                />
              </label>
              <label className="text-xs text-slate-500">
                Repetições
                <input
                  type="number"
                  inputMode="numeric"
                  value={e.reps}
                  onChange={(ev) => updateExercise(e.exerciseId, 'reps', Number(ev.target.value))}
                  className="mt-1 w-full bg-slate-800 rounded-lg px-2 py-1.5 text-slate-100 text-sm outline-none focus:ring-2 ring-cyan-500"
                />
              </label>
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowPicker(true)}
          className="w-full border border-dashed border-slate-700 text-slate-300 rounded-xl py-3 text-sm"
        >
          + Adicionar exercício
        </button>
      </div>

      <div className="p-4 border-t border-slate-800 shrink-0 space-y-2">
        <button
          onClick={handleSave}
          disabled={exercises.length === 0}
          className="w-full bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-semibold rounded-xl py-3"
        >
          Salvar treino
        </button>
        {onDelete && (
          <button onClick={onDelete} className="w-full bg-slate-900 text-rose-400 font-medium rounded-xl py-3">
            Excluir treino
          </button>
        )}
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <h2 className="font-semibold">Adicionar exercício</h2>
            <button onClick={() => setShowPicker(false)} className="text-slate-400 text-sm">
              Fechar
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ExercisePicker exercises={allExercises} onSelect={addExercise} />
          </div>
        </div>
      )}
    </div>
  )
}
