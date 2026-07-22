import { useEffect, useMemo, useState } from 'react'
import type { Exercise, WorkoutTemplate } from '../types'
import { deleteTemplate, getAllTemplates, saveTemplate } from '../lib/db'
import { clearScheduleDay, getSchedule, setScheduleDay, WEEKDAY_LABELS_PT } from '../lib/schedule'
import { TemplateEditor } from '../components/TemplateEditor'
import { getCachedName } from '../lib/translate'

interface Props {
  exercises: Exercise[]
}

export function PlansPage({ exercises }: Props) {
  const [templates, setTemplates] = useState<WorkoutTemplate[] | null>(null)
  const [schedule, setSchedule] = useState(() => getSchedule())
  const [editing, setEditing] = useState<WorkoutTemplate | null | 'new'>(null)

  async function reload() {
    setTemplates(await getAllTemplates())
  }

  useEffect(() => {
    reload()
  }, [])

  const templateNames = useMemo(() => templates?.map((t) => t.name) ?? [], [templates])

  function handleScheduleChange(weekday: number, value: string) {
    if (value === '') {
      setSchedule(clearScheduleDay(weekday))
      return
    }
    const templateId = value === 'rest' ? null : value
    setSchedule(setScheduleDay(weekday, templateId))
  }

  async function handleSave(template: WorkoutTemplate) {
    await saveTemplate(template)
    setEditing(null)
    reload()
  }

  async function handleDelete(id: string) {
    await deleteTemplate(id)
    // clear this template from any day it was scheduled on
    let next = schedule
    for (const key of Object.keys(schedule)) {
      if (schedule[Number(key)] === id) next = clearScheduleDay(Number(key))
    }
    setSchedule(next)
    setEditing(null)
    reload()
  }

  if (templates === null) {
    return <div className="p-4 text-slate-500">Carregando...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-xl font-bold">Meus treinos</h1>
        <p className="text-slate-500 text-sm">Modelos reutilizáveis e agenda semanal</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-2">Agenda semanal</h2>
          <div className="bg-slate-900 rounded-xl divide-y divide-slate-800">
            {WEEKDAY_LABELS_PT.map((label, weekday) => (
              <div key={weekday} className="flex items-center justify-between px-3 py-2.5 gap-2">
                <span className="text-sm text-slate-300">{label}</span>
                <select
                  value={schedule[weekday] === null ? 'rest' : schedule[weekday] ?? ''}
                  onChange={(e) => handleScheduleChange(weekday, e.target.value)}
                  className="bg-slate-800 text-slate-200 text-sm rounded-lg px-2 py-1.5 outline-none max-w-[55%]"
                >
                  <option value="">Sem treino definido</option>
                  <option value="rest">Descanso</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-400">Modelos de treino</h2>
          </div>
          <div className="space-y-2">
            {templates.length === 0 && (
              <p className="text-slate-600 text-sm">Nenhum treino criado ainda.</p>
            )}
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setEditing(t)}
                className="w-full text-left bg-slate-900 rounded-xl p-3"
              >
                <h3 className="font-medium">{t.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {t.exercises
                    .map((e) => getCachedName(e.exerciseId, e.exerciseName) ?? e.exerciseName)
                    .join(', ') || 'Sem exercícios'}
                </p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setEditing('new')}
            className="mt-3 w-full border border-dashed border-slate-700 text-slate-300 rounded-xl py-3 text-sm"
          >
            + Criar treino
          </button>
        </div>
      </div>

      {editing !== null && (
        <TemplateEditor
          template={editing === 'new' ? null : editing}
          allExercises={exercises}
          existingNames={templateNames.filter((n) => editing === 'new' || n !== (editing as WorkoutTemplate).name)}
          onSave={handleSave}
          onDelete={editing !== 'new' ? () => handleDelete((editing as WorkoutTemplate).id) : undefined}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
