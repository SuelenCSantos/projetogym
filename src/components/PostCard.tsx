import { useEffect, useState } from 'react'
import type { Post, UserProfile } from '../types'
import { getUserProfile } from '../lib/auth'

interface Props {
  post: Post
}

export function PostCard({ post }: Props) {
  const [author, setAuthor] = useState<UserProfile | null>(null)

  useEffect(() => {
    let cancelled = false
    getUserProfile(post.authorUid).then((p) => {
      if (!cancelled) setAuthor(p)
    })
    return () => {
      cancelled = true
    }
  }, [post.authorUid])

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

      {post.caption && <p className="p-3 text-sm text-slate-200">{post.caption}</p>}
    </div>
  )
}
