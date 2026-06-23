export const uploadFileToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Falta configurar Cloudinary. Define VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en .env')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error?.message || 'Error subiendo el archivo a Cloudinary')
  }

  return {
    url: data.secure_url,
    type: file.type,
    size: file.size,
    name: file.name,
    provider_public_id: data.public_id,
  }
}
