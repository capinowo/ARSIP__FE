// composables/usePermissions.js
import { jwtDecode } from 'jwt-decode'
import { computed, ref } from 'vue'

// State reaktif global untuk permissions
const userPermissions = ref([])

// Fungsi untuk mengatur permissions berdasarkan token
export function setPermissionsFromToken(token) {
  if (token) {
    const decoded = jwtDecode(token)

    userPermissions.value = decoded.permissions || []
  }
}

// Fungsi untuk membersihkan permissions
export function clearPermissions() {
  userPermissions.value = []
}

// Fungsi untuk mengakses permissions secara reaktif
export function usePermissions() {
  return computed(() => userPermissions.value)
}
