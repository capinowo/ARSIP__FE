import { getSelectedRoleToken } from '@/middleware/auth';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUnitStore = defineStore('unit', () => {
  const units = ref([]);
  const isLoading = ref(false);
  const totalUnits = ref(0);
  const error = ref(null);

  const fetchUnits = async () => {
    const query = `
      query {
        getUnits {
          data {
            id
            name
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

      if (result.data && result.data.getUnits) {
        units.value = result.data.getUnits.data;
        totalUnits.value = units.value.length;
      } else {
        throw new Error('Invalid data structure received');
      }
    } catch (err) {
      console.error('Error fetching units:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  return { units, fetchUnits, error, isLoading };
});
