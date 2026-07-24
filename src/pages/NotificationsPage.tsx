import { useEffect, useState } from 'react'
import type { AppNotification, UserProfile } from '../types'
import { getUserProfile } from '../lib/auth'
import { getNotifications, markAllNotificationsRead } from '../lib/notifications'

interface Props {
  myUid: string
  onClose: () => void
  onOpenUser: (profile: UserProfile) => void
  onOpenChat: (conversationId: string, otherProfile: UserProfile) => void
}

function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function NotificationRow({
  notification,
  onOpenUser,
  onOpenChat,
}: {
  notification: AppNotification
  onOpenUser: (p: UserProfile) => void
  onOpenChat: (conversationId: string, otherProfile: UserProfile) => void
}) {
  const [actor, setActor] = useState<UserProfile | null>(null)

  useEffect(() => {
    let cancelled = false
    getUserProfile(notification.actorUid).then((p) => {
      if (!cancelled) setActor(p)
    })
    return () => {
      cancelled = true
    }
  }, [notification.actorUid])

  const actionText =
    notification.type === 'like'
      ? 'curtiu seu post'
      : notification.type === 'comment'
        ? `comentou: "${notification.commentText}"`
        : 'te enviou uma mensagem'

  function handleClick() {
    if (!actor) return
    if (notification.type === 'message' && notification.conversationId) {
      onOpenChat(notification.conversationId, actor)
    } else {
      onOpenUser(actor)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!actor}
      className={`w-full flex items-center gap-3 rounded-xl p-2.5 text-left ${
        notification.read ? 'bg-slate-900' : 'bg-slate-800'
      }`}
    >
      <span className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
        {actor?.photoURL ? (
          <img src={actor.photoURL} alt={actor.username} className="w-full h-full object-cover" />
        ) : (
          actor?.username.slice(0, 1).toUpperCase() ?? '?'
        )}
      </span>
      <span className="min-w-0 flex-1 text-sm">
        <span className="font-medium">@{actor?.username ?? '...'}</span>{' '}
        <span className="text-slate-400">{actionText}</span>
      </span>
      <span className="text-xs text-slate-600 shrink-0">{timeAgo(notification.createdAt)}</span>
    </button>
  )
}

export function NotificationsPage({ myUid, onClose, onOpenUser, onOpenChat }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[] | null>(null)

  useEffect(() => {
    let cancelled = false
    getNotifications(myUid)
      .then((list) => {
        if (!cancelled) setNotifications(list)
      })
      .catch(() => {
        if (!cancelled) setNotifications([])
      })
    markAllNotificationsRead(myUid).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [myUid])

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="font-semibold">Notificações</h2>
        <button onClick={onClose} className="text-slate-400 text-sm">
          Fechar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {notifications === null && <p className="text-slate-500 text-sm text-center mt-8">Carregando...</p>}
        {notifications?.length === 0 && (
          <p className="text-slate-600 text-sm text-center mt-8">Nenhuma notificação ainda.</p>
        )}
        {notifications?.map((n) => (
          <NotificationRow key={n.id} notification={n} onOpenUser={onOpenUser} onOpenChat={onOpenChat} />
        ))}
      </div>
    </div>
  )
}
