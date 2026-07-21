import { formatLocalDate } from '../lib/db'

interface Props {
  month: Date // any date within the month to display
  trainedDates: Set<string>
  onMonthChange: (delta: number) => void
  onDayClick?: (date: string) => void
  selectedDate?: string
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export function CheckinCalendar({ month, trainedDates, onMonthChange, onDayClick, selectedDate }: Props) {
  const year = month.getFullYear()
  const monthIdx = month.getMonth()
  const firstDay = new Date(year, monthIdx, 1)
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const startWeekday = firstDay.getDay()
  const todayStr = formatLocalDate(new Date())

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const monthLabel = month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-slate-900 rounded-xl p-3">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => onMonthChange(-1)} className="w-8 h-8 text-slate-400">
          ‹
        </button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <button onClick={() => onMonthChange(1)} className="w-8 h-8 text-slate-400">
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-600 mb-1">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />
          const dateStr = formatLocalDate(new Date(year, monthIdx, day))
          const trained = trainedDates.has(dateStr)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          return (
            <button
              key={i}
              onClick={() => onDayClick?.(dateStr)}
              className={`aspect-square rounded-lg text-xs flex items-center justify-center relative
                ${trained ? 'bg-emerald-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-400'}
                ${isSelected ? 'ring-2 ring-cyan-400' : ''}
                ${isToday && !trained ? 'ring-1 ring-slate-600' : ''}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
