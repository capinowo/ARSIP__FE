<script setup>
import illustrationJohn2 from '@/images/illustration-john-2.png'
import { jwtDecode } from 'jwt-decode'
import { computed, onMounted, ref } from 'vue'

// Terapkan middleware 'auth' hanya untuk halaman ini
definePageMeta({
  middleware: 'auth-middleware',
})

const authToken = ref('')
const tokenExpiration = ref('')

const tokenData = ref({
  userId: null,
  username: '',
  sessionRoles: [],
  selectedRole: '',
  iat: null,
  exp: null,
})

// Muat token dari localStorage, decode, dan hitung waktu kedaluwarsa
onMounted(() => {
  authToken.value = localStorage.getItem('authToken')
  tokenExpiration.value = localStorage.getItem('tokenExpiration')

  // Decode token jika ada
  if (authToken.value) {
    const decoded = jwtDecode(authToken.value)

    tokenData.value = {
      userId: decoded.userId,
      username: decoded.username || 'Unknown', // Gunakan username dari token
      sessionRoles: decoded.roles || [], // Gunakan roles jika ada
      selectedRole: decoded.selectedRole || '',
      iat: decoded.iat ? new Date(decoded.iat * 1000).toLocaleString() : null, // Konversi iat ke tanggal
      exp: decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : null,  // Konversi exp ke tanggal
    }
  }
})

// Variable computed untuk menghitung waktu sisa dalam menit
const remainingMinutes = computed(() => {
  if (!tokenExpiration.value) return null
  const expirationTime = Number(tokenExpiration.value)
  const currentTime = Date.now()
  const remainingTime = expirationTime - currentTime

  // Konversi milidetik ke menit
  return remainingTime > 0 ? Math.floor(remainingTime / 1000 / 60) : 0
})
</script>

<template>
  <VCard class="overflow-visible mt-sm-10 mt-md-0">
    <VRow no-gutters>
      <VCol
        cols="12"
        sm="6"
        order="2"
        order-sm="1"
      >
        <VCardItem>
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              <strong>ARSIP</strong> 
            </h4>
          </VCardTitle>
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              <strong>UNIVERSITAS DIPONEGORO</strong>
            </h4>
          </VCardTitle>
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              <!-- Welcome !   <strong>{{ tokenData.sessionRoles || 'Not available' }}</strong> -->
            </h4>
          </VCardTitle>
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              Welcome   <strong>{{ tokenData.userId || 'Not available' }}</strong>
            </h4>
          </VCardTitle>
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              All Roles Set  <strong>{{ tokenData.sessionRoles || 'Not available' }}</strong>
            </h4>
          </VCardTitle>
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              Selected Roles  <strong>{{ tokenData.selectedRole || 'Not available' }}</strong>
            </h4>
          </VCardTitle>
        </VCardItem>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        order="1"
        order-sm="2"
        class="text-center"
      >
        <img
          :src="illustrationJohn2"
          :height="$vuetify.display.xs ? '165' : '200'"
          :class="$vuetify.display.xs ? 'position-relative' : 'position-absolute'"
          class="john-illustration flip-in-rtl mt-6 mt-sm-0"
        >
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="scss" scoped>
.john-illustration {
  inset-block-end: -0.0625rem;
  inset-inline-end: 0;
}
</style>
