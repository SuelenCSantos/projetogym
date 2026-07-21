import { useState } from 'react'
import type { Exercise } from '../types'
import { ExercisePicker } from '../components/ExercisePicker'
import { ExerciseDetailModal } from '../components/ExerciseDetailModal'

interface Props {
  exercises: Exercise[]
}

export function LibraryPage({ exercises }: Props) {
  const [selected, setSelected] = useState<Exercise | null>(null)

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-1 shrink-0">
        <h1 className="text-xl font-bold">Exercícios</h1>
        <p className="text-slate-500 text-sm">Biblioteca com demonstração e músculos trabalhados</p>
      </header>

      <div className="flex-1 min-h-0">
        <ExercisePicker exercises={exercises} onSelect={setSelected} />
      </div>

      {selected && <ExerciseDetailModal exercise={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
