// middleware/authMiddleware.js
import { jwtDecode } from 'jwt-decode'
import { navigateTo, useState } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to, from) => {
  if (!import.meta.env.SSR) {
    const authToken = localStorage.getItem('authToken')
    const selectedRoleToken = localStorage.getItem('selectedRoleToken')
    
    if (!authToken) {
      return navigateTo('/login')
    }

    try {
      const decodedAuth = jwtDecode(authToken)
      const currentTime = Date.now() / 1000

      if (decodedAuth.exp < currentTime) {
        localStorage.removeItem('authToken')
        
        return navigateTo('/login')
      }

      useState('user', () => decodedAuth)

      // Optional check for selectedRoleToken
      if (selectedRoleToken) {
        const decodedRole = jwtDecode(selectedRoleToken)
        
        if (decodedRole.exp < currentTime) {
          localStorage.removeItem('selectedRoleToken')
          
          return navigateTo('/login')
        }

        useState('selectedRole', () => decodedRole)
      }
      
    } catch (error) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('selectedRoleToken')
      
      return navigateTo('/login')
    }
  }
})
