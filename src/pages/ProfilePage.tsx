import { useEffect, useRef, useState } from 'react'
import type { Post, UserProfile } from '../types'
import { useAuthContext } from '../lib/AuthContext'
import { signOutUser, updateProfileFields } from '../lib/auth'
import { countFollowers, countFollowing, getPendingRequests, getUserPosts } from '../lib/social'
import { uploadToCloudinary } from '../lib/cloudinary'
import { getAllSessions } from '../lib/db'
import { computeStreak } from '../lib/streak'
import { countUnreadNotifications } from '../lib/notifications'
import { EditProfileModal } from '../components/EditProfileModal'
import { FollowListModal } from '../components/FollowListModal'
import { UserSearchModal } from '../components/UserSearchModal'
import { PostGrid } from '../components/PostGrid'
import { AvatarCropper } from '../components/AvatarCropper'
import { UserProfilePage } from './UserProfilePage'
import { FollowRequestsPage } from './FollowRequestsPage'
import { ConversationsListPage } from './ConversationsListPage'
import { NotificationsPage } from './NotificationsPage'
import { ChatPage } from './ChatPage'

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuthContext()
  const [followers, setFollowers] = useState<number | null>(null)
  const [following, setFollowing] = useState<number | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [editing, setEditing] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [listOpen, setListOpen] = useState<'followers' | 'following' | null>(null)
  const [searching, setSearching] = useState(false)
  const [requestsOpen, setRequestsOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null)
  const [directChat, setDirectChat] = useState<{ conversationId: string; otherProfile: UserProfile } | null>(
    null,
  )
  const [avatarChoiceOpen, setAvatarChoiceOpen] = useState(false)
  const [pickedImageSrc, setPickedImageSrc] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!profile) return
    countFollowers(profile.uid)
      .then(setFollowers)
      .catch(() => setFollowers(0))
    countFollowing(profile.uid)
      .then(setFollowing)
      .catch(() => setFollowing(0))
    getUserPosts(profile.uid)
      .then(setPosts)
      .catch(() => setPosts([]))
    if (profile.isPrivate) {
      getPendingRequests(profile.uid)
        .then((r) => setPendingCount(r.length))
        .catch(() => setPendingCount(0))
    }
    countUnreadNotifications(profile.uid)
      .then(setUnreadNotifications)
      .catch(() => setUnreadNotifications(0))
  }, [profile])

  // O histórico local (IndexedDB) é a fonte da verdade da sequência de dias
  // treinados - o perfil só recebe uma cópia dela toda vez que é aberto, pra
  // não ficar desatualizado caso a sincronização de quando o treino foi
  // finalizado não tenha rodado (ex: treinos feitos antes de logar).
  useEffect(() => {
    if (!profile) return
    getAllSessions()
      .then((sessions) => {
        const streak = computeStreak(sessions)
        if (streak !== profile.currentStreak) {
          const trainedDates = sessions.filter((s) => s.finishedAt !== null).map((s) => s.date)
          const lastWorkoutDate = trainedDates.sort().at(-1) ?? null
          return updateProfileFields(profile.uid, { currentStreak: streak, lastWorkoutDate }).then(
            refreshProfile,
          )
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid])

  if (!user || !profile) {
    return <div className="p-4 text-slate-500">Carregando...</div>
  }

  function handlePhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarChoiceOpen(false)
    setPickedImageSrc(URL.createObjectURL(file))
    e.target.value = ''
  }

  async function handleCropped(blob: Blob) {
    if (!user) return
    setPickedImageSrc(null)
    setUploadingPhoto(true)
    setPhotoError(null)
    try {
      const url = await uploadToCloudinary(blob, 'image')
      await updateProfileFields(user.uid, { photoURL: url })
      await refreshProfile()
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Não foi possível enviar a foto.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-2 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold">Perfil</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setSearching(true)} className="text-slate-400" aria-label="Buscar pessoas">
            🔍
          </button>
          <button onClick={() => setMessagesOpen(true)} className="text-slate-400" aria-label="Mensagens">
            💬
          </button>
          <button
            onClick={() => {
              setNotificationsOpen(true)
              setUnreadNotifications(0)
            }}
            className="relative text-slate-400"
            aria-label="Notificações"
          >
            🔔
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
          <button onClick={() => signOutUser()} className="text-sm text-slate-500">
            Sair
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col items-center pt-2 pb-4">
          <button
            onClick={() => setAvatarChoiceOpen(true)}
            className="w-24 h-24 rounded-full bg-slate-800 overflow-hidden relative"
          >
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-3xl text-slate-500">
                {profile.username.slice(0, 1).toUpperCase()}
              </span>
            )}
            {uploadingPhoto && (
              <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs">...</span>
            )}
          </button>
          {photoError && <p className="text-rose-400 text-xs mt-1.5">{photoError}</p>}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handlePhotoPick}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoPick}
          />

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

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setEditing(true)}
              className="bg-slate-800 text-slate-100 text-sm font-medium rounded-lg px-4 py-2"
            >
              Editar perfil
            </button>
            {profile.isPrivate && (
              <button
                onClick={() => setRequestsOpen(true)}
                className="relative bg-slate-800 text-slate-100 text-sm font-medium rounded-lg px-4 py-2"
              >
                Solicitações
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <PostGrid posts={posts} />
      </div>

      {avatarChoiceOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end"
          onClick={() => setAvatarChoiceOpen(false)}
        >
          <div className="w-full bg-slate-900 rounded-t-2xl p-4 space-y-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full bg-slate-800 text-slate-100 font-medium rounded-xl py-3"
            >
              📷 Tirar foto
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full bg-slate-800 text-slate-100 font-medium rounded-xl py-3"
            >
              🖼️ Escolher da galeria
            </button>
            <button
              onClick={() => setAvatarChoiceOpen(false)}
              className="w-full text-slate-500 text-sm py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {pickedImageSrc && (
        <AvatarCropper
          imageSrc={pickedImageSrc}
          onCancel={() => setPickedImageSrc(null)}
          onCropped={handleCropped}
        />
      )}
      {editing && (
        <EditProfileModal profile={profile} onSaved={refreshProfile} onClose={() => setEditing(false)} />
      )}
      {listOpen && (
        <FollowListModal
          uid={profile.uid}
          kind={listOpen}
          onClose={() => setListOpen(null)}
          onSelectUser={setViewingUser}
        />
      )}
      {searching && (
        <UserSearchModal
          excludeUid={profile.uid}
          onClose={() => setSearching(false)}
          onSelectUser={setViewingUser}
        />
      )}
      {requestsOpen && (
        <FollowRequestsPage
          myUid={profile.uid}
          onClose={() => {
            setRequestsOpen(false)
            getPendingRequests(profile.uid)
              .then((r) => setPendingCount(r.length))
              .catch(() => {})
          }}
        />
      )}
      {messagesOpen && <ConversationsListPage myUid={profile.uid} onClose={() => setMessagesOpen(false)} />}
      {notificationsOpen && (
        <NotificationsPage
          myUid={profile.uid}
          onClose={() => setNotificationsOpen(false)}
          onOpenUser={setViewingUser}
          onOpenChat={(conversationId, otherProfile) => setDirectChat({ conversationId, otherProfile })}
        />
      )}
      {directChat && (
        <ChatPage
          conversationId={directChat.conversationId}
          myUid={profile.uid}
          otherProfile={directChat.otherProfile}
          onClose={() => setDirectChat(null)}
        />
      )}
      {viewingUser && (
        <UserProfilePage
          profile={viewingUser}
          onClose={() => {
            setViewingUser(null)
            countFollowers(profile.uid)
              .then(setFollowers)
              .catch(() => {})
            countFollowing(profile.uid)
              .then(setFollowing)
              .catch(() => {})
          }}
          onOpenUser={setViewingUser}
        />
      )}
    </div>
  )
}
