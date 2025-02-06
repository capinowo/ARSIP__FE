// composables/useLocation.js
import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"
import { ref } from 'vue'

export default function useLocation() {
  const isLoading = ref(false)
  const error = ref(null)

  const fetchLocation = async locationId => {
    const query = `
      query GetLocation($getLocationId: Int!) {
        getLocation(id: $getLocationId) {
          name
          box_name
          building_name
          room_name
          unit {
            id
            name
          }
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
          variables: { getLocationId: locationId },
        }),
      })

      const result = await response.json()
      if (result.errors) {
        console.error('GraphQL errors:', result.errors)
        
        return null
      }

      return result.data?.getLocation || null
    } catch (error) {
      console.error('Error fetching location:', error)
      
      return null
    }
  }

  return { fetchLocation }
}
