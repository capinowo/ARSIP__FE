import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRetentionDispositionStore = defineStore('retentionDisposition', () => {
  const retentions = ref([])
  const isLoading = ref(false)
  const totalRetentions = ref(0)
  const error = ref(null)

  const fetchRetentions = async () => {
    const query = `
      query {
        getRetentionDispositions {
          data {
            id
            name
            created_at
            updated_at
          }
        }
      }
    `

    isLoading.value = true
    error.value = null

    try {
      const token = getSelectedRoleToken()
      if (!token) throw new Error('Invalid token')

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

      const result = await response.json()

      // console.log('GraphQL response:', result) 

      if (result.data && result.data.getRetentionDispositions) {
        retentions.value = result.data.getRetentionDispositions.data
        totalRetentions.value = retentions.value.length
      } else {
        throw new Error('Invalid data structure received')
      }
    } catch (err) {
      console.error('Error fetching retentions:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  return { retentions, fetchRetentions, error }
})
