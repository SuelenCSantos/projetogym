import { useEffect, useState } from 'react'
import type { FollowStatus, Post, UserProfile } from '../types'
import { useAuthContext } from '../lib/AuthContext'
import {
  countFollowers,
  countFollowing,
  followUser,
  getFollowStatus,
  getUserPosts,
  unfollowUser,
} from '../lib/social'
import { FollowListModal } from '../components/FollowListModal'
import { PostGrid } from '../components/PostGrid'

interface Props {
  profile: UserProfile
  onClose: () => void
  onOpenUser: (profile: UserProfile) => void
}

export function UserProfilePage({ profile, onClose, onOpenUser }: Props) {
  const { user } = useAuthContext()
  const [followStatus, setFollowStatus] = useState<FollowStatus | null | undefined>(undefined)
  const [followers, setFollowers] = useState<number | null>(null)
  const [following, setFollowing] = useState<number | null>(null)
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [listOpen, setListOpen] = useState<'followers' | 'following' | null>(null)

  useEffect(() => {
    if (!user) return
    getFollowStatus(user.uid, profile.uid)
      .then(setFollowStatus)
      .catch(() => setFollowStatus(null))
    countFollowers(profile.uid)
      .then(setFollowers)
      .catch(() => setFollowers(0))
    countFollowing(profile.uid)
      .then(setFollowing)
      .catch(() => setFollowing(0))
  }, [user, profile.uid])

  useEffect(() => {
    if (followStatus === undefined) return
    const canView = !profile.isPrivate || followStatus === 'accepted'
    if (canView) {
      getUserPosts(profile.uid)
        .then(setPosts)
        .catch(() => setPosts([]))
    }
  }, [followStatus, profile.uid, profile.isPrivate])

  async function handleFollowToggle() {
    if (!user || busy) return
    setBusy(true)
    try {
      if (followStatus === 'accepted' || followStatus === 'pending') {
        await unfollowUser(user.uid, profile.uid)
        setFollowStatus(null)
        if (followStatus === 'accepted') setFollowers((n) => (n ?? 1) - 1)
      } else {
        const doc = await followUser(user.uid, profile)
        setFollowStatus(doc.status)
        if (doc.status === 'accepted') setFollowers((n) => (n ?? 0) + 1)
      }
    } finally {
      setBusy(false)
    }
  }

  const canViewPosts = !profile.isPrivate || followStatus === 'accepted'
  const buttonLabel =
    followStatus === 'accepted' ? 'Seguindo' : followStatus === 'pending' ? 'Solicitado' : 'Seguir'

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 shrink-0">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-900 text-slate-300"
        >
          ←
        </button>
        <h2 className="font-semibold">@{profile.username}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col items-center pt-4 pb-4">
          <span className="w-24 h-24 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-3xl text-slate-500">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              profile.username.slice(0, 1).toUpperCase()
            )}
          </span>

          <h2 className="mt-3 font-semibold text-lg">@{profile.username}</h2>
          {profile.displayName && profile.displayName !== profile.username && (
            <p className="text-slate-500 text-sm">{profile.displayName}</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className="bg-orange-950 text-orange-300 text-sm px-3 py-1 rounded-full">
              🔥 {profile.currentStreak} {profile.currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}
            </span>
            {profile.isPrivate && (
              <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded-full">Privada</span>
            )}
          </div>

          <div className="flex items-center gap-6 mt-4">
            <button className="text-center" onClick={() => setListOpen('followers')}>
              <div className="font-semibold">{followers ?? '···'}</div>
              <div className="text-xs text-slate-500">seguidores</div>
            </button>
            <button className="text-center" onClick={() => setListOpen('following')}>
              <div className="font-semibold">{following ?? '···'}</div>
              <div className="text-xs text-slate-500">seguindo</div>
            </button>
          </div>

          <button
            onClick={handleFollowToggle}
            disabled={busy || followStatus === undefined}
            className={`mt-4 text-sm font-medium rounded-lg px-5 py-2 disabled:opacity-50 ${
              followStatus === 'accepted' || followStatus === 'pending'
                ? 'bg-slate-800 text-slate-100'
                : 'bg-cyan-500 text-slate-950'
            }`}
          >
            {buttonLabel}
          </button>
        </div>

        {canViewPosts ? (
          <PostGrid posts={posts} />
        ) : (
          <p className="text-center text-slate-600 text-sm py-8">
            🔒 Conta privada. Siga @{profile.username} para ver os posts e a sequência de treino.
          </p>
        )}
      </div>

      {listOpen && (
        <FollowListModal
          uid={profile.uid}
          kind={listOpen}
          onClose={() => setListOpen(null)}
          onSelectUser={onOpenUser}
        />
      )}
    </div>
  )
}
