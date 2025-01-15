// utils/auth.js
import { useCookie } from 'nuxt/app'

const AUTH_TOKEN_KEY = 'auth_token'
const ROLE_TOKEN_KEY = 'role_token'

// Store auth token in a cookie
export function setAuthToken(token) {
  const authToken = useCookie(AUTH_TOKEN_KEY)

  authToken.value = token
}

// Retrieve auth token from cookie
export function getAuthToken() {
  const authToken = useCookie(AUTH_TOKEN_KEY)
  
  return authToken.value
}

// Clear auth token from cookie
export function clearAuthToken() {
  const authToken = useCookie(AUTH_TOKEN_KEY)

  authToken.value = null
}

// Store selected role token in a cookie
export function setSelectedRoleToken(token) {
  const roleToken = useCookie(ROLE_TOKEN_KEY)

  roleToken.value = token
}

// Retrieve selected role token from cookie
export function getSelectedRoleToken() {
  const roleToken = useCookie(ROLE_TOKEN_KEY)
  
  return roleToken.value
}

// Clear selected role token from cookie
export function clearSelectedRoleToken() {
  const roleToken = useCookie(ROLE_TOKEN_KEY)

  roleToken.value = null
}
