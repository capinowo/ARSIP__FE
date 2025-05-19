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
              title
              description
              classification_id
              document_path
              document_date
              archive_status_id
              archive_type_id
              unit_id
              location_id
              user_id
              approval_status_id
              created_at
              updated_at
              jumlah_arsip
              media_arsip
              tingkat_perkembangan
              final_retensi_aktif
              final_retensi_inaktif
              nilai_guna
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
