import { useEffect, useState } from 'react'
import type { Exercise } from './types'
import { loadExercises } from './lib/exercises'
import { BottomNav, type Tab } from './components/BottomNav'
import { TodayPage } from './pages/TodayPage'
import { LibraryPage } from './pages/LibraryPage'
import { HistoryPage } from './pages/HistoryPage'

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [exercises, setExercises] = useState<Exercise[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadExercises()
      .then(setExercises)
      .catch(() => setError('Não foi possível carregar a biblioteca de exercícios. Verifique sua conexão.'))
  }, [])

  return (
    <div className="h-dvh w-full max-w-md mx-auto flex flex-col bg-slate-950">
      <div className="flex-1 min-h-0">
        {error && <div className="p-4 text-rose-400 text-sm text-center">{error}</div>}
        {!error && exercises === null && (
          <div className="p-4 text-slate-500 text-center mt-10">Carregando exercícios...</div>
        )}
        {exercises && (
          <>
            {tab === 'today' && <TodayPage exercises={exercises} />}
            {tab === 'library' && <LibraryPage exercises={exercises} />}
            {tab === 'history' && <HistoryPage />}
          </>
        )}
      </div>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}
