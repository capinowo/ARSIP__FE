import { getSelectedRoleToken } from '@/middleware/auth'

export async function uploadFileArchive(archiveId, file) {
  if (!file) return // Jika tidak ada file, keluar dari fungsi

  const formData = new FormData()

  formData.append('operations', JSON.stringify({
    query: `
      mutation UploadFileArchive($uploadFileArchiveId: Int!, $file: Upload) {
        uploadFileArchive(id: $uploadFileArchiveId, file: $file) {
          id
        }
      }
    `,
    variables: {
      uploadFileArchiveId: archiveId,
      file: null,
    },
  }))

  formData.append('map', JSON.stringify({ "0": ["variables.file"] }))
  formData.append('0', file)

  try {
    const token = getSelectedRoleToken()

    const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
