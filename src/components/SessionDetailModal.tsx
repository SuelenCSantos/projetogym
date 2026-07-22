import type { WorkoutSession } from '../types'
import { MuscleBodyMap } from './MuscleBodyMap'
import { computeMuscleLoad } from '../lib/muscles'
import { getCachedName } from '../lib/translate'

interface Props {
  session: WorkoutSession
  onClose: () => void
  onDelete: () => void
}

export function SessionDetailModal({ session, onClose, onDelete }: Props) {
  const loads = computeMuscleLoad(session.entries)
  const date = new Date(session.startedAt)

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
        <div className="min-w-0">
          <h2 className="font-semibold truncate">{session.title}</h2>
          <p className="text-xs text-slate-500">
            {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            {!session.finishedAt && ' · em andamento'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          {session.entries.map((entry) => (
            <div key={entry.exerciseId} className="bg-slate-900 rounded-xl p-3">
              <h3 className="font-medium mb-1.5">
                {getCachedName(entry.exerciseId, entry.exerciseName) ?? entry.exerciseName}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-400">
                {entry.sets.map((s, i) => (
                  <span key={s.id}>
                    {i + 1}ª: {s.weight}kg × {s.reps}
                  </span>
                ))}
                {entry.sets.length === 0 && <span className="text-slate-600">sem séries registradas</span>}
              </div>
            </div>
          ))}
          {session.entries.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">Nenhum exercício registrado.</p>
          )}
        </div>

        {loads.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Músculos trabalhados</h3>
            <MuscleBodyMap loads={loads} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <button
          onClick={onDelete}
          className="w-full bg-slate-900 text-rose-400 font-medium rounded-xl py-3"
        >
          Excluir treino
        </button>
      </div>
    </div>
  )
}
