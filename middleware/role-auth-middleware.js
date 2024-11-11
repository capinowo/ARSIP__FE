// middleware/roleAuthMiddleware.js
import { clearAuthToken, getAuthToken, getSelectedRoleToken, setSelectedRoleToken } from '@/middleware/auth.js';
import { jwtDecode } from 'jwt-decode';
import { navigateTo, useState } from 'nuxt/app';
import { nextTick } from 'vue';

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!import.meta.env.SSR) {
    const selectedRoleToken = getSelectedRoleToken(); // Check if selected role token exists
    
    // If selectedRoleToken is available, skip login check
    if (selectedRoleToken) {
      const decodedRole = jwtDecode(selectedRoleToken);
      const currentTime = Date.now() / 1000;

      if (decodedRole.exp < currentTime) {
        // If selected role token is expired, clear it and redirect to login
        clearAuthToken();
        return navigateTo('/login');
      }

      const userState = useState('user', () => decodedRole);

      await nextTick();
      
      // Proceed with selected role in place
      return; // Proceed without needing to log in again
    }

    // Fallback: If no selected role token, check for the regular auth token
    const authToken = getAuthToken();
    
    if (!authToken) {
      clearAuthToken();
      return navigateTo('/login');
    }

    try {
      const decodedAuth = jwtDecode(authToken);
      const currentTime = Date.now() / 1000;

      if (decodedAuth.exp < currentTime) {
        clearAuthToken();
        return navigateTo('/login');
      }

      const userState = useState('user', () => decodedAuth);

      await nextTick();

      // Check if a role is selected, if so, set selectedRoleToken
      if (userState.value?.selectedRole) {
        // Store selected role in localStorage
        setSelectedRoleToken(userState.value.selectedRole);

        // Clear the auth token after storing the selected role
        clearAuthToken();

        // Delay to ensure state changes are processed
        setTimeout(() => {
          location.reload(true); // Full reload
        }, 100); // 100 ms delay
      }

    } catch (error) {
      clearAuthToken();
      return navigateTo('/login');
    }
  }
});
