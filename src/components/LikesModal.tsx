import { useEffect, useState } from 'react'
import type { UserProfile } from '../types'
import { getLikers } from '../lib/social'

interface Props {
  postId: string
  onClose: () => void
  onSelectUser: (profile: UserProfile) => void
}

export function LikesModal({ postId, onClose, onSelectUser }: Props) {
  const [likers, setLikers] = useState<UserProfile[] | null>(null)

  useEffect(() => {
    let cancelled = false
    getLikers(postId).then((list) => {
      if (!cancelled) setLikers(list)
    })
    return () => {
      cancelled = true
    }
  }, [postId])

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="font-semibold">Curtidas</h2>
        <button onClick={onClose} className="text-slate-400 text-sm">
          Fechar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {likers === null && <p className="text-slate-500 text-sm text-center mt-8">Carregando...</p>}
        {likers?.length === 0 && (
          <p className="text-slate-600 text-sm text-center mt-8">Ninguém curtiu ainda.</p>
        )}
        {likers?.map((p) => (
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
            <span className="block font-medium truncate">@{p.username}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
