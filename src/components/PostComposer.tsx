import { useState } from 'react'
import type { Post } from '../types'
import { createPost } from '../lib/social'
import { compressImage, getVideoDuration } from '../lib/media'

interface Props {
  authorUid: string
  onClose: () => void
  onCreated: (post: Post) => void
}

const MAX_VIDEO_SECONDS = 60

export function PostComposer({ authorUid, onClose, onCreated }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    setError(null)

    const type = picked.type.startsWith('video/') ? 'video' : 'photo'
    if (type === 'video') {
      const duration = await getVideoDuration(picked).catch(() => null)
      if (duration !== null && duration > MAX_VIDEO_SECONDS) {
        setError(`O vídeo precisa ter até ${MAX_VIDEO_SECONDS} segundos.`)
        return
      }
    }

    setMediaType(type)
    setFile(picked)
    setPreviewUrl(URL.createObjectURL(picked))
  }

  async function handlePublish() {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      let uploadFile = file
      if (mediaType === 'photo') {
        const blob = await compressImage(file, 1280)
        uploadFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
      }
      const post = await createPost(authorUid, uploadFile, mediaType, caption.trim())
      onCreated(post)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível publicar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="font-semibold">Novo post</h2>
        <button onClick={onClose} className="text-slate-400 text-sm">
          Cancelar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!previewUrl && (
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-slate-700 rounded-xl h-56 text-slate-400 text-sm cursor-pointer">
            📷 Escolher foto ou vídeo curto
            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFilePick} />
          </label>
        )}

        {previewUrl && mediaType === 'photo' && (
          <img src={previewUrl} alt="Prévia" className="w-full max-h-80 object-contain rounded-xl bg-black" />
        )}
        {previewUrl && mediaType === 'video' && (
          <video src={previewUrl} controls playsInline className="w-full max-h-80 rounded-xl bg-black" />
        )}

        {previewUrl && (
          <button
            onClick={() => {
              setFile(null)
              setPreviewUrl(null)
            }}
            className="text-xs text-slate-500"
          >
            Trocar mídia
          </button>
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Legenda (opcional)"
          rows={3}
          className="w-full bg-slate-900 rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 outline-none focus:ring-2 ring-cyan-500 resize-none"
        />

        {error && <p className="text-rose-400 text-sm">{error}</p>}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handlePublish}
          disabled={!file || busy}
          className="w-full bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold rounded-xl py-3"
        >
          {busy ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  )
}
