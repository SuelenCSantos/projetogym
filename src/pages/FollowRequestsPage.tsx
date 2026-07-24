import { useEffect, useState } from 'react'
import type { FollowDoc, UserProfile } from '../types'
import { getUserProfile } from '../lib/auth'
import { acceptFollowRequest, getPendingRequests, rejectFollowRequest } from '../lib/social'

interface Props {
  myUid: string
  onClose: () => void
}

interface Request {
  follow: FollowDoc
  profile: UserProfile
}

export function FollowRequestsPage({ myUid, onClose }: Props) {
  const [requests, setRequests] = useState<Request[] | null>(null)

  async function load() {
    const pending = await getPendingRequests(myUid)
    const withProfiles = await Promise.all(
      pending.map(async (follow) => {
        const profile = await getUserProfile(follow.followerUid)
        return profile ? { follow, profile } : null
      }),
    )
    setRequests(withProfiles.filter((r): r is Request => r !== null))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUid])

  async function handleAccept(followerUid: string) {
    await acceptFollowRequest(followerUid, myUid)
    load()
  }

  async function handleReject(followerUid: string) {
    await rejectFollowRequest(followerUid, myUid)
    load()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="font-semibold">Solicitações para seguir</h2>
        <button onClick={onClose} className="text-slate-400 text-sm">
          Fechar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {requests === null && <p className="text-slate-500 text-sm text-center mt-8">Carregando...</p>}
        {requests?.length === 0 && (
          <p className="text-slate-600 text-sm text-center mt-8">Nenhuma solicitação pendente.</p>
        )}
        {requests?.map(({ follow, profile }) => (
          <div key={follow.followerUid} className="flex items-center gap-3 bg-slate-900 rounded-xl p-2.5">
            <span className="w-11 h-11 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                profile.username.slice(0, 1).toUpperCase()
              )}
            </span>
            <span className="flex-1 min-w-0 font-medium truncate">@{profile.username}</span>
            <button
              onClick={() => handleAccept(follow.followerUid)}
              className="bg-cyan-500 text-slate-950 text-xs font-semibold rounded-lg px-3 py-1.5 shrink-0"
            >
              Aceitar
            </button>
            <button
              onClick={() => handleReject(follow.followerUid)}
              className="bg-slate-800 text-slate-300 text-xs font-medium rounded-lg px-3 py-1.5 shrink-0"
            >
              Recusar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
