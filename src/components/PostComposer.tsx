import { useState } from 'react'
import type { Post } from '../types'
import { createPost } from '../lib/social'
import { compressImage, getVideoDuration } from '../lib/media'
import { Toggle } from './Toggle'

interface Props {
  authorUid: string
  defaultAllowInteractions: boolean
  onClose: () => void
  onCreated: (post: Post) => void
}

const MAX_VIDEO_SECONDS = 60

export function PostComposer({ authorUid, defaultAllowInteractions, onClose, onCreated }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo')
  const [caption, setCaption] = useState('')
  const [allowInteractions, setAllowInteractions] = useState(defaultAllowInteractions)
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
      const post = await createPost(authorUid, uploadFile, mediaType, caption.trim(), allowInteractions)
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
          <div className="grid grid-cols-1 gap-2">
            <label className="flex items-center justify-center gap-2 border border-dashed border-slate-700 rounded-xl h-16 text-slate-300 text-sm cursor-pointer">
              📷 Tirar foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFilePick}
              />
            </label>
            <label className="flex items-center justify-center gap-2 border border-dashed border-slate-700 rounded-xl h-16 text-slate-300 text-sm cursor-pointer">
              🎥 Gravar vídeo
              <input
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={handleFilePick}
              />
            </label>
            <label className="flex items-center justify-center gap-2 border border-dashed border-slate-700 rounded-xl h-16 text-slate-400 text-sm cursor-pointer">
              🖼️ Escolher da galeria
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFilePick}
              />
            </label>
          </div>
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

        <Toggle
          checked={allowInteractions}
          onChange={setAllowInteractions}
          label="Permitir reações e comentários"
          description="Deixa quem vê este post curtir e comentar"
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
