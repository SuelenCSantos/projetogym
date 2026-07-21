import { useMemo, useState } from 'react'
import type { MuscleLoad } from '../types'
import { muscleLabel } from '../lib/exercises'
import { intensityFor } from '../lib/muscles'

interface Props {
  loads: MuscleLoad[]
}

function fillClass(intensity: 'none' | 'light' | 'strong') {
  if (intensity === 'strong') return 'fill-rose-500'
  if (intensity === 'light') return 'fill-rose-800'
  return 'fill-slate-700'
}

function Part({
  muscle,
  loadMap,
  children,
}: {
  muscle: string
  loadMap: Map<string, MuscleLoad>
  children: (cls: string) => React.ReactNode
}) {
  const intensity = intensityFor(loadMap.get(muscle))
  return <>{children(`${fillClass(intensity)} stroke-slate-950 stroke-1 transition-colors duration-300`)}</>
}

function FrontBody({ loadMap }: { loadMap: Map<string, MuscleLoad> }) {
  return (
    <svg viewBox="0 0 200 360" className="w-full h-auto">
      <circle cx="100" cy="24" r="18" className="fill-slate-800 stroke-slate-950 stroke-1" />
      <Part muscle="neck" loadMap={loadMap}>
        {(c) => <rect x="92" y="40" width="16" height="10" rx="3" className={c} />}
      </Part>
      <Part muscle="shoulders" loadMap={loadMap}>
        {(c) => (
          <>
            <ellipse cx="62" cy="66" rx="16" ry="13" className={c} />
            <ellipse cx="138" cy="66" rx="16" ry="13" className={c} />
          </>
        )}
      </Part>
      <Part muscle="chest" loadMap={loadMap}>
        {(c) => <rect x="78" y="58" width="44" height="32" rx="10" className={c} />}
      </Part>
      <Part muscle="biceps" loadMap={loadMap}>
        {(c) => (
          <>
            <rect x="44" y="78" width="14" height="40" rx="7" className={c} />
            <rect x="142" y="78" width="14" height="40" rx="7" className={c} />
          </>
        )}
      </Part>
      <Part muscle="forearms" loadMap={loadMap}>
        {(c) => (
          <>
            <rect x="41" y="118" width="13" height="42" rx="6" className={c} />
            <rect x="146" y="118" width="13" height="42" rx="6" className={c} />
          </>
        )}
      </Part>
      <Part muscle="abdominals" loadMap={loadMap}>
        {(c) => <rect x="82" y="92" width="36" height="50" rx="8" className={c} />}
      </Part>
      <Part muscle="abductors" loadMap={loadMap}>
        {(c) => (
          <>
            <rect x="70" y="100" width="10" height="40" rx="5" className={c} />
            <rect x="120" y="100" width="10" height="40" rx="5" className={c} />
          </>
        )}
      </Part>
      <Part muscle="adductors" loadMap={loadMap}>
        {(c) => <rect x="92" y="196" width="16" height="46" rx="7" className={c} />}
      </Part>
      <Part muscle="quadriceps" loadMap={loadMap}>
        {(c) => (
          <>
            <rect x="66" y="196" width="26" height="72" rx="10" className={c} />
            <rect x="108" y="196" width="26" height="72" rx="10" className={c} />
          </>
        )}
      </Part>
      <Part muscle="calves" loadMap={loadMap}>
        {(c) => (
          <>
            <rect x="70" y="276" width="20" height="56" rx="8" className={c} />
            <rect x="110" y="276" width="20" height="56" rx="8" className={c} />
          </>
        )}
      </Part>
    </svg>
  )
}

