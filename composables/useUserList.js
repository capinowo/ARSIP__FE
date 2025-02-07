import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from '@/utils/api'
import { ref } from 'vue'

export default function useUserList() {
  const isLoading = ref(false)
  const error = ref(null)
  const users = ref([])

  const fetchUserList = async () => {
    const query = `
      query GetUsers {
        getUsers {
          data {
            id
            name
            identity
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

      users.value = result.data.getUsers.data
      
      return users.value
    } catch (err) {
      console.error('Error fetching user list:', err)
      error.value = err
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { fetchUserList, isLoading, error, users }
}
