const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const cloudinaryConfigured = Boolean(cloudName && uploadPreset)

/**
 * Uploads a file straight from the browser to Cloudinary using an unsigned
 * upload preset - no API secret involved, so it's safe to call from client
 * code. Returns the public HTTPS URL of the uploaded file.
 */
export async function uploadToCloudinary(file: Blob, resourceType: 'image' | 'video'): Promise<string> {
  if (!cloudinaryConfigured) {
    throw new Error('Envio de mídia não configurado.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error?.message || 'Não foi possível enviar o arquivo.')
  }

  const data = await res.json()
  return data.secure_url as string
}
