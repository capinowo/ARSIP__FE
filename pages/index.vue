<script setup>
import { getSelectedUnitToken } from '@/middleware/auth' // Import getSelectedUnitToken dari auth.js
import GrafikArsip from '@/views/apps/dashboard/GrafikArsip.vue'
import WelcomeUsers from '@/views/apps/dashboard/WelcomeUsers.vue'
import { jwtDecode } from 'jwt-decode' // Import jwtDecode secara langsung
import { computed, onMounted, ref, watch } from 'vue'

// Terapkan middleware 'auth' hanya untuk halaman ini
definePageMeta({
  middleware: 'auth-middleware',
})

const selectedRoleToken = ref(getSelectedUnitToken() || '')

const tokenData = ref({
  userId: null,
  username: '',
  sessionRoles: [],
  selectedRole: '',
  iat: null,
  exp: null,
})

// Fungsi untuk decode token dan simpan data token
const decodeToken = () => {
  if (selectedRoleToken.value) {
    const decoded = jwtDecode(selectedRoleToken.value)

    tokenData.value = {
      userId: decoded.userId,
      username: decoded.username || '',
      sessionRoles: decoded.roles || [],
      selectedRole: decoded.selectedRole || '',
      iat: decoded.iat ? new Date(decoded.iat * 1000).toLocaleString() : null,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : null,
    }
  }
}

// Inisialisasi data token ketika komponen dimuat
onMounted(() => {
  decodeToken()
})

// Watch perubahan pada selectedRoleToken di localStorage
watch(() => getSelectedUnitToken(), newToken => {
  selectedRoleToken.value = newToken
  decodeToken() // Update data token setelah perubahan
}, { immediate: true })

const remainingMinutes = computed(() => {
  if (!tokenData.value.exp) return null
  const expirationTime = new Date(tokenData.value.exp).getTime()
  const currentTime = Date.now()
  const remainingTime = expirationTime - currentTime
  
  return remainingTime > 0 ? Math.floor(remainingTime / 1000 / 60) : 0
})
</script>


<template>
  <div>
    <VRow>
      <VCol
        cols="12"
        class="d-flex flex-column align-self-end"
      >
        <WelcomeUsers />
      </VCol>
      <VCol cols="12">
        <GrafikArsip />
      </VCol>
    </VRow>
  </div>
</template>
