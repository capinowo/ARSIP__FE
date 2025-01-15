import { getSelectedRoleToken } from '@/middleware/auth'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLocationStore = defineStore('location', () => {
  const locations = ref([])
  const isLoading = ref(false)
  const totalLocations = ref(0)
  const error = ref(null)

  const fetchLocations = async () => {
    const query = `
      query {
        getLocations {
          data {
            id
            name
            building_name
          }
        }
      }
    `

    isLoading.value = true
    error.value = null

    try {
      const token = getSelectedRoleToken()
      if (!token) throw new Error('Invalid token')

      const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

      const result = await response.json()

      if (result.data && result.data.getLocations) {
        locations.value = result.data.getLocations.data
        totalLocations.value = locations.value.length
      } else {
        throw new Error('Invalid data structure received')
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  return { locations, fetchLocations, error, isLoading }
})
