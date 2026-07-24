/** Downscales an image client-side before upload, to keep Storage usage low. */
export async function compressImage(file: File, maxDim = 1080, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', quality)
  })
}

/** Reads a video file's duration (seconds) without uploading it. */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Não foi possível ler o vídeo'))
    }
    video.src = URL.createObjectURL(file)
  })
}
