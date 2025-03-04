// composables/useApprovalStatus.js
import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"
import { ref } from 'vue'

export default function useApprovalStatus() {
  const isLoading = ref(false)
  const error = ref(null)

  const fetchApprovalStatus = async approvalStatusId => {
    // console.log('Fetching approval status for ID:', approvalStatusId); // Debugging line

    const query = `
      query GetApprovalStatus($getApprovalStatusId: Int!) {
        getApprovalStatus(id: $getApprovalStatusId) {
          id
          name
          created_at
          updated_at
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
          variables: { getApprovalStatusId: approvalStatusId },
        }),
      })

      const result = await response.json()

      // console.log('API Response for Approval Status:', result); // Debugging line

      if (result.errors) {
        console.error('GraphQL errors:', result.errors)
        error.value = result.errors

        return null
      }

      return result.data?.getApprovalStatus || null
    } catch (err) {
      console.error('Error fetching approval status:', err)
      error.value = err

      return null
    } finally {
      isLoading.value = false
    }
  }

  return { fetchApprovalStatus, isLoading, error }
}