function BackBody({ loadMap }: { loadMap: Map<string, MuscleLoad> }) {
  return (
    <svg viewBox="0 0 200 360" className="w-full h-auto">
      <circle cx="100" cy="24" r="18" className="fill-slate-800 stroke-slate-950 stroke-1" />
      <Part muscle="neck" loadMap={loadMap}>
        {(c) => <rect x="92" y="40" width="16" height="10" rx="3" className={c} />}
      </Part>
      <Part muscle="traps" loadMap={loadMap}>
        {(c) => <path d="M80 48 L120 48 L132 74 L68 74 Z" className={c} />}
      </Part>
      <Part muscle="shoulders" loadMap={loadMap}>
        {(c) => (
          <>
            <ellipse cx="62" cy="70" rx="15" ry="12" className={c} />
            <ellipse cx="138" cy="70" rx="15" ry="12" className={c} />
          </>
        )}
      </Part>
      <Part muscle="lats" loadMap={loadMap}>
        {(c) => (
          <>
            <rect x="68" y="80" width="20" height="48" rx="8" className={c} />
            <rect x="112" y="80" width="20" height="48" rx="8" className={c} />
          </>
        )}
      </Part>
      <Part muscle="middle back" loadMap={loadMap}>
        {(c) => <rect x="90" y="80" width="20" height="40" rx="6" className={c} />}
      </Part>
      <Part muscle="triceps" loadMap={loadMap}>
        {(c) => (
          <>
            <rect x="44" y="78" width="14" height="40" rx="7" className={c} />
            <rect x="142" y="78" width="14" height="40" rx="7" className={c} />
          </>
        )}
      </Part>
      <Part muscle="forearms" loadMap={loadMap}>
        {(c) => (
          <>
            <rect x="41" y="118" width="13" height="42" rx="6" className={c} />
            <rect x="146" y="118" width="13" height="42" rx="6" className={c} />
          </>
        )}
      </Part>
      <Part muscle="lower back" loadMap={loadMap}>
        {(c) => <rect x="85" y="122" width="30" height="26" rx="8" className={c} />}
      </Part>
      <Part muscle="abductors" loadMap={loadMap}>
        {(c) => (
          <>
            <ellipse cx="58" cy="168" rx="9" ry="15" className={c} />
            <ellipse cx="142" cy="168" rx="9" ry="15" className={c} />
          </>
        )}
      </Part>
      <Part muscle="glutes" loadMap={loadMap}>
        {(c) => (
          <>
            <ellipse cx="82" cy="172" rx="19" ry="22" className={c} />
            <ellipse cx="118" cy="172" rx="19" ry="22" className={c} />
          </>
        )}
      </Part>
      <Part muscle="hamstrings" loadMap={loadMap}>
        {(c) => (
          <>
            <rect x="66" y="196" width="26" height="72" rx="10" className={c} />
            <rect x="108" y="196" width="26" height="72" rx="10" className={c} />
          </>
        )}
      </Part>
      <Part muscle="calves" loadMap={loadMap}>
        {(c) => (
          <>
            <rect x="70" y="276" width="20" height="56" rx="8" className={c} />
            <rect x="110" y="276" width="20" height="56" rx="8" className={c} />
          </>
        )}
      </Part>
    </svg>
  )
}

export function MuscleBodyMap({ loads }: Props) {
  const [view, setView] = useState<'front' | 'back'>('front')
  const loadMap = useMemo(() => new Map(loads.map((l) => [l.muscle, l])), [loads])

  return (
    <div>
      <div className="flex justify-center gap-2 mb-3">
        <button
          onClick={() => setView('front')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            view === 'front' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}
        >
          Frente
        </button>
        <button
          onClick={() => setView('back')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            view === 'back' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}
        >
          Costas
        </button>
      </div>

      <div className="max-w-[200px] mx-auto">
        {view === 'front' ? <FrontBody loadMap={loadMap} /> : <BackBody loadMap={loadMap} />}
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Trabalhado direto
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-800 inline-block" /> De apoio
        </span>
      </div>

      {loads.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {loads.map((l) => (
            <div
              key={l.muscle}
              className="flex items-center justify-between bg-slate-900 rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-slate-200">{muscleLabel(l.muscle)}</span>
              <span className="text-slate-500 text-xs">
                {l.role === 'primary' ? 'direto' : 'apoio'} · {l.sets} séries
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
