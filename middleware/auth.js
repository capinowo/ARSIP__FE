// utils/auth.js

const AUTH_TOKEN_KEY = 'authToken'
const ROLE_TOKEN_KEY = 'selectedRoleToken'

// Store auth token
export function setAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

// Retrieve auth token
export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

// Clear auth token
export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

// Store selected role token
export function setSelectedRoleToken(token) {
  localStorage.setItem(ROLE_TOKEN_KEY, token)
}

// Retrieve selected role token
export function getSelectedRoleToken() {
  return localStorage.getItem(ROLE_TOKEN_KEY)
}

// Clear selected role token
export function clearSelectedRoleToken() {
  localStorage.removeItem(ROLE_TOKEN_KEY)
}
