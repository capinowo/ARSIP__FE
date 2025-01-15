import { clearAuthToken, getAuthToken, getSelectedRoleToken, setSelectedRoleToken } from '@/middleware/auth'
import { jwtDecode } from 'jwt-decode'
import { navigateTo, useState } from 'nuxt/app'
import { nextTick, ref } from 'vue'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!import.meta.env.SSR) {
    const isLoading = useState('isLoading', () => ref(false))
  
    isLoading.value = true // Set loading state to true at the start
  
    try {
      const selectedRoleToken = getSelectedRoleToken()
      const currentTime = Date.now() / 1000
  
      if (selectedRoleToken) {
        const decodedRole = jwtDecode(selectedRoleToken)
  
        // Check if token is expired
        if (decodedRole.exp < currentTime) {
          clearAuthToken()
          isLoading.value = false
            
          return navigateTo('/login')
        }
  
        const userState = useState('user', () => decodedRole)
  
        await nextTick()
        isLoading.value = false
          
        return
      }
  
      const authToken = getAuthToken()
      if (!authToken) {
        clearAuthToken()
        isLoading.value = false
          
        return navigateTo('/login')
      }
  
      const decodedAuth = jwtDecode(authToken)
      if (decodedAuth.exp < currentTime) {
        clearAuthToken()
        isLoading.value = false
          
        return navigateTo('/login')
      }
  
      const userState = useState('user', () => decodedAuth)
  
      await nextTick()
  
      if (userState.value?.selectedRole) {
        setSelectedRoleToken(userState.value.selectedRole)
        clearAuthToken()
  
        // Reload page if role is set for the first time
        await nextTick()
        location.reload()
      }
    } catch (error) {
      clearAuthToken()
        
      return navigateTo('/login')
    } finally {
      isLoading.value = false // Ensure loading state is false when finished
    }
  }
})
