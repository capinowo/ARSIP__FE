import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"

export async function uploadFileArchive(archiveId, file) {
  if (!file) return // Jika tidak ada file, keluar dari fungsi

  const formData = new FormData()

  const currentDate = new Date()
  const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`
  const fileName = `${file.name.split('.')[0]}-${formattedDate}.${file.name.split('.').pop()}`

  formData.append('operations', JSON.stringify({
    query: `
      mutation UploadFileArchive($uploadFileArchiveId: Int!, $file: Upload) {
        uploadFileArchive(id: $uploadFileArchiveId, file: $file) {
          id
          document_path
        }
      }
    `,
    variables: {
      uploadFileArchiveId: archiveId,
      file: null,
    },
  }))

  formData.append('map', JSON.stringify({ "0": ["variables.file"] }))
  formData.append('0', new File([file], fileName))

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getSelectedRoleToken()}`,
        'apollo-require-preflight': 'true',
        'x-apollo-operation-name': 'uploadFileArchive',
      },
      body: formData,
    })

    const result = await response.json()
    if (result.errors) {
      throw result.errors
    }

    console.log('File uploaded successfully:', result.data.uploadFileArchive)
    
    return result.data.uploadFileArchive
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}
