<script setup>
import GrafikArsip from '@/views/apps/dashboard/GrafikArsip.vue'
import WelcomeUsers from '@/views/apps/dashboard/WelcomeUsers.vue'
import { jwtDecode } from 'jwt-decode' // Import jwtDecode secara langsung
import { computed, onMounted, ref } from 'vue'

// Terapkan middleware 'auth' hanya untuk halaman ini
definePageMeta({
  middleware: 'auth-middleware',
})

const authToken = ref('')

const tokenData = ref({
  userId: null,
  username: '',
  sessionRoles: [],
  selectedRole: '',
  iat: null,
  exp: null,
})

// Muat token dari localStorage, decode, dan simpan data token
onMounted(() => {
  authToken.value = localStorage.getItem('authToken')

  // Decode token jika ada
  if (authToken.value) {
    const decoded = jwtDecode(authToken.value)

    tokenData.value = {
      userId: decoded.userId,
      username: decoded.username || '', // Gunakan username
      sessionRoles: decoded.roles || [], // Ubah ke `roles` sesuai data token
      selectedRole: decoded.selectedRole || '',
      iat: decoded.iat ? new Date(decoded.iat * 1000).toLocaleString() : null, // Konversi iat ke tanggal
      exp: decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : null,  // Konversi exp ke tanggal
    }
  }
})

// Variable computed untuk menghitung waktu sisa dalam menit
const remainingMinutes = computed(() => {
  if (!tokenData.value.exp) return null
  
  const expirationTime = new Date(tokenData.value.exp).getTime()
  const currentTime = Date.now()
  const remainingTime = expirationTime - currentTime

  // Konversi milidetik ke menit
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
