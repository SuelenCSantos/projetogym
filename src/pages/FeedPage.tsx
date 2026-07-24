import { useEffect, useState } from 'react'
import type { Post } from '../types'
import { useAuthContext } from '../lib/AuthContext'
import { getFeedPosts, getFollowingIds } from '../lib/social'
import { PostCard } from '../components/PostCard'
import { PostComposer } from '../components/PostComposer'

export function FeedPage() {
  const { profile } = useAuthContext()
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [composing, setComposing] = useState(false)

  async function load() {
    if (!profile) return
    try {
      const followingIds = await getFollowingIds(profile.uid)
      const feed = await getFeedPosts([...followingIds, profile.uid])
      setPosts(feed)
    } catch {
      setPosts([])
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid])

  if (!profile) return null

  return (
    <div className="flex flex-col h-full relative">
      <header className="px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-xl font-bold">Feed</h1>
        <p className="text-slate-500 text-sm">Fotos e vídeos de quem você segue</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3">
        {posts === null && <p className="text-slate-500 text-sm text-center mt-8">Carregando...</p>}
        {posts?.length === 0 && (
          <p className="text-slate-600 text-sm text-center mt-8">
            Nada por aqui ainda. Siga alguém ou publique seu primeiro post.
          </p>
        )}
        {posts?.map((post) => <PostCard key={post.id} post={post} />)}
      </div>

      <button
        onClick={() => setComposing(true)}
        className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-cyan-500 text-slate-950 text-2xl flex items-center justify-center shadow-lg"
        aria-label="Novo post"
      >
        +
      </button>

      {composing && (
        <PostComposer
          authorUid={profile.uid}
          onClose={() => setComposing(false)}
          onCreated={(post) => {
            setPosts((prev) => [post, ...(prev ?? [])])
            setComposing(false)
          }}
        />
      )}
    </div>
  )
}
