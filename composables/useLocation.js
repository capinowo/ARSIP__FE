// composables/useLocation.js
import { getSelectedRoleToken } from '@/middleware/auth';
import { ref } from 'vue';

export default function useLocation() {
  const isLoading = ref(false);
  const error = ref(null);

  const fetchLocation = async (locationId) => {
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
    `;

    try {
      const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getSelectedRoleToken()}`,
        },
        body: JSON.stringify({
          query,
          variables: { getLocationId: locationId },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return null;
      }

      return result.data?.getLocation || null;
    } catch (error) {
      console.error('Error fetching location:', error);
      return null;
    }
  };

  return { fetchLocation };
}
