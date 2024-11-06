// middleware/roleAuthMiddleware.js
import { clearAuthToken, getAuthToken, setSelectedRoleToken } from '@/middleware/auth.js';
import { jwtDecode } from 'jwt-decode';
import { navigateTo, useState } from 'nuxt/app';
import { nextTick } from 'vue';

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!import.meta.env.SSR) {
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

      // Check if a role is selected
      if (userState.value?.selectedRole) {
        // Store selected role in localStorage
        setSelectedRoleToken(userState.value.selectedRole);

        // Clear all localStorage items before reload
        localStorage.clear();

       // Delay to ensure state changes are processed
        setTimeout(() => {
          location.reload(true); // Equivalent to "Ctrl + Shift + R" for full reload
        }, 100); // 100 ms delay
      }
      
    } catch (error) {
      clearAuthToken();
      return navigateTo('/login');
    }
  }
});
