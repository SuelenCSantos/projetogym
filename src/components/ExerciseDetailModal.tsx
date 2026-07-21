import { useEffect, useState } from 'react'
import type { Exercise } from '../types'
import { ExerciseImage } from './ExerciseImage'
import { categoryLabel, equipmentLabel, levelLabel, muscleLabel } from '../lib/exercises'
import { translateInstructions } from '../lib/translate'

interface Props {
  exercise: Exercise
  onClose: () => void
  onAdd?: (exercise: Exercise) => void
}

export function ExerciseDetailModal({ exercise, onClose, onAdd }: Props) {
  const [translated, setTranslated] = useState<string[] | null>(null)
  const [translating, setTranslating] = useState(false)
  const [translationFailed, setTranslationFailed] = useState(false)

  useEffect(() => {
    setTranslated(null)
    setTranslationFailed(false)
    if (exercise.instructions.length === 0) return

    let cancelled = false
    setTranslating(true)
    translateInstructions(exercise.id, exercise.instructions)
      .then((result) => {
        if (!cancelled) setTranslated(result)
      })
      .catch(() => {
        if (!cancelled) setTranslationFailed(true)
      })
      .finally(() => {
        if (!cancelled) setTranslating(false)
      })
    return () => {
      cancelled = true
    }
  }, [exercise.id])

  const displayedInstructions = translated ?? exercise.instructions

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
        <h2 className="font-semibold text-lg truncate">{exercise.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ExerciseImage
          images={exercise.images}
          alt={exercise.name}
          className="w-full h-64 object-contain bg-slate-900"
        />

        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="bg-cyan-950 text-cyan-300 text-xs px-2.5 py-1 rounded-full">
              {categoryLabel(exercise.category)}
            </span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full">
              {equipmentLabel(exercise.equipment)}
            </span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full">
              {levelLabel(exercise.level)}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-1.5">Músculos principais</h3>
            <div className="flex flex-wrap gap-1.5">
              {exercise.primaryMuscles.map((m) => (
                <span key={m} className="bg-rose-950 text-rose-300 text-xs px-2.5 py-1 rounded-full">
                  {muscleLabel(m)}
                </span>
              ))}
            </div>
          </div>

          {exercise.secondaryMuscles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-1.5">Músculos de apoio</h3>
              <div className="flex flex-wrap gap-1.5">
                {exercise.secondaryMuscles.map((m) => (
                  <span key={m} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                    {muscleLabel(m)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.instructions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-semibold text-slate-400">Como executar</h3>
                {translating && <span className="text-xs text-slate-600">traduzindo...</span>}
                {translationFailed && (
                  <span className="text-xs text-amber-500">tradução indisponível, exibindo em inglês</span>
                )}
              </div>
              <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
                {displayedInstructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              {translated && !translationFailed && (
                <p className="text-xs text-slate-600 mt-2">Tradução automática</p>
              )}
            </div>
          )}
        </div>
      </div>

      {onAdd && (
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={() => onAdd(exercise)}
            className="w-full bg-cyan-500 text-slate-950 font-semibold rounded-xl py-3"
          >
            Adicionar ao treino de hoje
          </button>
        </div>
      )}
    </div>
  )
}
