import { useEffect, useMemo, useState } from 'react'
import type { WorkoutSession } from '../types'
import { deleteSession, getAllSessions } from '../lib/db'
import { CheckinCalendar } from '../components/CheckinCalendar'
import { SessionDetailModal } from '../components/SessionDetailModal'
import { ProgressChart } from '../components/ProgressChart'
import { getCachedName } from '../lib/translate'

export function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null)
  const [month, setMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
  const [openSession, setOpenSession] = useState<WorkoutSession | null>(null)
  const [progressExerciseId, setProgressExerciseId] = useState<string | null>(null)

  async function reload() {
    setSessions(await getAllSessions())
  }

  useEffect(() => {
    reload()
  }, [])

  const finished = useMemo(() => sessions?.filter((s) => s.finishedAt !== null) ?? [], [sessions])

  const trainedDates = useMemo(() => new Set(finished.map((s) => s.date)), [finished])

  const sessionsOnSelectedDay = useMemo(
    () => (selectedDate ? (sessions ?? []).filter((s) => s.date === selectedDate) : []),
    [sessions, selectedDate],
  )

  const exerciseOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of finished) {
      for (const e of s.entries) {
        if (e.sets.length > 0)
          map.set(e.exerciseId, getCachedName(e.exerciseId, e.exerciseName) ?? e.exerciseName)
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [finished])

  const progressPoints = useMemo(() => {
    if (!progressExerciseId) return []
    const points: { date: string; value: number }[] = []
    for (const s of finished) {
      const entry = s.entries.find((e) => e.exerciseId === progressExerciseId)
      if (!entry || entry.sets.length === 0) continue
      const top = Math.max(...entry.sets.map((set) => set.weight))
      points.push({ date: s.date, value: top })
    }
    return points.sort((a, b) => a.date.localeCompare(b.date))
  }, [finished, progressExerciseId])

  async function handleDelete(id: string) {
    await deleteSession(id)
    setOpenSession(null)
    reload()
  }

  if (sessions === null) {
    return <div className="p-4 text-slate-500">Carregando...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-xl font-bold">Histórico</h1>
        <p className="text-slate-500 text-sm">Dias treinados e progressão de carga</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        <CheckinCalendar
          month={month}
          trainedDates={trainedDates}
          onMonthChange={(delta) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))}
          onDayClick={setSelectedDate}
          selectedDate={selectedDate}
        />

        {selectedDate && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-400">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
              })}
            </h2>
            {sessionsOnSelectedDay.length === 0 && (
              <p className="text-slate-600 text-sm">Nenhum treino neste dia.</p>
            )}
            {sessionsOnSelectedDay.map((s) => (
              <button
                key={s.id}
                onClick={() => setOpenSession(s)}
                className="w-full text-left bg-slate-900 rounded-xl p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.title}</span>
                  {!s.finishedAt && <span className="text-xs text-amber-400">em andamento</span>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {s.entries.length} exercício{s.entries.length !== 1 && 's'}
                </p>
              </button>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-2">Progressão de carga</h2>
          {exerciseOptions.length === 0 ? (
            <p className="text-slate-600 text-sm">
              Finalize treinos com séries registradas para ver sua evolução aqui.
            </p>
          ) : (
            <>
              <select
                value={progressExerciseId ?? ''}
                onChange={(e) => setProgressExerciseId(e.target.value || null)}
                className="w-full bg-slate-900 text-slate-200 text-sm rounded-lg px-3 py-2 mb-3 outline-none"
              >
                <option value="">Selecione um exercício</option>
                {exerciseOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              {progressExerciseId && (
                <div className="bg-slate-900 rounded-xl p-3">
                  <ProgressChart points={progressPoints} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {openSession && (
        <SessionDetailModal
          session={openSession}
          onClose={() => setOpenSession(null)}
          onDelete={() => handleDelete(openSession.id)}
        />
      )}
    </div>
  )
}
