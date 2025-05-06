export async function saveFileUploadLocal(archiveId, file) {
  if (!file) {
    console.warn('Tidak ada file yang diunggah.')
    return null // atau bisa juga `throw new Error("File tidak ditemukan")` tergantung kebutuhan
  }

  const formData = new FormData()

  formData.append(
    'operations',
    JSON.stringify({
      query: `
        mutation UploadFileArchiveLocal($id: Int!, $file: Upload!) {
          uploadFileArchiveLocal(id: $id, file: $file) {
            id
            document_path
          }
        }
      `,
      variables: {
        id: archiveId,
        file: null,
      },
    })
  )

  formData.append('map', JSON.stringify({ '1': ['variables.file'] }))
  formData.append('1', file)

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    body: formData,
  })

  const result = await response.json()

  if (result.errors) {
    throw new Error(result.errors[0].message)
  }

  return result.data.uploadFileArchiveLocal
}
