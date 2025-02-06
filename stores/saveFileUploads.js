
import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"


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
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGVzIjpbImFkbWluIiwib3BlcmF0b3IiLCJvcGVyYXRvcl91a18xIiwicGltcGluYW4iLCJwaW1waW5hbl91a18xIiwic3lzdGVtIiwidmVyaWZpa2F0b3IiXSwic2VsZWN0ZWRSb2xlIjp7ImlkIjoxLCJuYW1lIjoic3lzdGVtIiwiZGVzY3JpcHRpb24iOiJTeXN0ZW0gcm9sZSIsImNyZWF0ZWRfYXQiOiIyMDI1LTAyLTA1VDA4OjU0OjI2LjQxOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wMi0wNVQwODo1NDoyNi40MTlaIn0sInBlcm1pc3Npb25zIjpbImFjY2Vzcy1jb250cm9sIl0sInNlbGVjdGVkVW5pdCI6eyJpZCI6MSwiY29kZW5hbWUiOiJCS0IiLCJuYW1lIjoiQktCIiwiZGVzY3JpcHRpb24iOiJEU1RJIiwiY3JlYXRlZF9hdCI6IjIwMjUtMDItMDVUMTY6MDk6MjguMDAwWiIsInVwZGF0ZWRfYXQiOiIyMDI1LTAyLTA1VDE2OjA5OjI5LjAwMFoifSwiaWF0IjoxNzM4ODA2ODI4LCJleHAiOjE3Mzg4MTA0Mjh9.EYUCipE7FZhB529DXpVZLTtyw1ECoFQPIInnsFlENrE"

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
