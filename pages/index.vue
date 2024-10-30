<script setup>
import GrafikArsip from '@/views/apps/dashboard/GrafikArsip.vue'
import WelcomeUsers from '@/views/apps/dashboard/WelcomeUsers.vue'
import { jwtDecode } from 'jwt-decode'
import { computed, onMounted, ref } from 'vue'



// State for storing token, expiration, and decoded token data
definePageMeta({
  middleware: 'auth', // Apply 'auth' middleware only on this page
})

const authToken = ref('')
const tokenExpiration = ref('')

const tokenData = ref({
  userId: null,
  name: '',
  email: '',
  sessionRoles: [],
  selectedRole: '',
  iat: null,
  exp: null,
})

// Load token from localStorage, decode it, and calculate expiration time
onMounted(() => {
  authToken.value = localStorage.getItem('authToken')
  tokenExpiration.value = localStorage.getItem('tokenExpiration')

  // Decode the token to extract data if token exists
  if (authToken.value) {
    const decoded = jwtDecode(authToken.value)

    tokenData.value = {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      sessionRoles: decoded.sessionRoles,
      selectedRole: decoded.selectedRole,
      iat: new Date(decoded.iat * 1000).toLocaleString(), // Convert iat to date
      exp: new Date(decoded.exp * 1000).toLocaleString(),  // Convert exp to date
    }
  }
})

// Computed variable to calculate remaining time in minutes
const remainingMinutes = computed(() => {
  if (!tokenExpiration.value) return null
  const expirationTime = Number(tokenExpiration.value)
  const currentTime = Date.now()
  const remainingTime = expirationTime - currentTime

  // Convert milliseconds to minutes
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
