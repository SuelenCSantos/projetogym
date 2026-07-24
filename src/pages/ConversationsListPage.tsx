import { useEffect, useState } from 'react'
import type { Conversation, UserProfile } from '../types'
import { getUserProfile } from '../lib/auth'
import { getConversations } from '../lib/chat'
import { ChatPage } from './ChatPage'

interface Props {
  myUid: string
  onClose: () => void
}

interface Row {
  conversation: Conversation
  other: UserProfile
}

export function ConversationsListPage({ myUid, onClose }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [openRow, setOpenRow] = useState<Row | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const conversations = await getConversations(myUid).catch(() => [])
      const withProfiles = await Promise.all(
        conversations.map(async (conversation) => {
          const otherUid = conversation.participants.find((p) => p !== myUid)
          if (!otherUid) return null
          const other = await getUserProfile(otherUid)
          return other ? { conversation, other } : null
        }),
      )
      if (!cancelled) setRows(withProfiles.filter((r): r is Row => r !== null))
    }
    load()
    return () => {
      cancelled = true
    }
  }, [myUid])

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="font-semibold">Mensagens</h2>
        <button onClick={onClose} className="text-slate-400 text-sm">
          Fechar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {rows === null && <p className="text-slate-500 text-sm text-center mt-8">Carregando...</p>}
        {rows?.length === 0 && (
          <p className="text-slate-600 text-sm text-center mt-8">
            Nenhuma conversa ainda. Abra o perfil de alguém e toque em "Mensagem".
          </p>
        )}
        {rows?.map(({ conversation, other }) => (
          <button
            key={conversation.id}
            onClick={() => setOpenRow({ conversation, other })}
            className="w-full flex items-center gap-3 bg-slate-900 rounded-xl p-2.5 text-left"
          >
            <span className="w-11 h-11 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
              {other.photoURL ? (
                <img src={other.photoURL} alt={other.username} className="w-full h-full object-cover" />
              ) : (
                other.username.slice(0, 1).toUpperCase()
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium truncate">@{other.username}</span>
              <span className="block text-xs text-slate-500 truncate">
                {conversation.lastMessageText || 'Diga oi 👋'}
              </span>
            </span>
          </button>
        ))}
      </div>

      {openRow && (
        <ChatPage
          conversationId={openRow.conversation.id}
          myUid={myUid}
          otherProfile={openRow.other}
          onClose={() => setOpenRow(null)}
        />
      )}
    </div>
  )
}
