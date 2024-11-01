// middleware/roleAuthMiddleware.js
import { clearAuthToken, getAuthToken } from '@/middleware/auth.js'
import { jwtDecode } from 'jwt-decode'
import { navigateTo, useState } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to, from) => {
  if (!import.meta.env.SSR) {
    const authToken = getAuthToken()
    
    if (!authToken) {
      clearAuthToken()
      return navigateTo('/login')
    }

    try {
      const decodedAuth = jwtDecode(authToken)
      const currentTime = Date.now() / 1000

      if (decodedAuth.exp < currentTime) {
        clearAuthToken()
        return navigateTo('/login')
      }

      useState('user', () => decodedAuth)
      
    } catch (error) {
      clearAuthToken()
      return navigateTo('/login')
    }
  }
})
