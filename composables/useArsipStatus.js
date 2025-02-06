// composables/useArsipStatus.js
import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"
import { ref } from 'vue'

export default function useArsipStatus() {
  const isLoading = ref(false)
  const error = ref(null)

  const fetchArsipStatus = async archiveStatusId => {
    // console.log('Fetching archive status for ID:', archiveStatusId); // Debugging line

    const query = `
      query GetArchiveStatus($getArchiveStatusId: Int!) {
        getArchiveStatus(id: $getArchiveStatusId) {
          id
          name
        }
      }
    `

    try {
      isLoading.value = true

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getSelectedRoleToken()}`,
        },
        body: JSON.stringify({
          query,
          variables: { getArchiveStatusId: archiveStatusId },
        }),
      })

      const result = await response.json()

      // console.log('API Response for Archive Status:', result); // Debugging line

      if (result.errors) {
        console.error('GraphQL errors:', result.errors)
        error.value = result.errors
        
        return null
      }

      return result.data?.getArchiveStatus  || null
    } catch (err) {
      console.error('Error fetching archive status:', err)
      error.value = err
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { fetchArsipStatus, isLoading, error }
}
