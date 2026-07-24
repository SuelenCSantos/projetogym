import { useEffect, useState } from 'react'
import type { Comment, UserProfile } from '../types'
import { getUserProfile } from '../lib/auth'
import { addComment, getComments } from '../lib/social'

interface Props {
  postId: string
  viewerUid: string
  onClose: () => void
  onCommentAdded: () => void
}

function CommentRow({ comment }: { comment: Comment }) {
  const [author, setAuthor] = useState<UserProfile | null>(null)

  useEffect(() => {
    let cancelled = false
    getUserProfile(comment.authorUid).then((p) => {
      if (!cancelled) setAuthor(p)
    })
    return () => {
      cancelled = true
    }
  }, [comment.authorUid])

  return (
    <div className="flex items-start gap-2.5">
      <span className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-xs text-slate-500">
        {author?.photoURL ? (
          <img src={author.photoURL} alt={author.username} className="w-full h-full object-cover" />
        ) : (
          author?.username.slice(0, 1).toUpperCase() ?? '?'
        )}
      </span>
      <div className="min-w-0">
        <span className="text-sm">
          <span className="font-medium">@{author?.username ?? '...'}</span>{' '}
          <span className="text-slate-300">{comment.text}</span>
        </span>
      </div>
    </div>
  )
}

export function CommentsModal({ postId, viewerUid, onClose, onCommentAdded }: Props) {
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const list = await getComments(postId).catch(() => [])
    setComments(list)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      await addComment(postId, viewerUid, trimmed)
      setText('')
      await load()
      onCommentAdded()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="font-semibold">Comentários</h2>
        <button onClick={onClose} className="text-slate-400 text-sm">
          Fechar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments === null && <p className="text-slate-500 text-sm text-center mt-8">Carregando...</p>}
        {comments?.length === 0 && (
          <p className="text-slate-600 text-sm text-center mt-8">Nenhum comentário ainda.</p>
        )}
        {comments?.map((c) => (
          <CommentRow key={c.id} comment={c} />
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escreva um comentário..."
          className="flex-1 bg-slate-900 rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 outline-none focus:ring-2 ring-cyan-500"
        />
        <button
          onClick={handleSend}
          disabled={busy || !text.trim()}
          className="bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold rounded-lg px-4 py-2.5 text-sm"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
