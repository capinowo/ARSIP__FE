import { getSelectedRoleToken } from '@/middleware/auth';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStatusStore = defineStore('status', () => {
  const statuses = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const fetchStatuses = async () => {
    const query = `
      query Data {
        getArchiveStatuses {
          data {
            name
            id
          }
        }
      }
    `;

    isLoading.value = true;
    error.value = null;

    try {
      const token = getSelectedRoleToken();
      if (!token) throw new Error('Invalid token');

      const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const result = await response.json();

      if (result.data && result.data.getArchiveStatuses) {
        statuses.value = result.data.getArchiveStatuses.data;
      } else {
        throw new Error('Invalid data structure received');
      }
    } catch (err) {
      console.error('Error fetching statuses:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  return { statuses, fetchStatuses, error };
});
