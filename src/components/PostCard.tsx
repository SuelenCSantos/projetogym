import { useEffect, useState } from 'react'
import type { Post, UserProfile } from '../types'
import { getUserProfile } from '../lib/auth'
import { countComments, countLikes, hasLiked, toggleLike } from '../lib/social'
import { CommentsModal } from './CommentsModal'
import { LikesModal } from './LikesModal'

interface Props {
  post: Post
  viewerUid: string
  onOpenUser: (profile: UserProfile) => void
}

export function PostCard({ post, viewerUid, onOpenUser }: Props) {
  const [author, setAuthor] = useState<UserProfile | null>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState<number | null>(null)
  const [commentCount, setCommentCount] = useState<number | null>(null)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [likesOpen, setLikesOpen] = useState(false)

  const interactionsEnabled = post.allowInteractions !== false

  useEffect(() => {
    let cancelled = false
    getUserProfile(post.authorUid).then((p) => {
      if (!cancelled) setAuthor(p)
    })
    return () => {
      cancelled = true
    }
  }, [post.authorUid])

  useEffect(() => {
    if (!interactionsEnabled) return
    hasLiked(post.id, viewerUid)
      .then(setLiked)
      .catch(() => {})
    countLikes(post.id)
      .then(setLikeCount)
      .catch(() => setLikeCount(0))
    countComments(post.id)
      .then(setCommentCount)
      .catch(() => setCommentCount(0))
  }, [post.id, viewerUid, interactionsEnabled])

  async function handleToggleLike() {
    const next = !liked
    setLiked(next)
    setLikeCount((n) => (n ?? 0) + (next ? 1 : -1))
    try {
      await toggleLike(post.id, viewerUid, post.authorUid)
    } catch {
      setLiked(!next)
      setLikeCount((n) => (n ?? 0) + (next ? -1 : 1))
    }
  }

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 p-3">
        <span className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-xs text-slate-500">
          {author?.photoURL ? (
            <img src={author.photoURL} alt={author.username} className="w-full h-full object-cover" />
          ) : (
            author?.username.slice(0, 1).toUpperCase() ?? '?'
          )}
        </span>
        <span className="font-medium text-sm">@{author?.username ?? '...'}</span>
        <span className="text-xs text-slate-600 ml-auto">
          {new Date(post.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </span>
      </div>

      {post.mediaType === 'photo' ? (
        <img src={post.mediaURL} alt={post.caption} className="w-full max-h-[420px] object-cover bg-black" />
      ) : (
        <video src={post.mediaURL} controls playsInline className="w-full max-h-[420px] bg-black" />
      )}

      {post.caption && <p className="p-3 pb-1.5 text-sm text-slate-200">{post.caption}</p>}

      {interactionsEnabled && (
        <div className="flex items-center gap-4 px-3 py-2.5 text-sm text-slate-400">
          <button onClick={handleToggleLike} aria-label="Curtir">
            <span className={liked ? 'text-rose-500' : ''}>{liked ? '❤️' : '🤍'}</span>
          </button>
          <button
            onClick={() => likeCount && likeCount > 0 && setLikesOpen(true)}
            className="hover:underline"
          >
            {likeCount ?? '···'} {likeCount === 1 ? 'curtida' : 'curtidas'}
          </button>
          <button onClick={() => setCommentsOpen(true)} className="flex items-center gap-1.5 ml-auto">
            <span>💬</span>
            <span>{commentCount ?? '···'}</span>
          </button>
        </div>
      )}

      {commentsOpen && (
        <CommentsModal
          postId={post.id}
          postAuthorUid={post.authorUid}
          viewerUid={viewerUid}
          onClose={() => setCommentsOpen(false)}
          onCommentAdded={() => setCommentCount((n) => (n ?? 0) + 1)}
          onOpenUser={onOpenUser}
        />
      )}
      {likesOpen && (
        <LikesModal postId={post.id} onClose={() => setLikesOpen(false)} onSelectUser={onOpenUser} />
      )}
    </div>
  )
}
