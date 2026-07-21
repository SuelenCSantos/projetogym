import { useEffect, useMemo, useState } from 'react'
import type { Exercise, WorkoutSession } from '../types'
import { getSessionsByDate, saveSession, todayLocalDate } from '../lib/db'
import { WorkoutEntryCard } from '../components/WorkoutEntryCard'
import { ExercisePicker } from '../components/ExercisePicker'
import { MuscleBodyMap } from '../components/MuscleBodyMap'
import { computeMuscleLoad } from '../lib/muscles'

interface Props {
  exercises: Exercise[]
}

function newSession(): WorkoutSession {
  const date = todayLocalDate()
  return {
    id: crypto.randomUUID(),
    date,
    startedAt: Date.now(),
    finishedAt: null,
    title: 'Treino de hoje',
    entries: [],
  }
}

export function TodayPage({ exercises }: Props) {
  const [todaySessions, setTodaySessions] = useState<WorkoutSession[] | null>(null)
  const [draft, setDraft] = useState<WorkoutSession | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [justFinished, setJustFinished] = useState<WorkoutSession | null>(null)

  useEffect(() => {
    getSessionsByDate(todayLocalDate()).then((sessions) => {
      setTodaySessions(sessions)
      setDraft(sessions.find((s) => s.finishedAt === null) ?? null)
    })
  }, [])

  const finishedToday = useMemo(
    () => todaySessions?.filter((s) => s.finishedAt !== null) ?? [],
    [todaySessions],
  )

  async function persist(next: WorkoutSession) {
    setDraft(next)
    await saveSession(next)
  }

  function startWorkout() {
    const session = newSession()
    persist(session)
  }

  function addExercise(exercise: Exercise) {
    if (!draft) return
    const already = draft.entries.some((e) => e.exerciseId === exercise.id)
    if (already) {
      setShowPicker(false)
      return
    }
    const next: WorkoutSession = {
      ...draft,
      entries: [
        ...draft.entries,
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          primaryMuscles: exercise.primaryMuscles,
          secondaryMuscles: exercise.secondaryMuscles,
          sets: [],
        },
      ],
    }
    persist(next)
    setShowPicker(false)
  }

  function addSet(exerciseId: string) {
    if (!draft) return
    const entry = draft.entries.find((e) => e.exerciseId === exerciseId)
    const last = entry?.sets[entry.sets.length - 1]
    const next: WorkoutSession = {
      ...draft,
      entries: draft.entries.map((e) =>
        e.exerciseId === exerciseId
          ? {
              ...e,
              sets: [
                ...e.sets,
                {
                  id: crypto.randomUUID(),
                  weight: last?.weight ?? 0,
                  reps: last?.reps ?? 10,
                  completedAt: Date.now(),
                },
              ],
            }
          : e,
      ),
    }
    persist(next)
  }

  function updateSet(exerciseId: string, setId: string, field: 'weight' | 'reps', value: number) {
    if (!draft) return
    const next: WorkoutSession = {
      ...draft,
      entries: draft.entries.map((e) =>
        e.exerciseId === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
            }
          : e,
      ),
    }
    persist(next)
  }

  function removeSet(exerciseId: string, setId: string) {
    if (!draft) return
    const next: WorkoutSession = {
      ...draft,
      entries: draft.entries.map((e) =>
        e.exerciseId === exerciseId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e,
      ),
    }
    persist(next)
  }

  function removeEntry(exerciseId: string) {
    if (!draft) return
    const next: WorkoutSession = {
      ...draft,
      entries: draft.entries.filter((e) => e.exerciseId !== exerciseId),
    }
    persist(next)
  }

  async function finishWorkout() {
    if (!draft) return
    const finished: WorkoutSession = { ...draft, finishedAt: Date.now() }
    await saveSession(finished)
    setTodaySessions((prev) => [...(prev ?? []).filter((s) => s.id !== finished.id), finished])
    setDraft(null)
    setJustFinished(finished)
  }

  if (todaySessions === null) {
    return <div className="p-4 text-slate-500">Carregando...</div>
  }

  if (justFinished) {
    const loads = computeMuscleLoad(justFinished.entries)
    return (
      <div className="flex flex-col h-full overflow-y-auto p-4">
        <div className="text-center mb-2">
          <div className="text-4xl mb-2">✅</div>
          <h1 className="text-xl font-bold">Treino concluído!</h1>
          <p className="text-slate-500 text-sm mt-1">
            Dia marcado como treinado. Esses músculos tendem a ficar doloridos nos próximos dias:
          </p>
        </div>
        <MuscleBodyMap loads={loads} />
        <button
          onClick={() => setJustFinished(null)}
          className="mt-6 w-full bg-slate-800 text-slate-100 font-medium rounded-xl py-3"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-xl font-bold">Hoje</h1>
        <p className="text-slate-500 text-sm">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {finishedToday.length > 0 && (
          <div className="bg-emerald-950 text-emerald-300 text-sm rounded-xl px-3 py-2">
            {finishedToday.length === 1
              ? '1 treino já concluído hoje.'
              : `${finishedToday.length} treinos já concluídos hoje.`}
          </div>
        )}

        {!draft && (
          <button
            onClick={startWorkout}
            className="w-full bg-cyan-500 text-slate-950 font-semibold rounded-xl py-3 mt-2"
          >
            + Iniciar treino
          </button>
        )}

        {draft && (
          <>
            {draft.entries.map((entry) => (
              <WorkoutEntryCard
                key={entry.exerciseId}
                entry={entry}
                onAddSet={() => addSet(entry.exerciseId)}
                onUpdateSet={(setId, field, value) => updateSet(entry.exerciseId, setId, field, value)}
                onRemoveSet={(setId) => removeSet(entry.exerciseId, setId)}
                onRemoveEntry={() => removeEntry(entry.exerciseId)}
              />
            ))}

            <button
              onClick={() => setShowPicker(true)}
              className="w-full border border-dashed border-slate-700 text-slate-300 rounded-xl py-3 text-sm"
            >
              + Adicionar exercício
            </button>

            {draft.entries.some((e) => e.sets.length > 0) && (
              <button
                onClick={finishWorkout}
                className="w-full bg-emerald-500 text-slate-950 font-semibold rounded-xl py-3"
              >
                Finalizar treino
              </button>
            )}
          </>
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
            <ExercisePicker exercises={exercises} onSelect={addExercise} />
          </div>
        </div>
      )}
    </div>
  )
}
