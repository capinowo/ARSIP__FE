// middleware/authMiddleware.js
import { clearSelectedRoleToken, getSelectedRoleToken } from '@/middleware/auth.js'
import { jwtDecode } from 'jwt-decode'
import { navigateTo, useState } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to, from) => {
  if (!import.meta.env.SSR) {
    const selectedRoleToken = getSelectedRoleToken()
    
    if (!selectedRoleToken) {
      clearSelectedRoleToken()
      return navigateTo('/login')
    }

    try {
      const decodedRole = jwtDecode(selectedRoleToken)
      const currentTime = Date.now() / 1000

      if (decodedRole.exp < currentTime) {
        clearSelectedRoleToken()
        return navigateTo('/login')
      }

      useState('selectedRole', () => decodedRole)
      
    } catch (error) {
      clearSelectedRoleToken()
      return navigateTo('/login')
    }
  }
})
