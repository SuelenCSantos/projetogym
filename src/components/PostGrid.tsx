import type { Post } from '../types'

interface Props {
  posts: Post[] | null
}

export function PostGrid({ posts }: Props) {
  if (posts === null) {
    return <p className="text-slate-500 text-sm text-center py-8">Carregando posts...</p>
  }
  if (posts.length === 0) {
    return <p className="text-slate-600 text-sm text-center py-8">Nenhum post ainda.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-1 mt-2">
      {posts.map((post) => (
        <div key={post.id} className="aspect-square bg-slate-900 relative overflow-hidden">
          {post.mediaType === 'photo' ? (
            <img src={post.mediaURL} alt={post.caption} className="w-full h-full object-cover" />
          ) : (
            <>
              <video src={post.mediaURL} muted playsInline className="w-full h-full object-cover" />
              <span className="absolute top-1 right-1 text-xs">▶️</span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
