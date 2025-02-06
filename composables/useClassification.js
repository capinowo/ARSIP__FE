// composables/useClassification.js
import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"
import { ref } from 'vue'

export default function useClassification() {
  const isLoading = ref(false)
  const error = ref(null)

  const fetchClassification = async classificationId => {
    // console.log('Fetching classification for ID:', classificationId);  // Log to confirm ID

    const query = `
      query GetClassification($getClassificationId: Int!) {
        getClassification(id: $getClassificationId) {
          classification_code
          description
        }
      }
    `

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getSelectedRoleToken()}`,
        },
        body: JSON.stringify({
          query,
          variables: { getClassificationId: classificationId },
        }),
      })

      const result = await response.json()

      // console.log('API Response for Classification:', result);  // Log full API response

      if (result.errors) {
        console.error('GraphQL errors:', result.errors)
        
        return null
      }

      return result.data?.getClassification || null
    } catch (error) {
      console.error('Error fetching classification:', error)
      
      return null
    }
  }

  return { fetchClassification }
}
