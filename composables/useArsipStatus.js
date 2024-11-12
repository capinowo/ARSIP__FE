// composables/useArsipStatus.js
import { getSelectedRoleToken } from '@/middleware/auth';
import { ref } from 'vue';

export default function useArsipStatus() {
  const isLoading = ref(false);
  const error = ref(null);

  const fetchArsipStatus = async (archiveStatusId) => {
    // console.log('Fetching archive status for ID:', archiveStatusId); // Debugging line

    const query = `
      query GetArchiveStatus($getArchiveStatusId: Int!) {
        getArchiveStatus(id: $getArchiveStatusId) {
          id
          name
        }
      }
    `;

    try {
      isLoading.value = true;
      const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getSelectedRoleToken()}`,
        },
        body: JSON.stringify({
          query,
          variables: { getArchiveStatusId: archiveStatusId },
        }),
      });

      const result = await response.json();
      // console.log('API Response for Archive Status:', result); // Debugging line

      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        error.value = result.errors;
        return null;
      }

      return result.data?.getArchiveStatus  || null;
    } catch (err) {
      console.error('Error fetching archive status:', err);
      error.value = err;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return { fetchArsipStatus, isLoading, error };
}
