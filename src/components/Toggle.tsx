interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

export function Toggle({ checked, onChange, label, description }: Props) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between bg-slate-900 rounded-xl p-3"
    >
      <span className="text-left pr-3">
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
      <span
        className={`w-11 h-6 rounded-full shrink-0 flex items-center px-0.5 transition-colors ${
          checked ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-white" />
      </span>
    </button>
  )
}
