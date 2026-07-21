import { useMemo, useState } from 'react'
import type { Exercise } from '../types'
import { ExerciseCard } from './ExerciseCard'
import { allEquipment, allMuscles, equipmentLabel, muscleLabel } from '../lib/exercises'

interface Props {
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
  rightAdornment?: (exercise: Exercise) => React.ReactNode
}

export function ExercisePicker({ exercises, onSelect, rightAdornment }: Props) {
  const [query, setQuery] = useState('')
  const [muscle, setMuscle] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<string | null>(null)

  const muscles = useMemo(() => allMuscles(exercises), [exercises])
  const equipments = useMemo(() => allEquipment(exercises), [exercises])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises.filter((ex) => {
      if (q && !ex.name.toLowerCase().includes(q)) return false
      if (muscle && !ex.primaryMuscles.includes(muscle) && !ex.secondaryMuscles.includes(muscle))
        return false
      if (equipment && ex.equipment !== equipment) return false
      return true
    })
  }, [exercises, query, muscle, equipment])

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2 space-y-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar exercício..."
          className="w-full bg-slate-900 rounded-lg px-3 py-2 text-sm placeholder-slate-500 outline-none focus:ring-2 ring-cyan-500"
        />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <select
            value={muscle ?? ''}
            onChange={(e) => setMuscle(e.target.value || null)}
            className="bg-slate-900 text-slate-300 text-xs rounded-full px-3 py-1.5 shrink-0 outline-none"
          >
            <option value="">Todos os músculos</option>
            {muscles.map((m) => (
              <option key={m} value={m}>
                {muscleLabel(m)}
              </option>
            ))}
          </select>
          <select
            value={equipment ?? ''}
            onChange={(e) => setEquipment(e.target.value || null)}
            className="bg-slate-900 text-slate-300 text-xs rounded-full px-3 py-1.5 shrink-0 outline-none"
          >
            <option value="">Todos os equipamentos</option>
            {equipments.map((eq) => (
              <option key={eq} value={eq}>
                {equipmentLabel(eq)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 text-sm mt-8">Nenhum exercício encontrado.</p>
        )}
        {filtered.slice(0, 150).map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            onClick={() => onSelect(ex)}
            rightAdornment={rightAdornment?.(ex)}
          />
        ))}
        {filtered.length > 150 && (
          <p className="text-center text-slate-600 text-xs pt-2">
            Mostrando 150 de {filtered.length} · refine a busca
          </p>
        )}
      </div>
    </div>
  )
}
