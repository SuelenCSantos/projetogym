import { useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { cropImage } from '../lib/media'

interface Props {
  imageSrc: string
  onCancel: () => void
  onCropped: (blob: Blob) => void
}

export function AvatarCropper({ imageSrc, onCancel, onCropped }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleConfirm() {
    if (!croppedAreaPixels) return
    setBusy(true)
    try {
      const blob = await cropImage(imageSrc, croppedAreaPixels)
      onCropped(blob)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="font-semibold">Ajustar foto</h2>
        <button onClick={onCancel} className="text-slate-400 text-sm">
          Cancelar
        </button>
      </div>

      <div className="relative flex-1 bg-black">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
        />
      </div>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <label className="flex items-center gap-3 text-slate-400 text-sm">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
        </label>
        <button
          onClick={handleConfirm}
          disabled={busy || !croppedAreaPixels}
          className="w-full bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold rounded-xl py-3"
        >
          {busy ? 'Aplicando...' : 'Usar esta foto'}
        </button>
      </div>
    </div>
  )
}
