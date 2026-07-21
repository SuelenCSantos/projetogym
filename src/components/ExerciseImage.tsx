import { useEffect, useState } from 'react'
import { imageUrl } from '../lib/exercises'

interface Props {
  images: string[]
  alt: string
  className?: string
  animate?: boolean
}

export function ExerciseImage({ images, alt, className, animate = true }: Props) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!animate || images.length < 2) return
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % images.length)
    }, 900)
    return () => clearInterval(id)
  }, [animate, images.length])

  if (images.length === 0) {
    return (
      <div className={`bg-slate-800 flex items-center justify-center text-slate-600 text-xs ${className}`}>
        sem imagem
      </div>
    )
  }

  return (
    <img
      src={imageUrl(images[frame])}
      alt={alt}
      loading="lazy"
      className={`object-cover bg-slate-800 ${className}`}
    />
  )
}
