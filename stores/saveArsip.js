import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"

export async function saveArsip(data) {
  try {
    const token = getSelectedRoleToken()
    if (!token) {
      throw new Error('Token tidak ditemukan. Pastikan pengguna sudah login.')
    }

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation Mutation($data: ArchiveCreateInput!) {
            createArchive(data: $data) {
              id
              archive_status_id
              archive_type_id
              classification_id
              created_at
              description
              document_path
              location_id
              title
              unit_id
              user_id
            }
          }
        `,
        variables: { data },
      }),
    })

    const result = await response.json()
    if (result.errors) {
      const uniqueConstraintError = result.errors.find(error => error.message.includes('Unique constraint failed'))
      if (uniqueConstraintError) {
        return { error: 'Judul arsip sudah ada. Silakan gunakan judul yang berbeda.' }
      }
      throw result.errors
    }

    console.log('Archive saved successfully:', result.data.createArchive)
    
    return result.data.createArchive
  } catch (error) {
    console.error('Error saving archive:', error)
    throw error
  }
}
