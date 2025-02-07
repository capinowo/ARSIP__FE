import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from '@/utils/api'
import { ref } from 'vue'

export default function useUnitList() {
  const isLoading = ref(false)
  const error = ref(null)
  const units = ref([])

  const fetchUnitList = async () => {
    const query = `
      query Query {
        getUnits {
          data {
            id
            name
          }
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
        body: JSON.stringify({ query }),
      })

      const result = await response.json()

      if (result.errors) {
        console.error('GraphQL errors:', result.errors)
        error.value = result.errors
        
        return null
      }

      units.value = result.data.getUnits.data
      
      return units.value
    } catch (err) {
      console.error('Error fetching unit list:', err)
      error.value = err
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { fetchUnitList, isLoading, error, units }
}
