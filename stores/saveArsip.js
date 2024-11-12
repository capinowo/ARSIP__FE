import { getSelectedRoleToken } from '@/middleware/auth.js';

export async function saveArsip(data) {
  try {
    // Mendapatkan token dari middleware
    const token = getSelectedRoleToken();
    
    // Periksa apakah token ada
    if (!token) {
      throw new Error('Token tidak ditemukan. Pastikan pengguna sudah login.');
    }

    const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Menambahkan token ke header Authorization
      },
      body: JSON.stringify({
        query: `
          mutation Mutation($data: ArchiveCreateInput!) {
            createArchive(data: $data) {
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
    });

    const result = await response.json();
    
    // Cek jika ada error dari server GraphQL
    if (result.errors) {
      console.error('Error saving archive:', result.errors);
    } else {
      console.log('Archive saved successfully:', result.data.createArchive);
      return result.data.createArchive; // Jika diperlukan untuk diproses lebih lanjut
    }
  } catch (error) {
    console.error('Error during API request:', error);
  }
}
