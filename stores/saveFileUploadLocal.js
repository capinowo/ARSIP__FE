import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"

export async function saveFileUploadLocal(archiveId, file) {
  if (!file) return // Jika tidak ada file, keluar dari fungsi

  const formData = new FormData()

  const currentDate = new Date()
  const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`
  const fileName = `${file.name.split('.')[0]}-${formattedDate}.${file.name.split('.').pop()}`

  formData.append('file', new File([file], fileName))
  formData.append('archive_id', archiveId)

  try {
    const response = await fetch(`${BASE_URL}/upload-local`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getSelectedRoleToken()}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Upload failed')
    }

    const result = await response.json()
    console.log('File uploaded locally:', result)

    return result
  } catch (error) {
    console.error('Upload to local failed:', error)
    throw error
  }
}
