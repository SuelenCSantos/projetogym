import { useEffect, useState } from 'react'
import type { UserProfile } from '../types'
import { searchUsersByUsernamePrefix } from '../lib/social'

interface Props {
  onClose: () => void
  onSelectUser: (profile: UserProfile) => void
  excludeUid?: string
}

export function UserSearchModal({ onClose, onSelectUser, excludeUid }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    const timeout = setTimeout(async () => {
      const found = await searchUsersByUsernamePrefix(q)
      if (!cancelled) {
        setResults(found.filter((p) => p.uid !== excludeUid))
        setLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query, excludeUid])

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="font-semibold">Buscar pessoas</h2>
        <button onClick={onClose} className="text-slate-400 text-sm">
          Fechar
        </button>
      </div>
      <div className="p-4">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="@nome_de_usuario"
          className="w-full bg-slate-900 rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 outline-none focus:ring-2 ring-cyan-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {loading && <p className="text-slate-500 text-sm text-center mt-4">Buscando...</p>}
        {!loading && query.trim() && results.length === 0 && (
          <p className="text-slate-600 text-sm text-center mt-4">Ninguém encontrado.</p>
        )}
        {results.map((p) => (
          <button
            key={p.uid}
            onClick={() => onSelectUser(p)}
            className="w-full flex items-center gap-3 bg-slate-900 rounded-xl p-2.5 text-left"
          >
            <span className="w-11 h-11 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
              {p.photoURL ? (
                <img src={p.photoURL} alt={p.username} className="w-full h-full object-cover" />
              ) : (
                p.username.slice(0, 1).toUpperCase()
              )}
            </span>
            <span className="min-w-0">
              <span className="block font-medium truncate">@{p.username}</span>
              {p.displayName && p.displayName !== p.username && (
                <span className="block text-xs text-slate-500 truncate">{p.displayName}</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
