import { useEffect, useRef, useState } from 'react'
import type { Message, UserProfile } from '../types'
import { sendMessage, subscribeToMessages } from '../lib/chat'

interface Props {
  conversationId: string
  myUid: string
  otherProfile: UserProfile
  onClose: () => void
}

export function ChatPage({ conversationId, myUid, otherProfile, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = subscribeToMessages(conversationId, setMessages)
    return unsub
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    setText('')
    try {
      await sendMessage(conversationId, myUid, trimmed)
    } finally {
      setSending(false)
    }
  }

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
        <span className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-xs text-slate-500">
          {otherProfile.photoURL ? (
            <img
              src={otherProfile.photoURL}
              alt={otherProfile.username}
              className="w-full h-full object-cover"
            />
          ) : (
            otherProfile.username.slice(0, 1).toUpperCase()
          )}
        </span>
        <h2 className="font-semibold">@{otherProfile.username}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-slate-600 text-sm text-center mt-8">Diga oi para @{otherProfile.username} 👋</p>
        )}
        {messages.map((m) => {
          const mine = m.senderUid === myUid
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <span
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-100'
                }`}
              >
                {m.text}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-slate-800 flex items-center gap-2 shrink-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Mensagem..."
          className="flex-1 bg-slate-900 rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 outline-none focus:ring-2 ring-cyan-500"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold rounded-lg px-4 py-2.5 text-sm"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
