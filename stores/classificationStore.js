import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useClassificationStore = defineStore('classification', () => {
  const classifications = ref([])
  const isLoading = ref(false)
  const totalClassifications = ref(0)
  const error = ref(null)

  const fetchClassifications = async () => {
    const query = `
      query {
        getClassifications {
          data {
            id
            classification_code
            description
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

      if (result.data && result.data.getClassifications) {
        classifications.value = result.data.getClassifications.data
        totalClassifications.value = classifications.value.length
      } else {
        throw new Error('Invalid data structure received')
      }
    } catch (err) {
      console.error('Error fetching classifications:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  return { classifications, fetchClassifications, error }
})
