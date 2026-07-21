export type Tab = 'today' | 'plans' | 'library' | 'history'

interface Props {
  tab: Tab
  onChange: (tab: Tab) => void
}

const ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Hoje', icon: '🏋️' },
  { id: 'plans', label: 'Meus treinos', icon: '📋' },
  { id: 'library', label: 'Exercícios', icon: '📚' },
  { id: 'history', label: 'Histórico', icon: '📈' },
]

export function BottomNav({ tab, onChange }: Props) {
  return (
    <nav className="shrink-0 border-t border-slate-800 bg-slate-950 pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs ${
              tab === item.id ? 'text-cyan-400' : 'text-slate-500'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
