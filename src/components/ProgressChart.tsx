interface Point {
  date: string
  value: number
}

interface Props {
  points: Point[]
  unit?: string
}

function formatDateLabel(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function ProgressChart({ points, unit = 'kg' }: Props) {
  if (points.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-8">Sem dados suficientes ainda.</p>
  }

  const width = 320
  const height = 140
  const padX = 12
  const padY = 16

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const coords = points.map((p, i) => {
    const x = points.length === 1 ? width / 2 : padX + (i / (points.length - 1)) * (width - padX * 2)
    const y = height - padY - ((p.value - min) / range) * (height - padY * 2)
    return { x, y, ...p }
  })

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <path d={path} fill="none" className="stroke-cyan-400" strokeWidth={2} />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={3.5} className="fill-cyan-400" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{formatDateLabel(coords[0].date)}</span>
        <span className="text-slate-300">
          pico: {max}
          {unit}
        </span>
        <span>{formatDateLabel(coords[coords.length - 1].date)}</span>
      </div>
    </div>
  )
}
