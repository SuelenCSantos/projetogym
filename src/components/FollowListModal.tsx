import { useEffect, useState } from 'react'
import type { UserProfile } from '../types'
import { getUserProfile } from '../lib/auth'
import { getFollowerIds, getFollowingIds } from '../lib/social'

interface Props {
  uid: string
  kind: 'followers' | 'following'
  onClose: () => void
  onSelectUser: (profile: UserProfile) => void
}

export function FollowListModal({ uid, kind, onClose, onSelectUser }: Props) {
  const [profiles, setProfiles] = useState<UserProfile[] | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const ids = kind === 'followers' ? await getFollowerIds(uid) : await getFollowingIds(uid)
      const results = await Promise.all(ids.map((id) => getUserProfile(id)))
      if (!cancelled) setProfiles(results.filter((p): p is UserProfile => p !== null))
    }
    load()
    return () => {
      cancelled = true
    }
  }, [uid, kind])

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="font-semibold">{kind === 'followers' ? 'Seguidores' : 'Seguindo'}</h2>
        <button onClick={onClose} className="text-slate-400 text-sm">
          Fechar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {profiles === null && <p className="text-slate-500 text-sm text-center mt-8">Carregando...</p>}
        {profiles?.length === 0 && (
          <p className="text-slate-600 text-sm text-center mt-8">
            {kind === 'followers' ? 'Ninguém ainda.' : 'Não segue ninguém ainda.'}
          </p>
        )}
        {profiles?.map((p) => (
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
