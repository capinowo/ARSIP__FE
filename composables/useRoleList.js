import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from '@/utils/api'
import { ref } from 'vue'

export default function useRoleList() {
  const isLoading = ref(false)
  const error = ref(null)
  const roles = ref([])

  const fetchRoleList = async () => {
    const query = `
      query GetRoles {
        getRoles {
          data {
            id
            name
            description
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

      roles.value = result.data.getRoles.data
      
      return roles.value
    } catch (err) {
      console.error('Error fetching role list:', err)
      error.value = err
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { fetchRoleList, isLoading, error, roles }
}
